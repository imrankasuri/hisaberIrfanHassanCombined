using EmailServiceManagement;
using HisaberAccountServer.Data;
using HisaberAccountServer.Models;
using HisaberAccountServer.Models.Settings;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.VisualStudio.Web.CodeGenerators.Mvc.Templates.BlazorIdentity.Pages.Manage;
using System.Security.Policy;
using static System.Runtime.InteropServices.JavaScript.JSType;

[ApiController]
[Route("api/[controller]")]
public class InvitationController : ControllerBase
{
    private readonly HisaberDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IEmailSender _emailSender;

    public InvitationController(HisaberDbContext context, UserManager<ApplicationUser> userManager, IEmailSender emailSender)
    {
        _context = context;
        _userManager = userManager;
        _emailSender = emailSender;
    }

    [HttpPost("send")]
    public async Task<IActionResult> SendInvitation([FromBody] GeneralRequest inParams)
    {
        if (inParams == null)
        {
            return Ok(new { status_code = 0, status_message = "Invalid Invite Data." });
        }

        var fromUser = await _userManager.FindByIdAsync(inParams.UserID ?? string.Empty);
        if (fromUser == null)
        {
            return Ok(new { status_code = 0, status_message = "User not found" });
        }

        try
        {

            var bytes = new byte[4];
            RandomNumberGenerator.Fill(bytes);
            var code = BitConverter.ToUInt32(bytes) % 1_000_000;
            var verificationCode = code.ToString("D6");

            var invitation = new Invitation
            {
                FromUserID = fromUser.Id,
                FromUserCompanyID = inParams.CompanyID,
                ToEmail = inParams.Email ?? "",
                InviteCode = verificationCode,
                InviteStatus = "Pending",
                IsActive = true,
                IsDeleted = false,
                CreatedDate = DateTime.UtcNow,
                UpdatedDate = DateTime.UtcNow,
                InvitedRole = inParams.ProductName ?? ""
            };

            var emailLog = new EmailLog
            {
                EmailFrom = "noreply@hisaaber.com",
                EmailTo = invitation.ToEmail,
                Subject = "[HISAABER] Invitation Received",
                Reference = "Personal",
                EventType = "Invitation",
                DeliveryStatus = "Pending",
                IsActive = true,
                IsDeleted = false,
            };

            await _context.tblInvitation.AddAsync(invitation);
            await _context.tblEmailLog.AddAsync(emailLog);
            await _context.SaveChangesAsync();

            var emailMessage = new Message(
                new string[] { invitation.ToEmail },
                "[HISAABER] Invitation Received",
                GeneralRequest.GetHtmlcontent(
                    "You have received an invitation from",
                    $"https://hisaaber.com/verify-invite/{invitation.InviteCode} <br/>Your Invited Role is: <b>{invitation.InvitedRole}</b> <br/>Your Invitation Code is ",
                    invitation.ToEmail,
                    invitation.InviteCode
                )
            );

            try
            {
                _emailSender.SendEmail(emailMessage);
                emailLog.DeliveryStatus = "Success";
            }
            catch (Exception ex)
            {
                emailLog.DeliveryStatus = "Failed";
                return Ok(new { status_code = 0, status_message = ex.Message });
            }

            await _context.SaveChangesAsync();

            return Ok(new { status_code = 1, status_message = "Invitation sent successfully.", verificationCode, invitation });
        }
        catch (Exception ex)
        {
            return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.", error = ex.Message });
        }
    }

    [HttpGet("accept")]
    public async Task<ActionResult> AcceptInvitation(string code)
    {
        try
        {
            var invitation = await _context.tblInvitation
                .Where(i => i.InviteCode == code && i.IsActive).FirstOrDefaultAsync();

            if (invitation == null)
            {
                return Ok(new { status_message = "Invitation Not Found" });
            }
            else if (invitation.InviteStatus == "Rejected")
            {
                return Ok(new { status_message = "Invitation Already Rejected.", status_code = 0 });
            }
            else if (invitation.InviteStatus == "Accepted")
            {
                return Ok(new { status_message = "Invitation Already Accepted.", status_code = 0 });
            }
            else
            {
                invitation.InviteStatus = "Accepted";
                invitation.UpdatedDate = DateTime.Now;
                await _context.SaveChangesAsync();

                return Ok(new { status_message = "Invitation accepted.", status_code = 1, invitation });
            }
        }
        catch (Exception e)
        {
            return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.", e.Message });
        }
    }


    [HttpGet("reject")]
    public async Task<ActionResult<Invitation>> RejectInvitation(string code)
    {
        try
        {
            var invitation = await _context.tblInvitation
                .Where(i => i.InviteCode == code && i.IsActive).FirstOrDefaultAsync();

            if (invitation == null)
            {
                return Ok(new { status_message = "Invitation Not Found", status_code = 0 });
            }
            else if (invitation.InviteStatus == "Rejected")
            {
                return Ok(new { status_message = "Invitation Already Rejected.", status_code = 0 });
            }
            else if (invitation.InviteStatus == "Accepted")
            {
                return Ok(new { status_message = "Invitation Already Accepted.", status_code = 0 });
            }
            else
            {
                invitation.InviteStatus = "Rejected";
                invitation.UpdatedDate = DateTime.Now;
                await _context.SaveChangesAsync();

                return Ok(new { status_message = "Invitation Rejected.", status_code = 1 });
            }
        }
        catch (Exception e)
        {
            return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.", e.Message });
        }
    }

    [HttpGet("GetInvitation/{email}")]
    public async Task<ActionResult<Invitation>> GetCompanyById(string email)
    {
        try
        {
            var data = await _context.tblInvitation.Where(e => e.IsDeleted == false && e.ToEmail == email).OrderByDescending(p => p.ID)
                .FirstOrDefaultAsync();
            if (data == null)
            {
                return Ok(new { status_message = "No Invitation Found", status_code = 0 });
            }
            return Ok(new { InviteData = data, status_code = 1 });
        }
        catch (Exception e)
        {
            return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.", e.Message });
        }
    }

    [HttpGet("ReadInvite/{code}")]
    public async Task<ActionResult<Invitation>> ReadInvite(string code)
    {
        try
        {
            var data = await _context.tblInvitation.Where(e => e.IsDeleted == false && e.InviteCode == code).FirstOrDefaultAsync();
            if (data == null)
            {
                return Ok(new { status_message = "No Invitation Found", status_code = 0 });
            }
            if (data.InviteStatus != "Pending")
            {
                return Ok(new { status_message = "Invitation already " + data.InviteStatus, status_code = 0 });
            }
            var user = await _userManager.FindByEmailAsync(data.ToEmail);
            if (user == null)
            {
                return Ok(new { status_message = "Please create an account first.", status_code = 2, Invite = data });
            }
            return Ok(new { Invite = data, status_code = 1 });
        }
        catch (Exception e)
        {
            return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.", e.Message });
        }
    }

    [HttpGet("GetInvitationsByCompanyID/{CompanyID}")]
    public async Task<ActionResult> GetInvitationsByCompanyID(int CompanyID, string role = "", string email = "", string status = "")
    {
        try
        {
            var query = _context.tblInvitation
                .Where(e => !e.IsDeleted && e.FromUserCompanyID == CompanyID);

            // Apply filters
            if (!string.IsNullOrEmpty(email))
            {
                query = query.Where(e => e.ToEmail.Contains(email));
            }
            if (!string.IsNullOrEmpty(role))
            {
                query = query.Where(e => e.InvitedRole.Contains(role));
            }
            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(e => e.InviteStatus.Contains(status));
            }
            query = query.OrderByDescending(e => e.ID);
            var data = await query.ToListAsync();

            if (data == null || !data.Any())
            {
                return Ok(new { status_code = 0, status_message = "No Invitation Found" });
            }

            return Ok(new { InviteData = data, status_code = 1 });
        }
        catch (Exception e)
        {
            return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.", e.Message });
        }
    }

    [HttpPatch("DeleteAccount/{id}")]
    public async Task<ActionResult<Invitation>> UpdateAccount(int id, [FromBody] Invitation accountMain)
    {
        try
        {
            var account = await _context.tblInvitation.FindAsync(id);
            if (account == null)
            {
                return Ok(new { status_message = "Invitation Not Found.", status_code = 0 });
            }
            account.UpdatedDate = DateTime.Now;
            account.IsActive = accountMain.IsActive;
            account.IsDeleted = accountMain.IsDeleted;

            _context.Entry(account).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return Ok(new { account, status_code = 1, status_message = "Invitation Deleted Successfully." });
        }
        catch (Exception e)
        {
            return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.", e.Message });
        }
    }

    [HttpPatch("EditAccount/{id}")]
    public async Task<ActionResult<Invitation>> EditAccount(int id, [FromBody] Invitation accountMain)
    {
        try
        {
            var account = await _context.tblInvitation.FindAsync(id);
            if (account == null)
            {
                return Ok(new { status_message = "Invitation Not Found.", status_code = 0 });
            }
            account.UpdatedDate = DateTime.Now;
            account.InvitedRole = accountMain.InvitedRole;

            _context.Entry(account).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return Ok(new { account, status_code = 1, status_message = "Invitation Updated Successfully." });
        }
        catch (Exception e)
        {
            return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.", e.Message });
        }
    }
}