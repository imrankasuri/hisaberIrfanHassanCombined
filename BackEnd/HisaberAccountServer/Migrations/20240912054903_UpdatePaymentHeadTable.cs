using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HisaberAccountServer.Migrations
{
    /// <inheritdoc />
    public partial class UpdatePaymentHeadTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Field3",
                table: "tblPaymentHead");

            migrationBuilder.AddColumn<bool>(
                name: "InComplete",
                table: "tblPaymentHead",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "InComplete",
                table: "tblPaymentHead");

            migrationBuilder.AddColumn<string>(
                name: "Field3",
                table: "tblPaymentHead",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
