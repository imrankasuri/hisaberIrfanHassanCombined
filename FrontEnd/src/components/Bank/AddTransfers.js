import {
  DeleteOutlined,
  DownOutlined,
  DownloadOutlined,
  PlusOutlined,
  UploadOutlined,
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
  Skeleton,
} from "antd";
import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import Config from "../../Config";
import SubMenuToggle from "../Common/SubMenuToggle";
import axios from "axios";
import dayjs from "dayjs";
import BanksMenu from "./BanksMenu";
import { MinusCircleOutlined } from "@ant-design/icons";
import { useForm } from "antd/es/form/Form";
import LevelWiseAccount2 from "../Shared/LevelWiseAccount2";
import BankModeDropdown from "../Shared/BankModeDropdown";
const AddTransfers = () => {
  const AccessKey = localStorage.getItem("AccessKey");
  const UserID = localStorage.getItem("ID");
  const CompanyID = localStorage.getItem("CompanyID");
  const FYear = localStorage.getItem("DefaultFYear");
  const User = localStorage.getItem("Full_Name");

  const navigate = useNavigate();
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
  const [OpenDate, setOpenDate] = useState(null);
  const [ListOfBank, setListOfBank] = useState([]);
  const [BankMode, setBankMode] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [TransferForm] = useForm();

  useEffect(() => {
    document.title = "Add Bank Transfer";
    const fetchAccounts = async () => {
      setInitialLoading(true);
      const BankAccounts = await LevelWiseAccount2(3, "50108");
      setListOfBank(BankAccounts);
      const Mode = await BankModeDropdown(0, "BankMode");
      setBankMode(Mode);
      setInitialLoading(false);
    };
    fetchAccounts();
  }, []);

  const onFinish = async (value) => {
    setLoading(true);
    try {
      const fields = TransferForm.getFieldValue("users");

      for (let i = 0; i < fields.length; i++) {
        if (fields[i].toBank === fields[i].fromBank) {
          message.error("From Bank should be different from To Bank");
          setLoading(false);
          return;
        }
      }

      const data = fields.map((field) => ({
        ...field,
        date: OpenDate || dayjs().format("YYYY-MM-DD"),
        field1: "",
        field2: "",
        field3: "",
        refNo: field.refNo || "",
        detail: field.detail || "",
        mode: field.mode || "",
        amount: field.amount || 0,
        bankTransferBy: User,
        companyID: CompanyID,
        isActive: true,
        isDeleted: false,
        userID: UserID,
      }));

      const response = await axios.post(
        `${Config.base_url}Bank/AddBankTransfers`,
        data,
        {
          headers: {
            Authorization: `Bearer ${AccessKey}`,
          },
        }
      );

      ////Console.log(response.data);
      if (response.data.status_code === 1) {
        message.success(response.data.status_message);
        navigate("/bank/transfers");
        setLoading(false);
      } else {
        message.error(response.data.status_message);
        setLoading(false);
      }
    } catch (error) {
      message.error("Network Error..");
      setLoading(false);
    }
  };

  const handleDateChange = (date, dateString) => {
    setOpenDate(dateString);
    ////Console.log(dateString);
  };

  const columns = (remove) => [
    { title: "Date", dataIndex: "date", key: "date", width: 250 },
    {
      title: "From Bank",
      dataIndex: "fromBank",
      key: "fromBank",
      width: 200,
    },
    {
      title: "Ref No.",
      dataIndex: "refNo",
      key: "refNo",
      width: 140,
    },
    { title: "Mode", dataIndex: "mode", key: "mode", width: 150 },
    {
      title: "To Bank",
      dataIndex: "toBank",
      key: "toBank",
      width: 250,
    },
    { title: "Detail", dataIndex: "detail", key: "detail", width: 200 },
    { title: "Amount", dataIndex: "amount", key: "amount", width: 200 },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      render: (_, { key }) => (
        <ul className="inline-action">
          <li>
            <Link to={`#/`} onClick={() => remove(key)} className="red">
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
  const handleFromBankChange = (value, index) => {
    const selectedBank = ListOfBank.find(
      (item) => `${item.accountDescription} (${item.accountCode})` === value
    );
    if (selectedBank) {
      const fields = TransferForm.getFieldValue("users");

      TransferForm.setFieldsValue({
        users: fields.map((field, i) =>
          i === index
            ? {
                ...field,
                fromBankCode: selectedBank.accountCode,
              }
            : field
        ),
      });
    }
  };
  const handleToBankChange = (value, index) => {
    const selectedBank = ListOfBank.find(
      (item) => `${item.accountDescription} (${item.accountCode})` === value
    );
    if (selectedBank) {
      const fields = TransferForm.getFieldValue("users");

      TransferForm.setFieldsValue({
        users: fields.map((field, i) =>
          i === index
            ? {
                ...field,
                toBankCode: selectedBank.accountCode,
              }
            : field
        ),
      });
    }
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
              <NavLink to="/bank/transfers">
                <ArrowLeftIcon />
              </NavLink>
              Add Bank Transfer
            </h3>
          </div>
          {initialLoading ? (
            <>
              <Skeleton active paragraph={{ rows: 4 }} />
              <Skeleton active paragraph={{ rows: 4 }} />
            </>
          ) : (
            <Row>
              <Col xs={24} md={24}>
                <Form
                  form={TransferForm}
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
                              fromBank: (
                                <Form.Item
                                  {...restField}
                                  name={[name, "fromBank"]}
                                  fieldKey={[fieldKey, "fromBank"]}
                                  rules={[
                                    {
                                      required: true,
                                      message: "Please select From bank",
                                    },
                                  ]}
                                >
                                  <Select
                                    showSearch
                                    filterOption={(input, option) =>
                                      option.label
                                        .toLowerCase()
                                        .includes(input.toLowerCase())
                                    }
                                    variant="borderless"
                                    placeholder="From Bank"
                                    style={{ width: "250px" }}
                                    options={ListOfBank.map((record) => ({
                                      label: `${record.accountDescription} (${record.accountCode})`,
                                      value: `${record.accountDescription} (${record.accountCode})`,
                                    }))}
                                    onChange={(value) => {
                                      handleFromBankChange(value, index);
                                    }}
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
                                    placeholder="Ref No."
                                    variant="borderless"
                                    onFocus={(e) => e.target.select()}
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
                                    options={BankMode.map((record) => ({
                                      label: record.name,
                                      value: record.name,
                                    }))}
                                  />
                                </Form.Item>
                              ),
                              toBank: (
                                <Form.Item
                                  {...restField}
                                  name={[name, "toBank"]}
                                  fieldKey={[fieldKey, "toBank"]}
                                  rules={[
                                    {
                                      required: true,
                                      message: "Please select To bank",
                                    },
                                  ]}
                                >
                                  <Select
                                    showSearch
                                    filterOption={(input, option) =>
                                      option.label
                                        .toLowerCase()
                                        .includes(input.toLowerCase())
                                    }
                                    variant="borderless"
                                    placeholder="To Bank"
                                    style={{ width: "250px" }}
                                    options={ListOfBank.map((record) => ({
                                      label: `${record.accountDescription} (${record.accountCode})`,
                                      value: `${record.accountDescription} (${record.accountCode})`,
                                    }))}
                                    onChange={(value) => {
                                      handleToBankChange(value, index);
                                    }}
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
                                    placeholder="Detail"
                                    onFocus={(e) => e.target.select()}
                                    variant="borderless"
                                  />
                                </Form.Item>
                              ),
                              amount: (
                                <Form.Item
                                  {...restField}
                                  name={[name, "amount"]}
                                  fieldKey={[fieldKey, "amount"]}
                                  rules={[
                                    {
                                      required: true,
                                      message: "Please enter amount",
                                    },
                                  ]}
                                >
                                  <Input
                                    placeholder="Amount"
                                    variant="borderless"
                                    onFocus={(e) => e.target.select()}
                                  />
                                </Form.Item>
                              ),
                              toBankCode: (
                                <Form.Item
                                  {...restField}
                                  name={[name, "toBankCode"]}
                                  fieldKey={[fieldKey, "toBankCode"]}
                                  hidden
                                >
                                  <Input
                                    placeholder="Detail"
                                    variant="borderless"
                                  />
                                </Form.Item>
                              ),
                              fromBankCode: (
                                <Form.Item
                                  {...restField}
                                  name={[name, "fromBankCode"]}
                                  fieldKey={[fieldKey, "fromBankCode"]}
                                  hidden
                                >
                                  <Input
                                    placeholder="Detail"
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
                  form={TransferForm}
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
          )}
        </div>
      </div>
    </>
  );
};

export default AddTransfers;
