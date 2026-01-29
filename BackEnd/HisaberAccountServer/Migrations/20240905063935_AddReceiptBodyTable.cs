using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HisaberAccountServer.Migrations
{
    /// <inheritdoc />
    public partial class AddReceiptBodyTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {

            migrationBuilder.CreateTable(
            name: "tblReceiptBody",
            columns: table => new
            {
                ID = table.Column<int>(nullable: false)
                    .Annotation("SqlServer:Identity", "1, 1"),
                Date = table.Column<DateOnly>(nullable: true),
                DocNo = table.Column<string>(nullable: true),
                InvoiceNo = table.Column<int>(nullable: false),
                DueDate = table.Column<DateOnly>(nullable: true),
                Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                OpenBalance = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                WHTRate = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                WHT = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                Discount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                Receipt = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                Total = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                ReceiptType = table.Column<string>(nullable: true),
                ReceiptBy = table.Column<string>(nullable: true),
                UserID = table.Column<string>(nullable: true),
                CompanyID = table.Column<int>(nullable: false),
                IsActive = table.Column<bool>(nullable: false),
                IsDeleted = table.Column<bool>(nullable: false),
                CreatedDate = table.Column<DateTime>(nullable: false, defaultValueSql: "GETDATE()"),
                UpdatedDate = table.Column<DateTime>(nullable: false, defaultValueSql: "GETDATE()"),
                VoucherNo = table.Column<int>(nullable: false),
                VoucherID = table.Column<int>(nullable: false),
                InComplete = table.Column<bool>(nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_tblReceiptBody", x => x.ID);
            });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

            migrationBuilder.DropTable(
            name: "tblReceiptBody");

        }
    }
}
