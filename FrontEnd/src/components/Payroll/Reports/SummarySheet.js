import React, { useEffect, useState } from "react";
import { PlusOutlined, DownloadOutlined } from "@ant-design/icons";

import { ChevronDownIcon, PlusCircleIcon } from "@heroicons/react/24/solid";
import { NavLink } from "react-router-dom";
import PayrollMenu from "../PayrollMenu";

import { Col, Row, Form, Select, Input } from "antd";

function SummarySheet(props) {
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
            <h3 className="page-title">Summary Sheet</h3>
          </div>
          <div className="form-section">
            <div className="form-header">
              <Row>
                <Col span={12}>
                  <div className="left-form-tittle">
                    <h3>Option 1</h3>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="filters-wrap">
                    <Form onFinish={handleFilters}>
                      <Form.Item name="Month">
                        <Select
                          placeholder="April"
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
                      <Form.Item name="Year">
                        <Select
                          placeholder="2024"
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
                </Col>
              </Row>
            </div>
            <div className="form-header">
              <Row>
                <Col span={12}>
                  <div className="left-form-tittle">
                    <h3>Option 2</h3>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="filters-wrap">
                    <Form onFinish={handleFilters}>
                      <Form.Item name="Select Wing">
                        <Select
                          placeholder="Please Select"
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
                      <Form.Item name="Month">
                        <Select
                          placeholder="April"
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
                      <Form.Item name="Year">
                        <Select
                          placeholder="2024"
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
                </Col>
              </Row>
            </div>
            <div className="form-header">
              <Row>
                <Col span={12}>
                  <div className="left-form-tittle">
                    <h3>Option 3</h3>
                  </div>
                </Col>
                <Col span={12}>
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
                      <Form.Item name="Month">
                        <Select
                          placeholder="April"
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
                      <Form.Item name="Year">
                        <Select
                          placeholder="2024"
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
                </Col>
              </Row>
            </div>
            <div className="form-header">
              <Row>
                <Col span={12}>
                  <div className="left-form-tittle">
                    <h3>Option 4</h3>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="filters-wrap">
                    <Form onFinish={handleFilters}>
                      <Form.Item name="Select Grade">
                        <Select
                          placeholder="Please Select"
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
                      <Form.Item name="Month">
                        <Select
                          placeholder="April"
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
                      <Form.Item name="Year">
                        <Select
                          placeholder="2024"
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
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SummarySheet;
