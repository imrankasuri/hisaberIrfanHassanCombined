using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HisaberAccountServer.Migrations
{
    /// <inheritdoc />
    public partial class UpdateStockAdjustHeadTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Type",
                table: "tblStockAdjustHead",
                newName: "AdjustType");

            migrationBuilder.AddColumn<string>(
                name: "AdjustBy",
                table: "tblStockAdjustHead",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "AdjustBy",
                table: "tblStockAdjustBody",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "AdjustType",
                table: "tblStockAdjustBody",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AdjustBy",
                table: "tblStockAdjustHead");

            migrationBuilder.DropColumn(
                name: "AdjustBy",
                table: "tblStockAdjustBody");

            migrationBuilder.DropColumn(
                name: "AdjustType",
                table: "tblStockAdjustBody");

            migrationBuilder.RenameColumn(
                name: "AdjustType",
                table: "tblStockAdjustHead",
                newName: "Type");
        }
    }
}
