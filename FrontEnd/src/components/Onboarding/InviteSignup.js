import React, { useEffect, useState } from "react";
import Logo from "../../assets/images/logo/white-v.svg";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { Form, Button, Input, message, Row, Col, Select } from "antd";
import Config from "../../Config";
import SubMenuToggle from "../Common/SubMenuToggle";
import axios from "axios";
import { useForm } from "antd/es/form/Form";

function InviteSignup() {
  const { Option } = Select;
  const params = useParams();
  const [acceptLoading, setAcceptLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const [countries, setCountries] = useState([]);
  const [selectedPrefix, setSelectedPrefix] = useState("+92");
  const AccessKey = localStorage.getItem("AccessKey");
  const [form] = useForm();

  useEffect(() => {
    document.title = "Sign Up";
    checkUserExists();

    const countryCodes = require("country-codes-list");
    const countryCodeObject = countryCodes.customList(
      "countryCode",
      "+{countryCallingCode}"
    );
    const countryCodeArray = Object.values(countryCodeObject);

    setCountries(countryCodeArray);
  }, [params.id]);

  const checkUserExists = async () => {
    try {
      const inviteResponse = await axios.get(
        `${Config.base_url}Invitation/ReadInvite/${params.id}`,
        {
          headers: { Authorization: `Bearer ${AccessKey}` },
        }
      );

      const invite = inviteResponse.data.invite;
      form.setFieldsValue(invite);
    } catch (error) {
      console.error("Error checking user existence:", error);
    }
  };

  const handleSubmit = async (values, action) => {
    if (action === "accept") {
      setAcceptLoading(true);
    } else if (action === "reject") {
      setRejectLoading(true);
    }

    const data = {
      ...values,
      isDeleted: false,
      isActive: true,
      email: values.toEmail,
      phoneNumber: `${selectedPrefix}${values.phoneNumber}`,
    };

    try {
      const { data: registerResponse } = await axios.post(
        `${Config.base_url}Account/invite-register`,
        data,
        {
          headers: {
            Authorization: `Bearer ${AccessKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (registerResponse.status_code !== 1) {
        message.error(registerResponse.status_message);
        return;
      }

      if (data.InviteCode) {
        let acceptResponse;

        if (action === "accept") {
          acceptResponse = await axios.get(
            `${Config.base_url}Invitation/accept?code=${data.InviteCode}`,
            {
              headers: { Authorization: `Bearer ${AccessKey}` },
            }
          );
        } else if (action === "reject") {
          acceptResponse = await axios.get(
            `${Config.base_url}Invitation/reject?code=${data.InviteCode}`,
            {
              headers: { Authorization: `Bearer ${AccessKey}` },
            }
          );
        }

        if (acceptResponse?.data?.status_code === 1) {
          if (action === "accept") {
            const inviteData = acceptResponse.data.invitation;

            await axios.post(
              `${Config.base_url}Account/assign-roles?companyID=${inviteData.fromUserCompanyID}`,
              {
                email: inviteData.toEmail,
                roles: [inviteData.invitedRole],
              },
              {
                headers: { Authorization: `Bearer ${AccessKey}` },
              }
            );
          }
          message.success(registerResponse.status_message);
        } else {
          message.error(acceptResponse?.data?.status_message || "Invitation action failed");
          return;
        }
      }

      navigate("/login");
    } catch (error) {
      message.error("Network Error...");
    } finally {
      setAcceptLoading(false);
      setRejectLoading(false);
    }
  };

  const onFinish = (values) => {
    handleSubmit(values, "accept");
  };

  const onReject = () => {
    form.validateFields().then((values) => {
      handleSubmit(values, "reject");
    }).catch((error) => {
      console.error("Validation Failed:", error);
    });
  };

  const prefixSelector = (
    <Form.Item name="prefix" noStyle>
      <Select
        style={{ width: 90 }}
        defaultValue={selectedPrefix}
        onChange={(value) => setSelectedPrefix(value)}
      >
        {countries.map((countryCode, index) => (
          <Option key={index} value={countryCode}>
            {countryCode}
          </Option>
        ))}
      </Select>
    </Form.Item>
  );

  return (
    <>
      <div className="auth-wrap">
        <div className="left-col">
          <div>
            <img src={Logo} alt="Logo" />
            <h3>
              Streamline Your Finances: Welcome to Effortless Invoicing &
              Accounting!
            </h3>
          </div>
        </div>
        <div className="right-col">
          <div className="header">
            <p>Already have an account?</p>
            <NavLink to="/login">
              <Button>Login</Button>
            </NavLink>
          </div>
          <div className="auth-form-wrap">
            <div className="section-title">
              <h2>Sign Up</h2>
              <p>
                Empower Your Business with Hassle-Free Financial Control. Join
                Us Today!
              </p>
            </div>

            <Form
              layout="vertical"
              size="large"
              className="form-default"
              form={form}
              onFinish={onFinish}
            >
              <Form.Item
                label="Full Name"
                name="userName"
                rules={[
                  {
                    required: true,
                    message: "Please input your Full Name!",
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="phoneNumber"
                label="Phone Number"
                rules={[
                  {
                    required: true,
                    message: "Please input your phone number!",
                  },
                ]}
              >
                <Input
                  addonBefore={prefixSelector}
                  style={{
                    width: "100%",
                  }}
                  maxLength={10}
                  minLength={10}
                />
              </Form.Item>
              <Form.Item
                label="Email Address"
                name="toEmail"
                rules={[
                  {
                    required: true,
                    message: "Please input your Email!",
                    type: "email",
                  },
                ]}
              >
                <Input onChange={(e) => setEmail(e.target.value)} readOnly />
              </Form.Item>
              <Form.Item
                label="Password"
                name="password"
                rules={[
                  {
                    required: true,
                    message: "Please input your Password!",
                  },
                ]}
              >
                <Input.Password />
              </Form.Item>
              <Form.Item
                label="Invitation Code"
                name="InviteCode"
                rules={[
                  {
                    required: true,
                    message: "Please input your Invitation Code!",
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <br />
              <Row gutter={16}>
                <Col span={12}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    loading={acceptLoading}
                  >
                    Sign Up & Accept Invite
                  </Button>
                </Col>
                <Col span={12}>
                  <Button
                    type="primary"
                    onClick={onReject}
                    block
                    loading={rejectLoading}
                  >
                    Sign Up & Reject Invite
                  </Button>
                </Col>
              </Row>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
}

export default InviteSignup;
