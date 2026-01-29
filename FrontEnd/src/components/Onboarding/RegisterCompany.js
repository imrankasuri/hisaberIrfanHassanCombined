import React, { useState, useEffect } from "react";
import { Button, Col, Form, Input, Row, message, Card, Select } from "antd";
import Config from "../../Config";
import SubMenuToggle from "../Common/SubMenuToggle";
import axios from "axios";
import moment from "moment";
import { useNavigate } from "react-router-dom";

function RegisterCompany(props) {
  const { Option } = Select;
  const AccessKey = localStorage.getItem("AccessKey");
  const UserID = localStorage.getItem("ID");
  const email = localStorage.getItem("Email_Address");
  const [loading, setLoading] = useState(false);
  const [currency, setCurrency] = useState("");
  const [countries, setCountries] = useState([]);
  const [selectedPrefix, setSelectedPrefix] = useState("+92");

  let navigate = useNavigate();

  useEffect(() => {
    document.title = "Register Company";
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

  const handleSubmit = async (FormData) => {
    setLoading(true);
    const data = {
      ...FormData,
      userId: UserID,
      isDeleted: false,
      isActive: true,
      packageName: "Free",
      email: email,
      mobile: selectedPrefix + FormData.mobile,
      phone: FormData.phone || 0,
    };

    try {
      const response = await axios.post(
        `${Config.base_url}CompanyInfo/RegisterCompany`,
        data,
        {
          headers: {
            Authorization: `Bearer ${AccessKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status_code === 1) {
        ////Console.log(response.data)
        const first = response.data.company;
        localStorage.setItem("CompanyCode", first.companyCode);
        localStorage.setItem("CompanyID", first.id);
        localStorage.setItem("CompanyName", first.name);
        localStorage.setItem("CompanyAddress", first.address);
        const roleResponse = await axios.post(
          `${Config.base_url}Account/assign-roles`,
          {
            companyID: first.id,
            email: first.email,
            roles: ["Admin"],
          },
          {
            headers: { Authorization: `Bearer ${AccessKey}` },
          }
        );
        ////Console.log(roleResponse)
        message.success(response.data.status_message);
        navigate("/change-company");
        setLoading(false);
      } else {
        message.error(response.data.status_message);
        setLoading(false);
      }
    } catch (error) {
      message.error("Network Error...");
      setLoading(false);
    }
  };

  const handleCurrencyChange = (value) => {
    setCurrency(value);
    //////Console.log("Selected currency:", value);
  };

  const handleSignOut = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <>
      <div className="right-side-contents">
        <div className="page-content">
          <div
            className="company-header page-header"
            style={{ justifyContent: "center" }}
          >
            <h3 className="page-title">Register Company</h3>
          </div>

          <Row justify="center">
            <Col xs={24} md={12}>
              <Card>
                <Form
                  layout="vertical"
                  size="large"
                  className="form-default"
                  onFinish={handleSubmit}
                >
                  <Row gutter={[24, 0]}>
                    <Col xs={24}>
                      <Form.Item
                        label="Company Name"
                        name="name"
                        rules={[
                          {
                            required: true,
                          },
                        ]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="mobile"
                        label="Mobile Number"
                        rules={[
                          {
                            required: true,
                            message: "Please input your mobile number!",
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
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item label="Phone Number" name="phone">
                        <Input maxLength={10} minLength={10} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="NTN"
                        name="ntn"
                        rules={[
                          {
                            required: true,
                          },
                        ]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Website"
                        name="website"
                        rules={[
                          {
                            required: true,
                          },
                        ]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col xs={24}>
                      <Form.Item
                        label="Address"
                        name="address"
                        rules={[
                          {
                            required: true,
                          },
                        ]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={24}>
                      <Form.Item
                        label="Currency"
                        name="currency"
                        rules={[
                          {
                            required: true,
                            message: "Please select a currency!",
                          },
                        ]}
                      >
                        <Select
                          placeholder="Select a currency"
                          onChange={handleCurrencyChange}
                        >
                          <Select.Option value="PKR">PKR</Select.Option>
                          <Select.Option value="USD">US Dollar</Select.Option>
                          <Select.Option value="GBP">UK Pound</Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: "20px",
                    }}
                  >
                    <Button type="default" onClick={handleSignOut}>
                      Logout
                    </Button>
                    <Button type="primary" htmlType="submit" loading={loading}>
                      Submit
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
}

export default RegisterCompany;
