import React, { useState, useEffect } from "react";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { Form, Input, Button, message, Skeleton, Spin, Select } from "antd";
import axios from "axios";
import Config from "../../Config";
import SubMenuToggle from "../Common/SubMenuToggle";
import SettingMenu from "./SettingMenu";

function EditUser(props) {
  const AccessKey = localStorage.getItem("AccessKey");
  const UserID = localStorage.getItem("ID");
  const FYear = localStorage.getItem("DefaultFYear");
  const CompanyID = localStorage.getItem("CompanyID");
  const [user, setUser] = useState({});
  const [roles, setRoles] = useState([]);
  const [roleLoading, setRoleLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingSaveAccount, setLoadingSaveAccount] = useState(false);
  const [form] = Form.useForm();
  let navigate = useNavigate();
  let params = useParams();
  const [AccountID, setAccountID] = useState(params.id);
  const storedRoles = JSON.parse(localStorage.getItem("roles"));

  useEffect(() => {
    if (
      storedRoles.includes("0d42ee65-ea41-421e-81a3-af81fa61dcb8") ||
      storedRoles.includes("c0e13885-a951-4ef0-a8e9-25264d61e8aa")
    ) {
      fetchRoles();
      setLoading(true);

      var api_config = {
        method: "get",
        url: `${Config.base_url}Invitation/GetInvitation/${AccountID}`,
        headers: {
          Authorization: `Bearer ${AccessKey}`,
          "Content-Type": "application/json",
        },
      };

      axios(api_config)
        .then(function (response) {
          ////Console.log(response.data);
          setUser(response.data.inviteData);
          setLoading(false);
          form.setFieldsValue(response.data.inviteData);
        })
        .catch(function (error) {
          ////Console.log(error);
          setLoading(false);
        });
    } else {
      // message.error(response.data.status_message);
    }
  }, [AccountID, AccessKey, form]);

  const handleSubmit = async (FormData) => {
    if (
      storedRoles.includes("0d42ee65-ea41-421e-81a3-af81fa61dcb8") ||
      storedRoles.includes("c0e13885-a951-4ef0-a8e9-25264d61e8aa")
    ) {
      setLoadingSaveAccount(true);
      const data = {
        ...FormData,
      };
      try {
        const updatedAccount = {
          ...user,
          invitedRole: data.invitedRole,
        };

        await axios.patch(
          `${Config.base_url}Invitation/EditAccount/${user.id}`,
          updatedAccount,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${AccessKey}`,
            },
          }
        );

        // message.success(response.data.status_message);
        setLoadingSaveAccount(false);
        navigate("/setting/manage-invites");
      } catch (error) {
        // message.error(response.data.status_message);
        setLoadingSaveAccount(false);
      }
    }
  };

  const fetchRoles = async () => {
    if (
      storedRoles.includes("0d42ee65-ea41-421e-81a3-af81fa61dcb8") ||
      storedRoles.includes("c0e13885-a951-4ef0-a8e9-25264d61e8aa")
    ) {
      setRoleLoading(true);
      try {
        const response = await axios.get(Config.base_url + "Account/GetRoles", {
          headers: {
            Authorization: `Bearer ${AccessKey}`,
          },
        });
        setRoles(response.data);
        setRoleLoading(false);
      } catch (error) {
        console.error(error);
        setRoleLoading(false);
      }
    }
  };

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
            <h3 className="page-title">
              <NavLink to="/setting/manage-invites">
                <ArrowLeftIcon />
              </NavLink>
              Edit Invite
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
                <Form.Item label="To Email" name="toEmail">
                  <Input readOnly />
                </Form.Item>
                <Form.Item name="invitedRole" label="Invited Role">
                  <Select placeholder="Invited Role">
                    {storedRoles.includes(
                      "0d42ee65-ea41-421e-81a3-af81fa61dcb8"
                    ) ? (
                      <>
                        <Select.Option value="Manager">Manager</Select.Option>
                        <Select.Option value="Operator">Operator</Select.Option>
                      </>
                    ) : (
                      <Select.Option disabled>No Roles Found</Select.Option>
                    )}
                  </Select>
                </Form.Item>
                <Form.Item label="Invite Status" name="inviteStatus">
                  <Input readOnly />
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

export default EditUser;
