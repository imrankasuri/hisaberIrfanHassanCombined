namespace HisaberAccountServer.Models.Purchase
{
    public class PaymentBody
    {
        public int ID { get; set; }
        public DateOnly? Date { get; set; }
        public string? BillNo { get; set; }
        public long? BillID { get; set; }
        public DateOnly? DueDate { get; set; }
        public decimal? Amount { get; set; }
        public decimal? OpenBalance { get; set; }
        public decimal? WHTRate { get; set; }
        public decimal? WHT { get; set; }
        public decimal? Discount { get; set; }
        public decimal? Payment { get; set; }
        public decimal? Total { get; set; }
        public string? PurchaseType { get; set; }
        public string? PurchaseBy { get; set; }
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
