namespace HisaberAccountServer.Models.Assembly.Templates
{
    public class FinishedGoods
    {
        public int ID { get; set; }
        public int CompanyID { get; set; }
        public int ReferenceID { get; set; }
        public string? ProductName { get; set; }
        public int? ProductID { get; set; }
        public long? ProductCode { get; set; }
        public string? Description { get; set; }
        public decimal? QTYFI { get; set; }
        public string? Unit { get; set; }
        public int? Quantity { get; set; }
        public decimal? CostFI { get; set; }
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
