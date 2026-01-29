import React, { useState } from "react";

import { Breadcrumb, Layout, Menu, theme } from "antd";
import { NavLink } from "react-router-dom";
import {
  ArrowUpOnSquareIcon,
  BanknotesIcon,
  CreditCardIcon,
  ReceiptPercentIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import {
  AccountBookOutlined,
  BankOutlined,
  CreditCardOutlined,
  FileTextOutlined,
  MoneyCollectOutlined,
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
    <NavLink to="/bank/manage-banks">Manage Banks</NavLink>,
    "2",
    <BankOutlined />
  ),
  getItem(
    <NavLink to="/bank/manage">Bank Payment</NavLink>,
    "sub1",
    <BanknotesIcon />
  ),
  getItem(
    <NavLink to="/bank/receipts">Bank Receipt</NavLink>,
    "sub2",
    <CreditCardOutlined />
  ),
  getItem(
    <NavLink to="/bank/transfers">Transfers</NavLink>,
    "9",
    <ArrowUpOnSquareIcon />
  ),
  getItem(
    <NavLink to="/bank/journalVoucher">Journal Voucher</NavLink>,
    "8",
    <ReceiptPercentIcon />
  ),
  getItem(
    <NavLink to="/bank/reconcile">Reconcile</NavLink>,
    "10",
    <Squares2X2Icon />
  ),
  getItem(
    <NavLink to="/bank/report">Bank Reports</NavLink>,
    "11",
    <FileTextOutlined />
  ),
];
const BanksMenu = () => {
  return (
    <Menu
      id="ant-sidemenu"
      defaultSelectedKeys={["0"]}
      mode="inline"
      items={items}
    />
  );
};
export default BanksMenu;
