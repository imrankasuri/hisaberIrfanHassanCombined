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
import SalesMenu from "./../SalesMenu";
import Config from "../../../Config";
import SubMenuToggle from "../../Common/SubMenuToggle";
import CustomerDropdown from "../../Shared/CustomerDropdown";
import axios from "axios";
import dayjs from "dayjs";
import moment from "moment";
import { QueueListIcon } from "@heroicons/react/24/outline";
import BadgeComponent from "../../Common/Badge";

const ExcelJS = require("exceljs");

function SalesInvoices() {
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
  const [DocNo, setDocNo] = useState("");
  const [Date, setDate] = useState(null);

  const [IsDeleted, setIsDeleted] = useState(false);
  const [CustomerLoading, setCustomerLoading] = useState(false);
  const [open, setOpen] = useState(false);
  // pagination
  const [OpenDate, setOpenDate] = useState(null);
  const [IncompleteSale, setIncompleteSale] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [TotalRecords, setTotalRecords] = useState(0);
  const [TotalCustomerRecords, setTotalCustomerRecords] = useState(0);
  const [customerList, setCustomerList] = useState([]);
  const [ExportData, setExportData] = useState([]);

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

  const fetchSales = async () => {
    setLoading(true);
    const data = {
      CompanyID: CompanyID,
      AccountName: Name,
      InvoiceNo: InvoiceNo,
      OrderBy: OrderBy,
      Type: Type,
      DocNo: DocNo,
      PageSize: pageSize,
      PageNo: pageNumber,
      Date: Date,
      Email: "Complete",
      //InComplete: false,
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
    // ////Console.log(data)
    try {
      const response = await axios(api_config);
      ////Console.log(response.data);
      if (response.data.status_code === 1) {
        setListOfRecords(response.data.listOfSales || []);
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

  const fetchIncompleteSales = async () => {
    setLoading(true);
    const data = {
      CompanyID: CompanyID,
      AccountName: Name,
      InvoiceNo: InvoiceNo,
      OrderBy: OrderBy,
      Type: Type,
      PageSize: 10000,
      PageNo: pageNumber,
      Date: Date,
      InComplete: true,
      Email: "Incomplete",
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
      ////Console.log(response);
      if (response.data && response.data.status_code === 1) {
        const filteredRecords = (response.data.listOfSales || []).filter(
          (record) => record.inComplete === true
        );
        setIncompleteSale(filteredRecords.length);
      }
    } catch (error) {
      //console.error("Error fetching data:", error);
      setLoading(false);
      // message.error("Network Error..");
    }
  };

  useEffect(() => {
    document.title = "Sales Invoices";
    fetchSales();
    fetchIncompleteSales();
    fetchCustomers();
  }, [OrderBy, InvoiceNo, Name, Type, DocNo, Date, pageNumber, pageSize]);

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
    // ////Console.log("Form Data Submitted:", formData);
    setInvoiceNo(formData["invoiceNo"]);
    setName(formData["customerName"] || "");
    setOrderBy(formData["OrderBy"] || "");
    setType(formData["saleType"] || "");
    setDocNo(formData["docNo"] || "");
    setDate(OpenDate);
    setPageNumber(1);
    setPageSize(100000);
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
      render: (text, record) => (
        <span style={{ color: record.inComplete ? "#ff4d4f" : "inherit" }}>
          {text}
        </span>
      ),
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
    },

    {
      title: "A/C No.",
      dataIndex: "customerAccountCode",
      key: "customerAccountCode",
      render: (text, record) => (
        <span style={{ color: record.inComplete ? "#ff4d4f" : "inherit" }}>
          {text}
        </span>
      ),
      sorter: (a, b) => a.customerAccountCode - b.customerAccountCode,
    },

    {
      title: "Customer",
      dataIndex: "customerName",
      key: "customerName",
      render: (text, record) => (
        <>
          <>
            <NavLink
              className={"primary"}
              to={`/customer/report?source=${record.customerAccountCode}`}
            >
              {record.customerName.split(" (")[0]}
            </NavLink>
          </>
        </>
      ),
      sorter: (a, b) => a.customerName.localeCompare(b.customerName),
    },

    {
      title: "Type",
      dataIndex: "saleType",
      key: "saleType",
      render: (text, record) => (
        <span style={{ color: record.inComplete ? "#ff4d4f" : "inherit" }}>
          {text}
        </span>
      ),
      sorter: (a, b) => a.saleType.localeCompare(b.saleType),
    },

    {
      title: "Inv. No.",
      dataIndex: "invoiceNo",
      key: "invoiceNo",
      sorter: (a, b) => a.invoiceNo - b.invoiceNo,
      render: (text, record) =>
        record.docNo !== "COP" ? (
          <>
            <>
              <NavLink
                className={record.inComplete ? "primary incomplete" : "primary"}
                style={{ color: record.inComplete ? "#ff4d4f" : "blue" }}
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
        ) : (
          <span style={{ color: record.inComplete ? "#ff4d4f" : "blue" }}>
            {record.invoiceNo}
          </span>
        ),
    },

    {
      title: "Doc No.",
      dataIndex: "docNo",
      key: "docNo",
      render: (text, record) => (
        <span style={{ color: record.inComplete ? "#ff4d4f" : "inherit" }}>
          {text}
        </span>
      ),
      sorter: (a, b) => a.docNo.localeCompare(b.docNo),
    },

    {
      title: "Total",
      dataIndex: "",
      key: "total",
      sorter: (a, b) => a.total - b.total,
      render: (text, record) => (
        <span style={{ color: record.inComplete ? "#ff4d4f" : "inherit" }}>
          {record.saleType === "Invoice" ? record.total : -record.total}
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
          {record.saleType === "Invoice" ? record.balance : -record.balance}
        </span>
      ),
    },
    {
      title: "Actions",
      dataIndex: "Actions",
      key: "Actions",
      render: (_, record) =>
        record.docNo !== "COP" ? (
          <div className="table-actions">
            <NavLink
              className={record.inComplete ? "primary incomplete" : "primary"}
              style={{ color: record.inComplete ? "#ff4d4f" : "inherit" }}
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
      ////Console.log(error);
      message.error("Network Error..");
      setLoading(false);
    }
    fetchSales();
  };

  const onReset = () => {
    form.resetFields();
    setType("");
    setDocNo("");
    setInvoiceNo(0);
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
        <Link to={`/sales/sales-invoices/add-sales-invoices`}>
          Sales Invoice (SI)
        </Link>
      ),
    },
    {
      key: "2",
      label: (
        <Link to={`/sales/sales-invoices/add-credit-note`}>
          Sales Return (SC)
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
    // {
    //   key: "4",
    //   label: (
    //     <Link to={`/sales/sales-invoices/bulk-invoicing`}>
    //       Bank Invoice (SI)
    //     </Link>
    //   ),
    // },
  ];

  const handleExport = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Sales");

    const data = {
      CompanyID: CompanyID,
      AccountName: Name,
      InvoiceNo: InvoiceNo,
      OrderBy: OrderBy,
      Type: Type,
      PageSize: 1000000000,
      PageNo: pageNumber,
      Date: Date,
      Email: "Complete",
      InComplete: false,
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
      if (response.data.status_code === 1) {
        setExportData(response.data.listOfSales || []);

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
        ExportData.forEach((sales, index) => {
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
          anchor.download = `SalesList_${dateString}.xlsx`;
          anchor.click();
          window.URL.revokeObjectURL(url);
        });
      }
    } catch (error) {
      //console.error("Error fetching data:", error);
      setListOfRecords([]);
    }
  };

  const handleDateChange = (e, value) => {
    setOpenDate(value);
  };

  const sortedData = ListOfRecords.sort(
    //(a, b) => dayjs(b.date).unix() - dayjs(a.date).unix(),
    (a, b) => b.invoiceNo - a.invoiceNo
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
            <h3 className="page-title">Sales Invoices</h3>
            <div className="header-actions">
              <NavLink to="/sales/sales-invoice/import">
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
              <Form.Item name="docNo">
                <Input
                  onFocus={(e) => e.target.select()}
                  placeholder="Doc No"
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
                  text="Sales"
                  link="/sales/incomplete-sales-invoices"
                  count={IncompleteSale}
                />
              </div>
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
          <div style={{ margin: "50px 0" }}>
            <Pagination
              align="end"
              showSizeChanger
              size="small"
              pageSizeOptions={["10", "50", "100", "500", "1000"]}
              onShowSizeChange={onShowSizeChange}
              onChange={onPageChange}
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

export default SalesInvoices;
