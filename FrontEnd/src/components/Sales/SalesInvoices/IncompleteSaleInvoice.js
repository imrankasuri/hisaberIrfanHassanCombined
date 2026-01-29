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
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

import { Link, NavLink } from "react-router-dom";
import SalesMenu from "./../SalesMenu";
import Config from "../../../Config";
import SubMenuToggle from "../../Common/SubMenuToggle";
import CustomerDropdown from "../../Shared/CustomerDropdown";
import axios from "axios";
import dayjs from "dayjs";
import moment from "moment";
import { QueueListIcon } from "@heroicons/react/24/outline";

const ExcelJS = require("exceljs");

function IncompleteSaleInvoice() {
  const AccessKey = localStorage.getItem("AccessKey");
  const UserID = localStorage.getItem("ID");
  const CompanyID = localStorage.getItem("CompanyID");
  const FYear = localStorage.getItem("DefaultFYear");

  const [loading, setLoading] = useState(false);
  const [ListOfRecords, setListOfRecords] = useState([]);
  const [OrderBy, setOrderBy] = useState("");
  const [Name, setName] = useState("");
  const [InvoiceNo, setInvoiceNo] = useState(0);
  const [Type, setType] = useState("");
  const [Date, setDate] = useState(null);
  const [CustomerID, setCustomerID] = useState("");
  const [customerList, setCustomerList] = useState([]);

  const [IsDeleted, setIsDeleted] = useState(false);
  const [CustomerLoading, setCustomerLoading] = useState(false);
  const [open, setOpen] = useState(false);
  // pagination
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [OpenDate, setOpenDate] = useState(null);
  const [IncompleteSale, setIncompleteSale] = useState(0);

  const [form] = Form.useForm();
  const [formMain] = Form.useForm();

  const fetchSales = async () => {
    setLoading(true);

    const data = {
      CompanyID: CompanyID,
      AccountName: Name,
      InvoiceNo: InvoiceNo,
      OrderBy: OrderBy,
      Type: Type,
      PageSize: 10000,
      PageNo: pageNo,
      Date: Date,
      Email: "InComplete",
      inComplete: true,
    };

    const api_config = {
      method: "post",
      url: `${Config.base_url}Sales/GetSales`,
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
        const filteredRecords = (response.data.listOfSales || []).filter(
          (record) => record.inComplete === true
        );
        setListOfRecords(filteredRecords);
      } else {
        setListOfRecords([]);
      }
    } catch (error) {
      setListOfRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Incomplete Sales Invoices";
    fetchSales();
    fetchCustomers();
  }, [OrderBy, InvoiceNo, Name, Type, Date]);

  const fetchCustomers = async () => {
    setCustomerLoading(true);
    try {
      const response = await CustomerDropdown();
      if (response != null) {
        setCustomerList(response);
      }
    } catch (error) {
      // //console.error(error);
    } finally {
      setCustomerLoading(false);
    }
  };

  const customer = customerList.map((record) => ({
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
    setInvoiceNo(formData["invoiceNo"]);
    setName(formData["customerName"] || "");
    setOrderBy(formData["OrderBy"] || "");
    setType(formData["saleType"] || "");
    setDate(OpenDate);
    //////Console.log("Type State after set:", formData["saleType"]);
    // fetchAccounts();
  };

  const columns = [
    {
      title: "Sr#",
      dataIndex: "",
      key: "SR",
      render: (_, record, index) => index + 1,
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },

    {
      title: "A/C No.",
      dataIndex: "customerAccountCode",
      key: "customerAccountCode",
    },

    {
      title: "Customer",
      dataIndex: "customerName",
      key: "customerName",
      render: (text, record) => record.customerName.split("(")[0],
    },

    {
      title: "Type",
      dataIndex: "saleType",
      key: "saleType",
    },

    {
      title: "Inv. No.",
      dataIndex: "invoiceNo",
      key: "invoiceNo",
      render: (text, record) => (
        <>
          <>
            <NavLink
              className={"primary"}
              to={
                record.saleType === "Invoice"
                  ? `/sales/sales-invoices/edit-sales-invoices/${record.invoiceNo}`
                  : `/sales/sales-invoices/edit-credit-note/${record.invoiceNo}`
              }
            >
              {record.invoiceNo}
            </NavLink>
          </>
        </>
      ),
    },

    {
      title: "Doc No.",
      dataIndex: "docNo",
      key: "docNo",
    },

    {
      title: "Total",
      dataIndex: "",
      key: "total",
      render: (text, record) => (
        <>
          {record.saleType === "Invoice" ? (
            <>{record.total}</>
          ) : (
            <>{-record.total}</>
          )}
        </>
      ),
    },

    {
      title: "Balance",
      dataIndex: "",
      key: "balance",
      render: (text, record) => (
        <>
          {record.saleType === "Invoice" ? (
            <>{record.balance}</>
          ) : (
            <>{-record.balance}</>
          )}
        </>
      ),
    },
    {
      title: "Actions",
      dataIndex: "Actions",
      key: "Actions",
      render: (_, record) => (
        <div className="table-actions">
          <NavLink
            className={"primary"}
            to={
              record.saleType === "Invoice"
                ? `/sales/sales-invoices/edit-sales-invoices/${record.invoiceNo}`
                : `/sales/sales-invoices/edit-credit-note/${record.invoiceNo}`
            }
          >
            <EditOutlined />
          </NavLink>
          <Popconfirm
            title="Delete the task"
            description="Are you sure to delete this account?"
            onConfirm={() => handleDeleteSale(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <DeleteOutlined />
          </Popconfirm>
        </div>
      ),
    },
  ];

  const handleDeleteSale = async (sno) => {
    setLoading(true);
    try {
      const data = {
        ID: sno,
        CompanyID: CompanyID,
      };
      const response = await axios.patch(
        `${Config.base_url}Sales/DeleteSale`,
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
      //////Console.log(error);
      message.error("Network Error..");
      setLoading(false);
    }
    fetchSales();
  };

  const onReset = () => {
    form.resetFields();
    setType("");
    setInvoiceNo(0);
    setName("");
    setDate(null);
    setOrderBy("");
    setOpenDate(null);
  };

  const items = [
    {
      key: "1",
      label: (
        <Link to={`/sales/sales-invoices/add-sales-invoices`}>
          Sales Invoice (SI)
        </Link>
      ),
    },
    {
      key: "2",
      label: (
        <Link to={`/sales/sales-invoices/add-credit-note`}>
          Credit Note (SC)
        </Link>
      ),
    },
    {
      key: "3",
      label: (
        <Link to={`/sales/sales-invoices/batch-invoice`}>
          Batch Invoice (SI)
        </Link>
      ),
    },
    {
      key: "4",
      label: (
        <Link to={`/sales/sales-invoices/bulk-invoicing`}>
          Bank Invoice (SI)
        </Link>
      ),
    },
  ];

  const handleExport = () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Sales");

    // Set column headers and their widths
    sheet.columns = [
      { header: "Sr#", key: "sr", width: 10 },
      { header: "Date", key: "date", width: 20 },
      { header: "Account Number", key: "customerAccountCode", width: 30 },
      { header: "Customer Name", key: "customerName", width: 30 },
      { header: "Type", key: "saleType", width: 20 },
      { header: "Invoice Number", key: "invoiceNo", width: 20 },
      { header: "Doc No", key: "docNo", width: 20 },
      { header: "Total", key: "total", width: 15 },
      { header: "Balance", key: "balance", width: 15 },
    ];

    // Add rows to the sheet
    ListOfRecords.forEach((sales, index) => {
      sheet.addRow({
        sr: index + 1,
        date: sales.date,
        customerAccountCode: sales.customerAccountCode,
        customerName: sales.customerName,
        saleType: sales.saleType,
        invoiceNo: sales.invoiceNo,
        docNo: sales.docNo,
        total: sales.total,
        balance: sales.balance,
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
      anchor.download = `IncompleteSalesList_${dateString}.xlsx`;
      anchor.click();
      window.URL.revokeObjectURL(url);
    });
  };

  const handleDateChange = (e, value) => {
    setOpenDate(value);
  };

  const sortedData = ListOfRecords.sort(
    (a, b) => dayjs(b.date).unix() - dayjs(a.date).unix()
  );

  return (
    <>
      <div id="sub-menu-wrap">
        <h5>Sales</h5>
        <SalesMenu />
      </div>
      <div className="right-side-contents">
        <div className="page-content">
          <div className="page-header">
            <SubMenuToggle />
            <h3 className="page-title">
              <NavLink to="/sales/sales-invoices">
                <ArrowLeftIcon />
              </NavLink>
              Incomplete Sales Invoices
            </h3>
            <div className="header-actions">
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
            <Flex justify="space-between" align="center">
              <Form onFinish={handleFilters} form={form}>
                <Form.Item name="saleType">
                  <Select placeholder="Type" style={{ width: 120 }}>
                    <Select.Option value="">All Types</Select.Option>
                    <Select.Option value="Credit">Credit</Select.Option>
                    <Select.Option value="Invoice">Invoice</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item name="customerName">
                  <Select
                    showSearch
                    filterOption={(input, option) =>
                      option.label.toLowerCase().includes(input.toLowerCase())
                    }
                    placeholder="Customer"
                    style={{ width: "250px" }}
                    options={customer}
                  />
                </Form.Item>
                <Form.Item name="invoiceNo">
                  <Input
                    onFocus={(e) => e.target.select()}
                    placeholder="Invoice No"
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
            pagination={{
              current: pageNo,
              pageSize: pageSize,
              total: sortedData.length,
              showSizeChanger: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} items`,
              pageSizeOptions: ["10", "20", "50", "100", "200", "500"],
              onShowSizeChange: (current, size) => {
                setPageSize(size);
                setPageNo(1);
              },
              onChange: (page, size) => {
                setPageNo(page);
              },
            }}
          />
        </div>
      </div>
    </>
  );
}

export default IncompleteSaleInvoice;
