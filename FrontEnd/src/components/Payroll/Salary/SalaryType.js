import React, { useEffect, useState } from "react";
import { PlusOutlined, DownloadOutlined } from "@ant-design/icons";

import { ChevronDownIcon, PlusCircleIcon } from "@heroicons/react/24/solid";
import { NavLink } from "react-router-dom";
import PayrollMenu from "../PayrollMenu";

import { Form, Input, Select, Button } from "antd";

function SalaryType(props) {
  return (
    <>
      <div id="sub-menu-wrap">
        <h5>Payroll</h5>
        <PayrollMenu />
      </div>
      <div className="right-side-contents">
        <div className="page-content">
          <div className=" d-flex page-header">
            <h3 className="page-title">Salary Type</h3>
          </div>
          <div className="ant-table-custom">
            <table class="table table-theme table-hover">
              <thead>
                <tr>
                  <th>Salary Type ID</th>
                  <th>Salary Type Name</th>
                  <th class="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr className="table-form">
                  <td>
                    <Input placeholder="Salary Type ID" variant="borderless" />
                  </td>
                  <td>
                    <Input placeholder="Salary Type Name" variant="borderless" />
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

export default SalaryType;
