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
import BankModeDropdown from "../Shared/BankModeDropdown";
import LevelWiseAccounts from "../Shared/LevelWiseAccounts";

function ManageReceipts() {
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
  const [bank, setBank] = useState("");
  const [nominalAccount, setNominalAccount] = useState("");
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
  const [ListOfAccounts, setListOfAccounts] = useState([]);

  const [form] = Form.useForm();
  const [formMain] = Form.useForm();
  useEffect(() => {
    document.title = "Bank Receipts";
    fetchBanks();
    const fetchAccounts = async () => {
      const BankAccounts = await LevelWiseAccount2(3, "50108");
      setListOfBank(BankAccounts);
      const accounts = await LevelWiseAccounts(3);
      setListOfAccounts(accounts);
    };
    fetchAccounts();
  }, [voucherNo, date, bank, nominalAccount]);

  const fetchBanks = async () => {
    setLoading(true);
    const data = {
      CompanyID: CompanyID,
      AccountName: bank,
      AccountCode: nominalAccount,
      Level1: voucherNo,
      Date: date,
    };
    const api_config = {
      method: "post",
      url: `${Config.base_url}Bank/GetBankReceipts`,
      headers: {
        Authorization: `Bearer ${AccessKey}`,
        "Content-Type": "application/json",
      },
      data: data,
    };

    try {
      const response = await axios(api_config);
      if (response.data.status_code === 1) {
        setListOfBanks(response.data.listofPayments || []);
        setLoading(false);
      } else {
        setListOfBanks([]);
        setLoading(false);
      }
    } catch (error) {
      // console.error("Error fetching data:", error);
      setListOfBanks([]);
      setLoading(false);
    }
  };

  const handleFilters = (formData) => {
    if (formData["voucherNo"] != undefined) {
      setVoucherNo(formData["voucherNo"]);
    } else if (formData["bank"] != undefined) {
      setBank(formData["bank"]);
    } else if (formData["nominalAccount"] != undefined) {
      setNominalAccount(formData["nominalAccount"]);
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
      title: "Bank",
      dataIndex: "bank",
      key: "bank",
      sorter: (a, b) => a.bank.localeCompare(b.bank),
      render: (text, record) => (
        <>
          <>
            <NavLink
              className={"primary"}
              to={`/bank/report?source=${record.bankCode}`}
            >
              {record.bank.split(" (")[0]}
            </NavLink>
          </>
        </>
      ),
    },
    {
      title: "Nominal Account",
      dataIndex: "nominalAccount",
      key: "nominalAccount",
      sorter: (a, b) => a.nominalAccount.localeCompare(b.nominalAccount),
      render: (text, record) => (
        <>
          <>
            <NavLink
              className={"primary"}
              to={`/accounts/report?source=${record.nominalAccountCode}`}
            >
              {record.whtPayment == true
                ? `WHT Deductions (${record.nominalAccount.split(" (")[0]})`
                : record.nominalAccount.split(" (")[0]}
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
            to={`/bank/edit-bank-receipts/${record.voucherNo}`}
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
      title: "Amount",
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
            to={`/bank/edit-bank-receipts/${record.voucherNo}`}
          >
            <EditOutlined />
          </NavLink>
          <Popconfirm
            title="Delete the task"
            description="Are you sure to delete this account?"
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
        `${Config.base_url}Bank/DeleteReceipt`,
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
    setBank("");
    setNominalAccount("");
    setDate(null);
  };

  const handleExport = () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Bank Receipts List");

    // Set column headers and their widths
    sheet.columns = [
      { header: "V No.", key: "voucherNo", width: 10 },
      { header: "Date", key: "date", width: 20 },
      { header: "Bank", key: "bank", width: 45 },
      { header: "Nominal Account", key: "nominalAccount", width: 45 },
      { header: "Ref No", key: "refNo", width: 20 },
      { header: "Detail", key: "detail", width: 30 },
      { header: "Amount", key: "amount", width: 20 },
    ];

    // Add rows to the sheet
    ListOfBanks.forEach((bank, index) => {
      sheet.addRow({
        sr: index + 1,
        voucherNo: bank.voucherNo,
        date: bank.date,
        bank: bank.bank,
        nominalAccount: bank.nominalAccount,
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
      anchor.download = `BankReceiptsList_${dateString}.xlsx`;
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
            <h3 className="page-title">Bank Receipts</h3>
            <div className="header-actions">
              <Button
                type="dashed"
                onClick={handleExport}
                icon={<UploadOutlined />}
              >
                Export
              </Button>
              <NavLink to={`/bank/add-bank-receipts`}>
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

              <Form.Item name="bank">
                <Select
                  showSearch
                  filterOption={(input, option) =>
                    option.label.toLowerCase().includes(input.toLowerCase())
                  }
                  placeholder="Bank"
                  style={{ width: "250px" }}
                  options={ListOfBank.map((record) => ({
                    label: `${record.accountDescription} (${record.accountCode})`,
                    value: `${record.accountDescription} (${record.accountCode})`,
                  }))}
                />
              </Form.Item>
              <Form.Item name="nominalAccount">
                <Select
                  showSearch
                  filterOption={(input, option) =>
                    option.label.toLowerCase().includes(input.toLowerCase())
                  }
                  placeholder="Nominal Account"
                  style={{ width: "250px" }}
                  options={ListOfAccounts.map((record) => ({
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

export default ManageReceipts;
