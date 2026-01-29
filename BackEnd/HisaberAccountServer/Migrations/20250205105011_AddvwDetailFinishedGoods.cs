using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HisaberAccountServer.Migrations
{
    /// <inheritdoc />
    public partial class AddvwDetailFinishedGoods : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"CREATE VIEW vwDetailFinishedGoods  
                AS  
                SELECT        tblDetails.ID, tblDetails.TemplateName, tblDetails.RMFactor, tblDetails.CostCalType, tblDetails.Notes, tblFinishedGoods.ProductName,   
                         tblFinishedGoods.Description, tblDetails.CompanyID, tblDetails.UserID, tblFinishedGoods.QTYFI, tblFinishedGoods.CostFI,   
                         tblFinishedGoods.Unit, tblFinishedGoods.Quantity, tblFinishedGoods.IsActive AS FinishedActive, tblDetails.IsActive AS DetailActive,   
                         tblDetails.CreatedDate, tblFinishedGoods.ProductCode, tblDetails.AssemblyType, tblDetails.Location, tblDetails.RefNo,   
                         tblDetails.StartDate, tblDetails.FinishedDate, tblDetails.Status  
                FROM            tblFinishedGoods INNER JOIN  
                         tblDetails ON tblFinishedGoods.ID = tblDetails.ID  ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP VIEW vwDetailFinishedGoods");
        }
    }
}
