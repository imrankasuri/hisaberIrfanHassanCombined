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
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { NavLink } from "react-router-dom";
import Config from "../../Config";
import SubMenuToggle from "../Common/SubMenuToggle";
import dayjs from "dayjs";
import Logo from "../../assets/images/logo/dark-h.svg";
import ReportsMenu from "../Reports/ReportsMenu";
import SuppliersDropdown from "../Shared/SuppliersDropdown";
import {
  PlusCircleOutlined,
  PrinterOutlined,
  UploadOutlined,
  DownOutlined,
  RightOutlined,
  CaretRightOutlined,
  CaretDownOutlined,
} from "@ant-design/icons";
import ExcelJS from "exceljs";
import ReportPrinter from "../Shared/ReportPrinter";
import { renderVoucherNumber } from "../../utils/voucherNavigation";

const { Title, Text } = Typography;

const SupplierPaymentsDetail = () => {
  const navigate = useNavigate();
  const printRef = useRef();
  const AccessKey = localStorage.getItem("AccessKey");
  const CompanyID = localStorage.getItem("CompanyID");
  const User = localStorage.getItem("Full_Name");

  const [SupplierForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [SupplierLoading, setSupplierLoading] = useState(false);
  const [ListOfRecords, setListOfRecords] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState("all");
  const [supplierAccountCode, setSupplierAccountCode] = useState(null);
  const [paymentsData, setPaymentsData] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const [includeAllSuppliers, setIncludeAllSuppliers] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const defaultStartDate = dayjs().format("YYYY-MM-DD");
  const defaultEndDate = dayjs().format("YYYY-MM-DD");

  const fetchPayments = async (FormData) => {
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
        url: `${Config.base_url}Reports/GetPaymentTransactions/${CompanyID}?supplierAccountCode=${supplierAccountCode}&startDate=${effectiveStartDate}&endDate=${effectiveEndDate}&period=${FormData.period}&includeAllSuppliers=${includeAllSuppliers}`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${AccessKey}`,
        },
      };

      const response = await axios(api_config);
      //Console.log(response.data);

      if (response.data.statusCode === 1) {
        setPaymentsData(response.data.headTransactions || []);
        setShowTable(true);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch payment data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Supplier Payment Details";
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    setSupplierLoading(true);
    try {
      const response = await SuppliersDropdown();
      if (response != null) {
        setListOfRecords(response);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSupplierLoading(false);
    }
  };

  const supplier = [
    {
      businessName: "All Suppliers",
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
      setSelectedSupplier(null);
      setSupplierAccountCode("all");
      setIncludeAllSuppliers(true);
      return;
    }
    const selectedSupplier = ListOfRecords.find(
      (supplier) => supplier.id == value
    );
    if (selectedSupplier) {
      setIncludeAllSuppliers(false);
      setSelectedSupplier(ListOfRecords.find((record) => record.id === value));
      setSupplierAccountCode(selectedSupplier.accountNo);
    }
  };

  const handleDateChange = (date) => {
    setStartDate(date ? date.format("YYYY-MM-DD") : null);
  };

  const handleDueDateChange = (date) => {
    setEndDate(date ? date.format("YYYY-MM-DD") : null);
  };

  // New function to toggle row expansion
  const toggleRowExpansion = (paymentId) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(paymentId)) {
      newExpandedRows.delete(paymentId);
    } else {
      newExpandedRows.add(paymentId);
    }
    setExpandedRows(newExpandedRows);
  };

  const handleExpandAll = () => {
    const allIds = new Set(paymentsData.map((payment) => payment.id));
    setExpandedRows(allIds);
  };

  const handleCollapseAll = () => {
    setExpandedRows(new Set());
  };

  const calculatePaymentTotal = (paymentBodies) => {
    if (!paymentBodies || paymentBodies.length === 0) return 0;
    return paymentBodies.reduce((sum, item) => sum + (item.amount || 0), 0);
  };

  const calculateGrandTotal = () => {
    return paymentsData.reduce((sum, payment) => sum + (payment.total || 0), 0);
  };

  // Updated columns for collapsible table
  const columns = [
    {
      title: "",
      key: "expand",
      width: 50,
      render: (_, record) => {
        if (record.isPaymentHeader && record.hasBills) {
          const isExpanded = expandedRows.has(record.paymentId);
          return (
            <Button
              type="text"
              size="small"
              icon={isExpanded ? <CaretDownOutlined /> : <CaretRightOutlined />}
              onClick={() => toggleRowExpansion(record.paymentId)}
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
        if (record.isPaymentHeader) {
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
        if (record.isPaymentHeader) {
          const voucherElement = renderVoucherNumber(voucherNo, {
            ...record,
            voucherNo: voucherNo,
            details: "Payment",
          });
          return <strong>{voucherElement}</strong>;
        }
        return null;
      },
    },
    {
      title: "Supplier",
      dataIndex: "supplierName",
      key: "supplierName",
      render: (text, record) => {
        if (record.isPaymentHeader) {
          return (
            <NavLink
              className="primary"
              to={`/supplier/report?source=${record.supplierAccountCode}`}
            >
              {record.supplierName}
            </NavLink>
          );
        }
        return null;
      },
    },
    {
      title: "Type",
      dataIndex: "purchaseType",
      key: "purchaseType",
      render: (purchaseType, record) => {
        if (record.isPaymentHeader) {
          return purchaseType;
        }
        return null;
      },
    },
    {
      title: "Bill ID",
      dataIndex: "billID",
      key: "billID",
      render: (billID, record) => {
        if (record.isBillDetail) {
          return <span style={{ paddingLeft: "20px" }}>{billID}</span>;
        }
        return null;
      },
    },
    {
      title: "Bill Date",
      dataIndex: "createdDate",
      key: "createdDate",
      render: (createdDate, record) => {
        if (record.isBillDetail) {
          return createdDate ? dayjs(createdDate).format("YYYY-MM-DD") : "N/A";
        }
        return null;
      },
    },
    {
      title: "Bill Type",
      dataIndex: "billPurchaseType",
      key: "billPurchaseType",
      render: (billPurchaseType, record) => {
        if (record.isBillDetail) {
          return billPurchaseType || "N/A";
        }
        return null;
      },
    },
    {
      title: "Bill Voucher",
      dataIndex: "billVoucherNo",
      key: "billVoucherNo",
      render: (billVoucherNo, record) => {
        if (record.isBillDetail) {
          return billVoucherNo || "N/A";
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
        if (record.isBillDetail) {
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
        if (record.isBillDetail) {
          return total ? total.toFixed(2) : "0.00";
        }
        return null;
      },
    },
    {
      title: "Payment Amount",
      dataIndex: "paymentAmount",
      key: "paymentAmount",
      align: "right",
      render: (amount, record) => {
        if (record.isPaymentHeader && record.paymentTotal) {
          return <strong>{record.paymentTotal.toFixed(2)}</strong>;
        }
        return null;
      },
    },
  ];

  // Updated function to get table data with collapsible structure
  const getTableData = () => {
    let rows = [];

    paymentsData.forEach((payment) => {
      const hasBills =
        payment.paymentBodies && payment.paymentBodies.length > 0;
      const isExpanded = expandedRows.has(payment.id);

      // Add payment header row
      rows.push({
        key: `payment-${payment.id}`,
        paymentId: payment.id,
        date: payment.date,
        voucherNo: payment.voucherNo,
        supplierName: payment.supplierName,
        supplierAccountCode: payment.supplierAccountCode,
        purchaseType: payment.purchaseType,
        paymentAmount: payment.total,
        paymentTotal: payment.total,
        isPaymentHeader: true,
        hasBills: hasBills,
      });

      // Add bill detail rows if expanded and has bills
      if (isExpanded && hasBills) {
        payment.paymentBodies.forEach((item, idx) => {
          rows.push({
            key: `bill-${payment.id}-${idx}`,
            paymentId: payment.id,
            billID: item.billID,
            createdDate: item.createdDate,
            billPurchaseType: item.purchaseType,
            billVoucherNo: item.voucherNo,
            amount: item.amount,
            total: item.total,
            isBillDetail: true,
          });
        });
      }
    });

    return rows;
  };

  const handleExportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Supplier Payment Details");

    worksheet.addRow(["Supplier Payment Details"]);
    worksheet.addRow([
      selectedSupplier ? selectedSupplier.businessName : "All Suppliers",
      "",
      "",
      `Printed by: ${User}`,
    ]);
    worksheet.addRow([
      selectedSupplier ? `Account Code: ${selectedSupplier.accountNo}` : "",
      "",
      "",
      `Printed on: ${new Date().toLocaleString()}`,
    ]);
    worksheet.addRow([]);

    paymentsData.forEach((payment) => {
      worksheet.addRow([
        `Voucher: ${payment.voucherNo}`,
        `Date: ${dayjs(payment.date).format("YYYY-MM-DD")}`,
        `Supplier: ${payment.supplierName}`,
        `Total: ${payment.total ? payment.total.toFixed(2) : "0.00"}`,
      ]);

      if (payment.paymentBodies && payment.paymentBodies.length > 0) {
        worksheet.addRow([
          "Bill ID",
          "Date",
          "Type",
          "Voucher No",
          "Amount",
          "Total",
        ]);

        payment.paymentBodies.forEach((item) => {
          worksheet.addRow([
            item.billID || "N/A",
            item.createdDate
              ? dayjs(item.createdDate).format("YYYY-MM-DD")
              : "N/A",
            item.purchaseType || "N/A",
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
    a.download = `Supplier_Payment_Details_${dayjs().format(
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
            <h3 className="page-title">Supplier Payment Details</h3>
            {showTable && paymentsData.length > 0 && (
              <div className="header-actions">
                <ReportPrinter
                  printRef={printRef}
                  selectedSupplier={selectedSupplier}
                  startDate={startDate}
                  endDate={endDate}
                  User={User}
                  title="Supplier Payment Details"
                />
                <Button icon={<UploadOutlined />} onClick={handleExportToExcel}>
                  Export to Excel
                </Button>
              </div>
            )}
          </div>

          <div className="filters-wrap">
            <Form onFinish={fetchPayments} form={SupplierForm}>
              <Form.Item name="supplierName">
                <Select
                  style={{ width: "300px" }}
                  placeholder="Select Supplier"
                  showSearch
                  optionFilterProp="label"
                  filterOption={(input, option) =>
                    option?.label?.toLowerCase().includes(input.toLowerCase())
                  }
                  loading={SupplierLoading}
                  notFoundContent={
                    SupplierLoading ? <Spin size="small" /> : null
                  }
                  options={supplier}
                  onSelect={handleSelectChange}
                />
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

          {showTable && paymentsData.length > 0 && (
            <div className="reports-main-div">
              <div className="report-content">
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
                <div className="report-right">
                  <h2>Supplier Payment Details</h2>
                  <h3>Printed by: {User} </h3>
                  <h3>Printed on: {new Date().toLocaleString()}</h3>
                </div>
              </div>
            </div>
          )}

          <div ref={printRef}>
            {showTable && (
              <>
                <div style={{ marginBottom: 15, textAlign: "right" }}>
                  <Button onClick={handleExpandAll} style={{ marginRight: 15 }}>
                    Expand All
                  </Button>
                  <Button onClick={handleCollapseAll}>Collapse All</Button>
                </div>

                <Table
                  columns={columns}
                  dataSource={getTableData()}
                  loading={loading}
                  pagination={false}
                  bordered
                  summary={() => (
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={11} align="right">
                        <b>Grand Total</b>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={12} align="right">
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

export default SupplierPaymentsDetail;
