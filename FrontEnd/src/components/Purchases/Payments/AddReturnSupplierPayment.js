import React, { useState, useRef, useEffect, useCallback } from "react";
import { debounce, throttle } from "lodash";
import {
  DeleteOutlined,
  DownOutlined,
  MinusCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { PlusCircleIcon } from "@heroicons/react/24/solid";
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  Row,
  Select,
  message,
  Divider,
  Space,
  Collapse,
  Dropdown,
  Spin,
  Table,
  Skeleton,
} from "antd";
import dayjs from "dayjs";
import { Link, NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Config from "../../../Config";
import SubMenuToggle from "../../Common/SubMenuToggle";
import AddSupplierModal from "../../Common/AddSupplierModal";
import LevelWiseAccount2 from "../../Shared/LevelWiseAccount2";
import BankModeDropdown from "../../Shared/BankModeDropdown";

const { Option } = Select;

const AddReturnSupplierPayment = () => {
  const navigate = useNavigate();
  const AccessKey = localStorage.getItem("AccessKey");
  const UserName = localStorage.getItem("Full_Name");
  const UserID = localStorage.getItem("ID");
  const CompanyID = localStorage.getItem("CompanyID");
  const FYear = localStorage.getItem("DefaultFYear");

  const [Productform] = Form.useForm();
  const [MainForm] = Form.useForm();
  const [ProductList, setProductList] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [SupplierLoading, setSupplierLoading] = useState(false);
  const [DataLoading, setDataLoading] = useState(false);
  const [loadingMode, setloadingMode] = useState(false);
  const [loadingBank, setLoadingBank] = useState(false);
  const [SupplierID, setSupplierID] = useState("");
  const [open, setOpen] = useState(false);

  const [SupplierForm] = Form.useForm();
  const [formMain] = Form.useForm();
  const [OpenDate, setOpenDate] = useState(null);

  const [ListOfRecords, setListOfRecords] = useState([]);
  const [ListOfProducts, setListOfProducts] = useState([]);
  const [ListOfBank, setListOfBank] = useState([]);
  const [ListOfPayments, setListOfPayments] = useState([]);
  const [BankMode, setBankMode] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedSupplier, setSelectedSupplier] = useState({});

  const [form] = Form.useForm();

  const handleSubmit = async (FormData) => {
    setLoading(true);

    if (FormData.totalPayment == 0) {
      message.error("Please enter valid payment data");
      setLoading(false);
      return;
    }

    const data = {
      ...FormData,
      total: FormData.amount,
      date: OpenDate || dayjs().format("YYYY-MM-DD"),
      field1: FormData.field1 || "",
      field2: FormData.field2 || "",
      field3: FormData.field3 || "",
      field4: FormData.field4 || "",
      fieldA: FormData.fieldA || "",
      fieldB: FormData.fieldB || "",
      fieldC: FormData.fieldC || "",
      fieldD: FormData.fieldD || "",
      notes: FormData.notes || "",
      refNo: FormData.refNo || "",
      purchaseType: "Return Payment",
      purchaseBy: UserName,
      extra2: "",
      companyID: CompanyID,
      isActive: true,
      isDeleted: false,
      supplierAccountCode: FormData.supplierAccountCode || "",
      mailingAddress: FormData.mailingAddress || "",
      unAllocatedBalance: 0,
    };

    const fields = form.getFieldValue("users");

    try {
      const response = await axios.post(
        Config.base_url + `PaymentHead/AddPaymentHead`,
        data,
        {
          headers: {
            Authorization: `Bearer ${AccessKey}`,
          },
        }
      );

      if (response.data.status_code === 1) {
        const voucherNo = response.data.paymentHead.voucherNo;

        const productData = fields.map((item) => ({
          ...item,
          field1: item.field1 || "",
          field2: item.field2 || "",
          field3: item.field3 || "",
          field4: item.field4 || "",
          purchaseType: "Return Payment",
          purchaseBy: UserName,
          companyID: CompanyID,
          isActive: true,
          isDeleted: false,
          billID: item.id,
          voucherNo: voucherNo,
          voucherID: item.voucherNo,
          amount: item.amount,
          refNo: item.refNo || "",
          billNo: item.billNo || "",
          total: item.net,
          openBalance: item.unAllocatedBalance,
          id: 0,
        }));
        ////Console.log(productData);
        try {
          const ProductResponse = await axios.post(
            Config.base_url + `PaymentBody/AddPaymentBody`,
            productData,
            {
              headers: {
                Authorization: `Bearer ${AccessKey}`,
              },
            }
          );

          if (ProductResponse.data.status_code === 1) {
            const updateSupplierData = {
              ...selectedSupplier,
              supplierOpeningBalance:
                parseFloat(selectedSupplier.supplierOpeningBalance || 0) +
                parseFloat(FormData.totalPayment || 0) +
                parseFloat(FormData.unAllocatedBalance || 0),
            };
            await axios.patch(
              Config.base_url +
                `CustomerSupplier/UpdateRecord/${selectedSupplier.id}`,
              updateSupplierData,
              {
                headers: {
                  Authorization: `Bearer ${AccessKey}`,
                },
              }
            );

            const PaymentDataToUpdate = ListOfPayments.map((payment, index) => {
              const correspondingField = fields[index] || {};
              return {
                ...payment,
                unAllocatedBalance:
                  parseFloat(payment.unAllocatedBalance || 0) -
                  parseFloat(correspondingField.payment || 0),
              };
            });
            ////Console.log(PaymentDataToUpdate);

            for (const item of ListOfPayments) {
              try {
                const saleResponse = await axios.patch(
                  `${Config.base_url}PaymentHead/UpdateRecords`,
                  PaymentDataToUpdate,
                  {
                    headers: {
                      Authorization: `Bearer ${AccessKey}`,
                    },
                  }
                );
                ////Console.log(saleResponse);
              } catch (error) {
                message.error("Network Error..");
              }
            }

            message.success(
              <>
                Return Payment Added Successfully Against <br />
                Voucher No: <span style={{ color: "blue" }}>{voucherNo}</span>
              </>
            );
            //setProductList([]);
            setLoading(false);
            navigate("/purchases/purchase-payments");
            SupplierForm.resetFields();
          } else {
            message.error(response.data.status_message);
          }
        } catch (error) {
          message.error("Network Error..");
          setLoading(false);
        }
      }
    } catch (error) {
      message.error("Network Error..");
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Add Supplier Return Payment";
    const fetchInitialData = async () => {
      setInitialLoading(true);
      try {
        await Promise.all([
          fetchSupplier(),
          fetchBankAccounts(),
          fetchBankMode(),
        ]);
      } catch (error) {
        console.error("Error loading initial data:", error);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchInitialData();
  }, []);
  const fetchSupplier = async () => {
    setSupplierLoading(true);
    const api_config = {
      method: "get",
      url: `${Config.base_url}CustomerSupplier/GetSuppliersBy/${CompanyID}`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AccessKey}`,
      },
    };

    try {
      const response = await axios(api_config);

      if (response.data && response.data.status_code === 1) {
        setListOfRecords(response.data.listofSuppliers || []);
        setTotalRecords(response.data.totalRecords || 0);
        setSupplierLoading(false);
      } else {
        console.warn(
          "No data or error status_code:",
          response.data.status_code
        );
        setSupplierLoading(false);
        setListOfRecords([]);
      }
    } catch (error) {
      setSupplierLoading(false);
      console.error(
        "Error fetching data:",
        error.response?.data || error.message
      );
      setListOfRecords([]);
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
    setloadingMode(true);
    try {
      const response = await BankModeDropdown(0, "BankMode");
      if (response != null) {
        setBankMode(response || []);
      }
    } catch (error) {
      // console.error(error);
    } finally {
      setloadingMode(false);
    }
  };

  const handleSupplierChange = async (value) => {
    SupplierForm.setFieldsValue({
      unAllocatedBalance: 0.0,
      amount: 0.0,
      whtRate: 0.0,
    });
    setDataLoading(true);

    let code = value.match(/\((\d+)/);
    code = code ? code[1] : null;
    const supplier = ListOfRecords.find((record) => record.accountNo === code);
    setSelectedSupplier(supplier);
    ////Console.log(supplier);
    if (supplier) {
      SupplierForm.setFieldsValue({
        mailingAddress: supplier.billingAddress,
        supplierAccountCode: supplier.accountCode,
      });
    }

    const apiUrl = `${Config.base_url}PaymentHead/GetPaymentBy/${CompanyID}?supplierCode=${code}&purchaseType=Payment`;

    const api_config = {
      method: "get",
      url: apiUrl,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AccessKey}`,
      },
    };

    try {
      const response = await axios(api_config);
      form.setFieldsValue({ users: response.data.listofPurchases });
      setDataLoading(false);
      setListOfPayments(response.data.listofPurchases);
    } catch (error) {
      setDataLoading(false);
      console.error(
        "Error fetching data:",
        error.response?.data || error.message
      );
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

  const handleDateChange = (e, value) => {
    setOpenDate(value);
  };

  const handlePaymentChange = (e, index) => {
    const fields = form.getFieldValue("users");

    const formInstance = fields[index];
    const payment = parseFloat(e.target.value) || 0;
    const totalOpenBalance = parseFloat(formInstance.unAllocatedBalance) || 0;
    if (payment > totalOpenBalance) {
      message.error("Payment must be less or equal to Open Balance.");
      fields[index] = {
        ...fields[index],
        payment: 0.0,
      };
      form.setFieldsValue({
        users: fields,
      });
      debouncedHandleFormChange();
      return;
    } else {
      const net = payment;

      fields[index] = {
        ...fields[index],
        net: net.toFixed(2),
      };
      form.setFieldsValue({
        users: fields,
      });
      debouncedHandleFormChange();
    }
  };

  const columns = [
    { title: "Date", dataIndex: "date", key: "date", width: 200 },
    {
      title: "Type",
      dataIndex: "purchaseType",
      key: "purchaseType",
      width: 100,
    },
    {
      title: "Voucher ID",
      dataIndex: "voucherNo",
      key: "voucherNo",
      width: 100,
    },
    { title: "Ref. No.", dataIndex: "refNo", key: "refNo", width: 200 },
    {
      title: "Original Amount",
      dataIndex: "amount",
      key: "amount",
      width: 200,
    },
    {
      title: "Open Balance",
      dataIndex: "unAllocatedBalance",
      key: "unAllocatedBalance",
      width: 200,
    },
    { title: "Payment", dataIndex: "payment", key: "payment", width: 150 },
  ];

  const debouncedHandleFormChange = useCallback(
    debounce(() => {
      const fields = form.getFieldValue("users");
      const balance = fields.map(
        (item) => parseFloat(item.unAllocatedBalance) || 0
      );
      const payment = fields.map((item) => parseFloat(item.payment) || 0);
      const net = fields.map((item) => parseFloat(item.net) || 0);

      const totalAmount = balance.reduce((sum, value) => sum + value, 0);
      const totalPayment = payment.reduce((sum, value) => sum + value, 0);
      const total = net.reduce((sum, value) => sum + value, 0);

      SupplierForm.setFieldsValue({
        totalOpenBalance: totalAmount.toFixed(2),
        totalPayment: totalPayment.toFixed(2),
        total: total.toFixed(2),
        amount: totalPayment.toFixed(2),
      });
    }, 1000),
    []
  );

  const items = [
    {
      label: "Approve and New",
      key: "1",
    },
    {
      label: "Approve and Print",
      key: "2",
    },
    {
      label: "Approve and Email",
      key: "3",
    },
  ];

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
        <h5>Supplier Return Payment</h5>
        {/* <SalesMenu /> */}
      </div>
      <div className="right-side-contents">
        <div className="page-content mb-5">
          <div className="page-header">
            <SubMenuToggle />
            <h3 className="page-title">
              <NavLink to="/purchases/purchase-payments">
                <ArrowLeftIcon />
              </NavLink>
              Add Supplier Return Payment
            </h3>
          </div>
          {initialLoading ? (
            <>
              <Skeleton active paragraph={{ rows: 4 }} />
              <Skeleton active paragraph={{ rows: 4 }} />
            </>
          ) : (
            <Form layout="vertical" form={SupplierForm} onFinish={handleSubmit}>
              <Row gutter={[24, 0]}>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="supplierName"
                    label="Supplier"
                    rules={[
                      {
                        required: true,
                        message: "Please select the Supplier name.",
                      },
                    ]}
                  >
                    <Select
                      style={{
                        width: "100%",
                      }}
                      placeholder="Select Supplier"
                      loading={SupplierLoading}
                      showSearch
                      filterOption={(input, option) =>
                        option.label.toLowerCase().includes(input.toLowerCase())
                      }
                      notFoundContent={
                        SupplierLoading ? <Spin size="small" /> : null
                      }
                      options={ListOfRecords.map((record) => ({
                        label: `${record.businessName.trim()} (${
                          record.isSupplier &&
                          parseInt(record.accountCode) < 9000
                            ? record.accountNo + " (S)"
                            : record.isCustomer &&
                              parseInt(record.accountCode) > 9000
                            ? record.accountNo + " (C)"
                            : record.accountNo
                        })`.trim(),
                        value: `${record.businessName.trim()} (${
                          record.isSupplier &&
                          parseInt(record.accountCode) < 9000
                            ? record.accountNo + " (S)"
                            : record.isCustomer &&
                              parseInt(record.accountCode) > 9000
                            ? record.accountNo + " (C)"
                            : record.accountNo
                        })`.trim(),
                      }))}
                      onSelect={handleSupplierChange}
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
                  <Form.Item
                    name="bank"
                    label="Bank"
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
                      loading={loadingBank}
                      options={ListOfBank.map((item) => ({
                        label: `${item.accountDescription} (${item.accountCode})`,
                        value: `${item.accountDescription} (${item.accountCode})`,
                      }))}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Row gutter={[24, 0]}>
                    <Col xs={24} md={12}>
                      <Form.Item name="date" label="Date" required>
                        <DatePicker
                          defaultValue={
                            OpenDate === null
                              ? dayjs()
                              : dayjs(OpenDate, "YYYY-MM-DD")
                          }
                          style={{ width: "100%" }}
                          onChange={handleDateChange}
                        />
                      </Form.Item>
                    </Col>
                    <Form.Item
                      name="supplierAccountCode"
                      label="Term Days"
                      hidden
                    >
                      <Input onFocus={(e) => e.target.select()} />
                    </Form.Item>
                    <Col xs={24} md={12}>
                      <Form.Item name="refNo" label="Ref No.">
                        <Input
                          onFocus={(e) => e.target.select()}
                          placeholder="Ref No."
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="amount" label="Amount">
                        <Input
                          onFocus={(e) => e.target.select()}
                          placeholder="0.00"
                          disabled
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="mailingAddress" label="Mailing Address">
                        <Input onFocus={(e) => e.target.select()} disabled />
                      </Form.Item>
                    </Col>
                  </Row>
                </Col>
                <Col xs={24} md={8}>
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
              </Row>
            </Form>
          )}
          <Form form={form} name="dynamic_form_nest_item" autoComplete="off">
            <Form.List name="users">
              {(fields, { add, remove }) => (
                <>
                  <Table
                    scroll={{
                      x: "100%",
                    }}
                    dataSource={fields.map(
                      ({ key, name, fieldKey, ...restField }, index) => ({
                        key,
                        date: (
                          <Form.Item
                            {...restField}
                            name={[name, "date"]}
                            fieldKey={[fieldKey, "date"]}
                          >
                            <Input
                              placeholder="Date"
                              variant="borderless"
                              readOnly
                            />
                          </Form.Item>
                        ),
                        purchaseType: (
                          <Form.Item
                            {...restField}
                            name={[name, "purchaseType"]}
                            fieldKey={[fieldKey, "purchaseType"]}
                          >
                            <Input
                              onFocus={(e) => e.target.select()}
                              variant="borderless"
                              readOnly
                            />
                          </Form.Item>
                        ),
                        voucherNo: (
                          <Form.Item
                            {...restField}
                            name={[name, "voucherNo"]}
                            fieldKey={[fieldKey, "voucherNo"]}
                          >
                            <Input
                              onFocus={(e) => e.target.select()}
                              readOnly
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
                              onFocus={(e) => e.target.select()}
                              variant="borderless"
                              readOnly
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
                              variant="borderless"
                              readOnly
                            />
                          </Form.Item>
                        ),
                        unAllocatedBalance: (
                          <Form.Item
                            {...restField}
                            name={[name, "unAllocatedBalance"]}
                            fieldKey={[fieldKey, "unAllocatedBalance"]}
                          >
                            <Input
                              onFocus={(e) => e.target.select()}
                              readOnly
                              variant="borderless"
                            />
                          </Form.Item>
                        ),
                        payment: (
                          <Form.Item
                            {...restField}
                            name={[name, "payment"]}
                            fieldKey={[fieldKey, "payment"]}
                            onChange={(e) => handlePaymentChange(e, index)}
                          >
                            <Input
                              onFocus={(e) => e.target.select()}
                              placeholder="0.00"
                              variant="borderless"
                            />
                          </Form.Item>
                        ),
                      })
                    )}
                    columns={columns}
                    pagination={false}
                    size="small"
                  />
                </>
              )}
            </Form.List>
          </Form>
          <Form
            layout="vertical"
            form={SupplierForm}
            style={{ marginTop: 13 }}
            onFinish={handleSubmit}
          >
            <Row gutter={[24, 0]}>
              <Col xs={24} md={12}>
                <Form.Item name="notes" label="Notes">
                  <Input.TextArea rows={5} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Row gutter={[24, 0]}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="totalOpenBalance"
                      label="Total Open Balance"
                    >
                      <Input onFocus={(e) => e.target.select()} readOnly />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="totalPayment" label="Total Payment">
                      <Input onFocus={(e) => e.target.select()} readOnly />
                    </Form.Item>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Form>
          <Form
            layout="vertical"
            className="my-5"
            form={SupplierForm}
            onFinish={handleSubmit}
          >
            <Row justify="end" className="text-end">
              <Col xs={24} md={{ span: "4", offset: "20" }}>
                <Dropdown.Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<DownOutlined />}
                  menu={{
                    items,
                  }}
                >
                  Approve and Close
                </Dropdown.Button>
              </Col>
            </Row>
          </Form>
        </div>
      </div>
    </>
  );
};
export default AddReturnSupplierPayment;
