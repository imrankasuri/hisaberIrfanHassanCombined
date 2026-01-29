import React, { useEffect, useState } from "react";
import { PlusOutlined, DownloadOutlined } from "@ant-design/icons";

import { ChevronDownIcon, PlusCircleIcon } from "@heroicons/react/24/solid";
import { NavLink } from "react-router-dom";
import PayrollMenu from "../PayrollMenu";

import { Form, Input, Select, Button, Col, Row, Checkbox } from "antd";

function IncreaseDecreaseSalary(props) {
  const handleFilters = (formData) => {
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
          <div className=" d-flex page-header">
            <h3 className="page-title">Increse Decrese Salary</h3>
          </div>
          <div className="form-section">
            <div className="form-header">
              <Row>
                <Col span={4}>
                  <div className="left-form-tittle">
                    <h3>Option 1</h3>
                  </div>
                </Col>
                <Col span={18}>
                  <p>Increase In Salary Type (%) :</p>
                  <div className="filters-wrap">
                    <Form onFinish={handleFilters}>
                      <Form.Item name="Select Type">
                        <Select
                          placeholder="Loading"
                          style={{ width: 120 }}
                          // onChange={handleChange}
                          options={[
                            {
                              value: "0",
                              label: "All",
                            },
                            {
                              value: "1",
                              label: "Male",
                            },
                            {
                              value: "2",
                              label: "Female",
                            },
                          ]}
                        />
                      </Form.Item>
                      <Form.Item>
                        <Input placeholder="Amount" />
                      </Form.Item>
                    </Form>
                  </div>
                  <Button htmlType="submit" type="primary" size="large">
                    Save
                  </Button>
                </Col>
              </Row>
            </div>
            <div className="form-header">
              <Row>
                <Col span={4}>
                  <div className="left-form-tittle">
                    <h3>Option 2</h3>
                  </div>
                </Col>
                <Col span={18}>
                  <p>Increase In Salary Type (Amount)</p>
                  <div className="filters-wrap">
                    <Form onFinish={handleFilters}>
                      <Form.Item name="Select Type">
                        <Select
                          placeholder="Loading"
                          style={{ width: 120 }}
                          // onChange={handleChange}
                          options={[
                            {
                              value: "0",
                              label: "All",
                            },
                            {
                              value: "1",
                              label: "Male",
                            },
                            {
                              value: "2",
                              label: "Female",
                            },
                          ]}
                        />
                      </Form.Item>
                      <Form.Item name="Grades">
                        <Select
                          placeholder="AllGrades"
                          style={{ width: 120 }}
                          // onChange={handleChange}
                          options={[
                            {
                              value: "0",
                              label: "All Levels",
                            },
                            {
                              value: "1",
                              label: "Jack (100)",
                            },
                          ]}
                        />
                      </Form.Item>
                      <Form.Item>
                        <Input placeholder="Amount" />
                      </Form.Item>
                    </Form>
                  </div>
                  <Button htmlType="submit" type="primary" size="large">
                    Save
                  </Button>
                </Col>
              </Row>
            </div>
            <div className="form-header">
              <Row>
                <Col span={4}>
                  <div className="left-form-tittle">
                    <h3>Option 3</h3>
                  </div>
                </Col>
                <Col span={18}>
                  <p>Add New Column in Salary Type to All Staff</p>
                  <div className="filters-wrap">
                    <Form onFinish={handleFilters}>
                      <Form.Item name="Select Designation">
                        <Select
                          placeholder=" Accountant"
                          style={{ width: 120 }}
                          // onChange={handleChange}
                          options={[
                            {
                              value: "0",
                              label: "All",
                            },
                            {
                              value: "1",
                              label: "Male",
                            },
                            {
                              value: "2",
                              label: "Female",
                            },
                          ]}
                        />
                      </Form.Item>
                      <Form.Item name="Grades">
                        <Select
                          placeholder="AllGrades"
                          style={{ width: 120 }}
                          // onChange={handleChange}
                          options={[
                            {
                              value: "0",
                              label: "All Levels",
                            },
                            {
                              value: "1",
                              label: "Jack (100)",
                            },
                          ]}
                        />
                      </Form.Item>
                      <Form.Item>
                        <Input placeholder="Amount" />
                      </Form.Item>
                      <Form.Item>
                        <Checkbox>Percentage (%)</Checkbox>
                      </Form.Item>
                      <Form.Item>
                        <Checkbox>Value</Checkbox>
                      </Form.Item>
                      <Form.Item name="Add As">
                        <Select
                          placeholder="Loading..."
                          style={{ width: 120 }}
                          // onChange={handleChange}
                          options={[
                            {
                              value: "0",
                              label: "All Levels",
                            },
                            {
                              value: "1",
                              label: "Jack (100)",
                            },
                          ]}
                        />
                      </Form.Item>
                    </Form>
                  </div>
                  <Button htmlType="submit" type="primary" size="large">
                    Save
                  </Button>
                </Col>
              </Row>
            </div>
            <div className="form-header">
              <Row>
                <Col span={4}>
                  <div className="left-form-tittle">
                    <h3>Option 4</h3>
                  </div>
                </Col>
                <Col span={18}>
                  <p>Decrease Salary As Misc Deduction</p>
                  <div className="filters-wrap">
                    <Form onFinish={handleFilters}>
                      <Form.Item name="Select Type">
                        <Select
                          placeholder="Gross"
                          style={{ width: 120 }}
                          // onChange={handleChange}
                          options={[
                            {
                              value: "0",
                              label: "All",
                            },
                            {
                              value: "1",
                              label: "Male",
                            },
                            {
                              value: "2",
                              label: "Female",
                            },
                          ]}
                        />
                      </Form.Item>
                      <Form.Item name="Grades">
                        <Select
                          placeholder="1"
                          style={{ width: 120 }}
                          // onChange={handleChange}
                          options={[
                            {
                              value: "0",
                              label: "All Levels",
                            },
                            {
                              value: "1",
                              label: "Jack (100)",
                            },
                          ]}
                        />
                      </Form.Item>
                      <Form.Item>
                        <Input placeholder="Amount" />
                      </Form.Item>
                      <Form.Item>
                        <Checkbox>Percentage (%)</Checkbox>
                      </Form.Item>
                      <Form.Item>
                        <Checkbox>Value</Checkbox>
                      </Form.Item>
                    </Form>
                  </div>
                  <Button htmlType="submit" type="primary" size="large">
                    Save
                  </Button>
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default IncreaseDecreaseSalary;
