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
import { UploadOutlined } from "@ant-design/icons";
import PrintTable from "../Shared/PrintTable";
import Logo from "../../assets/images/logo/dark-h.svg";
import ExcelJS from "exceljs";
import ReportsMenu from "../Reports/ReportsMenu";

const CustomerReportWithInvoiceDetail = () => {
  const navigate = useNavigate();
  const AccessKey = localStorage.getItem("AccessKey");
  const CompanyID = localStorage.getItem("CompanyID");
  const User = localStorage.getItem("Full_Name");

  const [CustomerForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [CustomerLoading, setCustomerLoading] = useState(false);
  const [ListOfRecords, setListOfRecords] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState("all");
  const [customerAccountCode, setCustomerAccountCode] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const defaultStartDate = dayjs().format("YYYY-MM-DD");
  const defaultEndDate = dayjs().format("YYYY-MM-DD");
  const [includeAllCustomers, setIncludeAllCustomers] = useState(false);

  const fetchCustomerInvoiceDetails = async (FormData) => {
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
        url: `${Config.base_url}Reports/GetCustomerReportWithInvoiceDetail/${CompanyID}?customerAccountCode=${customerAccountCode}&startDate=${effectiveStartDate}&endDate=${effectiveEndDate}&period=${FormData.period}&includeAllCustomers=${includeAllCustomers}`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${AccessKey}`,
        },
      };
      const response = await axios(api_config);
      //console.log(response);

      // Handle the backend response structure
      if (response.data.status_code === 1) {
        setTransactions(response.data.data || []);
        setShowTable(true);
      } else {
        message.error(response.data.status_message || "Failed to fetch data");
        setTransactions([]);
        setShowTable(false);
      }
    } catch (err) {
      message.error("Network Error..");
      console.error(err);
      setTransactions([]);
      setShowTable(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Customer Report with Invoice Detail";
    fetchCustomers();

    const urlParams = new URLSearchParams(window.location.search);
    const accountCode = urlParams.get("source") || "";
    setCustomerAccountCode(accountCode);
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
    if (Object.keys(formData).length > 0) {
      fetchCustomerInvoiceDetails(formData);
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
      console.error(error);
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
    const sheet = workbook.addWorksheet("Customer Report with Invoice Detail");

    // Add customer name as a title at the top
    const customerName = selectedCustomer
      ? `${selectedCustomer.businessName} (${selectedCustomer.accountNo})`
      : "All Customers";

    sheet.mergeCells("A1:J2");
    const titleCell = sheet.getCell("A1");
    titleCell.value = `Customer Report with Invoice Detail: ${customerName}`;
    titleCell.font = { bold: true, size: 18 };
    titleCell.alignment = { vertical: "middle", horizontal: "center" };

    // Set column headers and their widths
    sheet.columns = [
      { header: "Date", key: "date", width: 12 },
      { header: "Inv. No.", key: "invNo", width: 10 },
      { header: "Doc No", key: "docNo", width: 10 },
      { header: "Description", key: "description", width: 35 },
      { header: "Quantity", key: "quantity", width: 12 },
      { header: "Rate", key: "rate", width: 10 },
      { header: "Amount", key: "amount", width: 12 },
      { header: "Debit", key: "debit", width: 12 },
      { header: "Credit", key: "credit", width: 12 },
      { header: "Balance", key: "balance", width: 15 },
    ];

    // Add column headers to row 3
    const headerRow = sheet.addRow([
      "Date",
      "Inv. No.",
      "Doc No",
      "Description",
      "Quantity",
      "Rate",
      "Amount",
      "Debit",
      "Credit",
      "Balance",
    ]);

    // Apply styling to the header row
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF324F94" },
    };

    let runningBalance = 0;
    let totalAmount = 0;
    let totalDebit = 0;
    let totalCredit = 0;

    // Add rows to the sheet
    transactions.forEach((transaction, index) => {
      if (transaction.isOpeningBalance) {
        runningBalance = transaction.balance;
        sheet.addRow({
          date: dayjs(transaction.date).format("YYYY-MM-DD"),
          invNo: "",
          docNo: "",
          description: "Opening Balance",
          quantity: "",
          rate: "",
          amount: "",
          debit: transaction.debit || "",
          credit: transaction.credit || "",
          balance: runningBalance.toFixed(2),
        });
      } else if (transaction.items && transaction.items.length > 0) {
        // Add invoice items
        transaction.items.forEach((item, itemIndex) => {
          if (itemIndex === 0) {
            // First item includes transaction totals
            runningBalance +=
              (transaction.debit || 0) - (transaction.credit || 0);
            totalDebit += transaction.debit || 0;
            totalCredit += transaction.credit || 0;
          }
          totalAmount += item.amount || 0;

          sheet.addRow({
            date:
              itemIndex === 0
                ? dayjs(transaction.date).format("YYYY-MM-DD")
                : "",
            invNo: itemIndex === 0 ? transaction.invoiceNo : "",
            docNo: itemIndex === 0 ? transaction.docNo : "",
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
            amount: (item.amount || 0).toFixed(2),
            debit: itemIndex === 0 ? (transaction.debit || 0).toFixed(2) : "",
            credit: itemIndex === 0 ? (transaction.credit || 0).toFixed(2) : "",
            balance: itemIndex === 0 ? runningBalance.toFixed(2) : "",
          });
        });
      } else {
        // Non-invoice transactions (payments, etc.)
        runningBalance += (transaction.debit || 0) - (transaction.credit || 0);
        totalDebit += transaction.debit || 0;
        totalCredit += transaction.credit || 0;

        sheet.addRow({
          date: dayjs(transaction.date).format("YYYY-MM-DD"),
          invNo: transaction.invoiceNo || "",
          docNo: transaction.docNo || "",
          description: transaction.details,
          quantity: "",
          rate: "",
          amount: "",
          debit: (transaction.debit || 0).toFixed(2),
          credit: (transaction.credit || 0).toFixed(2),
          balance: runningBalance.toFixed(2),
        });
      }
    });

    // Add totals row
    const totalsRow = sheet.addRow({
      description: "Grand Total",
      debit: totalDebit.toFixed(2),
      credit: totalCredit.toFixed(2),
      balance: runningBalance.toFixed(2),
    });

    totalsRow.font = { bold: true };
    totalsRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF2F2F2" },
    };

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
      anchor.download = `CustomerReportWithInvoiceDetail_${dateString}.xlsx`;
      anchor.click();
      window.URL.revokeObjectURL(url);
    });
  };

  let runningBalance = 0;

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date, record) => {
        if (record.isItemRow && record.itemIndex > 0) return "";
        const formatted = dayjs(date).format("YYYY-MM-DD");
        return record.inComplete ? <strong>{formatted}</strong> : formatted;
      },
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
    },
    {
      title: "Inv. No.",
      dataIndex: "invoiceNo",
      key: "invoiceNo",
      render: (text, record) => {
        if (record.isItemRow && record.itemIndex > 0) return "";
        return record.inComplete ? <strong>{text || ""}</strong> : text || "";
      },
      sorter: (a, b) => a.invoiceNo - b.invoiceNo,
    },
    {
      title: "Doc No",
      dataIndex: "docNo",
      key: "docNo",
      render: (text, record) => {
        if (record.isItemRow && record.itemIndex > 0) return "";
        return record.inComplete ? <strong>{text || ""}</strong> : text || "";
      },
      sorter: (a, b) => a.docNo.localeCompare(b.docNo),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text, record) => {
        return record.inComplete ? <strong>{text}</strong> : text;
      },
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      render: (value, record) => {
        if (!record.isItemRow) return "";
        return record.inComplete ? <strong>{value || ""}</strong> : value || "";
      },
      sorter: (a, b) => a.quantity - b.quantity,
    },
    {
      title: "Rate",
      dataIndex: "rate",
      key: "rate",
      render: (value, record) => {
        if (!record.isItemRow) return "";
        return record.inComplete ? <strong>{value || ""}</strong> : value || "";
      },
      sorter: (a, b) => a.rate - b.rate,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (value, record) => {
        if (!record.isItemRow) return "";
        const formatted = value ? value.toFixed(2) : "";
        return (
          <div style={{ textAlign: "right" }}>
            {record.inComplete ? <strong>{formatted}</strong> : formatted}
          </div>
        );
      },
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: "Debit",
      dataIndex: "debit",
      key: "debit",
      render: (value, record) => {
        if (record.isItemRow && record.itemIndex > 0) return "";
        const formatted = value ? value.toFixed(2) : "";
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
        if (record.isItemRow && record.itemIndex > 0) return "";
        const formatted = value ? value.toFixed(2) : "";
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
    },
  ];

  // Process transactions to create flat structure with items
  const processedTransactions = [];
  transactions.forEach((transaction, transactionIndex) => {
    if (transaction.isOpeningBalance) {
      processedTransactions.push({
        ...transaction,
        key: `opening-${transactionIndex}`,
        description: "Opening Balance",
      });
    } else if (transaction.items && transaction.items.length > 0) {
      transaction.items.forEach((item, itemIndex) => {
        processedTransactions.push({
          ...transaction,
          ...item,
          key: `${transaction.id || transactionIndex}-${itemIndex}`,
          isItemRow: true,
          itemIndex: itemIndex,
          description: item.description,
        });
      });
    } else {
      processedTransactions.push({
        ...transaction,
        key: `transaction-${transactionIndex}`,
        description: transaction.details,
      });
    }
  });

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
        <Table.Summary.Cell colSpan={7}>Total</Table.Summary.Cell>
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
              Customer Report with Invoice Detail
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
                  title="Customer Report with Invoice Detail"
                />
              </div>
            )}
          </div>

          <div className="filters-wrap">
            <Form onFinish={fetchCustomerInvoiceDetails} form={CustomerForm}>
              <Form.Item name="customerName">
                <Select
                  style={{ width: "300px" }}
                  placeholder="Select Customer"
                  showSearch
                  optionFilterProp="label"
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
            </Form>
          </div>

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
                  <img className="report-company-name" src={Logo} />
                  <div className="report-right">
                    <h2>Customer Report with Invoice Detail</h2>
                    <h3>Printed by: {User}</h3>
                    <h3>Printed on: {new Date().toLocaleString()}</h3>
                  </div>
                </div>
              </div>

              <Table
                scroll={{ x: "100%" }}
                columns={columns}
                dataSource={processedTransactions}
                rowKey="key"
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

export default CustomerReportWithInvoiceDetail;
