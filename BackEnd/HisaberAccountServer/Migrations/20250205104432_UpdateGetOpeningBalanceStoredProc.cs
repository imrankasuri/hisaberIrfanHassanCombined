using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HisaberAccountServer.Migrations
{
    /// <inheritdoc />
    public partial class UpdateGetOpeningBalanceStoredProc : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"            Alter PROCEDURE GetOpeningBalance
    @startDate DATE,
    @CompanyID INT,
    @bankCode NVARCHAR(50) = NULL,
    @includeAllBanks BIT
AS
BEGIN
    SET NOCOUNT ON;

    -- Use Common Table Expressions (CTEs) to optimize performance
    WITH OpeningBalance AS (
        SELECT 
            'Opening Balance' AS Type,
            SUM(o.DRAmt) AS Payments,
            SUM(o.CRAmt) AS Receipts
        FROM tblOpeningBal o
        WHERE o.OpeningDate < @startDate
            AND o.CompanyID = @CompanyID
            AND o.IsActive = 1
            AND (@includeAllBanks = 1 OR o.AccountCode = @bankCode)
    ),
    Purchases AS (
        SELECT 
            'Purchase ' + p.PurchaseType AS Type,
            SUM(CASE 
                WHEN p.PurchaseType IN ('Payment', 'Return Receipt') THEN p.Total 
                ELSE 0 
            END) AS Payments,
            SUM(CASE 
                WHEN p.PurchaseType IN ('Receipt', 'Return Payment') THEN p.Total 
                ELSE 0 
            END) AS Receipts
        FROM tblPaymentHead p
        WHERE p.Date < @startDate
            AND p.CompanyID = @CompanyID
            AND p.InComplete = 0
            AND p.IsActive = 1
            AND (@includeAllBanks = 1 OR p.BankCode = @bankCode)
        GROUP BY p.PurchaseType
    ),
    Sales AS (
        SELECT 
            'Sale ' + r.ReceiptType AS Type,
            SUM(CASE 
                WHEN r.ReceiptType IN ('Payment', 'Return Receipt') THEN r.Total 
                ELSE 0 
            END) AS Payments,
            SUM(CASE 
                WHEN r.ReceiptType IN ('Receipt', 'Return Payment') THEN r.Total 
                ELSE 0 
            END) AS Receipts
        FROM tblReceiptHead r
        WHERE r.Date < @startDate
            AND r.CompanyID = @CompanyID
            AND r.InComplete = 0
            AND r.IsActive = 1
            AND (@includeAllBanks = 1 OR r.BankCode = @bankCode)
        GROUP BY r.ReceiptType
    ),
    BankReceipts AS (
        SELECT 
            r.BankReceiptType AS Type,
            0 AS Payments,
            SUM(r.Amount) AS Receipts
        FROM tblBankReceipts r
        WHERE r.Date < @startDate
            AND r.CompanyID = @CompanyID
            AND r.IsActive = 1
            AND (@includeAllBanks = 1 OR r.BankCode = @bankCode)
        GROUP BY r.BankReceiptType
    ),
    BankPayments AS (
        SELECT 
            p.BankPaymentType AS Type,
            SUM(p.Amount) AS Payments,
            0 AS Receipts
        FROM tblBankPayments p
        WHERE p.Date < @startDate
            AND p.CompanyID = @CompanyID
            AND p.IsActive = 1
            AND (@includeAllBanks = 1 OR p.BankCode = @bankCode)
        GROUP BY p.BankPaymentType
    ),
    BankTransfers AS (
        SELECT 
            'Bank Transfer' AS Type,
            SUM(CASE WHEN @includeAllBanks = 1 OR t.FromBankCode = @bankCode THEN t.Amount ELSE 0 END) AS Payments,
            SUM(CASE WHEN @includeAllBanks = 1 OR t.ToBankCode = @bankCode THEN t.Amount ELSE 0 END) AS Receipts
        FROM tblBankTransfers t
        WHERE t.Date < @startDate
            AND t.CompanyID = @CompanyID
            AND t.IsActive = 1
    ),
	JournalVoucher AS (
        SELECT 
            'Journal Voucher' AS Type,
            SUM(CASE WHEN @includeAllBanks = 1 OR j.FromAccountCode = @bankCode THEN j.Amount ELSE 0 END) AS Payments,
            SUM(CASE WHEN @includeAllBanks = 1 OR j.ToAccountCode = @bankCode THEN j.Amount ELSE 0 END) AS Receipts
        FROM tblJournalVoucher j
        WHERE j.Date < @startDate
            AND j.CompanyID = @CompanyID
            AND j.IsActive = 1
    )
    
    -- Combine all results using UNION ALL
    SELECT * FROM OpeningBalance
    UNION ALL
    SELECT * FROM Purchases
    UNION ALL
    SELECT * FROM Sales
    UNION ALL
    SELECT * FROM BankReceipts
    UNION ALL
    SELECT * FROM BankPayments
    UNION ALL
    SELECT * FROM BankTransfers
	UNION ALL
    SELECT * FROM JournalVoucher;
END");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"CREATE PROCEDURE GetOpeningBalance
    @startDate DATE,
    @CompanyID INT,
    @bankCode NVARCHAR(50) = NULL,
    @includeAllBanks BIT
AS
BEGIN
    SET NOCOUNT ON;

    -- Use Common Table Expressions (CTEs) to optimize performance
    WITH OpeningBalance AS (
        SELECT 
            'Opening Balance' AS Type,
            SUM(o.DRAmt) AS Payments,
            SUM(o.CRAmt) AS Receipts
        FROM tblOpeningBal o
        WHERE o.OpeningDate < @startDate
            AND o.CompanyID = @CompanyID
            AND o.IsActive = 1
            AND (@includeAllBanks = 1 OR o.AccountCode = @bankCode)
    ),
    Purchases AS (
        SELECT 
            'Purchase ' + p.PurchaseType AS Type,
            SUM(CASE 
                WHEN p.PurchaseType IN ('Payment', 'Return Receipt') THEN p.Total 
                ELSE 0 
            END) AS Payments,
            SUM(CASE 
                WHEN p.PurchaseType IN ('Receipt', 'Return Payment') THEN p.Total 
                ELSE 0 
            END) AS Receipts
        FROM tblPaymentHead p
        WHERE p.Date < @startDate
            AND p.CompanyID = @CompanyID
            AND p.InComplete = 0
            AND p.IsActive = 1
            AND (@includeAllBanks = 1 OR p.BankCode = @bankCode)
        GROUP BY p.PurchaseType
    ),
    Sales AS (
        SELECT 
            'Sale ' + r.ReceiptType AS Type,
            SUM(CASE 
                WHEN r.ReceiptType IN ('Payment', 'Return Receipt') THEN r.Total 
                ELSE 0 
            END) AS Payments,
            SUM(CASE 
                WHEN r.ReceiptType IN ('Receipt', 'Return Payment') THEN r.Total 
                ELSE 0 
            END) AS Receipts
        FROM tblReceiptHead r
        WHERE r.Date < @startDate
            AND r.CompanyID = @CompanyID
            AND r.InComplete = 0
            AND r.IsActive = 1
            AND (@includeAllBanks = 1 OR r.BankCode = @bankCode)
        GROUP BY r.ReceiptType
    ),
    BankReceipts AS (
        SELECT 
            r.BankReceiptType AS Type,
            0 AS Payments,
            SUM(r.Amount) AS Receipts
        FROM tblBankReceipts r
        WHERE r.Date < @startDate
            AND r.CompanyID = @CompanyID
            AND r.IsActive = 1
            AND (@includeAllBanks = 1 OR r.BankCode = @bankCode)
        GROUP BY r.BankReceiptType
    ),
    BankPayments AS (
        SELECT 
            p.BankPaymentType AS Type,
            SUM(p.Amount) AS Payments,
            0 AS Receipts
        FROM tblBankPayments p
        WHERE p.Date < @startDate
            AND p.CompanyID = @CompanyID
            AND p.IsActive = 1
            AND (@includeAllBanks = 1 OR p.BankCode = @bankCode)
        GROUP BY p.BankPaymentType
    ),
    BankTransfers AS (
        SELECT 
            'Bank Transfer' AS Type,
            SUM(CASE WHEN @includeAllBanks = 1 OR t.FromBankCode = @bankCode THEN t.Amount ELSE 0 END) AS Payments,
            SUM(CASE WHEN @includeAllBanks = 1 OR t.ToBankCode = @bankCode THEN t.Amount ELSE 0 END) AS Receipts
        FROM tblBankTransfers t
        WHERE t.Date < @startDate
            AND t.CompanyID = @CompanyID
            AND t.IsActive = 1
    )
    
    -- Combine all results using UNION ALL
    SELECT * FROM OpeningBalance
    UNION ALL
    SELECT * FROM Purchases
    UNION ALL
    SELECT * FROM Sales
    UNION ALL
    SELECT * FROM BankReceipts
    UNION ALL
    SELECT * FROM BankPayments
    UNION ALL
    SELECT * FROM BankTransfers;
END");
        }
    }
}
