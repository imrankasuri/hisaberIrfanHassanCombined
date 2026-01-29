import React, { useEffect, useState } from "react";
import Logo from "../../assets/images/logo/white-v.svg";
import { Link, useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { Form, Button, Input, message, Select } from "antd";
import Config from "../../Config";
import SubMenuToggle from "../Common/SubMenuToggle";
import axios from "axios";

function Signup(props) {
  const { Option } = Select;
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [countries, setCountries] = useState([]);
  const [selectedPrefix, setSelectedPrefix] = useState("+92"); // Default value for country code
  const navigate = useNavigate();
  const AccessKey = localStorage.getItem("AccessKey");

  const handleSubmit = async (FormData) => {
    setLoading(true);
    const data = {
      ...FormData,
      isDeleted: false,
      isActive: true,
      phoneNumber: selectedPrefix + FormData.phoneNumber,
    };

    try {
      var api_config = {
        method: "post",
        url: Config.base_url + "Account/register",
        headers: {
          Authorization: `Bearer ${AccessKey}`,
          "Content-Type": "application/json",
        },
        data: data,
      };

      const response = await axios(api_config);
      ////Console.log(response.data)
      if (response.data.status_code === 1) {
        message.success(response.data.status_message);
        navigate("/login");
        setLoading(false);
      } else if (response.data.status_code === 2) {
        message.error(response.data.status_message);
        setLoading(false);
        navigate(`/verify-invite/${response.data.inviteData.inviteCode}`);
      } else {
        message.error(response.data.status_message);
        setLoading(false);
      }
    } catch (error) {
      message.error("Network Error...");
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Sign Up";
    const countryCodes = require("country-codes-list");
    const countryCodeObject = countryCodes.customList(
      "countryCode",
      "+{countryCallingCode}"
    );
    const countryCodeArray = Object.values(countryCodeObject);

    setCountries(countryCodeArray);
  }, []);

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
              onFinish={handleSubmit}
            >
              <Form.Item
                label="Full Name"
                name="username"
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
                name="email"
                rules={[
                  {
                    required: true,
                    message: "Please input your Email!",
                    type: "email",
                  },
                ]}
              >
                <Input onChange={(e) => setEmail(e.target.value)} />
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
              <br />
              <Button type="primary" htmlType="submit" block loading={loading}>
                Create Account
              </Button>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
}

export default Signup;
