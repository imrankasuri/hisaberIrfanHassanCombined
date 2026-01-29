import React, { useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Tooltip } from "antd";

import {
  ArrowRightEndOnRectangleIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  TagIcon,
  ChartPieIcon,
  Cog6ToothIcon,
  HomeIcon,
  UsersIcon,
  UserGroupIcon,
  TruckIcon,
  TicketIcon,
  BuildingLibraryIcon,
  CubeIcon,
  DocumentChartBarIcon,
  Square3Stack3DIcon,
  CurrencyEuroIcon,
  CurrencyPoundIcon,
  ChartBarIcon,
  PuzzlePieceIcon,
  WrenchIcon,
  Cog8ToothIcon,
  CogIcon,
  CommandLineIcon,
  AdjustmentsHorizontalIcon,
  BuildingStorefrontIcon,
} from "@heroicons/react/24/outline";
import {
  AreaChartOutlined,
  DollarCircleOutlined,
  FundOutlined,
} from "@ant-design/icons";

function LeftMenu() {
  const currentLocation = useLocation();
  const navigate = useNavigate();
  const isMenuItemActive = (path) => {
    return currentLocation.pathname.startsWith(path);
  };
  const token = localStorage.getItem("AccessKey");
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, []);

  const handleSignOut = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const RemoveActiveClass = (id, className = "active") => {
    const element = document.getElementById(id);
    if (element) {
      element.classList.remove(className);
    }
  };

  // Usage in click handlers
  const closeMenu = () => {
    RemoveActiveClass("side-menu");
    RemoveActiveClass("overlaymenu");
    RemoveActiveClass("body");
  };

  return (
    <>
      <div className="left-side" id="side-menu">
        <ul className="side-bar">
          <li>
            <NavLink
              onClick={closeMenu}
              to="/dashboard"
              className={isMenuItemActive("/dashboard") ? "active" : ""}
            >
              <HomeIcon />
              <span>Dashboard</span>
            </NavLink>
          </li>
          {/* <li>
            <NavLink
            onClick={closeMenu}
              to="/accounts/manage"
              className={isMenuItemActive("/accounts") ? "active" : ""}
            >
              <UsersIcon />
              <span>Accounts</span>
            </NavLink>
          </li> */}
          <li>
            <NavLink
              onClick={closeMenu}
              to="/sales/sales-invoices"
              className={isMenuItemActive("/sales") ? "active" : ""}
            >
              <ChartPieIcon />
              <span>Sales</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              onClick={closeMenu}
              to="/purchases/purchase-bills"
              className={isMenuItemActive("/purchases") ? "active" : ""}
            >
              <ShoppingCartIcon />
              <span>Purchase</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              onClick={closeMenu}
              to="/sales/sales-receipts"
              className={isMenuItemActive("/receipts") ? "active" : ""}
            >
              <CurrencyDollarIcon />
              <span>Receipts</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              onClick={closeMenu}
              to="/purchases/purchase-payments"
              className={isMenuItemActive("/payments") ? "active" : ""}
            >
              <CurrencyEuroIcon />
              <span>Payments</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              onClick={closeMenu}
              to="/bank/manage-banks"
              className={isMenuItemActive("/bank") ? "active" : ""}
            >
              <BuildingLibraryIcon />
              <span>Bank</span>
            </NavLink>
          </li>

          <li>
            <NavLink
              onClick={closeMenu}
              to="/payroll/employee/manage"
              className={isMenuItemActive("/payroll") ? "active" : ""}
            >
              <CurrencyPoundIcon />
              <span>Payroll</span>
            </NavLink>
          </li>

          <li>
            <NavLink
              onClick={closeMenu}
              to="/products/manage"
              className={isMenuItemActive("/production") ? "active" : ""}
            >
              <Square3Stack3DIcon />
              <span>Inventory</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              onClick={closeMenu}
              to="/product-recipes/manage"
              className={isMenuItemActive("/assembly") ? "active" : ""}
            >
              <BuildingStorefrontIcon />
              <span>Assembly</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              onClick={closeMenu}
              to="/customer/report"
              className={isMenuItemActive("/report") ? "active" : ""}
            >
              <DocumentChartBarIcon />
              <span>Reports</span>
            </NavLink>
          </li>
          {/* <li>
            <NavLink
            onClick={closeMenu}
              to="/customer/manage"
              className={isMenuItemActive("/customer") ? "active" : ""}
            >
              <UserGroupIcon />
              <span>Customer</span>
            </NavLink>
          </li>
          <li>
            <NavLink
            onClick={closeMenu}
              to="/supplier/manage"
              className={isMenuItemActive("/supplier") ? "active" : ""}
            >
              <TruckIcon />
              <span>supplier</span>
            </NavLink>
          </li> */}
          {/* <li>
            <NavLink
            onClick={closeMenu}
              to="/bill/manage"
              className={isMenuItemActive("/bill") ? "active" : ""}
            >
              <TicketIcon />
              <span>Bill</span>
            </NavLink>
          </li> */}

          {/* <li>
            <NavLink
            onClick={closeMenu}
              to="/report/manage"
              className={isMenuItemActive("/report") ? "active" : ""}
            >
              <DocumentChartBarIcon />
              <span>Reports</span>
            </NavLink>
          </li> */}

          <li>
            <NavLink
              onClick={closeMenu}
              to="/setting/recent-login"
              className={
                isMenuItemActive("/setting/recent-login") ? "active" : ""
              }
            >
              <Cog6ToothIcon />
              <span>Settings</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/#" onClick={handleSignOut}>
              <ArrowRightEndOnRectangleIcon />
              <span>Sign Out</span>
            </NavLink>
          </li>
        </ul>
      </div >
    </>
  );
}

export default LeftMenu;
