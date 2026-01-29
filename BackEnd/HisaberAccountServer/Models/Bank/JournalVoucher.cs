namespace HisaberAccountServer.Models.Bank
{
    public class JournalVoucher
    {
        public int ID { get; set; }
        public string? RefNo { get; set; }
        public string? Mode { get; set; }
        public string? FromAccount { get; set; }
        public string? FromAccountCode { get; set; }
        public string? ToAccount { get; set; }
        public string? ToAccountCode { get; set; }
        public DateOnly Date { get; set; }
        public string? Detail { get; set; }
        public decimal Amount { get; set; }
        public string? Field1 { get; set; }
        public string? Field2 { get; set; }
        public string? Field3 { get; set; }
        public string? JournalVoucherBy { get; set; }
        public long VoucherNo { get; set; }
        public int CompanyID { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
        public string? UserID { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.Now;
        public DateTime UpdatedDate { get; set; } = DateTime.Now;
    }
}
