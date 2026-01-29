import React, { useState, useEffect } from "react";
import axios from "axios";
import Config from "../../Config";
import SubMenuToggle from "../Common/SubMenuToggle";
import Logo from "../../assets/images/logo/dark-h.svg";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { ChevronDownIcon, PlusCircleIcon } from "@heroicons/react/24/solid";
import {
  UsersIcon,
  CurrencyDollarIcon,
  Cog8ToothIcon,
  TagIcon,
  ShoppingCartIcon,
  ChartPieIcon,
} from "@heroicons/react/24/outline";
import { Dropdown, Tooltip, Image, message } from "antd";
import SideMenu from "./SideMenu";
import LeftMenu from "./LeftMenu";

function Main(props) {
  const [roleName, setRoleName] = useState([]);
  const [companiesList, setCompaniesList] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  const AccessKey = localStorage.getItem("AccessKey");
  const FullName = localStorage.getItem("Full_Name");
  const CompanyName = localStorage.getItem("CompanyName");
  const UserID = localStorage.getItem("ID");
  const CompanyID = localStorage.getItem("CompanyID");

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get(
          Config.base_url +
            `Account/GetRolesByUserID/${UserID}?companyID=${CompanyID}`,
          {
            headers: {
              Authorization: `Bearer ${AccessKey}`,
            },
          }
        );
        if (response.data.status_code == 1) {
          setRoleName(response.data.userCompanyRoles || []);

          const rolesObject = response.data.userCompanyRoles.reduce(
            (acc, item) => {
              acc[item.role.id] = true;
              return acc;
            },
            {}
          );

          const roleNames = Object.keys(rolesObject);
          localStorage.setItem("roles", JSON.stringify(roleNames));
        }
      } catch (error) {
        // //Console.log("error", error);
      }
    };
    fetchRoles();
  }, [UserID, CompanyID]);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axios.get(
          Config.base_url + `Account/GetCompaniesByUserID/${UserID}`,
          {
            headers: {
              Authorization: `Bearer ${AccessKey}`,
            },
          }
        );

        if (response.data.listofRecords) {
          const extractCompanyInfo = (data) => {
            return data.map((item) => item.companyInfo);
          };
          const list = extractCompanyInfo(response.data.listofRecords);
          setCompaniesList(list || []);
        }
      } catch (error) {
        //Console.log("Error fetching companies:", error);
      }
    };

    if (UserID && AccessKey) {
      fetchCompanies();
    }
  }, [UserID, AccessKey]);

  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Handle company switching
  const handleCompanySwitch = async (company) => {
    setLoadingCompanies(true);
    try {
      const data = {
        Email: UserID,
        CompanyID: company.id,
      };
      const response = await axios.post(
        `${Config.base_url}Account/SelectCompany`,
        data,
        {
          headers: {
            Authorization: `Bearer ${AccessKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status_code == 1) {
        localStorage.setItem("CompanyCode", company.companyCode);
        localStorage.setItem("CompanyID", company.id);
        localStorage.setItem("CompanyName", company.name);
        localStorage.setItem("CompanyAddress", company.address);

        message.success(`Switched to ${company.name}`);
        // Reload the page to reflect changes
        window.location.reload();
      } else {
        message.error(response.data.status_message);
      }
    } catch (error) {
      message.error("Network Error...");
    } finally {
      setLoadingCompanies(false);
    }
  };

  // User dropdown items
  const userMenuItems = [
    {
      key: "1",
      label: (
        <Link rel="noopener noreferrer" to="/profile">
          Edit Profile
        </Link>
      ),
    },
    {
      key: "2",
      label: <NavLink to="/change-company">Change Company</NavLink>,
    },
    {
      key: "3",
      label: (
        <a rel="noopener noreferrer" href="#" onClick={handleSignOut}>
          Sign Out
        </a>
      ),
    },
  ];

  // Company dropdown items
  const companyMenuItems = companiesList
    .filter((company) => company.id !== parseInt(CompanyID)) // Exclude current company
    .map((company, index) => ({
      key: `company-${company.id}`,
      label: (
        <div
          onClick={() => handleCompanySwitch(company)}
          style={{
            padding: "8px 12px",
            cursor: "pointer",
            borderRadius: "4px",
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "#f0f0f0")}
          onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
        >
          <div style={{ fontWeight: "500", color: "#324F94" }}>
            {company.name}
          </div>
          {company.address && (
            <div style={{ fontSize: "12px", color: "#666", marginTop: "2px" }}>
              {company.address}
            </div>
          )}
        </div>
      ),
    }));

  if (companiesList.length > 0) {
    companyMenuItems.push({
      type: "divider",
    });

    // Add Edit Company option
    companyMenuItems.push({
      key: "edit-company",
      label: (
        <Link
          to="/edit-company"
          style={{
            color: "#324F94",
            fontWeight: "500",
            display: "block",
            padding: "8px 12px",
            textDecoration: "none",
          }}
        >
          Edit Current Company
        </Link>
      ),
    });

    if (companiesList.length > 1) {
      companyMenuItems.push({
        key: "view-all",
        label: (
          <NavLink
            to="/change-company"
            style={{
              color: "#324F94",
              fontWeight: "500",
              display: "block",
              padding: "8px 12px",
              textDecoration: "none",
            }}
          >
            View All Companies
          </NavLink>
        ),
      });
    }
  }

  const getFirstChar = (str) => {
    const firstChars = str
      .split(" ")
      .map((word) => word[0])
      .join("");
    return firstChars;
  };

  const toggleClass = (id, className = "active") => {
    const element = document.getElementById(id);
    if (element) {
      element.classList.toggle(className);
    }
  };

  const handleClick = () => {
    toggleClass("side-menu");
    toggleClass("overlaymenu");
    toggleClass("body");
    toggleClass("hamburger");
  };

  const RemoveActiveClass = (id, className = "active") => {
    const element = document.getElementById(id);
    if (element) {
      element.classList.remove(className);
    }
  };

  const closeMenu = () => {
    RemoveActiveClass("side-menu");
    RemoveActiveClass("overlaymenu");
    RemoveActiveClass("body");
    RemoveActiveClass("hamburger");
    RemoveActiveClass("sub-menu-wrap");
  };

  return (
    <>
      <main id="main">
        <header id="dashboard-header">
          <div>
            <div className="header-left">
              <Link to="/dashboard" style={{ textDecoration: "none" }}>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "5px" }}
                >
                  <img src={Logo} alt="Logo" style={{ height: "30px" }} />
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#324F94",
                      marginTop: "3px",
                    }}
                  >
                    vers 3.0.8
                  </span>
                </div>
              </Link>

              <div className="working-company">
                {/* Company dropdown with hover trigger */}
                <Dropdown
                  menu={{
                    items: companyMenuItems,
                  }}
                  trigger={["hover"]}
                  placement="bottomLeft"
                  disabled={companiesList.length <= 1}
                  overlayStyle={{
                    minWidth: "250px",
                    maxHeight: "300px",
                    overflowY: "auto",
                  }}
                >
                  <Link
                    to={companiesList.length <= 1 ? "/edit-company" : "#"}
                    className="add-company"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      textDecoration: "none",
                    }}
                  >
                    <span>
                      {CompanyName}{" "}
                      {roleName.map((item) => (
                        <span key={item.id}>({item.role.name})</span>
                      ))}
                    </span>
                    {companiesList.length > 1 && (
                      <ChevronDownIcon
                        style={{
                          width: "14px",
                          height: "14px",
                          marginLeft: "4px",
                          opacity: 0.7,
                        }}
                      />
                    )}
                  </Link>
                </Dropdown>

                <NavLink to="/register-company">
                  <PlusCircleIcon />
                </NavLink>
              </div>
            </div>
          </div>
          <div>
            <Dropdown
              menu={{
                items: userMenuItems,
              }}
            >
              <div className="button-user-in cursor-pointer">
                <div className="short-name">
                  {props.image ? (
                    <Image
                      width="100%"
                      height={"100%"}
                      src={props.image}
                      preview={false}
                      alt="Img"
                      className="rounded-pill"
                    />
                  ) : (
                    getFirstChar(FullName)
                  )}
                </div>
                <span>{FullName}</span>
                <ChevronDownIcon />
              </div>
            </Dropdown>
          </div>
          <div id="hamburger" className="hamburger" onClick={handleClick}>
            <span className="line"></span>
            <span className="line"></span>
            <span className="line"></span>
          </div>
        </header>
        <div onClick={closeMenu} id="overlaymenu"></div>
        <div className="wrapper">
          <LeftMenu />
          <div id="right_side" className="right-side">
            <Outlet />
          </div>
        </div>
      </main>
    </>
  );
}

export default Main;
