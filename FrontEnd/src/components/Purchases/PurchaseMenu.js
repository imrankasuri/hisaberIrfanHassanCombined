import React, { useState } from "react";

import { Breadcrumb, Layout, Menu, theme } from "antd";
import { NavLink } from "react-router-dom";
import {
  ArrowUpOnSquareIcon,
  BanknotesIcon,
  CreditCardIcon,
  ReceiptPercentIcon,
  Squares2X2Icon,
  DocumentArrowDownIcon,
  DocumentChartBarIcon
} from "@heroicons/react/24/outline";
import {
  DollarOutlined,
  FileTextOutlined,
  ProductOutlined,

} from "@ant-design/icons";
import { DocumentTextIcon } from "@heroicons/react/24/solid";
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
    <NavLink to="/purchases/purchase-bills">Supplier Bills</NavLink>,
    "1",
    <FileTextOutlined />
  ),
  // getItem(
  //   <NavLink to="/purchases/purchase-payments">Payments</NavLink>,
  //   "2",
  //   <DollarOutlined />
  // ),
  getItem(
    <NavLink to="/supplier/manage">Manage Supplier</NavLink>,
    "2",
    <ProductOutlined />
  ),
  getItem(
    <NavLink to="/supplier/report">Supplier Reports</NavLink>,
    "sub1",
    <DocumentChartBarIcon />
  ),
  getItem(
    <NavLink to="/supplier/summary">Supplier Summary</NavLink>,
    "sub2",
    <DocumentTextIcon />
  ),
];
const PurchaseMenu = () => {
  return (
    <Menu
      id="ant-sidemenu"
      defaultSelectedKeys={["0"]}
      mode="inline"
      items={items}
    />
  );
};
export default PurchaseMenu;
