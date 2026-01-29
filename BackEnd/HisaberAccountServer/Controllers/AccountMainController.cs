using ExcelDataReader;
using HisaberAccountServer.Data;
using HisaberAccountServer.Models;
using HisaberAccountServer.Models.Accounts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualStudio.Web.CodeGenerators.Mvc.Templates.BlazorIdentity.Shared;

namespace HisaberAccountServer.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class AccountMainController : ControllerBase
    {
        private readonly HisaberDbContext context;
        public AccountMainController(HisaberDbContext context)
        {
            this.context = context;
        }

        [HttpPost("Accounts")]
        public async Task<ActionResult> PostAccountMain([FromBody] List<AccountMain> accountMain)
        {
            try
            {
                if (accountMain != null && accountMain.Any())
                {
                    await context.AccountMain.AddRangeAsync(accountMain);
                    await context.SaveChangesAsync();
                    return Ok(new { status_message = "Accounts successfully Inserted.", status_code = 1 });
                }
                else
                {
                    return Ok(new { status_message = "Failed to insert accounts.", status_code = 0 });
                }
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong..." });
            }
        }

        [HttpPost("AddAccount")]
        public async Task<ActionResult<AccountMain>> AddAccount(AccountMain accountMain)
        {
            try
            {
                if (accountMain == null)
                {
                    return Ok(new { status_message = "Account Data is Null", status_code = 0 });
                }

                var accountData = await context.AccountMain.Where(a => a.AccountDescription == accountMain.AccountDescription && a.CompanyId == accountMain.CompanyId && accountMain.IsActive == true).FirstOrDefaultAsync();

                if (accountData != null)
                {
                    return Ok(new
                    {
                        status_code = 0,
                        status_message = $"Account with this name '{accountData.AccountDescription}' already exists."
                    });
                }

                accountMain.CreatedDate = DateTime.Now;

                await context.AccountMain.AddAsync(accountMain);
                await context.SaveChangesAsync();

                return Ok(new { status_message = "Account Added Successfully.", status_code = 1, accountMain });

            }
            catch (Exception e)
            {

                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong..." });
            }
        }

        [HttpPost("GetAccounts")]
        public async Task<ActionResult> GetAccounts(GeneralRequest inParams)
        {
            if (inParams.CompanyID <= 0)
            {
                return Ok(new { status_code = 0, status_message = "Invalid Company ID." });
            }

            try
            {
                var accounts = await context.AccountMain
                    .Where(e => !e.IsDeleted && e.CompanyId == inParams.CompanyID)
                    .ToListAsync();

                List<AccountMain> filteredAccounts;

                if (!string.IsNullOrWhiteSpace(inParams.AccountName))
                {
                    filteredAccounts = accounts
                        .Where(e => e.AccountDescription.Contains(inParams.AccountName, StringComparison.OrdinalIgnoreCase))
                        .ToList();

                    var relatedAccounts = new List<AccountMain>();

                    foreach (var account in filteredAccounts)
                    {
                        if (account.ILevel == 1)
                        {
                            // Include all child accounts for level 1
                            var childrenLevel2 = accounts.Where(l2 => l2.AccountCode.StartsWith(account.AccountCode) && l2.ILevel == 2).ToList();
                            relatedAccounts.AddRange(childrenLevel2);

                            foreach (var level2Account in childrenLevel2)
                            {
                                var childrenLevel3 = accounts.Where(l3 => l3.AccountCode.StartsWith(level2Account.AccountCode) && l3.ILevel == 3).ToList();
                                relatedAccounts.AddRange(childrenLevel3);
                            }
                        }
                        else if (account.ILevel == 2 || account.ILevel == 3)
                        {
                            // Include parent and grandparent accounts
                            var parentLevel1 = accounts.FirstOrDefault(e => e.ILevel == 1 && account.AccountCode.StartsWith(e.AccountCode));
                            if (parentLevel1 != null && !relatedAccounts.Contains(parentLevel1))
                            {
                                relatedAccounts.Add(parentLevel1);
                            }

                            if (account.ILevel == 3)
                            {
                                var parentLevel2 = accounts.FirstOrDefault(e => e.ILevel == 2 && account.AccountCode.StartsWith(e.AccountCode));
                                if (parentLevel2 != null && !relatedAccounts.Contains(parentLevel2))
                                {
                                    relatedAccounts.Add(parentLevel2);
                                }
                            }
                        }
                    }

                    filteredAccounts.AddRange(relatedAccounts);
                    filteredAccounts = filteredAccounts.Distinct().ToList();
                }
                else
                {
                    filteredAccounts = accounts;
                }

                // Hierarchical structuring
                var level1Accounts = filteredAccounts.Where(e => e.ILevel == 1).ToList();
                var level2Accounts = filteredAccounts.Where(e => e.ILevel == 2).ToList();
                var level3Accounts = filteredAccounts.Where(e => e.ILevel == 3).ToList();

                foreach (var level1 in level1Accounts)
                {
                    level1.Level2Accounts = level2Accounts
                        .Where(l2 => l2.AccountCode.StartsWith(level1.AccountCode))
                        .ToList();

                    foreach (var level2 in level1.Level2Accounts)
                    {
                        level2.Level3Accounts = level3Accounts
                            .Where(l3 => l3.AccountCode.StartsWith(level2.AccountCode))
                            .ToList();
                    }
                }

                return Ok(new
                {
                    listofAccounts = level1Accounts,
                    status_code = 1,
                    totalRecords = level1Accounts.Count,
                    status_message = "Successfully returning list of Accounts."
                });
            }
            catch (Exception ex)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong..." });
            }
        }

        [HttpPost("GetAccountsByLevel")]
        public async Task<ActionResult<AccountMain>> GetAccountsByLevel(GeneralRequest inParams)
        {
            try
            {
                int Companyid = inParams.CompanyID;
                int level1 = inParams.Level1;

                string AccountCode = inParams.AccountCode ?? string.Empty;

                if (Companyid <= 0)
                {
                    return Ok(new { status_code = 0, status_message = "Invalid Company ID." });
                }

                var query = context.AccountMain
                    .Where(e => !e.IsDeleted && e.CompanyId == Companyid);
                if (level1 > 0)
                {
                    query = query.Where(e => e.ILevel == level1);
                }
                if (!string.IsNullOrWhiteSpace(AccountCode))
                {
                    query = query.Where(e => e.AccountCode.StartsWith(AccountCode) && e.ILevel == level1);
                }

                var data = await query.ToListAsync();

                if (!data.Any())
                {
                    return Ok(new { status_code = 0, status_message = "No accounts found.", listofAccounts = data });
                }

                return Ok(new
                {
                    listofAccounts = data,
                    status_code = 1,
                    totalRecords = data.Count
                });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong..." });
            }
        }

        [HttpPatch("DeleteAccount")]
        public async Task<ActionResult<AccountMain>> UpdateAccount(GeneralRequest inParams)
        {
            try
            {
                var account = await context.AccountMain.FindAsync(inParams.ID);
                if (account == null)
                {
                    return Ok(new { status_message = "Account not found.", status_code = 0 });
                }

                var Receipts = await context.tblReceiptHead.Where(r => r.CompanyID == account.CompanyId && r.BankCode == account.AccountCode).ToListAsync();
                int receiptCount = Receipts.Count;

                var Payments = await context.tblPaymentHead.Where(r => r.CompanyID == account.CompanyId && r.BankCode == account.AccountCode).ToListAsync();
                int paymentCount = Payments.Count;

                var OpeningBalance = await context.tblOpeningBal.Where(o => o.CompanyId == account.CompanyId && o.AccountCode == account.AccountCode).ToListAsync();
                int openingBalanceCount = OpeningBalance.Count;

                var BankReceipt = await context.tblBankReceipts.Where(b => b.CompanyID == account.CompanyId && b.BankCode == account.AccountCode).ToListAsync();
                int bankReceiptCount = BankReceipt.Count;

                var BankPayment = await context.tblBankPayments.Where(b => b.CompanyID == account.CompanyId && b.BankCode == account.AccountCode).ToListAsync();
                int bankPaymentCount = BankPayment.Count;

                var BankTransfer = await context.tblBankTransfers.Where(b => b.CompanyID == account.CompanyId && (b.ToBankCode == account.AccountCode || b.FromBankCode == account.AccountCode)).ToListAsync();
                int bankTransferCount = BankTransfer.Count;

                var JournalVoucher = await context.tblJournalVoucher.Where(b => b.CompanyID == account.CompanyId && (b.ToAccountCode == account.AccountCode || b.FromAccountCode == account.AccountCode)).ToListAsync();
                int journalVoucherCount = JournalVoucher.Count;

                int totalTransactionCount = receiptCount + paymentCount + openingBalanceCount + bankPaymentCount + bankReceiptCount + bankTransferCount + journalVoucherCount;

                if (totalTransactionCount > 0)
                {
                    return Ok(new { status_code = 0, status_message = "Account used in transactions can't be deleted" });
                }

                account.IsActive = false;
                account.IsDeleted = true;

                context.Entry(account).State = EntityState.Modified;
                await context.SaveChangesAsync();

                return Ok(new { account, status_message = "Account Deleted Successfully.", status_code = 1 });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong..." });
            }
        }

        [HttpGet("GetRecord/{id}")]
        public async Task<ActionResult<AccountMain>> GetRecord(int id)
        {
            try
            {
                var data = await context.AccountMain.Where(e => e.IsDeleted == false && e.Id == id).FirstOrDefaultAsync();
                if (data == null)
                {
                    return Ok(new { status_code = 0, status_message = "Account Not Found." });
                }
                return Ok(new { AccountData = data, status_code = 1 });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong..." });
            }
        }

        [HttpPatch("UpdateDescription/{id}")]
        public async Task<ActionResult<AccountMain>> UpdateDescription(int id, [FromBody] AccountMain accountMain)
        {
            try
            {
                var account = await context.AccountMain.FindAsync(id);
                if (account == null)
                {
                    return Ok(new { status_code = 0, status_message = "Account Not Found." });
                }

                // Update only the necessary fields
                account.AccountDescription = accountMain.AccountDescription; // Set to false


                context.Entry(account).State = EntityState.Modified;
                await context.SaveChangesAsync();

                return Ok(new { account, status_message = "Accounts Updated Successfully." });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong..." });
            }
        }

        [HttpPost("UploadExcel/{companyId}")]
        public async Task<IActionResult> UploadExcelFile([FromForm] IFormFile file, int companyId, [FromQuery] int Year)
        {
            try
            {
                System.Text.Encoding.RegisterProvider(System.Text.CodePagesEncodingProvider.Instance);

                if (file == null || file.Length == 0)
                {
                    return Ok(new { status_message = "No file uploaded", status_code = 0 });
                }

                var uploadFolders = Path.Combine(Directory.GetCurrentDirectory(), "Uploads");
                if (!Directory.Exists(uploadFolders))
                {
                    Directory.CreateDirectory(uploadFolders);
                }

                var filePath = Path.Combine(uploadFolders, file.FileName);
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                using (var stream = new FileStream(filePath, FileMode.Open, FileAccess.Read))
                {
                    using (var reader = ExcelReaderFactory.CreateReader(stream))
                    {
                        bool isHeaderSkipped = false;
                        do
                        {
                            while (reader.Read())
                            {
                                // Skip header row
                                if (!isHeaderSkipped)
                                {
                                    isHeaderSkipped = true;
                                    continue;
                                }


                                // Create a new AccountMain instance
                                AccountMain accountMain = new AccountMain
                                {
                                    CompanyId = companyId,
                                    AccountDescription = reader.GetValue(0)?.ToString(),
                                    AccountCode = reader.GetValue(1)?.ToString(),
                                    ILevel = ParseInt(reader.GetValue(2)?.ToString()) ?? 0,
                                    Remarks = "",
                                    Year = Year,
                                    CreatedDate = DateTime.Now,
                                    IsActive = true,
                                    IsDeleted = false
                                };

                                if (string.IsNullOrWhiteSpace(accountMain.AccountCode) ||
                                    string.IsNullOrWhiteSpace(accountMain.AccountDescription))
                                {
                                    continue;
                                }

                                context.AccountMain.Add(accountMain);
                            }
                        } while (reader.NextResult());

                        // Save all changes to the database
                        var result = await context.SaveChangesAsync();
                    }
                }

                return Ok(new { status_message = "Accounts Successfully Uploaded", status_code = 1 });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong..." });
            }
        }

        private int? ParseInt(string value)
        {
            if (int.TryParse(value, out int result))
            {
                return result;
            }
            return null;
        }


    }

}

