using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HisaberAccountServer.Migrations
{
    /// <inheritdoc />
    public partial class AddUserIDintbls : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "UserID",
                table: "tblSaleHead",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UserID",
                table: "tblSaleBody",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BankCode",
                table: "tblReceiptHead",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "BankID",
                table: "tblReceiptHead",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UserID",
                table: "tblReceiptHead",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UserID",
                table: "tblPurchaseHead",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UserID",
                table: "tblPurchaseBody",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BankCode",
                table: "tblPaymentHead",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "BankID",
                table: "tblPaymentHead",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UserID",
                table: "tblPaymentHead",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UserID",
                table: "tblPaymentBody",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UserID",
                table: "tblSaleHead");

            migrationBuilder.DropColumn(
                name: "UserID",
                table: "tblSaleBody");

            migrationBuilder.DropColumn(
                name: "BankCode",
                table: "tblReceiptHead");

            migrationBuilder.DropColumn(
                name: "BankID",
                table: "tblReceiptHead");

            migrationBuilder.DropColumn(
                name: "UserID",
                table: "tblReceiptHead");

            migrationBuilder.DropColumn(
                name: "UserID",
                table: "tblPurchaseHead");

            migrationBuilder.DropColumn(
                name: "UserID",
                table: "tblPurchaseBody");

            migrationBuilder.DropColumn(
                name: "BankCode",
                table: "tblPaymentHead");

            migrationBuilder.DropColumn(
                name: "BankID",
                table: "tblPaymentHead");

            migrationBuilder.DropColumn(
                name: "UserID",
                table: "tblPaymentHead");

            migrationBuilder.DropColumn(
                name: "UserID",
                table: "tblPaymentBody");
        }
    }
}
