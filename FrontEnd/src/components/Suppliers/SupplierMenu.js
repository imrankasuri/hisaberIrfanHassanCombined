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

const SupplierMenu = () => {
  return (
    <Menu
      id="ant-sidemenu"
      defaultSelectedKeys={["0"]}
      mode="inline"
    // items={items}
    />
  );
};
export default SupplierMenu;
