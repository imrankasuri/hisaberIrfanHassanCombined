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
import PurchaseMenu from "../Purchases/PurchaseMenu";
import axios from "axios";
import Config from "../../Config";
import SubMenuToggle from "../Common/SubMenuToggle";
import dayjs from "dayjs";
import { PrinterOutlined, UploadOutlined } from "@ant-design/icons";
import PrintTable from "../Shared/PrintTable";
import Logo from "../../assets/images/logo/dark-h.svg";
import ExcelJS from "exceljs";
import ReportsMenu from "../Reports/ReportsMenu";
import BankModeDropdown from "../Shared/BankModeDropdown";

const SupplierSummary = () => {
  const navigate = useNavigate();
  const AccessKey = localStorage.getItem("AccessKey");
  const CompanyID = localStorage.getItem("CompanyID");
  const User = localStorage.getItem("Full_Name");

  const [SupplierForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [SupplierLoading, setSupplierLoading] = useState(false);
  const [ListOfRecords, setListOfRecords] = useState([]);
  const [TotalRecords, setTotalRecords] = useState(0);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState("all");
  const [supplierAccountCode, setsupplierAccountCode] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showTable, setShowTable] = useState(false); // New state variable
  const defaultStartDate = dayjs().format("YYYY-MM-DD");
  const defaultEndDate = dayjs().format("YYYY-MM-DD");
  const [zeroBalance, setZeroBalance] = useState(true);
  const [field1, setField1] = useState("");
  const [selectedAccountCodes, setSelectedAccountCodes] = useState([]);
  const [Field1Data, setField1Data] = useState([]);

  const fetchSupplierTransactions = async (FormData) => {
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
      ////Console.log(zeroBalance);
      const api_config = {
        method: "get",
        url: `${Config.base_url}Reports/GetSupplierSummaryReportBy/${CompanyID}?selectedAccountCodes=${selectedAccountCodes}&period=${FormData.period}&startDate=${effectiveStartDate}&endDate=${effectiveEndDate}&excludeZeroBalance=${zeroBalance}`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${AccessKey}`,
        },
      };
      const response = await axios(api_config);
      // //Console.log(response.data);
      if (response.data.status_code === 1) {
        setTransactions(response.data.listofRecords || []);
        //message.success(response.data.status_message);
        setShowTable(true);
      }
    } catch (err) {
      //message.error(response.data.status_message);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Supplier Balances Summary";
    fetchSupplier();
  }, [field1]);

  const fetchSupplier = async () => {
    setSupplierLoading(true);
    const api_config = {
      method: "get",
      url: `${Config.base_url}CustomerSupplier/GetSuppliersBy/${CompanyID}?field1=${field1}`,
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
        setListOfRecords(response.data.listofSuppliers || []);
        setTotalRecords(response.data.totalRecords || 0);
        setSupplierLoading(false);
        //message.success(response.data.status_message);
      } else {
        setSupplierLoading(false);
        setListOfRecords([]);
        //message.error(response.data.status_message);
      }
    } catch (error) {
      setSupplierLoading(false);
      setListOfRecords([]);
      message.error("Network Error..");
    }
  };

  const handleSupplierChange = (value) => {
    let accountCodes = [];
    if (value === "all") {
      accountCodes = ListOfRecords.map((customer) => customer.accountNo);
      setSelectedSupplier(null); // Clear selected Supplier
      SupplierForm.setFieldsValue({
        supplierAccountCode: null,
      });
    } else {
      const Supplier = ListOfRecords.find(
        (Supplier) =>
          Supplier.businessName + " " + `(${Supplier.accountNo})` === value
      );
      setSelectedSupplier(Supplier);
      if (Supplier) {
        SupplierForm.setFieldsValue({
          supplierAccountCode: Supplier.accountNo,
        });
        accountCodes.push(Supplier.accountNo);
      }
    }
    setSelectedAccountCodes(accountCodes);
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
    const sheet = workbook.addWorksheet("Supplier Summary");

    const supplierName = selectedSupplier
      ? `${selectedSupplier.businessName} (${selectedSupplier.accountNo})`
      : "All Suppliers";

    sheet.mergeCells("A1:G2"); // Merge cells for the title
    const titleCell = sheet.getCell("C3:G3");
    titleCell.value = `Supplier Summary: ${supplierName}`;
    titleCell.font = { bold: true, size: 18 };
    titleCell.alignment = { vertical: "middle", horizontal: "center" };

    // Set column headers and their widths
    sheet.columns = [
      { header: "Account Code", key: "accountCode", width: 15 },
      { header: "Supplier Name", key: "name", width: 30 },
      { header: "Opening Balance", key: "baseBalance", width: 20 },
      { header: "Total Debit", key: "totalDebit", width: 20 },
      { header: "Total Credit", key: "totalCredit", width: 20 },
      { header: "Balance", key: "balance", width: 20 },
    ];

    const headerRow = sheet.addRow([
      "Account Code",
      "Supplier Name",
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
    transactions.forEach((supplier, index) => {
      totalBalance += supplier.balance;
      Debit += supplier.totalDebit;
      Credit += supplier.totalCredit;
      sheet.addRow({
        sr: index + 1,
        accountCode: supplier.accountCode,
        name: supplier.name,
        baseBalance: supplier.baseBalance,
        totalDebit: supplier.totalDebit,
        totalCredit: supplier.totalCredit,
        balance: supplier.balance,
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
      anchor.download = `SupplierSummary_${dateString}.xlsx`;
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
      title: "Supplier Name",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <>
          <NavLink
            className={"primary"}
            to={`/supplier/report?source=${record.accountCode}`}
          >
            {record.name.split(" (")[0]}
          </NavLink>
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

  const supplierName = SupplierForm.getFieldValue("supplierName");

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
              <NavLink to="/Supplier/manage">
                <ArrowLeftIcon />
              </NavLink>
              Supplier Balances Summary
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
                  selectedSupplier={selectedSupplier}
                  startDate=""
                  endDate=""
                  User={User}
                  title="Supplier Balances Summary"
                />
              </div>
            )}
          </div>

          <div className="filters-wrap">
            <Form
              onFinish={fetchSupplierTransactions}
              form={SupplierForm}
              initialValues={{ Field1: "all" }}
            >
              <Form.Item name="supplierName">
                <Select
                  style={{ width: "300px" }}
                  // mode="multiple"
                  placeholder="Select Supplier"
                  loading={SupplierLoading}
                  showSearch
                  filterOption={
                    (input, option) =>
                      option.value.toLowerCase().includes(input.toLowerCase()) // Use option.value, which is a string
                  }
                  notFoundContent={
                    SupplierLoading ? <Spin size="small" /> : null
                  }
                  onSelect={handleSupplierChange}
                >
                  <Select.Option value="all">All Suppliers</Select.Option>
                  {ListOfRecords.map((Supplier) => (
                    <Select.Option
                      key={Supplier.accountNo}
                      value={Supplier.businessName + ` (${Supplier.accountNo})`}
                    >
                      {Supplier.businessName} ({Supplier.accountNo})
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="Field1">
                <Select
                  style={{ width: "200px" }}
                  // mode="multiple"
                  placeholder="Select Supplier Type"
                  loading={SupplierLoading}
                  showSearch
                  filterOption={
                    (input, option) =>
                      option.value.toLowerCase().includes(input.toLowerCase()) // Use option.value, which is a string
                  }
                  notFoundContent={
                    SupplierLoading ? <Spin size="small" /> : null
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
                name="supplierAccountCode"
                label="Supplier Account Code"
                hidden
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="period"
                onChange={(value) => setPeriod(value)}
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
                dependencies={["supplierName"]}
                hidden={supplierName !== "all"}
              >
                <Checkbox
                  onChange={handleCheckboxChange}
                  checked={zeroBalance}
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
                      {selectedSupplier
                        ? selectedSupplier.businessName
                        : "All Suppliers"}
                    </h2>
                    {selectedSupplier && (
                      <>
                        <h3>Account Code: {selectedSupplier.accountNo}</h3>
                      </>
                    )}
                  </div>
                  <img className="report-company-name" src={Logo} />
                  {/* Right: User Name and Printed Date */}
                  <div className="report-right">
                    <h2>Supplier Balances Summary</h2>
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

export default SupplierSummary;
