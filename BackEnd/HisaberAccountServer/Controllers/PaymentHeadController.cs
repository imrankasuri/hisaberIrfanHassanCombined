using ExcelDataReader;
using HisaberAccountServer.Data;
using HisaberAccountServer.Models.Purchase;
using HisaberAccountServer.Models.Sales;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using System.Text.RegularExpressions;

namespace HisaberAccountServer.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentHeadController : ControllerBase
    {
        private readonly HisaberDbContext context;
        public PaymentHeadController(HisaberDbContext context)
        {
            this.context = context;
        }

        [HttpPost("AddPaymentHead")]
        public async Task<ActionResult<PaymentHead>> PostOpeningBal(PaymentHead paymentHead)
        {
            if (paymentHead == null)
            {
                return Ok(new { status_message = "Payment Data is null", status_code = 0 });
            }

            try
            {

                var lastReceipt = await context.tblPaymentHead
                   .Where(p => p.CompanyID == paymentHead.CompanyID)
                   .OrderByDescending(p => p.VoucherNo)
                   .FirstOrDefaultAsync();

                paymentHead.VoucherNo = lastReceipt != null
                    ? lastReceipt.VoucherNo + 1
                    : 1;

                await context.tblPaymentHead.AddAsync(paymentHead);
                await context.SaveChangesAsync();

                return Ok(new
                {
                    status_message = "Payment added successfully.",
                    status_code = 1,
                    paymentHead
                });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.", e.Message });
            }
        }

        [HttpPost("AddPaymentHeadArray")]
        public async Task<ActionResult<IEnumerable<PaymentHead>>> AddReceiptArray(IEnumerable<PaymentHead> paymentHeads)
        {
            if (!ModelState.IsValid)
            {
                return Ok(new { status_code = 0, status_message = "Not Found." });
            }
            try
            {
                var nextVoucherNo = 1;
                if (paymentHeads.Any())
                {
                    var companyId = paymentHeads.First().CompanyID;
                    var lastSale = await context.tblPaymentHead
                        .Where(p => p.CompanyID == companyId)
                        .OrderByDescending(p => p.VoucherNo)
                        .FirstOrDefaultAsync();
                    nextVoucherNo = (int)(lastSale != null ? lastSale.VoucherNo + 1 : 1);
                }

                foreach (var sale in paymentHeads)
                {
                    sale.VoucherNo = nextVoucherNo++;
                }

                context.tblPaymentHead.AddRange(paymentHeads);

                await context.SaveChangesAsync();

                return Ok(new
                {
                    paymentHeads,
                    status_code = 1,
                    status_message = "Payment added successfully.",
                });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.", e.Message });
            }
        }

        [HttpGet("GetBy/{Companyid}")]
        public async Task<ActionResult> GetInvoices(
                                                     int Companyid,
                                                     bool? InComplete,
                                                     string orderBy = "",
                                                     string supplierName = "",
                                                     string bank = "",
                                                     long voucherNo = 0,
                                                     string refNo = "",
                                                     string paymentType = "",
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
                var query = context.tblPaymentHead
                    .Where(e => !e.IsDeleted && e.CompanyID == Companyid);

                if (InComplete.HasValue)
                {
                    query = query.Where(e => e.InComplete == InComplete.Value);
                }

                if (!string.IsNullOrWhiteSpace(supplierName))
                {
                    query = query.Where(e => e.SupplierName.Contains(supplierName));
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

                if (!string.IsNullOrWhiteSpace(paymentType))
                {
                    query = paymentType switch
                    {
                        "Receipt" => query.Where(e => e.PurchaseType == "Receipt"),
                        "Payment" => query.Where(e => e.PurchaseType == "Payment"),
                        "Return Receipt" => query.Where(e => e.PurchaseType == "Return Receipt"),
                        "Return Payment" => query.Where(e => e.PurchaseType == "Return Payment"),
                        _ => query
                    };
                }

                if (date != null)
                {
                    query = query.Where(e => e.Date == date.Value);
                }

                if (string.IsNullOrWhiteSpace(orderBy))
                {
                    query = query.OrderBy(e => e.SupplierName); // Default sorting
                }
                else
                {
                    switch (orderBy.ToLower())
                    {
                        case "supplieraccountcode":
                            query = query.OrderBy(e => e.SupplierAccountCode);
                            break;
                        case "suppliername":
                            query = query.OrderBy(e => e.SupplierName);
                            break;
                    }
                }

                query = query.OrderByDescending(e => e.ID);

                var totalRecords = await query.CountAsync();

                var pagedData = await query
                    .Skip((PageNumber - 1) * PageSize)  // Skip the records for previous pages
                    .Take(PageSize)                    // Take the records for the current page
                    .ToListAsync();

                if (pagedData.Count == 0)
                {
                    return Ok(new { status_code = 0, status_message = "No Payments Found." });
                }

                return Ok(new
                {
                    listofPayments = pagedData,
                    status_code = 1,
                    totalRecords = totalRecords,
                    currentPage = PageNumber,
                    pageSize = PageSize,
                    totalPages = (int)Math.Ceiling(totalRecords / (double)PageSize)
                });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.", e.Message });
            }
        }


        [HttpGet("GetPaymentBy/{Companyid}")]
        public async Task<ActionResult> GetReceipts(
                int Companyid,
                string supplierCode = "",
                string purchaseType = "")
        {
            if (Companyid <= 0)
            {
                return Ok(new { status_code = 0, status_message = "Invalid Company ID." });
            }

            try
            {
                var query = context.tblPaymentHead
                    .Where(e => !e.IsDeleted && e.CompanyID == Companyid && e.UnAllocatedBalance > 0 && e.SupplierAccountCode == supplierCode);


                if (!string.IsNullOrWhiteSpace(purchaseType))
                {
                    query = purchaseType.Equals("Payment", StringComparison.OrdinalIgnoreCase)
                         ? query.Where(e => e.PurchaseType == "Payment")
                         : query.Where(e => e.PurchaseType == "Receipt");
                }

                query = query.OrderByDescending(e => e.ID);
                var data = await query.ToListAsync();

                if (data.Count == 0)
                {
                    return Ok(new { status_code = 0, status_message = "No Payments Found." });
                }

                return Ok(new
                {
                    listofPurchases = data,
                    status_code = 1,
                    totalRecords = data.Count
                });
            }
            catch (Exception e)
            {

                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.", e.Message });
            }
        }


        [HttpGet("GetPaymentHeadBy/{Voucher}/{CompanyID}")]
        public async Task<ActionResult<PaymentHead>> GetRecord(int Voucher, int CompanyID)
        {
            try
            {
                var data = await context.tblPaymentHead.Where(e => e.IsDeleted == false && e.VoucherNo == Voucher && e.CompanyID == CompanyID).FirstOrDefaultAsync();
                if (data == null)
                {
                    return Ok(new { status_code = 0, status_message = "Payment Not Found." });
                }
                return Ok(new { PaymentHeadData = data, status_code = 1 });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.", e.Message });
            }
        }

        [HttpPatch]
        [Route("UpdateRecord/{id}")]
        public async Task<ActionResult<PaymentHead>> UpdateStudent(int id, PaymentHead paymentHead)
        {
            try
            {
                if (id != paymentHead.ID)
                {
                    return Ok(new { status_code = 0, status_message = "Record Not Found." });
                }
                paymentHead.UpdatedDate = DateTime.Now;
                context.Entry(paymentHead).State = EntityState.Modified;
                await context.SaveChangesAsync();
                return Ok(new { paymentHead, status_code = 1, status_message = "Payment Updated Successfully." });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.", e.Message });
            }
        }

        [HttpPatch]
        [Route("UpdateRecords")]
        public async Task<ActionResult<IEnumerable<PaymentHead>>> UpdateRecords(IEnumerable<PaymentHead> paymentHeads)
        {
            try
            {
                foreach (var saleBody in paymentHeads)
                {
                    var existingSale = await context.tblPaymentHead.FindAsync(saleBody.ID);
                    if (existingSale == null)
                    {
                        return Ok(new { status_message = $"Payment with ID {saleBody.ID} not found.", status_code = 0 });
                    }

                    existingSale.UnAllocatedBalance = saleBody.UnAllocatedBalance;
                    existingSale.Amount = saleBody.Amount;
                    existingSale.IsActive = saleBody.IsActive;
                    existingSale.IsDeleted = saleBody.IsDeleted;
                    existingSale.UpdatedDate = DateTime.Now;

                    context.Entry(existingSale).State = EntityState.Modified;
                }

                await context.SaveChangesAsync();

                return Ok(new { paymentHeads, status_code = 1, status_message = "Payments Updated Successfully." });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.", e.Message });
            }
        }

        [HttpGet("GetPaymentHeadDataBy/{Voucher}/{CompanyID}")]
        public async Task<ActionResult<PaymentHead>> GetReceiptHeadDataBy(int Voucher, int CompanyID)
        {
            try
            {
                var data = await context.tblPaymentHead.Where(e => e.IsDeleted == false && e.VoucherNo == Voucher && e.CompanyID == CompanyID).ToListAsync();
                if (data == null)
                {
                    return Ok(new { status_code = 0, status_message = "Payment Not Found." });
                }
                return Ok(new { paymentHeadData = data, status_code = 1 });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.", e.Message });
            }
        }

        [HttpPost("UploadPaymentExcel/{companyId}")]
        public async Task<IActionResult> UploadPaymentExcelFile([FromForm] IFormFile file, int companyId)
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

                var lastVoucher = await context.tblPaymentHead
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

                            var supplierName = reader.GetValue(3)?.ToString();

                            if (string.IsNullOrWhiteSpace(supplierName))
                            {
                                return Ok(new { status_message = "SupplierName is required for all rows.", status_code = 0 });
                            }

                            PaymentHead payment = new PaymentHead
                            {
                                CompanyID = companyId,
                                Date = reader.IsDBNull(0)
                                    ? DateOnly.FromDateTime(DateTime.Now)
                                    : DateOnly.FromDateTime(ConvertExcelValueToDate(reader.GetValue(0))),
                                Bank = reader.GetValue(1)?.ToString() ?? "",
                                SupplierAccountCode = reader.GetValue(2)?.ToString() ?? "",
                                SupplierName = supplierName,
                                PurchaseType = reader.GetValue(4)?.ToString() ?? "",
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
                                TotalPayment = 0,
                                OverallDiscount = 0,
                                Field1 = "",
                                Field2 = "",
                                BillID = 0,
                                InComplete = false,
                                PurchaseBy = "Admin",
                                UpdatedDate = DateTime.Now,
                                CreatedDate = DateTime.Now,
                                IsActive = true,
                                IsDeleted = false,
                            };


                            nextAccountCode++;

                            var supplier = await context.tblCustomerSupplier
                                .FirstOrDefaultAsync(c => c.AccountCode == payment.SupplierAccountCode && c.CompanyID == companyId);

                            if (supplier == null)
                            {
                                return Ok(new { status_message = $"Customer with account code {payment.SupplierAccountCode} not found. First Add it.", status_code = 0 });
                            }

                            if (payment.PurchaseType == "Receipt" || payment.PurchaseType == "Return Payment")
                            {
                                supplier.SupplierOpeningBalance += payment.Amount;
                            }
                            else if (payment.PurchaseType == "Payment" || payment.PurchaseType == "Return Receipt")
                            {
                                supplier.SupplierOpeningBalance -= payment.Amount;
                            }

                            context.tblPaymentHead.Add(payment);
                            context.tblCustomerSupplier.Update(supplier);
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

                return Ok(new { status_message = "Successfully inserted", status_code = 1 });
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

        private DateTime ConvertExcelValueToDate(object value)
        {
            if (value is DateTime dateTimeValue)
            {
                return dateTimeValue;  // If it's already a DateTime, return it
            }
            if (double.TryParse(value?.ToString(), out double oaDateValue))
            {
                // Excel stores dates as OLE Automation Dates (floating-point numbers).
                // Convert that to DateTime.
                return DateTime.FromOADate(oaDateValue);
            }
            if (DateTime.TryParse(value?.ToString(), out DateTime parsedDate))
            {
                return parsedDate;  // Try parsing the string into a DateTime
            }

            // Default to current date if parsing fails
            return DateTime.Now;
        }
    }
}
