namespace HisaberAccountServer.Models.StockAdjust
{
    public class StockAdjustBody
    {
        public int ID { get; set; }
        public DateOnly Date { get; set; }
        public long InvoiceNo { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public long ProductCode { get; set; }
        public string? Description { get; set; }
        public string? Unit { get; set; }
        public int Quantity { get; set; }
        public decimal Weight { get; set; }
        public decimal Length { get; set; }
        public decimal Rate { get; set; }
        public string? DefaultUnit { get; set; }
        public decimal Amount { get; set; }
        public string? AdjustType { get; set; }
        public string? AdjustBy { get; set; }
        public int CompanyID { get; set; }
        public string? Extra1 { get; set; }
        public string? Extra2 { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
        public string UserID { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; } = DateTime.Now;
        public DateTime UpdatedDate { get; set; } = DateTime.Now;
    }
}
