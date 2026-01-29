import React, { useState, useEffect, useRef } from "react";
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
  Card,
  Divider,
  Typography,
} from "antd";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import CustomerMenu from "./CustomerMenu";
import SalesMenu from "../Sales/SalesMenu";
import axios from "axios";
import Config from "../../Config";
import SubMenuToggle from "../Common/SubMenuToggle";
import dayjs from "dayjs";
import CustomersDropdown from "../Common/CustomersDropdown";
import {
  PlusCircleOutlined,
  PrinterOutlined,
  UploadOutlined,
  DownOutlined,
  RightOutlined,
  CaretRightOutlined,
  CaretDownOutlined,
} from "@ant-design/icons";
import Logo from "../../assets/images/logo/dark-h.svg";
import ExcelJS from "exceljs";
import ReportsMenu from "../Reports/ReportsMenu";
import CustomerDropdown from "../Shared/CustomerDropdown";
import { renderVoucherNumber } from "../../utils/voucherNavigation";
import ReportPrinter from "../Shared/ReportPrinter";

const { Title, Text } = Typography;

const CustomerReceiptDetails = () => {
  const navigate = useNavigate();
  const printRef = useRef();
  const AccessKey = localStorage.getItem("AccessKey");
  const CompanyID = localStorage.getItem("CompanyID");
  const User = localStorage.getItem("Full_Name");

  const [CustomerForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [CustomerLoading, setCustomerLoading] = useState(false);
  const [ListOfRecords, setListOfRecords] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState("all");
  const [customerAccountCode, setCustomerAccountCode] = useState("");
  const [receiptsData, setReceiptsData] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const defaultStartDate = dayjs().format("YYYY-MM-DD");
  const defaultEndDate = dayjs().format("YYYY-MM-DD");
  const [showTable, setShowTable] = useState(false);
  const [includeAllCustomers, setIncludeAllCustomers] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());

  const fetchReceipts = async (FormData) => {
    setLoading(true);

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
        url: `${Config.base_url}Reports/GetReceiptTransactions/${CompanyID}?customerAccountCode=${customerAccountCode}&startDate=${effectiveStartDate}&endDate=${effectiveEndDate}&period=${FormData.period}&includeAllCustomers=${includeAllCustomers}`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${AccessKey}`,
        },
      };

      const response = await axios(api_config);
      //console.log(response.data);

      if (response.data.statusCode === 1) {
        setReceiptsData(response.data.headTransactions || []);
        setShowTable(true);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch receipt data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Customer Receipt Details";
    fetchCustomers();
  }, []);

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
      setCustomerAccountCode("all");
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

  const handleDateChange = (date) => {
    setStartDate(date ? date.format("YYYY-MM-DD") : null);
  };

  const handleDueDateChange = (date) => {
    setEndDate(date ? date.format("YYYY-MM-DD") : null);
  };

  // Function to toggle row expansion
  const toggleRowExpansion = (receiptId) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(receiptId)) {
      newExpandedRows.delete(receiptId);
    } else {
      newExpandedRows.add(receiptId);
    }
    setExpandedRows(newExpandedRows);
  };

  const calculateReceiptTotal = (receiptBodies) => {
    if (!receiptBodies || receiptBodies.length === 0) return 0;
    return receiptBodies.reduce((sum, item) => sum + (item.amount || 0), 0);
  };

  const calculateGrandTotal = () => {
    return receiptsData.reduce((sum, receipt) => sum + (receipt.total || 0), 0);
  };

  // Updated columns for collapsible table
  const columns = [
    {
      title: "",
      key: "expand",
      width: 50,
      render: (_, record) => {
        if (record.isReceiptHeader && record.hasItems) {
          const isExpanded = expandedRows.has(record.receiptId);
          return (
            <Button
              type="text"
              size="small"
              icon={isExpanded ? <CaretDownOutlined /> : <CaretRightOutlined />}
              onClick={() => toggleRowExpansion(record.receiptId)}
            />
          );
        }
        return null;
      },
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date, record) => {
        if (record.isReceiptHeader) {
          return dayjs(date).format("YYYY-MM-DD");
        }
        return null;
      },
    },
    {
      title: "Voucher No.",
      dataIndex: "voucherNo",
      key: "voucherNo",
      render: (voucherNo, record) => {
        if (record.isReceiptHeader) {
          const voucherElement = renderVoucherNumber(voucherNo, {
            ...record,
            voucherNo: voucherNo,
            details: "Receipt",
          });
          return <strong>{voucherElement}</strong>;
        }
        return null;
      },
    },
    {
      title: "Customer",
      dataIndex: "customerName",
      key: "customerName",
      render: (text, record) => {
        if (record.isReceiptHeader) {
          return (
            <NavLink
              className="primary"
              to={`/customer/report?source=${record.customerAccountCode}`}
            >
              {record.customerName}
            </NavLink>
          );
        }
        return null;
      },
    },

    {
      title: "Type",
      dataIndex: "receiptType",
      key: "receiptType",
      render: (receiptType, record) => {
        if (record.isReceiptHeader) {
          return receiptType;
        }
        return null;
      },
    },
    {
      title: "Invoice No.",
      dataIndex: "invoiceNo",
      key: "invoiceNo",
      render: (invoiceNo, record) => {
        if (record.isReceiptDetail) {
          return (
            <span style={{ paddingLeft: "20px" }}>{invoiceNo || "N/A"}</span>
          );
        }
        return null;
      },
    },
    {
      title: "Invoice Date",
      dataIndex: "createdDate",
      key: "createdDate",
      render: (createdDate, record) => {
        if (record.isReceiptDetail) {
          return createdDate ? dayjs(createdDate).format("YYYY-MM-DD") : "N/A";
        }
        return null;
      },
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      align: "right",
      render: (amount, record) => {
        if (record.isReceiptDetail) {
          return amount ? amount.toFixed(2) : "0.00";
        }
        return null;
      },
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      align: "right",
      render: (total, record) => {
        if (record.isReceiptDetail) {
          return total ? total.toFixed(2) : "0.00";
        }
        if (record.isReceiptHeader && record.receiptTotal) {
          return <strong>{record.receiptTotal.toFixed(2)}</strong>;
        }
        return null;
      },
    },
  ];

  // Function to get table data with collapsible structure
  const getTableData = () => {
    let rows = [];

    receiptsData.forEach((receipt) => {
      const hasItems =
        receipt.receiptBodies && receipt.receiptBodies.length > 0;
      const isExpanded = expandedRows.has(receipt.id);

      // Add receipt header row
      rows.push({
        key: `receipt-${receipt.id}`,
        receiptId: receipt.id,
        date: receipt.date,
        voucherNo: receipt.voucherNo,
        customerName: receipt.customerName,
        customerAccountCode: receipt.customerAccountCode,
        receiptType: receipt.receiptType,
        receiptTotal: receipt.total,
        isReceiptHeader: true,
        hasItems: hasItems,
      });

      // Add receipt detail rows if expanded and has items
      if (isExpanded && hasItems) {
        receipt.receiptBodies.forEach((item, idx) => {
          rows.push({
            key: `detail-${receipt.id}-${idx}`,
            receiptId: receipt.id,
            invoiceNo: item.invoiceNo,
            createdDate: item.createdDate,
            amount: item.amount,
            total: item.total,
            isReceiptDetail: true,
          });
        });
      }
    });

    return rows;
  };

  const handleExportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Customer Receipt Details");

    worksheet.addRow(["Customer Receipt Details"]);
    worksheet.addRow([
      selectedCustomer ? selectedCustomer.businessName : "All Customers",
      "",
      "",
      `Printed by: ${User}`,
    ]);
    worksheet.addRow([
      selectedCustomer ? `Account Code: ${selectedCustomer.accountNo}` : "",
      "",
      "",
      `Printed on: ${new Date().toLocaleString()}`,
    ]);
    worksheet.addRow([]);

    receiptsData.forEach((receipt) => {
      worksheet.addRow([
        `Voucher: ${receipt.voucherNo}`,
        `Date: ${dayjs(receipt.date).format("YYYY-MM-DD")}`,
        `Customer: ${receipt.customerName}`,
        `Total: ${receipt.total ? receipt.total.toFixed(2) : "0.00"}`,
      ]);

      if (receipt.receiptBodies && receipt.receiptBodies.length > 0) {
        worksheet.addRow([
          "Invoice No",
          "Date",
          "Type",
          "Voucher No",
          "Amount",
          "Total",
        ]);

        receipt.receiptBodies.forEach((item) => {
          worksheet.addRow([
            item.invoiceNo || "N/A",
            item.createdDate
              ? dayjs(item.createdDate).format("YYYY-MM-DD")
              : "N/A",
            item.receiptType || "N/A",
            item.voucherNo || "N/A",
            item.amount ? item.amount.toFixed(2) : "0.00",
            item.total ? item.total.toFixed(2) : "0.00",
          ]);
        });

        worksheet.addRow([]);
      }
    });

    worksheet.addRow([
      "",
      "",
      "",
      "Grand Total:",
      calculateGrandTotal().toFixed(2),
    ]);

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Customer_Receipt_Details_${dayjs().format(
      "YYYY-MM-DD"
    )}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
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
            <h3 className="page-title">Customer Receipt Details</h3>
            {showTable && receiptsData.length > 0 && (
              <div className="header-actions">
                <ReportPrinter
                  printRef={printRef}
                  selectedSupplier={selectedCustomer}
                  startDate={startDate}
                  endDate={endDate}
                  User={User}
                  title="Customer Receipt Details"
                />
                <Button icon={<UploadOutlined />} onClick={handleExportToExcel}>
                  Export to Excel
                </Button>
              </div>
            )}
          </div>

          <div className="filters-wrap">
            <Form onFinish={fetchReceipts} form={CustomerForm}>
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

          {showTable && receiptsData.length > 0 && (
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
                  <h2>Customer Receipt Details</h2>
                  <h3>Printed by: {User} </h3>
                  <h3>Printed on: {new Date().toLocaleString()}</h3>
                </div>
              </div>
            </div>
          )}

          <div ref={printRef}>
            {showTable && (
              <>
                <Table
                  columns={columns}
                  dataSource={getTableData()}
                  loading={loading}
                  pagination={false}
                  bordered
                  summary={() => (
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={8} align="right">
                        <b>Grand Total</b>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={8} align="right">
                        <b>{calculateGrandTotal().toFixed(2)}</b>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  )}
                />

                {getTableData().length === 0 && (
                  <Empty description="No data found for the selected filters" />
                )}
              </>
            )}
            {error && <div style={{ color: "red" }}>{error}</div>}
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomerReceiptDetails;
