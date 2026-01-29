import { Form, Input, Select, Table, Button, Popconfirm, message } from "antd";
import React, { useEffect, useState } from "react";
import {
  PlusOutlined,
  DownloadOutlined,
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { NavLink } from "react-router-dom";
import AccountsMenu from "./AccountsMenu";
import Config from "../../Config";
import SubMenuToggle from "../Common/SubMenuToggle";
import axios from "axios";
import SettingMenu from "../Setting/SettingMenu";
import LevelWiseAccounts from "../Shared/LevelWiseAccounts";
import LevelWiseAccount2 from "../Shared/LevelWiseAccount2";

const ExcelJS = require("exceljs");

function ManageAccounts(props) {
  const AccessKey = localStorage.getItem("AccessKey");
  const CompanyID = localStorage.getItem("CompanyID");

  const [loading, setLoading] = useState(false);
  const [FilterLoading, setFilterLoading] = useState(false);
  const [ListOfAccounts, setListOfAccounts] = useState([]);
  const [AccountList, setAccountList] = useState([]);
  const [AccountList1, setAccountList1] = useState([]);
  const [AccountList2, setAccountList2] = useState([]);
  const [LevelList2, setLevelList2] = useState([]);
  const [LevelList3, setLevelList3] = useState([]);
  const [OrderBy, setOrderBy] = useState("");
  const [AccountName, setAccountName] = useState("");
  const [AccountCode, setAccountCode] = useState("");
  const [Level1, setLevel1] = useState(0);
  const [Level2, setLevel2] = useState(0);
  const [Level3, setLevel3] = useState(0);

  const [form] = Form.useForm();

  const fetchAccounts = async () => {
    setLoading(true);
    const data = {
      CompanyID: CompanyID,
      AccountName: AccountName,
    };
    ////Console.log(data)
    const api_config = {
      method: "post",
      url: `${Config.base_url}AccountMain/GetAccounts`,
      headers: {
        Authorization: `Bearer ${AccessKey}`,
        "Content-Type": "application/json",
      },
      data: data,
    };
    ////Console.log(data)
    try {
      const response = await axios(api_config);
      ////Console.log(response.data);
      if (response.data.status_code === 1) {
        const transformData = (accounts) => {
          return accounts.map((account) => ({
            key: account.accountCode,
            id: account.id,
            accountCode: account.accountCode,
            accountDescription: account.accountDescription,
            iLevel: account.iLevel,
            children: account.level2Accounts
              ? account.level2Accounts.map((level2Account) => ({
                  key: level2Account.accountCode,
                  id: level2Account.id,
                  accountCode: level2Account.accountCode,
                  accountDescription: level2Account.accountDescription,
                  iLevel: level2Account.iLevel,
                  parentLevel1Code: account.accountCode,
                  children: level2Account.level3Accounts
                    ? level2Account.level3Accounts.map((level3Account) => ({
                        key: level3Account.accountCode,
                        id: level3Account.id,
                        accountCode: level3Account.accountCode,
                        accountDescription: level3Account.accountDescription,
                        iLevel: level3Account.iLevel,
                      }))
                    : undefined,
                }))
              : undefined,
          }));
        };
        setListOfAccounts(transformData(response.data.listofAccounts || []));
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
    document.title = "Manage Accounts";
    fetchAccounts();
  }, [AccountName]);

  useEffect(() => {
    const fetchLevel1 = async () => {
      setFilterLoading(true);
      try {
        const data = await LevelWiseAccounts(1);
        setAccountList(data);
      } catch (error) {
        console.error("Error fetching account list:", error);
      } finally {
        setFilterLoading(false);
      }
    };
    const fetchLevel2 = async () => {
      setFilterLoading(true);
      try {
        const data = await LevelWiseAccounts(2);
        setLevelList2(data);
      } catch (error) {
        console.error("Error fetching account list:", error);
      } finally {
        setFilterLoading(false);
      }
    };
    const fetchLevel3 = async () => {
      setFilterLoading(true);
      try {
        const data = await LevelWiseAccounts(3);
        setLevelList3(data);
      } catch (error) {
        console.error("Error fetching account list:", error);
      } finally {
        setFilterLoading(false);
      }
    };

    fetchLevel1();
    fetchLevel2();
    fetchLevel3();
  }, [Level1, Level2]);

  const fetchAccountList2 = async (Level1) => {
    setFilterLoading(true);
    try {
      if (Level1 == 0) {
        const data = await LevelWiseAccounts(2);
        setLevelList2(data);
      } else {
        const data = await LevelWiseAccount2(2, Level1);
        setLevelList2(data);
      }
    } catch (error) {
      console.error("Error fetching account list:", error);
    } finally {
      setFilterLoading(false);
    }
  };
  const fetchAccountList3 = async (Level2) => {
    setFilterLoading(true);
    try {
      if (Level2 == 0) {
        const data = await LevelWiseAccounts(3);
        setLevelList3(data);
      } else {
        const data = await LevelWiseAccount2(3, Level2);
        setLevelList3(data);
      }
    } catch (error) {
      console.error("Error fetching account list:", error);
    } finally {
      setFilterLoading(false);
    }
  };

  const handleFilters = (formData) => {
    ////Console.log("Form Submitted with:", formData);
    setAccountName(formData["Level3"] || "");
    // fetchAccounts();
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
    // {
    //   title: "Sr#",
    //   dataIndex: "",
    //   key: "SR",
    //   render: (text, record, index) => (
    //     <span style={{ fontWeight: record.iLevel === 1 ? "bold" : record.iLevel === 2 ? 600 : "normal" }}>
    //       {index + 1}
    //     </span>
    //   ),
    // },
    {
      title: "Account Name",
      dataIndex: "accountDescription",
      key: "accountDescription",
      sorter: (a, b) =>
        a.accountDescription.localeCompare(b.accountDescription),
      render: (text, record) => (
        <span
          style={{
            fontWeight:
              record.iLevel === 1
                ? "bolder"
                : record.iLevel === 2
                ? 600
                : "normal",
          }}
        >
          {text}
        </span>
      ),
    },
    {
      title: "Account Code",
      dataIndex: "accountCode",
      key: "accountCode",
      sorter: (a, b) => a.accountCode.localeCompare(b.accountCode),
      render: (text, record) => (
        <span
          style={{
            fontWeight:
              record.iLevel === 1
                ? "bolder"
                : record.iLevel === 2
                ? 600
                : "normal",
          }}
        >
          {text}
        </span>
      ),
    },
    {
      title: "Level",
      dataIndex: "iLevel",
      key: "iLevel",
      sorter: (a, b) => a.iLevel - b.iLevel,
      render: (text, record) => (
        <span
          style={{
            fontWeight:
              record.iLevel === 1
                ? "bolder"
                : record.iLevel === 2
                ? 600
                : "normal",
          }}
        >
          {text}
        </span>
      ),
    },
    {
      title: "Actions",
      dataIndex: "Actions",
      key: "Actions",
      render: (_, record) => {
        if (record.iLevel != 1) {
          return (
            <div className="table-actions">
              {record.iLevel === 2 && (
                <NavLink
                  className="primary"
                  to="/accounts/add-account"
                  state={{
                    firstLevelCode: record.parentLevel1Code,
                    secondLevelCode: record.accountCode,
                  }}
                >
                  <PlusOutlined />
                </NavLink>
              )}
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
    const sheet = workbook.addWorksheet("Accounts");

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
        iLevel: account.iLevel,
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
      anchor.download = `AccountsList_${dateString}.xlsx`;
      anchor.click();
      window.URL.revokeObjectURL(url);
    });
  };

  const Level1Options = [
    { label: "All", value: "0" },
    ...AccountList.map((item) => ({
      label: item.accountDescription,
      value: item.accountCode,
    })),
  ];

  const Level2Options = [
    { label: "All", value: "0" },
    ...LevelList2.map((item) => ({
      label: item.accountDescription,
      value: item.accountCode,
    })),
  ];

  const Level3Options = [
    ...LevelList3.map((item) => ({
      label: item.accountDescription,
      value: item.accountDescription,
    })),
  ];

  ////Console.log(AccountList3)

  const getAllKeys = (data) => {
    const keys = [];
    data.forEach((item) => {
      keys.push(item.key);
      if (item.children) {
        keys.push(...getAllKeys(item.children));
      }
    });
    return keys;
  };

  const expandRowKeys = getAllKeys(ListOfAccounts);

  return (
    <>
      <div id="sub-menu-wrap">
        <h5>Settings</h5>
        <SettingMenu />
      </div>
      <div className="right-side-contents">
        <div className="page-content">
          <div className="page-header">
            <SubMenuToggle />
            <h3 className="page-title">Manage Accounts</h3>
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
              <NavLink
                to="/accounts/add-account"
                state={{
                  firstLevelCode: Level1 && Level1 !== "0" ? Level1 : undefined,
                  secondLevelCode:
                    Level2 && Level2 !== "0" ? Level2 : undefined,
                }}
              >
                <Button type="primary" icon={<PlusOutlined />}>
                  New
                </Button>
              </NavLink>
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
                  onChange={(value) => {
                    setLevel1(value);
                    setLevel2(0);
                    fetchAccountList2(value);
                  }}
                  placeholder="Select Level 1"
                  loading={FilterLoading}
                  options={Level1Options}
                />
              </Form.Item>
              <Form.Item name="Level2" style={{ width: 300 }}>
                <Select
                  showSearch
                  filterOption={(input, option) =>
                    option.label.toLowerCase().includes(input.toLowerCase())
                  }
                  onChange={(value) => {
                    setLevel2(value);
                    fetchAccountList3(value);
                  }}
                  placeholder="Select Level 2"
                  loading={FilterLoading}
                  options={Level2Options}
                />
              </Form.Item>
              <Form.Item name="Level3" style={{ width: 300 }}>
                <Select
                  showSearch
                  filterOption={(input, option) =>
                    option.label.toLowerCase().includes(input.toLowerCase())
                  }
                  // onChange={(label) => {
                  //   setAccountName(label);
                  // }}
                  placeholder="Select Level 3"
                  loading={FilterLoading}
                  options={Level3Options}
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

export default ManageAccounts;
