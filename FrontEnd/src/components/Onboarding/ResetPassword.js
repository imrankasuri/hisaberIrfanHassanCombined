import React, { useState, useEffect } from "react";

import Logo from "../../assets/images/logo/white-v.svg";
import { NavLink } from "react-router-dom";
import { Form, Button, Input, message } from "antd";
import { Link, useNavigate } from "react-router-dom";

import Config from "../../Config";
import SubMenuToggle from "../Common/SubMenuToggle";
import axios from "axios";

function ResetPassword(props) {
  const [loading, setLoading] = useState(false);
  const AccessKey = localStorage.getItem("AccessKey");
  useEffect(() => {
    document.title = "Reset Password";
  }, []);

  const email = localStorage.getItem("UserEmail");
  const token = localStorage.getItem("PasswordToken");

  const navigate = useNavigate();
  const handleSubmit = (FormData) => {
    setLoading(true);
    const data = {
      ...FormData,
      email: email,
      token: token,
    };

    ////Console.log(data);
    var api_config = {
      method: "post",
      url: Config.base_url + `Account/reset-password`,
      headers: {
        Authorization: `Bearer ${AccessKey}`,
        "Content-Type": "application/json",
      },
      data: data,
    };

    axios(api_config)
      .then(function (response) {
        if (response.data.status_code == 1) {
          message.success(response.data.status_message);
          navigate("/");
          setLoading(false);
        } else {
          message.error(response.data.status_message);
          setLoading(false);
        }
      })
      .catch(function (error) {
        message.error("Network Error...");
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
            <h2>Reset Password</h2>
            <p>Reset Your Password to Regain Access.</p>
          </div>

          <Form layout="vertical" size="large" onFinish={handleSubmit}>
            <Form.Item
              label="New Password"
              name="password"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item
              label="Confirm Password"
              name="confirmpassword"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Button type="primary" htmlType="submit" loading={loading} block>
              RESET PASSWORD
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
