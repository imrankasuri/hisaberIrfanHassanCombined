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

const CustomerInvoiceDetails = () => {
  const navigate = useNavigate();
  const printRef = useRef();
  const AccessKey = localStorage.getItem("AccessKey");
  const CompanyID = localStorage.getItem("CompanyID");
  const User = localStorage.getItem("Full_Name");

  const [CustomerForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [CustomerLoading, setCustomerLoading] = useState(false);
  const [productLoading, setProductLoading] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [ListOfRecords, setListOfRecords] = useState([]);
  const [listOfProducts, setListOfProducts] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [newType, setNewType] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProductCode, setSelectedProductCode] = useState("all");
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState("all");
  const [customerAccountCode, setCustomerAccountCode] = useState("");
  const [invoicesData, setInvoicesData] = useState([]);
  const [filteredInvoicesData, setFilteredInvoicesData] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const defaultStartDate = dayjs().format("YYYY-MM-DD");
  const defaultEndDate = dayjs().format("YYYY-MM-DD");
  const [showTable, setShowTable] = useState(false);
  const [includeAllCustomers, setIncludeAllCustomers] = useState(false);

  useEffect(() => {
    document.title = "Customer Invoice Details";
    fetchCustomers();
    fetchProducts();
    fetchCategoryDropdownData();
    fetchTypeDropdownData();
  }, []);

  useEffect(() => {
    applyProductFilter();
  }, [selectedProductCode, invoicesData]);

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

  const fetchProducts = async (category = "", type = "") => {
    setProductLoading(true);
    const api_config = {
      method: "get",
      url: `${Config.base_url}Product/GetBy/${CompanyID}?&pageNumber=1&pageSize=1000000&category=${category}&type=${type}`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AccessKey}`,
      },
    };
    try {
      const response = await axios(api_config);
      if (response.data && response.data.status_code === 1) {
        setListOfProducts(response.data.listofProducts || []);
      } else {
        setListOfProducts([]);
      }
    } catch (error) {
      setListOfProducts([]);
    } finally {
      setProductLoading(false);
    }
  };

  const fetchCategoryDropdownData = async () => {
    setCategoryLoading(true);
    try {
      const response = await axios.get(
        Config.base_url +
          `DropdownData/GetDropdownData/${CompanyID}?Type=ProductCategory`,
        { headers: { Authorization: `Bearer ${AccessKey}` } }
      );
      if (response.data.status_code === 1) {
        setSubCategory(response.data.dropdownData);
      }
    } catch (error) {
      setSubCategory([]);
    } finally {
      setCategoryLoading(false);
    }
  };

  const fetchTypeDropdownData = async (category = "") => {
    try {
      const response = await axios.get(
        Config.base_url +
          `DropdownData/GetDropdownData/${CompanyID}?Type=ProductType&category=${category}`,
        { headers: { Authorization: `Bearer ${AccessKey}` } }
      );
      if (response.data.status_code === 1) {
        setNewType(response.data.dropdownData);
      }
    } catch (error) {
      setNewType([]);
    }
  };

  const handleCategoryChange = (value) => {
    CustomerForm.setFieldsValue({ type: "", product: "" });
    setSelectedProductCode("all");
    fetchTypeDropdownData(value);
    fetchProducts(value, "");
  };

  const handleTypeChange = (value) => {
    const category = CustomerForm.getFieldValue("category") || "";
    CustomerForm.setFieldsValue({ product: "" });
    setSelectedProductCode("all");
    fetchProducts(category, value);
  };

  const handleProductChange = (value) => {
    const product = listOfProducts.find((p) => p.code === value);
    setSelectedProduct(product);
    setSelectedProductCode(value);
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

  const applyProductFilter = () => {
    if (selectedProductCode === "all" || !selectedProductCode) {
      setFilteredInvoicesData(invoicesData);
    } else {
      const filtered = invoicesData
        .map((invoice) => {
          const filteredBodies =
            invoice.receiptBodies?.filter((body) => {
              if (body.productCode === selectedProductCode) {
                return true;
              }

              if (body.product && typeof body.product === "string") {
                const selectedProductDetails = listOfProducts.find(
                  (p) => p.code === selectedProductCode
                );
                if (selectedProductDetails && selectedProductDetails.name) {
                  return body.product
                    .toLowerCase()
                    .includes(selectedProductDetails.name.toLowerCase());
                }

                if (typeof selectedProductCode === "string") {
                  return body.product
                    .toLowerCase()
                    .includes(selectedProductCode.toLowerCase());
                }
              }

              return false;
            }) || [];

          if (filteredBodies.length > 0) {
            return {
              ...invoice,
              receiptBodies: filteredBodies,
            };
          }
          return null;
        })
        .filter((invoice) => invoice !== null);

      setFilteredInvoicesData(filtered);
    }
  };

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
        url: `${Config.base_url}Reports/GetInvoiceTransactions/${CompanyID}?customerAccountCode=${customerAccountCode}&startDate=${effectiveStartDate}&endDate=${effectiveEndDate}&period=${FormData.period}&includeAllCustomers=${includeAllCustomers}`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${AccessKey}`,
        },
      };

      const response = await axios(api_config);

      if (response.data.statusCode === 1) {
        setInvoicesData(response.data.headTransactions || []);
        setShowTable(true);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch invoice data");
    } finally {
      setLoading(false);
    }
  };

  const calculateInvoiceTotal = (receiptBodies) => {
    if (!receiptBodies || receiptBodies.length === 0) return 0;
    return receiptBodies.reduce((sum, item) => sum + (item.amount || 0), 0);
  };

  const calculateGrandTotal = () => {
    return filteredInvoicesData.reduce(
      (sum, invoice) => sum + (invoice.total || 0),
      0
    );
  };

  const calculateTotalQuantity = () => {
    return filteredInvoicesData.reduce((sum, invoice) => {
      if (invoice.receiptBodies && invoice.receiptBodies.length > 0) {
        return (
          sum +
          invoice.receiptBodies.reduce(
            (invoiceSum, item) => invoiceSum + (item.quantity || 0),
            0
          )
        );
      }
      return sum;
    }, 0);
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
      render: (date, record) => {
        const formatted = dayjs(date).format("YYYY-MM-DD");
        return record.inComplete ? <strong>{formatted}</strong> : formatted;
      },
    },
    {
      title: "Inv. No.",
      dataIndex: "invoiceNo",
      key: "invoiceNo",
      sorter: (a, b) => a.invoiceNo - b.invoiceNo,
      render: (invoiceNo, record) => {
        const voucherElement = renderVoucherNumber(invoiceNo, { ...record, voucherNo: invoiceNo, details: 'Invoice' });
        return record.inComplete ? <strong>{voucherElement}</strong> : voucherElement;
      },
    },
    {
      title: "Customer",
      dataIndex: "customerName",
      key: "customerName",
      render: (text, record) => (
        <>
          <>
            <NavLink
              className={"primary"}
              to={`/customer/report?source=${record.customerAccountCode}`}
            >
              {record.inComplete ? <strong>{record.customerName.split(" (")[0]}</strong> : record.customerName.split(" (")[0]}
            </NavLink>
          </>
        </>
      ),
      sorter: (a, b) => a.customerName.localeCompare(b.customerName),
    },
    {
      title: "Doc. No.",
      dataIndex: "docNo",
      key: "docNo",
      sorter: (a, b) => a.docNo.localeCompare(b.docNo),
      render: (text, record) => record.inComplete ? <strong>{text}</strong> : text,
    },
    {
      title: "Product",
      dataIndex: "product",
      key: "product",
      render: (text, record) => record.inComplete ? <strong>{text}</strong> : text,
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      align: "right",
      render: (quantity, record) => {
        const value = quantity ? quantity.toFixed(2) : "0.00";
        return record.inComplete ? <strong>{value}</strong> : value;
      },
    },
    {
      title: "Rate",
      dataIndex: "rate",
      key: "rate",
      align: "right",
      sorter: (a, b) => a.rate - b.rate,
      render: (rate, record) => {
        const value = rate ? rate.toFixed(2) : "0.00";
        return record.inComplete ? <strong>{value}</strong> : value;
      },
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      align: "right",
      sorter: (a, b) => a.amount - b.amount,
      render: (amount, record) => {
        const value = amount ? amount.toFixed(2) : "0.00";
        return record.inComplete ? <strong>{value}</strong> : value;
      },
    },
    {
      title: "Bill Amount",
      dataIndex: "billAmount",
      key: "billAmount",
      align: "right",
      sorter: (a, b) => a.billAmount - b.billAmount,
      render: (amount, record) => {
        const value = amount ? amount.toFixed(2) : "0.00";
        return record.inComplete ? <strong>{value}</strong> : value;
      },
    },
  ];

  // Flattened table data: each row is a product line with invoice info
  const getTableData = () => {
    let rows = [];
    filteredInvoicesData.forEach((invoice) => {
      if (invoice.receiptBodies && invoice.receiptBodies.length > 0) {
        invoice.receiptBodies.forEach((item, idx) => {
          rows.push({
            key: `product-${invoice.id}-${idx}`,
            date: invoice.date,
            invoiceNo: invoice.invoiceNo,
            customerName: invoice.customerName,
            customerAccountCode: invoice.customerAccountCode,
            docNo: invoice.docNo,
            product: item.product,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.amount,
            billAmount: invoice.total,
            inComplete: invoice.inComplete || false,
          });
        });
      } else {
        // If no products, still show the invoice row (optional)
        rows.push({
          key: `invoice-${invoice.id}`,
          date: invoice.date,
          invoiceNo: invoice.invoiceNo,
          customerName: invoice.customerName,
          customerAccountCode: invoice.customerAccountCode,
          docNo: invoice.docNo,
          product: "-",
          quantity: "-",
          rate: "-",
          amount: "-",
          billAmount: invoice.total,
          inComplete: invoice.inComplete || false,
        });
      }
    });
    return rows;
  };

  const handleExportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Customer Invoice Details");

    worksheet.addRow(["Customer Invoice Details"]);
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

    if (selectedProductCode !== "all") {
      const selectedProductName =
        listOfProducts.find((p) => p.code === selectedProductCode)?.name ||
        selectedProductCode;
      worksheet.addRow([
        `Filtered by Product: ${selectedProductName}`,
        "",
        "",
        "",
      ]);
    }

    worksheet.addRow([]);

    filteredInvoicesData.forEach((invoice) => {
      worksheet.addRow([
        `Invoice: ${invoice.invoiceNo}`,
        `Date: ${dayjs(invoice.date).format("YYYY-MM-DD")}`,
        `Customer: ${invoice.customerName}`,
        `Total: ${invoice.total ? invoice.total.toFixed(2) : "0.00"}`,
      ]);

      if (invoice.receiptBodies && invoice.receiptBodies.length > 0) {
        worksheet.addRow(["Product", "Quantity", "Rate", "Amount"]);

        invoice.receiptBodies.forEach((item) => {
          worksheet.addRow([
            item.product || "N/A",
            item.quantity || 0,
            item.rate ? item.rate.toFixed(2) : "0.00",
            item.amount ? item.amount.toFixed(2) : "0.00",
          ]);
        });

        worksheet.addRow([]);
      }
    });

    worksheet.addRow(["", "", "Total Quantity:", calculateTotalQuantity()]);
    worksheet.addRow([
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
    a.download = `Customer_Invoice_Details_${dayjs().format(
      "YYYY-MM-DD"
    )}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const productOptions = [
    { value: "all", label: "All Products" },
    ...listOfProducts.map((product) => ({
      value: product.code,
      label: `${product.name} (${product.code})`,
    })),
  ];

  const categoryOptions = [
    { label: "All Categories", value: "" },
    ...subCategory.map((item) => ({ label: item.name, value: item.name })),
  ];

  const typeOptions = [
    { label: "All Types", value: "" },
    ...newType.map((item) => ({ label: item.name, value: item.name })),
  ];

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
            <h3 className="page-title">Customer Invoice Details</h3>
            {showTable && filteredInvoicesData.length > 0 && (
              <div className="header-actions">
                <ReportPrinter
                  printRef={printRef}
                  selectedSupplier={selectedCustomer}
                  startDate={startDate}
                  endDate={endDate}
                  User={User}
                  title="Customer Invoice Details"
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

              <Form.Item name="category">
                <Select
                  style={{ width: 150 }}
                  showSearch
                  filterOption={(input, option) =>
                    option.label.toLowerCase().includes(input.toLowerCase())
                  }
                  placeholder="Category"
                  options={categoryOptions}
                  onSelect={handleCategoryChange}
                  loading={categoryLoading}
                />
              </Form.Item>

              <Form.Item name="type">
                <Select
                  style={{ width: 150 }}
                  showSearch
                  filterOption={(input, option) =>
                    option.label.toLowerCase().includes(input.toLowerCase())
                  }
                  placeholder="Type"
                  options={typeOptions}
                  onSelect={handleTypeChange}
                />
              </Form.Item>

              <Form.Item name="product">
                <Select
                  style={{ width: 200 }}
                  showSearch
                  filterOption={(input, option) =>
                    option.label.toLowerCase().includes(input.toLowerCase())
                  }
                  placeholder="Product"
                  options={productOptions}
                  onSelect={handleProductChange}
                  loading={productLoading}
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

          {showTable && filteredInvoicesData.length > 0 && (
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
                  <h2>Customer Invoice Details</h2>
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
                  rowClassName={(record) =>
                    record.inComplete ? "incomplete-row" : ""
                  }
                  summary={() => (
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={5} align="right">
                        <b>Totals</b>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={5} align="right">
                        <b>{calculateTotalQuantity()}</b>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={6} />
                      <Table.Summary.Cell index={7} />
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

export default CustomerInvoiceDetails;
