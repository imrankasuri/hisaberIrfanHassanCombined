namespace HisaberAccountServer.Models.Purchase
{
    public class PurchaseHead
    {
        public int ID { get; set; }
        public string SupplierName { get; set; }
        public string SupplierAccountCode { get; set; }
        public string? Address { get; set; }
        public DateOnly? Date { get; set; }
        public int? TermDays { get; set; }
        public DateOnly? DueDate { get; set; }
        public long BillID { get; set; }
        public string? BillNumber { get; set; }
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
        public string? Field3 { get; set; }
        public string? Field4 { get; set; }
        public string? PurchaseType { get; set; }
        public string? PurchaseBy { get; set; }
        public string? UserID { get; set; }
        public bool InComplete { get; set; }
        public int CompanyID { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.Now;
        public DateTime UpdatedDate { get; set; } = DateTime.Now;
    }
}
