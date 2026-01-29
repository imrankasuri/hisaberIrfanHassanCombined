using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HisaberAccountServer.Migrations
{
    /// <inheritdoc />
    public partial class AddPaymentTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "tblPaymentBody",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Date = table.Column<DateOnly>(type: "DATE", nullable: false),
                    BillNo = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    BillID = table.Column<int>(type: "int", nullable: false),
                    DueDate = table.Column<DateOnly>(type: "DATE", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    OpenBalance = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    WHTRate = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    WHT = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Discount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Payment = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Total = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PurchaseType = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    PurchaseBy = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    CompanyID = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    VoucherNo = table.Column<int>(type: "int", nullable: false),
                    InComplete = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tblPaymentBody", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "tblPaymentHead",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SupplierName = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    SupplierAccountCode = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    MailingAddress = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    Date = table.Column<DateOnly>(type: "DATE", nullable: false),
                    RefNo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Bank = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Mode = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    WHTRate = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    AdditionalWHT = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    UnAllocatedBalance = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: false),
                    TotalOpenBalance = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalDiscount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalWHT = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalPayment = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Total = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Field1 = table.Column<string>(type: "text", nullable: false),
                    Field2 = table.Column<string>(type: "text", nullable: false),
                    Field3 = table.Column<string>(type: "text", nullable: false),
                    Field4 = table.Column<string>(type: "text", nullable: false),
                    PurchaseType = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    PurchaseBy = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    VoucherNo = table.Column<long>(type: "bigint", nullable: false),
                    CompanyID = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tblPaymentHead", x => x.ID);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "tblPaymentBody");

            migrationBuilder.DropTable(
                name: "tblPaymentHead");
        }
    }
}
