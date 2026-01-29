using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HisaberAccountServer.Migrations
{
    /// <inheritdoc />
    public partial class AddBankTransferTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "tblBankTransfers",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RefNo = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Mode = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    FromBank = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    FromBankCode = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    ToBank = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    ToBankCode = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Date = table.Column<DateOnly>(type: "DATE", nullable: false),
                    Detail = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Field1 = table.Column<string>(type: "text", nullable: false),
                    Field2 = table.Column<string>(type: "text", nullable: false),
                    Field3 = table.Column<string>(type: "text", nullable: false),
                    BankTransferBy = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    VoucherNo = table.Column<long>(type: "bigint", nullable: false),
                    CompanyID = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tblBankTransfers", x => x.ID);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "tblBankTransfers");
        }
    }
}
