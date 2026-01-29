using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HisaberAccountServer.Migrations
{
    /// <inheritdoc />
    public partial class UpdatePurchaseHead : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<long>(
                name: "BillID",
                table: "tblPurchaseHead",
                type: "bigint",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<int>(
                name: "BillNumber",
                table: "tblPurchaseHead",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BillNumber",
                table: "tblPurchaseHead");

            migrationBuilder.AlterColumn<string>(
                name: "BillID",
                table: "tblPurchaseHead",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(long),
                oldType: "bigint");
        }
    }
}
