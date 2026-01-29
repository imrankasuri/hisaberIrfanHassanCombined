namespace HisaberAccountServer.Models.Views
{
    public class vwDetailFinishedGoods
    {
        public int ID { get; set; }
        public string? TemplateName { get; set; }
        public int? RMFactor { get; set; }
        public string? CostCalType { get; set; }
        public string? Notes { get; set; }
        public string? ProductName { get; set; }
        public long? ProductCode { get; set; }
        public string? Description { get; set; }
        public int? CompanyID { get; set; }
        public string? UserID { get; set; }
        public decimal? QTYFI { get; set; }
        public string? Unit { get; set; }
        public decimal? CostFI { get; set; }
        public bool DetailActive { get; set; }
        public bool FinishedActive { get; set; }
        public int? Quantity { get; set; }
        public DateTime CreatedDate { get; set; }
        public string? AssemblyType { get; set; }
        public string? Location { get; set; }
        public DateOnly? StartDate { get; set; }
        public DateOnly? FinishedDate { get; set; }
        public string? RefNo { get; set; }
        public string? Status { get; set; }
    }
}
