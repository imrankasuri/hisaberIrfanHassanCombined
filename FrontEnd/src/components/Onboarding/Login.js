import React, { useState, useEffect } from "react";

import Logo from "../../assets/images/logo/white-v.svg";
import { NavLink } from "react-router-dom";
import { Form, Button, Input, message, Flex, Checkbox } from "antd";
import { Link, useNavigate } from "react-router-dom";

import Config from "../../Config";
import SubMenuToggle from "../Common/SubMenuToggle";
import axios from "axios";

function Login(props) {
  const [loading, setLoading] = useState(false);
  const AccessKey = localStorage.getItem("AccessKey");
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Login"
  })

  const handleSubmit = async (FormData) => {
    setLoading(true);
    try {

      const data = {
        ...FormData,
      };

      var api_config = {
        method: "post",
        url: Config.base_url + "Account/login",
        headers: {
          Authorization: `Bearer ${AccessKey}`,
          "Content-Type": "application/json",
        },
        data: data,
      };

      const response = await axios(api_config)

      if (response.data.status_code == 1) {
        localStorage.setItem("AccessKey", response.data.token);
        localStorage.setItem("ID", response.data.user.id);
        localStorage.setItem("Full_Name", response.data.user.fullName);
        localStorage.setItem("Email_Address", response.data.user.email);
        localStorage.setItem("Mobile_No", response.data.user.phoneNumber);
        localStorage.setItem(
          "DefaultFYear",
          response.data.user.createdDate.substring(0, 4)
        );
        if (response.data.user.emailConfirmed === false) {
          navigate("/verify-email");
        } else {
          navigate("/company");
          window.location.reload();
        }
        setLoading(false);
      } else {
        message.error(response.data.status_message);
        setLoading(false);
      }
    }
    catch (error) {
      // console.error(error)
      message.error('Network error');
      setLoading(false)
    }
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
            <h2>Welcome Back!</h2>
            <p>Unlock Seamless Financial Management with Every Sign-In.</p>
          </div>

          <Form
            layout="vertical"
            size="large"
            className="form-default"
            onFinish={handleSubmit}
          >
            <Form.Item
              label="Email Address"
              name="email"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Password"
              name="password"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                }}
              >
                <div></div>
                <Link to="/forgot-password">Forgot password</Link>
              </div>
            </Form.Item>

            <Button type="primary" htmlType="submit" loading={loading} block>
              LOGIN
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default Login;
