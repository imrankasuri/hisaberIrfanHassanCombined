import React, { useState } from "react";

import { Breadcrumb, Layout, Menu, theme } from "antd";
import { NavLink } from "react-router-dom";
import {
  BanknotesIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ReceiptPercentIcon,
  UserIcon,
  UsersIcon,
  CubeIcon,
  TagIcon,
  CalculatorIcon,
  ClipboardDocumentListIcon,
  CreditCardIcon,
  DocumentChartBarIcon,
} from "@heroicons/react/24/outline";
import {
  BankOutlined,
  DollarCircleOutlined,
  UserOutlined,
  TeamOutlined,
  FileTextOutlined,
  ShopOutlined,
  ContactsOutlined,
  PayCircleOutlined,
  AppstoreOutlined,
  GoldOutlined,
  FundOutlined,
  AuditOutlined,
  AccountBookOutlined,
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
    <NavLink to="/bank/report">Banks Report</NavLink>,
    "1",
    <BankOutlined />
  ),
  getItem(
    <NavLink to="/bank/account-balance">Account Balance</NavLink>,
    "2",
    <DollarCircleOutlined />
  ),
  getItem(
    <NavLink to="/customer/report">Customer Report</NavLink>,
    "3",
    <TeamOutlined />
  ),
  getItem(
    <NavLink to="/customer/summary">Customer Summary</NavLink>,
    "4",
    <UserOutlined />
  ),
  getItem(
    <NavLink to="/customer/receipt/details">Customer Receipt Details</NavLink>,
    "5",
    <ReceiptPercentIcon />
  ),
  getItem(
    <NavLink to="/customer/invoice/details">Customer Invoice Details</NavLink>,
    "13",
    <FileTextOutlined />
  ),
  getItem(
    <NavLink to="/customer/sale-detail-by-customer-product">
      Sale Detail by Customer/Product
    </NavLink>,
    "14",
    <FileTextOutlined />
  ),
  getItem(
    <NavLink to="/customer/report/with-invoice-detail">
      Customer Report With Invoice Detail
    </NavLink>,
    "16",
    <FileTextOutlined />
  ),
  getItem(
    <NavLink to="/supplier/report">Supplier Report</NavLink>,
    "6",
    <ShopOutlined />
  ),
  getItem(
    <NavLink to="/supplier/summary">Supplier Summary</NavLink>,
    "7",
    <ContactsOutlined />
  ),
  getItem(
    <NavLink to="/supplier/payment/details">Supplier Payment Details</NavLink>,
    "8",
    <PayCircleOutlined />
  ),
  getItem(
    <NavLink to="/supplier/bills/details">Supplier Bill Details</NavLink>,
    "19",
    <FileTextOutlined />
  ),
  getItem(
    <NavLink to="/supplier/purchase-detail-by-supplier-product">
      Purchase Detail by Supplier/Product
    </NavLink>,
    "15",
    <FileTextOutlined />
  ),
  getItem(
    <NavLink to="/supplier/report/with-bill-detail">
      Supplier Report With Bill Detail
    </NavLink>,
    "17",
    <FileTextOutlined />
  ),
  getItem(
    <NavLink to="/products/report">Products Report</NavLink>,
    "9",
    <AppstoreOutlined />
  ),
  getItem(
    <NavLink to="/products/summary">Products Summary</NavLink>,
    "10",
    <GoldOutlined />
  ),
  getItem(
    <NavLink to="/products/summary/by-category">Prod. Summary by Cat.</NavLink>,
    "11",
    <FundOutlined />
  ),
  getItem(
    <NavLink to="/accounts/report">Accounts Report</NavLink>,
    "12",
    <AuditOutlined />
  ),
  getItem(
    <NavLink to="/accounts/summary">Accounts Summary</NavLink>,
    "18",
    <AccountBookOutlined />
  ),
];

const ReportsMenu = () => {
  return (
    <Menu
      id="ant-sidemenu"
      defaultSelectedKeys={["0"]}
      mode="inline"
      items={items}
    />
  );
};

export default ReportsMenu;
