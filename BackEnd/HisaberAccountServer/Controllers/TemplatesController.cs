using HisaberAccountServer.Data;
using HisaberAccountServer.Models;
using HisaberAccountServer.Models.Assembly.Templates;
using HisaberAccountServer.Models.StockAdjust;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NuGet.Protocol;
using System.Transactions;

namespace HisaberAccountServer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TemplatesController : ControllerBase
    {
        private readonly HisaberDbContext context;
        public TemplatesController(HisaberDbContext context)
        {
            this.context = context;
        }

        [HttpPost("AddTemplate")]
        public async Task<IActionResult> AddTemplate(TemplateDTO inParams)
        {
            if (inParams == null)
            {
                return Ok(new { status_message = "Please Enter Valid Data", status_code = 0 });
            }

            try
            {
                int referenceID = 0;

                // Save TempDetails
                if (inParams.TempDetails != null)
                {
                    inParams.TempDetails.AssemblyType = "Template";
                    await context.tblDetails.AddAsync(inParams.TempDetails);
                    await context.SaveChangesAsync();
                    referenceID = inParams.TempDetails.ID;
                }

                void AddEntities<T>(IEnumerable<T> entities, DbSet<T> dbSet) where T : class
                {
                    if (entities != null && entities.Any())
                    {
                        dbSet.AddRange(entities);
                    }
                }

                // Save FinishedGoods
                var finishedGoods = inParams.FinishedGoods.Select(dto => new FinishedGoods
                {
                    ProductName = dto.ProductName,
                    ProductID = dto.ProductID,
                    ReferenceID = referenceID,
                    Description = dto.Description ?? "",
                    ProductCode = dto.ProductCode,
                    CompanyID = dto.CompanyID,
                    UserID = dto.UserID,
                    QTYFI = dto.QTYFI,
                    Quantity = dto.Quantity,
                    Unit = dto.Unit,
                    CostFI = dto.CostFI,
                    IsActive = true,
                    AssemblyType = "Template"
                });

                AddEntities(finishedGoods, context.tblFinishedGoods);
                await context.SaveChangesAsync();

                // Save RawMaterials
                var rawMaterials = inParams.RawMaterials.Select(dto => new RawMaterial
                {
                    ProductName = dto.ProductName,
                    ProductID = dto.ProductID,
                    ProductCode = dto.ProductCode,
                    CompanyID = dto.CompanyID,
                    UserID = dto.UserID,
                    ReferenceID = referenceID,
                    Description = dto.Description ?? "",
                    Location = dto.Location,
                    StockInHand = dto.StockInHand,
                    PerUnit = dto.PerUnit,
                    QTYRequired = dto.QTYRequired,
                    Rate = dto.Rate,
                    Amount = dto.Amount,
                    Unit = dto.Unit,
                    IsActive = true,
                    AssemblyType = "Template"
                });

                AddEntities(rawMaterials, context.tblRawMaterials);
                await context.SaveChangesAsync();

                // Save NonStocks
                var nonStocks = inParams.NonStocks.Select(dto => new NonStock
                {
                    ProductName = dto.ProductName,
                    ProductID = dto.ProductID,
                    ReferenceID = referenceID,
                    Details = dto.Details,
                    QuantityPerUnit = dto.QuantityPerUnit,
                    Rate = dto.Rate,
                    ProductCode = dto.ProductCode,
                    CompanyID = dto.CompanyID,
                    UserID = dto.UserID,
                    QTYRequired = dto.QTYRequired,
                    Amount = dto.Amount,
                    IsActive = true,
                    AssemblyType = "Template"
                });

                AddEntities(nonStocks, context.tblNonStock);
                await context.SaveChangesAsync();

                // Save Expenses
                var expenses = inParams.Expenses.Select(dto => new Expenses
                {
                    ExpenseAccount = dto.ExpenseAccount,
                    ExpenseAccountID = dto.ExpenseAccountID,
                    ReferenceID = referenceID,
                    Details = dto.Details,
                    Rate = dto.Rate,
                    QTYRequired = dto.QTYRequired,
                    Amount = dto.Amount,
                    CompanyID = dto.CompanyID,
                    UserID = dto.UserID,
                    IsActive = true,
                    AssemblyType = "Template"
                });

                AddEntities(expenses, context.tblExpenses);
                await context.SaveChangesAsync();

                return Ok(new { status_code = 1, status_message = "Product Recipe Added Successfully!" });
            }
            catch (Exception ex)
            {
                return Ok(new
                {
                    status_message = "Sorry! Something Went Wrong...",
                    status_code = 0,
                    error = ex.Message
                });
            }
        }

        [HttpPost("GetTemplates")]
        public async Task<ActionResult> GetTemplates(GeneralRequest inParams)
        {
            int Companyid = inParams.CompanyID;
            string productName = inParams.ProductName;
            int pageSize = inParams.PageSize;
            int pageNumber = inParams.PageNo;
            if (Companyid <= 0)
            {
                return Ok(new { status_code = 0, status_message = "Invalid Company ID." });
            }

            try
            {
                // Base query
                var query = context.vwDetailFinishedGoods
                    .Where(a => a.CompanyID == Companyid && a.DetailActive == true && a.AssemblyType == "Template" && a.FinishedActive == true);

                // Optional filter for productName
                if (!string.IsNullOrEmpty(productName))
                {
                    query = query.Where(a => a.ProductName.Contains(productName));
                }

                // Get total records before pagination
                var totalRecords = await query.CountAsync();

                // Calculate total pages
                var totalPages = (int)Math.Ceiling(totalRecords / (double)pageSize);

                // Apply pagination
                var paginatedData = await query
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                // Return result
                if (!paginatedData.Any())
                {
                    return Ok(new { status_code = 0, status_message = "No templates found." });
                }

                return Ok(new
                {
                    listofTemps = paginatedData.Select(x => new
                    {
                        // Data from tblFinishedGoods
                        Id = x.ID,
                        Name = x.ProductName,
                        Code = x.ProductCode,

                        // Data from tblDetails
                        TempID = x.ID,
                        TempName = x.TemplateName,
                        CreatedOn = x.CreatedDate,
                    }),
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

        [HttpGet("GetTemplateForEditBy/{Companyid}")]
        public async Task<ActionResult> GetTemplateForEditBy(
                    int Companyid,
                    int ID = 0)
        {
            if (Companyid <= 0)
            {
                return Ok(new { status_code = 0, status_message = "Invalid Company ID." });
            }

            try
            {
                var detailData = await context.tblDetails
                .Where(a => a.CompanyID == Companyid && a.ID == ID && a.IsActive == true).FirstOrDefaultAsync();

                var finishedGoods = await context.tblFinishedGoods.Where(a => a.CompanyID == Companyid && a.ReferenceID == ID && a.IsActive == true).ToListAsync();

                var rawMaterial = await context.tblRawMaterials.Where(a => a.CompanyID == Companyid && a.ReferenceID == ID && a.IsActive == true).ToListAsync();

                var nonStock = await context.tblNonStock.Where(a => a.CompanyID == Companyid && a.ReferenceID == ID && a.IsActive == true).ToListAsync();

                var expenses = await context.tblExpenses.Where(a => a.CompanyID == Companyid && a.ReferenceID == ID && a.IsActive == true).ToListAsync();

                return Ok(new
                {
                    status_code = 1,
                    Details = detailData,
                    ListofFinishedGoods = finishedGoods,
                    ListofRawMaterial = rawMaterial,
                    ListofNonStock = nonStock,
                    ListofExpenses = expenses,
                    status_message = "Successfully returning Template data."
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

        [HttpPatch("UpdateTemplateDataByDetailID/{id}")]
        public async Task<ActionResult> UpdateTemplateDataByDetailID(
        int id,
        [FromBody] TemplateDTO request)
        {
            if (id <= 0)
            {
                return Ok(new { status_code = 0, status_message = "Invalid Detail ID." });
            }

            try
            {
                // Update tblDetails
                var detailData = await context.tblDetails
                    .FirstOrDefaultAsync(a => a.ID == id && a.CompanyID == request.TempDetails.CompanyID && a.IsActive == true);

                if (detailData != null && request.TempDetails != null)
                {
                    detailData.TemplateName = request.TempDetails.TemplateName;
                    detailData.RMFactor = request.TempDetails.RMFactor;
                    detailData.CostCalType = request.TempDetails.CostCalType;
                    detailData.Notes = request.TempDetails.Notes;
                    detailData.UpdatedDate = DateTime.Now;

                    context.tblDetails.Update(detailData);
                }

                // Update or Add to tblFinishedGoods
                if (request.FinishedGoods != null)
                {
                    foreach (var fg in request.FinishedGoods)
                    {
                        var finishedGood = await context.tblFinishedGoods
                            .FirstOrDefaultAsync(a => a.ReferenceID == id && a.ID == fg.ID && a.IsActive == true);

                        if (finishedGood != null)
                        {
                            finishedGood.ProductName = fg.ProductName;
                            finishedGood.ProductCode = fg.ProductCode;
                            finishedGood.ProductID = fg.ProductID;
                            finishedGood.Description = fg.Description;
                            finishedGood.QTYFI = fg.QTYFI;
                            finishedGood.Unit = fg.Unit;
                            finishedGood.CostFI = fg.CostFI;
                            finishedGood.Quantity = fg.Quantity;
                            finishedGood.UpdatedDate = DateTime.Now;

                            context.tblFinishedGoods.Update(finishedGood);
                        }
                        else
                        {
                            // If no match, add a new record
                            context.tblFinishedGoods.Add(new FinishedGoods
                            {
                                ReferenceID = id,
                                ProductName = fg.ProductName,
                                ProductCode = fg.ProductCode,
                                ProductID = fg.ProductID,
                                Description = fg.Description,
                                QTYFI = fg.QTYFI,
                                Unit = fg.Unit,
                                CostFI = fg.CostFI,
                                Quantity = fg.Quantity,
                                IsActive = true,
                                IsDeleted = false,
                                CreatedDate = DateTime.Now,
                                UpdatedDate = DateTime.Now,
                                CompanyID = request.TempDetails.CompanyID,
                                UserID = request.TempDetails.UserID,
                            });
                        }
                    }
                }

                // Update or Add to tblRawMaterials
                if (request.RawMaterials != null)
                {
                    foreach (var rm in request.RawMaterials)
                    {
                        var rawMaterial = await context.tblRawMaterials
                            .FirstOrDefaultAsync(a => a.ReferenceID == id && a.ID == rm.ID && a.IsActive == true);

                        if (rawMaterial != null)
                        {
                            rawMaterial.ProductName = rm.ProductName;
                            rawMaterial.ProductCode = rm.ProductCode;
                            rawMaterial.ProductID = rm.ProductID;
                            rawMaterial.Description = rm.Description;
                            rawMaterial.Location = rm.Location;
                            rawMaterial.AssemblyType = rm.AssemblyType;
                            rawMaterial.Unit = rm.Unit;
                            rawMaterial.StockInHand = rm.StockInHand;
                            rawMaterial.PerUnit = rm.PerUnit;
                            rawMaterial.QTYRequired = rm.QTYRequired;
                            rawMaterial.Rate = rm.Rate;
                            rawMaterial.Amount = rm.Amount;
                            rawMaterial.UpdatedDate = DateTime.Now;

                            context.tblRawMaterials.Update(rawMaterial);
                        }
                        else
                        {
                            // If no match, add a new record
                            context.tblRawMaterials.Add(new RawMaterial
                            {
                                ReferenceID = id,
                                ProductName = rm.ProductName,
                                ProductCode = rm.ProductCode,
                                ProductID = rm.ProductID,
                                Description = rm.Description,
                                Location = rm.Location,
                                AssemblyType = rm.AssemblyType,
                                Unit = rm.Unit,
                                StockInHand = rm.StockInHand,
                                PerUnit = rm.PerUnit,
                                QTYRequired = rm.QTYRequired,
                                Rate = rm.Rate,
                                Amount = rm.Amount,
                                IsActive = true,
                                IsDeleted = false,
                                CreatedDate = DateTime.Now,
                                UpdatedDate = DateTime.Now,
                                CompanyID = request.TempDetails.CompanyID,
                                UserID = request.TempDetails.UserID,
                            });
                        }
                    }
                }

                // Update or Add to tblNonStock
                if (request.NonStocks != null)
                {
                    foreach (var ns in request.NonStocks)
                    {
                        var nonStock = await context.tblNonStock
                            .FirstOrDefaultAsync(a => a.ReferenceID == id && a.ID == ns.ID && a.IsActive == true);

                        if (nonStock != null)
                        {
                            nonStock.ProductName = ns.ProductName;
                            nonStock.ProductCode = ns.ProductCode;
                            nonStock.ProductID = ns.ProductID;
                            nonStock.Details = ns.Details;
                            nonStock.AssemblyType = ns.AssemblyType;
                            nonStock.QuantityPerUnit = ns.QuantityPerUnit;
                            nonStock.Rate = ns.Rate;
                            nonStock.QTYRequired = ns.QTYRequired;
                            nonStock.Amount = ns.Amount;
                            nonStock.UpdatedDate = DateTime.Now;

                            context.tblNonStock.Update(nonStock);
                        }
                        else
                        {
                            // If no match, add a new record
                            context.tblNonStock.Add(new NonStock
                            {
                                ReferenceID = id,
                                ProductName = ns.ProductName,
                                ProductCode = ns.ProductCode,
                                ProductID = ns.ProductID,
                                Details = ns.Details,
                                AssemblyType = ns.AssemblyType,
                                QuantityPerUnit = ns.QuantityPerUnit,
                                Rate = ns.Rate,
                                QTYRequired = ns.QTYRequired,
                                Amount = ns.Amount,
                                IsActive = true,
                                IsDeleted = false,
                                UpdatedDate = DateTime.Now,
                                CreatedDate = DateTime.Now,
                                CompanyID = request.TempDetails.CompanyID,
                                UserID = request.TempDetails.UserID,
                            });
                        }
                    }
                }

                // Update or Add to tblExpenses
                if (request.Expenses != null)
                {
                    foreach (var exp in request.Expenses)
                    {
                        var expense = await context.tblExpenses
                            .FirstOrDefaultAsync(a => a.ReferenceID == id && a.ID == exp.ID && a.IsActive == true);

                        if (expense != null)
                        {
                            expense.ExpenseAccount = exp.ExpenseAccount;
                            expense.ExpenseAccountID = exp.ExpenseAccountID;
                            expense.Details = exp.Details;
                            expense.AssemblyType = exp.AssemblyType;
                            expense.Rate = exp.Rate;
                            expense.QTYRequired = exp.QTYRequired;
                            expense.Amount = exp.Amount;
                            expense.UpdatedDate = DateTime.Now;

                            context.tblExpenses.Update(expense);
                        }
                        else
                        {
                            // If no match, add a new record
                            context.tblExpenses.Add(new Expenses
                            {
                                ReferenceID = id,
                                ExpenseAccount = exp.ExpenseAccount,
                                ExpenseAccountID = exp.ExpenseAccountID,
                                Details = exp.Details,
                                AssemblyType = exp.AssemblyType,
                                Rate = exp.Rate,
                                QTYRequired = exp.QTYRequired,
                                Amount = exp.Amount,
                                IsActive = true,
                                IsDeleted = false,
                                CreatedDate = DateTime.Now,
                                UpdatedDate = DateTime.Now,
                                CompanyID = request.TempDetails.CompanyID,
                                UserID = request.TempDetails.UserID,
                            });
                        }
                    }
                }

                // Save changes
                await context.SaveChangesAsync();

                return Ok(new
                {
                    status_code = 1,
                    status_message = "Data Updated Successfully."
                });
            }
            catch (Exception ex)
            {
                return Ok(new
                {
                    status_code = 0,
                    status_message = "Sorry! Something went wrong.",
                    error = ex.Message
                });
            }
        }

        [HttpPatch("DeleteTemplateDataByDetailID/{id}/{CompanyID}")]
        public async Task<ActionResult> DeleteTemplateDataByDetailID(int id, int CompanyID)
        {
            if (id <= 0)
            {
                return Ok(new { status_code = 0, status_message = "Invalid Detail ID." });
            }

            try
            {
                // Update tblDetails
                var detailData = await context.tblDetails
                    .FirstOrDefaultAsync(a => a.ID == id && a.CompanyID == CompanyID && a.IsActive == true);

                if (detailData != null)
                {
                    detailData.IsActive = false;
                    detailData.IsDeleted = true;
                    detailData.UpdatedDate = DateTime.Now;

                    context.tblDetails.Update(detailData);
                }

                // Update tblFinishedGoods
                var finishedGoods = await context.tblFinishedGoods
                    .Where(a => a.ReferenceID == id && a.CompanyID == CompanyID && a.IsActive == true)
                    .ToListAsync();

                foreach (var finishedGood in finishedGoods)
                {
                    finishedGood.IsActive = false;
                    finishedGood.IsDeleted = true;
                    finishedGood.UpdatedDate = DateTime.Now;

                    context.tblFinishedGoods.Update(finishedGood);
                }

                // Update tblRawMaterials
                var rawMaterials = await context.tblRawMaterials
                    .Where(a => a.ReferenceID == id && a.CompanyID == CompanyID && a.IsActive == true)
                    .ToListAsync();

                foreach (var rawMaterial in rawMaterials)
                {
                    rawMaterial.IsActive = false;
                    rawMaterial.IsDeleted = true;
                    rawMaterial.UpdatedDate = DateTime.Now;

                    context.tblRawMaterials.Update(rawMaterial);
                }

                // Update tblNonStock
                var nonStocks = await context.tblNonStock
                    .Where(a => a.ReferenceID == id && a.CompanyID == CompanyID && a.IsActive == true)
                    .ToListAsync();

                foreach (var nonStock in nonStocks)
                {
                    nonStock.IsActive = false;
                    nonStock.IsDeleted = true;
                    nonStock.UpdatedDate = DateTime.Now;

                    context.tblNonStock.Update(nonStock);
                }

                // Update tblExpenses
                var expenses = await context.tblExpenses
                    .Where(a => a.ReferenceID == id && a.CompanyID == CompanyID && a.IsActive == true)
                    .ToListAsync();

                foreach (var expense in expenses)
                {
                    expense.IsActive = false;
                    expense.IsDeleted = true;
                    expense.UpdatedDate = DateTime.Now;

                    context.tblExpenses.Update(expense);
                }

                // Save changes
                await context.SaveChangesAsync();

                return Ok(new
                {
                    status_code = 1,
                    status_message = "Product Recipe Deleted Successfully."
                });
            }
            catch (Exception ex)
            {

                return Ok(new
                {
                    status_code = 0,
                    status_message = "Sorry! Something went wrong.",
                    error = ex.Message
                });
            }
        }

        [HttpPost("CopyTemplate")]
        public async Task<IActionResult> CopyTemplate(CopyTemplateRequest request)
        {
            if (request == null || request.SourceTemplateID <= 0)
            {
                return Ok(new { status_message = "Please provide valid template ID to copy", status_code = 0 });
            }

            try
            {
                // Get the source template data
                var sourceDetail = await context.tblDetails
                    .FirstOrDefaultAsync(a => a.ID == request.SourceTemplateID && a.CompanyID == request.CompanyID && a.IsActive == true);

                if (sourceDetail == null)
                {
                    return Ok(new { status_message = "Source template not found", status_code = 0 });
                }

                // Get all related data from source template
                var sourceFinishedGoods = await context.tblFinishedGoods
                    .Where(a => a.ReferenceID == request.SourceTemplateID && a.CompanyID == request.CompanyID && a.IsActive == true)
                    .ToListAsync();

                var sourceRawMaterials = await context.tblRawMaterials
                    .Where(a => a.ReferenceID == request.SourceTemplateID && a.CompanyID == request.CompanyID && a.IsActive == true)
                    .ToListAsync();

                var sourceNonStocks = await context.tblNonStock
                    .Where(a => a.ReferenceID == request.SourceTemplateID && a.CompanyID == request.CompanyID && a.IsActive == true)
                    .ToListAsync();

                var sourceExpenses = await context.tblExpenses
                    .Where(a => a.ReferenceID == request.SourceTemplateID && a.CompanyID == request.CompanyID && a.IsActive == true)
                    .ToListAsync();

                int newReferenceID = 0;

                // Create new template details
                var newDetail = new Details
                {
                    CompanyID = request.CompanyID,
                    TemplateName = request.NewTemplateName ?? (sourceDetail.TemplateName + " (Copy)"),
                    RMFactor = sourceDetail.RMFactor,
                    CostCalType = sourceDetail.CostCalType,
                    StartDate = sourceDetail.StartDate,
                    RefNo = sourceDetail.RefNo,
                    Location = sourceDetail.Location,
                    Status = sourceDetail.Status,
                    FinishedDate = sourceDetail.FinishedDate,
                    LocationCode = sourceDetail.LocationCode,
                    LocationID = sourceDetail.LocationID,
                    AssemblyType = "Template",
                    Notes = sourceDetail.Notes,
                    Extra1 = sourceDetail.Extra1,
                    Extra2 = sourceDetail.Extra2,
                    IsActive = true,
                    IsDeleted = false,
                    UserID = request.UserID,
                    CreatedDate = DateTime.Now,
                    UpdatedDate = DateTime.Now
                };

                await context.tblDetails.AddAsync(newDetail);
                await context.SaveChangesAsync();
                newReferenceID = newDetail.ID;

                // Copy Finished Goods
                if (sourceFinishedGoods.Any())
                {
                    // If NewProductID is provided, get the product details
                    string newProductName = sourceFinishedGoods.First().ProductName;
                    long? newProductCode = sourceFinishedGoods.First().ProductCode;
                    
                    if (request.NewProductID.HasValue)
                    {
                        var newProduct = await context.tblProducts
                            .FirstOrDefaultAsync(p => p.ID == request.NewProductID.Value && p.CompanyID == request.CompanyID);
                        
                        if (newProduct != null)
                        {
                            newProductName = newProduct.Name;
                            newProductCode = newProduct.Code;
                        }
                    }

                    var newFinishedGoods = sourceFinishedGoods.Select(fg => new FinishedGoods
                    {
                        CompanyID = request.CompanyID,
                        ReferenceID = newReferenceID,
                        ProductName = newProductName,
                        ProductID = request.NewProductID ?? fg.ProductID,
                        ProductCode = newProductCode,
                        Description = fg.Description,
                        QTYFI = fg.QTYFI,
                        Unit = fg.Unit,
                        Quantity = fg.Quantity,
                        CostFI = fg.CostFI,
                        AssemblyType = "Template",
                        Extra1 = fg.Extra1,
                        Extra2 = fg.Extra2,
                        IsActive = true,
                        IsDeleted = false,
                        UserID = request.UserID,
                        CreatedDate = DateTime.Now,
                        UpdatedDate = DateTime.Now
                    });

                    await context.tblFinishedGoods.AddRangeAsync(newFinishedGoods);
                }

                // Copy Raw Materials
                if (sourceRawMaterials.Any())
                {
                    var newRawMaterials = sourceRawMaterials.Select(rm => new RawMaterial
                    {
                        CompanyID = request.CompanyID,
                        ReferenceID = newReferenceID,
                        ProductName = rm.ProductName,
                        ProductID = rm.ProductID,
                        ProductCode = rm.ProductCode,
                        Description = rm.Description,
                        Location = rm.Location,
                        LocationCode = rm.LocationCode,
                        LocationID = rm.LocationID,
                        Unit = rm.Unit,
                        StockInHand = rm.StockInHand,
                        PerUnit = rm.PerUnit,
                        QTYRequired = rm.QTYRequired,
                        Rate = rm.Rate,
                        Amount = rm.Amount,
                        AssemblyType = "Template",
                        Extra1 = rm.Extra1,
                        Extra2 = rm.Extra2,
                        IsActive = true,
                        IsDeleted = false,
                        UserID = request.UserID,
                        CreatedDate = DateTime.Now,
                        UpdatedDate = DateTime.Now
                    });

                    await context.tblRawMaterials.AddRangeAsync(newRawMaterials);
                }

                // Copy Non Stocks
                if (sourceNonStocks.Any())
                {
                    var newNonStocks = sourceNonStocks.Select(ns => new NonStock
                    {
                        CompanyID = request.CompanyID,
                        ReferenceID = newReferenceID,
                        ProductName = ns.ProductName,
                        ProductID = ns.ProductID,
                        ProductCode = ns.ProductCode,
                        Details = ns.Details,
                        QuantityPerUnit = ns.QuantityPerUnit,
                        Rate = ns.Rate,
                        QTYRequired = ns.QTYRequired,
                        Amount = ns.Amount,
                        AssemblyType = "Template",
                        Extra1 = ns.Extra1,
                        Extra2 = ns.Extra2,
                        IsActive = true,
                        IsDeleted = false,
                        UserID = request.UserID,
                        CreatedDate = DateTime.Now,
                        UpdatedDate = DateTime.Now
                    });

                    await context.tblNonStock.AddRangeAsync(newNonStocks);
                }

                // Copy Expenses
                if (sourceExpenses.Any())
                {
                    var newExpenses = sourceExpenses.Select(exp => new Expenses
                    {
                        CompanyID = request.CompanyID,
                        ReferenceID = newReferenceID,
                        ExpenseAccount = exp.ExpenseAccount,
                        ExpenseAccountID = exp.ExpenseAccountID,
                        Details = exp.Details,
                        Rate = exp.Rate,
                        QTYRequired = exp.QTYRequired,
                        Amount = exp.Amount,
                        AssemblyType = "Template",
                        Extra1 = exp.Extra1,
                        Extra2 = exp.Extra2,
                        IsActive = true,
                        IsDeleted = false,
                        UserID = request.UserID,
                        CreatedDate = DateTime.Now,
                        UpdatedDate = DateTime.Now
                    });

                    await context.tblExpenses.AddRangeAsync(newExpenses);
                }

                await context.SaveChangesAsync();

                return Ok(new { status_code = 1, status_message = "Product Recipe copied successfully!", newTemplateID = newReferenceID });
            }
            catch (Exception ex)
            {
                return Ok(new
                {
                    status_message = "Sorry! Something Went Wrong...",
                    status_code = 0,
                    error = ex.Message
                });
            }
        }
    }
}








