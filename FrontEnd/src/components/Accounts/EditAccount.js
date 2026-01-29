import React, { useState, useEffect } from "react";
import AccountsMenu from "./AccountsMenu";
import { PlusOutlined } from "@ant-design/icons";

import { ArrowLeftIcon } from "@heroicons/react/24/solid";

import { NavLink, useNavigate, useParams } from "react-router-dom";

import {
  Card,
  Col,
  Form,
  Input,
  Row,
  Radio,
  Select,
  Button,
  message,
  Skeleton,
  DatePicker,
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import Config from "../../Config";
import SubMenuToggle from "../Common/SubMenuToggle";

function EditAccount(props) {
  const AccessKey = localStorage.getItem("AccessKey");
  const UserID = localStorage.getItem("ID");
  const FYear = localStorage.getItem("DefaultFYear");
  const UserName = localStorage.getItem("Full_Name");
  const CompanyID = localStorage.getItem("CompanyID");
  const [Accounts, setAccounts] = useState({});
  const [OpeningBalance, setOpeningBalance] = useState({});

  let navigate = useNavigate();
  let params = useParams();
  const [AccountID, setAccountID] = useState(params.id);

  // loadings
  const [loading, setLoading] = useState(false);
  const [loadingSaveAccount, setLoadingSaveAccount] = useState(false);

  const [form] = Form.useForm();

  const fetchOpeningBalance = async (accountCode) => {
    try {
      const api_config = {
        method: "get",
        url: `${Config.base_url}Balance/GetBalanceByCompanyID/${CompanyID}?accountCode=${accountCode}`,
        headers: {
          Authorization: `Bearer ${AccessKey}`,
          "Content-Type": "application/json",
        },
      };

      const response = await axios(api_config);
      //console.log("Opening Balance Response:", response.data);

      if (
        response.data.status_code === 1 &&
        response.data.accountBalance.length > 0
      ) {
        const balance = response.data.accountBalance[0];
        return {
          amount: balance.crAmt > 0 ? balance.crAmt : balance.drAmt,
          type: balance.crAmt > 0 ? "Credit" : "Debit",
          openingDate: balance.createdDate,
        };
      }
      return null;
    } catch (error) {
      console.error("Error fetching opening balance:", error);
      return null;
    }
  };

  useEffect(() => {
    const fetchAccountData = async () => {
      setLoading(true);
      try {
        const api_config = {
          method: "get",
          url: `${Config.base_url}AccountMain/GetRecord/${AccountID}`,
          headers: {
            Authorization: `Bearer ${AccessKey}`,
            "Content-Type": "application/json",
          },
        };

        const response = await axios(api_config);

        if (response.data.status_code === 1) {
          const accountData = response.data.accountData;

          // Redirect if company mismatch
          // if (CompanyID !== accountData.companyId) {
          //   navigate("/accounts/manage");
          //   return;
          // }

          setAccounts(accountData);

          // Fetch opening balance
          const openingBalanceData = await fetchOpeningBalance(
            accountData.accountCode
          );

          let amount = 0;
          let type = "Debit";
          let openingDate = null;

          if (openingBalanceData) {
            amount = openingBalanceData.amount;
            type = openingBalanceData.type;
            openingDate = openingBalanceData.openingDate
              ? new Date(openingBalanceData.openingDate)
              : null;
          } else {
            // Fallback to accountData values
            amount = accountData.drAmt || accountData.crAmt || 0;
            type = accountData.drAmt > 0 ? "Debit" : "Credit";
          }

          form.setFieldsValue({
            ...accountData,
            amount,
            type,
            openingDate: openingDate ? dayjs(openingDate) : null,
          });
        }
      } catch (error) {
        console.error("Error fetching account data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccountData();
  }, []);

  const handleSubmit = (FormData) => {
    setLoadingSaveAccount(true);

    // Determine the amount to add based on the type
    const amount =
      FormData.type === "Credit"
        ? FormData.amount
        : FormData.type === "Debit"
        ? FormData.amount
        : 0;

    // Prepare the data object
    const data = {
      accountId: AccountID,
      accountCode: Accounts.accountCode,
      accountName: FormData.accountDescription,
      companyId: CompanyID,
      drAmt:
        FormData.type === "Debit"
          ? (Accounts.drAmt || 0) + amount
          : Accounts.drAmt || 0,
      crAmt:
        FormData.type === "Credit"
          ? (Accounts.crAmt || 0) + amount
          : Accounts.crAmt || 0,
      fYear: FYear,
      budgetAllocation: FormData.budgetAllocation,
      isActive: true,
      isDeleted: false,
      modifyBy: UserName,
    };

    var api_config = {
      method: "post",
      url: Config.base_url + "Balance/UpdateBalance",
      headers: {
        Authorization: `Bearer ${AccessKey}`,
        "Content-Type": "application/json",
      },
      data: data,
    };

    axios(api_config)
      .then(function (response) {
        if (response.data.status_code === 1) {
          setLoadingSaveAccount(false);
          //console.log(response.data);
          form.resetFields();
          message.success(response.data.status_message);
          navigate("/accounts/manage");
        } else {
          message.error(response.data.status_message);
          //console.log(response.data);
          setLoadingSaveAccount(false);
        }
      })
      .catch(function (error) {
        setLoadingSaveAccount(false);
        console.error(error);
        message.error("An error occurred while saving the account.");
      });

    const data1 = {
      AccessKey: AccessKey,
      accountId: AccountID,
      companyId: CompanyID,
      accountDescription: FormData.accountDescription,
    };

    var api_config = {
      method: "patch",
      url: Config.base_url + `AccountMain/UpdateDescription/${AccountID}`,
      headers: {
        Authorization: `Bearer ${AccessKey}`,
        "Content-Type": "application/json",
      },
      data: data1,
    };

    axios(api_config)
      .then(function (response) {})
      .catch(function (error) {
        setLoadingSaveAccount(false);
        message.error("An error occurred while saving the account.");
      });
  };

  return (
    <>
      <div id="sub-menu-wrap">
        <h5>Accounts</h5>
        <AccountsMenu />
      </div>
      <div className="right-side-contents">
        <div className="page-content">
          <div className="page-header">
            <SubMenuToggle />
            <h3 className="page-title">
              <NavLink to="/accounts/manage">
                <ArrowLeftIcon />
              </NavLink>
              Edit Account
            </h3>
          </div>
          {loading ? (
            <>
              <Skeleton active />
              <Skeleton active />
              <Skeleton active />
            </>
          ) : (
            <>
              <Form
                layout="vertical"
                className="form-compact"
                onFinish={handleSubmit}
                scrollToFirstError={true}
                form={form}
                labelCol={{
                  span: 8,
                }}
                wrapperCol={{
                  span: 16,
                }}
              >
                <Form.Item label="Account Code" name="accountCode">
                  <Input readOnly />
                </Form.Item>
                <Form.Item label="Year" name="year">
                  <Input readOnly />
                </Form.Item>
                <Form.Item name="accountDescription" label="Account Name">
                  <Input />
                </Form.Item>
                <Form.Item
                  label="Opening Balance"
                  name="amount"
                  initialValue={0}
                  rules={[
                    {
                      required: Accounts.iLevel !== 2,
                      message: "Opening Balance is required",
                    },
                  ]}
                >
                  <Input disabled={Accounts.iLevel < 3} placeholder="0" />
                </Form.Item>
                <Form.Item label="Opening Balance Date" name="openingDate">
                  <DatePicker
                    disabled
                    style={{ width: "100%" }}
                    format="YYYY-MM-DD"
                    placeholder={
                      OpeningBalance && Object.keys(OpeningBalance).length > 0
                        ? "Opening Balance Date"
                        : "No opening balance data found"
                    }
                  />
                </Form.Item>

                <Form.Item
                  label="Balance Type"
                  name="type"
                  initialValue="Debit"
                  rules={[
                    {
                      required: Accounts.iLevel !== 2,
                      message: "Balance Type is required.",
                    },
                  ]}
                >
                  <Select
                    disabled={Accounts.iLevel < 3}
                    options={[
                      {
                        value: "Debit",
                        label: "Debit",
                      },
                      {
                        value: "Credit",
                        label: "Credit",
                      },
                    ]}
                  />
                </Form.Item>
                <Form.Item label="Budget Allocation" name="budgetAllocation">
                  <Input disabled={Accounts.iLevel < 3} />
                </Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={loadingSaveAccount}
                >
                  Save
                </Button>
              </Form>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default EditAccount;
