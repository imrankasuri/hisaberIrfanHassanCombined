import React, { useState, useEffect } from "react";
import { Button, Form, Select, DatePicker, Table, Empty, Divider } from "antd";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import Config from "../../Config";
import ProductionMenu from "./ProductionMenu";
import ReportsMenu from "../Reports/ReportsMenu";
import SubMenuToggle from "../Common/SubMenuToggle";
import ProductPrint from "../Shared/ProductPrint";
import Logo from "../../assets/images/logo/dark-h.svg";
import ProductsDropdown from "../Common/ProductsDropdown";
import { PrinterOutlined, UploadOutlined } from "@ant-design/icons";
import ExcelJS from "exceljs";

const ProductSummary = () => {
  const navigate = useNavigate();
  const AccessKey = localStorage.getItem("AccessKey");
  const CompanyID = localStorage.getItem("CompanyID");
  const User = localStorage.getItem("Full_Name");

  const [ProductForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState("year");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [SubCategory, setSubCategory] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [newType, setNewType] = useState([]);
  const [listOfProducts, setListOfProducts] = useState([]);
  const [productLoading, setProductLoading] = useState(false);

  const category = ProductForm.getFieldValue("category");
  const type = ProductForm.getFieldValue("type");

  useEffect(() => {
    document.title = "Products Summary";
    GetCategoryDropdownData();
    GetTypeDropdownData();
    fetchProducts();
  }, [category, type]);

  const fetchSupplierTransactions = async (formData) => {
    setLoading(true);
    setError(null);

    // Handle date logic based on period
    let effectiveStartDate = null;
    let effectiveEndDate = null;

    if (formData.period === "custom") {
      effectiveStartDate = formData.startDate
        ? dayjs(formData.startDate).format("YYYY-MM-DD")
        : null;
      effectiveEndDate = formData.endDate
        ? dayjs(formData.endDate).format("YYYY-MM-DD")
        : null;

      // Validate custom dates
      if (!effectiveStartDate || !effectiveEndDate) {
        setError("Please select both start and end dates for custom period.");
        setLoading(false);
        return;
      }
    }

    try {
      const api_config = {
        method: "get",
        url: `${Config.base_url}Reports/GetProductSummaryReportBy/${CompanyID}`,
        params: {
          productCode:
            selectedProduct && selectedProduct.code ? selectedProduct.code : 0,
          period: formData.period,
          startDate: effectiveStartDate,
          endDate: effectiveEndDate,
          includeAllProducts: formData.name === "all",
        },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${AccessKey}`,
        },
      };

      const response = await axios(api_config);

      if (response.data.status_code === 1) {
        setTransactions(response.data.products || []);
        setShowTable(true);
        setError(null);
      } else {
        setError(
          response.data.status_message || "Failed to load product summary."
        );
        setTransactions([]);
        setShowTable(false);
      }
    } catch (err) {
      console.error("Error fetching product transactions:", err);
      setError("Failed to load transactions. Please try again.");
      setTransactions([]);
      setShowTable(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    setProductLoading(true);
    const api_config = {
      method: "get",
      url: `${Config.base_url}Product/GetBy/${CompanyID}`,
      params: {
        pageNumber: 1,
        pageSize: 1000000,
        category: category || "",
        type: type || "",
      },
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
      console.error("Error fetching products:", error);
      setListOfProducts([]);
    } finally {
      setProductLoading(false);
    }
  };

  const GetCategoryDropdownData = async () => {
    setCategoryLoading(true);
    try {
      const response = await axios.get(
        `${Config.base_url}DropdownData/GetDropdownData/${CompanyID}`,
        {
          params: { Type: "ProductCategory" },
          headers: {
            Authorization: `Bearer ${AccessKey}`,
          },
        }
      );
      if (response.data.status_code === 1) {
        setSubCategory(response.data.dropdownData);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setCategoryLoading(false);
    }
  };

  const GetTypeDropdownData = async () => {
    try {
      const response = await axios.get(
        `${Config.base_url}DropdownData/GetDropdownData/${CompanyID}`,
        {
          params: { Type: "ProductType" },
          headers: {
            Authorization: `Bearer ${AccessKey}`,
          },
        }
      );
      if (response.data.status_code === 1) {
        setNewType(response.data.dropdownData);
      }
    } catch (error) {
      console.error("Error fetching types:", error);
    }
  };

  const handleStartDateChange = (date) => {
    setStartDate(date);
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
  };

  const columns = [
    {
      title: "Sr#",
      dataIndex: "",
      key: "SR",
      render: (_, record, index) => index + 1,
    },
    {
      title: "Product Code",
      dataIndex: "productCode",
      key: "productCode",
      sorter: (a, b) => a.productCode - b.productCode,
    },
    {
      title: "Product Name",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <NavLink
          className={"primary"}
          to={`/products/report?productCode=${record.productCode}`}
        >
          {record.name ? record.name.split(" (")[0] : ""}
        </NavLink>
      ),
      sorter: (a, b) =>
        String(a.name || "").localeCompare(String(b.name || "")),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      sorter: (a, b) =>
        String(a.category || "").localeCompare(String(b.category || "")),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      sorter: (a, b) =>
        String(a.type || "").localeCompare(String(b.type || "")),
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      render: (value) => (
        <div style={{ textAlign: "right" }}>
          {value ? Number(value).toFixed(2) : "0.00"}
        </div>
      ),
      sorter: (a, b) => (a.quantity || 0) - (b.quantity || 0),
    },
    {
      title: "Rate",
      dataIndex: "rate",
      key: "rate",
      render: (value) => (
        <div style={{ textAlign: "right" }}>
          {value ? Number(value).toFixed(2) : "0.00"}
        </div>
      ),
      sorter: (a, b) => (a.rate || 0) - (b.rate || 0),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (value) => (
        <div style={{ textAlign: "right" }}>
          {value ? Number(value).toFixed(2) : "0.00"}
        </div>
      ),
      sorter: (a, b) => (a.amount || 0) - (b.amount || 0),
    },
  ];

  const summary = () => {
    let totalAmount = 0;
    let totalQuantity = 0;

    transactions.forEach((transaction) => {
      totalAmount += Number(transaction.amount) || 0;
      totalQuantity += Number(transaction.quantity) || 0;
    });

    return (
      <Table.Summary.Row style={{ textAlign: "right" }}>
        <Table.Summary.Cell colSpan={5}>
          <strong>Total</strong>
        </Table.Summary.Cell>
        <Table.Summary.Cell>
          <div style={{ textAlign: "right" }}>
            <strong>{totalQuantity.toFixed(2)}</strong>
          </div>
        </Table.Summary.Cell>
        <Table.Summary.Cell></Table.Summary.Cell>
        <Table.Summary.Cell>
          <div style={{ textAlign: "right" }}>
            <strong>{totalAmount.toFixed(2)}</strong>
          </div>
        </Table.Summary.Cell>
      </Table.Summary.Row>
    );
  };

  const handleSelectChange = (value) => {
    const product = listOfProducts.find((product) => product.code === value);
    setSelectedProduct(product || {});
  };

  const handleExport = () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Product Summary");

    const productName =
      selectedProduct && selectedProduct.name
        ? `${selectedProduct.name} (${selectedProduct.code})`
        : "All Products";

    // Title
    sheet.mergeCells("A1:H2");
    const titleCell = sheet.getCell("A1");
    titleCell.value = `Product Summary: ${productName}`;
    titleCell.font = { bold: true, size: 18 };
    titleCell.alignment = { vertical: "middle", horizontal: "center" };

    // Set column headers and their widths
    sheet.columns = [
      { header: "Product Code", key: "productCode", width: 15 },
      { header: "Product Name", key: "name", width: 30 },
      { header: "Category", key: "category", width: 20 },
      { header: "Type", key: "type", width: 20 },
      { header: "Quantity", key: "quantity", width: 15 },
      { header: "Rate", key: "rate", width: 15 },
      { header: "Amount", key: "amount", width: 15 },
    ];

    // Add header row
    const headerRow = sheet.addRow([
      "Product Code",
      "Product Name",
      "Category",
      "Type",
      "Quantity",
      "Rate",
      "Amount",
    ]);

    // Apply styling to the header row
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF324F94" },
    };

    let totalAmount = 0;
    let totalQuantity = 0;

    // Add data rows
    transactions.forEach((product) => {
      const amount = Number(product.amount) || 0;
      const quantity = Number(product.quantity) || 0;
      const rate = Number(product.rate) || 0;

      totalAmount += amount;
      totalQuantity += quantity;

      sheet.addRow({
        productCode: product.productCode,
        name: product.name,
        category: product.category,
        type: product.type,
        quantity: quantity.toFixed(2),
        rate: rate.toFixed(2),
        amount: amount.toFixed(2),
      });
    });

    // Add totals row
    const totalsRow = sheet.addRow({
      productCode: "",
      name: "TOTAL",
      category: "",
      type: "",
      quantity: totalQuantity.toFixed(2),
      rate: "",
      amount: totalAmount.toFixed(2),
    });

    // Apply styling to the totals row
    totalsRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: "right" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // Generate filename with timestamp
    const now = new Date();
    const dateString = now
      .toISOString()
      .slice(0, 19)
      .replace(/[^0-9]/g, "");

    // Download the file
    workbook.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `ProductSummary_${dateString}.xlsx`;
      anchor.click();
      window.URL.revokeObjectURL(url);
    });
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
              <NavLink to="/products/manage">
                <ArrowLeftIcon />
              </NavLink>
              Products Summary
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
                <ProductPrint
                  selectedSupplier={selectedProduct}
                  startDate={startDate}
                  endDate={endDate}
                  User={User}
                  title="Product Summary"
                />
              </div>
            )}
          </div>

          {error && (
            <div
              className="error-message"
              style={{ color: "red", marginBottom: "10px" }}
            >
              {error}
            </div>
          )}

          <div className="filters-wrap">
            <Form
              onFinish={fetchSupplierTransactions}
              form={ProductForm}
              initialValues={{
                category: "",
                type: "",
                period: "year",
              }}
            >
              <Form.Item
                name="name"
                rules={[
                  {
                    required: true,
                    message: "Please select a product",
                  },
                ]}
              >
                <Select
                  style={{ width: "300px" }}
                  placeholder="Select Product"
                  onSelect={handleSelectChange}
                  showSearch
                  loading={productLoading}
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  <Select.Option value="all">All Products</Select.Option>
                  {listOfProducts.map((product) => (
                    <Select.Option key={product.id} value={product.code}>
                      {product.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="category">
                <Select
                  style={{ width: 150 }}
                  showSearch
                  loading={categoryLoading}
                  filterOption={(input, option) =>
                    option.label.toLowerCase().includes(input.toLowerCase())
                  }
                  placeholder="Category"
                  options={[
                    { label: "All Categories", value: "" },
                    ...SubCategory.map((item) => ({
                      label: item.name,
                      value: item.name,
                    })),
                  ]}
                  onSelect={fetchProducts}
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
                  options={[
                    { label: "All Types", value: "" },
                    ...newType.map((item) => ({
                      label: item.name,
                      value: item.name,
                    })),
                  ]}
                  onSelect={fetchProducts}
                />
              </Form.Item>

              <Form.Item name="period">
                <Select
                  onChange={setPeriod}
                  style={{ width: "150px" }}
                  placeholder="Date Range"
                >
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
                  style={{ width: "100%" }}
                  placeholder="Start Date"
                  onChange={handleStartDateChange}
                />
              </Form.Item>

              <Form.Item
                name="endDate"
                dependencies={["period"]}
                hidden={period !== "custom"}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  placeholder="End Date"
                  onChange={handleEndDateChange}
                />
              </Form.Item>

              <Button type="primary" htmlType="submit" loading={loading}>
                Run Report
              </Button>
            </Form>
          </div>

          {showTable && transactions.length > 0 && (
            <>
              <div className="reports-main-div" style={{ marginTop: "20px" }}>
                <div className="report-content">
                  <div className="report-left">
                    <h2>
                      {selectedProduct && selectedProduct.name
                        ? selectedProduct.name
                        : "All Products"}
                    </h2>
                    {selectedProduct && selectedProduct.code && (
                      <h3>Product Code: {selectedProduct.code}</h3>
                    )}
                  </div>
                  <img
                    className="report-company-name"
                    src={Logo}
                    alt="Company Logo"
                  />
                  <div className="report-right">
                    <h2>Product Summary</h2>
                    <h3>Printed by: {User}</h3>
                    <h3>Printed on: {new Date().toLocaleString()}</h3>
                  </div>
                </div>
              </div>
              <Table
                columns={columns}
                dataSource={transactions}
                rowKey={(record) => record.productCode || Math.random()}
                summary={summary}
                pagination={false}
              />
            </>
          )}

          {showTable && transactions.length === 0 && (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No products found for the selected criteria"
            />
          )}
        </div>
      </div>
    </>
  );
};

export default ProductSummary;
