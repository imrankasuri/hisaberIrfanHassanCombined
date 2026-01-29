using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HisaberAccountServer.Migrations
{
    /// <inheritdoc />
    public partial class CreateUserCompanyRoleTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "tblUserCompanyRoles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    CompanyId = table.Column<int>(type: "int"),
                    RoleId = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tblUserCompanyRoles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_tblUserCompanyRoles_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_tblUserCompanyRoles_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_tblUserCompanyRoles_tblCompanyInfo_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "tblCompanyInfo",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_tblUserCompanyRoles_CompanyId",
                table: "tblUserCompanyRoles",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_tblUserCompanyRoles_RoleId",
                table: "tblUserCompanyRoles",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_tblUserCompanyRoles_UserId_CompanyId_RoleId",
                table: "tblUserCompanyRoles",
                columns: new[] { "UserId", "CompanyId", "RoleId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "tblUserCompanyRoles");
        }
    }
}
