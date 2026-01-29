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
import ProductionMenu from "../Production/ProductionMenu";
import SubMenuToggle from "../Common/SubMenuToggle";
import Config from "../../Config";
import axios from "axios";
import dayjs from "dayjs";
const ExcelJS = require("exceljs");

function ManageLocation(props) {
  const AccessKey = localStorage.getItem("AccessKey");
  const CompanyID = localStorage.getItem("CompanyID");
  const UserID = localStorage.getItem("ID");

  const [NominalAccount, setNominalAccount] = useState("");
  const [Type, setType] = useState("");
  const [date, setDate] = useState("");
  const [openDate, setOpenDate] = useState("");
  const [ListOfAccounts, setListOfAccounts] = useState([]);
  const [ListOfAccountsLoading, setListOfAccountsLoading] = useState(false);
  const [Category, setCategory] = useState([]);
  const [CategoryLoading, setCategoryLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [LocationID, setLocationID] = useState(0);
  const [CategoryForEdit, setCategoryForEdit] = useState({});
  const [CategoryForEditLoading, setCategoryForEditLoading] = useState(false);
  const [LocationName, setLocationName] = useState("");

  const onFinish = async (FormData) => {
    if (LocationID > 0) {
      const data = {
        ...CategoryForEdit,
        locationNamename: FormData.locationName,
        details: FormData.details,
      };

      try {
        const response = await axios.patch(
          Config.base_url + `Location/UpdateLocation/${LocationID}`,
          data,
          {
            headers: {
              Authorization: `Bearer ${AccessKey}`,
            },
          }
        );

        if (response.data.status_code === 1) {
          message.success(response.data.status_message);
          // Reset the form field
          CategoryForm.resetFields();
          fetchLocations();
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
        locationName: FormData.locationName,
        companyID: CompanyID,
        userID: UserID,
        details: FormData.details || "",
      };

      try {
        const response = await axios.post(
          Config.base_url + `Location/AddLocation`,
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
          fetchLocations();
        } else {
          message.error(response.data.status_message);
        }
      } catch (error) {
        message.error("Network Error..");
      } finally {
        setOpen(false);
      }
    }
  };

  const [form] = Form.useForm();
  const [CategoryForm] = Form.useForm();

  const fetchLocations = async () => {
    setCategoryLoading(true);
    try {
      const response = await axios.get(
        Config.base_url +
          `Location/GetLocations/${CompanyID}?locationName=${LocationName}`,
        {
          headers: {
            Authorization: `Bearer ${AccessKey}`,
          },
        }
      );
      ////Console.log(response);
      if (response.data.status_code === 1) {
        setCategory(response.data.data);
        setCategoryLoading(false);
      } else {
        setCategoryLoading(false);
      }
    } catch (error) {
      // console.error(error);
      setCategoryLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Manage Location";
    fetchLocations();
  }, [LocationName]);

  const handleFilters = (formData) => {
    setLocationName(formData["locationName"] || "");
  };

  const deleteLocation = async (sno) => {
    try {
      const accountToUpdate = Category.find((u) => u.id === sno);
      if (!accountToUpdate) {
        message.error("Location not found!");
        return;
      }

      // Prepare the updated account object
      const updatedAccount = {
        ...accountToUpdate,
        isActive: false,
        isDeleted: true,
      };

      // Send patch request to update the stock record
      const deleteCategory = await axios.patch(
        `${Config.base_url}Location/UpdateLocation/${sno}`,
        updatedAccount,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${AccessKey}`,
          },
        }
      );

      // Check if the stock was successfully deleted
      if (deleteCategory.data.status_code !== 1) {
        message.error("Failed to delete stock.");
        return;
      }

      message.success(deleteCategory.data.status_message);
      fetchLocations();
    } catch (error) {
      // console.error("Error deleting catgory:", error);
      message.error("Network Error..");
    }
  };

  const onReset = () => {
    form.resetFields();
    setLocationName("");
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
      title: "Location Name",
      dataIndex: "locationName",
      key: "locationName",
    },
    {
      title: "Location Code",
      dataIndex: "locationCode",
      key: "locationCode",
    },
    {
      title: "Details",
      dataIndex: "details",
      key: "details",
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
              setLocationID(record.id);
            }}
          >
            <EditOutlined />
          </NavLink>
          <Popconfirm
            title="Delete the task"
            description="Are you sure to delete this Location?"
            onConfirm={() => deleteLocation(record.id)}
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
    const sheet = workbook.addWorksheet("Locations List");

    // Set column headers and their widths
    sheet.columns = [
      { header: "Location Name", key: "locationName", width: 30 },
      { header: "Location Code", key: "locationCode", width: 15 },
      { header: "Details", key: "details", width: 30 },
    ];

    // Add rows to the sheet
    Category.forEach((locate, index) => {
      sheet.addRow({
        sr: index + 1,
        locationName: locate.locationName,
        locationCode: locate.locationCode,
        details: locate.details,
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
      anchor.download = `LocationsList_${dateString}.xlsx`;
      anchor.click();
      window.URL.revokeObjectURL(url);
    });
  };

  const sortedData = Category.sort((a, b) => {
    return b.locationCode.localeCompare(a.locationCode);
  });

  const handleCancel = () => {
    setOpen(false);
  };

  const fetchCatByID = async (ID) => {
    if (ID > 0) {
      setCategoryForEditLoading(true);
      try {
        const response = await axios.get(
          Config.base_url + `Location/GetLocationByID/${ID}/${CompanyID}`,
          {
            headers: {
              Authorization: `Bearer ${AccessKey}`,
            },
          }
        );
        if (response.data.status_code === 1) {
          setCategoryForEdit(response.data.location);
          setCategoryForEditLoading(false);
          CategoryForm.setFieldsValue({
            locationName: response.data.location.locationName,
            details: response.data.location.details,
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
        title="New Location"
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
              name="locationName"
              rules={[
                {
                  required: true,
                  message: "Please input the location name!",
                },
              ]}
            >
              <Input onFocus={(e) => e.target.select()} placeholder="Name" />
            </Form.Item>
            <Form.Item label="Location Code" name="locationCode">
              <Input disabled placeholder="Location Code" />
            </Form.Item>
            <Form.Item label="Details" name="details">
              <Input
                onFocus={(e) => e.target.select()}
                placeholder="Location Details Here"
              />
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
            <h3 className="page-title">Manage Locations</h3>
            <div className="header-actions">
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
                  setLocationID(0);
                  fetchCatByID(0);
                }}
              >
                New
              </Button>
            </div>
          </div>
          <div className="filters-wrap">
            <Form onFinish={handleFilters} form={form} layout="vertical">
              <Form.Item name="locationName">
                <Input placeholder="Location Name" />
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

export default ManageLocation;
