namespace HisaberAccountServer.Models.Reports
{
    public class ProductSummary
    {
        public long ProductCode { get; set; }
        public string Name { get; set; }
        public string Category { get; set; }
        public string Type { get; set; }
        public decimal Quantity { get; set; }
        public decimal Weight { get; set; }
        public decimal Length { get; set; }
        public decimal? Rate { get; set; }
        public decimal? Amount { get; set; }


    }
}
