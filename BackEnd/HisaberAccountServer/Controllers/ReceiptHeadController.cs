using ExcelDataReader;
using HisaberAccountServer.Data;
using HisaberAccountServer.Models;
using HisaberAccountServer.Models.Sales;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualStudio.Web.CodeGenerators.Mvc.Templates.BlazorIdentity.Shared;
using System.Globalization;
using System.Text.RegularExpressions;

namespace HisaberAccountServer.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ReceiptHeadController : ControllerBase
    {
        private readonly HisaberDbContext context;
        public ReceiptHeadController(HisaberDbContext context)
        {
            this.context = context;
        }

        [HttpPost("AddReceiptHead")]
        public async Task<ActionResult<ReceiptHead>> AddReceiptHead(ReceiptHead receiptHead)
        {
            if (receiptHead == null)
            {
                return Ok(new { status_message = "Receipt data is null", status_code = 0 });
            }

            try
            {

                var lastReceipt = await context.tblReceiptHead
                   .Where(p => p.CompanyID == receiptHead.CompanyID)
                   .OrderByDescending(p => p.VoucherNo)
                   .FirstOrDefaultAsync();

                receiptHead.VoucherNo = lastReceipt != null
                    ? lastReceipt.VoucherNo + 1
                    : 1;

                await context.tblReceiptHead.AddAsync(receiptHead);
                await context.SaveChangesAsync();

                return Ok(new
                {
                    status_message = "Receipt added successfully.",
                    status_code = 1,
                    receiptHead
                });
            }
            catch (Exception e)
            {
                return Ok(new
                {
                    status_message = "Sorry! Something went wrong",
                    status_code = 0,
                    error = e.Message
                });
            }
        }

        [HttpPost("AddReceiptHeadArray")]
        public async Task<ActionResult<IEnumerable<ReceiptHead>>> AddReceiptArray(IEnumerable<ReceiptHead> receiptHeads)
        {
            if (!ModelState.IsValid)
            {
                return Ok(new { status_code = 0, status_message = "Receipt Data in Null." });
            }
            try
            {
                var nextVoucherNo = 1;
                if (receiptHeads.Any())
                {
                    var companyId = receiptHeads.First().CompanyID;
                    var lastSale = await context.tblReceiptHead
                        .Where(p => p.CompanyID == companyId)
                        .OrderByDescending(p => p.VoucherNo)
                        .FirstOrDefaultAsync();
                    nextVoucherNo = (int)(lastSale != null ? lastSale.VoucherNo + 1 : 1);
                }

                foreach (var sale in receiptHeads)
                {
                    sale.VoucherNo = nextVoucherNo++;
                }

                context.tblReceiptHead.AddRange(receiptHeads);

                await context.SaveChangesAsync();

                return Ok(new { receiptHeads, status_code = 1, status_message = "Receipt Added Successfully." });
            }
            catch (Exception e)
            {
                return Ok(new
                {
                    status_message = "Sorry! Something went wrong",
                    status_code = 0,
                    error = e.Message
                });
            }
        }

        [HttpGet("GetBy/{Companyid}")]
        public async Task<ActionResult> GetInvoices(
                 int Companyid,
                 bool? InComplete,
                 string orderBy = "",
                 string customerName = "",
                 string bank = "",
                 long voucherNo = 0,
                 string refNo = "",
                 string receiptType = "",
                 DateOnly? date = null,
                 int PageNumber = 1,
                 int PageSize = 10
                                    )
        {
            if (Companyid <= 0)
            {
                return Ok(new { status_code = 0, status_message = "Invalid Company ID." });
            }

            try
            {
                var query = context.tblReceiptHead
                    .Where(e => !e.IsDeleted && e.CompanyID == Companyid);

                if (InComplete.HasValue)
                {
                    query = query.Where(e => e.InComplete == InComplete.Value);
                }

                if (!string.IsNullOrWhiteSpace(customerName))
                {
                    query = query.Where(e => e.CustomerName.Contains(customerName));
                }

                if (!string.IsNullOrEmpty(bank))
                {
                    query = query.Where(e => e.Bank.StartsWith(bank));
                }

                if (!string.IsNullOrEmpty(refNo))
                {
                    query = query.Where(e => e.RefNo.StartsWith(refNo));
                }

                if (voucherNo > 0)
                {
                    query = query.Where(e => e.VoucherNo == voucherNo);
                }

                if (!string.IsNullOrWhiteSpace(receiptType))
                {
                    query = receiptType switch
                    {
                        "Receipt" => query.Where(e => e.ReceiptType == "Receipt"),
                        "Payment" => query.Where(e => e.ReceiptType == "Payment"),
                        "Return Receipt" => query.Where(e => e.ReceiptType == "Return Receipt"),
                        "Return Payment" => query.Where(e => e.ReceiptType == "Return Payment"),
                        _ => query
                    };
                }

                if (date != null)
                {
                    query = query.Where(e => e.Date == date.Value);
                }

                if (string.IsNullOrWhiteSpace(orderBy))
                {
                    query = query.OrderBy(e => e.CustomerName);
                }
                else
                {
                    switch (orderBy.ToLower())
                    {
                        case "customeraccountcode":
                            query = query.OrderBy(e => e.CustomerAccountCode);
                            break;
                        case "customername":
                            query = query.OrderBy(e => e.CustomerName);
                            break;
                    }
                }
                query = query.OrderByDescending(e => e.ID);

                var totalRecords = await query.CountAsync();

                var pagedData = await query
                    .Skip((PageNumber - 1) * PageSize)
                    .Take(PageSize)
                    .ToListAsync();

                if (pagedData.Count == 0)
                {
                    return Ok(new { status_code = 0, status_message = "No Receipt Found." });
                }

                return Ok(new
                {
                    listofSales = pagedData,
                    status_code = 1,
                    totalRecords = totalRecords,
                    currentPage = PageNumber,
                    pageSize = PageSize,
                    totalPages = (int)Math.Ceiling(totalRecords / (double)PageSize)
                });
            }
            catch (Exception e)
            {
                return Ok(new
                {
                    status_message = "Sorry! Something went wrong",
                    status_code = 0,
                    error = e.Message
                });
            }
        }


        [HttpGet("GetReceiptBy/{Companyid}")]
        public async Task<ActionResult> GetReceipts(
                int Companyid,
                string customerCode = "",
                string receiptType = "")
        {
            if (Companyid <= 0)
            {
                return Ok(new { status_code = 0, status_message = "Invalid Company ID." });
            }

            try
            {
                var query = context.tblReceiptHead
                    .Where(e => !e.IsDeleted && e.CompanyID == Companyid && e.UnAllocatedBalance > 0 && e.CustomerAccountCode == customerCode);

                if (!string.IsNullOrWhiteSpace(receiptType))
                {
                    query = receiptType.Equals("Receipt", StringComparison.OrdinalIgnoreCase)
                        ? query.Where(e => e.ReceiptType == "Receipt")
                        : query.Where(e => e.ReceiptType == "Payment");
                }

                query = query.OrderByDescending(e => e.ID);

                var data = await query.ToListAsync();

                if (data.Count == 0)
                {
                    return Ok(new { status_code = 0, status_message = "No Receipt Found." });
                }

                return Ok(new
                {
                    listofSales = data,
                    status_code = 1,
                    totalRecords = data.Count
                });
            }
            catch (Exception e)
            {
                return Ok(new
                {
                    status_message = "Sorry! Something went wrong",
                    status_code = 0,
                    error = e.Message
                });
            }
        }


        [HttpGet("GetReceiptHeadBy/{Voucher}/{CompanyID}")]
        public async Task<ActionResult<ReceiptHead>> GetRecord(int Voucher, int CompanyID)
        {
            try
            {
                var data = await context.tblReceiptHead.Where(e => e.IsDeleted == false && e.VoucherNo == Voucher && e.CompanyID == CompanyID).FirstOrDefaultAsync();
                if (data == null)
                {
                    return Ok(new { status_code = 0, status_message = "Receipt Not Found." });
                }
                return Ok(new { SaleHeadData = data, status_code = 1 });
            }
            catch (Exception e)
            {
                return Ok(new
                {
                    status_message = "Sorry! Something went wrong",
                    status_code = 0,
                    error = e.Message
                });
            }
        }

        [HttpPatch]
        [Route("UpdateRecord/{id}")]
        public async Task<ActionResult<ReceiptHead>> UpdateStudent(int id, ReceiptHead receiptHead)
        {
            try
            {
                if (id != receiptHead.ID)
                {
                    return Ok(new { status_code = 0, status_message = "Invalid ID" });
                }
                receiptHead.UpdatedDate = DateTime.Now;
                context.Entry(receiptHead).State = EntityState.Modified;
                await context.SaveChangesAsync();
                return Ok(new { receiptHead, status_code = 1, status_message = "Receipt Updated Successfully." });
            }
            catch (Exception e)
            {
                return Ok(new
                {
                    status_message = "Sorry! Something went wrong",
                    status_code = 0,
                    error = e.Message
                });
            }
        }

        [HttpPatch]
        [Route("UpdateRecords")]
        public async Task<ActionResult<IEnumerable<ReceiptHead>>> UpdateRecords(IEnumerable<ReceiptHead> receiptHeads)
        {
            try
            {
                foreach (var saleBody in receiptHeads)
                {
                    var existingSale = await context.tblReceiptHead.FindAsync(saleBody.ID);
                    if (existingSale == null)
                    {
                        return Ok(new { status_message = $"Receipt with ID {saleBody.ID} not found.", status_code = 0 });
                    }

                    existingSale.UnAllocatedBalance = saleBody.UnAllocatedBalance;
                    existingSale.Amount = saleBody.Amount;
                    existingSale.IsActive = saleBody.IsActive;
                    existingSale.IsDeleted = saleBody.IsDeleted;
                    existingSale.UpdatedDate = DateTime.Now;

                    context.Entry(existingSale).State = EntityState.Modified;
                }

                await context.SaveChangesAsync();

                return Ok(new { receiptHeads, status_code = 1, status_message = "Receipt Updated Successfully." });
            }
            catch (Exception e)
            {
                return Ok(new
                {
                    status_message = "Sorry! Something went wrong",
                    status_code = 0,
                    error = e.Message
                });
            }
        }

        [HttpGet("GetReceiptHeadDataBy/{Voucher}/{CompanyID}")]
        public async Task<ActionResult<ReceiptHead>> GetReceiptHeadDataBy(int Voucher, int CompanyID)
        {
            try
            {
                var data = await context.tblReceiptHead.Where(e => e.IsDeleted == false && e.VoucherNo == Voucher && e.CompanyID == CompanyID).ToListAsync();
                if (data == null)
                {
                    return Ok(new { status_code = 0, status_message = "Receipt Not Found." });
                }
                return Ok(new { SaleHeadData = data, status_code = 1 });
            }
            catch (Exception e)
            {
                return Ok(new
                {
                    status_message = "Sorry! Something went wrong",
                    status_code = 0,
                    error = e.Message
                });
            }
        }

        [HttpPost("UploadReceiptExcel/{companyId}")]
        public async Task<IActionResult> UploadReceiptExcelFile([FromForm] IFormFile file, int companyId)
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

                var lastVoucher = await context.tblReceiptHead
                    .Where(c => c.CompanyID == companyId)
                    .OrderByDescending(c => c.VoucherNo)
                    .FirstOrDefaultAsync();

                long nextAccountCode = lastVoucher != null ? lastVoucher.VoucherNo + 1 : 1;

                using (var stream = new FileStream(filePath, FileMode.Open, FileAccess.Read))
                {
                    using (var reader = ExcelReaderFactory.CreateReader(stream))
                    {
                        bool isHeaderSkipped = false;
                        while (reader.Read())
                        {
                            if (!isHeaderSkipped)
                            {
                                isHeaderSkipped = true;
                                continue;
                            }

                            var customerName = reader.GetValue(3)?.ToString();

                            if (string.IsNullOrWhiteSpace(customerName))
                            {
                                return Ok(new { status_message = "CustomerName is required for all rows.", status_code = 0 });
                            }

                            ReceiptHead receipt = new ReceiptHead
                            {
                                CompanyID = companyId,
                                Date = reader.IsDBNull(0) ? DateOnly.FromDateTime(DateTime.Now) : DateOnly.FromDateTime(ParseDate(reader.GetValue(0)?.ToString()) ?? DateTime.Now),
                                Bank = reader.GetValue(1)?.ToString() ?? "",
                                CustomerAccountCode = reader.GetValue(2)?.ToString() ?? "",
                                CustomerName = customerName,
                                ReceiptType = reader.GetValue(4)?.ToString() ?? "",
                                RefNo = reader.GetValue(5)?.ToString() ?? "",
                                Amount = ParseInt(reader.GetValue(6)?.ToString()) ?? 0,
                                Total = ParseInt(reader.GetValue(7)?.ToString()) ?? 0,
                                TotalOpenBalance = ParseInt(reader.GetValue(8)?.ToString()) ?? 0,
                                VoucherNo = nextAccountCode,
                                MailingAddress = "",
                                Mode = "Cash",
                                WHTRate = 0,
                                AdditionalWHT = 0,
                                UnAllocatedBalance = 0,
                                Notes = "",
                                TotalDiscount = 0,
                                TotalWHT = 0,
                                TotalReceipt = 0,
                                OverallDiscount = 0,
                                Field1 = "",
                                Field2 = "",
                                InvoiceNo = 0,
                                InComplete = false,
                                ReceiptBy = "Admin",
                                UpdatedDate = DateTime.Now,
                                CreatedDate = DateTime.Now,
                                IsActive = true,
                                IsDeleted = false,
                            };


                            nextAccountCode++;

                            var customer = await context.tblCustomerSupplier
                                .FirstOrDefaultAsync(c => c.AccountCode == receipt.CustomerAccountCode && c.CompanyID == companyId);

                            if (customer == null)
                            {
                                return Ok(new { status_message = $"Customer with account code {receipt.CustomerAccountCode} not found. First Add it.", status_code = 0 });
                            }

                            if (receipt.ReceiptType == "Receipt" || receipt.ReceiptType == "Return Payment")
                            {
                                customer.CustomerOpeningBalance -= receipt.Amount;
                            }
                            else if (receipt.ReceiptType == "Payment" || receipt.ReceiptType == "Return Receipt")
                            {
                                customer.CustomerOpeningBalance += receipt.Amount;
                            }

                            context.tblReceiptHead.Add(receipt);
                            context.tblCustomerSupplier.Update(customer);
                        }

                        var result = await context.SaveChangesAsync();
                        if (result <= 0)
                        {
                            return Ok(new
                            {
                                status_message = "Sorry! Something went wrong",
                                status_code = 0,
                            });
                        }
                    }
                }

                return Ok(new { status_message = "Successfully inserted", status_code = 0 });
            }
            catch (Exception e)
            {
                return Ok(new
                {
                    status_message = "Sorry! Something went wrong",
                    status_code = 0,
                    error = e.Message
                });
            }
        }


        private int? ParseInt(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return null;
            }

            // Use Regex to extract only numeric characters
            var numericValue = Regex.Replace(value, @"[^\d]", "");

            if (int.TryParse(numericValue, out int result))
            {
                return result;
            }

            return null;
        }

        private DateTime? ParseDate(string dateString)
        {
            if (string.IsNullOrWhiteSpace(dateString))
            {
                return null; // Return null for empty or whitespace strings
            }

            // Attempt to parse the date
            var formats = new[] { "dd/MM/yyyy", "MM/dd/yyyy", "yyyy-MM-dd" }; // Add other formats if needed
            if (DateTime.TryParseExact(dateString, formats, CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTime parsedDate))
            {
                return parsedDate; // Return the successfully parsed date
            }

            // Log or handle the case where parsing fails
            return null; // Return null if parsing fails
        }



    }
}
