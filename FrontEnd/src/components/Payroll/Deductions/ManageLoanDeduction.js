import React, { useEffect, useState } from "react";
import { PrinterOutlined } from "@ant-design/icons";
import { PlusCircleIcon } from "@heroicons/react/24/solid";

import PayrollMenu from "../PayrollMenu";

import { Form, Select, Button, Input, DatePicker } from "antd";

function ManageLoanDeduction(props) {
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
            <h3 className="page-title">Manage Loan Deduction</h3>
            <div className="header-actions">
              <Button type="dashed" icon={<PrinterOutlined />}>
                Print
              </Button>
            </div>
          </div>
          <div className="filters-wrap">
            <Form onFinish={handleFilters}>
              <Form.Item name="Select Month">
                <Select
                  placeholder="Select Month"
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
                  placeholder="Select Year"
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
              <Button htmlType="submit" className="button-cyan">
                Filter
              </Button>
            </Form>
          </div>
          <div className="ant-table-custom">
            <table className="table table-theme table-hover">
              <thead>
                <tr>
                  <th>Sr.#</th>
                  <th>ID</th>
                  <th>Status</th>
                  <th>Deduction</th>
                  <th>Amount</th>
                  <th>Staff Code</th>
                  <th>Staff Name</th>
                  <th>Dated</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr className="table-form">
                  <td></td>
                  <td></td>
                  <td>
                    <Input placeholder="Status" variant="borderless" />
                  </td>
                  <td>
                    <Input placeholder="Deduction" variant="borderless" />
                  </td>
                  <td>
                    <Input placeholder="Loan Amount" variant="borderless" />
                  </td>
                  <td></td>
                  <td></td>

                  <td>
                    <Input placeholder="Date" variant="borderless" />
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

export default ManageLoanDeduction;
