using HisaberAccountServer.Data;
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
    public class ReceiptBodyController : ControllerBase
    {
        private readonly HisaberDbContext context;
        public ReceiptBodyController(HisaberDbContext context)
        {
            this.context = context;
        }

        [HttpPost("AddReceiptBody")]
        public async Task<ActionResult<IEnumerable<ReceiptBody>>> AddStock(IEnumerable<ReceiptBody> receiptBodies)
        {
            if (!ModelState.IsValid)
            {
                return Ok(new { status_code = 0, status_message = "Receipt Data is Null" });
            }
            try
            {
                context.tblReceiptBody.AddRange(receiptBodies);

                await context.SaveChangesAsync();

                return Ok(new { receiptBodies, status_code = 1, status_message = "Receipt Added Successfully." });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.", e.Message });
            }
        }

        [HttpGet("GetReceiptBodyBy/{voucher}/{CompanyID}")]
        public async Task<ActionResult<ReceiptBody>> GetRecord(int voucher, int CompanyID)
        {
            try
            {
                var data = await context.tblReceiptBody.Where(e => e.IsDeleted == false && e.VoucherNo == voucher && e.CompanyID == CompanyID).ToListAsync();
                if (data == null)
                {
                    return Ok(new { status_code = 0, status_message = "Receipt Not Found." });
                }
                return Ok(new { SaleBodyData = data, status_code = 1 });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.", e.Message });
            }
        }

        [HttpGet("GetReceiptBodyDataByInvoice/{Invoice}/{CompanyID}")]
        public async Task<ActionResult<ReceiptBody>> GetReceiptBodyDataByInvoice(int Invoice, int CompanyID)
        {
            try
            {
                var data = await context.tblReceiptBody.Where(e => e.IsDeleted == false && e.InvoiceNo == Invoice && e.CompanyID == CompanyID).ToListAsync();
                if (data == null)
                {
                    return Ok(new { status_code = 0, status_message = "Receipt Not  Found." });
                }
                return Ok(new { SaleBodyData = data, status_code = 1, status_message = "Receipt Found Successfully." });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.", e.Message });
            }
        }

        [HttpGet("GetReceiptBodyDataBy/{Invoice}/{CompanyID}")]
        public async Task<ActionResult<ReceiptBody>> GetReceiptBodyDataBy(int Invoice, int CompanyID)
        {
            try
            {
                var data = await context.tblReceiptBody.Where(e => e.IsDeleted == false && e.InvoiceNo == Invoice && e.CompanyID == CompanyID).FirstOrDefaultAsync();
                if (data == null)
                {
                    return Ok(new { status_code = 0, status_message = "Receipt Not  Found." });
                }
                return Ok(new { SaleBodyData = data, status_code = 1 });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.", e.Message });
            }
        }

        [HttpPatch]
        [Route("UpdateRecords/{id}")]
        public async Task<ActionResult<IEnumerable<ReceiptBody>>> UpdateRecords(int id, IEnumerable<ReceiptBody> Sale)
        {
            try
            {
                foreach (var saleBody in Sale)
                {
                    var existingSale = await context.tblReceiptBody.FindAsync(saleBody.ID);
                    if (existingSale == null)
                    {
                        return Ok(new { status_message = $"Receipt with ID {saleBody.ID} not found.", status_code = 0 });
                    }

                    existingSale.ID = saleBody.ID;
                    existingSale.Date = saleBody.Date;
                    existingSale.DocNo = saleBody.DocNo;
                    existingSale.InvoiceNo = saleBody.InvoiceNo;
                    existingSale.DueDate = saleBody.DueDate;
                    existingSale.Amount = saleBody.Amount;
                    existingSale.OpenBalance = saleBody.OpenBalance;
                    existingSale.Discount = saleBody.Discount;
                    existingSale.WHTRate = saleBody.WHTRate;
                    existingSale.WHT = saleBody.WHT;
                    existingSale.Receipt = saleBody.Receipt;
                    existingSale.Total = saleBody.Total;
                    existingSale.ReceiptType = saleBody.ReceiptType;
                    existingSale.ReceiptBy = saleBody.ReceiptBy;
                    existingSale.InvoiceNo = saleBody.InvoiceNo;
                    existingSale.CompanyID = saleBody.CompanyID;
                    existingSale.IsActive = saleBody.IsActive;
                    existingSale.IsDeleted = saleBody.IsDeleted;
                    existingSale.UpdatedDate = DateTime.Now;
                    existingSale.InComplete = saleBody.InComplete;

                    context.Entry(existingSale).State = EntityState.Modified;
                }

                await context.SaveChangesAsync();

                return Ok(new { Sale, status_code = 1, status_message = "Receipt Updated Successfully." });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.", e.Message });
            }
        }

        [HttpPatch]
        [Route("DeleteRecord/{id}")]
        public async Task<ActionResult<ReceiptBody>> UpdateStudent(int id, ReceiptBody receiptBody)
        {
            try
            {
                if (id != receiptBody.ID)
                {
                    return Ok(new { status_code = 0, status_message = "Invalid ID" });
                }
                receiptBody.UpdatedDate = DateTime.Now;
                context.Entry(receiptBody).State = EntityState.Modified;
                await context.SaveChangesAsync();
                return Ok(new { receiptBody, status_code = 1, status_message = "Receipt Deleted Successfully." });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.", e.Message });
            }
        }

    }
}
