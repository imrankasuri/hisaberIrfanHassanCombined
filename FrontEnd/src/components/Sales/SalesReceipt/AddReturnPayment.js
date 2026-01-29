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
import SalesMenu from "./../SalesMenu";
import AddCustomerModal from "../../Common/AddCustomerModal";
import LevelWiseAccount2 from "../../Shared/LevelWiseAccount2";
import BankModeDropdown from "../../Shared/BankModeDropdown";

const { Option } = Select;

const AddReturnPayment = () => {
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
  const [CustomerLoading, setCustomerLoading] = useState(false);
  const [DataLoading, setDataLoading] = useState(false);
  const [loadingMode, setloadingMode] = useState(false);
  const [loadingBank, setLoadingBank] = useState(false);
  const [CustomerID, setCustomerID] = useState("");
  const [open, setOpen] = useState(false);

  const [CustomerForm] = Form.useForm();
  const [formMain] = Form.useForm();
  const [OpenDate, setOpenDate] = useState(null);

  const [ListOfRecords, setListOfRecords] = useState([]);
  const [ListOfProducts, setListOfProducts] = useState([]);
  const [ListOfBank, setListOfBank] = useState([]);
  const [ListOfReceipts, setListOfReceipts] = useState([]);
  const [BankMode, setBankMode] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState({});

  const [form] = Form.useForm();

  const handleSubmit = async (FormData) => {
    setLoading(true);

    if (FormData.totalReceipt == 0) {
      message.error("Please enter valid receipt data");
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
      receiptType: "Return Payment",
      receiptBy: UserName,
      extra2: "",
      companyID: CompanyID,
      isActive: true,
      isDeleted: false,
      customerAccountCode: FormData.customerAccountCode || "",
      mailingAddress: FormData.mailingAddress || "",
      unAllocatedBalance: 0,
    };

    const fields = form.getFieldValue("users");

    try {
      const response = await axios.post(
        Config.base_url + `ReceiptHead/AddReceiptHead`,
        data,
        {
          headers: {
            Authorization: `Bearer ${AccessKey}`,
          },
        }
      );

      if (response.data.status_code === 1) {
        const receipt = response.data.receiptHead.voucherNo;

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
          invoiceNo: item.id,
          voucherNo: receipt,
          voucherID: item.voucherNo,
          amount: item.amount,
          docNo: item.docNo || "",
          total: item.net,
          openBalance: item.unAllocatedBalance,
          id: 0,
        }));
        ////Console.log(productData);
        try {
          const ProductResponse = await axios.post(
            Config.base_url + `ReceiptBody/AddReceiptBody`,
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
                parseFloat(selectedCustomer.customerOpeningBalance || 0) -
                parseFloat(FormData.totalReceipt || 0) -
                parseFloat(FormData.unAllocatedBalance || 0),
            };
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
                  parseFloat(receipt.unAllocatedBalance || 0) -
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

            message.success(
              <>
                Return Payment Added Successfully Against <br />
                Voucher No: <span style={{ color: "blue" }}>{receipt}</span>
              </>
            );
            //setProductList([]);
            setLoading(false);
            // navigate("/sales/sales-receipts");
            CustomerForm.resetFields();
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
    document.title = "Add Sale Return Payment";
    const fetchInitialData = async () => {
      setInitialLoading(true);
      try {
        await Promise.all([
          fetchCustomer(),
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

  const fetchCustomer = async () => {
    setCustomerLoading(true);
    const api_config = {
      method: "get",
      url: `${Config.base_url}CustomerSupplier/GetCustomersBy/${CompanyID}`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AccessKey}`,
      },
    };

    try {
      const response = await axios(api_config);

      if (response.data && response.data.status_code === 1) {
        setListOfRecords(response.data.listofCustomers || []);
        setTotalRecords(response.data.totalRecords || 0);
        setCustomerLoading(false);
      } else {
        console.warn(
          "No data or error status_code:",
          response.data.status_code
        );
        setCustomerLoading(false);
        setListOfRecords([]);
      }
    } catch (error) {
      setCustomerLoading(false);
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

  const handleCustomerChange = async (value) => {
    CustomerForm.setFieldsValue({
      amount: 0.0,
    });
    setDataLoading(true);

    let code = value.match(/\((\d+)/);
    code = code ? code[1] : null;
    const customer = ListOfRecords.find((record) => record.accountNo === code);
    setSelectedCustomer(customer);
    ////Console.log(customer);
    if (customer) {
      CustomerForm.setFieldsValue({
        mailingAddress: customer.billingAddress,
        customerAccountCode: customer.accountCode,
      });
    }

    const apiUrl = `${Config.base_url}ReceiptHead/GetReceiptBy/${CompanyID}?customerCode=${code}&receiptType=Payment`;

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
      ////Console.log(response.data);
      setListOfReceipts(response.data.listofSales);
      form.setFieldsValue({ users: response.data.listofSales });
      // Handle the response here
      setDataLoading(false);
    } catch (error) {
      setDataLoading(false);
      console.error(
        "Error fetching data:",
        error.response?.data || error.message
      );
      setListOfRecords([]);
    }
  };

  const handleDateChange = (e, value) => {
    setOpenDate(value);
  };

  const handleOk = (FormData) => {
    setLoading(true);
    setOpen(false);
    setLoading(false);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const handleReceiptChange = (e, index) => {
    const fields = form.getFieldValue("users");

    const formInstance = fields[index];
    const receipt = parseFloat(e.target.value) || 0;
    const totalOpenBalance = parseFloat(formInstance.unAllocatedBalance) || 0;
    if (receipt > totalOpenBalance) {
      message.error("Receipt must be less or equal to Open Balance.");
      fields[index] = {
        ...fields[index],
        receipt: 0.0,
      };
      form.setFieldsValue({
        users: fields,
      });
      debouncedHandleFormChange();
      return;
    } else {
      const net = receipt;

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
    { title: "Type", dataIndex: "receiptType", key: "receiptType", width: 100 },
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
    { title: "Receipt", dataIndex: "receipt", key: "receipt", width: 150 },
  ];

  const debouncedHandleFormChange = useCallback(
    debounce(() => {
      const fields = form.getFieldValue("users");
      const balance = fields.map(
        (item) => parseFloat(item.unAllocatedBalance) || 0
      );
      const receipt = fields.map((item) => parseFloat(item.receipt) || 0);
      const net = fields.map((item) => parseFloat(item.net) || 0);

      const totalAmount = balance.reduce((sum, value) => sum + value, 0);
      const totalReceipt = receipt.reduce((sum, value) => sum + value, 0);
      const total = net.reduce((sum, value) => sum + value, 0);

      CustomerForm.setFieldsValue({
        totalOpenBalance: totalAmount.toFixed(2),
        totalReceipt: totalReceipt.toFixed(2),
        total: total.toFixed(2),
        amount: totalReceipt.toFixed(2),
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
      <AddCustomerModal
        show={open}
        handleOk={handleOk}
        handleCancel={handleCancel}
        loading={CustomerLoading}
        CustomerID={CustomerID}
      />
      <div id="sub-menu-wrap">
        <h5>Sales Return Receipt</h5>
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
              Add Sale Return Payment
            </h3>
          </div>
          {initialLoading ? (
            <>
              <Skeleton active paragraph={{ rows: 4 }} />
              <Skeleton active paragraph={{ rows: 4 }} />
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
                          option.label
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                        notFoundContent={
                          CustomerLoading ? <Spin size="small" /> : null
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
                        onSelect={handleCustomerChange}
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
            </>
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
                        receipt: (
                          <Form.Item
                            {...restField}
                            name={[name, "receipt"]}
                            fieldKey={[fieldKey, "receipt"]}
                            onChange={(e) => handleReceiptChange(e, index)}
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
                  Approve and New
                </Dropdown.Button>
              </Col>
            </Row>
          </Form>
        </div>
      </div>
    </>
  );
};
export default AddReturnPayment;
