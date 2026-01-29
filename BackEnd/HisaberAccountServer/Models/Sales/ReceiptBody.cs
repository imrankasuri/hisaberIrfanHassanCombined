namespace HisaberAccountServer.Models.Sales
{
    public class ReceiptBody
    {
        public int ID { get; set; }
        public DateOnly? Date { get; set; }
        public string? DocNo { get; set; }
        public int InvoiceNo { get; set; }
        public DateOnly? DueDate { get; set; }
        public decimal? Amount { get; set; }
        public decimal? OpenBalance { get; set; }
        public decimal? WHTRate { get; set; }
        public decimal? WHT { get; set; }
        public decimal? Discount { get; set; }
        public decimal? Receipt { get; set; }
        public decimal? Total { get; set; }
        public string? ReceiptType { get; set; }
        public string? ReceiptBy { get; set; }
        public string? UserID { get; set; }
        public int CompanyID { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.Now;
        public DateTime UpdatedDate { get; set; } = DateTime.Now;
        public int VoucherNo { get; set; }
        public int VoucherID { get; set; }
        public bool InComplete { get; set; }
    }
}
