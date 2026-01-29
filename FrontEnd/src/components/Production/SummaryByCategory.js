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
import Config from "../../Config";
import SubMenuToggle from "../Common/SubMenuToggle";
import dayjs from "dayjs";
import {
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
import ReportPrinter from "../Shared/ReportPrinter";

const { Title, Text } = Typography;

const ProductSummaryByCategory = () => {
  const navigate = useNavigate();
  const printRef = useRef();
  const AccessKey = localStorage.getItem("AccessKey");
  const CompanyID = localStorage.getItem("CompanyID");
  const User = localStorage.getItem("Full_Name");

  const [CustomerForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState("");
  const [ProductBodies, setProductBodies] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const defaultStartDate = dayjs().format("YYYY-MM-DD");
  const defaultEndDate = dayjs().format("YYYY-MM-DD");
  const [showTable, setShowTable] = useState(false);
  const [subCategory, setSubCategory] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [includeAllProducts, setIncludeAllProducts] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [period, setPeriod] = useState("all");

  const fetchProducts = async (FormData) => {
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
        url: `${Config.base_url}Reports/GetProductSummaryByCategory/${CompanyID}?category=${category}&startDate=${effectiveStartDate}&endDate=${effectiveEndDate}&period=${FormData.period}&includeAllProducts=${includeAllProducts}`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${AccessKey}`,
        },
      };

      const response = await axios(api_config);

      if (response.data.statusCode === 1) {
        setProductBodies(response.data.headTransactions || []);
        setShowTable(true);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch product data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Product Summary By Category";
    GetCategoryDropdownData();
  }, []);

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
      setCategoryLoading(false);
    }
  };

  const handleSelectChange = async (value) => {
    if (value === "all") {
      setSelectedCategory(null);
      setCategory("all");
      setIncludeAllProducts(true);
      return;
    }

    const selectedCategory = subCategory.find(
      (category) => category.name === value
    );

    if (selectedCategory) {
      setIncludeAllProducts(false);
      setCategory(selectedCategory.name);
      setSelectedCategory(selectedCategory);
    }
  };

  const toggleRowExpansion = (categoryId) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(categoryId)) {
      newExpandedRows.delete(categoryId);
    } else {
      newExpandedRows.add(categoryId);
    }
    setExpandedRows(newExpandedRows);
  };

  const handleExpandAll = () => {
    const allIds = new Set(ProductBodies.map((category) => category.id));
    setExpandedRows(allIds);
  };

  const handleCollapseAll = () => {
    setExpandedRows(new Set());
  };

  const calculateCategoryTotal = (children) => {
    if (!children || children.length === 0) return 0;
    return children.reduce((sum, item) => sum + (item.total || 0), 0);
  };

  const calculateGrandTotal = () => {
    return ProductBodies.reduce((sum, category) => {
      const categoryTotal = category.productBodies?.reduce(
        (innerSum, p) =>
          innerSum + (p.openingQuantity || 0) * (p.salePrice || 0),
        0
      );
      return sum + categoryTotal;
    }, 0);
  };

  const columns = [
    {
      title: "",
      key: "expand",
      width: 50,
      render: (_, record) => {
        if (record.isCategoryHeader && record.hasProducts) {
          const isExpanded = expandedRows.has(record.categoryId);
          return (
            <Button
              type="text"
              size="small"
              icon={isExpanded ? <CaretDownOutlined /> : <CaretRightOutlined />}
              onClick={() => toggleRowExpansion(record.categoryId)}
            />
          );
        }
        return null;
      },
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (category, record) => {
        if (record.isCategoryHeader) {
          return <strong>{category}</strong>;
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
          return <span style={{ paddingLeft: "20px" }}>{product}</span>;
        }
        return null;
      },
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      align: "right",
      render: (quantity, record) => {
        if (record.isProductDetail) {
          return quantity;
        }
        return null;
      },
    },
    {
      title: "Rate",
      dataIndex: "rate",
      key: "rate",
      align: "right",
      render: (rate, record) => {
        if (record.isProductDetail) {
          return rate ? rate.toFixed(2) : "0.00";
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
        if (record.isProductDetail) {
          return total ? total.toFixed(2) : "0.00";
        }
        return null;
      },
    },
    {
      title: "Category Total",
      dataIndex: "categoryTotal",
      key: "categoryTotal",
      align: "right",
      render: (amount, record) => {
        if (record.isCategoryHeader) {
          return <strong>{amount ? amount.toFixed(2) : "0.00"}</strong>;
        }
        return null;
      },
    },
  ];

  const getTableData = () => {
    let rows = [];

    ProductBodies.forEach((category) => {
      const hasProducts =
        category.productBodies && category.productBodies.length > 0;
      const isExpanded = expandedRows.has(category.id);

      // Calculate category total as sum of all product totals in this category
      const categoryTotal = hasProducts
        ? category.productBodies.reduce(
            (sum, item) => sum + (item.openingQuantity || 0) * (item.salePrice || 0),
            0
          )
        : 0;

      rows.push({
        key: `category-${category.id}`,
        categoryId: category.id,
        category: category.name,
        categoryTotal: categoryTotal,
        isCategoryHeader: true,
        hasProducts: hasProducts,
      });

      if (isExpanded && hasProducts) {
        category.productBodies.forEach((item, idx) => {
          rows.push({
            key: `product-${category.id}-${idx}`,
            categoryId: category.id,
            product: item.name,
            quantity: item.openingQuantity,
            rate: item.salePrice,
            total: item.openingQuantity * item.salePrice,
            isProductDetail: true,
          });
        });
      }
    });

    return rows;
  };

  const handleExportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Product Summary By Category");

    worksheet.addRow(["Product Summary By Category"]);
    worksheet.addRow([
      selectedCategory ? selectedCategory.name : "All Categories",
      "",
      "",
      `Printed by: ${User}`,
    ]);
    worksheet.addRow([
      "",
      "",
      "",
      `Printed on: ${new Date().toLocaleString()}`,
    ]);
    worksheet.addRow([]);

    ProductBodies.forEach((category) => {
      worksheet.addRow([
        `Category: ${category.name}`,
        "",
        "",
        `Total: ${category.total ? category.total.toFixed(2) : "0.00"}`,
      ]);

      if (category.productBodies && category.productBodies.length > 0) {
        worksheet.addRow(["Product", "Quantity", "Rate", "Total"]);

        category.productBodies.forEach((item) => {
          worksheet.addRow([
            item.name || "N/A",
            item.openingQuantity || 0,
            item.salePrice ? item.salePrice.toFixed(2) : "0.00",
            item.openingQuantity * item.salePrice
              ? (item.openingQuantity * item.salePrice).toFixed(2)
              : "0.00",
          ]);
        });

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
    a.download = `Product_Summary_By_Category_${dayjs().format(
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
            <h3 className="page-title">Product Summary By Category</h3>
            {showTable && ProductBodies.length > 0 && (
              <div className="header-actions">
                <ReportPrinter
                  printRef={printRef}
                  selectedSupplier={selectedCategory}
                  startDate={startDate}
                  endDate={endDate}
                  User={User}
                  title="Product Summary By Category"
                />
                <Button icon={<UploadOutlined />} onClick={handleExportToExcel}>
                  Export to Excel
                </Button>
              </div>
            )}
          </div>

          <div className="filters-wrap">
            <Form onFinish={fetchProducts} form={CustomerForm}>
              <Form.Item name="category">
                <Select
                  style={{ width: 300 }}
                  showSearch
                  filterOption={(input, option) =>
                    option.label.toLowerCase().includes(input.toLowerCase())
                  }
                  placeholder="Select Category"
                  loading={categoryLoading}
                  notFoundContent={
                    categoryLoading ? <Spin size="small" /> : null
                  }
                  options={[
                    { label: "All Categories", value: "all" },
                    ...subCategory.map((item) => ({
                      label: item.name,
                      value: item.name,
                    })),
                  ]}
                  onSelect={handleSelectChange}
                />
              </Form.Item>

              <Button type="primary" htmlType="submit" loading={loading}>
                Run Report
              </Button>
            </Form>
          </div>

          {showTable && ProductBodies.length > 0 && (
            <div className="reports-main-div">
              <div className="report-content">
                <div className="report-left">
                  <h2>
                    {selectedCategory
                      ? selectedCategory.name
                      : "All Categories"}
                  </h2>
                </div>
                <img className="report-company-name" src={Logo} />
                <div className="report-right">
                  <h2>Product Summary By Category</h2>
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
                      <Table.Summary.Cell index={0} colSpan={6} align="right">
                        <b>Grand Total</b>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={6} align="right">
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

export default ProductSummaryByCategory;
