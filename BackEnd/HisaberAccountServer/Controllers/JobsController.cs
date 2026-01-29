using HisaberAccountServer.Data;
using HisaberAccountServer.Models;
using HisaberAccountServer.Models.Assembly.Templates;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HisaberAccountServer.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    public class JobsController : ControllerBase
    {
        private readonly HisaberDbContext context;
        public JobsController(HisaberDbContext context)
        {
            this.context = context;
        }

        [HttpPost("AddJob")]
        public async Task<IActionResult> AddJob(TemplateDTO inParams)
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
                    inParams.TempDetails.AssemblyType = "Job";
                    await context.tblDetails.AddAsync(inParams.TempDetails);
                    await context.SaveChangesAsync();
                    referenceID = inParams.TempDetails.ID;
                }

                // Helper method to add entities
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
                    AssemblyType = "Job"
                });

                AddEntities(finishedGoods, context.tblFinishedGoods);
                await context.SaveChangesAsync();

                // Save RawMaterials and Deduct Stock
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
                    AssemblyType = "Job"
                }).ToList();

                AddEntities(rawMaterials, context.tblRawMaterials);
                await context.SaveChangesAsync();

                // Deduct Stock for RawMaterials
                foreach (var item in rawMaterials)
                {
                    var product = await context.tblProducts.FirstOrDefaultAsync(p => p.Code == item.ProductCode && p.CompanyID == item.CompanyID && p.IsActive == true);
                    if (product != null)
                    {
                        //Console.WriteLine($"Before update (RawMaterial): {product.OpeningQuantity}");
                        product.OpeningQuantity -= Convert.ToDecimal(item.QTYRequired);

                        if (context.Entry(product).State == EntityState.Detached)
                        {
                            context.tblProducts.Attach(product);
                        }

                        context.Entry(product).State = EntityState.Modified;
                        //Console.WriteLine($"After update (RawMaterial): {product.OpeningQuantity}");
                    }
                }

                // Save NonStocks and Deduct Stock
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
                    AssemblyType = "Job"
                }).ToList();

                AddEntities(nonStocks, context.tblNonStock);
                await context.SaveChangesAsync();

                // Deduct Stock for NonStocks
                foreach (var item in nonStocks)
                {
                    var product = await context.tblProducts.FirstOrDefaultAsync(p => p.Code == item.ProductCode && p.CompanyID == item.CompanyID && p.IsActive == true);
                    if (product != null)
                    {
                        Console.WriteLine($"Before update (NonStock): {product.OpeningQuantity}");
                        product.OpeningQuantity -= Convert.ToDecimal(item.QTYRequired);

                        if (context.Entry(product).State == EntityState.Detached)
                        {
                            context.tblProducts.Attach(product);
                        }

                        context.Entry(product).State = EntityState.Modified;
                        Console.WriteLine($"After update (NonStock): {product.OpeningQuantity}");
                    }
                }

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
                    AssemblyType = "Job"
                });

                AddEntities(expenses, context.tblExpenses);
                await context.SaveChangesAsync();

                // Final save to apply all changes
                await context.SaveChangesAsync();

                return Ok(new { status_code = 1, status_message = "Job Added Successfully!" });
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

        [HttpPatch("EditJobStatus/{id}/{CompanyId}")]
        public async Task<IActionResult> EditJobStatus(int id, int CompanyId)
        {
            if (id == 0 || CompanyId == 0)
            {
                return Ok(new { status_message = "Please Enter Valid Data", status_code = 0 });
            }

            try
            {

                var job = await context.tblDetails
                    .FirstOrDefaultAsync(j => j.ID == id && j.CompanyID == CompanyId && j.IsActive == true && j.AssemblyType == "Job");

                if (job == null)
                {
                    return Ok(new { status_message = "Job Not Found", status_code = 0 });
                }


                if (job.Status != "Finished")
                {
                    job.Status = "Finished";
                    job.FinishedDate = DateOnly.FromDateTime(DateTime.Now);
                    job.UpdatedDate = DateTime.Now;


                    var finishedGoods = await context.tblFinishedGoods
                        .Where(fg => fg.ReferenceID == id && fg.CompanyID == CompanyId)
                        .ToListAsync();


                    foreach (var finishedGood in finishedGoods)
                    {
                        var product = await context.tblProducts
                            .FirstOrDefaultAsync(p => p.Code == finishedGood.ProductCode && p.CompanyID == finishedGood.CompanyID && p.IsActive == true);

                        if (product != null)
                        {
                            // Add the finished goods quantity to the product's opening quantity
                            product.OpeningQuantity += Convert.ToDecimal(finishedGood.Quantity);
                            context.tblProducts.Update(product);
                        }
                    }

                    // Save changes for the job status and product updates
                    context.tblDetails.Update(job);
                    await context.SaveChangesAsync();

                    return Ok(new { status_code = 1, status_message = "Job Status Updated Successfully!" });
                }
                else
                {
                    return Ok(new { status_code = 1, status_message = "Job is already marked as Finished!" });
                }
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





        [HttpPost("GetJobs")]
        public async Task<ActionResult> GetJobs(GeneralRequest inParams)
        {
            int Companyid = inParams.CompanyID;
            string productName = inParams.ProductName;
            string status = inParams.OrderBy;
            int jobId = inParams.ID;
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
                .Where(a => a.CompanyID == Companyid && a.DetailActive == true && a.AssemblyType == "Job" && a.FinishedActive == true);

                // Optional filter for productName
                if (!string.IsNullOrEmpty(productName))
                {
                    query = query.Where(a => a.ProductName.Contains(productName));
                }

                if (!string.IsNullOrEmpty(status))
                {
                    query = query.Where(a => a.Status.Contains(status));
                }

                if (jobId != 0)
                {
                    query = query.Where(a => a.ID == jobId);
                }

                if (inParams.StartDate != null)
                {
                    query = query.Where(a => a.StartDate >= inParams.StartDate);
                }

                if (inParams.EndDate != null)
                {
                    query = query.Where(a => a.FinishedDate <= inParams.EndDate);
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
                    return Ok(new { status_code = 0, status_message = "No Jobs Found." });
                }

                return Ok(new
                {
                    listofJobs = paginatedData.Select(x => new
                    {
                        // Data from tblFinishedGoods
                        Name = x.ProductName,
                        Code = x.ProductCode,
                        Qty = x.Quantity,
                        JobUnit = x.Unit,


                        // Data from tblDetails
                        JobID = x.ID,
                        JobName = x.TemplateName,
                        Date = x.StartDate,
                        Stat = x.Status,
                        FinDate = x.FinishedDate,
                        Ref = x.RefNo,
                        Locat = x.Location,


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
                return Ok(new
                {
                    status_message = "Sorry! Something went wrong",
                    status_code = 0,
                    error = ex.Message
                });
            }
        }

        [HttpPatch("DeleteJobDataByDetailID/{id}/{CompanyID}")]
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
                    status_message = "Job Deleted Successfully."
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

    }
}
