using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HisaberAccountServer.Migrations
{
    /// <inheritdoc />
    public partial class AddInvoiceBillIDs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Field3",
                table: "tblReceiptHead");

            migrationBuilder.DropColumn(
                name: "Field4",
                table: "tblPaymentHead");

            migrationBuilder.AddColumn<long>(
                name: "InvoiceNo",
                table: "tblReceiptHead",
                type: "bigint",
                maxLength: 255,
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "BillID",
                table: "tblPaymentHead",
                type: "bigint",
                maxLength: 255,
                nullable: false,
                defaultValue: 0L);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "InvoiceNo",
                table: "tblReceiptHead");

            migrationBuilder.DropColumn(
                name: "BillID",
                table: "tblPaymentHead");

            migrationBuilder.AddColumn<string>(
                name: "Field3",
                table: "tblReceiptHead",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Field4",
                table: "tblPaymentHead",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
