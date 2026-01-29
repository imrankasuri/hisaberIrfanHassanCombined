using HisaberAccountServer.Data;
using HisaberAccountServer.Models.Settings;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HisaberAccountServer.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class OTPSentController : ControllerBase
    {
        private readonly HisaberDbContext context;
        public OTPSentController(HisaberDbContext context)
        {
            this.context = context;
        }

        [HttpPost("SendOTP")]
        public async Task<ActionResult<OTPSent>> AddOTP(OTPSent otp)
        {
            try
            {
                if (otp != null)
                {
                    otp.ExpiryDate = DateTime.Now.AddMinutes(30);
                    context.tblOTPSent.Add(otp);
                    await context.SaveChangesAsync();
                    return Ok(new { status_message = "OTP sent successfully!Check your email.", status_code = 1, otp });
                }
                else
                {
                    return Ok(new { status_message = "OTP sending failed.", status_code = 0 });
                }
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.", e.Message });
            }


        }

        [HttpGet("GetOTPdata/{id}")]
        public async Task<ActionResult<OTPSent>> Getotp(string id)
        {
            try
            {
                var data = await context.tblOTPSent.Where(e => e.IsDeleted == false && e.MemberID == id)
                    .OrderByDescending(p => p.ID)
                    .FirstOrDefaultAsync();
                if (data == null)
                {
                    return Ok(new { status_code = 0, status_message = "OTP not Found." });
                }
                return Ok(new { data, status_code = 1 });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.", e.Message });
            }
        }
    }
}
