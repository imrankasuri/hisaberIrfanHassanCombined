namespace HisaberAccountServer.Models.Sales
{
    public class SaleBody
    {
        public int ID { get; set; }
        public string? Product { get; set; }
        public int ProductID { get; set; }
        public string? Description { get; set; }
        public string? Unit { get; set; }
        public decimal? Quantity { get; set; }
        public decimal? Rate { get; set; }
        public decimal? Amount { get; set; }
        public decimal? DiscPercentege { get; set; }
        public decimal? Discount { get; set; }
        public string? TaxRate { get; set; }
        public decimal? SaleTax { get; set; }
        public decimal? Net { get; set; }
        public string? Field1 { get; set; }
        public string? DefaultUnit { get; set; }
        public decimal? Weight { get; set; }
        public decimal? Length { get; set; }
        public string? SaleType { get; set; }
        public string? SaleBy { get; set; }
        public string? UserID { get; set; }
        public long? ProductCode { get; set; }
        public int InvoiceNo { get; set; }
        public int CompanyID { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.Now;
        public DateTime UpdatedDate { get; set; } = DateTime.Now;
        public bool Complete { get; set; }
        public bool InComplete { get; set; }
    }
}
