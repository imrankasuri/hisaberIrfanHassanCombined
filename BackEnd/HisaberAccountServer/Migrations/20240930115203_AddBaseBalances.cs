using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HisaberAccountServer.Migrations
{
    /// <inheritdoc />
    public partial class AddBaseBalances : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {

            migrationBuilder.AddColumn<decimal>(
                name: "CustomerBaseOpeningBalance",
                table: "tblCustomerSupplier",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "SupplierBaseOpeningBalance",
                table: "tblCustomerSupplier",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

            migrationBuilder.DropColumn(
                name: "CustomerBaseOpeningBalance",
                table: "tblCustomerSupplier");

            migrationBuilder.DropColumn(
                name: "SupplierBaseOpeningBalance",
                table: "tblCustomerSupplier");
        }
    }
}
