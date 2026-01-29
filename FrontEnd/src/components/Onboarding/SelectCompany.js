import React, { useEffect, useState } from "react";

import Logo from "../../assets/images/logo/white-v.svg";
import { NavLink } from "react-router-dom";
import { Link, useNavigate } from "react-router-dom";

import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { Badge, Button, Skeleton, Spin, message, notification } from "antd";
import Config from "../../Config";
import SubMenuToggle from "../Common/SubMenuToggle";
import axios from "axios";
import BadgeComponent from "../Common/Badge";
import moment from "moment";

function SelectCompany(props) {
  const AccessKey = localStorage.getItem("AccessKey");
  const UserID = localStorage.getItem("ID");
  const [ListOfCompanies, setListOfCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [PendingInvites, setPendingInvites] = useState(0);

  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.clear();
    navigate("/login");
  };

  const fetchAndShowLastLoginNotification = async () => {
    try {
      const companyID = localStorage.getItem("CompanyID");
      if (!companyID) {
        return;
      }

      const data = {
        CompanyID: companyID,
      };

      const api_config = {
        method: "post",
        url: `${Config.base_url}Account/GetRecentLogins`,
        headers: {
          Authorization: `Bearer ${AccessKey}`,
          "Content-Type": "application/json",
        },
        data: data,
      };

      const response = await axios(api_config);

      if (
        response.data.status_code === 1 &&
        response.data.listofRecords.length > 0
      ) {
        const currentUserEmail = localStorage.getItem("Email_Address");
        const currentUserName = localStorage.getItem("Full_Name");

        const allLogins = response.data.listofRecords.sort(
          (a, b) => new Date(b.createdDate) - new Date(a.createdDate)
        );

        const currentUserLatestLoginIndex = allLogins.findIndex(
          (login) =>
            login.userID === currentUserEmail ||
            login.userID === currentUserName ||
            login.userID.toLowerCase() === currentUserEmail?.toLowerCase()
        );

        if (currentUserLatestLoginIndex !== -1) {
          let previousLogin = null;

          if (currentUserLatestLoginIndex < allLogins.length - 1) {
            previousLogin = allLogins[currentUserLatestLoginIndex + 1];
          }

          if (previousLogin) {
            const formattedDateTime = moment(previousLogin.createdDate).format(
              "DD-MM-YYYY hh:mm A"
            );
            const timeAgo = moment(previousLogin.createdDate).fromNow();

            notification.info({
              message: (
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <span
                    style={{
                      backgroundColor: "#1890ff",
                      color: "white",
                      borderRadius: "50%",
                      width: "24px",
                      height: "24px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    👤
                  </span>
                  <span
                    style={{
                      fontWeight: "600",
                      fontSize: "16px",
                      color: "#262626",
                    }}
                  >
                    Recent Login Activity
                  </span>
                </div>
              ),
              description: (
                <div
                  style={{
                    padding: "12px 0",
                    lineHeight: "1.6",
                    color: "#595959",
                    fontSize: "14px",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "#f8f9fa",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid #e8e8e8",
                      marginBottom: "8px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "8px",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-block",
                          width: "6px",
                          height: "6px",
                          backgroundColor: "#52c41a",
                          borderRadius: "50%",
                          marginRight: "8px",
                        }}
                      ></span>
                      <strong style={{ color: "#262626", fontSize: "15px" }}>
                        {previousLogin.userID}
                      </strong>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "8px",
                        fontSize: "13px",
                      }}
                    >
                      <div>
                        <span style={{ color: "#8c8c8c", fontWeight: "500" }}>
                          Login Time:
                        </span>
                        <div
                          style={{
                            color: "#262626",
                            fontWeight: "600",
                            marginTop: "2px",
                          }}
                        >
                          {formattedDateTime}
                        </div>
                      </div>
                      <div>
                        <span style={{ color: "#8c8c8c", fontWeight: "500" }}>
                          Time Ago:
                        </span>
                        <div
                          style={{
                            color: "#1890ff",
                            fontWeight: "600",
                            marginTop: "2px",
                          }}
                        >
                          {timeAgo}
                        </div>
                      </div>

                      <div>
                        <span style={{ color: "#8c8c8c", fontWeight: "500" }}>
                          IP Address:
                        </span>
                        <div
                          style={{
                            color: "#722ed1",
                            fontWeight: "600",
                            fontFamily: "monospace",
                            marginTop: "2px",
                          }}
                        >
                          {previousLogin.ipAddress}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      textAlign: "center",
                      fontSize: "12px",
                      color: "#8c8c8c",
                      fontStyle: "italic",
                    }}
                  >
                    🔒 For your security awareness
                  </div>
                </div>
              ),
              duration: 5,
              placement: "topRight",
              style: {
                width: 400,
                boxShadow:
                  "0 6px 16px -8px rgba(0, 0, 0, 0.08), 0 9px 28px 0 rgba(0, 0, 0, 0.05), 0 12px 48px 16px rgba(0, 0, 0, 0.03)",
                borderRadius: "12px",
                border: "1px solid #e8e8e8",
                backgroundColor: "#ffffff",
              },
            });
          } else {
            notification.success({
              message: "Welcome!",
              description:
                "You are the first user to login today. Welcome to Hisaber!",
              duration: 5,
              placement: "topRight",
            });
          }
        }
      }
    } catch (error) {
      //Console.log("Could not fetch login history:", error);
    }
  };

  const showNotificationAfterCompanySelection = async () => {
    setTimeout(() => {
      fetchAndShowLastLoginNotification();
    }, 1000);
  };

  useEffect(() => {
    const fetchRoles = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          Config.base_url + `Account/GetCompaniesByUserID/${UserID}`,
          {
            headers: {
              Authorization: `Bearer ${AccessKey}`,
            },
          }
        );
        if (response.data.status_code == 1) {
          const extractCompanyInfo = (data) => {
            return data.map((item) => item.companyInfo);
          };
          const list = extractCompanyInfo(response.data.listofRecords) || [];
          setPendingInvites(response.data.pendingInvites);

          if (list.length > 0) {
            setLoading(false);
            if (list.length > 1) {
              setListOfCompanies(list);

              const existingCompanyID = localStorage.getItem("CompanyID");
              if (existingCompanyID) {
                fetchAndShowLastLoginNotification();
              }
            } else {
              const item = list[0];
              try {
                setLoading(true);
                const data = {
                  Email: UserID,
                  CompanyID: item.id,
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
                  localStorage.setItem("CompanyCode", item.companyCode);
                  localStorage.setItem("CompanyID", item.id);
                  localStorage.setItem("CompanyName", item.name);
                  localStorage.setItem("CompanyAddress", item.address);

                  showNotificationAfterCompanySelection();

                  setTimeout(() => {
                    navigate("/dashboard");
                  }, 1500);
                } else {
                  message.error(response.data.status_message);
                  setLoading(false);
                }
              } catch (error) {
                setLoading(false);
                message.error("Network Error...");
              }
            }
          } else {
            setLoading(false);
            navigate("/company-register");
          }
        } else {
          setLoading(false);
          navigate("/company-register");
        }
      } catch (error) {
        setListOfCompanies([]);
        setLoading(false);
        message.error("Network Error...");
      }
    };

    fetchRoles();
  }, [UserID, AccessKey, navigate]);

  const handleCompany = async (item) => {
    try {
      setLoading(true);
      const data = {
        Email: UserID,
        CompanyID: item.id,
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
        localStorage.setItem("CompanyCode", item.companyCode);
        localStorage.setItem("CompanyID", item.id);
        localStorage.setItem("CompanyName", item.name);
        localStorage.setItem("CompanyAddress", item.address);

        showNotificationAfterCompanySelection();

        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        message.error(response.data.status_message);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      message.error("Network Error...");
    }
  };

  return (
    <div className="auth-wrap">
      <div className="left-col">
        <div>
          <img src={Logo} />
          <h3>
            Streamline Your Finances: Welcome to Effortless Invoicing &
            Accounting!
          </h3>
        </div>
      </div>
      <div className="right-col">
        <div className="header">
          <NavLink to={props.link} style={{ marginRight: "20px" }}>
            <Badge count={PendingInvites}>
              <Button type="dashed">Pending Invites</Button>
            </Badge>
          </NavLink>
          <Button onClick={handleSignOut}>Sign Out</Button>
        </div>
        <div className="auth-form-wrap">
          <div className="section-title" style={{ marginBottom: "50px" }}>
            <h2>Welcome to Hisaaber</h2>
            <p>
              Get Ready to Experience Effortless Invoicing and Streamlined
              Accounting
            </p>
          </div>

          {loading ? (
            <Skeleton active />
          ) : (
            <ul className="list-actions">
              {ListOfCompanies?.map((item, index) => (
                <li key={index}>
                  <a href="#" onClick={(e) => handleCompany(item)}>
                    <span>{item.name}</span>
                    <ChevronRightIcon />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default SelectCompany;
