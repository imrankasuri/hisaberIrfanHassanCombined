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
import SupplierDropdown from "../Shared/SuppliersDropdown";
import ReportsMenu from "../Reports/ReportsMenu";
import Logo from "../../assets/images/logo/dark-h.svg";
import SubMenuToggle from "../Common/SubMenuToggle";
import ExcelJS from "exceljs";
import ReportPrinter from "../Shared/ReportPrinter";
import { NavLink } from "react-router-dom";
import { renderVoucherNumber } from "../../utils/voucherNavigation";

const { Title, Text } = Typography;

const PurchaseDetailBySupplierProduct = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [supplierList, setSupplierList] = useState([]);
  const [purchaseData, setPurchaseData] = useState([]);
  const [filteredPurchaseData, setFilteredPurchaseData] = useState([]);
  const [productLoading, setProductLoading] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [SupplierLoading, setSupplierLoading] = useState(false);
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
  const [supplierAccountCode, setSupplierAccountCode] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [includeAllSuppliers, setIncludeAllSuppliers] = useState(false);
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
    document.title = "Purchase Detail by Supplier Product";
    fetchSuppliers();
    fetchProducts();
    fetchCategoryDropdownData();
    fetchTypeDropdownData();
  }, []);

  useEffect(() => {
    applyProductFilter();
  }, [selectedProductCode, purchaseData]);

  const fetchSuppliers = async () => {
    setSupplierLoading(true);
    try {
      const response = await SupplierDropdown();
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
      isCustomer: false,
      isSupplier: true,
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
      setFilteredPurchaseData(purchaseData);
    } else {
      const filtered = purchaseData
        .map((purchase) => {
          const filteredBodies =
            purchase.purchaseBodies?.filter((body) => {
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
              ...purchase,
              purchaseBodies: filteredBodies,
            };
          }
          return null;
        })
        .filter((purchase) => purchase !== null);

      setFilteredPurchaseData(filtered);
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
        url: `${Config.base_url}Reports/GetPurchaseTransactions/${CompanyID}?supplierAccountCode=${supplierAccountCode}&startDate=${effectiveStartDate}&endDate=${effectiveEndDate}&period=${FormData.period}&includeAllSuppliers=${includeAllSuppliers}`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${AccessKey}`,
        },
      };
      const response = await axios(api_config);
      //Console.log(response);
      if (response.data.statusCode === 1) {
        setPurchaseData(response.data.headTransactions || []);
        setShowTable(true);
      } else {
        setPurchaseData([]);
        setShowTable(true);
      }
    } catch (err) {
      setError("Failed to fetch report data");
      //Console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleRowExpansion = (purchaseId) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(purchaseId)) {
      newExpandedRows.delete(purchaseId);
    } else {
      newExpandedRows.add(purchaseId);
    }
    setExpandedRows(newExpandedRows);
  };

  const handleExpandAll = () => {
    const allIds = new Set(filteredPurchaseData.map((invoice) => invoice.id));
    setExpandedRows(allIds);
  };

  const handleCollapseAll = () => {
    setExpandedRows(new Set());
  };

  const calculateTotalQuantity = () => {
    return filteredPurchaseData.reduce((sum, purchase) => {
      if (purchase.purchaseBodies && purchase.purchaseBodies.length > 0) {
        return (
          sum +
          purchase.purchaseBodies.reduce(
            (purchaseSum, item) => purchaseSum + (parseFloat(item.quantity) || 0),
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
        if (record.isPurchaseHeader && record.hasProducts) {
          const isExpanded = expandedRows.has(record.purchaseId);
          return (
            <Button
              type="text"
              size="small"
              icon={isExpanded ? <CaretDownOutlined /> : <CaretRightOutlined />}
              onClick={() => toggleRowExpansion(record.purchaseId)}
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
        if (record.isPurchaseHeader) {
          const value = dayjs(date).format("YYYY-MM-DD");
          return record.inComplete ? <strong>{value}</strong> : value;
        }
        return null;
      },
    },
    {
      title: "Bill Id",
      dataIndex: "billID",
      key: "billID",
      sorter: (a, b) => a.billID - b.billID,
      render: (billID, record) => {
        if (record.isPurchaseHeader) {
          const voucherElement = renderVoucherNumber(billID, {
            ...record,
            voucherNo: billID,
            details: "Bill",
          });
          return record.inComplete ? <strong>{voucherElement}</strong> : voucherElement;
        }
        return null;
      },
    },
    {
      title: "Supplier",
      dataIndex: "supplierName",
      key: "supplierName",
      sorter: (a, b) => a.supplierName.localeCompare(b.supplierName),
      render: (text, record) => {
        if (record.isPurchaseHeader) {
          const supplierElement = (
            <NavLink
              className="primary"
              to={`/supplier/report?source=${record.supplierAccountCode}`}
            >
              {record.supplierName}
            </NavLink>
          );
          return record.inComplete ? <strong>{supplierElement}</strong> : supplierElement;
        }
        return null;
      },
    },
    {
      title: "Bill Number",
      dataIndex: "billNumber",
      key: "billNumber",
      sorter: (a, b) => a.billNumber.localeCompare(b.billNumber),
      render: (billNumber, record) => {
        if (record.isPurchaseHeader) {
          return record.inComplete ? <strong>{billNumber}</strong> : billNumber;
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
          const productElement = <span style={{ paddingLeft: "20px" }}>{product}</span>;
          return record.inComplete ? <strong>{productElement}</strong> : productElement;
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
          const numQuantity = parseFloat(quantity) || 0;
          const value = numQuantity.toFixed(2);
          return record.inComplete ? <strong>{value}</strong> : value;
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
          const numRate = parseFloat(rate) || 0;
          const value = numRate.toFixed(2);
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
          const numAmount = parseFloat(amount) || 0;
          const value = numAmount.toFixed(2);
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
      sorter: (a, b) => a.purchaseTotal - b.purchaseTotal,
      render: (amount, record) => {
        if (record.isPurchaseHeader && record.purchaseTotal) {
          const numAmount = parseFloat(record.purchaseTotal) || 0;
          const value = numAmount.toFixed(2);
          return record.inComplete ? <strong>{value}</strong> : <strong>{value}</strong>;
        }
        return null;
      },
    },
  ];

  const getTableData = () => {
    let rows = [];

    filteredPurchaseData.forEach((purchase) => {
      const hasProducts =
        purchase.purchaseBodies && purchase.purchaseBodies.length > 0;
      const isExpanded = expandedRows.has(purchase.id);

      rows.push({
        key: `purchase-${purchase.id}`,
        purchaseId: purchase.id,
        date: purchase.date,
        billID: purchase.billID,
        supplierName: purchase.supplierName,
        supplierAccountCode: purchase.supplierAccountCode,
        billNumber: purchase.billNumber,
        billAmount: purchase.total,
        purchaseTotal: purchase.total,
        isPurchaseHeader: true,
        hasProducts: hasProducts,
        inComplete: purchase.inComplete || false,
      });

      if (isExpanded && hasProducts) {
        purchase.purchaseBodies.forEach((item, idx) => {
          rows.push({
            key: `product-${purchase.id}-${idx}`,
            purchaseId: purchase.id,
            product: item.product,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.amount,
            isProductDetail: true,
            inComplete: purchase.inComplete || false,
          });
        });
      }
    });

    return rows;
  };

  const calculateGrandTotal = () => {
    return filteredPurchaseData.reduce((sum, purchase) => {
      const value = parseFloat(purchase.total) || 0;
      const adjustedValue = purchase.purchaseType === "Credit" ? -value : value;
      return sum + adjustedValue;
    }, 0);
  };

  const handleExportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(
      "Purchase Detail By Supplier Product"
    );

    worksheet.addRow(["Purchase Detail By Supplier Product"]);
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

    filteredPurchaseData.forEach((purchase) => {
      worksheet.addRow([
        `Purchase: ${purchase.billID}`,
        `Date: ${dayjs(purchase.date).format("YYYY-MM-DD")}`,
        `Supplier: ${purchase.supplierName}`,
        `Total: ${(parseFloat(purchase.total) || 0).toFixed(2)}`,
      ]);
      if (purchase.purchaseBodies && purchase.purchaseBodies.length > 0) {
        worksheet.addRow(["Product", "Quantity", "Rate", "Amount"]);
        purchase.purchaseBodies.forEach((item) => {
          worksheet.addRow([
            item.product || "N/A",
            parseFloat(item.quantity) || 0,
            (parseFloat(item.rate) || 0).toFixed(2),
            (parseFloat(item.amount) || 0).toFixed(2),
          ]);
        });
        worksheet.addRow([
          "Subtotal",
          "",
          "",
          purchase.purchaseBodies
            .reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)
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
    a.download = `Purchase_Detail_By_Supplier_Product_${dayjs().format(
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
            <h3 className="page-title">Purchase Detail by Supplier Product</h3>
            {showTable && filteredPurchaseData.length > 0 && (
              <div className="header-actions">
                <ReportPrinter
                  printRef={printRef}
                  selectedSupplier={selectedSupplier}
                  startDate={startDate}
                  endDate={endDate}
                  User={User}
                  title="Purchase Detail by Supplier Product"
                />
                <Button icon={<UploadOutlined />} onClick={handleExportToExcel}>
                  Export to Excel
                </Button>
              </div>
            )}
          </div>
          <div className="filters-wrap">
            <Form form={form} onFinish={fetchReportData}>
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

          {showTable && filteredPurchaseData.length > 0 && (
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
                  <h2>Purchase Detail By Supplier Product</h2>
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
                  rowClassName={(record) => record.inComplete ? "incomplete-row" : ""}
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

export default PurchaseDetailBySupplierProduct;
