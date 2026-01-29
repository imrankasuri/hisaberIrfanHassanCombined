using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HisaberAccountServer.Migrations
{
    /// <inheritdoc />
    public partial class AddOTPSentTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_TblFYear",
                table: "TblFYear");

            migrationBuilder.DropPrimaryKey(
                name: "PK_DefaultAccount",
                table: "DefaultAccount");

            migrationBuilder.DropPrimaryKey(
                name: "PK_AccountMain",
                table: "AccountMain");

            migrationBuilder.RenameTable(
                name: "TblFYear",
                newName: "tblFYear");

            migrationBuilder.RenameTable(
                name: "DefaultAccount",
                newName: "tblDefaultAccount");

            migrationBuilder.AlterColumn<DateTime>(
                name: "StartDate",
                table: "tblFYear",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "DATEFROMPARTS(YEAR(GETDATE()), 1, 1)",
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AlterColumn<DateTime>(
                name: "EndDate",
                table: "tblFYear",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "DATEFROMPARTS(YEAR(GETDATE()), 12, 31)",
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AddPrimaryKey(
                name: "PK_tblFYear",
                table: "tblFYear",
                column: "ID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_tblDefaultAccount",
                table: "tblDefaultAccount",
                column: "ID");

            migrationBuilder.CreateTable(
                name: "tblOTPSent",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MemberID = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    EmailAddress = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    TransactionType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    OTP = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    ExpiryDate = table.Column<DateTime>(type: "DATETIME", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tblOTPSent", x => x.ID);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "tblOTPSent");

            migrationBuilder.DropPrimaryKey(
                name: "PK_tblFYear",
                table: "tblFYear");

            migrationBuilder.DropPrimaryKey(
                name: "PK_tblDefaultAccount",
                table: "tblDefaultAccount");


            migrationBuilder.RenameTable(
                name: "tblFYear",
                newName: "TblFYear");

            migrationBuilder.RenameTable(
                name: "tblDefaultAccount",
                newName: "DefaultAccount");


            migrationBuilder.RenameColumn(
                name: "AccountDescription",
                table: "AccountMain",
                newName: "AccountDiscription");

            migrationBuilder.AlterColumn<DateTime>(
                name: "StartDate",
                table: "TblFYear",
                type: "datetime2",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValueSql: "DATEFROMPARTS(YEAR(GETDATE()), 1, 1)");

            migrationBuilder.AlterColumn<DateTime>(
                name: "EndDate",
                table: "TblFYear",
                type: "datetime2",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValueSql: "DATEFROMPARTS(YEAR(GETDATE()), 12, 31)");

            migrationBuilder.AddPrimaryKey(
                name: "PK_TblFYear",
                table: "TblFYear",
                column: "ID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_DefaultAccount",
                table: "DefaultAccount",
                column: "ID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_AccountMain",
                table: "AccountMain",
                column: "Id");
        }
    }
}
