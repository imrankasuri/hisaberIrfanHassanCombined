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
import { PrinterOutlined, UploadOutlined } from "@ant-design/icons";
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

const AccountsSummary = () => {
  const navigate = useNavigate();
  const AccessKey = localStorage.getItem("AccessKey");
  const CompanyID = localStorage.getItem("CompanyID");
  const User = localStorage.getItem("Full_Name");

  const [BankForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [BankLoading, setBankLoading] = useState(false);
  const [ListOfRecords, setListOfRecords] = useState([]);
  const [selectedBank, setSelectedBank] = useState(null);
  const [accountSummaries, setAccountSummaries] = useState([]); // Changed from transactions
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState("year");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const [bankCode, setBankCode] = useState("");
  const [TotalCredit, setTotalCredit] = useState(0); // Changed from TotalReceipt
  const [TotalDebit, setTotalDebit] = useState(0); // Changed from TotalPayment
  const [TotalBalance, setTotalBalance] = useState(0);
  const [TotalOpeningBalance, setTotalOpeningBalance] = useState(0);
  const [TotalClosingBalance, setTotalClosingBalance] = useState(0);
  const defaultStartDate = dayjs().format("YYYY-MM-DD");
  const defaultEndDate = dayjs().format("YYYY-MM-DD");

  const fetchAccountSummary = async (FormData) => {
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
        }Reports/GetAccountSummaryBy/${CompanyID}?bankCode=${
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
        setAccountSummaries(response.data.listofRecords);
        setTotalCredit(response.data.totalCredit);
        setTotalDebit(response.data.totalDebit);
        setTotalBalance(response.data.totalBalance);
        setTotalOpeningBalance(response.data.totalOpeningBalance);
        setTotalClosingBalance(response.data.totalClosingBalance);
        setShowTable(true);
      } else {
        message.error(response.data.status_message);
      }
    } catch (err) {
      console.error("Error fetching account summary:", err);
      message.error("Network Error...");
      setError("Failed to load account summary.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Accounts Summary";

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

    if (Object.keys(formData).length > 0) {
      fetchAccountSummary(formData);
    }
  }, [selectedBank]);

  const fetchBankAccounts = async () => {
    setBankLoading(true);
    try {
      const response = await LevelWiseAccounts(3);
      if (response != null) {
        setListOfRecords(response);
      }
    } catch (error) {
      console.error("Error fetching bank accounts:", error);
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
    const sheet = workbook.addWorksheet("Accounts Summary Report");

    const bankName = selectedBank
      ? `${selectedBank.accountDescription} (${selectedBank.accountCode})`
      : "All Accounts";

    // Title
    sheet.mergeCells("A1:E2");
    const titleCell = sheet.getCell("A1");
    titleCell.value = `Accounts Summary Report: ${bankName}`;
    titleCell.font = { bold: true, size: 18 };
    titleCell.alignment = { vertical: "middle", horizontal: "center" };

    // Headers
    sheet.columns = [
      { header: "Account", key: "account", width: 30 },
      { header: "Opening Balance", key: "openingBalance", width: 15 },
      { header: "Total Debit", key: "totalDebit", width: 15 },
      { header: "Total Credit", key: "totalCredit", width: 15 },
      { header: "Period Balance", key: "balance", width: 15 },
      { header: "Closing Balance", key: "closingBalance", width: 15 },
    ];

    const headerRow = sheet.addRow([
      "Account",
      "Opening Balance",
      "Total Debit",
      "Total Credit",
      "Period Balance",
      "Closing Balance",
    ]);

    // Header styling
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF324F94" },
    };

    // Add data rows
    accountSummaries.forEach((account, index) => {
      sheet.addRow({
        account: account.Account || "N/A",
        openingBalance: account.OpeningBalance
          ? account.OpeningBalance.toFixed(2)
          : "0.00",
        totalDebit: account.TotalDebit ? account.TotalDebit.toFixed(2) : "0.00",
        totalCredit: account.TotalCredit
          ? account.TotalCredit.toFixed(2)
          : "0.00",
        balance: account.Balance ? account.Balance.toFixed(2) : "0.00",
        closingBalance: account.ClosingBalance
          ? account.ClosingBalance.toFixed(2)
          : "0.00",
      });
    });

    // Totals row
    const totalsRow = sheet.addRow({
      account: "TOTALS",
      openingBalance: TotalOpeningBalance.toFixed(2),
      totalDebit: TotalDebit.toFixed(2),
      totalCredit: TotalCredit.toFixed(2),
      balance: TotalBalance.toFixed(2),
      closingBalance: TotalClosingBalance.toFixed(2),
    });

    totalsRow.font = { bold: true };
    totalsRow.eachCell((cell, colNumber) => {
      if (colNumber > 1) {
        cell.alignment = { horizontal: "right" };
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

    workbook.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `AccountsSummaryReport_${dateString}.xlsx`;
      anchor.click();
      window.URL.revokeObjectURL(url);
    });
  };

  const columns = [
    {
      title: "Sr#",
      dataIndex: "",
      key: "SR",
      width: 80,
      render: (_, record, index) => index + 1,
    },
    {
      title: "Account",
      dataIndex: "account",
      key: "account",
      sorter: (a, b) => (a.account || "").localeCompare(b.account || ""),
      render: (text, record) => {
        const code = record.accountCode?.toString() || "";

        let reportType = "accounts";
        if (code.startsWith("1")) {
          reportType = "customer";
        } else if (code.startsWith("9")) {
          reportType = "supplier";
        } else if (code.startsWith("5")) {
          reportType = "bank";
        } else if (code.startsWith("7")) {
          reportType = "accounts";
        }

        return (
          <NavLink
            className="primary"
            to={`/${reportType}/report?source=${record.accountCode}`}
          >
            {record.account}
          </NavLink>
        );
      },
    },
    {
      title: "Opening Balance",
      dataIndex: "openingBalance",
      key: "openingBalance",
      render: (value) => (
        <div
          style={{
            textAlign: "right",
          }}
        >
          {value ? value.toFixed(2) : "0.00"}
        </div>
      ),
      sorter: (a, b) => (a.OpeningBalance || 0) - (b.OpeningBalance || 0),
    },
    {
      title: "Total Debit",
      dataIndex: "totalDebit",
      key: "totalDebit",
      render: (value) => (
        <div style={{ textAlign: "right" }}>
          {value ? value.toFixed(2) : "0.00"}
        </div>
      ),
      sorter: (a, b) => (a.totalDebit || 0) - (b.totalDebit || 0),
    },
    {
      title: "Total Credit",
      dataIndex: "totalCredit",
      key: "totalCredit",
      render: (value) => (
        <div style={{ textAlign: "right" }}>
          {value ? value.toFixed(2) : "0.00"}
        </div>
      ),
      sorter: (a, b) => (a.totalCredit || 0) - (b.totalCredit || 0),
    },
    // {
    //   title: "Period Balance",
    //   dataIndex: "balance",
    //   key: "balance",
    //   render: (value) => (
    //     <div
    //       style={{
    //         textAlign: "right",
    //       }}
    //     >
    //       {value ? value.toFixed(2) : "0.00"}
    //     </div>
    //   ),
    //   sorter: (a, b) => (a.Balance || 0) - (b.Balance || 0),
    // },
    {
      title: "Balance",
      dataIndex: "closingBalance",
      key: "closingBalance",
      render: (value) => (
        <div
          style={{
            textAlign: "right",
          }}
        >
          {value ? value.toFixed(2) : "0.00"}
        </div>
      ),
      sorter: (a, b) => (a.ClosingBalance || 0) - (b.ClosingBalance || 0),
    },
  ];

  const summary = () => {
    return (
      <Table.Summary.Row
        style={{
          textAlign: "right",
        }}
      >
        <Table.Summary.Cell colSpan={2}>Total</Table.Summary.Cell>
        <Table.Summary.Cell>
          <div
            style={{
              textAlign: "right",
            }}
          >
            {TotalOpeningBalance.toFixed(2)}
          </div>
        </Table.Summary.Cell>
        <Table.Summary.Cell>
          <div>{TotalDebit.toFixed(2)}</div>
        </Table.Summary.Cell>
        <Table.Summary.Cell>
          <div>{TotalCredit.toFixed(2)}</div>
        </Table.Summary.Cell>
        <Table.Summary.Cell>
          <div>{TotalClosingBalance.toFixed(2)}</div>
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
              Accounts Summary
            </h3>
            {showTable && accountSummaries.length > 0 && (
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
                  title="Accounts Summary Report"
                />
              </div>
            )}
          </div>

          <div className="filters-wrap">
            <Form
              form={BankForm}
              onFinish={fetchAccountSummary}
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
            </Form>
          </div>

          {showTable && accountSummaries.length > 0 && (
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
                    <h2>Accounts Summary Report</h2>
                    <h3>Printed by: {User} </h3>
                    <h3>Printed on: {new Date().toLocaleString()}</h3>
                  </div>
                </div>
              </div>
              <Table
                columns={columns}
                dataSource={accountSummaries}
                rowKey={(record, index) => `account-${index}-${record.Account}`}
                summary={summary}
                pagination={false}
                loading={loading}
              />
            </>
          )}

          {showTable && accountSummaries.length === 0 && (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No account data found for the selected criteria"
            />
          )}

          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
      </div>
    </>
  );
};

export default AccountsSummary;
