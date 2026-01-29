import React, { useState } from "react";

import { Breadcrumb, Layout, Menu, theme } from "antd";
import { NavLink } from "react-router-dom";
import {} from "@heroicons/react/24/outline";
import { SolutionOutlined, LaptopOutlined } from "@ant-design/icons";
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
    <NavLink to="/product-recipes/manage">Product Recipe</NavLink>,
    "1",
    <LaptopOutlined />
  ),
  getItem(<NavLink to="/jobs/manage">Jobs</NavLink>, "2", <SolutionOutlined />),
];
const AssemblyMenu = () => {
  return (
    <Menu
      id="ant-sidemenu"
      defaultSelectedKeys={["0"]}
      mode="inline"
      items={items}
    />
  );
};
export default AssemblyMenu;
