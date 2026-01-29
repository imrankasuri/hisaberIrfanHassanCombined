using ExcelDataReader;
using HisaberAccountServer.Data;
using HisaberAccountServer.Models;
using HisaberAccountServer.Models.Purchase;
using HisaberAccountServer.Models.Reports;
using HisaberAccountServer.Models.Sales;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Client;
using Microsoft.VisualStudio.Web.CodeGenerators.Mvc.Templates.BlazorIdentity.Pages.Manage;
using System.ComponentModel.Design;
using System.Diagnostics.Metrics;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Text.RegularExpressions;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;

namespace HisaberAccountServer.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class CustomerSupplierController : ControllerBase
    {
        private readonly HisaberDbContext context;
        public CustomerSupplierController(HisaberDbContext context)
        {
            this.context = context;
        }

        [HttpPost("AddCustomer")]
        public async Task<ActionResult<CustomerSupplier>> AddCustomer(CustomerSupplier customerSupplier)
        {
            if (customerSupplier == null)
            {
                return Ok(new { status_message = "Customer data is null", status_code = 0 });
            }

            try
            {
                var lastCustomer = await context.tblCustomerSupplier
                .Where(p => p.CompanyID == customerSupplier.CompanyID)
                .ToListAsync();
                if (lastCustomer != null && lastCustomer.Count > 0)
                {
                    var lastCustomerWithValidAccountNo = lastCustomer
                        .Where(p => int.TryParse(p.AccountNo, out int accountNo) && accountNo <= 9000)
                        .OrderByDescending(p => int.Parse(p.AccountNo))
                        .FirstOrDefault();

                    customerSupplier.AccountNo = lastCustomerWithValidAccountNo != null
                        ? (int.Parse(lastCustomerWithValidAccountNo.AccountNo) + 1).ToString()
                        : "1001";

                    customerSupplier.AccountCode = lastCustomerWithValidAccountNo != null
                        ? (int.Parse(lastCustomerWithValidAccountNo.AccountCode) + 1).ToString()
                        : "1001";
                }
                else
                {
                    customerSupplier.AccountCode = "1001";
                    customerSupplier.AccountNo = "1001";
                }



                await context.tblCustomerSupplier.AddAsync(customerSupplier);

                var LastInvoice = await context.tblSaleHead
                    .Where(p => p.CompanyID == customerSupplier.CompanyID)
                    .OrderByDescending(p => p.InvoiceNo)
                    .FirstOrDefaultAsync();

                var OpeningBalanceProduct = await context.tblProducts
                   .Where(p => p.CompanyID == customerSupplier.CompanyID && p.CategoryCode == "cop")
                   .FirstOrDefaultAsync();

                if (OpeningBalanceProduct != null)
                {

                    SaleHead AddSaleHead = new SaleHead
                    {
                        CustomerName = customerSupplier.BusinessName,
                        CustomerAccountCode = customerSupplier.AccountCode,
                        Address = customerSupplier.Address,
                        Date = customerSupplier.OpeningDate,
                        DueDate = customerSupplier.OpeningDate,
                        CompanyID = customerSupplier.CompanyID,
                        InvoiceNo = 0,
                        SaleType = customerSupplier.CustomerBaseOpeningBalance > 0 ? "Invoice" : "Credit",
                        CreatedDate = DateTime.Now,
                        UpdatedDate = DateTime.Now,
                        IsActive = true,
                        IsDeleted = false,
                        Total = Math.Abs(customerSupplier.CustomerBaseOpeningBalance ?? 0),
                        TermDays = 0,
                        DocNo = "COP",
                        CreditLimit = 0,
                        Balance = Math.Abs(customerSupplier.CustomerBaseOpeningBalance ?? 0),
                        Notes = "",
                        SubTotal = 0,
                        TotalDiscount = 0,
                        TotalSaleTax = 0,
                        Field1 = "",
                        Field2 = "",
                        OverallDiscount = 0,
                        InComplete = false,
                        SaleBy = "Admin"
                    };

                    SaleBody AddSaleBody = new SaleBody
                    {
                        Product = OpeningBalanceProduct.Name,
                        Description = OpeningBalanceProduct.Name,
                        Amount = customerSupplier.CustomerBaseOpeningBalance,
                        CompanyID = customerSupplier.CompanyID,
                        InvoiceNo = 0,
                        SaleType = customerSupplier.CustomerBaseOpeningBalance > 0 ? "Invoice" : "Credit",
                        CreatedDate = DateTime.Now,
                        UpdatedDate = DateTime.Now,
                        IsActive = true,
                        IsDeleted = false,
                        Net = Math.Abs(customerSupplier.CustomerBaseOpeningBalance ?? 0),
                        Unit = "N/A",
                        Quantity = 0,
                        Rate = 0,
                        Discount = 0,
                        SaleTax = 0,
                        DiscPercentege = 0,
                        TaxRate = "",
                        Field1 = "",
                        Length = 0,
                        Weight = 0,
                        DefaultUnit = "Quantity",
                        Complete = false,
                        InComplete = false,
                        SaleBy = "Admin"
                    };

                    await context.tblSaleHead.AddAsync(AddSaleHead);
                    await context.tblSaleBody.AddAsync(AddSaleBody);
                }


                await context.SaveChangesAsync();

                return Ok(new
                {
                    status_message = "Customer added successfully.",
                    status_code = 1,
                    customerSupplier
                });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong." });
            }
        }

        [HttpPost("AddSupplier")]
        public async Task<ActionResult<CustomerSupplier>> AddSupplier(CustomerSupplier customerSupplier)
        {
            if (customerSupplier == null)
            {
                return Ok(new { status_message = "Supplier data is null", status_code = 0 });
            }

            try
            {
                var lastCustomer = await context.tblCustomerSupplier
                    .Where(p => p.CompanyID == customerSupplier.CompanyID)
                    .ToListAsync();
                if (lastCustomer != null && lastCustomer.Count > 0)
                {
                    var lastCustomerWithValidAccountNo = lastCustomer
                        .Where(p => int.TryParse(p.AccountNo, out int accountNo) && accountNo >= 9000)
                        .OrderByDescending(p => int.Parse(p.AccountNo))
                        .FirstOrDefault();

                    customerSupplier.AccountNo = lastCustomerWithValidAccountNo != null
                        ? (int.Parse(lastCustomerWithValidAccountNo.AccountNo) + 1).ToString()
                        : "9001";

                    customerSupplier.AccountCode = lastCustomerWithValidAccountNo != null
                        ? (int.Parse(lastCustomerWithValidAccountNo.AccountCode) + 1).ToString()
                        : "9001";
                }
                else
                {
                    customerSupplier.AccountCode = "9001";
                    customerSupplier.AccountNo = "9001";
                }

                await context.tblCustomerSupplier.AddAsync(customerSupplier);


                var LastBill = await context.tblPurchaseHead
                    .Where(p => p.CompanyID == customerSupplier.CompanyID)
                    .OrderByDescending(p => p.BillID)
                    .FirstOrDefaultAsync();

                var OpeningBalanceProduct = await context.tblProducts
                   .Where(p => p.CompanyID == customerSupplier.CompanyID && p.CategoryCode == "sop")
                   .FirstOrDefaultAsync();

                if (OpeningBalanceProduct != null)
                {

                    PurchaseHead AddPurchaseHead = new PurchaseHead
                    {
                        SupplierName = customerSupplier.BusinessName,
                        SupplierAccountCode = customerSupplier.AccountCode,
                        Address = customerSupplier.Address,
                        Date = customerSupplier.OpeningDate,
                        DueDate = customerSupplier.OpeningDate,
                        CompanyID = customerSupplier.CompanyID,
                        BillID = 0,
                        PurchaseType = customerSupplier.SupplierBaseOpeningBalance > 0 ? "Bill" : "Credit",
                        CreatedDate = DateTime.Now,
                        UpdatedDate = DateTime.Now,
                        IsActive = true,
                        IsDeleted = false,
                        Total = Math.Abs(customerSupplier.SupplierBaseOpeningBalance ?? 0),
                        TermDays = 0,
                        BillNumber = "SOP",
                        CreditLimit = 0,
                        Balance = Math.Abs(customerSupplier.SupplierBaseOpeningBalance ?? 0),
                        Notes = "",
                        SubTotal = 0,
                        TotalDiscount = 0,
                        TotalSaleTax = 0,
                        Field1 = "",
                        Field2 = "",
                        Field3 = "",
                        Field4 = "",
                        InComplete = false,
                        PurchaseBy = "Admin",
                        AdjustedBalance = 0
                    };



                    PurchaseBody AddPurchaseBody = new PurchaseBody
                    {
                        Product = OpeningBalanceProduct.Name,
                        Description = OpeningBalanceProduct.Name,
                        Amount = customerSupplier.SupplierBaseOpeningBalance,
                        CompanyID = customerSupplier.CompanyID,
                        BillID = 0,
                        PurchaseType = customerSupplier.SupplierBaseOpeningBalance > 0 ? "Bill" : "Credit",
                        CreatedDate = DateTime.Now,
                        UpdatedDate = DateTime.Now,
                        IsActive = true,
                        IsDeleted = false,
                        Net = Math.Abs(customerSupplier.SupplierBaseOpeningBalance ?? 0),
                        Unit = "N/A",
                        Quantity = 0,
                        Rate = 0,
                        Discount = 0,
                        SaleTax = 0,
                        DiscPercentege = 0,
                        TaxRate = "",
                        Field1 = "",
                        Length = 0,
                        Weight = 0,
                        DefaultUnit = "Quantity",
                        InComplete = false,
                        PurchaseBy = "Admin"
                    };

                    await context.tblPurchaseHead.AddAsync(AddPurchaseHead);
                    await context.tblPurchaseBody.AddAsync(AddPurchaseBody);
                }

                await context.SaveChangesAsync();

                return Ok(new
                {
                    status_message = "Supplier added successfully.",
                    status_code = 1,
                    customerSupplier
                });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong." });
            }
        }

        [HttpGet("GetCustomersBy/{Companyid}")]
        public async Task<ActionResult<CustomerSupplier>> GetCustomers(
            int Companyid,
            string orderBy = "",
            string businessName = "",
            string accountCode = "",
            string field1 = "")
        {
            try
            {
                // Validate Companyid
                if (Companyid <= 0)
                {
                    return Ok(new { status_code = 0, status_message = "Invalid Company ID." });
                }

                // Query base
                var query = context.tblCustomerSupplier
                    .Where(e => !e.IsDeleted && e.CompanyID == Companyid && e.IsCustomer == true);

                // Apply filters
                if (!string.IsNullOrWhiteSpace(businessName))
                {
                    query = query.Where(e => e.BusinessName == businessName);
                }

                if (!string.IsNullOrEmpty(accountCode))
                {
                    query = query.Where(e => e.AccountCode.StartsWith(accountCode));
                }

                if (!string.IsNullOrEmpty(field1) && field1 != "all")
                {
                    query = query.Where(e => e.Field1 == field1);
                }


                // Apply sorting
                switch (orderBy.ToLower())
                {
                    case "accountcode":
                        query = query.OrderBy(e => e.AccountNo);
                        break;
                    case "businessname":
                        query = query.OrderBy(e => e.BusinessName);
                        break;

                }
                query = query.OrderByDescending(e => e.ID);
                var data = await query.ToListAsync();

                if (!data.Any())
                {
                    return Ok(new { status_code = 0, message = "No Customers Found." });
                }

                return Ok(new
                {
                    listofCustomers = data,
                    status_code = 1,
                    totalRecords = data.Count
                });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong." });
            }
        }

        [HttpGet("GetSuppliersBy/{Companyid}")]
        public async Task<ActionResult<CustomerSupplier>> GetSuppliers(
           int Companyid,
           string orderBy = "",
           string businessName = "",
           string accountCode = "",
           string field1 = "")
        {
            try
            {
                if (Companyid <= 0)
                {
                    return Ok(new { status_code = 0, status_message = "Invalid Company ID." });
                }

                var query = context.tblCustomerSupplier
                    .Where(e => !e.IsDeleted && e.CompanyID == Companyid && e.IsSupplier == true);

                if (!string.IsNullOrWhiteSpace(businessName))
                {
                    query = query.Where(e => e.BusinessName.Contains(businessName));
                }

                if (!string.IsNullOrEmpty(accountCode))
                {
                    query = query.Where(e => e.AccountCode.StartsWith(accountCode));
                }

                if (!string.IsNullOrEmpty(field1) && field1 != "all")
                {
                    query = query.Where(e => e.Field1 == field1);
                }

                // Apply sorting
                switch (orderBy.ToLower())
                {
                    case "accountcode":
                        query = query.OrderBy(e => e.AccountNo);
                        break;
                    case "businessname":
                        query = query.OrderBy(e => e.BusinessName);
                        break;

                }
                query = query.OrderByDescending(e => e.ID);
                var data = await query.ToListAsync();

                if (!data.Any())
                {
                    return Ok(new { status_code = 0, message = "No Supplier Found." });
                }

                return Ok(new
                {
                    listofSuppliers = data,
                    status_code = 1,
                    totalRecords = data.Count,
                    status_message = "Successfully returning list of Suppliers"
                });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong." });
            }
        }


        [HttpGet("GetCustomerBy/{id}")]
        public async Task<ActionResult<CustomerSupplier>> GetRecord(int id)
        {
            try
            {
                var data = await context.tblCustomerSupplier.Where(e => e.IsDeleted == false && e.ID == id).FirstOrDefaultAsync();
                if (data == null)
                {
                    return Ok(new { status_code = 0, status_message = "Customer Not Found." });
                }
                return Ok(new { CustomerData = data, status_code = 1 });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong." });
            }
        }

        [HttpGet("GetSupplierBy/{id}")]
        public async Task<ActionResult<CustomerSupplier>> GetSupplierRecord(int id)
        {
            try
            {
                var data = await context.tblCustomerSupplier.Where(e => e.IsDeleted == false && e.ID == id).FirstOrDefaultAsync();
                if (data == null)
                {
                    return Ok(new { status_code = 0, status_message = "Supplier Not Found." });
                }
                return Ok(new { SupplierData = data, status_code = 1 });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong." });
            }
        }

        [HttpPatch]
        [Route("UpdateRecord/{id}")]
        public async Task<ActionResult<CustomerSupplier>> UpdateCustomer(int id, CustomerSupplier customer)
        {
            try
            {
                var existingCustomer = await context.tblCustomerSupplier.FindAsync(id);
                if (existingCustomer == null)
                {
                    return Ok(new { status_code = 0, status_message = "No Data Found." });
                }

                if (id != customer.ID)
                {
                    return Ok(new { status_code = 0, status_message = "Invalid ID." });
                }

                existingCustomer.BusinessName = customer.BusinessName;
                existingCustomer.Title = customer.Title;
                existingCustomer.FirstName = customer.FirstName;
                existingCustomer.LastName = customer.LastName;
                existingCustomer.Email = customer.Email;
                existingCustomer.Mobile = customer.Mobile;
                existingCustomer.Phone = customer.Phone;
                existingCustomer.Website = customer.Website;
                existingCustomer.BillingAddress = customer.BillingAddress;
                existingCustomer.City = customer.City;
                existingCustomer.Province = customer.Province;
                existingCustomer.PostalCode = customer.PostalCode;
                existingCustomer.Country = customer.Country;
                existingCustomer.NTNNumber = customer.NTNNumber;
                existingCustomer.CNIC = customer.CNIC;
                existingCustomer.SalesTaxNumber = customer.SalesTaxNumber;
                existingCustomer.PayementTermDays = customer.PayementTermDays;
                existingCustomer.CreditLimit = customer.CreditLimit;
                existingCustomer.Notes = customer.Notes;
                existingCustomer.OpeningDate = customer.OpeningDate;
                existingCustomer.CustomerOpeningBalance = customer.CustomerOpeningBalance;
                existingCustomer.CustomerBaseOpeningBalance = customer.CustomerBaseOpeningBalance;
                existingCustomer.SupplierOpeningBalance = customer.SupplierOpeningBalance;
                existingCustomer.SupplierBaseOpeningBalance = customer.SupplierBaseOpeningBalance;
                existingCustomer.IsCustomer = customer.IsCustomer;
                existingCustomer.IsSupplier = customer.IsSupplier;
                existingCustomer.Groups = customer.Groups;
                existingCustomer.Field1 = customer.Field1;
                existingCustomer.Field2 = customer.Field2;
                existingCustomer.Field3 = customer.Field3;
                existingCustomer.Field4 = customer.Field4;
                existingCustomer.SMSMobile = customer.SMSMobile;
                existingCustomer.WhatsAppMobile = customer.WhatsAppMobile;
                existingCustomer.IsActive = customer.IsActive;
                existingCustomer.IsDeleted = customer.IsDeleted;
                existingCustomer.Discount = customer.Discount;
                existingCustomer.IsFiler = customer.IsFiler;
                existingCustomer.Extra1 = customer.Extra1;
                existingCustomer.Extra2 = customer.Extra2;
                existingCustomer.Address = customer.Address;
                existingCustomer.SwiftCode = customer.SwiftCode;
                existingCustomer.IBANNumber = customer.IBANNumber;
                existingCustomer.AccountNumber = customer.AccountNumber;
                existingCustomer.AccountName = customer.AccountName;
                existingCustomer.BankName = customer.BankName;
                existingCustomer.ShippingAddress = customer.ShippingAddress;
                existingCustomer.ShippingCity = customer.ShippingCity;
                existingCustomer.ShippingCountry = customer.ShippingCountry;
                existingCustomer.ShippingPostalCode = customer.ShippingPostalCode;
                existingCustomer.ShippingProvince = customer.ShippingProvince;
                existingCustomer.UpdatedDate = DateTime.Now;

                // Mark the record as modified
                context.Entry(existingCustomer).State = EntityState.Modified;

                await context.SaveChangesAsync();

                return Ok(new { customer = existingCustomer, status_code = 1, status_message = "Updated Successfully." });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong." });
            }
        }

        [HttpPatch]
        [Route("DeleteRecord")]
        public async Task<ActionResult<CustomerSupplier>> UpdateStudent(GeneralRequest inParams)
        {
            try
            {
                var customer = await context.tblCustomerSupplier.FindAsync(inParams.ID);
                if (customer == null)
                {
                    return Ok(new { status_code = 0, status_message = "Customer Not Found." });
                }

                var Sales = await context.tblSaleHead.Where(s => s.CompanyID == customer.CompanyID && s.CustomerAccountCode == customer.AccountCode).ToListAsync();
                int saleCount = Sales.Count;

                var Receipts = await context.tblReceiptHead.Where(r => r.CompanyID == customer.CompanyID && r.CustomerAccountCode == customer.AccountCode).ToListAsync();
                int receiptCount = Receipts.Count;

                var Purchases = await context.tblPurchaseHead.Where(r => r.CompanyID == customer.CompanyID && r.SupplierAccountCode == customer.AccountCode).ToListAsync();
                int purchaseCount = Purchases.Count;

                var Payments = await context.tblPaymentHead.Where(r => r.CompanyID == customer.CompanyID && r.SupplierAccountCode == customer.AccountCode).ToListAsync();
                int paymentCount = Payments.Count;

                int totalTransactionCount = saleCount + receiptCount + purchaseCount + paymentCount;
                if (totalTransactionCount > 0)
                {
                    return Ok(new { status_code = 0, status_message = "Account used in transactions can't be deleted" });
                }

                customer.IsActive = false;
                customer.IsDeleted = true;
                customer.UpdatedDate = DateTime.Now;
                context.Entry(customer).State = EntityState.Modified;
                await context.SaveChangesAsync();

                return Ok(new { customer, status_code = 1, status_message = "Deleted Successfully." });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.", error = e.Message });
            }
        }


        [HttpPost("UploadCustomerExcel/{companyId}")]
        public async Task<IActionResult> UploadExcelFile([FromForm] IFormFile file, int companyId)
        {
            try
            {
                System.Text.Encoding.RegisterProvider(System.Text.CodePagesEncodingProvider.Instance);

                if (file == null || file.Length == 0)
                {
                    return Ok("No file uploaded");
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

                var customers = await context.tblCustomerSupplier
                    .Where(c => c.CompanyID == companyId)
                    .ToListAsync();

                var lastCustomer = customers
                    .Where(c => ParseInt(c.AccountCode) < 9000)
                    .OrderByDescending(c => ParseInt(c.AccountCode))
                    .FirstOrDefault();

                int nextAccountCode = lastCustomer != null
                              ? ParseInt(lastCustomer.AccountCode) + 1 ?? 1001
                              : 1001;

                // Process the file
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

                            var businessName = reader.GetValue(1)?.ToString();

                            // Validate the business name
                            if (string.IsNullOrWhiteSpace(businessName))
                            {
                                return Ok(new { status_code = 0, status_message = "BusinessName is required for all rows." });
                            }

                            // Check if customer with the current AccountCode exists
                            var accountCode = reader.GetValue(0)?.ToString();
                            var existingCustomer = await context.tblCustomerSupplier
                                .FirstOrDefaultAsync(c => c.CompanyID == companyId && c.AccountCode == accountCode);

                            if (existingCustomer != null)
                            {
                                // Update existing customer details
                                existingCustomer.AccountCode = accountCode;
                                existingCustomer.BusinessName = businessName;
                                existingCustomer.Title = reader.GetValue(2)?.ToString() ?? "";
                                existingCustomer.FirstName = reader.GetValue(3)?.ToString() ?? "";
                                existingCustomer.LastName = reader.GetValue(4)?.ToString() ?? "";
                                existingCustomer.Email = reader.GetValue(5)?.ToString() ?? "";
                                existingCustomer.Mobile = reader.GetValue(6)?.ToString() ?? "";
                                existingCustomer.CustomerOpeningBalance = ParseInt(reader.GetValue(7)?.ToString()) ?? 0;
                                existingCustomer.CustomerBaseOpeningBalance = ParseInt(reader.GetValue(8)?.ToString()) ?? 0;
                                existingCustomer.UpdatedDate = DateTime.Now;


                            }
                            else
                            {
                                // Create a new Customer instance
                                CustomerSupplier newCustomer = new CustomerSupplier
                                {
                                    CompanyID = companyId,
                                    BusinessName = businessName,
                                    Title = reader.GetValue(2)?.ToString() ?? "",
                                    FirstName = reader.GetValue(3)?.ToString() ?? "",
                                    LastName = reader.GetValue(4)?.ToString() ?? "",
                                    Email = reader.GetValue(5)?.ToString() ?? "",
                                    Mobile = reader.GetValue(6)?.ToString() ?? "",
                                    CustomerOpeningBalance = ParseInt(reader.GetValue(7)?.ToString()) ?? 0,
                                    CustomerBaseOpeningBalance = ParseInt(reader.GetValue(8)?.ToString()) ?? 0,
                                    AccountCode = nextAccountCode.ToString(),
                                    AccountNo = nextAccountCode.ToString(),
                                    CreatedDate = DateTime.Now,
                                    UpdatedDate = DateTime.Now,
                                    IsActive = true,
                                    IsDeleted = false,
                                    OpeningDate = DateOnly.FromDateTime(DateTime.Now),
                                    IsCustomer = true,
                                    IsSupplier = false,
                                    Phone = "",
                                    Website = "",
                                    BillingAddress = "",
                                    City = "",
                                    Province = "",
                                    PostalCode = "",
                                    Country = "",
                                    ShippingAddress = "",
                                    ShippingCountry = "",
                                    ShippingCity = "",
                                    ShippingPostalCode = "",
                                    ShippingProvince = "",
                                    NTNNumber = "",
                                    CNIC = "",
                                    SalesTaxNumber = "",
                                    PayementTermDays = 0,
                                    CreditLimit = 0,
                                    Notes = "",
                                    BankName = "",
                                    AccountName = "",
                                    AccountNumber = "",
                                    IBANNumber = "",
                                    SwiftCode = "",
                                    Address = "",
                                    Groups = "",
                                    Discount = 0,
                                    IsFiler = false,
                                    Field1 = "",
                                    Field2 = " ",
                                    Field3 = "",
                                    Field4 = " ",
                                    SMSMobile = "",
                                    WhatsAppMobile = "",
                                    FieldA = "",
                                    FieldB = " ",
                                    FieldC = "",
                                    FieldD = " ",
                                    Extra1 = " ",
                                    Extra2 = " ",
                                };

                                // Add the new customer to the context
                                await context.tblCustomerSupplier.AddAsync(newCustomer);

                                // Create an invoice for the new customer
                                await CreateInvoiceForCustomer(newCustomer);

                                // Increment the account code for the next customer
                                nextAccountCode++;
                            }
                        }

                        // Save all changes to the database
                        await context.SaveChangesAsync();
                    }
                }

                return Ok(new { status_message = "Customers Uploaded Successfully.", status_code = 0 });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong." });
            }
        }

        private async Task CreateInvoiceForCustomer(CustomerSupplier customer)
        {
            if (customer.CustomerBaseOpeningBalance != 0)
            {
                var OpeningBalanceProduct = await context.tblProducts
                    .Where(p => p.CompanyID == customer.CompanyID && p.CategoryCode == "cop")
                    .FirstOrDefaultAsync();

                if (OpeningBalanceProduct != null)
                {
                    SaleHead saleHead = new SaleHead
                    {
                        CustomerName = customer.BusinessName,
                        CustomerAccountCode = customer.AccountCode,
                        Address = customer.Address,
                        Date = customer.OpeningDate,
                        DueDate = customer.OpeningDate,
                        CompanyID = customer.CompanyID,
                        InvoiceNo = 0,
                        SaleType = customer.CustomerBaseOpeningBalance > 0 ? "Invoice" : "Credit",
                        CreatedDate = DateTime.Now,
                        UpdatedDate = DateTime.Now,
                        IsActive = true,
                        IsDeleted = false,
                        Total = Math.Abs(customer.CustomerBaseOpeningBalance ?? 0),
                        TermDays = 0,
                        DocNo = "COP",
                        CreditLimit = 0,
                        Balance = Math.Abs(customer.CustomerBaseOpeningBalance ?? 0),
                        Notes = "",
                        SubTotal = 0,
                        TotalDiscount = 0,
                        TotalSaleTax = 0,
                        Field1 = "",
                        Field2 = "",
                        OverallDiscount = 0,
                        InComplete = false,
                        SaleBy = "Admin"
                    };

                    SaleBody saleBody = new SaleBody
                    {
                        Product = OpeningBalanceProduct.Name,
                        Description = OpeningBalanceProduct.Name,
                        Amount = customer.CustomerBaseOpeningBalance,
                        CompanyID = customer.CompanyID,
                        InvoiceNo = 0,
                        SaleType = customer.CustomerBaseOpeningBalance > 0 ? "Invoice" : "Credit",
                        CreatedDate = DateTime.Now,
                        UpdatedDate = DateTime.Now,
                        IsActive = true,
                        IsDeleted = false,
                        Net = Math.Abs(customer.CustomerBaseOpeningBalance ?? 0),
                        Unit = "N/A",
                        Quantity = 0,
                        Rate = 0,
                        Discount = 0,
                        SaleTax = 0,
                        DiscPercentege = 0,
                        TaxRate = "",
                        Field1 = "",
                        Length = 0,
                        Weight = 0,
                        DefaultUnit = "Quantity",
                        Complete = false,
                        InComplete = false,
                        SaleBy = "Admin"
                    };

                    await context.tblSaleHead.AddAsync(saleHead);
                    await context.tblSaleBody.AddAsync(saleBody);
                }
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

        [HttpPost("UploadSupplierExcel/{companyId}")]
        public async Task<IActionResult> UploadSupplierExcelFile([FromForm] IFormFile file, int companyId)
        {
            try
            {
                System.Text.Encoding.RegisterProvider(System.Text.CodePagesEncodingProvider.Instance);

                // Check if a file is uploaded
                if (file == null || file.Length == 0)
                {
                    return Ok(new { status_message = "Please select a file.", status_code = 0 });
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

                // Fetch all customers for the company from the database
                var suppliers = await context.tblCustomerSupplier
                    .Where(c => c.CompanyID == companyId)
                    .ToListAsync();

                // Filter customers in memory where AccountCode < 9000
                var lastSupplier = suppliers
                    .Where(c => ParseInt(c.AccountCode) > 9000)
                    .OrderByDescending(c => ParseInt(c.AccountCode))
                    .FirstOrDefault();

                int nextAccountCode = lastSupplier != null
                              ? ParseInt(lastSupplier.AccountCode) + 1 ?? 9001
                              : 9001;


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

                            var businessName = reader.GetValue(1)?.ToString();

                            // Validate the business name
                            if (string.IsNullOrWhiteSpace(businessName))
                            {
                                return Ok(new { status_message = "BusinessName is required for all rows.", status_code = 0 });
                            }

                            var accountCode = reader.GetValue(0)?.ToString();
                            var existingSupplier = await context.tblCustomerSupplier
                                .FirstOrDefaultAsync(c => c.CompanyID == companyId && c.AccountCode == accountCode);

                            if (existingSupplier != null)
                            {
                                // Update existing customer details
                                existingSupplier.AccountCode = accountCode;
                                existingSupplier.BusinessName = businessName;
                                existingSupplier.Title = reader.GetValue(2)?.ToString() ?? "";
                                existingSupplier.FirstName = reader.GetValue(3)?.ToString() ?? "";
                                existingSupplier.LastName = reader.GetValue(4)?.ToString() ?? "";
                                existingSupplier.Email = reader.GetValue(5)?.ToString() ?? "";
                                existingSupplier.Mobile = reader.GetValue(6)?.ToString() ?? "";
                                existingSupplier.SupplierOpeningBalance = ParseInt(reader.GetValue(7)?.ToString()) ?? 0;
                                existingSupplier.SupplierBaseOpeningBalance = ParseInt(reader.GetValue(8)?.ToString()) ?? 0;
                                existingSupplier.UpdatedDate = DateTime.Now;


                            }
                            else
                            {


                                // Create a new Customer instance
                                CustomerSupplier supplier = new CustomerSupplier
                                {
                                    CompanyID = companyId,
                                    BusinessName = businessName,
                                    Title = reader.GetValue(2)?.ToString() ?? "",
                                    FirstName = reader.GetValue(3)?.ToString() ?? "",
                                    LastName = reader.GetValue(4)?.ToString() ?? "",
                                    Email = reader.GetValue(5)?.ToString() ?? "",
                                    Mobile = reader.GetValue(6)?.ToString() ?? "",
                                    SupplierOpeningBalance = ParseInt(reader.GetValue(7)?.ToString()) ?? 0,
                                    SupplierBaseOpeningBalance = ParseInt(reader.GetValue(8)?.ToString()) ?? 0,
                                    AccountCode = nextAccountCode.ToString(),
                                    AccountNo = nextAccountCode.ToString(),
                                    UpdatedDate = DateTime.Now,
                                    CreatedDate = DateTime.Now,
                                    IsActive = true,
                                    IsDeleted = false,
                                    Phone = "",
                                    Website = "",
                                    BillingAddress = "",
                                    City = "",
                                    Province = "",
                                    PostalCode = "",
                                    Country = "",
                                    ShippingAddress = "",
                                    ShippingCountry = "",
                                    ShippingCity = "",
                                    ShippingPostalCode = "",
                                    ShippingProvince = "",
                                    NTNNumber = "",
                                    CNIC = "",
                                    SalesTaxNumber = "",
                                    PayementTermDays = 0,
                                    CreditLimit = 0,
                                    Notes = "",
                                    BankName = "",
                                    AccountName = "",
                                    AccountNumber = "",
                                    IBANNumber = "",
                                    SwiftCode = "",
                                    Address = "",
                                    OpeningDate = DateOnly.FromDateTime(DateTime.Now),
                                    IsCustomer = false,
                                    IsSupplier = true,
                                    Groups = "",
                                    Discount = 0,
                                    IsFiler = false,
                                    Field1 = "",
                                    Field2 = " ",
                                    Field3 = "",
                                    Field4 = " ",
                                    SMSMobile = "",
                                    WhatsAppMobile = "",
                                    FieldA = "",
                                    FieldB = " ",
                                    FieldC = "",
                                    FieldD = " ",
                                    Extra1 = " ",
                                    Extra2 = " ",
                                };

                                // Increment the account code for the next customer

                                // Add the customer to the context
                                context.tblCustomerSupplier.Add(supplier);
                                await CreateBillForSupplier(supplier);
                            }

                            nextAccountCode++;



                        }

                        var result = await context.SaveChangesAsync();
                    }
                }

                return Ok(new { status_message = "Successfully Uploaded", status_code = 1 });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong." });
            }
        }

        private async Task CreateBillForSupplier(CustomerSupplier supplier)
        {
            if (supplier.SupplierBaseOpeningBalance != 0)
            {
                var OpeningBalanceProduct = await context.tblProducts
                    .Where(p => p.CompanyID == supplier.CompanyID && p.CategoryCode == "sop")
                    .FirstOrDefaultAsync();

                if (OpeningBalanceProduct != null)
                {
                    PurchaseHead AddPurchaseHead = new PurchaseHead
                    {
                        SupplierName = supplier.BusinessName,
                        SupplierAccountCode = supplier.AccountCode,
                        Address = supplier.Address,
                        Date = supplier.OpeningDate,
                        DueDate = supplier.OpeningDate,
                        CompanyID = supplier.CompanyID,
                        BillID = 0,
                        PurchaseType = supplier.SupplierBaseOpeningBalance > 0 ? "Bill" : "Credit",
                        CreatedDate = DateTime.Now,
                        UpdatedDate = DateTime.Now,
                        IsActive = true,
                        IsDeleted = false,
                        Total = Math.Abs(supplier.SupplierBaseOpeningBalance ?? 0),
                        TermDays = 0,
                        BillNumber = "SOP",
                        CreditLimit = 0,
                        Balance = Math.Abs(supplier.SupplierBaseOpeningBalance ?? 0),
                        Notes = "",
                        SubTotal = 0,
                        TotalDiscount = 0,
                        TotalSaleTax = 0,
                        Field1 = "",
                        Field2 = "",
                        Field3 = "",
                        Field4 = "",
                        InComplete = false,
                        PurchaseBy = "Admin",
                        AdjustedBalance = 0
                    };



                    PurchaseBody AddPurchaseBody = new PurchaseBody
                    {
                        Product = OpeningBalanceProduct.Name,
                        Description = OpeningBalanceProduct.Name,
                        Amount = supplier.SupplierBaseOpeningBalance,
                        CompanyID = supplier.CompanyID,
                        BillID = 0,
                        PurchaseType = supplier.SupplierBaseOpeningBalance > 0 ? "Bill" : "Credit",
                        CreatedDate = DateTime.Now,
                        UpdatedDate = DateTime.Now,
                        IsActive = true,
                        IsDeleted = false,
                        Net = Math.Abs(supplier.SupplierBaseOpeningBalance ?? 0),
                        Unit = "N/A",
                        Quantity = 0,
                        Rate = 0,
                        Discount = 0,
                        SaleTax = 0,
                        DiscPercentege = 0,
                        TaxRate = "",
                        Field1 = "",
                        Length = 0,
                        Weight = 0,
                        DefaultUnit = "Quantity",
                        InComplete = false,
                        PurchaseBy = "Admin"
                    };

                    await context.tblPurchaseHead.AddAsync(AddPurchaseHead);
                    await context.tblPurchaseBody.AddAsync(AddPurchaseBody);
                }
            }
        }


        [HttpPatch]
        [Route("UpdateRecords")]
        public async Task<ActionResult<IEnumerable<CustomerSupplier>>> UpdateRecords(IEnumerable<CustomerSupplier> Sale)
        {
            try
            {
                foreach (var saleBody in Sale)
                {
                    var existingSale = await context.tblCustomerSupplier.FindAsync(saleBody.ID);
                    if (existingSale == null)
                    {
                        return Ok(new { status_message = $"Record with ID {saleBody.ID} not found.", status_code = 0 });
                    }

                    existingSale.ID = saleBody.ID;
                    existingSale.CustomerOpeningBalance = saleBody.CustomerOpeningBalance;
                    existingSale.SupplierOpeningBalance = saleBody.SupplierOpeningBalance;
                    existingSale.CompanyID = saleBody.CompanyID;
                    existingSale.IsActive = saleBody.IsActive;
                    existingSale.IsDeleted = saleBody.IsDeleted;
                    existingSale.UpdatedDate = DateTime.Now;

                    context.Entry(existingSale).State = EntityState.Modified;
                }

                await context.SaveChangesAsync();

                return Ok(new { Sale, status_code = 1, status_message = "Updated Successfully." });
            }
            catch (Exception ex)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong." });
            }
        }




    }
}

