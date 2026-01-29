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
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

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
import SuppliersDropdown from "../Shared/SuppliersDropdown";
const ExcelJS = require("exceljs");

function IncompleteSupplierBills() {
  const AccessKey = localStorage.getItem("AccessKey");
  const UserID = localStorage.getItem("ID");
  const CompanyID = localStorage.getItem("CompanyID");
  const FYear = localStorage.getItem("DefaultFYear");

  const [loading, setLoading] = useState(false);
  const [ListOfRecords, setListOfRecords] = useState([]);
  const [supplierLoading, setSupplierLoading] = useState(false);
  const [supplierList, setSupplierList] = useState([]);
  const [OrderBy, setOrderBy] = useState("");
  const [Name, setName] = useState("");
  const [BillID, setBillID] = useState(0);
  const [Type, setType] = useState("");
  const [Date, setDate] = useState("");
  const [CustomerID, setCustomerID] = useState("");

  const [IsDeleted, setIsDeleted] = useState(false);
  const [CustomerLoading, setCustomerLoading] = useState(false);
  const [open, setOpen] = useState(false);
  // pagination
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [OpenDate, setOpenDate] = useState("");
  const [TotalRecords, setTotalRecords] = useState(0);
  const [InCompleteBills, setInCompleteBills] = useState(0);

  const [form] = Form.useForm();
  const [formMain] = Form.useForm();

  const fetchSales = async () => {
    setLoading(true);
    const api_config = {
      method: "get",
      url: `${Config.base_url}PurchaseHead/GetBy/${CompanyID}?orderBy=${OrderBy}&billId=${BillID}&supplierName=${Name}&InComplete=true&purchaseType=${Type}&date=${Date}`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AccessKey}`,
      },
    };

    try {
      const response = await axios(api_config);
      ////Console.log(response.data);
      if (response.data && response.data.status_code === 1) {
        setListOfRecords(response.data.listofPurchases || []);
        setTotalRecords(response.data.totalRecords);
      } else {
        setListOfRecords([]);
        setTotalRecords(0);
      }
    } catch (error) {
      message.error("Network Error..");
      //console.log(error);
      setListOfRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Incomplete Supplier Bills";
    fetchSales();
    fetchSupplier();
  }, [OrderBy, BillID, Name, Type, Date]);

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
    ////Console.log("Form Data Submitted:", formData);
    setBillID(formData["billId"] || 0);
    setName(formData["supplierName"] || "");
    setOrderBy(formData["OrderBy"] || "");
    setType(formData["purchaseType"] || "");
    setDate(OpenDate);
    setPageSize(100000);
    ////Console.log("Type State after set:", formData["purchaseType"]);
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
      dataIndex: "supplierAccountCode",
      key: "supplierAccountCode",
    },

    {
      title: "Supplier",
      dataIndex: "supplierName",
      key: "supplierName",
      render: (text, record) => record.supplierName.split("(")[0],
    },

    {
      title: "Type",
      dataIndex: "purchaseType",
      key: "purchaseType",
    },

    {
      title: "Bill Id",
      dataIndex: "billID",
      key: "billID",
      render: (text, record) => (
        <>
          <>
            <NavLink
              className={"primary"}
              to={
                record.purchaseType === "Bill"
                  ? `/purchases/purchase-bills/edit-purchase-bill/${record.billID}`
                  : `/purchases/purchase-bills/edit-credit-bill/${record.billID}`
              }
            >
              {record.billID}
            </NavLink>
          </>
        </>
      ),
    },

    {
      title: "Bill No.",
      dataIndex: "billNumber",
      key: "billNumber",
    },

    {
      title: "Total",
      dataIndex: "",
      key: "total",
      render: (text, record) => (
        <>
          {record.purchaseType === "Bill" ? (
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
          {record.purchaseType === "Bill" ? (
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
            onConfirm={
              record.purchaseType === "Bill"
                ? (e) => deleteBill(record.id)
                : (e) => deleteCredit(record.id)
            }
            okText="Yes"
            cancelText="No"
          >
            <DeleteOutlined />
          </Popconfirm>
        </div>
      ),
    },
  ];

  const deleteBill = async (sno) => {
    setLoading(true);
    try {
      const accountToUpdate = ListOfRecords.find((u) => u.id === sno);
      ////Console.log(accountToUpdate);
      if (!accountToUpdate) {
        message.error("Payment not found!");
        return;
      }

      const name = accountToUpdate.supplierName.match(/^[^\(]+/)[0].trim();
      const code = accountToUpdate.supplierAccountCode;

      const SupplierData = await axios.get(
        `${Config.base_url}CustomerSupplier/GetSuppliersBy/${CompanyID}?businessName=${name}&accountCode=${code}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${AccessKey}`,
          },
        }
      );
      ////Console.log(SupplierData.data.listofSuppliers[0]);

      const deleteSupplier = SupplierData.data.listofSuppliers[0];
      if (!accountToUpdate) {
        message.error("Bill not found!");
        setLoading(false);
        return;
      }
      if (accountToUpdate.balance === 0) {
        message.error("Paid bills can't be deleted");
        setLoading(false);
        return;
      }
      const updatedAccount = {
        ...accountToUpdate,
        isActive: false,
        isDeleted: true,
      };

      const response = await axios.patch(
        `${Config.base_url}PurchaseHead/UpdateRecord/${sno}`,
        updatedAccount,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${AccessKey}`,
          },
        }
      );
      if (response.data.status_code == 1) {
        const updateSupplierData = {
          ...deleteSupplier,
          isCustomer: false,
          supplierOpeningBalance:
            deleteSupplier.supplierOpeningBalance -
            parseInt(accountToUpdate.total),
        };
        await axios.patch(
          Config.base_url +
            `CustomerSupplier/UpdateRecord/${deleteSupplier.id}`,
          updateSupplierData,
          {
            headers: {
              Authorization: `Bearer ${AccessKey}`,
            },
          }
        );
        message.success("Bill deleted Successfully");
      }
    } catch (error) {
      ////Console.log(error);
      message.error("Error in Deleting receipt");
    }
    fetchSales();
  };

  const deleteCredit = async (sno) => {
    setLoading(true);
    try {
      const accountToUpdate = ListOfRecords.find((u) => u.id === sno);
      ////Console.log(accountToUpdate);
      if (!accountToUpdate) {
        message.error("Payment not found!");
        return;
      }

      const name = accountToUpdate.supplierName.match(/^[^\(]+/)[0].trim();
      const code = accountToUpdate.supplierAccountCode;

      const SupplierData = await axios.get(
        `${Config.base_url}CustomerSupplier/GetSuppliersBy/${CompanyID}?businessName=${name}&accountCode=${code}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${AccessKey}`,
          },
        }
      );
      ////Console.log(SupplierData.data.listofSuppliers[0]);

      const deleteSupplier = SupplierData.data.listofSuppliers[0];
      if (!accountToUpdate) {
        message.error("Bill not found!");
        setLoading(false);
        return;
      }
      if (accountToUpdate.balance === 0) {
        message.error("Paid credits can't be deleted");
        setLoading(false);
        return;
      }
      const updatedAccount = {
        ...accountToUpdate,
        isActive: false,
        isDeleted: true,
      };

      const response = await axios.patch(
        `${Config.base_url}PurchaseHead/UpdateRecord/${sno}`,
        updatedAccount,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${AccessKey}`,
          },
        }
      );
      if (response.data.status_code == 1) {
        const updateSupplierData = {
          ...deleteSupplier,
          isCustomer: false,
          supplierOpeningBalance:
            deleteSupplier.supplierOpeningBalance +
            parseInt(accountToUpdate.total),
        };
        await axios.patch(
          Config.base_url +
            `CustomerSupplier/UpdateRecord/${deleteSupplier.id}`,
          updateSupplierData,
          {
            headers: {
              Authorization: `Bearer ${AccessKey}`,
            },
          }
        );
        message.success("Credit deleted Successfully");
      }
    } catch (error) {
      ////Console.log(error);
      message.error("Error in Deleting receipt");
    }
    fetchSales();
  };

  const onReset = () => {
    form.resetFields();
    setType("");
    setBillID(0);
    setName("");
    setDate("");
    setOrderBy("");
    setOpenDate("");
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
          Credit Bill (VC)
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

  const handleExport = () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Sales");

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
    ListOfRecords.forEach((purchases, index) => {
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
            <h3 className="page-title">
              {" "}
              <NavLink to="/purchases/purchase-bills">
                <ArrowLeftIcon />
              </NavLink>
              Incomplete Supplier Bills
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
            dataSource={ListOfRecords}
            size="small"
            loading={loading}
            pagination={{
              current: pageNumber,
              pageSize: pageSize,
              total: ListOfRecords.length,
              showSizeChanger: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} items`,
              pageSizeOptions: ["10", "20", "50", "100", "200", "500"],
              onShowSizeChange: (current, size) => {
                setPageSize(size);
                setPageNumber(1);
              },
              onChange: (page, size) => {
                setPageNumber(page);
              },
            }}
          />
        </div>
      </div>
    </>
  );
}

export default IncompleteSupplierBills;
