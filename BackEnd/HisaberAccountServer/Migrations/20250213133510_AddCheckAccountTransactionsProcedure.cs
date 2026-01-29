using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HisaberAccountServer.Migrations
{
    /// <inheritdoc />
    public partial class AddCheckAccountTransactionsProcedure : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"create procedure spCheckAccountTransactions
                                @CompanyID int,
                                @Code NVARCHAR(100) = NULL
                                as
                                begin

                                SELECT COUNT(*) AS TotalTransactionCount
                                FROM (
                                    SELECT r.ID 
                                    FROM tblReceiptHead r
                                    WHERE r.CompanyID = @CompanyID
                                      AND r.CustomerAccountCode = @Code
    
                                    UNION ALL
    
                                    SELECT s.ID 
                                    FROM tblSaleHead s
                                    WHERE s.CompanyID = @CompanyID
                                      AND s.CustomerAccountCode = @Code

	                                  union all
	                                  SELECT p.ID 
                                    FROM tblPurchaseHead p
                                    WHERE p.CompanyID = @CompanyID
                                      AND p.SupplierAccountCode = @Code

	                                  union all
	                                  SELECT p.ID 
                                    FROM tblPaymentHead p
                                    WHERE p.CompanyID = @CompanyID
                                      AND p.SupplierAccountCode = @Code

	                                  union all
	                                  SELECT o.ID
                                FROM tblOpeningBal o
                                WHERE o.CompanyID = @CompanyID
                                    AND ( o.AccountCode = @Code)


                                    UNION ALL

                                    SELECT 
                                        r.ID
                                    FROM tblBankReceipts r
                                    WHERE r.CompanyID = @CompanyID
                                      AND ( r.BankCode = @Code)

                                    UNION ALL

                                    SELECT 
                                        p.ID
                                    FROM tblBankPayments p
                                    WHERE p.CompanyID = @CompanyID
                                      AND ( p.BankCode = @Code)

                                    UNION ALL

                                    SELECT 
                                        t.ID
                                    FROM tblBankTransfers t
                                    WHERE t.CompanyID = @CompanyID
                                      AND ( t.FromBankCode = @Code)

                                    UNION ALL

                                    SELECT 
                                        b.ID
                                    FROM tblBankTransfers b
                                    WHERE  b.CompanyID = @CompanyID
                                      AND ( b.ToBankCode = @Code)

                                    UNION ALL

                                    SELECT 
                                        j.ID
                                    FROM tblJournalVoucher j
                                    WHERE j.CompanyID = @CompanyID
                                      AND ( j.FromAccountCode = @Code)

                                    UNION ALL

                                    SELECT 
                                        j.ID
                                    FROM tblJournalVoucher j
                                    WHERE  j.CompanyID = @CompanyID
                                      AND ( j.ToAccountCode = @Code)
                                ) AS Transactions

                                end");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP procedure if exists spCheckAccountTransactions");
        }
    }
}
