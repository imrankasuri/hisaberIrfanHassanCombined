import React, { useEffect, useState } from "react";
import { PlusOutlined, DownloadOutlined } from "@ant-design/icons";

import { ChevronDownIcon, PlusCircleIcon } from "@heroicons/react/24/solid";
import { NavLink } from "react-router-dom";
import PayrollMenu from "../PayrollMenu";

import { Form, Input, Select, Button } from "antd";
import SubMenuToggle from "../../Common/SubMenuToggle";

function ManageEmployees(props) {
  const handleChange = (value) => {
    ////Console.log(`selected ${value}`);
  };

  const handleFilters = (formData) => {
    ////Console.log(formData)
  };

  const dataSource = [
    {
      key: "1",
      name: "Mike",
      age: 32,
      address: "10 Downing Street",
    },
    {
      key: "2",
      name: "John",
      age: 42,
      address: "10 Downing Street",
    },
  ];

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Age",
      dataIndex: "age",
      key: "age",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
  ];

  return (
    <>
      <div id="sub-menu-wrap">
        <h5>Payroll</h5>
        <PayrollMenu />
      </div>
      <div className="right-side-contents">
        <div className="page-content">
          <div className=" d-flex page-header">
            <SubMenuToggle />
            <h3 className="page-title">Manage Employees</h3>
            <div className="header-actions">
              <Button type="dashed" icon={<DownloadOutlined />}>
                Export
              </Button>
              <NavLink to="/payroll/employee/add">
                <Button type="primary" icon={<PlusOutlined />}>
                  New Employee
                </Button>
              </NavLink>
            </div>
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
              <Form.Item name="AccountID">
                <Input placeholder="Account No" />
              </Form.Item>

              <Button htmlType="submit" className="button-cyan">
                Filter
              </Button>
            </Form>
          </div>
          <div className="ant-table-custom">
            <table>
              <thead>
                <tr>
                  <th scope="col">SR#</th>
                  <th scope="col">Account Code</th>
                  <th scope="col">Account Desc</th>
                  <th scope="col">Level</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>00312</td>
                  <td>Some Description</td>
                  <td>3</td>
                  <td></td>
                </tr>
                <tr>
                  <td>1</td>
                  <td>00312</td>
                  <td>Some Description</td>
                  <td>3</td>
                  <td></td>
                </tr>
                <tr>
                  <td>1</td>
                  <td>00312</td>
                  <td>Some Description</td>
                  <td>3</td>
                  <td></td>
                </tr>
                <tr>
                  <td>1</td>
                  <td>00312</td>
                  <td>Some Description</td>
                  <td>3</td>
                  <td></td>
                </tr>
                <tr className="table-form">
                  <td></td>
                  <td>
                    <Input placeholder="Account Code" variant="borderless" />
                  </td>
                  <td>
                    <Input placeholder="Description" variant="borderless" />
                  </td>
                  <td>
                    <Select
                      placeholder="Level"
                      variant="borderless"
                      style={{
                        width: 100,
                      }}
                      options={[
                        {
                          value: "1",
                          label: "1",
                        },
                        {
                          value: "2",
                          label: "2",
                        },
                        {
                          value: "3",
                          label: "3",
                        },
                      ]}
                    />
                  </td>
                  <td>
                    <button>
                      <PlusCircleIcon />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export default ManageEmployees;
