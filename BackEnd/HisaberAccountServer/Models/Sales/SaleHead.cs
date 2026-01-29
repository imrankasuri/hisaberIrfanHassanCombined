namespace HisaberAccountServer.Models.Sales
{
    public class SaleHead
    {
        public int ID { get; set; }
        public string CustomerName { get; set; }
        public string CustomerAccountCode { get; set; }
        public string? Address { get; set; }
        public DateOnly? Date { get; set; }
        public int? TermDays { get; set; }
        public DateOnly? DueDate { get; set; }
        public string? DocNo { get; set; }
        public decimal? CreditLimit { get; set; }
        public decimal? Balance { get; set; }
        public decimal? AdjustedBalance { get; set; }
        public string? Notes { get; set; }
        public decimal? SubTotal { get; set; }
        public decimal? TotalDiscount { get; set; }
        public decimal? TotalSaleTax { get; set; }
        public decimal? Total { get; set; }
        public string? Field1 { get; set; }
        public string? Field2 { get; set; }
        public bool InComplete { get; set; }
        public decimal? OverallDiscount { get; set; }
        public string? SaleType { get; set; }
        public string? SaleBy { get; set; }
        public string? UserID { get; set; }
        public long InvoiceNo { get; set; }
        public int CompanyID { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.Now;
        public DateTime UpdatedDate { get; set; } = DateTime.Now;
    }
}
