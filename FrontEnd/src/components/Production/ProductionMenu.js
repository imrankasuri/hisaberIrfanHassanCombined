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
  ProductFilled,
} from "@ant-design/icons";
import { Breadcrumb, Layout, Menu, theme } from "antd";
import { NavLink } from "react-router-dom";
import {
  CubeIcon,
  DocumentTextIcon,
  MapIcon,
} from "@heroicons/react/24/outline";
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
    <NavLink to="/products/manage">Manage Products</NavLink>,
    "2",
    <ProductOutlined />
  ),
  getItem(
    <NavLink to="/category/manage">Manage Category</NavLink>,
    "3",
    <ProductOutlined />
  ),
  getItem(
    <NavLink to="/type/manage">Manage Type</NavLink>,
    "4",
    <ProductOutlined />
  ),
  getItem(
    <NavLink to="/products/stock-adjustment">Stock Adjustment</NavLink>,
    "5",
    <ProductFilled />
  ),
  getItem(
    <NavLink to="/products/report">Products Report</NavLink>,
    "sub1",
    <FileDoneOutlined />
  ),
  getItem(
    <NavLink to="/products/summary">Products Summary</NavLink>,
    "sub2",
    <DocumentTextIcon />
  ),

  getItem(
    <NavLink to="/setting/locations">Locations</NavLink>,
    "sub3",
    <MapIcon />
  ),
];
const AccountsMenu = () => {
  return (
    <Menu
      id="ant-sidemenu"
      defaultSelectedKeys={["0"]}
      mode="inline"
      items={items}
    />
  );
};
export default AccountsMenu;
