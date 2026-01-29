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
import AddSupplierModal from "../Common/AddSupplierModal";
import SupplierMenu from "./SupplierMenu";
import PurchaseMenu from "../Purchases/PurchaseMenu";
const ExcelJS = require("exceljs");

function ManageSupplier() {
  const AccessKey = localStorage.getItem("AccessKey");
  const UserID = localStorage.getItem("ID");
  const CompanyID = localStorage.getItem("CompanyID");
  const FYear = localStorage.getItem("DefaultFYear");

  const [loading, setLoading] = useState(false);
  const [ListOfRecords, setListOfRecords] = useState([]);
  const [OrderBy, setOrderBy] = useState("");
  const [Name, setName] = useState("");
  const [AccountCode, setAccountCode] = useState("");
  const [Level, setLevel] = useState("0");
  const [SupplierID, setSupplierID] = useState("");

  const [SupplierLoading, setSupplierLoading] = useState(false);
  const [open, setOpen] = useState(false);
  // pagination
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [totalRecords, setTotalRecords] = useState(0);

  const [form] = Form.useForm();
  const [formMain] = Form.useForm();

  const fetchSupplier = async () => {
    setLoading(true);

    const api_config = {
      method: "get",
      url: `${Config.base_url}CustomerSupplier/GetSuppliersBy/${CompanyID}?orderBy=${OrderBy}&businessName=${Name}&accountCode=${AccountCode}`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AccessKey}`,
      },
    };

    ////Console.log("Fetching data from URL:", api_config.url);

    try {
      const response = await axios(api_config);
      ////Console.log("API response:", response.data);

      if (response.data && response.data.status_code === 1) {
        setListOfRecords(response.data.listofSuppliers || []);
        setTotalRecords(response.data.totalRecords || 0);
        //message.success(response.data.status_message);
      } else {
        setListOfRecords([]);
        //message.error(response.data.status_message);
      }
    } catch (error) {
      message.error("Network Error..");
      setListOfRecords([]);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    document.title = "Manage Suppliers";

    fetchSupplier();
  }, [OrderBy, AccountCode, Name]);

  const handleFilters = (formData) => {
    setName(formData["businessName"] || "");
    setOrderBy(formData["OrderBy"] || "");
    setAccountCode(formData["accountCode"] || "");
  };

  const columns = [
    {
      title: "Sr#",
      dataIndex: "",
      key: "SR",
      render: (_, record, index) => index + 1,
    },
    {
      title: "Supplier Name",
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
              {record.isCustomer && parseInt(record.accountCode) > 9000 ? (
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
      dataIndex: "supplierOpeningBalance",
      key: "supplierOpeningBalance",
      sorter: (a, b) => a.supplierOpeningBalance - b.supplierOpeningBalance,
    },

    {
      title: "Actions",
      dataIndex: "Actions",
      key: "Actions",
      render: (_, record) => (
        <div className="table-actions">
          <NavLink
            className={"primary"}
            htmlType="button"
            onClick={() => handleSupplierEdit(record.id)}
          >
            <EditOutlined />
          </NavLink>
          <Popconfirm
            title="Delete the task"
            description="Are you sure to delete this Supplier?"
            onConfirm={(e) => handleDeleteSupplier(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <DeleteOutlined />
          </Popconfirm>
        </div>
      ),
    },
  ];

  const handleDeleteSupplier = async (ID) => {
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
        fetchSupplier();
        setLoading(false);
      } else {
        message.error(response.data.status_message);
        setLoading(false);
      }
    } catch (error) {
      // message.error(response.data.status_message);
      setLoading(false);
    }
  };

  const handleSupplierEdit = (ID) => {
    setSupplierLoading(true);
    setSupplierID(ID);
    setOpen(true);
  };
  const onReset = () => {
    form.resetFields();
    setName("");
    setAccountCode("");
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
    const sheet = workbook.addWorksheet("Suppliers");

    // Set column headers and their widths
    sheet.columns = [
      { header: "A/C No", key: "accountNo", width: 15 },
      { header: "SupplierName", key: "businessName", width: 30 },
      { header: "Title", key: "title", width: 10 },
      { header: "FirstName", key: "firstName", width: 30 },
      { header: "LastName", key: "lastName", width: 30 },
      { header: "Email", key: "email", width: 30 },
      { header: "Mobile", key: "mobile", width: 30 },
      { header: "OpeningBalance", key: "supplierOpeningBalance", width: 10 },
      {
        header: "BaseOpeningBalance",
        key: "supplierBaseOpeningBalance",
        width: 10,
      },
    ];

    // Add rows to the sheet
    ListOfRecords.forEach((supplier, index) => {
      sheet.addRow({
        sr: index + 1,
        accountNo: supplier.accountNo,
        businessName: supplier.businessName,
        title: supplier.title,
        firstName: supplier.firstName,
        lastName: supplier.lastName,
        email: supplier.email,
        mobile: supplier.mobile,
        supplierOpeningBalance: supplier.supplierOpeningBalance,
        supplierBaseOpeningBalance: supplier.supplierBaseOpeningBalance,
      });
    });

    sheet.getColumn(1).eachCell((cell) => {
      cell.protection = { locked: true };
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
      anchor.download = `SuppliersList_${dateString}.xlsx`;
      anchor.click();
      window.URL.revokeObjectURL(url);
    });
  };

  return (
    <>
      {/* show={show} handleClose={handleClose} */}
      <AddSupplierModal
        show={open}
        handleOk={handleOk}
        handleCancel={handleCancel}
        loading={SupplierLoading}
        SupplierID={SupplierID}
      />
      <div id="sub-menu-wrap">
        <h5>Purchases</h5>
        <PurchaseMenu />
      </div>
      <div className="right-side-contents">
        <div className="page-content">
          <div className="page-header">
            <SubMenuToggle />
            <h3 className="page-title">Manage Supplier</h3>
            <div className="header-actions">
              <NavLink to="/supplier/import">
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
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setSupplierID(null);
                  setOpen(true);
                }}
              >
                New
              </Button>
            </div>
          </div>
          <div className="filters-wrap">
            <Form onFinish={handleFilters} form={form}>
              <Form.Item name="businessName">
                <Select
                  showSearch
                  filterOption={(input, option) =>
                    option.label.toLowerCase().includes(input.toLowerCase())
                  }
                  placeholder="Supplier"
                  style={{ width: "250px" }}
                  options={ListOfRecords.map((record) => ({
                    label: `${record.businessName}`,
                    value: `${record.businessName}`,
                  }))}
                />
              </Form.Item>
              <Form.Item name="accountCode">
                <Input placeholder="Account No" />
              </Form.Item>

              <Button htmlType="submit" type="primary">
                Filter
              </Button>
              <Button htmlType="button" onClick={onReset} type="link">
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

export default ManageSupplier;
