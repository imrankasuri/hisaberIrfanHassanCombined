using ExcelDataReader;
using HisaberAccountServer.Data;
using HisaberAccountServer.Models;
using HisaberAccountServer.Models.Sales;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HisaberAccountServer.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class SalesController : ControllerBase
    {
        private readonly HisaberDbContext context;
        private readonly UserManager<ApplicationUser> userManager;
        public SalesController(HisaberDbContext context, UserManager<ApplicationUser> userManager)
        {
            this.context = context;
            this.userManager = userManager;
        }

        [HttpPost("AddSale")]
        public async Task<IActionResult> AddSale([FromBody] SalesDTO inParams)
        {
            if (inParams == null)
            {
                return Ok(new { status_message = "Invoice data is null", status_code = 0 });
            }

            try
            {

                int referenceID = 0;

                var invoiceHeadData = inParams.SaleHead;
                if (invoiceHeadData == null || invoiceHeadData.Total == 0)
                {
                    return Ok(new { status_message = "Please enter valid invoice data.", status_code = 0 });
                }

                var saleBodyData = inParams.SaleBody;
                if (saleBodyData == null || saleBodyData.Count() < 1)
                {
                    return Ok(new { status_message = "Please add at least one product.", status_code = 0 });
                }

                var receiptHeadData = inParams.ReceiptHead;
                var receiptBodyData = inParams.ReceiptBody;
                if (receiptHeadData != null)
                {
                    if (receiptHeadData.Amount > 0 && receiptHeadData.Bank == null)
                    {
                        return Ok(new { status_message = "Please Select Bank.", status_code = 0 });
                    }

                    if (receiptHeadData.Amount > invoiceHeadData.Total)
                    {
                        return Ok(new { status_message = "Payment Amount should be less than or equal to Total Amount.", status_code = 0 });
                    }
                }

                var customer = await context.tblCustomerSupplier
                    .FirstOrDefaultAsync(c => c.CompanyID == invoiceHeadData.CompanyID && invoiceHeadData.CustomerAccountCode == c.AccountCode);

                if (customer == null)
                {
                    return Ok(new { status_message = "Customer not found.", status_code = 0 });
                }

                if (!string.IsNullOrWhiteSpace(invoiceHeadData.DocNo))
                {
                    bool docNoExists = await context.tblSaleHead
                        .AnyAsync(i => i.CompanyID == invoiceHeadData.CompanyID && !i.IsDeleted && i.DocNo == invoiceHeadData.DocNo);

                    if (docNoExists)
                    {
                        return Ok(new { status_message = "This Doc No already exists.", status_code = 0 });
                    }
                }


                // Calculate Balance
                decimal customerBalance = customer.CustomerOpeningBalance ?? 0;
                decimal invoiceTotal = invoiceHeadData.Total ?? 0;
                decimal paymentAmount = receiptHeadData?.Amount ?? 0;
                decimal adjustedBalance = 0;
                decimal balance = 0;
                if (invoiceHeadData.SaleType == "Invoice")
                {
                    if (receiptHeadData != null && receiptHeadData.Amount > 0)
                    {
                        balance = customerBalance < 0
                            ? customerBalance + invoiceTotal - paymentAmount
                            : invoiceTotal - paymentAmount;
                    }
                    else
                    {
                        balance = customerBalance < 0
                            ? customerBalance + invoiceTotal
                            : invoiceTotal;
                    }
                }
                else
                {
                    if (receiptHeadData != null && receiptHeadData.Amount > 0)
                    {
                        balance = customerBalance > 0
                            ? invoiceTotal - customerBalance - paymentAmount
                            : invoiceTotal - paymentAmount;
                    }
                    else
                    {
                        balance = customerBalance > 0
                            ? invoiceTotal - customerBalance
                            : invoiceTotal;
                    }
                }

                balance = Math.Max(balance, 0);

                adjustedBalance = invoiceTotal - balance;

                // Generate Invoice Number
                var lastSale = await context.tblSaleHead
                    .Where(p => p.CompanyID == invoiceHeadData.CompanyID)
                    .OrderByDescending(p => p.InvoiceNo)
                    .FirstOrDefaultAsync();

                invoiceHeadData.InvoiceNo = (lastSale?.InvoiceNo ?? 0) + 1;
                invoiceHeadData.Balance = balance;
                invoiceHeadData.AdjustedBalance = adjustedBalance;
                invoiceHeadData.CreatedDate = DateTime.Now;
                invoiceHeadData.UpdatedDate = DateTime.Now;
                referenceID = (int)(lastSale?.InvoiceNo ?? 0) + 1;

                // Add Invoice Data
                foreach (var salebody in saleBodyData)
                {
                    salebody.InvoiceNo = referenceID;
                    salebody.CreatedDate = DateTime.Now;
                    salebody.UpdatedDate = DateTime.Now;
                }
                await context.tblSaleHead.AddAsync(invoiceHeadData);
                await context.tblSaleBody.AddRangeAsync(saleBodyData);

                // Update Customer Balance
                if (invoiceHeadData.SaleType == "Invoice")
                {
                    customer.CustomerOpeningBalance = customerBalance + invoiceTotal - paymentAmount;
                }
                else
                {
                    customer.CustomerOpeningBalance = customerBalance - invoiceTotal + paymentAmount;
                }
                customer.UpdatedDate = DateTime.Now;
                context.tblCustomerSupplier.Update(customer);

                // Fetch Products and Update Quantities
                var productIds = saleBodyData.Select(sb => sb.ProductID).Distinct().Cast<int>();
                var products = await context.tblProducts
                    .Where(p => productIds.Contains(p.ID))
                    .ToDictionaryAsync(p => p.ID);

                foreach (var saleBody in saleBodyData)
                {

                    if (products.TryGetValue(saleBody.ProductID, out var product) && product.CompanyID == saleBody.CompanyID)
                    {
                        var quantityToDeduct = saleBody.DefaultUnit switch
                        {
                            "Quantity" => saleBody.Quantity ?? 0,
                            "Weight" => saleBody.Weight ?? 0,
                            "Length" => saleBody.Length ?? 0,
                            _ => 0
                        };
                        if (invoiceHeadData.SaleType == "Invoice")
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

                if (receiptHeadData != null && receiptBodyData?.Any() == true)
                {
                    if (paymentAmount > 0)
                    {
                        decimal receiptTotal = paymentAmount;

                        // Fetch the last receipt and determine the new VoucherNo
                        var lastReceipt = await context.tblReceiptHead
                            .Where(p => p.CompanyID == receiptHeadData.CompanyID)
                            .OrderByDescending(p => p.VoucherNo)
                            .FirstOrDefaultAsync();

                        receiptHeadData.VoucherNo = lastReceipt?.VoucherNo + 1 ?? 1;

                        var bank = await context.AccountMain.FirstOrDefaultAsync(a => a.AccountCode == receiptHeadData.BankCode && a.CompanyId == receiptHeadData.CompanyID);
                        if (bank != null)
                        {
                            receiptHeadData.BankID = bank.Id;
                            receiptHeadData.BankCode = bank.AccountCode;
                            receiptHeadData.Bank = bank.AccountDescription;
                        }
                        else
                        {
                            return Ok(new
                            {
                                status_message = "Invalid Bank Selected.",
                                status_code = 0,
                            });
                        }

                        // Calculate receipt totals
                        receiptHeadData.TotalReceipt = receiptTotal;
                        receiptHeadData.Amount = receiptHeadData.TotalReceipt;
                        receiptHeadData.TotalOpenBalance = invoiceHeadData.Total;
                        receiptHeadData.Total = receiptHeadData.TotalReceipt;
                        receiptHeadData.CreatedDate = DateTime.Now;
                        receiptHeadData.UpdatedDate = DateTime.Now;

                        // Add receipt head to the context
                        await context.tblReceiptHead.AddAsync(receiptHeadData);

                        // Update the first receipt body record
                        var firstReceiptBody = receiptBodyData.First();
                        firstReceiptBody.Receipt = receiptHeadData.TotalReceipt;
                        firstReceiptBody.Amount = invoiceHeadData.Total;
                        firstReceiptBody.Total = receiptHeadData.TotalReceipt;
                        firstReceiptBody.OpenBalance = invoiceHeadData.Total;
                        firstReceiptBody.CreatedDate = DateTime.Now;
                        firstReceiptBody.UpdatedDate = DateTime.Now;
                        firstReceiptBody.InvoiceNo = referenceID;
                        firstReceiptBody.VoucherNo = (int)receiptHeadData.VoucherNo;

                        // Add all receipt body records to the context
                        await context.tblReceiptBody.AddRangeAsync(receiptBodyData);
                    }
                }

                await context.SaveChangesAsync();

                return Ok(new
                {
                    status_message = "Sale added successfully.",
                    status_code = 1,
                    Sale = inParams.SaleHead,
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

        [HttpPost("GetSales")]
        public async Task<ActionResult> GetSales([FromBody] GeneralRequest inParams)
        {
            int Companyid = inParams.CompanyID;
            string customerName = inParams.AccountName ?? string.Empty;
            long invoiceNo = inParams.InvoiceNo;
            string orderBy = inParams.OrderBy ?? string.Empty;
            string saleType = inParams.Type ?? string.Empty;
            string docNo = inParams.DocNo ?? string.Empty;
            int pageSize = inParams.PageSize;
            int pageNumber = inParams.PageNo;
            string Incomplete = inParams.Email ?? string.Empty;

            if (Companyid <= 0)
            {
                return Ok(new { status_code = 0, status_message = "Invalid Company ID." });
            }

            try
            {
                var query = context.tblSaleHead
                    .Where(e => !e.IsDeleted && e.CompanyID == Companyid && e.InvoiceNo > 0);

                // Apply filters

                if (!string.IsNullOrWhiteSpace(inParams.AccountCode))
                {
                    query = query.Where(e => e.CustomerAccountCode == inParams.AccountCode);
                }

                if (!string.IsNullOrWhiteSpace(customerName))
                {
                    query = query.Where(e => e.CustomerName.Contains(customerName));
                }

                if (!string.IsNullOrWhiteSpace(docNo))
                {
                    query = query.Where(e => e.DocNo.Contains(docNo));
                }

                //if (!string.IsNullOrWhiteSpace(Incomplete))
                //{
                //    query = query.Where(e => e.InComplete == inParams.InComplete);
                //}

                if (invoiceNo > 0)
                {
                    query = query.Where(e => e.InvoiceNo == inParams.InvoiceNo);
                }
                if (inParams.ExcludeZero == true)
                {
                    query = query.Where(e => e.Balance > 0);
                }

                if (!string.IsNullOrWhiteSpace(saleType))
                {
                    query = saleType.Equals("Credit", StringComparison.OrdinalIgnoreCase)
                        ? query.Where(e => e.SaleType == "Credit")
                        : query.Where(e => e.SaleType == "Invoice");
                }

                if (inParams.Date != null)
                {
                    query = query.Where(e => e.Date == inParams.Date.Value);
                }

                // Sorting
                switch (orderBy.ToLower())
                {
                    case "customeraccountcode":
                        query = query.OrderBy(e => e.CustomerAccountCode);
                        break;
                    case "customername":
                        query = query.OrderBy(e => e.CustomerName);
                        break;
                    default:
                        query = query.OrderByDescending(e => e.ID);
                        break;
                }

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
                    listOfSales = paginatedData,
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

        [HttpPost("GetSaleDataForEdit")]
        public async Task<ActionResult> GetSaleDataForEdit([FromBody] GeneralRequest inParams)
        {
            int Companyid = inParams.CompanyID;
            int ID = inParams.ID;
            if (Companyid <= 0)
            {
                return Ok(new { status_code = 0, status_message = "Invalid Company ID." });
            }

            try
            {
                var saleHeadData = await context.tblSaleHead
                .Where(a => a.CompanyID == Companyid && a.InvoiceNo == ID && a.IsActive == true).FirstOrDefaultAsync();

                if (saleHeadData == null)
                {
                    return Ok(new
                    {
                        status_code = 0,
                        SaleHead = saleHeadData,
                        status_message = "Sale Data not found."
                    });
                }
                ;
                var listofSaleBody = await context.tblSaleBody.Where(a => a.CompanyID == Companyid && a.InvoiceNo == ID && a.IsActive == true).ToListAsync();

                var customer = await context.tblCustomerSupplier.Where(c => c.IsActive == true && c.CompanyID == saleHeadData.CompanyID && c.AccountCode == saleHeadData.CustomerAccountCode).FirstOrDefaultAsync();

                var user = await userManager.FindByIdAsync(saleHeadData.UserID ?? string.Empty);
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
                    SaleHead = saleHeadData,
                    ListofSaleBody = listofSaleBody,
                    Customer = customer,
                    User = user != null ? user.FullName : saleHeadData.SaleBy,
                    status_message = "Successfully returning Sales data."
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

        [HttpPatch("EditSale")]
        public async Task<IActionResult> EditSale([FromBody] SalesDTO inParams)
        {
            if (inParams == null)
            {
                return Ok(new { status_message = "Invoice data is null", status_code = 0 });
            }

            try
            {

                int referenceID = 0;

                var invoiceHeadData = inParams.SaleHead;
                if (invoiceHeadData == null || invoiceHeadData.Total == 0)
                {
                    return Ok(new { status_message = "Please enter valid invoice data.", status_code = 0 });
                }

                var saleBodyData = inParams.SaleBody;
                if (saleBodyData == null || saleBodyData.Count() < 1)
                {
                    return Ok(new { status_message = "Please add at least one product.", status_code = 0 });
                }

                var receiptHeadData = new ReceiptHead();
                var receiptBodyData = new List<ReceiptBody>();

                var customer = await context.tblCustomerSupplier
                    .FirstOrDefaultAsync(c => c.CompanyID == invoiceHeadData.CompanyID && invoiceHeadData.CustomerAccountCode == c.AccountCode && c.IsActive == true);

                var sh = await context.tblSaleHead.Where(s => s.InvoiceNo == invoiceHeadData.InvoiceNo && s.CompanyID == invoiceHeadData.CompanyID && s.IsActive == true).FirstOrDefaultAsync();
                if (sh == null)
                {
                    return Ok(new { status_message = "Sale not Found.", status_code = 0 });
                }
                decimal PrevSaleTotal = sh.Total ?? 0;

                var saleBodyList = await context.tblSaleBody.Where(p => p.InvoiceNo == sh.InvoiceNo && p.CompanyID == sh.CompanyID && p.IsActive == true).ToListAsync();

                var productIdsInBody = saleBodyList.Select(sb => sb.ProductID).Distinct().Cast<int>();
                var productsInBody = await context.tblProducts
                    .Where(p => productIdsInBody.Contains(p.ID))
                    .ToDictionaryAsync(p => p.ID);

                // Add Invoice Data
                foreach (var saleBody in saleBodyList)
                {
                    var sb = await context.tblSaleBody.FirstOrDefaultAsync(s => s.ID == saleBody.ID && s.CompanyID == saleBody.CompanyID && s.IsActive == true);
                    if (sb != null)
                    {

                        if (productsInBody.TryGetValue(saleBody.ProductID, out var product) && product.CompanyID == saleBody.CompanyID && product.IsActive == true)
                        {
                            var quantityToDeduct = saleBody.DefaultUnit switch
                            {
                                "Quantity" => saleBody.Quantity ?? 0,
                                "Weight" => saleBody.Weight ?? 0,
                                "Length" => saleBody.Length ?? 0,
                                _ => 0
                            };
                            if (invoiceHeadData.SaleType == "Invoice")
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

                receiptBodyData = await context.tblReceiptBody.Where(r => r.InvoiceNo == sh.InvoiceNo && r.CompanyID == sh.CompanyID && r.IsActive == true).ToListAsync();
                if (receiptBodyData != null && receiptBodyData.Any())
                {
                    var firstReceiptBody = receiptBodyData.First();
                    receiptHeadData = await context.tblReceiptHead
                        .Where(e => e.VoucherNo == firstReceiptBody.VoucherNo && e.IsDeleted == false && e.CompanyID == firstReceiptBody.CompanyID)
                        .FirstOrDefaultAsync();
                }

                if (customer == null)
                {
                    return Ok(new { status_message = "Customer not found.", status_code = 0 });
                }

                // Calculate Balance
                decimal customerBalance = customer.CustomerOpeningBalance ?? 0;
                decimal invoiceTotal = invoiceHeadData.Total ?? 0;
                decimal paymentAmount = receiptBodyData != null && receiptBodyData.Any()
                    ? receiptBodyData.First().Total ?? 0
                    : 0;

                if (paymentAmount > invoiceHeadData.Total)
                {
                    return Ok(new
                    {
                        status_message = "Invoice Total should be greater than already paid Balace i.e. " +
                        paymentAmount,
                        status_code = 0
                    });
                }
                decimal balance = invoiceTotal - sh.AdjustedBalance ?? 0;

                balance = Math.Max(balance, 0);


                if (sh != null)
                {
                    sh.CustomerName = invoiceHeadData.CustomerName;
                    sh.Address = invoiceHeadData.Address;
                    sh.Date = invoiceHeadData.Date;
                    sh.DueDate = invoiceHeadData.DueDate;
                    sh.TermDays = invoiceHeadData.TermDays;
                    sh.DocNo = invoiceHeadData.DocNo;
                    sh.CreditLimit = invoiceHeadData.CreditLimit;
                    sh.SubTotal = invoiceHeadData.SubTotal;
                    sh.CustomerAccountCode = invoiceHeadData.CustomerAccountCode;
                    sh.Balance = balance;
                    sh.Total = invoiceHeadData.Total;
                    sh.TotalDiscount = invoiceHeadData.TotalDiscount;
                    sh.TotalSaleTax = invoiceHeadData.TotalSaleTax;
                    sh.InComplete = invoiceHeadData.InComplete;
                    sh.UpdatedDate = DateTime.Now;
                    referenceID = (int)sh.InvoiceNo;
                }

                var productIds = saleBodyData
                            .Select(sb => sb.ProductID)
                            .Distinct();

                var products = await context.tblProducts
                    .Where(p => productIds.Contains(p.ID))
                    .ToDictionaryAsync(p => p.ID);

                // Process SaleBody Data
                foreach (var saleBody in saleBodyData)
                {

                    var sb = await context.tblSaleBody
                        .FirstOrDefaultAsync(s => s.ID == saleBody.ID && s.CompanyID == saleBody.CompanyID && s.IsActive);

                    var quantityToDeduct = saleBody.DefaultUnit switch
                    {
                        "Quantity" => saleBody.Quantity ?? 0,
                        "Weight" => saleBody.Weight ?? 0,
                        "Length" => saleBody.Length ?? 0,
                        _ => 0
                    };

                    if (products.TryGetValue(saleBody.ProductID, out var product)
                        && product.CompanyID == saleBody.CompanyID
                        && product.IsActive)
                    {
                        product.OpeningQuantity += invoiceHeadData.SaleType == "Invoice"
                            ? -quantityToDeduct
                            : quantityToDeduct;
                        product.UpdatedDate = DateTime.Now;
                    }

                    if (sb != null)
                    {
                        // Update existing SaleBody record
                        sb.Product = saleBody.Product;
                        sb.ProductID = saleBody.ProductID;
                        sb.Unit = saleBody.Unit;
                        sb.Quantity = saleBody.Quantity;
                        sb.Length = saleBody.Length;
                        sb.Weight = saleBody.Weight;
                        sb.InComplete = saleBody.InComplete;
                        sb.Rate = saleBody.Rate;
                        sb.DefaultUnit = saleBody.DefaultUnit;
                        sb.Amount = saleBody.Amount;
                        sb.UpdatedDate = DateTime.Now;
                        sb.Net = saleBody.Net;
                    }
                    else
                    {
                        // Add new SaleBody record
                        saleBody.InvoiceNo = referenceID;
                        await context.tblSaleBody.AddAsync(saleBody);
                    }
                }

                // Save changes to the database
                await context.SaveChangesAsync();


                // Update Customer Balance

                if (receiptHeadData != null && receiptBodyData != null && receiptBodyData.Count() > 0)
                {
                    receiptHeadData.TotalDiscount = sh?.TotalDiscount;
                    receiptHeadData.TotalOpenBalance = sh?.Total;
                    receiptHeadData.MailingAddress = sh?.Address;
                    receiptHeadData.UpdatedDate = DateTime.Now;

                    // Update the first receipt body record
                    var firstReceiptBody = receiptBodyData.First();
                    firstReceiptBody.Discount = sh?.TotalDiscount;
                    firstReceiptBody.OpenBalance = sh?.Total;
                    firstReceiptBody.Amount = sh?.Total;
                    firstReceiptBody.UpdatedDate = DateTime.Now;
                }
                if (sh?.SaleType == "Invoice")
                {
                    customer.CustomerOpeningBalance = customerBalance + invoiceTotal - PrevSaleTotal;
                }
                else
                {
                    customer.CustomerOpeningBalance = customerBalance - invoiceTotal + PrevSaleTotal;
                }
                customer.UpdatedDate = DateTime.Now;

                context.tblCustomerSupplier.Update(customer);

                await context.SaveChangesAsync();

                return Ok(new
                {
                    status_message = "Sale updated successfully.",
                    status_code = 1,
                    Sale = inParams.SaleHead,
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

        [HttpPatch("DeleteSale")]
        public async Task<IActionResult> DeleteSale([FromBody] GeneralRequest inParams)
        {
            if (inParams == null)
            {
                return Ok(new { status_message = "Invalid Sale to Delete.", status_code = 0 });
            }

            try
            {
                var sh = await context.tblSaleHead.FirstOrDefaultAsync(s => s.ID == inParams.ID && s.CompanyID == inParams.CompanyID && s.IsActive == true);
                if (sh == null)
                {
                    return Ok(new { status_message = "Sale not Found.", status_code = 0 });
                }

                decimal PrevSaleTotal = sh.Total ?? 0;
                if (sh.AdjustedBalance > 0)
                {
                    return Ok(new { status_message = "Paid Invoices can't be deleted.", status_code = 0 });
                }
                var customer = await context.tblCustomerSupplier
                    .FirstOrDefaultAsync(c => c.CompanyID == sh.CompanyID && sh.CustomerAccountCode == c.AccountCode && c.IsActive == true);

                if (customer == null)
                {
                    return Ok(new { status_message = "Customer not found.", status_code = 0 });
                }
                var sb = await context.tblSaleBody.Where(r => r.InvoiceNo == sh.InvoiceNo && r.CompanyID == sh.CompanyID && r.IsActive == true).ToListAsync();

                if (sh != null)
                {
                    sh.IsActive = false;
                    sh.IsDeleted = true;
                    sh.UpdatedDate = DateTime.Now;
                }
                var productIds = sb.Select(sb => sb.ProductID).Distinct().Cast<int>();
                var products = await context.tblProducts
                    .Where(p => productIds.Contains(p.ID))
                    .ToDictionaryAsync(p => p.ID);
                foreach (var saleBody in sb)
                {

                    if (products.TryGetValue(saleBody.ProductID, out var product) && product.CompanyID == saleBody.CompanyID)
                    {
                        var quantityToDeduct = saleBody.DefaultUnit switch
                        {
                            "Quantity" => saleBody.Quantity ?? 0,
                            "Weight" => saleBody.Weight ?? 0,
                            "Length" => saleBody.Length ?? 0,
                            _ => 0
                        };
                        if (sh?.SaleType == "Invoice")
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

                if (sh?.SaleType == "Invoice")
                {
                    customer.CustomerOpeningBalance = customer.CustomerOpeningBalance - PrevSaleTotal;
                }
                else
                {
                    customer.CustomerOpeningBalance = customer.CustomerOpeningBalance + PrevSaleTotal;
                }
                customer.UpdatedDate = DateTime.Now;


                context.tblCustomerSupplier.Update(customer);

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

        [HttpPost("AddReceipt")]
        public async Task<IActionResult> AddReceipt([FromBody] SalesDTO inParams)
        {
            if (inParams?.ReceiptHead == null || inParams.ReceiptHead.Total == 0)
            {
                return Ok(new { status_message = "Please enter valid receipt data.", status_code = 0 });
            }

            try
            {
                int referenceID;
                var receiptHead = inParams.ReceiptHead;
                var receiptBody = inParams.ReceiptBody;

                var customer = await context.tblCustomerSupplier
                    .FirstOrDefaultAsync(c => c.CompanyID == receiptHead.CompanyID && receiptHead.CustomerAccountCode == c.AccountCode);

                if (customer == null)
                {
                    return Ok(new { status_message = "Customer not found.", status_code = 0 });
                }

                // Calculate Balance
                decimal customerBalance = customer.CustomerOpeningBalance ?? 0;
                decimal paymentAmount = receiptHead.Total ?? 0;

                // Determine the new VoucherNo
                var lastReceipt = await context.tblReceiptHead
                    .Where(p => p.CompanyID == receiptHead.CompanyID)
                    .OrderByDescending(p => p.VoucherNo)
                    .FirstOrDefaultAsync();

                receiptHead.VoucherNo = (lastReceipt?.VoucherNo ?? 0) + 1;
                referenceID = (int)receiptHead.VoucherNo;

                var bank = await context.AccountMain
                    .FirstOrDefaultAsync(a => a.AccountCode == receiptHead.BankCode && a.CompanyId == receiptHead.CompanyID);

                if (bank == null)
                {
                    return Ok(new { status_message = "Invalid Bank Selected.", status_code = 0 });
                }

                receiptHead.BankID = bank.Id;
                receiptHead.Bank = bank.AccountDescription;
                receiptHead.UpdatedDate = receiptHead.CreatedDate = DateTime.Now;

                await context.tblReceiptHead.AddAsync(receiptHead);

                // Update Customer Balance
                customer.CustomerOpeningBalance = receiptHead.ReceiptType == "Receipt"
                    ? customerBalance - paymentAmount
                    : customerBalance + paymentAmount;
                customer.UpdatedDate = DateTime.Now;

                if (receiptBody != null && receiptBody.Any())
                {
                    var saleIds = receiptBody.Select(rb => rb.ID).Distinct();
                    var sales = await context.tblSaleHead
                        .Where(s => saleIds.Contains(s.ID))
                        .ToDictionaryAsync(s => s.ID);

                    foreach (var rb in receiptBody)
                    {
                        if (rb.InvoiceNo == 0)
                        {
                            customer.CustomerBaseOpeningBalance = rb.ReceiptType == "Receipt"
                                ? customer.CustomerBaseOpeningBalance - rb.Total
                                : customer.CustomerBaseOpeningBalance + rb.Total;
                        }

                        if (sales.TryGetValue(rb.ID, out var sale) && sale.CompanyID == rb.CompanyID)
                        {
                            sale.Balance -= rb.Total;
                            sale.AdjustedBalance += rb.Total;
                            sale.UpdatedDate = DateTime.Now;
                        }

                        rb.CreatedDate = rb.UpdatedDate = DateTime.Now;
                        rb.ID = 0;
                        rb.VoucherNo = referenceID;
                    }

                    await context.tblReceiptBody.AddRangeAsync(receiptBody);
                }

                await context.SaveChangesAsync();

                return Ok(new
                {
                    status_message = "Receipt added successfully.",
                    status_code = 1,
                    Receipt = receiptHead,
                    Voucher = referenceID
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

        [HttpPost("AddMultiReceipts")]
        public async Task<IActionResult> AddMultiReceipts([FromBody] SalesDTO inParams)
        {
            if (inParams.ListOfReceiptHead == null || inParams.ListOfReceiptHead.Count < 1)
            {
                return Ok(new { status_message = "Please enter valid receipt data.", status_code = 0 });
            }

            try
            {
                int referenceID;
                var ListOfReceiptHead = inParams.ListOfReceiptHead;


                foreach (var receiptHead in ListOfReceiptHead)
                {
                    if (receiptHead.CustomerName == null)
                    {
                        return Ok(new { status_message = "Please select Customer.", status_code = 0 });
                    }
                    if (receiptHead.Amount == null || receiptHead.Amount <= 0)
                    {
                        return Ok(new { status_message = "Please Enter Amount.", status_code = 0 });
                    }
                    var customer = await context.tblCustomerSupplier
                        .FirstOrDefaultAsync(c => c.CompanyID == receiptHead.CompanyID && receiptHead.CustomerAccountCode == c.AccountCode);

                    if (customer == null)
                    {
                        return Ok(new { status_message = "Customer not found.", status_code = 0 });
                    }

                    // Calculate Balance
                    decimal customerBalance = customer.CustomerOpeningBalance ?? 0;
                    decimal paymentAmount = receiptHead.Total ?? 0;

                    var lastReceipt = await context.tblReceiptHead
                        .Where(p => p.CompanyID == receiptHead.CompanyID)
                        .OrderByDescending(p => p.VoucherNo)
                        .FirstOrDefaultAsync();

                    receiptHead.VoucherNo = (lastReceipt?.VoucherNo ?? 0) + 1;
                    referenceID = (int)receiptHead.VoucherNo;

                    var bank = await context.AccountMain
                        .FirstOrDefaultAsync(a => a.AccountCode == receiptHead.BankCode && a.CompanyId == receiptHead.CompanyID);

                    if (bank == null)
                    {
                        return Ok(new { status_message = "Invalid Bank Selected.", status_code = 0 });
                    }

                    receiptHead.BankID = bank.Id;
                    receiptHead.Bank = bank.AccountDescription;
                    receiptHead.UpdatedDate = receiptHead.CreatedDate = DateTime.Now;

                    await context.tblReceiptHead.AddAsync(receiptHead);

                    // Update Customer Balance
                    customer.CustomerOpeningBalance = receiptHead.ReceiptType == "Receipt"
                        ? customerBalance - paymentAmount
                        : customerBalance + paymentAmount;
                    customer.UpdatedDate = DateTime.Now;

                    await context.SaveChangesAsync();
                }

                return Ok(new
                {
                    status_message = "Receipt added successfully.",
                    status_code = 1,
                    ReceiptHeads = ListOfReceiptHead,
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

        [HttpPost("GetReceiptDataForEdit")]
        public async Task<ActionResult> GetReceiptDataForEdit([FromBody] GeneralRequest inParams)
        {
            int Companyid = inParams.CompanyID;
            int ID = inParams.ID;
            if (Companyid <= 0)
            {
                return Ok(new { status_code = 0, status_message = "Invalid Company ID." });
            }

            try
            {
                var receiptHeadData = await context.tblReceiptHead
                .Where(a => a.CompanyID == Companyid && a.VoucherNo == ID && a.IsActive == true).FirstOrDefaultAsync();

                if (receiptHeadData == null)
                {
                    return Ok(new
                    {
                        status_code = 0,
                        SaleHead = receiptHeadData,
                        status_message = "Receipt Data not found."
                    });
                }
                ;
                var receiptBodyData = await context.tblReceiptBody.Where(a => a.CompanyID == Companyid && a.VoucherNo == ID && a.IsActive == true).ToListAsync();

                var customer = await context.tblCustomerSupplier.Where(c => c.IsActive == true && c.CompanyID == receiptHeadData.CompanyID && c.AccountCode == receiptHeadData.CustomerAccountCode).FirstOrDefaultAsync();

                var user = await userManager.FindByIdAsync(receiptHeadData.UserID ?? string.Empty);

                return Ok(new
                {
                    status_code = 1,
                    ReceiptHead = receiptHeadData,
                    ListofReceiptBody = receiptBodyData,
                    Customer = customer,
                    User = user != null ? user.FullName : receiptHeadData.ReceiptBy,
                    status_message = "Successfully returning Receipts data."
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

        [HttpPatch("EditReceipt")]
        public async Task<IActionResult> EditReceipt([FromBody] SalesDTO inParams)
        {
            if (inParams == null)
            {
                return Ok(new { status_message = "Invoice data is null", status_code = 0 });
            }

            try
            {

                int referenceID = 0;

                var receiptHeadData = inParams.ReceiptHead;
                var receiptBodyData = inParams.ReceiptBody;
                if (receiptHeadData == null || receiptHeadData.Total == 0)
                {
                    return Ok(new { status_code = 0, status_message = "Please enter valid receipt data." });
                }

                var rh = await context.tblReceiptHead.Where(r => r.VoucherNo == receiptHeadData.VoucherNo && r.CompanyID == receiptHeadData.CompanyID && r.IsActive == true).FirstOrDefaultAsync();

                if (rh == null)
                {
                    return Ok(new { status_message = "Receipt not Found.", status_code = 0 });
                }

                decimal PrevReceiptTotal = rh.Total ?? 0;
                decimal PrevUnallocated = rh.UnAllocatedBalance ?? 0;

                var customer = await context.tblCustomerSupplier
                    .FirstOrDefaultAsync(c => c.CompanyID == rh.CompanyID && rh.CustomerAccountCode == c.AccountCode && c.IsActive == true);

                if (customer == null)
                {
                    return Ok(new { status_message = "Customer not found.", status_code = 0 });
                }

                decimal customerBalance = customer.CustomerOpeningBalance ?? 0;
                decimal paymentAmount = rh.Total ?? 0;

                if (rh != null)
                {
                    rh.CustomerName = receiptHeadData.CustomerName;
                    rh.Date = receiptHeadData.Date;
                    rh.RefNo = receiptHeadData.RefNo;
                    rh.Mode = receiptHeadData.Mode;
                    rh.BankCode = receiptHeadData.BankCode;
                    var bank = await context.AccountMain.FirstOrDefaultAsync(a => a.AccountCode == receiptHeadData.BankCode && a.CompanyId == receiptHeadData.CompanyID);
                    if (bank != null)
                    {
                        rh.BankID = bank.Id;
                        rh.BankCode = bank.AccountCode;
                        rh.Bank = bank.AccountDescription;
                    }
                    else
                    {
                        return Ok(new
                        {
                            status_message = "Invalid Bank Selected.",
                            status_code = 0,
                        });
                    }
                    rh.Amount = receiptHeadData.Amount;
                    rh.CustomerAccountCode = receiptHeadData.CustomerAccountCode;
                    rh.WHTRate = receiptHeadData.WHTRate;
                    rh.AdditionalWHT = receiptHeadData.AdditionalWHT;
                    rh.Total = receiptHeadData.Total;
                    rh.InComplete = receiptHeadData.InComplete;
                    rh.TotalReceipt = receiptHeadData.TotalReceipt;
                    rh.TotalOpenBalance = receiptHeadData.TotalOpenBalance;
                    rh.TotalWHT = receiptHeadData.TotalWHT;
                    rh.TotalDiscount = receiptHeadData.TotalDiscount;
                    rh.MailingAddress = receiptHeadData.MailingAddress;
                    rh.UnAllocatedBalance = receiptHeadData.UnAllocatedBalance;
                    rh.UpdatedDate = DateTime.Now;
                    referenceID = (int)rh.VoucherNo;
                }

                if (receiptBodyData != null && receiptBodyData.Count() > 0)
                {
                    foreach (var receiptBody in receiptBodyData)
                    {
                        var rb = await context.tblReceiptBody.FirstOrDefaultAsync(s => s.ID == receiptBody.ID && s.CompanyID == receiptBody.CompanyID && s.IsActive == true);
                        if (rb != null)
                        {
                            if (receiptBody.InvoiceNo == 0)
                            {
                                customer.CustomerBaseOpeningBalance +=
                                    receiptBody.ReceiptType == "Receipt" ? -receiptBody.Total + rb.Total : receiptBody.Total - rb.Total;
                            }
                            var sh = await context.tblSaleHead.FirstOrDefaultAsync(s => s.InvoiceNo == rb.InvoiceNo && s.CompanyID == rb.CompanyID && rb.IsActive == true && s.CustomerAccountCode == receiptHeadData.CustomerAccountCode);
                            if (sh != null)
                            {
                                sh.Balance = receiptBody.OpenBalance > 0 ? receiptBody.OpenBalance - receiptBody.Total : 0;
                                sh.AdjustedBalance = sh.Total - sh.Balance;
                                sh.UpdatedDate = DateTime.Now;
                            }
                            rb.WHTRate = receiptBody.WHTRate;
                            rb.Discount = receiptBody.Discount;
                            rb.InComplete = receiptBody.InComplete;
                            rb.Receipt = receiptBody.Receipt;
                            rb.Total = receiptBody.Total;
                            rb.UpdatedDate = DateTime.Now;
                        }
                    }
                }
                if (receiptHeadData.ReceiptType == "Receipt")
                {
                    customer.CustomerOpeningBalance = customerBalance - rh?.Total + PrevReceiptTotal - rh?.UnAllocatedBalance + PrevUnallocated;
                }
                else
                {
                    customer.CustomerOpeningBalance = customerBalance + rh?.Total - PrevReceiptTotal + rh?.UnAllocatedBalance - PrevUnallocated;
                }
                customer.UpdatedDate = DateTime.Now;
                context.tblCustomerSupplier.Update(customer);

                await context.SaveChangesAsync();

                return Ok(new
                {
                    status_message = "Receipt updated successfully.",
                    status_code = 1,
                    Receipt = inParams.ReceiptHead,
                    Voucher = referenceID
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

        [HttpPatch("DeleteReceipt")]
        public async Task<IActionResult> DeleteReceipt([FromBody] GeneralRequest inParams)
        {
            if (inParams == null)
            {
                return Ok(new { status_message = "Invalid Receipt to Delete.", status_code = 0 });
            }

            try
            {
                var rh = await context.tblReceiptHead.FirstOrDefaultAsync(r => r.ID == inParams.ID && r.CompanyID == inParams.CompanyID && r.IsActive == true);

                if (rh == null)
                {
                    return Ok(new { status_message = "Receipt not Found.", status_code = 0 });
                }
                var rb = await context.tblReceiptBody.Where(r => r.VoucherNo == rh.VoucherNo && r.CompanyID == rh.CompanyID && r.IsActive == true).ToListAsync();

                decimal PrevReceiptTotal = rh.Total ?? 0;

                var customer = await context.tblCustomerSupplier
                    .FirstOrDefaultAsync(c => c.CompanyID == rh.CompanyID && c.AccountCode == rh.CustomerAccountCode && c.IsActive == true);

                if (customer == null)
                {
                    return Ok(new { status_message = "Customer not found.", status_code = 0 });
                }

                rh.IsActive = false;
                rh.IsDeleted = true;
                rh.UpdatedDate = DateTime.Now;

                foreach (var receiptBody in rb)
                {
                    if (receiptBody.InvoiceNo == 0)
                    {
                        customer.CustomerBaseOpeningBalance +=
                            receiptBody.ReceiptType == "Receipt" ? receiptBody.Total : -receiptBody.Total;
                    }
                    var sale = await context.tblSaleHead.Where(p => p.InvoiceNo == receiptBody.InvoiceNo && p.CustomerAccountCode == rh.CustomerAccountCode && p.IsActive == true && p.CompanyID == receiptBody.CompanyID).FirstOrDefaultAsync();

                    if (sale != null)
                    {
                        sale.Balance += receiptBody.Total;
                        sale.AdjustedBalance -= receiptBody.Total;
                        sale.UpdatedDate = DateTime.Now;
                    }

                    receiptBody.IsActive = false;
                    receiptBody.IsDeleted = true;
                    receiptBody.UpdatedDate = DateTime.Now;
                }

                if (rh?.ReceiptType == "Receipt")
                {
                    customer.CustomerOpeningBalance = customer.CustomerOpeningBalance + PrevReceiptTotal;
                }
                else
                {
                    customer.CustomerOpeningBalance = customer.CustomerOpeningBalance - PrevReceiptTotal;
                }
                customer.UpdatedDate = DateTime.Now;


                context.tblCustomerSupplier.Update(customer);

                await context.SaveChangesAsync();

                return Ok(new
                {
                    status_message = "Receipt Deleted successfully.",
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

        [HttpPost("AddSaleHeadArray")]
        public async Task<ActionResult<IEnumerable<SaleHead>>> AddStock(IEnumerable<SaleHead> saleBodies)
        {
            if (!ModelState.IsValid)
            {
                return Ok(ModelState);
            }

            try
            {
                // Initialize variable for tracking last InvoiceNo
                int nextInvoiceNo = 1;

                // Get the last sale for the company from any of the sale bodies
                if (saleBodies.Any())
                {
                    var companyId = saleBodies.First().CompanyID;
                    var lastSale = await context.tblSaleHead
                        .Where(p => p.CompanyID == companyId)
                        .OrderByDescending(p => p.InvoiceNo)
                        .FirstOrDefaultAsync();

                    // Set the next invoice number based on the last record
                    nextInvoiceNo = (int)(lastSale != null ? lastSale.InvoiceNo + 1 : 1);
                }

                // Assign InvoiceNo to each SaleHead in the collection
                foreach (var sale in saleBodies)
                {
                    sale.InvoiceNo = nextInvoiceNo++;
                    // Add any other logic you might need to process each SaleHead
                }

                // Add all the sale bodies to the context
                context.tblSaleHead.AddRange(saleBodies);
                await context.SaveChangesAsync();

                return Ok(new { saleBodies, status_code = 1, status_message = "Sale Added Successfully." });
            }
            catch (Exception ex)
            {
                return Ok(new { status_message = "Sorry! Something went wrong", status_code = 0, error = ex.Message });

            }
        }

        [HttpPost("UploadSaleExcel/{companyId}")]
        public async Task<IActionResult> UploadSaleExcelFile([FromForm] IFormFile file, int companyId)
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

                var invoice = await context.tblSaleHead
                    .Where(c => c.CompanyID == companyId)
                    .ToListAsync();

                var lastInvoice = invoice
                    .OrderByDescending(c => (c.InvoiceNo))
                    .FirstOrDefault();

                long nextAccountCode = lastInvoice != null
                    ? lastInvoice.InvoiceNo + 1
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

                            var customerName = reader.GetValue(0)?.ToString();

                            if (string.IsNullOrWhiteSpace(customerName))
                            {
                                return Ok(new { status_code = 0, status_message = "CustomerName is required for all rows." });
                            }

                            SaleHead sale = new SaleHead
                            {
                                CompanyID = companyId,
                                Date = reader.IsDBNull(1)
                                    ? DateOnly.FromDateTime(DateTime.Now)
                                    : DateOnly.FromDateTime(ConvertExcelValueToDate(reader.GetValue(1))),
                                DueDate = reader.IsDBNull(1)
                                    ? DateOnly.FromDateTime(DateTime.Now)
                                    : DateOnly.FromDateTime(ConvertExcelValueToDate(reader.GetValue(1))),
                                CustomerAccountCode = reader.GetValue(2)?.ToString() ?? "",
                                SaleType = reader.GetValue(3)?.ToString(),
                                Total = Convert.ToInt32(reader.GetValue(8)),
                                InvoiceNo = nextAccountCode,
                                CustomerName = customerName,
                                Address = "",
                                TermDays = 0,
                                DocNo = "",
                                CreditLimit = 0,
                                Balance = 0,
                                Notes = "",
                                SubTotal = 0,
                                TotalDiscount = 0,
                                TotalSaleTax = 0,
                                Field1 = "",
                                Field2 = "",
                                OverallDiscount = 0,
                                InComplete = false,
                                SaleBy = "Admin",
                                UpdatedDate = DateTime.Now,
                                CreatedDate = DateTime.Now,
                                IsActive = true,
                                IsDeleted = false,
                            };

                            // Create a new SaleBody instance
                            SaleBody saleBody = new SaleBody
                            {
                                CompanyID = companyId,
                                Product = reader.GetValue(4)?.ToString(),
                                Unit = reader.GetValue(5)?.ToString() ?? "N/A",
                                Quantity = Convert.ToInt32(reader.GetValue(6)),
                                Rate = Convert.ToDecimal(reader.GetValue(7)),
                                Amount = Convert.ToDecimal(reader.GetValue(8)),
                                SaleType = reader.GetValue(3)?.ToString(),
                                InvoiceNo = (int)nextAccountCode,
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
                                Complete = false,
                                InComplete = false,
                                SaleBy = "Admin",
                                UpdatedDate = DateTime.Now,
                                CreatedDate = DateTime.Now,
                                IsActive = true,
                                IsDeleted = false,
                            };

                            nextAccountCode++;

                            context.tblSaleHead.Add(sale);
                            context.tblSaleBody.Add(saleBody);

                            var customer = await context.tblCustomerSupplier
                                .FirstOrDefaultAsync(c => c.AccountCode == sale.CustomerAccountCode && c.CompanyID == companyId);

                            if (customer != null)
                            {
                                if (sale.SaleType == "Invoice")
                                {
                                    customer.CustomerOpeningBalance = (customer.CustomerOpeningBalance) + (decimal)sale.Total;
                                }
                                else if (sale.SaleType == "Credit")
                                {
                                    customer.CustomerOpeningBalance = (customer.CustomerOpeningBalance) - (decimal)sale.Total;
                                }

                                context.tblCustomerSupplier.Update(customer);
                            }
                            else
                            {
                                return Ok(new { status_code = 0, status_message = $"Customer with account code {sale.CustomerAccountCode} not found." });
                            }

                            var product = await context.tblProducts
                                .FirstOrDefaultAsync(p => p.Name == saleBody.Product && p.CompanyID == companyId);

                            if (product != null)
                            {
                                product.OpeningQuantity = product.OpeningQuantity - (saleBody.Quantity ?? 0);

                                context.tblProducts.Update(product);
                            }
                            else
                            {
                                return Ok(new { status_code = 0, status_message = $"Product {saleBody.Product} not found. First Add it." });
                            }
                        }

                        var result = await context.SaveChangesAsync();
                    }
                }

                return Ok(new { status_code = 0, status_message = "Successfully inserted" });
            }
            catch (Exception e)
            {
                return Ok(new { status_message = "Sorry! Something went wrong", status_code = 0, error = e.Message });
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

        [HttpPost("AddSaleBody")]
        public async Task<ActionResult<IEnumerable<SaleBody>>> AddStock(IEnumerable<SaleBody> saleBodies)
        {
            if (!ModelState.IsValid)
            {
                return Ok(new { status_code = 0, status_message = "Sale Data is Null." });
            }
            try
            {
                context.tblSaleBody.AddRange(saleBodies);

                await context.SaveChangesAsync();

                return Ok(new { saleBodies, status_code = 1, status_message = "Sale Added Successfully" });
            }
            catch (Exception ex)
            {
                return Ok(new { status_message = "Sorry! Something went wrong", status_code = 0, error = ex.Message });

            }
        }

        [HttpPatch("DeleteRecord")]
        public async Task<IActionResult> DeleteSaleRecord([FromBody] GeneralRequest inParams)
        {
            try
            {
                var saleBody = await context.tblSaleBody.FindAsync(inParams.ID);

                if (saleBody == null)
                {
                    return Ok(new
                    {
                        status_code = 0,
                        status_message = "Invalid ID. Sale record not found."
                    });
                }

                var product = await context.tblProducts.FirstOrDefaultAsync(p => p.ID == saleBody.ProductID && p.CompanyID == saleBody.CompanyID);
                if (product != null)
                {
                    var quantityToDeduct = saleBody.DefaultUnit switch
                    {
                        "Quantity" => saleBody.Quantity ?? 0,
                        "Weight" => saleBody.Weight ?? 0,
                        "Length" => saleBody.Length ?? 0,
                        _ => 0
                    };
                    if (saleBody.SaleType == "Invoice")
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
                saleBody.IsDeleted = true;
                saleBody.IsActive = false;
                saleBody.UpdatedDate = DateTime.Now;

                await context.SaveChangesAsync();

                return Ok(new
                {
                    saleBody,
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

        [HttpGet("GetByBalance/{Companyid}")]
        public async Task<ActionResult> GetByBalance(
                 int Companyid,
                 string customerCode = "",
                 string saleType = "")
        {
            if (Companyid <= 0)
            {
                return Ok(new { status_code = 0, status_message = "Invalid Company ID." });
            }

            try
            {
                var query = context.tblSaleHead
                    .Where(e => !e.IsDeleted && e.CompanyID == Companyid && e.Balance > 0 && e.CustomerAccountCode == customerCode);


                if (!string.IsNullOrWhiteSpace(saleType))
                {
                    query = saleType.Equals("Credit", StringComparison.OrdinalIgnoreCase)
                        ? query.Where(e => e.SaleType == "Credit")
                        : query.Where(e => e.SaleType == "Invoice");
                }
                query = query.OrderBy(e => e.Date);
                var data = await query.ToListAsync();

                if (data.Count == 0)
                {
                    return Ok(new { status_code = 0, status_message = "No Sale Found." });
                }

                return Ok(new
                {
                    listOfSales = data,
                    status_code = 1,
                    totalRecords = data.Count
                });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.", e.Message });
            }
        }

    }
}