import React, { useEffect, useState } from "react";
import { PrinterOutlined } from "@ant-design/icons";
import PayrollMenu from "../PayrollMenu";

import { Form, Select, Button } from "antd";

function Zeroreports(props) {
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
            <h3 className="page-title">Zero Reports</h3>
            <div className="header-actions">
              <Button type="dashed" icon={<PrinterOutlined />}>
                Print
              </Button>
            </div>
          </div>
          <div className="filters-wrap">
            <Form onFinish={handleFilters}>
              <Form.Item name="Select Department">
                <Select
                  placeholder="Please Select "
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
        </div>
      </div>
    </>
  );
}

export default Zeroreports;
