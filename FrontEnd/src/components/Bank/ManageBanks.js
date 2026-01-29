import {
  Form,
  Input,
  Select,
  Table,
  Button,
  Popconfirm,
  message,
  Modal,
} from "antd";
import React, { useEffect, useState } from "react";
import {
  PlusOutlined,
  DownloadOutlined,
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { NavLink } from "react-router-dom";
import BanksMenu from "./BanksMenu";
import Config from "../../Config";
import SubMenuToggle from "../Common/SubMenuToggle";
import axios from "axios";
import LevelWiseAccount2 from "../Shared/LevelWiseAccount2";
import AddAccount from "../Shared/AddAccount";

const ExcelJS = require("exceljs");

function ManageBanks(props) {
  const AccessKey = localStorage.getItem("AccessKey");
  const CompanyID = localStorage.getItem("CompanyID");

  const [loading, setLoading] = useState(false);
  const [FilterLoading, setFilterLoading] = useState(false);
  const [ListOfAccounts, setListOfAccounts] = useState([]);
  const [AccountList, setAccountList] = useState([]);
  const [AccountName, setAccountName] = useState("");
  const [ModalForm] = Form.useForm();
  const [AccountCode, setAccountCode] = useState("");
  const [open, setOpen] = useState(false);

  const [form] = Form.useForm();

  const fetchAccounts = async () => {
    setLoading(true);

    ////Console.log(data)
    try {
      const response = await LevelWiseAccount2(3, "50108");
      ////Console.log(response.data);
      if (response) {
        setListOfAccounts(response);
        setLoading(false);
      } else {
        setListOfAccounts([]);
        setLoading(false);
      }
    } catch (error) {
      ////console.error("Error fetching data:", error);
      setListOfAccounts([]);
      message.error("Network Error...");
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Manage Banks";
    fetchAccounts();
  }, []);

  useEffect(() => {
    const fetchLevel1 = async () => {
      setFilterLoading(true);
      try {
        const data = await LevelWiseAccount2(3, "50108");
        setAccountList(data);
      } catch (error) {
        console.error("Error fetching account list:", error);
      } finally {
        setFilterLoading(false);
      }
    };

    fetchLevel1();
  }, []);

  const handleFilters = (formData) => {
    let Account = AccountList;
    setAccountName(formData["Level1"] || "");
    if (formData["Level1"]) {
      Account = Account.filter(
        (item) => item.accountCode === formData["Level1"]
      );
    }
    if (formData["AccountCode"]) {
      Account = Account.filter(
        (item) => item.accountCode === formData["AccountCode"]
      );
    }
    setListOfAccounts(Account);
  };

  const deleteAccount = async (ID) => {
    try {
      setLoading(true);
      const updatedAccount = {
        ID: ID,
      };

      const response = await axios.patch(
        `${Config.base_url}AccountMain/DeleteAccount`,
        updatedAccount,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${AccessKey}`,
          },
        }
      );
      if (response.data.status_code == 1) {
        setLoading(false);
        setListOfAccounts((prev) =>
          prev.filter((account) => account.id !== ID)
        );
        message.success(response.data.status_message);
        fetchAccounts();
      } else {
        setLoading(false);
        message.error(response.data.status_message);
      }
    } catch (error) {
      //console.error("Error deleting account:", error);
      setLoading(false);
      message.error("Network Error...");
    }
  };

  const onReset = () => {
    form.resetFields();
    setAccountCode("");
    setAccountName("");
    fetchAccounts();
  };

  const columns = [
    {
      title: "Sr#",
      dataIndex: "",
      key: "SR",
      render: (text, record, index) => index + 1,
    },
    {
      title: "Account Name",
      dataIndex: "accountDescription",
      key: "accountDescription",
      sorter: (a, b) =>
        a.accountDescription.localeCompare(b.accountDescription),
    },
    {
      title: "Account Code",
      dataIndex: "accountCode",
      key: "accountCode",
      sorter: (a, b) => a.accountCode.localeCompare(b.accountCode),
    },
    {
      title: "Actions",
      dataIndex: "Actions",
      key: "Actions",
      render: (_, record) => {
        if (record.iLevel != 1) {
          return (
            <div className="table-actions">
              <NavLink
                className="primary"
                to={`/accounts/edit-account/${record.id}`}
              >
                <EditOutlined />
              </NavLink>
              <Popconfirm
                title="Delete Account"
                description="Are you sure you want to delete this account?"
                onConfirm={() => deleteAccount(record.id)}
                okText="Yes"
                cancelText="No"
              >
                <DeleteOutlined />
              </Popconfirm>
            </div>
          );
        }
        return null;
      },
    },
  ];

  const handleExport = () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Banks");

    // Set column headers and their widths
    sheet.columns = [
      { header: "Account Name", key: "accountDescription", width: 30 },
      { header: "Account Code", key: "accountCode", width: 15 },
      { header: "Level", key: "iLevel", width: 5 },
    ];

    // Add rows to the sheet
    ListOfAccounts.forEach((account, index) => {
      sheet.addRow({
        sr: index + 1,
        accountDescription: account.accountDescription,
        accountCode: account.accountCode,
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
      anchor.download = `BanksList_${dateString}.xlsx`;
      anchor.click();
      window.URL.revokeObjectURL(url);
    });
  };

  const Level1Options = AccountList.map((item) => ({
    label: item.accountDescription,
    value: item.accountCode,
  }));

  const handleCancel = () => {
    setOpen(false);
  };
  const ShowModal = () => {
    setOpen(true);
  };

  const AddNewBankAccount = async (FormData) => {
    try {
      // ////Console.log(BankAccount);
      fetchAccounts();
      const response = await AddAccount(FormData, ListOfAccounts);
      if (response) {
        ModalForm.resetFields();
        fetchAccounts();
        setOpen(false);
      } else {
      }
    } catch (error) {
      // //console.error(error);
      message.error("Network Error..");
    }
  };

  return (
    <>
      {/* Add New Bank Account */}
      <Modal
        title="Bank Account New"
        open={open}
        onCancel={handleCancel}
        footer={null}
      >
        <Form layout="vertical" form={ModalForm} onFinish={AddNewBankAccount}>
          {/* Nominal Account */}
          <Form.Item
            label="Bank Account"
            name="accountDescription"
            rules={[
              {
                required: true,
                message: "Please input the bank account!",
              },
            ]}
          >
            <Input
              onFocus={(e) => e.target.select()}
              placeholder="Bank Account"
            />
          </Form.Item>

          {/* Code */}
          <Form.Item label="Code" name="code">
            <Input
              onFocus={(e) => e.target.select()}
              placeholder="Code"
              disabled
            />
          </Form.Item>

          {/* Description */}
          <Form.Item label="Description" name="remarks">
            <Input
              onFocus={(e) => e.target.select()}
              placeholder="Description"
            />
          </Form.Item>

          {/* Form Actions */}
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
      </Modal>

      <div id="sub-menu-wrap">
        <h5>Bank</h5>
        <BanksMenu />
      </div>
      <div className="right-side-contents">
        <div className="page-content">
          <div className="page-header">
            <SubMenuToggle />
            <h3 className="page-title">Manage Banks</h3>
            <div className="header-actions">
              <NavLink to="/accounts/import">
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
                onClick={ShowModal}
                icon={<PlusOutlined />}
              >
                New Account
              </Button>
            </div>
          </div>
          <div className="filters-wrap">
            <Form onFinish={handleFilters} form={form} layout="vertical">
              <Form.Item name="Level1" style={{ width: 200 }}>
                <Select
                  showSearch
                  filterOption={(input, option) =>
                    option.label.toLowerCase().includes(input.toLowerCase())
                  }
                  placeholder="Select Bank"
                  loading={FilterLoading}
                  options={Level1Options}
                />
              </Form.Item>
              <Form.Item name="AccountCode">
                <Input
                  type="number"
                  placeholder="Account Code"
                  onFocus={(e) => e.target.select()}
                />
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
            dataSource={ListOfAccounts}
            size="small"
            loading={loading}
            pagination={true}
            // pagination={{ pageSize: 2 }}
            // expandedRowKeys={expandRowKeys}
            // expandable={{
            //   expandIcon: () => null,
            // }}
          />
        </div>
      </div>
    </>
  );
}

export default ManageBanks;
