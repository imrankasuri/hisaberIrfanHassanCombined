using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore.Metadata;


namespace HisaberAccountServer.Data
{
    public class ApplicationUser : IdentityUser
    {
        public string FullName { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime CreatedDate { get; set; }

    }
}
