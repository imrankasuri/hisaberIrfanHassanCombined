namespace HisaberAccountServer.Models.Reports
{
    public class CustomerTransaction
    {
        public DateTime Date { get; set; }
        public string Details { get; set; }
        public string CustomerName { get; set; }
        public string RefNo { get; set; }
        public bool InComplete { get; set; }
        public decimal? Credit { get; set; } // Nullable because Credit may not always have a value
        public string VoucherNo { get; set; }
        public decimal? Debit { get; set; }
        public decimal? Balance { get; set; }
        public decimal? DaysBalance { get; set; }
    }
}
