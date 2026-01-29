using HisaberAccountServer.Data;
using HisaberAccountServer.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualStudio.Web.CodeGenerators.Mvc.Templates.BlazorIdentity.Shared;

namespace HisaberAccountServer.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class PicturesController : ControllerBase
    {
        private readonly HisaberDbContext context;

        private const long MaxFileSize = 2 * 1024 * 1024;

        public PicturesController(HisaberDbContext context)
        {
            this.context = context;
        }

        [HttpPost("AddImage/{userId}")]
        public async Task<IActionResult> UploadPicture([FromForm] IFormFile file, string userId)
        {
            try
            {

                if (file == null || file.Length == 0)
                {
                    return Ok(new { status_message = "No file uploaded.", status_code = 0 });
                }

                if (file.Length > MaxFileSize)
                {
                    return Ok(new { status_message = $"File size exceeds 2 MB: {file.FileName}", status_code = 0 });
                }

                var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (fileExtension != ".jpg" && fileExtension != ".png")
                {
                    return Ok(new { status_message = $"Only JPG and PNG files are allowed: {file.FileName}", status_code = 0 });
                }

                using (var memoryStream = new MemoryStream())
                {
                    await file.CopyToAsync(memoryStream);
                    var picture = new Pictures
                    {
                        FileName = file.FileName,
                        ImageData = memoryStream.ToArray(),
                        IsActive = true,
                        IsDeleted = false,
                        UserID = userId
                    };

                    context.tblPictures.Add(picture);
                    await context.SaveChangesAsync();

                    return Ok(new { Id = picture.Id, status_message = "Picture Uploaded Successfully.", status_code = 1 });
                }
            }
            catch (Exception ex)
            {
                return Ok(new { status_message = "Sorry! Something went wrong.", status_code = 0 });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetPicture(string id)
        {
            try
            {

                var picture = await context.tblPictures.Where(e => e.IsDeleted == false && e.UserID == id)
                       .OrderByDescending(p => p.Id)
                       .FirstOrDefaultAsync();
                if (picture == null)
                {
                    return Ok(new { status_code = 0, status_message = "Picture Not Found." });
                }

                var fileExtension = Path.GetExtension(picture.FileName).ToLowerInvariant();
                var contentType = fileExtension == ".png" ? "image/png" : "image/jpeg";

                return File(picture.ImageData, contentType, picture.FileName);
            }
            catch (Exception ex)
            {
                return Ok(new { status_message = "Sorry! Something went wrong.", status_code = 0 });
            }
        }
    }
}
