import {
  DeleteOutlined,
  DownloadOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import {
  Col,
  Form,
  Input,
  Row,
  Select,
  message,
  Button,
  DatePicker,
  Table,
  Popconfirm,
} from "antd";
import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import Config from "../../Config";
import axios from "axios";
import dayjs from "dayjs";
import BanksMenu from "./BanksMenu";
import SubMenuToggle from "../Common/SubMenuToggle";

const ReconcileStatementBalance = () => {
  const AccessKey = localStorage.getItem("AccessKey");
  const UserID = localStorage.getItem("ID");
  const CompanyID = localStorage.getItem("CompanyID");
  const FYear = localStorage.getItem("DefaultFYear");

  const navigator = useNavigate();
  const [Filtersform] = Form.useForm();
  const [form] = Form.useForm();
  const [formMain] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(null);
  const [AccountCode, setAccountCode] = useState("");
  const [AccountDesc, setAccountDesc] = useState("");
  const [AccountsDropdown, setAccountsDropdown] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [Level, setLevel] = useState("0");
  const [OrderBy, setOrderBy] = useState("");
  const [AccountID, setAccountID] = useState("");
  const [BankPaymentList, setBankPaymentList] = useState([]);
  const [ListOfRecords, setListOfRecords] = useState([]);

  useEffect(() => {
    setLoading(true);

    const data = {
      AccessKey: AccessKey,
      UserID: UserID,
      CompanyID: CompanyID,
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
        }
      })
      .catch(function (error) {
        // ////Console.log(error);
      });
  }, [AccountID, OrderBy, AccountCode]);

  useEffect(() => {
    document.title = "Reconcile Statement Balance";
  }, []);

  const columns = [
    {
      title: "Date",
      dataIndex: "Date",
      key: "Date",
    },
    {
      title: "V. ID",
      dataIndex: "V. ID",
      key: "V. ID",
    },
    {
      title: "Type",
      dataIndex: "Type",
      key: "Type",
    },

    {
      title: "Account / Payee",
      dataIndex: "Account / Payee",
      key: "Account / Payee",
    },
    {
      title: "Ref. No.",
      dataIndex: "Ref. No.",
      key: "Ref. No.",
    },
    {
      title: "Details",
      dataIndex: "Details",
      key: "Details",
    },
    {
      title: "Payments",
      dataIndex: "Payments",
      key: "Payments",
    },
    {
      title: "Receipts",
      dataIndex: "Receipts",
      key: "Receipts",
    },
  ];
  const onFinish = (value) => {
    setLoading(true);
    const data = {
      AccessKey: AccessKey,
      UserID: UserID,
      FYear: FYear,
      CompanyID: CompanyID,
      AccountCode: "",
      ...value,
    };
    let url;
    // if (props.CustomerID === undefined) {
    //     url = 'Customer/AddCustomer'
    // }
    // else {
    //     url = 'Customer/UpdateCustomer';
    //     data.ID = props.CustomerID;
    // }

    // ////Console.log(data);

    let api_config = {
      method: "post",

      url: Config.base_url + url,
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    axios(api_config)
      .then(function (response) {
        // ////Console.log(response.data);
        if (response.data.status_code == 1) {
          message.success(response.data.status_message);
          setLoading(false);
          formMain.resetFields();
        } else {
          message.error(response.data.status_message);
          setLoading(false);
        }
      })
      .catch(function (error) {});
  };

  const handleAccountChange = (value, account) => {
    setAccountCode(account.code);
    setAccountDesc(account.desc);

    form.setFieldValue("Description", account.desc);
    form.setFieldValue("Code", account.code);
  };

  const handleAddItem = (formData) => {
    formData["Date"] = dayjs(formData["Date"]).format("YYYY-MM-DD");

    const newItem = {
      Seq: BankPaymentList.length,
      ...formData,
    };

    setBankPaymentList([...BankPaymentList, newItem]);
    form.resetFields();
  };

  const handleDeleteBankPayment = (index) => {
    const updatedFormData = [...BankPaymentList];

    // index, number of items to be removed, new elements to be added
    updatedFormData.splice(index, 1);
    setBankPaymentList(updatedFormData);
  };

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

  const onReset = () => {
    form.resetFields();
    setLevel("0");
    setAccountCode("");
    setAccountID("");
  };

  const onChange = (value) => {
    ////Console.log(`selected ${value}`);
  };
  const onSearch = (value) => {
    ////Console.log('search:', value);
  };

  const handleDateChange = (date, dateString) => {
    setDate(dateString);
    ////Console.log(dateString)
  };

  return (
    <>
      <div id="sub-menu-wrap">
        <h5>Bank</h5>
        <BanksMenu />
      </div>
      <div className="right-side-contents">
        <div className="page-content">
          <div className="page-header">
            <SubMenuToggle />
            <h3 className="page-title">Reconcile Statement Balance</h3>
          </div>
          <div className="filters-wrap">
            <Form onFinish={handleFilters} form={Filtersform}>
              <Form.Item name="Bank_Account ">
                <Select
                  placeholder="Bank Account "
                  style={{ width: 120 }}
                  // onChange={handleChange}
                  options={[
                    {
                      value: "AccountCode",
                      label: "Account Code",
                    },
                    {
                      value: "AccountName",
                      label: "Account Name",
                    },
                  ]}
                />
              </Form.Item>

              <Form.Item name="Statement_Date">
                <DatePicker placeholder="Statement Date" />
              </Form.Item>
              <Form.Item name="Statement_Balance">
                <Input placeholder="Statement Balance" />
              </Form.Item>

              <Button htmlType="submit" type="primary">
                Load Transactions
              </Button>
              <Button htmlType="button" onClick={onReset} type="link">
                Reset
              </Button>
            </Form>
          </div>
          <Row gutter={[5, 10]} align="middle" className="mb-3">
            <Col md={4}>
              <Input placeholder="Opening Balance" readOnly disabled />
            </Col>
            <Col md={1}>
              <h2
                style={{
                  background: "#f5f5f5",
                  width: "35px",
                  height: "35px",
                  borderRadius: "50px",
                  textAlign: "center",
                  margin: "0",
                  marginLeft: "10px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "baseline",
                }}
              >
                +
              </h2>
            </Col>
            <Col md={4}>
              <Input placeholder="Receipts" readOnly disabled />
            </Col>
            <Col md={1}>
              <h2
                style={{
                  background: "#f5f5f5",
                  width: "35px",
                  height: "35px",
                  borderRadius: "50px",
                  textAlign: "center",
                  margin: "0",
                  marginLeft: "10px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "baseline",
                }}
              >
                -
              </h2>
            </Col>
            <Col md={4}>
              <Input placeholder="Payments" readOnly disabled />
            </Col>
            <Col md={1}>
              <h2
                style={{
                  background: "#f5f5f5",
                  width: "35px",
                  height: "35px",
                  borderRadius: "50px",
                  textAlign: "center",
                  margin: "0",
                  marginLeft: "10px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "baseline",
                }}
              >
                =
              </h2>
            </Col>
            <Col md={4}>
              <Input placeholder="Balance" readOnly disabled />
            </Col>
            <Col md={4}>
              <div className="d-flex align-items-center ml-3">
                <h4 className="m-0">Difference</h4>
                <span className="ml-2">0.00</span>
              </div>
            </Col>
          </Row>
          <Row>
            <Col xs={24} md={24}>
              <Table
                columns={columns}
                dataSource={ListOfRecords}
                size="small"
                loading={loading}
                pagination={false}
              />
            </Col>
          </Row>
        </div>
      </div>
    </>
  );
};

export default ReconcileStatementBalance;
