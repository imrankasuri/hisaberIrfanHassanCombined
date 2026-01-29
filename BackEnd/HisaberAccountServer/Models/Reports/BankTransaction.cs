namespace HisaberAccountServer.Models.Reports
{
    public class BankTransaction
    {
        public string? Type { get; set; }
        public long VoucherNo { get; set; }
        public DateTime Date { get; set; }
        public string? Account { get; set; }
        public string? AccountCode { get; set; }
        public string? RefNo { get; set; }
        public string? Details { get; set; }
        public string? Mode { get; set; }
        public decimal? Payments { get; set; }
        public decimal? Receipts { get; set; }
        public decimal? Balance { get; set; }
    }
}
