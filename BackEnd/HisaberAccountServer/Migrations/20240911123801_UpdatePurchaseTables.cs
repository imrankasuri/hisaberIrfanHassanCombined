using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HisaberAccountServer.Migrations
{
    /// <inheritdoc />
    public partial class UpdatePurchaseTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Extra1",
                table: "tblPurchaseHead");

            migrationBuilder.DropColumn(
                name: "Field2",
                table: "tblPurchaseBody");

            migrationBuilder.AddColumn<bool>(
                name: "InComplete",
                table: "tblPurchaseHead",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "DefaultUnit",
                table: "tblPurchaseBody",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "InComplete",
                table: "tblPurchaseHead");

            migrationBuilder.DropColumn(
                name: "DefaultUnit",
                table: "tblPurchaseBody");

            migrationBuilder.AddColumn<string>(
                name: "Extra1",
                table: "tblPurchaseHead",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Field2",
                table: "tblPurchaseBody",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
