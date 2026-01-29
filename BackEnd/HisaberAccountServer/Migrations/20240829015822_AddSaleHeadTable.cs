using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HisaberAccountServer.Migrations
{
    /// <inheritdoc />
    public partial class AddSaleHeadTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {

            migrationBuilder.CreateTable(
                name: "tblSaleHead",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CustomerName = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    Address = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    Date = table.Column<DateOnly>(type: "DATE", nullable: false),
                    TermDays = table.Column<int>(type: "int", maxLength: 20, nullable: false),
                    DueDate = table.Column<DateOnly>(type: "DATE", nullable: false),
                    DocNo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreditLimit = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Balance = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SubTotal = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalDiscount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalSaleTax = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Total = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Field1 = table.Column<string>(type: "text", nullable: false),
                    Field2 = table.Column<string>(type: "text", nullable: false),
                    Field3 = table.Column<string>(type: "text", nullable: false),
                    Field4 = table.Column<string>(type: "text", nullable: false),
                    SaleType = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    SaleBy = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Extra2 = table.Column<string>(type: "text", nullable: false),
                    CompanyID = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tblSaleHead", x => x.ID);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "tblSaleHead");

            migrationBuilder.CreateTable(
                name: "tblSale",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Address = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Balance = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CompanyID = table.Column<int>(type: "int", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    CreditLimit = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CustomerName = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    Date = table.Column<DateOnly>(type: "DATE", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    DiscPercentege = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Discount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DocNo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DueDate = table.Column<DateOnly>(type: "DATE", nullable: false),
                    Extra2 = table.Column<string>(type: "text", nullable: false),
                    Field1 = table.Column<string>(type: "text", nullable: false),
                    Field2 = table.Column<string>(type: "text", nullable: false),
                    Field3 = table.Column<string>(type: "text", nullable: false),
                    Field4 = table.Column<string>(type: "text", nullable: false),
                    FieldA = table.Column<string>(type: "text", nullable: false),
                    FieldB = table.Column<string>(type: "text", nullable: false),
                    FieldC = table.Column<string>(type: "text", nullable: false),
                    FieldD = table.Column<string>(type: "text", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    Net = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: false),
                    Product = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Quantity = table.Column<int>(type: "int", maxLength: 20, nullable: false),
                    Rate = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    SaleBy = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    SaleTax = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    SaleType = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    SubTotal = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TaxRate = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    TermDays = table.Column<int>(type: "int", maxLength: 20, nullable: false),
                    Total = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalDiscount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalSaleTax = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Unit = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tblSale", x => x.ID);
                });
        }
    }
}
