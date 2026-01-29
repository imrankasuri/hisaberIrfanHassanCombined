using HisaberAccountServer.Data;
using HisaberAccountServer.Models.Accounts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HisaberAccountServer.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class DefaultAccountController : ControllerBase
    {
        private readonly HisaberDbContext context;
        public DefaultAccountController(HisaberDbContext context)
        {
            this.context = context;
        }

        [HttpGet("GetDefaultAccount")]
        public async Task<ActionResult<DefaultAccount>> GetDefaultAccount()
        {
            try
            {
                var data = await context.tblDefaultAccount.ToListAsync();
                if (data == null)
                {
                    return Ok(new { status_code = 0, status_message = "Accounts Not Found." });
                }
                return Ok(new { defaultAccount = data, status_code = 1 });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong." });
            }
        }
    }
}
