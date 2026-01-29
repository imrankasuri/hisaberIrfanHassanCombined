import React, { useState, useEffect, useCallback } from "react";
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
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Config from "../../Config";
import SubMenuToggle from "../Common/SubMenuToggle";
import dayjs from "dayjs";
import {
  PrinterOutlined,
  UploadOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import Logo from "../../assets/images/logo/dark-h.svg";
import PrintTable from "../Shared/PrintTable";
import ExcelJS from "exceljs";
import ReportsMenu from "../Reports/ReportsMenu";
import SuppliersDropdown from "../Shared/SuppliersDropdown";
import { renderVoucherNumber } from "../../utils/voucherNavigation";
import SummaryView from "../Shared/SummaryView";

const SupplierReport = () => {
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
  const [supplierAccountCode, setSupplierAccountCode] = useState(null);
  const [sourceAccountCode, setSourceAccountCode] = useState(null);
  const [includeAllSuppliers, setIncludeAllSuppliers] = useState(true);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const [showSummaryView, setShowSummaryView] = useState(false);
  const [ReceiptBodies, setReceiptBodies] = useState([]);

  const defaultStartDate = dayjs().format("YYYY-MM-DD");
  const defaultEndDate = dayjs().format("YYYY-MM-DD");

  // Memoized function to prevent infinite re-renders
  const fetchSupplierTransactions = useCallback(
    async (FormData) => {
      if (!FormData || typeof FormData !== "object") {
        console.warn("Invalid FormData provided to fetchSupplierTransactions");
        return;
      }

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
          }Reports/GetSupplierReportBy/${CompanyID}?supplierAccountCode=${
            supplierAccountCode || ""
          }&startDate=${effectiveStartDate}&endDate=${effectiveEndDate}&period=${
            FormData.period || "all"
          }&includeAllSuppliers=${includeAllSuppliers}`,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${AccessKey}`,
          },
        };

        const response = await axios(api_config);

        if (response.data) {
          setTransactions(Array.isArray(response.data) ? response.data : []);
          setShowTable(true);
        } else {
          setTransactions([]);
          message.warning("No data received from server");
        }
      } catch (err) {
        console.error("Error fetching supplier transactions:", err);
        setError("Failed to fetch supplier transactions");
        setTransactions([]);

        if (err.response) {
          message.error(err.response.data?.message || "Server error occurred");
        } else if (err.request) {
          message.error("Network error - please check your connection");
        } else {
          message.error("An unexpected error occurred");
        }
      } finally {
        setLoading(false);
      }
    },
    [
      AccessKey,
      CompanyID,
      supplierAccountCode,
      includeAllSuppliers,
      defaultStartDate,
      defaultEndDate,
    ]
  );

  const fetchPaymentBodies = useCallback(async () => {
    setLoading(true);
    try {
      const api_config = {
        method: "get",
        url: `${Config.base_url}Reports/GetPaymentBodyDetails/${CompanyID}`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${AccessKey}`,
        },
      };
      const response = await axios(api_config);
      setReceiptBodies(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Error fetching payment bodies:", err);
      message.error("Failed to fetch payment details");
    } finally {
      setLoading(false);
    }
  }, [AccessKey, CompanyID]);

  const fetchSuppliers = useCallback(async () => {
    setSupplierLoading(true);
    try {
      const response = await SuppliersDropdown();
      if (response && Array.isArray(response)) {
        setListOfRecords(response);
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      message.error("Failed to fetch suppliers");
    } finally {
      setSupplierLoading(false);
    }
  }, []);

  // Initialize component
  useEffect(() => {
    document.title = "Supplier Report";
    fetchSuppliers();
    fetchPaymentBodies();

    const urlParams = new URLSearchParams(window.location.search);
    const accountCode = urlParams.get("source") || "";

    if (accountCode) {
      setSourceAccountCode(accountCode);
      setIncludeAllSuppliers(false);
    }
  }, [fetchSuppliers, fetchPaymentBodies]);

  // Handle URL source account code
  useEffect(() => {
    if (!sourceAccountCode || ListOfRecords.length === 0) return;

    const selectedSupplier = ListOfRecords.find(
      (supplier) => supplier.accountCode === sourceAccountCode
    );

    if (selectedSupplier) {
      SupplierForm.setFieldValue("supplierName", selectedSupplier.businessName);
      setSelectedSupplier(selectedSupplier);
      setSupplierAccountCode(selectedSupplier.accountNo);
      setIncludeAllSuppliers(false);
    }
  }, [ListOfRecords, sourceAccountCode, SupplierForm]);

  // Auto-fetch when supplier is selected (but only if form has values)
  useEffect(() => {
    if (!selectedSupplier) return;

    const formData = SupplierForm.getFieldsValue(true);

    // Only fetch if form has meaningful data
    if (formData && Object.keys(formData).length > 0 && formData.period) {
      fetchSupplierTransactions(formData);
    }
  }, [selectedSupplier, SupplierForm, fetchSupplierTransactions]);

  // Memoized supplier options
  const supplierOptions = React.useMemo(() => {
    const baseSupplier = {
      businessName: "All Suppliers",
      accountCode: "0000",
      accountNo: "0000",
      id: 0,
      isCustomer: true,
      isSupplier: false,
    };

    return [baseSupplier, ...ListOfRecords].map(
      ({
        businessName,
        accountCode,
        id,
        isCustomer,
        isSupplier,
        accountNo,
      }) => {
        const trimmedBusinessName = (businessName || "").trim();
        const parsedAccountCode = parseInt(accountCode) || 0;
        let accountLabel = accountNo || "";

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
  }, [ListOfRecords]);

  const handleSelectChange = (value) => {
    if (value === 0) {
      setSelectedSupplier(null);
      setSupplierAccountCode("");
      setIncludeAllSuppliers(true);
      return;
    }

    const selectedSupplier = ListOfRecords.find(
      (supplier) => supplier.id === value
    );

    if (selectedSupplier) {
      setIncludeAllSuppliers(false);
      setSelectedSupplier(selectedSupplier);
      setSupplierAccountCode(selectedSupplier.accountNo);
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
      setStartDate(null);
      setEndDate(null);
      SupplierForm.setFieldsValue({ startDate: null, endDate: null });
    }
  };

  const handleExport = useCallback(() => {
    if (!transactions.length) {
      message.warning("No data to export");
      return;
    }

    try {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Suppliers Report");

      const supplierName = selectedSupplier
        ? `${selectedSupplier.businessName} (${selectedSupplier.accountNo})`
        : "All Suppliers";

      // Title
      sheet.mergeCells("A1:H2");
      const titleCell = sheet.getCell("A1");
      titleCell.value = `Supplier Report: ${supplierName}`;
      titleCell.font = { bold: true, size: 18 };
      titleCell.alignment = { vertical: "middle", horizontal: "center" };

      // Headers
      sheet.columns = [
        { header: "Date", key: "date", width: 30 },
        { header: "Details", key: "details", width: 20 },
        { header: "Ref No", key: "refNo", width: 10 },
        { header: "V. No", key: "voucherNo", width: 10 },
        { header: "Debit", key: "debit", width: 20 },
        { header: "Credit", key: "credit", width: 20 },
        { header: "Balance", key: "balance", width: 20 },
        { header: "Overdue Days", key: "daysBalance", width: 20 },
      ];

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

      headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF324F94" },
      };

      let runningBalance = 0;
      let totalDebit = 0;
      let totalCredit = 0;
      const today = new Date();
      const noDaysDetails = [
        "Receipt",
        "Payment",
        "Return Receipt",
        "Return Payment",
      ];

      // Data rows
      transactions.forEach((supplier, index) => {
        const currentBalance = (supplier.credit || 0) - (supplier.debit || 0);
        const givenDate = new Date(supplier.date);
        const timeDiff = today.getTime() - givenDate.getTime();
        const dayDifference = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

        if (index === 0) {
          runningBalance = currentBalance;
        } else {
          runningBalance += currentBalance;
        }
        totalDebit += supplier.debit || 0;
        totalCredit += supplier.credit || 0;

        let overdueDays = "";
        if (index === 0 || noDaysDetails.includes(supplier.details)) {
          overdueDays = "No Days";
        } else if (supplier.balance > 0) {
          overdueDays = `Overdue Days (${dayDifference})`;
        } else if (supplier.balance === 0) {
          overdueDays = "Paid";
        } else {
          overdueDays = "0.00";
        }

        sheet.addRow({
          date: dayjs(supplier.date).format("YYYY-MM-DD"),
          details: supplier.details,
          refNo: supplier.refNo,
          voucherNo: supplier.voucherNo,
          debit: supplier.debit || 0,
          credit: supplier.credit || 0,
          balance: runningBalance.toFixed(2),
          daysBalance: overdueDays,
        });
      });

      // Totals row
      const totalsRow = sheet.addRow({
        date: "Totals",
        debit: totalDebit.toFixed(2),
        credit: totalCredit.toFixed(2),
        balance: runningBalance.toFixed(2),
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
        .toISOString()
        .replace(/[^0-9]/g, "")
        .substring(0, 14);

      workbook.xlsx
        .writeBuffer()
        .then((data) => {
          const blob = new Blob([data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });
          const url = window.URL.createObjectURL(blob);
          const anchor = document.createElement("a");
          anchor.href = url;
          anchor.download = `SupplierReport_${dateString}.xlsx`;
          anchor.click();
          window.URL.revokeObjectURL(url);
          message.success("Report exported successfully");
        })
        .catch((error) => {
          console.error("Export error:", error);
          message.error("Failed to export report");
        });
    } catch (error) {
      console.error("Export error:", error);
      message.error("Failed to export report");
    }
  }, [transactions, selectedSupplier]);

  // Table columns with proper error handling
  const getColumns = () => {
    let runningBalance = 0;

    return [
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
          const formattedDate = date ? dayjs(date).format("YYYY-MM-DD") : "N/A";
          return record.inComplete ? (
            <strong>{formattedDate}</strong>
          ) : (
            formattedDate
          );
        },
        sorter: (a, b) => {
          const dateA = a.date ? dayjs(a.date).unix() : 0;
          const dateB = b.date ? dayjs(b.date).unix() : 0;
          return dateA - dateB;
        },
      },
      {
        title: "Details",
        dataIndex: "details",
        key: "details",
        render: (text, record) => {
          const label =
            text === "Invoice" || text === "Receipt"
              ? `Sale ${text}`
              : `Purchase ${text}`;
          return record.inComplete ? <strong>{label}</strong> : label;
        },
        sorter: (a, b) =>
          String(a.details || "").localeCompare(String(b.details || "")),
      },
      {
        title: "Ref No",
        dataIndex: "refNo",
        key: "refNo",
        render: (text, record) =>
          record.inComplete ? <strong>{text || "N/A"}</strong> : text || "N/A",
        sorter: (a, b) =>
          String(a.refNo || "").localeCompare(String(b.refNo || "")),
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
        sorter: (a, b) => (a.voucherNo || 0) - (b.voucherNo || 0),
      },
      {
        title: "Debit",
        dataIndex: "debit",
        key: "debit",
        render: (value, record) => (
          <div style={{ textAlign: "right" }}>
            {record.inComplete ? (
              <strong>{value ? value.toFixed(2) : "0.00"}</strong>
            ) : (
              value?.toFixed(2) || "0.00"
            )}
          </div>
        ),
        sorter: (a, b) => (a.debit || 0) - (b.debit || 0),
      },
      {
        title: "Credit",
        dataIndex: "credit",
        key: "credit",
        render: (value, record) => (
          <div style={{ textAlign: "right" }}>
            {record.inComplete ? (
              <strong>{value ? value.toFixed(2) : "0.00"}</strong>
            ) : (
              value?.toFixed(2) || "0.00"
            )}
          </div>
        ),
        sorter: (a, b) => (a.credit || 0) - (b.credit || 0),
      },
      {
        title: "Balance",
        dataIndex: "",
        key: "balance",
        render: (text, record, index) => {
          const currentBalance = (record.credit || 0) - (record.debit || 0);
          if (index === 0) {
            runningBalance = currentBalance;
          } else {
            runningBalance += currentBalance;
          }
          return (
            <div style={{ textAlign: "right" }}>
              {record.inComplete ? (
                <strong>{runningBalance.toFixed(2)}</strong>
              ) : (
                runningBalance.toFixed(2)
              )}
            </div>
          );
        },
        sorter: (a, b) => (a.balance || 0) - (b.balance || 0),
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

          const sortedReceipts = [...ReceiptBodies].sort(
            (a, b) => new Date(b.createdDate) - new Date(a.createdDate)
          );

          const matchingReceipt = sortedReceipts.find((receipt) => {
            const voucherNo = record.voucherNo
              ? record.voucherNo.toString().trim()
              : "";
            const billID = receipt.billID
              ? receipt.billID.toString().trim()
              : "";
            return voucherNo === billID;
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
            const receiptTimeDiff = Math.abs(givenDate - receiptDate);
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
  };

  const summary = () => {
    let totalDebit = 0;
    let totalCredit = 0;
    let balance = 0;

    transactions.forEach(({ debit, credit }, index) => {
      if (index === 0) {
        balance = (credit || 0) - (debit || 0);
        return;
      }
      totalDebit += debit || 0;
      totalCredit += credit || 0;
      balance += (credit || 0) - (debit || 0);
    });

    return (
      <Table.Summary.Row style={{ textAlign: "right" }}>
        <Table.Summary.Cell colSpan={5}>Total</Table.Summary.Cell>
        <Table.Summary.Cell>{totalDebit.toFixed(2)}</Table.Summary.Cell>
        <Table.Summary.Cell>{totalCredit.toFixed(2)}</Table.Summary.Cell>
        <Table.Summary.Cell>{balance.toFixed(2)}</Table.Summary.Cell>
        <Table.Summary.Cell></Table.Summary.Cell>
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
              <NavLink to="/supplier/manage">
                <ArrowLeftIcon />
              </NavLink>
              Supplier Report
            </h3>
            {showTable && transactions.length > 0 && (
              <div className="header-actions">
                <Button
                  type="dashed"
                  onClick={handleExport}
                  icon={<UploadOutlined />}
                  loading={loading}
                >
                  Export Report
                </Button>

                <PrintTable
                  selectedSupplier={selectedSupplier}
                  startDate={startDate}
                  endDate={endDate}
                  User={User}
                  title="Supplier Report"
                />
              </div>
            )}
          </div>

          <div className="filters-wrap">
            <Form onFinish={fetchSupplierTransactions} form={SupplierForm}>
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
                  options={supplierOptions}
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
              title="Supplier"
              data={transactions}
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
                      {selectedSupplier
                        ? selectedSupplier.businessName
                        : "All Suppliers"}
                    </h2>
                    {selectedSupplier && (
                      <h3>Account Code: {selectedSupplier.accountNo}</h3>
                    )}
                  </div>
                  <img
                    className="report-company-name"
                    src={Logo}
                    alt="Company Logo"
                  />
                  <div className="report-right">
                    <h2>Supplier Report</h2>
                    <h3>Printed by: {User} </h3>
                    <h3>Printed on: {new Date().toLocaleString()}</h3>
                  </div>
                </div>
              </div>
              <Table
                scroll={{ x: "100%" }}
                columns={getColumns()}
                dataSource={transactions}
                rowKey={(record, index) => record.id || `row-${index}`}
                rowClassName={(record) =>
                  record.inComplete ? "incomplete-row" : ""
                }
                summary={summary}
                pagination={false}
                loading={loading}
              />
            </>
          )}

          {showTable && transactions.length === 0 && !loading && (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No supplier data found"
            />
          )}

          {loading && (
            <div style={{ textAlign: "center", padding: "50px" }}>
              <Spin size="large" />
            </div>
          )}

          {error && (
            <div style={{ color: "red", textAlign: "center", padding: "20px" }}>
              {error}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SupplierReport;
