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
import LevelWiseAccount2 from "../../Shared/LevelWiseAccount2";
import BankModeDropdown from "../../Shared/BankModeDropdown";
import SuppliersDropdown from "../../Shared/SuppliersDropdown";
import { Link, NavLink, useNavigate } from "react-router-dom";
import Config from "../../../Config";
import SubMenuToggle from "../../Common/SubMenuToggle";
import axios from "axios";
import dayjs from "dayjs";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import AddSupplierModal from "../../Common/AddSupplierModal";
import {
  DeleteOutlined,
  PlusCircleOutlined,
  PlusOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";

const { Option } = Select;
function BatchPayment() {
  const navigate = useNavigate();
  const AccessKey = localStorage.getItem("AccessKey");
  const UserID = localStorage.getItem("ID");
  const UserName = localStorage.getItem("Full_Name");
  const CompanyID = localStorage.getItem("CompanyID");

  const [loading, setLoading] = useState(false);
  const [ListOfRecords, setListOfRecords] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [ProductList, setProductList] = useState([]);
  const [OpenDate, setOpenDate] = useState(null);
  const [SupplierLoading, setSupplierLoading] = useState(false);
  const [ListOfBank, setListOfBank] = useState([]);
  const [BankMode, setBankMode] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState({});
  const [loadingBank, setLoadingBank] = useState(false);
  const [loadingMode, setLoadingMode] = useState(false);
  const [SupplierID, setSupplierID] = useState("");
  const [selectedBank, setSelectedBank] = useState("501081001");
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false); // Tracks submission state
  const [submitProgress, setSubmitProgress] = useState(0); // Tracks progress percentage
  const [initialLoading, setInitialLoading] = useState(true);
  const [Productform] = Form.useForm();
  const [form] = Form.useForm();
  const [SupplierForm] = Form.useForm();

  useEffect(() => {
    document.title = "Batch Payments";
    const fetchInitialData = async () => {
      setInitialLoading(true);
      try {
        await Promise.all([
          fetchBankAccounts(),
          fetchBankMode(),
          fetchSupplier(),
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

  const fetchSupplier = async () => {
    setSupplierLoading(true);
    try {
      const response = await SuppliersDropdown();
      if (response != null) {
        setListOfRecords(response);
      }
    } catch (error) {
      // //console.error(error);
    } finally {
      setSupplierLoading(false);
    }
  };

  const handleSubmit = async (FormData) => {
    const fields = form.getFieldValue("users");
    setLoading(true);
    setSubmitting(true); // Start submission process
    setSubmitProgress(10); // Initial progress

    const PaymentHead = fields.map((item) => ({
      ...item,
      date: OpenDate || dayjs().format("YYYY-MM-DD"),
      supplierAccountCode: item.supplierAccountCode || "",
      supplierName: item.supplier,
      amount: item.amount || 0,
      total: item.amount || 0,
      unAllocatedBalance: item.amount || 0,
      mode: FormData.mode || "",
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
      bank: FormData.bank || "",
      purchaseType: "Payment",
      purchaseBy: UserName,
      extra2: "",
      companyID: CompanyID,
      isActive: true,
      isDeleted: false,
      mailingAddress: item.mailingAddress || "",
      inComplete: false,
      bankCode: selectedBank,
      userID: UserID,
    }));
    ////Console.log(data);

    const data = {
      ListOfPaymentHead: PaymentHead,
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
        Config.base_url + `Purchase/AddMultiPayments`,
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
        const receipt = response.data.paymentHeads;
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
        ////setProductList([]);
        setLoading(false);
        //navigate("/purchases/purchase-payments");
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

  const handleSupplierChange = (value, index) => {
    const fields = form.getFieldValue("users");

    const supplier = ListOfRecords.find((record) => record.id === value);
    setSelectedSupplier(supplier);
    ////Console.log(supplier);
    if (supplier) {
      fields[index] = {
        ...fields[index],
        supplierAccountCode: supplier.accountCode,
        balance: supplier.supplierOpeningBalance,
        supplierData: supplier,
        supplier: supplier.businessName,
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
    { title: "Supplier", dataIndex: "supplier", key: "supplier" },
    { title: "Amount", dataIndex: "amount", key: "amount" },
    { title: "Ref No", dataIndex: "refNo", key: "refNo" },
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

  const debouncedHandleFormChange = useCallback(
    debounce(() => {
      const fields = form.getFieldValue("users");
      //Console.log(fields);
      const amounts = fields.map((item) => parseFloat(item.amount) || 0);

      const total = amounts.reduce((sum, value) => sum + value, 0);

      SupplierForm.setFieldsValue({
        total: total,
      });
    }, 1000),
    []
  );

  const supplierOptions = ListOfRecords.map((record) => ({
    label: `${record.businessName.trim()} (${
      record.isSupplier && parseInt(record.accountCode) < 9000
        ? record.accountNo + " (S)"
        : record.isCustomer && parseInt(record.accountCode) > 9000
        ? record.accountNo + " (C)"
        : record.accountNo
    })`.trim(),
    value: record.id,
  }));

  const handleBankChange = (value) => {
    const bank = ListOfBank.find((b) => b.accountCode == value);
    // //Console.log(bank)
    if (bank) {
      SupplierForm.setFieldsValue({
        bank: bank.accountDescription,
      });
    }
    setSelectedBank(value);
  };

  return (
    <>
      <AddSupplierModal
        show={open}
        handleOk={handleOk}
        handleCancel={handleCancel}
        loading={SupplierLoading}
        SupplierID={SupplierID}
      />
      <div id="sub-menu-wrap">
        <h5>Purchase Batch Payments</h5>
        {/* <SalesMenu /> */}
      </div>
      <div className="right-side-contents">
        <div className="page-content">
          <div className="page-header">
            <SubMenuToggle />
            <h3 className="page-title">
              <NavLink to="/purchases/purchase-payments">
                <ArrowLeftIcon />
              </NavLink>
              Batch Payments
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
            <>
              <Form
                layout="vertical"
                form={SupplierForm}
                onFinish={handleSubmit}
              >
                <Row gutter={[24, 0]}>
                  <Col xs={24} md={6}>
                    <Form.Item
                      name="bank"
                      label="Bank"
                      rules={[
                        {
                          required: true,
                          message: "Please select the Bank.",
                        },
                      ]}
                      initialValue="501081001"
                    >
                      <Select
                        showSearch
                        filterOption={(input, option) =>
                          option.label
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                        placeholder="Bank"
                        value={selectedBank}
                        onChange={handleBankChange}
                        loading={loadingBank}
                        options={ListOfBank.map((item) => ({
                          label: `${item.accountDescription} (${item.accountCode})`,
                          value: item.accountCode,
                        }))}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={6}>
                    <Row gutter={[24, 0]}>
                      <Col xs={24} md={24}>
                        <Form.Item name="mode" label="Mode" initialValue="Cash">
                          <Select
                            showSearch
                            filterOption={(input, option) =>
                              option.value
                                .toLowerCase()
                                .includes(input.toLowerCase())
                            }
                            placeholder="Mode"
                            loading={loadingMode}
                            options={BankMode.map((item) => ({
                              label: item.name,
                              value: item.name,
                            }))}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Col>
                  <Col xs={24} md={6}>
                    <Row gutter={[24, 0]}>
                      <Col xs={24} md={24}>
                        <Form.Item name="total" label="Total">
                          <Input
                            onFocus={(e) => e.target.select()}
                            placeholder="Total"
                            disabled
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Form>
              <Form
                form={form}
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
                            supplierData: (
                              <Form.Item
                                {...restField}
                                name={[name, "supplierData"]}
                                fieldKey={[fieldKey, "supplierData"]}
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
                            supplier: (
                              <Form.Item
                                {...restField}
                                name={[name, "supplier"]}
                                fieldKey={[fieldKey, "supplier"]}
                                style={{ width: "350px" }}
                                rules={[
                                  {
                                    required: true,
                                    message: "Please Select Supplier",
                                  },
                                ]}
                              >
                                <Select
                                  variant="borderless"
                                  placeholder="Supplier"
                                  loading={SupplierLoading}
                                  showSearch
                                  filterOption={(input, option) =>
                                    option.label
                                      .toLowerCase()
                                      .includes(input.toLowerCase())
                                  }
                                  notFoundContent={
                                    SupplierLoading ? (
                                      <Spin size="small" />
                                    ) : null
                                  }
                                  options={supplierOptions}
                                  onSelect={(value) => {
                                    handleSupplierChange(value, index);
                                  }}
                                  dropdownRender={(menufieldone) => (
                                    <>
                                      {menufieldone}
                                      <Divider
                                        style={{
                                          margin: "8px 0",
                                        }}
                                      />
                                      <Space
                                        style={{
                                          padding: "0 8px 4px",
                                        }}
                                      >
                                        <Button
                                          type="text"
                                          icon={<PlusOutlined />}
                                          onClick={() => setOpen(true)}
                                        >
                                          Add Supplier
                                        </Button>
                                      </Space>
                                    </>
                                  )}
                                />
                              </Form.Item>
                            ),
                            supplierAccountCode: (
                              <Form.Item
                                name="supplierAccountCode"
                                label="Term Days"
                                hidden
                              >
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
                                  onChange={debouncedHandleFormChange}
                                  variant="borderless"
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
                                  placeholder="Ref No"
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
                                <Input
                                  placeholder="Notes"
                                  variant="borderless"
                                />
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
              </Form>
              <Form onFinish={handleSubmit} form={SupplierForm}>
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
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default BatchPayment;
