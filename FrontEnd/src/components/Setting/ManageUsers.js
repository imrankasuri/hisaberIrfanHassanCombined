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

function ManageUsers(props) {
  const AccessKey = localStorage.getItem("AccessKey");
  const UserID = localStorage.getItem("ID");
  const CompanyID = localStorage.getItem("CompanyID");

  const [loading, setLoading] = useState(false);
  const [ListOfUsers, setListOfUsers] = useState([]);
  const [role, setRole] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [roles, setRoles] = useState([]);
  const [roleLoading, setRoleLoading] = useState(false);

  const [form] = Form.useForm();

  const fetchRoles = async () => {
    setRoleLoading(true);
    try {
      const response = await axios.get(Config.base_url + "Account/GetRoles", {
        headers: {
          Authorization: `Bearer ${AccessKey}`,
        },
      });
      //////Console.log(response.data);
      setRoles(response.data);
      setRoleLoading(false);
    } catch (error) {
      //console.error(error);
      setRoleLoading(false);
    }
  };

  const storedRoles = JSON.parse(localStorage.getItem("roles"));

  const fetchUsers = () => {
    if (
      storedRoles.includes("0d42ee65-ea41-421e-81a3-af81fa61dcb8") ||
      storedRoles.includes("c0e13885-a951-4ef0-a8e9-25264d61e8aa")
    ) {
      setLoading(true);

      const api_config = {
        method: "get",
        url: `${Config.base_url}Account/GetRolesData/${CompanyID}?role=${
          role || ""
        }&fullName=${fullName || ""}&email=${email || ""}`,
        params: {
          role: role,
          fullName: fullName,
          email: email,
        },
        headers: {
          Authorization: `Bearer ${AccessKey}`,
          "Content-Type": "application/json",
        },
      };
      axios(api_config)
        .then(function (response) {
          // //Console.log(response.data);
          if (response.data.status_code === 1) {
            setListOfUsers(response.data.listOfUsers);
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
    document.title = "Manage Users";
    fetchUsers();
    fetchRoles();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [role, fullName, email]);

  const handleFilters = (formData) => {
    setRole(formData["role"] || "");
    setFullName(formData["fullName"] || "");
    setEmail(formData["email"] || "");
    // fetchUsers();
  };

  const deleteAccount = async (userId, roleId, companyId) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${Config.base_url}Account/delete-roles?userId=${userId}&roleId=${roleId}&companyId=${companyId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${AccessKey}`,
          },
        }
      );
      if (response.data.status_code === 1) {
        message.success(response.data.status_message);
        setLoading(false);
      } else {
        message.error(response.data.status_message);
        setLoading(false);
      }
      fetchUsers(); // Refresh the list
    } catch (error) {
      //console.error("Error deleting user:", error);
      message.error("Network Error...");
      setLoading(false);
    }
  };

  const onReset = () => {
    form.resetFields();
    setEmail("");
    setFullName("");
    setRole("");
    // fetchUsers();
  };

  const columns = [
    {
      title: "Sr#",
      dataIndex: "",
      key: "SR",
      render: (_, record, index) => index + 1,
    },
    {
      title: "Full Name",
      dataIndex: ["user", "fullName"], // Access nested fullName from user object
      key: "fullName",
    },
    {
      title: "Email",
      dataIndex: ["user", "email"], // Access nested email from user object
      key: "email",
    },
    {
      title: "Mobile",
      dataIndex: ["user", "phoneNumber"], // Access nested phoneNumber from user object
      key: "phoneNumber",
    },
    {
      title: "Role",
      dataIndex: ["role", "name"], // Access nested role name
      key: "role",
    },
    {
      ...(storedRoles.includes("0d42ee65-ea41-421e-81a3-af81fa61dcb8") && {
        title: "Actions",
        dataIndex: "Actions",
        key: "Actions",
        render: (_, record) =>
          record.role.id !== "0d42ee65-ea41-421e-81a3-af81fa61dcb8" && (
            <div className="table-actions">
              <Popconfirm
                title="Delete the task"
                description="Are you sure to delete this account?"
                onConfirm={() =>
                  deleteAccount(
                    record.user.id,
                    record.role.id,
                    record.companyInfo.id
                  )
                }
                okText="Yes"
                cancelText="No"
              >
                <DeleteOutlined />
              </Popconfirm>
            </div>
          ),
      }),
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
            <h3 className="page-title">Manage Users</h3>
          </div>
          <div className="filters-wrap">
            <Form onFinish={handleFilters} form={form}>
              <Form.Item name="role">
                <Select placeholder="Role" style={{ width: 120 }}>
                  {roleLoading ? (
                    <Select.Option value="loading" disabled>
                      <Spin />
                    </Select.Option>
                  ) : roles.length > 0 ? (
                    roles.map((option) => (
                      <Select.Option value={option.name} key={option.id}>
                        {option.name}
                      </Select.Option>
                    ))
                  ) : (
                    <Select.Option value="no-roles" disabled>
                      No roles available
                    </Select.Option>
                  )}
                </Select>
              </Form.Item>

              <Form.Item name="fullName">
                <Input placeholder="Full Name" />
              </Form.Item>
              <Form.Item name="email">
                <Input placeholder="Email" />
              </Form.Item>
              <Button htmlType="submit" type="primary">
                Filter
              </Button>
              <Button htmlType="button" onClick={onReset} type="link">
                Reset
              </Button>
            </Form>
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

export default ManageUsers;
