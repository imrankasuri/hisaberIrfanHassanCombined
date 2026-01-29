namespace HisaberAccountServer.Models.StockAdjust
{
    public class StockAdjustHead
    {
        public int ID { get; set; }
        public DateOnly Date { get; set; }
        public long InvoiceNo { get; set; }
        public string NominalAccount { get; set; } = string.Empty;
        public string AccountCode { get; set; } = string.Empty;
        public string? DocNo { get; set; }
        public decimal Total { get; set; }
        public string? Notes { get; set; }
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
