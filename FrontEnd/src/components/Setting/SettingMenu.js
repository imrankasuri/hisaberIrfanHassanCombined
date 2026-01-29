import React, { useState } from "react";
import {
  CalculatorOutlined,
  FileOutlined,
  ReloadOutlined,
  SyncOutlined,
  TeamOutlined,
  UserOutlined,
  CreditCardOutlined,
} from "@ant-design/icons";
import { Breadcrumb, Layout, Menu, theme } from "antd";
import { NavLink } from "react-router-dom";
import {
  EnvelopeIcon,
  UserGroupIcon,
  MapIcon,
  UsersIcon,
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
    <NavLink to="/accounts/manage">Manage Accounts</NavLink>,
    "1",
    <TeamOutlined />
  ),
  getItem(
    <NavLink to="/accounts/opening-balances">Opening Balances</NavLink>,
    "2",
    <CreditCardOutlined />
  ),
  getItem(
    <NavLink to="/setting/manage-invites">Manage Invitations</NavLink>,
    "3",
    <TeamOutlined />
  ),
  getItem(
    <NavLink to="/setting/manage-users">Manage Users</NavLink>,
    "4",
    <UsersIcon />
  ),
  getItem(
    <NavLink to="/setting/reset-company">Reset Company</NavLink>,
    "5",
    <SyncOutlined />
  ),
  getItem(
    <NavLink to="/setting/recent-login">Recent Activities</NavLink>,
    "6",
    <SyncOutlined />
  ),
];
const SettingMenu = () => {
  return (
    <Menu
      id="ant-sidemenu"
      defaultSelectedKeys={["0"]}
      mode="inline"
      items={items}
    />
  );
};
export default SettingMenu;
