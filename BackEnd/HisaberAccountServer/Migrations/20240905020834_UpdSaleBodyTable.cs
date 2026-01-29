using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HisaberAccountServer.Migrations
{
    /// <inheritdoc />
    public partial class UpdSaleBodyTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Field3",
                table: "tblSaleBody");

            migrationBuilder.DropColumn(
                name: "Field4",
                table: "tblSaleBody");

            migrationBuilder.AddColumn<decimal>(
                name: "Length",
                table: "tblSaleBody",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Weight",
                table: "tblSaleBody",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Length",
                table: "tblSaleBody");

            migrationBuilder.DropColumn(
                name: "Weight",
                table: "tblSaleBody");

            migrationBuilder.AddColumn<string>(
                name: "Field3",
                table: "tblSaleBody",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Field4",
                table: "tblSaleBody",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
