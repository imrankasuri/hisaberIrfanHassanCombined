import {
  Form,
  Input,
  Select,
  Table,
  Button,
  Dropdown,
  Space,
  Menu,
  Popconfirm,
  message,
  Badge,
  DatePicker,
  Flex,
  Pagination,
  Modal,
} from "antd";
import React, { useEffect, useRef, useState } from "react";
import {
  PlusOutlined,
  DownloadOutlined,
  UploadOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
} from "@ant-design/icons";

import { Link, NavLink } from "react-router-dom";
import AssemblyMenu from "./../AssemblyMenu";
import Config from "../../../Config";
import SubMenuToggle from "../../Common/SubMenuToggle";
import axios from "axios";
import dayjs from "dayjs";
import moment from "moment";
import { QueueListIcon } from "@heroicons/react/24/outline";
import ProductDropdown from "../../Shared/ProductDropdown";

const ExcelJS = require("exceljs");

function ManageTemplates() {
  const AccessKey = localStorage.getItem("AccessKey");
  const UserID = localStorage.getItem("ID");
  const CompanyID = localStorage.getItem("CompanyID");
  const FYear = localStorage.getItem("DefaultFYear");

  const [loading, setLoading] = useState(false);
  const [ListOfRecords, setListOfRecords] = useState([]);
  const [ProductName, setProductName] = useState("");

  const [IsDeleted, setIsDeleted] = useState(false);
  const [ProductLoading, setProductLoading] = useState(false);
  const [open, setOpen] = useState(false);
  // pagination
  const [OpenDate, setOpenDate] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [TotalRecords, setTotalRecords] = useState(0);
  const [ListOfProducts, setListOfProducts] = useState([]);
  const [ExportData, setExportData] = useState([]);

  // Copy modal states
  const [copyModalVisible, setCopyModalVisible] = useState(false);
  const [copyingTemplate, setCopyingTemplate] = useState(null);
  const [copyLoading, setCopyLoading] = useState(false);

  const [form] = Form.useForm();
  const [formMain] = Form.useForm();
  const [copyForm] = Form.useForm();

  const onShowSizeChange = (current, pageSize) => {
    setPageNumber(current);
    setPageSize(pageSize);
  };

  const onPageChange = (newPageNumber, newPageSize) => {
    setPageNumber(newPageNumber);
    setPageSize(newPageSize);
  };

  const fetchTemplates = async () => {
    setLoading(true);
    const data = {
      CompanyID: CompanyID,
      ProductName: ProductName,
      PageSize: pageSize,
      PageNo: pageNumber,
    };
    const api_config = {
      method: "post",
      url: `${Config.base_url}Templates/GetTemplates`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AccessKey}`,
      },

      data: data,
    };

    try {
      const response = await axios(api_config);
      ////Console.log(response.data);
      if (response.data && response.data.status_code === 1) {
        setListOfRecords(response.data.listofTemps || []);
        setTotalRecords(response.data.totalRecords || 0);
        setLoading(false);
      } else {
        setListOfRecords([]);
        setLoading(false);
        //message.error(response.data.status_message);
      }
    } catch (error) {
      //console.error("Error fetching data:", error);
      message.error("Network Error..");
      setListOfRecords([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Product Recipes";
    fetchTemplates();
    fetchProducts();
  }, [ProductName, pageNumber, pageSize]);

  const fetchProducts = async () => {
    setProductLoading(true);
    try {
      const response = await ProductDropdown();
      if (response != null) {
        setListOfProducts(response || []);
      }
    } catch (error) {
      // console.error(error);
    } finally {
      setProductLoading(false);
    }
  };

  const handleFilters = (formData) => {
    // //Console.log("Form Data Submitted:", formData);
    setProductName(formData["product"] || "");
    setPageNumber(1);
    setPageSize(100000);
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
      dataIndex: "code",
      key: "code",
      sorter: (a, b) => a.code - b.code,
    },

    {
      title: "Product Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },

    {
      title: "Recipe ID",
      dataIndex: "tempID",
      key: "tempID",
      sorter: (a, b) => a.tempID - b.tempID,
    },

    // {
    //   title: "Recipe Name",
    //   dataIndex: "tempName",
    //   key: "tempName",
    //   sorter: (a, b) => a.tempName.localeCompare(b.tempName),
    // },

    {
      title: "Created On",
      dataIndex: "createdOn",
      key: "createdOn",
      sorter: (a, b) => dayjs(a.createdOn).unix() - dayjs(b.createdOn).unix(),
      render: (date) => dayjs(date).format("YYYY-MM-DD"),
    },

    {
      title: "Actions",
      dataIndex: "Actions",
      key: "Actions",
      render: (_, record) =>
        record.docNo !== "COP" ? (
          <div className="table-actions">
            <NavLink
              className={"primary"}
              to={`/assembly/edit-product-recipe/${record.tempID}`}
            >
              <EditOutlined />
            </NavLink>
            <Button
              type="text"
              icon={<CopyOutlined />}
              onClick={() => handleCopyTemplate(record)}
              title="Copy Recipe"
            />
            <Popconfirm
              title="Delete the task"
              description="Are you sure to delete this Recipe?"
              onConfirm={(e) => deleteTemplate(record.tempID)}
              okText="Yes"
              cancelText="No"
            >
              <DeleteOutlined />
            </Popconfirm>
          </div>
        ) : (
          ""
        ),
    },
  ];

  const deleteTemplate = async (id) => {
    setLoading(true);
    try {
      const response = await axios.patch(
        `${Config.base_url}Templates/DeleteTemplateDataByDetailID/${id}/${CompanyID}`,
        {
          headers: {
            Authorization: `Bearer ${AccessKey}`,
          },
        }
      );
      if (response.data.status_code == 1) {
        message.success(response.data.status_message);
        setLoading(false);
      } else {
        message.error(response.data.status_message);
        setLoading(false);
      }
    } catch (error) {
      message.error("Network Error..");
      //console.error(error);
      setLoading(false);
    }
    fetchTemplates();
  };

  const handleCopyTemplate = (record) => {
    setCopyingTemplate(record);
    copyForm.setFieldsValue({
      sourceRecipe: `${record.name} (${record.code})`,
      newProductID: null, // Reset product selection
      newTemplateName: `${record.name} (Copy)`,
    });
    setCopyModalVisible(true);
  };

  const handleCopySubmit = async (values) => {
    setCopyLoading(true);
    try {
      // Get selected product details
      const selectedProduct = ListOfProducts.find(
        (p) => p.id === values.newProductID
      );

      const data = {
        SourceTemplateID: copyingTemplate.tempID,
        CompanyID: parseInt(CompanyID),
        UserID: UserID,
        NewTemplateName: selectedProduct
          ? selectedProduct.name
          : values.newTemplateName,
        NewProductID: values.newProductID,
      };

      const response = await axios.post(
        `${Config.base_url}Templates/CopyTemplate`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${AccessKey}`,
          },
        }
      );
      //console.log(response.data);
      if (response.data.status_code === 1) {
        message.success(response.data.status_message);
        setCopyModalVisible(false);
        copyForm.resetFields();
        setCopyingTemplate(null);
        fetchTemplates(); // Refresh the list
      } else {
        message.error(response.data.status_message);
      }
    } catch (error) {
      message.error("Network Error..");
      console.error(error);
    } finally {
      setCopyLoading(false);
    }
  };

  const handleCopyCancel = () => {
    setCopyModalVisible(false);
    copyForm.resetFields();
    setCopyingTemplate(null);
  };

  const onReset = () => {
    form.resetFields();
    setProductName("");
    setPageNumber(1);
    setPageSize(20);
  };

  const handleExport = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Templates");

    // Set column headers and their widths
    sheet.columns = [
      { header: "Sr#", key: "sr", width: 5 },
      { header: "Product Code", key: "code", width: 15 },
      { header: "Product Name", key: "name", width: 25 },
      { header: "Template ID", key: "tempID", width: 15 },
      { header: "Template Name", key: "tempName", width: 30 },
      {
        header: "Created On",
        key: "createdOn",
        width: 15,
        render: (date) => dayjs(date).format("YYYY-MM-DD"),
      },
    ];

    // Add rows to the sheet
    ListOfRecords.forEach((temp, index) => {
      const createdOnDate = new Date(temp.createdOn);
      sheet.addRow({
        sr: index + 1,
        code: temp.code,
        name: temp.name,
        tempID: temp.tempID,
        tempName: temp.tempName,
        createdOn: createdOnDate.toISOString().split("T")[0],
      });
    });

    const now = new window.Date();
    const dateString = now
      .toLocaleString("sv-SE", { timeZoneName: "short" }) // Using Swedish locale for formatting
      .replace(/[^0-9]/g, ""); // Removing non-numeric characters

    // Generate the Excel file and prompt the user to download it
    workbook.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `TemplateList_${dateString}.xlsx`;
      anchor.click();
      window.URL.revokeObjectURL(url);
    });
  };

  const sortedData = ListOfRecords.sort(
    //(a, b) => dayjs(b.date).unix() - dayjs(a.date).unix(),
    (a, b) => b.tempID - a.tempID
  );

  return (
    <>
      <div id="sub-menu-wrap">
        <h5>Assembly</h5>
        <AssemblyMenu />
      </div>
      <div className="right-side-contents">
        <div className="page-content">
          <div className="page-header">
            <SubMenuToggle />
            <h3 className="page-title">Product Recipes</h3>
            <div className="header-actions">
              {/* <NavLink to="/sales/sales-invoice/import">
                <Button type="dashed" icon={<DownloadOutlined />}>
                  Import
                </Button>
              </NavLink> */}
              <Button
                type="dashed"
                onClick={handleExport}
                icon={<UploadOutlined />}
              >
                Export
              </Button>
              <NavLink to="/assembly/add-product-recipe">
                <Button type="primary" icon={<PlusOutlined />}>
                  New
                </Button>
              </NavLink>
            </div>
          </div>
          <div className="filters-wrap">
            <Flex justify="space-between" align="center">
              <Form onFinish={handleFilters} form={form}>
                <Form.Item name="product">
                  <Select
                    showSearch
                    filterOption={(input, option) =>
                      option.label.toLowerCase().includes(input.toLowerCase())
                    }
                    placeholder="Product Name"
                    style={{ width: "250px" }}
                    options={ListOfProducts.map((record) => ({
                      label: (
                        <>
                          {record.name} ({record.code})
                        </>
                      ),
                      value: record.name,
                    }))}
                  />
                </Form.Item>

                <Button htmlType="submit" type="primary">
                  Filter
                </Button>
                <Button htmlType="button" onClick={onReset} type="link">
                  Reset
                </Button>
              </Form>
            </Flex>
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
              onShowSizeChange={onShowSizeChange}
              onChange={onPageChange}
              current={pageNumber}
              pageSizeOptions={["10", "50", "100", "500", "1000"]}
              pageSize={pageSize}
              total={TotalRecords}
              defaultCurrent={1}
              showTotal={(total, range) => {
                return `${range[0]}-${range[1]} of ${total} items`;
              }}
            />
          </div>
        </div>
      </div>

      {/* Copy Template Modal */}
      <Modal
        title="Copy Product Recipe"
        open={copyModalVisible}
        onCancel={handleCopyCancel}
        footer={null}
        width={500}
      >
        <Form form={copyForm} layout="vertical" onFinish={handleCopySubmit}>
          <Form.Item label="Source Recipe" name="sourceRecipe">
            <Input disabled />
          </Form.Item>

          <Form.Item
            label="Select Product for New Recipe"
            name="newProductID"
            rules={[
              {
                required: true,
                message: "Please select a product for the new recipe",
              },
            ]}
          >
            <Select
              showSearch
              placeholder="Select a product"
              optionFilterProp="children"
              filterOption={(input, option) =>
                option?.children
                  ?.toString()
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              loading={ProductLoading}
            >
              {ListOfProducts.map((product) => (
                <Select.Option key={product.id} value={product.id}>
                  {`${product.name} (${product.code})`}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={copyLoading}>
                Copy Recipe
              </Button>
              <Button onClick={handleCopyCancel}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default ManageTemplates;
