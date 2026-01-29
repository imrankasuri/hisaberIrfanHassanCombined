namespace HisaberAccountServer.Models.Settings
{
    public class Location
    {
        public int ID { get; set; }
        public int CompanyID { get; set; }
        public string? LocationName { get; set; }
        public string? LocationCode { get; set; }
        public string? Details { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
        public string? UserID { get; set; }
        public string? Extra1 { get; set; }
        public string? Extra2 { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime UpdatedDate { get; set; }

    }
}
