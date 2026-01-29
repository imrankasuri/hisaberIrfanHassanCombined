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
  Pagination,
} from "antd";
import React, { useEffect, useState } from "react";
import {
  PlusOutlined,
  DownloadOutlined,
  UploadOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { NavLink } from "react-router-dom";
import Config from "../../Config";
import SubMenuToggle from "../Common/SubMenuToggle";
import axios from "axios";
import AddCustomerModal from "../Common/AddCustomerModal";
import CustomerMenu from "./CustomerMenu";
import SalesMenu from "../Sales/SalesMenu";
const ExcelJS = require("exceljs");

function ManageCustomer() {
  const AccessKey = localStorage.getItem("AccessKey");
  const UserID = localStorage.getItem("ID");
  const CompanyID = localStorage.getItem("CompanyID");
  const FYear = localStorage.getItem("DefaultFYear");

  const [loading, setLoading] = useState(false);
  const [ListOfRecords, setListOfRecords] = useState([]);
  const [OrderBy, setOrderBy] = useState("");
  const [AccountNo, setAccountNo] = useState("");
  const [Email, setEmail] = useState("");
  const [Name, setName] = useState("");
  const [CustomerID, setCustomerID] = useState("");

  const [IsDeleted, setIsDeleted] = useState(false);
  const [CustomerLoading, setCustomerLoading] = useState(false);
  const [open, setOpen] = useState(false);
  // pagination
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [totalRecords, setTotalRecords] = useState(0);

  const [form] = Form.useForm();
  const [formMain] = Form.useForm();

  const fetchCustomer = async () => {
    setLoading(true);

    const api_config = {
      method: "get",
      url: `${Config.base_url}CustomerSupplier/GetCustomersBy/${CompanyID}?orderBy=${OrderBy}&businessName=${Name}&accountCode=${AccountNo}`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AccessKey}`,
      },
    };

    try {
      const response = await axios(api_config);
      if (response.data && response.data.status_code === 1) {
        setListOfRecords(response.data.listofCustomers || []);
        setTotalRecords(response.data.totalRecords || 0);
      } else {
        //message.error(response.data.status_message);
        setListOfRecords([]);
      }
    } catch (error) {
      message.error("Network Error..");
      setListOfRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Manage Customer";

    fetchCustomer();
  }, [OrderBy, AccountNo, Name]);

  const handleFilters = (formData) => {
    ////Console.log("Form Submitted with:", formData);

    // Update state with form data
    setName(formData["businessName"] || "");
    setOrderBy(formData["OrderBy"] || "");
    setAccountNo(formData["accountCode"] || "");
  };

  const columns = [
    {
      title: "Sr#",
      dataIndex: "",
      key: "SR",
      render: (_, record, index) => index + 1,
    },
    {
      title: "Customer Name",
      dataIndex: "businessName",
      key: "businessName",
      sorter: (a, b) => a.businessName.localeCompare(b.businessName),
    },
    {
      title: "Account No.",
      dataIndex: "",
      key: "accountNo",
      sorter: (a, b) => a.accountNo - b.accountNo,
      render: (text, record) => (
        <>
          {record.isSupplier && parseInt(record.accountCode) < 9000 ? (
            <>{record.accountNo} (S)</>
          ) : (
            <>
              {record.isSupplier && parseInt(record.accountCode) > 9000 ? (
                <>{record.accountNo} (C)</>
              ) : (
                <>{record.accountNo}</>
              )}
            </>
          )}
        </>
      ),
    },
    {
      title: "Contact",
      dataIndex: "",
      key: "phone",
      render: (text, record) => (
        <>
          {record.title ? (
            <>
              {record.title}. {record.firstName} {record.lastName}
            </>
          ) : (
            <>
              {record.firstName} {record.lastName}
            </>
          )}
        </>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Mobile",
      dataIndex: "mobile",
      key: "mobile",
    },
    {
      title: "Balance",
      dataIndex: "customerOpeningBalance",
      key: "customerOpeningBalance",
      sorter: (a, b) => a.customerOpeningBalance - b.customerOpeningBalance,
    },

    {
      title: "Actions",
      dataIndex: "Actions",
      key: "Actions",
      render: (_, record) => (
        <div className="table-actions">
          <NavLink
            className={"primary"}
            onClick={() => handleCustomerEdit(record.id)}
          >
            <EditOutlined />
          </NavLink>
          <Popconfirm
            title="Delete the task"
            description="Are you sure to delete this Customer?"
            onConfirm={(e) => handleDeleteCustomer(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <DeleteOutlined />
          </Popconfirm>
        </div>
      ),
    },
  ];

  const handleDeleteCustomer = async (ID) => {
    setLoading(true);

    try {
      setLoading(true);
      const data = {
        ID: ID,
      };
      const response = await axios.patch(
        `${Config.base_url}CustomerSupplier/DeleteRecord`,
        data,
        {
          headers: {
            Authorization: `Bearer ${AccessKey}`,
          },
        }
      );

      if (response.data.status_code === 1) {
        message.success(response.data.status_message);
        fetchCustomer();
        setLoading(false);
      } else {
        message.error(response.data.status_message);
        setLoading(false);
      }
    } catch (error) {
      message.error("Network Error..");
      setLoading(false);
    }
  };

  const handleCustomerEdit = (ID) => {
    setCustomerLoading(true);
    setCustomerID(ID);
    setOpen(true);
  };
  const onReset = () => {
    form.resetFields();
    setName("");
    setAccountNo("");
    setOrderBy("");
  };

  const handleOk = (FormData) => {
    setLoading(true);
    setOpen(false);
    setLoading(false);
  };
  const handleCancel = () => {
    setOpen(false);
  };

  const handleExport = () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Customers");

    // Set column headers and their widths
    sheet.columns = [
      { header: "A/C", key: "accountNo", width: 15 },
      { header: "BusinessName", key: "businessName", width: 30 },
      { header: "Title", key: "title", width: 10 },
      { header: "FirstName", key: "firstName", width: 30 },
      { header: "LastName", key: "lastName", width: 30 },
      { header: "Email", key: "email", width: 30 },
      { header: "Mobile", key: "mobile", width: 30 },
      { header: "OpeningBalance", key: "customerOpeningBalance", width: 20 },
      {
        header: "BaseOpeningBalance",
        key: "customerBaseOpeningBalance",
        width: 20,
      },
    ];

    // Add rows to the sheet
    ListOfRecords.forEach((customer, index) => {
      sheet.addRow({
        sr: index + 1,
        accountNo: customer.accountNo,
        businessName: customer.businessName,
        title: customer.title,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        mobile: customer.mobile,
        customerOpeningBalance: customer.customerOpeningBalance,
        customerBaseOpeningBalance: customer.customerBaseOpeningBalance,
      });
    });

    sheet.getColumn(1).eachCell((cell) => {
      cell.protection = { locked: true };
    });

    // Unlock all other columns
    sheet.columns.slice(1).forEach((col) => {
      col.eachCell((cell) => {
        cell.protection = { locked: false };
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
      anchor.download = `CustomersList_${dateString}.xlsx`;
      anchor.click();
      window.URL.revokeObjectURL(url);
    });
  };

  return (
    <>
      <AddCustomerModal
        show={open}
        handleOk={handleOk}
        handleCancel={handleCancel}
        loading={CustomerLoading}
        CustomerID={CustomerID}
      />
      <div id="sub-menu-wrap">
        <h5>Sales</h5>
        <SalesMenu />
      </div>
      <div className="right-side-contents">
        <div className="page-content">
          <div className="page-header">
            <SubMenuToggle />
            <h3 className="page-title">Manage Customer</h3>
            <div className="header-actions">
              <NavLink to="/customer/import">
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
              {/* <Button type="primary" onClick={() => setOpen(true)} icon={<PlusCircleIcon />}>
                New
              </Button> */}
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setOpen(true);
                  setCustomerID(null);
                }}
              >
                New
              </Button>
            </div>
          </div>
          <div className="filters-wrap">
            <Form onFinish={handleFilters} form={form} layout="vertical">
              <Form.Item name="businessName">
                <Select
                  showSearch
                  filterOption={(input, option) =>
                    option.label.toLowerCase().includes(input.toLowerCase())
                  }
                  placeholder="Customer"
                  style={{ width: "250px" }}
                  options={ListOfRecords.map((record) => ({
                    label: `${record.businessName} (${record.accountCode})`,
                    value: `${record.businessName} `,
                  }))}
                />
              </Form.Item>
              <Form.Item name="accountCode">
                <Input placeholder="Account No" />
              </Form.Item>

              <Button type="primary" htmlType="submit">
                Filter
              </Button>
              <Button onClick={onReset} type="link">
                Reset
              </Button>
            </Form>
          </div>

          <Table
            scroll={{
              x: "100%",
            }}
            columns={columns}
            dataSource={ListOfRecords}
            size="small"
            loading={loading}
            pagination={{ defaultPageSize: 20 }}
          />
        </div>
      </div>
    </>
  );
}

export default ManageCustomer;
