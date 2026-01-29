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
  Flex,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { Link, NavLink, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Config from "../../../Config";
import LevelWiseAccount2 from "../../Shared/LevelWiseAccount2";
import BankModeDropdown from "../../Shared/BankModeDropdown";
import SubMenuToggle from "../../Common/SubMenuToggle";

const { Option } = Select;

const EditReturnSupplierPayment = () => {
  const navigate = useNavigate();
  const params = useParams();
  const AccessKey = localStorage.getItem("AccessKey");
  const UserName = localStorage.getItem("Full_Name");
  const UserID = localStorage.getItem("ID");
  const CompanyID = localStorage.getItem("CompanyID");
  const FYear = localStorage.getItem("DefaultFYear");

  const [Productform] = Form.useForm();
  const [MainForm] = Form.useForm();
  const [ProductList, setProductList] = useState([]);

  const [loading, setLoading] = useState(false);
  const [SupplierLoading, setSupplierLoading] = useState(false);
  const [DataLoading, setDataLoading] = useState(false);
  const [productLoading, setProductLoading] = useState(false);
  const [loadingMode, setLoadingMode] = useState(false);
  const [loadingBank, setLoadingBank] = useState(false);

  const [SupplierForm] = Form.useForm();
  const [formMain] = Form.useForm();
  const [OpenDate, setOpenDate] = useState(null);

  const [ListOfRecords, setListOfRecords] = useState([]);
  const [ListOfPayments, setListOfPayments] = useState([]);
  const [ListOfBank, setListOfBank] = useState([]);
  const [BankMode, setBankMode] = useState([]);
  const [Supplier, setSupplier] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [createdBy, setCreatedBy] = useState("");
  const [createdDate, setCreatedDate] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState({});
  const [ListOfReturnPayments, setListOfReturnPayments] = useState([]);

  const [form] = Form.useForm();

  const handleSubmit = async (FormData) => {
    setLoading(true);

    const data = {
      ...Supplier,
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
    };

    try {
      const response = await axios.patch(
        Config.base_url + `PaymentHead/UpdateRecord/${Supplier.id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${AccessKey}`,
          },
        }
      );

      if (response.data.status_code === 1) {
        const fields = form.getFieldValue("users");

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
          amount: item.amount,
          docNo: item.docNo || "",
          total: item.net,
          openBalance: item.openBalance,
        }));

        try {
          const ProductResponse = await axios.patch(
            Config.base_url + `PaymentBody/UpdateRecords/${params.id}`,
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
                parseFloat(selectedSupplier.supplierOpeningBalance) +
                parseFloat(FormData.amount) -
                parseFloat(Supplier.amount),
            };
            ////Console.log(updateSupplierData);
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

            const PaymentDataToUpdate = ListOfReturnPayments.map(
              (payment, index) => {
                const correspondingField = fields[index] || {};
                return {
                  ...payment,
                  unAllocatedBalance:
                    parseFloat(correspondingField.openBalance || 0) -
                    parseFloat(correspondingField.payment || 0),
                };
              }
            );
            ////Console.log(PaymentDataToUpdate);

            for (const item of ListOfReturnPayments) {
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

            message.success(response.data.status_message);
            //setProductList([]);
            setLoading(false);
            navigate("/purchases/purchase-payments");
            SupplierForm.resetFields();
            Productform.resetFields();
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
    document.title = "Edit Supplier Return Payment";
    fetchSupplierData();
    fetchBankAccounts();
    fetchBankMode();
    PaymentBodyData();
  }, []);

  const fetchSupplierData = async () => {
    setSupplierLoading(true);
    try {
      const { data } = await axios.get(
        `${Config.base_url}PaymentHead/GetPaymentHeadBy/${params.id}/${CompanyID}`,
        {
          headers: {
            Authorization: `Bearer ${AccessKey}`,
          },
        }
      );
      if (data.status_code === 1) {
        if (CompanyID != data.paymentHeadData.companyID) {
          navigate("/purchases/purchase-payments");
        }
        const code = data.paymentHeadData.supplierAccountCode;
        ////Console.log(data.paymentHeadData);
        const SupplierData = await axios.get(
          `${Config.base_url}CustomerSupplier/GetSuppliersBy/${CompanyID}?accountCode=${code}`,
          {
            headers: {
              Authorization: `Bearer ${AccessKey}`,
            },
          }
        );
        if (SupplierData.data.status_code == 1) {
          ////Console.log(SupplierData.data.listofSuppliers[0]);
          setSelectedSupplier(SupplierData.data.listofSuppliers[0]);
        }

        SupplierForm.setFieldsValue(data.paymentHeadData);
        setCreatedDate(data.paymentHeadData.createdDate);
        setCreatedBy(data.paymentHeadData.purchaseBy);
        const productDate = SupplierForm.getFieldValue("date");
        setOpenDate(productDate);
        setSupplier(data.paymentHeadData);

        const apiUrl = `${Config.base_url}PaymentHead/GetPaymentBy/${CompanyID}?supplierCode=${code}&purchaseType=Payment`;

        const api_config = {
          method: "get",
          url: apiUrl,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${AccessKey}`,
          },
        };

        const response = await axios(api_config);
        setListOfReturnPayments(response.data.listofPurchases);
        ////Console.log(response.data.listofPurchases);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSupplierLoading(false);
    }
  };

  const formatDate = (isoDateString) => {
    const [datePart] = isoDateString.split("T");
    const [year, month, day] = datePart.split("-");
    return `${day}/${month}/${year}`;
  };

  const PaymentBodyData = async () => {
    try {
      const { data } = await axios.get(
        `${Config.base_url}PaymentBody/GetPaymentBodyBy/${params.id}/${CompanyID}`,
        {
          headers: {
            Authorization: `Bearer ${AccessKey}`,
          },
        }
      );
      if (data.status_code === 1) {
        ////Console.log(data.paymentBodyData);
        form.setFieldsValue({ users: data.paymentBodyData });
        setListOfPayments(data.paymentBodyData);
      }
    } catch (error) {
      console.error("Error fetching salebody data:", error);
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

  const handleDateChange = (e, value) => {
    setOpenDate(value);
  };

  const handlePaymentChange = (e, index) => {
    const fields = form.getFieldValue("users");

    const formInstance = fields[index];
    const receipt = parseFloat(e.target.value) || 0;
    const totalOpenBalance = parseFloat(formInstance.openBalance) || 0;
    if (receipt > totalOpenBalance) {
      message.error("Receipt must be less or equal to Open Balance.");
      fields[index] = {
        ...fields[index],
        receipt: 0,
      };
      form.setFieldsValue({
        users: fields,
      });
      return;
    } else {
      const discount = parseFloat(formInstance.discount) || 0;
      const OriginalAmount = parseFloat(formInstance.total) || 0;
      ////Console.log(OriginalAmount);

      const whtRate = parseFloat(formInstance.wht) || 0;
      const total = whtRate + receipt - discount;

      fields[index] = {
        ...fields[index],
        discount: discount,
        total: receipt.toFixed(2),
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
      width: 150,
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
      dataIndex: "openBalance",
      key: "openBalance",
      width: 200,
    },
    { title: "Receipt", dataIndex: "payment", key: "payment", width: 150 },
  ];

  const debouncedHandleFormChange = useCallback(
    debounce(() => {
      const fields = form.getFieldValue("users");
      const balance = fields.map((item) => parseFloat(item.openBalance) || 0);
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

  return (
    <>
      <div id="sub-menu-wrap">
        <h5>Purchase Return Payment</h5>
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
              Edit Supplier Return Payment
            </h3>
          </div>

          {SupplierLoading ? (
            <>
              <Skeleton active />
              <Skeleton active />
              <Skeleton active />
            </>
          ) : (
            <>
              <Form
                layout="vertical"
                form={SupplierForm}
                onFinish={handleSubmit}
              >
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
                          option.value
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                        notFoundContent={
                          SupplierLoading ? <Spin size="small" /> : null
                        }
                        options={ListOfRecords.map((item) => ({
                          label:
                            item.businessName + " " + `(${item.accountNo})`,
                          value:
                            item.businessName + " " + `(${item.accountNo})`,
                        }))}
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
                          option.label
                            .toLowerCase()
                            .includes(input.toLowerCase())
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
                        <Form.Item label="Date" required>
                          <DatePicker
                            defaultValue={
                              OpenDate === null
                                ? dayjs()
                                : dayjs(OpenDate, "YYYY-MM-DD")
                            }
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
                        <Form.Item
                          name="mailingAddress"
                          label="Mailing Address"
                        >
                          <Input onFocus={(e) => e.target.select()} disabled />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Col>
                  <Col xs={24} md={8}>
                    <Row gutter={[24, 0]}>
                      <Col xs={24} md={24}>
                        <Form.Item
                          name="mode"
                          label="Mode"
                          rules={[
                            {
                              required: true,
                              message: "Please select the mode.",
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
              <Form
                form={form}
                name="dynamic_form_nest_item"
                autoComplete="off"
              >
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
                            openBalance: (
                              <Form.Item
                                {...restField}
                                name={[name, "openBalance"]}
                                fieldKey={[fieldKey, "openBalance"]}
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
                                  placeholder="0.00"
                                  variant="borderless"
                                  onFocus={(e) => e.target.select()}
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
                <Form.Item>
                  <Flex justify="space-between" align="center">
                    <Typography.Text>
                      <h5>
                        Created By : {createdBy} - {formatDate(createdDate)}
                      </h5>
                    </Typography.Text>

                    <Button type="primary" htmlType="submit" loading={loading}>
                      Edit
                    </Button>
                  </Flex>
                </Form.Item>
              </Form>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default EditReturnSupplierPayment;
