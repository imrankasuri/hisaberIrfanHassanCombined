using ExcelDataReader;
using HisaberAccountServer.Data;
using HisaberAccountServer.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using Mono.TextTemplating;
using static System.Runtime.InteropServices.JavaScript.JSType;
using System.Drawing;
using HisaberAccountServer.Models.Sales;
using Microsoft.CodeAnalysis.Elfie.Serialization;

namespace HisaberAccountServer.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly HisaberDbContext context;
        public ProductController(HisaberDbContext context)
        {
            this.context = context;
        }

        [HttpPost("AddProduct")]
        public async Task<ActionResult<Product>> PostOpeningBal(Product product)
        {
            try
            {
                if (product == null)
                {
                    return Ok(new { status_message = "Product Data is Null", status_code = 0 });
                }

                var lastProduct = await context.tblProducts
                    .Where(p => p.CompanyID == product.CompanyID)
                    .OrderByDescending(p => p.Code)
                    .FirstOrDefaultAsync();

                var lastCategoryCode = await context.tblProducts
                    .Where(p => p.CompanyID == product.CompanyID && p.Category == product.Category)
                    .OrderBy(p => p.ID)
                    .LastOrDefaultAsync();

                product.Code = lastProduct?.Code + 1 ?? 1001;
                Console.WriteLine("Last Category Code: " + lastCategoryCode?.CategoryCode);

                int nextCategoryNumber = lastCategoryCode != null && lastCategoryCode.CategoryCode.Contains('-')
                    ? int.Parse(lastCategoryCode.CategoryCode.Split('-')[1]) + 1
                    : 1;

                product.CategoryCode = $"{product.CategoryCode}-{nextCategoryNumber}";

                product.CreatedDate = DateTime.Now;
                product.UpdatedDate = DateTime.Now;

                await context.tblProducts.AddAsync(product);
                await context.SaveChangesAsync();

                return Ok(new { status_message = "Product Added Successfully.", status_code = 1, product });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.", e.Message });
            }
        }


        [HttpGet("GetBy/{Companyid}")]
        public async Task<ActionResult<Product>> GetProducts(
                                                            int Companyid,
                                                            int pageNumber = 1,
                                                            int pageSize = 50,
                                                            string orderBy = "",
                                                            string name = "",
                                                            int code = 1000,
                                                            string productType = "",
                                                            string category = "",
                                                            string type = "",
                                                            bool noPagination = false
                                                            )
        {
            try
            {

                if (Companyid <= 0)
                {
                    return Ok(new { status_code = 0, error = "Invalid Company ID." });
                }

                var query = context.tblProducts
                    .Where(e => !e.IsDeleted && e.CompanyID == Companyid && e.CategoryCode != "cop" && e.CategoryCode != "sop");

                if (!string.IsNullOrWhiteSpace(name))
                {
                    query = query.Where(e => e.Name.Contains(name));
                }
                if (!string.IsNullOrWhiteSpace(productType))
                {
                    query = productType.Equals("Stock", StringComparison.OrdinalIgnoreCase)
                        ? query.Where(e => e.ProductType == "Stock")
                        : query.Where(e => e.ProductType == "NonStock");
                }
                if (code > 1000)
                {
                    query = query.Where(e => e.Code == code);
                }

                if (!string.IsNullOrWhiteSpace(category))
                {
                    query = query.Where(e => e.Category.Contains(category));
                }

                if (!string.IsNullOrWhiteSpace(type))
                {
                    query = query.Where(e => e.Type.Contains(type));
                }

                switch (orderBy.ToLower())
                {
                    case "code":
                        query = query.OrderBy(e => e.Code);
                        break;
                    case "name":
                        query = query.OrderBy(e => e.Name);
                        break;
                    default:
                        query = query.OrderByDescending(e => e.ID);
                        break;
                }

                var totalRecords = await query.CountAsync();

                if (!noPagination)
                {
                    query = query
                        .Skip((pageNumber - 1) * pageSize)
                        .Take(pageSize);
                }

                var data = await query.ToListAsync();

                if (!data.Any())
                {
                    return Ok(new { status_code = 0, message = "No Products Found." });
                }

                return Ok(new
                {
                    listofProducts = data,
                    status_code = 1,
                    totalRecords = totalRecords,
                    pageNumber,
                    pageSize = noPagination ? totalRecords : pageSize
                });
            }
            catch (Exception e)
            {
                return Ok(new { status_message = "Sorry! Something went wrong.", status_code = 0, e.Message });
            }
        }



        [HttpGet("GetProductBy/{id}")]
        public async Task<ActionResult<Product>> GetRecord(int id)
        {
            try
            {
                var data = await context.tblProducts.Where(e => e.IsDeleted == false && e.ID == id).FirstOrDefaultAsync();
                if (data == null)
                {
                    return Ok(new { status_code = 0, status_message = "Product Not Found." });
                }
                return Ok(new { ProductData = data, status_code = 1 });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.", e.Message });
            }
        }

        [HttpPatch]
        [Route("UpdateRecord/{id}")]
        public async Task<ActionResult<Product>> UpdateStudent(int id, Product product)
        {
            try
            {
                if (id != product.ID)
                {
                    return Ok(new { status_code = 0, status_message = "Invalid ID." });
                }
                if (product.CategoryCode.Contains('-'))
                {
                    product.CategoryCode = product.CategoryCode;
                }
                else
                {

                    var lastCategoryCode = await context.tblProducts
                    .Where(p => p.CompanyID == product.CompanyID && p.Category == product.Category)
                    .OrderByDescending(p => p.CategoryCode)
                    .FirstOrDefaultAsync();

                    int nextCategoryNumber = lastCategoryCode != null && lastCategoryCode.CategoryCode.Contains('-')
                        ? int.Parse(lastCategoryCode.CategoryCode.Split('-')[1]) + 1
                        : 1;

                    product.CategoryCode = $"{product.CategoryCode}-{nextCategoryNumber}";
                }
                product.UpdatedDate = DateTime.Now;
                context.Entry(product).State = EntityState.Modified;
                await context.SaveChangesAsync();
                return Ok(new { product, status_code = 1, status_message = "Product Updated Successfully." });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.", e.Message });
            }
        }

        [HttpPatch]
        [Route("UpdateRecords")]
        public async Task<ActionResult<IEnumerable<Product>>> UpdateRecords(IEnumerable<Product> products)
        {
            try
            {
                foreach (var product in products)
                {
                    var existingProduct = await context.tblProducts.FindAsync(product.ID);
                    if (existingProduct == null)
                    {
                        return Ok(new { status_message = $"Product with ID {product.ID} not found.", status_code = 0 });
                    }

                    existingProduct.OpeningQuantity = product.OpeningQuantity;
                    existingProduct.IsActive = product.IsActive;
                    existingProduct.IsDeleted = product.IsDeleted;
                    existingProduct.UpdatedDate = DateTime.Now;

                    context.Entry(existingProduct).State = EntityState.Modified;
                }

                await context.SaveChangesAsync();

                return Ok(new { products, status_code = 1, status_message = "Product Updated Successfully." });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.", e.Message });
            }
        }


        [HttpPost("UploadExcel/{companyId}")]
        public async Task<IActionResult> UploadExcelFile([FromForm] IFormFile file, int companyId)
        {
            try
            {
                System.Text.Encoding.RegisterProvider(System.Text.CodePagesEncodingProvider.Instance);

                if (file == null || file.Length == 0)
                {
                    return Ok(new { status_message = "No file uploaded", status_code = 0 });
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

                using (var transaction = await context.Database.BeginTransactionAsync())
                {
                    try
                    {
                        var ProductQuery = context.tblProducts.Where(p => p.CompanyID == companyId);

                        long lastProductCode = await ProductQuery
                            .OrderByDescending(p => p.Code)
                            .Select(p => p.Code)
                            .FirstOrDefaultAsync();

                        long nextProductCode = lastProductCode > 0 ? lastProductCode + 1 : 1001;

                        var existingCategories = await context.tblDropdownData
                            .Where(c => c.Type == "ProductCategory" && c.CompanyID == companyId)
                            .Select(c => c.Name)
                            .ToListAsync();

                        var existingUnits = await context.tblDropdownData
                            .Where(u => u.Type == "ProductUnit" && u.CompanyID == companyId)
                            .Select(u => u.Name)
                            .ToListAsync();

                        var existingTypes = await context.tblDropdownData
                            .Where(u => u.Type == "ProductType" && u.CompanyID == companyId)
                            .Select(u => u.Name)
                            .ToListAsync();

                        var existingSizes = await context.tblDropdownData
                            .Where(u => u.Type == "ProductSize" && u.CompanyID == companyId)
                            .Select(u => u.Name)
                            .ToListAsync();


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


                                    string name = reader.GetValue(0)?.ToString();
                                    if (string.IsNullOrWhiteSpace(name))
                                    {
                                        return Ok(new { status_message = "Product Name is required for all rows.", status_code = 0 });
                                    }

                                    var existingProduct = await ProductQuery.Where(e => e.Name == name)
                                        .FirstOrDefaultAsync();

                                    string defaultUnit = reader.GetValue(7)?.ToString() ?? "";
                                    string[] validUnits = { "Quantity", "Weight", "Length" };

                                    if (!validUnits.Contains(defaultUnit))
                                    {
                                        return Ok(new { status_message = $"Invalid Default Unit: {defaultUnit}. Allowed values are Quantity, Weight, or Length.", status_code = 0 });
                                    }

                                    string category = reader.GetValue(2)?.ToString() ?? "DefaultCategory";
                                    string unit = reader.GetValue(3)?.ToString() ?? "";
                                    string type = reader.GetValue(4)?.ToString() ?? "";
                                    string size = reader.GetValue(5)?.ToString() ?? "";

                                    if (!string.IsNullOrWhiteSpace(category) && !existingCategories.Contains(category))
                                    {
                                        var newCategory = new DropdownData
                                        {
                                            Name = category,
                                            ShortName = reader.GetValue(11).ToString() ?? "",
                                            Type = "ProductCategory",
                                            CompanyID = companyId,
                                            IsActive = true,
                                            IsDeleted = false
                                        };
                                        context.tblDropdownData.Add(newCategory);
                                        await context.SaveChangesAsync();
                                        existingCategories.Add(category);
                                    }

                                    if (!string.IsNullOrWhiteSpace(unit) && !existingUnits.Contains(unit))
                                    {
                                        var newUnit = new DropdownData
                                        {
                                            Name = unit,
                                            ShortName = "",
                                            Type = "ProductUnit",
                                            CompanyID = companyId,
                                            IsActive = true,
                                            IsDeleted = false
                                        };
                                        context.tblDropdownData.Add(newUnit);
                                        await context.SaveChangesAsync();
                                        existingUnits.Add(unit);
                                    }

                                    if (!string.IsNullOrWhiteSpace(type) && !existingTypes.Contains(type))
                                    {
                                        var newType = new DropdownData
                                        {
                                            Name = type,
                                            Type = "ProductType",
                                            ShortName = "",
                                            CompanyID = companyId,
                                            IsActive = true,
                                            IsDeleted = false
                                        };
                                        context.tblDropdownData.Add(newType);
                                        await context.SaveChangesAsync();
                                        existingTypes.Add(type);
                                    }

                                    if (!string.IsNullOrWhiteSpace(size) && !existingSizes.Contains(size))
                                    {
                                        var newSize = new DropdownData
                                        {
                                            Name = size,
                                            Type = "ProductSize",
                                            ShortName = "",
                                            CompanyID = companyId,
                                            IsActive = true,
                                            IsDeleted = false
                                        };
                                        context.tblDropdownData.Add(newSize);
                                        await context.SaveChangesAsync();
                                        existingSizes.Add(size);
                                    }

                                    var CategoryShortCode = await context.tblDropdownData
                                       .Where(p => p.CompanyID == companyId && p.Type == "ProductCategory" && p.Name == reader.GetValue(2) && p.IsActive == true)
                                       .FirstOrDefaultAsync();

                                    var lastCategoryCode = await context.tblProducts
                            .Where(p => p.CompanyID == companyId && p.Category == category)
                            .OrderBy(p => p.ID)
                            .LastOrDefaultAsync();

                                    int codeNumber = 1;

                                    if (lastCategoryCode != null && lastCategoryCode.CategoryCode.Contains('-'))
                                    {
                                        var codePart = lastCategoryCode.CategoryCode.Split('-')[1];

                                        if (int.TryParse(codePart, out int parsedCode))
                                        {
                                            codeNumber = parsedCode + 1; // Increment the number if parsing is successful
                                        }
                                    }

                                    string categoryCode = CategoryShortCode?.ShortName;

                                    if (existingProduct != null)
                                    {
                                        existingProduct.ProductType = reader.GetValue(1)?.ToString() ?? "";
                                        existingProduct.Category = category;
                                        existingProduct.Unit = unit;
                                        existingProduct.Type = type;
                                        existingProduct.Size = size;
                                        existingProduct.SalePrice = ParseDecimal(reader.GetValue(6)?.ToString()) ?? 0;
                                        existingProduct.DefaultUnit = defaultUnit;
                                        existingProduct.OpeningQuantity = ParseDecimal(reader.GetValue(8)?.ToString()) ?? 0;
                                        existingProduct.LowStockLevel = ParseInt(reader.GetValue(9)?.ToString()) ?? 0;
                                        existingProduct.OpeningRate = ParseDecimal(reader.GetValue(10)?.ToString()) ?? 0;

                                        await context.SaveChangesAsync();
                                    }
                                    else
                                    {
                                        var productType = reader.GetValue(1);
                                        Product product = new Product
                                        {
                                            CompanyID = companyId,
                                            Name = name,
                                            ProductType = productType != null
                                            ? productType.ToString().Trim()
                                            : "",
                                            Category = category,
                                            Unit = unit,
                                            Type = type,
                                            Size = size,
                                            SalePrice = ParseDecimal(reader.GetValue(6)?.ToString()) ?? 0,
                                            DefaultUnit = defaultUnit,
                                            OpeningQuantity = ParseDecimal(reader.GetValue(8)?.ToString()) ?? 0,
                                            LowStockLevel = ParseInt(reader.GetValue(9)?.ToString()) ?? 0,
                                            OpeningRate = ParseDecimal(reader.GetValue(10)?.ToString()) ?? 0,
                                            CategoryCode = $"{categoryCode}-{codeNumber}",
                                            Date = DateOnly.FromDateTime(DateTime.Now),
                                            Code = nextProductCode++, // Increment code for each product
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

                                        context.tblProducts.Add(product);
                                        await context.SaveChangesAsync();
                                        codeNumber++;
                                    }
                                }
                                await transaction.CommitAsync();


                            }
                        }
                        return Ok(new { status_message = "Successfully inserted/updated products.", status_code = 1 });
                    }
                    catch (Exception e)
                    {
                        return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.", e.Message });
                    }
                }
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.", e.Message });
            }
        }

        private int? ParseInt(string value)
        {
            if (int.TryParse(value, out int result))
            {
                return result;
            }
            return null;
        }
        private decimal? ParseDecimal(string value)
    => decimal.TryParse(value, out var result) ? result : (decimal?)null;



    }
}
