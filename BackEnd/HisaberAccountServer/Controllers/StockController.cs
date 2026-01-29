using HisaberAccountServer.Data;
using HisaberAccountServer.Models;
using HisaberAccountServer.Models.Sales;
using HisaberAccountServer.Models.StockAdjust;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualStudio.Web.CodeGenerators.Mvc.Templates.BlazorIdentity.Shared;

namespace HisaberAccountServer.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class StockController : ControllerBase
    {
        private readonly HisaberDbContext context;
        private readonly UserManager<ApplicationUser> userManager;
        public StockController(HisaberDbContext context, UserManager<ApplicationUser> userManager)
        {
            this.context = context;
            this.userManager = userManager;
        }

        [HttpPost("AddStock")]
        public async Task<IActionResult> AddStock([FromBody] StockDTO inParams)
        {
            if (inParams == null)
            {
                return Ok(new { status_message = "Invoice data is null", status_code = 0 });
            }

            try
            {

                int referenceID = 0;

                var stockHead = inParams.StockHead;
                if (stockHead == null)
                {
                    return Ok(new { status_message = "Please enter valid invoice data.", status_code = 0 });
                }

                var stockBody = inParams.StockBody;
                if (stockBody == null || stockBody.Count < 1)
                {
                    return Ok(new { status_message = "Please add at least one product.", status_code = 0 });
                }


                // Generate Invoice Number
                var lastStock = await context.tblStockAdjustHead
                    .Where(p => p.CompanyID == stockHead.CompanyID)
                    .OrderByDescending(p => p.InvoiceNo)
                    .FirstOrDefaultAsync();

                stockHead.InvoiceNo = (lastStock?.InvoiceNo ?? 0) + 1;
                stockHead.CreatedDate = DateTime.Now;
                stockHead.UpdatedDate = DateTime.Now;
                referenceID = (int)(lastStock?.InvoiceNo ?? 0) + 1;

                // Add Invoice Data
                foreach (var sb in stockBody)
                {
                    sb.InvoiceNo = referenceID;
                    sb.CreatedDate = DateTime.Now;
                    sb.UpdatedDate = DateTime.Now;
                }
                await context.tblStockAdjustHead.AddAsync(stockHead);
                await context.tblStockAdjustBody.AddRangeAsync(stockBody);


                // Fetch Products and Update Quantities
                var productIds = stockBody.Select(sb => sb.ProductCode).Distinct().Cast<long>();
                var products = await context.tblProducts
                    .Where(p => productIds.Contains(p.Code) && p.CompanyID == stockHead.CompanyID && p.IsActive == true)
                    .ToDictionaryAsync(p => p.Code);

                foreach (var sb in stockBody)
                {

                    if (products.TryGetValue(sb.ProductCode, out var product) && product.CompanyID == sb.CompanyID)
                    {
                        var quantityToDeduct = sb.DefaultUnit switch
                        {
                            "Quantity" => sb.Quantity,
                            "Weight" => sb.Weight,
                            "Length" => sb.Length,
                            _ => 0
                        };
                        if (sb.AdjustType == "Out")
                        {
                            product.OpeningQuantity -= quantityToDeduct;
                        }
                        else
                        {
                            product.OpeningQuantity += quantityToDeduct;
                        }
                        product.UpdatedDate = DateTime.Now;
                    }
                }

                await context.SaveChangesAsync();

                return Ok(new
                {
                    status_message = "Stock added successfully.",
                    status_code = 1,
                    Stock = inParams.StockHead,
                    Invoice = referenceID
                });
            }
            catch (Exception e)
            {
                return Ok(new
                {
                    status_message = "Sorry! Something went wrong.",
                    status_code = 0,
                    error = e.Message
                });
            }
        }

        [HttpPost("GetStocks")]
        public async Task<ActionResult> GetStocks([FromBody] GeneralRequest inParams)
        {
            int Companyid = inParams.CompanyID;
            string accountCode = inParams.AccountCode ?? string.Empty;
            string stockType = inParams.Type ?? string.Empty;
            int pageSize = inParams.PageSize;
            int pageNumber = inParams.PageNo;

            if (Companyid <= 0)
            {
                return Ok(new { status_code = 0, status_message = "Invalid Company ID." });
            }

            try
            {
                var query = context.tblStockAdjustHead
                .Where(e => !e.IsDeleted && e.CompanyID == Companyid && e.InvoiceNo > 0);


                if (accountCode != "")
                {
                    query = query.Where(e => e.AccountCode == accountCode);
                }

                if (!string.IsNullOrWhiteSpace(stockType))
                {
                    query = stockType.Equals("In", StringComparison.OrdinalIgnoreCase)
                        ? query.Where(e => e.AdjustType == "In")
                        : query.Where(e => e.AdjustType == "Out");
                }

                if (inParams.Date != null)
                {
                    query = query.Where(e => e.Date == inParams.Date.Value);
                }

                query = query.OrderByDescending(p => p.InvoiceNo);

                var totalRecords = await query.CountAsync();
                var totalPages = (int)Math.Ceiling(totalRecords / (double)pageSize);
                var paginatedData = await query
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                if (paginatedData.Count == 0)
                {
                    return Ok(new { status_code = 0, status_message = "No Sales Found." });
                }

                return Ok(new
                {
                    listOfStocks = paginatedData,
                    status_code = 1,
                    totalRecords,
                    totalPages,
                    pageNumber,
                    pageSize
                });
            }
            catch (Exception ex)
            {
                return Ok(new { status_message = "Sorry! Something went wrong", status_code = 0, error = ex.Message });

            }
        }

        [HttpPost("GetStockDataForEdit")]
        public async Task<ActionResult> GetStockDataForEdit([FromBody] GeneralRequest inParams)
        {
            int Companyid = inParams.CompanyID;
            int ID = inParams.ID;
            if (Companyid <= 0)
            {
                return Ok(new { status_code = 0, status_message = "Invalid Company ID." });
            }

            try
            {
                var stockHead = await context.tblStockAdjustHead
                .Where(a => a.CompanyID == Companyid && a.InvoiceNo == ID && a.IsActive == true).FirstOrDefaultAsync();

                if (stockHead == null)
                {
                    return Ok(new
                    {
                        status_code = 0,
                        SaleHead = stockHead,
                        status_message = "Stock Data not found."
                    });
                }
                ;
                var listofStockBody = await context.tblStockAdjustBody.Where(a => a.CompanyID == Companyid && a.InvoiceNo == ID && a.IsActive == true).ToListAsync();

                var user = await userManager.FindByIdAsync(stockHead.UserID ?? string.Empty);
                if (user == null)
                {
                    //return Ok(new
                    //{
                    //    status_code = 0,
                    //    status_message = "User not found."
                    //});
                }

                return Ok(new
                {
                    status_code = 1,
                    StockHead = stockHead,
                    listofStockBody = listofStockBody,
                    User = user != null ? user.FullName : stockHead.AdjustBy,
                    status_message = "Successfully returning Stocks data."
                });
            }
            catch (Exception ex)
            {
                return Ok(new
                {
                    status_message = "Sorry! Something went wrong",
                    status_code = 0,
                    error = ex.Message
                });
            }
        }

        [HttpPatch("EditStock")]
        public async Task<IActionResult> EditStock([FromBody] StockDTO inParams)
        {
            if (inParams == null)
            {
                return Ok(new { status_message = "Invoice data is null", status_code = 0 });
            }

            try
            {

                int referenceID = 0;

                var stockHead = inParams.StockHead;
                if (stockHead == null)
                {
                    return Ok(new { status_message = "Please enter valid invoice data.", status_code = 0 });
                }

                var stockBody = inParams.StockBody;
                if (stockBody == null || stockBody.Count() < 1)
                {
                    return Ok(new { status_message = "Please add at least one product.", status_code = 0 });
                }

                var sh = await context.tblStockAdjustHead.Where(s => s.InvoiceNo == stockHead.InvoiceNo && s.CompanyID == stockHead.CompanyID && s.IsActive == true).FirstOrDefaultAsync();
                if (sh == null)
                {
                    return Ok(new { status_message = "Stock not Found.", status_code = 0 });
                }
                decimal PrevStockTotal = sh.Total;

                var stockBodyList = await context.tblStockAdjustBody.Where(p => p.InvoiceNo == sh.InvoiceNo && p.CompanyID == sh.CompanyID && p.IsActive == true).ToListAsync();

                var productCodesInBody = stockBodyList.Select(sb => sb.ProductCode).Distinct().Cast<long>();
                var productsInBody = await context.tblProducts
                    .Where(p => productCodesInBody.Contains(p.Code) && p.CompanyID == sh.CompanyID && p.IsActive == true)
                    .ToDictionaryAsync(p => p.Code);

                // Add Invoice Data
                foreach (var stockBodyData in stockBodyList)
                {
                    var sb = await context.tblStockAdjustBody.FirstOrDefaultAsync(s => s.ID == stockBodyData.ID && s.CompanyID == stockBodyData.CompanyID && s.IsActive == true);

                    if (sb != null)
                    {

                        if (productsInBody.TryGetValue(stockBodyData.ProductCode, out var product) && product.CompanyID == stockBodyData.CompanyID && product.IsActive == true)
                        {
                            var quantityToDeduct = stockBodyData.DefaultUnit switch
                            {
                                "Quantity" => stockBodyData.Quantity,
                                "Weight" => stockBodyData.Weight,
                                "Length" => stockBodyData.Length,
                                _ => 0
                            };
                            if (stockHead.AdjustType == "Out")
                            {
                                product.OpeningQuantity += quantityToDeduct;
                            }
                            else
                            {
                                product.OpeningQuantity -= quantityToDeduct;
                            }
                            product.UpdatedDate = DateTime.Now;
                        }
                    }
                }

                decimal invoiceTotal = stockHead.Total;


                if (sh != null)
                {
                    sh.NominalAccount = stockHead.NominalAccount;
                    sh.AccountCode = stockHead.AccountCode;
                    sh.Date = stockHead.Date;
                    sh.DocNo = stockHead.DocNo;
                    sh.Total = stockHead.Total;
                    sh.Notes = stockHead.Notes;
                    sh.UpdatedDate = DateTime.Now;
                    referenceID = (int)sh.InvoiceNo;
                }

                var productIds = stockBody
                            .Select(sb => sb.ProductCode)
                            .Distinct();

                var products = await context.tblProducts
                    .Where(p => productIds.Contains(p.Code) && p.CompanyID == stockHead.CompanyID && p.IsActive == true)
                    .ToDictionaryAsync(p => p.Code);

                // Process SaleBody Data
                foreach (var stockAdjustBody in stockBody)
                {

                    var sb = await context.tblStockAdjustBody
                        .FirstOrDefaultAsync(s => s.ID == stockAdjustBody.ID && s.CompanyID == stockAdjustBody.CompanyID && s.IsActive);

                    var quantityToDeduct = stockAdjustBody.DefaultUnit switch
                    {
                        "Quantity" => stockAdjustBody.Quantity,
                        "Weight" => stockAdjustBody.Weight,
                        "Length" => stockAdjustBody.Length,
                        _ => 0
                    };

                    if (products.TryGetValue(stockAdjustBody.ProductCode, out var product)
                        && product.CompanyID == stockAdjustBody.CompanyID
                        && product.IsActive)
                    {
                        product.OpeningQuantity += stockHead.AdjustType == "Out"
                            ? -quantityToDeduct
                            : quantityToDeduct;
                        product.UpdatedDate = DateTime.Now;
                    }

                    if (sb != null)
                    {
                        sb.ProductName = stockAdjustBody.ProductName;
                        sb.ProductCode = stockAdjustBody.ProductCode;
                        sb.Unit = stockAdjustBody.Unit;
                        sb.Quantity = stockAdjustBody.Quantity;
                        sb.Length = stockAdjustBody.Length;
                        sb.Weight = stockAdjustBody.Weight;
                        sb.Rate = stockAdjustBody.Rate;
                        sb.DefaultUnit = stockAdjustBody.DefaultUnit;
                        sb.Amount = stockAdjustBody.Amount;
                        sb.UpdatedDate = DateTime.Now;
                    }
                    else
                    {
                        // Add new SaleBody record
                        stockAdjustBody.InvoiceNo = referenceID;
                        await context.tblStockAdjustBody.AddAsync(stockAdjustBody);
                    }
                }

                // Save changes to the database
                await context.SaveChangesAsync();

                await context.SaveChangesAsync();

                return Ok(new
                {
                    status_message = "Stock updated successfully.",
                    status_code = 1,
                    Stock = inParams.StockHead,
                    Invoice = referenceID
                });
            }
            catch (Exception e)
            {
                return Ok(new
                {
                    status_message = "Sorry! Something went wrong.",
                    status_code = 0,
                    error = e.Message
                });
            }
        }

        [HttpPatch("DeleteStock")]
        public async Task<IActionResult> DeleteStock([FromBody] GeneralRequest inParams)
        {
            if (inParams == null)
            {
                return Ok(new { status_message = "Invalid Stock to Delete.", status_code = 0 });
            }

            try
            {
                var sh = await context.tblStockAdjustHead.FirstOrDefaultAsync(s => s.ID == inParams.ID && s.CompanyID == inParams.CompanyID && s.IsActive == true);
                if (sh == null)
                {
                    return Ok(new { status_message = "Stock not Found.", status_code = 0 });
                }

                decimal PrevStockTotal = sh.Total;

                var sb = await context.tblStockAdjustBody.Where(r => r.InvoiceNo == sh.InvoiceNo && r.CompanyID == sh.CompanyID && r.IsActive == true).ToListAsync();


                sh.IsActive = false;
                sh.IsDeleted = true;
                sh.UpdatedDate = DateTime.Now;

                var productIds = sb.Select(sb => sb.ProductCode).Distinct().Cast<long>();
                var products = await context.tblProducts
                    .Where(p => productIds.Contains(p.Code) && p.CompanyID == sh.CompanyID && p.IsActive == true)
                    .ToDictionaryAsync(p => p.Code);

                foreach (var saleBody in sb)
                {

                    if (products.TryGetValue(saleBody.ProductCode, out var product) && product.CompanyID == saleBody.CompanyID)
                    {
                        var quantityToDeduct = saleBody.DefaultUnit switch
                        {
                            "Quantity" => saleBody.Quantity,
                            "Weight" => saleBody.Weight,
                            "Length" => saleBody.Length,
                            _ => 0
                        };
                        if (sh?.AdjustType == "Out")
                        {
                            product.OpeningQuantity += quantityToDeduct;
                        }
                        else
                        {
                            product.OpeningQuantity -= quantityToDeduct;
                        }
                        product.UpdatedDate = DateTime.Now;
                    }


                    saleBody.IsActive = false;
                    saleBody.IsDeleted = true;
                    saleBody.UpdatedDate = DateTime.Now;
                }

                await context.SaveChangesAsync();

                return Ok(new
                {
                    status_message = "Invoice Deleted successfully.",
                    status_code = 1,
                });
            }
            catch (Exception e)
            {
                return Ok(new
                {
                    status_message = "Sorry! Something went wrong.",
                    status_code = 0,
                    error = e.Message
                });
            }
        }

        [HttpPatch("DeleteStockBody")]
        public async Task<IActionResult> DeleteStockBody([FromBody] GeneralRequest inParams)
        {
            try
            {
                var stockBody = await context.tblStockAdjustBody.FindAsync(inParams.ID);

                if (stockBody == null)
                {
                    return Ok(new
                    {
                        status_code = 0,
                        status_message = "Invalid ID. Stock record not found."
                    });
                }

                var product = await context.tblProducts.FirstOrDefaultAsync(p => p.Code == stockBody.ProductCode && p.CompanyID == stockBody.CompanyID);
                if (product != null)
                {
                    var quantityToDeduct = stockBody.DefaultUnit switch
                    {
                        "Quantity" => stockBody.Quantity,
                        "Weight" => stockBody.Weight,
                        "Length" => stockBody.Length,
                        _ => 0
                    };
                    if (stockBody.AdjustType == "Out")
                    {
                        product.OpeningQuantity += quantityToDeduct;
                    }
                    else
                    {
                        product.OpeningQuantity -= quantityToDeduct;
                    }
                    product.UpdatedDate = DateTime.Now;
                }

                // Mark the record as deleted
                stockBody.IsDeleted = true;
                stockBody.IsActive = false;
                stockBody.UpdatedDate = DateTime.Now;

                await context.SaveChangesAsync();

                return Ok(new
                {
                    stockBody,
                    status_code = 1,
                    status_message = "Product deleted successfully."
                });
            }
            catch (Exception)
            {
                return Ok(new
                {
                    status_code = 0,
                    status_message = "Sorry! Something went wrong..."
                });
            }
        }
    }
}
