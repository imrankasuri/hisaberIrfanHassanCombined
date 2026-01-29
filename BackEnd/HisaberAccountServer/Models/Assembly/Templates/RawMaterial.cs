namespace HisaberAccountServer.Models.Assembly.Templates
{
    public class RawMaterial
    {
        public int ID { get; set; }
        public int CompanyID { get; set; }
        public int ReferenceID { get; set; }
        public string? ProductName { get; set; }
        public int? ProductID { get; set; }
        public long? ProductCode { get; set; }
        public string? Description { get; set; }
        public string? Location { get; set; }
        public string? LocationCode { get; set; }
        public int? LocationID { get; set; }
        public string? Unit { get; set; }
        public int? StockInHand { get; set; }
        public int? PerUnit { get; set; }
        public decimal? QTYRequired { get; set; }
        public decimal? Rate { get; set; }
        public decimal? Amount { get; set; }
        public string AssemblyType { get; set; }
        public string? Extra1 { get; set; }
        public string? Extra2 { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
        public string? UserID { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime UpdatedDate { get; set; }
    }
}
