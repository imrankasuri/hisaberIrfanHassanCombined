import {
  Form,
  Input,
  Select,
  Table,
  Button,
  Dropdown,
  Space,
  Menu,
  Popconfirm,
  message,
  Pagination,
  Divider,
  Radio,
} from "antd";
import React, { useEffect, useRef, useState } from "react";
import {
  PlusOutlined,
  DownloadOutlined,
  UploadOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

import { Link, NavLink } from "react-router-dom";
import BanksMenu from "./BanksMenu";
import Config from "../../Config";
import SubMenuToggle from "../Common/SubMenuToggle";
import axios from "axios";
import AddCustomerModal from "./AddCustomerModal";
import dayjs from "dayjs";
import moment from "moment";
import { QueueListIcon } from "@heroicons/react/24/outline";

function ManageReconcile() {
  const AccessKey = localStorage.getItem("AccessKey");
  const UserID = localStorage.getItem("ID");
  const CompanyID = localStorage.getItem("CompanyID");
  const FYear = localStorage.getItem("DefaultFYear");

  const [loading, setLoading] = useState(false);
  const [ListOfRecords, setListOfRecords] = useState([]);
  const [OrderBy, setOrderBy] = useState("");
  const [AccountID, setAccountID] = useState("");
  const [AccountCode, setAccountCode] = useState("");
  const [Level, setLevel] = useState("0");
  const [CustomerID, setCustomerID] = useState("");

  const [IsDeleted, setIsDeleted] = useState(false);
  const [CustomerLoading, setCustomerLoading] = useState(false);
  const [open, setOpen] = useState(false);
  // pagination
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [totalRecords, setTotalRecords] = useState(0);

  const [newList, setnewList] = useState([]);

  const [form] = Form.useForm();
  const [formMain] = Form.useForm();
  useEffect(() => {
    document.title = "Bank Payments";

    setLoading(true);

    const data = {
      AccessKey: AccessKey,
      UserID: UserID,
      CompanyID: CompanyID,
      pageNo: pageNo,
      pageSize: pageSize,
    };

    // ////Console.log(data);
    var api_config = {
      method: "post",
      url: Config.base_url + "Customer/GetAllCustomers",
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    axios(api_config)
      .then(function (response) {
        ////Console.log(response.data);

        if (response.data.status_code == 1) {
          setListOfRecords(response.data.ListofRecords);
          setLoading(false);
          setTotalRecords(response.data.totalRecords);
        }
      })
      .catch(function (error) {
        // ////Console.log(error);
      });
  }, [pageNo, pageSize, Level, IsDeleted, AccountID, OrderBy, AccountCode]);

  const handleFilters = (formData) => {
    if (formData["Level"] != undefined) {
      setLevel(formData["Level"]);
    } else if (formData["AccountID"] != undefined) {
      setAccountID(formData["AccountID"]);
    } else if (formData["OrderBy"] != undefined) {
      setOrderBy(formData["OrderBy"]);
    } else if (formData["AccountCode"] != undefined) {
      setAccountCode(formData["AccountCode"]);
    } else {
    }
  };

  const [sorter, setSorter] = useState({});
  const handleSort = (columnKey) => {
    const newSortOrder =
      sorter.columnKey === columnKey && sorter.order === "ascend"
        ? "descend"
        : "ascend";
    setSorter({ columnKey, order: newSortOrder });

    ////Console.log(`Sorted by ${columnKey} in ${newSortOrder} order`);
  };

  const columns = [
    {
      title: "Sr#",
      dataIndex: "",
      key: "SR",
      render: (_, record, index) => index + 1 + pageSize * (pageNo - 1),
    },
    {
      title: "Date",
      dataIndex: "Date",
      key: "Date",
    },
    {
      title: "Bank",
      dataIndex: "Bank",
      key: "Bank",
    },
    {
      title: "Code",
      dataIndex: "Code",
      key: "Code",
    },

    {
      title: "Balance",
      dataIndex: "Balance",
      key: "Balance",
    },

    {
      title: "Actions",
      dataIndex: "Actions",
      key: "Actions",
      render: (_, record) => (
        <div className="table-actions">
          <NavLink
            className={"primary"}
            htmlType="button"
            onClick={(ID) => handleCustomerEdit(record.ID)}
          >
            <EditOutlined />
          </NavLink>
          <Popconfirm
            title="Delete the task"
            description="Are you sure to delete this account?"
            onConfirm={(e) => deleteAccount(record.ID)}
            okText="Yes"
            cancelText="No"
          >
            <DeleteOutlined />
          </Popconfirm>
        </div>
      ),
    },
  ];
  let index = 0;
  const onShowSizeChange = (current, pageSize) => {
    setPageSize(pageSize);
  };

  const deleteAccount = (ID) => {
    setLoading(true);

    const data = {
      AccessKey: AccessKey,
      UserID: UserID,
      ID: ID,
    };

    var api_config = {
      method: "post",
      url: Config.base_url + "Customer/DeleteCustomer",
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    axios(api_config)
      .then(function (response) {
        ////Console.log(response.data);
        if (response.data.status_code == 1) {
          message.success(response.data.status_message);
          setLoading(false);
          setIsDeleted(true);
        } else {
          message.error(response.data.status_message);
          setLoading(false);
        }
        // setIsUpdated(false);
      })
      .catch(function (error) {
        ////Console.log(error);
      });
  };
  const handleCustomerEdit = (ID) => {
    setCustomerLoading(true);
    setCustomerID(ID);
    setOpen(true);
  };
  const onReset = () => {
    form.resetFields();
    setLevel("0");
    setAccountCode("");
    setAccountID("");
  };

  const handleOk = (FormData) => {
    setLoading(true);
    setOpen(false);
    setLoading(false);
  };
  const handleCancel = () => {
    setOpen(false);
  };

  const items = [
    {
      key: "1",
      label: <Link to={`/bank/add-bank-payment`}>Bank Payments</Link>,
    },
    {
      key: "2",
      label: <Link to={`/bank/wht-bank-payment`}>WHT Payments</Link>,
    },
  ];

  const onSearch = (value) => {
    ////Console.log('search:', value);
  };
  const optionses = [
    { value: "AccountCode", label: "Account Code" },
    { value: "AccountName", label: "Account Name" },
    // Add more options as needed
  ];

  const [selectedValues, setSelectedValues] = useState([]);

  const handleSelectAll = () => {
    const allValues = optionses.map((option) => option.value);
    setSelectedValues([...allValues]);
    ////Console.log(selectedValues)
  };

  const onChange = (values) => {
    ////Console.log('values:', values);
    setSelectedValues(values);
  };

  return (
    <>
      <AddCustomerModal
        show={open}
        handleOk={handleOk}
        handleCancel={handleCancel}
        loading={CustomerLoading}
        CustomerID={CustomerID}
      />
      <div id="sub-menu-wrap">
        <h5>Bank</h5>
        <BanksMenu />
      </div>
      <div className="right-side-contents">
        <div className="page-content">
          <div className="page-header">
            <SubMenuToggle />
            <h3 className="page-title">Bank Reconcile</h3>
            <div className="header-actions">
              <NavLink to="/bank/import">
                <Button type="dashed" icon={<DownloadOutlined />}>
                  Import
                </Button>
              </NavLink>
              <Button type="dashed" icon={<UploadOutlined />}>
                Export
              </Button>
              <NavLink to={`/bank/reconcile-statement-balance`}>
                <Button type="primary" icon={<PlusOutlined />}>
                  New
                </Button>
              </NavLink>
            </div>
          </div>
          <div className="filters-wrap">
            <Form onFinish={handleFilters} form={form}>
              <Form.Item name="Bank">
                <Select
                  mode="multiple"
                  showSearch
                  allowClear
                  placeholder="Bank"
                  optionFilterProp="children"
                  style={{ width: "200px" }}
                  value={selectedValues}
                  onChange={onChange}
                  onSearch={onSearch}
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      <Divider style={{ margin: "8px 0" }} />
                      <Space style={{ padding: "0 8px 4px" }}>
                        <Button type="text" onClick={handleSelectAll}>
                          Select All
                        </Button>
                      </Space>
                    </>
                  )}
                  options={optionses}
                />
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
            dataSource={ListOfRecords}
            size="small"
            loading={loading}
            pagination={false}
          />

          <div style={{ margin: "50px 0" }}>
            {totalRecords > 10 && (
              <>
                <Pagination
                  showSizeChanger
                  onShowSizeChange={onShowSizeChange}
                  defaultCurrent={pageNo}
                  pageSize={pageSize}
                  total={totalRecords}
                  onChange={(page) => setPageNo(page)}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default ManageReconcile;
