using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HisaberAccountServer.Migrations
{
    /// <inheritdoc />
    public partial class UpdateReceiptHeadTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Field4",
                table: "tblReceiptHead");

            migrationBuilder.AddColumn<bool>(
                name: "InComplete",
                table: "tblReceiptHead",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "InComplete",
                table: "tblReceiptHead");

            migrationBuilder.AddColumn<string>(
                name: "Field4",
                table: "tblReceiptHead",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
