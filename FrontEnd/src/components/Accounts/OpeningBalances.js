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
import Config from "../../Config";
import SubMenuToggle from "../Common/SubMenuToggle";
import axios from "axios";
import SettingMenu from "../Setting/SettingMenu";

function OpeningBalances(props) {
  const Accesskey = localStorage.getItem("AccessKey");
  const CompanyID = localStorage.getItem("CompanyID");
  const [AccountCode, setAccountCode] = useState("");
  const [balance, setBalance] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    document.title = "Opening Balance";
    fetchAccounts();
  }, []);

  const [loading, setLoading] = useState(false);

  const fetchAccounts = (accountCode = "") => {
    setLoading(true);

    const api_config = {
      method: "get",
      url: `${Config.base_url}Balance/GetBalanceByCompanyID/${CompanyID}?accountCode=${accountCode}`,
      headers: {
        Authorization: `Bearer ${Accesskey}`,
        "Content-Type": "application/json",
      },
    };

    axios(api_config)
      .then(function (response) {
        if (response.data && response.data.status_code === 1) {
          setBalance(response.data.accountBalance || []);
        } else {
          setBalance([]);
        }
        setLoading(false);
      })
      .catch(function () {
        message.error("Network Error..");
        setLoading(false);
        setBalance([]);
      });
  };

  const handleFilters = async (formData) => {
    const accCode = formData["accountCode"] || "";
    setAccountCode(accCode);
    fetchAccounts(accCode);
  };

  const onReset = () => {
    form.resetFields();
    setAccountCode("");
    fetchAccounts("");
  };

  const deleteAccount = async (sno) => {
    try {
      const accountToUpdate = balance.find((u) => u.id === sno);
      if (!accountToUpdate) {
        message.error("Opening Balance not found!");
        return;
      }

      const updatedAccount = {
        ...accountToUpdate,
        isActive: false,
        isDeleted: true,
      };

      await axios.patch(
        `${Config.base_url}Balance/DeleteAccount/${sno}`,
        updatedAccount,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Accesskey}`,
          },
        }
      );

      setBalance((prev) => prev.filter((account) => account.id !== sno));
      message.success("Balance deleted successfully.");
      fetchAccounts();
    } catch (error) {
      console.error("Error deleting balance:", error);
    }
  };

  const columns = [
    {
      title: "Sr#",
      dataIndex: "",
      key: "SR",
      render: (_, record, index) => index + 1,
    },

    {
      title: "Account Name",
      dataIndex: "accountName",
      key: "accountName",
    },
    {
      title: "Account Code",
      dataIndex: "accountCode",
      key: "accountCode",
    },
    {
      title: "Budget Allocation",
      dataIndex: "budgetAllocation",
      key: "budgetAllocation",
    },
    {
      title: "Credit Amount",
      dataIndex: "crAmt",
      key: "crAmt",
    },
    {
      title: "Debit Amount",
      dataIndex: "drAmt",
      key: "drAmt",
    },
    {
      title: "Actions",
      dataIndex: "Actions",
      key: "Actions",
      render: (_, record) => (
        <div className="table-actions">
          <NavLink
            className={"primary"}
            to={`/accounts/edit-balance/${record.id}`}
          >
            <EditOutlined />
          </NavLink>
          <Popconfirm
            title="Delete the task"
            description="Are you sure to delete this account?"
            onConfirm={() => deleteAccount(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <DeleteOutlined />
          </Popconfirm>
        </div>
      ),
    },
  ];

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
            <h3 className="page-title">Opening Balances</h3>
            <div className="header-actions">
              <Button type="dashed" icon={<DownloadOutlined />}>
                Import
              </Button>
              <Button type="dashed" icon={<UploadOutlined />}>
                Export
              </Button>

              <NavLink to="/accounts/add-account">
                <Button type="primary" icon={<PlusOutlined />}>
                  New
                </Button>
              </NavLink>
            </div>
          </div>
          <div className="filters-wrap">
            <Form onFinish={handleFilters} form={form}>
              <Form.Item name="accountCode">
                <Input
                  placeholder="Account Code"
                  onChange={(e) => setAccountCode(e.target.value)}
                />
              </Form.Item>
              <Button htmlType="submit" type="primary">
                Filter
              </Button>
              <Button onClick={onReset} type="link">
                Reset
              </Button>
            </Form>
          </div>

          <Table
            columns={columns}
            dataSource={balance}
            size="small"
            loading={loading}
            pagination={{ pageSize: 25 }}
          />
        </div>
      </div>
    </>
  );
}

export default OpeningBalances;
