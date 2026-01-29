import React, { useState, useEffect } from "react";
import AccountsMenu from "./AccountsMenu";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { Form, Input, Button, message, Skeleton } from "antd";
import axios from "axios";
import Config from "../../Config";
import SubMenuToggle from "../Common/SubMenuToggle";

function EditBalance(props) {
  const AccessKey = localStorage.getItem("AccessKey");
  const UserID = localStorage.getItem("ID");
  const FYear = localStorage.getItem("DefaultFYear");
  const CompanyID = localStorage.getItem("CompanyID");
  const [Accounts, setAccounts] = useState({});
  const [crAmt, setCrAmt] = useState(0);
  const [drAmt, setDrAmt] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingSaveAccount, setLoadingSaveAccount] = useState(false);
  const [form] = Form.useForm();
  let navigate = useNavigate();
  let params = useParams();
  const [AccountID, setAccountID] = useState(params.id);

  useEffect(() => {
    setLoading(true);

    var api_config = {
      method: "get",
      url: `${Config.base_url}Balance/GetBalanceById/${AccountID}`,
      headers: {
        Authorization: `Bearer ${AccessKey}`,
        "Content-Type": "application/json",
      },
    };

    axios(api_config)
      .then(function (response) {
        ////Console.log(response.data.accountBalance);

        if (response.data.status_code === 1) {
          if (CompanyID != response.data.accountBalance.companyId) {
            navigate("/accounts/opening-balances");
          }
          setAccounts(response.data.accountBalance);
          setCrAmt(response.data.accountBalance.crAmt);
          setDrAmt(response.data.accountBalance.drAmt);
          setLoading(false);
          form.setFieldsValue(response.data.accountBalance);
        }
      })
      .catch(function (error) {
        ////Console.log(error);
      });
  }, [AccountID, AccessKey, form]);

  const handleSubmit = (FormData) => {
    setLoadingSaveAccount(true);
    const data = {
      id: AccountID,
      ...Accounts,
      drAmt: FormData.drAmt,
      crAmt: FormData.crAmt,
      budgetAllocation: FormData.budgetAllocation,
      modifyBy: UserID,
    };
    var api_config = {
      method: "patch",
      url: Config.base_url + `Balance/UpdateDescription/${AccountID}`,
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
          form.resetFields();
          message.success(response.data.status_message);
          navigate("/accounts/opening-balances");
        } else {
          message.error(response.data.status_message);
        }
      })
      .catch(function (error) {
        setLoadingSaveAccount(false);
        message.error("An error occurred while saving the account.");
      });
  };

  const isCrAmtReadOnly = crAmt === 0;
  const isDrAmtReadOnly = drAmt === 0;

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
              <NavLink to="/accounts/opening-balances">
                <ArrowLeftIcon />
              </NavLink>
              Edit Opening Balance
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
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
              >
                <Form.Item name="accountCode" label="Account Code">
                  <Input readOnly />
                </Form.Item>
                <Form.Item label="Budget Allocation" name="budgetAllocation">
                  <Input />
                </Form.Item>
                <Form.Item label="Credit Amount" name="crAmt">
                  <Input readOnly={isCrAmtReadOnly} />
                </Form.Item>
                <Form.Item name="drAmt" label="Debit Amount">
                  <Input readOnly={isDrAmtReadOnly} />
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

export default EditBalance;
