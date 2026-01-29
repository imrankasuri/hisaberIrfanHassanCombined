using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HisaberAccountServer.Migrations
{
    /// <inheritdoc />
    public partial class UpdateTblDetails : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateOnly>(
                name: "FinishedDate",
                table: "tblDetails",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "tblDetails",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FinishedDate",
                table: "tblDetails");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "tblDetails");
        }
    }
}
