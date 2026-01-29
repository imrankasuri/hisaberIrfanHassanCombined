using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HisaberAccountServer.Migrations
{
    /// <inheritdoc />
    public partial class UpdateTblBankPayments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "NominalAccountCode",
                table: "tblBankPayments",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "NominalAccountCode",
                table: "tblBankPayments");
        }
    }
}
