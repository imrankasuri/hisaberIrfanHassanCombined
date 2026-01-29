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
import axios from "axios";
import dayjs from "dayjs";
import BanksMenu from "./BanksMenu";
import LevelWiseAccount2 from "../Shared/LevelWiseAccount2";
import LevelWiseAccounts from "../Shared/LevelWiseAccounts";
import BankModeDropdown from "../Shared/BankModeDropdown";
import SubMenuToggle from "../Common/SubMenuToggle";
import CustomerDropdown from "../Shared/CustomerDropdown";
import SuppliersDropdown from "../Shared/SuppliersDropdown";
import { EditableVoucherButton, useVoucherRecord } from "../../utils/voucherNavigation";

const { Option } = Select;

const EditJournalVoucher = () => {
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
  const [TransferForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [OpenDate, setOpenDate] = useState(null);
  const [BankPaymentList, setBankPaymentList] = useState([]);
  const [ListOfBank, setListOfBank] = useState([]);
  const [BankMode, setBankMode] = useState([]);
  const [ListOfAccounts, setListOfAccounts] = useState([]);
  const [bankLoading, setBankLoading] = useState(false);
  const [ListOfCustomers, setListOfCustomers] = useState([]);
  const [ListOfSuppliers, setListOfSuppliers] = useState([]);

  useEffect(() => {
    document.title = "Edit Journal Voucher";
    fetchBankTransferData();
    fetchAccounts();
  }, []);

  const fetchBankTransferData = async () => {
    setBankLoading(true);
    try {
      const response = await axios.get(
        Config.base_url + `Bank/GetJournalVoucherBy/${params.id}/${CompanyID}`,

        {
          headers: {
            Authorization: `Bearer ${AccessKey}`,
          },
        }
      );
      if (response.data.status_code === 1) {
        setBankPaymentList(response.data.journalVoucherData);
        TransferForm.setFieldsValue({
          users: response.data.journalVoucherData,
        });
        form.setFieldsValue({ Bank: response.data.journalVoucherData[0].bank });
        setOpenDate(response.data.journalVoucherData[0].date);
        // //Console.log(response.data.journalVoucherData);
      }
    } catch (error) {
      //console.error(error);
    } finally {
      setBankLoading(false);
    }
  };

  const fetchAccounts = async () => {
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
  };

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
      // //Console.log(OpenDate)
      const data = fields.map((field) => ({
        ...field,
        Date: OpenDate || dayjs().format("YYYY-MM-DD"),
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
      }));
      //Console.log(data)
      const response = await axios.patch(
        `${Config.base_url}Bank/UpdateJournalVoucher`,
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
      setLoading(false);
      console.error(error);
    }
  };

  const handleDateChange = (date, dateString) => {
    setOpenDate(dateString);
    //////Console.log(dateString)
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
              Edit Journal Voucher
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
              <Row>
                <Col xs={24} md={24}>
                  <Form
                    disabled={readonly}
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
                                      variant="borderless"
                                      onFocus={(e) => e.target.select()}
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
                        </>
                      )}
                    </Form.List>
                  </Form>
                  <Form
                    disabled={readonly}
                    layout="vertical"
                    className="my-5"
                    form={TransferForm}
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

export default EditJournalVoucher;
