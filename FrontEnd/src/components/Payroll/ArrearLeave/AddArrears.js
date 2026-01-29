import React, { useEffect, useState } from "react";
import PayrollMenu from "../PayrollMenu";

import { Form, Input, Select, Button, Checkbox } from "antd";

function AddArrears(props) {
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
            <h3 className="page-title">Arrear Leave Deduction</h3>
          </div>
          <div className="filters-wrap">
            <Form onFinish={handleFilters}>
              <Form.Item name="Gender">
                <Select
                  placeholder="Gender"
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
                  placeholder="Designation"
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
              <Form.Item name="Department">
                <Select
                  placeholder="Department"
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
              <Form.Item name="Status">
                <Select
                  placeholder="Status"
                  style={{ width: 180 }}
                  // onChange={handleChange}
                  options={[
                    {
                      value: "0",
                      label: "All",
                    },
                    {
                      value: "1",
                      label: "Current",
                    },
                    {
                      value: "1",
                      label: "Retired",
                    },
                  ]}
                />
              </Form.Item>
              <Form.Item name="Basic Pay Scale">
                <Select
                  placeholder="Basic Pay Scale"
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
              <Form.Item name="Staff Code">
                <Input placeholder="Staff Code" />
              </Form.Item>
              <Form.Item name="Staff ID">
                <Input placeholder="Staff ID" />
              </Form.Item>
              <Form.Item name="Keywords">
                <Input placeholder="Keywords" />
              </Form.Item>
              <Form.Item name="Order by">
                <Select
                  placeholder="Order by"
                  style={{ width: 180 }}
                  // onChange={handleChange}
                  options={[
                    {
                      value: "0",
                      label: "Alphabetic",
                    },
                    {
                      value: "1",
                      label: "DOJ ASC",
                    },
                    {
                      value: "2",
                      label: "DOJ Desc",
                    },
                    {
                      value: "3",
                      label: "Code Asc",
                    },
                    {
                      value: "4",
                      label: "Code Desc",
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

export default AddArrears;
