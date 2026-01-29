import React, { useEffect, useState } from "react";
import { PrinterOutlined, DownloadOutlined } from "@ant-design/icons";
import PayrollMenu from "../PayrollMenu";

import { Form, Select, Button, Checkbox } from "antd";

function BankSalaryList(props) {
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
            <h3 className="page-title">Bank Salary List</h3>
            <div className="header-actions">
              <Button type="dashed" icon={<DownloadOutlined />}>
                Download
              </Button>
              <Button type="dashed" icon={<PrinterOutlined />}>
                Print
              </Button>
            </div>
          </div>
          <div className="filters-wrap">
            <Form onFinish={handleFilters}>
              <Form.Item name="Gender">
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
              <Form.Item name="Designation">
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
              <Form.Item name="Code">
                <Select
                  placeholder="Code"
                  style={{ width: 180 }}
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
              <Form.Item name="All">
                <Select
                  placeholder="All"
                  style={{ width: 180 }}
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
              <Form.Item name="Department">
                <Select
                  placeholder="Please Select"
                  style={{ width: 180 }}
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
                <Checkbox>Loans</Checkbox>
              </Form.Item>
              <Form.Item>
                <Checkbox>Deductions</Checkbox>
              </Form.Item>
              <Button htmlType="submit" className="button-cyan">
                Filter
              </Button>
            </Form>
          </div>
          <div className="ant-table-custom">
            <table className="table table-theme table-hover">
              <thead>
                <tr>
                  <th>Sr. No</th>
                  <th>Old Serial</th>
                  <th>Code</th>
                  <th>Staff Name</th>
                  <th>Account No</th>
                  <th>Department Name</th>
                  <th>Designation</th>
                  <th>Total Salary</th>
                  <th>Loan Deduction</th>
                  <th>Other Deduction</th>
                  <th>Net Salary</th>
                </tr>
              </thead>
              <tbody></tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export default BankSalaryList;
