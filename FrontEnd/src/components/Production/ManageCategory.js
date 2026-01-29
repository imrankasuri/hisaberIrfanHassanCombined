import {
  Form,
  Input,
  Select,
  Table,
  Button,
  Popconfirm,
  message,
  DatePicker,
  Spin,
  Modal,
  Skeleton,
} from "antd";
import React, { useEffect, useState } from "react";
import {
  PlusOutlined,
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
  StockOutlined,
} from "@ant-design/icons";
import { NavLink } from "react-router-dom";
import ProductionMenu from "./ProductionMenu";
import SubMenuToggle from "../Common/SubMenuToggle";
import Config from "../../Config";
import axios from "axios";
import dayjs from "dayjs";
import BankModeDropdown from "../Shared/BankModeDropdown";
import BankModeDropdownByID from "../Shared/BankModeDropdownByID";
import AddDropdowndata from "../Shared/AddDropdowndata";
const ExcelJS = require("exceljs");

function ManageCategory(props) {
  const AccessKey = localStorage.getItem("AccessKey");
  const CompanyID = localStorage.getItem("CompanyID");

  const [Category, setCategory] = useState([]);
  const [CategoryLoading, setCategoryLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [CategoryID, setCategoryID] = useState(0);
  const [CategoryForEdit, setCategoryForEdit] = useState({});
  const [CategoryForEditLoading, setCategoryForEditLoading] = useState(false);

  const onFinish = async (FormData) => {
    if (CategoryID > 0) {
      const data = {
        ...CategoryForEdit,
        name: FormData.categoryName,
        shortName: FormData.shortName,
      };

      try {
        const response = await axios.patch(
          Config.base_url + `DropdownData/UpdateRecord/${CategoryID}`,
          data,
          {
            headers: {
              Authorization: `Bearer ${AccessKey}`,
            },
          }
        );

        if (response.data.status_code === 1) {
          message.success(response.data.status_message);
          CategoryForm.resetFields();
          fetchCategories();
        } else {
          message.error(response.data.status_message);
        }
      } catch (error) {
        message.error("Network Error..");
      } finally {
        setOpen(false);
      }
    } else {
      const data = {
        ...FormData,
        name: FormData.categoryName,
        type: "ProductCategory",
        isActive: true,
        isDeleted: false,
        companyID: CompanyID,
        shortName: FormData.shortName,
      };

      try {
        const response = await AddDropdowndata(data, "ProductCategory");

        if (response) {
          CategoryForm.resetFields();
          fetchCategories();
        }
      } catch (error) {
        message.error("Network Error..");
      } finally {
        setOpen(false);
      }
    }
  };

  const [CategoryForm] = Form.useForm();

  const fetchCategories = async () => {
    setCategoryLoading(true);
    try {
      const response = await BankModeDropdown(CompanyID, "ProductCategory");
      if (response) {
        setCategory(response);
        setCategoryLoading(false);
      }
    } catch (error) {
      // console.error(error);
      setCategoryLoading(false);
    }
  };


  useEffect(() => {
    document.title = "Manage Category";
    fetchCategories();
  }, []);


  const deleteCategory = async (sno) => {
    try {
      const updatedAccount = {
        ID: sno,
        CompanyID: CompanyID
      };

      const response = await axios.patch(
        `${Config.base_url}DropdownData/DeleteRecord`,
        updatedAccount,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${AccessKey}`,
          },
        }
      );

      if (response.data.status_code == 1) {

        message.success(response.data.status_message);

        fetchCategories();
      }
      else {
        message.error(response.data.status_message);
      }

    } catch (error) {
      // console.error("Error deleting catgory:", error);
      message.error("Network Error..");
    }
  };

  const columns = [
    {
      title: "Sr#",
      dataIndex: "",
      key: "SR",
      render: (_, record, index) => index + 1,
    },
    {
      title: "Category Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Short Name",
      dataIndex: "shortName",
      key: "shortName",
    },
    {
      title: "Action",
      dataIndex: "Actions",
      key: "Actions",
      render: (_, record) => (
        <div className="table-actions">
          <NavLink
            type="primary"
            onClick={() => {
              setOpen(true);
              fetchCatByID(record.id);
              setCategoryID(record.id);
            }}
          >
            <EditOutlined />
          </NavLink>
          <Popconfirm
            title="Delete the task"
            description="Are you sure to delete this category?"
            onConfirm={() => deleteCategory(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <DeleteOutlined />
          </Popconfirm>
        </div>
      ),
    },
  ];

  const handleExport = () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Stock Adjustment");

    // Set column headers and their widths
    sheet.columns = [
      { header: "Category Name", key: "name", width: 30 },
      { header: "Short Code", key: "shortName", width: 30 },
    ];

    // Add rows to the sheet
    Category.forEach((stock, index) => {
      sheet.addRow({
        sr: index + 1,
        name: stock.name,
        shortName: stock.shortName,
      });
    });

    const now = new Date();
    const dateString = now
      .toLocaleString("sv-SE", { timeZoneName: "short" }) // Format: YYYY-MM-DD HH:mm:ss
      .replace(/[^0-9]/g, ""); // Remove special characters like : and space

    // Generate the Excel file and prompt the user to download it
    workbook.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `CategoriesList_${dateString}.xlsx`;
      anchor.click();
      window.URL.revokeObjectURL(url);
    });
  };

  const sortedData = Category.sort((a, b) => {
    if (a.code < b.code) return 1;
    if (a.code > b.code) return -1;
    return 0;
  });

  const handleCancel = () => {
    setOpen(false);
  };

  const fetchCatByID = async (ID) => {
    if (ID > 0) {
      setCategoryForEditLoading(true);
      try {
        const response = await BankModeDropdownByID(CompanyID, ID);
        if (response) {
          setCategoryForEdit(response);
          setCategoryForEditLoading(false);
          CategoryForm.setFieldsValue({
            categoryName: response.name,
            shortName: response.shortName,
          });
        }
      } catch (error) {
        // console.error(error);
        setCategoryForEditLoading(false);
      }
    } else {
      CategoryForm.resetFields();
    }
  };

  return (
    <>
      <Modal
        title="New Category"
        open={open}
        onCancel={handleCancel}
        footer={null}
      >
        {CategoryForEditLoading ? (
          <>
            <Skeleton active />
            <Skeleton active />
            <Skeleton active />
          </>
        ) : (
          <Form layout="vertical" form={CategoryForm} onFinish={onFinish}>
            <Form.Item
              label="Name"
              name="categoryName"
              rules={[
                {
                  required: true,
                  message: "Please input the category name!",
                },
              ]}
            >
              <Input onFocus={(e) => e.target.select()} placeholder="Name" />
            </Form.Item>
            <Form.Item
              label="Short Code"
              name="shortName"
              rules={[
                {
                  required: true,
                  message: "Please input the short code!",
                },
              ]}
            >
              <Input onFocus={(e) => e.target.select()} placeholder="Name" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Save
              </Button>
              <Button
                type="default"
                style={{ marginLeft: "8px" }}
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </Form.Item>
          </Form>
        )}
      </Modal>

      <div id="sub-menu-wrap">
        <h5>Production</h5>
        <ProductionMenu />
      </div>
      <div className="right-side-contents">
        <div className="page-content">
          <div className="page-header">
            <SubMenuToggle />
            <h3 className="page-title">Manage Category</h3>
            <div className="header-actions">
              {/* <NavLink to="/stock-adjustment/import">
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
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setOpen(true);
                  setCategoryID(0);
                  fetchCatByID(0);
                }}
              >
                New
              </Button>
            </div>
          </div>

          <Table
            scroll={{
              x: "100%"
            }}
            columns={columns}
            dataSource={sortedData}
            size="small"
            loading={CategoryLoading}
            pagination={{ pageSize: 20 }}
          />
        </div>
      </div>
    </>
  );
}

export default ManageCategory;
