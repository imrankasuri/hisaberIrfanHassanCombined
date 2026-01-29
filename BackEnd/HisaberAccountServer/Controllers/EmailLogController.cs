using HisaberAccountServer.Data;
using HisaberAccountServer.Models.Settings;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HisaberAccountServer.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    public class EmailLogController : ControllerBase
    {
        private readonly HisaberDbContext context;
        public EmailLogController(HisaberDbContext context)
        {
            this.context = context;
        }

        [HttpPost("RegisterEmail")]
        public async Task<ActionResult<EmailLog>> PostCompanyInfo(EmailLog emailLog)
        {
            try
            {
                if (emailLog != null)
                {
                    await context.tblEmailLog.AddAsync(emailLog);
                    await context.SaveChangesAsync();
                    return Ok(new { status_message = "Email Registered.", status_code = 1, emailLog });
                }
                else
                {
                    return Ok(new { status_message = "Email Registration Failed.", status_code = 0 });
                }
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong." });
            }
        }
    }
}
