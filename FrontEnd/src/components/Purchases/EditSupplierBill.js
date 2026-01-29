import React, { useState, useEffect, useCallback } from "react";
import { debounce } from "lodash";
import {
  DeleteOutlined,
  PlusOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
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
  Spin,
  Skeleton,
  Table,
  Checkbox,
  Flex,
} from "antd";
import dayjs from "dayjs";
import {
  Link,
  NavLink,
  useNavigate,
  useParams,
  useLocation,
} from "react-router-dom";
import axios from "axios";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Config from "../../Config";
import SubMenuToggle from "../Common/SubMenuToggle";
import PurchaseMenu from "./PurchaseMenu";
import AddSupplierModal from "../Common/AddSupplierModal";
import Typography from "antd/es/typography/Typography";
import moment from "moment";
import SuppliersDropdown from "../Shared/SuppliersDropdown";
import ProductDropdown from "../Shared/ProductDropdown";
import LevelWiseAccount2 from "../Shared/LevelWiseAccount2";
import { EditableVoucherButton, useVoucherRecord } from "../../utils/voucherNavigation";

const { Option } = Select;

const EditSupplierBill = () => {
  const params = useParams();
  const navigate = useNavigate();
  const AccessKey = localStorage.getItem("AccessKey");
  const UserName = localStorage.getItem("Full_Name");
  const UserID = localStorage.getItem("ID");
  const CompanyID = localStorage.getItem("CompanyID");
  const FYear = localStorage.getItem("DefaultFYear");

  const [overallDiscount, setOverallDiscount] = useState(0);

  const { search } = useLocation();
  const NewParams = new URLSearchParams(search);
  const readonly = NewParams.get("readonly") === "true";
  const voucherRecord = useVoucherRecord();

  const [ProductForm] = Form.useForm();
  const [MainForm] = Form.useForm();
  const [ExpenseForm] = Form.useForm();
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
      SupplierForm.setFieldsValue({
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
      // message.error("Invalid form data. Unable to delete.");
      return;
    }

    try {
      const data = { ID: formInstance.id };
      const response = await axios.patch(
        `${Config.base_url}PurchaseBody/DeleteRecord`,
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
        // message.error(
        //   response?.data?.status_message || "Failed to delete record."
        // );
      }
    } catch (error) {
      ////console.error("Error during deletion:", error);
      message.error("Network Error. Please try again.");
    }
  };

  const handleDeleteExpenses = async (index) => {
    const fields = ExpenseForm.getFieldValue("users");
    const formInstance = fields?.[index];
    // //Console.log(fields, formInstance, index)

    if (!formInstance) {
      // message.error("Invalid form data. Unable to delete.");
      return;
    }

    try {
      const data = { ID: formInstance.id };
      const response = await axios.patch(
        `${Config.base_url}Purchase/DeleteExpense`,
        data,
        {
          headers: {
            Authorization: `Bearer ${AccessKey}`,
          },
        }
      );

      // //Console.log(data)

      if (response?.data?.status_code === 1) {
        message.success(response.data.status_message);
        fields.splice(index, 1); // Remove the item from the list
        ExpenseForm.setFieldsValue({ users: fields });
      } else {
        // message.error(
        //   response?.data?.status_message || "Failed to delete record."
        // );
      }
      fields.splice(index, 1); // Remove the item from the list
      ExpenseForm.setFieldsValue({ users: fields });
    } catch (error) {
      ////console.error("Error during deletion:", error);
      message.error("Network Error. Please try again.");
    }
  };

  const [loading, setLoading] = useState(false);
  const [CustomerLoading, setCustomerLoading] = useState(false);
  const [productLoading, setProductLoading] = useState(false);
  const [SupplierID, setSupplierID] = useState("");
  const [open, setOpen] = useState(false);

  const [totalAmount, setTotalAmount] = useState(0);
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [totalSaleTax, setTotalSaleTax] = useState(0);

  const [SupplierForm] = Form.useForm();
  const [formMain] = Form.useForm();
  const [OpenDate, setOpenDate] = useState(null);
  const [termDays, setTermDays] = useState("");
  const [dueDate, setDueDate] = useState(null);

  const [ListOfRecords, setListOfRecords] = useState([]);
  const [ListOfProducts, setListOfProducts] = useState([]);
  const [ListOfBank, setListOfBank] = useState([]);
  const [supplier, setSupplier] = useState([]);
  const [product, setProduct] = useState([]);
  const [createdBy, setCreatedBy] = useState("");
  const [createdDate, setCreatedDate] = useState("");
  const [LoadingCustomerData, setLoadingCustomerData] = useState(false);
  const [Complete, setComplete] = useState(false);
  const [loadingBank, setLoadingBank] = useState(false);
  const [ListOfAccounts, setListOfAcconts] = useState([]);
  const [ReceiptDate, setReceiptDate] = useState(null);
  const [AccountLoading, setAccountLoading] = useState(false);

  const [form] = Form.useForm();
  const [SupplierLoading, setSupplierLoading] = useState(false);
  const [totalWeight, setTotalWeight] = useState(0);
  const [totalLength, setTotalLength] = useState(0);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [SaveAndPrint, setSaveAndPrint] = useState(false);

  const handleSubmit = async (FormData) => {
    setLoading(true);

    const expenseForm = await ExpenseForm.validateFields();

    const PurchaseHead = {
      ...supplier,
      ...FormData,
      date: OpenDate || dayjs().format("YYYY-MM-DD"),
      dueDate: dueDate || dayjs().format("YYYY-MM-DD"),
      purchaseType: "Bill",
      purchaseBy: UserName,
      extra2: "",
      companyID: CompanyID,
      isActive: true,
      isDeleted: false,
      userID: UserID,
      inComplete: Complete || false,
    };
    const fields = form.getFieldValue("users");
    const PurchaseBody = fields.map((item) => ({
      ...item,
      purchaseType: "Bill",
      purchaseBy: UserName,
      companyID: CompanyID,
      isActive: true,
      isDeleted: false,
      inComplete: Complete,
    }));

    const expenseFields = expenseForm.users || [];
    const ExpenseData = expenseFields.map((expense) => {
      let nominalAccountCode = "";
      if (expense.nominalAccount) {
        const match = expense.nominalAccount.match(/\(([^)]+)\)$/);
        nominalAccountCode = match ? match[1] : "";
      }

      return {
        nominalAccount: expense.nominalAccount,
        nominalAccountCode: nominalAccountCode, // Add this line
        amount: parseFloat(expense.amount) || 0,
        detail: expense.detail,
        refNo: "",
        bank: expense.bankName,
        bankCode: expense.bankCode,
        bankID: expense.bankID,
        date: ReceiptDate || dayjs().format("YYYY-MM-DD"),
        companyID: CompanyID,
        isActive: true,
        isDeleted: false,
        userID: UserID,
        bankPaymentBy: UserName,
        bankPaymentType: "Expense Payment",
        id: expense.id || 0,
      };
    });
    // //////Console.log(FormData)
    const data = {
      PurchaseHead: PurchaseHead,
      PurchaseBody: PurchaseBody,
      ExpenseData: ExpenseData,
    };
    ////Console.log(data)

    try {
      const response = await axios.patch(
        `${Config.base_url}Purchase/EditPurchase`,
        data,
        {
          headers: {
            Authorization: `Bearer ${AccessKey}`,
          },
        }
      );
      ////Console.log(response)
      if (response.data.status_code === 1) {
        message.success(
          <>
            Bill Updated Successfully Against <br />
            Bill ID: <span style={{ color: "blue" }}>{response.data.bill}</span>
          </>
        );
        if (SaveAndPrint == true) {
          navigate(`/printBill/${response.data.bill}`);
        }
        setSaveAndPrint(false);
        //setProductList([]);
        setLoading(false);
        // navigate("/sales/sales-invoices");
        SupplierForm.resetFields();
        form.resetFields();
        ExpenseForm.resetFields();
      } else {
        message.error(response.data.status_message);
        setLoading(false);
      }
    } catch (error) {
      message.error("Network Error..");
      setLoading(false);
      //console.error(error);
    }
  };

  const fetchPurchase = async () => {
    setLoadingCustomerData(true);
    try {
      const data = {
        ID: params.id,
        CompanyID: CompanyID,
      };
      const response = await axios.post(
        `${Config.base_url}Purchase/GetPurchaseDataForEdit`,
        data,
        {
          headers: {
            Authorization: `Bearer ${AccessKey}`,
          },
        }
      );
      ////Console.log(response.data);
      if (response.data.status_code === 1) {
        // Set form values and date
        SupplierForm.setFieldsValue(response.data.purchaseHead);
        ExpenseForm.setFieldsValue({ users: response.data.expenseData });
        setReceiptDate(response.data.purchaseHead.date);
        if (CompanyID != response.data.purchaseHead.companyID) {
          navigate("/purchases/purchase-bills");
        }
        SupplierForm.setFieldsValue({
          balance: response.data.supplier.supplierOpeningBalance,
        });
        form.setFieldsValue({ users: response.data.listofPurchaseBody });
        setProductList(response.data.listofPurchaseBody); // Update the product list state
        setProduct(response.data.listofPurchaseBody);
        const quantity = response.data.listofPurchaseBody.map(
          (item) => parseFloat(item.quantity) || 0
        );
        const weight = response.data.listofPurchaseBody.map(
          (item) => parseFloat(item.weight) || 0
        );
        const length = response.data.listofPurchaseBody.map(
          (item) => parseFloat(item.length) || 0
        );
        const totalQuantity = quantity.reduce((sum, value) => sum + value, 0);
        const totalWeight = weight.reduce((sum, value) => sum + value, 0);
        const totalLength = length.reduce((sum, value) => sum + value, 0);
        setTotalQuantity(totalQuantity);
        setTotalWeight(totalWeight);
        setTotalLength(totalLength);
        setCreatedDate(response.data.purchaseHead.createdDate);
        setCreatedBy(response.data.user);
        setTermDays(response.data.purchaseHead.termDays);
        const productDate = SupplierForm.getFieldValue("date");
        const DueDate = SupplierForm.getFieldValue("dueDate");
        setOpenDate(productDate);
        setDueDate(DueDate);
        setSupplier(response.data.purchaseHead);
        //////Console.log(response.data.purchaseHead);
        setTotalAmount(response.data.purchaseHead.subTotal);
        debouncedHandleFormChange();
        setComplete(response.data.purchaseHead.inComplete);
      }
    } catch (error) {
      // ////console.error("Error fetching purchaseHead data:", error);
    } finally {
      setLoadingCustomerData(false); // Stop loading
    }
  };

  useEffect(() => {
    if (ListOfProducts.length > 0 && ProductList.length > 0) {
      ProductList.forEach((user, index) => {
        handleFetchProduct(user.product, index);
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
  }, []);

  const handleFetchProduct = (value, index) => {
    const selectedProduct = ListOfProducts.find((item) => item.id === value);
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
    }
  };

  useEffect(() => {
    document.title = "Edit Supplier Bill";
    fetchSupplier();
    fetchProducts();
    fetchPurchase();
    fetchExpense();
    fetchBankAccounts();
  }, []);

  const fetchProducts = async () => {
    setProductLoading(true);
    try {
      const response = await ProductDropdown();
      if (response != null) {
        setProductList(response || []);
        setListOfProducts(response || []);
      }
    } catch (error) {
      // //console.error(error);
    } finally {
      setProductLoading(false);
    }
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

  const fetchExpense = async () => {
    setAccountLoading(true);
    try {
      const response = await LevelWiseAccount2(3, "70");
      if (response != null) {
        setListOfAcconts(response);
      }
    } catch (error) {
      // ////console.error(error);
    } finally {
      setAccountLoading(false);
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
      // ////console.error(error);
    } finally {
      setLoadingBank(false);
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

  const SupplierDetail = () => {
    const supplier = ListOfRecords.map((record) => ({
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
        const newDueDate = dayjs().add(days, "day").format("YYYY-MM-DD");
        setDueDate(newDueDate);
        setTermDays(days);
      } else {
        setTermDays(0);
      }
    };

    const handleSupplierChange = async (value) => {
      // //////Console.log(value)
      const selectedSupplier = supplier.find(
        (supplier) => supplier.value === value
      );
      if (selectedSupplier) {
        setSupplierLoading(true);
        const response = ListOfRecords.find((s) => s.id == value);
        SupplierForm.setFieldsValue({
          address: response.billingAddress,
          creditLimit: response.creditLimit,
          balance: response.supplierOpeningBalance,
          SupplierAccountCode: response.accountNo,
          supplierName: response.businessName,
        });

        // Auto-fill ExpenseForm description with supplier name and date
        const currentDate = OpenDate || dayjs().format("YYYY-MM-DD");
        const expenseDescription = `${response.businessName} - ${dayjs(
          currentDate
        ).format("YYYY-MM-DD")}`;

        // Get current expense form fields
        const expenseFields = ExpenseForm.getFieldValue("users") || [{}];

        // Update all existing expense form rows with the new description
        const updatedExpenseFields = expenseFields.map((field) => ({
          ...field,
          detail: expenseDescription,
        }));

        // Set the updated fields back to the form
        ExpenseForm.setFieldsValue({
          users: updatedExpenseFields,
        });
        setSupplierLoading(false);
      } else {
        setSupplierLoading(false);
      }
    };

    const handleDateChange = (e, value) => {
      setOpenDate(value);
      setDueDate(value);
      setReceiptDate(value);
    };

    const handleDueDateChange = (e, value) => {
      setDueDate(value);
    };

    return (
      <>
        <Form
          layout="vertical"
          form={SupplierForm}
          onFinish={handleSubmit}
          disabled={readonly}
        >
          <Row gutter={[24, 0]}>
            <Col xs={24} md={8}>
              <Form.Item
                name="supplierName"
                label="Supplier"
                rules={[
                  {
                    required: true,
                    message: "Please select the supplier name.",
                  },
                ]}
              >
                <Select
                  style={{
                    width: "100%",
                  }}
                  placeholder="Select Supplier"
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
                  loading={SupplierLoading}
                  notFoundContent={
                    SupplierLoading ? <Spin size="small" /> : null
                  }
                  options={supplier}
                  onSelect={handleSupplierChange}
                />
              </Form.Item>
              <Form.Item name="address" label="Address">
                <Input />
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
                <Form.Item name="SupplierAccountCode" label="Term Days" hidden>
                  <Input />
                </Form.Item>
                <Col xs={24} md={12}>
                  <Form.Item name="termDays" label="Term Days">
                    <Input type="number" onChange={onTermDaysChange} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Due Date" required>
                    <DatePicker
                      defaultValue={dayjs(OpenDate).add(termDays, "days")}
                      style={{ width: "100%" }}
                      onChange={handleDueDateChange}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="billNumber" label="Bill No.">
                    <Input />
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
        ////////Console.log("Invalid quantity value");
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
        ////////Console.log("Rate unit is not Quantity");
      }
    };

    const handleWeightChange = (e, index) => {
      const weight = parseFloat(e.target.value);
      const fields = form.getFieldValue("users");
      const formInstance = fields[index];

      if (isNaN(weight) || weight <= 0) {
        ////////Console.log("Invalid weight value");
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
        ////////Console.log("Rate unit is not Weight");
      }
    };

    const handleLengthChange = (e, index) => {
      const length = parseFloat(e.target.value);
      const fields = form.getFieldValue("users");
      const formInstance = fields[index];

      if (isNaN(length) || length <= 0) {
        ////////Console.log("Invalid length value");
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
        ////////Console.log("Rate unit is not Length");
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
        ////console.error("Invalid product selection or quantity");
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

        SupplierForm.setFieldsValue({
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
          disabled={readonly}
          form={form}
          name="dynamic_form_nest_item"
          onFinish={handleSubmit}
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

  const ExpenseDetail = () => {
    const handleAmountChange = (e, index) => {
      const fields = ExpenseForm.getFieldValue("users");

      const formInstance = fields[index];
      const amount = parseFloat(e.target.value) || 0;
      const discountPercentage = parseFloat(formInstance.discPercentege) || 0;

      if (amount > 0) {
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
        ExpenseForm.setFieldsValue({
          users: fields,
        });
        debouncedHandleFormChange();
      } else {
        message.error("Please Enter Amount");
      }
    };

    const handleDiscountChange = (e, index) => {
      const fields = ExpenseForm.getFieldValue("users");

      const formInstance = fields[index];
      const amount = formInstance.amount;
      const discountPercentage = parseFloat(e.target.value) || 0;
      if (discountPercentage > 100) {
        message.error("Discount cannot more than 100.");
        return;
      }
      const gst = parseFloat(formInstance.saleTax) || 0;

      if (amount > 0) {
        const discountAmt = (discountPercentage * amount) / 100 || 0;
        const net = (amount - discountAmt + gst).toFixed(2);

        fields[index] = {
          ...fields[index],
          discount: discountAmt,
          net,
        };
        ExpenseForm.setFieldsValue({
          users: fields,
        });
        debouncedHandleFormChange();
      } else {
        ////console.error("Invalid product selection or quantity");
      }
    };

    const handleTaxRateChange = (e, index) => {
      const fields = ExpenseForm.getFieldValue("users");

      const formInstance = fields[index];
      const TaxRate = parseFloat(e.target.value);
      const amount = formInstance.amount || 0;
      const discountPercentage = parseFloat(formInstance.discPercentege) || 0;

      if (amount > 0) {
        const discountAmt = (discountPercentage * amount) / 100 || 0;
        const Tax = (TaxRate * amount) / 100 || 0;
        const net = (amount - discountAmt + Tax).toFixed(2);

        fields[index] = {
          ...fields[index],
          saleTax: Tax,
          net,
        };
        ExpenseForm.setFieldsValue({
          users: fields,
        });
        debouncedHandleFormChange();
      } else {
        ////console.error("Invalid product selection or quantity");
      }
    };

    const handleBankChange = (value, index) => {
      const bank = ListOfBank.find((b) => b.accountCode == value);

      if (bank) {
        const fields = ExpenseForm.getFieldValue("users");

        // Update the specific row's bank information
        fields[index] = {
          ...fields[index],
          bankName: bank.accountDescription,
          bankCode: bank.accountCode,
          bankID: bank.id,
        };

        ExpenseForm.setFieldsValue({
          users: fields,
        });
      }
    };

    const columns = (remove) => [
      {
        title: "Date",
        dataIndex: "date",
        key: "date",
        width: 150,
      },
      {
        title: "Expense",
        dataIndex: "nominalAccount",
        key: "nominalAccount",
        width: 200,
      },
      {
        title: "Description",
        dataIndex: "detail",
        key: "detail",
        width: 200,
      },
      { title: "Bank", dataIndex: "bank", key: "bank", width: 230 },
      { title: "Amount", dataIndex: "amount", key: "amount", width: 130 },
      {
        title: "Action",
        dataIndex: "action",
        key: "action",
        width: 110,
        render: (_, { key }) => (
          <ul className="inline-action">
            <li>
              <Link
                to={`#/`}
                onClick={() => {
                  handleDeleteExpenses(key);
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
        const fields = ExpenseForm.getFieldValue("users");
        const amounts = fields.map((item) => parseFloat(item.amount) || 0);
        const discount = fields.map((item) => parseFloat(item.discount) || 0);
        const tax = fields.map((item) => parseFloat(item.saleTax) || 0);
        const net = fields.map((item) => parseFloat(item.net) || 0);

        const totalAmount = amounts.reduce((sum, value) => sum + value, 0);
        const totalDiscount = discount.reduce((sum, value) => sum + value, 0);
        const totalSaleTax = tax.reduce((sum, value) => sum + value, 0);
        const total = net.reduce((sum, value) => sum + value, 0);

        setTotalDiscount(totalAmount);
        ExpenseForm.setFieldsValue({
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
          disabled={readonly}
          form={ExpenseForm}
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
                        <Form.Item name="date">
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
                      ),
                      nominalAccount: (
                        <Form.Item
                          {...restField}
                          name={[name, "nominalAccount"]}
                          fieldKey={[fieldKey, "nominalAccount"]}
                        >
                          <Select
                            variant="borderless"
                            placeholder="Expense"
                            showSearch
                            filterOption={(input, option) =>
                              option.value
                                .toLowerCase()
                                .includes(input.toLowerCase())
                            }
                            style={{ width: 180 }}
                            options={ListOfAccounts.map((item) => ({
                              label: `${item.accountDescription} (${item.accountCode})`,
                              value: `${item.accountDescription} (${item.accountCode})`,
                            }))}
                          ></Select>
                        </Form.Item>
                      ),
                      detail: (
                        <Form.Item
                          {...restField}
                          name={[name, "detail"]}
                          fieldKey={[fieldKey, "detail"]}
                        >
                          <Input
                            placeholder="Description"
                            variant="borderless"
                          />
                        </Form.Item>
                      ),
                      bank: (
                        <Form.Item
                          {...restField}
                          name={[name, "bank"]}
                          fieldKey={[fieldKey, "bank"]}
                        >
                          <Select
                            showSearch
                            filterOption={(input, option) =>
                              option.label
                                .toLowerCase()
                                .includes(input.toLowerCase())
                            }
                            placeholder="Bank"
                            variant="borderless"
                            loading={loadingBank}
                            onChange={(value) => handleBankChange(value, index)}
                            options={ListOfBank.map((option) => ({
                              label: `${option.accountDescription} (${option.accountCode})`,
                              value: option.accountCode,
                            }))}
                          />
                        </Form.Item>
                      ),
                      amount: (
                        <Form.Item
                          {...restField}
                          name={[name, "amount"]}
                          fieldKey={[fieldKey, "amount"]}
                          onChange={(e) => handleAmountChange(e, index)}
                        >
                          <Input placeholder="Amount" variant="borderless" />
                        </Form.Item>
                      ),
                      id: (
                        <Form.Item
                          {...restField}
                          name={[name, "id"]}
                          fieldKey={[fieldKey, "id"]}
                          hidden
                        >
                          <Input placeholder="Amount" variant="borderless" />
                        </Form.Item>
                      ),

                      action: (
                        <MinusCircleOutlined onClick={() => remove(name)} />
                      ),
                    })
                  )}
                  columns={columns(remove)}
                  scroll={{
                    x: "100%",
                  }}
                  pagination={false}
                  size="small"
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
    const subTotal = SupplierForm.getFieldValue("subTotal");
    const totalSaleTax = SupplierForm.getFieldValue("totalSaleTax");
    const totalDiscount = SupplierForm.getFieldValue("totalDiscount");

    const SubTotalAfterDiscount = (subTotal * discount) / 100 || 0;

    const netTotal = subTotal + totalSaleTax - totalDiscount - discount;

    SupplierForm.setFieldsValue({
      total: netTotal.toFixed(2),
    });
  };

  return (
    <>
      <AddSupplierModal
        show={open}
        handleOk={handleOk}
        handleCancel={handleCancel}
        loading={CustomerLoading}
        SupplierID={SupplierID}
      />
      <div id="sub-menu-wrap">
        <h5>Purchases</h5>
        <PurchaseMenu />
      </div>
      <div className="right-side-contents">
        <div className="page-content mb-5">
          <div className="page-header">
            <SubMenuToggle />
            <h3 className="page-title">
              <NavLink to="/purchases/purchase-bills">
                <ArrowLeftIcon />
              </NavLink>
              Edit Supplier Bill
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

          {!LoadingCustomerData ? (
            <>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Collapse
                  collapsible="header"
                  defaultActiveKey={["Supplier Details"]}
                  items={[
                    {
                      key: "Supplier Details",
                      label: "Supplier Details",
                      children: <SupplierDetail />,
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
                  disabled={readonly}
                  layout="vertical"
                  form={SupplierForm}
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
                <Collapse
                  collapsible="header"
                  defaultActiveKey={["Expense Details"]}
                  items={[
                    {
                      key: "Expense Details",
                      label: "Expense Details",
                      children: <ExpenseDetail />,
                    },
                  ]}
                />
              </Space>
              <Form
                form={SupplierForm}
                onFinish={handleSubmit}
                disabled={readonly}
              >
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
                  <Row gutter={[24, 0]}>
                    <Col md={12} sm={24}>
                      <Typography.Text>
                        <h5>
                          Created By : {createdBy} -{" "}
                          {moment(createdDate).format("DD/MM/YYYY, h:mm:ss a")}
                        </h5>
                      </Typography.Text>
                    </Col>
                    <Col md={12} sm={24}>
                      <div className="text-right">
                        <Button
                          type="primary"
                          htmlType="submit"
                          //style={{ marginLeft: 10 }}
                          loading={loading}
                        >
                          Edit and Save
                        </Button>
                        <Button
                          type="primary"
                          htmlType="submit"
                          style={{ marginLeft: 10 }}
                          onClick={() => setSaveAndPrint(true)}
                          loading={loading}
                        >
                          Edit and Print
                        </Button>
                      </div>
                    </Col>
                  </Row>
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

export default EditSupplierBill;
