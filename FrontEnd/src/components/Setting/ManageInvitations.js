import React, { useEffect, useState } from "react";
import { Form, Input, Select, Table, Button, Popconfirm, message } from "antd";
import axios from "axios";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import SettingMenu from "./SettingMenu";
import Config from "../../Config";
import SubMenuToggle from "../Common/SubMenuToggle";
import { NavLink } from "react-router-dom";

function ManageInvitations() {
  const AccessKey = localStorage.getItem("AccessKey");
  const CompanyID = localStorage.getItem("CompanyID");
  const storedRoles = JSON.parse(localStorage.getItem("roles"));
  const [roleLoading, setRoleLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [ListOfUsers, setListOfUsers] = useState([]);
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [email, setEmail] = useState("");
  const [roles, setRoles] = useState([]);

  const [form] = Form.useForm();



  const fetchInvites = () => {
    if (storedRoles.includes("0d42ee65-ea41-421e-81a3-af81fa61dcb8")) {
      setLoading(true);

      const api_config = {
        method: "get",
        url: `${Config.base_url}Invitation/GetInvitationsByCompanyID/${CompanyID}?role=${role}&email=${email}&status=${status}`,
        headers: {
          Authorization: `Bearer ${AccessKey}`,
          "Content-Type": "application/json",
        },
      };

      axios(api_config)
        .then(function (response) {
          setListOfUsers(response.data.inviteData);
          setLoading(false);
        })
        .catch(function (error) {
          console.error("Error fetching data:", error);
          setListOfUsers([]);
          setLoading(false);
        });
    }
  };

  useEffect(() => {
    document.title = "Manage Invitations";
  }, []);

  useEffect(() => {
    fetchInvites(); // Automatically fetch invites when filters are updated
  }, [role, email, status]);

  const handleFilters = (formData) => {
    setEmail(formData.email || "");
    setRole(formData.role || "");
    setStatus(formData.status || "");
  };

  const onReset = () => {
    form.resetFields();
    setEmail("");
    setRole("");
    setStatus("");
  };

  const deleteAccount = async (sno) => {
    if (storedRoles.includes("0d42ee65-ea41-421e-81a3-af81fa61dcb8")) {
      try {
        const accountToUpdate = ListOfUsers.find((u) => u.id === sno);
        if (!accountToUpdate) {
          message.error("Invite not found!");
          return;
        }

        const updatedAccount = {
          ...accountToUpdate,
          isActive: false,
          isDeleted: true,
        };

        await axios.patch(
          `${Config.base_url}Invitation/DeleteAccount/${sno}`,
          updatedAccount,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${AccessKey}`,
            },
          }
        );

        setListOfUsers((prev) => prev.filter((account) => account.id !== sno));
        message.success("Invite deleted successfully.");
        fetchInvites(); // Refresh the list
      } catch (error) {
        console.error("Error deleting account:", error);
      }
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
      title: "To Email",
      dataIndex: "toEmail",
      key: "toEmail",
    },
    {
      title: "Invited Role",
      dataIndex: "invitedRole",
      key: "invitedRole",
    },
    {
      title: "Invite Status",
      dataIndex: "inviteStatus",
      key: "inviteStatus",
    },
    {
      title: "Actions",
      dataIndex: "Actions",
      key: "Actions",
      render: (_, record) => (
        <div className="table-actions">
          {record.inviteStatus === "Pending" && (
            <>
              <NavLink
                className="primary"
                to={`/setting/edit-user/${record.toEmail}`}
              >
                <EditOutlined />
              </NavLink>
              <Popconfirm
                title="Delete the task"
                description="Are you sure to delete this invite?"
                onConfirm={() => deleteAccount(record.id)}
                okText="Yes"
                cancelText="No"
              >
                <DeleteOutlined />
              </Popconfirm>
            </>
          )}
          {record.inviteStatus === "Rejected" && (
            <Popconfirm
              title="Delete the task"
              description="Are you sure to delete this invite?"
              onConfirm={() => deleteAccount(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <DeleteOutlined />
            </Popconfirm>
          )}
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
            <h3 className="page-title">Manage Invitations</h3>
            <div className="header-actions">
              <NavLink to="/setting/send-invitation">
                <Button type="primary" icon={<PlusOutlined />}>
                  Send Invite
                </Button>
              </NavLink>
            </div>
          </div>
          <div className="filters-wrap">
            <Form onFinish={handleFilters} form={form}>
              <Form.Item name="email">
                <Input placeholder="To Email" />
              </Form.Item>
              <Form.Item name="role">
                <Select placeholder="Invited Role" style={{ width: 120 }}>
                  {storedRoles.includes(
                    "0d42ee65-ea41-421e-81a3-af81fa61dcb8"
                  ) ? (
                    <>
                      <Select.Option value="Manager">Manager</Select.Option>
                      <Select.Option value="Operator">Operator</Select.Option>
                    </>
                  ) : (
                    <Select.Option disabled>No Roles Found</Select.Option>
                  )}
                </Select>
              </Form.Item>
              <Form.Item name="status">
                <Select placeholder="Invite Status" style={{ width: 120 }}>
                  <Select.Option value="Accepted">Accepted</Select.Option>
                  <Select.Option value="Rejected">Rejected</Select.Option>
                  <Select.Option value="Pending">Pending</Select.Option>
                </Select>
              </Form.Item>

              <Button htmlType="submit" type="primary">
                Filter
              </Button>
              <Button onClick={onReset} type="link">
                Reset
              </Button>
            </Form>
          </div>

          <Table
            columns={columns}
            size="small"
            loading={loading}
            dataSource={ListOfUsers || []} // Ensure it's always an array
          />
        </div>
      </div>
    </>
  );
}

export default ManageInvitations;
