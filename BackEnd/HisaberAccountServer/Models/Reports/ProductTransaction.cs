namespace HisaberAccountServer.Models.Reports
{
    public class ProductTransaction
    {
        public DateTime Date { get; set; }
        public string SupplierName { get; set; }
        public string CustomerName { get; set; }
        public long? VoucherNo { get; set; }
        public decimal? InQuantity { get; set; }
        public decimal? InWeight { get; set; }
        public decimal? InLength { get; set; }
        public string? Product { get; set; }
        public decimal? Rate { get; set; }
        public decimal? Balance { get; set; }
        public string? Details { get; set; }
        public decimal? OutQuantity { get; set; }
        public decimal? OutWeight { get; set; }
        public decimal? OutLength { get; set; }
        public string DefaultUnit { get; set; }
        public decimal? BalanceQuantity { get; set; }
        public decimal? BalanceWeight { get; set; }
        public decimal? BalanceLength { get; set; }
    }
}
