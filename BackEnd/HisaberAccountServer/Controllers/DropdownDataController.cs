using HisaberAccountServer.Data;
using HisaberAccountServer.Models;
using HisaberAccountServer.Models.Sales;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HisaberAccountServer.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class DropdownDataController : ControllerBase
    {
        private readonly HisaberDbContext context;
        public DropdownDataController(HisaberDbContext context)
        {
            this.context = context;
        }

        [HttpPost("AddDropdownData")]
        public async Task<ActionResult<DropdownData>> AddDropdownData(DropdownData dropdownData)
        {
            try
            {
                if (dropdownData == null)
                {
                    return Ok(new { status_message = "Data is null.", status_code = 0, dropdownData });
                }

                var data = await context.tblDropdownData.Where(d => d.Name == dropdownData.Name && d.CompanyID == dropdownData.CompanyID && d.Type == dropdownData.Type && d.IsActive == true).FirstOrDefaultAsync();

                if (data != null)
                {
                    return Ok(new
                    {
                        status_code = 0,
                        status_message = $"'{dropdownData.Name}' already exists."
                    });
                }

                await context.tblDropdownData.AddAsync(dropdownData);
                await context.SaveChangesAsync();

                return Ok(new { status_message = "Added Successfully.", status_code = 1, dropdownData });

            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong." });
            }
        }

        [HttpGet("GetDropdownData/{CompanyID}")]
        public async Task<ActionResult<DropdownData>> GetDropdownData(int CompanyID, string Type)
        {
            try
            {
                var data = await context.tblDropdownData.Where(e => e.CompanyID == CompanyID && e.Type == Type && e.IsActive == true).ToListAsync();
                if (data == null)
                {
                    return Ok(new { status_code = 0, DropdownData = data });
                }
                return Ok(new { DropdownData = data, status_code = 1 });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong." });
            }
        }

        [HttpGet("GetDropdownDataByName/{CompanyID}")]
        public async Task<ActionResult<DropdownData>> GetDropdownDataByName(int CompanyID, string Type, string name)
        {
            try
            {
                var data = await context.tblDropdownData.Where(e => e.CompanyID == CompanyID && e.Type == Type && e.Name == name && e.IsActive == true).ToListAsync();
                if (data == null)
                {
                    return Ok(new { status_code = 0, DropdownData = data });
                }
                return Ok(new { DropdownData = data, status_code = 1 });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong." });
            }
        }

        [HttpGet("GetDropdownDataByID/{ID}/{CompanyID}")]
        public async Task<ActionResult<DropdownData>> GetDropdownDataByID(int ID, int CompanyID)
        {
            try
            {
                var data = await context.tblDropdownData.Where(e => e.CompanyID == CompanyID && e.ID == ID).FirstOrDefaultAsync();
                if (data == null)
                {
                    return Ok(new { status_code = 0, DropdownData = data, status_message = "Records Not Found." });
                }
                return Ok(new { DropdownData = data, status_code = 1 });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong." });
            }
        }

        [HttpPatch]
        [Route("UpdateRecord/{id}")]
        public async Task<ActionResult<DropdownData>> UpdateStudent(int id, DropdownData dropdownData)
        {
            try
            {
                if (id != dropdownData.ID)
                {
                    return Ok(new { status_code = 0, status_message = "Invalid ID." });
                }
                dropdownData.UpdatedDate = DateTime.Now;
                context.Entry(dropdownData).State = EntityState.Modified;
                await context.SaveChangesAsync();
                return Ok(new { dropdownData, status_code = 1, status_message = "Updated Successfully." });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong." });
            }
        }

        [HttpPatch]
        [Route("DeleteRecord")]
        public async Task<ActionResult<DropdownData>> DeleteRecord(GeneralRequest inParams)
        {
            try
            {
                var dropdownData = await context.tblDropdownData.FindAsync(inParams.ID);
                if (dropdownData == null)
                {
                    return Ok(new { status_code = 0, status_message = "Invalid ID." });
                }

                var Products = await context.tblProducts.Where(p => p.CompanyID == inParams.CompanyID && p.Category == dropdownData.Name).ToListAsync();
                int productCount = Products.Count;
                if (productCount > 0)
                {
                    return Ok(new { status_code = 0, status_message = "Properties used in Products cannot be deleted." });
                }

                dropdownData.UpdatedDate = DateTime.Now;
                dropdownData.IsActive = false;
                dropdownData.IsDeleted = true;
                context.Entry(dropdownData).State = EntityState.Modified;
                await context.SaveChangesAsync();
                return Ok(new { dropdownData, status_code = 1, status_message = "Deleted Successfully." });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.", error = e.Message });
            }
        }
    }
}
