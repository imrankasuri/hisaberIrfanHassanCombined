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
  Badge,
  DatePicker,
  Flex,
  Spin,
} from "antd";
import React, { useEffect, useRef, useState } from "react";
import {
  PlusOutlined,
  DownloadOutlined,
  UploadOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

import { Link, NavLink } from "react-router-dom";
import Config from "../../Config";
import SubMenuToggle from "../Common/SubMenuToggle";
import axios from "axios";
import dayjs from "dayjs";
import moment from "moment";
import { QueueListIcon } from "@heroicons/react/24/outline";
import PurchaseMenu from "./PurchaseMenu";
import BadgeComponent from "../Common/Badge";
import SuppliersDropdown from "../Shared/SuppliersDropdown";
const ExcelJS = require("exceljs");

function Bills() {
  const AccessKey = localStorage.getItem("AccessKey");
  const UserID = localStorage.getItem("ID");
  const CompanyID = localStorage.getItem("CompanyID");
  const FYear = localStorage.getItem("DefaultFYear");

  const [loading, setLoading] = useState(false);
  const [ListOfRecords, setListOfRecords] = useState([]);
  const [OrderBy, setOrderBy] = useState("");
  const [Name, setName] = useState("");
  const [BillID, setBillID] = useState(0);
  const [Type, setType] = useState("");
  const [BillNo, setBillNo] = useState("");
  const [Date, setDate] = useState(null);
  // pagination
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [TotalRecords, setTotalRecords] = useState(0);
  const [OpenDate, setOpenDate] = useState(null);
  const [InCompleteBills, setInCompleteBills] = useState(0);
  const [supplierLoading, setSupplierLoading] = useState(false);
  const [supplierList, setSupplierList] = useState([]);

  const [form] = Form.useForm();
  const [formMain] = Form.useForm();

  const onShowSizeChange = (current, pageSize) => {
    setPageNumber(current);
    setPageSize(pageSize);
  };

  const onPageChange = (newPageNumber, newPageSize) => {
    setPageNumber(newPageNumber);
    setPageSize(newPageSize);
  };

  const fetchPurchases = async () => {
    setLoading(true);
    const data = {
      CompanyID: CompanyID,
      AccountName: Name,
      BillID: BillID,
      OrderBy: OrderBy,
      Type: Type,
      DocNo: BillNo,
      PageSize: pageSize,
      PageNo: pageNumber,
      Date: Date,
      //InComplete: true,
    };
    const api_config = {
      method: "post",
      url: `${Config.base_url}Purchase/GetPurchases`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AccessKey}`,
      },
      data: data,
    };
    ////Console.log(data);
    try {
      const response = await axios(api_config);
      ////Console.log(response.data);
      if (response.data.status_code === 1) {
        setListOfRecords(response.data.listOfPurchases);
        setTotalRecords(response.data.totalRecords);
        setLoading(false);
      } else {
        setListOfRecords([]);
        setLoading(false);
        //message.error(response.data.status_message);
      }
    } catch (error) {
      ////console.error("Error fetching data:", error);
      message.error("Network Error..");
      setListOfRecords([]);
      setLoading(false);
    }
  };

  const fetchIncompleteBills = async () => {
    setLoading(true);
    const data = {
      CompanyID: CompanyID,
      AccountName: Name,
      BillID: BillID,
      OrderBy: OrderBy,
      Type: Type,
      PageSize: 100000,
      PageNo: pageNumber,
      Date: Date,
      InComplete: true,
    };

    const api_config = {
      method: "post",
      url: `${Config.base_url}Purchase/GetPurchases`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AccessKey}`,
      },
      data: data,
    };

    try {
      const response = await axios(api_config);
      ////Console.log(response);
      if (response.data.status_code === 1) {
        const filteredRecords = (response.data.listOfPurchases || []).filter(
          (record) => record.inComplete === true
        );
        setInCompleteBills(filteredRecords.length);
      } else {
        setInCompleteBills(0);
      }
    } catch (error) {
      message.error("Network Error..");
      setInCompleteBills(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Supplier Bills";
    // fetchSales();
    fetchPurchases();
    fetchIncompleteBills();
    fetchSupplier();
  }, [OrderBy, BillID, Name, Type, BillNo, Date, pageNumber, pageSize]);

  const fetchSupplier = async () => {
    setSupplierLoading(true);
    try {
      const response = await SuppliersDropdown();
      if (response != null) {
        setSupplierList(response);
      }
    } catch (error) {
      // //console.error(error);
    } finally {
      setSupplierLoading(false);
    }
  };

  const supplier = supplierList.map((record) => ({
    label: `${record.businessName.trim()} (${
      record.isSupplier && parseInt(record.accountCode) < 9000
        ? record.accountNo + " (S)"
        : record.isCustomer && parseInt(record.accountCode) > 9000
        ? record.accountNo + " (C)"
        : record.accountNo
    })`.trim(),
    value: record.businessName.trim(),
  }));

  const handleFilters = (formData) => {
    //////Console.log("Form Data Submitted:", formData);
    setBillID(formData["billId"]);
    setName(formData["supplierName"] || "");
    setOrderBy(formData["OrderBy"] || "");
    setType(formData["purchaseType"] || "");
    setBillNo(formData["billNo"] || "");
    setDate(OpenDate);
    setPageNumber(1);
    setPageSize(100000);
    //////Console.log("Type State after set:", formData["purchaseType"]);
    // fetchAccounts();
  };

  const columns = [
    {
      title: "Sr#",
      dataIndex: "",
      key: "SR",
      render: (_, record, index) => (
        <span style={{ color: record.inComplete ? "#ff4d4f" : "inherit" }}>
          {index + 1}
        </span>
      ),
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
      render: (text, record) => (
        <span style={{ color: record.inComplete ? "#ff4d4f" : "inherit" }}>
          {text}
        </span>
      ),
    },

    {
      title: "A/C No.",
      dataIndex: "supplierAccountCode",
      key: "supplierAccountCode",
      sorter: (a, b) => a.supplierAccountCode - b.supplierAccountCode,
      render: (text, record) => (
        <span style={{ color: record.inComplete ? "#ff4d4f" : "inherit" }}>
          {text}
        </span>
      ),
    },

    {
      title: "Supplier",
      dataIndex: "supplierName",
      key: "supplierName",
      sorter: (a, b) => a.supplierName.localeCompare(b.supplierName),
      render: (text, record) => (
        <>
          <>
            <NavLink
              className={"primary"}
              to={`/supplier/report?source=${record.supplierAccountCode}`}
            >
              {record.supplierName.split(" (")[0]}
            </NavLink>
          </>
        </>
      ),
    },

    {
      title: "Type",
      dataIndex: "purchaseType",
      key: "purchaseType",
      sorter: (a, b) => a.purchaseType.localeCompare(b.purchaseType),
      render: (text, record) => (
        <span style={{ color: record.inComplete ? "#ff4d4f" : "inherit" }}>
          {text}
        </span>
      ),
    },

    {
      title: "Bill Id",
      dataIndex: "billID",
      key: "billID",
      sorter: (a, b) => a.billID - b.billID,
      render: (text, record) =>
        record.billNumber !== "SOP" ? (
          <NavLink
            className={record.inComplete ? "primary incomplete" : "primary"}
            style={{ color: record.inComplete ? "#ff4d4f" : "blue" }}
            to={
              record.purchaseType === "Bill"
                ? `/purchases/purchase-bills/edit-purchase-bill/${record.billID}`
                : `/purchases/purchase-bills/edit-credit-bill/${record.billID}`
            }
          >
            {record.billID}
          </NavLink>
        ) : (
          <span style={{ color: record.inComplete ? "#ff4d4f" : "blue" }}>
            {record.billID}
          </span>
        ),
    },

    {
      title: "Bill No.",
      dataIndex: "billNumber",
      key: "billNumber",
      sorter: (a, b) => a.billNumber - b.billNumber,
      render: (text, record) => (
        <span style={{ color: record.inComplete ? "#ff4d4f" : "inherit" }}>
          {text}
        </span>
      ),
    },

    {
      title: "Total",
      dataIndex: "",
      key: "total",
      sorter: (a, b) => a.total - b.total,
      render: (text, record) => (
        <span style={{ color: record.inComplete ? "#ff4d4f" : "inherit" }}>
          {record.purchaseType === "Bill" ? record.total : -record.total}
        </span>
      ),
    },

    {
      title: "Balance",
      dataIndex: "",
      key: "balance",
      sorter: (a, b) => a.balance - b.balance,
      render: (text, record) => (
        <span style={{ color: record.inComplete ? "#ff4d4f" : "inherit" }}>
          {record.purchaseType === "Bill" ? record.balance : -record.balance}
        </span>
      ),
    },
    {
      title: "Actions",
      dataIndex: "Actions",
      key: "Actions",
      render: (_, record) =>
        record.billNumber !== "SOP" ? (
          <div className="table-actions">
            <NavLink
              className={record.inComplete ? "primary incomplete" : "primary"}
              style={{ color: record.inComplete ? "#ff4d4f" : "inherit" }}
              to={
                record.purchaseType === "Bill"
                  ? `/purchases/purchase-bills/edit-purchase-bill/${record.billID}`
                  : `/purchases/purchase-bills/edit-credit-bill/${record.billID}`
              }
            >
              <EditOutlined />
            </NavLink>
            <Popconfirm
              title="Delete the task"
              description="Are you sure to delete this account?"
              onConfirm={() => handleDeletePurchase(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <DeleteOutlined
                style={{ color: record.inComplete ? "#ff4d4f" : "inherit" }}
              />
            </Popconfirm>
          </div>
        ) : (
          ""
        ),
    },
  ];

  const handleDeletePurchase = async (sno) => {
    setLoading(true);
    try {
      const data = {
        ID: sno,
        CompanyID: CompanyID,
      };
      const response = await axios.patch(
        `${Config.base_url}Purchase/DeletePurchase`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
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
      ////Console.log(error);
      message.error("Network Error..");
      setLoading(false);
    }
    fetchPurchases();
  };

  const onReset = () => {
    form.resetFields();
    setType("");
    setBillNo("");
    setBillID(0);
    setName("");
    setDate(null);
    setOrderBy("");
    setOpenDate(null);
    setPageNumber(1);
    setPageSize(20);
  };

  const items = [
    {
      key: "1",
      label: (
        <Link to={`/purchases/purchase-bills/add-purchase-bills`}>
          Supplier Bill (VI)
        </Link>
      ),
    },
    {
      key: "2",
      label: (
        <Link to={`/purchases/purchase-bills/add-credit-bill`}>
          Bill Return (VC)
        </Link>
      ),
    },
    {
      key: "3",
      label: (
        <Link to={`/purchases/purchase-bills/batch-bill`}>Batch Bill (VI)</Link>
      ),
    },
    // {
    //     key: "4",
    //     label: (
    //         <Link to={`/sales/sales-invoices/bulk-invoicing`}>
    //             Bank Invoice (SI)
    //         </Link>
    //     ),
    // },
  ];

  const handleExport = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Sales");

    const data = {
      CompanyID: CompanyID,
      AccountName: Name,
      BillID: BillID,
      OrderBy: OrderBy,
      Type: Type,
      PageSize: 100000,
      PageNo: 1,
      Date: Date,
      InComplete: false,
    };
    const api_config = {
      method: "post",
      url: `${Config.base_url}Purchase/GetPurchases`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AccessKey}`,
      },
      data: data,
    };

    try {
      const response = await axios(api_config);
      if (response.data && response.data.status_code === 1) {
        const ExportData = response.data.listOfPurchases || [];

        // Set column headers and their widths
        sheet.columns = [
          { header: "Sr#", key: "sr", width: 10 },
          { header: "Date", key: "date", width: 20 },
          { header: "Account Number", key: "supplierAccountCode", width: 30 },
          { header: "Supplier Name", key: "supplierName", width: 30 },
          { header: "Type", key: "purchaseType", width: 20 },
          { header: "Bill Id", key: "billID", width: 20 },
          { header: "Bill Number", key: "billNumber", width: 20 },
          { header: "Total", key: "total", width: 15 },
          { header: "Balance", key: "balance", width: 15 },
        ];

        // Add rows to the sheet
        ExportData.forEach((purchases, index) => {
          sheet.addRow({
            sr: index + 1,
            date: purchases.date,
            supplierAccountCode: purchases.supplierAccountCode,
            supplierName: purchases.supplierName,
            purchaseType: purchases.purchaseType,
            billID: purchases.billID,
            billNumber: purchases.billNumber,
            total: purchases.total,
            balance: purchases.balance,
          });
        });

        const now = new window.Date();
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
          anchor.download = `PurchasesList_${dateString}.xlsx`;
          anchor.click();
          window.URL.revokeObjectURL(url);
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setListOfRecords([]);
    }
  };

  const handleDateChange = (e, value) => {
    setOpenDate(value);
  };

  return (
    <>
      <div id="sub-menu-wrap">
        <h5>Purchases</h5>
        <PurchaseMenu />
      </div>
      <div className="right-side-contents">
        <div className="page-content">
          <div className="page-header">
            <SubMenuToggle />
            <h3 className="page-title">Supplier Bills</h3>
            <div className="header-actions">
              <NavLink to="/purchases/supplier-bill/import">
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
              <Dropdown
                menu={{
                  items,
                }}
                placement="bottomLeft"
                arrow
              >
                <Button type="primary" icon={<PlusOutlined />}>
                  New
                </Button>
              </Dropdown>
            </div>
          </div>
          <div className="filters-wrap">
            <Form onFinish={handleFilters} form={form}>
              <Form.Item name="purchaseType">
                <Select placeholder="Type" style={{ width: 120 }}>
                  <Select.Option value="">All Types</Select.Option>
                  <Select.Option value="Credit">Credit</Select.Option>
                  <Select.Option value="Bill">Bill</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item name="supplierName">
                <Select
                  showSearch
                  filterOption={(input, option) =>
                    option.label.toLowerCase().includes(input.toLowerCase())
                  }
                  placeholder="Supplier"
                  style={{ width: "250px" }}
                  options={supplier}
                  notFoundContent={
                    supplierLoading ? <Spin size="small" /> : null
                  }
                />
              </Form.Item>
              <Form.Item name="billId">
                <Input
                  onFocus={(e) => e.target.select()}
                  placeholder="Bill ID"
                />
              </Form.Item>
              <Form.Item name="billNo">
                <Input
                  onFocus={(e) => e.target.select()}
                  placeholder="Bill Number"
                />
              </Form.Item>
              <Form.Item name="date">
                <DatePicker
                  format="YYYY-MM-DD"
                  onChange={handleDateChange}
                  placeholder="Date"
                  style={{ width: "100%" }}
                />
              </Form.Item>

              <Button htmlType="submit" type="primary">
                Filter
              </Button>
              <Button htmlType="button" onClick={onReset} type="link">
                Reset
              </Button>
              <div className="incomplete-badge">
                <BadgeComponent
                  text="Bills"
                  link="/purchases/incomplete-purchase-bills"
                  count={InCompleteBills}
                />
              </div>
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
            pagination={false}
          />
          <div style={{ margin: "50px 0" }}>
            <Pagination
              align="end"
              showSizeChanger
              size="small"
              onShowSizeChange={onShowSizeChange}
              onChange={onPageChange}
              pageSizeOptions={["10", "50", "100", "500", "1000"]}
              current={pageNumber}
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
    </>
  );
}

export default Bills;
