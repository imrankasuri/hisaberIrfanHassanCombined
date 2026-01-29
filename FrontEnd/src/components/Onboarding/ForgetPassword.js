import React, { useState, useEffect } from "react";

import Logo from "../../assets/images/logo/white-v.svg";
import { NavLink } from "react-router-dom";
import { Form, Button, Input, message } from "antd";
import { Link, useNavigate } from "react-router-dom";

import Config from "../../Config";
import SubMenuToggle from "../Common/SubMenuToggle";
import axios from "axios";
import { useForm } from "antd/es/form/Form";

function ForgetPassword(props) {
  const [form] = useForm();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    document.title = "Forgot Password";
  }, []);
  const AccessKey = localStorage.getItem("AccessKey");
  const navigate = useNavigate();
  const handleSubmit = (FormData) => {
    setLoading(true);
    const data = {
      ...FormData,
      Email: FormData.Email,
    };

    ////Console.log(data);
    var api_config = {
      method: "post",
      url: Config.base_url + `Account/forget-password`,
      headers: {
        Authorization: `Bearer ${AccessKey}`,
        "Content-Type": "application/json",
      },
      data: data,
    };

    axios(api_config)
      .then(function (response) {
        if (response.data.status_code == 1) {
          localStorage.setItem("PasswordToken", response.data.token);
          localStorage.setItem("UserEmail", response.data.user.email);
          message.success(response.data.status_message);
          form.resetFields();
          setLoading(false);
        } else {
          message.error(response.data.status_message);
          setLoading(false);
        }
      })
      .catch(function (error) {
        message.error("Network Error...");
        setLoading(false);
      });
  };

  return (
    <div className="auth-wrap">
      <div className="left-col">
        <div>
          <img src={Logo} />
          <h3>
            Streamline Your Finances: Welcome to Effortless Invoicing &
            Accounting!
          </h3>
        </div>
      </div>
      <div className="right-col">
        <div className="header">
          <p>Don’t have an account?</p>
          <NavLink to="/signup">
            <Button>Register Now</Button>
          </NavLink>
        </div>
        <div className="auth-form-wrap">
          <div className="section-title" style={{ marginBottom: "50px" }}>
            <h2>Forgot Password</h2>
            <p>Reset Your Password to Regain Access.</p>
          </div>

          <Form
            layout="vertical"
            form={form}
            size="large"
            onFinish={handleSubmit}
          >
            <Form.Item
              label="Email"
              name="Email"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Button type="primary" htmlType="submit" loading={loading} block>
              GET RESET LINK
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default ForgetPassword;
