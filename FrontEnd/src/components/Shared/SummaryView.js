import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Row,
  Select,
  Table,
  Tabs,
  Typography,
  Statistic,
  Divider,
  Space,
  Tooltip,
} from "antd";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
} from "recharts";
import {
  CalendarOutlined,
  DollarOutlined,
  BarChartOutlined,
  LineChartOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import ExcelJS from "exceljs";

dayjs.extend(isBetween);

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

const SummaryView = ({
  title,
  data,
  loading = false,
  onDateRangeChange,
  onExport,
  showCharts = true,
  showSummary = true,
  showTable = true,
  customColumns = [],
  customSummaryStats = [],
  chartType: initialChartType = "bar",
  dataKey = "amount",
  nameKey = "period",
  valueKey = "value",
  colorScheme = ["#1890ff", "#52c41a", "#faad14", "#f5222d", "#722ed1"],
  reportDateRange = null,
  excludeOpeningBalance = false,
  debugMode = false,
}) => {
  const [activeTab, setActiveTab] = useState("summary");
  const [groupBy, setGroupBy] = useState("month");
  const [dateRange, setDateRange] = useState([
    dayjs().startOf("year"),
    dayjs(),
  ]);
  const [groupedData, setGroupedData] = useState([]);
  const [summaryStats, setSummaryStats] = useState({});
  const [chartType, setChartType] = useState(initialChartType);

  useEffect(() => {
    if (data && data.length > 0) {
      processData();
    }
  }, [data, groupBy, dateRange, reportDateRange]);

  useEffect(() => {
    if (reportDateRange && reportDateRange.length === 2) {
      setDateRange(reportDateRange);
    }
  }, [reportDateRange]);

  const processData = () => {
    if (!data || data.length === 0) return;

    let processedData = [...data];

    if (data[0].date) {
      processedData = data.filter((item) => {
        const itemDate = dayjs(item.date);
        return itemDate.isBetween(dateRange[0], dateRange[1], null, "[]");
      });
    }

    if (excludeOpeningBalance) {
      processedData = processedData.filter((item) => {
        if (item.details && item.details.toLowerCase().includes('opening balance')) {
          if (debugMode) {
            console.log('Excluding opening balance entry:', item);
          }
          return false;
        }
        return true;
      });
      
      if (debugMode) {
        console.log('Filtered data (excluding opening balance):', processedData);
      }
    }

    const grouped = groupDataByPeriod(processedData);
    setGroupedData(grouped);
    calculateSummaryStats(grouped);
  };

  const groupDataByPeriod = (data) => {
    const groups = {};

    data.forEach((item) => {
      let period;
      let displayPeriod;
      const date = item.date ? dayjs(item.date) : dayjs();

      switch (groupBy) {
        case "week":
          const dayOfWeek = date.day();
          const daysToSaturday = (6 - dayOfWeek) % 7;
          const weekStart = date.subtract(daysToSaturday, 'day');
          const weekEnd = weekStart.add(6, 'day');
          period = weekStart.format("YYYY-MM-DD");
          displayPeriod = `${weekStart.format("MMM DD")} - ${weekEnd.format("MMM DD, YYYY")}`;
          break;
        case "month":
          period = date.format("YYYY-MM");
          displayPeriod = date.format("MMMM YYYY");
          break;
        case "quarter":
          const quarter = Math.ceil((date.month() + 1) / 3);
          period = `${date.year()}-Q${quarter}`;
          displayPeriod = `Q${quarter} ${date.year()}`;
          break;
        case "year":
          period = date.year().toString();
          displayPeriod = date.year().toString();
          break;
        default:
          period = date.format("YYYY-MM");
          displayPeriod = date.format("MMMM YYYY");
      }

      if (!groups[period]) {
        groups[period] = {
          period,
          displayPeriod,
          count: 0,
          totalDebit: 0,
          totalCredit: 0,
          balance: 0,
          runningBalance: 0, // New field for cumulative balance
          items: [],
        };
      }

      groups[period].count++;
      groups[period].totalDebit += item.debit || 0;
      groups[period].totalCredit += item.credit || 0;
      groups[period].balance += (item.debit || 0) - (item.credit || 0);
      groups[period].items.push(item);
    });

    // Sort periods to calculate running balance
    const sortedPeriods = Object.values(groups).sort((a, b) => {
      if (groupBy === "year") {
        return parseInt(a.period) - parseInt(b.period);
      } else if (groupBy === "week") {
        return dayjs(a.period).unix() - dayjs(b.period).unix();
      }
      return a.period.localeCompare(b.period);
    });

    // Calculate running balance
    let cumulativeBalance = 0;
    sortedPeriods.forEach((group) => {
      cumulativeBalance += group.balance;
      group.runningBalance = cumulativeBalance;
    });

    return sortedPeriods;
  };

  const calculateSummaryStats = (groupedData) => {
    const stats = {
      totalPeriods: groupedData.length,
      totalItems: groupedData.reduce((sum, group) => sum + group.count, 0),
      totalDebit: groupedData.reduce((sum, group) => sum + group.totalDebit, 0),
      totalCredit: groupedData.reduce(
        (sum, group) => sum + group.totalCredit,
        0
      ),
      totalBalance: groupedData.reduce((sum, group) => sum + group.balance, 0),
      averageDebit:
        groupedData.length > 0
          ? groupedData.reduce((sum, group) => sum + group.totalDebit, 0) /
            groupedData.length
          : 0,
      averageCredit:
        groupedData.length > 0
          ? groupedData.reduce((sum, group) => sum + group.totalCredit, 0) /
            groupedData.length
          : 0,
      averageBalance:
        groupedData.length > 0
          ? groupedData.reduce((sum, group) => sum + group.balance, 0) /
            groupedData.length
          : 0,
    };

    setSummaryStats(stats);
  };

  const handleDateRangeChange = (dates) => {
    if (dates) {
      setDateRange(dates);
      if (onDateRangeChange) {
        onDateRangeChange(dates);
      }
    }
  };

  const handleExport = async () => {
    if (!groupedData || groupedData.length === 0) return;

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(`${title} Summary`);

    sheet.mergeCells("A1:F1");
    const titleCell = sheet.getCell("A1");
    titleCell.value = `${title} Summary Report - Grouped by ${groupBy}`;
    titleCell.font = { bold: true, size: 16 };
    titleCell.alignment = { horizontal: "center" };

    sheet.mergeCells("A2:F2");
    const dateCell = sheet.getCell("A2");
    dateCell.value = `Period: ${dateRange[0].format(
      "YYYY-MM-DD"
    )} to ${dateRange[1].format("YYYY-MM-DD")}`;
    dateCell.font = { italic: true };
    dateCell.alignment = { horizontal: "center" };

    const headers = [
      "Period",
      "Count",
      "Total Debit",
      "Total Credit",
      "Period Change",
      "Running Balance",
      "Net Change",
    ];
    sheet.addRow(headers);

    const headerRow = sheet.getRow(4);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF324F94" },
      };
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    });

    groupedData.forEach((group) => {
      sheet.addRow([
        group.displayPeriod || group.period,
        group.count,
        group.totalDebit.toFixed(2),
        group.totalCredit.toFixed(2),
        group.balance.toFixed(2),
        group.runningBalance.toFixed(2),
        (group.totalDebit - group.totalCredit).toFixed(2),
      ]);
    });

    const totalsRow = sheet.addRow([
      "TOTALS",
      summaryStats.totalItems,
      summaryStats.totalDebit.toFixed(2),
      summaryStats.totalCredit.toFixed(2),
      summaryStats.totalBalance.toFixed(2),
      groupedData.length > 0 ? groupedData[groupedData.length - 1].runningBalance.toFixed(2) : "0.00",
      (summaryStats.totalDebit - summaryStats.totalCredit).toFixed(2),
    ]);

    totalsRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF0F0F0" },
      };
    });

    sheet.columns.forEach((column) => {
      column.width = 15;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${title}_Summary_${groupBy}_${dayjs().format(
      "YYYY-MM-DD"
    )}.xlsx`;
    anchor.click();
    window.URL.revokeObjectURL(url);
  };

  const chartData = groupedData.map((group) => ({
    [nameKey]: group.displayPeriod || group.period,
    [valueKey]: group.balance,
    debit: group.totalDebit,
    credit: group.totalCredit,
    count: group.count,
  }));

  const renderChart = () => {
    if (!showCharts || chartData.length === 0) return null;

    switch (chartType) {
      case "line":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={nameKey} />
              <YAxis />
              <RechartsTooltip />
              <Line
                type="monotone"
                dataKey={valueKey}
                stroke="#1890ff"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="debit"
                stroke="#52c41a"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="credit"
                stroke="#faad14"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={nameKey} />
              <YAxis />
              <RechartsTooltip />
              <Bar dataKey={valueKey} fill="#1890ff" />
              <Bar dataKey="debit" fill="#52c41a" />
              <Bar dataKey="credit" fill="#faad14" />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  const columns = [
    {
      title: "Period",
      dataIndex: "displayPeriod",
      key: "period",
      render: (text, record) => text || record.period,
      sorter: (a, b) => a.period.localeCompare(b.period),
    },
    {
      title: "Count",
      dataIndex: "count",
      key: "count",
      sorter: (a, b) => a.count - b.count,
      align: "center",
    },
    {
      title: "Total Debit",
      dataIndex: "totalDebit",
      key: "totalDebit",
      render: (value) => value.toFixed(2),
      sorter: (a, b) => a.totalDebit - b.totalDebit,
      align: "right",
    },
    {
      title: "Total Credit",
      dataIndex: "totalCredit",
      key: "totalCredit",
      render: (value) => value.toFixed(2),
      sorter: (a, b) => a.totalCredit - b.totalCredit,
      align: "right",
    },
    {
      title: (
        <Tooltip title="Period change (debit - credit)">
          Period Change
        </Tooltip>
      ),
      dataIndex: "balance",
      key: "balance",
      render: (value) => (
        <span style={{ color: value >= 0 ? "#52c41a" : "#f5222d" }}>
          {value.toFixed(2)}
        </span>
      ),
      sorter: (a, b) => a.balance - b.balance,
      align: "right",
    },
    {
      title: (
        <Tooltip title="Cumulative balance including previous periods">
          Running Balance
        </Tooltip>
      ),
      dataIndex: "runningBalance",
      key: "runningBalance",
      render: (value) => (
        <span style={{ color: value >= 0 ? "#52c41a" : "#f5222d" }}>
          {value.toFixed(2)}
        </span>
      ),
      sorter: (a, b) => a.runningBalance - b.runningBalance,
      align: "right",
    },
    {
      title: "Net Change",
      key: "netChange",
      render: (_, record) => {
        const netChange = record.totalDebit - record.totalCredit;
        return (
          <span style={{ color: netChange >= 0 ? "#52c41a" : "#f5222d" }}>
            {netChange.toFixed(2)}
          </span>
        );
      },
      sorter: (a, b) =>
        a.totalDebit - a.totalCredit - (b.totalDebit - b.totalCredit),
      align: "right",
    },
    ...customColumns,
  ];

  const tableSummary = () => (
    <Table.Summary.Row style={{ textAlign: "right" }}>
      <Table.Summary.Cell colSpan={2}>Total</Table.Summary.Cell>
      <Table.Summary.Cell>
        {summaryStats.totalDebit.toFixed(2)}
      </Table.Summary.Cell>
      <Table.Summary.Cell>
        {summaryStats.totalCredit.toFixed(2)}
      </Table.Summary.Cell>
      <Table.Summary.Cell>
        {summaryStats.totalBalance.toFixed(2)}
      </Table.Summary.Cell>
      <Table.Summary.Cell>
        {groupedData.length > 0 ? groupedData[groupedData.length - 1].runningBalance.toFixed(2) : "0.00"}
      </Table.Summary.Cell>
      <Table.Summary.Cell>
        {(summaryStats.totalDebit - summaryStats.totalCredit).toFixed(2)}
      </Table.Summary.Cell>
      {customColumns.map((_, index) => (
        <Table.Summary.Cell key={index}></Table.Summary.Cell>
      ))}
    </Table.Summary.Row>
  );

  return (
    <div className="summary-view-container mb-5">
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={3} style={{ margin: 0 }}>
                {title} Summary View
              </Title>
            </Col>
            <Col>
              <Space>
                <Select
                  value={groupBy}
                  onChange={setGroupBy}
                  style={{ width: 120 }}
                  options={[
                    { label: "Weekly", value: "week" },
                    { label: "Monthly", value: "month" },
                    { label: "Quarterly", value: "quarter" },
                    { label: "Yearly", value: "year" },
                  ]}
                />
                <RangePicker
                  value={dateRange}
                  onChange={handleDateRangeChange}
                  format="YYYY-MM-DD"
                />
                <Button
                  type="primary"
                  icon={<BarChartOutlined />}
                  onClick={handleExport}
                  disabled={!groupedData || groupedData.length === 0}
                >
                  Export Summary
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          {showSummary && (
            <TabPane
              tab={
                <span>
                  <LineChartOutlined />
                  Summary Statistics
                </span>
              }
              key="summary"
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Total Periods"
                      value={summaryStats.totalPeriods}
                      prefix={<CalendarOutlined />}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Total Items"
                      value={summaryStats.totalItems}
                      prefix={<BarChartOutlined />}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Total Debit"
                      value={summaryStats.totalDebit}
                      precision={2}
                      prefix={<DollarOutlined />}
                      valueStyle={{ color: "#52c41a" }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Total Credit"
                      value={summaryStats.totalCredit}
                      precision={2}
                      prefix={<DollarOutlined />}
                      valueStyle={{ color: "#faad14" }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Net Balance"
                      value={summaryStats.totalBalance}
                      precision={2}
                      prefix={<DollarOutlined />}
                      valueStyle={{
                        color:
                          summaryStats.totalBalance >= 0
                            ? "#52c41a"
                            : "#f5222d",
                      }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Avg Debit/Period"
                      value={summaryStats.averageDebit}
                      precision={2}
                      prefix={<DollarOutlined />}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Avg Credit/Period"
                      value={summaryStats.averageCredit}
                      precision={2}
                      prefix={<DollarOutlined />}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Avg Balance/Period"
                      value={summaryStats.averageBalance}
                      precision={2}
                      prefix={<DollarOutlined />}
                      valueStyle={{
                        color:
                          summaryStats.averageBalance >= 0
                            ? "#52c41a"
                            : "#f5222d",
                      }}
                    />
                  </Card>
                </Col>
                {customSummaryStats.map((stat, index) => (
                  <Col xs={24} sm={12} md={6} key={index}>
                    <Card>
                      <Statistic
                        title={stat.title}
                        value={stat.value}
                        precision={stat.precision || 0}
                        prefix={stat.prefix}
                        valueStyle={stat.valueStyle}
                      />
                    </Card>
                  </Col>
                ))}
              </Row>
            </TabPane>
          )}

          {showCharts && (
            <TabPane
              tab={
                <span>
                  <BarChartOutlined />
                  Charts
                </span>
              }
              key="charts"
            >
              <div style={{ marginBottom: 16 }}>
                <Select
                  value={chartType}
                  onChange={setChartType}
                  style={{ width: 120 }}
                  options={[
                    { label: "Bar Chart", value: "bar" },
                    { label: "Line Chart", value: "line" },
                  ]}
                />
              </div>
              {renderChart()}
            </TabPane>
          )}

          {showTable && (
            <TabPane
              tab={
                <span>
                  <BarChartOutlined />
                  Detailed Table
                </span>
              }
              key="table"
            >
              <Table
                columns={columns}
                dataSource={groupedData}
                rowKey="period"
                pagination={false}
                summary={tableSummary}
                scroll={{ x: "max-content" }}
                loading={loading}
              />
            </TabPane>
          )}
        </Tabs>
      </Card>
    </div>
  );
};

export default SummaryView;
