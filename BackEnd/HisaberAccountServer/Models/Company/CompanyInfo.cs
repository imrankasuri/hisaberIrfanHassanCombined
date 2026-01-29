namespace HisaberAccountServer.Models.Company
{
    public class CompanyInfo
    {
        public int ID { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string CompanyCode { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public long Phone { get; set; }
        public string Fax { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public long Mobile { get; set; }
        public string Website { get; set; } = string.Empty;
        public string LogoLogin { get; set; } = string.Empty;
        public string LogoTitle { get; set; } = string.Empty;
        public string LogoReports { get; set; } = string.Empty;
        public string PackageName { get; set; } = string.Empty;
        public DateTime PackageExpiry { get; set; }
        public string NTN { get; set; } = string.Empty;
        public string Currency {  get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime UpdatedDate { get; set; }


    }
}
