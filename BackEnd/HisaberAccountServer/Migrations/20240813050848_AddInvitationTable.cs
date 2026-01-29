using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HisaberAccountServer.Migrations
{
    /// <inheritdoc />
    public partial class AddInvitationTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "tblInvitation",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FromUserID = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    FromUserCompanyID = table.Column<int>(type: "int", nullable: false),
                    ToEmail = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    InviteCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    InviteStatus = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    InvitedRole = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tblInvitation", x => x.ID);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "tblInvitation");
        }
    }
}
