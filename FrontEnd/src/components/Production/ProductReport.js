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
  Checkbox,
  Menu,
  Dropdown,
  Tooltip,
  Divider,
} from "antd";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import ProductionMenu from "./ProductionMenu";
import ReportsMenu from "../Reports/ReportsMenu";
import axios from "axios";
import Config from "../../Config";
import SubMenuToggle from "../Common/SubMenuToggle";
import ProductPrint from "../Shared/ProductPrint";
import Logo from "../../assets/images/logo/dark-h.svg";
import dayjs from "dayjs";
import {
  FilterFilled,
  UploadOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import ExcelJS from "exceljs";

const ProductReport = () => {
  const navigate = useNavigate();
  const AccessKey = localStorage.getItem("AccessKey");
  const CompanyID = localStorage.getItem("CompanyID");
  const User = localStorage.getItem("Full_Name");

  const [ProductForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [ProductLoading, setProductLoading] = useState(false);
  const [ListOfRecords, setListOfRecords] = useState([]);
  const [TotalRecords, setTotalRecords] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState("all");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const defaultStartDate = dayjs().format("YYYY-MM-DD");
  const defaultEndDate = dayjs().format("YYYY-MM-DD");
  const [listOfProducts, setListOfProducts] = useState([]);
  const [SubCategory, setSubCategory] = useState([]);
  const [newType, setNewType] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [productCodeFromUrl, setProductCodeFromUrl] = useState("");

  const fetchProductTransactions = async (FormData) => {
    ////Console.log("Fetching transactions with FormData:", FormData);
    setLoading(true);
    setError(null);
    setShowTable(false); // Reset table visibility

    const effectiveStartDate =
      FormData.period === "custom" && FormData.startDate
        ? dayjs(FormData.startDate).format("YYYY-MM-DD")
        : defaultStartDate;

    const effectiveEndDate =
      FormData.period === "custom" && FormData.endDate
        ? dayjs(FormData.endDate).format("YYYY-MM-DD")
        : defaultEndDate;

    // Fix: Use correct productCode value
    const productCode = FormData.product === "all" ? 0 : FormData.product;
    const includeAllProducts = FormData.product === "all";

    // //Console.log("Request params:", {
    //     productCode,
    //     effectiveStartDate,
    //     effectiveEndDate,
    //     period: FormData.period,
    //     includeAllProducts,
    //   });

    try {
      const api_config = {
        method: "get",
        url: `${Config.base_url}Reports/GetProductReportBy/${CompanyID}?productCode=${productCode}&startDate=${effectiveStartDate}&endDate=${effectiveEndDate}&period=${FormData.period}&includeAllProducts=${includeAllProducts}`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${AccessKey}`,
        },
      };

      // //Console.log("API URL:", api_config.url);
      const response = await axios(api_config);
      // //Console.log("API Response:", response.data);

      // Fix: Handle different response structures
      if (response.data && response.data.status_code === 1) {
        const transactionData =
          response.data.Transactions ||
          response.data.transactions ||
          response.data;
        //Console.log("Transaction data:", transactionData);
        setTransactions(Array.isArray(transactionData) ? transactionData : []);
        setShowTable(true);

        if (!Array.isArray(transactionData) || transactionData.length === 0) {
          message.info("No transactions found for the selected criteria.");
        }
      } else {
        // //Console.log("No data or error in response:", response.data);
        setTransactions([]);
        setShowTable(true);
        message.warning(response.data?.status_message || "No data found.");
      }
    } catch (err) {
      // console.error("Error fetching Product transactions:", err);
      // console.error("Error response:", err.response?.data);
      setError(
        `Failed to load transactions: ${
          err.response?.data?.message || err.message
        }`
      );
      setTransactions([]);
      setShowTable(true);
      message.error("Failed to load transactions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const category = ProductForm.getFieldValue("category");
  const type = ProductForm.getFieldValue("type");

  useEffect(() => {
    document.title = "Product Report";

    // Handle URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const productCode = urlParams.get("productCode") || "";
    setProductCodeFromUrl(productCode);

    fetchProducts();
    GetCategoryDropdownData();
    GetTypeDropdownData();
  }, [category, type]);

  // New useEffect to handle product selection from URL
  useEffect(() => {
    if (!productCodeFromUrl || listOfProducts.length === 0) return;

    const selectedProductFromUrl = listOfProducts.find(
      (product) => product.code === parseInt(productCodeFromUrl)
    );

    if (selectedProductFromUrl) {
      setSelectedProduct(selectedProductFromUrl);
      ProductForm.setFieldsValue({
        product: selectedProductFromUrl.code,
      });
    }
  }, [listOfProducts, productCodeFromUrl]);

  // New useEffect to auto-run report when product is selected from URL
  useEffect(() => {
    if (!selectedProduct || !productCodeFromUrl) return;

    const formData = {
      product: selectedProduct.code,
      period: "year",
      startDate: null,
      endDate: null,
    };

    fetchProductTransactions(formData);
  }, [selectedProduct, productCodeFromUrl]);

  const fetchProducts = async () => {
    setProductLoading(true);
    const api_config = {
      method: "get",
      url: `${
        Config.base_url
      }Product/GetBy/${CompanyID}?&pageNumber=1&pageSize=1000000&category=${
        category || ""
      }&type=${type || ""}`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AccessKey}`,
      },
    };

    try {
      const response = await axios(api_config);
      if (response.data && response.data.status_code === 1) {
        setProductLoading(false);
        setListOfProducts(response.data.listofProducts || []);
      } else {
        setProductLoading(false);
        setListOfProducts([]);
      }
    } catch (error) {
      // console.error("Error fetching products:", error);
      setProductLoading(false);
      setListOfProducts([]);
    }
  };

  const GetCategoryDropdownData = async () => {
    setCategoryLoading(true);
    try {
      const response = await axios.get(
        Config.base_url +
          `DropdownData/GetDropdownData/${CompanyID}?Type=ProductCategory`,
        {
          headers: {
            Authorization: `Bearer ${AccessKey}`,
          },
        }
      );
      if (response.data.status_code === 1) {
        setSubCategory(response.data.dropdownData);
        setCategoryLoading(false);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategoryLoading(false);
    }
  };

  const GetTypeDropdownData = async () => {
    try {
      const response = await axios.get(
        Config.base_url +
          `DropdownData/GetDropdownData/${CompanyID}?Type=ProductType`,
        {
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

  const handleProductChange = (value) => {
    if (value === "all") {
      setSelectedProduct(null);
      ProductForm.setFieldsValue({
        code: null,
      });
    } else {
      // Fix: Use listOfProducts instead of ListOfRecords
      const product = listOfProducts.find((product) => product.code === value);
      setSelectedProduct(product);
      if (product) {
        ProductForm.setFieldsValue({
          product: product.code,
        });
      }
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
    const sheet = workbook.addWorksheet("Product Report");

    const productName = selectedProduct
      ? `${selectedProduct.name} (${selectedProduct.code})`
      : "All Products";

    sheet.mergeCells("A1:M2");
    const titleCell = sheet.getCell("C3:G3");
    titleCell.value = `Product Report: ${productName}`;
    titleCell.font = { bold: true, size: 18 };
    titleCell.alignment = { vertical: "middle", horizontal: "center" };

    sheet.columns = [
      { header: "Date", key: "date", width: 15 },
      { header: "Details", key: "details", width: 30 },
      { header: "V. No", key: "voucherNo", width: 15 },
      { header: "In Quantity", key: "inQuantity", width: 15 },
      { header: "In Weight", key: "inWeight", width: 15 },
      { header: "In Length", key: "inLength", width: 15 },
      { header: "Out Quantity", key: "outQuantity", width: 15 },
      { header: "Out Weight", key: "outWeight", width: 15 },
      { header: "Out Length", key: "outLength", width: 15 },
      { header: "Default Unit", key: "defaultUnit", width: 15 },
      { header: "Balance", key: "balance", width: 15 },
    ];

    const headerRow = sheet.addRow([
      "Date",
      "Details",
      "V. No",
      "In Quantity",
      "In Weight",
      "In Length",
      "Out Quantity",
      "Out Weight",
      "Out Length",
      "Default Unit",
      "Balance",
    ]);

    // Apply styling to the header row
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF324F94" },
    };

    // Add rows to the sheet
    transactions.forEach((transaction, index) => {
      sheet.addRow({
        date: dayjs(transaction.date).format("YYYY-MM-DD"),
        details: transaction.details,
        voucherNo: transaction.voucherNo,
        inQuantity: transaction.inQuantity || 0,
        inWeight: transaction.inWeight || 0,
        inLength: transaction.inLength || 0,
        outQuantity: transaction.outQuantity || 0,
        outWeight: transaction.outWeight || 0,
        outLength: transaction.outLength || 0,
        defaultUnit: transaction.defaultUnit,
        balance: transaction.balance || 0,
      });
    });

    const now = new Date();
    const dateString = now
      .toLocaleString("sv-SE", { timeZoneName: "short" })
      .replace(/[^0-9]/g, "");

    // Generate the Excel file and prompt the user to download it
    workbook.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `ProductReport_${dateString}.xlsx`;
      anchor.click();
      window.URL.revokeObjectURL(url);
    });
  };

  let runningQuantity = 0;
  let runningWeight = 0;
  let runningLength = 0;

  const columns = [
    {
      title: "Sr#",
      dataIndex: "",
      key: "SR",
      width: 30,
      render: (_, record, index) => index + 1,
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      width: 30,
      render: (date) => dayjs(date).format("YYYY-MM-DD"),
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
    },
    {
      title: "Details",
      dataIndex: "details",
      key: "details",
      sorter: (a, b) => String(a.details).localeCompare(String(b.details)),
    },
    {
      title: "V. No",
      dataIndex: "voucherNo",
      key: "voucherNo",
      sorter: (a, b) => a.voucherNo - b.voucherNo,
    },
    {
      title: "In Quantity",
      dataIndex: "inQuantity",
      key: "inQuantity",
      sorter: (a, b) => (a.inQuantity || 0) - (b.inQuantity || 0),
      render: (value) => (value || 0).toFixed(2),
    },
    {
      title: "In Weight",
      dataIndex: "inWeight",
      key: "inWeight",
      sorter: (a, b) => (a.inWeight || 0) - (b.inWeight || 0),
      render: (value) => (value || 0).toFixed(2),
    },
    {
      title: "In Length",
      dataIndex: "inLength",
      key: "inLength",
      sorter: (a, b) => (a.inLength || 0) - (b.inLength || 0),
      render: (value) => (value || 0).toFixed(2),
    },
    {
      title: "Out Quantity",
      dataIndex: "outQuantity",
      key: "outQuantity",
      sorter: (a, b) => (a.outQuantity || 0) - (b.outQuantity || 0),
      render: (value) => (value || 0).toFixed(2),
    },
    {
      title: "Out Weight",
      dataIndex: "outWeight",
      key: "outWeight",
      sorter: (a, b) => (a.outWeight || 0) - (b.outWeight || 0),
      render: (value) => (value || 0).toFixed(2),
    },
    {
      title: "Out Length",
      dataIndex: "outLength",
      key: "outLength",
      sorter: (a, b) => (a.outLength || 0) - (b.outLength || 0),
      render: (value) => (value || 0).toFixed(2),
    },
    {
      title: "Default Unit",
      dataIndex: "defaultUnit",
      key: "defaultUnit",
      sorter: (a, b) =>
        String(a.defaultUnit).localeCompare(String(b.defaultUnit)),
    },
    {
      title: "Balance Quantity",
      dataIndex: "balance",
      key: "balanceQuantity",
      sorter: (a, b) => (a.balance || 0) - (b.balance || 0),
      render: (value, record, index) => {
        // Use the balance from the API response
        return (value || 0).toFixed(2);
      },
    },
  ];

  const [selectedColumns, setSelectedColumns] = useState(
    columns.map((col) => col.key)
  );

  const columnsToShow = columns.filter((col) =>
    selectedColumns.includes(col.key)
  );

  const menu = (
    <Menu>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "10px",
          padding: "10px",
        }}
      >
        {columns.map((col) => (
          <div key={col.key} style={{ display: "flex", alignItems: "start" }}>
            <Checkbox
              checked={selectedColumns.includes(col.key)}
              onChange={(e) => {
                const newSelected = e.target.checked
                  ? [...selectedColumns, col.key]
                  : selectedColumns.filter((c) => c !== col.key);
                setSelectedColumns(newSelected);
              }}
            >
              {col.title}
            </Checkbox>
          </div>
        ))}
      </div>
    </Menu>
  );

  const handleSelectChange = (value) => {
    ////Console.log("Selected product code:", value);
    const product = listOfProducts.find((product) => product.code === value);
    setSelectedProduct(product);
    ////Console.log("Selected product:", product);
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
              Product Report
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
                  title="Product Report"
                />
              </div>
            )}
          </div>
          <div className="filters-wrap">
            <Form
              onFinish={fetchProductTransactions}
              form={ProductForm}
              initialValues={{
                category: "",
                type: "",
                period: "year",
              }}
            >
              <Form.Item
                name="product"
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
                  filterOption={(input, option) =>
                    option?.label?.toLowerCase().includes(input.toLowerCase())
                  }
                  loading={ProductLoading}
                  options={[
                    {
                      value: "all",
                      label: "All Products",
                    },
                    ...listOfProducts.map((product) => ({
                      value: product.code,
                      label: `${product.name} (${product.code})`,
                    })),
                  ]}
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

              <Form.Item name="code" label="Code" hidden>
                <Input />
              </Form.Item>
              <Form.Item name="period" style={{ width: "150px" }}>
                <Select
                  placeholder="Date Range"
                  onChange={setPeriod}
                  defaultValue="year"
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
                  value={startDate ? dayjs(startDate, "YYYY-MM-DD") : null}
                  onChange={handleDateChange}
                  placeholder="Start Date"
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
                  placeholder="End Date"
                />
              </Form.Item>

              <Button type="primary" htmlType="submit" loading={loading}>
                Run Report
              </Button>
            </Form>
          </div>

          {/* Loading state */}
          {loading && (
            <div style={{ textAlign: "center", padding: "50px" }}>
              <Spin size="large" />
              <p>Loading transactions...</p>
            </div>
          )}

          {/* Results */}
          {showTable && !loading && (
            <>
              {transactions.length > 0 ? (
                <>
                  <div className="filter-dropdown">
                    <Dropdown
                      overlay={menu}
                      trigger={["click"]}
                      placement="top"
                      overlayStyle={{ maxHeight: "300px", overflowY: "auto" }}
                    >
                      <span>
                        <Tooltip title="Filter Columns">
                          <FilterFilled
                            style={{
                              fontSize: "24px",
                              color: "#46484B",
                              cursor: "pointer",
                              display: "flex",
                              justifyContent: "flex-end",
                              marginBottom: "10px",
                            }}
                          />
                        </Tooltip>
                      </span>
                    </Dropdown>
                  </div>
                  <div className="reports-main-div">
                    <div className="report-content">
                      <div className="report-left">
                        <h2>
                          {selectedProduct
                            ? selectedProduct.name
                            : "All Products"}
                        </h2>
                        {selectedProduct && (
                          <h3>Product Code: {selectedProduct.code}</h3>
                        )}
                      </div>
                      <img className="report-company-name" src={Logo} />
                      <div className="report-right">
                        <h2>Product Report</h2>
                        <h3>Printed by: {User}</h3>
                        <h3>Printed on: {new Date().toLocaleString()}</h3>
                      </div>
                    </div>
                  </div>

                  <Table
                    columns={columnsToShow}
                    dataSource={transactions}
                    rowKey={(record, index) => `${record.voucherNo}-${index}`}
                    pagination={false}
                    scroll={{ x: 1200 }}
                  />
                </>
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No transactions found for the selected criteria"
                />
              )}
            </>
          )}

          {/* Error state */}
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

export default ProductReport;
