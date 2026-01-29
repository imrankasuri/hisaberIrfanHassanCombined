using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HisaberAccountServer.Migrations
{
    /// <inheritdoc />
    public partial class UpdateStockAdjustTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Extra3",
                table: "tblStockAdjustBody");

            migrationBuilder.AddColumn<int>(
                name: "ProductCode",
                table: "tblStockAdjustBody",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ProductCode",
                table: "tblStockAdjustBody");

            migrationBuilder.AddColumn<string>(
                name: "Extra3",
                table: "tblStockAdjustBody",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
