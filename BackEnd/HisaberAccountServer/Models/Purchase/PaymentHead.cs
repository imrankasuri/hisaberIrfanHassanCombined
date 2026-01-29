namespace HisaberAccountServer.Models.Purchase
{
    public class PaymentHead
    {
        public int ID { get; set; }
        public string? SupplierName { get; set; }
        public string? SupplierAccountCode { get; set; }
        public string? MailingAddress { get; set; }
        public DateOnly? Date { get; set; }
        public string? RefNo { get; set; }
        public string? Bank { get; set; }
        public string? BankCode { get; set; }
        public int? BankID { get; set; }
        public string? Mode { get; set; }
        public decimal? Amount { get; set; }
        public decimal? WHTRate { get; set; }
        public decimal? AdditionalWHT { get; set; }
        public decimal? UnAllocatedBalance { get; set; }
        public string? Notes { get; set; }
        public decimal? TotalOpenBalance { get; set; }
        public decimal? TotalDiscount { get; set; }
        public decimal? TotalWHT { get; set; }
        public decimal? TotalPayment { get; set; }
        public decimal? OverallDiscount { get; set; }
        public decimal? Total { get; set; }
        public string? Field1 { get; set; }
        public string? Field2 { get; set; }
        public bool InComplete { get; set; }
        public long BillID { get; set; }
        public string? PurchaseType { get; set; }
        public string? PurchaseBy { get; set; }
        public string? UserID { get; set; }
        public long VoucherNo { get; set; }
        public int CompanyID { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.Now;
        public DateTime UpdatedDate { get; set; } = DateTime.Now;
    }
}
