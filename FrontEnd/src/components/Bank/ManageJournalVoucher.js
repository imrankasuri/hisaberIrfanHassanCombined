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
import LevelWiseAccounts from "../Shared/LevelWiseAccounts";
import CustomerDropdown from "../Shared/CustomerDropdown";
import SuppliersDropdown from "../Shared/SuppliersDropdown";
import axios from "axios";
import dayjs from "dayjs";
import ExcelJS from "exceljs";

function ManageJournalVoucher() {
  const AccessKey = localStorage.getItem("AccessKey");
  const UserID = localStorage.getItem("ID");
  const CompanyID = localStorage.getItem("CompanyID");
  const FYear = localStorage.getItem("DefaultFYear");

  const [loading, setLoading] = useState(false);
  const [voucherNo, setVoucherNo] = useState(0);
  const [date, setDate] = useState("");
  const [fromAccount, setFromAccount] = useState("");
  const [toAccount, setToAccount] = useState("");
  const [OpenDate, setOpenDate] = useState("");
  const [ListOfAccounts, setListOfAccounts] = useState([]);
  const [ListOfCustomers, setListOfCustomers] = useState([]);
  const [ListOfSuppliers, setListOfSuppliers] = useState([]);

  // pagination
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [totalRecords, setTotalRecords] = useState(0);
  const [ListOfBanks, setListOfBanks] = useState([]);
  const [ListOfBank, setListOfBank] = useState([]);

  const [form] = Form.useForm();
  const [formMain] = Form.useForm();
  useEffect(() => {
    document.title = "Journal Voucher";
    fetchVouchers();
    fetchAccounts();
  }, [voucherNo, date, fromAccount, toAccount]);

  const fetchVouchers = async () => {
    setLoading(true);
    const api_config = {
      method: "get",
      url:
        `${Config.base_url}Bank/GetJournalVoucherBy/${CompanyID}` +
        `?${voucherNo > 0 ? `voucherNo=${voucherNo}` : ""}` +
        `&date=${date}` +
        `&fromAccount=${fromAccount}` +
        `&toAccount=${toAccount}`,
      headers: {
        Authorization: `Bearer ${AccessKey}`,
        "Content-Type": "application/json",
      },
    };
    ////Console.log({
    // CompanyID,
    //   voucherNo,
    //   date,
    //   fromAccount,
    //   toAccount,
    // });
    try {
      const response = await axios(api_config);
      //console.log(response.data);
      if (response.data && response.data.status_code === 1) {
        setListOfBanks(response.data.listofVouchers || []);
      } else {
        setListOfBanks([]);
      }
    } catch (error) {
      //console.error("Error fetching data:", error);
      setListOfBanks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    setLoading(true);
    const accounts = await LevelWiseAccounts(3);
    setListOfAccounts(accounts);
    const customers = await CustomerDropdown();
    setListOfCustomers(customers);
    const suppliers = await SuppliersDropdown();
    setListOfSuppliers(suppliers);
    setLoading(false);
  };

  const options = [
    ...ListOfCustomers.map((record) => ({
      label: `${record.businessName} (${record.accountCode})`,
      value: `${record.businessName} (${record.accountCode})`,
    })),
    ...ListOfSuppliers.map((record) => ({
      label: `${record.businessName} (${record.accountCode})`,
      value: `${record.businessName} (${record.accountCode})`,
    })),
    ...ListOfAccounts.map((record) => ({
      label: `${record.accountDescription} (${record.accountCode})`,
      value: `${record.accountDescription} (${record.accountCode})`,
    })),
  ];

  const handleFilters = (formData) => {
    if (formData["voucherNo"] != undefined) {
      setVoucherNo(formData["voucherNo"]);
    } else if (formData["toAccount"] != undefined) {
      setToAccount(formData["toAccount"]);
    } else if (formData["fromAccount"] != undefined) {
      setFromAccount(formData["fromAccount"]);
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
      title: "From Account",
      dataIndex: "fromAccount",
      key: "fromAccount",
      sorter: (a, b) => a.fromAccount.localeCompare(b.fromAccount),
      render: (text, record) => {
        const isCustomer = record.fromAccountCode?.toString().startsWith("1");
        const reportType = isCustomer ? "customer" : "supplier";

        return (
          <NavLink
            className="primary"
            to={`/${reportType}/report?source=${record.fromAccountCode}`}
          >
            {record.fromAccount.split(" (")[0]}
          </NavLink>
        );
      },
    },
    {
      title: "To Account",
      dataIndex: "toAccount",
      key: "toAccount",
      sorter: (a, b) => a.toAccount.localeCompare(b.toAccount),
      render: (text, record) => (
        <>
          <>
            <NavLink
              className={"primary"}
              to={`/accounts/report?source=${record.toAccountCode}`}
            >
              {record.toAccount.split(" (")[0]}
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
            to={`/bank/edit-journalVoucher/${record.voucherNo}`}
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
            to={`/bank/edit-journalVoucher/${record.voucherNo}`}
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

  const deleteAccount = async (sno) => {
    try {
      const accountToUpdate = ListOfBanks.find((u) => u.id === sno);
      //////Console.log(accountToUpdate);
      if (!accountToUpdate) {
        message.error("Journal Voucher not found!");
        return;
      }

      const updatedAccount = {
        ...accountToUpdate,
        isActive: false,
        isDeleted: true,
      };

      await axios.patch(
        `${Config.base_url}Bank/DeleteJournalVoucher/${sno}`,
        updatedAccount,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${AccessKey}`,
          },
        }
      );

      message.success("Journal Voucher deleted successfully.");
      fetchVouchers(); // Refresh the list
    } catch (error) {
      //console.error("Error deleting account:", error);
    }
  };

  const onReset = () => {
    form.resetFields();
    setVoucherNo(0);
    setFromAccount("");
    setToAccount("");
    setDate("");
  };

  const handleExport = () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Journal Voucher List");

    // Set column headers and their widths
    sheet.columns = [
      { header: "V No.", key: "voucherNo", width: 10 },
      { header: "Date", key: "date", width: 20 },
      { header: "From Account", key: "fromAccount", width: 45 },
      { header: "To Account", key: "toAccount", width: 45 },
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
        fromAccount: bank.fromAccount,
        toAccount: bank.toAccount,
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
      anchor.download = `JournalVoucherList_${dateString}.xlsx`;
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
            <h3 className="page-title">Journal Voucher</h3>
            <div className="header-actions">
              <Button
                type="dashed"
                onClick={handleExport}
                icon={<UploadOutlined />}
              >
                Export
              </Button>
              <NavLink to={`/bank/add-journalVoucher`}>
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

              <Form.Item name="fromAccount">
                <Select
                  showSearch
                  filterOption={(input, option) =>
                    option.label.toLowerCase().includes(input.toLowerCase())
                  }
                  placeholder="From Account"
                  style={{ width: "250px" }}
                  options={options}
                />
              </Form.Item>
              <Form.Item name="toAccount">
                <Select
                  showSearch
                  filterOption={(input, option) =>
                    option.label.toLowerCase().includes(input.toLowerCase())
                  }
                  placeholder="To Account"
                  style={{ width: "250px" }}
                  options={options}
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

export default ManageJournalVoucher;
