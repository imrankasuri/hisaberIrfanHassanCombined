import {
  Form,
  Input,
  DatePicker,
  Button,
  Row,
  Col,
  Space,
  message,
  Select,
  Divider,
  Table,
  Spin,
  Progress,
  Skeleton,
} from "antd";
import React, { useEffect, useState, useCallback } from "react";
import { debounce, throttle } from "lodash";

import { Link, NavLink, useNavigate } from "react-router-dom";
import SalesMenu from "./../SalesMenu";
import Config from "../../../Config";
import SubMenuToggle from "../../Common/SubMenuToggle";
import axios from "axios";
import dayjs from "dayjs";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import {
  DeleteOutlined,
  PlusCircleOutlined,
  PlusOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import AddCustomerModal from "../../Common/AddCustomerModal";
import LevelWiseAccount2 from "../../Shared/LevelWiseAccount2";
import BankModeDropdown from "../../Shared/BankModeDropdown";
import CustomerDropdown from "../../Shared/CustomerDropdown";

const { Option } = Select;
function MultiPayments() {
  const navigate = useNavigate();
  const AccessKey = localStorage.getItem("AccessKey");
  const UserID = localStorage.getItem("ID");
  const UserName = localStorage.getItem("Full_Name");
  const CompanyID = localStorage.getItem("CompanyID");

  const [loading, setLoading] = useState(false);
  const [ListOfRecords, setListOfRecords] = useState([]);
  const [OpenDate, setOpenDate] = useState(null);
  const [CustomerLoading, setCustomerLoading] = useState(false);
  const [CustomerID, setCustomerID] = useState("");
  const [ListOfBank, setListOfBank] = useState([]);
  const [BankMode, setBankMode] = useState([]);
  const [open, setOpen] = useState(false);
  const [loadingBank, setLoadingBank] = useState(false);
  const [loadingMode, setLoadingMode] = useState(false);
  const [submitting, setSubmitting] = useState(false); // Tracks submission state
  const [submitProgress, setSubmitProgress] = useState(0); // Tracks progress percentage
  const [initialLoading, setInitialLoading] = useState(true);
  const [Productform] = Form.useForm();
  const [form] = Form.useForm();

  useEffect(() => {
    document.title = "Multi Payments";
    const fetchInitialData = async () => {
      setInitialLoading(true);
      try {
        await Promise.all([
          fetchBankAccounts(),
          fetchBankMode(),
          fetchCustomer(),
        ]);
      } catch (error) {
        console.error("Error loading initial data:", error);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const handleDateChange = (e, value) => {
    setOpenDate(value);
  };

  const fetchCustomer = async () => {
    setCustomerLoading(true);

    try {
      const response = await CustomerDropdown();

      if (response) {
        setListOfRecords(response);
        setCustomerLoading(false);
      } else {
        setCustomerLoading(false);
        setListOfRecords([]);
      }
    } catch (error) {
      setCustomerLoading(false);
      setListOfRecords([]);
    }
  };

  const handleSubmit = async (item) => {
    const fields = form.getFieldValue("users");
    setLoading(true);
    setSubmitting(true); // Start submission process
    setSubmitProgress(10); // Initial progress

    const ReceiptHead = fields.map((item) => ({
      ...item,
      date: OpenDate || dayjs().format("YYYY-MM-DD"),
      customerAccountCode: item.customerAccountCode || "",
      customerName: item.customer,
      amount: item.amount || 0,
      total: item.amount || 0,
      unAllocatedBalance: item.amount || 0,
      mode: item.mode || "",
      field1: item.field1 || "",
      field2: item.field2 || "",
      field3: item.field3 || "",
      field4: item.field4 || "",
      fieldA: item.fieldA || "",
      fieldB: item.fieldB || "",
      fieldC: item.fieldC || "",
      fieldD: item.fieldD || "",
      notes: item.notes || "",
      refNo: item.refNo || "",
      receiptType: "Payment",
      receiptBy: UserName,
      extra2: "",
      companyID: CompanyID,
      isActive: true,
      isDeleted: false,
      mailingAddress: item.mailingAddress || "",
      inComplete: false,
      userID: UserID,
      bankCode: item.bankCode || "",
      bank: item.bank || "",
    }));
    ////Console.log(data);

    const data = {
      ListOfReceiptHead: ReceiptHead,
    };

    setSubmitProgress(30); // Update progress

    try {
      const progressInterval = setInterval(() => {
        setSubmitProgress((prev) => {
          const newProgress = prev + 10;
          return newProgress < 90 ? newProgress : prev;
        });
      }, 500);
      const response = await axios.post(
        Config.base_url + `Sales/AddMultiReceipts`,
        data,
        {
          headers: {
            Authorization: `Bearer ${AccessKey}`,
          },
        }
      );

      clearInterval(progressInterval);
      setSubmitProgress(100); // Complete progress

      if (response.data.status_code === 1) {
        const receipt = response.data.receiptHeads;

        message.success(
          <>
            {receipt.map((item) => (
              <div className="alert-head">
                <div className="alert-body">
                  Payment Added Successfully Against <br />
                  Voucher No:{" "}
                  <span style={{ color: "blue" }}>{item.voucherNo}</span>
                </div>
              </div>
            ))}
          </>
        );
        setLoading(false);
        //navigate("/sales/sales-receipts");
        form.resetFields();
        Productform.resetFields();

        // Reset progress after completion
        setTimeout(() => {
          setSubmitting(false);
          setSubmitProgress(0);
        }, 1000);
      }
    } catch (error) {
      message.error("Network Error..");
      setLoading(false);
      setSubmitting(false);
      setSubmitProgress(0);
    }
  };

  const fetchBankAccounts = async () => {
    setLoadingBank(true);
    try {
      const response = await LevelWiseAccount2(3, "50108");
      if (response != null) {
        setListOfBank(response);
      }
    } catch (error) {
      // console.error(error);
    } finally {
      setLoadingBank(false);
    }
  };

  const fetchBankMode = async () => {
    setLoadingMode(true);
    try {
      const response = await BankModeDropdown(0, "BankMode");
      if (response != null) {
        setBankMode(response || []);
      }
    } catch (error) {
      // console.error(error);
    } finally {
      setLoadingMode(false);
    }
  };

  const handleCustomerChange = (value, index) => {
    const fields = form.getFieldValue("users");

    const customer = ListOfRecords.find((record) => record.id === value);
    if (customer) {
      fields[index] = {
        ...fields[index],
        customerAccountCode: customer.accountCode,
        balance: customer.customerOpeningBalance,
        customerData: customer,
        customer: customer.businessName,
      };
      form.setFieldsValue({
        users: fields,
      });
    }
  };

  const handleOk = (FormData) => {
    setLoading(true);
    setOpen(false);
    setLoading(false);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const columns = (remove) => [
    { title: "Date", dataIndex: "date", key: "date" },
    { title: "Customer", dataIndex: "customer", key: "customer" },
    { title: "Bank", dataIndex: "bank", key: "bank" },
    {
      title: "Mode",
      dataIndex: "mode",
      key: "mode",
    },
    { title: "Ref. No.", dataIndex: "refNo", key: "refNo" },
    { title: "Amount", dataIndex: "amount", key: "amount" },
    { title: "Notes", dataIndex: "notes", key: "notes" },
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

  const customerOptions = ListOfRecords.map((record) => ({
    label: `${record.businessName.trim()} (${
      record.isSupplier && parseInt(record.accountCode) < 9000
        ? record.accountNo + " (S)"
        : record.isCustomer && parseInt(record.accountCode) > 9000
        ? record.accountNo + " (C)"
        : record.accountNo
    })`.trim(),
    value: record.id,
  }));

  const handleBankChange = (value, index) => {
    const fields = form.getFieldValue("users");

    const bank = ListOfBank.find((record) => record.accountCode === value);
    if (bank) {
      fields[index] = {
        ...fields[index],
        bank: bank.accountDescription,
        bankCode: bank.accountCode,
      };
      form.setFieldsValue({
        users: fields,
      });
    }
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
        <h5>Sale Multi Payments</h5>
        {/* <SalesMenu /> */}
      </div>
      <div className="right-side-contents">
        <div className="page-content">
          <div className="page-header">
            <SubMenuToggle />
            <h3 className="page-title">
              <NavLink to="/sales/sales-receipts">
                <ArrowLeftIcon />
              </NavLink>
              Multi Payments
            </h3>
          </div>

          {/* Progress bar shown during submission */}
          {submitting && (
            <div style={{ margin: "10px 0" }}>
              <Progress
                percent={submitProgress}
                status={submitProgress === 100 ? "success" : "active"}
              />
            </div>
          )}
          {initialLoading ? (
            <>
              <Skeleton active paragraph={{ rows: 4 }} />
              <Skeleton active paragraph={{ rows: 4 }} />
            </>
          ) : (
            <Form
              form={form}
              onFinish={handleSubmit}
              name="dynamic_form_nest_item"
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
                                style={{ minWidth: "110px" }}
                                defaultValue={
                                  OpenDate === null
                                    ? dayjs()
                                    : dayjs(OpenDate, "YYYY-MM-DD")
                                }
                                onChange={handleDateChange}
                              />
                            </Form.Item>
                          ),
                          customerData: (
                            <Form.Item
                              {...restField}
                              name={[name, "customerData"]}
                              fieldKey={[fieldKey, "customerData"]}
                              hidden
                            >
                              <Input
                                onFocus={(e) => e.target.select()}
                                placeholder="Doc No"
                                variant="borderless"
                              />
                            </Form.Item>
                          ),
                          balance: (
                            <Form.Item
                              {...restField}
                              name={[name, "balance"]}
                              fieldKey={[fieldKey, "balance"]}
                              hidden
                            >
                              <Input
                                onFocus={(e) => e.target.select()}
                                placeholder="Doc No"
                                variant="borderless"
                              />
                            </Form.Item>
                          ),
                          customer: (
                            <Form.Item
                              {...restField}
                              name={[name, "customer"]}
                              fieldKey={[fieldKey, "customer"]}
                              style={{ width: "200px" }}
                              rules={[
                                {
                                  required: true,
                                  message: "Please Select Customer",
                                },
                              ]}
                            >
                              <Select
                                variant="borderless"
                                placeholder="Customer"
                                loading={CustomerLoading}
                                showSearch
                                filterOption={(input, option) =>
                                  option.label
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                                }
                                notFoundContent={
                                  CustomerLoading ? <Spin size="small" /> : null
                                }
                                options={customerOptions}
                                onSelect={(value) => {
                                  handleCustomerChange(value, index);
                                }}
                                dropdownRender={(menu) => (
                                  <>
                                    {menu}
                                    <Space
                                      style={{
                                        padding: "0 8px 4px",
                                        display: "flex",
                                        justifyContent: "space-between",
                                      }}
                                    >
                                      <Button
                                        type="text"
                                        icon={<PlusOutlined />}
                                        onClick={() => setOpen(true)}
                                      >
                                        Add Customer
                                      </Button>
                                    </Space>
                                  </>
                                )}
                              />
                            </Form.Item>
                          ),
                          bank: (
                            <Form.Item
                              {...restField}
                              name={[name, "bank"]}
                              fieldKey={[fieldKey, "bank"]}
                              rules={[
                                {
                                  required: true,
                                  message: "Please Select Bank",
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
                                style={{ width: 200 }}
                                placeholder="Bank"
                                loading={loadingBank}
                                variant="borderless"
                                onSelect={(value) => {
                                  handleBankChange(value, index);
                                }}
                                options={ListOfBank.map((item) => ({
                                  label: `${item.accountDescription} (${item.accountCode})`,
                                  value: item.accountCode,
                                }))}
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
                                showSearch
                                filterOption={(input, option) =>
                                  option.value
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                                }
                                style={{ width: "90px" }}
                                placeholder="Mode"
                                loading={loadingMode}
                                variant="borderless"
                                options={BankMode.map((item) => ({
                                  label: item.name,
                                  value: item.name,
                                }))}
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
                                placeholder="Ref. No."
                                variant="borderless"
                              />
                            </Form.Item>
                          ),
                          customerAccountCode: (
                            <Form.Item
                              name="customerAccountCode"
                              label="Term Days"
                              hidden
                            >
                              <Input onFocus={(e) => e.target.select()} />
                            </Form.Item>
                          ),
                          bankCode: (
                            <Form.Item name="bankCode" label="Term Days" hidden>
                              <Input onFocus={(e) => e.target.select()} />
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
                                  message: "Please Enter Amount",
                                },
                              ]}
                            >
                              <Input
                                placeholder="Amount"
                                variant="borderless"
                              />
                            </Form.Item>
                          ),

                          notes: (
                            <Form.Item
                              {...restField}
                              name={[name, "notes"]}
                              fieldKey={[fieldKey, "notes"]}
                            >
                              <Input placeholder="Notes" variant="borderless" />
                            </Form.Item>
                          ),
                        })
                      )}
                      size="small"
                      columns={columns(remove)}
                      scroll={{
                        x: "100%",
                      }}
                      pagination={false}
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
              <Form.Item>
                <Row justify="end">
                  <Col xs={24} md={{ span: 4, offset: 20 }}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      disabled={submitting}
                    >
                      Approve and New
                    </Button>
                  </Col>
                </Row>
              </Form.Item>
            </Form>
          )}
        </div>
      </div>
    </>
  );
}

export default MultiPayments;
