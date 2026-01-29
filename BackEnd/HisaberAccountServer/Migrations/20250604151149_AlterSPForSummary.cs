using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HisaberAccountServer.Migrations
{
    /// <inheritdoc />
    public partial class AlterSPForSummary : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
        alter PROCEDURE GetCustomerReportSummary    
    @CompanyID INT,    
    @SelectedAccountCodes VARCHAR(MAX) = NULL,    
    @StartDate DATETIME = NULL,    
    @EndDate DATETIME = NULL    
AS    
BEGIN    
    SET NOCOUNT ON;    
    
    -- Create temp table for account codes    
    IF OBJECT_ID('tempdb..#AccountCodes') IS NOT NULL    
        DROP TABLE #AccountCodes    
            
    SELECT value AS AccountCode     
    INTO #AccountCodes     
    FROM STRING_SPLIT(@SelectedAccountCodes, ',')    
    
    -- Calculate aggregated values using CTEs    
    ;WITH OpenSales AS (    
        SELECT     
            CustomerAccountCode,    
            SUM(CASE WHEN SaleType = 'Credit' THEN -total ELSE total END) AS Total    
        FROM tblSaleHead    
        WHERE CompanyID = @CompanyID    
            AND (CustomerAccountCode IN (SELECT AccountCode FROM #AccountCodes))    
            AND Date < @StartDate    
            AND isActive = 1    
            AND inComplete = 0    
        GROUP BY CustomerAccountCode    
    ),    
    OpenReceipts AS (    
        SELECT     
            CustomerAccountCode,    
            SUM(CASE WHEN ReceiptType IN ('Payment', 'ReturnReceipt') THEN -total ELSE total END) AS Total    
        FROM tblReceiptHead    
        WHERE CompanyID = @CompanyID    
            AND (CustomerAccountCode IN (SELECT AccountCode FROM #AccountCodes))    
            AND Date < @StartDate    
            AND IsActive = 1    
            AND InComplete = 0    
        GROUP BY CustomerAccountCode    
    ),    
    OpenFromJournals AS (    
        SELECT     
            FromAccountCode,    
            SUM(Amount) AS Total    
        FROM tblJournalVoucher    
        WHERE CompanyID = @CompanyID    
            AND (FromAccountCode IN (SELECT AccountCode FROM #AccountCodes))    
            AND Date < @StartDate    
            AND IsActive = 1   
        GROUP BY FromAccountCode    
    ),  
    OpenToJournals AS (    
        SELECT     
            ToAccountCode,    
            SUM(Amount) AS Total    
        FROM tblJournalVoucher    
        WHERE CompanyID = @CompanyID    
            AND (ToAccountCode IN (SELECT AccountCode FROM #AccountCodes))    
            AND Date < @StartDate    
            AND IsActive = 1   
        GROUP BY ToAccountCode    
    ),
    OpenPurchases AS (  
        SELECT   
            SupplierAccountCode,  
            SUM(CASE WHEN PurchaseType IN ('Credit') THEN -total ELSE total END) AS Total  
        FROM tblPurchaseHead  
        WHERE CompanyID = @CompanyID  
            AND (SupplierAccountCode IN (SELECT AccountCode FROM #AccountCodes))  
            AND Date < @StartDate  
            AND isActive = 1  
            AND inComplete = 0  
        GROUP BY SupplierAccountCode  
    ),  
    OpenPayments AS (  
        SELECT   
            SupplierAccountCode,  
            SUM(CASE WHEN PurchaseType IN ('Receipt', 'ReturnPayment') THEN -total ELSE total END) AS Total  
        FROM tblPaymentHead  
        WHERE CompanyID = @CompanyID  
            AND (SupplierAccountCode IN (SELECT AccountCode FROM #AccountCodes))  
            AND Date < @StartDate  
            AND IsActive = 1  
            AND InComplete = 0  
        GROUP BY SupplierAccountCode  
    ),
    CurrentSales AS (    
        SELECT     
            CustomerAccountCode,    
            SUM(CASE WHEN SaleType = 'Credit' THEN -total ELSE total END) AS Total    
        FROM tblSaleHead    
        WHERE CompanyID = @CompanyID    
            AND (CustomerAccountCode IN (SELECT AccountCode FROM #AccountCodes))    
            AND Date BETWEEN @StartDate AND @EndDate    
            AND isActive = 1    
            AND inComplete = 0    
        GROUP BY CustomerAccountCode    
    ),    
    CurrentReceipts AS (    
        SELECT     
            CustomerAccountCode,    
            SUM(CASE WHEN ReceiptType IN ('Payment', 'ReturnReceipt') THEN -total ELSE total END) AS Total    
        FROM tblReceiptHead    
        WHERE CompanyID = @CompanyID    
            AND (CustomerAccountCode IN (SELECT AccountCode FROM #AccountCodes))    
            AND Date BETWEEN @StartDate AND @EndDate    
            AND IsActive = 1    
            AND InComplete = 0    
        GROUP BY CustomerAccountCode    
    ),  
    CurrentFromJournals AS (    
        SELECT     
            FromAccountCode,    
            SUM(Amount) AS Total    
        FROM tblJournalVoucher    
        WHERE CompanyID = @CompanyID    
            AND (FromAccountCode IN (SELECT AccountCode FROM #AccountCodes))    
            AND Date BETWEEN @StartDate AND @EndDate    
            AND IsActive = 1  
        GROUP BY FromAccountCode    
    ),  
    CurrentToJournals AS (    
        SELECT     
            ToAccountCode,    
            SUM(Amount) AS Total    
        FROM tblJournalVoucher    
        WHERE CompanyID = @CompanyID    
            AND (ToAccountCode IN (SELECT AccountCode FROM #AccountCodes))    
            AND Date BETWEEN @StartDate AND @EndDate    
            AND IsActive = 1  
        GROUP BY ToAccountCode    
    ),
    CurrentPurchases AS (  
        SELECT   
            SupplierAccountCode,  
            SUM(CASE WHEN PurchaseType IN ('Credit') THEN -total ELSE total END) AS Total  
        FROM tblPurchaseHead  
        WHERE CompanyID = @CompanyID  
            AND (SupplierAccountCode IN (SELECT AccountCode FROM #AccountCodes))  
            AND Date BETWEEN @StartDate AND @EndDate  
            AND isActive = 1  
            AND inComplete = 0  
        GROUP BY SupplierAccountCode  
    ),  
    CurrentPayments AS (  
        SELECT   
            SupplierAccountCode,  
            SUM(CASE WHEN PurchaseType IN ('Receipt', 'ReturnPayment') THEN -total ELSE total END) AS Total  
        FROM tblPaymentHead  
        WHERE CompanyID = @CompanyID  
            AND (SupplierAccountCode IN (SELECT AccountCode FROM #AccountCodes))  
            AND Date BETWEEN @StartDate AND @EndDate  
            AND IsActive = 1  
            AND InComplete = 0  
        GROUP BY SupplierAccountCode  
    ),
    Customers AS (    
        SELECT     
            AccountCode,    
            BusinessName,
            isSupplier,
            SupplierOpeningBalance
        FROM tblCustomerSupplier    
        WHERE CompanyID = @CompanyID    
            AND isCustomer = 1    
            AND isActive = 1    
            AND (AccountCode IN (SELECT AccountCode FROM #AccountCodes))    
    )    
    SELECT    
        c.AccountCode,    
        c.BusinessName AS Name,
        
        -- Original Customer calculations
        (ISNULL(os.Total, 0) + ISNULL(otv.Total, 0) + CASE WHEN c.isSupplier = 1 THEN ISNULL(opm.Total, 0) ELSE 0 END) AS OpenSaleTotal,    
        (ISNULL(ocr.Total, 0) + ISNULL(ofv.Total, 0) + CASE WHEN c.isSupplier = 1 THEN ISNULL(op.Total, 0)ELSE 0 END) AS OpenReceiptTotal,  
        (ISNULL(cs.Total, 0) + ISNULL(ctv.Total, 0) + CASE WHEN c.isSupplier = 1 THEN ISNULL(cpm.Total, 0)ELSE 0 END) AS SaleTotal,    
        (ISNULL(cr.Total, 0) + ISNULL(cfv.Total, 0) + CASE WHEN c.isSupplier = 1 THEN ISNULL(cp.Total, 0)ELSE 0 END) AS ReceiptTotal,
  
        -- Base Balance calculation (Customer side + Supplier side if applicable)
        (ISNULL(os.Total, 0)   
         - ISNULL(ocr.Total, 0)   
         - ISNULL(ofv.Total, 0)   
         + ISNULL(otv.Total, 0)
         + CASE WHEN c.isSupplier = 1 THEN 
             (-ISNULL(op.Total, 0)   
         + ISNULL(opm.Total, 0)) 
           ELSE 0 END) AS BaseBalance,    
  
        -- Final Balance calculation (Base Balance + Current Period transactions)
        (ISNULL(os.Total, 0)   
         - ISNULL(ocr.Total, 0)   
         - ISNULL(ofv.Total, 0)   
         + ISNULL(otv.Total, 0)
         + CASE WHEN c.isSupplier = 1 THEN 
             (-ISNULL(op.Total, 0)   
         + ISNULL(opm.Total, 0)) 
           ELSE 0 END)   
        + (ISNULL(cs.Total, 0)   
         - ISNULL(cr.Total, 0)   
         - ISNULL(cfv.Total, 0)   
         + ISNULL(ctv.Total, 0)
         + CASE WHEN c.isSupplier = 1 THEN 
             (-ISNULL(cp.Total, 0)   
         + ISNULL(cpm.Total, 0)) 
           ELSE 0 END) AS Balance    
    
    FROM Customers c    
    LEFT JOIN OpenSales os ON c.AccountCode = os.CustomerAccountCode    
    LEFT JOIN OpenToJournals otv ON c.AccountCode = otv.ToAccountCode  
    LEFT JOIN OpenFromJournals ofv ON c.AccountCode = ofv.FromAccountCode  
    LEFT JOIN OpenReceipts ocr ON c.AccountCode = ocr.CustomerAccountCode  
    LEFT JOIN CurrentSales cs ON c.AccountCode = cs.CustomerAccountCode    
    LEFT JOIN CurrentReceipts cr ON c.AccountCode = cr.CustomerAccountCode  
    LEFT JOIN CurrentFromJournals cfv ON c.AccountCode = cfv.FromAccountCode  
    LEFT JOIN CurrentToJournals ctv ON c.AccountCode = ctv.ToAccountCode
    -- Add supplier-related JOINs (will only have data if isSupplier = 1)
    LEFT JOIN OpenPurchases op ON c.AccountCode = op.SupplierAccountCode
    LEFT JOIN OpenPayments opm ON c.AccountCode = opm.SupplierAccountCode
    LEFT JOIN CurrentPurchases cp ON c.AccountCode = cp.SupplierAccountCode
    LEFT JOIN CurrentPayments cpm ON c.AccountCode = cpm.SupplierAccountCode
    
    DROP TABLE #AccountCodes    
END
");

            migrationBuilder.Sql(@"alter PROCEDURE GetSupplierReportSummary        
    @CompanyID INT,        
    @SelectedAccountCodes VARCHAR(MAX) = NULL,        
    @StartDate DATETIME = NULL,        
    @EndDate DATETIME = NULL        
AS        
BEGIN        
    SET NOCOUNT ON;        
        
    -- Create temp table for account codes        
    IF OBJECT_ID('tempdb..#AccountCodes') IS NOT NULL        
        DROP TABLE #AccountCodes        
                
    SELECT value AS AccountCode         
    INTO #AccountCodes         
    FROM STRING_SPLIT(@SelectedAccountCodes, ',')        
        
    -- Calculate aggregated values using CTEs        
    ;WITH OpenPurchases AS (        
        SELECT         
            SupplierAccountCode,        
            SUM(CASE WHEN PurchaseType IN ('Credit') THEN -total ELSE total END) AS Total        
        FROM tblPurchaseHead        
        WHERE CompanyID = @CompanyID        
            AND (SupplierAccountCode IN (SELECT AccountCode FROM #AccountCodes))        
            AND Date < @StartDate        
            AND isActive = 1        
            AND inComplete = 0        
        GROUP BY SupplierAccountCode        
    ),        
    OpenPayments AS (        
        SELECT         
            SupplierAccountCode,        
            SUM(CASE WHEN PurchaseType IN ('Receipt', 'ReturnPayment') THEN -total ELSE total END) AS Total        
        FROM tblPaymentHead        
        WHERE CompanyID = @CompanyID        
            AND (SupplierAccountCode IN (SELECT AccountCode FROM #AccountCodes))        
            AND Date < @StartDate        
            AND IsActive = 1        
            AND InComplete = 0        
        GROUP BY SupplierAccountCode        
    ),        
 OpenFromJournals AS (        
        SELECT         
            FromAccountCode,        
            SUM(Amount) AS Total        
        FROM tblJournalVoucher        
        WHERE CompanyID = @CompanyID        
            AND (FromAccountCode IN (SELECT AccountCode FROM #AccountCodes))        
            AND Date < @StartDate        
            AND IsActive = 1       
        GROUP BY FromAccountCode        
    ),      
 OpenToJournals AS (        
        SELECT         
            ToAccountCode,        
            SUM(Amount) AS Total        
        FROM tblJournalVoucher        
        WHERE CompanyID = @CompanyID        
            AND (ToAccountCode IN (SELECT AccountCode FROM #AccountCodes))        
            AND Date < @StartDate        
            AND IsActive = 1       
        GROUP BY ToAccountCode        
    ),      
 OpenSales AS (          
        SELECT           
            CustomerAccountCode,          
            SUM(CASE WHEN SaleType = 'Credit' THEN -total ELSE total END) AS Total          
        FROM tblSaleHead          
        WHERE CompanyID = @CompanyID          
            AND (CustomerAccountCode IN (SELECT AccountCode FROM #AccountCodes))          
            AND Date < @StartDate          
            AND isActive = 1          
            AND inComplete = 0          
        GROUP BY CustomerAccountCode          
    ),          
    OpenReceipts AS (          
        SELECT           
            CustomerAccountCode,          
            SUM(CASE WHEN ReceiptType IN ('Payment', 'ReturnReceipt') THEN -total ELSE total END) AS Total          
        FROM tblReceiptHead          
        WHERE CompanyID = @CompanyID          
            AND (CustomerAccountCode IN (SELECT AccountCode FROM #AccountCodes))          
            AND Date < @StartDate          
            AND IsActive = 1          
            AND InComplete = 0          
        GROUP BY CustomerAccountCode          
    ),  
    CurrentPurchases AS (        
        SELECT         
            SupplierAccountCode,        
            SUM(CASE WHEN PurchaseType IN ('Credit') THEN -total ELSE total END) AS Total        
        FROM tblPurchaseHead        
        WHERE CompanyID = @CompanyID        
            AND (SupplierAccountCode IN (SELECT AccountCode FROM #AccountCodes))                    AND Date BETWEEN @StartDate AND @EndDate        
            AND isActive = 1        
            AND inComplete = 0        
        GROUP BY SupplierAccountCode        
    ),        
    CurrentPayments AS (        
        SELECT         
            SupplierAccountCode,        
            SUM(CASE WHEN PurchaseType IN ('Receipt', 'ReturnPayment') THEN -total ELSE total END) AS Total        
        FROM tblPaymentHead        
        WHERE CompanyID = @CompanyID        
            AND (SupplierAccountCode IN (SELECT AccountCode FROM #AccountCodes))        
            AND Date BETWEEN @StartDate AND @EndDate        
            AND IsActive = 1        
            AND InComplete = 0        
        GROUP BY SupplierAccountCode        
    ),        
 CurrentFromJournals AS (        
        SELECT         
            FromAccountCode,        
            SUM(Amount) AS Total        
        FROM tblJournalVoucher        
        WHERE CompanyID = @CompanyID        
            AND (FromAccountCode IN (SELECT AccountCode FROM #AccountCodes))        
            AND Date BETWEEN @StartDate AND @EndDate        
            AND IsActive = 1      
        GROUP BY FromAccountCode        
    ),      
 CurrentToJournals AS (        
        SELECT         
            ToAccountCode,        
   SUM(Amount) AS Total        
        FROM tblJournalVoucher        
        WHERE CompanyID = @CompanyID        
            AND (ToAccountCode IN (SELECT AccountCode FROM #AccountCodes))        
            AND Date BETWEEN @StartDate AND @EndDate        
            AND IsActive = 1      
        GROUP BY ToAccountCode        
    ),      
 CurrentSales AS (          
        SELECT           
            CustomerAccountCode,          
            SUM(CASE WHEN SaleType = 'Credit' THEN -total ELSE total END) AS Total          
        FROM tblSaleHead          
        WHERE CompanyID = @CompanyID          
            AND (CustomerAccountCode IN (SELECT AccountCode FROM #AccountCodes))          
            AND Date BETWEEN @StartDate AND @EndDate          
            AND isActive = 1          
           AND inComplete = 0          
        GROUP BY CustomerAccountCode          
    ),          
    CurrentReceipts AS (          
        SELECT           
            CustomerAccountCode,          
      SUM(CASE WHEN ReceiptType IN ('Payment', 'ReturnReceipt') THEN -total ELSE total END) AS Total          
        FROM tblReceiptHead          
        WHERE CompanyID = @CompanyID          
            AND (CustomerAccountCode IN (SELECT AccountCode FROM #AccountCodes))          
            AND Date BETWEEN @StartDate AND @EndDate          
            AND IsActive = 1          
            AND InComplete = 0          
        GROUP BY CustomerAccountCode          
    ),  
    Suppliers AS (        
        SELECT         
            AccountCode,        
            BusinessName,        
   IsCustomer,  
            SupplierOpeningBalance  
        FROM tblCustomerSupplier        
        WHERE CompanyID = @CompanyID        
            AND isSupplier = 1        
            AND isActive = 1        
            AND (AccountCode IN (SELECT AccountCode FROM #AccountCodes))        
    )        
    SELECT        
        s.AccountCode,        
        s.BusinessName AS Name,        
        (ISNULL(op.Total, 0) + ISNULL(otv.Total,0) + CASE WHEN s.IsCustomer = 1 THEN ISNULL(os.Total, 0) ELSE 0 END) AS OpenPurchaseTotal,        
        (ISNULL(opy.Total, 0) + ISNULL(ofv.Total,0) + CASE WHEN s.IsCustomer = 1 THEN ISNULL(orc.Total, 0)ELSE 0 END) AS OpenPaymentTotal,        
        (ISNULL(cp.Total, 0) + ISNULL(ctv.Total, 0) + CASE WHEN s.IsCustomer = 1 THEN ISNULL(cs.Total, 0)ELSE 0 END) AS PurchaseTotal,        
        (ISNULL(cpy.Total, 0) + ISNULL(cfv.Total, 0) + CASE WHEN s.IsCustomer = 1 THEN ISNULL(crc.Total, 0)ELSE 0 END) AS PaymentTotal,      
        
        (ISNULL(op.Total, 0) - ISNULL(opy.Total, 0) + ISNULL(ofv.Total, 0)       
 - ISNULL(otv.Total, 0) + CASE WHEN s.IsCustomer = 1 THEN                    (-ISNULL(os.Total, 0)         
         + ISNULL(orc.Total, 0))       
           ELSE 0 END) AS BaseBalance,      
        
        (ISNULL(op.Total, 0) - ISNULL(opy.Total, 0) + ISNULL(ofv.Total, 0)       
 - ISNULL(otv.Total, 0)) + CASE WHEN s.IsCustomer = 1 THEN       
             (-ISNULL(os.Total, 0)         
         + ISNULL(orc.Total, 0))       
           ELSE 0 END +         
        (ISNULL(cp.Total, 0) - ISNULL(cpy.Total, 0) + ISNULL(cfv.Total,0) - ISNULL(ctv.Total,0) + CASE WHEN s.IsCustomer = 1 THEN       
             (-ISNULL(cs.Total, 0)         
         + ISNULL(crc.Total, 0))       
           ELSE 0 END) AS Balance        
    FROM Suppliers s        
    LEFT JOIN OpenPurchases op ON s.AccountCode = op.SupplierAccountCode        
    LEFT JOIN OpenPayments opy ON s.AccountCode = opy.SupplierAccountCode        
 LEFT JOIN OpenToJournals otv ON s.AccountCode = otv.ToAccountCode      
 LEFT JOIN OpenFromJournals ofv ON s.AccountCode = ofv.FromAccountCode      
    LEFT JOIN CurrentPurchases cp ON s.AccountCode = cp.SupplierAccountCode        
    LEFT JOIN CurrentPayments cpy ON s.AccountCode = cpy.SupplierAccountCode      
 LEFT JOIN CurrentFromJournals cfv ON s.AccountCode = cfv.FromAccountCode      
 LEFT JOIN CurrentToJournals ctv ON s.AccountCode = ctv.ToAccountCode   
 -- Add supplier-related JOINs (will only have data if isSupplier = 1)      
    LEFT JOIN OpenSales os ON s.AccountCode = os.CustomerAccountCode  
    LEFT JOIN OpenReceipts orc ON s.AccountCode = orc.CustomerAccountCode      
    LEFT JOIN CurrentSales cs ON s.AccountCode = cs.CustomerAccountCode      
    LEFT JOIN CurrentReceipts crc ON s.AccountCode = crc.CustomerAccountCode      
        
    DROP TABLE #AccountCodes        
END");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
            CREATE PROCEDURE GetCustomerReportSummary    
    @CompanyID INT,    
    @SelectedAccountCodes VARCHAR(MAX) = NULL,    
    @StartDate DATETIME = NULL,    
    @EndDate DATETIME = NULL    
AS    
BEGIN    
    SET NOCOUNT ON;    
    
    -- Create temp table for account codes    
    IF OBJECT_ID('tempdb..#AccountCodes') IS NOT NULL    
        DROP TABLE #AccountCodes    
            
    SELECT value AS AccountCode     
    INTO #AccountCodes     
    FROM STRING_SPLIT(@SelectedAccountCodes, ',')    
    
    -- Calculate aggregated values using CTEs    
    ;WITH OpenSales AS (    
        SELECT     
            CustomerAccountCode,    
            SUM(CASE WHEN SaleType = 'Credit' THEN -total ELSE total END) AS Total    
        FROM tblSaleHead    
        WHERE CompanyID = @CompanyID    
            AND (CustomerAccountCode IN (SELECT AccountCode FROM #AccountCodes))    
            AND Date < @StartDate    
            AND isActive = 1    
            AND inComplete = 0    
        GROUP BY CustomerAccountCode    
    ),    
    OpenReceipts AS (    
        SELECT     
            CustomerAccountCode,    
            SUM(CASE WHEN ReceiptType IN ('Payment', 'ReturnReceipt') THEN -total ELSE total END) AS Total    
        FROM tblReceiptHead    
        WHERE CompanyID = @CompanyID    
            AND (CustomerAccountCode IN (SELECT AccountCode FROM #AccountCodes))    
            AND Date < @StartDate    
            AND IsActive = 1    
            AND InComplete = 0    
        GROUP BY CustomerAccountCode    
    ),    
    OpenFromJournals AS (    
        SELECT     
            FromAccountCode,    
            SUM(Amount) AS Total    
        FROM tblJournalVoucher    
        WHERE CompanyID = @CompanyID    
            AND (FromAccountCode IN (SELECT AccountCode FROM #AccountCodes))    
            AND Date < @StartDate    
            AND IsActive = 1   
        GROUP BY FromAccountCode    
    ),  
    OpenToJournals AS (    
        SELECT     
            ToAccountCode,    
            SUM(Amount) AS Total    
        FROM tblJournalVoucher    
        WHERE CompanyID = @CompanyID    
            AND (ToAccountCode IN (SELECT AccountCode FROM #AccountCodes))    
            AND Date < @StartDate    
            AND IsActive = 1   
        GROUP BY ToAccountCode    
    ),
    OpenPurchases AS (  
        SELECT   
            SupplierAccountCode,  
            SUM(CASE WHEN PurchaseType IN ('Credit') THEN -total ELSE total END) AS Total  
        FROM tblPurchaseHead  
        WHERE CompanyID = @CompanyID  
            AND (SupplierAccountCode IN (SELECT AccountCode FROM #AccountCodes))  
            AND Date < @StartDate  
            AND isActive = 1  
            AND inComplete = 0  
        GROUP BY SupplierAccountCode  
    ),  
    OpenPayments AS (  
        SELECT   
            SupplierAccountCode,  
            SUM(CASE WHEN PurchaseType IN ('Receipt', 'ReturnPayment') THEN -total ELSE total END) AS Total  
        FROM tblPaymentHead  
        WHERE CompanyID = @CompanyID  
            AND (SupplierAccountCode IN (SELECT AccountCode FROM #AccountCodes))  
            AND Date < @StartDate  
            AND IsActive = 1  
            AND InComplete = 0  
        GROUP BY SupplierAccountCode  
    ),
    CurrentSales AS (    
        SELECT     
            CustomerAccountCode,    
            SUM(CASE WHEN SaleType = 'Credit' THEN -total ELSE total END) AS Total    
        FROM tblSaleHead    
        WHERE CompanyID = @CompanyID    
            AND (CustomerAccountCode IN (SELECT AccountCode FROM #AccountCodes))    
            AND Date BETWEEN @StartDate AND @EndDate    
            AND isActive = 1    
            AND inComplete = 0    
        GROUP BY CustomerAccountCode    
    ),    
    CurrentReceipts AS (    
        SELECT     
            CustomerAccountCode,    
            SUM(CASE WHEN ReceiptType IN ('Payment', 'ReturnReceipt') THEN -total ELSE total END) AS Total    
        FROM tblReceiptHead    
        WHERE CompanyID = @CompanyID    
            AND (CustomerAccountCode IN (SELECT AccountCode FROM #AccountCodes))    
            AND Date BETWEEN @StartDate AND @EndDate    
            AND IsActive = 1    
            AND InComplete = 0    
        GROUP BY CustomerAccountCode    
    ),  
    CurrentFromJournals AS (    
        SELECT     
            FromAccountCode,    
            SUM(Amount) AS Total    
        FROM tblJournalVoucher    
        WHERE CompanyID = @CompanyID    
            AND (FromAccountCode IN (SELECT AccountCode FROM #AccountCodes))    
            AND Date BETWEEN @StartDate AND @EndDate    
            AND IsActive = 1  
        GROUP BY FromAccountCode    
    ),  
    CurrentToJournals AS (    
        SELECT     
            ToAccountCode,    
            SUM(Amount) AS Total    
        FROM tblJournalVoucher    
        WHERE CompanyID = @CompanyID    
            AND (ToAccountCode IN (SELECT AccountCode FROM #AccountCodes))    
            AND Date BETWEEN @StartDate AND @EndDate    
            AND IsActive = 1  
        GROUP BY ToAccountCode    
    ),
    CurrentPurchases AS (  
        SELECT   
            SupplierAccountCode,  
            SUM(CASE WHEN PurchaseType IN ('Credit') THEN -total ELSE total END) AS Total  
        FROM tblPurchaseHead  
        WHERE CompanyID = @CompanyID  
            AND (SupplierAccountCode IN (SELECT AccountCode FROM #AccountCodes))  
            AND Date BETWEEN @StartDate AND @EndDate  
            AND isActive = 1  
            AND inComplete = 0  
        GROUP BY SupplierAccountCode  
    ),  
    CurrentPayments AS (  
        SELECT   
            SupplierAccountCode,  
            SUM(CASE WHEN PurchaseType IN ('Receipt', 'ReturnPayment') THEN -total ELSE total END) AS Total  
        FROM tblPaymentHead  
        WHERE CompanyID = @CompanyID  
            AND (SupplierAccountCode IN (SELECT AccountCode FROM #AccountCodes))  
            AND Date BETWEEN @StartDate AND @EndDate  
            AND IsActive = 1  
            AND InComplete = 0  
        GROUP BY SupplierAccountCode  
    ),
    Customers AS (    
        SELECT     
            AccountCode,    
            BusinessName,
            isSupplier,
            SupplierOpeningBalance
        FROM tblCustomerSupplier    
        WHERE CompanyID = @CompanyID    
            AND isCustomer = 1    
            AND isActive = 1    
            AND (AccountCode IN (SELECT AccountCode FROM #AccountCodes))    
    )    
    SELECT    
        c.AccountCode,    
        c.BusinessName AS Name,
        
        -- Original Customer calculations
        (ISNULL(os.Total, 0) + ISNULL(otv.Total, 0) + CASE WHEN c.isSupplier = 1 THEN ISNULL(opm.Total, 0) ELSE 0 END) AS OpenSaleTotal,    
        (ISNULL(ocr.Total, 0) + ISNULL(ofv.Total, 0) + CASE WHEN c.isSupplier = 1 THEN ISNULL(op.Total, 0)ELSE 0 END) AS OpenReceiptTotal,  
        (ISNULL(cs.Total, 0) + ISNULL(ctv.Total, 0) + CASE WHEN c.isSupplier = 1 THEN ISNULL(cpm.Total, 0)ELSE 0 END) AS SaleTotal,    
        (ISNULL(cr.Total, 0) + ISNULL(cfv.Total, 0) + CASE WHEN c.isSupplier = 1 THEN ISNULL(cp.Total, 0)ELSE 0 END) AS ReceiptTotal,
  
        -- Base Balance calculation (Customer side + Supplier side if applicable)
        (ISNULL(os.Total, 0)   
         - ISNULL(ocr.Total, 0)   
         - ISNULL(ofv.Total, 0)   
         + ISNULL(otv.Total, 0)
         + CASE WHEN c.isSupplier = 1 THEN 
             (-ISNULL(op.Total, 0)   
         + ISNULL(opm.Total, 0)) 
           ELSE 0 END) AS BaseBalance,    
  
        -- Final Balance calculation (Base Balance + Current Period transactions)
        (ISNULL(os.Total, 0)   
         - ISNULL(ocr.Total, 0)   
         - ISNULL(ofv.Total, 0)   
         + ISNULL(otv.Total, 0)
         + CASE WHEN c.isSupplier = 1 THEN 
             (-ISNULL(op.Total, 0)   
         + ISNULL(opm.Total, 0)) 
           ELSE 0 END)   
        + (ISNULL(cs.Total, 0)   
         - ISNULL(cr.Total, 0)   
         - ISNULL(cfv.Total, 0)   
         + ISNULL(ctv.Total, 0)
         + CASE WHEN c.isSupplier = 1 THEN 
             (-ISNULL(cp.Total, 0)   
         + ISNULL(cpm.Total, 0)) 
           ELSE 0 END) AS Balance    
    
    FROM Customers c    
    LEFT JOIN OpenSales os ON c.AccountCode = os.CustomerAccountCode    
    LEFT JOIN OpenToJournals otv ON c.AccountCode = otv.ToAccountCode  
    LEFT JOIN OpenFromJournals ofv ON c.AccountCode = ofv.FromAccountCode  
    LEFT JOIN OpenReceipts ocr ON c.AccountCode = ocr.CustomerAccountCode  
    LEFT JOIN CurrentSales cs ON c.AccountCode = cs.CustomerAccountCode    
    LEFT JOIN CurrentReceipts cr ON c.AccountCode = cr.CustomerAccountCode  
    LEFT JOIN CurrentFromJournals cfv ON c.AccountCode = cfv.FromAccountCode  
    LEFT JOIN CurrentToJournals ctv ON c.AccountCode = ctv.ToAccountCode
    -- Add supplier-related JOINs (will only have data if isSupplier = 1)
    LEFT JOIN OpenPurchases op ON c.AccountCode = op.SupplierAccountCode
    LEFT JOIN OpenPayments opm ON c.AccountCode = opm.SupplierAccountCode
    LEFT JOIN CurrentPurchases cp ON c.AccountCode = cp.SupplierAccountCode
    LEFT JOIN CurrentPayments cpm ON c.AccountCode = cpm.SupplierAccountCode
    
    DROP TABLE #AccountCodes    
END
");

            migrationBuilder.Sql(@"create PROCEDURE GetSupplierReportSummary      
    @CompanyID INT,      
    @SelectedAccountCodes VARCHAR(MAX) = NULL,      
    @StartDate DATETIME = NULL,      
    @EndDate DATETIME = NULL      
AS      
BEGIN      
    SET NOCOUNT ON;      
      
    -- Create temp table for account codes      
    IF OBJECT_ID('tempdb..#AccountCodes') IS NOT NULL      
        DROP TABLE #AccountCodes      
              
    SELECT value AS AccountCode       
    INTO #AccountCodes       
    FROM STRING_SPLIT(@SelectedAccountCodes, ',')      
      
    -- Calculate aggregated values using CTEs      
    ;WITH OpenPurchases AS (      
        SELECT       
            SupplierAccountCode,      
            SUM(CASE WHEN PurchaseType IN ('Credit') THEN -total ELSE total END) AS Total      
        FROM tblPurchaseHead      
        WHERE CompanyID = @CompanyID      
            AND (SupplierAccountCode IN (SELECT AccountCode FROM #AccountCodes))      
            AND Date < @StartDate      
            AND isActive = 1      
            AND inComplete = 0      
        GROUP BY SupplierAccountCode      
    ),      
    OpenPayments AS (      
        SELECT       
            SupplierAccountCode,      
            SUM(CASE WHEN PurchaseType IN ('Receipt', 'ReturnPayment') THEN -total ELSE total END) AS Total      
        FROM tblPaymentHead      
        WHERE CompanyID = @CompanyID      
            AND (SupplierAccountCode IN (SELECT AccountCode FROM #AccountCodes))      
            AND Date < @StartDate      
            AND IsActive = 1      
            AND InComplete = 0      
        GROUP BY SupplierAccountCode      
    ),      
 OpenFromJournals AS (      
        SELECT       
            FromAccountCode,      
            SUM(Amount) AS Total      
        FROM tblJournalVoucher      
        WHERE CompanyID = @CompanyID      
            AND (FromAccountCode IN (SELECT AccountCode FROM #AccountCodes))      
            AND Date < @StartDate      
            AND IsActive = 1     
        GROUP BY FromAccountCode      
    ),    
 OpenToJournals AS (      
        SELECT       
            ToAccountCode,      
            SUM(Amount) AS Total      
        FROM tblJournalVoucher      
        WHERE CompanyID = @CompanyID      
            AND (ToAccountCode IN (SELECT AccountCode FROM #AccountCodes))      
            AND Date < @StartDate      
            AND IsActive = 1     
        GROUP BY ToAccountCode      
    ),    
	OpenSales AS (        
        SELECT         
            CustomerAccountCode,        
            SUM(CASE WHEN SaleType = 'Credit' THEN -total ELSE total END) AS Total        
        FROM tblSaleHead        
        WHERE CompanyID = @CompanyID        
            AND (CustomerAccountCode IN (SELECT AccountCode FROM #AccountCodes))        
            AND Date < @StartDate        
            AND isActive = 1        
            AND inComplete = 0        
        GROUP BY CustomerAccountCode        
    ),        
    OpenReceipts AS (        
        SELECT         
            CustomerAccountCode,        
            SUM(CASE WHEN ReceiptType IN ('Payment', 'ReturnReceipt') THEN -total ELSE total END) AS Total        
        FROM tblReceiptHead        
        WHERE CompanyID = @CompanyID        
            AND (CustomerAccountCode IN (SELECT AccountCode FROM #AccountCodes))        
            AND Date < @StartDate        
            AND IsActive = 1        
            AND InComplete = 0        
        GROUP BY CustomerAccountCode        
    ),
    CurrentPurchases AS (      
        SELECT       
            SupplierAccountCode,      
            SUM(CASE WHEN PurchaseType IN ('Credit') THEN -total ELSE total END) AS Total      
        FROM tblPurchaseHead      
        WHERE CompanyID = @CompanyID      
            AND (SupplierAccountCode IN (SELECT AccountCode FROM #AccountCodes))      
            AND Date BETWEEN @StartDate AND @EndDate      
            AND isActive = 1      
            AND inComplete = 0      
        GROUP BY SupplierAccountCode      
    ),      
    CurrentPayments AS (      
        SELECT       
            SupplierAccountCode,      
            SUM(CASE WHEN PurchaseType IN ('Receipt', 'ReturnPayment') THEN -total ELSE total END) AS Total      
        FROM tblPaymentHead      
        WHERE CompanyID = @CompanyID      
            AND (SupplierAccountCode IN (SELECT AccountCode FROM #AccountCodes))      
            AND Date BETWEEN @StartDate AND @EndDate      
            AND IsActive = 1      
            AND InComplete = 0      
        GROUP BY SupplierAccountCode      
    ),      
 CurrentFromJournals AS (      
        SELECT       
            FromAccountCode,      
            SUM(Amount) AS Total      
        FROM tblJournalVoucher      
        WHERE CompanyID = @CompanyID      
            AND (FromAccountCode IN (SELECT AccountCode FROM #AccountCodes))      
            AND Date BETWEEN @StartDate AND @EndDate      
            AND IsActive = 1    
        GROUP BY FromAccountCode      
    ),    
 CurrentToJournals AS (      
        SELECT       
            ToAccountCode,      
   SUM(Amount) AS Total      
        FROM tblJournalVoucher      
        WHERE CompanyID = @CompanyID      
            AND (ToAccountCode IN (SELECT AccountCode FROM #AccountCodes))      
            AND Date BETWEEN @StartDate AND @EndDate      
            AND IsActive = 1    
        GROUP BY ToAccountCode      
    ),    
	CurrentSales AS (        
        SELECT         
            CustomerAccountCode,        
            SUM(CASE WHEN SaleType = 'Credit' THEN -total ELSE total END) AS Total        
        FROM tblSaleHead        
        WHERE CompanyID = @CompanyID        
            AND (CustomerAccountCode IN (SELECT AccountCode FROM #AccountCodes))        
            AND Date BETWEEN @StartDate AND @EndDate        
            AND isActive = 1        
           AND inComplete = 0        
        GROUP BY CustomerAccountCode        
    ),        
    CurrentReceipts AS (        
        SELECT         
            CustomerAccountCode,        
      SUM(CASE WHEN ReceiptType IN ('Payment', 'ReturnReceipt') THEN -total ELSE total END) AS Total        
        FROM tblReceiptHead        
        WHERE CompanyID = @CompanyID        
            AND (CustomerAccountCode IN (SELECT AccountCode FROM #AccountCodes))        
            AND Date BETWEEN @StartDate AND @EndDate        
            AND IsActive = 1        
            AND InComplete = 0        
        GROUP BY CustomerAccountCode        
    ),
    Suppliers AS (      
        SELECT       
            AccountCode,      
            BusinessName,      
			IsCustomer,
            SupplierOpeningBalance
        FROM tblCustomerSupplier      
        WHERE CompanyID = @CompanyID      
            AND isSupplier = 1      
            AND isActive = 1      
            AND (AccountCode IN (SELECT AccountCode FROM #AccountCodes))      
    )      
    SELECT      
        s.AccountCode,      
        s.BusinessName AS Name,      
        (ISNULL(op.Total, 0) + ISNULL(otv.Total,0) + CASE WHEN s.IsCustomer = 1 THEN ISNULL(orc.Total, 0) ELSE 0 END) AS OpenPurchaseTotal,      
        (ISNULL(opy.Total, 0) + ISNULL(ofv.Total,0) + CASE WHEN s.IsCustomer = 1 THEN ISNULL(os.Total, 0)ELSE 0 END) AS OpenPaymentTotal,      
        (ISNULL(cp.Total, 0) + ISNULL(ctv.Total, 0) + CASE WHEN s.IsCustomer = 1 THEN ISNULL(crc.Total, 0)ELSE 0 END) AS PurchaseTotal,      
        (ISNULL(cpy.Total, 0) + ISNULL(cfv.Total, 0) + CASE WHEN s.IsCustomer = 1 THEN ISNULL(cs.Total, 0)ELSE 0 END) AS PaymentTotal,    
      
        (ISNULL(op.Total, 0) - ISNULL(opy.Total, 0) - ISNULL(ofv.Total, 0)     
 + ISNULL(otv.Total, 0) + CASE WHEN s.IsCustomer = 1 THEN     
             (-ISNULL(os.Total, 0)       
         + ISNULL(orc.Total, 0))     
           ELSE 0 END) AS BaseBalance,    
      
        (ISNULL(op.Total, 0) - ISNULL(opy.Total, 0) - ISNULL(ofv.Total, 0)     
 + ISNULL(otv.Total, 0)) + CASE WHEN s.IsCustomer = 1 THEN     
             (-ISNULL(os.Total, 0)       
         + ISNULL(orc.Total, 0))     
           ELSE 0 END +       
        (ISNULL(cp.Total, 0) - ISNULL(cpy.Total, 0) - ISNULL(cfv.Total,0) + ISNULL(ctv.Total,0) + CASE WHEN s.IsCustomer = 1 THEN     
             (-ISNULL(cs.Total, 0)       
         + ISNULL(crc.Total, 0))     
           ELSE 0 END) AS Balance      
    FROM Suppliers s      
    LEFT JOIN OpenPurchases op ON s.AccountCode = op.SupplierAccountCode      
    LEFT JOIN OpenPayments opy ON s.AccountCode = opy.SupplierAccountCode      
 LEFT JOIN OpenToJournals otv ON s.AccountCode = otv.ToAccountCode    
 LEFT JOIN OpenFromJournals ofv ON s.AccountCode = ofv.FromAccountCode    
    LEFT JOIN CurrentPurchases cp ON s.AccountCode = cp.SupplierAccountCode      
    LEFT JOIN CurrentPayments cpy ON s.AccountCode = cpy.SupplierAccountCode    
 LEFT JOIN CurrentFromJournals cfv ON s.AccountCode = cfv.FromAccountCode    
 LEFT JOIN CurrentToJournals ctv ON s.AccountCode = ctv.ToAccountCode 
 -- Add supplier-related JOINs (will only have data if isSupplier = 1)    
    LEFT JOIN OpenSales os ON s.AccountCode = os.CustomerAccountCode
    LEFT JOIN OpenReceipts orc ON s.AccountCode = orc.CustomerAccountCode    
    LEFT JOIN CurrentSales cs ON s.AccountCode = cs.CustomerAccountCode    
    LEFT JOIN CurrentReceipts crc ON s.AccountCode = crc.CustomerAccountCode    
      
    DROP TABLE #AccountCodes      
END ");
        }
    }
}
