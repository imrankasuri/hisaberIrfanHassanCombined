using HisaberAccountServer.Data;
using HisaberAccountServer.Models;
using HisaberAccountServer.Models.Sales;
using HisaberAccountServer.Models.Purchase;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace HisaberAccountServer.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        private readonly HisaberDbContext context;

        public DashboardController(HisaberDbContext context)
        {
            this.context = context;
        }

        [HttpGet("GetDashboardData/{CompanyID}")]
        public async Task<IActionResult> GetDashboardData(int CompanyID)
        {
            try
            {
                var now = DateTime.Now;
                var today = now.Date;
                var startOfWeek = today.AddDays(-(int)today.DayOfWeek);
                var startOfMonth = new DateTime(now.Year, now.Month, 1);
                var startOfYear = new DateTime(now.Year, 1, 1);

                // Sales metrics for different periods
                var todaySales = await GetSalesForPeriod(CompanyID, today, today);
                var weekSales = await GetSalesForPeriod(CompanyID, startOfWeek, today);
                var monthSales = await GetSalesForPeriod(CompanyID, startOfMonth, today);
                var yearSales = await GetSalesForPeriod(CompanyID, startOfYear, today);

                // Revenue vs Expenses for the year
                var revenueExpenses = await GetRevenueExpensesForYear(CompanyID, now.Year);

                // Top Products
                var topProducts = await GetTopProducts(CompanyID, "quarter");

                // Top Customers
                var topCustomers = await GetTopCustomers(CompanyID, "year");

                // Invoices status
                var invoices = await GetInvoicesStatus(CompanyID);

                // Cash and Banks
                var cashBanks = await GetCashAndBanks(CompanyID);

                // Low Inventory
                var lowInventory = await GetLowInventory(CompanyID);

                // Expenses breakdown (using supplier payments as proxy for expenses)
                var expenses = await GetExpensesBreakdown(CompanyID, "quarter");

                // Profit & Loss for current month
                var profitLoss = await GetProfitLoss(CompanyID, startOfMonth, today);

                var dashboardData = new
                {
                    salesMetrics = new
                    {
                        today = new { amount = todaySales, change = 0, percentage = 0 },
                        lastWeek = new { amount = weekSales, change = 0, percentage = 0 },
                        thisMonth = new { amount = monthSales, change = 0, percentage = 0 },
                        thisYear = new { amount = yearSales, change = 0, percentage = 0 }
                    },
                    revenueExpenses,
                    topProducts,
                    topCustomers,
                    invoices,
                    cashBanks,
                    lowInventory,
                    expenses,
                    profitLoss
                };

                return Ok(new { status_message = "Dashboard data retrieved successfully", status_code = 1, data = dashboardData });
            }
            catch (Exception ex)
            {
                return Ok(new { status_message = $"Error retrieving dashboard data: {ex.Message}", status_code = 0 });
            }
        }

        [HttpGet("GetTopProducts/{CompanyID}/{period}")]
        public async Task<IActionResult> GetTopProducts(int CompanyID, string period)
        {
            try
            {
                var result = await GetTopProductsData(CompanyID, period);
                return Ok(new { status_message = "Top products retrieved successfully", status_code = 1, data = result });
            }
            catch (Exception ex)
            {
                return Ok(new { status_message = $"Error retrieving top products: {ex.Message}", status_code = 0 });
            }
        }

        [HttpGet("GetTopCustomers/{CompanyID}/{period}")]
        public async Task<IActionResult> GetTopCustomers(int CompanyID, string period)
        {
            try
            {
                var result = await GetTopCustomersData(CompanyID, period);
                return Ok(new { status_message = "Top customers retrieved successfully", status_code = 1, data = result });
            }
            catch (Exception ex)
            {
                return Ok(new { status_message = $"Error retrieving top customers: {ex.Message}", status_code = 0 });
            }
        }

        [HttpGet("GetExpensesBreakdown/{CompanyID}/{period}")]
        public async Task<IActionResult> GetExpensesBreakdown(int CompanyID, string period)
        {
            try
            {
                var result = await GetExpensesBreakdownData(CompanyID, period);
                return Ok(new { status_message = "Expenses breakdown retrieved successfully", status_code = 1, data = result });
            }
            catch (Exception ex)
            {
                return Ok(new { status_message = $"Error retrieving expenses breakdown: {ex.Message}", status_code = 0 });
            }
        }

        [HttpGet("GetProfitLoss/{CompanyID}/{period}")]
        public async Task<IActionResult> GetProfitLoss(int CompanyID, string period)
        {
            try
            {
                var result = await GetProfitLossData(CompanyID, period);
                return Ok(new { status_message = "Profit & Loss retrieved successfully", status_code = 1, data = result });
            }
            catch (Exception ex)
            {
                return Ok(new { status_message = $"Error retrieving profit & loss: {ex.Message}", status_code = 0 });
            }
        }

        private async Task<decimal> GetSalesForPeriod(int companyId, DateTime startDate, DateTime endDate)
        {
            return await context.tblSaleHead
                .Where(s => s.CompanyID == companyId && !s.IsDeleted && s.Date >= DateOnly.FromDateTime(startDate) && s.Date <= DateOnly.FromDateTime(endDate))
                .SumAsync(s => s.Total ?? 0);
        }

        private async Task<object> GetRevenueExpensesForYear(int companyId, int year)
        {
            var startDate = new DateTime(year, 1, 1);
            var endDate = new DateTime(year, 12, 31);

            var revenue = await context.tblReceiptHead
                .Where(s => s.CompanyID == companyId && !s.IsDeleted && s.Date >= DateOnly.FromDateTime(startDate) && s.Date <= DateOnly.FromDateTime(endDate))
                .SumAsync(s => s.Total ?? 0);

            // Use supplier payments as a proxy for expenses
            var expenses = await context.tblPaymentHead
                .Where(p => p.CompanyID == companyId && !p.IsDeleted && p.Date >= DateOnly.FromDateTime(startDate) && p.Date <= DateOnly.FromDateTime(endDate))
                .SumAsync(p => p.Total ?? 0);

            var ratio = revenue > 0 ? (expenses / revenue) * 100 : 0;

            // Monthly data for chart
            var monthlyData = new List<object>();
            for (int month = 1; month <= 12; month++)
            {
                var monthStart = new DateTime(year, month, 1);
                var monthEnd = monthStart.AddMonths(1).AddDays(-1);

                var monthRevenue = await context.tblReceiptHead
                    .Where(s => s.CompanyID == companyId && !s.IsDeleted && s.Date >= DateOnly.FromDateTime(monthStart) && s.Date <= DateOnly.FromDateTime(monthEnd))
                    .SumAsync(s => s.Total ?? 0);

                var monthExpenses = await context.tblPaymentHead
                    .Where(p => p.CompanyID == companyId && !p.IsDeleted && p.Date >= DateOnly.FromDateTime(monthStart) && p.Date <= DateOnly.FromDateTime(monthEnd))
                    .SumAsync(p => p.Total ?? 0);

                monthlyData.Add(new
                {
                    month = monthStart.ToString("MMM"),
                    revenue = monthRevenue,
                    expenses = monthExpenses
                });
            }

            return new
            {
                totalRevenue = revenue,
                totalExpenses = expenses,
                ratio = Math.Round(ratio, 2),
                monthlyData
            };
        }

        private async Task<object> GetTopProductsData(int companyId, string period)
        {
            var endDate = DateTime.Now;
            var startDate = period switch
            {
                "quarter" => endDate.AddMonths(-3),
                "month" => endDate.AddMonths(-1),
                "year" => new DateTime(endDate.Year, 1, 1),
                _ => endDate.AddMonths(-3)
            };

            var products = await context.tblSaleBody
                .Join(context.tblSaleHead, sb => sb.InvoiceNo, sh => sh.InvoiceNo, (sb, sh) => new { sb, sh })
                .Where(x => x.sh.CompanyID == companyId && !x.sh.IsDeleted && x.sh.Date >= DateOnly.FromDateTime(startDate) && x.sh.Date <= DateOnly.FromDateTime(endDate))
                .GroupBy(x => x.sb.Product ?? "Unknown Product")
                .Select(g => new
                {
                    productName = g.Key,
                    totalSales = g.Sum(x => (x.sb.Amount ?? 0) * (x.sb.Quantity ?? 0))
                })
                .OrderByDescending(x => x.totalSales)
                .Take(4)
                .ToListAsync();

            var total = products.Sum(p => p.totalSales);
            var result = products.Select((p, index) => new
            {
                name = p.productName,
                value = p.totalSales,
                percentage = total > 0 ? Math.Round((p.totalSales / total) * 100, 1) : 0.0m
            }).ToList();

            // Add "Other Products" if less than 4 products
            while (result.Count < 4)
            {
                result.Add(new { name = "Other Products", value = 0.0m, percentage = 0.0m });
            }

            return new
            {
                total,
                products = result
            };
        }

        private async Task<object> GetTopCustomersData(int companyId, string period)
        {
            var endDate = DateTime.Now;
            var startDate = period switch
            {
                "quarter" => endDate.AddMonths(-3),
                "month" => endDate.AddMonths(-1),
                "year" => new DateTime(endDate.Year, 1, 1),
                _ => new DateTime(endDate.Year, 1, 1)
            };

            var customers = await context.tblSaleHead
                .Where(s => s.CompanyID == companyId && !s.IsDeleted && s.Date >= DateOnly.FromDateTime(startDate) && s.Date <= DateOnly.FromDateTime(endDate))
                .GroupBy(s => s.CustomerName)
                .Select(g => new
                {
                    customerName = g.Key,
                    totalSales = g.Sum(s => s.Total ?? 0)
                })
                .OrderByDescending(x => x.totalSales)
                .Take(5)
                .ToListAsync();

            var total = customers.Sum(c => c.totalSales);
            var result = customers.Select((c, index) => new
            {
                name = c.customerName,
                value = c.totalSales,
                percentage = total > 0 ? Math.Round((c.totalSales / total) * 100, 2) : 0
            }).ToList();

            return new
            {
                total,
                customers = result
            };
        }

        private async Task<object> GetInvoicesStatus(int companyId)
        {
            var now = DateTime.Now;
            var today = now.Date;

            var invoiced = await context.tblSaleHead
                .Where(s => s.CompanyID == companyId && !s.IsDeleted && s.SaleType == "Invoice")
                .CountAsync();

            var overDue = await context.tblSaleHead
                .Where(s => s.CompanyID == companyId && !s.IsDeleted && s.SaleType == "Invoice" && s.DueDate < DateOnly.FromDateTime(today))
                .CountAsync();

            var paid = await context.tblSaleHead
                .Where(s => s.CompanyID == companyId && !s.IsDeleted && s.SaleType == "Invoice" && s.Balance <= 0)
                .CountAsync();

            var total = invoiced + overDue + paid;

            return new
            {
                invoiced,
                overDue,
                paid,
                total
            };
        }

        private async Task<List<object>> GetCashAndBanks(int companyId)
        {
            var cashBanks = new List<object>();

            // Get bank balances from OpeningBal
            var bankAccounts = await context.tblOpeningBal
                .Where(a => a.CompanyId == companyId && a.IsActive && !a.IsDeleted && a.AccountName.ToLower().Contains("bank"))
                .ToListAsync();

            foreach (var account in bankAccounts)
            {
                var balance = account.DRAmt - account.CRAmt;
                cashBanks.Add(new
                {
                    name = account.AccountName,
                    balance = balance
                });
            }

            // Add cash in hand
            var cashAccount = await context.tblOpeningBal
                .FirstOrDefaultAsync(a => a.CompanyId == companyId && a.IsActive && !a.IsDeleted && a.AccountName.ToLower().Contains("cash"));

            if (cashAccount != null)
            {
                var cashBalance = cashAccount.DRAmt - cashAccount.CRAmt;
                cashBanks.Add(new
                {
                    name = "Cash in Hand",
                    balance = cashBalance
                });
            }

            // Add undeposited funds (placeholder)
            cashBanks.Add(new
            {
                name = "Undeposited Funds",
                balance = 0
            });

            return cashBanks;
        }

        private async Task<object> GetLowInventory(int companyId)
        {
            var lowStockProducts = await context.tblProducts
                .Where(p => p.CompanyID == companyId && p.IsActive && (p.OpeningQuantity <= (p.LowStockLevel ?? 0)))
                .Select(p => new
                {
                    productName = p.Name,
                    currentStock = p.OpeningQuantity,
                    reorderLevel = p.LowStockLevel ?? 0
                })
                .Take(10)
                .ToListAsync();

            return new
            {
                hasData = lowStockProducts.Any(),
                products = lowStockProducts
            };
        }

        private async Task<object> GetExpensesBreakdownData(int companyId, string period)
        {
            var endDate = DateTime.Now;
            var startDate = period switch
            {
                "quarter" => endDate.AddMonths(-3),
                "month" => endDate.AddMonths(-1),
                "year" => new DateTime(endDate.Year, 1, 1),
                _ => endDate.AddMonths(-3)
            };

            // Use supplier payments as a proxy for expenses, grouped by supplier
            var expenses = await context.tblPaymentHead
                .Join(context.tblCustomerSupplier, ph => ph.SupplierAccountCode, cs => cs.AccountCode, (ph, cs) => new { ph, cs })
                .Where(x => x.ph.CompanyID == companyId && !x.ph.IsDeleted && x.ph.Date >= DateOnly.FromDateTime(startDate) && x.ph.Date <= DateOnly.FromDateTime(endDate))
                .GroupBy(x => x.cs.BusinessName ?? "Other")
                .Select(g => new
                {
                    category = g.Key,
                    amount = g.Sum(p => p.ph.Total ?? 0)
                })
                .OrderByDescending(x => x.amount)
                .Take(6)
                .ToListAsync();

            var total = expenses.Sum(e => e.amount);
            var result = expenses.Select(e => new
            {
                name = e.category,
                value = e.amount,
                percentage = total > 0 ? Math.Round((e.amount / total) * 100, 1) : 0
            }).ToList();

            return new
            {
                total,
                categories = result
            };
        }

        private async Task<object> GetProfitLossData(int companyId, string period)
        {
            var endDate = DateTime.Now;
            var startDate = period switch
            {
                "month" => new DateTime(endDate.Year, endDate.Month, 1),
                "quarter" => endDate.AddMonths(-3),
                "year" => new DateTime(endDate.Year, 1, 1),
                _ => new DateTime(endDate.Year, endDate.Month, 1)
            };

            var revenue = await context.tblReceiptHead
                .Where(s => s.CompanyID == companyId && !s.IsDeleted && s.Date >= DateOnly.FromDateTime(startDate) && s.Date <= DateOnly.FromDateTime(endDate))
                .SumAsync(s => s.Total ?? 0);

            var expenses = await context.tblPaymentHead
                .Where(p => p.CompanyID == companyId && !p.IsDeleted && p.Date >= DateOnly.FromDateTime(startDate) && p.Date <= DateOnly.FromDateTime(endDate))
                .SumAsync(p => p.Total ?? 0);

            return new
            {
                revenue,
                expenses,
                profit = revenue - expenses
            };
        }

        private async Task<object> GetProfitLoss(int companyId, DateTime startDate, DateTime endDate)
        {
            var revenue = await context.tblReceiptHead
                .Where(s => s.CompanyID == companyId && !s.IsDeleted && s.Date >= DateOnly.FromDateTime(startDate) && s.Date <= DateOnly.FromDateTime(endDate))
                .SumAsync(s => s.Total ?? 0);

            var expenses = await context.tblPaymentHead
                .Where(p => p.CompanyID == companyId && !p.IsDeleted && p.Date >= DateOnly.FromDateTime(startDate) && p.Date <= DateOnly.FromDateTime(endDate))
                .SumAsync(p => p.Total ?? 0);

            return new
            {
                revenue,
                expenses,
                profit = revenue - expenses
            };
        }
    }
}
