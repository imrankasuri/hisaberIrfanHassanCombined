using HisaberAccountServer.Data;
using HisaberAccountServer.Models;
using HisaberAccountServer.Models.Bank;
using HisaberAccountServer.Models.Purchase;
using HisaberAccountServer.Models.Sales;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.Design;
using System.Linq;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace HisaberAccountServer.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class PurchaseController : ControllerBase
    {
        private readonly HisaberDbContext context;
        private readonly UserManager<ApplicationUser> userManager;
        public PurchaseController(HisaberDbContext context, UserManager<ApplicationUser> userManager)
        {
            this.context = context;
            this.userManager = userManager;
        }

        [HttpPost("AddPurchase")]
        public async Task<IActionResult> AddPurchase([FromBody] PurchasesDTO inParams)
        {
            if (inParams == null)
            {
                return Ok(new { status_message = "Purchase data is null", status_code = 0 });
            }

            try
            {

                int referenceID = 0;

                var purchaseHeadData = inParams.PurchaseHead;
                if (purchaseHeadData == null || purchaseHeadData.Total == 0)
                {
                    return Ok(new { status_message = "Please enter valid bill data.", status_code = 0 });
                }

                var purchaseBodyData = inParams.PurchaseBody;
                if (purchaseBodyData == null || purchaseBodyData.Count() < 1)
                {
                    return Ok(new { status_message = "Please add at least one product.", status_code = 0 });
                }

                var paymentHeadData = inParams.PaymentHead;
                var paymentBodyData = inParams.PaymentBody;
                var expenseData = inParams.ExpenseData;
                if (paymentHeadData != null)
                {
                    if (paymentHeadData.Amount > 0 && paymentHeadData.Bank == null)
                    {
                        return Ok(new { status_message = "Please Select Bank.", status_code = 0 });
                    }

                    if (paymentHeadData.Amount > purchaseHeadData.Total)
                    {
                        return Ok(new { status_message = "Payment Amount should less than or equal to Total Amount.", status_code = 0 });
                    }
                }

                var supplier = await context.tblCustomerSupplier
                    .FirstOrDefaultAsync(c => c.CompanyID == purchaseHeadData.CompanyID && purchaseHeadData.SupplierAccountCode == c.AccountCode);

                if (supplier == null)
                {
                    return Ok(new { status_message = "Supplier not found.", status_code = 0 });
                }

                if (!string.IsNullOrWhiteSpace(purchaseHeadData.BillNumber))
                {
                    bool docNoExists = await context.tblPurchaseHead
                .AnyAsync(i => i.CompanyID == purchaseHeadData.CompanyID && !i.IsDeleted && i.BillNumber == purchaseHeadData.BillNumber);

                    if (docNoExists)
                    {
                        return Ok(new { status_message = "This Bill No already exists.", status_code = 0 });
                    }
                }

                // Calculate Balance
                decimal supplierBalance = supplier.SupplierOpeningBalance ?? 0;
                decimal purchaseTotal = purchaseHeadData.Total ?? 0;
                decimal paymentAmount = paymentHeadData?.Amount ?? 0;
                decimal adjustedBalance = 0;
                decimal balance = 0;
                if (purchaseHeadData.PurchaseType == "Bill")
                {
                    if (paymentHeadData != null && paymentHeadData.Amount > 0)
                    {
                        balance = supplierBalance < 0
                            ? supplierBalance + purchaseTotal - paymentAmount
                            : purchaseTotal - paymentAmount;
                    }
                    else
                    {
                        balance = supplierBalance < 0
                            ? supplierBalance + purchaseTotal
                            : purchaseTotal;
                    }
                }
                else
                {
                    if (paymentHeadData != null && paymentHeadData.Amount > 0)
                    {
                        balance = supplierBalance > 0
                            ? purchaseTotal - supplierBalance - paymentAmount
                            : purchaseTotal - paymentAmount;
                    }
                    else
                    {
                        balance = supplierBalance > 0
                            ? purchaseTotal - supplierBalance
                            : purchaseTotal;
                    }
                }

                balance = Math.Max(balance, 0);

                adjustedBalance = purchaseTotal - balance;

                // Generate Bill Number
                var lastSale = await context.tblPurchaseHead
                    .Where(p => p.CompanyID == purchaseHeadData.CompanyID)
                    .OrderByDescending(p => p.BillID)
                    .FirstOrDefaultAsync();

                purchaseHeadData.BillID = (lastSale?.BillID ?? 0) + 1;
                purchaseHeadData.Balance = balance;
                purchaseHeadData.AdjustedBalance = adjustedBalance;
                purchaseHeadData.CreatedDate = DateTime.Now;
                purchaseHeadData.UpdatedDate = DateTime.Now;
                referenceID = (int)(lastSale?.BillID ?? 0) + 1;

                // Add Purchase Data
                foreach (var purchaseBody in purchaseBodyData)
                {
                    purchaseBody.BillID = referenceID;
                    purchaseBody.CreatedDate = DateTime.Now;
                    purchaseBody.UpdatedDate = DateTime.Now;
                }
                await context.tblPurchaseHead.AddAsync(purchaseHeadData);
                await context.tblPurchaseBody.AddRangeAsync(purchaseBodyData);

                //// Update supplier Balance
                if (purchaseHeadData.PurchaseType == "Bill")
                {
                    supplier.SupplierOpeningBalance = supplierBalance + purchaseTotal - paymentAmount;
                }
                else
                {
                    supplier.SupplierOpeningBalance = supplierBalance - purchaseTotal + paymentAmount;
                }
                supplier.UpdatedDate = DateTime.Now;
                context.tblCustomerSupplier.Update(supplier);

                // Fetch Products and Update Quantities
                var productIds = purchaseBodyData.Select(sb => sb.ProductID).Distinct().Cast<int>();
                var products = await context.tblProducts
                    .Where(p => productIds.Contains(p.ID))
                    .ToDictionaryAsync(p => p.ID);

                foreach (var purchaseBody in purchaseBodyData)
                {

                    if (products.TryGetValue(purchaseBody.ProductID, out var product) && product.CompanyID == purchaseBody.CompanyID)
                    {
                        var quantityToDeduct = purchaseBody.DefaultUnit switch
                        {
                            "Quantity" => purchaseBody.Quantity ?? 0,
                            "Weight" => purchaseBody.Weight ?? 0,
                            "Length" => purchaseBody.Length ?? 0,
                            _ => 0
                        };
                        if (purchaseHeadData.PurchaseType == "Bill")
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

                if (paymentHeadData != null && paymentBodyData?.Any() == true)
                {
                    if (paymentAmount > 0)
                    {
                        // Fetch the last receipt and determine the new VoucherNo
                        var lastPayment = await context.tblPaymentHead
                            .Where(p => p.CompanyID == paymentHeadData.CompanyID)
                            .OrderByDescending(p => p.VoucherNo)
                            .FirstOrDefaultAsync();

                        paymentHeadData.VoucherNo = lastPayment?.VoucherNo + 1 ?? 1;

                        var bank = await context.AccountMain.FirstOrDefaultAsync(a => a.AccountCode == paymentHeadData.BankCode && a.CompanyId == paymentHeadData.CompanyID);
                        if (bank != null)
                        {
                            paymentHeadData.BankID = bank.Id;
                            paymentHeadData.BankCode = bank.AccountCode;
                            paymentHeadData.Bank = bank.AccountDescription;
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
                        paymentHeadData.TotalPayment = paymentAmount;
                        paymentHeadData.Amount = paymentHeadData.TotalPayment;
                        paymentHeadData.TotalOpenBalance = purchaseHeadData.Total;
                        paymentHeadData.Total = paymentHeadData.TotalPayment;
                        paymentHeadData.CreatedDate = DateTime.Now;
                        paymentHeadData.UpdatedDate = DateTime.Now;

                        await context.tblPaymentHead.AddAsync(paymentHeadData);

                        var firstPaymentBody = paymentBodyData.First();
                        firstPaymentBody.Payment = paymentHeadData.TotalPayment;
                        firstPaymentBody.Amount = purchaseHeadData.Total;
                        firstPaymentBody.Total = paymentHeadData.TotalPayment;
                        firstPaymentBody.OpenBalance = purchaseHeadData.Total;
                        firstPaymentBody.CreatedDate = DateTime.Now;
                        firstPaymentBody.UpdatedDate = DateTime.Now;
                        firstPaymentBody.BillID = referenceID;
                        firstPaymentBody.VoucherNo = (int)paymentHeadData.VoucherNo;

                        await context.tblPaymentBody.AddRangeAsync(paymentBodyData);
                    }
                }


                if (expenseData != null && expenseData.Any())
                {

                    var validExpenses = expenseData.Where(expense =>
                        expense.Amount > 0 &&
                        !string.IsNullOrEmpty(expense.NominalAccountCode) &&
                        !string.IsNullOrEmpty(expense.BankCode) &&
                        !string.IsNullOrWhiteSpace(expense.NominalAccountCode) &&
                        !string.IsNullOrWhiteSpace(expense.BankCode)
                    ).ToList();


                    if (validExpenses.Any())
                    {
                        foreach (var expense in validExpenses)
                        {

                            var nominalAccount = await context.AccountMain
                                .FirstOrDefaultAsync(a => a.AccountCode == expense.NominalAccountCode &&
                                                        a.CompanyId == expense.CompanyID);

                            var expenseBank = await context.AccountMain
                                .FirstOrDefaultAsync(a => a.AccountCode == expense.BankCode &&
                                                        a.CompanyId == expense.CompanyID);


                            if (nominalAccount == null || expenseBank == null)
                            {
                                continue;
                            }


                            var lastBankPayment = await context.tblBankPayments
                                .Where(bp => bp.CompanyID == expense.CompanyID)
                                .OrderByDescending(bp => bp.VoucherNo)
                                .FirstOrDefaultAsync();

                            var newVoucherNo = (lastBankPayment?.VoucherNo ?? 0) + 1;


                            var bankPaymentEntry = new BankPayments
                            {
                                VoucherNo = newVoucherNo,
                                RefNo = expense.RefNo,
                                Mode = expense.Mode ?? "Cash",
                                NominalAccount = nominalAccount.AccountDescription,
                                NominalAccountCode = expense.NominalAccountCode,
                                Date = expense.Date,
                                BankCode = expense.BankCode,
                                BankID = expenseBank.Id,
                                Amount = expense.Amount,
                                Bank = expenseBank.AccountDescription,
                                Detail = expense.Detail ?? "",
                                CompanyID = expense.CompanyID,
                                UserID = expense.UserID,
                                IsActive = expense.IsActive,
                                IsDeleted = expense.IsDeleted,
                                CreatedDate = DateTime.Now,
                                UpdatedDate = DateTime.Now,
                                BankPaymentBy = expense.BankPaymentBy ?? "",
                                BankPayment = true,
                                BankReceipt = false,
                                BankPaymentType = expense.BankPaymentType ?? "Expense",
                                ReferenceID = referenceID
                            };

                            await context.tblBankPayments.AddAsync(bankPaymentEntry);
                        }
                    }

                }

                await context.SaveChangesAsync();

                return Ok(new
                {
                    status_message = "Purchase added successfully.",
                    status_code = 1,
                    Purchase = inParams.PurchaseHead,
                    Bill = referenceID
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

        [HttpPost("GetPurchases")]
        public async Task<ActionResult> GetPurchases([FromBody] GeneralRequest inParams)
        {
            int Companyid = inParams.CompanyID;
            string supplierName = inParams.AccountName ?? string.Empty;
            long billId = inParams.BillID;
            string orderBy = inParams.OrderBy ?? string.Empty;
            string purchaseType = inParams.Type ?? string.Empty;
            string docNo = inParams.DocNo ?? string.Empty;
            int pageSize = inParams.PageSize;
            int pageNumber = inParams.PageNo;

            if (Companyid <= 0)
            {
                return Ok(new { status_code = 0, status_message = "Invalid Company ID." });
            }

            try
            {
                var query = context.tblPurchaseHead
                .Where(e => !e.IsDeleted && e.CompanyID == Companyid && e.BillID > 0);

                // Apply filters
                if (!string.IsNullOrWhiteSpace(supplierName))
                {
                    query = query.Where(e => e.SupplierName.Contains(supplierName));
                }

                if (!string.IsNullOrWhiteSpace(docNo))
                {
                    query = query.Where(e => e.BillNumber.Contains(docNo));
                }

                //query = query.Where(e => e.InComplete == inParams.InComplete);

                if (billId > 0)
                {
                    query = query.Where(e => e.BillID == inParams.BillID);
                }

                if (!string.IsNullOrWhiteSpace(purchaseType))
                {
                    query = purchaseType.Equals("Credit", StringComparison.OrdinalIgnoreCase)
                        ? query.Where(e => e.PurchaseType == "Credit")
                        : query.Where(e => e.PurchaseType == "Bill");
                }

                if (inParams.Date != null)
                {
                    query = query.Where(e => e.Date == inParams.Date.Value);
                }

                // Sorting
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
                    listOfPurchases = paginatedData,
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

        [HttpPost("GetPurchaseDataForEdit")]
        public async Task<ActionResult> GetPurchaseDataForEdit([FromBody] GeneralRequest inParams)
        {
            int Companyid = inParams.CompanyID;
            int ID = inParams.ID;
            if (Companyid <= 0)
            {
                return Ok(new { status_code = 0, status_message = "Invalid Company ID." });
            }

            try
            {
                var purchaseHeadData = await context.tblPurchaseHead
                .Where(a => a.CompanyID == Companyid && a.BillID == ID && a.IsActive == true).FirstOrDefaultAsync();

                if (purchaseHeadData == null)
                {
                    return Ok(new
                    {
                        status_code = 0,
                        SaleHead = purchaseHeadData,
                        status_message = "Purchase Data not found."
                    });
                }
                ;
                var purchaseBodyData = await context.tblPurchaseBody.Where(a => a.CompanyID == Companyid && a.BillID == ID && a.IsActive == true).ToListAsync();

                var supplier = await context.tblCustomerSupplier.Where(c => c.IsActive == true && c.CompanyID == purchaseHeadData.CompanyID && c.AccountCode == purchaseHeadData.SupplierAccountCode).FirstOrDefaultAsync();

                var expenseData = await context.tblBankPayments.Where(b => b.IsActive == true && b.CompanyID == purchaseHeadData.CompanyID && b.ReferenceID == ID).ToListAsync();

                var user = await userManager.FindByIdAsync(purchaseHeadData.UserID ?? string.Empty);
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
                    PurchaseHead = purchaseHeadData,
                    ListofPurchaseBody = purchaseBodyData,
                    Supplier = supplier,
                    ExpenseData = expenseData,
                    User = user != null ? user.FullName : purchaseHeadData.PurchaseBy,
                    status_message = "Successfully returning purchase data."
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

        [HttpPatch("EditPurchase")]
        public async Task<IActionResult> EditPurchase([FromBody] PurchasesDTO inParams)
        {
            if (inParams == null)
            {
                return Ok(new { status_message = "Bill data is null", status_code = 0 });
            }

            try
            {

                int referenceID = 0;

                var purchaseHeadData = inParams.PurchaseHead;
                if (purchaseHeadData == null || purchaseHeadData.Total == 0)
                {
                    return Ok(new { status_message = "Please enter valid bill data.", status_code = 0 });
                }

                var purchaseBodyData = inParams.PurchaseBody;
                if (purchaseBodyData == null || purchaseBodyData.Count() < 1)
                {
                    return Ok(new { status_message = "Please add at least one product.", status_code = 0 });
                }

                var expenseData = inParams.ExpenseData;
                var paymentHeadData = new PaymentHead();
                var paymentBodyData = new List<PaymentBody>();

                var supplier = await context.tblCustomerSupplier
                    .FirstOrDefaultAsync(c => c.CompanyID == purchaseHeadData.CompanyID && purchaseHeadData.SupplierAccountCode == c.AccountCode && c.IsActive == true);

                var ph = await context.tblPurchaseHead.Where(s => s.BillID == purchaseHeadData.BillID && s.CompanyID == purchaseHeadData.CompanyID && s.IsActive == true).FirstOrDefaultAsync();

                if (ph == null)
                {
                    return Ok(new { status_message = "Purchase not Found.", status_code = 0 });
                }
                decimal PrevPurchaseTotal = ph.Total ?? 0;

                var purchaseBodyList = await context.tblPurchaseBody.Where(p => p.BillID == ph.BillID && p.CompanyID == p.CompanyID && p.IsActive == true).ToListAsync();

                var productIdsInBody = purchaseBodyList.Select(sb => sb.ProductID).Distinct().Cast<int>();
                var productsInBody = await context.tblProducts
                    .Where(p => productIdsInBody.Contains(p.ID))
                    .ToDictionaryAsync(p => p.ID);

                // Add Invoice Data
                foreach (var purchaseBody in purchaseBodyList)
                {
                    var pb = await context.tblPurchaseBody.FirstOrDefaultAsync(s => s.ID == purchaseBody.ID && s.CompanyID == purchaseBody.CompanyID && s.IsActive == true);
                    if (pb != null)
                    {

                        if (productsInBody.TryGetValue(purchaseBody.ProductID, out var product) && product.CompanyID == purchaseBody.CompanyID && product.IsActive == true)
                        {

                            var quantityToDeduct = purchaseBody.DefaultUnit switch
                            {
                                "Quantity" => purchaseBody.Quantity ?? 0,
                                "Weight" => purchaseBody.Weight ?? 0,
                                "Length" => purchaseBody.Length ?? 0,
                                _ => 0
                            };
                            if (purchaseHeadData.PurchaseType == "Bill")
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
                }

                paymentBodyData = await context.tblPaymentBody.Where(r => r.BillID == ph.BillID && r.CompanyID == ph.CompanyID && r.IsActive == true).ToListAsync();

                if (paymentBodyData != null && paymentBodyData.Any())
                {
                    var firstPaymentBody = paymentBodyData.First();
                    paymentHeadData = await context.tblPaymentHead
                        .Where(e => e.VoucherNo == firstPaymentBody.VoucherNo && e.IsDeleted == false && e.CompanyID == firstPaymentBody.CompanyID)
                        .FirstOrDefaultAsync();
                }


                if (supplier == null)
                {
                    return Ok(new { status_message = "Supplier not found.", status_code = 0 });
                }

                // Calculate Balance
                decimal supplierBalance = supplier.SupplierOpeningBalance ?? 0;
                decimal purchaseTotal = purchaseHeadData.Total ?? 0;
                decimal paymentAmount = paymentBodyData != null && paymentBodyData.Any()
                    ? paymentBodyData.First().Total ?? 0
                    : 0;

                if (paymentAmount > purchaseHeadData.Total)
                {
                    return Ok(new
                    {
                        status_message = "Invoice Total should be greater than already paid Balace i.e. " +
                        paymentAmount,
                        status_code = 0
                    });
                }

                decimal balance = purchaseTotal - ph.AdjustedBalance ?? 0;

                balance = Math.Max(balance, 0);



                if (ph != null)
                {
                    ph.SupplierName = purchaseHeadData.SupplierName;
                    ph.Address = purchaseHeadData.Address;
                    ph.Date = purchaseHeadData.Date;
                    ph.DueDate = purchaseHeadData.DueDate;
                    ph.TermDays = purchaseHeadData.TermDays;
                    ph.BillNumber = purchaseHeadData.BillNumber;
                    ph.CreditLimit = purchaseHeadData.CreditLimit;
                    ph.SupplierAccountCode = purchaseHeadData.SupplierAccountCode;
                    ph.Balance = balance;
                    ph.SubTotal = purchaseHeadData.SubTotal;
                    ph.Total = purchaseHeadData.Total;
                    ph.TotalDiscount = purchaseHeadData.TotalDiscount;
                    ph.TotalSaleTax = purchaseHeadData.TotalSaleTax;
                    ph.InComplete = purchaseHeadData.InComplete;
                    ph.UpdatedDate = DateTime.Now;
                    referenceID = (int)ph.BillID;
                }

                var productIds = purchaseBodyData
                        .Select(pb => pb.ProductID)
                        .Distinct();

                var products = await context.tblProducts
                    .Where(p => productIds.Contains(p.ID))
                    .ToDictionaryAsync(p => p.ID);

                // Process PurchaseBody Data
                foreach (var purchaseBody in purchaseBodyData)
                {

                    // Retrieve existing PurchaseBody record
                    var pb = await context.tblPurchaseBody
                        .FirstOrDefaultAsync(p => p.ID == purchaseBody.ID && p.CompanyID == purchaseBody.CompanyID && p.IsActive);

                    // Determine quantity to adjust
                    var quantityToAdjust = purchaseBody.DefaultUnit switch
                    {
                        "Quantity" => purchaseBody.Quantity ?? 0,
                        "Weight" => purchaseBody.Weight ?? 0,
                        "Length" => purchaseBody.Length ?? 0,
                        _ => 0
                    };

                    if (products.TryGetValue(purchaseBody.ProductID, out var product)
                        && product.CompanyID == purchaseBody.CompanyID
                        && product.IsActive)
                    {
                        // Adjust product quantity
                        product.OpeningQuantity += purchaseHeadData.PurchaseType == "Bill"
                            ? quantityToAdjust
                            : -quantityToAdjust;
                        product.UpdatedDate = DateTime.Now;
                    }

                    if (pb != null)
                    {
                        // Update existing PurchaseBody record
                        pb.Product = purchaseBody.Product;
                        pb.ProductID = purchaseBody.ProductID;
                        pb.Unit = purchaseBody.Unit;
                        pb.Quantity = purchaseBody.Quantity;
                        pb.Length = purchaseBody.Length;
                        pb.Weight = purchaseBody.Weight;
                        pb.InComplete = purchaseBody.InComplete;
                        pb.Rate = purchaseBody.Rate;
                        pb.DefaultUnit = purchaseBody.DefaultUnit;
                        pb.Amount = purchaseBody.Amount;
                        pb.UpdatedDate = DateTime.Now;
                        pb.Net = purchaseBody.Net;
                    }
                    else
                    {
                        // Add new PurchaseBody record
                        purchaseBody.BillID = referenceID;
                        await context.tblPurchaseBody.AddAsync(purchaseBody);
                    }
                }

                // Save changes to the database
                await context.SaveChangesAsync();


                // Update Customer Balance

                if (paymentHeadData != null && paymentBodyData != null && paymentBodyData.Count() > 0)
                {
                    paymentHeadData.TotalDiscount = ph?.TotalDiscount;
                    paymentHeadData.TotalOpenBalance = ph?.Total;
                    paymentHeadData.MailingAddress = ph?.Address;
                    paymentHeadData.UpdatedDate = DateTime.Now;

                    // Update the first receipt body record
                    var firstPaymentBody = paymentBodyData.First();
                    firstPaymentBody.Discount = ph?.TotalDiscount;
                    firstPaymentBody.OpenBalance = purchaseHeadData.Total;
                    firstPaymentBody.UpdatedDate = DateTime.Now;
                    firstPaymentBody.Amount = purchaseHeadData.Total;
                }

                if (ph?.PurchaseType == "Bill")
                {
                    supplier.SupplierOpeningBalance = supplierBalance + purchaseTotal - PrevPurchaseTotal;
                }
                else
                {
                    supplier.SupplierOpeningBalance = supplierBalance - purchaseTotal + PrevPurchaseTotal;
                }
                supplier.UpdatedDate = DateTime.Now;


                context.tblCustomerSupplier.Update(supplier);
                if (expenseData != null && expenseData.Any())
                {
                    foreach (var expense in expenseData)
                    {

                        var ed = await context.tblBankPayments.FindAsync(expense.ID);

                        var bank = await context.AccountMain.FirstOrDefaultAsync(a => a.AccountCode == expense.BankCode && a.CompanyId == expense.CompanyID);
                        if (bank == null)
                        {
                            return Ok(new
                            {
                                status_message = "Invalid Bank Selected.",
                                status_code = 0,
                            });
                        }

                        if (ed != null)
                        {
                            ed.RefNo = expense.RefNo;
                            ed.NominalAccount = expense.NominalAccount;
                            ed.NominalAccountCode = expense.NominalAccountCode;
                            ed.Date = expense.Date;
                            ed.BankCode = expense.BankCode;
                            ed.BankID = expense.BankID;
                            ed.Amount = expense.Amount;
                            ed.Bank = bank.AccountDescription;
                            ed.Detail = expense.Detail;
                            ed.UpdatedDate = DateTime.Now;
                        }
                        else
                        {
                            var lastBankPayment = await context.tblBankPayments
                                .Where(bp => bp.CompanyID == expense.CompanyID)
                                .OrderByDescending(bp => bp.VoucherNo)
                                .FirstOrDefaultAsync();

                            var newVoucherNo = (lastBankPayment?.VoucherNo ?? 0) + 1;


                            var bankPaymentEntry = new BankPayments
                            {
                                VoucherNo = newVoucherNo,
                                RefNo = expense.RefNo,
                                Mode = "Cash",
                                NominalAccount = expense.NominalAccount,
                                NominalAccountCode = expense.NominalAccountCode,
                                Date = expense.Date,
                                BankCode = expense.BankCode,
                                BankID = expense.BankID,
                                Amount = expense.Amount,
                                Bank = bank.AccountDescription,
                                Detail = expense.Detail,
                                CompanyID = expense.CompanyID,
                                UserID = expense.UserID,
                                IsActive = expense.IsActive,
                                IsDeleted = expense.IsDeleted,
                                CreatedDate = DateTime.Now,
                                UpdatedDate = DateTime.Now,
                                BankPaymentBy = expense.BankPaymentBy,
                                BankPayment = true,
                                BankReceipt = false,
                                BankPaymentType = expense.BankPaymentType,
                                ReferenceID = referenceID
                            };

                            await context.tblBankPayments.AddAsync(bankPaymentEntry);
                            await context.SaveChangesAsync();
                        }
                    }
                }


                await context.SaveChangesAsync();

                return Ok(new
                {
                    status_message = "Purchase updated successfully.",
                    status_code = 1,
                    Purchase = inParams.PurchaseHead,
                    Bill = referenceID
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

        [HttpPatch("DeletePurchase")]
        public async Task<IActionResult> DeletePurchase([FromBody] GeneralRequest inParams)
        {
            if (inParams == null)
            {
                return Ok(new { status_message = "Invalid Purchase to Delete.", status_code = 0 });
            }

            try
            {
                var ph = await context.tblPurchaseHead.FirstOrDefaultAsync(s => s.ID == inParams.ID && s.CompanyID == inParams.CompanyID && s.IsActive == true);
                if (ph == null)
                {
                    return Ok(new { status_message = "Purchase not Found.", status_code = 0 });
                }

                decimal PrevPurchaseTotal = ph.Total ?? 0;
                if (ph.AdjustedBalance > 0)
                {
                    return Ok(new { status_message = "Paid Purchases can't be deleted.", status_code = 0 });
                }
                var supplier = await context.tblCustomerSupplier
                    .FirstOrDefaultAsync(c => c.CompanyID == ph.CompanyID && c.AccountCode == ph.SupplierAccountCode && c.IsActive == true);

                if (supplier == null)
                {
                    return Ok(new { status_message = "Supplier not found.", status_code = 0 });
                }
                var pb = await context.tblPurchaseBody.Where(r => r.BillID == ph.BillID && r.CompanyID == ph.CompanyID && r.IsActive == true).ToListAsync();

                if (ph != null)
                {
                    ph.IsActive = false;
                    ph.IsDeleted = true;
                    ph.UpdatedDate = DateTime.Now;
                }
                var productIds = pb.Select(sb => sb.ProductID).Distinct().Cast<int>();
                var products = await context.tblProducts
                    .Where(p => productIds.Contains(p.ID))
                    .ToDictionaryAsync(p => p.ID);

                foreach (var purchaseBody in pb)
                {
                    if (products.TryGetValue(purchaseBody.ProductID, out var product) && product.CompanyID == purchaseBody.CompanyID)
                    {
                        var quantityToDeduct = purchaseBody.DefaultUnit switch
                        {
                            "Quantity" => purchaseBody.Quantity ?? 0,
                            "Weight" => purchaseBody.Weight ?? 0,
                            "Length" => purchaseBody.Length ?? 0,
                            _ => 0
                        };
                        if (ph?.PurchaseType == "Bill")
                        {
                            product.OpeningQuantity -= quantityToDeduct;
                        }
                        else
                        {
                            product.OpeningQuantity += quantityToDeduct;
                        }
                        product.UpdatedDate = DateTime.Now;
                    }


                    purchaseBody.IsActive = false;
                    purchaseBody.IsDeleted = true;
                    purchaseBody.UpdatedDate = DateTime.Now;
                }

                if (ph?.PurchaseType == "Bill")
                {
                    supplier.SupplierOpeningBalance = supplier.SupplierOpeningBalance - PrevPurchaseTotal;
                }
                else
                {
                    supplier.SupplierOpeningBalance = supplier.SupplierOpeningBalance + PrevPurchaseTotal;
                }
                supplier.UpdatedDate = DateTime.Now;


                context.tblCustomerSupplier.Update(supplier);

                await context.SaveChangesAsync();

                return Ok(new
                {
                    status_message = "Purchase Deleted successfully.",
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

        [HttpPatch("DeleteExpense")]
        public async Task<IActionResult> DeleteExpense([FromBody] GeneralRequest inParams)
        {
            try
            {
                var expense = await context.tblBankPayments.FindAsync(inParams.ID);

                if (expense == null)
                {
                    return Ok(new
                    {
                        status_code = 0,
                        status_message = "Invalid ID. Expense record not found."
                    });
                }
                // Mark the record as deleted
                expense.IsDeleted = true;
                expense.IsActive = false;
                expense.UpdatedDate = DateTime.Now;

                await context.SaveChangesAsync();

                return Ok(new
                {
                    expense,
                    status_code = 1,
                    status_message = "Expense deleted successfully."
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

        [HttpPost("AddPayment")]
        public async Task<IActionResult> AddPayment([FromBody] PurchasesDTO inParams)
        {
            if (inParams == null)
            {
                return Ok(new { status_message = "Payment data is null", status_code = 0 });
            }

            try
            {
                if (inParams.PaymentHead == null || inParams.PaymentHead.Total == 0)
                {
                    return Ok(new { status_message = "Please enter valid payment data.", status_code = 0 });
                }

                var paymentHead = inParams.PaymentHead;
                var paymentBody = inParams.PaymentBody;

                // Validate Supplier
                var supplier = await context.tblCustomerSupplier
                    .FirstOrDefaultAsync(c => c.CompanyID == paymentHead.CompanyID && c.AccountCode == paymentHead.SupplierAccountCode);

                if (supplier == null)
                {
                    return Ok(new { status_message = "Supplier not found.", status_code = 0 });
                }

                // Calculate Supplier Balance
                decimal supplierBalance = supplier.SupplierOpeningBalance ?? 0;
                decimal paymentAmount = paymentHead.Total ?? 0;

                // Generate Voucher Number
                var lastPayment = await context.tblPaymentHead
                    .Where(p => p.CompanyID == paymentHead.CompanyID)
                    .OrderByDescending(p => p.VoucherNo)
                    .FirstOrDefaultAsync();

                paymentHead.VoucherNo = (lastPayment?.VoucherNo ?? 0) + 1;
                paymentHead.CreatedDate = paymentHead.UpdatedDate = DateTime.Now;

                // Validate and Assign Bank Information
                var bank = await context.AccountMain
                    .FirstOrDefaultAsync(a => a.AccountCode == paymentHead.BankCode && a.CompanyId == paymentHead.CompanyID);

                if (bank == null)
                {
                    return Ok(new { status_message = "Invalid Bank Selected.", status_code = 0 });
                }

                paymentHead.BankID = bank.Id;
                paymentHead.BankCode = bank.AccountCode;

                // Update Supplier Balance
                supplier.SupplierOpeningBalance = paymentHead.PurchaseType == "Payment"
                    ? supplierBalance - paymentAmount
                    : supplierBalance + paymentAmount;
                supplier.UpdatedDate = DateTime.Now;

                await context.tblPaymentHead.AddAsync(paymentHead);

                if (paymentBody != null && paymentBody.Any())
                {
                    var purchaseIds = paymentBody.Select(pb => pb.ID).Distinct();
                    var purchases = await context.tblPurchaseHead
                        .Where(p => purchaseIds.Contains(p.ID))
                        .ToDictionaryAsync(p => p.ID);

                    foreach (var body in paymentBody)
                    {
                        if (body.BillID == 0)
                        {
                            supplier.SupplierBaseOpeningBalance = body.PurchaseType == "Payment"
                                ? supplier.SupplierBaseOpeningBalance - body.Total
                                : supplier.SupplierBaseOpeningBalance + body.Total;
                        }

                        if (purchases.TryGetValue(body.ID, out var purchase))
                        {
                            if (purchase.CompanyID == body.CompanyID)
                            {
                                purchase.Balance -= body.Total;
                                purchase.AdjustedBalance += body.Total;
                                purchase.UpdatedDate = DateTime.Now;
                            }
                        }

                        body.ID = 0;
                        body.VoucherNo = (int)paymentHead.VoucherNo;
                        body.CreatedDate = body.UpdatedDate = DateTime.Now;
                    }

                    await context.tblPaymentBody.AddRangeAsync(paymentBody);
                }

                await context.SaveChangesAsync();

                return Ok(new
                {
                    status_message = "Payment added successfully.",
                    status_code = 1,
                    Receipt = paymentHead,
                    Voucher = paymentHead.VoucherNo
                });
            }
            catch (Exception ex)
            {
                return Ok(new
                {
                    status_message = "Sorry! Something went wrong.",
                    status_code = 0,
                    error = ex.Message
                });
            }
        }

        [HttpPost("AddMultiPayments")]
        public async Task<IActionResult> AddMultiPayments([FromBody] PurchasesDTO inParams)
        {
            if (inParams.ListOfPaymentHead == null || inParams.ListOfPaymentHead.Count < 1)
            {
                return Ok(new { status_message = "Please enter valid receipt data.", status_code = 0 });
            }

            try
            {
                int referenceID;
                var ListOfPaymentHead = inParams.ListOfPaymentHead;


                foreach (var paymentHead in ListOfPaymentHead)
                {
                    if (paymentHead.SupplierName == null)
                    {
                        return Ok(new { status_message = "Please select Supplier.", status_code = 0 });
                    }
                    if (paymentHead.Amount == null || paymentHead.Amount <= 0)
                    {
                        return Ok(new { status_message = "Please Enter Amount.", status_code = 0 });
                    }
                    var supplier = await context.tblCustomerSupplier
                        .FirstOrDefaultAsync(c => c.CompanyID == paymentHead.CompanyID && paymentHead.SupplierAccountCode == c.AccountCode);

                    if (supplier == null)
                    {
                        return Ok(new { status_message = "Supplier not found.", status_code = 0 });
                    }

                    // Calculate Balance
                    decimal supplierBalance = supplier.SupplierOpeningBalance ?? 0;
                    decimal paymentAmount = paymentHead.Total ?? 0;

                    // Determine the new VoucherNo
                    var lastReceipt = await context.tblPaymentHead
                        .Where(p => p.CompanyID == paymentHead.CompanyID)
                        .OrderByDescending(p => p.VoucherNo)
                        .FirstOrDefaultAsync();

                    paymentHead.VoucherNo = (lastReceipt?.VoucherNo ?? 0) + 1;
                    referenceID = (int)paymentHead.VoucherNo;

                    var bank = await context.AccountMain
                        .FirstOrDefaultAsync(a => a.AccountCode == paymentHead.BankCode && a.CompanyId == paymentHead.CompanyID);

                    if (bank == null)
                    {
                        return Ok(new { status_message = "Invalid Bank Selected.", status_code = 0 });
                    }

                    paymentHead.BankID = bank.Id;
                    paymentHead.Bank = bank.AccountDescription;
                    paymentHead.UpdatedDate = paymentHead.CreatedDate = DateTime.Now;

                    await context.tblPaymentHead.AddAsync(paymentHead);

                    // Update Customer Balance
                    supplier.SupplierOpeningBalance = paymentHead.PurchaseType == "Payment"
                    ? supplierBalance - paymentAmount
                    : supplierBalance + paymentAmount;
                    supplier.UpdatedDate = DateTime.Now;

                    await context.SaveChangesAsync();
                }

                return Ok(new
                {
                    status_message = "Payment added successfully.",
                    status_code = 1,
                    PaymentHeads = ListOfPaymentHead,
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

        [HttpPost("GetPaymentDataForEdit")]
        public async Task<ActionResult> GetPaymentDataForEdit([FromBody] GeneralRequest inParams)
        {
            int Companyid = inParams.CompanyID;
            int ID = inParams.ID;
            if (Companyid <= 0)
            {
                return Ok(new { status_code = 0, status_message = "Invalid Company ID." });
            }

            try
            {
                var paymentHead = await context.tblPaymentHead
                .Where(a => a.CompanyID == Companyid && a.VoucherNo == ID && a.IsActive == true).FirstOrDefaultAsync();

                if (paymentHead == null)
                {
                    return Ok(new
                    {
                        status_code = 0,
                        SaleHead = paymentHead,
                        status_message = "Payment Data not found."
                    });
                }
                ;
                var paymentBody = await context.tblPaymentBody.Where(a => a.CompanyID == Companyid && a.VoucherNo == ID && a.IsActive == true).ToListAsync();

                var supplier = await context.tblCustomerSupplier.Where(c => c.IsActive == true && c.CompanyID == paymentHead.CompanyID && c.AccountCode == paymentHead.SupplierAccountCode).FirstOrDefaultAsync();

                var user = await userManager.FindByIdAsync(paymentHead.UserID ?? string.Empty);

                return Ok(new
                {
                    status_code = 1,
                    PaymentHead = paymentHead,
                    ListofPaymentBody = paymentBody,
                    Supplier = supplier,
                    User = user != null ? user.FullName : paymentHead.PurchaseBy,
                    status_message = "Successfully returning Payment data."
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

        [HttpPatch("EditPayment")]
        public async Task<IActionResult> EditPayment([FromBody] PurchasesDTO inParams)
        {
            if (inParams == null)
            {
                return Ok(new { status_message = "Payment data is null", status_code = 0 });
            }

            try
            {

                int referenceID = 0;

                var paymentHead = inParams.PaymentHead;
                var paymentBody = inParams.PaymentBody;

                if (paymentHead == null || paymentHead.Total == 0)
                {
                    return Ok(new { status_code = 0, status_message = "Please enter valid receipt data." });
                }

                var ph = await context.tblPaymentHead.Where(r => r.VoucherNo == paymentHead.VoucherNo && r.CompanyID == paymentHead.CompanyID && r.IsActive == true).FirstOrDefaultAsync();

                if (ph == null)
                {
                    return Ok(new { status_message = "Payment not Found.", status_code = 0 });
                }

                decimal PrevPaymentTotal = ph.Total ?? 0;
                decimal PrevUnallocated = ph.UnAllocatedBalance ?? 0;

                var supplier = await context.tblCustomerSupplier
                    .FirstOrDefaultAsync(c => c.CompanyID == ph.CompanyID && c.AccountCode == ph.SupplierAccountCode && c.IsActive == true);

                if (supplier == null)
                {
                    return Ok(new { status_message = "Supplier not found.", status_code = 0 });
                }

                decimal supplierBalance = supplier.SupplierOpeningBalance ?? 0;
                decimal paymentAmount = ph.Total ?? 0;

                if (ph != null)
                {
                    ph.SupplierName = paymentHead.SupplierName;
                    ph.Date = paymentHead.Date;
                    ph.RefNo = paymentHead.RefNo;
                    ph.Mode = paymentHead.Mode;
                    ph.BankCode = paymentHead.BankCode;
                    var bank = await context.AccountMain.FirstOrDefaultAsync(a => a.AccountCode == paymentHead.BankCode && a.CompanyId == paymentHead.CompanyID);
                    if (bank == null)
                    {
                        return Ok(new
                        {
                            status_message = "Invalid Bank Selected.",
                            status_code = 0,
                        });
                    }
                    ph.BankID = bank.Id;
                    ph.BankCode = bank.AccountCode;
                    ph.Bank = bank.AccountDescription;
                    ph.Amount = paymentHead.Amount;
                    ph.SupplierAccountCode = paymentHead.SupplierAccountCode;
                    ph.WHTRate = paymentHead.WHTRate;
                    ph.AdditionalWHT = paymentHead.AdditionalWHT;
                    ph.Total = paymentHead.Total;
                    ph.InComplete = paymentHead.InComplete;
                    ph.TotalPayment = paymentHead.TotalPayment;
                    ph.TotalOpenBalance = paymentHead.TotalOpenBalance;
                    ph.TotalWHT = paymentHead.TotalWHT;
                    ph.TotalDiscount = paymentHead.TotalDiscount;
                    ph.MailingAddress = paymentHead.MailingAddress;
                    ph.UnAllocatedBalance = paymentHead.UnAllocatedBalance;
                    ph.UpdatedDate = DateTime.Now;
                    referenceID = (int)ph.VoucherNo;
                }

                if (paymentBody != null && paymentBody.Count() > 0)
                {
                    foreach (var PaymentBody in paymentBody)
                    {
                        var pb = await context.tblPaymentBody.FirstOrDefaultAsync(s => s.ID == PaymentBody.ID && s.CompanyID == PaymentBody.CompanyID && s.IsActive == true);
                        if (pb != null)
                        {
                            if (PaymentBody.BillID == 0)
                            {
                                supplier.SupplierBaseOpeningBalance +=
                                    PaymentBody.PurchaseType == "Payment" ? -PaymentBody.Total + pb.Total : PaymentBody.Total - pb.Total;
                            }
                            var sh = await context.tblPurchaseHead.FirstOrDefaultAsync(s => s.BillID == pb.BillID && s.CompanyID == pb.CompanyID && pb.IsActive == true && s.SupplierAccountCode == paymentHead.SupplierAccountCode);
                            if (sh != null)
                            {
                                sh.Balance = PaymentBody.OpenBalance > 0 ? PaymentBody.OpenBalance - PaymentBody.Total : 0;
                                sh.AdjustedBalance = sh.Total - sh.Balance;
                                sh.UpdatedDate = DateTime.Now;
                            }
                            pb.WHTRate = PaymentBody.WHTRate;
                            pb.Discount = PaymentBody.Discount;
                            pb.InComplete = PaymentBody.InComplete;
                            pb.Payment = PaymentBody.Payment;
                            pb.Total = PaymentBody.Total;
                            pb.UpdatedDate = DateTime.Now;
                        }
                    }
                }
                if (paymentHead.PurchaseType == "Payment")
                {
                    supplier.SupplierOpeningBalance = supplierBalance - ph?.Total + PrevPaymentTotal - ph?.UnAllocatedBalance + PrevUnallocated;
                }
                else
                {
                    supplier.SupplierOpeningBalance = supplierBalance + ph?.Total - PrevPaymentTotal + ph?.UnAllocatedBalance - PrevUnallocated;
                }
                supplier.UpdatedDate = DateTime.Now;
                context.tblCustomerSupplier.Update(supplier);

                await context.SaveChangesAsync();

                return Ok(new
                {
                    status_message = "Payment updated successfully.",
                    status_code = 1,
                    Payment = inParams.PaymentHead,
                    Voucher = referenceID
                });
            }
            catch (Exception e)
            {
                return Ok(new
                {
                    status_message = "Sorry! Something went wrong...",
                    status_code = 0,
                    error = e.Message
                });
            }
        }

        [HttpPatch("DeletePayment")]
        public async Task<IActionResult> DeletePayment([FromBody] GeneralRequest inParams)
        {
            if (inParams == null)
            {
                return Ok(new { status_message = "Invalid Payment to Delete.", status_code = 0 });
            }

            try
            {
                // Retrieve the payment head
                var paymentHead = await context.tblPaymentHead
                .FirstOrDefaultAsync(r => r.ID == inParams.ID && r.CompanyID == inParams.CompanyID && r.IsActive);

                if (paymentHead == null)
                {
                    return Ok(new { status_message = "Payment not found.", status_code = 0 });
                }

                // Retrieve related payment body records
                var paymentBodies = await context.tblPaymentBody
                    .Where(r => r.VoucherNo == paymentHead.VoucherNo && r.CompanyID == paymentHead.CompanyID && r.IsActive)
                    .ToListAsync();

                decimal previousPaymentTotal = paymentHead.Total ?? 0;

                // Retrieve supplier record
                var supplier = await context.tblCustomerSupplier
                    .FirstOrDefaultAsync(c => c.CompanyID == paymentHead.CompanyID && c.AccountCode == paymentHead.SupplierAccountCode && c.IsActive);

                if (supplier == null)
                {
                    return Ok(new { status_message = "Supplier not found.", status_code = 0 });
                }

                paymentHead.IsActive = false;
                paymentHead.IsDeleted = true;
                paymentHead.UpdatedDate = DateTime.Now;

                foreach (var paymentBody in paymentBodies)
                {
                    if (paymentBody.BillID == 0)
                    {
                        supplier.SupplierBaseOpeningBalance +=
                            paymentBody.PurchaseType == "Payment" ? paymentBody.Total : -paymentBody.Total;
                    }

                    var purchase = await context.tblPurchaseHead.Where(p => p.BillID == paymentBody.BillID && p.SupplierAccountCode == paymentHead.SupplierAccountCode && p.IsActive == true && p.CompanyID == paymentBody.CompanyID).FirstOrDefaultAsync();

                    if (purchase != null)
                    {
                        purchase.Balance += paymentBody.Total;
                        purchase.AdjustedBalance -= paymentBody.Total;
                        purchase.UpdatedDate = DateTime.Now;
                    }

                    paymentBody.IsActive = false;
                    paymentBody.IsDeleted = true;
                    paymentBody.UpdatedDate = DateTime.Now;
                }

                if (paymentHead.PurchaseType == "Payment")
                {
                    supplier.SupplierOpeningBalance += previousPaymentTotal;
                }
                else
                {
                    supplier.SupplierOpeningBalance -= previousPaymentTotal;
                }
                supplier.UpdatedDate = DateTime.Now;

                context.tblCustomerSupplier.Update(supplier);

                await context.SaveChangesAsync();

                return Ok(new
                {
                    status_message = "Payment deleted successfully.",
                    status_code = 1
                });
            }
            catch (Exception ex)
            {
                return Ok(new
                {
                    status_message = "Sorry! Something went wrong.",
                    status_code = 0,
                    error = ex.Message
                });
            }
        }
    }
}
