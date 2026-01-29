using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HisaberAccountServer.Migrations
{
    /// <inheritdoc />
    public partial class AddInvoiceBillID : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "InvoiceNo",
                table: "tblReceiptHead");

            migrationBuilder.DropColumn(
                name: "BillID",
                table: "tblPaymentHead");

            migrationBuilder.AddColumn<long>(
                name: "InvoiceNo",
                table: "tblReceiptHead",
                type: "bigint",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<long>(
                name: "BillID",
                table: "tblPaymentHead",
                type: "bigint",
                nullable: false,
                defaultValue: 0);
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
                name: "InvoiceNo",
                table: "tblReceiptHead",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "BillID",
                table: "tblPaymentHead",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
