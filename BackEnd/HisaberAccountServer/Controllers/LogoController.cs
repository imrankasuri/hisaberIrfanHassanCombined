using HisaberAccountServer.Data;
using HisaberAccountServer.Models;
using HisaberAccountServer.Models.Company;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HisaberAccountServer.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class LogoController : ControllerBase
    {
        private readonly HisaberDbContext context;

        private const long MaxFileSize = 2 * 1024 * 1024; // 2 MB
        public LogoController(HisaberDbContext context)
        {
            this.context = context;
        }

        [HttpPost("AddLogo/{companyId}")]
        public async Task<IActionResult> UploadLogos([FromForm] List<IFormFile> file, int companyId, string type)
        {
            try
            {

                if (file == null || file.Count == 0)
                {
                    return Ok(new { status_message = "No file uploaded or the file is empty.", status_code = 0 });
                }

                var addedLogos = new List<object>();

                foreach (var singleFile in file)
                {
                    if (singleFile.Length == 0)
                    {
                        return Ok(new { status_message = "One of the files is empty.", status_code = 0 });
                    }

                    if (singleFile.Length > MaxFileSize)
                    {
                        return Ok(new { status_message = $"File size exceeds 2 MB: {singleFile.FileName}", status_code = 0 });
                    }

                    var fileExtension = Path.GetExtension(singleFile.FileName).ToLowerInvariant();
                    if (fileExtension != ".jpg" && fileExtension != ".png")
                    {
                        return Ok(new { status_message = $"Only JPG and PNG files are allowed: {singleFile.FileName}", status_code = 0 });
                    }

                    using (var memoryStream = new MemoryStream())
                    {
                        await singleFile.CopyToAsync(memoryStream);
                        var logo = new Logo
                        {
                            LogoName = singleFile.FileName,
                            LogoData = memoryStream.ToArray(),
                            LogoType = type,
                            IsActive = true,
                            IsDeleted = false,
                            CompanyId = companyId
                        };

                        context.tblLogo.Add(logo);
                        await context.SaveChangesAsync();

                        addedLogos.Add(new { Id = logo.Id, FileName = singleFile.FileName });
                    }
                }

                return Ok(new { addedLogos, status_message = $"{type} has been uploaded Successfully.", status_code = 1 });
            }
            catch (Exception e)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong.", e.Message });
            }
        }



    }
}
