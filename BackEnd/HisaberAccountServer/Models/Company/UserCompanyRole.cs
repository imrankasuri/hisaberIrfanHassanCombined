using HisaberAccountServer.Data;
using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using HisaberAccountServer.Models.Company;

public class UserCompanyRole
{
    [Key]
    public int Id { get; set; }

    [Required]
    public string UserId { get; set; }

    [ForeignKey("UserId")]
    public virtual ApplicationUser User { get; set; }

    [Required]
    public int CompanyId { get; set; }

    [ForeignKey("CompanyId")]
    public virtual CompanyInfo CompanyInfo { get; set; }

    [Required]
    public string RoleId { get; set; }

    [ForeignKey("RoleId")]
    public virtual IdentityRole Role { get; set; }

    public DateTime CreatedDate { get; set; } = DateTime.Now;
    public DateTime UpdatedDate { get; set; } = DateTime.Now;
}
