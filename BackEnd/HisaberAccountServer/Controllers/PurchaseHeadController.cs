using HisaberAccountServer.Data;
using HisaberAccountServer.Models.Purchase;
using HisaberAccountServer.Models.Sales;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.Web.CodeGenerators.Mvc.Templates.BlazorIdentity.Shared;
using Microsoft.AspNetCore.Authorization;
using ExcelDataReader;

namespace HisaberAccountServer.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class PurchaseHeadController : ControllerBase
    {
        private readonly HisaberDbContext context;
        public PurchaseHeadController(HisaberDbContext context)
        {
            this.context = context;
        }

        [HttpPost("AddPurchaseHead")]
        public async Task<ActionResult<PurchaseHead>> PostPurchaseHead(PurchaseHead purchase)
        {
            if (purchase == null)
            {
                return Ok(new { status_message = "Purchase data is null", status_code = 0 });
            }

            try
            {

                var lastPurchase = await context.tblPurchaseHead
                    .Where(p => p.CompanyID == purchase.CompanyID)
                    .OrderByDescending(p => p.BillID)
                    .FirstOrDefaultAsync();


                purchase.BillID = lastPurchase != null
                    ? lastPurchase.BillID + 1
                    : 1;

                await context.tblPurchaseHead.AddAsync(purchase);
                await context.SaveChangesAsync();

                return Ok(new
                {
                    status_message = "Purchase added successfully.",
                    status_code = 1,
                    purchase
                });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.", e.Message });
            }
        }

        [HttpGet("GetBy/{Companyid}")]
        public async Task<ActionResult> GetBills(
          int Companyid,
          bool? InComplete,
          int PageNumber = 1,
          int PageSize = 250,
          string orderBy = "",
          string supplierName = "",
          long billId = 0,
          string purchaseType = "",
          DateOnly? date = null)
        {
            if (Companyid <= 0)
            {
                return Ok(new { status_code = 0, status_message = "Invalid Company ID." });
            }

            try
            {
                var query = context.tblPurchaseHead
                    .Where(e => !e.IsDeleted && e.CompanyID == Companyid);

                if (InComplete.HasValue)
                {
                    query = query.Where(e => e.InComplete == InComplete.Value);
                }

                if (!string.IsNullOrWhiteSpace(supplierName))
                {
                    query = query.Where(e => e.SupplierName.Contains(supplierName));
                }

                if (billId > 0)
                {
                    query = query.Where(e => e.BillID == billId);
                }

                if (!string.IsNullOrWhiteSpace(purchaseType))
                {
                    query = purchaseType.Equals("Credit", StringComparison.OrdinalIgnoreCase)
                        ? query.Where(e => e.PurchaseType == "Credit")
                        : query.Where(e => e.PurchaseType == "Bill");
                }

                if (date != null)
                {
                    query = query.Where(e => e.Date == date.Value);
                }

                // Apply sorting
                switch (orderBy.ToLower())
                {
                    case "supplieraccountcode":
                        query = query.OrderBy(e => e.SupplierAccountCode);
                        break;
                    case "suppliername":
                        query = query.OrderBy(e => e.SupplierName);
                        break;
                    default:
                        query = query.OrderByDescending(e => e.ID);
                        break;
                }

                var totalRecords = await query.CountAsync();

                var pagedData = await query
                    .Skip((PageNumber - 1) * PageSize)
                    .Take(PageSize)
                    .ToListAsync();

                if (pagedData.Count == 0)
                {
                    return Ok(new { status_code = 0, status_message = "No Purchases Found." });
                }

                return Ok(new
                {
                    listofPurchases = pagedData,
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


        [HttpPost("AddPurchaseHeadArray")]
        public async Task<ActionResult<IEnumerable<PurchaseHead>>> AddPurArray(IEnumerable<PurchaseHead> purchaseBodies)
        {
            if (!ModelState.IsValid)
            {
                return Ok(new { status_code = 0, status_message = "Data is Null." });
            }
            try
            {
                var heads = purchaseBodies?.ToList() ?? new List<PurchaseHead>();
                if (heads.Count == 0)
                {
                    return Ok(new { status_code = 0, status_message = "No purchase records provided." });
                }

                // Assign sequential BillID per CompanyID, continuing from the last BillID in DB
                var companyIds = heads.Select(h => h.CompanyID).Distinct();
                foreach (var companyId in companyIds)
                {
                    var lastPurchase = await context.tblPurchaseHead
                        .Where(p => p.CompanyID == companyId)
                        .OrderByDescending(p => p.BillID)
                        .FirstOrDefaultAsync();

                    long nextBillId = lastPurchase != null ? lastPurchase.BillID + 1 : 1;

                    foreach (var head in heads.Where(h => h.CompanyID == companyId))
                    {
                        head.BillID = nextBillId++;
                        head.UpdatedDate = DateTime.Now;
                        if (head.CreatedDate == default)
                        {
                            head.CreatedDate = DateTime.Now;
                        }
                    }
                }

                context.tblPurchaseHead.AddRange(heads);

                await context.SaveChangesAsync();

                return Ok(new { purchaseBodies = heads, status_code = 1, status_message = "Purchase Added Successfully." });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.", e.Message });
            }
        }

        [HttpPatch]
        [Route("UpdateRecord/{id}")]
        public async Task<ActionResult<PurchaseHead>> UpdateStudent(int id, PurchaseHead purchaseHead)
        {
            try
            {
                if (id != purchaseHead.ID)
                {
                    return Ok(new { status_code = 0, status_message = "Invalid ID." });
                }
                purchaseHead.UpdatedDate = DateTime.Now;
                context.Entry(purchaseHead).State = EntityState.Modified;
                await context.SaveChangesAsync();
                return Ok(new { purchaseHead, status_code = 1, status_message = "Purchase Updated Successfully." });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.", e.Message });
            }
        }

        [HttpGet("GetByBalance/{Companyid}")]
        public async Task<ActionResult> GetByBalance(
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
                var query = context.tblPurchaseHead
                    .Where(e => !e.IsDeleted && e.CompanyID == Companyid && e.Balance > 0 && e.SupplierAccountCode == supplierCode);


                if (!string.IsNullOrWhiteSpace(purchaseType))
                {
                    query = purchaseType.Equals("Credit", StringComparison.OrdinalIgnoreCase)
                        ? query.Where(e => e.PurchaseType == "Credit")
                        : query.Where(e => e.PurchaseType == "Bill");
                }
                query = query.OrderBy(e => e.Date);
                var data = await query.ToListAsync();

                if (data.Count == 0)
                {
                    return Ok(new { status_code = 0, status_message = "No Purchase Found." });
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

        [HttpGet("GetPurchaseHeadBy/{BillId}/{CompanyID}")]
        public async Task<ActionResult<PurchaseHead>> GetRecord(int BillId, int CompanyID)
        {
            try
            {
                var data = await context.tblPurchaseHead.Where(e => e.IsDeleted == false && e.BillID == BillId && e.CompanyID == CompanyID).FirstOrDefaultAsync();
                if (data == null)
                {
                    return Ok(new { status_code = 0, status_message = "Purchase Not Found." });
                }
                return Ok(new { PurchaseHeadData = data, status_code = 1, status_message = "Purchase Found Successfully." });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.", e.Message });
            }
        }

        [HttpPatch]
        [Route("UpdateRecords/{BillID}/{CompanyID}")]
        public async Task<ActionResult<IEnumerable<PurchaseHead>>> UpdateRecords(long BillID, int CompanyID, IEnumerable<PurchaseHead> Sale)
        {
            try
            {
                foreach (var saleBody in Sale)
                {
                    var existingSale = await context.tblPurchaseHead.FirstOrDefaultAsync(e => e.BillID == BillID && e.CompanyID == CompanyID);
                    if (existingSale == null)
                    {
                        return Ok(new { status_message = $"Purchase with BillID {BillID} not found.", status_code = 0 });
                    }

                    existingSale.Balance = saleBody.Balance;
                    existingSale.UpdatedDate = DateTime.Now;

                    context.Entry(existingSale).State = EntityState.Modified;
                }

                await context.SaveChangesAsync();

                return Ok(new { Sale, status_code = 1, status_message = "Purchase Updated Successfully." });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.", e.Message });
            }
        }

        [HttpPatch]
        [Route("UpdateRecords")]
        public async Task<ActionResult<IEnumerable<PurchaseHead>>> UpdateRecord(IEnumerable<PurchaseHead> Sale)
        {
            try
            {
                foreach (var saleBody in Sale)
                {
                    var existingSale = await context.tblPurchaseHead.FindAsync(saleBody.ID);
                    if (existingSale == null)
                    {
                        return Ok(new { status_message = $"Purchase with ID {saleBody.ID} not found.", status_code = 0 });
                    }

                    existingSale.Balance = saleBody.Balance;
                    existingSale.UpdatedDate = DateTime.Now;

                    context.Entry(existingSale).State = EntityState.Modified;
                }

                await context.SaveChangesAsync();

                return Ok(new { Sale, status_code = 1, status_message = "Purchase Updated Successfully." });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.", e.Message });
            }
        }

        [HttpGet("GetPurchaseHeadDataBy/{BillId}/{CompanyID}")]
        public async Task<ActionResult<PurchaseHead>> GetPurchaseHeadDataBy(int BillId, int CompanyID)
        {
            try
            {
                var data = await context.tblPurchaseHead.Where(e => e.IsDeleted == false && e.BillID == BillId && e.CompanyID == CompanyID).ToListAsync();
                if (data == null)
                {
                    return Ok(new { status_code = 0, status_message = "Purchase Not Found." });
                }
                return Ok(new { PurchaseHeadData = data, status_code = 1 });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.", e.Message });
            }
        }


        [HttpPost("UploadPurchaseExcel/{companyId}")]
        public async Task<IActionResult> UploadPurchaseExcelFile([FromForm] IFormFile file, int companyId)
        {
            try
            {
                System.Text.Encoding.RegisterProvider(System.Text.CodePagesEncodingProvider.Instance);

                if (file == null || file.Length == 0)
                {
                    return Ok(new { status_code = 0, status_message = "No file uploaded" });
                }

                // Set up the file path and save the file
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

                var bill = await context.tblPurchaseHead
                    .Where(c => c.CompanyID == companyId)
                    .ToListAsync();

                var lastbill = bill
                    .OrderByDescending(c => (c.BillID))
                    .FirstOrDefault();

                long nextAccountCode = lastbill != null
                    ? (lastbill.BillID) + 1
                    : 1;

                // Process the file
                using (var stream = new FileStream(filePath, FileMode.Open, FileAccess.Read))
                {
                    using (var reader = ExcelReaderFactory.CreateReader(stream))
                    {
                        bool isHeaderSkipped = false;
                        while (reader.Read())
                        {
                            // Skip header row
                            if (!isHeaderSkipped)
                            {
                                isHeaderSkipped = true;
                                continue;
                            }

                            var supplierName = reader.GetValue(0)?.ToString();

                            if (string.IsNullOrWhiteSpace(supplierName))
                            {
                                return Ok(new { status_code = 0, status_message = "SupplierName is required for all rows." });
                            }

                            PurchaseHead purchase = new PurchaseHead
                            {
                                CompanyID = companyId,
                                Date = reader.IsDBNull(1)
                                    ? DateOnly.FromDateTime(DateTime.Now)
                                    : DateOnly.FromDateTime(ConvertExcelValueToDate(reader.GetValue(1))),
                                DueDate = reader.IsDBNull(1)
                                    ? DateOnly.FromDateTime(DateTime.Now)
                                    : DateOnly.FromDateTime(ConvertExcelValueToDate(reader.GetValue(1))),
                                SupplierAccountCode = reader.GetValue(2)?.ToString(),
                                PurchaseType = reader.GetValue(3)?.ToString(),
                                Total = Convert.ToInt32(reader.GetValue(8)),
                                BillID = nextAccountCode,
                                SupplierName = supplierName,
                                Notes = reader.GetValue(9)?.ToString() ?? "",
                                Address = "",
                                TermDays = 0,
                                BillNumber = "",
                                CreditLimit = 0,
                                Balance = 0,
                                SubTotal = 0,
                                TotalDiscount = 0,
                                TotalSaleTax = 0,
                                Field1 = "",
                                Field2 = "",
                                Field3 = "",
                                Field4 = "",
                                AdjustedBalance = 0,
                                InComplete = false,
                                PurchaseBy = "Admin",
                                UpdatedDate = DateTime.Now,
                                CreatedDate = DateTime.Now,
                                IsActive = true,
                                IsDeleted = false,
                            };

                            // Create a new SaleBody instance
                            PurchaseBody purchaseBody = new PurchaseBody
                            {
                                CompanyID = companyId,
                                Product = reader.GetValue(4)?.ToString(),
                                Unit = reader.GetValue(5)?.ToString() ?? "N/A",
                                Quantity = Convert.ToInt32(reader.GetValue(6)),
                                Rate = Convert.ToDecimal(reader.GetValue(7)),
                                Amount = Convert.ToDecimal(reader.GetValue(8)),
                                PurchaseType = reader.GetValue(3)?.ToString(),
                                BillID = (int)nextAccountCode,
                                Description = reader.GetValue(4)?.ToString(),
                                Net = Convert.ToDecimal(reader.GetValue(8)),
                                Discount = 0,
                                SaleTax = 0,
                                DiscPercentege = 0,
                                TaxRate = "",
                                Field1 = "",
                                Length = 0,
                                Weight = 0,
                                DefaultUnit = "Quantity",
                                InComplete = false,
                                PurchaseBy = "Admin",
                                UpdatedDate = DateTime.Now,
                                CreatedDate = DateTime.Now,
                                IsActive = true,
                                IsDeleted = false,
                            };

                            nextAccountCode++;

                            context.tblPurchaseHead.Add(purchase);
                            context.tblPurchaseBody.Add(purchaseBody);

                            var supplier = await context.tblCustomerSupplier
                                .FirstOrDefaultAsync(c => c.AccountCode == purchase.SupplierAccountCode && c.CompanyID == companyId);

                            if (supplier != null)
                            {
                                if (purchase.PurchaseType == "Bill")
                                {
                                    supplier.SupplierOpeningBalance = (supplier.SupplierOpeningBalance) + (decimal)purchase.Total;
                                }
                                else if (purchase.PurchaseType == "Credit")
                                {
                                    supplier.SupplierOpeningBalance = (supplier.SupplierOpeningBalance) - (decimal)purchase.Total;
                                }

                                context.tblCustomerSupplier.Update(supplier);
                            }
                            else
                            {
                                return Ok(new { status_code = 0, status_message = $"Supplier with account code {purchase.SupplierAccountCode} not found." });
                            }

                            var product = await context.tblProducts
                                .FirstOrDefaultAsync(p => p.Name == purchaseBody.Product && p.CompanyID == companyId);

                            if (product != null)
                            {
                                product.OpeningQuantity = product.OpeningQuantity + (purchaseBody.Quantity ?? 0);

                                context.tblProducts.Update(product);
                            }
                            else
                            {
                                return Ok(new { status_code = 0, status_message = $"Product {purchaseBody.Product} not found. First Add it." });
                            }
                        }

                        var result = await context.SaveChangesAsync();
                    }
                }

                return Ok(new { status_code = 1, status_message = "Successfully inserted" });
            }
            catch (Exception e)
            {
                return Ok(new { status_message = "Sorry! Something went wrong", status_code = 0 });
            }
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
