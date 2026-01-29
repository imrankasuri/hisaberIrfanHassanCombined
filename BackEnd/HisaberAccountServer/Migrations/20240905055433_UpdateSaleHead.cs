using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HisaberAccountServer.Migrations
{
    /// <inheritdoc />
    public partial class UpdateSaleHead : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Field4",
                table: "tblSaleHead");

            migrationBuilder.AddColumn<decimal>(
                name: "OverallDiscount",
                table: "tblSaleHead",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "OverallDiscount",
                table: "tblSaleHead");

            migrationBuilder.AddColumn<string>(
                name: "Field4",
                table: "tblSaleHead",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
