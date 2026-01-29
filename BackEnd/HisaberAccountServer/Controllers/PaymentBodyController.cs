using HisaberAccountServer.Data;
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
    public class PaymentBodyController : ControllerBase
    {
        private readonly HisaberDbContext context;
        public PaymentBodyController(HisaberDbContext context)
        {
            this.context = context;
        }

        [HttpPost("AddPaymentBody")]
        public async Task<ActionResult<IEnumerable<PaymentBody>>> AddStock(IEnumerable<PaymentBody> paymentBodies)
        {
            if (!ModelState.IsValid)
            {
                return Ok(new { status_code = 0, status_message = "Invalid model state." });
            }
            try
            {
                context.tblPaymentBody.AddRange(paymentBodies);

                await context.SaveChangesAsync();

                return Ok(new { paymentBodies, status_code = 1, status_message = "Payment Added Successfully." });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.", e.Message });
            }
        }

        [HttpGet("GetPaymentBodyBy/{voucher}/{CompanyID}")]
        public async Task<ActionResult<PaymentBody>> GetRecord(int voucher, int CompanyID)
        {
            try
            {
                var data = await context.tblPaymentBody.Where(e => e.IsDeleted == false && e.VoucherNo == voucher && e.CompanyID == CompanyID).ToListAsync();
                if (data == null)
                {
                    return Ok(new { status_code = 0, status_message = "Payment Not Found." });
                }
                return Ok(new { PaymentBodyData = data, status_code = 1, status_message = "Payment Found Successfully." });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.", e.Message });
            }
        }


        [HttpGet("GetPaymentBodyData/{billID}/{CompanyID}")]
        public async Task<ActionResult<PaymentBody>> GetReceiptBodyDataBy(int billID, int CompanyID)
        {
            try
            {
                var data = await context.tblPaymentBody
                    .Where(e => e.IsDeleted == false && e.BillID == billID && e.CompanyID == CompanyID)
                    .FirstOrDefaultAsync();

                if (data == null)
                {
                    return Ok(new { status_code = 0, status_message = "Payment Not Found." });
                }

                return Ok(new { PaymentBodyData = data, status_code = 1, status_message = "Payment Found Successfully." });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.", e.Message });
            }
        }


        [HttpPatch]
        [Route("UpdateRecords/{id}")]
        public async Task<ActionResult<IEnumerable<PaymentBody>>> UpdateRecords(int id, IEnumerable<PaymentBody> Purchase)
        {
            try
            {
                foreach (var purchaseBody in Purchase)
                {
                    var existingSale = await context.tblPaymentBody.FindAsync(purchaseBody.ID);
                    if (existingSale == null)
                    {
                        return Ok(new { status_message = $"Stock with ID {purchaseBody.ID} not found.", status_code = 0 });
                    }

                    existingSale.ID = purchaseBody.ID;
                    existingSale.Date = purchaseBody.Date;
                    existingSale.BillNo = purchaseBody.BillNo;
                    existingSale.VoucherNo = purchaseBody.VoucherNo;
                    existingSale.DueDate = purchaseBody.DueDate;
                    existingSale.Amount = purchaseBody.Amount;
                    existingSale.OpenBalance = purchaseBody.OpenBalance;
                    existingSale.Discount = purchaseBody.Discount;
                    existingSale.WHTRate = purchaseBody.WHTRate;
                    existingSale.WHT = purchaseBody.WHT;
                    existingSale.Payment = purchaseBody.Payment;
                    existingSale.Total = purchaseBody.Total;
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

                return Ok(new { Purchase, status_code = 1, status_message = "Payment Updated Successfully." });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.", e.Message });
            }
        }

        [HttpPatch]
        [Route("DeleteRecord/{id}")]
        public async Task<ActionResult<PaymentBody>> UpdateStudent(int id, PaymentBody paymentBody)
        {
            try
            {
                if (id != paymentBody.ID)
                {
                    return Ok(new { status_code = 0, status_message = "Invalid ID." });
                }
                paymentBody.UpdatedDate = DateTime.Now;
                context.Entry(paymentBody).State = EntityState.Modified;
                await context.SaveChangesAsync();
                return Ok(new { paymentBody, status_code = 1, status_message = "Payment Deleted Successfully." });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.", e.Message });
            }
        }
    }
}
