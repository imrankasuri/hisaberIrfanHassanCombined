import {
  Form,
  Input,
  Select,
  Table,
  Button,
  Popconfirm,
  message,
  Spin,
} from "antd";
import React, { useEffect, useState } from "react";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { NavLink } from "react-router-dom";
import Config from "../../Config";
import SubMenuToggle from "../Common/SubMenuToggle";
import axios from "axios";
import SettingMenu from "./SettingMenu";
import moment from "moment";

function RecentLogins(props) {
  const AccessKey = localStorage.getItem("AccessKey");
  const UserID = localStorage.getItem("ID");
  const CompanyID = localStorage.getItem("CompanyID");

  const [loading, setLoading] = useState(false);
  const [ListOfUsers, setListOfUsers] = useState([]);
  const [role, setRole] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  const [form] = Form.useForm();

  const storedRoles = JSON.parse(localStorage.getItem("roles"));

  const fetchUsers = () => {
    if (
      storedRoles.includes("0d42ee65-ea41-421e-81a3-af81fa61dcb8") ||
      storedRoles.includes("c0e13885-a951-4ef0-a8e9-25264d61e8aa")
    ) {
      setLoading(true);

      const data = {
        CompanyID: CompanyID,
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
      axios(api_config)
        .then(function (response) {
          // //Console.log(response.data);
          if (response.data.status_code === 1) {
            setListOfUsers(response.data.listofRecords);
            setLoading(false);
          } else {
            setListOfUsers([]);
            setLoading(false);
          }
        })
        .catch(function (error) {
          //console.error("Error fetching data:", error);
          setListOfUsers([]);
          setLoading(false);
          // message.error("Network Error...");
        });
    }
  };

  useEffect(() => {
    document.title = "Recent Logins";
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, []);

  const columns = [
    {
      title: "Sr#",
      dataIndex: "",
      key: "SR",
      render: (_, record, index) => index + 1,
    },
    {
      title: "Full Name",
      dataIndex: "userID",
      key: "userID",
    },
    {
      title: "User Type",
      dataIndex: "userType",
      key: "userType",
    },
    {
      title: "Login Time",
      dataIndex: "createdDate",
      key: "createdDate",
      render: (text) => {
        return moment(text).format("DD-MM-YYYY hh:mm A");
      },
    },
    {
      title: "IP Address",
      dataIndex: "ipAddress",
      key: "ipAddress",
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
            <h3 className="page-title">Recent Logins</h3>
          </div>

          <Table
            columns={columns}
            size="small"
            loading={loading}
            dataSource={ListOfUsers || []}
          />
        </div>
      </div>
    </>
  );
}

export default RecentLogins;
