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
  Skeleton,
} from "antd";
import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import Config from "../../Config";
import SubMenuToggle from "../Common/SubMenuToggle";
import axios from "axios";
import dayjs from "dayjs";
import BanksMenu from "./BanksMenu";
import LevelWiseAccount2 from "../Shared/LevelWiseAccount2";
import BankModeDropdown from "../Shared/BankModeDropdown";
import LevelWiseAccounts from "../Shared/LevelWiseAccounts";

const { Option } = Select;

const AddBankReceipts = () => {
  const AccessKey = localStorage.getItem("AccessKey");
  const UserID = localStorage.getItem("ID");
  const CompanyID = localStorage.getItem("CompanyID");
  const FYear = localStorage.getItem("DefaultFYear");
  const User = localStorage.getItem("Full_Name");

  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [PaymentForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [OpenDate, setOpenDate] = useState(null);
  const [AccountCode, setAccountCode] = useState("");
  const [Level, setLevel] = useState("0");
  const [OrderBy, setOrderBy] = useState("");
  const [AccountID, setAccountID] = useState("");
  const [ListOfBank, setListOfBank] = useState([]);
  const [BankMode, setBankMode] = useState([]);
  const [ListOfAccounts, setListOfAccounts] = useState([]);
  const [selectedBank, setSelectedBank] = useState("501081001");
  const [initialLoading, setInitialLoading] = useState(true);
  useEffect(() => {
    document.title = "Add Bank Receipts";
    const fetchAccounts = async () => {
      setInitialLoading(true);
      const BankAccounts = await LevelWiseAccount2(3, "50108");
      setListOfBank(BankAccounts);
      const Mode = await BankModeDropdown(0, "BankMode");
      setBankMode(Mode);
      const accounts = await LevelWiseAccounts(3);
      setListOfAccounts(accounts);
      setInitialLoading(false);
    };
    fetchAccounts();
  }, []);

  // In the onFinish function, update the data mapping section:

  const onFinish = async (value) => {
    setLoading(true);
    try {
      const fields = PaymentForm.getFieldValue("users");

      for (let i = 0; i < fields.length; i++) {
        if (fields[i].nominalAccount === undefined) {
          message.error("Please select nominal account.");
          setLoading(false);
          return;
        }
        if (fields[i].amount === undefined) {
          message.error("Please enter amount.");
          setLoading(false);
          return;
        }
      }

      const data = fields.map((field) => {
        // Extract account code from the nominalAccount string
        // Format: "Account Description (AccountCode)"
        let nominalAccountCode = "";
        if (field.nominalAccount) {
          const match = field.nominalAccount.match(/\(([^)]+)\)$/);
          nominalAccountCode = match ? match[1] : "";
        }

        return {
          ...field,
          date: OpenDate || dayjs().format("YYYY-MM-DD"),
          bank: form.getFieldValue("Bank"),
          bankCode: selectedBank,
          refNo: field.refNo || "",
          detail: field.detail || "",
          nominalAccount: field.nominalAccount || "",
          nominalAccountCode: nominalAccountCode, // Add this line
          mode: field.mode || "",
          amount: field.amount || 0,
          bankReceiptType: "Income Receipt",
          bankReceiptBy: User,
          companyID: CompanyID,
          isActive: true,
          isDeleted: false,
          bankReceipt: true,
          userID: UserID,
        };
      });

      const response = await axios.post(
        `${Config.base_url}Bank/AddBankReceipts`,
        data,
        {
          headers: {
            Authorization: `Bearer ${AccessKey}`,
          },
        }
      );

      if (response.data.status_code === 1) {
        message.success(response.data.status_message);
        navigate("/bank/receipts");
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
      title: "Nominal Account",
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
              <NavLink to="/bank/receipts">
                <ArrowLeftIcon />
              </NavLink>
              Add Bank Receipts
            </h3>
          </div>
          <div className="filters-wrap">
            <Form onFinish={handleFilters} form={form}>
              <Form.Item
                name="Bank"
                label="Bank"
                initialValue="501081001"
                rules={[{ required: true, message: "Please select bank" }]}
              >
                <Select
                  showSearch
                  filterOption={(input, option) =>
                    option.label.toLowerCase().includes(input.toLowerCase())
                  }
                  placeholder="Bank"
                  value={selectedBank}
                  onChange={handleBankChange}
                  style={{ width: "350px" }}
                  options={ListOfBank.map((item) => ({
                    label: `${item.accountDescription} (${item.accountCode})`,
                    value: item.accountCode,
                  }))}
                />
              </Form.Item>
            </Form>
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
                                    placeholder="Nominal Account"
                                    style={{ width: "320px" }}
                                    options={ListOfAccounts.map((item) => ({
                                      label: `${item.accountDescription} (${item.accountCode})`,
                                      value: `${item.accountDescription} (${item.accountCode})`,
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
          )}
        </div>
      </div>
    </>
  );
};
export default AddBankReceipts;
