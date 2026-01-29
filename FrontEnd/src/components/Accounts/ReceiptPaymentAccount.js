import { Form, Select, Button, DatePicker, Checkbox } from "antd";
import React, { useEffect, useState } from "react";
import { PrinterOutlined } from "@ant-design/icons";

import { ChevronDownIcon, PlusCircleIcon } from "@heroicons/react/24/solid";
import { NavLink } from "react-router-dom";
import AccountsMenu from "./AccountsMenu";
import SubMenuToggle from "../Common/SubMenuToggle";

function ReceiptPaymentAccount(props) {
  const handleFilters = (formData) => {
    ////Console.log(formData)
  };
  return (
    <>
      <div id="sub-menu-wrap">
        <h5>Accounts</h5>
        <AccountsMenu />
      </div>
      <div className="right-side-contents">
        <div className="page-content">
          <div className="page-header">
            <SubMenuToggle />
            <h3 className="page-title">Receipt Pyament Account</h3>
            <div className="header-actions">
              <Button type="dashed" icon={<PrinterOutlined />}>
                Print
              </Button>
            </div>
          </div>
          <div className="filters-wrap">
            <Form onFinish={handleFilters}>
              <Form.Item name="Level">
                <Select
                  placeholder="Level"
                  style={{ width: 120 }}
                  // onChange={handleChange}
                  options={[
                    {
                      value: "1",
                      label: "1st Level",
                    },
                    {
                      value: "2",
                      label: "2nd Level",
                    },
                    {
                      value: "3",
                      label: "3rd Level",
                    },
                  ]}
                />
              </Form.Item>

              <Form.Item name="AccountID">
                <DatePicker placeholder="As On" />
              </Form.Item>
              <Form.Item>
                <Checkbox>Show Zero Accounts</Checkbox>
              </Form.Item>
              <Form.Item>
                <Checkbox>Show 3rd Level Only</Checkbox>
              </Form.Item>

              <Button htmlType="submit" className="button-cyan">
                Filter
              </Button>
            </Form>
          </div>
          <div className="ant-table-custom">
            <table className="table table-theme table-hover">
              <tbody>
                <tr>
                  <th>Sr. No.</th>
                  <th>Account Code</th>
                  <th>Account Name</th>

                  <th colspan="2" className="text-center">
                    Utilized Budget
                  </th>
                  <th>Budget Allocation</th>
                  <th>Balance</th>
                </tr>

                <tr>
                  <th></th>
                  <th></th>
                  <th></th>
                  <th>Debit</th>
                  <th className="text-end">Credit</th>
                  <th></th>
                  <th></th>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export default ReceiptPaymentAccount;
