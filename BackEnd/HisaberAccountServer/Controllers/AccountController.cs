using EmailServiceManagement;
using HisaberAccountServer.Data;
using HisaberAccountServer.Models;
using HisaberAccountServer.Models.LoginSystem;
using HisaberAccountServer.Models.Settings;
using MailKit.Search;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.VisualStudio.Web.CodeGenerators.Mvc.Templates.BlazorIdentity.Pages.Manage;
using System.ComponentModel.Design;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace HisaaberAccountServer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IConfiguration _configuration;
        private readonly IEmailSender _emailSender;
        private readonly HisaberDbContext _context;

        public AccountController(UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager, IConfiguration configuration, IEmailSender emailSender, HisaberDbContext context)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _configuration = configuration;
            _emailSender = emailSender;
            _context = context;
        }

        [HttpGet("ReadUser/{email}")]
        public async Task<ActionResult<object>> GetUserByEmail(string email)
        {
            try
            {
                var user = await _userManager.FindByEmailAsync(email);
                if (user == null)
                {
                    return Ok(new { status_message = "User not found", userExists = false, status_code = 0 });
                }

                var claims = await _userManager.GetClaimsAsync(user);

                var userData = new
                {
                    user.Id,
                    user.UserName,
                    user.Email,
                    user.PasswordHash,
                    user.PhoneNumber,
                    user.FullName,
                    Claims = claims.Select(c => new { c.Type, c.Value }),
                    userExists = true
                };

                return Ok(userData);
            }
            catch (Exception ex)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong..", error = ex.Message });
            }
        }


        [Authorize]
        [HttpGet("GetRoles")]
        public async Task<ActionResult<object>> GetRoles()
        {
            try
            {
                var roles = await _roleManager.Roles.ToListAsync();
                if (roles == null)
                {
                    return Ok(new { status_message = "No role found", status_code = 0 });
                }

                return Ok(roles);
            }
            catch (Exception ex)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong..", error = ex.Message });
            }
        }

        [Authorize]
        [HttpGet("GetUsers/{CompanyID}")]
        public async Task<ActionResult<object>> GetUsers(int CompanyID, string email = "", string userType = "", string fullName = "")
        {
            try
            {
                // Query base
                var query = _userManager.Users.Where(e => e.IsDeleted == false);

                // Apply filters
                if (!string.IsNullOrEmpty(email))
                {
                    query = query.Where(e => e.Email.Contains(email));
                }
                if (!string.IsNullOrEmpty(fullName))
                {
                    query = query.Where(e => e.FullName.Contains(fullName));
                }

                query = query.OrderByDescending(e => e.Id);
                var data = await query.ToListAsync();

                if (data == null || !data.Any())
                {
                    return Ok(new { status_code = 0 });
                }

                return Ok(new
                {
                    listofAccounts = data,
                    status_code = 1,
                });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, error = e.Message });
            }
        }


        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] SignUp inParams)
        {
            try
            {
                if (inParams.Password.Count() < 6)
                {
                    return Ok(new { status_code = 0, status_message = "Password must be at least 6 characters long." });
                }

                var userExists = await _userManager.FindByEmailAsync(inParams.Email);
                if (userExists != null)
                {
                    return Ok(new { status_code = 0, status_message = "Email already exists." });
                }
                var InviteData = await _context.tblInvitation.Where(e => e.IsDeleted == false && e.ToEmail == inParams.Email).OrderByDescending(p => p.ID)
                .FirstOrDefaultAsync();
                if (InviteData != null && InviteData.InviteStatus == "Pending")
                {
                    return Ok(new { status_code = 2, status_message = "Please Accept or Reject Invite First.", InviteData = InviteData });
                }

                var user = new ApplicationUser
                {
                    UserName = inParams.Email,
                    FullName = inParams.UserName,
                    Email = inParams.Email,
                    PhoneNumber = inParams.PhoneNumber,
                    IsActive = inParams.IsActive,
                    IsDeleted = inParams.IsDeleted,
                    CreatedDate = DateTime.Now,
                };

                var result = await _userManager.CreateAsync(user, inParams.Password);


                return Ok(new { status_message = "User Registered Successfully", status_code = 1, result, user });


            }
            catch (Exception e)
            {
                return Ok(new { status_message = "Sorry! Something went wrong..", status_code = 0, error = e.Message });
            }
        }

        [HttpPost("invite-register")]
        public async Task<IActionResult> InvitationRegister([FromBody] SignUp model)
        {
            try
            {
                var random = new Random();
                var bytes = new byte[4];
                RandomNumberGenerator.Fill(bytes);
                var code = BitConverter.ToUInt32(bytes) % 1_000_000;
                var verificationCode = code.ToString("D6");
                if (model.Password.Count() < 6)
                {
                    return Ok(new { status_code = 0, status_message = "Password must be at least 6 characters long." });
                }
                else
                {

                    var user = new ApplicationUser
                    {
                        UserName = model.Email,
                        FullName = model.UserName,
                        Email = model.Email,
                        PhoneNumber = model.PhoneNumber,
                        IsActive = model.IsActive,
                        IsDeleted = model.IsDeleted,
                        CreatedDate = DateTime.Now,
                        EmailConfirmed = true,
                        Code = verificationCode
                    };

                    var result = await _userManager.CreateAsync(user, model.Password);


                    return Ok(new { status_message = "Registered Successfully", status_code = 1, result, user });

                }


            }
            catch (Exception e)
            {
                return Ok(new { status_message = "Sorry! Something Went Wrong.", status_code = 0, error = e.Message });
            }
        }


        [HttpPost("verify-email")]
        public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailModel model)
        {
            try
            {
                var user = await _userManager.FindByEmailAsync(model.Email);
                if (user == null)
                    return Ok(new { status_message = "User not found", status_code = 0 });

                if (user.Code == model.Code)
                {
                    user.EmailConfirmed = true;
                    await _userManager.UpdateAsync(user);

                    return Ok(new { status_message = "Email verified successfully.", status_code = 1, user });
                }

                return Ok(new { status_message = "Invalid or expired verification code", status_code = 0 });
            }
            catch (Exception e)
            {
                return Ok(new { status_message = "Sorry! Something Went Wrong.", status_code = 0, error = e.Message });
            }
        }


        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] SignIn model)
        {
            try
            {

                var user = await _userManager.FindByEmailAsync(model.Email);

                if (user == null || !await _userManager.CheckPasswordAsync(user, model.Password))
                {
                    return Ok(new { status_message = "You have entered Invalid Email Address or Password", status_code = 0 });
                }


                if (user.EmailConfirmed == false)
                {

                    var random = new Random();
                    var bytes = new byte[4];
                    RandomNumberGenerator.Fill(bytes);
                    var code = BitConverter.ToUInt32(bytes) % 1_000_000;
                    var verificationCode = code.ToString("D6");

                    user.Code = verificationCode;
                    await _userManager.UpdateAsync(user);

                    var message = new Message(new string[] { user.Email! }, "[HISAABER] Email Address Verification", GeneralRequest.GetHtmlcontent("Verify Your E-mail Address", "Your verification code is", user.Email, verificationCode));
                    _emailSender.SendEmail(message);

                    EmailLog email = new EmailLog
                    {
                        EmailTo = user.Email,
                        EmailFrom = "noreply@hisaaber.com",
                        Subject = "[HISAABER] Email Address Verification",
                        Reference = "Personal",
                        EventType = "Email Verification",
                        DeliveryStatus = "Sent",
                        SendDate = DateTime.Now,
                        IsActive = true,
                        IsDeleted = false
                    };

                    await _context.tblEmailLog.AddAsync(email);
                    await _context.SaveChangesAsync();

                }



                var userRoles = await _userManager.GetRolesAsync(user);
                var authClaims = new List<Claim>
        {
                    new Claim(JwtRegisteredClaimNames.Sub, user.Id),
                    new Claim(JwtRegisteredClaimNames.Email, user.Email),
                    new Claim("id", user.Id),
                    new Claim(JwtRegisteredClaimNames.Name, user.UserName),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

                authClaims.AddRange(userRoles.Select(role => new Claim(ClaimTypes.Role, role)));

                var token = new JwtSecurityToken(
                    issuer: _configuration["Jwt:Issuer"],
                    expires: DateTime.Now.AddMinutes(double.Parse(_configuration["Jwt:ExpiryMinutes"]!)),
                    claims: authClaims,
                    signingCredentials: new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!)),
                        SecurityAlgorithms.HmacSha256)
                );

                var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

                return Ok(new { Token = tokenString, status_code = 1, user, status_message = "Login Successful" });
            }
            catch (Exception e)
            {
                return Ok(new { status_message = e.Message, status_code = 0 });
            }
        }

        private string GetIPAddress(HttpContext context)
        {
            string? ip = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();

            if (string.IsNullOrEmpty(ip))
            {
                ip = context.Connection.RemoteIpAddress?.ToString();
            }

            return ip ?? "Unknown";
        }

        [Authorize]
        [HttpPost("SelectCompany")]
        public async Task<IActionResult> SelectCompany(GeneralRequest inParams)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(inParams.Email ?? string.Empty);
                if (user != null)
                {
                    LoginLog loginLog = new LoginLog
                    {
                        UserID = user.Id,
                        CompanyID = inParams.CompanyID,
                        Password = user.PasswordHash ?? "",
                        UserType = "API",
                        Date = DateOnly.FromDateTime(DateTime.Now),
                        IsSuccess = true,
                        IPAddress = GetIPAddress(HttpContext),
                        IsActive = true,
                        IsDeleted = false,
                        CreatedDate = DateTime.Now,
                        UpdatedDate = DateTime.Now
                    };

                    await _context.tblLoginLog.AddAsync(loginLog);
                    await _context.SaveChangesAsync();

                    return Ok(new { user, status_code = 1, status_message = "Login Log Added Successfully." });
                }
                return Ok(new { user, status_code = 0, status_message = "User Not Found." });

            }
            catch (Exception e)
            {
                return Ok(new { status_message = "Sorry! Something Went Wrong.", status_code = 0 });
            }
        }

        [Authorize]
        [HttpPost("GetRecentLogins")]
        public async Task<IActionResult> GetRecentLogins(GeneralRequest inParams)
        {
            try
            {
                var users = await _context.tblLoginLog
                 .Where(l => l.CompanyID == inParams.CompanyID && l.IsActive)
                 .OrderByDescending(l => l.ID)
                 .Take(20)
                 .ToListAsync();

                if (users.Any())
                {
                    var userIds = users.Select(u => u.UserID).ToList();
                    var userDetails = await _userManager.Users
                        .Where(u => userIds.Contains(u.Id))
                        .Select(u => new { u.Id, u.FullName })
                        .ToListAsync();

                    var userLookup = userDetails.ToDictionary(u => u.Id, u => u.FullName);

                    foreach (var user in users)
                    {
                        user.UserID = userLookup.ContainsKey(user.UserID) ? userLookup[user.UserID] : "";
                    }

                    return Ok(new { ListofRecords = users, status_code = 1, status_message = "Successfully returning list of Logins." });
                }

                return Ok(new { status_code = 0, status_message = "Logins Not Found." });
            }
            catch (Exception e)
            {
                return Ok(new { status_message = "Sorry! Something Went Wrong.", status_code = 0, error = e.Message });
            }
        }

        [HttpPost("forget-password")]
        public async Task<IActionResult> ForgetPassword(GeneralRequest inParams)
        {
            try
            {
                var user = await _userManager.FindByEmailAsync(inParams.Email);
                if (user != null)
                {
                    var token = await _userManager.GeneratePasswordResetTokenAsync(user);
                    var forgetPasswordLink = Url.Action(nameof(ResetPassword), "Account", new { token, email = user.Email }, Request.Scheme);
                    var message = new Message(new string[] { user.Email! }, "[HISAABER] Forgot Password Link", GeneralRequest.GetHtmlcontent("Reset Your Password", "Your reset password link is", user.Email, "https://hisaaber.com/reset-password"));
                    _emailSender.SendEmail(message);

                    EmailLog email = new EmailLog
                    {
                        EmailTo = user.Email,
                        EmailFrom = "noreply@hisaaber.com",
                        Subject = "[HISAABER] Forgot Password Link",
                        Reference = "Personal",
                        EventType = "Forgot Password",
                        DeliveryStatus = "Sent",
                        SendDate = DateTime.Now,
                        IsActive = true,
                        IsDeleted = false
                    };

                    await _context.tblEmailLog.AddAsync(email);
                    await _context.SaveChangesAsync();

                    return Ok(new { token, email = user.Email, user, status_code = 1, status_message = "Password reset link send to email." });
                }
                return Ok(new { user, status_code = 0, status_message = "User Not Found." });

            }
            catch (Exception e)
            {
                return Ok(new { status_message = "Sorry! Something Went Wrong.", status_code = 0 });
            }
        }

        [HttpGet("reset-password")]
        public async Task<IActionResult> ResetPassword(string email, string token)
        {
            var model = new ResetPassword { token = token, email = email };
            return Ok(new { model });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword(ResetPassword resetPassword)
        {
            try
            {

                var user = await _userManager.FindByEmailAsync(resetPassword.email);
                if (user != null)
                {
                    var reset_Password = await _userManager.ResetPasswordAsync(user, resetPassword.token, resetPassword.password);
                    if (!reset_Password.Succeeded)
                    {
                        foreach (var error in reset_Password.Errors)
                        {
                            ModelState.AddModelError(error.Code, error.Description);
                        }
                        return Ok(ModelState);
                    }
                    return (Ok(new { status_message = "Password has been changed.", status_code = 1 }));
                }
                return (Ok(new { status_message = "User Not Found.", status_code = 0 }));
            }
            catch (Exception e)
            {
                return Ok(new { status_message = "Sorry! Something Went Wrong.", status_code = 0 });
            }
        }
        [Authorize]
        [HttpPost("Otp-send/{email}")]
        public async Task<IActionResult> SendOTP(string email, string subject, string title, string data)
        {
            try
            {

                var user = await _userManager.FindByEmailAsync(email);
                if (user != null)
                {

                    var random = new Random();
                    var bytes = new byte[4];
                    RandomNumberGenerator.Fill(bytes);
                    var code = BitConverter.ToUInt32(bytes) % 1_000_000;
                    var verificationCode = code.ToString("D6");

                    var message = new Message(new string[] { user.Email! }, subject, GeneralRequest.GetHtmlcontent(title, data, user.Email, verificationCode));
                    _emailSender.SendEmail(message);


                    return Ok(new { email = user.Email, user, status_code = 1, status_message = "OTP send to email.", verificationCode });
                }
                return Ok(new { user, status_code = 0, status_message = "User not found." });
            }
            catch (Exception e)
            {
                return Ok(new { status_message = "Someting went wrong.", status_code = 0 });
            }

        }

        [Authorize]
        [HttpPost("ChangePassword/{date}")]
        public async Task<IActionResult> ChangePassword([FromBody] HisaberAccountServer.Models.LoginSystem.ChangePassword model, DateTime date)
        {
            try
            {

                if (User.Identity?.IsAuthenticated != true)
                {
                    return Ok(new { status_message = "User is not authenticated", status_code = 0 });
                }

                var currentUserIdClaim = User.Claims.FirstOrDefault(x => x.Type == "id");
                if (currentUserIdClaim == null)
                {
                    return Ok(new { status_message = "User ID claim not found", status_code = 0 });
                }

                if (DateTime.Now > date)
                {
                    return Ok(new { status_message = "OTP session Expired.", status_code = 0 });
                }

                var currentUserId = currentUserIdClaim.Value;
                var user = await _userManager.FindByIdAsync(currentUserId);
                if (user == null)
                {
                    return Ok(new { status_message = "User not found", status_code = 0 });
                }

                var result = await _userManager.ChangePasswordAsync(user, model.OldPassword, model.NewPassword);
                if (!result.Succeeded)
                {
                    var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                    return Ok($"Error changing password: {errors}");
                }

                return Ok(new { status_message = "Password has been changed successfully", status_code = 1 });
            }
            catch (Exception ex)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.." });
            }
        }

        [Authorize]
        [HttpPost("ChangeFullName")]
        public async Task<IActionResult> ChangeFullName(string id, string fullName)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(id);
                if (user == null)
                    return Ok(new { status_code = 0, status_message = "User not found" });
                if (fullName != null)
                {
                    user.FullName = fullName;
                    await _userManager.UpdateAsync(user);
                    return Ok(new { status_message = "Full Name updated successfully.", status_code = 1 });
                }


                return Ok(new { status_message = "Please enter full name", status_code = 0 });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.." });
            }
        }

        [Authorize]
        [HttpPost("ChangePhoneNumber")]
        public async Task<IActionResult> ChangePhoneNumber(string id, string phoneNumber)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(id);
                if (user == null)
                    return Ok(new { status_code = 0, status_message = "User not found" });
                if (phoneNumber != null)
                {

                    user.PhoneNumber = phoneNumber;
                    await _userManager.UpdateAsync(user);
                    return Ok(new { status_message = "Mobile Number updated successfully.", status_code = 1 });
                }


                return Ok(new { status_message = "Please enter mobile number.", status_code = 0 });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.." });
            }
        }

        [Authorize]
        [HttpPost("UpdateUser")]
        public async Task<IActionResult> UpdateUser(string email, string phoneNumber, string name)
        {
            try
            {
                var user = await _userManager.FindByEmailAsync(email);
                if (user == null)
                    return Ok(new { status_code = 0, status_message = "User not found" });
                if (phoneNumber != null)
                {

                    user.PhoneNumber = phoneNumber;
                    user.FullName = name;
                    await _userManager.UpdateAsync(user);
                    return Ok(new { status_message = "User updated successfully.", status_code = 1 });
                }


                return Ok(new { status_message = "Please enter valid data", status_code = 0 });
            }
            catch (Exception e)
            {
                return Ok(new { e.Message, status_message = "Sorry! Something went wrong..", status_code = 0 });
            }
        }

        [Authorize]
        [HttpPost("add-role")]
        public async Task<IActionResult> AddRole([FromBody] string role)
        {
            try
            {

                if (!await _roleManager.RoleExistsAsync(role))
                {
                    var result = await _roleManager.CreateAsync(new IdentityRole(role));
                    if (result.Succeeded)
                    {
                        return Ok(new { status_message = "Role Added Successfully", status_code = 1 });
                    }
                    ;
                    return Ok(new { status_code = 0, status_message = "Error in adding role." });
                }
                return Ok(new { status_message = "Role Already Exists", status_code = 0 });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.." });
            }
        }


        [HttpPost("assign-roles")]
        public async Task<IActionResult> AssignRoles([FromBody] UserRole model)
        {
            try
            {
                if (model.CompanyID <= 0)
                {
                    return Ok(new { status_message = "Invalid company ID.", status_code = 0 });
                }

                // Find the user by email
                var user = await _userManager.FindByEmailAsync(model.Email);
                if (user == null)
                {
                    return Ok(new { status_code = 0, status_message = "User not found" });
                }

                foreach (var role in model.Roles)
                {
                    var roleEntity = await _roleManager.FindByNameAsync(role);
                    if (roleEntity == null)
                    {
                        return Ok(new { status_message = $"Role '{role}' not found", status_code = 0 });
                    }

                    var existingEntry = await _context.tblUserCompanyRoles
                        .FirstOrDefaultAsync(ur => ur.UserId == user.Id && ur.CompanyId == model.CompanyID && ur.RoleId == roleEntity.Id);

                    if (existingEntry == null)
                    {
                        var userCompanyRole = new UserCompanyRole
                        {
                            UserId = user.Id,
                            CompanyId = model.CompanyID ?? 0,
                            RoleId = roleEntity.Id
                        };

                        _context.tblUserCompanyRoles.Add(userCompanyRole);
                        await _context.SaveChangesAsync();
                    }
                }

                return Ok(new { message = "Roles assigned successfully", status_code = 1 });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.." });
            }
        }

        [HttpGet("GetRolesData/{companyID}")]
        public async Task<ActionResult<IEnumerable<UserCompanyRole>>> GetRolesData(int companyID, [FromQuery] string role = null, [FromQuery] string fullName = null, [FromQuery] string email = null)
        {
            try
            {
                var query = _context.tblUserCompanyRoles
                    .Include(u => u.User)
                    .Include(c => c.CompanyInfo)
                    .Include(r => r.Role)
                    .Where(uc => uc.CompanyId == companyID);

                if (!string.IsNullOrEmpty(role))
                {
                    query = query
                        .Where(uc => EF.Functions.Like(uc.Role.Name.ToLower(), $"%{role.ToLower()}%"));
                }

                if (!string.IsNullOrEmpty(fullName))
                {
                    query = query
                        .Where(uc => EF.Functions.Like(uc.User.FullName.ToLower(), $"%{fullName.ToLower()}%"));
                }

                if (!string.IsNullOrEmpty(email))
                {
                    query = query
                        .Where(uc => EF.Functions.Like(uc.User.Email.ToLower(), $"%{email.ToLower()}%"));
                }

                var userCompanyRoles = await query.ToListAsync();

                if (userCompanyRoles == null || !userCompanyRoles.Any())
                {
                    return Ok(new { status_message = "No users Found.", status_code = 0 });
                }

                return Ok(new { status_code = 1, ListOfUsers = userCompanyRoles });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.." });
            }
        }

        [HttpGet("GetRolesByUserID/{UserId}")]
        public async Task<ActionResult<IEnumerable<UserCompanyRole>>> GetRolesByEmail(int companyID, string UserId)
        {
            try
            {
                var userCompanyRoles = await _context.tblUserCompanyRoles
                    .Include(u => u.User)
                    .Include(c => c.CompanyInfo)
                    .Include(r => r.Role)
                    .Where(uc => uc.CompanyId == companyID && uc.UserId == UserId)
                    .ToListAsync();

                if (userCompanyRoles == null || !userCompanyRoles.Any())
                {
                    return Ok(new { status_message = "No roles found for the specified company ID.", status_code = 0 });
                }

                return Ok(new { userCompanyRoles, status_code = 1 });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong..", error = e.Message });
            }
        }

        [HttpGet("GetCompaniesByUserID/{UserID}")]
        public async Task<ActionResult<IEnumerable<object>>> GetCompaniesByUserID(string UserID)
        {
            try
            {
                var userCompanyRoles = await _context.tblUserCompanyRoles
                    .Include(uc => uc.CompanyInfo)
                    .Include(uc => uc.Role)
                    .Where(uc => uc.UserId == UserID)
                    .ToListAsync();

                if (!userCompanyRoles.Any())
                {
                    return Ok(new { status_message = "No company Found for this User.", status_code = 0, ListofRecords = userCompanyRoles });
                }

                // Process data in-memory
                var result = userCompanyRoles
                    .Where(uc => uc.CompanyInfo.IsActive == true && uc.CompanyInfo.IsDeleted == false)
                    .GroupBy(uc => new
                    {
                        uc.CompanyId,
                        uc.CompanyInfo,
                        uc.User
                    })
                    .Select(group => new
                    {
                        CompanyId = group.Key.CompanyId,
                        CompanyInfo = group.Key.CompanyInfo,
                        User = group.Key.User,
                        Roles = group.Select(uc => uc.Role.Name).Distinct().ToList()
                    })
                    .ToList();
                var user = await _userManager.FindByIdAsync(UserID);
                List<Invitation> data = new List<Invitation>();
                if (user != null)
                {
                    data = await _context.tblInvitation.Where(e => e.IsActive == true && e.ToEmail == user.Email && e.InviteStatus == "Pending")
                    .ToListAsync();
                }

                return Ok(new { ListofRecords = result, PendingInvites = data.Count(), status_code = 1, status_message = "Successfully returning list of companies." });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.." });
            }
        }

        [HttpGet("delete-roles")]
        public async Task<IActionResult> DeleteRoles([FromQuery] string userId, [FromQuery] string roleId, [FromQuery] int companyId)
        {
            try
            {
                // Validate input parameters
                if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(roleId) || companyId <= 0)
                {
                    return Ok(new { status_message = "Invalid input parameters.", status_code = 0 });
                }

                // Find the record to delete
                var userCompanyRole = await _context.tblUserCompanyRoles
                    .FirstOrDefaultAsync(ur => ur.UserId == userId && ur.RoleId == roleId && ur.CompanyId == companyId);

                if (userCompanyRole == null)
                {
                    return Ok(new { status_message = "Role not found for the specified user and company.", status_code = 0 });
                }

                // Remove the record
                _context.tblUserCompanyRoles.Remove(userCompanyRole);
                await _context.SaveChangesAsync();

                return Ok(new { status_message = "Role removed successfully", status_code = 1 });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.." });
            }
        }

        [HttpDelete("delete-rolesByCompanyID")]
        public async Task<IActionResult> DeleteRolesByCompanyID([FromQuery] int companyId)
        {
            try
            {
                // Validate input parameters
                if (companyId <= 0)
                {
                    return Ok(new { status_message = "Invalid input parameters.", status_code = 0 });
                }

                // Find all records to delete
                var userCompanyRoles = await _context.tblUserCompanyRoles
                    .Where(ur => ur.CompanyId == companyId)
                    .ToListAsync();

                if (userCompanyRoles == null || !userCompanyRoles.Any())
                {
                    return Ok(new { status_message = "No roles found for the specified company.", status_code = 0 });
                }

                // Remove all matching records
                _context.tblUserCompanyRoles.RemoveRange(userCompanyRoles);
                await _context.SaveChangesAsync();

                return Ok(new { status_message = "All roles removed successfully for the specified company.", status_code = 1 });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.." });
            }
        }

    }
}
