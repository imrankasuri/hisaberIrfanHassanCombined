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
import { Link, NavLink, useNavigate, useParams } from "react-router-dom";
import Config from "../../Config";
import axios from "axios";
import dayjs from "dayjs";
import SubMenuToggle from "../Common/SubMenuToggle";
import BanksMenu from "./BanksMenu";
import LevelWiseAccount2 from "../Shared/LevelWiseAccount2";
import BankModeDropdown from "../Shared/BankModeDropdown";
import SuppliersDropdown from "../Shared/SuppliersDropdown";

const { Option } = Select;

const EditWHTPayments = () => {
  const AccessKey = localStorage.getItem("AccessKey");
  const UserID = localStorage.getItem("ID");
  const CompanyID = localStorage.getItem("CompanyID");
  const FYear = localStorage.getItem("DefaultFYear");
  const User = localStorage.getItem("Full_Name");

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

  useEffect(() => {
    document.title = "Edit WHT Payments";
    fetchBankPaymentData();
    const fetchAccounts = async () => {
      const BankAccounts = await LevelWiseAccount2(3, "50108");
      setListOfBank(BankAccounts);
      const Mode = await BankModeDropdown(0, "BankMode");
      setBankMode(Mode);
    };
    fetchAccounts();
  }, []);

  const fetchBankPaymentData = async () => {
    setBankLoading(true);
    const data = {
      ID: params.id,
      CompanyID: CompanyID,
      Email: "Expense Payment",
    };
    try {
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
      }
    } catch (error) {
      // console.error(error);
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
        date: OpenDate || dayjs().format("YYYY-MM-DD"),
        field1: "",
        field2: "",
        field3: "",
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
        message.success("WHT Payment Updated Successfully");
        navigate("/bank/manage");
        setLoading(false);
      }
    } catch (error) {
      // console.error("Error adding bank payment:", error);
      message.error("Error adding bank payment");
      setLoading(false);
    }
  };

  const handleDateChange = (date, dateString) => {
    setOpenDate(dateString);
    ////Console.log(dateString)
  };

  const ListOfAccounts = SuppliersDropdown();

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
            <Link to={`#/`} onClick={() => remove(key)} className="red">
              <DeleteOutlined />
            </Link>
          </li>
        </ul>
      ),
    },
  ];

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
              Edit WHT Payments
            </h3>
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
                <Form form={form}>
                  <Form.Item name="Bank" label="Bank">
                    <Select
                      showSearch
                      filterOption={(input, option) =>
                        option.label.toLowerCase().includes(input.toLowerCase())
                      }
                      placeholder="Bank"
                      style={{ width: "350px" }}
                      options={ListOfBank.map((fieldThreeitem) => ({
                        label: `${fieldThreeitem.accountDescription} (${fieldThreeitem.accountCode})`,
                        value: `${fieldThreeitem.accountDescription} (${fieldThreeitem.accountCode})`,
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
                                      options={BankMode.map(
                                        (fieldThreeitem) => ({
                                          label: fieldThreeitem.name,
                                          value: fieldThreeitem.name,
                                        })
                                      )}
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
                                      options={ListOfAccounts.map(
                                        (fieldThreeitem) => ({
                                          label: `${fieldThreeitem.businessName} (${fieldThreeitem.accountCode})`,
                                          value: `${fieldThreeitem.businessName} (${fieldThreeitem.accountCode})`,
                                        })
                                      )}
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

export default EditWHTPayments;
