using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HisaberAccountServer.Migrations
{
    /// <inheritdoc />
    public partial class UpdateBankPaymentsTableko : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "BankPayment",
                table: "tblBankPayments",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "BankReceipt",
                table: "tblBankPayments",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "WHTPayment",
                table: "tblBankPayments",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BankPayment",
                table: "tblBankPayments");

            migrationBuilder.DropColumn(
                name: "BankReceipt",
                table: "tblBankPayments");

            migrationBuilder.DropColumn(
                name: "WHTPayment",
                table: "tblBankPayments");
        }
    }
}
