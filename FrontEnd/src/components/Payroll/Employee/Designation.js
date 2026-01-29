import React, { useEffect, useState } from "react";
import { PlusOutlined, DownloadOutlined } from "@ant-design/icons";

import { ChevronDownIcon, PlusCircleIcon } from "@heroicons/react/24/solid";
import { NavLink } from "react-router-dom";
import PayrollMenu from "../PayrollMenu";

import { Form, Input, Select, Button,Row, Col, } from "antd";

function Designation(props) {
  return (
    <>
      <div id="sub-menu-wrap">
        <h5>Payroll</h5>
        <PayrollMenu />
      </div>
      <div className="right-side-contents">
        <div className="page-content">
          <div className=" d-flex page-header">
            <h3 className="page-title">Designation</h3>
          </div>
          <div className="ant-table-custom">
            <table class="table table-theme table-hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Job_Descriptions</th>
                  <th>Job_Requirements</th>
                  <th>Other_Details</th>
                  <th class="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
              <tr className="table-form">
                  <td></td>
                  <td>
                    <Input placeholder="Name" variant="borderless" />
                  </td>
                  <td>
                    <Input placeholder="Job Description" variant="borderless" />
                  </td>
                  <td>
                    <Input placeholder="Job Requirements" variant="borderless" />
                  </td>
                  <td>
                    <Input placeholder="Other Details" variant="borderless" />
                  </td>
                  <td>
                    <button><PlusCircleIcon /></button>
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

export default Designation;
