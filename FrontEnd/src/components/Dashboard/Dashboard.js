import React, { useEffect, useState } from "react";
import { Card, Row, Col, Statistic, Select, Spin, Alert } from "antd";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  BanknotesIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";
import Config from "../../Config";
import SubMenuToggle from "../Common/SubMenuToggle";

const { Option } = Select;

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

function Dashboard(props) {
  const AccessKey = localStorage.getItem("AccessKey");
  const UserID = localStorage.getItem("ID");
  const FullName = localStorage.getItem("Full_Name");
  const CompanyID = localStorage.getItem("CompanyID");

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Period filter states
  const [topProductsPeriod, setTopProductsPeriod] = useState("quarter");
  const [topCustomersPeriod, setTopCustomersPeriod] = useState("year");
  const [expensesPeriod, setExpensesPeriod] = useState("quarter");
  const [profitLossPeriod, setProfitLossPeriod] = useState("month");

  // Loading states for period-specific data
  const [periodDataLoading, setPeriodDataLoading] = useState(false);

  useEffect(() => {
    const CompanyName = localStorage.getItem("CompanyName");
    if (!AccessKey || !UserID || !FullName) {
      window.location.href = "/";
      return;
    }

    fetchDashboardData();
    document.title = "Dashboard";
  }, []);

  // Fetch data when period filters change
  useEffect(() => {
    if (dashboardData) {
      fetchPeriodSpecificData();
    }
  }, [topProductsPeriod, topCustomersPeriod, expensesPeriod, profitLossPeriod]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${Config.base_url}Dashboard/GetDashboardData/${CompanyID}`,
        {
          headers: { Authorization: `Bearer ${AccessKey}` },
        }
      );

      if (response.data.status_code === 1) {
        setDashboardData(response.data.data);
        // Fetch period-specific data after main dashboard data loads
        setTimeout(() => {
          fetchPeriodSpecificData();
        }, 100);
      } else {
        setError(response.data.status_message);
      }
    } catch (err) {
      setError("Failed to fetch dashboard data");
      console.error("Dashboard data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPeriodSpecificData = async () => {
    try {
      setPeriodDataLoading(true);

      // Fetch top products for selected period
      const productsResponse = await axios.get(
        `${Config.base_url}Dashboard/GetTopProducts/${CompanyID}/${topProductsPeriod}`,
        {
          headers: { Authorization: `Bearer ${AccessKey}` },
        }
      );

      // Fetch top customers for selected period
      const customersResponse = await axios.get(
        `${Config.base_url}Dashboard/GetTopCustomers/${CompanyID}/${topCustomersPeriod}`,
        {
          headers: { Authorization: `Bearer ${AccessKey}` },
        }
      );

      // Fetch expenses for selected period
      const expensesResponse = await axios.get(
        `${Config.base_url}Dashboard/GetExpensesBreakdown/${CompanyID}/${expensesPeriod}`,
        {
          headers: { Authorization: `Bearer ${AccessKey}` },
        }
      );

      // Fetch profit & loss for selected period
      const profitLossResponse = await axios.get(
        `${Config.base_url}Dashboard/GetProfitLoss/${CompanyID}/${profitLossPeriod}`,
        {
          headers: { Authorization: `Bearer ${AccessKey}` },
        }
      );

      // Update dashboard data with new period-specific data
      setDashboardData((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          topProducts:
            productsResponse.data.status_code === 1
              ? productsResponse.data.data
              : prev.topProducts,
          topCustomers:
            customersResponse.data.status_code === 1
              ? customersResponse.data.data
              : prev.topCustomers,
          expenses:
            expensesResponse.data.status_code === 1
              ? expensesResponse.data.data
              : prev.expenses,
          profitLoss:
            profitLossResponse.data.status_code === 1
              ? profitLossResponse.data.data
              : prev.profitLoss,
        };
      });
    } catch (err) {
      console.error("Period data fetch error:", err);
    } finally {
      setPeriodDataLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "PKR 0.00";
    if (amount >= 1000000) {
      return `PKR ${(amount / 1000000).toFixed(2)} M`;
    } else if (amount >= 1000) {
      return `PKR ${(amount / 1000).toFixed(2)} K`;
    }
    return `PKR ${amount.toFixed(2)}`;
  };

  const formatPercentage = (value) => {
    if (!value && value !== 0) return "0%";
    return `${value}%`;
  };

  if (loading) {
    return (
      <div className="right-side-contents">
        <div className="page-content">
          <div className="page-header">
            <SubMenuToggle />
            <h3 className="page-title">Dashboard</h3>
          </div>
          <div style={{ textAlign: "center", padding: "50px" }}>
            <Spin size="large" />
            <p>Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="right-side-contents">
        <div className="page-content">
          <div className="page-header">
            <SubMenuToggle />
            <h3 className="page-title">Dashboard</h3>
          </div>
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            style={{ margin: "20px" }}
          />
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const {
    salesMetrics,
    revenueExpenses,
    topProducts,
    topCustomers,
    invoices,
    cashBanks,
    lowInventory,
    expenses,
    profitLoss,
  } = dashboardData;

  // Safety checks for data
  const safeSalesMetrics = salesMetrics || {
    today: {},
    lastWeek: {},
    thisMonth: {},
    thisYear: {},
  };
  const safeRevenueExpenses = revenueExpenses || {
    totalRevenue: 0,
    totalExpenses: 0,
    ratio: 0,
    monthlyData: [],
  };
  const safeTopProducts = topProducts || { total: 0, products: [] };
  const safeTopCustomers = topCustomers || { total: 0, customers: [] };
  const safeInvoices = invoices || {
    invoiced: 0,
    overDue: 0,
    paid: 0,
    total: 0,
  };
  const safeCashBanks = cashBanks || [];
  const safeLowInventory = lowInventory || { hasData: false, products: [] };
  const safeExpenses = expenses || { total: 0, categories: [] };
  const safeProfitLoss = profitLoss || { revenue: 0, expenses: 0, profit: 0 };

  // Check if period-specific data exists, if not show loading
  const hasPeriodData =
    safeTopProducts &&
    safeTopProducts.products &&
    safeTopProducts.products.length > 0 &&
    safeTopCustomers &&
    safeTopCustomers.customers &&
    safeTopCustomers.customers.length > 0 &&
    safeExpenses &&
    safeExpenses.categories &&
    safeExpenses.categories.length > 0;

  // Enhanced Profit & Loss data with better colors and formatting
  const profitLossData = [
    {
      name: "Expenses",
      value: safeProfitLoss.expenses,
      color: "#ff4d4f",
      fill: "#ff7875",
      stroke: "#ff4d4f",
    },
    {
      name: "Revenue",
      value: safeProfitLoss.revenue,
      color: "#52c41a",
      fill: "#73d13d",
      stroke: "#52c41a",
    },
    {
      name: "Net Profit",
      value: safeProfitLoss.profit,
      color: safeProfitLoss.profit >= 0 ? "#1890ff" : "#fa8c16",
      fill: safeProfitLoss.profit >= 0 ? "#69c0ff" : "#ffc53d",
      stroke: safeProfitLoss.profit >= 0 ? "#1890ff" : "#fa8c16",
    },
  ];

  return (
    <div className="right-side-contents">
      <div className="page-content">
        <div className="page-header">
          <SubMenuToggle />
          <h3 className="page-title">Dashboard</h3>
        </div>

        {/* Sales Overview Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Today"
                value={formatCurrency(safeSalesMetrics.today?.amount || 0)}
                prefix={<CurrencyDollarIcon className="h-5 w-5" />}
                suffix={
                  <span
                    style={{
                      color:
                        (safeSalesMetrics.today?.percentage || 0) >= 0
                          ? "#52c41a"
                          : "#ff4d4f",
                    }}
                  >
                    {(safeSalesMetrics.today?.percentage || 0) >= 0 ? (
                      <ArrowUpIcon className="h-4 w-4" />
                    ) : (
                      <ArrowDownIcon className="h-4 w-4" />
                    )}
                    {formatPercentage(safeSalesMetrics.today?.percentage || 0)}
                  </span>
                }
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Last Week"
                value={formatCurrency(safeSalesMetrics.lastWeek?.amount || 0)}
                prefix={<CurrencyDollarIcon className="h-5 w-5" />}
                suffix={
                  <span
                    style={{
                      color:
                        (safeSalesMetrics.lastWeek?.percentage || 0) >= 0
                          ? "#52c41a"
                          : "#ff4d4f",
                    }}
                  >
                    {(safeSalesMetrics.lastWeek?.percentage || 0) >= 0 ? (
                      <ArrowUpIcon className="h-4 w-4" />
                    ) : (
                      <ArrowDownIcon className="h-4 w-4" />
                    )}
                    {formatPercentage(
                      safeSalesMetrics.lastWeek?.percentage || 0
                    )}
                  </span>
                }
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="This Month"
                value={formatCurrency(safeSalesMetrics.thisMonth?.amount || 0)}
                prefix={<CurrencyDollarIcon className="h-5 w-5" />}
                suffix={
                  <span
                    style={{
                      color:
                        (safeSalesMetrics.thisMonth?.percentage || 0) >= 0
                          ? "#52c41a"
                          : "#ff4d4f",
                    }}
                  >
                    {(safeSalesMetrics.thisMonth?.percentage || 0) >= 0 ? (
                      <ArrowUpIcon className="h-4 w-4" />
                    ) : (
                      <ArrowDownIcon className="h-4 w-4" />
                    )}
                    {formatPercentage(
                      safeSalesMetrics.thisMonth?.percentage || 0
                    )}
                  </span>
                }
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="This Year"
                value={formatCurrency(safeSalesMetrics.thisYear?.amount || 0)}
                prefix={<CurrencyDollarIcon className="h-5 w-5" />}
                suffix={
                  <span
                    style={{
                      color:
                        (safeSalesMetrics.thisYear?.percentage || 0) >= 0
                          ? "#52c41a"
                          : "#ff4d4f",
                    }}
                  >
                    {(safeSalesMetrics.thisYear?.percentage || 0) >= 0 ? (
                      <ArrowUpIcon className="h-4 w-4" />
                    ) : (
                      <ArrowDownIcon className="h-4 w-4" />
                    )}
                    {formatPercentage(
                      safeSalesMetrics.thisYear?.percentage || 0
                    )}
                  </span>
                }
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          {/* Left Column */}
          <Col xs={24} lg={16}>
            {/* Revenue vs Expenses */}
            <Card
              title="Revenue vs Expenses"
              style={{ marginBottom: "16px" }}
              extra={
                <div style={{ textAlign: "right" }}>
                  <div>
                    Total Revenue:{" "}
                    {formatCurrency(safeRevenueExpenses.totalRevenue)}
                  </div>
                  <div>
                    Total Expense:{" "}
                    {formatCurrency(safeRevenueExpenses.totalExpenses)}
                  </div>
                  <div>Revenue Expense Ratio: {safeRevenueExpenses.ratio}%</div>
                </div>
              }
            >
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={safeRevenueExpenses.monthlyData || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stackId="1"
                    stroke="#8884d8"
                    fill="#8884d8"
                    name="Revenue"
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    stackId="1"
                    stroke="#ff7300"
                    fill="#ff7300"
                    name="Expenses"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            {/* Top Products */}
            <Card
              title="Top Products"
              style={{ marginBottom: "16px" }}
              extra={
                <Select
                  value={topProductsPeriod}
                  onChange={setTopProductsPeriod}
                  style={{ width: 120 }}
                >
                  <Option value="quarter">This Quarter</Option>
                  <Option value="month">This Month</Option>
                  <Option value="year">This Year</Option>
                </Select>
              }
            >
              {periodDataLoading || !hasPeriodData ? (
                <div style={{ textAlign: "center", padding: "50px" }}>
                  <Spin size="large" />
                  <p>Loading products data...</p>
                </div>
              ) : (
                <Row gutter={16}>
                  <Col span={12}>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={safeTopProducts.products || []}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({
                            name,
                            percentage,
                            cx,
                            cy,
                            midAngle,
                            innerRadius,
                            outerRadius,
                          }) => {
                            const RADIAN = Math.PI / 180;
                            const radius =
                              innerRadius + (outerRadius - innerRadius) * 0.5;
                            const x =
                              cx + radius * Math.cos(-midAngle * RADIAN);
                            const y =
                              cy + radius * Math.sin(-midAngle * RADIAN);

                            return (
                              <text
                                x={x}
                                y={y}
                                fill="black"
                                textAnchor={x > cx ? "start" : "end"}
                                dominantBaseline="central"
                              >
                                {`${name}: ${percentage}%`}
                              </text>
                            );
                          }}
                          outerRadius={90}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {(safeTopProducts.products || []).map(
                            (entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            )
                          )}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Col>
                  <Col span={12}>
                    <div style={{ paddingTop: "20px" }}>
                      <h4>Total: {formatCurrency(safeTopProducts.total)}</h4>
                      {(safeTopProducts.products || []).map(
                        (product, index) => (
                          <div key={index} style={{ marginBottom: "8px" }}>
                            <span>{product.name}: </span>
                            <span style={{ fontWeight: "bold" }}>
                              {formatCurrency(product.value)}
                            </span>
                            <span style={{ color: "#666" }}>
                              {" "}
                              ({product.percentage}%)
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </Col>
                </Row>
              )}
            </Card>

            {/* Top Customers */}
            <Card
              title="Top Customers"
              style={{ marginBottom: "16px" }}
              extra={
                <Select
                  value={topCustomersPeriod}
                  onChange={setTopCustomersPeriod}
                  style={{ width: 120 }}
                >
                  <Option value="quarter">This Quarter</Option>
                  <Option value="month">This Month</Option>
                  <Option value="year">This Year</Option>
                </Select>
              }
            >
              {periodDataLoading || !hasPeriodData ? (
                <div style={{ textAlign: "center", padding: "50px" }}>
                  <Spin size="large" />
                  <p>Loading customers data...</p>
                </div>
              ) : (
                <Row gutter={16}>
                  <Col span={12}>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={safeTopCustomers.customers || []}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({
                            name,
                            percentage,
                            cx,
                            cy,
                            midAngle,
                            innerRadius,
                            outerRadius,
                          }) => {
                            const RADIAN = Math.PI / 180;
                            const radius =
                              innerRadius + (outerRadius - innerRadius) * 0.5;
                            const x =
                              cx + radius * Math.cos(-midAngle * RADIAN);
                            const y =
                              cy + radius * Math.sin(-midAngle * RADIAN);

                            return (
                              <text
                                x={x}
                                y={y}
                                fill="black"
                                textAnchor={x > cx ? "start" : "end"}
                                dominantBaseline="central"
                              >
                                {`${name}: ${percentage}%`}
                              </text>
                            );
                          }}
                          outerRadius={90}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {(safeTopCustomers.customers || []).map(
                            (entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            )
                          )}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Col>
                  <Col span={12}>
                    <div style={{ paddingTop: "20px" }}>
                      <h4>Total: {formatCurrency(safeTopCustomers.total)}</h4>
                      {(safeTopCustomers.customers || []).map(
                        (customer, index) => (
                          <div key={index} style={{ marginBottom: "8px" }}>
                            <span>{customer.name}: </span>
                            <span style={{ fontWeight: "bold" }}>
                              {formatCurrency(customer.value)}
                            </span>
                            <span style={{ color: "#666" }}>
                              {" "}
                              ({customer.percentage}%)
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </Col>
                </Row>
              )}
            </Card>

            {/* Enhanced Profit & Loss */}
            <Card
              title="Profit & Loss"
              style={{ marginBottom: "16px" }}
              extra={
                <Select
                  value={profitLossPeriod}
                  onChange={setProfitLossPeriod}
                  style={{ width: 120 }}
                >
                  <Option value="month">This Month</Option>
                  <Option value="quarter">This Quarter</Option>
                  <Option value="year">This Year</Option>
                </Select>
              }
            >
              <div style={{ marginBottom: "16px" }}>
                <Row gutter={16}>
                  <Col span={8}>
                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{
                          fontSize: "24px",
                          fontWeight: "bold",
                          color: "#52c41a",
                        }}
                      >
                        {formatCurrency(safeProfitLoss.revenue)}
                      </div>
                      <div style={{ color: "#666" }}>Revenue</div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{
                          fontSize: "24px",
                          fontWeight: "bold",
                          color: "#ff4d4f",
                        }}
                      >
                        {formatCurrency(safeProfitLoss.expenses)}
                      </div>
                      <div style={{ color: "#666" }}>Expenses</div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{
                          fontSize: "24px",
                          fontWeight: "bold",
                          color:
                            safeProfitLoss.profit >= 0 ? "#1890ff" : "#fa8c16",
                        }}
                      >
                        {formatCurrency(safeProfitLoss.profit)}
                      </div>
                      <div style={{ color: "#666" }}>
                        {safeProfitLoss.profit >= 0 ? "Net Profit" : "Net Loss"}
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>

              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={profitLossData}
                  layout="horizontal"
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    labelStyle={{ color: "#333" }}
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #ccc",
                      borderRadius: "6px",
                    }}
                  />
                  <Bar
                    dataKey="value"
                    fill={(entry) => entry.fill}
                    stroke={(entry) => entry.stroke}
                    strokeWidth={2}
                    radius={[4, 4, 0, 0]}
                  >
                    {profitLossData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          {/* Right Column */}
          <Col xs={24} lg={8}>
            {/* Invoices */}
            <Card
              title="Invoices"
              style={{ marginBottom: "16px" }}
              icon={<DocumentTextIcon className="h-5 w-5" />}
            >
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[
                      {
                        name: "Invoiced",
                        value: safeInvoices.invoiced,
                        color: "#1890ff",
                      },
                      {
                        name: "Over Due",
                        value: safeInvoices.overDue,
                        color: "#ff4d4f",
                      },
                      {
                        name: "Payment",
                        value: safeInvoices.paid,
                        color: "#52c41a",
                      },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({
                      name,
                      value,
                      cx,
                      cy,
                      midAngle,
                      innerRadius,
                      outerRadius,
                    }) => {
                      const RADIAN = Math.PI / 180;
                      const radius =
                        innerRadius + (outerRadius - innerRadius) * 0.5;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);

                      return (
                        <text
                          x={x}
                          y={y}
                          fill="black"
                          textAnchor={x > cx ? "start" : "end"}
                          dominantBaseline="central"
                        >
                          {`${name}: ${value}`}
                        </text>
                      );
                    }}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {[
                      {
                        name: "Invoiced",
                        value: safeInvoices.invoiced,
                        color: "#1890ff",
                      },
                      {
                        name: "Over Due",
                        value: safeInvoices.overDue,
                        color: "#ff4d4f",
                      },
                      {
                        name: "Payment",
                        value: safeInvoices.paid,
                        color: "#52c41a",
                      },
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            {/* Cash and Banks */}
            <Card
              title="Cash and Banks"
              style={{ marginBottom: "16px" }}
              icon={<BanknotesIcon className="h-5 w-5" />}
            >
              {safeCashBanks.length > 0 ? (
                safeCashBanks.map((account, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 0",
                      borderBottom:
                        index < safeCashBanks.length - 1
                          ? "1px solid #f0f0f0"
                          : "none",
                    }}
                  >
                    <span>{account.name}</span>
                    <span style={{ fontWeight: "bold" }}>
                      {formatCurrency(account.balance)}
                    </span>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    color: "#666",
                    padding: "20px",
                  }}
                >
                  No cash and bank data available.
                </div>
              )}
            </Card>

            {/* Low Inventory */}
            <Card
              title="Low Inventory"
              style={{ marginBottom: "16px" }}
              icon={<ExclamationTriangleIcon className="h-5 w-5" />}
            >
              {safeLowInventory.hasData ? (
                safeLowInventory.products.map((product, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 0",
                      borderBottom:
                        index < safeLowInventory.products.length - 1
                          ? "1px solid #f0f0f0"
                          : "none",
                    }}
                  >
                    <span>{product.productName}</span>
                    <span
                      style={{
                        color:
                          product.currentStock <= product.reorderLevel
                            ? "#ff4d4f"
                            : "#52c41a",
                        fontWeight: "bold",
                      }}
                    >
                      {product.currentStock}
                    </span>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    color: "#666",
                    padding: "20px",
                  }}
                >
                  There is no data available.
                </div>
              )}
            </Card>

            {/* Expenses */}
            <Card
              title="Expenses"
              style={{ marginBottom: "16px" }}
              extra={
                <Select
                  value={expensesPeriod}
                  onChange={setExpensesPeriod}
                  style={{ width: 120 }}
                >
                  <Option value="quarter">This Quarter</Option>
                  <Option value="month">This Month</Option>
                  <Option value="year">This Year</Option>
                </Select>
              }
            >
              {periodDataLoading || !hasPeriodData ? (
                <div style={{ textAlign: "center", padding: "50px" }}>
                  <Spin size="large" />
                  <p>Loading expenses data...</p>
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={safeExpenses.categories || []}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({
                          name,
                          percentage,
                          cx,
                          cy,
                          midAngle,
                          innerRadius,
                          outerRadius,
                        }) => {
                          const RADIAN = Math.PI / 180;
                          const radius =
                            innerRadius + (outerRadius - innerRadius) * 0.5;
                          const x = cx + radius * Math.cos(-midAngle * RADIAN);
                          const y = cy + radius * Math.sin(-midAngle * RADIAN);

                          return (
                            <text
                              x={x}
                              y={y}
                              fill="black"
                              textAnchor={x > cx ? "start" : "end"}
                              dominantBaseline="central"
                            >
                              {`${name}: ${percentage}%`}
                            </text>
                          );
                        }}
                        outerRadius={90}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {(safeExpenses.categories || []).map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ marginTop: "16px" }}>
                    <h4>Total: {formatCurrency(safeExpenses.total)}</h4>
                    {(safeExpenses.categories || []).map((category, index) => (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "4px 0",
                        }}
                      >
                        <span>{category.name}</span>
                        <span style={{ fontWeight: "bold" }}>
                          {formatCurrency(category.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default Dashboard;
