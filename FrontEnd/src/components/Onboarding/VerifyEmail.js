import React, { useEffect, useState } from "react";

import Logo from "../../assets/images/logo/white-v.svg";
import { Link, useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { Form, Button, Input, message } from "antd";
import Config from "../../Config";
import SubMenuToggle from "../Common/SubMenuToggle";
import axios from "axios";

function VerifyEmail(props) {
  const [loading, setLoading] = useState(false);
  const email = localStorage.getItem("Email_Address");
  const AccessKey = localStorage.getItem("AccessKey");
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Verify Invite";
  });

  const handleVerifyEmail = (FormData) => {
    setLoading(true);
    const data = {
      email: email,
      ...FormData,
    };

    ////Console.log(data);
    var api_config = {
      method: "post",
      url: Config.base_url + "Account/verify-email",
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
          navigate("/company");
          setLoading(false);
        } else {
          message.error(response.data.status_message);
          setLoading(false);
        }
      })
      .catch(function (error) {
        setLoading(false);
        message.error("Network Error...");
      });
  };

  return (
    <>
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
            <p>Already have an account?</p>
            <NavLink to="/login">
              <Button>Login</Button>
            </NavLink>
          </div>
          <div className="auth-form-wrap">
            <div className="section-title" style={{ marginBottom: "50px" }}>
              <h2>Verify your email</h2>
              <p>A verify code has been sent to your email.</p>
            </div>
            <Form layout="vertical" size="large" onFinish={handleVerifyEmail}>
              <Form.Item
                label="Verification Code"
                name="code"
                rules={[
                  {
                    required: true,
                    message: "Please enter verification code",
                  },
                ]}
              >
                <Input />
              </Form.Item>

              <br />
              <Button type="primary" htmlType="submit" block loading={loading}>
                Verify Email
              </Button>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
}

export default VerifyEmail;
