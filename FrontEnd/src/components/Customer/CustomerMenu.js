import React, { useState } from "react";
import {
  FileDoneOutlined,
  CreditCardOutlined,
  CalculatorOutlined,
  FileOutlined,
  PieChartOutlined,
  TeamOutlined,
  UserOutlined,
  RightOutlined,
  ProductOutlined,
} from "@ant-design/icons";
import { Breadcrumb, Layout, Menu, theme } from "antd";
import { NavLink } from "react-router-dom";
import { CubeIcon, DocumentChartBarIcon } from "@heroicons/react/24/outline";
const { Header, Content, Footer, Sider } = Layout;
function getItem(label, key, icon, children) {
  return {
    key,
    icon,
    children,
    label,
  };
}
const items = [
  // getItem(
  //   <NavLink to="/customer/manage">Manage Customers</NavLink>,
  //   "2",
  //   <ProductOutlined />
  // ),
  // getItem(
  //   <NavLink to="/customer/report">Customer Reports</NavLink>,
  //   "sub1",
  //   <DocumentChartBarIcon />
  // ),
  // getItem(
  //   <NavLink to="/accounts/opening-balances">Opening Balances</NavLink>,
  //   "sub2",
  //   <CreditCardOutlined />
  // ),
  // getItem(
  //   <NavLink to="/accounts/trial-balance-level-wise">
  //     Trial Balance Level Wise
  //   </NavLink>,
  //   "9",
  //   <FileOutlined />
  // ),
  // getItem(
  //   <NavLink to="/accounts/trial-balance-Head-wise">
  //     Trial Balance Head Wise
  //   </NavLink>,
  //   "10",
  //   <FileOutlined />
  // ),
  // getItem(
  //   <NavLink to="/accounts/Budget-Head-wise">Budget Head Wise</NavLink>,
  //   "11",
  //   <FileOutlined />
  // ),
  // getItem(
  //   <NavLink to="/accounts/Receipt-Payment-Account">
  //     Receipt Payment Account
  //   </NavLink>,
  //   "12",
  //   <CalculatorOutlined />
  // ),
];
const CustomerMenu = () => {
  return (
    <Menu
      id="ant-sidemenu"
      defaultSelectedKeys={["0"]}
      mode="inline"
      items={items}
    />
  );
};
export default CustomerMenu;
