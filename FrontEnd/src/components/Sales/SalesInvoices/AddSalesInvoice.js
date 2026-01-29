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
  Checkbox,
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
import { async } from "q";
import ProductsDropdown from "../../Common/ProductsDropdown";
import CustomersDropdown from "../../Common/CustomersDropdown";
import AddProductModal from "../../Common/AddProductModal";
import LevelWiseAccount2 from "../../Shared/LevelWiseAccount2";
import BankModeDropdown from "../../Shared/BankModeDropdown";
import ProductDropdown from "../../Shared/ProductDropdown";
import CustomerDropdown from "../../Shared/CustomerDropdown";
import FetchCustomerByID from "../../Shared/FetchCustomerByID";
import FetchProductByID from "../../Shared/FetchProductByID";

const { Option } = Select;

const AddSalesInvoice = () => {
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

  const [loadingProduct, setloadingProduct] = useState(false);
  const [loadingMode, setloadingMode] = useState(false);
  const [loadingBank, setLoadingBank] = useState(false);
  const [ReceiptDate, setReceiptDate] = useState(null);

  const [loading, setLoading] = useState(false);
  const [CustomerLoading, setCustomerLoading] = useState(false);
  const [productLoading, setProductLoading] = useState(false);
  const [CustomerID, setCustomerID] = useState("");
  const [ProductID, setProductID] = useState("");
  const [open, setOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);

  const [totalAmount, setTotalAmount] = useState(0);
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [totalSaleTax, setTotalSaleTax] = useState(0);
  const [overallDiscount, setOverallDiscount] = useState(0);
  const [inComplete, setInComplete] = useState(false);

  const [CustomerForm] = Form.useForm();
  const [PaymentForm] = Form.useForm();
  const [OpenDate, setOpenDate] = useState(null);
  const [termDays, setTermDays] = useState("");
  const [dueDate, setDueDate] = useState(null);

  const [ListOfRecords, setListOfRecords] = useState([]);
  const [ListOfBank, setListOfBank] = useState([]);
  const [BankMode, setBankMode] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState({});
  const [error, setError] = useState(null);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [totalWeight, setTotalWeight] = useState(0);
  const [totalLength, setTotalLength] = useState(0);
  const [label, setLabel] = useState("");
  const [selectedBank, setSelectedBank] = useState("501081001");
  const [SaveAndPrint, setSaveAndPrint] = useState(false);

  const [form] = Form.useForm();

  const handleSubmitNew = async (FormData) => {
    setLoading(true);

    const paymentForm = await PaymentForm.validateFields();
    const fields = form.getFieldValue("users");

    const SaleHead = {
      ...FormData,
      date: OpenDate || dayjs().format("YYYY-MM-DD"),
      dueDate: dueDate || dayjs().format("YYYY-MM-DD"),
      customerName: FormData.customerName.label,
      saleType: "Invoice",
      saleBy: UserName,
      extra2: "",
      companyID: CompanyID,
      isActive: true,
      isDeleted: false,
      userID: UserID,
      inComplete: FormData.inComplete || false,
    };

    const SaleBody = fields.map((item) => ({
      ...item,
      saleType: "Invoice",
      saleBy: UserName,
      companyID: CompanyID,
      isActive: true,
      isDeleted: false,
      userID: UserID,
      inComplete: FormData.inComplete || false,
    }));

    const PaymentData = {
      ...FormData,
      ...paymentForm,
      totalDiscount: 0,
      date: OpenDate || dayjs().format("YYYY-MM-DD"),
      receiptType: "Receipt",
      receiptBy: UserName,
      extra2: "",
      companyID: CompanyID,
      isActive: true,
      isDeleted: false,
      mailingAddress: FormData.address || "",
      customerName: FormData.customerName.label,
      userID: UserID,
      inComplete: false,
      bankCode: selectedBank,
    };

    const paymentBodyData = [
      {
        discount: 0,
        date: OpenDate || dayjs().format("YYYY-MM-DD"),
        dueDate: dueDate || dayjs().format("YYYY-MM-DD"),
        receiptType: "Receipt",
        receiptBy: UserName,
        companyID: CompanyID,
        isActive: true,
        isDeleted: false,
        id: 0,
        userID: UserID,
        inComplete: false,
      },
    ];

    const data = {
      SaleHead: SaleHead,
      SaleBody: SaleBody,
      ReceiptHead: PaymentData,
      ReceiptBody: paymentBodyData,
    };

    try {
      const response = await axios.post(
        `${Config.base_url}Sales/AddSale`,
        data,
        {
          headers: {
            Authorization: `Bearer ${AccessKey}`,
          },
        }
      );
      ////Console.log(response.data);
      if (response.data.status_code === 1) {
        message.success(
          <>
            Invoice Added Successfully Against <br />
            Invoice No:{" "}
            <span style={{ color: "blue" }}>{response.data.invoice}</span>
          </>
        );
        if (SaveAndPrint == true) {
          navigate(`/printInvoice/${response.data.invoice}`);
        }
        setSaveAndPrint(false);
        // setProductList([]);
        setLoading(false);
        // navigate("/sales/sales-invoices");
        CustomerForm.resetFields();
        form.resetFields();
        PaymentForm.resetFields();
      } else {
        message.error(response.data.status_message);
        setLoading(false);
      }
    } catch (error) {
      message.error("Network Error..");
      setLoading(false);
      // //console.error(error)
    }
  };

  useEffect(() => {
    document.title = "Add Sale Invoice";
    const fetchInitialData = async () => {
      setInitialLoading(true);
      try {
        await Promise.all([
          fetchBankAccounts(),
          fetchBankMode(),
          fetchProducts(),
          fetchCustomers(),
        ]);
      } catch (error) {
        console.error("Error loading initial data:", error);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const fetchCustomers = async () => {
    setCustomerLoading(true);
    try {
      const response = await CustomerDropdown();
      if (response != null) {
        setListOfRecords(response);
      }
    } catch (error) {
      // //console.error(error);
    } finally {
      setCustomerLoading(false);
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
      // //console.error(error);
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
      // //console.error(error);
    } finally {
      setloadingMode(false);
    }
  };

  const fetchProducts = async () => {
    setProductLoading(true);
    try {
      const response = await ProductDropdown();
      if (response != null) {
        setProductList(response || []);
      }
    } catch (error) {
      // //console.error(error);
    } finally {
      setProductLoading(false);
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

  const handleProductOk = (FormData) => {
    setLoading(true);
    setProductOpen(false);
    setLoading(false);
  };

  const handleProductCancel = () => {
    setProductOpen(false);
  };

  const CustomerDetail = () => {
    const customer = ListOfRecords.map((record) => ({
      label: `${record.businessName.trim()} (${
        record.isSupplier && parseInt(record.accountCode) < 9000
          ? record.accountNo + " (S)"
          : record.isCustomer && parseInt(record.accountCode) > 9000
          ? record.accountNo + " (C)"
          : record.accountNo
      })`.trim(),
      value: record.id,
    }));
    const onTermDaysChange = (e) => {
      const value = e.target.value;

      setTermDays(value);
      const days = parseInt(value, 10);
      if (!isNaN(days)) {
        const newDueDate = dayjs(OpenDate)
          .add(days, "day")
          .format("YYYY-MM-DD");
        // ////Console.log(newDueDate);
        setDueDate(newDueDate);
        setTermDays(days);
      } else {
        setTermDays(0);
      }
    };

    const handleSelectChange = async (value) => {
      const response = ListOfRecords.find(
        (customer) => customer.id === value.value
      );
      if (response) {
        setCustomerLoading(true);
        if (response) {
          setSelectedCustomer(response);
          setLabel(response.businessName);
          if (response) {
            CustomerForm.setFieldsValue({
              address: response.billingAddress,
              creditLimit: response.creditLimit,
              balance: response.customerOpeningBalance,
              CustomerAccountCode: response.accountNo,
            });
            setCustomerLoading(false);
          }
        } else {
          setCustomerLoading(false);
        }
      }
    };

    const handleDateChange = (e, value) => {
      setOpenDate(value);
      setDueDate(value);
    };

    const handleDueDateChange = (e, value) => {
      setDueDate(value);
    };
    return (
      <>
        <Form layout="vertical" form={CustomerForm} onFinish={handleSubmitNew}>
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
                  style={{ width: "100%" }}
                  placeholder="Select Customer"
                  showSearch
                  optionFilterProp="label" // Specifies which prop should be filtered (label)
                  filterOption={(input, option) =>
                    option?.label?.toLowerCase().includes(input.toLowerCase())
                  }
                  loading={CustomerLoading}
                  notFoundContent={
                    CustomerLoading ? <Spin size="small" /> : null
                  }
                  value={selectedCustomer?.value}
                  labelInValue={true}
                  options={customer}
                  onSelect={handleSelectChange}
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
              <Form.Item name="address" label="Address">
                <Input onFocus={(e) => e.target.select()} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Row gutter={[24, 0]}>
                <Col xs={24} md={12}>
                  <Form.Item name="date" label="Date" required>
                    <DatePicker
                      defaultValue={
                        OpenDate ? dayjs(OpenDate, "YYYY-MM-DD") : dayjs()
                      }
                      style={{ width: "100%" }}
                      onChange={handleDateChange}
                    />
                  </Form.Item>
                </Col>

                <Form.Item name="CustomerAccountCode" label="Term Days" hidden>
                  <Input onFocus={(e) => e.target.select()} />
                </Form.Item>

                <Col xs={24} md={12}>
                  <Form.Item name="termDays" label="Term Days">
                    <Input
                      type="number"
                      onChange={onTermDaysChange}
                      onFocus={(e) => e.target.select()}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item name="dueDate" label="Due Date" required>
                    <DatePicker
                      defaultValue={
                        OpenDate
                          ? termDays && termDays > 0
                            ? dayjs(OpenDate).add(termDays, "days")
                            : dayjs(OpenDate)
                          : dayjs()
                      }
                      style={{ width: "100%" }}
                      onChange={handleDueDateChange}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="docNo" label="Doc No.">
                    <Input onFocus={(e) => e.target.select()} />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
            <Col xs={24} md={8}>
              <Row gutter={[24, 0]}>
                <Col xs={24} md={24}>
                  <Form.Item name="creditLimit" label="Credit Limit">
                    <Input readOnly disabled />
                  </Form.Item>
                </Col>
                <Col xs={24} md={24}>
                  <Form.Item name="balance" label="Balance">
                    <Input readOnly disabled />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>
        </Form>
      </>
    );
  };

  const ProductDetail = () => {
    const productOptions = ProductList.map((item) => ({
      value: item.id,
      label: `${item.name} - Q :  ${item.openingQuantity}`,
    }));
    const handleSelectChange = async (value, index) => {
      for (const item of productOptions) {
        if (item.value === value) {
          setloadingProduct(true);
          try {
            const response = ProductList.find((p) => p.id == value);
            //////Console.log("API response:", response.data);

            if (response) {
              const fields = form.getFieldValue("users");
              const quantity = fields[index].quantity || 0;
              const weight = fields[index].quantity || 0;
              const length = fields[index].quantity || 0;
              const rate = response.salePrice;
              const amount = (quantity * rate).toFixed(2);
              const discount = (amount * response.saleDiscount) / 100;
              const saleTax = (response.gstRate * amount) / 100;
              const net = (amount - discount + saleTax).toFixed(2);

              form.setFieldsValue({
                users: fields.map((field, i) =>
                  i === index
                    ? {
                        ...field,
                        product: response.name,
                        description: `${response.name} ${response.saleInformation}`,
                        unit: response.unit,
                        weight,
                        length,
                        quantity,
                        rate,
                        amount,
                        discPercentege: response.saleDiscount,
                        discount,
                        taxRate: response.gstRate,
                        saleTax,
                        net,
                        defaultUnit: response.defaultUnit,
                        openingQuantity: response.openingQuantity,
                        productID: response.id,
                        productCode: response.code,
                      }
                    : field
                ),
              });
              debouncedHandleFormChange();
            } else {
              // //console.error(
              //   "Selected product not found in productOptions:",
              //   value
              // );
            }
          } catch (error) {
            // //console.error(
            //   "Error fetching data:",
            //   error.response?.data || error.message
            // );
          } finally {
            setloadingProduct(false);
          }
        }
      }
    };

    const handleQuantityChange = (e, index) => {
      const quantity = parseFloat(e.target.value);
      const fields = form.getFieldValue("users");
      const formInstance = fields[index];

      if (isNaN(quantity) || quantity <= 0) {
        //////Console.log("Invalid quantity value");
        return;
      }

      if (formInstance.defaultUnit === "Quantity") {
        const amount = (quantity * formInstance.rate).toFixed(2) || 0;
        const discountAmt = (formInstance.discPercentege * amount) / 100 || 0;
        const Tax = (formInstance.taxRate * amount) / 100 || 0;
        const net = (amount - discountAmt + Tax).toFixed(2);

        fields[index] = {
          ...fields[index],
          quantity,
          amount,
          discount: discountAmt,
          saleTax: Tax,
          net,
        };

        form.setFieldsValue({
          users: fields,
        });

        debouncedHandleFormChange();
      } else {
        //////Console.log("Rate unit is not Quantity");
      }
    };

    const handleWeightChange = (e, index) => {
      const weight = parseFloat(e.target.value);
      const fields = form.getFieldValue("users");
      const formInstance = fields[index];

      if (isNaN(weight) || weight <= 0) {
        //////Console.log("Invalid weight value");
        return;
      }

      if (formInstance.defaultUnit === "Weight") {
        const amount = (weight * formInstance.rate).toFixed(2) || 0;
        const discountAmt = (formInstance.discPercentege * amount) / 100 || 0;
        const Tax = (formInstance.taxRate * amount) / 100 || 0;
        const net = (amount - discountAmt + Tax).toFixed(2);

        fields[index] = {
          ...fields[index],
          weight,
          amount,
          discount: discountAmt,
          saleTax: Tax,
          net,
        };

        form.setFieldsValue({
          users: fields,
        });

        debouncedHandleFormChange();
      } else {
        //////Console.log("Rate unit is not Weight");
      }
    };

    const handleLengthChange = (e, index) => {
      const length = parseFloat(e.target.value);
      const fields = form.getFieldValue("users");
      const formInstance = fields[index];

      if (isNaN(length) || length <= 0) {
        //////Console.log("Invalid length value");
        return;
      }

      if (formInstance.defaultUnit === "Length") {
        const amount = (length * formInstance.rate).toFixed(2) || 0;
        const discountAmt = (formInstance.discPercentege * amount) / 100 || 0;
        const Tax = (formInstance.taxRate * amount) / 100 || 0;
        const net = (amount - discountAmt + Tax).toFixed(2);

        fields[index] = {
          ...fields[index],
          length,
          amount,
          discount: discountAmt,
          saleTax: Tax,
          net,
        };

        form.setFieldsValue({
          users: fields,
        });

        debouncedHandleFormChange();
      } else {
        //////Console.log("Rate unit is not Length");
      }
    };

    const handleRateChange = (e, index) => {
      const fields = form.getFieldValue("users");

      const formInstance = fields[index];
      const rate = parseFloat(e.target.value) || 0;
      const quantity = parseFloat(formInstance.quantity) || 0;
      const length = parseFloat(formInstance.length) || 0;
      const weight = parseFloat(formInstance.weight) || 0;
      const discountPercentage = parseFloat(formInstance.discPercentege) || 0;

      if (formInstance.defaultUnit === "Length") {
        const amount = length * rate;
        const discountAmt = (discountPercentage * amount) / 100 || 0;
        const Tax = (formInstance.taxRate * amount) / 100 || 0;
        const net = (amount - discountAmt + Tax).toFixed(2);

        fields[index] = {
          ...fields[index],
          amount,
          discount: discountAmt,
          saleTax: Tax,
          net,
        };
        form.setFieldsValue({
          users: fields,
        });
        debouncedHandleFormChange();
      } else if (formInstance.defaultUnit === "Weight") {
        const amount = weight * rate;
        const discountAmt = (discountPercentage * amount) / 100 || 0;
        const Tax = (formInstance.taxRate * amount) / 100 || 0;
        const net = (amount - discountAmt + Tax).toFixed(2);

        fields[index] = {
          ...fields[index],
          amount,
          discount: discountAmt,
          saleTax: Tax,
          net,
        };
        form.setFieldsValue({
          users: fields,
        });
        debouncedHandleFormChange();
      } else if (formInstance.defaultUnit === "Quantity") {
        const amount = quantity * rate;
        const discountAmt = (discountPercentage * amount) / 100 || 0;
        const Tax = (formInstance.taxRate * amount) / 100 || 0;
        const net = (amount - discountAmt + Tax).toFixed(2);

        fields[index] = {
          ...fields[index],
          amount,
          discount: discountAmt,
          saleTax: Tax,
          net,
        };
        form.setFieldsValue({
          users: fields,
        });
        debouncedHandleFormChange();
      } else {
        // //console.error("Invalid product selection or quantity");
      }
    };

    const handleDiscountChange = (e, index) => {
      const fields = form.getFieldValue("users");
      const formInstance = fields[index];

      //////Console.log(formInstance);

      const discountPercentage = parseFloat(e.target.value) || 0;
      if (discountPercentage > 100) {
        message.error("Discount cannot be more than 100.");
        return;
      }

      // Ensure amount is not recalculated here
      const amount = parseFloat(formInstance.amount) || 0;
      const gst = parseFloat(formInstance.saleTax) || 0;

      if (amount > 0) {
        const discountAmt = (discountPercentage * amount) / 100 || 0;
        const net = (amount - discountAmt + gst).toFixed(2);

        fields[index] = {
          ...fields[index],
          discount: discountAmt,
          net,
        };

        form.setFieldsValue({
          users: fields,
        });

        debouncedHandleFormChange();
      } else {
        // //console.error("Invalid amount");
      }
    };

    const handleTaxRateChange = (e, index) => {
      const fields = form.getFieldValue("users");
      const formInstance = fields[index];

      const taxRate = parseFloat(e.target.value) || 0;
      const discountPercentage = parseFloat(formInstance.discPercentege) || 0;
      const quantity = parseFloat(formInstance.quantity) || 0;
      const rate = parseFloat(formInstance.rate) || 0;
      const amount = parseFloat(formInstance.amount) || 0; // Get the existing amount

      if (quantity > 0) {
        const discountAmt = (discountPercentage * amount) / 100 || 0;
        const taxAmt = (taxRate * amount) / 100 || 0;
        const net = (amount - discountAmt + taxAmt).toFixed(2);

        fields[index] = {
          ...fields[index],
          saleTax: taxAmt,
          net,
        };

        form.setFieldsValue({
          users: fields,
        });

        debouncedHandleFormChange();
      } else {
        // //console.error("Invalid product selection or quantity");
      }
    };

    const handleUnitChange = (value, index) => {
      const fields = form.getFieldValue("users");
      const formInstance = fields[index];
      const rate = parseFloat(formInstance.rate) || 0;
      const quantity = parseFloat(formInstance.quantity) || 0;
      const length = parseFloat(formInstance.length) || 0;
      const weight = parseFloat(formInstance.weight) || 0;
      const discountPercentage = parseFloat(formInstance.discPercentege) || 0;

      let amount = 0;
      let discountAmt = 0;
      let tax = 0;
      let net = 0;

      if (value === "Length") {
        amount = length * rate;
      } else if (value === "Weight") {
        amount = weight * rate;
      } else if (value === "Quantity") {
        amount = quantity * rate;
      }

      discountAmt = (discountPercentage * amount) / 100 || 0;
      tax = (formInstance.taxRate * amount) / 100 || 0;
      net = (amount - discountAmt + tax).toFixed(2);

      fields[index] = {
        ...fields[index],
        amount,
        discount: discountAmt,
        saleTax: tax,
        net,
      };

      form.setFieldsValue({
        users: fields,
      });

      debouncedHandleFormChange(); // Trigger the form change handler after setting values
    };

    const columns = (remove) => [
      { title: "Sr No", dataIndex: "srNo", key: "srNo", width: 25 },
      {
        title: "Product / Services",
        dataIndex: "product",
        key: "product",
        width: 150,
      },

      { title: "Unit", dataIndex: "unit", key: "unit", width: 150 },
      { title: "Quantity", dataIndex: "quantity", key: "quantity", width: 100 },
      { title: "Weight", dataIndex: "weight", key: "weight", width: 100 },
      { title: "Length", dataIndex: "length", key: "length", width: 100 },
      { title: "Rate", dataIndex: "rate", key: "rate", width: 230 },
      {
        title: "Rate Unit",
        dataIndex: "defaultUnit",
        key: "defaultUnit",
        width: 180,
      },
      { title: "Amount", dataIndex: "amount", key: "amount", width: 250 },
      // {
      //   title: "Disc %",
      //   dataIndex: "discPercentege",
      //   key: "discPercentege",
      //   width: 100,
      // },
      // { title: "Discount", dataIndex: "discount", key: "discount", width: 150 },
      // { title: "Tax Rate %", dataIndex: "taxRate", key: "taxRate", width: 150 },
      // { title: "Sale Tax", dataIndex: "saleTax", key: "saleTax", width: 200 },
      // { title: "Net ", dataIndex: "net", key: "net", width: 250 },
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

    const debouncedHandleFormChange = useCallback(
      debounce(() => {
        const fields = form.getFieldValue("users");
        const quantity = fields.map((item) => parseFloat(item.quantity) || 0);
        const weight = fields.map((item) => parseFloat(item.weight) || 0);
        const length = fields.map((item) => parseFloat(item.length) || 0);
        const amounts = fields.map((item) => parseFloat(item.amount) || 0);
        const discount = fields.map((item) => parseFloat(item.discount) || 0);
        const tax = fields.map((item) => parseFloat(item.saleTax) || 0);
        const net = fields.map((item) => parseFloat(item.net) || 0);

        const totalQuantity = quantity.reduce((sum, value) => sum + value, 0);
        const totalWeight = weight.reduce((sum, value) => sum + value, 0);
        const totalLength = length.reduce((sum, value) => sum + value, 0);
        const totalAmount = amounts.reduce((sum, value) => sum + value, 0);
        const totalDiscount = discount.reduce((sum, value) => sum + value, 0);
        const totalSaleTax = tax.reduce((sum, value) => sum + value, 0);
        const total = net.reduce((sum, value) => sum + value, 0);

        // ////Console.log(totalQuantity, totalWeight, totalLength, totalAmount);
        setTotalQuantity(totalQuantity);
        setTotalWeight(totalWeight);
        setTotalLength(totalLength);
        setTotalDiscount(totalAmount);
        CustomerForm.setFieldsValue({
          subTotal: totalAmount,
          totalDiscount: totalDiscount,
          totalSaleTax: totalSaleTax,
          total: total,
        });
      }, 1000),
      []
    );

    return (
      <>
        <Form
          form={form}
          name="dynamic_form_nest_item"
          onFinish={handleSubmitNew}
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
                      srNo: index + 1,
                      key,
                      product: (
                        <Form.Item
                          {...restField}
                          name={[name, "product"]}
                          fieldKey={[fieldKey, "product"]}
                          style={{ width: "300px" }}
                        >
                          <Select
                            showSearch
                            filterOption={(input, option) =>
                              option.label
                                .toLowerCase()
                                .includes(input.toLowerCase())
                            }
                            notFoundContent={
                              productLoading ? <Spin size="small" /> : null
                            }
                            onChange={(value) => {
                              handleSelectChange(value, index);
                            }}
                            placeholder="Product / Services"
                            variant="borderless"
                            loading={productLoading}
                            options={productOptions}
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
                                    onClick={() => setProductOpen(true)}
                                  >
                                    Add Product
                                  </Button>
                                </Space>
                              </>
                            )}
                          />
                        </Form.Item>
                      ),

                      unit: (
                        <Form.Item
                          {...restField}
                          name={[name, "unit"]}
                          fieldKey={[fieldKey, "unit"]}
                        >
                          <Input
                            placeholder="Unit"
                            variant="borderless"
                            onFocus={(e) => e.target.select()}
                          />
                        </Form.Item>
                      ),
                      quantity: (
                        <Form.Item
                          {...restField}
                          name={[name, "quantity"]}
                          fieldKey={[fieldKey, "quantity"]}
                        >
                          <Input
                            placeholder="Quantity"
                            variant="borderless"
                            type="number"
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => handleQuantityChange(e, index)}
                          />
                        </Form.Item>
                      ),
                      weight: (
                        <Form.Item
                          {...restField}
                          name={[name, "weight"]}
                          fieldKey={[fieldKey, "weight"]}
                        >
                          <Input
                            placeholder="Weight"
                            variant="borderless"
                            type="number"
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => handleWeightChange(e, index)}
                          />
                        </Form.Item>
                      ),
                      length: (
                        <Form.Item
                          {...restField}
                          name={[name, "length"]}
                          fieldKey={[fieldKey, "length"]}
                        >
                          <Input
                            placeholder="Length"
                            variant="borderless"
                            type="number"
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => handleLengthChange(e, index)}
                          />
                        </Form.Item>
                      ),
                      rate: (
                        <Form.Item
                          {...restField}
                          name={[name, "rate"]}
                          fieldKey={[fieldKey, "rate"]}
                        >
                          <Input
                            placeholder="Rate"
                            variant="borderless"
                            type="number"
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => handleRateChange(e, index)}
                          />
                        </Form.Item>
                      ),
                      defaultUnit: (
                        <Form.Item
                          {...restField}
                          name={[name, "defaultUnit"]}
                          fieldKey={[fieldKey, "defaultUnit"]}
                        >
                          <Select
                            variant="borderless"
                            placeholder="Rate Unit"
                            onChange={(value) => {
                              handleUnitChange(value, index);
                            }}
                          >
                            <Option value="Quantity">Quantity</Option>
                            <Option value="Weight">Weight</Option>
                            <Option value="Length">Length</Option>
                          </Select>
                        </Form.Item>
                      ),
                      amount: (
                        <Form.Item
                          {...restField}
                          name={[name, "amount"]}
                          fieldKey={[fieldKey, "amount"]}
                        >
                          <Input
                            placeholder="Amount"
                            readOnly
                            variant="borderless"
                            onFocus={(e) => e.target.select()}
                          />
                        </Form.Item>
                      ),
                      // discPercentege: (
                      //   <Form.Item
                      //     {...restField}
                      //     name={[name, "discPercentege"]}
                      //     fieldKey={[fieldKey, "discPercentege"]}
                      //     onChange={(e) => handleDiscountChange(e, index)}
                      //   >
                      //     <Input placeholder="Disc %" variant="borderless" />
                      //   </Form.Item>
                      // ),
                      // discount: (
                      //   <Form.Item
                      //     {...restField}
                      //     name={[name, "discount"]}
                      //     fieldKey={[fieldKey, "discount"]}
                      //   >
                      //     <Input placeholder="Discount" variant="borderless" />
                      //   </Form.Item>
                      // ),
                      // taxRate: (
                      //   <Form.Item
                      //     {...restField}
                      //     name={[name, "taxRate"]}
                      //     fieldKey={[fieldKey, "taxRate"]}
                      //     onChange={(e) => handleTaxRateChange(e, index)}
                      //   >
                      //     <Input
                      //       placeholder="Tax Rate %"
                      //       variant="borderless"
                      //     />
                      //   </Form.Item>
                      // ),
                      // saleTax: (
                      //   <Form.Item
                      //     {...restField}
                      //     name={[name, "saleTax"]}
                      //     fieldKey={[fieldKey, "saleTax"]}
                      //   >
                      //     <Input placeholder="Sale Tax" variant="borderless" />
                      //   </Form.Item>
                      // ),
                      openingQuantity: (
                        <Form.Item
                          {...restField}
                          name={[name, "openingQuantity"]}
                          fieldKey={[fieldKey, "openingQuantity"]}
                          hidden
                        >
                          <Input
                            placeholder="Unit"
                            variant="borderless"
                            onFocus={(e) => e.target.select()}
                          />
                        </Form.Item>
                      ),
                      productID: (
                        <Form.Item
                          {...restField}
                          name={[name, "productID"]}
                          fieldKey={[fieldKey, "productID"]}
                          hidden
                        >
                          <Input
                            placeholder="Unit"
                            variant="borderless"
                            onFocus={(e) => e.target.select()}
                          />
                        </Form.Item>
                      ),
                      productCode: (
                        <Form.Item
                          {...restField}
                          name={[name, "productCode"]}
                          fieldKey={[fieldKey, "productCode"]}
                          hidden
                        >
                          <Input
                            placeholder="Unit"
                            variant="borderless"
                            onFocus={(e) => e.target.select()}
                          />
                        </Form.Item>
                      ),
                      // net: (
                      //   <Form.Item
                      //     {...restField}
                      //     name={[name, "net"]}
                      //     fieldKey={[fieldKey, "net"]}
                      //   >
                      //     <Input
                      //       placeholder="Net"
                      //       variant="borderless"
                      //       readOnly
                      //     />
                      //   </Form.Item>
                      // ),
                      action: (
                        <MinusCircleOutlined onClick={() => remove(name)} />
                      ),
                    })
                  )}
                  columns={columns(remove)}
                  pagination={false}
                  size="small"
                  scroll={{
                    x: "100%",
                  }}
                  summary={() => (
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0}>
                        Totals:{" "}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1}></Table.Summary.Cell>
                      <Table.Summary.Cell index={2}></Table.Summary.Cell>
                      <Table.Summary.Cell index={3}>
                        {totalQuantity}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={4}>
                        {totalWeight}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={5}>
                        {totalLength}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={6}></Table.Summary.Cell>
                      <Table.Summary.Cell index={7}></Table.Summary.Cell>
                      <Table.Summary.Cell index={8}></Table.Summary.Cell>
                      <Table.Summary.Cell index={9}></Table.Summary.Cell>
                    </Table.Summary.Row>
                  )}
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
      </>
    );
  };

  const AddPayment = () => {
    const handleBankChange = (value) => {
      const bank = ListOfBank.find((b) => b.accountCode == value);
      // ////Console.log(bank)
      if (bank) {
        PaymentForm.setFieldsValue({
          bank: bank.accountDescription,
        });
      }
      setSelectedBank(value);
    };
    const handleAmountChange = () => {
      const amount = PaymentForm.getFieldValue("amount");
      const total = CustomerForm.getFieldValue("total");
      if (amount > total) {
        message.error("Amount cannot be greater than total amount");
        PaymentForm.setFieldsValue({
          amount: 0,
        });
      }
    };
    return (
      <>
        <Form layout="vertical" form={PaymentForm} onFinish={handleSubmitNew}>
          <Row gutter={[8, 0]}>
            <Col xs={24} md={4}>
              <Form.Item name="date" label="Date">
                <DatePicker
                  defaultValue={
                    ReceiptDate == null
                      ? dayjs()
                      : dayjs(ReceiptDate, "YYYY-MM-DD")
                  }
                  style={{ width: "100%" }}
                  onChange={(value) => setReceiptDate(value)}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item name="bank" label="Bank" initialValue="501081001">
                <Select
                  showSearch
                  filterOption={(input, option) =>
                    option.label.toLowerCase().includes(input.toLowerCase())
                  }
                  placeholder="Bank"
                  onChange={handleBankChange}
                  loading={loadingBank}
                  options={ListOfBank.map((item) => ({
                    label: `${item.accountDescription} (${item.accountCode})`,
                    value: item.accountCode,
                  }))}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Row gutter={[8, 0]}>
                <Col xs={24} md={12}>
                  <Form.Item name="mode" label="Mode" initialValue="Cash">
                    <Select
                      showSearch
                      filterOption={(input, option) =>
                        option.label.toLowerCase().includes(input.toLowerCase())
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
                <Col xs={24} md={12}>
                  <Form.Item name="refNo" label="Ref No.">
                    <Input
                      placeholder="Ref No."
                      onFocus={(e) => e.target.select()}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Col>

            <Col xs={24} md={4}>
              <Form.Item name="amount" label="Amount">
                <Input
                  placeholder="Amount"
                  onFocus={(e) => e.target.select()}
                  onChange={handleAmountChange}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </>
    );
  };

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

  const handleOverAllDiscountChange = (e) => {
    const discount = e.target.value;
    const subTotal = CustomerForm.getFieldValue("subTotal");
    const totalSaleTax = CustomerForm.getFieldValue("totalSaleTax");
    const totalDiscount = CustomerForm.getFieldValue("totalDiscount");

    const SubTotalAfterDiscount = (subTotal * discount) / 100 || 0;

    const netTotal = subTotal + totalSaleTax - totalDiscount - discount;

    CustomerForm.setFieldsValue({
      total: netTotal.toFixed(2),
    });
  };

  const handleCheckboxChange = (e, index) => {
    const inComplete = e.target.checked;

    const fields = form.getFieldValue("users");

    fields[index] = {
      ...fields[index],
      inComplete,
    };

    form.setFieldsValue({
      users: fields,
    });
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
      <AddProductModal
        show={productOpen}
        handleOk={handleProductOk}
        handleCancel={handleProductCancel}
        loading={CustomerLoading}
        ProductID={ProductID}
      />
      <div id="sub-menu-wrap">
        <h5>Sales</h5>
        <SalesMenu />
      </div>
      <div className="right-side-contents">
        <div className="page-content mb-5">
          <div className="page-header">
            <SubMenuToggle />
            <h3 className="page-title">
              <NavLink to="/sales/sales-invoices">
                <ArrowLeftIcon />
              </NavLink>
              Add Sales Invoice
            </h3>
          </div>

          {initialLoading ? (
            <>
              <Skeleton active paragraph={{ rows: 4 }} />
              <Skeleton active paragraph={{ rows: 4 }} />
              <Skeleton active paragraph={{ rows: 4 }} />
            </>
          ) : (
            <Space direction="vertical" style={{ width: "100%" }}>
              <Collapse
                collapsible="header"
                defaultActiveKey={["Customer Details"]}
                items={[
                  {
                    key: "Customer Details",
                    label: "Customer Details",
                    children: <CustomerDetail />,
                  },
                ]}
              />
              <Collapse
                collapsible="header"
                defaultActiveKey={["Product Details"]}
                items={[
                  {
                    key: "Product Details",
                    label: "Product Details",
                    children: <ProductDetail />,
                  },
                ]}
              />
              <Form
                layout="vertical"
                form={CustomerForm}
                onFinish={handleSubmitNew}
              >
                <Row gutter={[24, 0]}>
                  <Col xs={24} md={12}>
                    <Form.Item name="notes" label="Notes">
                      <Input.TextArea
                        rows={5}
                        onFocus={(e) => e.target.select()}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Row gutter={[24, 0]}>
                      <Col xs={24} md={12}>
                        <Form.Item name="subTotal" label="Sub Total">
                          <Input readOnly value={totalAmount} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item name="totalDiscount" label="Discount">
                          <Input readOnly defaultValue={totalDiscount} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item name="totalSaleTax" label="Sale Tax">
                          <Input readOnly defaultValue={totalSaleTax} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="overallDiscount"
                          label="OverAll Discount"
                          onChange={(e) => handleOverAllDiscountChange(e)}
                        >
                          <Input
                            defaultValue={overallDiscount}
                            onFocus={(e) => e.target.select()}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={24}>
                        <h4>
                          <Form.Item
                            name="total"
                            label="Total"
                            rules={[
                              {
                                required: true,
                                message: "Please enter valid data",
                              },
                            ]}
                          >
                            <Input readOnly />
                          </Form.Item>
                        </h4>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Form>
              <Collapse
                collapsible="header"
                defaultActiveKey={["Add Receipt"]}
                items={[
                  {
                    key: "Add Receipt",
                    label: "Add Receipt",
                    children: <AddPayment />,
                  },
                ]}
              />
            </Space>
          )}
          <Form
            layout="vertical"
            className="my-5"
            form={CustomerForm}
            onFinish={handleSubmitNew}
          >
            <Row justify="end" className="text-end">
              <Col xs={24} md={4}>
                <Form.Item name="inComplete" valuePropName="checked">
                  <Checkbox onChange={handleCheckboxChange}>
                    InComplete
                  </Checkbox>
                </Form.Item>
              </Col>

              <Col xs={24} md={{ span: 8, offset: 20 }}>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Save and New
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  style={{ marginLeft: 10 }}
                  onClick={() => setSaveAndPrint(true)}
                  loading={loading}
                >
                  Save and Print
                </Button>
              </Col>
            </Row>
          </Form>
        </div>
      </div>
    </>
  );
};

export default AddSalesInvoice;
