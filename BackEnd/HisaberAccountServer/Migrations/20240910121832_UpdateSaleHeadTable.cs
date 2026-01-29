using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HisaberAccountServer.Migrations
{
    /// <inheritdoc />
    public partial class UpdateSaleHeadTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Field3",
                table: "tblSaleHead");

            migrationBuilder.AddColumn<bool>(
                name: "InComplete",
                table: "tblSaleHead",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "InComplete",
                table: "tblSaleHead");

            migrationBuilder.AddColumn<string>(
                name: "Field3",
                table: "tblSaleHead",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
