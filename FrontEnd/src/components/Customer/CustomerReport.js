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
  Flex,
} from "antd";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { NavLink, useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Config from "../../Config";
import SubMenuToggle from "../Common/SubMenuToggle";
import dayjs from "dayjs";
import CustomerDropdown from "../Shared/CustomerDropdown";
import { UploadOutlined, BarChartOutlined } from "@ant-design/icons";
import PrintTable from "../Shared/PrintTable";
import Logo from "../../assets/images/logo/dark-h.svg";
import ExcelJS from "exceljs";
import ReportsMenu from "../Reports/ReportsMenu";
import { renderVoucherNumber } from "../../utils/voucherNavigation";
import SummaryView from "../Shared/SummaryView";

const CustomerReport = () => {
  const navigate = useNavigate();
  const AccessKey = localStorage.getItem("AccessKey");
  const CompanyID = localStorage.getItem("CompanyID");
  const User = localStorage.getItem("Full_Name");

  const [CustomerForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [CustomerLoading, setCustomerLoading] = useState(false);
  const [ListOfRecords, setListOfRecords] = useState([]);
  const [TotalRecords, setTotalRecords] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState("all");
  const [customerAccountCode, setCustomerAccountCode] = useState("");
  const [ReceiptBodies, setReceiptBodies] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showTable, setShowTable] = useState(false); // New state variable
  const [showSummaryView, setShowSummaryView] = useState(false); // Toggle for summary view
  const defaultStartDate = dayjs().format("YYYY-MM-DD");
  const defaultEndDate = dayjs().format("YYYY-MM-DD");
  const [includeAllCustomers, setIncludeAllCustomers] = useState(false);

  const fetchCustomerTransactions = async (FormData) => {
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
        url: `${Config.base_url}Reports/GetCustomerReportBy/${CompanyID}?customerAccountCode=${customerAccountCode}&startDate=${effectiveStartDate}&endDate=${effectiveEndDate}&period=${FormData.period}&includeAllCustomers=${includeAllCustomers}`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${AccessKey}`,
        },
      };
      const response = await axios(api_config);
      // //Console.log(response.data);
      setTransactions(response.data.transactions);
      // setCustomerName(response.data.customerName);
      setShowTable(true);
    } catch (err) {
      message.error("Network Error..");
      //console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReceiptBodies = async () => {
    setLoading(true);
    try {
      const api_config = {
        method: "get",
        url: `${Config.base_url}Reports/GetReceiptBodyDetails/${CompanyID}`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${AccessKey}`,
        },
      };
      const response = await axios(api_config);
      ////Console.log(response);
      setReceiptBodies(response.data);
    } catch (err) {
      //message.error("Network Error..");
      // console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Customer Report";

    fetchCustomers();

    const urlParams = new URLSearchParams(window.location.search);
    const accountCode = urlParams.get("source") || "";
    setCustomerAccountCode(accountCode);

    fetchReceiptBodies();
  }, []);

  useEffect(() => {
    if (!customerAccountCode || ListOfRecords.length === 0) return;

    const selectedCustomer = ListOfRecords.find(
      (customer) => customer.accountCode === customerAccountCode
    );

    if (selectedCustomer) {
      CustomerForm.setFieldValue("customerName", selectedCustomer.businessName);
      setSelectedCustomer(selectedCustomer);
    }
  }, [ListOfRecords, customerAccountCode]);

  useEffect(() => {
    if (!selectedCustomer) return;

    const formData = CustomerForm.getFieldsValue(true);
    // //Console.log(formData);

    if (Object.keys(formData).length > 0) {
      fetchCustomerTransactions(formData);
    }
  }, [selectedCustomer]);

  const fetchCustomers = async () => {
    setCustomerLoading(true);
    try {
      const response = await CustomerDropdown();
      if (response != null) {
        setListOfRecords(response);
      }
    } catch (error) {
      // console.error(error);
    } finally {
      setCustomerLoading(false);
    }
  };
  const customer = [
    {
      businessName: "All Customers",
      accountCode: "0000",
      accountNo: "0000",
      id: 0,
      isCustomer: true,
      isSupplier: false,
    },
    ...ListOfRecords,
  ].map(
    ({ businessName, accountCode, id, isCustomer, isSupplier, accountNo }) => {
      const trimmedBusinessName = businessName.trim();
      const parsedAccountCode = parseInt(accountCode);
      let accountLabel = accountNo;

      if (isSupplier && parsedAccountCode < 9000) {
        accountLabel += " (S)";
      } else if (isCustomer && parsedAccountCode > 9000) {
        accountLabel += " (C)";
      }

      return {
        label: `${trimmedBusinessName} (${accountLabel})`.trim(),
        value: id,
      };
    }
  );

  const handleSelectChange = async (value) => {
    if (value === 0) {
      setSelectedCustomer(null);
      setCustomerAccountCode("");
      setIncludeAllCustomers(true);
      return;
    }
    const selectedCustomer = ListOfRecords.find(
      (customer) => customer.id == value
    );
    if (selectedCustomer) {
      setIncludeAllCustomers(false);
      setSelectedCustomer(ListOfRecords.find((record) => record.id === value));
      setCustomerAccountCode(selectedCustomer.accountNo);
    }
  };

  const handleDateChange = (date, dateString) => {
    setStartDate(date ? date.format("YYYY-MM-DD") : null);
  };

  const handleDueDateChange = (date, dateString) => {
    setEndDate(date ? date.format("YYYY-MM-DD") : null);
  };

  const handleExport = () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Customer Report");

    // Add customer name as a title at the top (row 1)
    const customerName = selectedCustomer
      ? `${selectedCustomer.businessName} (${selectedCustomer.accountNo})`
      : "All Customers";

    sheet.mergeCells("A1:H2"); // Merge cells for the title
    const titleCell = sheet.getCell("C3:G3");
    titleCell.value = `Customer Report: ${customerName}`;
    titleCell.font = { bold: true, size: 18 };
    titleCell.alignment = { vertical: "middle", horizontal: "center" };

    // Set column headers and their widths starting from row 3
    sheet.columns = [
      { header: "Date", key: "date", width: 30 },
      { header: "Details", key: "details", width: 30 },
      { header: "Ref No", key: "refNo", width: 10 },
      { header: "V. No", key: "voucherNo", width: 10 },
      { header: "Debit", key: "debit", width: 15 },
      { header: "Credit", key: "credit", width: 15 },
      { header: "Balance", key: "balance", width: 15 },
      { header: "Overdue Days", key: "daysBalance", width: 20 },
    ];

    // Add column headers to row 3
    const headerRow = sheet.addRow([
      "Date",
      "Details",
      "Ref No",
      "V. No",
      "Debit",
      "Credit",
      "Balance",
      "Overdue Days",
    ]);

    // Apply styling to the header row
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } }; // White text color
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF324F94" }, // Background color #324F94 (blue)
    };

    let runningBalance = 0;
    let totalDebit = 0;
    let totalCredit = 0;
    let overdueDays = "";
    const today = new Date();
    const noDaysDetails = [
      "Receipt",
      "Payment",
      "Return Receipt",
      "Return Payment",
    ];

    // Add rows to the sheet with calculated balance
    transactions.forEach((customer, index) => {
      const currentBalance = customer.debit - customer.credit;
      const givenDate = new Date(customer.date); // Assuming `customer.date` is valid
      const timeDiff = today.getTime() - givenDate.getTime();
      const dayDifference = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

      // Update running balance and totals
      if (index === 0) {
        runningBalance = currentBalance;
      } else {
        runningBalance += currentBalance;
      }
      totalDebit += customer.debit;
      totalCredit += customer.credit;

      // Determine overdue days or "No Days"

      if (index === 0 || noDaysDetails.includes(customer.details)) {
        overdueDays = "";
      } else if (customer.daysBalance > 0) {
        overdueDays = `Overdue (${dayDifference}) Days`;
      } else if (customer.daysBalance === 0) {
        overdueDays = "Paid";
      } else {
        overdueDays = "0.00"; // Default for undefined or null cases
      }

      // Add row to the Excel sheet
      sheet.addRow({
        date: dayjs(customer.date).format("YYYY-MM-DD"),
        details: customer.details,
        refNo: customer.refNo,
        voucherNo: customer.voucherNo,
        debit: customer.debit,
        credit: customer.credit,
        balance: runningBalance.toFixed(2),
        daysBalance: overdueDays,
      });
    });

    // Add totals at the end
    const totalsRow = sheet.addRow({
      date: "Totals", // Label for totals
      debit: totalDebit.toFixed(2),
      credit: totalCredit.toFixed(2),
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
      .toLocaleString("sv-SE", { timeZoneName: "short" }) // Format: YYYY-MM-DD HH:mm:ss
      .replace(/[^0-9]/g, ""); // Remove special characters like : and space

    // Generate the Excel file and prompt the user to download it
    workbook.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `CustomerReport_${dateString}.xlsx`;
      anchor.click();
      window.URL.revokeObjectURL(url);
    });
  };

  let runningBalance = 0;

  const columns = [
    {
      title: "Sr#",
      dataIndex: "",
      key: "SR",
      render: (_, record, index) =>
        record.inComplete ? <strong>{index + 1}</strong> : index + 1,
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date, record) => {
        const formatted = dayjs(date).format("YYYY-MM-DD");
        return record.inComplete ? <strong>{formatted}</strong> : formatted;
      },
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
    },
    {
      title: "Details",
      dataIndex: "details",
      key: "details",
      render: (text, record) => {
        const label =
          text === "Invoice" || text === "Receipt" || text === "Opening Balance"
            ? `Sale ${text}`
            : `Purchase ${text}`;
        return record.inComplete ? <strong>{label}</strong> : label;
      },
      sorter: (a, b) => String(a.details).localeCompare(String(b.details)),
    },
    {
      title: "Ref No",
      dataIndex: "refNo",
      key: "refNo",
      render: (text, record) =>
        record.inComplete ? <strong>{text}</strong> : text,
      sorter: (a, b) => String(a.refNo).localeCompare(String(b.refNo)),
    },
    {
      title: "V. No",
      dataIndex: "voucherNo",
      key: "voucherNo",
      render: (text, record) => {
        const voucherElement = renderVoucherNumber(text, record);
        return record.inComplete ? (
          <strong>{voucherElement}</strong>
        ) : (
          voucherElement
        );
      },
      sorter: (a, b) => a.voucherNo - b.voucherNo,
    },
    {
      title: "Debit",
      dataIndex: "debit",
      key: "debit",
      render: (value, record) => {
        const formatted = value ? value.toFixed(2) : "0.00";
        return (
          <div style={{ textAlign: "right" }}>
            {record.inComplete ? <strong>{formatted}</strong> : formatted}
          </div>
        );
      },
      sorter: (a, b) => a.debit - b.debit,
    },
    {
      title: "Credit",
      dataIndex: "credit",
      key: "credit",
      render: (value, record) => {
        const formatted = value ? value.toFixed(2) : "0.00";
        return (
          <div style={{ textAlign: "right" }}>
            {record.inComplete ? <strong>{formatted}</strong> : formatted}
          </div>
        );
      },
      sorter: (a, b) => a.credit - b.credit,
    },
    {
      title: "Balance",
      dataIndex: "balance",
      key: "balance",
      render: (text, record, index) => {
        const currentBalance = record.debit - record.credit;
        if (index === 0) {
          runningBalance = currentBalance;
        } else {
          runningBalance += currentBalance;
        }
        const formatted = runningBalance.toFixed(2);
        return (
          <div style={{ textAlign: "right" }}>
            {record.inComplete ? <strong>{formatted}</strong> : formatted}
          </div>
        );
      },
      sorter: (a, b) => a.balance - b.balance,
    },
    {
      title: "Overdue Days",
      dataIndex: "daysBalance",
      key: "daysBalance",
      render: (value, record, index) => {
        const today = new Date();
        const givenDate = new Date(record.date);
        const timeDiff = today.getTime() - givenDate.getTime();
        const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

        const sortedReceipts = ReceiptBodies.sort(
          (a, b) => new Date(b.createdDate) - new Date(a.createdDate)
        );

        const matchingReceipt = sortedReceipts.find((receipt) => {
          const voucherNo = record.voucherNo
            ? record.voucherNo.toString().trim()
            : "";
          const invoiceNo = receipt.invoiceNo
            ? receipt.invoiceNo.toString().trim()
            : "";
          return voucherNo === invoiceNo;
        });

        const noDaysDetails = [
          "Receipt",
          "Payment",
          "Return Receipt",
          "Return Payment",
        ];

        let result = "";

        if (index === 0 || noDaysDetails.includes(record.details)) {
          result = "";
        } else if (value === 0 && matchingReceipt) {
          const receiptDate = new Date(matchingReceipt.createdDate);
          const receiptTimeDiff = Math.abs(
            givenDate.getTime() - receiptDate.getTime()
          );
          const receiptDayDiff = Math.ceil(
            receiptTimeDiff / (1000 * 3600 * 24)
          );
          result = `Paid In (${receiptDayDiff}) Days`;
        } else if (value > 0) {
          result = `Overdue (${dayDiff}) Days`;
        } else if (!matchingReceipt && value === 0) {
          result = "Paid";
        } else {
          result = "0.00";
        }

        return record.inComplete ? <strong>{result}</strong> : result;
      },
    },
  ];

  const summary = () => {
    let totalDebit = 0;
    let totalCredit = 0;

    let balance = 0; // Initialize balance

    transactions.forEach(({ debit, credit }, index) => {
      if (index === 0) {
        balance = (debit || 0) - (credit || 0);
        return;
      }

      totalDebit += debit || 0;
      totalCredit += credit || 0;

      balance += (debit || 0) - (credit || 0);
    });

    return (
      <Table.Summary.Row style={{ textAlign: "right" }}>
        <Table.Summary.Cell colSpan={5}>Total</Table.Summary.Cell>
        <Table.Summary.Cell>{totalDebit.toFixed(2)}</Table.Summary.Cell>
        <Table.Summary.Cell>{totalCredit.toFixed(2)}</Table.Summary.Cell>
        <Table.Summary.Cell>{balance.toFixed(2)}</Table.Summary.Cell>
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
              <NavLink to="/customer/manage">
                <ArrowLeftIcon />
              </NavLink>
              Customer Report
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

                <PrintTable
                  selectedSupplier={selectedCustomer}
                  startDate={startDate}
                  endDate={endDate}
                  User={User}
                  title="Customer Report"
                />
              </div>
            )}
          </div>

          <div className="filters-wrap">
            <Form onFinish={fetchCustomerTransactions} form={CustomerForm}>
              <Form.Item name="customerName">
                <Select
                  style={{ width: "300px" }}
                  placeholder="Select Customer"
                  showSearch
                  optionFilterProp="label" // Specifies which prop should be filtered (label)
                  filterOption={(input, option) =>
                    option?.label?.toLowerCase().includes(input.toLowerCase())
                  }
                  loading={CustomerLoading}
                  notFoundContent={
                    CustomerLoading ? <Spin size="small" /> : null
                  }
                  options={customer}
                  onSelect={handleSelectChange}
                />
              </Form.Item>

              <Form.Item
                name="customerAccountCode"
                label="Customer Account Code"
                hidden
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="period"
                style={{ width: "150px" }}
                initialValue="year"
              >
                <Select placeholder="Date Range" onChange={setPeriod}>
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

              <Form.Item
                name="startDate"
                dependencies={["period"]}
                hidden={period !== "custom"}
              >
                <DatePicker
                  value={startDate ? dayjs(startDate, "YYYY-MM-DD") : null}
                  onChange={handleDateChange}
                />
              </Form.Item>
              <Form.Item
                name="endDate"
                dependencies={["period"]}
                hidden={period !== "custom"}
              >
                <DatePicker
                  value={endDate ? dayjs(endDate, "YYYY-MM-DD") : null}
                  onChange={handleDueDateChange}
                />
              </Form.Item>

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
              title="Customer"
              data={transactions}
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
                      {selectedCustomer
                        ? selectedCustomer.businessName
                        : "All Customers"}
                    </h2>
                    {selectedCustomer && (
                      <>
                        <h3>Account Code: {selectedCustomer.accountNo}</h3>
                      </>
                    )}
                  </div>
                  <img
                    className="report-company-name"
                    src={Logo}
                    alt="Company Logo"
                  />
                  <div className="report-right">
                    <h2>Customer Report</h2>
                    <h3>Printed by: {User} </h3>
                    <h3>Printed on: {new Date().toLocaleString()}</h3>
                  </div>
                </div>
              </div>

              <Table
                scroll={{
                  x: "100%",
                }}
                columns={columns}
                dataSource={transactions}
                rowKey="id"
                rowClassName={(record) =>
                  record.inComplete ? "incomplete-row" : ""
                }
                summary={summary}
                pagination={false}
              />
            </>
          )}

          {showTable && transactions.length === 0 && (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}

          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
      </div>
    </>
  );
};

export default CustomerReport;
