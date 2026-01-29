using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HisaberAccountServer.Migrations
{
    /// <inheritdoc />
    public partial class AddCustomerSupplierTable : Migration
    {
        /// <inheritdoc /> 
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "tblCustomers");


            migrationBuilder.CreateTable(
                name: "tblCustomerSupplier",
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
                    ShippingAddress = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    ShippingCountry = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ShippingCity = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ShippingProvince = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ShippingPostalCode = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    NTNNumber = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    CNIC = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    SalesTaxNumber = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    PayementTermDays = table.Column<int>(type: "int", maxLength: 20, nullable: false),
                    CreditLimit = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    BankName = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    AccountName = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    AccountNumber = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    IBANNumber = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    SwiftCode = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    Address = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    OpeningDate = table.Column<DateOnly>(type: "DATE", nullable: false),
                    OpeningBalance = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    IsCustomer = table.Column<bool>(type: "bit", nullable: false),
                    IsSupplier = table.Column<bool>(type: "bit", nullable: false),
                    Discount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    IsFiler = table.Column<bool>(type: "bit", nullable: false),
                    Groups = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Field1 = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Field2 = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Field3 = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Field4 = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    FieldA = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    FieldB = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    FieldC = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    FieldD = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Extra1 = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Extra2 = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    SMSMobile = table.Column<string>(type: "nvarchar(25)", maxLength: 25, nullable: false),
                    WhatsAppMobile = table.Column<string>(type: "nvarchar(25)", maxLength: 25, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tblCustomerSupplier", x => x.ID);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "tblCustomerSupplier");

            migrationBuilder.CreateTable(
                name: "tblCustomers",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AccountCode = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    AccountNo = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    BillingAddress = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    BusinessName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    CNIC = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    City = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    CompanyID = table.Column<int>(type: "int", nullable: false),
                    Country = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    CreditLimit = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Discount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Field1 = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Field2 = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Field3 = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Field4 = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    FieldA = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    FieldB = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    FieldC = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    FieldD = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    FirstName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Groups = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    IsFiler = table.Column<bool>(type: "bit", nullable: false),
                    IsSupplier = table.Column<bool>(type: "bit", nullable: false),
                    LastName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Mobile = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    NTNNumber = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    OpeningBalance = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    OpeningDate = table.Column<DateOnly>(type: "DATE", nullable: false),
                    PayementTermDays = table.Column<int>(type: "int", maxLength: 20, nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    PostalCode = table.Column<string>(type: "nvarchar(15)", maxLength: 15, nullable: false),
                    Province = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    SMSMobile = table.Column<string>(type: "nvarchar(25)", maxLength: 25, nullable: false),
                    SalesTaxNumber = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Title = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    Website = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    WhatsAppMobile = table.Column<string>(type: "nvarchar(25)", maxLength: 25, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tblCustomers", x => x.ID);
                });
        }
    }
}
