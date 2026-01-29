using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HisaberAccountServer.Migrations
{
    /// <inheritdoc />
    public partial class UpdateBankPaymentsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Field4",
                table: "tblBankPayments");

            migrationBuilder.AddColumn<string>(
                name: "Bank",
                table: "tblBankPayments",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Bank",
                table: "tblBankPayments");

            migrationBuilder.AddColumn<string>(
                name: "Field4",
                table: "tblBankPayments",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
