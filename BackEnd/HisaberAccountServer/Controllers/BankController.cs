using HisaberAccountServer.Data;
using HisaberAccountServer.Models;
using HisaberAccountServer.Models.Accounts;
using HisaberAccountServer.Models.Bank;
using HisaberAccountServer.Models.Reports;
using HisaberAccountServer.Models.Sales;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualStudio.Web.CodeGenerators.Mvc.Templates.BlazorIdentity.Shared;
using System.Data;
using System.Transactions;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;

namespace HisaberAccountServer.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class BankController : ControllerBase
    {
        private readonly HisaberDbContext context;
        public BankController(HisaberDbContext context)
        {
            this.context = context;
        }

        [HttpGet("GetAccountBalanceDetails/{CompanyID}")]
        public async Task<IActionResult> GetAccountBalances(int CompanyID)
        {
            try
            {
                DateTime startDate = DateTime.Now.AddDays(1);

                // Fetch connection string from DbContext
                var connectionString = context.Database.GetDbConnection().ConnectionString;

                List<BankTransaction> transactions = new List<BankTransaction>();

                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    await connection.OpenAsync();

                    // Opening balance query
                    string openingBalanceQuery = @"EXEC GetAccountBalances @startDate = @startDate, @CompanyID = @CompanyID;";

                    using (SqlCommand openingBalanceCommand = new SqlCommand(openingBalanceQuery, connection))
                    {
                        openingBalanceCommand.Parameters.Add(new SqlParameter("@startDate", SqlDbType.Date) { Value = startDate });
                        openingBalanceCommand.Parameters.Add(new SqlParameter("@CompanyID", SqlDbType.Int) { Value = CompanyID });

                        using (var sqlDataReader = await openingBalanceCommand.ExecuteReaderAsync())
                        {
                            List<string> accountCodes = new List<string>();

                            while (await sqlDataReader.ReadAsync())
                            {
                                string accountCode = sqlDataReader.IsDBNull(0) ? string.Empty : Convert.ToString(sqlDataReader.GetString(0));
                                decimal payment = sqlDataReader.IsDBNull(1) ? 0 : sqlDataReader.GetDecimal(1);
                                decimal receipt = sqlDataReader.IsDBNull(2) ? 0 : sqlDataReader.GetDecimal(2);
                                decimal balance = sqlDataReader.IsDBNull(3) ? 0 : sqlDataReader.GetDecimal(3);

                                if (!string.IsNullOrEmpty(accountCode) && !accountCodes.Contains(accountCode))
                                {
                                    accountCodes.Add(accountCode);
                                }

                                transactions.Add(new BankTransaction
                                {
                                    Type = "Opening Balance",
                                    Date = startDate,
                                    Mode = "Cash",
                                    Account = accountCode,
                                    Details = accountCode,
                                    Payments = payment,
                                    Receipts = receipt,
                                    Balance = balance
                                });
                            }


                            var accountDescriptions = await context.AccountMain
                                .Where(a => accountCodes.Contains(a.AccountCode) && a.CompanyId == CompanyID && a.IsActive == true && a.AccountDescription != "ARSHAD CASH")
                                .ToDictionaryAsync(a => a.AccountCode, a => a.AccountDescription);

                            transactions = transactions
                                .Where(transaction => accountDescriptions.ContainsKey(transaction.Account))
                                .Select(transaction =>
                                {
                                    transaction.Account = accountDescriptions[transaction.Account];
                                    return transaction;
                                })
                                .ToList();
                        }
                    }
                }

                decimal totalReceipts = transactions.Sum(t => t.Receipts ?? 0);
                decimal totalPayments = transactions.Sum(t => t.Payments ?? 0);
                decimal totalBalance = transactions.Sum(t => t.Balance ?? 0);

                return Ok(new
                {
                    ListofRecords = transactions,
                    totalReceipts,
                    totalPayments,
                    totalBalance,
                    status_code = 1,
                    status_message = "Successfully returning List of Records"
                });
            }
            catch (Exception ex)
            {
                return Ok(new
                {
                    status_code = 0,
                    status_message = "Sorry! Something went wrong",
                    error = ex.Message
                });
            }
        }



        [HttpPost("AddBankPayments")]
        public async Task<ActionResult<IEnumerable<BankPayments>>> AddBankPayments(IEnumerable<BankPayments> bankPayments)
        {
            if (!ModelState.IsValid || bankPayments == null || !bankPayments.Any())
            {
                return Ok(new { status_code = 0, status_message = "Invalid payment data." });
            }

            try
            {
                var bankPaymentsList = bankPayments.ToList();
                var firstPayment = bankPaymentsList.First();
                var companyId = firstPayment.CompanyID;

                // Get the next VoucherNo in a single query
                var nextVoucherNo = await context.tblBankPayments
                    .Where(p => p.CompanyID == companyId)
                    .OrderByDescending(p => p.VoucherNo)
                    .Select(p => (int?)p.VoucherNo + 1)
                    .FirstOrDefaultAsync() ?? 1;

                // Fetch bank details in one call
                var bank = await context.AccountMain
                    .FirstOrDefaultAsync(a => a.CompanyId == companyId && a.AccountCode == firstPayment.BankCode && a.IsActive);

                if (bank == null)
                {
                    return Ok(new { status_code = 0, status_message = "Invalid bank selected." });
                }

                // Update each payment with the necessary details
                bankPaymentsList.ForEach(payment =>
                {
                    payment.VoucherNo = nextVoucherNo++;
                    payment.BankCode = bank.AccountCode;
                    payment.BankID = bank.Id;
                    payment.Bank = bank.AccountDescription;
                });

                // Add all payments and save
                context.tblBankPayments.AddRange(bankPaymentsList);
                await context.SaveChangesAsync();

                return Ok(new { bankPayments = bankPaymentsList, status_code = 1, status_message = "Payments added successfully." });
            }
            catch (Exception ex)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.", error = ex.Message });
            }
        }

        [HttpPost("AddBankReceipts")]
        public async Task<ActionResult<IEnumerable<BankPayments>>> AddBankReceipts(IEnumerable<BankReceipts> bankReceipts)
        {
            if (!ModelState.IsValid || bankReceipts == null || !bankReceipts.Any())
            {
                return Ok(new { status_code = 0, status_message = "Invalid receipt data." });
            }

            try
            {
                var bankReceiptsList = bankReceipts.ToList();
                var firstReceipt = bankReceiptsList.First();
                var companyId = firstReceipt.CompanyID;

                // Get the next VoucherNo in a single query
                var nextVoucherNo = await context.tblBankReceipts
                    .Where(p => p.CompanyID == companyId)
                    .OrderByDescending(p => p.VoucherNo)
                    .Select(p => (int?)p.VoucherNo + 1)
                    .FirstOrDefaultAsync() ?? 1;

                // Fetch bank details in one call
                var bank = await context.AccountMain
                    .FirstOrDefaultAsync(a => a.CompanyId == companyId && a.AccountCode == firstReceipt.BankCode && a.IsActive);

                if (bank == null)
                {
                    return Ok(new { status_code = 0, status_message = "Invalid bank selected." });
                }

                // Update each payment with the necessary details
                bankReceiptsList.ForEach(payment =>
                {
                    payment.VoucherNo = nextVoucherNo++;
                    payment.BankCode = bank.AccountCode;
                    payment.BankID = bank.Id;
                    payment.Bank = bank.AccountDescription;
                });

                // Add all payments and save
                context.tblBankReceipts.AddRange(bankReceiptsList);
                await context.SaveChangesAsync();

                return Ok(new { bankReceipts = bankReceiptsList, status_code = 1, status_message = "Receipts added successfully." });
            }
            catch (Exception ex)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.", error = ex.Message });
            }
        }

        [HttpPost("AddBankTransfers")]
        public async Task<ActionResult<IEnumerable<BankTransfers>>> AddBankTransfers(IEnumerable<BankTransfers> bankTransfers)
        {
            if (!ModelState.IsValid)
            {
                return Ok(new { status_code = 0, status_message = "Invalid model state." });
            }

            try
            {
                long nextVoucherNo = 1;
                int companyID = 0;

                if (bankTransfers.Any())
                {
                    companyID = bankTransfers.First().CompanyID;
                    var lastSale = await context.tblBankTransfers
                        .Where(p => p.CompanyID == companyID)
                        .OrderByDescending(p => p.VoucherNo)
                        .FirstOrDefaultAsync();

                    nextVoucherNo = lastSale != null ? lastSale.VoucherNo + 1 : 1;
                }

                foreach (var transfer in bankTransfers)
                {
                    transfer.VoucherNo = nextVoucherNo++;
                }

                context.tblBankTransfers.AddRange(bankTransfers);
                await context.SaveChangesAsync();

                return Ok(new { bankTransfers, status_code = 1, status_message = "Transfers Added Successfully." });
            }
            catch (Exception ex)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.", error = ex.Message });
            }
        }

        [HttpPost("AddJournalVoucher")]
        public async Task<ActionResult<IEnumerable<JournalVoucher>>> AddJournalVoucher(IEnumerable<JournalVoucher> journalVouchers)
        {
            if (!ModelState.IsValid)
            {
                return Ok(new { status_code = 0, status_message = "Invalid model state." });
            }

            try
            {
                int nextVoucherNo = 1;

                if (journalVouchers.Any())
                {
                    var companyId = journalVouchers.First().CompanyID;
                    var lastSale = await context.tblJournalVoucher
                        .Where(p => p.CompanyID == companyId)
                        .OrderByDescending(p => p.VoucherNo)
                        .FirstOrDefaultAsync();

                    // Set the next invoice number based on the last record
                    nextVoucherNo = (int)(lastSale != null ? lastSale.VoucherNo + 1 : 1);
                }

                foreach (var sale in journalVouchers)
                {
                    sale.VoucherNo = nextVoucherNo++;
                    var FromAccount = await context.tblCustomerSupplier.Where(c => c.AccountCode == sale.FromAccountCode && c.CompanyID == sale.CompanyID).FirstOrDefaultAsync();
                    var ToAccount = await context.tblCustomerSupplier.Where(c => c.AccountCode == sale.ToAccountCode && c.CompanyID == sale.CompanyID).FirstOrDefaultAsync();

                    if (FromAccount != null)
                    {
                        if (FromAccount.IsCustomer)
                        {
                            FromAccount.CustomerOpeningBalance -= sale.Amount;
                        }
                        else
                        {
                            FromAccount.SupplierOpeningBalance += sale.Amount;
                        }
                    }
                    if (ToAccount != null)
                    {
                        if (ToAccount.IsCustomer)
                        {
                            ToAccount.CustomerOpeningBalance += sale.Amount;
                        }
                        else
                        {
                            ToAccount.SupplierOpeningBalance -= sale.Amount;
                        }
                    }
                }

                context.tblJournalVoucher.AddRange(journalVouchers);
                await context.SaveChangesAsync();

                return Ok(new { journalVouchers, status_code = 1, status_message = "Journal Voucher Added Successfully." });
            }
            catch (Exception ex)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.", error = ex.Message });
            }
        }


        [HttpPost("GetBankPayments")]
        public async Task<ActionResult> GetBankPayments(GeneralRequest inParams)
        {
            if (inParams.CompanyID <= 0)
            {
                return Ok(new { status_code = 0, status_message = "Invalid Company ID." });
            }

            try
            {
                var query = context.tblBankPayments
                    .Where(e => !e.IsDeleted && e.CompanyID == inParams.CompanyID);

                // Apply filters
                if (!string.IsNullOrWhiteSpace(inParams.AccountName))
                {
                    query = query.Where(e => e.Bank.Contains(inParams.AccountName));
                }


                if (!string.IsNullOrEmpty(inParams.AccountCode))
                {
                    query = query.Where(e => e.NominalAccount.Contains(inParams.AccountCode));
                }

                if (inParams.Level1 > 0)
                {
                    query = query.Where(e => e.VoucherNo == inParams.Level1);
                }
                if (inParams.Date != null)
                {
                    query = query.Where(e => e.Date == inParams.Date.Value);
                }

                query = query.OrderByDescending(e => e.ID);

                var data = await query.ToListAsync();

                if (data.Count == 0)
                {
                    return Ok(new { status_code = 0, status_message = "No Payment Found." });
                }

                return Ok(new
                {
                    listofPayments = data,
                    status_code = 1,
                    totalRecords = data.Count,
                    status_message = "Successfully returning List of Bank Payments."
                });
            }
            catch (Exception ex)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.", error = ex.Message });
            }
        }

        [HttpPost("GetBankReceipts")]
        public async Task<ActionResult> GetBankReceipts(GeneralRequest inParams)
        {
            if (inParams.CompanyID <= 0)
            {
                return Ok(new { status_code = 0, status_message = "Invalid Company ID." });
            }

            try
            {
                var query = context.tblBankReceipts
                    .Where(e => !e.IsDeleted && e.CompanyID == inParams.CompanyID);

                // Apply filters
                if (!string.IsNullOrWhiteSpace(inParams.AccountName))
                {
                    query = query.Where(e => e.Bank.Contains(inParams.AccountName));
                }


                if (!string.IsNullOrEmpty(inParams.AccountCode))
                {
                    query = query.Where(e => e.NominalAccount.Contains(inParams.AccountCode));
                }

                if (inParams.Level1 > 0)
                {
                    query = query.Where(e => e.VoucherNo == inParams.Level1);
                }
                if (inParams.Date != null)
                {
                    query = query.Where(e => e.Date == inParams.Date.Value);
                }

                query = query.OrderByDescending(e => e.ID);

                var data = await query.ToListAsync();

                if (data.Count == 0)
                {
                    return Ok(new { status_code = 0, status_message = "No Receipt Found." });
                }

                return Ok(new
                {
                    listofPayments = data,
                    status_code = 1,
                    totalRecords = data.Count,
                    status_message = "Receipts Found Successfully."
                });
            }
            catch (Exception ex)
            {

                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.", error = ex.Message });
            }
        }

        [HttpPost("GetBankTransfers")]
        public async Task<ActionResult> GetBankTransfers(GeneralRequest inParams)
        {
            if (inParams.CompanyID <= 0)
            {
                return Ok(new { status_code = 0, status_message = "Invalid Company ID." });
            }

            try
            {
                var query = context.tblBankTransfers
                    .Where(e => !e.IsDeleted && e.CompanyID == inParams.CompanyID);

                if (!string.IsNullOrWhiteSpace(inParams.AccountName))
                {
                    query = query.Where(e => e.FromBank.Contains(inParams.AccountName));
                }


                if (!string.IsNullOrEmpty(inParams.AccountCode))
                {
                    query = query.Where(e => e.ToBank.Contains(inParams.AccountCode));
                }

                if (inParams.ID > 0)
                {
                    query = query.Where(e => e.VoucherNo == inParams.ID);
                }
                if (inParams.Date != null)
                {
                    query = query.Where(e => e.Date == inParams.Date.Value);
                }

                query = query.OrderByDescending(e => e.ID);

                var data = await query.ToListAsync();

                if (data.Count == 0)
                {
                    return Ok(new { status_code = 0, status_message = "No Transfer Found." });
                }

                return Ok(new
                {
                    listofTransfers = data,
                    status_code = 1,
                    totalRecords = data.Count,
                    status_message = "Transfer Found Successfully."
                });
            }
            catch (Exception ex)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.", error = ex.Message });
            }
        }

        [HttpGet("GetJournalVoucherBy/{Companyid}")]
        public async Task<ActionResult> GetJournalVoucherBy(
         int Companyid,
         string fromAccount = "",
         string toAccount = "",
         long voucherNo = 0,
         DateOnly? date = null)
        {
            if (Companyid <= 0)
            {
                return Ok(new { status_code = 0, status_message = "Invalid Company ID." });
            }

            try
            {
                var query = context.tblJournalVoucher
                    .Where(e => !e.IsDeleted && e.CompanyID == Companyid);

                // Apply filters
                if (!string.IsNullOrWhiteSpace(fromAccount))
                {
                    query = query.Where(e => e.FromAccount.Contains(fromAccount));
                }

                if (!string.IsNullOrEmpty(toAccount))
                {
                    query = query.Where(e => e.ToAccount.Contains(toAccount));
                }

                if (voucherNo > 0)
                {
                    query = query.Where(e => e.VoucherNo == voucherNo);
                }

                if (date != null)
                {
                    query = query.Where(e => e.Date == date.Value);
                }

                query = query.OrderByDescending(e => e.ID);

                var data = await query.ToListAsync();

                if (data.Count == 0)
                {
                    return Ok(new { status_code = 0, status_message = "No Voucher Found." });
                }

                return Ok(new
                {
                    listofVouchers = data,
                    status_code = 1,
                    totalRecords = data.Count
                });
            }
            catch (Exception ex)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.", error = ex.Message });
            }
        }


        [HttpPost("GetBankPaymentByVoucher")]
        public async Task<ActionResult<BankPayments>> GetBankPaymentByVoucher(GeneralRequest inParams)
        {
            try
            {
                var data = await context.tblBankPayments.Where(e => e.IsDeleted == false && e.VoucherNo == inParams.ID && e.CompanyID == inParams.CompanyID && e.BankPaymentType == inParams.Email).ToListAsync();
                if (data == null)
                {
                    return Ok(new { status_code = 0, status_message = "Payment not found." });
                }
                return Ok(new { BankPaymentData = data, status_code = 1 });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.", error = e.Message });
            }
        }

        [HttpPost("GetBankReceiptByVoucher")]
        public async Task<ActionResult<BankReceipts>> GetBankReceiptByVoucher(GeneralRequest inParams)
        {
            try
            {
                var data = await context.tblBankReceipts.Where(e => e.IsDeleted == false && e.VoucherNo == inParams.ID && e.CompanyID == inParams.CompanyID).ToListAsync();
                if (data == null)
                {
                    return Ok(new { status_code = 0, status_message = "Receipt not found." });
                }
                return Ok(new { BankReceiptData = data, status_code = 1 });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.", error = e.Message });
            }
        }

        [HttpPost("GetBankTransferByVoucher")]
        public async Task<ActionResult<BankTransfers>> GetBankTransferBy(GeneralRequest inParams)
        {
            try
            {
                var data = await context.tblBankTransfers.Where(e => e.IsDeleted == false && e.VoucherNo == inParams.ID && e.CompanyID == inParams.CompanyID).ToListAsync();
                if (data == null)
                {
                    return Ok(new { status_code = 0, status_message = "Transfer not found." });
                }
                return Ok(new { BankTransferData = data, status_code = 1 });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.", error = e.Message });
            }
        }

        [HttpGet("GetJournalVoucherBy/{Voucher}/{CompanyID}")]
        public async Task<ActionResult<JournalVoucher>> GetJournalVoucherBy(int Voucher, int CompanyID)
        {
            try
            {
                var data = await context.tblJournalVoucher.Where(e => e.IsDeleted == false && e.VoucherNo == Voucher && e.CompanyID == CompanyID).ToListAsync();
                if (data == null)
                {
                    return Ok(new { status_code = 0, status_message = "Voucher Not Found." });
                }
                return Ok(new { JournalVoucherData = data, status_code = 1 });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.", error = e.Message });
            }
        }


        [HttpPatch]
        [Route("UpdateRecords")]
        public async Task<ActionResult<IEnumerable<BankPayments>>> UpdateRecords(IEnumerable<BankPayments> bankPayments)
        {
            try
            {
                foreach (var saleBody in bankPayments)
                {
                    var existingSale = await context.tblBankPayments.FindAsync(saleBody.ID);
                    if (existingSale == null)
                    {
                        return Ok(new { status_message = $"Payment with ID {saleBody.ID} not found.", status_code = 0 });
                    }
                    var bank = await context.AccountMain.FirstOrDefaultAsync(a => a.AccountCode == saleBody.BankCode && a.CompanyId == saleBody.CompanyID);
                    if (bank == null)
                    {
                        return Ok(new { status_code = 0, status_message = "Invalid bank selected." });
                    }

                    existingSale.BankCode = bank.AccountCode;
                    existingSale.BankID = bank.Id;
                    existingSale.Date = saleBody.Date;
                    existingSale.Bank = saleBody.Bank;
                    existingSale.NominalAccount = saleBody.NominalAccount;
                    existingSale.RefNo = saleBody.RefNo;
                    existingSale.Mode = saleBody.Mode;
                    existingSale.Detail = saleBody.Detail;
                    existingSale.Amount = saleBody.Amount;
                    existingSale.IsActive = saleBody.IsActive;
                    existingSale.IsDeleted = saleBody.IsDeleted;
                    existingSale.UpdatedDate = DateTime.Now;

                    context.Entry(existingSale).State = EntityState.Modified;
                }

                await context.SaveChangesAsync();

                return Ok(new { bankPayments, status_code = 1, status_message = "Payment Updated Successfully." });
            }
            catch (Exception ex)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.", error = ex.Message });
            }
        }

        [HttpPatch]
        [Route("UpdateRecord")]
        public async Task<ActionResult<IEnumerable<BankReceipts>>> UpdateRecord(IEnumerable<BankReceipts> bankReceipts)
        {
            try
            {
                foreach (var saleBody in bankReceipts)
                {
                    var existingSale = await context.tblBankReceipts.FindAsync(saleBody.ID);
                    if (existingSale == null)
                    {
                        return Ok(new { status_message = $"Payment with ID {saleBody.ID} not found.", status_code = 0 });
                    }

                    var bank = await context.AccountMain.FirstOrDefaultAsync(a => a.AccountCode == saleBody.BankCode && a.CompanyId == saleBody.CompanyID);
                    if (bank == null)
                    {
                        return Ok(new { status_code = 0, status_message = "Invalid bank selected." });
                    }

                    existingSale.BankCode = bank.AccountCode;
                    existingSale.BankID = bank.Id;

                    existingSale.Date = saleBody.Date;
                    existingSale.Bank = saleBody.Bank;
                    existingSale.NominalAccount = saleBody.NominalAccount;
                    existingSale.RefNo = saleBody.RefNo;
                    existingSale.Mode = saleBody.Mode;
                    existingSale.Detail = saleBody.Detail;
                    existingSale.Amount = saleBody.Amount;
                    existingSale.IsActive = saleBody.IsActive;
                    existingSale.IsDeleted = saleBody.IsDeleted;
                    existingSale.UpdatedDate = DateTime.Now;

                    context.Entry(existingSale).State = EntityState.Modified;
                }

                await context.SaveChangesAsync();

                return Ok(new { bankReceipts, status_code = 1, status_message = "Receipt Updated Successfully." });
            }
            catch (Exception ex)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.", error = ex.Message });
            }
        }

        [HttpPatch]
        [Route("UpdateBankTransfer")]
        public async Task<ActionResult<IEnumerable<BankTransfers>>> UpdateBankTransfer(IEnumerable<BankTransfers> bankTransfers)
        {
            try
            {
                foreach (var saleBody in bankTransfers)
                {
                    var existingSale = await context.tblBankTransfers.FindAsync(saleBody.ID);
                    if (existingSale == null)
                    {
                        return Ok(new { status_message = $"Transfer with ID {saleBody.ID} not found.", status_code = 0 });
                    }

                    existingSale.Date = saleBody.Date;
                    existingSale.FromBank = saleBody.FromBank;
                    existingSale.ToBank = saleBody.ToBank;
                    existingSale.RefNo = saleBody.RefNo;
                    existingSale.Mode = saleBody.Mode;
                    existingSale.Detail = saleBody.Detail;
                    existingSale.Amount = saleBody.Amount;
                    existingSale.IsActive = saleBody.IsActive;
                    existingSale.IsDeleted = saleBody.IsDeleted;
                    existingSale.UpdatedDate = DateTime.Now;

                    context.Entry(existingSale).State = EntityState.Modified;
                }

                await context.SaveChangesAsync();

                return Ok(new { bankTransfers, status_code = 1, status_message = "Transfer Updated Successfully." });
            }
            catch (Exception ex)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.", error = ex.Message });
            }
        }

        [HttpPatch]
        [Route("UpdateJournalVoucher")]
        public async Task<ActionResult<IEnumerable<JournalVoucher>>> UpdateJournalVoucher(IEnumerable<JournalVoucher> journalVouchers)
        {
            try
            {
                foreach (var saleBody in journalVouchers)
                {
                    var existingSale = await context.tblJournalVoucher.FindAsync(saleBody.ID);
                    if (existingSale == null)
                    {
                        return Ok(new { status_message = $"Journal Voucher with ID {saleBody.ID} not found.", status_code = 0 });
                    }

                    existingSale.Date = saleBody.Date;
                    existingSale.FromAccount = saleBody.FromAccount;
                    existingSale.ToAccount = saleBody.ToAccount;
                    existingSale.ToAccountCode = saleBody.ToAccountCode;
                    existingSale.FromAccountCode = saleBody.FromAccountCode;
                    existingSale.RefNo = saleBody.RefNo;
                    existingSale.Mode = saleBody.Mode;
                    existingSale.Detail = saleBody.Detail;
                    existingSale.Amount = saleBody.Amount;
                    existingSale.IsActive = saleBody.IsActive;
                    existingSale.IsDeleted = saleBody.IsDeleted;
                    existingSale.UpdatedDate = DateTime.Now;

                    context.Entry(existingSale).State = EntityState.Modified;
                }

                await context.SaveChangesAsync();

                return Ok(new { journalVouchers, status_code = 1, status_message = "Journal Voucher Updated Successfully." });
            }
            catch (Exception ex)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.", error = ex.Message });
            }
        }

        [HttpPatch("DeletePayment")]
        public async Task<ActionResult<BankPayments>> UpdateAccount(GeneralRequest inParams)
        {
            try
            {
                var account = await context.tblBankPayments.FindAsync(inParams.ID);
                if (account == null)
                {
                    return Ok(new { status_message = $"Payment with ID {inParams.ID} not found.", status_code = 0 });
                }

                account.IsActive = false;
                account.IsDeleted = true;

                context.Entry(account).State = EntityState.Modified;
                await context.SaveChangesAsync();

                return Ok(new { account, status_message = "Payment Deleted Successfully.", status_code = 1 });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.", error = e.Message });
            }
        }

        [HttpPatch("DeleteReceipt")]
        public async Task<ActionResult<BankReceipts>> DeleteAccount(GeneralRequest inParams)
        {
            try
            {
                var account = await context.tblBankReceipts.FindAsync(inParams.ID);
                if (account == null)
                {
                    return Ok(new { status_message = $"Receipt with ID {inParams.ID} not found.", status_code = 0 });
                }

                account.IsActive = false;
                account.IsDeleted = true;

                context.Entry(account).State = EntityState.Modified;
                await context.SaveChangesAsync();

                return Ok(new { account, status_message = "Receipt Deleted Successfully.", status_code = 1 });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.", error = e.Message });
            }
        }

        [HttpPatch("DeleteBankTransfer")]
        public async Task<ActionResult<BankTransfers>> DeleteBank(GeneralRequest inParams)
        {
            try
            {
                var account = await context.tblBankTransfers.FindAsync(inParams.ID);
                if (account == null)
                {
                    return Ok(new { status_message = $"Transfer with ID {inParams.ID} not found.", status_code = 0 });
                }

                account.IsActive = false;
                account.IsDeleted = true;

                context.Entry(account).State = EntityState.Modified;
                await context.SaveChangesAsync();

                return Ok(new { account, status_message = "Transfer Deleted Successfully.", status_code = 1 });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.", error = e.Message });
            }
        }

        [HttpPatch("DeleteJournalVoucher/{id}")]
        public async Task<ActionResult<JournalVoucher>> DeleteJournalVoucher(int id, [FromBody] JournalVoucher accountMain)
        {
            try
            {
                var account = await context.tblJournalVoucher.FindAsync(id);
                if (account == null)
                {
                    return Ok(new { status_message = $"Journal Voucher with ID {id} not found.", status_code = 0 });
                }

                account.IsActive = accountMain.IsActive; // Set to false
                account.IsDeleted = accountMain.IsDeleted; // Set to true

                context.Entry(account).State = EntityState.Modified;
                await context.SaveChangesAsync();

                return Ok(new { account, status_message = "Journal Voucher Deleted Successfully.", status_code = 1 });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.", error = e.Message });
            }
        }

    }
}
