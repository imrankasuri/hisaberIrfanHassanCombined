import React, { useEffect, useState } from "react";
import {
  Button,
  Col,
  Form,
  Input,
  Row,
  message,
  Card,
  Spin,
  Select,
  Modal,
} from "antd";
import Config from "../../Config";
import SubMenuToggle from "../Common/SubMenuToggle";
import axios from "axios";
import LoginCheck from "../Shared/LoginCheck";
import SettingMenu from "./SettingMenu";
import { useParams, Link, NavLink, useNavigate } from "react-router-dom";
import { PlusCircleOutlined, StepForwardFilled } from "@ant-design/icons";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
const SendInvitation = () => {
  const { Option } = Select;
  useEffect(() => {
    document.title = "Invite User";
    fetchRoles();
  }, []);

  // messages
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const AccessKey = localStorage.getItem("AccessKey");
  const UserID = localStorage.getItem("ID");
  const CompanyID = localStorage.getItem("CompanyID");
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [roleLoading, setRoleLoading] = useState(false);
  const storedRoles = JSON.parse(localStorage.getItem("roles"));

  const [form] = Form.useForm();

  const fetchRoles = async () => {
    if (storedRoles.includes("0d42ee65-ea41-421e-81a3-af81fa61dcb8")) {
      setRoleLoading(true);
      try {
        const response = await axios.get(Config.base_url + "Account/GetRoles", {
          headers: {
            Authorization: `Bearer ${AccessKey}`,
          },
        });
        // ////Console.log(response.data);
        setRoles(response.data);
        setRoleLoading(false);
      } catch (error) {
        console.error(error);
        setRoleLoading(false);
      }
    }
  };

  const handleSubmit = (formData) => {
    if (storedRoles.includes("0d42ee65-ea41-421e-81a3-af81fa61dcb8")) {
      // ////Console.log("User has the 0d42ee65-ea41-421e-81a3-af81fa61dcb8 role");
      setLoading(true);
      const data = {
        ...formData,
        UserID: UserID,
        CompanyID: CompanyID,
        Email: formData.toEmail,
        ProductName: formData.invitedRole,
      };

      // ////Console.log(data);
      var api_config = {
        method: "post",
        url: Config.base_url + `Invitation/send`,
        headers: {
          Authorization: `Bearer ${AccessKey}`,
          "Content-Type": "application/json",
        },
        data: data,
      };

      axios(api_config)
        .then(function (response) {
          ////Console.log("response", response.data);

          if (response.data.status_code == 1) {
            message.success(response.data.status_message);
            setLoading(false);
            form.resetFields();
            navigate("/setting/manage-invites");
          } else {
            message.error(response.data.status_message);
            setLoading(false);
          }
        })
        .catch(function (error) {
          ////Console.log("response", error);
          setLoading(false);
          message.error("Network Error...");
        });
    } else {
      message.error("You don't have access to perform this task.");
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };
  const onFinish = (FormData) => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Modal
        title="New Role"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ role: "" }}
        >
          <Form.Item
            label="Role"
            name="role"
            rules={[
              {
                required: true,
                message: "Please input the new role!",
              },
            ]}
          >
            <Input placeholder="Enter role" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Add Role
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
      {contextHolder}
      <LoginCheck />

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
              Invite Users
            </h3>
          </div>

          <Row justify="start">
            <Col xs={24} md={9}>
              <Card title="Send Join Invitation">
                <Form
                  layout="vertical"
                  size="large"
                  onFinish={handleSubmit}
                  form={form}
                >
                  <Form.Item
                    label="Email"
                    name="toEmail"
                    rules={[
                      {
                        required: true,
                        message: "Please input your email!",
                      },
                      {
                        type: "email",
                        message: "Please enter a valid email!",
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    label="Role"
                    name="invitedRole"
                    rules={[
                      {
                        required: true,
                        message: "Please assign Role!",
                      },
                    ]}
                  >
                    <Select
                      placeholder="Select a role"
                      style={{ width: "100%" }}
                    >
                      {storedRoles.includes(
                        "0d42ee65-ea41-421e-81a3-af81fa61dcb8"
                      ) ? (
                        <>
                          <Select.Option value="Manager">Manager</Select.Option>
                          <Select.Option value="Operator">
                            Operator
                          </Select.Option>
                        </>
                      ) : (
                        <Select.Option disabled>No Roles Found</Select.Option>
                      )}
                    </Select>
                    {/* {storedRoles.includes("0d42ee65-ea41-421e-81a3-af81fa61dcb8") && (
                      <Link className="add-Modal" onClick={showModal}>
                        <PlusCircleOutlined /> Add New
                      </Link>
                    )} */}
                  </Form.Item>
                  <div style={{ textAlign: "right", marginTop: "20px" }}>
                    <Button type="primary" htmlType="submit" loading={loading}>
                      Send Invitation
                    </Button>
                  </div>
                </Form>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </>
  );
};

export default SendInvitation;
