using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HisaberAccountServer.Migrations
{
    /// <inheritdoc />
    public partial class UpdateCustomerSupplierTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "OpeningBalance",
                table: "tblCustomerSupplier",
                newName: "SupplierOpeningBalance");

            migrationBuilder.AddColumn<decimal>(
                name: "CustomerOpeningBalance",
                table: "tblCustomerSupplier",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CustomerOpeningBalance",
                table: "tblCustomerSupplier");

            migrationBuilder.RenameColumn(
                name: "SupplierOpeningBalance",
                table: "tblCustomerSupplier",
                newName: "OpeningBalance");
        }
    }
}
