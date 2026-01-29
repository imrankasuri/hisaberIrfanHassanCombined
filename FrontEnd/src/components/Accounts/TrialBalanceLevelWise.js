import {
  Form,
  Input,
  Select,
  Table,
  Button,
  Checkbox,
  Space,
  Menu,
} from "antd";
import React, { useEffect, useState } from "react";
import {
  PlusOutlined,
  DownloadOutlined,
  UploadOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

import { ChevronDownIcon, PlusCircleIcon } from "@heroicons/react/24/solid";
import { NavLink } from "react-router-dom";
import AccountsMenu from "./AccountsMenu";
import SubMenuToggle from "../Common/SubMenuToggle";

function TrialBalanceLevelWise(props) {
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
      Code: 32,
      Level: 1,
    },
    {
      key: "2",
      name: "John",
      Code: 42,
      Level: 2,
    },
  ];

  const columns = [
    {
      title: "Sr#",
      dataIndex: "SR",
      key: "SR",
    },
    {
      title: "Account Code",
      dataIndex: "Code",
      key: "Code",
    },
    {
      title: "Account Desc.",
      dataIndex: "Description",
      key: "Description",
    },
    {
      title: "Level",
      dataIndex: "Level",
      key: "Level",
    },
    {
      title: "Actions",
      dataIndex: "Actions",
      key: "Actions",
      render: (_, record) => (
        <Space>
          <EditOutlined />
          <DeleteOutlined />
        </Space>
        // <Dropdown
        //   overlay={
        //     <Menu onClick={(e) => handleMenuClick(e, record)}>
        //       <Menu.Item icon={<EditOutlined />} key={1}>Edit</Menu.Item>
        //       <Menu.Item icon={<DeleteOutlined />} key={1}>Delete</Menu.Item>
        //     </Menu>
        //   }
        // >
        //   <Space>
        //   <MoreOutlined />
        //   </Space>
        // </Dropdown>
      ),
    },
  ];

  const handleMenuClick = (e, record) => {
    ////Console.log('Clicked on', e.key, 'for record:', record);
    // Here you can perform actions using the record object based on the selected action
  };

  const items = [
    {
      key: "1",
      label: "Edit",
    },
    {
      key: "2",
      label: "Delete",
      danger: true,
      //icon: <SmileOutlined />,
    },
  ];

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
            <h3 className="page-title">Trial Balance Level Wise</h3>
            <div className="header-actions">
              <Button type="dashed" icon={<DownloadOutlined />}>
                Import
              </Button>
              <Button type="dashed" icon={<UploadOutlined />}>
                Export
              </Button>

              <NavLink to="/accounts/add-account">
                <Button type="primary" icon={<PlusOutlined />}>
                  New
                </Button>
              </NavLink>
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
                <Input placeholder="Start Date" />
              </Form.Item>
              <Form.Item name="EndDate">
                <Input placeholder="End Date" />
              </Form.Item>
              <Form.Item>
                <Checkbox>Show Zero Accounts</Checkbox>
              </Form.Item>

              <Button htmlType="submit" className="button-cyan">
                Filter
              </Button>
            </Form>
          </div>

          <Table columns={columns} dataSource={dataSource} size="small" />
        </div>
      </div>
    </>
  );
}

export default TrialBalanceLevelWise;
