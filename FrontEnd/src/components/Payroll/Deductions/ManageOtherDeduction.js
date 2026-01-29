import React, { useEffect, useState } from "react";
import { PrinterOutlined } from "@ant-design/icons";
import PayrollMenu from "../PayrollMenu";
import { PlusCircleIcon } from "@heroicons/react/24/solid";

import { Button, Form, Select, Input } from "antd";

function ManageOtherDeduction(props) {
  const [data, setData] = useState([]);
  const [form] = Form.useForm();

  const handleFilters = (formData) => {
    ////Console.log(formData);
  };

  const handleSubmit = (formData) => {
    setData([...data, formData]);
    form.resetFields();
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
            <h3 className="page-title">Manage Other Deduction</h3>
            <div className="header-actions">
              <Button type="dashed" icon={<PrinterOutlined />}>
                Print
              </Button>
            </div>
          </div>
          <div className="filters-wrap">
            <Form onFinish={handleFilters}>
              <Form.Item name="Month">
                <Select
                  placeholder="Month"
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
                  placeholder="Year"
                  style={{ width: 120 }}
                  // onChange={handleChange}
                  options={[
                    {
                      value: "0",
                      label: "2024",
                    },
                  ]}
                />
              </Form.Item>
              <Button htmlType="submit" className="button-cyan">
                Filter
              </Button>
            </Form>
          </div>

          <Form onFinish={handleSubmit} form={form}>
            <div className="ant-table-custom">
              <table className="table table-theme table-hover">
                <thead>
                  <tr>
                    <th>Serial No.</th>
                    <th>Deduction ID</th>
                    <th>Deduction</th>
                    <th>Staff Name</th>
                    <th>Dated</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => (
                    <tr key={index}>
                      <td></td>
                      <td></td>
                      <td>{item.Deduction}</td>
                      <td></td>
                      <td>{item.Date}</td>
                      <td></td>
                    </tr>
                  ))}
                  <tr className="table-form">
                    <td></td>
                    <td></td>
                    <td>
                      <Form.Item
                        className="mb-0"
                        name="Deduction"
                        rules={[
                          {
                            required: true,
                          },
                        ]}
                      >
                        <Input placeholder="Deduction" variant="borderless" />
                      </Form.Item>
                    </td>
                    <td></td>

                    <td>
                      <Form.Item className="mb-0" name="Date">
                        <Input placeholder="Date" variant="borderless" />
                      </Form.Item>
                    </td>
                    <td>
                      <button htmlType="submit">
                        <PlusCircleIcon />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Form>
        </div>
      </div>
    </>
  );
}

export default ManageOtherDeduction;
