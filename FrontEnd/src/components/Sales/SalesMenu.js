import React, { useState } from "react";

import { Breadcrumb, Layout, Menu, theme } from "antd";
import { NavLink } from "react-router-dom";
import {
  CreditCardIcon,
  DocumentChartBarIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import {
  DollarCircleOutlined,
  FileDoneOutlined,
  WalletOutlined,
  ProductOutlined,
} from "@ant-design/icons";
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
  getItem(
    <NavLink to="/sales/sales-invoices">Invoices</NavLink>,
    "1",
    <FileDoneOutlined />
  ),
  // getItem(
  //   <NavLink to="/sales/sales-receipts">Receipts</NavLink>,
  //   "2",
  //   <DollarCircleOutlined />
  // ),
  getItem(
    <NavLink to="/customer/manage">Manage Customers</NavLink>,
    "2",
    <ProductOutlined />
  ),
  getItem(
    <NavLink to="/customer/report">Customer Reports</NavLink>,
    "3",
    <DocumentChartBarIcon />
  ),
  getItem(
    <NavLink to="/customer/summary">Customer Summary</NavLink>,
    "4",
    <DocumentTextIcon />
  ),
];
const SalesMenu = () => {
  return (
    <Menu
      id="ant-sidemenu"
      defaultSelectedKeys={["0"]}
      mode="inline"
      items={items}
    />
  );
};
export default SalesMenu;
