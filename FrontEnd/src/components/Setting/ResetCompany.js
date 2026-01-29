import { Form, Table, Popconfirm, message, Spin, Tooltip } from "antd";
import React, { useEffect, useState } from "react";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { NavLink } from "react-router-dom";
import Config from "../../Config";
import SubMenuToggle from "../Common/SubMenuToggle";
import axios from "axios";
import SettingMenu from "./SettingMenu";

function ResetCompany(props) {
  const AccessKey = localStorage.getItem("AccessKey");
  const UserID = localStorage.getItem("ID");
  const CompanyID = localStorage.getItem("CompanyID");

  const [loading, setLoading] = useState(false);
  const [RecordsCount, setRecordsCount] = useState([]);

  const [form] = Form.useForm();

  const storedRoles = JSON.parse(localStorage.getItem("roles"));

  useEffect(() => {
    document.title = "Reset Company";
    fetchRecordsCount();
  }, []);

  const fetchRecordsCount = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${Config.base_url}Reset/get-records?companyId=${CompanyID}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${AccessKey}`,
          },
        }
      );
      ////Console.log(response.data)
      if (response.data.status_code == 1) {
        const formattedData = response.data.records.map((item) => ({
          name: item.name,
          totalCount: item.totalCount,
        }));
        setRecordsCount(formattedData);
        setLoading(false);
      } else {
        message.error(response.data.status_message);
        setLoading(false);
      }
    } catch (error) {
      message.error("Network Error...");
      setLoading(false);
    }
  };

  const deleteAccount = async (Type) => {
    if (storedRoles.includes("0d42ee65-ea41-421e-81a3-af81fa61dcb8")) {
      setLoading(true);
      let response;
      try {
        if (Type === "Reset Products") {
          try {
            response = await axios.get(
              `${Config.base_url}Reset/delete-products?companyId=${CompanyID}`,
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${AccessKey}`,
                },
              }
            );
            if (response.data.status_code == 1) {
              message.success(response.data.status_message);
            } else {
              message.error(response.data.status_message);
            }
          } catch (error) {
            //console.error("Error deleting user:", error);
            message.error("Network Error...");
          }
        } else if (Type === "Reset Sales") {
          try {
            response = await axios.get(
              `${Config.base_url}Reset/delete-sales?companyId=${CompanyID}`,
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${AccessKey}`,
                },
              }
            );
            if (response.data.status_code == 1) {
              message.success(response.data.status_message);
            } else {
              message.error(response.data.status_message);
            }
          } catch (error) {
            //console.error("Error deleting user:", error);
            message.error("Network Error...");
          }
        } else if (Type === "Reset Purchases") {
          try {
            response = await axios.get(
              `${Config.base_url}Reset/delete-purchases?companyId=${CompanyID}`,
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${AccessKey}`,
                },
              }
            );

            if (response.data.status_code == 1) {
              message.success(response.data.status_message);
            } else {
              message.error(response.data.status_message);
            }
          } catch (error) {
            //console.error("Error deleting user:", error);
            message.error("Network Error...");
          }
        } else if (Type === "Reset Receipts") {
          try {
            response = await axios.get(
              `${Config.base_url}Reset/delete-receipts?companyId=${CompanyID}`,
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${AccessKey}`,
                },
              }
            );
            if (response.data.status_code == 1) {
              message.success(response.data.status_message);
            } else {
              message.error(response.data.status_message);
            }
          } catch (error) {
            //console.error("Error deleting user:", error);
            message.error("Network Error...");
            console.error("Error deleting user:", error);
          }
        } else if (Type === "Reset Payments") {
          try {
            response = await axios.get(
              `${Config.base_url}Reset/delete-payments?companyId=${CompanyID}`,
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${AccessKey}`,
                },
              }
            );
            if (response.data.status_code == 1) {
              message.success(response.data.status_message);
            } else {
              message.error(response.data.status_message);
            }
          } catch (error) {
            //console.error("Error deleting user:", error);
            message.error("Network Error...");
          }
        } else if (Type === "Reset Customers") {
          try {
            const response = await axios.get(
              `${Config.base_url}Reset/delete-customers?companyId=${CompanyID}`,
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${AccessKey}`,
                },
              }
            );

            if (response.data.status_code == 1) {
              message.success(response.data.status_message);
            } else {
              message.error(response.data.status_message);
            }
          } catch (error) {
            //console.error("Error deleting user:", error);
            message.error("Network Error...");
          }
        } else if (Type === "Reset Suppliers") {
          try {
            response = await axios.get(
              `${Config.base_url}Reset/delete-suppliers?companyId=${CompanyID}`,
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${AccessKey}`,
                },
              }
            );
            if (response.data.status_code == 1) {
              message.success(response.data.status_message);
            } else {
              message.error(response.data.status_message);
            }
          } catch (error) {
            //console.error("Error deleting user:", error);
            message.error("Network Error...");
          }
        }
        setLoading(false);
        fetchRecordsCount();
      } catch (error) {
        //console.error("Error deleting user:", error);
        setLoading(false);
      }
    } else {
      message.error("You don't have access to perform this task.");
    }
  };

  const columns = [
    {
      title: "Sr#",
      dataIndex: "",
      key: "SR",
      render: (_, record, index) => index + 1,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Total Count",
      dataIndex: "totalCount",
      key: "totalCount",
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      render: (_, record) => (
        <div className="table-actions">
          <Popconfirm
            title="Delete the task"
            description={`Are you sure to ${record.name}?`}
            onConfirm={() => deleteAccount(record.name)}
            okText="Yes"
            cancelText="No"
          >
            <DeleteOutlined />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <>
      <div id="sub-menu-wrap">
        <h5>Settings</h5>
        <SettingMenu />
      </div>
      <div className="right-side-contents">
        <div className="page-content">
          <div className="page-header">
            <SubMenuToggle />
            <h3 className="page-title">Reset Company</h3>
          </div>

          <Table
            columns={columns}
            size="small"
            loading={loading}
            dataSource={RecordsCount}
          />
        </div>
      </div>
    </>
  );
}

export default ResetCompany;
