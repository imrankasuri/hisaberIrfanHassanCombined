import React, { useEffect, useState } from "react";

import {
  FileDoneOutlined,
  CreditCardOutlined,
  CalculatorOutlined,
  PhoneOutlined,
  PieChartOutlined,
  TeamOutlined,
  UserOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { NavLink } from "react-router-dom";
import PayrollMenu from "../PayrollMenu";
import SubMenuToggle from "../../Common/SubMenuToggle";

import {
  Tabs,
  Form,
  Input,
  Button,
  Radio,
  Select,
  DatePicker,
  Col,
  Row,
} from "antd";

function AddEmployee(props) {
  const [Step, setStep] = useState("1");

  const BasicInfo = () => (
    <>
      <div style={{ maxWidth: "500px" }}>
        <Form.Item
          label="Employee Code"
          name="EmpCode"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Full Name"
          name="FullName"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item label="Father Name">
          <Input />
        </Form.Item>

        <Form.Item label="Gender">
          <Radio.Group>
            <Radio value="Married"> Male </Radio>
            <Radio value="Single"> Female </Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item label="Marital Status">
          <Radio.Group>
            <Radio value="Married"> Married </Radio>
            <Radio value="Single"> Single </Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item label="Husband Name">
          <Input />
        </Form.Item>
        <Form.Item label="Date of Birth">
          <DatePicker />
        </Form.Item>
        <Form.Item label="Blood Group">
          <Select>
            <Select.Option value="A+">A+</Select.Option>
            <Select.Option value="A-">A-</Select.Option>
            <Select.Option value="B+">B+</Select.Option>
            <Select.Option value="B-">B-</Select.Option>
            <Select.Option value="AB+">AB+</Select.Option>
            <Select.Option value="AB-">AB-</Select.Option>
            <Select.Option value="O+">O+</Select.Option>
            <Select.Option value="O-">O-</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="CNIC No">
          <Input />
        </Form.Item>
        <Form.Item label="Old Serial No">
          <Input />
        </Form.Item>
        <Form.Item label="Long Leave Status">
          <Select>
            <Select.Option value="Long Leave">Long Leave</Select.Option>
            <Select.Option value="Available">Available</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="Promotion Date">
          <DatePicker />
        </Form.Item>
        <Form.Item label="Employeement Status">
          <Select>
            <Select.Option value="Permanent">Permanent</Select.Option>
            <Select.Option value="Temporary">Temporary</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="Qualification">
          <Input />
        </Form.Item>
      </div>
    </>
  );

  const AccountInfo = () => (
    <>
      <div style={{ maxWidth: "500px" }}>
        <Form.Item label="Bank Account No">
          <Input />
        </Form.Item>
        <Form.Item label="EOBI No">
          <Input />
        </Form.Item>
        <Form.Item label="NTN NO">
          <Input />
        </Form.Item>
        <Form.Item label="Designation">
          <Input />
        </Form.Item>
        <Form.Item label="Date of Joining">
          <DatePicker />
        </Form.Item>
        <Form.Item label="Password">
          <Input.Password />
        </Form.Item>
      </div>
    </>
  );

  const ContactInfo = () => (
    <>
      <div style={{ maxWidth: "500px" }}>
        <Form.Item label="Phone No">
          <Input />
        </Form.Item>
        <Form.Item label="Mobile No">
          <Input />
        </Form.Item>
        <Form.Item label="Email Address">
          <Input />
        </Form.Item>
        <Form.Item label="Home Address">
          <Input.TextArea />
        </Form.Item>
      </div>
    </>
  );

  const PayInfo = () => (
    <>
      <div style={{ maxWidth: "500px" }}>
        <Form.Item label="Basic Pay Scale">
          <Input />
        </Form.Item>
        <Form.Item label="Pay Scale GPS">
          <Input />
        </Form.Item>
        <Form.Item label="Group/Depart">
          <Input />
        </Form.Item>
        <Form.Item label="No of Increment">
          <Input />
        </Form.Item>
        <Form.Item label="Remarks">
          <Input.TextArea />
        </Form.Item>
      </div>
    </>
  );

  const onChange = (key) => {
    setStep(key);
  };
  const items = [
    {
      key: "1",
      label: "Personal Information",
      children: <BasicInfo />,
    },
    {
      key: "2",
      label: "Account Information",
      children: <AccountInfo />,
    },
    {
      key: "3",
      label: "Contact Information",
      children: <ContactInfo />,
    },
    {
      key: "4",
      label: "Pay Information",
      children: <PayInfo />,
    },
  ];

  const handleSubmit = (formData) => {
    ////Console.log(formData);
  };

  return (
    <>
      <div id="sub-menu-wrap">
        <h5>Payroll</h5>
        <PayrollMenu />
      </div>
      <div className="right-side-contents">
        <div className="page-content">
          <div className="page-header">
            <SubMenuToggle />
            <h3 className="page-title">
              <NavLink to="/payroll/employee/manage">
                <ArrowLeftIcon />
              </NavLink>
              Add Employee
            </h3>
          </div>
          <Form
            layout="horizontal"
            className="form-compact"
            onFinish={handleSubmit}
            scrollToFirstError={true}
            labelCol={{
              span: 8,
            }}
            wrapperCol={{
              span: 16,
            }}
          >
            <div className="form-section">
              <div className="form-header">
                <Row>
                  <Col md={10} xs={24}>
                    <div className="left-form-tittle">
                      <UserOutlined />
                      <h2>Personal Information</h2>
                      <p>
                        Enter basic personal details like name, date of birth,
                        and gender.
                      </p>
                    </div>
                  </Col>
                  <Col md={14} xs={24}>
                    <BasicInfo />
                  </Col>
                </Row>
              </div>
              <div className="form-header">
                <Row>
                  <Col md={10} xs={24}>
                    <div className="left-form-tittle">
                      <CreditCardOutlined />
                      <h2>Account Information</h2>
                      <p>Provide banking details for payroll processing.</p>
                    </div>
                  </Col>
                  <Col md={14} xs={24}>
                    <AccountInfo />
                  </Col>
                </Row>
              </div>
              <div className="form-header">
                <Row>
                  <Col md={10} xs={24}>
                    <div className="left-form-tittle">
                      <PhoneOutlined />
                      <h2>Contact Information</h2>
                      <p>
                        Input address, phone number, and email for communication
                        purposes.
                      </p>
                    </div>
                  </Col>
                  <Col md={14} xs={24}>
                    <ContactInfo />
                  </Col>
                </Row>
              </div>
              <div className="form-header bb-none">
                <Row>
                  <Col md={10} xs={24}>
                    <div className="left-form-tittle">
                      <FileDoneOutlined />
                      <h2>Pay Information</h2>
                      <p>
                        Specify salary, employment status, and any additional
                        compensation.
                      </p>
                    </div>
                  </Col>
                  <Col md={14} xs={24}>
                    <PayInfo />
                  </Col>
                </Row>
              </div>
            </div>
            <div className="form-footer">
              <Button htmlType="submit" type="primary" size="large">
                Save
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </>
  );
}

export default AddEmployee;
