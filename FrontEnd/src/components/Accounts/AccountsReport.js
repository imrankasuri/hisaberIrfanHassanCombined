import React, { useState, useEffect } from "react";
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  Row,
  Select,
  message,
  Spin,
  Table,
  Empty,
} from "antd";
import {
  PrinterOutlined,
  UploadOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Config from "../../Config";
import SubMenuToggle from "../Common/SubMenuToggle";
import dayjs from "dayjs";
import Logo from "../../assets/images/logo/dark-h.svg";
import BankPrint from "../Shared/BankPrint";
import ExcelJS from "exceljs";
import ReportsMenu from "../Reports/ReportsMenu";
import LevelWiseAccount2 from "../Shared/LevelWiseAccount2";
import { renderVoucherNumber } from "../../utils/voucherNavigation";
import LevelWiseAccounts from "../Shared/LevelWiseAccounts";
import SummaryView from "../Shared/SummaryView";

const AccountsReport = () => {
  const navigate = useNavigate();
  const AccessKey = localStorage.getItem("AccessKey");
  const CompanyID = localStorage.getItem("CompanyID");
  const User = localStorage.getItem("Full_Name");

  const [BankForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [BankLoading, setBankLoading] = useState(false);
  const [ListOfRecords, setListOfRecords] = useState([]);
  const [selectedBank, setSelectedBank] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState("year"); // Default to year
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const [showSummaryView, setShowSummaryView] = useState(false); // Toggle for summary view
  const [bankCode, setBankCode] = useState("");
  const [TotalReceipt, setTotalReceipt] = useState(0);
  const [TotalPayment, setTotalPayment] = useState(0);
  const [TotalBalance, setTotalBalance] = useState(0);
  const defaultStartDate = dayjs().format("YYYY-MM-DD");
  const defaultEndDate = dayjs().format("YYYY-MM-DD");

  const fetchBankTransactions = async (FormData) => {
    setLoading(true);
    setError(null);

    const effectiveStartDate =
      FormData.period === "custom" && FormData.startDate
        ? dayjs(FormData.startDate).format("YYYY-MM-DD")
        : defaultStartDate;

    const effectiveEndDate =
      FormData.period === "custom" && FormData.endDate
        ? dayjs(FormData.endDate).format("YYYY-MM-DD")
        : defaultEndDate;

    try {
      const api_config = {
        method: "get",
        url: `${
          Config.base_url
        }Reports/GetAccountReportBy/${CompanyID}?bankCode=${
          FormData.accountCode || ""
        }&startDate=${effectiveStartDate}&endDate=${effectiveEndDate}&period=${
          FormData.period
        }&includeAllBanks=${FormData.bankName === "all"}`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${AccessKey}`,
        },
      };
      //console.log("API Request:", api_config.url);
      const response = await axios(api_config);
      //console.log("API Response:", response.data);

      if (response.data.status_code === 1) {
        setTransactions(response.data.listofRecords);
        setTotalReceipt(response.data.totalReceipts);
        setTotalPayment(response.data.totalPayments);
        setTotalBalance(response.data.totalBalance);
        setShowTable(true); // Show table after fetching data
      } else {
        message.error(response.data.status_message);
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
      message.error("Network Error...");
      setError("Failed to load transactions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Accounts Report";

    const urlParams = new URLSearchParams(window.location.search);
    const accountCode = urlParams.get("source") || "";
    setBankCode(accountCode);

    fetchBankAccounts();
  }, []);

  useEffect(() => {
    if (!bankCode || ListOfRecords.length === 0) return;

    const selectedBank = ListOfRecords.find(
      (bank) => bank.accountCode === bankCode
    );

    if (selectedBank) {
      BankForm.setFieldsValue({
        bankName: selectedBank.accountCode,
        accountCode: selectedBank.accountCode,
      });
      setSelectedBank(selectedBank);
    }
  }, [ListOfRecords, bankCode, BankForm]);

  useEffect(() => {
    if (!selectedBank) return;

    const formData = BankForm.getFieldsValue(true);
    // //Console.log(formData);

    if (Object.keys(formData).length > 0) {
      fetchBankTransactions(formData);
    }
  }, [selectedBank]);

  // Fixed: Don't auto-submit on bank selection
  // We'll let the user click "Run Report" instead

  const fetchBankAccounts = async () => {
    setBankLoading(true);
    try {
      const response = await LevelWiseAccounts(3);
      if (response != null) {
        setListOfRecords(response);
      }
    } catch (error) {
      //console.error("Error fetching bank accounts:", error);
    } finally {
      setBankLoading(false);
    }
  };

  const handleBankChange = (value) => {
    if (value === "all") {
      setSelectedBank(null);
      setBankCode("");
      BankForm.setFieldsValue({
        accountCode: "",
      });
    } else {
      const bank = ListOfRecords.find((bank) => bank.accountCode === value);

      if (bank) {
        setSelectedBank(bank);
        setBankCode(bank.accountCode);
        BankForm.setFieldsValue({
          accountCode: bank.accountCode,
        });
        ////Console.log("Selected bank:", bank);
        ////Console.log("Form values after selection:", BankForm.getFieldsValue());
      }
    }
  };

  const handleDateChange = (date) => {
    setStartDate(date ? date.format("YYYY-MM-DD") : null);
  };

  const handleDueDateChange = (date) => {
    setEndDate(date ? date.format("YYYY-MM-DD") : null);
  };

  const handlePeriodChange = (value) => {
    setPeriod(value);

    // Reset dates when period changes
    if (value !== "custom") {
      BankForm.setFieldsValue({
        startDate: null,
        endDate: null,
      });
      setStartDate(null);
      setEndDate(null);
    }
  };

  const handleExport = () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Accounts Report");

    const bankName = selectedBank
      ? `${selectedBank.accountDescription} (${selectedBank.accountCode})`
      : "All Accounts";

    sheet.mergeCells("A1:J2"); // Merge cells for the title
    const titleCell = sheet.getCell("C3:G3");
    titleCell.value = `Accounts Report: ${bankName}`;
    titleCell.font = { bold: true, size: 18 };
    titleCell.alignment = { vertical: "middle", horizontal: "center" };

    sheet.columns = [
      { header: "Type", key: "type", width: 20 },
      { header: "V. No", key: "voucherNo", width: 10 },
      { header: "Date", key: "date", width: 20 },
      { header: "Account", key: "account", width: 30 },
      { header: "Ref No", key: "refNo", width: 10 },
      { header: "Details", key: "details", width: 10 },
      { header: "Mode", key: "mode", width: 10 },
      { header: "Payments", key: "payments", width: 10 },
      { header: "Receipts", key: "receipts", width: 10 },
      { header: "Balance", key: "balance", width: 10 },
    ];

    const headerRow = sheet.addRow([
      "Type",
      "V. No",
      "Date",
      "Account",
      "Ref No",
      "Details",
      "Mode",
      "Payments",
      "Receipts",
      "Balance",
    ]);

    // Apply styling to the header row
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } }; // White text color
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF324F94" }, // Background color #324F94 (blue)
    };

    let runningBalance = 0;
    let totalReceipt = 0;
    let totalPayment = 0;

    // Add rows to the sheet
    transactions.forEach((banks, index) => {
      const currentBalance = banks.receipts - banks.payments;

      // Update running balance and totals
      if (index === 0) {
        runningBalance = currentBalance;
      } else {
        runningBalance += currentBalance;
      }
      totalReceipt += banks.receipts;
      totalPayment += banks.payments;

      sheet.addRow({
        sr: index + 1,
        type: banks.type,
        voucherNo: banks.voucherNo,
        date: dayjs(banks.date).format("YYYY-MM-DD"),
        account: banks.account,
        refNo: banks.refNo,
        details: banks.details,
        mode: banks.mode,
        payments: banks.payments,
        receipts: banks.receipts,
        balance: runningBalance.toFixed(2),
      });
    });

    const totalsRow = sheet.addRow({
      account: "Totals", // Label for totals
      payments: totalPayment.toFixed(2),
      receipts: totalReceipt.toFixed(2),
      balance: runningBalance.toFixed(2),
    });

    // Apply styling to the totals row
    totalsRow.eachCell((cell, colNumber) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: "right" };
      if (colNumber > 1) {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      }
    });

    const now = new Date();
    const dateString = now
      .toLocaleString("sv-SE", { timeZoneName: "short" })
      .replace(/[^0-9]/g, "");

    // Generate the Excel file and prompt the user to download it
    workbook.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `AccountsReport_${dateString}.xlsx`;
      anchor.click();
      window.URL.revokeObjectURL(url);
    });
  };

  const columns = [
    {
      title: "Sr#",
      dataIndex: "",
      key: "SR",
      width: 30,
      render: (_, record, index) => index + 1,
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date) => dayjs(date).format("YYYY-MM-DD"),
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      sorter: (a, b) => a.type.localeCompare(b.type),
    },
    {
      title: "Account",
      dataIndex: "account",
      key: "account",
      sorter: (a, b) => a.account.localeCompare(b.account),
    },
    {
      title: "V. No",
      dataIndex: "voucherNo",
      key: "voucherNo",
      render: renderVoucherNumber,
      sorter: (a, b) => a.voucherNo - b.voucherNo,
    },
    {
      title: "Ref No",
      dataIndex: "refNo",
      key: "refNo",
      sorter: (a, b) =>
        a.refNo && b.refNo ? a.refNo.localeCompare(b.refNo) : 0,
    },
    {
      title: "Details",
      dataIndex: "details",
      key: "details",
      sorter: (a, b) =>
        a.details && b.details ? a.details.localeCompare(b.details) : 0,
    },
    {
      title: "Mode",
      dataIndex: "mode",
      key: "mode",
      sorter: (a, b) => (a.mode && b.mode ? a.mode.localeCompare(b.mode) : 0),
    },
    {
      title: "Payments",
      dataIndex: "payments",
      key: "payments",
      render: (value) => (
        <div style={{ textAlign: "right" }}>
          {value ? value.toFixed(2) : "0.00"}
        </div>
      ),
      sorter: (a, b) => a.payments - b.payments,
    },
    {
      title: "Receipts",
      dataIndex: "receipts",
      key: "receipts",
      render: (value) => (
        <div style={{ textAlign: "right" }}>
          {value ? value.toFixed(2) : "0.00"}
        </div>
      ),
      sorter: (a, b) => a.receipts - b.receipts,
    },
    {
      title: "Balance",
      dataIndex: "",
      key: "balance",
      render: (text, record, index) => {
        // Reset running balance for a fresh calculation on each render
        if (index === 0) {
          window.runningBalance = record.receipts - record.payments;
        } else {
          window.runningBalance += record.receipts - record.payments;
        }
        return (
          <div style={{ textAlign: "right" }}>
            {window.runningBalance.toFixed(2)}
          </div>
        );
      },
    },
  ];

  const summary = () => {
    return (
      <Table.Summary.Row style={{ textAlign: "right" }}>
        <Table.Summary.Cell colSpan={8}>Total</Table.Summary.Cell>
        <Table.Summary.Cell>
          <div style={{ textAlign: "right" }}>{TotalPayment.toFixed(2)}</div>
        </Table.Summary.Cell>
        <Table.Summary.Cell>
          <div style={{ textAlign: "right" }}>{TotalReceipt.toFixed(2)}</div>
        </Table.Summary.Cell>
        <Table.Summary.Cell>
          <div style={{ textAlign: "right" }}>{TotalBalance.toFixed(2)}</div>
        </Table.Summary.Cell>
      </Table.Summary.Row>
    );
  };

  return (
    <>
      <div id="sub-menu-wrap">
        <h5>Reports</h5>
        <ReportsMenu />
      </div>

      <div className="right-side-contents">
        <div className="page-content">
          <div className="page-header">
            <SubMenuToggle />
            <h3 className="page-title">
              <NavLink to="/bank/manage">
                <ArrowLeftIcon />
              </NavLink>
              Accounts Report
            </h3>
            {showTable && transactions.length > 0 && (
              <div className="header-actions">
                <Button
                  type="dashed"
                  onClick={handleExport}
                  icon={<UploadOutlined />}
                >
                  Export Report
                </Button>

                <BankPrint
                  selectedSupplier={selectedBank}
                  startDate={startDate}
                  endDate={endDate}
                  User={User}
                  title="Accounts Report"
                />
              </div>
            )}
          </div>

          <div className="filters-wrap">
            <Form
              form={BankForm}
              onFinish={fetchBankTransactions}
              initialValues={{ bankName: "all", period: "year" }}
            >
              <Form.Item name="bankName">
                <Select
                  placeholder="Select Account"
                  style={{ width: "300px" }}
                  loading={BankLoading}
                  showSearch
                  filterOption={(input, option) =>
                    option?.label?.toLowerCase().includes(input.toLowerCase())
                  }
                  notFoundContent={BankLoading ? <Spin size="small" /> : null}
                  onChange={handleBankChange}
                >
                  <Select.Option value="all">All Accounts</Select.Option>
                  {ListOfRecords.filter(
                    (bank) => !bank.accountCode.startsWith("50")
                  ).map((bank) => (
                    <Select.Option
                      key={bank.accountNo}
                      value={bank.accountCode}
                      label={`${bank.accountDescription} (${bank.accountCode})`}
                    >
                      {bank.accountDescription} ({bank.accountCode})
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="period" style={{ width: "200px" }}>
                <Select placeholder="Date Range" onChange={handlePeriodChange}>
                  <Select.Option value="all">All Dates</Select.Option>
                  <Select.Option value="custom">Custom</Select.Option>
                  <Select.Option value="today">Today</Select.Option>
                  <Select.Option value="week">This Week</Select.Option>
                  <Select.Option value="month">This Month</Select.Option>
                  <Select.Option value="last30Days">Last 30 Days</Select.Option>
                  <Select.Option value="last60Days">Last 60 Days</Select.Option>
                  <Select.Option value="last90Days">Last 90 Days</Select.Option>
                  <Select.Option value="last365Days">
                    Last 365 Days
                  </Select.Option>
                  <Select.Option value="year">This Year</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item name="accountCode" hidden>
                <Input />
              </Form.Item>

              {period === "custom" && (
                <>
                  <Form.Item name="startDate" label="Start Date">
                    <DatePicker
                      value={startDate ? dayjs(startDate) : null}
                      onChange={handleDateChange}
                    />
                  </Form.Item>
                  <Form.Item name="endDate" label="End Date">
                    <DatePicker
                      value={endDate ? dayjs(endDate) : null}
                      onChange={handleDueDateChange}
                    />
                  </Form.Item>
                </>
              )}

              <Button type="primary" htmlType="submit" loading={loading}>
                Run Report
              </Button>
              <Button
                className="mx-2"
                type={showSummaryView ? "primary" : "default"}
                onClick={() => setShowSummaryView(!showSummaryView)}
                icon={<BarChartOutlined />}
              >
                {showSummaryView ? "Hide Summary" : "Show Summary"}
              </Button>
            </Form>
          </div>

          {showTable && showSummaryView && transactions.length > 0 && (
            <SummaryView
              title="Account"
              data={transactions.map((transaction) => ({
                ...transaction,
                debit: transaction.payments || 0,
                credit: transaction.receipts || 0,
                date: transaction.date,
              }))}
              loading={loading}
              showCharts={true}
              showSummary={true}
              showTable={true}
              chartType="bar"
              reportDateRange={
                startDate && endDate ? [dayjs(startDate), dayjs(endDate)] : null
              }
              excludeOpeningBalance={true}
            />
          )}

          {showTable && transactions.length > 0 && (
            <>
              <div className="reports-main-div">
                <div className="report-content">
                  <div className="report-left">
                    <h2>
                      {selectedBank
                        ? selectedBank.accountDescription
                        : "All Accounts"}
                    </h2>
                    {selectedBank && (
                      <>
                        <h3>Account Code: {selectedBank.accountCode}</h3>
                      </>
                    )}
                  </div>
                  <img
                    className="report-company-name"
                    src={Logo}
                    alt="Company Logo"
                  />
                  <div className="report-right">
                    <h2>Accounts Report</h2>
                    <h3>Printed by: {User} </h3>
                    <h3>Printed on: {new Date().toLocaleString()}</h3>
                  </div>
                </div>
              </div>
              <Table
                columns={columns}
                dataSource={transactions}
                rowKey={(record, index) => `transaction-${index}`}
                summary={summary}
                pagination={false}
              />
            </>
          )}

          {showTable && transactions.length === 0 && (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No transactions found for the selected criteria"
            />
          )}

          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
      </div>
    </>
  );
};

export default AccountsReport;
