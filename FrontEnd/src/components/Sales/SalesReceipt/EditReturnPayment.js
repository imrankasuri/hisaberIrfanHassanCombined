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
import SubMenuToggle from "../../Common/SubMenuToggle";
import LevelWiseAccount2 from "../../Shared/LevelWiseAccount2";
import BankModeDropdown from "../../Shared/BankModeDropdown";
import SalesMenu from "./../SalesMenu";

const { Option } = Select;

const EditReturnPayment = () => {
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
  const [CustomerLoading, setCustomerLoading] = useState(false);
  const [DataLoading, setDataLoading] = useState(false);
  const [productLoading, setProductLoading] = useState(false);
  const [loadingMode, setLoadingMode] = useState(false);
  const [loadingBank, setLoadingBank] = useState(false);

  const [CustomerForm] = Form.useForm();
  const [formMain] = Form.useForm();
  const [OpenDate, setOpenDate] = useState(null);

  const [ListOfRecords, setListOfRecords] = useState([]);
  const [ListOfProducts, setListOfProducts] = useState([]);
  const [ListOfBank, setListOfBank] = useState([]);
  const [BankMode, setBankMode] = useState([]);
  const [customer, setCustomer] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [createdBy, setCreatedBy] = useState("");
  const [createdDate, setCreatedDate] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState({});
  const [ListOfReceipts, setListOfReceipts] = useState([]);

  const [form] = Form.useForm();

  const handleSubmit = async (FormData) => {
    setLoading(true);

    const data = {
      ...customer,
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
      receiptType: "Return Payment",
      receiptBy: UserName,
      extra2: "",
      companyID: CompanyID,
      isActive: true,
      isDeleted: false,
      customerAccountCode: FormData.customerAccountCode || "",
      mailingAddress: FormData.mailingAddress || "",
    };

    try {
      const response = await axios.patch(
        Config.base_url + `ReceiptHead/UpdateRecord/${customer.id}`,
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
          receiptType: "Return Payment",
          receiptBy: UserName,
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
            Config.base_url + `ReceiptBody/UpdateRecords/${params.id}`,
            productData,
            {
              headers: {
                Authorization: `Bearer ${AccessKey}`,
              },
            }
          );

          if (ProductResponse.data.status_code === 1) {
            const updateCustomerData = {
              ...selectedCustomer,
              customerOpeningBalance:
                parseFloat(selectedCustomer.customerOpeningBalance) -
                parseFloat(FormData.amount) +
                parseFloat(customer.amount),
            };
            ////Console.log(updateCustomerData);
            await axios.patch(
              Config.base_url +
                `CustomerSupplier/UpdateRecord/${selectedCustomer.id}`,
              updateCustomerData,
              {
                headers: {
                  Authorization: `Bearer ${AccessKey}`,
                },
              }
            );

            const ReceiptDataToUpdate = ListOfReceipts.map((receipt, index) => {
              const correspondingField = fields[index] || {};
              return {
                ...receipt,
                unAllocatedBalance:
                  parseFloat(correspondingField.openBalance || 0) -
                  parseFloat(correspondingField.receipt || 0),
              };
            });
            ////Console.log(ReceiptDataToUpdate);

            for (const item of ListOfReceipts) {
              try {
                const saleResponse = await axios.patch(
                  `${Config.base_url}ReceiptHead/UpdateRecords`,
                  ReceiptDataToUpdate,
                  {
                    headers: {
                      Authorization: `Bearer ${AccessKey}`,
                    },
                  }
                );
                ////Console.log(saleResponse);
              } catch (error) {
                console.error("Error updating records:", error);
              }
            }

            message.success(response.data.status_message);
            //setProductList([]);
            setLoading(false);
            navigate("/sales/sales-receipts");
            CustomerForm.resetFields();
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
    document.title = "Edit Sale Return Payment";
    fetchCustomerData();
    fetchBankAccounts();
    fetchBankMode();
    ReceiptBody();
  }, []);

  const fetchCustomerData = async () => {
    setCustomerLoading(true);
    try {
      const { data } = await axios.get(
        `${Config.base_url}ReceiptHead/GetReceiptHeadBy/${params.id}/${CompanyID}`,
        {
          headers: {
            Authorization: `Bearer ${AccessKey}`,
          },
        }
      );
      if (data.status_code === 1) {
        if (CompanyID != data.saleHeadData.companyID) {
          navigate("/sales/sales-receipts");
        }
        const code = data.saleHeadData.customerAccountCode;
        const name = data.saleHeadData.customerName.match(/^[^\(]+/)[0].trim();
        const customerData = await axios.get(
          `${Config.base_url}CustomerSupplier/GetCustomersBy/${CompanyID}?accountCode=${code}`,
          {
            headers: {
              Authorization: `Bearer ${AccessKey}`,
            },
          }
        );
        if (customerData.data.status_code == 1) {
          ////Console.log(customerData.data.listofCustomers[0]);
          setSelectedCustomer(customerData.data.listofCustomers[0]);
        }

        CustomerForm.setFieldsValue(data.saleHeadData);
        setCreatedDate(data.saleHeadData.createdDate);
        setCreatedBy(data.saleHeadData.receiptBy);
        const productDate = CustomerForm.getFieldValue("date");
        setOpenDate(productDate);
        setCustomer(data.saleHeadData);

        const apiUrl = `${Config.base_url}ReceiptHead/GetReceiptBy/${CompanyID}?customerCode=${code}&receiptType=Payment`;

        const api_config = {
          method: "get",
          url: apiUrl,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${AccessKey}`,
          },
        };
        const response = await axios(api_config);
        ////Console.log(response.data.listofSales);
        setListOfReceipts(response.data.listofSales);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setCustomerLoading(false);
    }
  };

  const formatDate = (isoDateString) => {
    const [datePart] = isoDateString.split("T");
    const [year, month, day] = datePart.split("-");
    return `${day}/${month}/${year}`;
  };

  const ReceiptBody = async () => {
    try {
      const { data } = await axios.get(
        `${Config.base_url}ReceiptBody/GetReceiptBodyBy/${params.id}/${CompanyID}`,
        {
          headers: {
            Authorization: `Bearer ${AccessKey}`,
          },
        }
      );
      if (data.status_code === 1) {
        ////Console.log(data);
        form.setFieldsValue({ users: data.saleBodyData });
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

  const handleReceiptChange = (e, index) => {
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
    { title: "Type", dataIndex: "receiptType", key: "receiptType", width: 150 },
    {
      title: "Voucher ID",
      dataIndex: "voucherID",
      key: "voucherID",
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
    { title: "Receipt", dataIndex: "receipt", key: "receipt", width: 150 },
  ];

  const debouncedHandleFormChange = useCallback(
    debounce(() => {
      const fields = form.getFieldValue("users");
      const balance = fields.map((item) => parseFloat(item.openBalance) || 0);
      const discount = fields.map((item) => parseFloat(item.discount) || 0);
      const receipt = fields.map((item) => parseFloat(item.receipt) || 0);
      const total = fields.map((item) => parseFloat(item.total) || 0);
      const wht = fields.map((item) => parseFloat(item.wht) || 0);

      const totalAmount = balance.reduce((sum, value) => sum + value, 0);
      const totalDiscount = discount.reduce((sum, value) => sum + value, 0);
      const totalReceipt = receipt.reduce((sum, value) => sum + value, 0);
      const totals = total.reduce((sum, value) => sum + value, 0);
      const totalWHT = wht.reduce((sum, value) => sum + value, 0);

      CustomerForm.setFieldsValue({
        totalOpenBalance: totalAmount.toFixed(2),
        totalDiscount: totalDiscount.toFixed(2),
        totalWHT: totalWHT.toFixed(2),
        totalReceipt: totalReceipt.toFixed(2),
        total: totals.toFixed(2),
        amount: totalReceipt.toFixed(2),
      });
    }, 1000),
    []
  );

  return (
    <>
      <div id="sub-menu-wrap">
        <h5>Sales Return Payment</h5>
        {/* <SalesMenu /> */}
      </div>
      <div className="right-side-contents">
        <div className="page-content mb-5">
          <div className="page-header">
            <SubMenuToggle />
            <h3 className="page-title">
              <NavLink to="/sales/sales-receipts">
                <ArrowLeftIcon />
              </NavLink>
              Edit Sale Return Payment
            </h3>
          </div>

          {CustomerLoading ? (
            <>
              <Skeleton active />
              <Skeleton active />
              <Skeleton active />
            </>
          ) : (
            <>
              <Form
                layout="vertical"
                form={CustomerForm}
                onFinish={handleSubmit}
              >
                <Row gutter={[24, 0]}>
                  <Col xs={24} md={8}>
                    <Form.Item
                      name="customerName"
                      label="Customer"
                      rules={[
                        {
                          required: true,
                          message: "Please select the customer name.",
                        },
                      ]}
                    >
                      <Select
                        style={{
                          width: "100%",
                        }}
                        placeholder="Select Customer"
                        loading={CustomerLoading}
                        showSearch
                        filterOption={(input, option) =>
                          option.value
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                        notFoundContent={
                          CustomerLoading ? <Spin size="small" /> : null
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
                        name="customerAccountCode"
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
                            receiptType: (
                              <Form.Item
                                {...restField}
                                name={[name, "receiptType"]}
                                fieldKey={[fieldKey, "receiptType"]}
                              >
                                <Input
                                  onFocus={(e) => e.target.select()}
                                  variant="borderless"
                                  readOnly
                                />
                              </Form.Item>
                            ),
                            voucherID: (
                              <Form.Item
                                {...restField}
                                name={[name, "voucherID"]}
                                fieldKey={[fieldKey, "voucherID"]}
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
                            receipt: (
                              <Form.Item
                                {...restField}
                                name={[name, "receipt"]}
                                fieldKey={[fieldKey, "receipt"]}
                                onChange={(e) => handleReceiptChange(e, index)}
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
                form={CustomerForm}
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
                        <Form.Item name="totalReceipt" label="Total Receipt">
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
                form={CustomerForm}
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

export default EditReturnPayment;
