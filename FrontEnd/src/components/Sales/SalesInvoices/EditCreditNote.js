import React, { useState, useRef, useEffect, useCallback } from "react";
import { debounce, throttle } from "lodash";
import {
  DeleteOutlined,
  DownOutlined,
  PlusOutlined,
  MinusCircleOutlined,
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
  Flex,
  Skeleton,
  Table,
  Checkbox,
} from "antd";
import dayjs from "dayjs";
import { Link, NavLink, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Config from "../../../Config";
import SubMenuToggle from "../../Common/SubMenuToggle";
import SalesMenu from "./../SalesMenu";
import AddCustomerModal from "../../Common/AddCustomerModal";
import Typography from "antd/es/typography/Typography";
import ProductDropdown from "../../Shared/ProductDropdown";
import CustomerDropdown from "../../Shared/CustomerDropdown";
import FetchCustomerByID from "../../Shared/FetchCustomerByID";
import FetchProductByID from "../../Shared/FetchProductByID";
import moment from "moment";

const { Option } = Select;

const EditCreditNote = () => {
  const params = useParams();
  const navigate = useNavigate();
  const AccessKey = localStorage.getItem("AccessKey");
  const UserName = localStorage.getItem("Full_Name");
  const UserID = localStorage.getItem("ID");
  const CompanyID = localStorage.getItem("CompanyID");
  const FYear = localStorage.getItem("DefaultFYear");

  const [overallDiscount, setOverallDiscount] = useState(0);

  const [Productform] = Form.useForm();
  const [MainForm] = Form.useForm();
  const [ProductList, setProductList] = useState([]);

  const debouncedHandleFormChange = useCallback(
    debounce(() => {
      const fields = form.getFieldValue("users");
      const amounts = fields.map((item) => parseFloat(item.amount) || 0);
      const discount = fields.map((item) => parseFloat(item.discount) || 0);
      const tax = fields.map((item) => parseFloat(item.saleTax) || 0);
      const net = fields.map((item) => parseFloat(item.net) || 0);

      const totalAmount = amounts.reduce((sum, value) => sum + value, 0);
      const totalDiscount = discount.reduce((sum, value) => sum + value, 0);
      const totalSaleTax = tax.reduce((sum, value) => sum + value, 0);
      const total = net.reduce((sum, value) => sum + value, 0);

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

  const handleDeleteProducts = async (index) => {
    const fields = form.getFieldValue("users");
    const formInstance = fields?.[index];

    if (!formInstance) {
      message.error("Invalid form data. Unable to delete.");
      return;
    }

    try {
      const data = { ID: formInstance.id };
      const response = await axios.patch(
        `${Config.base_url}SaleBody/DeleteRecord`,
        data,
        {
          headers: {
            Authorization: `Bearer ${AccessKey}`,
          },
        }
      );

      if (response?.data?.status_code === 1) {
        message.success(response.data.status_message);
        fields.splice(index, 1); // Remove the item from the list
        form.setFieldsValue({ users: fields });
        debouncedHandleFormChange();
      } else {
        message.error(
          response?.data?.status_message || "Failed to delete record."
        );
      }
    } catch (error) {
      //console.error("Error during deletion:", error);
      message.error("Network Error. Please try again.");
    }
  };

  const [loading, setLoading] = useState(false);
  const [CustomerLoading, setCustomerLoading] = useState(false);
  const [productLoading, setProductLoading] = useState(false);
  const [CustomerID, setCustomerID] = useState("");
  const [open, setOpen] = useState(false);

  const [totalAmount, setTotalAmount] = useState(0);
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [totalSaleTax, setTotalSaleTax] = useState(0);

  const [CustomerForm] = Form.useForm();
  const [formMain] = Form.useForm();
  const [OpenDate, setOpenDate] = useState(null);
  const [termDays, setTermDays] = useState("");
  const [dueDate, setDueDate] = useState(null);

  const [ListOfRecords, setListOfRecords] = useState([]);
  const [ListOfProducts, setListOfProducts] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [customer, setCustomer] = useState([]);
  const [product, setProduct] = useState([]);
  const [createdBy, setCreatedBy] = useState("");
  const [createdDate, setCreatedDate] = useState("");
  const [LoadingCustomerData, setLoadingCustomerData] = useState(false);
  const [LoadingProductData, setLoadingProductData] = useState(false);

  const [form] = Form.useForm();
  const [selectedCustomer, setSelectedCustomer] = useState({});
  const [paymentData, setPaymentData] = useState({});
  const [receiptHeadData, setReceiptHeadData] = useState({});
  const [Complete, setComplete] = useState(false);
  const [totalWeight, setTotalWeight] = useState(0);
  const [totalLength, setTotalLength] = useState(0);
  const [totalQuantity, setTotalQuantity] = useState(0);

  useEffect(() => {
    fetchCustomer();
    fetchProducts();
  }, []);

  const handleSubmitNew = async (FormData) => {
    setLoading(true);

    const SaleHead = {
      ...customer,
      ...FormData,
      date: OpenDate || dayjs().format("YYYY-MM-DD"),
      dueDate: dueDate || dayjs().format("YYYY-MM-DD"),
      saleType: "Credit",
      saleBy: UserName,
      extra2: "",
      companyID: CompanyID,
      isActive: true,
      isDeleted: false,
      userID: UserID,
      inComplete: Complete || false,
    };
    const fields = form.getFieldValue("users");
    //Console.log(fields);
    const SaleBody = fields.map((item) => ({
      ...item,
      saleType: "Credit",
      saleBy: UserName,
      companyID: CompanyID,
      isActive: true,
      isDeleted: false,
      inComplete: Complete,
    }));
    // //Console.log(FormData)
    const data = {
      SaleHead: SaleHead,
      SaleBody: SaleBody,
    };
    //Console.log(data);

    try {
      const response = await axios.patch(
        `${Config.base_url}Sales/EditSale`,
        data,
        {
          headers: {
            Authorization: `Bearer ${AccessKey}`,
          },
        }
      );
      // //Console.log(response.data)
      if (response.data.status_code === 1) {
        message.success(
          <>
            Invoice Updated Successfully Against <br />
            Invoice No:{" "}
            <span style={{ color: "blue" }}>{response.data.invoice}</span>
          </>
        );
        // setProductList([]);
        setLoading(false);
        // navigate("/sales/sales-invoices");
        CustomerForm.resetFields();
        form.resetFields();
      } else {
        message.error(response.data.status_message);
        setLoading(false);
      }
    } catch (error) {
      message.error("Network Error..");
      setLoading(false);
      console.error(error);
    }
  };

  useEffect(() => {
    if (ListOfProducts.length > 0 && ProductList.length > 0) {
      // //Console.log("ProductList:", ProductList);
      ProductList.forEach((user, index) => {
        handleFetchProduct(user.productID, index);
        const fields = form.getFieldValue("users");

        fields[index] = {
          ...fields[index],
          BaseWeight: user.weight || 0,
          BaseQuantity: user.quantity || 0,
          BaseLength: user.length || 0,
        };

        form.setFieldsValue({
          users: fields,
        });
      });
    }
  }, [ListOfProducts, ProductList]);

  useEffect(() => {
    document.title = "Edit Credit Note";
    fetchCustomer();
    fetchProducts();
    fetchSales();
  }, []);

  const fetchSales = async () => {
    setLoadingCustomerData(true);
    try {
      const data = {
        ID: params.id,
        CompanyID: CompanyID,
      };
      const response = await axios.post(
        `${Config.base_url}Sales/GetSaleDataForEdit`,
        data,
        {
          headers: {
            Authorization: `Bearer ${AccessKey}`,
          },
        }
      );
      // //Console.log(response.data)
      if (response.data.status_code === 1) {
        // Set form values and date
        CustomerForm.setFieldsValue(response.data.saleHead);
        debouncedHandleFormChange();
        if (CompanyID != response.data.saleHead.companyID) {
          navigate("/sales/sales-invoices");
        }
        setSelectedCustomer(response.data.customer);
        CustomerForm.setFieldsValue({
          balance: response.data.customer.customerOpeningBalance,
        });
        setProductList(response.data.listofSaleBody); // Update the product list state
        setProduct(response.data.listofSaleBody);
        form.setFieldsValue({ users: response.data.listofSaleBody });
        setCreatedDate(response.data.saleHead.createdDate);
        setCreatedBy(response.data.user);
        setTermDays(response.data.saleHead.termDays);
        const productDate = CustomerForm.getFieldValue("date");
        const DueDate = CustomerForm.getFieldValue("dueDate");
        setOpenDate(productDate);
        setDueDate(DueDate);
        setCustomer(response.data.saleHead);
        //Console.log(response.data.saleHead);
        setTotalAmount(response.data.saleHead.subTotal);
        setComplete(response.data.saleHead.inComplete);
      }
    } catch (error) {
      // console.error("Error fetching salehead data:", error);
    } finally {
      setLoadingCustomerData(false); // Stop loading
    }
  };

  const handleFetchProduct = (value, index) => {
    ////Console.log(value);
    const selectedProduct = ListOfProducts.find((item) => item.id === value);
    ////Console.log(selectedProduct);
    if (selectedProduct) {
      const fields = form.getFieldValue("users");
      const quantity = fields[index].quantity || 0;
      const weight = fields[index].quantity || 0;
      const length = fields[index].quantity || 0;
      const rate = selectedProduct.salePrice;
      const amount = (quantity * rate).toFixed(2);
      const discount = (amount * selectedProduct.saleDiscount) / 100;
      const saleTax = (selectedProduct.gstRate * amount) / 100;
      const net = (amount - discount + saleTax).toFixed(2);

      form.setFieldsValue({
        users: fields.map((field, i) =>
          i === index
            ? {
                ...field,
                defaultUnit: selectedProduct.defaultUnit,
                openingQuantity: selectedProduct.openingQuantity,
                productID: selectedProduct.id,
                productCode: selectedProduct.code,
              }
            : field
        ),
      });
      debouncedHandleFormChange();
    } else {
      console.error("Selected product not found in ListOfProducts:", value);
    }
  };

  const fetchProducts = async () => {
    setProductLoading(true);
    try {
      const response = await ProductDropdown();
      if (response) {
        setListOfProducts(response || []);
      }
    } catch (error) {
      // console.error(error);
    } finally {
      setProductLoading(false);
    }
  };

  const fetchCustomer = async () => {
    setCustomerLoading(true);
    try {
      const response = await CustomerDropdown();
      if (response != null) {
        setListOfRecords(response);
      }
    } catch (error) {
      // console.error(error);
    } finally {
      setCustomerLoading(false);
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
        // //Console.log(newDueDate);
        setDueDate(newDueDate);
        setTermDays(days);
      } else {
        setTermDays(0);
      }
    };

    const handleSelectChange = async (value) => {
      // ////Console.log(value)
      const selectedCustomer = customer.find(
        (customer) => customer.value === value
      );
      if (selectedCustomer) {
        setCustomerLoading(true);
        const response = ListOfRecords.find((s) => s.id == value);
        setSelectedCustomer(response);
        CustomerForm.setFieldsValue({
          address: response.billingAddress,
          creditLimit: response.creditLimit,
          balance: response.customerOpeningBalance,
          SupplierAccountCode: response.accountNo,
          supplierName: response.businessName,
        });
        setCustomerLoading(false);
      } else {
        setCustomerLoading(false);
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
                  style={{
                    width: "100%",
                  }}
                  placeholder="Select Customer"
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
                          Add Customer
                        </Button>
                      </Space>
                    </>
                  )}
                  loading={CustomerLoading}
                  notFoundContent={
                    CustomerLoading ? <Spin size="small" /> : null
                  }
                  options={customer}
                  onSelect={handleSelectChange}
                />
              </Form.Item>
              <Form.Item name="address" label="Address">
                <Input onFocus={(e) => e.target.select()} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Row gutter={[24, 0]}>
                <Col xs={24} md={12}>
                  <Form.Item label="Date" required>
                    <DatePicker
                      defaultValue={
                        OpenDate ? dayjs(OpenDate, "YYYY-MM-DD") : dayjs()
                      }
                      style={{ width: "100%" }}
                      onChange={handleDateChange}
                    />
                  </Form.Item>
                </Col>

                <Form.Item name="CustomerAccountCode" hidden>
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
                  <Form.Item label="Due Date" required>
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
    const productOptions = ListOfProducts.map((item) => ({
      value: item.id,
      label: `${item.name} - Q :  ${item.openingQuantity}`,
    }));
    const handleSelectChange = async (value, index) => {
      const fields = form.getFieldValue("users");

      if (!fields || !fields[index]) {
        return;
      }

      const response = ListOfProducts.find((p) => p.id == value);
      if (response) {
        const fields = form.getFieldValue("users");
        const quantity = 0;
        const weight = 0;
        const length = 0;
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
        //console.error("Invalid product selection or quantity");
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
      { title: "Net ", dataIndex: "net", key: "net", width: 250 },
      {
        title: "Action",
        dataIndex: "action",
        key: "action",
        width: 110,
        render: (_, { key }) => (
          <ul className="inline-action">
            <li>
              <Link
                onClick={() => {
                  handleDeleteProducts(key);
                  remove(key);
                }}
                className="red"
              >
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
        const amounts = fields.map((item) => parseFloat(item.amount) || 0);
        const discount = fields.map((item) => parseFloat(item.discount) || 0);
        const tax = fields.map((item) => parseFloat(item.saleTax) || 0);
        const quantity = fields.map((item) => parseFloat(item.quantity) || 0);
        const weight = fields.map((item) => parseFloat(item.weight) || 0);
        const length = fields.map((item) => parseFloat(item.length) || 0);
        const net = fields.map((item) => parseFloat(item.net) || 0);

        const totalQuantity = quantity.reduce((sum, value) => sum + value, 0);
        const totalWeight = weight.reduce((sum, value) => sum + value, 0);
        const totalLength = length.reduce((sum, value) => sum + value, 0);
        const totalAmount = amounts.reduce((sum, value) => sum + value, 0);
        const totalDiscount = discount.reduce((sum, value) => sum + value, 0);
        const totalSaleTax = tax.reduce((sum, value) => sum + value, 0);
        const total = net.reduce((sum, value) => sum + value, 0);

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
                              handleUnitChange(value, index); // Pass the selected value directly
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
                      BaseLength: (
                        <Form.Item
                          {...restField}
                          name={[name, "BaseLength"]}
                          fieldKey={[fieldKey, "BaseLength"]}
                          hidden
                        >
                          <Input
                            placeholder="Unit"
                            variant="borderless"
                            onFocus={(e) => e.target.select()}
                          />
                        </Form.Item>
                      ),
                      BaseQuantity: (
                        <Form.Item
                          {...restField}
                          name={[name, "BaseQuantity"]}
                          fieldKey={[fieldKey, "BaseQuantity"]}
                          hidden
                        >
                          <Input
                            placeholder="Unit"
                            variant="borderless"
                            onFocus={(e) => e.target.select()}
                          />
                        </Form.Item>
                      ),
                      BaseWeight: (
                        <Form.Item
                          {...restField}
                          name={[name, "BaseWeight"]}
                          fieldKey={[fieldKey, "BaseWeight"]}
                          hidden
                        >
                          <Input
                            placeholder="Unit"
                            variant="borderless"
                            onFocus={(e) => e.target.select()}
                          />
                        </Form.Item>
                      ),
                      net: (
                        <Form.Item
                          {...restField}
                          name={[name, "net"]}
                          fieldKey={[fieldKey, "net"]}
                        >
                          <Input
                            placeholder="Net"
                            variant="borderless"
                            readOnly
                          />
                        </Form.Item>
                      ),
                      action: (
                        <MinusCircleOutlined onClick={() => remove(name)} />
                      ),
                    })
                  )}
                  columns={columns(remove)}
                  pagination={false}
                  scroll={{
                    x: "100%",
                  }}
                  size="small"
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
              Edit Credit Note
            </h3>
          </div>

          {!LoadingCustomerData ? (
            <>
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
                        <Input.TextArea rows={5} />
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
                            <Input readOnly value={totalDiscount} />
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
                            <Input defaultValue={overallDiscount} />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={24}>
                          <h4>
                            <Form.Item
                              name="total"
                              label="Total:"
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
              </Space>
              <Form form={CustomerForm} onFinish={handleSubmitNew}>
                <Form.Item name="inComplete" valuePropName="checked">
                  <Flex justify="space-between" align="center">
                    <Typography.Text></Typography.Text>
                    <Checkbox
                      checked={Complete}
                      onChange={(e) => setComplete(!Complete)}
                    >
                      InComplete
                    </Checkbox>
                  </Flex>
                </Form.Item>
                <Form.Item>
                  <Flex justify="space-between" align="center">
                    <Typography.Text>
                      <h5>
                        Created By : {createdBy} -{" "}
                        {moment(createdDate).format("DD/MM/YYYY, h:mm:ss a")}
                      </h5>
                    </Typography.Text>

                    <Button type="primary" htmlType="submit" loading={loading}>
                      Edit
                    </Button>
                  </Flex>
                </Form.Item>
              </Form>
            </>
          ) : (
            <>
              <Skeleton active />
              <Skeleton active />
              <Skeleton active />
            </>
          )}
        </div>
      </div>
    </>
  );
};
export default EditCreditNote;
