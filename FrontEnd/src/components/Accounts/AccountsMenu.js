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
} from "@ant-design/icons";
import { Breadcrumb, Layout, Menu, theme } from "antd";
import { NavLink } from "react-router-dom";
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
  // getItem(<NavLink to="/accounts/manage">Manage Accounts</NavLink>, '2', <TeamOutlined />),
  // getItem(<NavLink to="/accounts/opening-balances">Opening Balances</NavLink>, 'sub2', <CreditCardOutlined />),
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
