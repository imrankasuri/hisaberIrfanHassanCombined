using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HisaberAccountServer.Migrations
{
    /// <inheritdoc />
    public partial class UpdateGetAccountBalancesStoreProc : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"Alter PROCEDURE GetAccountBalances
    @startDate DATE,
    @CompanyID INT
AS
BEGIN
    SET NOCOUNT ON;

    WITH OpeningBalance AS (
        SELECT 
            o.AccountCode,
            SUM(o.CRAmt) AS Receipts,  -- Corrected: CR as Payments (outflow)
            SUM(o.DRAmt) AS Payments    -- Corrected: DR as Receipts (inflow)
        FROM tblOpeningBal o
        WHERE o.OpeningDate < @startDate 
            AND o.CompanyID = @CompanyID
            AND o.IsActive = 1
        GROUP BY o.AccountCode
    ),
    Purchases AS (
        SELECT 
            p.BankCode AS AccountCode,
            SUM(CASE 
                WHEN p.PurchaseType IN ('Payment', 'Return Payment') THEN p.Total  -- Outflow
                ELSE 0 
            END) AS Payments,
            SUM(CASE 
                WHEN p.PurchaseType IN ('Receipt', 'Return Receipt') THEN p.Total  -- Inflow
                ELSE 0 
            END) AS Receipts
        FROM tblPaymentHead p
        WHERE p.Date < @startDate 
            AND p.CompanyID = @CompanyID
            AND p.InComplete = 0
            AND p.IsActive = 1
        GROUP BY p.BankCode
    ),
    Sales AS (
        SELECT 
            r.BankCode AS AccountCode,
            SUM(CASE 
                WHEN r.ReceiptType IN ('Payment', 'Return Payment') THEN r.Total  -- Outflow
                ELSE 0 
            END) AS Payments,
            SUM(CASE 
                WHEN r.ReceiptType IN ('Receipt', 'Return Receipt') THEN r.Total  -- Inflow
                ELSE 0 
            END) AS Receipts
        FROM tblReceiptHead r
        WHERE r.Date < @startDate 
            AND r.CompanyID = @CompanyID
            AND r.InComplete = 0
            AND r.IsActive = 1
        GROUP BY r.BankCode
    ),
    BankReceipts AS (
        SELECT 
            r.BankCode AS AccountCode,
            0 AS Payments,
            SUM(r.Amount) AS Receipts
        FROM tblBankReceipts r
        WHERE r.Date < @startDate 
            AND r.CompanyID = @CompanyID
            AND r.IsActive = 1
        GROUP BY r.BankCode
    ),
    BankPayments AS (
        SELECT 
            p.BankCode AS AccountCode,
            SUM(p.Amount) AS Payments,
            0 AS Receipts
        FROM tblBankPayments p
        WHERE p.Date < @startDate 
            AND p.CompanyID = @CompanyID
            AND p.IsActive = 1
        GROUP BY p.BankCode
    ),
    BankTransfers AS (
        SELECT 
            AccountCode,
            SUM(Payments) AS Payments,
            SUM(Receipts) AS Receipts
        FROM (
            SELECT 
                FromBankCode AS AccountCode,
                Amount AS Payments,
                0 AS Receipts
            FROM tblBankTransfers
            WHERE Date < @startDate 
                AND CompanyID = @CompanyID
                AND IsActive = 1
            UNION ALL
            SELECT 
                ToBankCode AS AccountCode,
                0 AS Payments,
                Amount AS Receipts
            FROM tblBankTransfers
            WHERE Date < @startDate 
                AND CompanyID = @CompanyID
                AND IsActive = 1
        ) AS Transfers
        GROUP BY AccountCode
    ),
    JournalVoucher AS (
        SELECT 
            AccountCode,
            SUM(Payments) AS Payments,
            SUM(Receipts) AS Receipts
        FROM (
            SELECT 
                FromAccountCode AS AccountCode,
                Amount AS Payments,
                0 AS Receipts
            FROM tblJournalVoucher
            WHERE Date < @startDate 
                AND CompanyID = @CompanyID
                AND IsActive = 1
            UNION ALL
            SELECT 
                ToAccountCode AS AccountCode,
                0 AS Payments,
                Amount AS Receipts
            FROM tblJournalVoucher
            WHERE Date < @startDate 
                AND CompanyID = @CompanyID
                AND IsActive = 1
        ) AS Voucher
        GROUP BY AccountCode
    )
    SELECT 
        AccountCode,
        SUM(Payments) AS TotalPayments,
        SUM(Receipts) AS TotalReceipts,
        SUM(Receipts - Payments) AS Balance
    FROM (
        SELECT AccountCode, Payments, Receipts FROM OpeningBalance
        UNION ALL
        SELECT AccountCode, Payments, Receipts FROM Purchases
        UNION ALL
        SELECT AccountCode, Payments, Receipts FROM Sales
        UNION ALL
        SELECT AccountCode, Payments, Receipts FROM BankReceipts
        UNION ALL
        SELECT AccountCode, Payments, Receipts FROM BankPayments
        UNION ALL
        SELECT AccountCode, Payments, Receipts FROM BankTransfers
        UNION ALL
        SELECT AccountCode, Payments, Receipts FROM JournalVoucher 
    ) AS AllTransactions
    WHERE AccountCode LIKE '50108%'
    GROUP BY AccountCode;
END");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@" CREATE PROCEDURE GetAccountBalances
                    @startDate DATE,
                    @CompanyID INT
                AS
                BEGIN
                    SET NOCOUNT ON;

                    WITH OpeningBalance AS (
                    SELECT 
                        o.AccountCode,
                        SUM(o.CRAmt) AS Receipts,  -- Corrected: CR as Payments (outflow)
                        SUM(o.DRAmt) AS Payments    -- Corrected: DR as Receipts (inflow)
                    FROM tblOpeningBal o
                    WHERE o.OpeningDate < @startDate
                        AND o.CompanyID = @CompanyID
                        AND o.IsActive = 1
                    GROUP BY o.AccountCode
                ),
                Purchases AS (
                    SELECT 
                        p.BankCode AS AccountCode,
                        SUM(CASE 
                            WHEN p.PurchaseType IN ('Payment', 'Return Payment') THEN p.Total  -- Outflow
                            ELSE 0 
                        END) AS Payments,
                        SUM(CASE 
                            WHEN p.PurchaseType IN ('Receipt', 'Return Receipt') THEN p.Total  -- Inflow
                            ELSE 0 
                        END) AS Receipts
                    FROM tblPaymentHead p
                    WHERE p.Date < @startDate
                        AND p.CompanyID = @CompanyID
                        AND p.InComplete = 0
                        AND p.IsActive = 1
                    GROUP BY p.BankCode
                ),
                Sales AS (
                    SELECT 
                        r.BankCode AS AccountCode,
                        SUM(CASE 
                            WHEN r.ReceiptType IN ('Payment', 'Return Payment') THEN r.Total  -- Outflow
                            ELSE 0 
                        END) AS Payments,
                        SUM(CASE 
                            WHEN r.ReceiptType IN ('Receipt', 'Return Receipt') THEN r.Total  -- Inflow
                            ELSE 0 
                        END) AS Receipts
                    FROM tblReceiptHead r
                    WHERE r.Date < @startDate
                        AND r.CompanyID = @CompanyID
                        AND r.InComplete = 0
                        AND r.IsActive = 1
                    GROUP BY r.BankCode
                ),
                BankReceipts AS (
                    SELECT 
                        r.BankCode AS AccountCode,
                        0 AS Payments,
                        SUM(r.Amount) AS Receipts
                    FROM tblBankReceipts r
                    WHERE r.Date < @startDate
                        AND r.CompanyID = @CompanyID
                        AND r.IsActive = 1
                    GROUP BY r.BankCode
                ),
                BankPayments AS (
                    SELECT 
                        p.BankCode AS AccountCode,
                        SUM(p.Amount) AS Payments,
                        0 AS Receipts
                    FROM tblBankPayments p
                    WHERE p.Date < @startDate
                        AND p.CompanyID = @CompanyID
                        AND p.IsActive = 1
                    GROUP BY p.BankCode
                ),
                BankTransfers AS (
                    SELECT 
                        AccountCode,
                        SUM(Payments) AS Payments,
                        SUM(Receipts) AS Receipts
                    FROM (
                        SELECT 
                            FromBankCode AS AccountCode,
                            Amount AS Payments,
                            0 AS Receipts
                        FROM tblBankTransfers
                        WHERE Date < @startDate
                            AND CompanyID = @CompanyID
                            AND IsActive = 1
                        UNION ALL
                        SELECT 
                            ToBankCode AS AccountCode,
                            0 AS Payments,
                            Amount AS Receipts
                        FROM tblBankTransfers
                        WHERE Date < @startDate
                            AND CompanyID = @CompanyID
                            AND IsActive = 1
                    ) AS Transfers
                    GROUP BY AccountCode
                )

                SELECT 
                    AccountCode,
                    SUM(Payments) AS TotalPayments,
                    SUM(Receipts) AS TotalReceipts,
                    SUM(Receipts - Payments) AS Balance
                FROM (
                    SELECT AccountCode, Payments, Receipts FROM OpeningBalance
                    UNION ALL
                    SELECT AccountCode, Payments, Receipts FROM Purchases
                    UNION ALL
                    SELECT AccountCode, Payments, Receipts FROM Sales
                    UNION ALL
                    SELECT AccountCode, Payments, Receipts FROM BankReceipts
                    UNION ALL
                    SELECT AccountCode, Payments, Receipts FROM BankPayments
                    UNION ALL
                    SELECT AccountCode, Payments, Receipts FROM BankTransfers
                ) AS AllTransactions
                WHERE AccountCode LIKE '50108%'
                GROUP BY AccountCode;
                END");
        }
    }
}
