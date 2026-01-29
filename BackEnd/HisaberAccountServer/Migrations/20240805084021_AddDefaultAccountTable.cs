using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HisaberAccountServer.Migrations
{
    /// <inheritdoc />
    public partial class AddDefaultAccountTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DefaultAccount",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AccountCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    AccountDescription = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    ILevel = table.Column<int>(type: "int", maxLength: 100, nullable: false),
                    Remarks = table.Column<string>(type: "nvarchar(2500)", maxLength: 2500, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DefaultAccount", x => x.ID);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DefaultAccount");
        }
    }
}
