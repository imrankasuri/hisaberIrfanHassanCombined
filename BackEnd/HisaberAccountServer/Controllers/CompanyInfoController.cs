using HisaberAccountServer.Data;
using HisaberAccountServer.Models;
using HisaberAccountServer.Models.Accounts;
using HisaberAccountServer.Models.Company;
using HisaberAccountServer.Models.LoginSystem;
using HisaberAccountServer.Models.Products;
using HisaberAccountServer.Models.Settings;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Client;
using Microsoft.VisualStudio.Web.CodeGenerators.Mvc.Templates.BlazorIdentity.Pages.Manage;
using System.ComponentModel.Design;
using System.Drawing;
using System.Security.Policy;
using System.Security.Principal;

namespace HisaberAccountServer.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class CompanyInfoController : ControllerBase
    {
        private readonly HisaberDbContext context;
        public CompanyInfoController(HisaberDbContext context)
        {
            this.context = context;
        }

        [HttpPost("RegisterCompany")]
        public async Task<ActionResult<CompanyInfo>> PostCompanyInfo(CompanyInfo inParams)
        {
            if (inParams.CreatedDate == default)
            {
                inParams.CreatedDate = DateTime.Now;
            }

            if (inParams.UpdatedDate == default)
            {
                inParams.UpdatedDate = DateTime.Now;
            }
            try
            {
                if (inParams != null)
                {
                    var random = new Random();
                    var verificationCode = random.Next(100000, 1000000).ToString("D6");
                    inParams.PackageExpiry = inParams.CreatedDate.AddYears(1);
                    inParams.CompanyCode = verificationCode;

                    var defaultProducts = await context.tblDefaultProducts.Where(e => e.CompanyID == 0).ToListAsync();

                    var defaultAccounts = await context.tblDefaultAccount.ToListAsync();


                    await context.tblCompanyInfo.AddAsync(inParams);
                    await context.SaveChangesAsync();

                    TblFYear fYear = new TblFYear
                    {
                        CompanyID = inParams.ID,
                        FYear = DateOnly.FromDateTime(DateTime.Now).Year,
                        FYearDescription = $"{DateTime.Now.Year}-01-01-{DateTime.Now.Year}-12-31",
                        StartDate = new DateTime(DateTime.Now.Year, 1, 1),
                        EndDate = new DateTime(DateTime.Now.Year, 12, 31),
                        CreatedDate = DateTime.Now,
                        IsActive = true,
                        IsDeleted = false
                    };

                    await context.tblFYear.AddAsync(fYear);


                    var productsList = new List<Product>();
                    var accountList = new List<AccountMain>();

                    foreach (var defaultProduct in defaultProducts)
                    {
                        Product product = new Product
                        {
                            CompanyID = inParams.ID,
                            Name = defaultProduct.Name,
                            ProductType = "NonStock",
                            Category = "",
                            Unit = "",
                            Type = "",
                            Size = "",
                            SalePrice = 0,
                            DefaultUnit = "",
                            OpeningQuantity = 0,
                            LowStockLevel = 0,
                            OpeningRate = 0,
                            CategoryCode = defaultProduct.CategoryCode,
                            Date = DateOnly.FromDateTime(DateTime.Now),
                            Code = defaultProduct.Code,
                            StockAssetAccount = "",
                            IncomeAccount = "",
                            SaleInformation = "",
                            ExpenseAccount = "",
                            Cost = 0,
                            SaleDiscount = 0,
                            PurchaseDiscount = 0,
                            Weight = 0,
                            Notes = "",
                            GSTRate = "",
                            NonFilerGSTRate = "",
                            MaxRRExTax = 0,
                            MaxRRIncTax = 0,
                            BinLocation = "",
                            LargePackSize = 0,
                            SmallPackSize = 0,
                            PrefferedSupplier = "",
                            Field1 = "",
                            Field2 = "",
                            Field3 = "",
                            Field4 = "",
                            FieldA = "",
                            FieldB = "",
                            FieldC = "",
                            FieldD = "",
                            CreatedDate = DateTime.Now,
                            IsActive = true,
                            IsDeleted = false
                        };

                        productsList.Add(product);
                    }

                    foreach (var defaultAccount in defaultAccounts)
                    {
                        AccountMain account = new AccountMain
                        {
                            CompanyId = inParams.ID,
                            AccountDescription = defaultAccount.AccountDescription,
                            AccountCode = defaultAccount.AccountCode,
                            ILevel = defaultAccount.ILevel,
                            Remarks = defaultAccount.Remarks,
                            Year = DateOnly.FromDateTime(DateTime.Now).Year,
                            CreatedDate = DateTime.Now,
                            IsActive = true,
                            IsDeleted = false
                        };

                        accountList.Add(account);
                    }

                    context.tblProducts.AddRange(productsList);
                    context.AccountMain.AddRange(accountList);

                    await context.SaveChangesAsync();
                    return Ok(new { status_message = "Company Registered Successfully.", status_code = 1, Company = inParams });
                }
                else
                {
                    return Ok(new { status_message = "Company Registration Failed.", status_code = 0 });
                }
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong." });
            }
        }

        [HttpGet("GetCompanies/{id}")]
        public async Task<ActionResult<CompanyInfo>> GetCompanyInfo(string id)
        {
            try
            {
                var data = await context.tblCompanyInfo.Where(e => e.IsDeleted == false && e.UserId == id).ToListAsync();
                if (data == null)
                {
                    return Ok(new { status_code = 0, status_message = "No Company Exists." });
                }
                return Ok(new { listofCompanies = data, status_code = 1, status_message = "Company Found Successfully." });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong." });
            }
        }

        [Authorize]
        [HttpGet("GetCompany/{id}")]
        public async Task<ActionResult<CompanyInfo>> GetCompanyById(int id)
        {
            try
            {
                var data = await context.tblCompanyInfo.Where(e => e.IsDeleted == false && e.ID == id).FirstOrDefaultAsync();
                if (data == null)
                {
                    return Ok(new { status_code = 0, status_message = "No Company Found." });
                }
                return Ok(new { CompanyData = data, status_code = 1 });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong." });
            }
        }

        [Authorize]
        [HttpPatch]
        [Route("UpdateRecord")]
        public async Task<ActionResult<CompanyInfo>> UpdateStudent(CompanyInfo inParams)
        {
            try
            {
                var Company = await context.tblCompanyInfo.FirstOrDefaultAsync(c => c.ID == inParams.ID);
                if (Company == null)
                {
                    return Ok(new { status_code = 0, status_message = "Invalid Company ID." });
                }

                Company.Name = inParams.Name;
                Company.Mobile = inParams.Mobile;
                Company.Phone = inParams.Phone;
                Company.NTN = inParams.NTN;
                Company.Website = inParams.Website;
                Company.Fax = inParams.Fax;
                Company.Address = inParams.Address;
                Company.Currency = inParams.Currency;
                Company.UpdatedDate = DateTime.Now;

                await context.SaveChangesAsync();
                return Ok(new { Company, status_code = 1, status_message = "Company Updated Successfully." });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.", error = e.Message });
            }
        }


    }
}
