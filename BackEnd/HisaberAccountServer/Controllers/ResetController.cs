using EmailServiceManagement;
using HisaberAccountServer.Data;
using HisaberAccountServer.Models;
using HisaberAccountServer.Models.Company;
using HisaberAccountServer.Models.Settings;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualStudio.Web.CodeGenerators.Mvc.Templates.BlazorIdentity.Shared;
using System.Data;

namespace HisaberAccountServer.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ResetController : ControllerBase
    {
        private readonly HisaberDbContext context;
        private readonly IEmailSender emailSender;
        public ResetController(HisaberDbContext context, IEmailSender emailSender)
        {
            this.context = context;
            this.emailSender = emailSender;
        }


        [HttpPost("delete-company-email")]
        public async Task<IActionResult> DeleteCompanyEmail([FromBody] CompanyInfo inParams)
        {
            int companyId = inParams.ID;
            if (companyId <= 0)
            {
                return Ok(new { status_code = 0, status_message = "Invalid company ID." });
            }

            try
            {

                var data = await context.tblCompanyInfo.Where(c => c.ID == companyId).FirstOrDefaultAsync();
                if (data != null)
                {
                    string CompanyCode = data.CompanyCode;

                    var message = new Message(new string[] { data.Email! }, "[HISAABER] Delete Company Verification", GeneralRequest.GetHtmlcontent("Verify Your Company Deletion", "Your delete company code is", data.Email, CompanyCode));
                    emailSender.SendEmail(message);

                    EmailLog email = new EmailLog
                    {
                        EmailTo = data.Email,
                        EmailFrom = "noreply@hisaaber.com",
                        Subject = "[HISAABER] Company Deletion Verification",
                        Reference = "Personal",
                        EventType = "Company Deletion",
                        DeliveryStatus = "Sent",
                        SendDate = DateTime.Now,
                        IsActive = true,
                        IsDeleted = false
                    };

                    await context.tblEmailLog.AddAsync(email);
                    await context.SaveChangesAsync();
                }
                else
                {
                    return Ok(new { status_code = 0, status_message = "Invalid Company ID." });
                }

                return Ok(new { status_code = 1, status_message = "A Code sent to your email." });
            }
            catch (Exception ex)
            {
                return Ok(new { status_message = "Sorry! Something went wrong.", error = ex.Message, status_code = 0 });
            }
        }

        [HttpPost("delete-company")]
        public async Task<IActionResult> DeleteCompany([FromBody] CompanyInfo inParams)
        {
            int companyId = inParams.ID;
            if (companyId <= 0)
            {
                return Ok(new { status_code = 0, status_message = "Invalid company ID." });
            }

            try
            {

                var data = await context.tblCompanyInfo.Where(c => c.ID == companyId).FirstOrDefaultAsync();
                if (data == null)
                {
                    return Ok(new { status_code = 0, status_message = "Company Not Found." });
                }

                if (inParams.CompanyCode == data.CompanyCode)
                {
                    data.IsActive = false;
                    data.IsDeleted = true;
                    context.Entry(data).State = EntityState.Modified;
                    await context.SaveChangesAsync();
                }

                return Ok(new { status_code = 1, status_message = "Company deleted successfully." });
            }
            catch (Exception ex)
            {
                return Ok(new { status_message = "Sorry! Something went wrong.", error = ex.Message, status_code = 0 });
            }
        }


        [HttpGet("delete-customers")]
        public async Task<IActionResult> DeleteCustomers([FromQuery] int companyId)
        {
            if (companyId <= 0)
            {
                return Ok(new { status_code = 0, status_message = "Invalid input parameters." });
            }

            try
            {
                var listOfCustomers = await context.tblCustomerSupplier
                    .Where(c => c.CompanyID == companyId && c.IsSupplier == false)
                    .ToListAsync();

                if (!listOfCustomers.Any())
                {
                    return Ok(new { status_code = 0, status_message = "No customers found to delete." });
                }

                context.tblCustomerSupplier.RemoveRange(listOfCustomers);

                await context.SaveChangesAsync();

                return Ok(new { status_message = "Customers Reset Successfully.", status_code = 1 });
            }
            catch (Exception ex)
            {

                return Ok(new { status_message = "Sorry! Something went wrong.", error = ex.Message, status_code = 0 });
            }
        }


        [HttpGet("delete-suppliers")]
        public async Task<IActionResult> DeleteSuppliers([FromQuery] int companyId)
        {

            if (companyId <= 0)
            {
                return Ok(new { status_code = 0, status_message = "Invalid input parameters." });

            }

            try
            {
                var listOfSuppliers = await context.tblCustomerSupplier
                    .Where(s => s.CompanyID == companyId && s.IsCustomer == false)
                    .ToListAsync();

                if (!listOfSuppliers.Any())
                {
                    return Ok(new { status_code = 0, status_message = "No suppliers found to delete." });
                }

                context.tblCustomerSupplier.RemoveRange(listOfSuppliers);

                await context.SaveChangesAsync();

                return Ok(new { status_message = "All supplier deleted.", status_code = 1 });
            }
            catch (Exception ex)
            {

                return Ok(new { status_message = "Sorry! Something went wrong.", error = ex.Message, status_code = 0 });
            }
        }

        [HttpGet("delete-products")]
        public async Task<IActionResult> DeleteProducts([FromQuery] int companyId)
        {

            try
            {
                var ListOfProducts = await context.tblProducts
                    .Where(c => c.CompanyID == companyId && c.CategoryCode != "COP" && c.CategoryCode != "SOP")
                    .ToListAsync();

                if (!ListOfProducts.Any())
                {
                    return Ok(new { status_code = 0, status_message = "No products found to delete." });
                }

                context.tblProducts.RemoveRange(ListOfProducts);

                await context.SaveChangesAsync();

                return Ok(new { status_message = "Products Reset Successfully.", status_code = 1 });
            }
            catch (Exception ex)
            {

                return Ok(new { status_message = "Sorry! Something went wrong.", error = ex.Message, status_code = 0 });
            }
        }


        [HttpGet("delete-sales")]
        public async Task<IActionResult> DeleteSales([FromQuery] int companyId)
        {
            try
            {
                var listOfSalesHead = await context.tblSaleHead
                    .Where(c => c.CompanyID == companyId && c.InvoiceNo > 0 && c.DocNo != "COP")
                    .ToListAsync();

                var listOfSalesBody = await context.tblSaleBody
                    .Where(c => c.CompanyID == companyId)
                    .ToListAsync();

                if (!listOfSalesHead.Any() && !listOfSalesBody.Any())
                {
                    return Ok(new { status_code = 0, status_message = "No sales found to delete." });
                }

                context.tblSaleBody.RemoveRange(listOfSalesBody);
                context.tblSaleHead.RemoveRange(listOfSalesHead);

                await context.SaveChangesAsync();

                return Ok(new { status_message = "Sales Reset Successfully.", status_code = 1 });
            }
            catch (Exception ex)
            {

                return Ok(new { status_message = "Sorry! Something went wrong.", error = ex.Message, status_code = 0 });
            }
        }

        [HttpGet("delete-receipts")]
        public async Task<IActionResult> DeleteReceipts([FromQuery] int companyId)
        {
            try
            {
                var listOfReceiptsHead = await context.tblReceiptHead
                    .Where(c => c.CompanyID == companyId)
                    .ToListAsync();

                var listOfReceiptBody = await context.tblReceiptBody
                    .Where(c => c.CompanyID == companyId)
                    .ToListAsync();

                if (!listOfReceiptsHead.Any() && !listOfReceiptBody.Any())
                {
                    return Ok(new { status_code = 0, status_message = "No receipts found to delete." });
                }

                context.tblReceiptBody.RemoveRange(listOfReceiptBody);
                context.tblReceiptHead.RemoveRange(listOfReceiptsHead);

                await context.SaveChangesAsync();

                return Ok(new { status_message = "Receipts Reset Successfully.", status_code = 1 });
            }
            catch (Exception ex)
            {

                return Ok(new { status_message = "Sorry! Something went wrong.", error = ex.Message, status_code = 0 });
            }
        }

        [HttpGet("delete-purchases")]
        public async Task<IActionResult> DeletePurchase([FromQuery] int companyId)
        {
            try
            {
                var listOfPurchaseHead = await context.tblPurchaseHead
                    .Where(c => c.CompanyID == companyId && c.BillID > 0 && c.BillNumber != "SOP")
                    .ToListAsync();

                var listOfPurchaseBody = await context.tblPurchaseBody
                    .Where(c => c.CompanyID == companyId)
                    .ToListAsync();

                if (!listOfPurchaseHead.Any() && !listOfPurchaseBody.Any())
                {
                    return Ok(new { status_code = 0, status_message = "No purchases found to delete." });
                }

                context.tblPurchaseBody.RemoveRange(listOfPurchaseBody);
                context.tblPurchaseHead.RemoveRange(listOfPurchaseHead);

                await context.SaveChangesAsync();

                return Ok(new { status_message = "Purchases Reset Successfully.", status_code = 1 });
            }
            catch (Exception ex)
            {
                return Ok(new { status_message = "Sorry! Something went wrong.", error = ex.Message, status_code = 0 });
            }

        }

        [HttpGet("delete-payments")]
        public async Task<IActionResult> DeletePayments([FromQuery] int companyId)
        {
            try
            {
                var listOfPaymentHead = await context.tblPaymentHead
                    .Where(c => c.CompanyID == companyId)
                    .ToListAsync();

                var listOfPaymentBody = await context.tblPaymentBody
                    .Where(c => c.CompanyID == companyId)
                    .ToListAsync();

                if (!listOfPaymentHead.Any() && !listOfPaymentBody.Any())
                {
                    return Ok(new { status_code = 0, status_message = "No payments found to delete." });
                }

                context.tblPaymentBody.RemoveRange(listOfPaymentBody);
                context.tblPaymentHead.RemoveRange(listOfPaymentHead);

                await context.SaveChangesAsync();

                return Ok(new { status_message = "Payments Reset Successfully.", status_code = 1 });
            }
            catch (Exception ex)
            {
                return Ok(new { status_message = "Sorry! Something went wrong.", error = ex.Message, status_code = 0 });
            }
        }

        [HttpGet("get-records")]
        public async Task<IActionResult> GetRecords([FromQuery] int companyId)
        {
            try
            {
                string sql = @"
            SELECT 'Reset Customers' AS Name, COUNT(*) AS TotalCount 
            FROM tblCustomerSupplier 
            WHERE CompanyID = @companyId AND IsSupplier = 0

            UNION ALL

            SELECT 'Reset Suppliers' AS Name, COUNT(*) AS TotalCount 
            FROM tblCustomerSupplier 
            WHERE CompanyID = @companyId AND IsCustomer = 0

            UNION ALL

            SELECT 'Reset Sales' AS Name, COUNT(*) AS TotalCount 
            FROM tblSaleHead 
            WHERE CompanyID = @companyId AND DocNo != 'COP'

            UNION ALL

            SELECT 'Reset Purchases' AS Name, COUNT(*) AS TotalCount 
            FROM tblPurchaseHead 
            WHERE CompanyID = @companyId AND BillNumber != 'SOP'

            UNION ALL

            SELECT 'Reset Receipts' AS Name, COUNT(*) AS TotalCount 
            FROM tblReceiptHead 
            WHERE CompanyID = @companyId

            UNION ALL

            SELECT 'Reset Payments' AS Name, COUNT(*) AS TotalCount
            FROM tblPaymentHead 
            WHERE CompanyID = @companyId

            UNION ALL

            SELECT 'Reset Products' AS Name, COUNT(*) AS TotalCount 
            FROM tblProducts 
            WHERE CompanyID = @companyId AND CategoryCode != 'COP' AND CategoryCode != 'SOP';
        ";

                var records = await context.Database.SqlQueryRaw<ResetCompany>(sql, new SqlParameter("@companyId", companyId)).ToListAsync();

                if (records == null || records.Count == 0)
                {
                    return Ok(new { status_message = "No records found.", status_code = 0 });
                }

                return Ok(new { records, status_code = 1 });
            }
            catch (Exception ex)
            {
                return Ok(new { status_message = "Sorry! Something went wrong.", error = ex.Message, status_code = 0 });
            }
        }




    }
}
