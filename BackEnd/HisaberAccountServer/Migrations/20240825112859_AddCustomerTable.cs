using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HisaberAccountServer.Migrations
{
    /// <inheritdoc />
    public partial class AddCustomerTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {


            migrationBuilder.AlterColumn<string>(
                name: "ProductType",
                table: "tblProducts",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255);

            migrationBuilder.CreateTable(
                name: "tblCustomers",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompanyID = table.Column<int>(type: "int", nullable: false),
                    AccountCode = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    BusinessName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Title = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    FirstName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    LastName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    AccountNo = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Mobile = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    Website = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    BillingAddress = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    City = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Province = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    PostalCode = table.Column<string>(type: "nvarchar(15)", maxLength: 15, nullable: false),
                    Country = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    NTNNumber = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    CNIC = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    SalesTaxNumber = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    PayementTermDays = table.Column<int>(type: "int", maxLength: 20, nullable: false),
                    CreditLimit = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    OpeningDate = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    OpeningBalance = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    IsSupplier = table.Column<bool>(type: "bit", nullable: false),
                    Groups = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Discount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    IsFiler = table.Column<bool>(type: "bit", nullable: false),
                    Field1 = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Field2 = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Field3 = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Field4 = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    SMSMobile = table.Column<string>(type: "nvarchar(25)", maxLength: 25, nullable: false),
                    WhatsAppMobile = table.Column<string>(type: "nvarchar(25)", maxLength: 25, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tblCustomers", x => x.ID);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "tblCustomers");

            migrationBuilder.AlterColumn<string>(
                name: "ProductType",
                table: "tblProducts",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");
        }
    }
}
