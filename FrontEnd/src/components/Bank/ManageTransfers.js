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
  Divider,
  DatePicker,
} from "antd";
import React, { useEffect, useRef, useState } from "react";
import {
  PlusOutlined,
  DownloadOutlined,
  UploadOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  SortAscendingOutlined,
} from "@ant-design/icons";

import { Link, NavLink } from "react-router-dom";
import BanksMenu from "./BanksMenu";
import Config from "../../Config";
import SubMenuToggle from "../Common/SubMenuToggle";
import axios from "axios";
import AddCustomerModal from "./AddCustomerModal";
import dayjs from "dayjs";
import moment from "moment";
import { QueueListIcon } from "@heroicons/react/24/outline";
import ExcelJS from "exceljs";
import LevelWiseAccount2 from "../Shared/LevelWiseAccount2";

function ManageTransfers() {
  const AccessKey = localStorage.getItem("AccessKey");
  const UserID = localStorage.getItem("ID");
  const CompanyID = localStorage.getItem("CompanyID");
  const FYear = localStorage.getItem("DefaultFYear");

  const [loading, setLoading] = useState(false);
  const [ListOfRecords, setListOfRecords] = useState([]);
  const [OrderBy, setOrderBy] = useState("");
  const [AccountID, setAccountID] = useState("");
  const [AccountCode, setAccountCode] = useState("");
  const [Level, setLevel] = useState("0");
  const [CustomerID, setCustomerID] = useState("");
  const [voucherNo, setVoucherNo] = useState(0);
  const [date, setDate] = useState(null);
  const [fromBank, setFromBank] = useState("");
  const [toBank, setToBank] = useState("");
  const [OpenDate, setOpenDate] = useState(null);

  const [IsDeleted, setIsDeleted] = useState(false);
  const [CustomerLoading, setCustomerLoading] = useState(false);
  const [open, setOpen] = useState(false);
  // pagination
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [totalRecords, setTotalRecords] = useState(0);
  const [ListOfBanks, setListOfBanks] = useState([]);
  const [ListOfBank, setListOfBank] = useState([]);

  const [form] = Form.useForm();
  const [formMain] = Form.useForm();
  useEffect(() => {
    document.title = "Bank Transfer";
    fetchBanks();
    const fetchAccounts = async () => {
      const Banks = await LevelWiseAccount2(3, "50108");
      setListOfBank(Banks);
    };
    fetchAccounts();
  }, [voucherNo, date, toBank, fromBank]);

  const fetchBanks = async () => {
    setLoading(true);
    const data = {
      CompanyID: CompanyID,
      AccountName: fromBank,
      AccountCode: toBank,
      ID: voucherNo,
      Date: date,
    };
    const api_config = {
      method: "post",
      url: `${Config.base_url}Bank/GetBankTransfers`,
      headers: {
        Authorization: `Bearer ${AccessKey}`,
        "Content-Type": "application/json",
      },
      data: data,
    };

    try {
      const response = await axios(api_config);
      if (response.data.status_code === 1) {
        setListOfBanks(response.data.listofTransfers || []);
        setLoading(false);
      } else {
        setListOfBanks([]);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setListOfBanks([]);
      setLoading(false);
      message.error("Network Error...");
    }
  };

  const handleFilters = (formData) => {
    if (formData["voucherNo"] != undefined) {
      setVoucherNo(formData["voucherNo"]);
    } else if (formData["toBank"] != undefined) {
      setToBank(formData["toBank"]);
    } else if (formData["fromBank"] != undefined) {
      setFromBank(formData["fromBank"]);
    }
    setDate(OpenDate);
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
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
    },
    {
      title: "From Bank",
      dataIndex: "fromBank",
      key: "bank",
      sorter: (a, b) => a.fromBank.localeCompare(b.fromBank),
      render: (text, record) => (
        <>
          <>
            <NavLink
              className={"primary"}
              to={`/bank/report?source=${record.fromBankCode}`}
            >
              {record.fromBank.split(" (")[0]}
            </NavLink>
          </>
        </>
      ),
    },
    {
      title: "To Bank",
      dataIndex: "toBank",
      key: "nominalAccount",
      sorter: (a, b) => a.toBank.localeCompare(b.toBank),
      render: (text, record) => (
        <>
          <>
            <NavLink
              className={"primary"}
              to={`/bank/report?source=${record.toBankCode}`}
            >
              {record.toBank.split(" (")[0]}
            </NavLink>
          </>
        </>
      ),
    },
    {
      title: "V. No.",
      dataIndex: "voucherNo",
      key: "voucherNo",
      sorter: (a, b) => a.voucherNo - b.voucherNo,
      render: (text, record) => (
        <>
          <NavLink
            className={"primary"}
            to={`/bank/edit-bank-transfers/${record.voucherNo}`}
          >
            {record.voucherNo}
          </NavLink>
        </>
      ),
    },
    {
      title: "Ref. No.",
      dataIndex: "refNo",
      key: "refNo",
      sorter: (a, b) => a.refNo.localeCompare(b.refNo),
    },
    {
      title: "Detail",
      dataIndex: "detail",
      key: "detail",
      sorter: (a, b) => a.detail.localeCompare(b.detail),
    },
    {
      title: "From Amount",
      dataIndex: "amount",
      key: "amount",
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: "Actions",
      dataIndex: "Actions",
      key: "Actions",
      render: (_, record) => (
        <div className="table-actions">
          <NavLink
            className={"primary"}
            to={`/bank/edit-bank-transfers/${record.voucherNo}`}
          >
            <EditOutlined />
          </NavLink>
          <Popconfirm
            title="Delete the task"
            description="Are you sure to delete this transfer?"
            onConfirm={(e) => deleteAccount(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <DeleteOutlined />
          </Popconfirm>
        </div>
      ),
    },
  ];

  const deleteAccount = async (ID) => {
    try {
      const data = {
        ID: ID,
      };

      const response = await axios.patch(
        `${Config.base_url}Bank/DeleteBankTransfer`,
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
        fetchBanks();
      } else {
        message.error(response.data.status_message);
        setLoading(false);
      }
    } catch (error) {
      //console.error("Error deleting account:", error);
      message.error("Network Error...");
      setLoading(false);
    }
  };

  const onReset = () => {
    form.resetFields();
    setVoucherNo(0);
    setFromBank("");
    setToBank("");
    setDate(null);
  };

  const handleExport = () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Bank Receipts List");

    // Set column headers and their widths
    sheet.columns = [
      { header: "V No.", key: "voucherNo", width: 10 },
      { header: "Date", key: "date", width: 20 },
      { header: "From Bank", key: "fromBank", width: 45 },
      { header: "To Bank", key: "toBank", width: 45 },
      { header: "Ref No", key: "refNo", width: 20 },
      { header: "Detail", key: "detail", width: 30 },
      { header: "From Amount", key: "amount", width: 20 },
    ];

    // Add rows to the sheet
    ListOfBanks.forEach((bank, index) => {
      sheet.addRow({
        sr: index + 1,
        voucherNo: bank.voucherNo,
        date: bank.date,
        fromBank: bank.fromBank,
        toBank: bank.toBank,
        refNo: bank.refNo,
        detail: bank.detail,
        amount: bank.amount,
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
      anchor.download = `BankTransfersList_${dateString}.xlsx`;
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
        <h5>Bank</h5>
        <BanksMenu />
      </div>
      <div className="right-side-contents">
        <div className="page-content">
          <div className="page-header">
            <SubMenuToggle />
            <h3 className="page-title">Transfers</h3>
            <div className="header-actions">
              <Button
                type="dashed"
                onClick={handleExport}
                icon={<UploadOutlined />}
              >
                Export
              </Button>
              <NavLink to={`/bank/add-transfers`}>
                <Button type="primary" icon={<PlusOutlined />}>
                  New
                </Button>
              </NavLink>
            </div>
          </div>
          <div className="filters-wrap">
            <Form onFinish={handleFilters} form={form}>
              <Form.Item name="voucherNo">
                <Input
                  onFocus={(e) => e.target.select()}
                  placeholder="Voucher No"
                />
              </Form.Item>

              <Form.Item name="fromBank">
                <Select
                  showSearch
                  filterOption={(input, option) =>
                    option.label.toLowerCase().includes(input.toLowerCase())
                  }
                  placeholder="From Bank"
                  style={{ width: "250px" }}
                  options={ListOfBank.map((record) => ({
                    label: `${record.accountDescription} (${record.accountCode})`,
                    value: `${record.accountDescription} (${record.accountCode})`,
                  }))}
                />
              </Form.Item>
              <Form.Item name="toBank">
                <Select
                  showSearch
                  filterOption={(input, option) =>
                    option.label.toLowerCase().includes(input.toLowerCase())
                  }
                  placeholder="To Bank"
                  style={{ width: "250px" }}
                  options={ListOfBank.map((record) => ({
                    label: `${record.accountDescription} (${record.accountCode})`,
                    value: `${record.accountDescription} (${record.accountCode})`,
                  }))}
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
          </div>

          <Table
            columns={columns}
            dataSource={ListOfBanks}
            size="small"
            loading={loading}
            pagination={{ defaultPageSize: 30 }}
          />
        </div>
      </div>
    </>
  );
}

export default ManageTransfers;
