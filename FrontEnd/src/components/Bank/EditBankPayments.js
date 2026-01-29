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
import {
  Link,
  NavLink,
  useNavigate,
  useParams,
  useLocation,
} from "react-router-dom";
import Config from "../../Config";
import SubMenuToggle from "../Common/SubMenuToggle";
import axios from "axios";
import dayjs from "dayjs";
import BanksMenu from "./BanksMenu";
import LevelWiseAccount2 from "../Shared/LevelWiseAccount2";
import BankModeDropdown from "../Shared/BankModeDropdown";
import LevelWiseAccounts from "../Shared/LevelWiseAccounts";
import { EditableVoucherButton, useVoucherRecord } from "../../utils/voucherNavigation";

const { Option } = Select;

const EditBankPayments = () => {
  const AccessKey = localStorage.getItem("AccessKey");
  const UserID = localStorage.getItem("ID");
  const CompanyID = localStorage.getItem("CompanyID");
  const FYear = localStorage.getItem("DefaultFYear");
  const User = localStorage.getItem("Full_Name");

  const { search } = useLocation();
  const NewParams = new URLSearchParams(search);
  const readonly = NewParams.get("readonly") === "true";
  const voucherRecord = useVoucherRecord();

  const navigate = useNavigate();
  const params = useParams();
  const [form] = Form.useForm();
  const [formMain] = Form.useForm();
  const [PaymentForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [OpenDate, setOpenDate] = useState(null);
  const [AccountCode, setAccountCode] = useState("");
  const [Level, setLevel] = useState("0");
  const [OrderBy, setOrderBy] = useState("");
  const [AccountID, setAccountID] = useState("");
  const [BankPaymentList, setBankPaymentList] = useState([]);
  const [bankLoading, setBankLoading] = useState(false);
  const [ListOfBank, setListOfBank] = useState([]);
  const [BankMode, setBankMode] = useState([]);
  const [ListOfAccounts, setListOfAccounts] = useState([]);
  const [selectedBank, setSelectedBank] = useState("");

  useEffect(() => {
    document.title = "Edit Bank Payments";

    fetchBankPaymentData();
    const fetchAccounts = async () => {
      const BankAccounts = await LevelWiseAccount2(3, "50108");
      setListOfBank(BankAccounts);
      const Mode = await BankModeDropdown(0, "BankMode");
      setBankMode(Mode);
      const accounts = await LevelWiseAccounts(3);
      setListOfAccounts(accounts);
    };
    fetchAccounts();
  }, []);

  const fetchBankPaymentData = async () => {
    setBankLoading(true);
    try {
      const data = {
        ID: params.id,
        CompanyID: CompanyID,
        Email: "Expense Payment",
      };
      const response = await axios.post(
        Config.base_url + `Bank/GetBankPaymentByVoucher`,
        data,
        {
          headers: {
            Authorization: `Bearer ${AccessKey}`,
          },
        }
      );
      if (response.data.status_code === 1) {
        setBankPaymentList(response.data.bankPaymentData);
        PaymentForm.setFieldsValue({ users: response.data.bankPaymentData });
        form.setFieldsValue({ Bank: response.data.bankPaymentData[0].bank });
        setOpenDate(response.data.bankPaymentData[0].date);
        setSelectedBank(response.data.bankPaymentData[0].bankCode);
      }
    } catch (error) {
      message.error("Network Error..");
    } finally {
      setBankLoading(false);
    }
  };

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

      const data = fields.map((field) => ({
        ...field,
        Date: dayjs(OpenDate).format("YYYY-MM-DD"),
        bankCode: selectedBank,
        bank: form.getFieldValue("Bank"),
        refNo: field.refNo || "",
        detail: field.detail || "",
        nominalAccount: field.nominalAccount || "",
        mode: field.mode || "",
        amount: field.amount || 0,
        bankPaymentType: "Expense Paymesnt",
        bankPaymentBy: User,
        companyID: CompanyID,
        isActive: true,
        isDeleted: false,
        bankPayment: true,
        whtPayment: false,
        bankReceipt: false,
      }));

      const response = await axios.patch(
        `${Config.base_url}Bank/UpdateRecords`,
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
        navigate("/bank/manage");
        setLoading(false);
      }
    } catch (error) {
      message.error("Network Error..");
      setLoading(false);
      //Console.log(error);
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
              Edit Bank Payments
              {readonly && <span style={{ color: '#ff4d4f', marginLeft: '8px' }}>(Read Only)</span>}
            </h3>
            {readonly && (
              <div className="header-actions" style={{ marginLeft: 'auto' }}>
                <EditableVoucherButton 
                  record={voucherRecord}
                  children="Edit Voucher"
                />
              </div>
            )}
          </div>

          {bankLoading ? (
            <>
              <Skeleton active />
              <Skeleton active />
              <Skeleton active />
            </>
          ) : (
            <>
              <div className="filters-wrap">
                <Form form={form} disabled={readonly}>
                  <Form.Item name="Bank" label="Bank">
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
                    disabled={readonly}
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
                              (
                                { key, name, fieldKey, ...restField },
                                index
                              ) => ({
                                key,
                                date: (
                                  <Form.Item
                                    {...restField}
                                    name={[name, "Date"]}
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
                        </>
                      )}
                    </Form.List>
                  </Form>
                  <Form
                    disabled={readonly}
                    layout="vertical"
                    className="my-5"
                    form={PaymentForm}
                    onFinish={onFinish}
                  >
                    <Row justify="end" className="text-end">
                      <Col xs={24} md={{ span: 4, offset: 20 }}>
                        <Button
                          type="primary"
                          htmlType="submit"
                          loading={loading}
                        >
                          Edit
                        </Button>
                      </Col>
                    </Row>
                  </Form>
                </Col>
              </Row>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default EditBankPayments;
