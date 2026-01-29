import React, { useState } from "react";

import { Breadcrumb, Layout, Menu, theme } from "antd";
import { NavLink } from "react-router-dom";
import {
  CreditCardIcon,
  DocumentChartBarIcon,
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
    <NavLink to="/sales/sales-receipts/add-sales-receipts">
      Receipt (SR)
    </NavLink>,
    "1",
    <FileDoneOutlined />
  ),

  getItem(
    <NavLink to="/customer/manage">Manage Customers</NavLink>,
    "2",
    <ProductOutlined />
  ),
  getItem(
    <NavLink to="/customer/report">Customer Reports</NavLink>,
    "sub1",
    <DocumentChartBarIcon />
  ),
];
const SalesReceiptMenu = () => {
  return (
    <Menu
      id="ant-sidemenu"
      defaultSelectedKeys={["0"]}
      mode="inline"
      items={items}
    />
  );
};
export default SalesReceiptMenu;
