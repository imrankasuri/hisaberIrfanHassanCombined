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
  Card,
  Divider,
  Typography,
} from "antd";
import {
  UploadOutlined,
  FilterFilled,
  ClearOutlined,
  CaretRightOutlined,
  CaretDownOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import axios from "axios";
import Config from "../../Config";
import CustomerDropdown from "../Shared/CustomerDropdown";
import ReportsMenu from "../Reports/ReportsMenu";
import { NavLink } from "react-router-dom";
import Logo from "../../assets/images/logo/dark-h.svg";
import SubMenuToggle from "../Common/SubMenuToggle";
import ExcelJS from "exceljs";
import ReportPrinter from "../Shared/ReportPrinter";
import { renderVoucherNumber } from "../../utils/voucherNavigation";

const { Title, Text } = Typography;

const SaleDetailByCustomerProduct = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [customerList, setCustomerList] = useState([]);
  const [invoicesData, setInvoicesData] = useState([]);
  const [filteredInvoicesData, setFilteredInvoicesData] = useState([]);
  const [productLoading, setProductLoading] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [CustomerLoading, setCustomerLoading] = useState(false);
  const [ListOfRecords, setListOfRecords] = useState([]);
  const [listOfProducts, setListOfProducts] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [newType, setNewType] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProductCode, setSelectedProductCode] = useState("all");
  const defaultStartDate = dayjs().format("YYYY-MM-DD");
  const defaultEndDate = dayjs().format("YYYY-MM-DD");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [customerAccountCode, setCustomerAccountCode] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [includeAllCustomers, setIncludeAllCustomers] = useState(false);
  const [period, setPeriod] = useState("all");
  const [filters, setFilters] = useState({});
  const [error, setError] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const printRef = useRef();

  const CompanyID = localStorage.getItem("CompanyID");
  const AccessKey = localStorage.getItem("AccessKey");
  const User = localStorage.getItem("Full_Name");

  useEffect(() => {
    document.title = "Sale Detail by Customer Product";
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
    form.setFieldsValue({ type: "", product: "" });
    setSelectedProductCode("all");
    fetchTypeDropdownData(value);
    fetchProducts(value, "");
  };

  const handleTypeChange = (value) => {
    const category = form.getFieldValue("category") || "";
    form.setFieldsValue({ product: "" });
    setSelectedProductCode("all");
    fetchProducts(category, value);
  };

  const handleProductChange = (value) => {
    const product = listOfProducts.find((p) => p.code === value);
    setSelectedProduct(product);
    setSelectedProductCode(value);
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

  const fetchReportData = async (FormData) => {
    setLoading(true);
    setError(null);
    setShowTable(false);
    try {
      const effectiveStartDate =
        FormData.period === "custom" && FormData.startDate
          ? dayjs(FormData.startDate).format("YYYY-MM-DD")
          : defaultStartDate;

      const effectiveEndDate =
        FormData.period === "custom" && FormData.endDate
          ? dayjs(FormData.endDate).format("YYYY-MM-DD")
          : defaultEndDate;

      const api_config = {
        method: "get",
        url: `${Config.base_url}Reports/GetInvoiceTransactions/${CompanyID}?customerAccountCode=${customerAccountCode}&startDate=${effectiveStartDate}&endDate=${effectiveEndDate}&period=${FormData.period}&includeAllCustomers=${includeAllCustomers}`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${AccessKey}`,
        },
      };
      const response = await axios(api_config);
      //Console.log(response);
      if (response.data.statusCode === 1) {
        setInvoicesData(response.data.headTransactions || []);
        setShowTable(true);
      } else {
        setInvoicesData([]);
        setShowTable(true);
      }
    } catch (err) {
      setError("Failed to fetch report data");
      //Console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleRowExpansion = (invoiceId) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(invoiceId)) {
      newExpandedRows.delete(invoiceId);
    } else {
      newExpandedRows.add(invoiceId);
    }
    setExpandedRows(newExpandedRows);
  };

  const handleExpandAll = () => {
    const allIds = new Set(filteredInvoicesData.map((invoice) => invoice.id));
    setExpandedRows(allIds);
  };

  const handleCollapseAll = () => {
    setExpandedRows(new Set());
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
      title: "",
      key: "expand",
      width: 50,
      render: (_, record) => {
        if (record.isInvoiceHeader && record.hasProducts) {
          const isExpanded = expandedRows.has(record.invoiceId);
          return (
            <Button
              type="text"
              size="small"
              icon={isExpanded ? <CaretDownOutlined /> : <CaretRightOutlined />}
              onClick={() => toggleRowExpansion(record.invoiceId)}
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
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
      render: (date, record) => {
        if (record.isInvoiceHeader) {
          const formatted = dayjs(date).format("YYYY-MM-DD");
          return record.inComplete ? <strong>{formatted}</strong> : formatted;
        }
        return null;
      },
    },
    {
      title: "Inv. No.",
      dataIndex: "invoiceNo",
      key: "invoiceNo",
      sorter: (a, b) => a.invoiceNo - b.invoiceNo,
      render: (invoiceNo, record) => {
        if (record.isInvoiceHeader) {
          const voucherElement = renderVoucherNumber(invoiceNo, {
            ...record,
            voucherNo: invoiceNo,
            details: "Invoice",
          });
          return record.inComplete ? <strong>{voucherElement}</strong> : voucherElement;
        }
        return null;
      },
    },
    {
      title: "Customer",
      dataIndex: "customerName",
      key: "customerName",
      sorter: (a, b) => a.customerName.localeCompare(b.customerName),
      render: (text, record) => {
        if (record.isInvoiceHeader) {
          return (
            <NavLink
              className="primary"
              to={`/customer/report?source=${record.customerAccountCode}`}
            >
              {record.inComplete ? <strong>{record.customerName}</strong> : record.customerName}
            </NavLink>
          );
        }
        return null;
      },
    },
    {
      title: "Doc. No.",
      dataIndex: "docNo",
      key: "docNo",
      sorter: (a, b) => a.docNo.localeCompare(b.docNo),
      render: (docNo, record) => {
        if (record.isInvoiceHeader) {
          return record.inComplete ? <strong>{docNo}</strong> : docNo;
        }
        return null;
      },
    },
    {
      title: "Product",
      dataIndex: "product",
      key: "product",
      render: (product, record) => {
        if (record.isProductDetail) {
          const content = <span style={{ paddingLeft: "20px" }}>{product}</span>;
          return record.inComplete ? <strong>{content}</strong> : content;
        }
        return null;
      },
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      align: "right",
      sorter: (a, b) => a.quantity - b.quantity,
      render: (quantity, record) => {
        if (record.isProductDetail) {
          return record.inComplete ? <strong>{quantity}</strong> : quantity;
        }
        return null;
      },
    },
    {
      title: "Rate",
      dataIndex: "rate",
      key: "rate",
      align: "right",
      sorter: (a, b) => a.rate - b.rate,
      render: (rate, record) => {
        if (record.isProductDetail) {
          const value = rate ? rate.toFixed(2) : "0.00";
          return record.inComplete ? <strong>{value}</strong> : value;
        }
        return null;
      },
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      align: "right",
      sorter: (a, b) => a.amount - b.amount,
      render: (amount, record) => {
        if (record.isProductDetail) {
          const value = amount ? amount.toFixed(2) : "0.00";
          return record.inComplete ? <strong>{value}</strong> : value;
        }
        return null;
      },
    },
    {
      title: "Bill Amount",
      dataIndex: "billAmount",
      key: "billAmount",
      align: "right",
      sorter: (a, b) => a.invoiceTotal - b.invoiceTotal,
      render: (amount, record) => {
        if (record.isInvoiceHeader && record.invoiceTotal) {
          const value = <strong>{record.invoiceTotal.toFixed(2)}</strong>;
          return record.inComplete ? <strong>{value}</strong> : value;
        }
        return null;
      },
    },
  ];

  const getTableData = () => {
    let rows = [];

    filteredInvoicesData.forEach((invoice) => {
      const hasProducts =
        invoice.receiptBodies && invoice.receiptBodies.length > 0;
      const isExpanded = expandedRows.has(invoice.id);

      rows.push({
        key: `invoice-${invoice.id}`,
        invoiceId: invoice.id,
        date: invoice.date,
        invoiceNo: invoice.invoiceNo,
        customerName: invoice.customerName,
        customerAccountCode: invoice.customerAccountCode,
        docNo: invoice.docNo,
        billAmount: invoice.total,
        invoiceTotal: invoice.total,
        isInvoiceHeader: true,
        hasProducts: hasProducts,
        inComplete: invoice.inComplete || false,
      });

      if (isExpanded && hasProducts) {
        invoice.receiptBodies.forEach((item, idx) => {
          rows.push({
            key: `product-${invoice.id}-${idx}`,
            invoiceId: invoice.id,
            product: item.product,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.amount,
            isProductDetail: true,
            inComplete: invoice.inComplete || false,
          });
        });
      }
    });

    return rows;
  };

  const calculateGrandTotal = () => {
    return filteredInvoicesData.reduce((sum, sale) => {
      const value = sale.total || 0;
      const adjustedValue = sale.saleType === "Credit" ? -value : value;
      return sum + adjustedValue;
    }, 0);
  };

  const handleExportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sale Detail By Customer Product");

    worksheet.addRow(["Sale Detail By Customer Product"]);
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
        worksheet.addRow([
          "Subtotal",
          "",
          "",
          invoice.receiptBodies
            .reduce((sum, item) => sum + (item.amount || 0), 0)
            .toFixed(2),
        ]);
        worksheet.addRow([]);
      }
    });
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
    a.download = `Sale_Detail_By_Customer_Product_${dayjs().format(
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
            <h3 className="page-title">Sale Detail by Customer Product</h3>
            {showTable && filteredInvoicesData.length > 0 && (
              <div className="header-actions">
                <ReportPrinter
                  printRef={printRef}
                  selectedSupplier={selectedCustomer}
                  startDate={startDate}
                  endDate={endDate}
                  User={User}
                  title="Sale Detail by Customer Product"
                />
                <Button icon={<UploadOutlined />} onClick={handleExportToExcel}>
                  Export to Excel
                </Button>
              </div>
            )}
          </div>
          <div className="filters-wrap">
            <Form form={form} onFinish={fetchReportData}>
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
                name="period"
                style={{ width: 150 }}
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
                <DatePicker style={{ width: 130 }} />
              </Form.Item>
              <Form.Item
                name="endDate"
                dependencies={["period"]}
                hidden={period !== "custom"}
              >
                <DatePicker style={{ width: 130 }} />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Run Report
                </Button>
              </Form.Item>
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
                  <h2>Sale Detail By Customer Product</h2>
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
                  rowClassName={(record) =>
                    record.inComplete ? "incomplete-row" : ""
                  }
                  summary={() => (
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={6} align="right">
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

export default SaleDetailByCustomerProduct;
