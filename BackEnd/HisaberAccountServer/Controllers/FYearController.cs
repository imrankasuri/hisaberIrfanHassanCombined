using HisaberAccountServer.Data;
using HisaberAccountServer.Models.Settings;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HisaberAccountServer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FYearController : ControllerBase
    {
        private readonly HisaberDbContext context;
        public FYearController(HisaberDbContext context)
        {
            this.context = context;
        }

        [HttpPost("RegisterEmail")]
        public async Task<ActionResult<TblFYear>> PostCompanyInfo(TblFYear tblFYear)
        {
            try
            {
                if (tblFYear != null)
                {
                    await context.tblFYear.AddAsync(tblFYear);
                    await context.SaveChangesAsync();
                    return Ok(new { status_message = "Financial Year Registered.", status_code = 1, tblFYear });
                }
                else
                {
                    return Ok(new { status_message = "Financial Year Data is Null.", status_code = 0 });
                }
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong." });
            }
        }
    }
}
