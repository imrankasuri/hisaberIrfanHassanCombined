using HisaberAccountServer.Data;
using HisaberAccountServer.Migrations;
using HisaberAccountServer.Models.Reports;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualStudio.Web.CodeGenerators.Mvc.Templates.BlazorIdentity.Shared;
using Org.BouncyCastle.Operators;
using System.Data;
using System.Text;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;

namespace HisaberAccountServer.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ReportsController : ControllerBase
    {
        private readonly HisaberDbContext context;
        public ReportsController(HisaberDbContext context)
        {
            this.context = context;
        }

        [HttpGet("GetCustomerReportBy/{CompanyID}")]
        public async Task<IActionResult> GetCustomerTransactions(
            int CompanyID,
            string customerAccountCode = null,
            DateTime? startDate = null,
            DateTime? endDate = null,
            string period = null,
            bool includeAllCustomers = false)
        {
            DateTime now = DateTime.Now;
            try
            {

                if (period == "week")
                {
                    startDate = now.AddDays(-7);
                    endDate = now;
                }
                else if (period == "month")
                {
                    startDate = now.AddMonths(-1);
                    endDate = now;
                }
                else if (period == "last60Days")
                {
                    startDate = now.AddDays(-60);
                    endDate = now;
                }
                else if (period == "last30Days")
                {
                    startDate = now.AddDays(-30);
                    endDate = now;
                }
                else if (period == "last90Days")
                {
                    startDate = now.AddDays(-90);
                    endDate = now;
                }
                else if (period == "last365Days")
                {
                    startDate = now.AddDays(-365);
                    endDate = now;
                }
                else if (period == "year")
                {
                    startDate = new DateTime(now.Year, 1, 1);
                    endDate = now;
                }
                else if (period == "today")
                {
                    startDate = now.Date;
                    endDate = now.Date;
                }
                else if (period == "all")
                {
                    startDate = now.AddYears(-10);
                    endDate = now;
                }
                else if (period == "custom")
                {
                    if (startDate == null || endDate == null)
                    {
                        return Ok(new { status_message = "For 'custom' period, both startDate and endDate must be provided.", status_code = 0 });
                    }
                }

                var connectionString = context.Database.GetDbConnection().ConnectionString;

                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    await connection.OpenAsync();

                    string openingBalanceQuery = @"
                                                    SELECT 
                    Source, 
                    SUM(OpeningBalance) AS OpeningBalance
                FROM (
                    -- Credit Transactions (Receipts)
                    SELECT 
                        'Credit' AS Source,
                        SUM(COALESCE(CAST(CASE 
                            WHEN r.ReceiptType IN ('Receipt', 'Return Payment') THEN r.Total 
                        END AS DECIMAL(18, 2)), 0)) 
                        - 
                        SUM(COALESCE(CAST(CASE 
                            WHEN r.ReceiptType IN ('Payment', 'Return Receipt') THEN r.Total
                        END AS DECIMAL(18, 2)), 0)) AS OpeningBalance
                    FROM tblReceiptHead r
                    WHERE r.Date < @startDate
                      AND r.CompanyID = @CompanyID
                      AND r.IsActive = 1
                      AND (@includeAllCustomers = 1 OR r.CustomerAccountCode = @customerAccountCode)
    
                    UNION ALL
    
                    -- Debit Transactions (Sales)
                    SELECT 
                        'Debit' AS Source,
                        SUM(COALESCE(CAST(CASE 
                            WHEN s.SaleType = 'Invoice' THEN s.Total 
                        END AS DECIMAL(18, 2)), 0)) 
                        - 
                        SUM(COALESCE(CAST(CASE 
                            WHEN s.SaleType = 'Credit' THEN s.Total
                        END AS DECIMAL(18, 2)), 0)) AS OpeningBalance
                    FROM tblSaleHead s
                    WHERE s.Date < @startDate
                      AND s.CompanyID = @CompanyID
                      AND s.IsActive = 1
                      AND (@includeAllCustomers = 1 OR s.CustomerAccountCode = @customerAccountCode)
      
                    UNION ALL
    
                    -- Debit Transactions (Journal Vouchers, filtered by Customers)
                    SELECT 
                        'Credit' AS Source,
                        SUM(jv.Amount) AS OpeningBalance
                    FROM tblJournalVoucher jv
                    INNER JOIN tblCustomerSupplier cs ON jv.FromAccountCode = cs.AccountCode AND jv.CompanyID = cs.CompanyID AND cs.IsCustomer = 1
                    WHERE jv.Date < @startDate
                      AND jv.CompanyID = @CompanyID
                      AND jv.IsActive = 1
                      AND (@includeAllCustomers = 1 OR jv.FromAccountCode = @customerAccountCode)
      
                    UNION ALL
    
                    -- Credit Transactions (Journal Vouchers, filtered by Customers)
                    SELECT 
                        'Debit' AS Source,
                        SUM(jv.Amount) AS OpeningBalance
                    FROM tblJournalVoucher jv
                    INNER JOIN tblCustomerSupplier cs ON jv.ToAccountCode = cs.AccountCode AND jv.CompanyID = cs.CompanyID AND cs.IsCustomer = 1
                    WHERE jv.Date < @startDate
                      AND jv.CompanyID = @CompanyID
                      AND jv.IsActive = 1
                      AND (@includeAllCustomers = 1 OR jv.ToAccountCode = @customerAccountCode)
      
                    UNION ALL
    
                    -- CONDITIONAL SUPPLIER DATA: Credit Transactions (Purchase Bills) - Only if customer is also a supplier
                    SELECT 
                        'Credit' AS Source,
                        ISNULL(SUM(CASE 
                            WHEN s.PurchaseType = 'Bill' THEN s.Total
                            WHEN s.PurchaseType = 'Credit' THEN -s.Total
                        END), 0) AS OpeningBalance
                    FROM tblPurchaseHead s
                    INNER JOIN tblCustomerSupplier cs ON s.SupplierAccountCode = cs.AccountCode AND s.CompanyID = cs.CompanyID
                    WHERE s.Date < @startDate
                      AND s.CompanyID = @CompanyID
                      AND s.IsActive = 1
                      AND (@includeAllCustomers = 1 OR s.SupplierAccountCode = @customerAccountCode)
                      AND cs.IsCustomer = 1  -- Ensure this account is also a customer
                      AND cs.IsSupplier = 1  -- Ensure this account is also a supplier
      
                    UNION ALL
    
                    -- CONDITIONAL SUPPLIER DATA: Debit Transactions (Payments) - Only if customer is also a supplier
                    SELECT 
                        'Debit' AS Source,
                        ISNULL(SUM(CASE 
                            WHEN p.PurchaseType = 'Receipt' OR p.PurchaseType = 'Return Payment' THEN -p.Total
                            WHEN p.PurchaseType = 'Payment' OR p.PurchaseType = 'Return Receipt' THEN p.Total
                        END), 0) AS OpeningBalance
                    FROM tblPaymentHead p
                    INNER JOIN tblCustomerSupplier cs ON p.SupplierAccountCode = cs.AccountCode AND p.CompanyID = cs.CompanyID
                    WHERE p.Date < @startDate
                      AND p.CompanyID = @CompanyID
                      AND p.IsActive = 1
                      AND (@includeAllCustomers = 1 OR p.SupplierAccountCode = @customerAccountCode)
                      AND cs.IsCustomer = 1  -- Ensure this account is also a customer
                      AND cs.IsSupplier = 1  -- Ensure this account is also a supplier
      
                ) AS CombinedResults
                GROUP BY Source;";

                    SqlCommand openingBalanceCommand = new SqlCommand(openingBalanceQuery, connection);
                    openingBalanceCommand.Parameters.AddWithValue("@startDate", startDate.Value.ToString("yyyy-MM-dd"));
                    openingBalanceCommand.Parameters.AddWithValue("@CompanyID", CompanyID);
                    openingBalanceCommand.Parameters.AddWithValue("@customerAccountCode", (object)customerAccountCode ?? DBNull.Value);
                    openingBalanceCommand.Parameters.AddWithValue("@includeAllCustomers", includeAllCustomers ? 1 : 0);

                    List<(string Source, decimal OpeningBalance)> results = new List<(string, decimal)>();

                    using (var sqlDataReader = await openingBalanceCommand.ExecuteReaderAsync())
                    {
                        while (await sqlDataReader.ReadAsync())
                        {
                            string source = sqlDataReader["Source"].ToString();
                            decimal openingBalance = sqlDataReader["OpeningBalance"] != DBNull.Value
                                ? Convert.ToDecimal(sqlDataReader["OpeningBalance"])
                                : 0;

                            results.Add((source, openingBalance));
                        }
                    }

                    string query = @"
                                SELECT 
    r.Date,
    r.ReceiptType AS Details,
    r.CustomerName,
    r.RefNo,
    r.InComplete,
    COALESCE(CAST(CASE 
        WHEN r.ReceiptType = 'Receipt' THEN r.Total
        WHEN r.ReceiptType = 'Return Payment' THEN r.Total
    END AS DECIMAL(18, 2)), 0) AS Credit,
    r.VoucherNo,
    COALESCE(CAST(CASE 
        WHEN r.ReceiptType = 'Payment' THEN r.Total
        WHEN r.ReceiptType = 'Return Receipt' THEN r.Total
    END AS DECIMAL(18, 2)), 0) AS Debit,
    0 AS Balance -- Placeholder, will be calculated later
FROM tblReceiptHead r
WHERE r.Date BETWEEN @startDate AND @endDate
  AND r.CompanyID = @CompanyID
  AND r.IsActive = 1
  AND (@includeAllCustomers = 1 OR r.CustomerAccountCode = @customerAccountCode)

UNION ALL

SELECT 
    s.Date, 
    s.SaleType AS Details, 
    s.CustomerName,
    s.DocNo AS RefNo,
    s.InComplete,
    COALESCE(CAST(CASE 
        WHEN s.SaleType = 'Credit' THEN s.Total
    END AS DECIMAL(18, 2)), 0) AS Credit,
    s.InvoiceNo AS VoucherNo,
    COALESCE(CAST(CASE 
        WHEN s.SaleType = 'Invoice' THEN s.Total
    END AS DECIMAL(18, 2)), 0) AS Debit,
    COALESCE(CAST(s.Balance AS DECIMAL(18, 2)), 0) AS Balance -- Ensure consistent column structure
FROM tblSaleHead s
WHERE s.Date BETWEEN @startDate AND @endDate
  AND s.CompanyID = @CompanyID
  AND s.IsActive = 1
  AND (@includeAllCustomers = 1 OR s.CustomerAccountCode = @customerAccountCode)

UNION ALL

SELECT 
    s.Date, 
    'Journal Voucher' AS Details, 
    s.FromAccount AS CustomerName,
    s.RefNo AS RefNo,
    CAST(0 AS BIT) AS InComplete,
    COALESCE(CAST(s.Amount AS DECIMAL(18, 2)), 0) AS Credit,
    s.VoucherNo AS VoucherNo,
    0 AS Debit,
    0 AS Balance
FROM tblJournalVoucher s
INNER JOIN tblCustomerSupplier cs ON s.FromAccountCode = cs.AccountCode 
AND s.CompanyID = cs.CompanyID 
AND cs.IsCustomer = 1
WHERE s.Date BETWEEN @startDate AND @endDate
  AND s.CompanyID = @CompanyID
  AND s.IsActive = 1
  AND (@includeAllCustomers = 1 OR s.FromAccountCode = @customerAccountCode)

UNION ALL

SELECT 
    s.Date, 
    'Journal Voucher' AS Details, 
    s.ToAccount AS CustomerName,
    s.RefNo AS RefNo,
    CAST(0 AS BIT) AS InComplete,
    0 AS Credit ,
    s.VoucherNo AS VoucherNo,
    COALESCE(CAST(s.Amount AS DECIMAL(18, 2)), 0) AS Debit,
    0 AS Balance
FROM tblJournalVoucher s
INNER JOIN tblCustomerSupplier cs ON s.ToAccountCode = cs.AccountCode 
AND s.CompanyID = cs.CompanyID 
AND cs.IsCustomer = 1
WHERE s.Date BETWEEN @startDate AND @endDate
  AND s.CompanyID = @CompanyID
  AND s.IsActive = 1
  AND (@includeAllCustomers = 1 OR s.ToAccountCode = @customerAccountCode)

-- Supplier data - only included if customer is also a supplier
UNION ALL

SELECT 
    p.Date,
    p.PurchaseType AS Details,
    p.SupplierName AS CustomerName,
    p.RefNo,
    p.InComplete,
    COALESCE(CAST(CASE 
        WHEN p.PurchaseType = 'Receipt' THEN p.Total
        WHEN p.PurchaseType = 'Return Payment' THEN p.Total
    END AS DECIMAL(18, 2)), 0) AS Credit,
    p.VoucherNo,
    COALESCE(CAST(CASE 
        WHEN p.PurchaseType = 'Payment' THEN p.Total
        WHEN p.PurchaseType = 'Return Receipt' THEN p.Total
    END AS DECIMAL(18, 2)), 0) AS Debit,
    0 AS Balance -- Ensures consistent column structure
FROM tblPaymentHead p
INNER JOIN tblCustomerSupplier cs ON p.SupplierAccountCode = cs.AccountCode 
    AND p.CompanyID = cs.CompanyID 
    AND cs.IsCustomer = 1 -- Check if supplier is also a customer
WHERE p.Date BETWEEN @startDate AND @endDate
  AND p.CompanyID = @CompanyID
  AND p.IsActive = 1
  AND (@includeAllCustomers = 1 OR 
       (@includeAllCustomers = 0 AND p.SupplierAccountCode = @customerAccountCode))

UNION ALL

SELECT 
    s.Date, 
    s.PurchaseType AS Details, 
    s.SupplierName AS CustomerName,
    s.BillNumber AS RefNo,
    s.InComplete,
    COALESCE(CAST(CASE 
        WHEN s.PurchaseType = 'Bill' THEN s.Total
    END AS DECIMAL(18, 2)), 0) AS Credit,
    s.BillID AS VoucherNo,
    COALESCE(CAST(CASE 
        WHEN s.PurchaseType = 'Credit' THEN s.Total
    END AS DECIMAL(18, 2)), 0) AS Debit,
    COALESCE(CAST(s.Balance AS DECIMAL(18, 2)), 0) AS Balance -- Adds balance in the second query
FROM tblPurchaseHead s
INNER JOIN tblCustomerSupplier cs ON s.SupplierAccountCode = cs.AccountCode 
    AND s.CompanyID = cs.CompanyID 
    AND cs.IsCustomer = 1 -- Check if supplier is also a customer
WHERE s.Date BETWEEN @startDate AND @endDate
  AND s.CompanyID = @CompanyID
  AND s.IsActive = 1
  AND (@includeAllCustomers = 1 OR 
       (@includeAllCustomers = 0 AND s.SupplierAccountCode = @customerAccountCode))

ORDER BY Date;";

                    SqlCommand command = new SqlCommand(query, connection);
                    command.Parameters.AddWithValue("@startDate", startDate.Value.ToString("yyyy-MM-dd"));
                    command.Parameters.AddWithValue("@endDate", endDate.Value.ToString("yyyy-MM-dd"));
                    command.Parameters.AddWithValue("@CompanyID", CompanyID);
                    command.Parameters.AddWithValue("@customerAccountCode", (object)customerAccountCode ?? DBNull.Value);
                    command.Parameters.AddWithValue("@includeAllCustomers", includeAllCustomers ? 1 : 0);

                    SqlDataReader reader = await command.ExecuteReaderAsync();

                    decimal debitBalance = results.FirstOrDefault(r => r.Source == "Debit").OpeningBalance;
                    decimal creditBalance = results.FirstOrDefault(r => r.Source == "Credit").OpeningBalance;

                    var transactions = new List<CustomerTransaction>
                        {
                            // Prepend the opening balance to the result set
                            new CustomerTransaction
                            {
                                Date = startDate.Value,
                                Details = "Opening Balance",
                                CustomerName = "",
                                RefNo = null,
                                Credit = creditBalance,
                                Debit = debitBalance,
                                Balance = debitBalance - creditBalance,
                                DaysBalance = 0
                            }
                        };

                    decimal currentBalance = debitBalance - creditBalance;

                    while (await reader.ReadAsync())
                    {
                        decimal credit = reader.IsDBNull(5) ? 0 : reader.GetDecimal(5);
                        decimal debit = reader.IsDBNull(7) ? 0 : reader.GetDecimal(7);

                        currentBalance += credit - debit; // Update the running balance

                        transactions.Add(new CustomerTransaction
                        {
                            Date = reader.GetDateTime(0),
                            Details = reader.GetString(1),
                            CustomerName = reader.GetString(2),
                            RefNo = reader.IsDBNull(3) ? null : reader.GetValue(3).ToString(),
                            InComplete = reader.IsDBNull(4) ? false : reader.GetBoolean(4),
                            Credit = credit,
                            VoucherNo = reader.IsDBNull(6) ? null : reader.GetValue(6).ToString(),
                            Debit = debit,
                            Balance = currentBalance,
                            DaysBalance = reader.IsDBNull(8) ? 0 : reader.GetDecimal(8)
                        });
                    }

                    return Ok(new { Transactions = transactions, status_code = 1, status_message = "Successfully Returning list of customers.", CustomerName = transactions.First().CustomerName });
                }
            }
            catch (Exception ex)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong", error = ex.Message });
            }
        }

        [HttpGet("GetCustomerReportWithInvoiceDetail/{CompanyID}")]
        public async Task<IActionResult> GetCustomerReportWithInvoiceDetail(
         int CompanyID,
         string customerAccountCode = null,
         DateTime? startDate = null,
         DateTime? endDate = null,
         string period = null,
         bool includeAllCustomers = false)
        {
            DateTime now = DateTime.Now;
            try
            {
                if (period == "week")
                {
                    startDate = now.AddDays(-7);
                    endDate = now;
                }
                else if (period == "month")
                {
                    startDate = now.AddMonths(-1);
                    endDate = now;
                }
                else if (period == "last60Days")
                {
                    startDate = now.AddDays(-60);
                    endDate = now;
                }
                else if (period == "last30Days")
                {
                    startDate = now.AddDays(-30);
                    endDate = now;
                }
                else if (period == "last90Days")
                {
                    startDate = now.AddDays(-90);
                    endDate = now;
                }
                else if (period == "last365Days")
                {
                    startDate = now.AddDays(-365);
                    endDate = now;
                }
                else if (period == "year")
                {
                    startDate = new DateTime(now.Year, 1, 1);
                    endDate = now;
                }
                else if (period == "today")
                {
                    startDate = now.Date;
                    endDate = now.Date;
                }
                else if (period == "all")
                {
                    startDate = now.AddYears(-10);
                    endDate = now;
                }
                else if (period == "custom")
                {
                    if (startDate == null || endDate == null)
                    {
                        return Ok(new { status_message = "For 'custom' period, both startDate and endDate must be provided.", status_code = 0 });
                    }
                }

                var connectionString = context.Database.GetDbConnection().ConnectionString;

                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    await connection.OpenAsync();

                    // Get opening balance (same as before)
                    string openingBalanceQuery = @"
        SELECT 
            Source, 
            SUM(OpeningBalance) AS OpeningBalance
        FROM (
            -- Credit Transactions (Receipts)
            SELECT 
                'Credit' AS Source,
                SUM(COALESCE(CAST(CASE 
                    WHEN r.ReceiptType IN ('Receipt', 'Return Payment') THEN r.Total 
                END AS DECIMAL(18, 2)), 0)) 
                - 
                SUM(COALESCE(CAST(CASE 
                    WHEN r.ReceiptType IN ('Payment', 'Return Receipt') THEN r.Total
                END AS DECIMAL(18, 2)), 0)) AS OpeningBalance
            FROM tblReceiptHead r
            WHERE r.Date < @startDate
              AND r.CompanyID = @CompanyID
              AND r.IsActive = 1
              AND (@includeAllCustomers = 1 OR r.CustomerAccountCode = @customerAccountCode)

            UNION ALL

            -- Debit Transactions (Sales)
            SELECT 
                'Debit' AS Source,
                SUM(COALESCE(CAST(CASE 
                    WHEN s.SaleType = 'Invoice' THEN s.Total 
                END AS DECIMAL(18, 2)), 0)) 
                - 
                SUM(COALESCE(CAST(CASE 
                    WHEN s.SaleType = 'Credit' THEN s.Total
                END AS DECIMAL(18, 2)), 0)) AS OpeningBalance
            FROM tblSaleHead s
            WHERE s.Date < @startDate
              AND s.CompanyID = @CompanyID
              AND s.IsActive = 1
              AND (@includeAllCustomers = 1 OR s.CustomerAccountCode = @customerAccountCode)

            UNION ALL

            -- Journal Vouchers Credit
            SELECT 
                'Credit' AS Source,
                SUM(jv.Amount) AS OpeningBalance
            FROM tblJournalVoucher jv
            INNER JOIN tblCustomerSupplier cs ON jv.FromAccountCode = cs.AccountCode AND jv.CompanyID = cs.CompanyID AND cs.IsCustomer = 1
            WHERE jv.Date < @startDate
              AND jv.CompanyID = @CompanyID
              AND jv.IsActive = 1
              AND (@includeAllCustomers = 1 OR jv.FromAccountCode = @customerAccountCode)

            UNION ALL

            -- Journal Vouchers Debit
            SELECT 
                'Debit' AS Source,
                SUM(jv.Amount) AS OpeningBalance
            FROM tblJournalVoucher jv
            INNER JOIN tblCustomerSupplier cs ON jv.ToAccountCode = cs.AccountCode AND jv.CompanyID = cs.CompanyID AND cs.IsCustomer = 1
            WHERE jv.Date < @startDate
              AND jv.CompanyID = @CompanyID
              AND jv.IsActive = 1
              AND (@includeAllCustomers = 1 OR jv.ToAccountCode = @customerAccountCode)
        ) AS CombinedResults
        GROUP BY Source;";

                    SqlCommand openingBalanceCommand = new SqlCommand(openingBalanceQuery, connection);
                    openingBalanceCommand.Parameters.AddWithValue("@startDate", startDate.Value.ToString("yyyy-MM-dd"));
                    openingBalanceCommand.Parameters.AddWithValue("@CompanyID", CompanyID);
                    openingBalanceCommand.Parameters.AddWithValue("@customerAccountCode", (object)customerAccountCode ?? DBNull.Value);
                    openingBalanceCommand.Parameters.AddWithValue("@includeAllCustomers", includeAllCustomers ? 1 : 0);

                    List<(string Source, decimal OpeningBalance)> balanceResults = new List<(string, decimal)>();

                    using (var sqlDataReader = await openingBalanceCommand.ExecuteReaderAsync())
                    {
                        while (await sqlDataReader.ReadAsync())
                        {
                            string source = sqlDataReader["Source"].ToString();
                            decimal openingBalance = sqlDataReader["OpeningBalance"] != DBNull.Value
                                ? Convert.ToDecimal(sqlDataReader["OpeningBalance"])
                                : 0;

                            balanceResults.Add((source, openingBalance));
                        }
                    }

                    // Modified detailed transactions query to handle InvoiceNo = 0 properly
                    string transactionQuery = @"
        -- Sales Transactions with Invoice Items (only when InvoiceNo is not 0)
        SELECT 
            s.Date,
            s.InvoiceNo,
            s.DocNo,
            s.SaleType AS TransactionType,
            s.CustomerName,
            s.InComplete,
            COALESCE(CAST(CASE 
                WHEN s.SaleType = 'Invoice' THEN s.Total 
                WHEN s.SaleType = 'Credit' THEN -s.Total
            END AS DECIMAL(18, 2)), 0) AS Debit,
            0 AS Credit,
            'Invoice' AS SourceType,
            sd.Description,
            sd.Quantity,
            sd.Rate,
            (sd.Quantity * sd.Rate) AS Amount,
            s.ID as TransactionID
        FROM tblSaleHead s
        LEFT JOIN tblSaleBody sd 
            ON s.InvoiceNo = sd.InvoiceNo 
            AND s.CompanyID = sd.CompanyID
        WHERE 
            s.Date BETWEEN @startDate AND @endDate
            AND s.CompanyID = @CompanyID
            AND s.IsActive = 1
            AND (@includeAllCustomers = 1 OR s.CustomerAccountCode = @customerAccountCode)
            AND s.SaleType IN ('Invoice', 'Credit')
            AND s.InvoiceNo != 0 
            AND s.InvoiceNo IS NOT NULL

        UNION ALL

        -- Sales Transactions WITHOUT Items (when InvoiceNo is 0 or null)
        SELECT 
            s.Date,
            s.InvoiceNo,
            s.DocNo,
            s.SaleType AS TransactionType,
            s.CustomerName,
            s.InComplete,
            COALESCE(CAST(CASE 
                WHEN s.SaleType = 'Invoice' THEN s.Total 
                WHEN s.SaleType = 'Credit' THEN -s.Total
            END AS DECIMAL(18, 2)), 0) AS Debit,
            0 AS Credit,
            'Invoice' AS SourceType,
            s.SaleType AS Description,
            NULL AS Quantity,
            NULL AS Rate,
            NULL AS Amount,
            s.ID as TransactionID
        FROM tblSaleHead s
        WHERE 
            s.Date BETWEEN @startDate AND @endDate
            AND s.CompanyID = @CompanyID
            AND s.IsActive = 1
            AND (@includeAllCustomers = 1 OR s.CustomerAccountCode = @customerAccountCode)
            AND s.SaleType IN ('Invoice', 'Credit')
            AND (s.InvoiceNo = 0 OR s.InvoiceNo IS NULL)

        UNION ALL

        -- Receipt Transactions (No items, just transaction level)
        SELECT 
            r.Date,
            r.VoucherNo AS InvoiceNo,
            r.RefNo AS DocNo,
            r.ReceiptType AS TransactionType,
            r.CustomerName,
            r.InComplete,
            COALESCE(CAST(CASE 
                WHEN r.ReceiptType = 'Payment' THEN r.Total
                WHEN r.ReceiptType = 'Return Receipt' THEN r.Total
            END AS DECIMAL(18, 2)), 0) AS Debit,
            COALESCE(CAST(CASE 
                WHEN r.ReceiptType = 'Receipt' THEN r.Total
                WHEN r.ReceiptType = 'Return Payment' THEN r.Total
            END AS DECIMAL(18, 2)), 0) AS Credit,
            'Receipt' AS SourceType,
            r.ReceiptType AS Description,
            NULL AS Quantity,
            NULL AS Rate,
            NULL AS Amount,
            r.ID as TransactionID
        FROM tblReceiptHead r
        WHERE r.Date BETWEEN @startDate AND @endDate
          AND r.CompanyID = @CompanyID
          AND r.IsActive = 1
          AND (@includeAllCustomers = 1 OR r.CustomerAccountCode = @customerAccountCode)

        UNION ALL

        -- Journal Voucher Transactions
        SELECT 
            jv.Date,
            jv.VoucherNo AS InvoiceNo,
            jv.RefNo AS DocNo,
            'Journal Voucher' AS TransactionType,
            CASE 
                WHEN jv.FromAccountCode = @customerAccountCode OR @includeAllCustomers = 1 THEN jv.FromAccount
                ELSE jv.ToAccount
            END AS CustomerName,
            CAST(0 AS BIT) AS InComplete,
            CASE 
                WHEN jv.ToAccountCode = @customerAccountCode OR (@includeAllCustomers = 1 AND cs2.IsCustomer = 1) THEN jv.Amount
                ELSE 0
            END AS Debit,
            CASE 
                WHEN jv.FromAccountCode = @customerAccountCode OR (@includeAllCustomers = 1 AND cs1.IsCustomer = 1) THEN jv.Amount
                ELSE 0
            END AS Credit,
            'JournalVoucher' AS SourceType,
            'Journal Voucher' AS Description,
            NULL AS Quantity,
            NULL AS Rate,
            NULL AS Amount,
            jv.ID as TransactionID
        FROM tblJournalVoucher jv
        LEFT JOIN tblCustomerSupplier cs1 ON jv.FromAccountCode = cs1.AccountCode AND jv.CompanyID = cs1.CompanyID AND cs1.IsCustomer = 1
        LEFT JOIN tblCustomerSupplier cs2 ON jv.ToAccountCode = cs2.AccountCode AND jv.CompanyID = cs2.CompanyID AND cs2.IsCustomer = 1
        WHERE jv.Date BETWEEN @startDate AND @endDate
          AND jv.CompanyID = @CompanyID
          AND jv.IsActive = 1
          AND (
            (@includeAllCustomers = 1 AND (cs1.IsCustomer = 1 OR cs2.IsCustomer = 1)) OR
            (@includeAllCustomers = 0 AND (jv.FromAccountCode = @customerAccountCode OR jv.ToAccountCode = @customerAccountCode))
          )

        ORDER BY Date, TransactionID, SourceType;";

                    SqlCommand transactionCommand = new SqlCommand(transactionQuery, connection);
                    transactionCommand.Parameters.AddWithValue("@startDate", startDate.Value.ToString("yyyy-MM-dd"));
                    transactionCommand.Parameters.AddWithValue("@endDate", endDate.Value.ToString("yyyy-MM-dd"));
                    transactionCommand.Parameters.AddWithValue("@CompanyID", CompanyID);
                    transactionCommand.Parameters.AddWithValue("@customerAccountCode", (object)customerAccountCode ?? DBNull.Value);
                    transactionCommand.Parameters.AddWithValue("@includeAllCustomers", includeAllCustomers ? 1 : 0);

                    SqlDataReader reader = await transactionCommand.ExecuteReaderAsync();

                    decimal debitBalance = balanceResults.FirstOrDefault(r => r.Source == "Debit").OpeningBalance;
                    decimal creditBalance = balanceResults.FirstOrDefault(r => r.Source == "Credit").OpeningBalance;

                    var transactions = new List<dynamic>();

                    // Add opening balance
                    transactions.Add(new
                    {
                        id = 0,
                        date = startDate.Value,
                        invoiceNo = "",
                        docNo = "",
                        details = "Opening Balance",
                        customerName = "",
                        inComplete = false,
                        credit = creditBalance,
                        debit = debitBalance,
                        balance = debitBalance - creditBalance,
                        isOpeningBalance = true,
                        items = new List<object>()
                    });

                    var currentTransactionId = -1;
                    dynamic currentTransaction = null;
                    var currentItems = new List<dynamic>();

                    while (await reader.ReadAsync())
                    {
                        var transactionId = reader.GetInt32("TransactionID");
                        var sourceType = reader.GetString("SourceType");

                        if (transactionId != currentTransactionId)
                        {
                            // Save previous transaction
                            if (currentTransaction != null)
                            {
                                transactions.Add(new
                                {
                                    id = currentTransaction.id,
                                    date = currentTransaction.date,
                                    invoiceNo = currentTransaction.invoiceNo,
                                    docNo = currentTransaction.docNo,
                                    details = currentTransaction.details,
                                    customerName = currentTransaction.customerName,
                                    inComplete = currentTransaction.inComplete,
                                    credit = currentTransaction.credit,
                                    debit = currentTransaction.debit,
                                    balance = 0, // Will be calculated in frontend
                                    isOpeningBalance = false,
                                    items = currentItems.ToList()
                                });
                            }

                            // Start new transaction
                            currentTransactionId = transactionId;
                            currentItems = new List<dynamic>();

                            currentTransaction = new
                            {
                                id = transactionId,
                                date = reader.GetDateTime("Date"),
                                invoiceNo = reader.IsDBNull("InvoiceNo") ? "" : reader["InvoiceNo"].ToString(),
                                docNo = reader.IsDBNull("DocNo") ? "" : reader["DocNo"].ToString(),
                                details = reader.GetString("TransactionType"),
                                customerName = reader.IsDBNull("CustomerName") ? "" : reader["CustomerName"].ToString(),
                                inComplete = reader.IsDBNull("InComplete") ? false : reader.GetBoolean("InComplete"),
                                credit = reader.IsDBNull("Credit") ? 0 : reader.GetDecimal("Credit"),
                                debit = reader.IsDBNull("Debit") ? 0 : reader.GetDecimal("Debit")
                            };
                        }

                        // Add item if it's an invoice with items (and InvoiceNo is not 0)
                        if (sourceType == "Invoice" && !reader.IsDBNull("Description") &&
                            !reader.IsDBNull("InvoiceNo") && reader["InvoiceNo"].ToString() != "0")
                        {
                            currentItems.Add(new
                            {
                                description = reader.GetString("Description"),
                                quantity = reader.IsDBNull("Quantity") ? (decimal?)null : reader.GetDecimal("Quantity"),
                                rate = reader.IsDBNull("Rate") ? (decimal?)null : reader.GetDecimal("Rate"),
                                amount = reader.IsDBNull("Amount") ? (decimal?)null : reader.GetDecimal("Amount")
                            });
                        }
                    }

                    // Don't forget the last transaction
                    if (currentTransaction != null)
                    {
                        transactions.Add(new
                        {
                            id = currentTransaction.id,
                            date = currentTransaction.date,
                            invoiceNo = currentTransaction.invoiceNo,
                            docNo = currentTransaction.docNo,
                            details = currentTransaction.details,
                            customerName = currentTransaction.customerName,
                            inComplete = currentTransaction.inComplete,
                            credit = currentTransaction.credit,
                            debit = currentTransaction.debit,
                            balance = 0,
                            isOpeningBalance = false,
                            items = currentItems.ToList()
                        });
                    }

                    return Ok(new
                    {
                        data = transactions,
                        status_code = 1,
                        status_message = "Successfully retrieved customer report with invoice detail.",
                        customerName = transactions.Count > 1 ? transactions[1].customerName : ""
                    });
                }
            }
            catch (Exception ex)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong", error = ex.Message });
            }
        }

        [HttpGet("GetSupplierReportBy/{CompanyID}")]
        public async Task<IActionResult> GetSupplierTransactions(
             int CompanyID,
             string supplierAccountCode = null,
             DateTime? startDate = null,
             DateTime? endDate = null,
             string period = null,
             bool includeAllSuppliers = false)
        {
            DateTime now = DateTime.Now;
            try
            {

                if (period == "week")
                {
                    startDate = now.AddDays(-7);
                    endDate = now;
                }
                else if (period == "month")
                {
                    startDate = now.AddMonths(-1);
                    endDate = now;
                }
                else if (period == "last60Days")
                {
                    startDate = now.AddDays(-60);
                    endDate = now;
                }
                else if (period == "last30Days")
                {
                    startDate = now.AddDays(-30);
                    endDate = now;
                }
                else if (period == "last90Days")
                {
                    startDate = now.AddDays(-90);
                    endDate = now;
                }
                else if (period == "last365Days")
                {
                    startDate = now.AddDays(-365);
                    endDate = now;
                }
                else if (period == "year")
                {
                    startDate = new DateTime(now.Year, 1, 1);
                    endDate = now;
                }
                else if (period == "today")
                {
                    startDate = now.Date;
                    endDate = now.Date;
                }
                else if (period == "all")
                {
                    startDate = now.AddYears(-10);
                    endDate = now;
                }
                else if (period == "custom")
                {
                    // Use provided startDate and endDate
                    if (startDate == null || endDate == null)
                    {
                        return Ok(new { status_message = "For 'custom' period, both startDate and endDate must be provided.", status_code = 0 });
                    }
                }
                else
                {

                    startDate = now;
                    endDate = now;
                }


                var connectionString = context.Database.GetDbConnection().ConnectionString;


                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    await connection.OpenAsync();


                    string openingBalanceQuery = @"SELECT 
                                                Source, 
                                                SUM(OpeningBalance) AS OpeningBalance
                                            FROM (
    
	                                            SELECT 
                                                'Credit' AS Source,
                                                ISNULL(SUM(CASE 
                                                    WHEN s.PurchaseType = 'Bill' THEN s.Total
                                                    WHEN s.PurchaseType = 'Credit' THEN -s.Total
                                                END), 0) AS OpeningBalance
                                            FROM tblPurchaseHead s
                                            WHERE s.Date < @startDate
                                              AND s.CompanyID = @CompanyID
                                              AND s.IsActive = 1
                                              AND (@includeAllSuppliers = 1 OR s.SupplierAccountCode = @supplierAccountCode)
    
                                                UNION ALL

                                               SELECT 
                                                'Debit' AS Source,

												
             
        SUM(COALESCE(CAST(CASE 
            WHEN p.PurchaseType IN ('Payment', 'Return Receipt') THEN p.Total
        END AS DECIMAL(18, 2)), 0))
		- 
		SUM(COALESCE(CAST(CASE 
		WHEN p.PurchaseType IN ('Receipt', 'Return Payment') THEN p.Total 
        END AS DECIMAL(18, 2)), 0))
		AS OpeningBalance

                                            FROM tblPaymentHead p
                                            WHERE p.Date < @startDate
                                              AND p.CompanyID = @CompanyID
                                              AND p.IsActive = 1
                                              AND (@includeAllSuppliers = 1 OR p.SupplierAccountCode = @supplierAccountCode)

                                                UNION ALL

                                                -- Debit Transactions (Journal Vouchers, filtered by Customers)
                                                SELECT 
                                                    'Credit' AS Source,
                                                    SUM(jv.Amount) AS OpeningBalance
                                                FROM tblJournalVoucher jv
                                                INNER JOIN tblCustomerSupplier cs ON jv.FromAccountCode = cs.AccountCode AND jv.CompanyID = cs.CompanyID AND cs.IsSupplier=1  
                                                WHERE jv.Date < @startDate
                                                  AND jv.CompanyID = @CompanyID
                                                  AND jv.IsActive = 1
                                                  AND (@includeAllSuppliers = 1 OR jv.FromAccountCode = @supplierAccountCode)

                                                UNION ALL

                                                -- Credit Transactions (Journal Vouchers, filtered by Customers)
                                                SELECT 
                                                    'Debit' AS Source,
                                                    SUM(jv.Amount) AS OpeningBalance
                                                FROM tblJournalVoucher jv
                                                INNER JOIN tblCustomerSupplier cs ON jv.ToAccountCode = cs.AccountCode AND jv.CompanyID = cs.CompanyID AND cs.IsSupplier=1  
                                                WHERE jv.Date < @startDate
                                                  AND jv.CompanyID = @CompanyID
                                                  AND jv.IsActive = 1
                                                  AND (@includeAllSuppliers = 1 OR jv.ToAccountCode = @supplierAccountCode)

												  UNION ALL

SELECT 
        'Debit' AS Source,
        SUM(COALESCE(CAST(CASE 
            WHEN s.SaleType = 'Invoice' THEN s.Total 
        END AS DECIMAL(18, 2)), 0)) 
        - 
        SUM(COALESCE(CAST(CASE 
            WHEN s.SaleType = 'Credit' THEN s.Total
        END AS DECIMAL(18, 2)), 0)) AS OpeningBalance
    FROM tblSaleHead s
	INNER JOIN tblCustomerSupplier cs ON s.CustomerAccountCode = cs.AccountCode AND s.CompanyID = cs.CompanyID
    WHERE s.Date < @startDate
      AND s.CompanyID = @CompanyID
      AND s.IsActive = 1
	  AND cs.IsCustomer = 1
	  AND cs.IsSupplier = 1
      AND (@includeAllSuppliers = 1 OR  s.CustomerAccountCode = @supplierAccountCode)

	  UNION ALL

	  SELECT 
        'Credit' AS Source,
        SUM(COALESCE(CAST(CASE 
            WHEN r.ReceiptType IN ('Receipt', 'Return Payment') THEN r.Total 
        END AS DECIMAL(18, 2)), 0)) 
        - 
        SUM(COALESCE(CAST(CASE 
            WHEN r.ReceiptType IN ('Payment', 'Return Receipt') THEN r.Total
        END AS DECIMAL(18, 2)), 0)) AS OpeningBalance
    FROM tblReceiptHead r
	INNER JOIN tblCustomerSupplier cs ON r.CustomerAccountCode = cs.AccountCode AND r.CompanyID = cs.CompanyID
    WHERE r.Date < @startDate
      AND r.CompanyID = @CompanyID
      AND r.IsActive = 1
	  AND cs.IsCustomer = 1
	  AND cs.IsSupplier = 1
      AND (@includeAllSuppliers = 1 OR  r.CustomerAccountCode = @supplierAccountCode)
												  
                                            ) AS CombinedResults
                                            GROUP BY Source;";

                    SqlCommand openingBalanceCommand = new SqlCommand(openingBalanceQuery, connection);
                    openingBalanceCommand.Parameters.AddWithValue("@startDate", startDate.Value.ToString("yyyy-MM-dd"));
                    openingBalanceCommand.Parameters.AddWithValue("@CompanyID", CompanyID);
                    openingBalanceCommand.Parameters.AddWithValue("@supplierAccountCode", (object)supplierAccountCode ?? DBNull.Value);
                    openingBalanceCommand.Parameters.AddWithValue("@includeAllSuppliers", includeAllSuppliers ? 1 : 0);

                    List<(string Source, decimal OpeningBalance)> results = new List<(string, decimal)>();

                    using (var sqlDataReader = await openingBalanceCommand.ExecuteReaderAsync())
                    {
                        while (await sqlDataReader.ReadAsync())
                        {
                            string source = sqlDataReader["Source"].ToString();
                            decimal openingBalance = sqlDataReader["OpeningBalance"] != DBNull.Value
                                ? Convert.ToDecimal(sqlDataReader["OpeningBalance"])
                                : 0;

                            results.Add((source, openingBalance));
                        }
                    }

                    // Step 2: Fetch transactions in the selected date range
                    string transactionsQuery = @"
                                                SELECT 
                                                    p.Date,
                                                    p.PurchaseType AS Details,
                                                    p.SupplierName,
                                                    p.RefNo,
                                                    p.InComplete,
                                                    CASE 
                                                    WHEN p.PurchaseType = 'Receipt' THEN p.Total
                                                    WHEN p.PurchaseType = 'Return Payment ' THEN p.Total
                                                    END AS Credit,
                                                    p.VoucherNo,
                                                    CASE 
                                                    WHEN p.PurchaseType = 'Payment' THEN p.Total
                                                    WHEN p.PurchaseType = 'Return Receipt ' THEN p.Total
                                                    END AS Debit,
                                                    NULL AS Balance -- Ensures consistent column structure
                                                FROM tblPaymentHead p
                                                WHERE p.Date BETWEEN @startDate AND @endDate
                                                  AND p.CompanyID = @CompanyID
                                                  AND p.IsActive = 1
                                                  AND (@includeAllSuppliers = 1 OR  p.SupplierAccountCode = @supplierAccountCode)

                                                UNION ALL

                                                SELECT 
                                                    s.Date, 
                                                    s.PurchaseType AS Details, 
                                                    s.SupplierName,
                                                    s.BillNumber AS RefNo,
                                                    s.InComplete,
                                                    CASE 
                                                    WHEN s.PurchaseType = 'Bill' THEN s.Total
                                                    END AS Credit,
                                                    s.BillID AS VoucherNo,
                                                    CASE 
                                                    WHEN s.PurchaseType = 'Credit' THEN s.Total
                                                    END AS Debit,
                                                    s.Balance -- Adds balance in the second query
                                                FROM tblPurchaseHead s
                                                WHERE s.Date BETWEEN @startDate AND @endDate
                                                  AND s.CompanyID = @CompanyID
                                                  AND s.IsActive = 1
                                                  AND (@includeAllSuppliers = 1 OR  s.SupplierAccountCode = @supplierAccountCode)

                                                  union all

                                                  SELECT 
                                                    s.Date, 
                                                    'Journal Voucher' AS Details, 
                                                    s.FromAccount AS CustomerName,
                                                    s.RefNo AS RefNo,
                                                    CAST(0 AS BIT) AS InComplete,
                                                    COALESCE(CAST(s.Amount AS DECIMAL(18, 2)), 0) AS Credit,
                                                    s.VoucherNo AS VoucherNo,
                                                    0 AS Debit,


                                                    0 AS Balance
                                                FROM tblJournalVoucher s
                                                INNER JOIN tblCustomerSupplier cs ON s.FromAccountCode = cs.AccountCode 
                                                    AND s.CompanyID = cs.CompanyID 
                                                    AND cs.IsSupplier = 1
                                                WHERE s.Date BETWEEN @startDate AND @endDate
                                                  AND s.CompanyID = @CompanyID
                                                  AND s.IsActive = 1
                                                  AND (@includeAllSuppliers = 1 OR  s.FromAccountCode = @supplierAccountCode)

                                                UNION ALL

                                                SELECT 
                                                    s.Date, 
                                                    'Journal Voucher' AS Details, 
                                                    s.ToAccount AS CustomerName,
                                                    s.RefNo AS RefNo,
                                                    CAST(0 AS BIT) AS InComplete,
                                                    0 AS Credit,

                                                    s.VoucherNo AS VoucherNo,

                                                    COALESCE(CAST(s.Amount AS DECIMAL(18, 2)), 0) AS Debit,

                                                    0 AS Balance
                                                FROM tblJournalVoucher s
                                                INNER JOIN tblCustomerSupplier cs ON s.ToAccountCode = cs.AccountCode 
                                                    AND s.CompanyID = cs.CompanyID 
                                                    AND cs.IsSupplier = 1
                                                WHERE s.Date BETWEEN @startDate AND @endDate
                                                  AND s.CompanyID = @CompanyID
                                                  AND s.IsActive = 1
                                                  AND (@includeAllSuppliers = 1 OR  s.ToAccountCode = @supplierAccountCode)


                                                UNION ALL

                                                SELECT 
                                                    r.Date,
                                                    r.ReceiptType AS Details,
                                                    r.CustomerName,
                                                    r.RefNo,
                                                    r.InComplete,
                                                    COALESCE(CAST(CASE 
                                                        WHEN r.ReceiptType = 'Receipt' THEN r.Total
                                                        WHEN r.ReceiptType = 'Return Payment' THEN r.Total
                                                    END AS DECIMAL(18, 2)), 0) AS Credit,
                                                    r.VoucherNo,
                                                    COALESCE(CAST(CASE 
                                                        WHEN r.ReceiptType = 'Payment' THEN r.Total
                                                        WHEN r.ReceiptType = 'Return Receipt' THEN r.Total
                                                    END AS DECIMAL(18, 2)), 0) AS Debit,
                                                    0 AS Balance -- Placeholder, will be calculated later
                                                FROM tblReceiptHead r
                                                INNER JOIN tblCustomerSupplier cs ON r.CustomerAccountCode= cs.AccountCode 
                                                    AND r.CompanyID = cs.CompanyID 
                                                    AND cs.IsSupplier = 1 -- Check if supplier is also a customer
                                                WHERE r.Date BETWEEN @startDate AND @endDate
                                                  AND r.CompanyID = @CompanyID
                                                  AND r.IsActive = 1
                                                  AND (@includeAllSuppliers = 1 OR r.CustomerAccountCode = @supplierAccountCode)

                                                UNION ALL

                                                SELECT 
                                                    s.Date, 
                                                    s.SaleType AS Details, 
                                                    s.CustomerName,
                                                    s.DocNo AS RefNo,
                                                    s.InComplete,
                                                    COALESCE(CAST(CASE 
                                                        WHEN s.SaleType = 'Credit' THEN s.Total
                                                    END AS DECIMAL(18, 2)), 0) AS Credit,
                                                    s.InvoiceNo AS VoucherNo,
                                                    COALESCE(CAST(CASE 
                                                        WHEN s.SaleType = 'Invoice' THEN s.Total
                                                    END AS DECIMAL(18, 2)), 0) AS Debit,
                                                    COALESCE(CAST(s.Balance AS DECIMAL(18, 2)), 0) AS Balance -- Ensure consistent column structure
                                                FROM tblSaleHead s
                                                INNER JOIN tblCustomerSupplier cs ON s.CustomerAccountCode= cs.AccountCode 
                                                    AND s.CompanyID = cs.CompanyID 
                                                    AND cs.IsSupplier = 1 -- Check if supplier is also a customer
                                                WHERE s.Date BETWEEN @startDate AND @endDate
                                                  AND s.CompanyID = @CompanyID
                                                  AND s.IsActive = 1
                                                  AND (@includeAllSuppliers = 1 OR s.CustomerAccountCode = @supplierAccountCode)
                                                ORDER BY Date;";

                    SqlCommand transactionsCommand = new SqlCommand(transactionsQuery, connection);
                    transactionsCommand.Parameters.AddWithValue("@startDate", startDate.Value.ToString("yyyy-MM-dd"));
                    transactionsCommand.Parameters.AddWithValue("@endDate", endDate.Value.ToString("yyyy-MM-dd"));
                    transactionsCommand.Parameters.AddWithValue("@CompanyID", CompanyID);
                    transactionsCommand.Parameters.AddWithValue("@supplierAccountCode", (object)supplierAccountCode ?? DBNull.Value);
                    transactionsCommand.Parameters.AddWithValue("@includeAllSuppliers", includeAllSuppliers ? 1 : 0);

                    SqlDataReader reader = await transactionsCommand.ExecuteReaderAsync();

                    var transactions = new List<SupplierTransaction>();

                    while (await reader.ReadAsync())
                    {
                        transactions.Add(new SupplierTransaction
                        {
                            Date = reader.GetDateTime(0),
                            Details = reader.GetString(1),
                            SupplierName = reader.GetString(2),
                            RefNo = reader.IsDBNull(3) ? null : reader.GetValue(3).ToString(),
                            InComplete = reader.IsDBNull(4) ? false : reader.GetBoolean(4),
                            Credit = reader.IsDBNull(5) ? (decimal?)0 : reader.GetDecimal(5),
                            VoucherNo = reader.IsDBNull(6) ? null : reader.GetValue(6).ToString(),
                            Debit = reader.IsDBNull(7) ? (decimal?)0 : reader.GetDecimal(7),
                            Balance = reader.IsDBNull(8) ? (decimal?)0 : reader.GetDecimal(8),
                            DaysBalance = reader.IsDBNull(8) ? (decimal?)0 : reader.GetDecimal(8),

                        });
                    }

                    decimal debitBalance = results.FirstOrDefault(r => r.Source == "Debit").OpeningBalance;
                    decimal creditBalance = results.FirstOrDefault(r => r.Source == "Credit").OpeningBalance;



                    decimal currentBalance = creditBalance - debitBalance;

                    var openingTransaction = new SupplierTransaction
                    {
                        Date = startDate.Value,
                        Details = "Opening Balance",
                        SupplierName = "",
                        RefNo = null,
                        Credit = creditBalance,
                        Debit = Math.Abs(debitBalance),
                        Balance = creditBalance + debitBalance,
                        DaysBalance = 0
                    };

                    transactions.Insert(0, openingTransaction);

                    return Ok(transactions);
                }
            }
            catch (Exception ex)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong", error = ex.Message });

            }
        }

        [HttpGet("GetSupplierReportWithBillDetail/{CompanyID}")]
        public async Task<IActionResult> GetSupplierReportWithBillDetail(
          int CompanyID,
          string supplierAccountCode = null,
          DateTime? startDate = null,
          DateTime? endDate = null,
          string period = null,
          bool includeAllSuppliers = false)
        {
            DateTime now = DateTime.Now;
            try
            {
                // Same date range handling as before
                if (period == "week") { startDate = now.AddDays(-7); endDate = now; }
                else if (period == "month") { startDate = now.AddMonths(-1); endDate = now; }
                else if (period == "last60Days") { startDate = now.AddDays(-60); endDate = now; }
                else if (period == "last30Days") { startDate = now.AddDays(-30); endDate = now; }
                else if (period == "last90Days") { startDate = now.AddDays(-90); endDate = now; }
                else if (period == "last365Days") { startDate = now.AddDays(-365); endDate = now; }
                else if (period == "year") { startDate = new DateTime(now.Year, 1, 1); endDate = now; }
                else if (period == "today") { startDate = now.Date; endDate = now.Date; }
                else if (period == "all") { startDate = now.AddYears(-10); endDate = now; }
                else if (period == "custom" && (startDate == null || endDate == null))
                {
                    return Ok(new { status_message = "For 'custom' period, both startDate and endDate must be provided.", status_code = 0 });
                }

                var connectionString = context.Database.GetDbConnection().ConnectionString;
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    await connection.OpenAsync();

                    // Opening balance for suppliers
                    string openingBalanceQuery = @"
SELECT Source, SUM(OpeningBalance) AS OpeningBalance FROM (
    -- Debit: Payments made to supplier
    SELECT 'Debit' AS Source,
           SUM(CASE WHEN p.PurchaseType IN ('Payment', 'Return Receipt') THEN p.Total ELSE 0 END)
         - SUM(CASE WHEN p.PurchaseType IN ('Receipt', 'Return Payment') THEN p.Total ELSE 0 END) AS OpeningBalance
    FROM tblPaymentHead p
    WHERE p.Date < @startDate AND p.CompanyID = @CompanyID AND p.IsActive = 1
      AND (@includeAllSuppliers = 1 OR p.SupplierAccountCode = @supplierAccountCode)

    UNION ALL

    -- Credit: Purchases and returns
    SELECT 'Credit' AS Source,
           SUM(CASE WHEN ph.PurchaseType = 'Bill' THEN ph.Total ELSE 0 END)
         - SUM(CASE WHEN ph.PurchaseType = 'Return' THEN ph.Total ELSE 0 END) AS OpeningBalance
    FROM tblPurchaseHead ph
    WHERE ph.Date < @startDate AND ph.CompanyID = @CompanyID AND ph.IsActive = 1
      AND (@includeAllSuppliers = 1 OR ph.SupplierAccountCode = @supplierAccountCode)

    UNION ALL

    -- Journal Vouchers Debit
    SELECT 'Debit' AS Source, SUM(jv.Amount) AS OpeningBalance
    FROM tblJournalVoucher jv
    INNER JOIN tblCustomerSupplier cs ON jv.ToAccountCode = cs.AccountCode AND jv.CompanyID = cs.CompanyID AND cs.IsSupplier = 1
    WHERE jv.Date < @startDate AND jv.CompanyID = @CompanyID AND jv.IsActive = 1
      AND (@includeAllSuppliers = 1 OR jv.ToAccountCode = @supplierAccountCode)

    UNION ALL

    -- Journal Vouchers Credit
    SELECT 'Credit' AS Source, SUM(jv.Amount) AS OpeningBalance
    FROM tblJournalVoucher jv
    INNER JOIN tblCustomerSupplier cs ON jv.FromAccountCode = cs.AccountCode AND jv.CompanyID = cs.CompanyID AND cs.IsSupplier = 1
    WHERE jv.Date < @startDate AND jv.CompanyID = @CompanyID AND jv.IsActive = 1
      AND (@includeAllSuppliers = 1 OR jv.FromAccountCode = @supplierAccountCode)
) AS OpeningData
GROUP BY Source;";

                    SqlCommand openingBalanceCommand = new SqlCommand(openingBalanceQuery, connection);
                    openingBalanceCommand.Parameters.AddWithValue("@startDate", startDate.Value.ToString("yyyy-MM-dd"));
                    openingBalanceCommand.Parameters.AddWithValue("@CompanyID", CompanyID);
                    openingBalanceCommand.Parameters.AddWithValue("@supplierAccountCode", (object)supplierAccountCode ?? DBNull.Value);
                    openingBalanceCommand.Parameters.AddWithValue("@includeAllSuppliers", includeAllSuppliers ? 1 : 0);

                    List<(string Source, decimal OpeningBalance)> balanceResults = new List<(string, decimal)>();
                    using (var sqlDataReader = await openingBalanceCommand.ExecuteReaderAsync())
                    {
                        while (await sqlDataReader.ReadAsync())
                        {
                            balanceResults.Add((
                                sqlDataReader["Source"].ToString(),
                                sqlDataReader["OpeningBalance"] != DBNull.Value ? Convert.ToDecimal(sqlDataReader["OpeningBalance"]) : 0
                            ));
                        }
                    }

                    // Modified transactions query to handle BillID = 0 properly
                    string transactionQuery = @"
-- Purchase Bills WITH Items (only when BillID is not 0)
SELECT 
    ph.Date, ph.BillID AS InvoiceNo, ph.BillNumber AS DocNo, ph.PurchaseType AS TransactionType,
    ph.SupplierName AS SupplierName, ph.InComplete,
    CASE WHEN ph.PurchaseType = 'Bill' THEN ph.Total ELSE 0 END AS Credit,
    CASE WHEN ph.PurchaseType = 'Credit' THEN ph.Total ELSE 0 END AS Debit,
    'Bill' AS SourceType,
    pb.Description, pb.Quantity, pb.Rate, (pb.Quantity * pb.Rate) AS Amount,
    ph.ID AS TransactionID
FROM tblPurchaseHead ph
LEFT JOIN tblPurchaseBody pb ON ph.BillID = pb.BillID AND ph.CompanyID = pb.CompanyID
WHERE ph.Date BETWEEN @startDate AND @endDate
  AND ph.CompanyID = @CompanyID AND ph.IsActive = 1
  AND (@includeAllSuppliers = 1 OR ph.SupplierAccountCode = @supplierAccountCode)
  AND ph.BillID != 0 
  AND ph.BillID IS NOT NULL

UNION ALL

-- Purchase Bills WITHOUT Items (when BillID is 0 or null)
SELECT 
    ph.Date, ph.BillID AS InvoiceNo, ph.BillNumber AS DocNo, ph.PurchaseType AS TransactionType,
    ph.SupplierName AS SupplierName, ph.InComplete,
    CASE WHEN ph.PurchaseType = 'Bill' THEN ph.Total ELSE 0 END AS Credit,
    CASE WHEN ph.PurchaseType = 'Credit' THEN ph.Total ELSE 0 END AS Debit,
    'Bill' AS SourceType,
    ph.PurchaseType AS Description, NULL AS Quantity, NULL AS Rate, NULL AS Amount,
    ph.ID AS TransactionID
FROM tblPurchaseHead ph
WHERE ph.Date BETWEEN @startDate AND @endDate
  AND ph.CompanyID = @CompanyID AND ph.IsActive = 1
  AND (@includeAllSuppliers = 1 OR ph.SupplierAccountCode = @supplierAccountCode)
  AND (ph.BillID = 0 OR ph.BillID IS NULL)

UNION ALL

-- Payments
SELECT 
    p.Date, p.VoucherNo AS InvoiceNo, p.RefNo AS DocNo, p.PurchaseType AS TransactionType,
    p.SupplierName AS SupplierName, p.InComplete,
    CASE
    WHEN p.PurchaseType = 'Receipt' THEN p.Total
    WHEN p.PurchaseType = 'Return Payment ' THEN p.Total
    END AS Credit,
    CASE 
    WHEN p.PurchaseType = 'Payment' THEN p.Total
    WHEN p.PurchaseType = 'Return Receipt ' THEN p.Total
    END AS Debit,
    'Payment' AS SourceType,
    p.PurchaseType AS Description, NULL, NULL, NULL,
    p.ID AS TransactionID
FROM tblPaymentHead p
WHERE p.Date BETWEEN @startDate AND @endDate
  AND p.CompanyID = @CompanyID AND p.IsActive = 1
  AND (@includeAllSuppliers = 1 OR p.SupplierAccountCode = @supplierAccountCode)

UNION ALL

-- Journal Vouchers
SELECT 
    jv.Date, jv.VoucherNo AS InvoiceNo, jv.RefNo AS DocNo,
    'Journal Voucher' AS TransactionType,
    CASE 
        WHEN jv.FromAccountCode = @supplierAccountCode OR @includeAllSuppliers = 1 THEN jv.FromAccount
        ELSE jv.ToAccount
    END AS SupplierName,
    CAST(0 AS BIT) AS InComplete,
    CASE 
        WHEN jv.ToAccountCode = @supplierAccountCode OR (@includeAllSuppliers = 1 AND cs2.IsSupplier = 1) THEN jv.Amount ELSE 0 END AS Debit,
    CASE 
        WHEN jv.FromAccountCode = @supplierAccountCode OR (@includeAllSuppliers = 1 AND cs1.IsSupplier = 1) THEN jv.Amount ELSE 0 END AS Credit,
    'JournalVoucher' AS SourceType,
    'Journal Voucher' AS Description, NULL, NULL, NULL,
    jv.ID AS TransactionID
FROM tblJournalVoucher jv
LEFT JOIN tblCustomerSupplier cs1 ON jv.FromAccountCode = cs1.AccountCode AND jv.CompanyID = cs1.CompanyID AND cs1.IsSupplier = 1
LEFT JOIN tblCustomerSupplier cs2 ON jv.ToAccountCode = cs2.AccountCode AND jv.CompanyID = cs2.CompanyID AND cs2.IsSupplier = 1
WHERE jv.Date BETWEEN @startDate AND @endDate
  AND jv.CompanyID = @CompanyID AND jv.IsActive = 1
  AND (
        (@includeAllSuppliers = 1 AND (cs1.IsSupplier = 1 OR cs2.IsSupplier = 1)) OR
        (@includeAllSuppliers = 0 AND (jv.FromAccountCode = @supplierAccountCode OR jv.ToAccountCode = @supplierAccountCode))
    )
ORDER BY Date, TransactionID, SourceType;";

                    SqlCommand transactionCommand = new SqlCommand(transactionQuery, connection);
                    transactionCommand.Parameters.AddWithValue("@startDate", startDate.Value.ToString("yyyy-MM-dd"));
                    transactionCommand.Parameters.AddWithValue("@endDate", endDate.Value.ToString("yyyy-MM-dd"));
                    transactionCommand.Parameters.AddWithValue("@CompanyID", CompanyID);
                    transactionCommand.Parameters.AddWithValue("@supplierAccountCode", (object)supplierAccountCode ?? DBNull.Value);
                    transactionCommand.Parameters.AddWithValue("@includeAllSuppliers", includeAllSuppliers ? 1 : 0);

                    SqlDataReader reader = await transactionCommand.ExecuteReaderAsync();

                    decimal debitBalance = balanceResults.FirstOrDefault(r => r.Source == "Debit").OpeningBalance;
                    decimal creditBalance = balanceResults.FirstOrDefault(r => r.Source == "Credit").OpeningBalance;

                    var transactions = new List<dynamic>();

                    transactions.Add(new
                    {
                        id = 0,
                        date = startDate.Value,
                        invoiceNo = "",
                        docNo = "",
                        details = "Opening Balance",
                        supplierName = "",
                        inComplete = false,
                        credit = creditBalance,
                        debit = debitBalance,
                        balance = debitBalance - creditBalance,
                        isOpeningBalance = true,
                        items = new List<object>()
                    });

                    var currentTransactionId = -1;
                    dynamic currentTransaction = null;
                    var currentItems = new List<dynamic>();

                    while (await reader.ReadAsync())
                    {
                        var transactionId = reader.GetInt32("TransactionID");
                        var sourceType = reader.GetString("SourceType");

                        if (transactionId != currentTransactionId)
                        {
                            if (currentTransaction != null)
                            {
                                transactions.Add(new
                                {
                                    id = currentTransaction.id,
                                    date = currentTransaction.date,
                                    invoiceNo = currentTransaction.invoiceNo,
                                    docNo = currentTransaction.docNo,
                                    details = currentTransaction.details,
                                    supplierName = currentTransaction.supplierName,
                                    inComplete = currentTransaction.inComplete,
                                    credit = currentTransaction.credit,
                                    debit = currentTransaction.debit,
                                    balance = 0,
                                    isOpeningBalance = false,
                                    items = currentItems.ToList()
                                });
                            }

                            currentTransactionId = transactionId;
                            currentItems = new List<dynamic>();

                            currentTransaction = new
                            {
                                id = transactionId,
                                date = reader.GetDateTime("Date"),
                                invoiceNo = reader["InvoiceNo"].ToString(),
                                docNo = reader["DocNo"].ToString(),
                                details = reader["TransactionType"].ToString(),
                                supplierName = reader["SupplierName"].ToString(),
                                inComplete = reader.IsDBNull("InComplete") ? false : reader.GetBoolean("InComplete"),
                                credit = reader.IsDBNull("Credit") ? 0 : reader.GetDecimal("Credit"),
                                debit = reader.IsDBNull("Debit") ? 0 : reader.GetDecimal("Debit")
                            };
                        }

                        // Add item if it's a bill with items (and BillID is not 0)
                        if (sourceType == "Bill" && !reader.IsDBNull("Description") &&
                            !reader.IsDBNull("InvoiceNo") && reader["InvoiceNo"].ToString() != "0")
                        {
                            currentItems.Add(new
                            {
                                description = reader.GetString("Description"),
                                quantity = reader.IsDBNull("Quantity") ? (decimal?)null : reader.GetDecimal("Quantity"),
                                rate = reader.IsDBNull("Rate") ? (decimal?)null : reader.GetDecimal("Rate"),
                                amount = reader.IsDBNull("Amount") ? (decimal?)null : reader.GetDecimal("Amount")
                            });
                        }
                    }

                    if (currentTransaction != null)
                    {
                        transactions.Add(new
                        {
                            id = currentTransaction.id,
                            date = currentTransaction.date,
                            invoiceNo = currentTransaction.invoiceNo,
                            docNo = currentTransaction.docNo,
                            details = currentTransaction.details,
                            supplierName = currentTransaction.supplierName,
                            inComplete = currentTransaction.inComplete,
                            credit = currentTransaction.credit,
                            debit = currentTransaction.debit,
                            balance = 0,
                            isOpeningBalance = false,
                            items = currentItems.ToList()
                        });
                    }

                    return Ok(new
                    {
                        data = transactions,
                        status_code = 1,
                        status_message = "Successfully retrieved supplier report with bill detail.",
                        supplierName = transactions.Count > 1 ? transactions[1].supplierName : ""
                    });
                }
            }
            catch (Exception ex)
            {
                return Ok(new { status_code = 0, status_message = "Something went wrong", error = ex.Message });
            }
        }


        [HttpGet("GetProductReportBy/{CompanyID}")]
        public async Task<IActionResult> GetProductTransactions(
        int CompanyID,
        int productCode,
        DateTime? startDate = null,
        DateTime? endDate = null,
        string period = null,
        bool includeAllProducts = false)
        {
            DateTime now = DateTime.Now;
            try
            {
                if (period == "week")
                {
                    startDate = now.AddDays(-7);
                    endDate = now;
                }
                else if (period == "month")
                {
                    startDate = now.AddMonths(-1);
                    endDate = now;
                }
                else if (period == "last60Days")
                {
                    startDate = now.AddDays(-60);
                    endDate = now;
                }
                else if (period == "last30Days")
                {
                    startDate = now.AddDays(-30);
                    endDate = now;
                }
                else if (period == "last90Days")
                {
                    startDate = now.AddDays(-90);
                    endDate = now;
                }
                else if (period == "last365Days")
                {
                    startDate = now.AddDays(-365);
                    endDate = now;
                }
                else if (period == "year")
                {
                    startDate = new DateTime(now.Year, 1, 1);
                    endDate = now;
                }
                else if (period == "today")
                {
                    startDate = now.Date;
                    endDate = now.Date;
                }
                else if (period == "all")
                {
                    startDate = now.AddYears(-10);
                    endDate = now;
                }
                else if (period == "custom")
                {
                    if (startDate == null || endDate == null)
                    {
                        return Ok(new { status_message = "For 'custom' period, both startDate and endDate must be provided.", status_code = 0 });
                    }
                }
                else
                {
                    startDate = now;
                    endDate = now;
                }

                var connectionString = context.Database.GetConnectionString();
                if (string.IsNullOrWhiteSpace(connectionString))
                {
                    connectionString = context.Database.GetDbConnection().ConnectionString;
                }

                int? productID = null;
                if (!includeAllProducts)
                {
                    var product = await context.tblProducts.Where(p => p.Code == productCode && p.CompanyID == CompanyID && p.IsActive).FirstOrDefaultAsync();
                    if (product == null)
                    {
                        return Ok(new { status_code = 0, status_message = "Product not found or inactive." });
                    }

                    productID = product.ID;
                }

                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    await connection.OpenAsync();

                    // Calculate opening quantity from all transactions before startDate
                    string openingQuantityQuery = @"
                SELECT 
                    TransactionType,
                    SUM(Quantity) AS TotalQuantity,
                    SUM(Weight) AS TotalWeight,
                    SUM(Length) AS TotalLength,
                    DefaultUnit
                FROM (
                    -- Sales (OUT)
                    SELECT 
                        'Out' AS TransactionType,
                        -r.Quantity AS Quantity,
                        -r.Weight AS Weight,
                        -r.Length AS Length,
                        r.DefaultUnit
                    FROM tblSaleBody r
                    INNER JOIN tblSaleHead sh ON r.InvoiceNo = sh.InvoiceNo AND r.CompanyID = sh.CompanyID
                    WHERE sh.Date < @startDate
                      AND r.CompanyID = @CompanyID
                      AND r.InComplete = 0
                      AND r.IsActive = 1
                      AND r.InvoiceNo != 0
                      AND (@includeAllProducts = 1 OR r.ProductCode = @productCode)

                    UNION ALL

                    -- Purchases (IN)
                    SELECT 
                        'In' AS TransactionType,
                        p.Quantity AS Quantity,
                        p.Weight AS Weight,
                        p.Length AS Length,
                        p.DefaultUnit
                    FROM tblPurchaseBody p
                    INNER JOIN tblPurchaseHead ph ON p.BillID = ph.BillID AND p.CompanyID = ph.CompanyID
                    WHERE ph.Date < @startDate
                      AND p.CompanyID = @CompanyID
                      AND p.InComplete = 0
                      AND p.IsActive = 1
                      AND p.BillID != 0
                      AND (@includeAllProducts = 1 OR p.ProductCode = @productCode)

                    UNION ALL

                    -- Stock Adjustments
                    SELECT 
                        p.AdjustType AS TransactionType,
                        CASE 
                            WHEN p.AdjustType = 'In' THEN p.Quantity 
                            WHEN p.AdjustType = 'Out' THEN -p.Quantity
                            ELSE 0
                        END AS Quantity,
                        CASE 
                            WHEN p.AdjustType = 'In' THEN p.Weight 
                            WHEN p.AdjustType = 'Out' THEN -p.Weight
                            ELSE 0
                        END AS Weight,
                        CASE 
                            WHEN p.AdjustType = 'In' THEN p.Length 
                            WHEN p.AdjustType = 'Out' THEN -p.Length
                            ELSE 0
                        END AS Length,
                        p.DefaultUnit
                    FROM tblStockAdjustBody p
                    WHERE p.CreatedDate < @startDate
                      AND p.CompanyID = @CompanyID
                      AND p.IsActive = 1
                      AND p.InvoiceNo != 0
                      AND (@includeAllProducts = 1 OR p.ProductCode = @productCode)

                    UNION ALL

                    -- Assembly Out (Raw Materials)
                    SELECT 
                        'Out' AS TransactionType,
                        -p.QTYRequired AS Quantity,
                        0 AS Weight,
                        0 AS Length,
                        'Quantity' AS DefaultUnit
                    FROM tblRawMaterials p
                    WHERE p.CreatedDate < @startDate
                      AND p.CompanyID = @CompanyID
                      AND p.IsActive = 1
                      AND p.ReferenceID != 0
                      AND p.AssemblyType = 'Job'
                      AND (@includeAllProducts = 1 OR p.ProductID = @productID)

                    UNION ALL

                    -- Assembly Out (Non-Stock)
                    SELECT 
                        'Out' AS TransactionType,
                        -s.QTYRequired AS Quantity,
                        0 AS Weight,
                        0 AS Length,
                        'Quantity' AS DefaultUnit
                    FROM tblNonStock s
                    WHERE s.CreatedDate < @startDate
                      AND s.CompanyID = @CompanyID
                      AND s.IsActive = 1
                      AND s.ReferenceID != 0
                      AND s.AssemblyType = 'Job'
                      AND (@includeAllProducts = 1 OR s.ProductID = @productID)

                    UNION ALL

                    -- Assembly In (Finished Goods)
                    SELECT 
                        'In' AS TransactionType,
                        f.Quantity AS Quantity,
                        0 AS Weight,
                        0 AS Length,
                        'Quantity' AS DefaultUnit
                    FROM tblFinishedGoods f
                    WHERE f.CreatedDate < @startDate
                      AND f.CompanyID = @CompanyID
                      AND f.IsActive = 1
                      AND f.ReferenceID != 0
                      AND f.AssemblyType = 'Job'
                      AND (@includeAllProducts = 1 OR f.ProductID = @productID)

                    UNION ALL

                    -- Product Opening Quantity (only for single product)
                    SELECT 
                        'Opening' AS TransactionType,
                        COALESCE(p.BaseOpeningQuantity, 0) AS Quantity,
                        0 AS Weight,
                        0 AS Length,
                        p.DefaultUnit
                    FROM tblProducts p
                    WHERE p.CompanyID = @CompanyID
                      AND p.IsActive = 1
                      AND (@includeAllProducts = 0 AND p.Code = @productCode)
                ) AS AllTransactions
                GROUP BY TransactionType, DefaultUnit;";

                    SqlCommand openingQuantityCommand = new SqlCommand(openingQuantityQuery, connection);
                    openingQuantityCommand.Parameters.AddWithValue("@startDate", startDate.Value.ToString("yyyy-MM-dd"));
                    openingQuantityCommand.Parameters.AddWithValue("@CompanyID", CompanyID);
                    openingQuantityCommand.Parameters.AddWithValue("@productCode", (object)productCode ?? DBNull.Value);
                    openingQuantityCommand.Parameters.AddWithValue("@includeAllProducts", includeAllProducts ? 1 : 0);
                    openingQuantityCommand.Parameters.AddWithValue("@productID", (object)productID ?? DBNull.Value);

                    // Calculate opening balances
                    decimal openingQuantity = 0;
                    decimal openingWeight = 0;
                    decimal openingLength = 0;
                    string defaultUnit = null;

                    using (var reader = await openingQuantityCommand.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            openingQuantity += reader.IsDBNull(1) ? 0 : reader.GetDecimal(1);
                            openingWeight += reader.IsDBNull(2) ? 0 : reader.GetDecimal(2);
                            openingLength += reader.IsDBNull(3) ? 0 : reader.GetDecimal(3);
                            if (defaultUnit == null && !reader.IsDBNull(4))
                                defaultUnit = reader.GetString(4);
                        }
                    }

                    // Main transaction query
                    string query = @"
                SELECT 
                    sh.Date AS Date,
                    'Sale' AS Details,
                    r.Quantity As OutQuantity,
                    r.Weight As OutWeight,
                    r.Length As OutLength,
                    0 As InQuantity,
                    0 As InWeight,
                    0 As InLength,
                    r.DefaultUnit,
                    r.InvoiceNo AS VoucherNo,
                    0 AS Balance 
                FROM tblSaleBody r
                INNER JOIN tblSaleHead sh ON r.InvoiceNo = sh.InvoiceNo AND r.CompanyID = sh.CompanyID
                WHERE sh.Date BETWEEN @startDate AND @endDate
                  AND r.CompanyID = @CompanyID
                  AND r.InComplete = 0
                  AND r.IsActive = 1
                  AND r.InvoiceNo != 0
                  AND (@includeAllProducts = 1 OR r.ProductCode = @productCode)

                UNION ALL

                SELECT 
                    ph.Date AS Date,
                    'Purchase' AS Details,
                    0 As OutQuantity,
                    0 As OutWeight,
                    0 As OutLength,
                    p.Quantity As InQuantity,
                    p.Weight As InWeight,
                    p.Length As InLength,
                    p.DefaultUnit,
                    p.BillID AS VoucherNo,
                    0 AS Balance 
                FROM tblPurchaseBody p
                INNER JOIN tblPurchaseHead ph ON p.BillID = ph.BillID AND p.CompanyID = ph.CompanyID
                WHERE ph.Date BETWEEN @startDate AND @endDate
                  AND p.CompanyID = @CompanyID
                  AND p.InComplete = 0
                  AND p.IsActive = 1
                  AND p.BillID != 0
                  AND (@includeAllProducts = 1 OR p.ProductCode = @productCode)

                UNION ALL
                
                SELECT 
                    p.Date AS Date,
                    p.AdjustType AS Details, 
                    CASE 
                        WHEN p.AdjustType = 'Out' THEN p.Quantity 
                        ELSE 0 
                    END AS OutQuantity,
                    CASE 
                        WHEN p.AdjustType = 'Out' THEN p.Weight 
                        ELSE 0 
                    END AS OutWeight,
                    CASE 
                        WHEN p.AdjustType = 'Out' THEN p.Length 
                        ELSE 0 
                    END AS OutLength,
                    CASE 
                        WHEN p.AdjustType = 'In' THEN p.Quantity 
                        ELSE 0 
                    END AS InQuantity,
                    CASE 
                        WHEN p.AdjustType = 'In' THEN p.Weight 
                        ELSE 0 
                    END AS InWeight,
                    CASE 
                        WHEN p.AdjustType = 'In' THEN p.Length 
                        ELSE 0 
                    END AS InLength,
                    p.DefaultUnit,
                    p.InvoiceNo AS VoucherNo,
                    0 AS Balance 
                FROM tblStockAdjustBody p
                WHERE p.CreatedDate BETWEEN @startDate AND @endDate
                  AND p.CompanyID = @CompanyID
                  AND p.IsActive = 1
                  AND p.InvoiceNo != 0
                  AND (@includeAllProducts = 1 OR p.ProductCode = @productCode)

               UNION ALL

                SELECT 
                    p.CreatedDate AS Date,
                    'Assembly Out' AS Details,
                    p.QTYRequired As OutQuantity,
                    0 As OutWeight,
                    0 As OutLength,
                    0 As InQuantity,
                    0 As InWeight,
                    0 As InLength,
                    'Quantity' As DefaultUnit,
                    p.ReferenceID AS VoucherNo,
                    0 AS Balance 
                FROM tblRawMaterials p
                WHERE p.CreatedDate BETWEEN @startDate AND @endDate
                  AND p.CompanyID = @CompanyID
                  AND p.IsActive = 1
                  AND p.ReferenceID != 0
                  AND p.AssemblyType = 'Job'
                  AND (@includeAllProducts = 1 OR p.ProductID = @productID)

               UNION ALL

                SELECT 
                    s.CreatedDate AS Date,
                    'Assembly Out' AS Details,
                    s.QTYRequired As OutQuantity,
                    0 As OutWeight,
                    0 As OutLength,
                    0 As InQuantity,
                    0 As InWeight,
                    0 As InLength,
                    'Quantity' As DefaultUnit,
                    s.ReferenceID AS VoucherNo,
                    0 AS Balance 
                FROM tblNonStock s
                WHERE s.CreatedDate BETWEEN @startDate AND @endDate
                  AND s.CompanyID = @CompanyID
                  AND s.IsActive = 1
                  AND s.ReferenceID != 0
                  AND s.AssemblyType = 'Job'
                  AND (@includeAllProducts = 1 OR s.ProductID = @productID)

               UNION ALL

                SELECT 
                    f.CreatedDate AS Date,
                    'Assembly In' AS Details,
                    0 As OutQuantity,
                    0 As OutWeight,
                    0 As OutLength,
                    f.Quantity As InQuantity,
                    0 As InWeight,
                    0 As InLength,
                    'Quantity' As DefaultUnit,
                    f.ReferenceID AS VoucherNo,
                    0 AS Balance 
                FROM tblFinishedGoods f
                WHERE f.CreatedDate BETWEEN @startDate AND @endDate
                  AND f.CompanyID = @CompanyID
                  AND f.IsActive = 1
                  AND f.ReferenceID != 0
                  AND f.AssemblyType = 'Job'
                  AND (@includeAllProducts = 1 OR f.ProductID = @productID)

                ORDER BY Date;";

                    using (SqlCommand command = new SqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@startDate", startDate ?? (object)DBNull.Value);
                        command.Parameters.AddWithValue("@endDate", endDate ?? (object)DBNull.Value);
                        command.Parameters.AddWithValue("@CompanyID", CompanyID);
                        command.Parameters.AddWithValue("@productCode", (object)productCode ?? DBNull.Value);
                        command.Parameters.AddWithValue("@includeAllProducts", includeAllProducts ? 1 : 0);
                        command.Parameters.AddWithValue("@productID", (object)productID ?? DBNull.Value);

                        using (SqlDataReader reader = await command.ExecuteReaderAsync())
                        {
                            var transactions = new List<ProductTransaction>();

                            // Add Opening Balance row first (similar to customer report)
                            if (!includeAllProducts && productCode != 0)
                            {
                                transactions.Add(new ProductTransaction
                                {
                                    Date = startDate.Value,
                                    Details = "Opening Quantity",
                                    OutQuantity = 0,
                                    OutWeight = 0,
                                    OutLength = 0,
                                    InQuantity = openingQuantity,
                                    InWeight = openingWeight,
                                    InLength = openingLength,
                                    DefaultUnit = defaultUnit,
                                    VoucherNo = 0,
                                    Balance = openingQuantity
                                });
                            }

                            // Track running balance
                            decimal currentQuantityBalance = openingQuantity;
                            decimal currentWeightBalance = openingWeight;
                            decimal currentLengthBalance = openingLength;

                            while (await reader.ReadAsync())
                            {
                                var transaction = new ProductTransaction
                                {
                                    Date = reader.GetDateTime(0),
                                    Details = reader.GetString(1),
                                    OutQuantity = reader.IsDBNull(2) ? (decimal?)0 : reader.GetDecimal(2),
                                    OutWeight = reader.IsDBNull(3) ? (decimal?)0 : reader.GetDecimal(3),
                                    OutLength = reader.IsDBNull(4) ? (decimal?)0 : reader.GetDecimal(4),
                                    InQuantity = reader.IsDBNull(5) ? (decimal?)0 : reader.GetDecimal(5),
                                    InWeight = reader.IsDBNull(6) ? (decimal?)0 : reader.GetDecimal(6),
                                    InLength = reader.IsDBNull(7) ? (decimal?)0 : reader.GetDecimal(7),
                                    DefaultUnit = reader.IsDBNull(8) ? null : reader.GetString(8),
                                    VoucherNo = reader.IsDBNull(9) ? 0 : reader.GetInt64(9)
                                };

                                // Calculate running balance
                                currentQuantityBalance += (transaction.InQuantity ?? 0) - (transaction.OutQuantity ?? 0);
                                currentWeightBalance += (transaction.InWeight ?? 0) - (transaction.OutWeight ?? 0);
                                currentLengthBalance += (transaction.InLength ?? 0) - (transaction.OutLength ?? 0);

                                // For simplicity, showing quantity balance in the Balance field
                                transaction.Balance = currentQuantityBalance;

                                transactions.Add(transaction);
                            }

                            return Ok(new
                            {
                                Transactions = transactions,
                                status_code = 1,
                                status_message = "Successfully returning product transactions with opening balance."
                            });
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                return Ok(new
                {
                    status_code = 0,
                    status_message = "Sorry! Something went wrong",
                    error = ex.Message
                });
            }
        }



        [HttpGet("GetBankReportBy/{CompanyID}")]
        public async Task<IActionResult> GetBankReportBy(
        int CompanyID,
        string bankCode = null,
        DateTime? startDate = null,
        DateTime? endDate = null,
        string period = null,
        bool includeAllBanks = false)
        {
            DateTime now = DateTime.Now;
            try
            {
                // Set the default date range based on the 'period' parameter
                if (period == "week")
                {
                    startDate = now.AddDays(-7);
                    endDate = now;
                }
                else if (period == "month")
                {
                    startDate = now.AddMonths(-1);
                    endDate = now;
                }
                else if (period == "last60Days")
                {
                    startDate = now.AddDays(-60);
                    endDate = now;
                }
                else if (period == "last30Days")
                {
                    startDate = now.AddDays(-30);
                    endDate = now;
                }
                else if (period == "last90Days")
                {
                    startDate = now.AddDays(-90);
                    endDate = now;
                }
                else if (period == "last365Days")
                {
                    startDate = now.AddDays(-365);
                    endDate = now;
                }
                else if (period == "year")
                {
                    startDate = new DateTime(now.Year, 1, 1);
                    endDate = now;
                }
                else if (period == "today")
                {
                    startDate = now.Date;
                    endDate = now.Date;
                }
                else if (period == "all")
                {
                    startDate = now.AddYears(-10);
                    endDate = now;
                }
                else if (period == "custom")
                {
                    if (startDate == null || endDate == null)
                    {
                        return Ok(new { status_message = "For 'custom' period, both startDate and endDate must be provided.", status_code = 0 });
                    }
                }
                else
                {
                    startDate = now;
                    endDate = now;
                }

                // Fetch connection string from DbContext
                var connectionString = context.Database.GetDbConnection().ConnectionString;

                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    await connection.OpenAsync();

                    // Opening balance query
                    string openingBalanceQuery = @"EXEC GetOpeningBalance @startDate = @startDate, 
                       @CompanyID = @CompanyID, 
                       @bankCode = @bankCode,
					   @includeAllBanks = @includeAllBanks;";


                    SqlCommand openingBalanceCommand = new SqlCommand(openingBalanceQuery, connection);
                    openingBalanceCommand.Parameters.AddWithValue("@startDate", startDate.HasValue ? (object)startDate.Value : DBNull.Value);
                    openingBalanceCommand.Parameters.AddWithValue("@CompanyID", CompanyID);
                    openingBalanceCommand.Parameters.AddWithValue("@bankCode", (object)bankCode ?? DBNull.Value);
                    openingBalanceCommand.Parameters.AddWithValue("@includeAllBanks", includeAllBanks ? 1 : 0);

                    List<BankTransaction> transactions = new List<BankTransaction>();

                    using (var sqlDataReader = await openingBalanceCommand.ExecuteReaderAsync())
                    {
                        decimal Payment = 0;
                        decimal Receipt = 0;
                        while (await sqlDataReader.ReadAsync())
                        {
                            Payment += sqlDataReader.IsDBNull(1) ? 0 : sqlDataReader.GetDecimal(1);
                            Receipt += sqlDataReader.IsDBNull(2) ? 0 : sqlDataReader.GetDecimal(2);
                        }
                        transactions.Add(new BankTransaction
                        {
                            Type = "Opening Balance",
                            Date = startDate.Value,
                            Mode = "Cash",
                            Account = "Opening Balance",
                            Payments = Payment,
                            Receipts = Receipt,
                            Balance = Receipt - Payment

                        });
                    }

                    // Main report query
                    string query = @"
                SELECT 
                'Opening Balance' AS Type,
                '' AS VoucherNo,
                o.OpeningDate AS Date,
                o.AccountName AS Account,
                '' AS AccountCode,
                '' AS RefNo,
                '' AS Details,
                'Cash' AS Mode,
                SUM(o.DRAmt) AS Payments,
                SUM(o.CRAmt) AS Receipts
            FROM tblOpeningBal o
            WHERE o.OpeningDate BETWEEN @startDate AND @endDate
                AND o.CompanyID = @CompanyID
                AND o.IsActive = 1
                AND (@includeAllBanks = 1 OR o.AccountCode = @bankCode)
            GROUP BY o.OpeningDate, o.AccountName, o.IsActive
            union all
                SELECT 
                    'Purchase  ' + p.PurchaseType AS Type,
                    p.VoucherNo,
                    p.Date,
                    p.SupplierName AS Account,
                    p.SupplierAccountCode AS AccountCode,
                    p.RefNo,
                    p.Notes AS Details,
                    p.Mode,
                    CASE 
                        WHEN p.PurchaseType IN ('Payment', 'Return Receipt') THEN p.Total
                        ELSE 0
                    END AS Payments,
                    CASE 
                        WHEN p.PurchaseType IN ('Receipt', 'Return Payment') THEN p.Total
                        ELSE 0
                    END AS Receipts
                FROM tblPaymentHead p
                WHERE p.Date BETWEEN @startDate AND @endDate
                AND p.CompanyID = @CompanyID
                AND p.InComplete = 0
                AND p.IsActive = 1
                AND (@includeAllBanks = 1 OR p.BankCode = @bankCode)

                UNION ALL

                SELECT 
                    'Sale ' + r.ReceiptType AS Type,
                    r.VoucherNo,
                    r.Date,
                    r.CustomerName AS Account,
                    r.CustomerAccountCode AS AccountCode,
                    r.RefNo,
                    r.Notes AS Details,
                    r.Mode,
                    CASE 
                        WHEN r.ReceiptType IN ('Payment', 'Return Receipt') THEN r.Total
                        ELSE 0
                    END AS Payments,
                    CASE 
                        WHEN r.ReceiptType IN ('Receipt', 'Return Payment') THEN r.Total
                        ELSE 0
                    END AS Receipts
                FROM tblReceiptHead r
                WHERE r.Date BETWEEN @startDate AND @endDate
                AND r.CompanyID = @CompanyID
                AND r.InComplete = 0
                AND r.IsActive = 1
                AND (@includeAllBanks = 1 OR r.BankCode = @bankCode)

                UNION ALL

                SELECT 
                    r.BankReceiptType AS Type,
                    r.VoucherNo,
                    r.Date,
                    r.NominalAccount AS Account,
                    r.NominalAccountCode AS AccountCode,
                    r.RefNo,
                    r.Detail AS Details,
                    r.Mode,
                    0 AS Payments,
                    r.Amount AS Receipts
                FROM tblBankReceipts r
                WHERE r.Date BETWEEN @startDate AND @endDate
                AND r.CompanyID = @CompanyID
                AND r.IsActive = 1
                AND (@includeAllBanks = 1 OR r.BankCode = @bankCode)

                UNION ALL

                SELECT 
                    p.BankPaymentType AS Type,
                    p.VoucherNo,
                    p.Date,
                    p.NominalAccount AS Account,
                    p.NominalAccountCode AS AccountCode,
                    p.RefNo,
                    p.Detail AS Details,
                    p.Mode,
                    p.Amount AS Payments,
                    0 AS Receipts
                FROM tblBankPayments p
                WHERE p.Date BETWEEN @startDate AND @endDate
                AND p.CompanyID = @CompanyID
                AND p.IsActive = 1
                AND (@includeAllBanks = 1 OR p.BankCode = @bankCode)

                UNION ALL

                SELECT 
                    'Bank Transfer' AS Type,
                    t.VoucherNo,
                    t.Date,
                    t.FromBank AS Account,
                    t.FromBankCode AS AccountCode,
                    t.RefNo,
                    t.Detail AS Details,
                    t.Mode,
                    t.Amount AS Payments,
                    0 AS Receipts
                FROM tblBankTransfers t
                WHERE t.Date BETWEEN @startDate AND @endDate
                AND t.CompanyID = @CompanyID
                AND t.IsActive = 1
                AND (@includeAllBanks = 1 OR t.FromBankCode = @bankCode)

                UNION ALL

                SELECT 
                    'Bank Transfer' AS Type,
                    b.VoucherNo,
                    b.Date,
                    b.ToBank AS Account,
                    b.ToBankCode AS AccountCode,
                    b.RefNo,
                    b.Detail AS Details,
                    b.Mode,
                    0 AS Payments,
                    b.Amount AS Receipts
                FROM tblBankTransfers b
                WHERE b.Date BETWEEN @startDate AND @endDate
                AND b.CompanyID = @CompanyID
                AND b.IsActive = 1
                AND (@includeAllBanks = 1 OR b.ToBankCode = @bankCode)

                UNION ALL

                SELECT 
                    'Journal Voucher' AS Type,
                    j.VoucherNo,
                    j.Date,
                    j.FromAccount AS Account,
                    j.FromAccountCode AS AccountCode,
                    j.RefNo,
                    j.Detail AS Details,
                    j.Mode,
                    j.Amount AS Payments,
                    0 AS Receipts
                FROM tblJournalVoucher j
                WHERE j.Date BETWEEN @startDate AND @endDate
                AND j.CompanyID = @CompanyID
                AND j.IsActive = 1
                AND (@includeAllBanks = 1 OR j.FromAccountCode = @bankCode)

                UNION ALL

                SELECT 
                    'Journal Voucher' AS Type,
                    j.VoucherNo,
                    j.Date,
                    j.ToAccount AS Account,
                    j.ToAccountCode AS AccountCode,
                    j.RefNo,
                    j.Detail AS Details,
                    j.Mode,
                    0 AS Payments,
                    j.Amount AS Receipts
                FROM tblJournalVoucher j
                WHERE j.Date BETWEEN @startDate AND @endDate
                AND j.CompanyID = @CompanyID
                AND j.IsActive = 1
                AND (@includeAllBanks = 1 OR j.ToAccountCode = @bankCode)

                ORDER BY Date";

                    using (SqlCommand command = new SqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@startDate", startDate.HasValue ? (object)startDate.Value : DBNull.Value);
                        command.Parameters.AddWithValue("@endDate", endDate.HasValue ? (object)endDate.Value : DBNull.Value);
                        command.Parameters.AddWithValue("@CompanyID", CompanyID);
                        command.Parameters.AddWithValue("@bankCode", (object)bankCode ?? DBNull.Value);
                        command.Parameters.AddWithValue("@includeAllBanks", includeAllBanks ? 1 : 0);

                        using (SqlDataReader reader = await command.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                decimal? payments = reader.IsDBNull(8) ? 0 : reader.GetDecimal(8);
                                decimal? receipts = reader.IsDBNull(9) ? 0 : reader.GetDecimal(9);

                                transactions.Add(new BankTransaction
                                {
                                    Type = reader.GetString(0),
                                    VoucherNo = reader.GetInt64(1),
                                    Date = reader.GetDateTime(2),
                                    Account = reader.IsDBNull(3) ? null : reader.GetString(3),
                                    AccountCode = reader.IsDBNull(4) ? null : reader.GetString(4),
                                    RefNo = reader.IsDBNull(5) ? null : reader.GetString(5),
                                    Details = reader.IsDBNull(6) ? null : reader.GetString(6),
                                    Mode = reader.IsDBNull(7) ? null : reader.GetString(7),
                                    Payments = payments,
                                    Receipts = receipts,
                                    Balance = receipts - payments
                                });
                            }
                        }
                        decimal totalReceipts = transactions.Sum(t => t.Receipts ?? 0);
                        decimal totalPayments = transactions.Sum(t => t.Payments ?? 0);
                        decimal totalBalance = transactions.Sum(t => t.Balance ?? 0);
                        return Ok(new
                        {
                            ListofRecords = transactions,
                            totalReceipts,
                            totalPayments,
                            totalBalance,
                            status_code = 1,
                            status_message = "Successfully returning List of Records"
                        });
                    }
                }
            }
            catch (Exception ex)
            {

                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong", error = ex.Message });
            }
        }


        [HttpGet("GetAccountReportBy/{CompanyID}")]
        public async Task<IActionResult> GetAccountReportBy(
         int CompanyID,
         string bankCode = null,
         DateTime? startDate = null,
         DateTime? endDate = null,
         string period = null,
         bool includeAllBanks = false)
        {
            DateTime now = DateTime.Now;
            try
            {
                // Set the default date range based on the 'period' parameter
                if (period == "week")
                {
                    startDate = now.AddDays(-7);
                    endDate = now;
                }
                else if (period == "month")
                {
                    startDate = now.AddMonths(-1);
                    endDate = now;
                }
                else if (period == "last60Days")
                {
                    startDate = now.AddDays(-60);
                    endDate = now;
                }
                else if (period == "last30Days")
                {
                    startDate = now.AddDays(-30);
                    endDate = now;
                }
                else if (period == "last90Days")
                {
                    startDate = now.AddDays(-90);
                    endDate = now;
                }
                else if (period == "last365Days")
                {
                    startDate = now.AddDays(-365);
                    endDate = now;
                }
                else if (period == "year")
                {
                    startDate = new DateTime(now.Year, 1, 1);
                    endDate = now;
                }
                else if (period == "today")
                {
                    startDate = now.Date;
                    endDate = now.Date.AddDays(1).AddSeconds(-1); // End of today
                }
                else if (period == "all")
                {
                    startDate = now.AddYears(-10);
                    endDate = now;
                }
                else if (period == "custom")
                {
                    if (startDate == null || endDate == null)
                    {
                        return Ok(new { status_message = "For 'custom' period, both startDate and endDate must be provided.", status_code = 0 });
                    }
                }
                else
                {
                    // Default to current year if no valid period specified
                    startDate = new DateTime(now.Year, 1, 1);
                    endDate = now;
                }

                // Ensure endDate includes the full day
                if (endDate.HasValue && endDate.Value.TimeOfDay == TimeSpan.Zero)
                {
                    endDate = endDate.Value.Date.AddDays(1).AddSeconds(-1);
                }

                // Fetch connection string from DbContext
                var connectionString = context.Database.GetDbConnection().ConnectionString;

                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    await connection.OpenAsync();
                    List<BankTransaction> transactions = new List<BankTransaction>();

                    // Calculate opening balance before the selected period
                    string openingBalanceQuery = @"
            SELECT 
                SUM(Payments) AS TotalPayments,
                SUM(Receipts) AS TotalReceipts
            FROM (
                -- Opening Balance from tblOpeningBal
                SELECT 
                    SUM(o.DRAmt) AS Payments, 
                    SUM(o.CRAmt) AS Receipts
                FROM tblOpeningBal o
                WHERE o.OpeningDate < @startDate
                  AND o.CompanyID = @CompanyID
                  AND o.IsActive = 1
                  AND o.AccountCode NOT LIKE '50%'
                  AND LEN(o.AccountCode) <> 4
                  AND (@includeAllBanks = 1 OR o.AccountCode = @bankCode)

                UNION ALL

                -- Receipts before selected period
                SELECT 
                    0 AS Payments, 
                    SUM(r.Amount) AS Receipts
                FROM tblBankReceipts r
                WHERE r.Date < @startDate
                  AND r.CompanyID = @CompanyID
                  AND r.IsActive = 1
                  AND r.NominalAccountCode NOT LIKE '50%'
                  AND LEN(r.NominalAccountCode) <> 4
                  AND (@includeAllBanks = 1 OR r.NominalAccountCode = @bankCode)

                UNION ALL

                -- Payments before selected period
                SELECT 
                    SUM(p.Amount) AS Payments, 
                    0 AS Receipts
                FROM tblBankPayments p
                WHERE p.Date < @startDate
                  AND p.CompanyID = @CompanyID
                  AND p.IsActive = 1
                  AND p.NominalAccountCode NOT LIKE '50%'
                  AND LEN(p.NominalAccountCode) <> 4
                  AND (@includeAllBanks = 1 OR p.NominalAccountCode = @bankCode)

                UNION ALL

                -- Journal Vouchers (From Account → Debit) before selected period
                SELECT 
                    SUM(j.Amount) AS Payments, 
                    0 AS Receipts
                FROM tblJournalVoucher j
                WHERE j.Date < @startDate
                  AND j.CompanyID = @CompanyID
                  AND j.IsActive = 1
                  AND j.FromAccountCode NOT LIKE '50%'
                  AND LEN(j.FromAccountCode) <> 4
                  AND (@includeAllBanks = 1 OR j.FromAccountCode = @bankCode)

                UNION ALL

                -- Journal Vouchers (To Account → Credit) before selected period
                SELECT 
                    0 AS Payments, 
                    SUM(j.Amount) AS Receipts
                FROM tblJournalVoucher j
                WHERE j.Date < @startDate
                  AND j.CompanyID = @CompanyID
                  AND j.IsActive = 1
                  AND j.ToAccountCode NOT LIKE '50%'
                  AND LEN(j.ToAccountCode) <> 4
                  AND (@includeAllBanks = 1 OR j.ToAccountCode = @bankCode)
            ) AS OpeningData";

                    decimal openingBalance = 0;
                    using (SqlCommand openingCommand = new SqlCommand(openingBalanceQuery, connection))
                    {
                        openingCommand.Parameters.AddWithValue("@startDate", startDate.HasValue ? (object)startDate.Value : DBNull.Value);
                        openingCommand.Parameters.AddWithValue("@CompanyID", CompanyID);
                        openingCommand.Parameters.AddWithValue("@bankCode", string.IsNullOrEmpty(bankCode) ? (object)DBNull.Value : bankCode);
                        openingCommand.Parameters.AddWithValue("@includeAllBanks", includeAllBanks ? 1 : 0);

                        using (var sqlDataReader = await openingCommand.ExecuteReaderAsync())
                        {
                            if (await sqlDataReader.ReadAsync())
                            {
                                decimal payments = sqlDataReader.IsDBNull(0) ? 0 : sqlDataReader.GetDecimal(0);
                                decimal receipts = sqlDataReader.IsDBNull(1) ? 0 : sqlDataReader.GetDecimal(1);
                                openingBalance = receipts - payments;
                            }
                        }
                    }

                    // Add opening balance entry if it exists
                    if (openingBalance != 0)
                    {
                        transactions.Add(new BankTransaction
                        {
                            Type = "Opening Balance",
                            Date = startDate.Value,
                            Mode = "Cash",
                            Account = "Opening Balance",
                            VoucherNo = 0,
                            RefNo = "",
                            Details = "",
                            Payments = openingBalance < 0 ? Math.Abs(openingBalance) : 0,
                            Receipts = openingBalance > 0 ? openingBalance : 0,
                            Balance = openingBalance
                        });
                    }

                    // Main report query for transactions within the selected period
                    string query = @"
            SELECT 
                'Opening Balance' AS Type,
                '' AS VoucherNo,
                o.OpeningDate AS Date,
                o.AccountName AS Account,
                '' AS RefNo,
                '' AS Details,
                'Cash' AS Mode,
                SUM(o.DRAmt) AS Payments,
                SUM(o.CRAmt) AS Receipts
            FROM tblOpeningBal o
            WHERE o.OpeningDate BETWEEN @startDate AND @endDate
                AND o.CompanyID = @CompanyID
                AND o.IsActive = 1
                AND o.AccountCode NOT LIKE '50%'
                AND LEN(o.AccountCode) <> 4
                AND (@includeAllBanks = 1 OR o.AccountCode = @bankCode)
            GROUP BY o.OpeningDate, o.AccountName

            UNION ALL

            SELECT 
                r.BankReceiptType AS Type,
                CAST(r.VoucherNo AS VARCHAR(20)) AS VoucherNo,
                r.Date,
                r.NominalAccount AS Account,
                ISNULL(r.RefNo, '') AS RefNo,
                ISNULL(r.Detail, '') AS Details,
                ISNULL(r.Mode, '') AS Mode,
                0 AS Payments,
                r.Amount AS Receipts
            FROM tblBankReceipts r
            WHERE r.Date BETWEEN @startDate AND @endDate
            AND r.CompanyID = @CompanyID
            AND r.IsActive = 1
            AND r.NominalAccountCode NOT LIKE '50%'
            AND LEN(r.NominalAccountCode) <> 4
            AND (@includeAllBanks = 1 OR r.NominalAccountCode = @bankCode)

            UNION ALL

            SELECT 
                p.BankPaymentType AS Type,
                CAST(p.VoucherNo AS VARCHAR(20)) AS VoucherNo,
                p.Date,
                p.NominalAccount AS Account,
                ISNULL(p.RefNo, '') AS RefNo,
                ISNULL(p.Detail, '') AS Details,
                ISNULL(p.Mode, '') AS Mode,
                p.Amount AS Payments,
                0 AS Receipts
            FROM tblBankPayments p
            WHERE p.Date BETWEEN @startDate AND @endDate
            AND p.CompanyID = @CompanyID
            AND p.IsActive = 1
            AND p.NominalAccountCode NOT LIKE '50%'
            AND LEN(p.NominalAccountCode) <> 4
            AND (@includeAllBanks = 1 OR p.NominalAccountCode = @bankCode)

            UNION ALL

            SELECT 
                'Journal Voucher' AS Type,
                CAST(j.VoucherNo AS VARCHAR(20)) AS VoucherNo,
                j.Date,
                j.FromAccount AS Account,
                ISNULL(j.RefNo, '') AS RefNo,
                ISNULL(j.Detail, '') AS Details,
                ISNULL(j.Mode, '') AS Mode,
                j.Amount AS Payments,
                0 AS Receipts
            FROM tblJournalVoucher j
            WHERE j.Date BETWEEN @startDate AND @endDate
            AND j.CompanyID = @CompanyID
            AND j.IsActive = 1
            AND j.FromAccountCode NOT LIKE '50%'
            AND LEN(j.FromAccountCode) <> 4
            AND (@includeAllBanks = 1 OR j.FromAccountCode = @bankCode)

            UNION ALL

            SELECT 
                'Journal Voucher' AS Type,
                CAST(j.VoucherNo AS VARCHAR(20)) AS VoucherNo,
                j.Date,
                j.ToAccount AS Account,
                ISNULL(j.RefNo, '') AS RefNo,
                ISNULL(j.Detail, '') AS Details,
                ISNULL(j.Mode, '') AS Mode,
                0 AS Payments,
                j.Amount AS Receipts
            FROM tblJournalVoucher j
            WHERE j.Date BETWEEN @startDate AND @endDate
            AND j.CompanyID = @CompanyID
            AND j.IsActive = 1
            AND j.ToAccountCode NOT LIKE '50%'
            AND LEN(j.ToAccountCode) <> 4
            AND (@includeAllBanks = 1 OR j.ToAccountCode = @bankCode)

            ORDER BY Date, Type";

                    using (SqlCommand command = new SqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@startDate", startDate.HasValue ? (object)startDate.Value : DBNull.Value);
                        command.Parameters.AddWithValue("@endDate", endDate.HasValue ? (object)endDate.Value : DBNull.Value);
                        command.Parameters.AddWithValue("@CompanyID", CompanyID);
                        command.Parameters.AddWithValue("@bankCode", string.IsNullOrEmpty(bankCode) ? (object)DBNull.Value : bankCode);
                        command.Parameters.AddWithValue("@includeAllBanks", includeAllBanks ? 1 : 0);

                        using (SqlDataReader reader = await command.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                decimal? payments = reader.IsDBNull(7) ? 0 : reader.GetDecimal(7);
                                decimal? receipts = reader.IsDBNull(8) ? 0 : reader.GetDecimal(8);

                                transactions.Add(new BankTransaction
                                {
                                    Type = reader.GetString(0),
                                    VoucherNo = !reader.IsDBNull(1) && long.TryParse(reader.GetString(1), out var v) ? v : 0,
                                    Date = reader.GetDateTime(2),
                                    Account = reader.IsDBNull(3) ? "" : reader.GetString(3),
                                    RefNo = reader.IsDBNull(4) ? "" : reader.GetString(4),
                                    Details = reader.IsDBNull(5) ? "" : reader.GetString(5),
                                    Mode = reader.IsDBNull(6) ? "" : reader.GetString(6),
                                    Payments = payments,
                                    Receipts = receipts,
                                    Balance = receipts - payments
                                });
                            }
                        }
                    }

                    // Sort transactions by date, with opening balance first
                    transactions = transactions.OrderBy(t => t.Date).ThenBy(t => t.Type == "Opening Balance" ? 0 : 1).ToList();

                    // Calculate running balance starting with opening balance
                    decimal runningBalance = openingBalance;
                    foreach (var transaction in transactions)
                    {
                        if (transaction.Type == "Opening Balance" && transaction.Account == "Opening Balance")
                        {
                            // This is our calculated opening balance entry
                            transaction.Balance = runningBalance;
                        }
                        else
                        {
                            // Add the transaction effect to running balance
                            runningBalance += (transaction.Receipts ?? 0) - (transaction.Payments ?? 0);
                            transaction.Balance = runningBalance;
                        }
                    }

                    decimal totalReceipts = transactions.Where(t => t.Type != "Opening Balance" || t.Account != "Opening Balance")
                                                       .Sum(t => t.Receipts ?? 0);
                    decimal totalPayments = transactions.Where(t => t.Type != "Opening Balance" || t.Account != "Opening Balance")
                                                       .Sum(t => t.Payments ?? 0);
                    decimal totalBalance = runningBalance; // Final balance after all transactions

                    return Ok(new
                    {
                        listofRecords = transactions, // Fixed: lowercase 'l'
                        totalReceipts,
                        totalPayments,
                        totalBalance,
                        openingBalance, // Added opening balance to response
                        status_code = 1,
                        status_message = "Successfully returning List of Records",
                        recordCount = transactions.Count,
                    });
                }
            }
            catch (Exception ex)
            {
                return Ok(new
                {
                    status_code = 0,
                    status_message = "Sorry! Something went wrong",
                    error = ex.Message,
                    listofRecords = new List<BankTransaction>(),
                    totalReceipts = 0,
                    totalPayments = 0,
                    totalBalance = 0,
                    openingBalance = 0
                });
            }
        }

        [HttpGet("GetCustomerSummaryReportBy/{CompanyID}")]
        public async Task<IActionResult> GetCustomerReport(
        int CompanyID,
        [FromQuery] List<string> selectedAccountCodes,
        string period,
        DateTime? startDate = null,
        DateTime? endDate = null,
        bool excludeZeroBalance = false)
        {
            DateTime now = DateTime.Now;
            try
            {
                // Set date ranges based on the period
                if (period == "week")
                {
                    startDate = now.AddDays(-7);
                    endDate = now;
                }
                else if (period == "month")
                {
                    startDate = now.AddMonths(-1);
                    endDate = now;
                }
                else if (period == "last60Days")
                {
                    startDate = now.AddDays(-60);
                    endDate = now;
                }
                else if (period == "last30Days")
                {
                    startDate = now.AddDays(-30);
                    endDate = now;
                }
                else if (period == "last90Days")
                {
                    startDate = now.AddDays(-90);
                    endDate = now;
                }
                else if (period == "last365Days")
                {
                    startDate = now.AddDays(-365);
                    endDate = now;
                }
                else if (period == "year")
                {
                    startDate = new DateTime(now.Year, 1, 1);
                    endDate = now;
                }
                else if (period == "today")
                {
                    startDate = now.Date;
                    endDate = now.Date;
                }
                else if (period == "all")
                {
                    startDate = now.AddYears(-10);
                    endDate = now;
                }
                else if (period == "custom")
                {
                    if (startDate == null || endDate == null)
                    {
                        return Ok(new { status_message = "For 'custom' period, both startDate and endDate must be provided.", status_code = 0 });
                    }
                }

                // Validate CompanyID
                if (CompanyID <= 0)
                {
                    return Ok(new { status_code = 0, status_message = "Invalid Company ID." });
                }

                var connectionString = context.Database.GetDbConnection().ConnectionString;

                var transactions = new List<ReportSummary>();

                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    await connection.OpenAsync();

                    string query = @"
                EXEC GetCustomerReportSummary @CompanyID, @SelectedAccountCodes, @StartDate, @EndDate";

                    using (SqlCommand command = new SqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@StartDate", startDate ?? (object)DBNull.Value);
                        command.Parameters.AddWithValue("@EndDate", endDate ?? (object)DBNull.Value);
                        command.Parameters.AddWithValue("@CompanyID", CompanyID);
                        command.Parameters.AddWithValue("@SelectedAccountCodes", string.Join(",", selectedAccountCodes));

                        using (SqlDataReader reader = await command.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                transactions.Add(new ReportSummary
                                {
                                    AccountCode = reader.GetString(0),
                                    Name = reader.GetString(1),
                                    TotalDebit = reader.GetDecimal(4),
                                    TotalCredit = reader.GetDecimal(5),
                                    BaseBalance = reader.GetDecimal(6),
                                    Balance = reader.GetDecimal(7)
                                });
                            }
                        }
                        if (excludeZeroBalance == true)
                        {
                            transactions = transactions.Where(c => c.Balance != 0).ToList();
                        }
                        decimal totalDebits = transactions.Sum(t => t.TotalDebit ?? 0);
                        decimal totalCredits = transactions.Sum(t => t.TotalCredit ?? 0);
                        decimal totalBalance = transactions.Sum(t => t.Balance ?? 0);
                        return Ok(new
                        {
                            ListofRecords = transactions,
                            totalCredits,
                            totalDebits,
                            totalBalance,
                            status_code = 1,
                            status_message = "Successfully returning List of Records"
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong", error = ex.Message });
            }
        }

        [HttpGet("GetSupplierSummaryReportBy/{CompanyID}")]
        public async Task<IActionResult> GetSupplierSummaryReportBy(
        int CompanyID,
        [FromQuery] List<string> selectedAccountCodes,
        string period,
        DateTime? startDate = null,
        DateTime? endDate = null,
        bool excludeZeroBalance = false)
        {
            DateTime now = DateTime.Now;
            try
            {
                // Set date ranges based on the period
                if (period == "week")
                {
                    startDate = now.AddDays(-7);
                    endDate = now;
                }
                else if (period == "month")
                {
                    startDate = now.AddMonths(-1);
                    endDate = now;
                }
                else if (period == "last60Days")
                {
                    startDate = now.AddDays(-60);
                    endDate = now;
                }
                else if (period == "last30Days")
                {
                    startDate = now.AddDays(-30);
                    endDate = now;
                }
                else if (period == "last90Days")
                {
                    startDate = now.AddDays(-90);
                    endDate = now;
                }
                else if (period == "last365Days")
                {
                    startDate = now.AddDays(-365);
                    endDate = now;
                }
                else if (period == "year")
                {
                    startDate = new DateTime(now.Year, 1, 1);
                    endDate = now;
                }
                else if (period == "today")
                {
                    startDate = now.Date;
                    endDate = now.Date;
                }
                else if (period == "all")
                {
                    startDate = now.AddYears(-10);
                    endDate = now;
                }
                else if (period == "custom")
                {
                    if (startDate == null || endDate == null)
                    {
                        return Ok(new { status_message = "For 'custom' period, both startDate and endDate must be provided.", status_code = 0 });
                    }
                }

                // Validate CompanyID
                if (CompanyID <= 0)
                {
                    return Ok(new { status_code = 0, status_message = "Invalid Company ID." });
                }

                var connectionString = context.Database.GetDbConnection().ConnectionString;

                var transactions = new List<ReportSummary>();

                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    await connection.OpenAsync();

                    string query = @"
                    EXEC GetSupplierReportSummary @CompanyID, @SelectedAccountCodes, @StartDate, @EndDate";

                    using (SqlCommand command = new SqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@StartDate", startDate ?? (object)DBNull.Value);
                        command.Parameters.AddWithValue("@EndDate", endDate ?? (object)DBNull.Value);
                        command.Parameters.AddWithValue("@CompanyID", CompanyID);
                        command.Parameters.AddWithValue("@SelectedAccountCodes", string.Join(",", selectedAccountCodes));

                        using (SqlDataReader reader = await command.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                decimal openDebit = reader.GetDecimal(2);
                                decimal openCredit = reader.GetDecimal(3);

                                decimal totalDebit = reader.GetDecimal(4);
                                decimal totalCredit = reader.GetDecimal(5);
                                transactions.Add(new ReportSummary
                                {
                                    AccountCode = reader.GetString(0),
                                    Name = reader.GetString(1),
                                    TotalDebit = totalDebit,
                                    TotalCredit = totalCredit,
                                    BaseBalance = openCredit - openDebit,
                                    Balance = openCredit - openDebit + totalCredit - totalDebit,
                                });
                            }
                        }
                        if (excludeZeroBalance == true)
                        {
                            transactions = transactions.Where(c => c.Balance > 0).ToList();
                        }
                        decimal totalDebits = transactions.Sum(t => t.TotalDebit ?? 0);
                        decimal totalCredits = transactions.Sum(t => t.TotalCredit ?? 0);
                        decimal totalBalance = totalCredits - totalDebits;
                        return Ok(new
                        {
                            ListofRecords = transactions,
                            totalCredits,
                            totalDebits,
                            totalBalance,
                            status_code = 1,
                            status_message = "Successfully returning List of Records",
                            startDate = startDate,
                            endDate = endDate
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                return Ok(new { status_code = 0, status_message = "Sorry! Something went wrong", error = ex.Message });
            }
        }

        [HttpGet("GetProductSummaryReportBy/{CompanyID}")]
        public async Task<IActionResult> GetProductReport(
        int CompanyID,
        int productCode,
        string period,
        DateTime? startDate = null,
        DateTime? endDate = null,
        bool includeAllProducts = false)
        {
            DateTime now = DateTime.Now;
            try
            {
                // Set start and end dates based on period
                switch (period?.ToLower())
                {
                    case "week":
                        startDate = now.AddDays(-7);
                        endDate = now;
                        break;
                    case "month":
                        startDate = now.AddMonths(-1);
                        endDate = now;
                        break;
                    case "last60days":
                        startDate = now.AddDays(-60);
                        endDate = now;
                        break;
                    case "last30days":
                        startDate = now.AddDays(-30);
                        endDate = now;
                        break;
                    case "last90days":
                        startDate = now.AddDays(-90);
                        endDate = now;
                        break;
                    case "last365days":
                        startDate = now.AddDays(-365);
                        endDate = now;
                        break;
                    case "year":
                        startDate = new DateTime(now.Year, 1, 1);
                        endDate = now;
                        break;
                    case "today":
                        startDate = now.Date;
                        endDate = now.Date;
                        break;
                    case "all":
                        startDate = now.AddYears(-10);
                        endDate = now;
                        break;
                    case "custom":
                        if (startDate == null || endDate == null)
                            return Ok(new { status_message = "For 'custom' period, both startDate and endDate must be provided.", status_code = 0 });
                        break;
                    default:
                        startDate = now;
                        endDate = now;
                        break;
                }

                if (CompanyID <= 0)
                    return Ok(new { status_code = 0, status_message = "Invalid Company ID." });

                    var connectionString = context.Database.GetConnectionString();
                if (string.IsNullOrWhiteSpace(connectionString))
                {
                    connectionString = context.Database.GetDbConnection().ConnectionString;
                }

                int? productID = null;
                if (!includeAllProducts)
                {
                    var productData = await context.tblProducts.Where(p => p.Code == productCode && p.CompanyID == CompanyID && p.IsActive).FirstOrDefaultAsync();
                    if (productData == null)
                    {
                        return Ok(new { status_code = 0, status_message = "Product not found or inactive." });
                    }

                    productID = productData.ID;
                }

                var query = context.tblProducts.AsQueryable();

                if (includeAllProducts && productCode == 0)
                {
                    query = query.Where(e => e.CompanyID == CompanyID && e.IsActive && e.CategoryCode != "cop" && e.CategoryCode != "sop");
                }
                else if (productCode != 0)
                {
                    query = query.Where(e => e.Code == productCode && e.CompanyID == CompanyID && e.IsActive);
                }

                var products = await query.Select(e => new
                {
                    ProductCode = e.Code,
                    e.Name,
                    e.ID,
                    e.Category,
                    e.Type,
                    e.SalePrice,
                    e.OpeningQuantity
                }).ToListAsync();

                if (products == null || products.Count == 0)
                    return Ok(new { status_code = 0, status_message = "No products found." });

                var ProductData = new List<ProductSummary>();

                // Use existing EF Core connection (no manual SqlConnection)
                var connection = (SqlConnection)context.Database.GetDbConnection();
                if (connection.State != ConnectionState.Open)
                    await connection.OpenAsync();

                Console.WriteLine("products: " + products.Count);

                foreach (var product in products)
                {
                    string balanceQuery = @"
                            SELECT 
                                SUM(CASE 
                                    WHEN TransactionType = 'In' OR TransactionType = 'Opening' THEN TotalQuantity 
                                    ELSE -TotalQuantity 
                                END) AS CurrentBalance
                            FROM (
                                SELECT 'Out' AS TransactionType, SUM(r.Quantity) AS TotalQuantity
                                FROM tblSaleBody r
                                INNER JOIN tblSaleHead sh ON r.InvoiceNo = sh.InvoiceNo AND r.CompanyID = sh.CompanyID
                                WHERE sh.Date <= @endDate AND r.CompanyID = @CompanyID AND r.InComplete = 0 AND r.IsActive = 1 AND r.InvoiceNo != 0 AND r.ProductCode = @productCode

                                UNION ALL

                                SELECT 'In' AS TransactionType, SUM(p.Quantity) AS TotalQuantity
                                FROM tblPurchaseBody p
                                INNER JOIN tblPurchaseHead ph ON p.BillID = ph.BillID AND p.CompanyID = ph.CompanyID
                                WHERE ph.Date <= @endDate AND p.CompanyID = @CompanyID AND p.InComplete = 0 AND p.IsActive = 1 AND p.BillID != 0 AND p.ProductCode = @productCode

                                UNION ALL

                                SELECT 'In' AS TransactionType, SUM(p.Quantity) AS TotalQuantity
                                FROM tblStockAdjustBody p
                                WHERE p.CreatedDate <= @endDate AND p.CompanyID = @CompanyID AND p.IsActive = 1 AND p.InvoiceNo != 0 AND p.AdjustType = 'In' AND p.ProductCode = @productCode

                                UNION ALL

                                SELECT 'Out' AS TransactionType, SUM(p.Quantity) AS TotalQuantity
                                FROM tblStockAdjustBody p
                                WHERE p.CreatedDate <= @endDate AND p.CompanyID = @CompanyID AND p.IsActive = 1 AND p.InvoiceNo != 0 AND p.AdjustType = 'Out' AND p.ProductCode = @productCode

                                UNION ALL

                                SELECT 'Out' AS TransactionType, SUM(p.QTYRequired) AS TotalQuantity
                                FROM tblRawMaterials p
                                WHERE p.CreatedDate <= @endDate AND p.CompanyID = @CompanyID AND p.IsActive = 1 AND p.ReferenceID != 0 AND p.AssemblyType = 'Job' AND p.ProductID = @productID

                                UNION ALL

                                SELECT 'Out' AS TransactionType, SUM(s.QTYRequired) AS TotalQuantity
                                FROM tblNonStock s
                                WHERE s.CreatedDate <= @endDate AND s.CompanyID = @CompanyID AND s.IsActive = 1 AND s.ReferenceID != 0 AND s.AssemblyType = 'Job' AND s.ProductID = @productID

                                UNION ALL

                                SELECT 'In' AS TransactionType, SUM(f.Quantity) AS TotalQuantity
                                FROM tblFinishedGoods f
                                WHERE f.CreatedDate <= @endDate AND f.CompanyID = @CompanyID AND f.IsActive = 1 AND f.ReferenceID != 0 AND f.AssemblyType = 'Job' AND f.ProductID = @productID

                                UNION ALL

                                SELECT 'Opening' AS TransactionType, COALESCE(p.baseOpeningQuantity, 0) AS TotalQuantity
                                FROM tblProducts p
                                WHERE p.CompanyID = @CompanyID AND p.IsActive = 1 AND p.Code = @productCode
                            ) AS AllTransactions";

                        using (var cmd = new SqlCommand(balanceQuery, connection))
                        {
                            cmd.Parameters.AddWithValue("@endDate", endDate.Value.ToString("yyyy-MM-dd"));
                            cmd.Parameters.AddWithValue("@CompanyID", CompanyID);
                            cmd.Parameters.AddWithValue("@productCode", product.ProductCode);
                            cmd.Parameters.AddWithValue("@productID", product.ID);

                            var result = await cmd.ExecuteScalarAsync();
                            decimal currentBalance = result == DBNull.Value ? 0 : Convert.ToDecimal(result);

                            ProductData.Add(new ProductSummary
                            {
                                ProductCode = product.ProductCode,
                                Name = product.Name,
                                Category = product.Category,
                                Type = product.Type,
                                Quantity = currentBalance,
                                Rate = product.SalePrice,
                                Amount = currentBalance * product.SalePrice
                            });
                        }
                }

                return Ok(new
                {
                    status_code = 1,
                    totalRecords = ProductData.Count,
                    products = ProductData
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { status_code = 0, status_message = ex.Message });
            }
        }

        [HttpGet("GetAccountSummaryBy/{CompanyID}")]
        public async Task<IActionResult> GetAccountSummaryBy(
         int CompanyID,
         string bankCode = null,
         DateTime? startDate = null,
         DateTime? endDate = null,
         string period = null,
         bool includeAllBanks = false)
        {
            DateTime now = DateTime.Now;
            DateTime? originalStartDate = startDate; // Keep original for opening balance calculation

            try
            {
                if (period == "week") { startDate = now.AddDays(-7); endDate = now; }
                else if (period == "month") { startDate = now.AddMonths(-1); endDate = now; }
                else if (period == "last60Days") { startDate = now.AddDays(-60); endDate = now; }
                else if (period == "last30Days") { startDate = now.AddDays(-30); endDate = now; }
                else if (period == "last90Days") { startDate = now.AddDays(-90); endDate = now; }
                else if (period == "last365Days") { startDate = now.AddDays(-365); endDate = now; }
                else if (period == "year") { startDate = new DateTime(now.Year, 1, 1); endDate = now; }
                else if (period == "today") { startDate = now.Date; endDate = now.Date.AddDays(1).AddSeconds(-1); }
                else if (period == "all") { startDate = now.AddYears(-10); endDate = now; }
                else if (period == "custom")
                {
                    if (startDate == null || endDate == null)
                        return Ok(new { status_message = "For 'custom' period, both startDate and endDate must be provided.", status_code = 0 });
                }
                else { startDate = new DateTime(now.Year, 1, 1); endDate = now; }

                if (endDate.HasValue && endDate.Value.TimeOfDay == TimeSpan.Zero)
                    endDate = endDate.Value.Date.AddDays(1).AddSeconds(-1);

                var connectionString = context.Database.GetDbConnection().ConnectionString;

                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    await connection.OpenAsync();

                    // First, get opening balances (before the selected date range)
                    string openingBalanceQuery = @"
            SELECT 
                MAX(Account) AS Account,
                AccountCode,
                SUM(Receipts - Payments) AS OpeningBalance
            FROM (
                -- Opening Balance from tblOpeningBal
                SELECT MAX(o.AccountName) AS Account,
                    o.AccountCode AS AccountCode,
                    SUM(o.DRAmt) AS Payments, 
                    SUM(o.CRAmt) AS Receipts
                FROM tblOpeningBal o
                WHERE o.OpeningDate < @startDate
                AND o.CompanyID = @CompanyID
                AND o.IsActive = 1
                AND o.AccountCode NOT LIKE '50%'
                AND LEN(o.AccountCode) <> 4
                AND (@includeAllBanks = 1 OR o.AccountCode = @bankCode)
                GROUP BY o.AccountCode

                UNION ALL

                -- Receipts before selected period
                SELECT r.NominalAccount AS Account,
                    r.NominalAccountCode AS AccountCode,
                    0 AS Payments, 
                    r.Amount AS Receipts
                FROM tblBankReceipts r
                WHERE r.Date < @startDate
                AND r.CompanyID = @CompanyID
                AND r.IsActive = 1
                AND r.NominalAccountCode NOT LIKE '50%'
                AND LEN(r.NominalAccountCode) <> 4
                AND (@includeAllBanks = 1 OR r.NominalAccountCode = @bankCode)

                UNION ALL

                -- Payments before selected period
                SELECT p.NominalAccount AS Account, 
                    p.NominalAccountCode AS AccountCode,
                    p.Amount AS Payments, 
                    0 AS Receipts
                FROM tblBankPayments p
                WHERE p.Date < @startDate
                AND p.CompanyID = @CompanyID
                AND p.IsActive = 1
                AND p.NominalAccountCode NOT LIKE '50%'
                AND LEN(p.NominalAccountCode) <> 4
                AND (@includeAllBanks = 1 OR p.NominalAccountCode = @bankCode)

                UNION ALL

                -- Journal Vouchers (From Account → Debit) before selected period
                SELECT j.FromAccount AS Account,
                    j.FromAccountCode AS AccountCode,
                    j.Amount AS Payments, 
                    0 AS Receipts
                FROM tblJournalVoucher j
                WHERE j.Date < @startDate
                AND j.CompanyID = @CompanyID
                AND j.IsActive = 1
                AND j.FromAccountCode NOT LIKE '50%'
                AND LEN(j.FromAccountCode) <> 4
                AND (@includeAllBanks = 1 OR j.FromAccountCode = @bankCode)

                UNION ALL

                -- Journal Vouchers (To Account → Credit) before selected period
                SELECT j.ToAccount AS Account,
                    j.ToAccountCode AS AccountCode,
                    0 AS Payments, 
                    j.Amount AS Receipts
                FROM tblJournalVoucher j
                WHERE j.Date < @startDate
                AND j.CompanyID = @CompanyID
                AND j.IsActive = 1
                AND j.ToAccountCode NOT LIKE '50%'
                AND LEN(j.ToAccountCode) <> 4
                AND (@includeAllBanks = 1 OR j.ToAccountCode = @bankCode)
            ) AS OpeningData
            GROUP BY AccountCode
            ORDER BY Account";


                    var openingBalances = new Dictionary<string, decimal>();

                    using (SqlCommand openingCommand = new SqlCommand(openingBalanceQuery, connection))
                    {
                        openingCommand.Parameters.AddWithValue("@startDate", (object)startDate ?? DBNull.Value);
                        openingCommand.Parameters.AddWithValue("@CompanyID", CompanyID);
                        openingCommand.Parameters.AddWithValue("@bankCode", string.IsNullOrEmpty(bankCode) ? (object)DBNull.Value : bankCode);
                        openingCommand.Parameters.AddWithValue("@includeAllBanks", includeAllBanks ? 1 : 0);

                        using (SqlDataReader openingReader = await openingCommand.ExecuteReaderAsync())
                        {
                            while (await openingReader.ReadAsync())
                            {
                                var account = openingReader.IsDBNull(0) ? "" : openingReader.GetString(0);
                                var accountCode = openingReader.IsDBNull(1) ? "" : openingReader.GetString(1);
                                var opening = openingReader.IsDBNull(2) ? 0 : openingReader.GetDecimal(2);
                                var key = $"{account}|{accountCode}";
                                openingBalances[key] = opening;
                            }
                        }
                    }

                    // Now get the current period data
                    string currentPeriodQuery = @"
            SELECT 
                MAX(Account) AS Account,
                AccountCode,
                SUM(Payments) AS TotalDebit,
                SUM(Receipts) AS TotalCredit,
                (SUM(Receipts) - SUM(Payments)) AS Balance
            FROM (
                -- Opening Balance within selected period
                SELECT MAX(o.AccountName) AS Account,
                    o.AccountCode AS AccountCode,
                    SUM(o.DRAmt) AS Payments, 
                    SUM(o.CRAmt) AS Receipts
                FROM tblOpeningBal o
                WHERE o.OpeningDate BETWEEN @startDate AND @endDate
                AND o.CompanyID = @CompanyID
                AND o.IsActive = 1
                AND o.AccountCode NOT LIKE '50%'
                AND LEN(o.AccountCode) <> 4
                AND (@includeAllBanks = 1 OR o.AccountCode = @bankCode)
                GROUP BY o.AccountCode

                UNION ALL

                -- Receipts within selected period
                SELECT r.NominalAccount AS Account,
                    r.NominalAccountCode AS AccountCode,
                    0 AS Payments, 
                    r.Amount AS Receipts
                FROM tblBankReceipts r
                WHERE r.Date BETWEEN @startDate AND @endDate
                AND r.CompanyID = @CompanyID
                AND r.IsActive = 1
                AND r.NominalAccountCode NOT LIKE '50%'
                AND LEN(r.NominalAccountCode) <> 4
                AND (@includeAllBanks = 1 OR r.NominalAccountCode = @bankCode)

                UNION ALL

                -- Payments within selected period
                SELECT p.NominalAccount AS Account, 
                    p.NominalAccountCode AS AccountCode,
                    p.Amount AS Payments, 
                    0 AS Receipts
                FROM tblBankPayments p
                WHERE p.Date BETWEEN @startDate AND @endDate
                AND p.CompanyID = @CompanyID
                AND p.IsActive = 1
                AND p.NominalAccountCode NOT LIKE '50%'
                AND LEN(p.NominalAccountCode) <> 4
                AND (@includeAllBanks = 1 OR p.NominalAccountCode = @bankCode)

                UNION ALL

                -- Journal Vouchers (From Account → Debit) within selected period
                SELECT j.FromAccount AS Account,
                    j.FromAccountCode AS AccountCode,
                    j.Amount AS Payments, 
                    0 AS Receipts
                FROM tblJournalVoucher j
                WHERE j.Date BETWEEN @startDate AND @endDate
                AND j.CompanyID = @CompanyID
                AND j.IsActive = 1
                AND j.FromAccountCode NOT LIKE '50%'
                AND LEN(j.FromAccountCode) <> 4
                AND (@includeAllBanks = 1 OR j.FromAccountCode = @bankCode)

                UNION ALL

                -- Journal Vouchers (To Account → Credit) within selected period
                SELECT j.ToAccount AS Account,
                    j.ToAccountCode AS AccountCode,
                    0 AS Payments, 
                    j.Amount AS Receipts
                FROM tblJournalVoucher j
                WHERE j.Date BETWEEN @startDate AND @endDate
                AND j.CompanyID = @CompanyID
                AND j.IsActive = 1
                AND j.ToAccountCode NOT LIKE '50%'
                AND LEN(j.ToAccountCode) <> 4
                AND (@includeAllBanks = 1 OR j.ToAccountCode = @bankCode)
            ) AS Combined
            GROUP BY AccountCode
            ORDER BY Account";


                    var accountSummaries = new List<object>();

                    using (SqlCommand command = new SqlCommand(currentPeriodQuery, connection))
                    {
                        command.Parameters.AddWithValue("@startDate", (object)startDate ?? DBNull.Value);
                        command.Parameters.AddWithValue("@endDate", (object)endDate ?? DBNull.Value);
                        command.Parameters.AddWithValue("@CompanyID", CompanyID);
                        command.Parameters.AddWithValue("@bankCode", string.IsNullOrEmpty(bankCode) ? (object)DBNull.Value : bankCode);
                        command.Parameters.AddWithValue("@includeAllBanks", includeAllBanks ? 1 : 0);

                        using (SqlDataReader reader = await command.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                var account = reader.IsDBNull(0) ? "" : reader.GetString(0);
                                var accountCode = reader.IsDBNull(1) ? "" : reader.GetString(1);
                                var totalDebit = reader.IsDBNull(2) ? 0 : reader.GetDecimal(2);
                                var totalCredit = reader.IsDBNull(3) ? 0 : reader.GetDecimal(3);
                                var periodBalance = reader.IsDBNull(4) ? 0 : reader.GetDecimal(4);

                                var key = $"{account}|{accountCode}";
                                var openingBalance = openingBalances.ContainsKey(key) ? openingBalances[key] : 0;
                                var closingBalance = openingBalance + periodBalance;

                                accountSummaries.Add(new
                                {
                                    Account = account,
                                    AccountCode = accountCode,
                                    OpeningBalance = openingBalance,
                                    TotalDebit = totalDebit,
                                    TotalCredit = totalCredit,
                                    Balance = periodBalance,
                                    ClosingBalance = closingBalance
                                });
                            }
                        }
                    }

                    return Ok(new
                    {
                        listofRecords = accountSummaries,
                        totalOpeningBalance = accountSummaries.Sum(a => (decimal)a.GetType().GetProperty("OpeningBalance").GetValue(a)),
                        totalDebit = accountSummaries.Sum(a => (decimal)a.GetType().GetProperty("TotalDebit").GetValue(a)),
                        totalCredit = accountSummaries.Sum(a => (decimal)a.GetType().GetProperty("TotalCredit").GetValue(a)),
                        totalBalance = accountSummaries.Sum(a => (decimal)a.GetType().GetProperty("Balance").GetValue(a)),
                        totalClosingBalance = accountSummaries.Sum(a => (decimal)a.GetType().GetProperty("ClosingBalance").GetValue(a)),
                        status_code = 1,
                        status_message = "Successfully returning Accounts Summary with Opening Balance",
                        recordCount = accountSummaries.Count,
                    });
                }
            }
            catch (Exception ex)
            {
                return Ok(new
                {
                    status_code = 0,
                    status_message = "Sorry! Something went wrong",
                    error = ex.Message,
                    listofRecords = new List<object>(),
                    totalOpeningBalance = 0,
                    totalDebit = 0,
                    totalCredit = 0,
                    totalBalance = 0,
                    totalClosingBalance = 0
                });
            }
        }


        [HttpGet("GetReceiptBodyDetails/{companyId}")]
        public async Task<IActionResult> GetReceiptBodiesByCompanyId(int companyId)
        {
            try
            {
                // Fetch data based on CompanyID
                var receiptBodies = await context.tblReceiptBody
                                                  .Where(rb => rb.CompanyID == companyId)
                                                  .ToListAsync();

                if (receiptBodies == null || !receiptBodies.Any())
                {
                    return NotFound(new { message = "No data found for the specified CompanyID." });
                }

                return Ok(receiptBodies);
            }
            catch (Exception ex)
            {

                return StatusCode(500, new { message = "An error occurred.", error = ex.Message });
            }
        }

        [HttpGet("GetPaymentBodyDetails/{companyId}")]
        public async Task<IActionResult> GetPaymentBodiesByCompanyId(int companyId)
        {
            try
            {
                // Fetch data based on CompanyID
                var receiptBodies = await context.tblPaymentBody
                                                  .Where(rb => rb.CompanyID == companyId)
                                                  .ToListAsync();

                if (receiptBodies == null || !receiptBodies.Any())
                {
                    return NotFound(new { message = "No data found for the specified CompanyID." });
                }

                return Ok(receiptBodies);
            }
            catch (Exception ex)
            {

                return StatusCode(500, new { message = "An error occurred.", error = ex.Message });
            }
        }

        [HttpGet("GetReceiptTransactions/{companyId}")]
        public async Task<IActionResult> GetSeparateTransactions(
        int companyId,
        [FromQuery] string customerAccountCode,
        [FromQuery] string period,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        [FromQuery] bool includeAllCustomers = false)
                    {
                        if (!includeAllCustomers && string.IsNullOrEmpty(customerAccountCode))
                        {
                            return BadRequest(new { Message = "Customer is required when includeAllCustomers is false." });
                        }
                        DateTime now = DateTime.Now;
                        try
                        {


                            if (period == "week")
                            {
                                startDate = now.AddDays(-7);
                                endDate = now;
                            }
                            else if (period == "month")
                            {
                                startDate = now.AddMonths(-1);
                                endDate = now;
                            }
                            else if (period == "last60Days")
                            {
                                startDate = now.AddDays(-60);
                                endDate = now;
                            }
                            else if (period == "last30Days")
                            {
                                startDate = now.AddDays(-30);
                                endDate = now;
                            }
                            else if (period == "last90Days")
                            {
                                startDate = now.AddDays(-90);
                                endDate = now;
                            }
                            else if (period == "last365Days")
                            {
                                startDate = now.AddDays(-365);
                                endDate = now;
                            }
                            else if (period == "year")
                            {
                                startDate = new DateTime(now.Year, 1, 1);
                                endDate = now;
                            }
                            else if (period == "today")
                            {
                                startDate = now.Date;
                                endDate = now.Date;
                            }
                            else if (period == "all")
                            {
                                startDate = now.AddYears(-10);
                                endDate = now;
                            }
                            else if (period == "custom")
                            {
                                if (startDate == null || endDate == null)
                                {
                                    return Ok(new { status_message = "For 'custom' period, both startDate and endDate must be provided.", status_code = 0 });
                                }
                            }


                            var headQuery = new StringBuilder(@"
                            SELECT * 
                            FROM tblReceiptHead 
                            WHERE CompanyID = @CompanyID 
                                AND IsActive = 1 
                                AND InComplete = 0");

                            var parameters = new List<SqlParameter>
                    {
                        new SqlParameter("@CompanyID", companyId)
                    };


                            if (customerAccountCode != "all")
                            {
                                headQuery.Append(" AND CustomerAccountCode = @customerAccountCode");
                                parameters.Add(new SqlParameter("@customerAccountCode", customerAccountCode));
                            }



                            if (startDate.HasValue)
                            {
                                headQuery.Append(" AND Date >= @StartDate");
                                parameters.Add(new SqlParameter("@StartDate", startDate.Value));
                            }
                            if (endDate.HasValue)
                            {
                                headQuery.Append(" AND Date <= @EndDate");
                                parameters.Add(new SqlParameter("@EndDate", endDate.Value));
                            }


                            headQuery.Append(" ORDER BY VoucherNo DESC");


                            var receiptHeads = await context.tblReceiptHead
                                .FromSqlRaw(headQuery.ToString(), parameters.ToArray())
                                .ToListAsync();


                            if (!receiptHeads.Any())
                            {
                                return Ok(new
                                {
                                    HeadTransactions = new List<object>(),
                                    StatusCode = 1
                                });
                            }


                            var voucherNumbers = receiptHeads.Select(h => h.VoucherNo).ToList();
                            var voucherList = string.Join(",", voucherNumbers);

                            var bodyQuery = $@"
                        SELECT * 
                        FROM tblReceiptBody 
                        WHERE CompanyID = @CompanyID 
                            AND IsActive = 1 
                            AND Receipt != 0 
                            AND VoucherNo IN ({voucherList})";

                            var bodyParams = new List<SqlParameter>
                    {
                        new SqlParameter("@CompanyID", companyId)
                    };

                            var receiptBodies = await context.tblReceiptBody
                                .FromSqlRaw(bodyQuery, bodyParams.ToArray())
                                .ToListAsync();


                            var headTransactions = receiptHeads.Select(rh => new
                            {
                                rh.VoucherNo,
                                rh.Date,
                                rh.Amount,
                                rh.CustomerAccountCode,
                                rh.CustomerName,
                                rh.Total,
                                rh.Bank,
                                rh.ReceiptType,
                                rh.ID,
                                ReceiptBodies = receiptBodies
                                    .Where(rb => rb.VoucherNo == rh.VoucherNo)
                                    .Select(rb => new
                                    {
                                        rb.CreatedDate,
                                        rb.Amount,
                                        rb.Total,
                                        rb.VoucherNo,
                                        rb.InvoiceNo,
                                        rb.ReceiptType,
                                        rb.ID
                                    }).ToList()
                            });

                            return Ok(new
                            {
                                HeadTransactions = headTransactions,
                    StatusCode = 1
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Message = "An error occurred while processing your request.",
                    Details = ex.Message
                });
            }
        }

        [HttpGet("GetPaymentTransactions/{companyId}")]
        public async Task<IActionResult> GetPaymentTransactions(int companyId,
        [FromQuery] string supplierAccountCode,
        [FromQuery] string period,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        [FromQuery] bool includeAllSuppliers = false)
        {
            if (!includeAllSuppliers && string.IsNullOrEmpty(supplierAccountCode))
            {
                return BadRequest(new { Message = "Supplier is required when includeAllSuppliers is false." });
            }
            DateTime now = DateTime.Now;
            try
            {


                if (period == "week")
                {
                    startDate = now.AddDays(-7);
                    endDate = now;
                }
                else if (period == "month")
                {
                    startDate = now.AddMonths(-1);
                    endDate = now;
                }
                else if (period == "last60Days")
                {
                    startDate = now.AddDays(-60);
                    endDate = now;
                }
                else if (period == "last30Days")
                {
                    startDate = now.AddDays(-30);
                    endDate = now;
                }
                else if (period == "last90Days")
                {
                    startDate = now.AddDays(-90);
                    endDate = now;
                }
                else if (period == "last365Days")
                {
                    startDate = now.AddDays(-365);
                    endDate = now;
                }
                else if (period == "year")
                {
                    startDate = new DateTime(now.Year, 1, 1);
                    endDate = now;
                }
                else if (period == "today")
                {
                    startDate = now.Date;
                    endDate = now.Date;
                }
                else if (period == "all")
                {
                    startDate = now.AddYears(-10);
                    endDate = now;
                }
                else if (period == "custom")
                {
                    if (startDate == null || endDate == null)
                    {
                        return Ok(new { status_message = "For 'custom' period, both startDate and endDate must be provided.", status_code = 0 });
                    }
                }


                var headQuery = new StringBuilder(@"
                SELECT * 
                FROM tblPaymentHead 
                WHERE CompanyID = @CompanyID 
                AND IsActive = 1 
                AND InComplete = 0");

                var parameters = new List<SqlParameter>
        {
            new SqlParameter("@CompanyID", companyId)
        };

                if (supplierAccountCode != "all")
                {
                    headQuery.Append(" AND SupplierAccountCode = @supplierAccountCode");
                    parameters.Add(new SqlParameter("@supplierAccountCode", supplierAccountCode));
                }



                if (startDate.HasValue)
                {
                    headQuery.Append(" AND Date >= @StartDate");
                    parameters.Add(new SqlParameter("@StartDate", startDate.Value));
                }
                if (endDate.HasValue)
                {
                    headQuery.Append(" AND Date <= @EndDate");
                    parameters.Add(new SqlParameter("@EndDate", endDate.Value));
                }


                headQuery.Append(" ORDER BY VoucherNo DESC");


                var paymentHeads = await context.tblPaymentHead
                    .FromSqlRaw(headQuery.ToString(), parameters.ToArray())
                    .ToListAsync();


                if (!paymentHeads.Any())
                {
                    return Ok(new
                    {
                        HeadTransactions = new List<object>(),
                        StatusCode = 1
                    });
                }

                // Build body query with voucher numbers
                var voucherNumbers = paymentHeads.Select(h => h.VoucherNo).ToList();
                var voucherList = string.Join(",", voucherNumbers);

                var bodyQuery = $@"
            SELECT * 
            FROM tblPaymentBody 
            WHERE CompanyID = @CompanyID 
                AND IsActive = 1 
                AND Payment != 0 
                AND VoucherNo IN ({voucherList})";

                var bodyParams = new List<SqlParameter>
        {
            new SqlParameter("@CompanyID", companyId)
        };

                var paymentBodies = await context.tblPaymentBody
                    .FromSqlRaw(bodyQuery, bodyParams.ToArray())
                    .ToListAsync();

                var headTransactions = paymentHeads.Select(rh => new
                {
                    rh.VoucherNo,
                    rh.Date,
                    rh.Amount,
                    rh.SupplierName,
                    rh.SupplierAccountCode,
                    rh.Total,
                    rh.Bank,
                    rh.PurchaseType,
                    rh.ID,
                    PaymentBodies = paymentBodies
                        .Where(rb => rb.VoucherNo == rh.VoucherNo)
                        .Select(rb => new
                        {
                            rb.CreatedDate,
                            rb.Amount,
                            rb.Total,
                            rb.VoucherNo,
                            rb.BillID,
                            rb.PurchaseType,
                            rb.ID
                        }).ToList()
                });

                return Ok(new
                {
                    HeadTransactions = headTransactions,
                    StatusCode = 1
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Message = "An error occurred while processing your request.",
                    Details = ex.Message
                });
            }
        }

        [HttpGet("GetProductSummaryByCategory/{companyId}")]
        public async Task<IActionResult> GetProductTransactions(
        int companyId,
        [FromQuery] string category,
        [FromQuery] string period,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        [FromQuery] bool includeAllProducts = false)
        {
            if (!includeAllProducts && string.IsNullOrEmpty(category))
            {
                return BadRequest(new { Message = "Category is required when includeAllProducts is false." });
            }
            DateTime now = DateTime.Now;
            try
            {
                // Set date range based on period
                switch (period)
                {
                    case "week":
                        startDate = now.AddDays(-7);
                        endDate = now;
                        break;
                    case "month":
                        startDate = now.AddMonths(-1);
                        endDate = now;
                        break;
                    case "last60Days":
                        startDate = now.AddDays(-60);
                        endDate = now;
                        break;
                    case "last30days":
                        startDate = now.AddDays(-30);
                        endDate = now;
                        break;
                    case "last90days":
                        startDate = now.AddDays(-90);
                        endDate = now;
                        break;
                    case "last365days":
                        startDate = now.AddDays(-365);
                        endDate = now;
                        break;
                    case "year":
                        startDate = new DateTime(now.Year, 1, 1);
                        endDate = now;
                        break;
                    case "today":
                        startDate = now.Date;
                        endDate = now.Date;
                        break;
                    case "all":
                        startDate = now.AddYears(-10);
                        endDate = now;
                        break;
                    case "custom":
                        if (startDate == null || endDate == null)
                        {
                            return Ok(new
                            {
                                status_message = "For 'custom' period, both startDate and endDate must be provided.",
                                status_code = 0
                            });
                        }
                        break;
                }

                // Build the base query
                var headQuery = new StringBuilder(@"
            SELECT * 
            FROM tblDropdownData
            WHERE CompanyID = @CompanyID 
            AND Type = 'ProductCategory'
                AND IsActive = 1");

                var parameters = new List<SqlParameter>
            {
                new SqlParameter("@CompanyID", companyId)
            };

                if (category != "all")
                {
                    headQuery.Append(" AND Name = @category");
                    parameters.Add(new SqlParameter("@category", category));
                }

                var productHeads = await context.tblDropdownData
                    .FromSqlRaw(headQuery.ToString(), parameters.ToArray())
                    .ToListAsync();

                if (!productHeads.Any())
                {
                    return Ok(new
                    {
                        HeadTransactions = new List<object>(),
                        StatusCode = 1
                    });
                }

                // Get unique categories
                var categoryList = productHeads.Select(h => h.Name).Distinct().ToList();

                // Dynamically create SQL parameters for the IN clause
                var inClauseParameters = new List<string>();
                var bodyParams = new List<SqlParameter> { new SqlParameter("@CompanyID", companyId) };

                for (int i = 0; i < categoryList.Count; i++)
                {
                    var paramName = $"@Category{i}";
                    inClauseParameters.Add(paramName);
                    bodyParams.Add(new SqlParameter(paramName, categoryList[i]));
                }

                var inClause = categoryList.Count > 0 ? $"AND Category IN ({string.Join(",", inClauseParameters)})" : "";

                var bodyQuery = $@"
            SELECT * 
            FROM tblProducts 
            WHERE CompanyID = @CompanyID 
                AND IsActive = 1 
                {inClause}";

                var productBodies = await context.tblProducts
                    .FromSqlRaw(bodyQuery, bodyParams.ToArray())
                    .ToListAsync();

                var headTransactions = productHeads.Select(rh => new
                {
                    rh.Name,
                    rh.ID,
                    ProductBodies = productBodies
                        .Where(rb => rb.Category == rh.Name)
                        .Select(rb => new
                        {
                            rb.CreatedDate,
                            rb.Name,
                            rb.OpeningQuantity,
                            rb.SalePrice,
                            rb.ID
                        }).ToList()
                });

                return Ok(new
                {
                    HeadTransactions = headTransactions,
                    StatusCode = 1
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Message = "An error occurred while processing your request.",
                    Details = ex.Message
                });
            }
        }

        [HttpGet("GetInvoiceTransactions/{companyId}")]
        public async Task<IActionResult> GetInvoiceTransactions(
        int companyId,
        [FromQuery] string customerAccountCode,
        [FromQuery] string period,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        [FromQuery] bool includeAllCustomers = false)
        {
            if (!includeAllCustomers && string.IsNullOrEmpty(customerAccountCode))
            {
                return BadRequest(new { Message = "Customer is required when includeAllCustomers is false." });
            }
            DateTime now = DateTime.Now;
            try
            {


                if (period == "week")
                {
                    startDate = now.AddDays(-7);
                    endDate = now;
                }
                else if (period == "month")
                {
                    startDate = now.AddMonths(-1);
                    endDate = now;
                }
                else if (period == "last60Days")
                {
                    startDate = now.AddDays(-60);
                    endDate = now;
                }
                else if (period == "last30Days")
                {
                    startDate = now.AddDays(-30);
                    endDate = now;
                }
                else if (period == "last90Days")
                {
                    startDate = now.AddDays(-90);
                    endDate = now;
                }
                else if (period == "last365Days")
                {
                    startDate = now.AddDays(-365);
                    endDate = now;
                }
                else if (period == "year")
                {
                    startDate = new DateTime(now.Year, 1, 1);
                    endDate = now;
                }
                else if (period == "today")
                {
                    startDate = now.Date;
                    endDate = now.Date;
                }
                else if (period == "all")
                {
                    startDate = now.AddYears(-10);
                    endDate = now;
                }
                else if (period == "custom")
                {
                    if (startDate == null || endDate == null)
                    {
                        return Ok(new { status_message = "For 'custom' period, both startDate and endDate must be provided.", status_code = 0 });
                    }
                }


                var headQuery = new StringBuilder(@"
                SELECT * 
                FROM tblSaleHead 
                WHERE CompanyID = @CompanyID 
                    AND IsActive = 1
                    AND InvoiceNo != 0");

                var parameters = new List<SqlParameter>
        {
            new SqlParameter("@CompanyID", companyId)
        };


                if (customerAccountCode != "all")
                {
                    headQuery.Append(" AND CustomerAccountCode = @customerAccountCode");
                    parameters.Add(new SqlParameter("@customerAccountCode", customerAccountCode));
                }



                if (startDate.HasValue)
                {
                    headQuery.Append(" AND Date >= @StartDate");
                    parameters.Add(new SqlParameter("@StartDate", startDate.Value));
                }
                if (endDate.HasValue)
                {
                    headQuery.Append(" AND Date <= @EndDate");
                    parameters.Add(new SqlParameter("@EndDate", endDate.Value));
                }


                headQuery.Append(" ORDER BY InvoiceNo DESC");


                var receiptHeads = await context.tblSaleHead
                    .FromSqlRaw(headQuery.ToString(), parameters.ToArray())
                    .ToListAsync();


                if (!receiptHeads.Any())
                {
                    return Ok(new
                    {
                        HeadTransactions = new List<object>(),
                        StatusCode = 1
                    });
                }


                var voucherNumbers = receiptHeads.Select(h => h.InvoiceNo).ToList();
                var voucherList = string.Join(",", voucherNumbers);

                var bodyQuery = $@"
            SELECT * 
            FROM tblSaleBody 
            WHERE CompanyID = @CompanyID 
                AND IsActive = 1 
                AND InvoiceNo IN ({voucherList})";

                var bodyParams = new List<SqlParameter>
        {
            new SqlParameter("@CompanyID", companyId)
        };

                var receiptBodies = await context.tblSaleBody
                    .FromSqlRaw(bodyQuery, bodyParams.ToArray())
                    .ToListAsync();


                var headTransactions = receiptHeads.Select(rh => new
                {
                    rh.InvoiceNo,
                    rh.Date,
                    rh.Total,
                    rh.DocNo,
                    rh.CustomerName,
                    rh.CustomerAccountCode,
                    rh.SaleType,
                    rh.ID,
                    rh.InComplete,
                    ReceiptBodies = receiptBodies
                        .Where(rb => rb.InvoiceNo == rh.InvoiceNo)
                        .Select(rb => new
                        {
                            rb.CreatedDate,
                            rb.Amount,
                            rb.Product,
                            rb.Quantity,
                            rb.Rate,
                            rb.InvoiceNo,
                            rb.SaleType,
                            rb.ID
                        }).ToList()
                });

                return Ok(new
                {
                    HeadTransactions = headTransactions,
                    StatusCode = 1
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Message = "An error occurred while processing your request.",
                    Details = ex.Message
                });
            }
        }

        [HttpGet("GetPurchaseTransactions/{companyId}")]
        public async Task<IActionResult> GetPurchaseTransactions(
        int companyId,
        [FromQuery] string supplierAccountCode,
        [FromQuery] string period,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        [FromQuery] bool includeAllSuppliers = false)
        {
            if (!includeAllSuppliers && string.IsNullOrEmpty(supplierAccountCode))
            {
                return BadRequest(new { Message = "Supplier is required when includeAllSuppliers is false." });
            }
            DateTime now = DateTime.Now;
            try
            {


                if (period == "week")
                {
                    startDate = now.AddDays(-7);
                    endDate = now;
                }
                else if (period == "month")
                {
                    startDate = now.AddMonths(-1);
                    endDate = now;
                }
                else if (period == "last60Days")
                {
                    startDate = now.AddDays(-60);
                    endDate = now;
                }
                else if (period == "last30Days")
                {
                    startDate = now.AddDays(-30);
                    endDate = now;
                }
                else if (period == "last90Days")
                {
                    startDate = now.AddDays(-90);
                    endDate = now;
                }
                else if (period == "last365Days")
                {
                    startDate = now.AddDays(-365);
                    endDate = now;
                }
                else if (period == "year")
                {
                    startDate = new DateTime(now.Year, 1, 1);
                    endDate = now;
                }
                else if (period == "today")
                {
                    startDate = now.Date;
                    endDate = now.Date;
                }
                else if (period == "all")
                {
                    startDate = now.AddYears(-10);
                    endDate = now;
                }
                else if (period == "custom")
                {
                    if (startDate == null || endDate == null)
                    {
                        return Ok(new { status_message = "For 'custom' period, both startDate and endDate must be provided.", status_code = 0 });
                    }
                }


                var headQuery = new StringBuilder(@"
        SELECT * 
        FROM tblPurchaseHead 
        WHERE CompanyID = @CompanyID 
            AND IsActive = 1
            AND BillID != 0");

                var parameters = new List<SqlParameter>
{
    new SqlParameter("@CompanyID", companyId)
};


                if (supplierAccountCode != "all")
                {
                    headQuery.Append(" AND SupplierAccountCode = @supplierAccountCode");
                    parameters.Add(new SqlParameter("@supplierAccountCode", supplierAccountCode));
                }



                if (startDate.HasValue)
                {
                    headQuery.Append(" AND Date >= @StartDate");
                    parameters.Add(new SqlParameter("@StartDate", startDate.Value));
                }
                if (endDate.HasValue)
                {
                    headQuery.Append(" AND Date <= @EndDate");
                    parameters.Add(new SqlParameter("@EndDate", endDate.Value));
                }


                headQuery.Append(" ORDER BY BillID DESC");


                var purchaseHeads = await context.tblPurchaseHead
                    .FromSqlRaw(headQuery.ToString(), parameters.ToArray())
                    .ToListAsync();


                if (!purchaseHeads.Any())
                {
                    return Ok(new
                    {
                        HeadTransactions = new List<object>(),
                        StatusCode = 1
                    });
                }


                var voucherNumbers = purchaseHeads.Select(h => h.BillID).ToList();
                var voucherList = string.Join(",", voucherNumbers);

                var bodyQuery = $@"
    SELECT * 
    FROM tblPurchaseBody 
    WHERE CompanyID = @CompanyID 
        AND IsActive = 1 
        AND BillID IN ({voucherList})";

                var bodyParams = new List<SqlParameter>
{
    new SqlParameter("@CompanyID", companyId)
};

                var purchaseBodies = await context.tblPurchaseBody
                    .FromSqlRaw(bodyQuery, bodyParams.ToArray())
                    .ToListAsync();


                var headTransactions = purchaseHeads.Select(ph => new
                {
                    ph.BillID,
                    ph.Date,
                    ph.Total,
                    ph.BillNumber,
                    ph.SupplierName,
                    ph.SupplierAccountCode,
                    ph.PurchaseType,
                    ph.ID,
                    ph.InComplete,
                    PurchaseBodies = purchaseBodies
                        .Where(pb => pb.BillID == ph.BillID)
                        .Select(pb => new
                        {
                            pb.CreatedDate,
                            pb.Amount,
                            pb.Product,
                            pb.Quantity,
                            pb.Rate,
                            pb.BillID,
                            pb.PurchaseType,
                            pb.ID
                        }).ToList()
                });

                return Ok(new
                {
                    HeadTransactions = headTransactions,
                    StatusCode = 1
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Message = "An error occurred while processing your request.",
                    Details = ex.Message
                });
            }
        }







    }
}

