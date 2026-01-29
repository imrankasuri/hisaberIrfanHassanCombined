using HisaberAccountServer.Data;
using HisaberAccountServer.Models;
using HisaberAccountServer.Models.Purchase;
using HisaberAccountServer.Models.Sales;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualStudio.Web.CodeGenerators.Mvc.Templates.BlazorIdentity.Shared;

namespace HisaberAccountServer.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class PurchaseBodyController : ControllerBase
    {
        private readonly HisaberDbContext context;
        public PurchaseBodyController(HisaberDbContext context)
        {
            this.context = context;
        }

        [HttpPost("AddPurchaseBody")]
        public async Task<ActionResult<IEnumerable<PurchaseBody>>> AddStock(IEnumerable<PurchaseBody> purchaseBodies)
        {
            if (!ModelState.IsValid)
            {
                return Ok(new { ModelState, status_code = 0, status_message = "Purchase Data is Null" });
            }
            try
            {
                context.tblPurchaseBody.AddRange(purchaseBodies);
                await context.SaveChangesAsync();

                return Ok(new { purchaseBodies, status_code = 1, status_message = "Purchase Added Successfully." });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.", e.Message });
            }
        }

        [HttpPatch]
        [Route("UpdateRecords/{id}")]
        public async Task<ActionResult<IEnumerable<PurchaseBody>>> UpdateRecords(int id, IEnumerable<PurchaseBody> Purchase)
        {
            try
            {
                foreach (var purchaseBody in Purchase)
                {
                    var existingSale = await context.tblPurchaseBody.FindAsync(purchaseBody.ID);
                    if (existingSale == null)
                    {
                        return Ok(new { status_message = $"Stock with ID {purchaseBody.ID} not found.", status_code = 0 });
                    }

                    existingSale.ID = purchaseBody.ID;
                    existingSale.Product = purchaseBody.Product;
                    existingSale.Description = purchaseBody.Description;
                    existingSale.Unit = purchaseBody.Unit;
                    existingSale.Quantity = purchaseBody.Quantity;
                    existingSale.Rate = purchaseBody.Rate;
                    existingSale.Amount = purchaseBody.Amount;
                    existingSale.DiscPercentege = purchaseBody.DiscPercentege;
                    existingSale.Discount = purchaseBody.Discount;
                    existingSale.TaxRate = purchaseBody.TaxRate;
                    existingSale.SaleTax = purchaseBody.SaleTax;
                    existingSale.Net = purchaseBody.Net;
                    existingSale.Field1 = purchaseBody.Field1;
                    existingSale.Weight = purchaseBody.Weight;
                    existingSale.Length = purchaseBody.Length;
                    existingSale.PurchaseType = purchaseBody.PurchaseType;
                    existingSale.PurchaseBy = purchaseBody.PurchaseBy;
                    existingSale.BillID = purchaseBody.BillID;
                    existingSale.CompanyID = purchaseBody.CompanyID;
                    existingSale.IsActive = purchaseBody.IsActive;
                    existingSale.IsDeleted = purchaseBody.IsDeleted;
                    existingSale.UpdatedDate = DateTime.Now;
                    existingSale.InComplete = purchaseBody.InComplete;

                    context.Entry(existingSale).State = EntityState.Modified;
                }

                await context.SaveChangesAsync();

                return Ok(new { Purchase, status_code = 1, status_message = "Purchase Updated Successfully." });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.", e.Message });
            }
        }

        [HttpGet("GetPurchaseBodyBy/{BillId}/{CompanyID}")]
        public async Task<ActionResult<PurchaseBody>> GetRecord(int BillId, int CompanyID)
        {
            try
            {
                var data = await context.tblPurchaseBody.Where(e => e.IsDeleted == false && e.BillID == BillId && e.CompanyID == CompanyID).ToListAsync();
                if (data == null)
                {
                    return Ok(new { status_code = 0, status_message = "Purchase Not Found" });
                }
                return Ok(new { PurchaseBodyData = data, status_code = 1, status_message = "Purchase Found Successfully." });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.", e.Message });
            }
        }

        [HttpPatch("DeleteRecord")]
        public async Task<IActionResult> DeletePurchaseRecord([FromBody] GeneralRequest inParams)
        {
            try
            {
                var purchaseBody = await context.tblPurchaseBody.FindAsync(inParams.ID);

                if (purchaseBody == null)
                {
                    return Ok(new
                    {
                        status_code = 0,
                        status_message = "Invalid ID. Purchase record not found."
                    });
                }
                var product = await context.tblProducts.FirstOrDefaultAsync(p => p.ID == purchaseBody.ProductID && p.CompanyID == purchaseBody.CompanyID);
                if (product != null)
                {
                    var quantityToDeduct = purchaseBody.DefaultUnit switch
                    {
                        "Quantity" => purchaseBody.Quantity ?? 0,
                        "Weight" => purchaseBody.Weight ?? 0,
                        "Length" => purchaseBody.Length ?? 0,
                        _ => 0
                    };
                    if (purchaseBody.PurchaseType == "Bill")
                    {
                        product.OpeningQuantity -= quantityToDeduct;
                    }
                    else
                    {
                        product.OpeningQuantity += quantityToDeduct;
                    }
                    product.UpdatedDate = DateTime.Now;
                }
                // Mark the record as deleted
                purchaseBody.IsDeleted = true;
                purchaseBody.IsActive = false;
                purchaseBody.UpdatedDate = DateTime.Now;

                await context.SaveChangesAsync();

                return Ok(new
                {
                    purchaseBody,
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
