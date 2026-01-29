using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HisaberAccountServer.Migrations
{
    /// <inheritdoc />
    public partial class AddSaleBodyTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CustomerAccountCode",
                table: "tblSaleHead",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "tblSaleBody",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Product = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Unit = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Quantity = table.Column<int>(type: "int", maxLength: 20, nullable: false),
                    Rate = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DiscPercentege = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Discount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TaxRate = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    SaleTax = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Net = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Field1 = table.Column<string>(type: "text", nullable: false),
                    Field2 = table.Column<string>(type: "text", nullable: false),
                    Field3 = table.Column<string>(type: "text", nullable: false),
                    Field4 = table.Column<string>(type: "text", nullable: false),
                    SaleType = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    SaleBy = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    CompanyID = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tblSaleBody", x => x.ID);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "tblSaleBody");

            migrationBuilder.DropColumn(
                name: "CustomerAccountCode",
                table: "tblSaleHead");
        }
    }
}
