using HisaberAccountServer.Data;
using HisaberAccountServer.Models;
using HisaberAccountServer.Models.Assembly.Templates;
using HisaberAccountServer.Models.Settings;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HisaberAccountServer.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class LocationController : ControllerBase
    {
        private readonly HisaberDbContext context;
        public LocationController(HisaberDbContext context)
        {
            this.context = context;
        }

        [HttpPost("AddLocation")]
        public async Task<IActionResult> AddLocation(Location inParams)
        {
            if (inParams == null)
            {
                return Ok(new { status_message = "Please Enter Valid Data", status_code = 0 });
            }

            try
            {

                var lastLocation = await context.tblLocations
                    .OrderByDescending(l => l.ID)
                    .FirstOrDefaultAsync();


                int currentCodeNumber = 101;
                if (lastLocation != null && !string.IsNullOrEmpty(lastLocation.LocationCode))
                {
                    string lastCode = lastLocation.LocationCode.Substring(1);
                    if (int.TryParse(lastCode, out int parsedCode))
                    {
                        currentCodeNumber = parsedCode + 1;
                    }
                }


                var location = new Location
                {
                    LocationName = inParams.LocationName,
                    LocationCode = "L" + currentCodeNumber,
                    Details = inParams.Details,
                    CompanyID = inParams.CompanyID,
                    UserID = inParams.UserID,
                    IsActive = true
                };


                await context.tblLocations.AddAsync(location);
                await context.SaveChangesAsync();

                return Ok(new { status_code = 1, status_message = "Location Added Successfully!" });
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

        [HttpGet("GetLocations/{CompanyID}")]
        public async Task<IActionResult> GetLocations(int companyId, string locationName = "")
        {
            try
            {

                var query = context.tblLocations.AsQueryable();

                // Filter by CompanyID
                query = query.Where(l => l.CompanyID == companyId && l.IsActive == true);


                if (!string.IsNullOrEmpty(locationName))
                {
                    query = query.Where(l => l.LocationName.Contains(locationName));
                }


                var locations = await query.ToListAsync();


                if (locations == null || !locations.Any())
                {
                    return Ok(new { status_code = 0, status_message = "No Locations Found", data = new List<Location>() });
                }

                return Ok(new
                {
                    status_code = 1,
                    status_message = "Locations Retrieved Successfully!",
                    data = locations
                });
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

        [HttpGet("GetLocationByID/{ID}/{CompanyID}")]
        public async Task<ActionResult<Location>> GetLocationByID(int ID, int CompanyID)
        {
            try
            {
                var data = await context.tblLocations.Where(e => e.CompanyID == CompanyID && e.ID == ID).FirstOrDefaultAsync();
                if (data == null)
                {
                    return Ok(new { status_code = 0, Location = data, status_message = "Location Not Found." });
                }
                return Ok(new { Location = data, status_code = 1 });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong." });
            }
        }

        [HttpPatch]
        [Route("UpdateLocation/{id}")]
        public async Task<ActionResult<Location>> UpdateStudent(int id, Location location)
        {
            try
            {
                if (id != location.ID)
                {
                    return Ok(new { status_code = 0, status_message = "Invalid ID." });
                }
                location.UpdatedDate = DateTime.Now;
                context.Entry(location).State = EntityState.Modified;
                await context.SaveChangesAsync();
                return Ok(new { location, status_code = 1, status_message = "Location Updated Successfully." });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong." });
            }
        }




    }
}
