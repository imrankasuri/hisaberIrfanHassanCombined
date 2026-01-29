using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HisaberAccountServer.Migrations
{
    /// <inheritdoc />
    public partial class AddReceiptHeadTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "tblReceiptHead",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CustomerName = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    CustomerAccountCode = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
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
                    TotalReceipt = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Total = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Field1 = table.Column<string>(type: "text", nullable: false),
                    Field2 = table.Column<string>(type: "text", nullable: false),
                    Field3 = table.Column<string>(type: "text", nullable: false),
                    Field4 = table.Column<string>(type: "text", nullable: false),
                    ReceiptType = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    ReceiptBy = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Extra2 = table.Column<string>(type: "text", nullable: false),
                    CompanyID = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tblReceiptHead", x => x.ID);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "tblReceiptHead");
        }
    }
}
