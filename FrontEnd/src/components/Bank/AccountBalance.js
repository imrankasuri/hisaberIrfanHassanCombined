import { Form, Input, Table, Button, Modal, message } from "antd";
import React, { useEffect, useRef, useState } from "react";
import {
  PlusOutlined,
  PrinterOutlined,
  UploadOutlined,
} from "@ant-design/icons";

import { Link, NavLink } from "react-router-dom";
import ReportsMenu from "../Reports/ReportsMenu";
import Config from "../../Config";
import SubMenuToggle from "../Common/SubMenuToggle";
import LevelWiseAccount2 from "../Shared/LevelWiseAccount2";
import axios from "axios";
import ExcelJS from "exceljs";
import AddAccount from "../Shared/AddAccount";
import BankPrint from "../Shared/BankPrint";

function AccountBalance() {
  const AccessKey = localStorage.getItem("AccessKey");
  const User = localStorage.getItem("Full_Name");
  const CompanyID = localStorage.getItem("CompanyID");
  const FYear = localStorage.getItem("DefaultFYear");

  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  // pagination
  const [ListOfBank, setListOfBank] = useState([]);
  const [BankAccount, setBankAccount] = useState([]);
  const [TotalBalance, setTotalBalance] = useState(0);

  const [ModalForm] = Form.useForm();

  useEffect(() => {
    document.title = "Account Balances";
    fetchBankAccounts();
    const fetchAccounts = async () => {
      const BankAccounts = await LevelWiseAccount2(3, "50108");
      setBankAccount(BankAccounts);
    };
    fetchAccounts();
  }, []);

  const fetchBankAccounts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        Config.base_url + `Bank/GetAccountBalanceDetails/${CompanyID}`,
        {
          headers: {
            Authorization: `Bearer ${AccessKey}`,
          },
        }
      );

      ////Console.log(response.data);
      if (response.data.status_code == 1) {
        setListOfBank(response.data.listofRecords);
        setTotalBalance(response.data.totalBalance);
      } else {
        message.error(response.data.status_message);
      }
    } catch (error) {
      //console.error(error);
      message.error("Network Error..");
    } finally {
      setLoading(false);
    }
  };

  const AddNewBankAccount = async (FormData) => {
    try {
      // ////Console.log(BankAccount);
      const response = await AddAccount(FormData, BankAccount);
      if (response) {
        ModalForm.resetFields();
        fetchBankAccounts();
        setOpen(false);
      } else {
      }
    } catch (error) {
      // //console.error(error);
      message.error("Network Error..");
    }
  };

  const columns = [
    {
      title: "Sr#",
      dataIndex: "",
      key: "SR",
      width: "100px",
      render: (_, record, index) => index + 1,
    },
    {
      title: "Bank",
      dataIndex: "account",
      key: "account",
      width: "500px",
      render: (text, record) => (
        <>
          <>
            <NavLink
              className={"primary"}
              to={`/bank/report?source=${record.details}`}
            >
              {record.account}
            </NavLink>
          </>
        </>
      ),
      sorter: (a, b) => String(a.account).localeCompare(String(b.account)),
    },
    {
      title: "Balance",
      dataIndex: "balance",
      key: "balance",
      width: "500px",
      sorter: (a, b) => a.balance - b.balance,
    },
  ];

  const handleCancel = () => {
    setOpen(false);
  };
  const ShowModal = () => {
    setOpen(true);
  };

  const summary = () => {
    let bankTotal = 0;

    return (
      <Table.Summary.Row>
        <Table.Summary.Cell colSpan={2}>Total</Table.Summary.Cell>
        <Table.Summary.Cell>{TotalBalance.toFixed(2)}</Table.Summary.Cell>
      </Table.Summary.Row>
    );
  };

  // ////Console.log(BankAccount)

  const handleExport = () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Account Balances");

    // Set column headers and their widths
    sheet.columns = [
      { header: "Bank Name", key: "accountDescription", width: 30 },
      { header: "Balance", key: "balance", width: 30 },
    ];

    // Add rows to the sheet
    ListOfBank.forEach((bank, index) => {
      sheet.addRow({
        sr: index + 1,
        accountDescription: bank.account,
        balance: bank.balance,
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
      anchor.download = `AccountBalances_${dateString}.xlsx`;
      anchor.click();
      window.URL.revokeObjectURL(url);
    });
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
        <h5>Reports</h5>
        <ReportsMenu />
      </div>
      <div className="right-side-contents">
        <div className="page-content">
          <div className="page-header">
            <SubMenuToggle />
            <SubMenuToggle />
            <h3 className="page-title">Account Balances</h3>
            <div className="header-actions">
              <BankPrint
                selectedSupplier={selectedSupplier}
                startDate=""
                endDate=""
                User={User}
                title="Account Balances"
              />
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

          <Table
            columns={columns}
            dataSource={ListOfBank}
            size="small"
            loading={loading}
            summary={summary}
            pagination={{ defaultPageSize: 30 }}
          />
        </div>
      </div>
    </>
  );
}
export default AccountBalance;
