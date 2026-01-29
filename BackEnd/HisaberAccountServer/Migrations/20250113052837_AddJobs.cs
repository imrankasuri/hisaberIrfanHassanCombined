using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HisaberAccountServer.Migrations
{
    /// <inheritdoc />
    public partial class AddJobs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AssemblyType",
                table: "tblRawMaterials",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "LocationCode",
                table: "tblRawMaterials",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "LocationID",
                table: "tblRawMaterials",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AssemblyType",
                table: "tblNonStock",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "AssemblyType",
                table: "tblFinishedGoods",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "AssemblyType",
                table: "tblExpenses",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "AssemblyType",
                table: "tblDetails",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Location",
                table: "tblDetails",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LocationCode",
                table: "tblDetails",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "LocationID",
                table: "tblDetails",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RefNo",
                table: "tblDetails",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<DateOnly>(
                name: "StartDate",
                table: "tblDetails",
                type: "date",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AssemblyType",
                table: "tblRawMaterials");

            migrationBuilder.DropColumn(
                name: "LocationCode",
                table: "tblRawMaterials");

            migrationBuilder.DropColumn(
                name: "LocationID",
                table: "tblRawMaterials");

            migrationBuilder.DropColumn(
                name: "AssemblyType",
                table: "tblNonStock");

            migrationBuilder.DropColumn(
                name: "AssemblyType",
                table: "tblFinishedGoods");

            migrationBuilder.DropColumn(
                name: "AssemblyType",
                table: "tblExpenses");

            migrationBuilder.DropColumn(
                name: "AssemblyType",
                table: "tblDetails");

            migrationBuilder.DropColumn(
                name: "Location",
                table: "tblDetails");

            migrationBuilder.DropColumn(
                name: "LocationCode",
                table: "tblDetails");

            migrationBuilder.DropColumn(
                name: "LocationID",
                table: "tblDetails");

            migrationBuilder.DropColumn(
                name: "RefNo",
                table: "tblDetails");

            migrationBuilder.DropColumn(
                name: "StartDate",
                table: "tblDetails");
        }
    }
}
