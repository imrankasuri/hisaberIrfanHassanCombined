using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HisaberAccountServer.Migrations
{
    /// <inheritdoc />
    public partial class AddHeadChange : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Extra2",
                table: "tblSaleHead");

            migrationBuilder.DropColumn(
                name: "Extra2",
                table: "tblReceiptHead");

            migrationBuilder.AddColumn<long>(
                name: "InvoiceNo",
                table: "tblSaleHead",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "VoucherNo",
                table: "tblReceiptHead",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "InvoiceNo",
                table: "tblSaleHead");

            migrationBuilder.DropColumn(
                name: "VoucherNo",
                table: "tblReceiptHead");

            migrationBuilder.AddColumn<string>(
                name: "Extra2",
                table: "tblSaleHead",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Extra2",
                table: "tblReceiptHead",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
