import React, { useEffect, useState } from "react";
import { PrinterOutlined } from "@ant-design/icons";
import PayrollMenu from "../PayrollMenu";

import { Form, Select, Button } from "antd";

function ManageLeaves(props) {
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
            <h3 className="page-title">Manage Leave</h3>
            <div className="header-actions">
              <Button type="dashed" icon={<PrinterOutlined />}>
                Print
              </Button>
            </div>
          </div>
          <div className="filters-wrap">
            <Form onFinish={handleFilters}>
              <Form.Item name="Select Months">
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
              <Form.Item name="Select Year">
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
              <Form.Item name="Employee Code">
                <Select
                  placeholder="Employee Code"
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
              <Form.Item name="Salary Type">
                <Select
                  placeholder="Arrears"
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
              <Button htmlType="submit" className="button-cyan">
                Filter
              </Button>
            </Form>
          </div>
          <div className="ant-table-custom">
            <table className="table table-theme">
              <thead>
                <tr>
                  <th></th>
                  <th>ID</th>
                  <th>Code</th>
                  <th>Employee Name</th>
                  <th>Father Name</th>
                  <th>DOB</th>
                  <th>DOJ</th>
                  <th>Mobile No.</th>
                  <th>Designation</th>

                  <th>Action</th>
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

export default ManageLeaves;
