import {
  DeleteOutlined,
  DownloadOutlined,
  PlusOutlined,
  UploadOutlined,
  MinusCircleOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { ArrowLeftIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
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
  Dropdown,
} from "antd";
import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import Config from "../../Config";
import SubMenuToggle from "../Common/SubMenuToggle";
import axios from "axios";
import dayjs from "dayjs";
import BanksMenu from "./BanksMenu";
import BankModeDropdown from "../Shared/BankModeDropdown";
import LevelWiseAccount2 from "../Shared/LevelWiseAccount2";
import SuppliersDropdown from "../Shared/SuppliersDropdown";

const { Option } = Select;

const AddWHTPayments = () => {
  const AccessKey = localStorage.getItem("AccessKey");
  const UserID = localStorage.getItem("ID");
  const CompanyID = localStorage.getItem("CompanyID");
  const FYear = localStorage.getItem("DefaultFYear");
  const User = localStorage.getItem("Full_Name");

  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [formMain] = Form.useForm();
  const [PaymentForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [OpenDate, setOpenDate] = useState(null);
  const [AccountCode, setAccountCode] = useState("");
  const [AccountDesc, setAccountDesc] = useState("");
  const [AccountsDropdown, setAccountsDropdown] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [Level, setLevel] = useState("0");
  const [OrderBy, setOrderBy] = useState("");
  const [AccountID, setAccountID] = useState("");
  const [BankPaymentList, setBankPaymentList] = useState([]);
  const [BankMode, setBankMode] = useState([]);
  const [ListOfBank, setListOfBank] = useState([]);
  const [selectedBank, setSelectedBank] = useState("501081001");
  const [ListOfAccounts, setListOfAccounts] = useState([]);

  useEffect(() => {
    document.title = "Add WHT Payments";
    const fetchAccount = async () => {
      const BankAccounts = await LevelWiseAccount2(3, "50108");
      setListOfBank(BankAccounts);
      const Mode = await BankModeDropdown(0, "BankMode");
      setBankMode(Mode);
      const suppliers = await SuppliersDropdown();
      setListOfAccounts(suppliers);
    };
    fetchAccount();
  }, []);

  const onFinish = async (value) => {
    setLoading(true);
    try {
      if (!form.getFieldValue("Bank")) {
        message.error("Please select bank.");
        setLoading(false);
        return;
      }
      const fields = PaymentForm.getFieldValue("users");

      for (let i = 0; i < fields.length; i++) {
        if (fields[i].nominalAccount === undefined) {
          message.error("Please select supplier account.");
          setLoading(false);
          return;
        }
        if (fields[i].amount === undefined) {
          message.error("Please enter amount.");
          setLoading(false);
          return;
        }
      }

      const data = fields.map((field) => ({
        ...field,
        date: OpenDate || dayjs().format("YYYY-MM-DD"),
        bankCode: selectedBank,
        bank: form.getFieldValue("Bank"),
        refNo: field.refNo || "",
        detail: field.detail || "",
        nominalAccount: field.nominalAccount || "",
        mode: field.mode || "",
        amount: field.amount || 0,
        bankPaymentType: "Expense Payment",
        bankPaymentBy: User,
        companyID: CompanyID,
        isActive: true,
        isDeleted: false,
        bankPayment: false,
        whtPayment: true,
        bankReceipt: false,
        userID: UserID,
      }));

      const response = await axios.post(
        `${Config.base_url}Bank/AddBankPayments`,
        data,
        {
          headers: {
            Authorization: `Bearer ${AccessKey}`,
          },
        }
      );

      ////Console.log(response.data);
      if (response.data.status_code === 1) {
        message.success(
          <>
            {
              <div className="alert-head">
                <div className="alert-body">WHT Payment Added Successfully</div>
              </div>
            }
          </>
        );
        navigate("/bank/manage");
        setLoading(false);
      }
    } catch (error) {
      // console.error("Error adding WHT payment:", error);
      message.error("Error adding WHT payment");
      setLoading(false);
    }
  };

  const handleDateChange = (date, dateString) => {
    setOpenDate(dateString);
    ////Console.log(dateString);
  };

  const columns = (remove) => [
    { title: "Date", dataIndex: "date", key: "date", width: 150 },
    {
      title: "Ref No.",
      dataIndex: "refNo",
      key: "refNo",
      width: 100,
    },
    { title: "Mode", dataIndex: "mode", key: "mode", width: 150 },
    {
      title: "Supplier Account",
      dataIndex: "nominalAccount",
      key: "nominalAccount",
      width: 250,
    },
    { title: "Detail", dataIndex: "detail", key: "detail", width: 200 },
    { title: "Amount", dataIndex: "amount", key: "amount", width: 200 },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      width: 110,
      render: (_, { key }) => (
        <ul className="inline-action">
          <li>
            <Link to={`# / `} onClick={() => remove(key)} className="red">
              <DeleteOutlined />
            </Link>
          </li>
        </ul>
      ),
    },
  ];

  const items = [
    {
      label: "Approve and New",
      key: "1",
    },
    {
      label: "Approve and Print",
      key: "2",
    },
  ];

  const handleBankChange = (value) => {
    const bank = ListOfBank.find((b) => b.accountCode == value);
    // //Console.log(bank)
    if (bank) {
      form.setFieldsValue({
        Bank: bank.accountDescription,
      });
    }
    setSelectedBank(value);
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
            <h3 className="page-title">
              <NavLink to="/bank/manage">
                <ArrowLeftIcon />
              </NavLink>
              Add WHT Payments
            </h3>
          </div>
          <div className="filters-wrap">
            <Form form={form}>
              <Form.Item
                name="Bank"
                label="Bank"
                initialValue="501081001"
                rules={[
                  {
                    required: true,
                    message: "Please select the Bank.",
                  },
                ]}
              >
                <Select
                  showSearch
                  filterOption={(input, option) =>
                    option.label.toLowerCase().includes(input.toLowerCase())
                  }
                  placeholder="Bank"
                  style={{ width: "350px" }}
                  value={selectedBank}
                  onChange={handleBankChange}
                  options={ListOfBank.map((item) => ({
                    label: `${item.accountDescription} (${item.accountCode})`,
                    value: item.accountCode,
                  }))}
                />
              </Form.Item>
            </Form>
          </div>
          <Row>
            <Col xs={24} md={24}>
              <Form
                form={PaymentForm}
                name="dynamic_form_nest_item"
                onFinish={onFinish}
                autoComplete="off"
                initialValues={{
                  users: [{}],
                }}
              >
                <Form.List name="users">
                  {(fields, { add, remove }) => (
                    <>
                      <Table
                        dataSource={fields.map(
                          ({ key, name, fieldKey, ...restField }, index) => ({
                            key,
                            date: (
                              <Form.Item
                                {...restField}
                                name={[name, "date"]}
                                fieldKey={[fieldKey, "date"]}
                              >
                                <DatePicker
                                  defaultValue={
                                    OpenDate === null
                                      ? dayjs()
                                      : dayjs(OpenDate, "YYYY-MM-DD")
                                  }
                                  onChange={handleDateChange}
                                />
                              </Form.Item>
                            ),
                            refNo: (
                              <Form.Item
                                {...restField}
                                name={[name, "refNo"]}
                                fieldKey={[fieldKey, "refNo"]}
                              >
                                <Input
                                  onFocus={(e) => e.target.select()}
                                  placeholder="Ref No."
                                  variant="borderless"
                                />
                              </Form.Item>
                            ),
                            mode: (
                              <Form.Item
                                {...restField}
                                name={[name, "mode"]}
                                fieldKey={[fieldKey, "mode"]}
                                initialValue="Cash"
                              >
                                <Select
                                  variant="borderless"
                                  placeholder="Mode"
                                  showSearch
                                  filterOption={(input, option) =>
                                    option.label
                                      .toLowerCase()
                                      .includes(input.toLowerCase())
                                  }
                                  options={BankMode.map((item) => ({
                                    label: item.name,
                                    value: item.name,
                                  }))}
                                />
                              </Form.Item>
                            ),
                            nominalAccount: (
                              <Form.Item
                                {...restField}
                                name={[name, "nominalAccount"]}
                                fieldKey={[fieldKey, "nominalAccount"]}
                              >
                                <Select
                                  showSearch
                                  filterOption={(input, option) =>
                                    option.label
                                      .toLowerCase()
                                      .includes(input.toLowerCase())
                                  }
                                  variant="borderless"
                                  placeholder="Supplier Account"
                                  style={{ width: "320px" }}
                                  options={ListOfAccounts.map((item) => ({
                                    label: `${item.businessName} (${item.accountCode})`,
                                    value: `${item.businessName} (${item.accountCode})`,
                                  }))}
                                />
                              </Form.Item>
                            ),
                            detail: (
                              <Form.Item
                                {...restField}
                                name={[name, "detail"]}
                                fieldKey={[fieldKey, "detail"]}
                              >
                                <Input
                                  onFocus={(e) => e.target.select()}
                                  placeholder="Detail"
                                  variant="borderless"
                                />
                              </Form.Item>
                            ),
                            amount: (
                              <Form.Item
                                {...restField}
                                name={[name, "amount"]}
                                fieldKey={[fieldKey, "amount"]}
                              >
                                <Input
                                  onFocus={(e) => e.target.select()}
                                  placeholder="Amount"
                                  variant="borderless"
                                />
                              </Form.Item>
                            ),
                            action: (
                              <MinusCircleOutlined
                                onClick={() => remove(name)}
                              />
                            ),
                          })
                        )}
                        columns={columns(remove)}
                        pagination={false}
                        size="small"
                      />

                      <Form.Item>
                        <Button
                          style={{ marginTop: 10 }}
                          type="dashed"
                          onClick={() => add()}
                          icon={<PlusOutlined />}
                        >
                          Add field
                        </Button>
                      </Form.Item>
                    </>
                  )}
                </Form.List>
              </Form>
              <Form
                layout="vertical"
                className="my-5"
                form={PaymentForm}
                onFinish={onFinish}
              >
                <Row justify="end" className="text-end">
                  <Col xs={24} md={{ span: 4, offset: 20 }}>
                    <Dropdown.Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      icon={<DownOutlined />}
                      menu={{ items }} // Dropdown menu items
                    >
                      Approve and Close
                    </Dropdown.Button>
                  </Col>
                </Row>
              </Form>
            </Col>
          </Row>
        </div>
      </div>
    </>
  );
};

export default AddWHTPayments;
