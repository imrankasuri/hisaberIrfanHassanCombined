using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HisaberAccountServer.Migrations
{
    /// <inheritdoc />
    public partial class UpSaleBodyTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Field2",
                table: "tblSaleBody");

            migrationBuilder.AddColumn<decimal>(
                name: "OverallDiscount",
                table: "tblSaleBody",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "OverallDiscount",
                table: "tblSaleBody");

            migrationBuilder.AddColumn<string>(
                name: "Field2",
                table: "tblSaleBody",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
