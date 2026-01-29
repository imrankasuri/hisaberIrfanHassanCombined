using HisaberAccountServer.Data;
using HisaberAccountServer.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualStudio.Web.CodeGenerators.Mvc.Templates.BlazorIdentity.Shared;
using System.Globalization;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;

namespace HisaberAccountServer.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class BalanceController : ControllerBase
    {
        private readonly HisaberDbContext context;
        public BalanceController(HisaberDbContext context)
        {
            this.context = context;
        }

        [HttpPost("UpdateBalance")]
        public async Task<ActionResult<OpeningBal>> PostOpeningBal(OpeningBal openingBal)
        {
            try
            {
                if (openingBal == null)
                {
                    return Ok(new { status_message = "OpeningBalance is null", status_code = 0 });
                }

                // Check if the record already exists by AccountCode
                var existingRecord = await context.tblOpeningBal
                    .FirstOrDefaultAsync(x => x.AccountCode == openingBal.AccountCode && x.CompanyId == openingBal.CompanyId);

                if (existingRecord != null)
                {
                    // Update existing record
                    existingRecord.DRAmt = openingBal.DRAmt;
                    existingRecord.CRAmt = openingBal.CRAmt;
                    existingRecord.BudgetAllocation = openingBal.BudgetAllocation;
                    existingRecord.AccountName = openingBal.AccountName;
                    existingRecord.ModifyBy = openingBal.ModifyBy;
                    existingRecord.ModifyDate = DateTime.Now;
                    existingRecord.UpdatedDate = DateTime.Now;

                    context.tblOpeningBal.Update(existingRecord);
                }
                else
                {
                    // Insert new record
                    openingBal.ModifyBy = openingBal.ModifyBy;
                    openingBal.ModifyDate = DateTime.Now;
                    await context.tblOpeningBal.AddAsync(openingBal);
                }

                await context.SaveChangesAsync();

                return Ok(new
                {
                    status_message = existingRecord != null
                        ? "Account Updated Successfully."
                        : "Account Updated Successfully.",
                    status_code = 1,
                    openingBal
                });
            }
            catch (Exception e)
            {
                return Ok(new
                {
                    status_code = 0,
                    status_message = "Something went wrong.",
                    error = e.Message
                });
            }
        }


        [HttpGet("GetBalanceByCompanyID/{Companyid}")]
        public async Task<ActionResult> GetAccountMain(int Companyid, string accountCode = null)
        {
            try
            {
                var query = context.tblOpeningBal
                    .Where(e => !e.IsDeleted && e.CompanyId == Companyid);

                if (!string.IsNullOrEmpty(accountCode))
                {
                    query = query.Where(e => e.AccountCode == accountCode);
                }

                var data = await query.ToListAsync();

                if (!data.Any())
                {
                    return Ok(new { status_code = 0, status_message = "Opening Balance Not Found" });
                }

                return Ok(new
                {
                    AccountBalance = data,
                    status_code = 1,
                    totalRecords = data.Count
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { status_code = 0, status_message = "Something went wrong.", error = ex.Message });
            }
        }



        [HttpGet("GetBalanceById/{id}")]
        public async Task<ActionResult<OpeningBal>> GetBalanceById(int id)
        {
            try
            {
                var data = await context.tblOpeningBal.Where(e => e.IsDeleted == false && e.ID == id).FirstOrDefaultAsync();
                if (data == null)
                {
                    return Ok(new { status_code = 0, status_message = "Opening Balance not found." });
                }
                return Ok(new { AccountBalance = data, status_code = 1 });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Something went wrong.", error = e.Message });
            }
        }

        [HttpPatch("DeleteAccount/{id}")]
        public async Task<ActionResult<OpeningBal>> UpdateAccount(int id, [FromBody] OpeningBal accountMain)
        {
            try
            {
                var account = await context.tblOpeningBal.FindAsync(id);
                if (account == null)
                {
                    return Ok(new { status_code = 0, status_message = "Opening Balance not found." });
                }
                account.UpdatedDate = DateTime.Now;
                account.IsActive = accountMain.IsActive;
                account.IsDeleted = accountMain.IsDeleted;

                context.Entry(account).State = EntityState.Modified;
                await context.SaveChangesAsync();

                return Ok(account);
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Something went wrong.", error = e.Message });
            }
        }

        [HttpPatch("UpdateDescription/{id}")]
        public async Task<ActionResult<OpeningBal>> UpdateDescription(int id, [FromBody] OpeningBal openingBal)
        {
            try
            {
                if (id != openingBal.ID)
                {
                    return Ok(new { status_code = 0, status_message = "Opening Balance not found." });
                }
                openingBal.UpdatedDate = DateTime.Now;
                openingBal.ModifyDate = DateTime.Now;
                context.Entry(openingBal).State = EntityState.Modified;
                await context.SaveChangesAsync();

                return Ok(new { status_code = 1, status_message = "Balance Updated Successfully", openingBal });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Something went wrong.", error = e.Message });
            }
        }
    }
}
