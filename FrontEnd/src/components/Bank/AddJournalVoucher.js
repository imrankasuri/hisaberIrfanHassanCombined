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
import LevelWiseAccounts from "../Shared/LevelWiseAccounts";
import LevelWiseAccount2 from "../Shared/LevelWiseAccount2";
import BankModeDropdown from "../Shared/BankModeDropdown";
import CustomerDropdown from "../Shared/CustomerDropdown";
import SuppliersDropdown from "../Shared/SuppliersDropdown";
import BanksMenu from "./BanksMenu";
import { MinusCircleOutlined } from "@ant-design/icons";
import { useForm } from "antd/es/form/Form";
const AddJournalVoucher = () => {
  const AccessKey = localStorage.getItem("AccessKey");
  const UserID = localStorage.getItem("ID");
  const CompanyID = localStorage.getItem("CompanyID");
  const FYear = localStorage.getItem("DefaultFYear");
  const User = localStorage.getItem("Full_Name");

  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [formMain] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [ListOfAccounts, setListOfAccounts] = useState([]);
  const [ListOfCustomers, setListOfCustomers] = useState([]);
  const [ListOfSuppliers, setListOfSuppliers] = useState([]);
  const [BankMode, setBankMode] = useState([]);
  const [ListOfBank, setListOfBank] = useState([]);
  const [OpenDate, setOpenDate] = useState(null);
  const [TransferForm] = useForm();
  const [initialLoading, setInitialLoading] = useState(true);
  useEffect(() => {
    document.title = "Add Journal Voucher";
    const fetchInitialData = async () => {
      setInitialLoading(true);
      await fetchAccounts();
      setInitialLoading(false);
    };
    fetchInitialData();
  }, []);

  const onFinish = async (value) => {
    setLoading(true);
    try {
      const fields = TransferForm.getFieldValue("users");

      for (let i = 0; i < fields.length; i++) {
        if (fields[i].toAccount === fields[i].fromAccount) {
          message.error("From Account should be different from To Account");
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
        journalVoucherBy: User,
        companyID: CompanyID,
        isActive: true,
        isDeleted: false,
        userID: UserID,
      }));

      const response = await axios.post(
        `${Config.base_url}Bank/AddJournalVoucher`,
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
        navigate("/bank/journalVoucher");
        setLoading(false);
      }
    } catch (error) {
      message.error("Network Error..");
      //Console.log(error);
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    setLoading(true);
    const BankAccounts = await LevelWiseAccount2(3, "50108");
    setListOfBank(BankAccounts);
    const Mode = await BankModeDropdown(0, "BankMode");
    setBankMode(Mode);
    const accounts = await LevelWiseAccounts(3);
    setListOfAccounts(accounts);
    const customers = await CustomerDropdown();
    setListOfCustomers(customers);
    const suppliers = await SuppliersDropdown();
    setListOfSuppliers(suppliers);
    setLoading(false);
  };

  const options = [
    ...ListOfCustomers.map((record) => ({
      label: `${record.businessName} (${record.accountCode})`,
      value: `${record.businessName} (${record.accountCode})`,
    })),
    ...ListOfSuppliers.map((record) => ({
      label: `${record.businessName} (${record.accountCode})`,
      value: `${record.businessName} (${record.accountCode})`,
    })),
    ...ListOfAccounts.map((record) => ({
      label: `${record.accountDescription} (${record.accountCode})`,
      value: `${record.accountDescription} (${record.accountCode})`,
    })),
  ].filter(
    (obj, index, self) => index === self.findIndex((o) => o.value === obj.value)
  );

  const handleDateChange = (date, dateString) => {
    setOpenDate(dateString);
    ////Console.log(dateString);
  };

  const columns = (remove) => [
    { title: "Date", dataIndex: "date", key: "date", width: 250 },
    {
      title: "From Account",
      dataIndex: "fromAccount",
      key: "fromAccount",
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
      title: "To Account",
      dataIndex: "toAccount",
      key: "toAccount",
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
  const handleFromAccountChange = (value, index) => {
    const selectedBank = ListOfAccounts.find(
      (item) => `${item.accountDescription} (${item.accountCode})` === value
    );
    const selectedCustomer = ListOfCustomers.find(
      (item) => `${item.businessName} (${item.accountCode})` === value
    );
    const selectedSupplier = ListOfSuppliers.find(
      (item) => `${item.businessName} (${item.accountCode})` === value
    );

    // Ensure at least one account is selected
    if (selectedBank || selectedCustomer || selectedSupplier) {
      const fields = TransferForm.getFieldValue("users") || []; // Ensure it's an array

      TransferForm.setFieldsValue({
        users: fields.map((field, i) =>
          i === index
            ? {
                ...field,
                fromAccountCode:
                  (selectedBank && selectedBank.accountCode) ||
                  (selectedCustomer && selectedCustomer.accountCode) ||
                  (selectedSupplier && selectedSupplier.accountCode),
              }
            : field
        ),
      });
    }
  };

  const handleToAccountChange = (value, index) => {
    const selectedBank = ListOfAccounts.find(
      (item) => `${item.accountDescription} (${item.accountCode})` === value
    );
    const selectedCustomer = ListOfCustomers.find(
      (item) => `${item.businessName} (${item.accountCode})` === value
    );
    const selectedSupplier = ListOfSuppliers.find(
      (item) => `${item.businessName} (${item.accountCode})` === value
    );

    // Ensure at least one account is selected
    if (selectedBank || selectedCustomer || selectedSupplier) {
      const fields = TransferForm.getFieldValue("users") || []; // Ensure it's an array

      TransferForm.setFieldsValue({
        users: fields.map((field, i) =>
          i === index
            ? {
                ...field,
                toAccountCode:
                  (selectedBank && selectedBank.accountCode) ||
                  (selectedCustomer && selectedCustomer.accountCode) ||
                  (selectedSupplier && selectedSupplier.accountCode),
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
              <NavLink to="/bank/journalVoucher">
                <ArrowLeftIcon />
              </NavLink>
              Add Journal Voucher
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
                              fromAccount: (
                                <Form.Item
                                  {...restField}
                                  name={[name, "fromAccount"]}
                                  fieldKey={[fieldKey, "fromAccount"]}
                                  rules={[
                                    {
                                      required: true,
                                      message: "Please select From Account",
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
                                    loading={loading}
                                    placeholder="From Account"
                                    style={{ width: "250px" }}
                                    options={options}
                                    onChange={(value) => {
                                      handleFromAccountChange(value, index);
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
                              toAccount: (
                                <Form.Item
                                  {...restField}
                                  name={[name, "toAccount"]}
                                  fieldKey={[fieldKey, "toAccount"]}
                                  rules={[
                                    {
                                      required: true,
                                      message: "Please select To Account",
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
                                    placeholder="To Account"
                                    loading={loading}
                                    style={{ width: "250px" }}
                                    options={options}
                                    onChange={(value) => {
                                      handleToAccountChange(value, index);
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
                              toAccountCode: (
                                <Form.Item
                                  {...restField}
                                  name={[name, "toAccountCode"]}
                                  fieldKey={[fieldKey, "toAccountCode"]}
                                  hidden
                                >
                                  <Input
                                    placeholder="Detail"
                                    variant="borderless"
                                  />
                                </Form.Item>
                              ),
                              fromAccountCode: (
                                <Form.Item
                                  {...restField}
                                  name={[name, "fromAccountCode"]}
                                  fieldKey={[fieldKey, "fromAccountCode"]}
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

export default AddJournalVoucher;
