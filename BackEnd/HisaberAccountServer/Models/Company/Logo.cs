namespace HisaberAccountServer.Models.Company
{
    public class Logo
    {
        public int Id { get; set; }
        public int CompanyId { get; set; }
        public string LogoName { get; set; }
        public byte[] LogoData { get; set; }
        public string LogoType { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.Now;
    }
}
