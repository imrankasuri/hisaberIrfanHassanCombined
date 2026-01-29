namespace HisaberAccountServer.Models
{
    public class Product
    {
        public int ID { get; set; }
        public string Name { get; set; }
        public string? Type { get; set; }
        public DateOnly? Date { get; set; }
        public decimal OpeningQuantity { get; set; }
        public decimal BaseOpeningQuantity { get; set; }
        public decimal OpeningRate { get; set; }
        public long Code { get; set; }
        public string? StockAssetAccount { get; set; }
        public int? LowStockLevel { get; set; }
        public string? Category { get; set; }
        public string? IncomeAccount { get; set; }
        public decimal? SalePrice { get; set; }
        public string? SaleInformation { get; set; }
        public string? ExpenseAccount { get; set; }
        public decimal? Cost { get; set; }
        public decimal? SaleDiscount { get; set; }
        public decimal? PurchaseDiscount { get; set; }
        public decimal? Weight { get; set; }
        public string? Unit { get; set; }
        public string? Notes { get; set; }
        public string? GSTRate { get; set; }
        public string? NonFilerGSTRate { get; set; }
        public decimal? MaxRRExTax { get; set; }
        public decimal? MaxRRIncTax { get; set; }
        public string? BinLocation { get; set; }
        public int LargePackSize { get; set; }
        public int SmallPackSize { get; set; }
        public string? PrefferedSupplier { get; set; }
        public string? Field1 { get; set; }
        public string? Field2 { get; set; }
        public string? Field3 { get; set; }
        public string? Field4 { get; set; }
        public string? FieldA { get; set; }
        public string? FieldB { get; set; }
        public string? FieldC { get; set; }
        public string? FieldD { get; set; }
        public string? ProductType { get; set; }
        public string? DefaultUnit { get; set; }
        public string? CategoryCode { get; set; }
        public string? Size { get; set; }
        public decimal? OpeningWeight { get; set; }
        public decimal? OpeningLength { get; set; }
        public int CompanyID { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.Now;
        public DateTime UpdatedDate { get; set; } = DateTime.Now;
    }
}
