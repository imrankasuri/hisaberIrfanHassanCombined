using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HisaberAccountServer.Migrations
{
    /// <inheritdoc />
    public partial class AddDropdownData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Create tblProducts
            migrationBuilder.CreateTable(
                name: "tblProducts",
                columns: table => new
                {
                    ID = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(nullable: false),
                    Type = table.Column<string>(nullable: true),
                    Date = table.Column<DateOnly>(nullable: true),
                    OpeningQuantity = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    BaseOpeningQuantity = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    OpeningRate = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Code = table.Column<long>(nullable: false),
                    StockAssetAccount = table.Column<string>(nullable: true),
                    LowStockLevel = table.Column<int>(nullable: true),
                    Category = table.Column<string>(nullable: true),
                    IncomeAccount = table.Column<string>(nullable: true),
                    SalePrice = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    SaleInformation = table.Column<string>(nullable: true),
                    ExpenseAccount = table.Column<string>(nullable: true),
                    Cost = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    SaleDiscount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    PurchaseDiscount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Weight = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Unit = table.Column<string>(nullable: true),
                    Notes = table.Column<string>(nullable: true),
                    GSTRate = table.Column<string>(nullable: true),
                    NonFilerGSTRate = table.Column<string>(nullable: true),
                    MaxRRExTax = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    MaxRRIncTax = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    BinLocation = table.Column<string>(nullable: true),
                    LargePackSize = table.Column<int>(nullable: false),
                    SmallPackSize = table.Column<int>(nullable: false),
                    PrefferedSupplier = table.Column<string>(nullable: true),
                    Field1 = table.Column<string>(nullable: true),
                    Field2 = table.Column<string>(nullable: true),
                    Field3 = table.Column<string>(nullable: true),
                    Field4 = table.Column<string>(nullable: true),
                    FieldA = table.Column<string>(nullable: true),
                    FieldB = table.Column<string>(nullable: true),
                    FieldC = table.Column<string>(nullable: true),
                    FieldD = table.Column<string>(nullable: true),
                    ProductType = table.Column<string>(nullable: true),
                    DefaultUnit = table.Column<string>(nullable: true),
                    CategoryCode = table.Column<string>(nullable: true),
                    Size = table.Column<string>(nullable: true),
                    OpeningWeight = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    OpeningLength = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    CompanyID = table.Column<int>(nullable: false),
                    IsActive = table.Column<bool>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false),
                    CreatedDate = table.Column<DateTime>(nullable: false, defaultValueSql: "GETDATE()"),
                    UpdatedDate = table.Column<DateTime>(nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tblProducts", x => x.ID);
                });

            // Create tblDropdownData
            migrationBuilder.CreateTable(
                name: "tblDropdownData",
                columns: table => new
                {
                    ID = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(nullable: false),
                    Type = table.Column<string>(nullable: false),
                    ShortName = table.Column<string>(nullable: true),
                    CompanyID = table.Column<int>(nullable: false),
                    IsActive = table.Column<bool>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false),
                    CreatedDate = table.Column<DateTime>(nullable: false, defaultValueSql: "GETDATE()"),
                    UpdatedDate = table.Column<DateTime>(nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tblDropdownData", x => x.ID);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Drop tblDropdownData
            migrationBuilder.DropTable(name: "tblDropdownData");

            // Drop tblProducts
            migrationBuilder.DropTable(name: "tblProducts");
        }
    }
}
