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
  Checkbox,
} from "antd";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import SalesMenu from "../Sales/SalesMenu";
import axios from "axios";
import Config from "../../Config";
import SubMenuToggle from "../Common/SubMenuToggle";
import dayjs from "dayjs";
import {
  ConsoleSqlOutlined,
  PrinterOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import PrintTable from "../Shared/PrintTable";
import Logo from "../../assets/images/logo/dark-h.svg";
import ExcelJS from "exceljs";
import CustomerDropdown from "../Shared/CustomerDropdown";
import ReportsMenu from "../Reports/ReportsMenu";
import BankModeDropdown from "../Shared/BankModeDropdown";

const CustomerSummary = () => {
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
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showTable, setShowTable] = useState(false); // New state variable
  const defaultDate = dayjs().format("YYYY-MM-DD");
  const [Field1Data, setField1Data] = useState([]);
  const [zeroBalance, setZeroBalance] = useState(false);
  const [selectedAccountCodes, setSelectedAccountCodes] = useState([]);
  const defaultStartDate = dayjs().format("YYYY-MM-DD");
  const defaultEndDate = dayjs().format("YYYY-MM-DD");
  const [field1, setField1] = useState("");

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
      //////Console.log(zeroBalance);
      const api_config = {
        method: "get",
        url: `${Config.base_url}Reports/GetCustomerSummaryReportBy/${CompanyID}?selectedAccountCodes=${selectedAccountCodes}&period=${FormData.period}&startDate=${effectiveStartDate}&endDate=${effectiveEndDate}&excludeZeroBalance=${zeroBalance}`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${AccessKey}`,
        },
      };
      const response = await axios(api_config);
      ////Console.log(response.data);
      setTransactions(response.data.listofRecords || []);
      setShowTable(true);
    } catch (err) {
      //console.error("Error fetching customer transactions:", err);
      // setError("Failed to load transactions.");
      message.error("Network Error...");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Customer Balances Summary";
    fetchCustomer();
  }, [field1]);

  const fetchCustomer = async () => {
    setCustomerLoading(true);
    const api_config = {
      method: "get",
      url: `${Config.base_url}CustomerSupplier/GetCustomersBy/${CompanyID}?field1=${field1}`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AccessKey}`,
      },
    };

    try {
      const response = await axios(api_config);
      if (response.data && response.data.status_code === 1) {
        const field1 = await BankModeDropdown(CompanyID, "Field1");
        setField1Data(field1);
        setListOfRecords(response.data.listofCustomers || []);
        setTotalRecords(response.data.totalRecords || 0);
        setCustomerLoading(false);
        //message.success(response.data.status_message);
      } else {
        setCustomerLoading(false);
        setListOfRecords([]);
        //message.error(response.data.status_message);
      }
    } catch (error) {
      setCustomerLoading(false);
      setListOfRecords([]);
      message.error("Network Error..");
    }
  };

  const handleCustomerChange = (value) => {
    ////Console.log(ListOfRecords)
    ////Console.log(field1)
    let accountCodes = [];
    if (value === "all") {
      accountCodes = ListOfRecords.map((customer) => customer.accountNo);
      setSelectedCustomer(null); // Clear selected customer
      CustomerForm.setFieldsValue({
        customerAccountCode: null,
      });
      setZeroBalance(true);
    } else {
      setZeroBalance(false);
      const customer = ListOfRecords.find(
        (customer) =>
          customer.businessName + " " + `(${customer.accountNo})` === value
      );
      setSelectedCustomer(customer);
      if (customer) {
        CustomerForm.setFieldsValue({
          customerAccountCode: customer.accountNo,
        });
        accountCodes.push(customer.accountNo);
      }
    }
    setSelectedAccountCodes(accountCodes);
    ////Console.log(accountCodes)
  };

  const handleStartDateChange = (date, dateString) => {
    setStartDate(date ? date.format("YYYY-MM-DD") : null);
  };

  const handleEndDateChange = (date, dateString) => {
    setEndDate(date ? date.format("YYYY-MM-DD") : null);
  };

  const handleCheckboxChange = (e) => {
    setZeroBalance(e.target.checked);
  };

  const handleExport = () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Customer Summary");

    const customerName = selectedCustomer
      ? `${selectedCustomer.businessName} (${selectedCustomer.accountNo})`
      : "All Customers";

    sheet.mergeCells("A1:G2"); // Merge cells for the title
    const titleCell = sheet.getCell("C3:G3");
    titleCell.value = `Customer Summary: ${customerName}`;
    titleCell.font = { bold: true, size: 18 };
    titleCell.alignment = { vertical: "middle", horizontal: "center" };

    // Set column headers and their widths
    sheet.columns = [
      { header: "Account Code", key: "accountCode", width: 15 },
      { header: "Customer Name", key: "name", width: 30 },
      { header: "Opening Balance", key: "baseBalance", width: 20 },
      { header: "Total Debit", key: "totalDebit", width: 20 },
      { header: "Total Credit", key: "totalCredit", width: 20 },
      { header: "Balance", key: "balance", width: 20 },
    ];

    const headerRow = sheet.addRow([
      "Account Code",
      "Customer Name",
      "Opening Balance",
      "Total Debit",
      "Total Credit",
      "Balance",
    ]);

    // Apply styling to the header row
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } }; // White text color
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF324F94" }, // Background color #324F94 (blue)
    };

    let totalBalance = 0;
    let Debit = 0;
    let Credit = 0;

    // Add rows to the sheet
    transactions.forEach((customer, index) => {
      totalBalance += customer.balance;
      Debit += customer.totalDebit;
      Credit += customer.totalCredit;

      sheet.addRow({
        sr: index + 1,
        accountCode: customer.accountCode,
        name: customer.name,
        baseBalance: customer.baseBalance,
        totalDebit: customer.totalDebit,
        totalCredit: customer.totalCredit,
        balance: customer.balance,
      });
    });

    const totalsRow = sheet.addRow({
      name: "Totals", // Label for totals
      totalDebit: Debit.toFixed(2),
      totalCredit: Credit.toFixed(2),
      balance: totalBalance.toFixed(2),
    });

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
      anchor.download = `CustomerSummary_${dateString}.xlsx`;
      anchor.click();
      window.URL.revokeObjectURL(url);
    });
  };

  const columns = [
    {
      title: "Sr#",
      dataIndex: "",
      key: "SR",
      render: (_, record, index) => index + 1,
    },
    {
      title: "Account Code",
      dataIndex: "accountCode",
      key: "accountCode",
      sorter: (a, b) => a.accountCode - b.accountCode,
    },
    {
      title: "Customer Name",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <>
          <>
            <NavLink
              className={"primary"}
              to={`/customer/report?source=${record.accountCode}`}
            >
              {record.name.split(" (")[0]}
            </NavLink>
          </>
        </>
      ),
      sorter: (a, b) => String(a.name).localeCompare(String(b.name)),
    },
    {
      title: "Opening Balance",
      dataIndex: "baseBalance",
      key: "baseBalance",
      render: (value) => (
        <div style={{ textAlign: "right" }}>
          {value ? value.toFixed(2) : "0.00"}
        </div>
      ),
      sorter: (a, b) => a.baseBalance - b.baseBalance,
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
      sorter: (a, b) => a.totalDebit - b.totalDebit,
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
      sorter: (a, b) => a.totalCredit - b.totalCredit,
    },
    {
      title: "Balance",
      dataIndex: "balance",
      key: "balance",
      render: (value) => (
        <div style={{ textAlign: "right" }}>
          {value ? value.toFixed(2) : "0.00"}
        </div>
      ),
      sorter: (a, b) => a.balance - b.balance,
    },
  ];

  const summary = () => {
    let totalBalance = 0; // Changed variable name to avoid confusion
    let totalBaseBalance = 0; // Changed variable name for clarity
    let totalDebit = 0;
    let totalCredit = 0;

    transactions.forEach(
      ({ totalCredit: credit, totalDebit: debit, balance, baseBalance }) => {
        totalBalance += balance || 0; // Use totalBalance for overall balance
        totalBaseBalance += baseBalance || 0; // Use totalBaseBalance for overall base balance
        totalDebit += debit || 0; // Use the renamed variable for totalDebit
        totalCredit += credit || 0; // Use the renamed variable for totalCredit
      }
    );

    return (
      <Table.Summary.Row style={{ textAlign: "right" }}>
        <Table.Summary.Cell colSpan={3}>Total</Table.Summary.Cell>
        <Table.Summary.Cell>{totalBaseBalance.toFixed(2)}</Table.Summary.Cell>
        <Table.Summary.Cell>{totalDebit.toFixed(2)}</Table.Summary.Cell>
        <Table.Summary.Cell>{totalCredit.toFixed(2)}</Table.Summary.Cell>
        <Table.Summary.Cell>{totalBalance.toFixed(2)}</Table.Summary.Cell>
        <Table.Summary.Cell>
          {/* Balance can be calculated if needed */}
        </Table.Summary.Cell>
      </Table.Summary.Row>
    );
  };

  const handleFieldChange = (field1) => {
    if (!field1) return;
    setField1(field1);
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
              Customer Balances Summary
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
                  startDate=""
                  endDate=""
                  User={User}
                  title="Customer Balances Summary"
                />
              </div>
            )}
          </div>

          <div className="filters-wrap">
            <Form
              onFinish={fetchCustomerTransactions}
              form={CustomerForm}
              initialValues={{ Field1: "all" }}
            >
              <Form.Item name="customerName">
                <Select
                  style={{ width: "300px" }}
                  // mode="multiple"
                  placeholder="Select Customer"
                  loading={CustomerLoading}
                  showSearch
                  filterOption={
                    (input, option) =>
                      option.value.toLowerCase().includes(input.toLowerCase()) // Use option.value, which is a string
                  }
                  notFoundContent={
                    CustomerLoading ? <Spin size="small" /> : null
                  }
                  onSelect={handleCustomerChange}
                >
                  <Select.Option value="all" selected>
                    All Customers
                  </Select.Option>
                  {ListOfRecords.map((customer) => (
                    <Select.Option
                      key={customer.accountNo}
                      value={customer.businessName + ` (${customer.accountNo})`}
                    >
                      {customer.businessName} ({customer.accountNo})
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="Field1">
                <Select
                  style={{ width: "200px" }}
                  // mode="multiple"
                  placeholder="Select Customer Type"
                  loading={CustomerLoading}
                  showSearch
                  filterOption={
                    (input, option) =>
                      option.value.toLowerCase().includes(input.toLowerCase()) // Use option.value, which is a string
                  }
                  notFoundContent={
                    CustomerLoading ? <Spin size="small" /> : null
                  }
                  onSelect={handleFieldChange}
                >
                  <Select.Option value="all">All Types</Select.Option>
                  {Field1Data.map((item) => (
                    <Select.Option key={item.id} value={item.name}>
                      {item.name}
                    </Select.Option>
                  ))}
                </Select>
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
                initialValue="year"
                style={{ width: "150px" }}
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
                  style={{ width: "100%" }}
                  onChange={handleStartDateChange}
                />
              </Form.Item>

              <Form.Item
                name="endDate"
                dependencies={["period"]}
                hidden={period !== "custom"}
              >
                <DatePicker
                  value={endDate ? dayjs(endDate, "YYYY-MM-DD") : null}
                  style={{ width: "100%" }}
                  onChange={handleEndDateChange}
                />
              </Form.Item>
              <Form.Item
                name="ZeroBalance"
                label="Exclude Zero"
                dependencies={["customerName"]}
                hidden={CustomerForm.getFieldValue("customerName") !== "all"}
              >
                <Checkbox
                  defaultChecked={true}
                  checked={zeroBalance}
                  onChange={handleCheckboxChange}
                />
              </Form.Item>

              <Button type="primary" htmlType="submit" loading={loading}>
                Run Report
              </Button>
            </Form>
          </div>

          {showTable && transactions.length > 0 && (
            <>
              <div className="reports-main-div">
                {/* Main Content */}

                <div className="report-content">
                  {/* Left: Account Code and Opening Balance */}
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
                  <img className="report-company-name" src={Logo} />
                  {/* Right: User Name and Printed Date */}
                  <div className="report-right">
                    <h2>Customer Balances Summary</h2>
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

export default CustomerSummary;
