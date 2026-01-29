using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HisaberAccountServer.Migrations
{
    /// <inheritdoc />
    public partial class UpdateSaleTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Field2",
                table: "tblSaleBody");

            migrationBuilder.AddColumn<string>(
                name: "DefaultUnit",
                table: "tblSaleBody",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DefaultUnit",
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
