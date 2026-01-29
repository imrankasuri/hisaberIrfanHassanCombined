import {
  Form,
  Input,
  Select,
  Table,
  Button,
  Popconfirm,
  message,
  Pagination,
  Divider,
} from "antd";
import React, { useEffect, useState } from "react";
import {
  PlusOutlined,
  DownloadOutlined,
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
  DownOutlined,
  CodeSandboxOutlined,
  CaretDownFilled,
} from "@ant-design/icons";
import { Dropdown, Space, Tooltip } from "antd";
import { NavLink } from "react-router-dom";
import ProductionMenu from "./ProductionMenu";
import Config from "../../Config";
import SubMenuToggle from "../Common/SubMenuToggle";
import axios from "axios";
const ExcelJS = require("exceljs");

function ManageProducts(props) {
  const AccessKey = localStorage.getItem("AccessKey");
  const CompanyID = localStorage.getItem("CompanyID");

  const [loading, setLoading] = useState(false);
  const [ListOfProducts, setListOfProducts] = useState([]);
  const [OrderBy, setOrderBy] = useState("");
  const [ProductName, setProductName] = useState("");
  const [Type, setType] = useState("");
  const [subType, setSubType] = useState("");
  const [newType, setNewType] = useState([]);
  const [ProductCode, setProductCode] = useState(1000);
  const [Category, setCategory] = useState("");
  const [SubCategory, setSubCategory] = useState([]);
  const [CategoryLoading, setCategoryLoading] = useState(false);
  const [TotalRecords, setTotalRecords] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [form] = Form.useForm();

  const onShowSizeChange = (current, pageSize) => {
    setPageNumber(current);
    setPageSize(pageSize);
  };

  const onPageChange = (newPageNumber, newPageSize) => {
    setPageNumber(newPageNumber);
    setPageSize(newPageSize);
  };

  const fetchProducts = async () => {
    setLoading(true);
    const api_config = {
      method: "get",
      url: `${Config.base_url}Product/GetBy/${CompanyID}?orderBy=${OrderBy}&pageNumber=${pageNumber}&pageSize=${pageSize}&code=${ProductCode}&name=${ProductName}&productType=${Type}&category=${Category}&type=${subType}`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AccessKey}`,
      },
    };

    try {
      const response = await axios(api_config);
      ////Console.log(response.config);
      ////Console.log(response.data);
      if (response.data && response.data.status_code === 1) {
        setListOfProducts(response.data.listofProducts || []);
        setTotalRecords(response.data.totalRecords || 0);
      } else {
        setListOfProducts([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setListOfProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Manage Products";
    fetchProducts();
    GetCategoryDropdownData();
    GetTypeDropdownData();
  }, [
    OrderBy,
    ProductCode,
    ProductName,
    Type,
    subType,
    Category,
    pageNumber,
    pageSize,
  ]);

  const handleFilters = (formData) => {
    setProductCode(formData["code"] || 1000);
    setProductName(formData["name"] || "");
    setOrderBy(formData["OrderBy"] || "");
    setType(formData["productType"] || "");
    setCategory(formData["category"] || "");
    setSubType(formData["type"] || "");
    setPageNumber(1);
    setPageSize(100000);
    // //Console.log("category State after set:", formData["category"]);
    // fetchAccounts();
  };

  const deleteAccount = async (sno) => {
    try {
      const accountToUpdate = ListOfProducts.find((u) => u.id === sno);
      if (!accountToUpdate) {
        message.error("Product not found!");
        return;
      }

      const updatedAccount = {
        ...accountToUpdate,
        isActive: false,
        isDeleted: true,
      };

      await axios.patch(
        `${Config.base_url}Product/UpdateRecord/${sno}`,
        updatedAccount,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${AccessKey}`,
          },
        }
      );

      setListOfProducts((prev) => prev.filter((account) => account.id !== sno));
      message.success("Product deleted successfully.");
      fetchProducts();
    } catch (error) {
      message.error("Network Error..");
    }
  };

  const onReset = () => {
    form.resetFields();
    setProductCode("1000");
    setProductName("");
    setType("");
    setOrderBy("");
    setCategory("");
    setSubType("");
    setPageNumber(1);
    setPageSize(25);
    // fetchAccounts(); // Fetch all data again without any filters
  };

  const columns = [
    {
      title: "Sr#",
      dataIndex: "",
      key: "SR",
      render: (_, record, index) => index + 1,
    },
    {
      title: "Code",
      dataIndex: "categoryCode",
      key: "categoryCode",
      sorter: (a, b) =>
        String(a.categoryCode).localeCompare(String(b.categoryCode)),
    },
    {
      title: "Product Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => String(a.name).localeCompare(String(b.name)),
    },
    {
      title: "Product Type",
      dataIndex: "productType",
      key: "productType",
      sorter: (a, b) =>
        String(a.productType).localeCompare(String(b.productType)),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      sorter: (a, b) => String(a.category).localeCompare(String(b.category)),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      sorter: (a, b) => String(a.type).localeCompare(String(b.type)),
    },
    {
      title: "Sale Price",
      dataIndex: "salePrice",
      key: "salePrice",
      sorter: (a, b) => (a.salePrice || 0) - (b.salePrice || 0),
    },
    {
      title: "Qty on Hand",
      dataIndex: "openingQuantity",
      key: "openingQuantity",
      sorter: (a, b) => (a.openingQuantity || 0) - (b.openingQuantity || 0),
    },
    {
      title: "Low Stock",
      dataIndex: "lowStockLevel",
      key: "lowStockLevel",
      sorter: (a, b) => a.lowStockLevel - b.lowStockLevel,
    },
    {
      title: "Action",
      dataIndex: "Actions",
      key: "Actions",
      render: (_, record) => (
        <div className="table-actions">
          <NavLink
            className="primary"
            to={
              record.productType === "Stock"
                ? `/product/edit-stock-products/${record.id}`
                : `/product/edit-Nonstock-products/${record.id}`
            }
          >
            <EditOutlined />
          </NavLink>
          <Popconfirm
            title="Delete the task"
            description="Are you sure to delete this account?"
            onConfirm={() => deleteAccount(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <DeleteOutlined />
          </Popconfirm>
        </div>
      ),
    },
  ];

  const items = [
    {
      label: (
        <NavLink to="/production/add-stock-products">Stock Products</NavLink>
      ),
      key: "1",
      icon: <CodeSandboxOutlined />,
    },
    {
      label: (
        <NavLink to="/production/add-non-stock-products">
          Non Stock Products
        </NavLink>
      ),
      key: "2",
      icon: <CodeSandboxOutlined />,
    },
  ];
  const menuProps = {
    items,
  };

  const handleExport = async () => {
    setLoading(true);

    // Ensure no pagination is set to true
    const api_config = {
      method: "get",
      url: `${Config.base_url}Product/GetBy/${CompanyID}?orderBy=${OrderBy}&pageNumber=1&pageSize=1000000&code=${ProductCode}&name=${ProductName}&productType=${Type}&noPagination=true`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AccessKey}`,
      },
    };

    try {
      const response = await axios(api_config);
      ////Console.log(response.data);

      if (response.data && response.data.status_code === 1) {
        const ListOfProducts = response.data.listofProducts || [];

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("Products");

        sheet.columns = [
          { header: "Code", key: "code", width: 15 },
          { header: "Product Name", key: "name", width: 30 },
          { header: "ProductType", key: "productType", width: 30 },
          { header: "Category", key: "category", width: 30 },
          { header: "CategoryShortName", key: "categoryShortName", width: 20 },
          { header: "Unit", key: "unit", width: 20 },
          { header: "Type", key: "type", width: 20 },
          { header: "Size", key: "size", width: 20 },
          { header: "SalePrice", key: "salePrice", width: 30 },
          { header: "DefaultUnit", key: "defaultUnit", width: 30 },
          { header: "OpeningQuantity", key: "openingQuantity", width: 30 },
          { header: "LowLevelStock", key: "lowStockLevel", width: 20 },
          { header: "OpeningRate", key: "openingRate", width: 20 },
        ];

        // Add rows to the sheet
        ListOfProducts.forEach((product, index) => {
          sheet.addRow({
            sr: index + 1,
            code: product.code,
            name: product.name,
            productType: product.productType,
            category: product.category,
            categoryShortName: product.categoryCode.split("-")[0],
            unit: product.unit,
            type: product.type,
            size: product.size,
            salePrice: product.salePrice,
            defaultUnit: product.defaultUnit,
            openingQuantity: product.openingQuantity,
            lowStockLevel: product.lowStockLevel,
            openingRate: product.openingRate,
          });
        });

        sheet.getColumn(1).eachCell((cell) => {
          cell.protection = { locked: true }; // Lock the cells in the "Code" column
        });

        // Unlock all other columns
        sheet.columns.slice(1).forEach((col) => {
          col.eachCell((cell) => {
            cell.protection = { locked: false }; // Unlock other cells
          });
        });

        sheet.protect("", {
          selectLockedCells: true,
          selectUnlockedCells: true,
          formatColumns: false,
          formatRows: false,
          insertRows: false,
          insertColumns: false,
          deleteRows: false,
          deleteColumns: false,
          sort: false,
          autoFilter: false,
        });

        const now = new Date();
        const dateString = now
          .toLocaleString("sv-SE", { timeZoneName: "short" })
          .replace(/[^0-9]/g, ""); // Remove special characters like : and space

        // Generate the Excel file and prompt the user to download it
        workbook.xlsx.writeBuffer().then((data) => {
          const blob = new Blob([data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });
          const url = window.URL.createObjectURL(blob);
          const anchor = document.createElement("a");
          anchor.href = url;
          anchor.download = `ProductsList_${dateString}.xlsx`;
          anchor.click();
          window.URL.revokeObjectURL(url);
        });
      } else {
        console.error("No products found or error in response.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
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
      console.error(error);
      setCategoryLoading(false);
    }
  };

  const GetTypeDropdownData = async () => {
    setLoading(true);
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
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const sortedData = ListOfProducts.sort((a, b) => {
    if (a.code < b.code) return 1;
    if (a.code > b.code) return -1;
    return 0;
  });
  return (
    <>
      <div id="sub-menu-wrap">
        <h5>Production</h5>
        <ProductionMenu />
      </div>
      <div className="right-side-contents">
        <div className="page-content">
          <div className="page-header">
            <SubMenuToggle />
            <h3 className="page-title">Manage Products</h3>
            <div className="header-actions">
              <NavLink to="/products/import">
                <Button type="dashed" icon={<DownloadOutlined />}>
                  Import
                </Button>
              </NavLink>
              <Button
                type="dashed"
                onClick={handleExport}
                icon={<UploadOutlined />}
              >
                Export
              </Button>
              <NavLink>
                <Dropdown menu={menuProps}>
                  <Button type="primary">
                    <Space>
                      <PlusOutlined />
                      New
                    </Space>
                  </Button>
                </Dropdown>
              </NavLink>
            </div>
          </div>
          <div className="filters-wrap">
            <Form onFinish={handleFilters} form={form} layout="vertical">
              <Form.Item name="OrderBy">
                <Select placeholder="Order By" style={{ width: 120 }}>
                  <Select.Option value="code">Product Code</Select.Option>
                  <Select.Option value="name">Product Name</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name="productType">
                <Select placeholder="Product Type" style={{ width: 120 }}>
                  <Select.Option value="">All Types</Select.Option>
                  <Select.Option value="Stock">Stock</Select.Option>
                  <Select.Option value="NonStock">Non Stock</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name="category">
                <Select
                  style={{
                    width: 150,
                  }}
                  placeholder="Category"
                  dropdownRender={(menufieldone) => (
                    <>
                      {menufieldone}
                      <Divider
                        style={{
                          margin: "8px 0",
                        }}
                      />
                    </>
                  )}
                  options={SubCategory.map((fieldThreeitem) => ({
                    label: fieldThreeitem.name,
                    value: fieldThreeitem.name,
                  }))}
                />
              </Form.Item>
              <Form.Item name="type">
                <Select
                  style={{
                    width: 150,
                  }}
                  placeholder="Type"
                  dropdownRender={(menufieldone) => (
                    <>
                      {menufieldone}
                      <Divider
                        style={{
                          margin: "8px 0",
                        }}
                      />
                    </>
                  )}
                  options={newType.map((fieldThreeitem) => ({
                    label: fieldThreeitem.name,
                    value: fieldThreeitem.name,
                  }))}
                />
              </Form.Item>
              <Form.Item name="name">
                <Select
                  showSearch
                  filterOption={(input, option) =>
                    option.label.toLowerCase().includes(input.toLowerCase())
                  }
                  placeholder="Product Name"
                  style={{ width: "250px" }}
                  options={ListOfProducts.map((record) => ({
                    label: `${record.name}`,
                    value: `${record.name}`,
                  }))}
                />
              </Form.Item>

              <Button type="primary" htmlType="submit">
                Filter
              </Button>
              <Button type="link" onClick={onReset}>
                Reset
              </Button>
            </Form>
          </div>

          <Table
            scroll={{
              x: "100%",
            }}
            columns={columns}
            dataSource={sortedData}
            size="small"
            loading={loading}
            pagination={false}
          />
          <div style={{ marginTop: 15 }}>
            <Pagination
              align="end"
              showSizeChanger
              size="small"
              onShowSizeChange={onShowSizeChange} // Updates page size
              onChange={onPageChange} // Updates page number and page size
              current={pageNumber} // Current page
              pageSize={pageSize} // Current page size
              total={TotalRecords} // Total number of records
              pageSizeOptions={["10", "50", "100", "500", "1000"]}
              defaultCurrent={1}
              showTotal={(total, range) =>
                `${range[0]}-${range[1]} of ${total} items`
              }
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default ManageProducts;
