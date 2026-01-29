import React, { useEffect, useState } from "react";
import { PlusOutlined, DownloadOutlined } from "@ant-design/icons";

import { ChevronDownIcon, PlusCircleIcon } from "@heroicons/react/24/solid";
import { NavLink } from "react-router-dom";
import PayrollMenu from "../PayrollMenu";

import { Form, Input, Select, Button } from "antd";

function Viewreports(props) {
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
            <h3 className="page-title">View Reports</h3>
          </div>
          <div className="filters-wrap">
            <Form onFinish={handleFilters}>
              <Form.Item name="Select Departmen">
                <Select
                  placeholder="All"
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
              <Form.Item name="Select Year">
                <Select
                  placeholder="2024"
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
        </div>
      </div>
    </>
  );
}

export default Viewreports;
