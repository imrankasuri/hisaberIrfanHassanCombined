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
import AddCustomerModal from "../../Common/AddCustomerModal";
import SalesMenu from "./../SalesMenu";
import LevelWiseAccount2 from "../../Shared/LevelWiseAccount2";
import BankModeDropdown from "../../Shared/BankModeDropdown";
import CustomerDropdown from "../../Shared/CustomerDropdown";

const { Option } = Select;

const AddSalesPayment = () => {
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
  const [CustomerID, setCustomerID] = useState("");
  const [DataLoading, setDataLoading] = useState(false);
  const [loadingMode, setloadingMode] = useState(false);
  const [loadingBank, setLoadingBank] = useState(false);
  const [Complete, setComplete] = useState(false);
  const [overallDiscount, setOverallDiscount] = useState(0);
  const [open, setOpen] = useState(false);

  const [CustomerForm] = Form.useForm();
  const [formMain] = Form.useForm();
  const [OpenDate, setOpenDate] = useState(null);

  const [ListOfRecords, setListOfRecords] = useState([]);
  const [ListOfProducts, setListOfProducts] = useState([]);
  const [ListOfBank, setListOfBank] = useState([]);
  const [BankMode, setBankMode] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState({});
  const [selectedBank, setSelectedBank] = useState("501081001");

  const [form] = Form.useForm();

  const handleSubmit = async (FormData) => {
    setLoading(true);
    const fields = form.getFieldValue("users");

    const ReceiptHead = {
      ...FormData,
      date: OpenDate || dayjs().format("YYYY-MM-DD"),
      receiptType: "Payment",
      receiptBy: UserName,
      extra2: "",
      companyID: CompanyID,
      isActive: true,
      isDeleted: false,
      customerAccountCode: FormData.customerAccountCode || "",
      mailingAddress: FormData.mailingAddress || "",
      inComplete: Complete,
      userID: UserID,
      bankCode: selectedBank,
    };

    let ReceiptBody = [];
    if (fields != undefined && fields.length > 0) {
      ReceiptBody = fields.map((item) => ({
        ...item,
        receiptType: "Receipt",
        receiptBy: UserName,
        companyID: CompanyID,
        isActive: true,
        isDeleted: false,
        invoiceNo: item.invoiceNo,
        amount: item.total,
        openBalance: item.balance,
        total: item.net,
        userID: UserID,
        inComplete: Complete,
      }));
    }

    const data = {
      ReceiptHead: ReceiptHead,
      ReceiptBody: ReceiptBody,
    };

    ////Console.log(data)
    try {
      const response = await axios.post(
        Config.base_url + `Sales/AddReceipt`,
        data,
        {
          headers: {
            Authorization: `Bearer ${AccessKey}`,
          },
        }
      );
      ////Console.log(response.data)
      if (response.data.status_code === 1) {
        message.success(
          <>
            Receipt Added Successfully Against <br />
            Voucher No:{" "}
            <span style={{ color: "blue" }}>{response.data.voucher}</span>
          </>
        );
        //setProductList([]);
        setLoading(false);
        // navigate("/sales/sales-receipts");
        CustomerForm.resetFields();
        Productform.resetFields();
        form.resetFields();
      }
    } catch (error) {
      message.error("Network Error..");
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Add Credit Note Payment";
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
    try {
      const response = await CustomerDropdown();

      if (response) {
        setListOfRecords(response || []);
        setCustomerLoading(false);
      } else {
        setCustomerLoading(false);
        setListOfRecords([]);
      }
    } catch (error) {
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
    CustomerForm.resetFields();

    const customer = ListOfRecords.find((record) => record.id === value);
    setSelectedCustomer(customer);
    if (customer) {
      CustomerForm.setFieldsValue({
        mailingAddress: customer.billingAddress,
        customerAccountCode: customer.accountCode,
        customerOpeningBalance: customer.customerOpeningBalance,
        customerName: customer.businessName,
      });
    }
    setDataLoading(true);

    const data = {
      CompanyID: CompanyID,
      AccountCode: customer.accountCode,
      Type: "Credit",
      PageSize: 100000000,
      PageNo: 1,
      ExcludeZero: true,
    };
    const api_config = {
      method: "post",
      url: `${Config.base_url}Sales/GetSales`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AccessKey}`,
      },
      data: data,
    };

    try {
      const response = await axios(api_config);
      ////Console.log(response.data)
      if (response.data.status_code === 1) {
        form.setFieldsValue({ users: response.data.listOfSales });
        setDataLoading(false);
      } else {
        setDataLoading(false);
        form.resetFields();
      }
    } catch (error) {
      setDataLoading(false);
      form.resetFields();
    }
  };

  const handleDateChange = (e, value) => {
    setOpenDate(value);
  };

  const handleAmountChange = (e) => {
    const fields = form.getFieldValue("users"); // Get the fields
    const amount = parseFloat(e.target.value) || 0;

    if (fields === undefined || fields.length === 0) {
      // If no fields are defined, set the amount to unAllocatedBalance
      CustomerForm.setFieldsValue({
        unAllocatedBalance: amount,
        total: amount,
      });
    } else {
      // Reset unAllocatedBalance initially to 0
      CustomerForm.setFieldsValue({
        unAllocatedBalance: 0,
      });

      let remainingAmount = amount;

      // Iterate over the fields to set amounts based on conditions
      for (let i = 0; i < fields.length; i++) {
        const openingBalance = parseInt(fields[i].balance) || 0;
        let receipt = parseInt(fields[i].receipt) || 0;

        if (remainingAmount > openingBalance) {
          // If remainingAmount exceeds the opening balance, allocate full amount to this field
          receipt = openingBalance;
          remainingAmount -= openingBalance;
        } else {
          // If remainingAmount is within the opening balance, allocate the remaining amount to this field
          receipt = remainingAmount;
          remainingAmount = 0; // No remaining amount after allocation
        }

        const formInstance = fields[i];
        const discount = parseFloat(formInstance.discount) || 0;
        const whtRate = parseFloat(formInstance.wht) || 0;
        const net = whtRate + receipt + discount;

        if (net > openingBalance) {
          CustomerForm.setFieldsValue({
            unAllocatedBalance: net - openingBalance,
          });

          fields[i] = {
            ...fields[i],
            receipt: receipt.toFixed(2),
            net: openingBalance.toFixed(2),
          };
        } else {
          // Update the field with the calculated values
          fields[i] = {
            ...fields[i],
            receipt: receipt.toFixed(2),
            net: net.toFixed(2),
          };
        }
      }

      // If there is any remaining amount after processing all fields, set it to unAllocatedBalance
      if (remainingAmount > 0) {
        CustomerForm.setFieldsValue({
          unAllocatedBalance: remainingAmount,
        });
      }

      // Set the updated fields back to the form
      form.setFieldsValue({
        users: fields,
      });

      debouncedHandleAmountChange();
    }
  };

  const handleWHTRateChange = (e) => {
    const fields = form.getFieldValue("users"); // Get the fields
    const whtRate = parseFloat(e.target.value) || 0;

    if (fields === undefined) {
      // If no fields are defined, set the amount to unAllocatedBalance
      return;
    } else {
      let remainingWHT = whtRate;
      ////Console.log(remainingWHT);
      // Iterate over the fields to set amounts based on conditions
      for (let i = 0; i < fields.length; i++) {
        const openingBalance = parseInt(fields[i].balance) || 0;
        const receipt = parseInt(fields[i].receipt) || 0;
        if (remainingWHT > 100) {
          message.error("WHT cannot more than 100.");
          return;
        } else {
          const wht = (openingBalance * remainingWHT) / 100 || 0;
          const formInstance = fields[i];
          const discount = parseFloat(formInstance.discount) || 0;
          const net = wht + receipt - discount;
          // Update the field with the calculated values
          fields[i] = {
            ...fields[i],
            whtRate: whtRate,
            wht: wht,
            net: net.toFixed(2),
          };
        }
      }

      // Set the updated fields back to the form
      form.setFieldsValue({
        users: fields,
      });
      debouncedHandleAmountChange();
    }
  };

  const debouncedHandleAmountChange = useCallback(
    debounce(() => {
      const fields = form.getFieldValue("users");
      const balance = fields.map((item) => parseFloat(item.balance) || 0);
      const discount = fields.map((item) => parseFloat(item.discount) || 0);
      const receipt = fields.map((item) => parseFloat(item.receipt) || 0);
      const net = fields.map((item) => parseFloat(item.net) || 0);
      const wht = fields.map((item) => parseFloat(item.wht) || 0);
      const amount = parseFloat(CustomerForm.getFieldValue("amount")) || 0;

      const totalAmount = balance.reduce((sum, value) => sum + value, 0);
      const totalDiscount = discount.reduce((sum, value) => sum + value, 0);
      const totalReceipt = receipt.reduce((sum, value) => sum + value, 0);
      const total = net.reduce((sum, value) => sum + value, 0);
      const totalWHT = wht.reduce((sum, value) => sum + value, 0);

      CustomerForm.setFieldsValue({
        totalOpenBalance: totalAmount.toFixed(2),
        totalDiscount: totalDiscount.toFixed(2),
        totalWHT: totalWHT.toFixed(2),
        totalReceipt: totalReceipt.toFixed(2),
        total: amount.toFixed(2),
      });
    }, 1000),
    []
  );

  const handleDiscountChange = (e, index) => {
    const fields = form.getFieldValue("users");

    const formInstance = fields[index];
    const discount = parseFloat(e.target.value) || 0;
    const totalOpenBalance = parseFloat(formInstance.balance) || 0;

    if (discount > totalOpenBalance) {
      message.error("Discount cannot be more than Open Balance.");
      fields[index] = {
        ...fields[index],
        discount: 0.0,
      };
      form.setFieldsValue({
        users: fields,
      });
      return;
    }

    const originalAmount = parseFloat(formInstance.total) || 0;

    const whtRate = parseFloat(formInstance.wht) || 0;
    const receipt = (totalOpenBalance - discount).toFixed(2);
    const net = whtRate + totalOpenBalance;

    fields[index] = {
      ...fields[index],
      receipt: receipt,
      discount: discount,
      net: net.toFixed(2),
    };

    form.setFieldsValue({
      users: fields,
    });

    // Debounced form change handler
    debouncedHandleFormChange();
  };

  const handleReceiptChange = (e, index) => {
    const fields = form.getFieldValue("users");

    const formInstance = fields[index];
    const receipt = parseFloat(e.target.value) || 0;
    const totalOpenBalance = parseFloat(formInstance.balance) || 0;
    if (receipt > totalOpenBalance) {
      message.error("Receipt must be less or equal to Open Balance.");
      fields[index] = {
        ...fields[index],
        receipt: 0.0,
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
      const net = whtRate + receipt - discount;

      fields[index] = {
        ...fields[index],
        discount: discount,
        net: receipt.toFixed(2),
      };
      form.setFieldsValue({
        users: fields,
      });
      debouncedHandleFormChange();
    }
  };

  const handleWHTChange = (e, index) => {
    const fields = form.getFieldValue("users");

    const formInstance = fields[index];
    const WHT = parseFloat(e.target.value) || 0;
    if (WHT > 100) {
      message.error("WHT cannot more than 100.");
      fields[index] = {
        ...fields[index],
        WHT: 0.0,
      };
      form.setFieldsValue({
        users: fields,
      });
      return;
    } else {
      const totalOpenBalance = parseFloat(formInstance.balance) || 0;
      const whtRate = (totalOpenBalance * WHT) / 100 || 0;
      ////Console.log(whtRate);
      const receipt = parseFloat(formInstance.receipt) || 0;
      const discount = parseFloat(formInstance.discount) || 0;
      const net = whtRate + receipt - discount;

      fields[index] = {
        ...fields[index],
        wht: whtRate.toFixed(2),
        net: net.toFixed(2),
      };
      form.setFieldsValue({
        users: fields,
      });
      debouncedHandleFormChange();
    }
  };

  const handleOverAllDiscountChange = (e) => {
    const discount = e.target.value;
    const subTotal = CustomerForm.getFieldValue("totalReceipt");
    const totalSaleTax = CustomerForm.getFieldValue("totalWHT");
    const totalDiscount = CustomerForm.getFieldValue("totalDiscount");
    const amount = CustomerForm.getFieldValue("amount");

    const subTotalNum = parseFloat(subTotal) || 0;
    const discountNum = parseFloat(discount);
    const amt = parseFloat(amount);

    const netTotal = subTotalNum + discountNum;
    const newTotal = discountNum + amt;

    if (subTotalNum == 0) {
      CustomerForm.setFieldsValue({
        total: newTotal.toFixed(2),
      });
    } else {
      CustomerForm.setFieldsValue({
        total: netTotal.toFixed(2),
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

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      width: 230,
    },
    {
      title: "Doc No.",
      dataIndex: "docNo",
      key: "docNo",
      width: 100,
    },
    { title: "Inv. No.", dataIndex: "invoiceNo", key: "invoiceNo", width: 100 },
    { title: "Due Date", dataIndex: "dueDate", key: "dueDate", width: 230 },
    { title: "Original Amount", dataIndex: "total", key: "total", width: 200 },
    { title: "Open Balance", dataIndex: "balance", key: "balance", width: 200 },
    { title: "WHT Rate", dataIndex: "whtRate", key: "whtRate", width: 200 },
    { title: "WHT", dataIndex: "wht", key: "wht", width: 200 },
    { title: "Discount", dataIndex: "discount", key: "discount", width: 150 },
    { title: "Receipt", dataIndex: "receipt", key: "receipt", width: 150 },
    { title: "Total", dataIndex: "net", key: "net", width: 200 },
  ];

  const debouncedHandleFormChange = useCallback(
    debounce(() => {
      const fields = form.getFieldValue("users");
      const balance = fields.map((item) => parseFloat(item.balance) || 0);
      const discount = fields.map((item) => parseFloat(item.discount) || 0);
      const receipt = fields.map((item) => parseFloat(item.receipt) || 0);
      const net = fields.map((item) => parseFloat(item.net) || 0);
      const wht = fields.map((item) => parseFloat(item.wht) || 0);

      const totalAmount = balance.reduce((sum, value) => sum + value, 0);
      const totalDiscount = discount.reduce((sum, value) => sum + value, 0);
      const totalReceipt = receipt.reduce((sum, value) => sum + value, 0);
      const total = net.reduce((sum, value) => sum + value, 0);
      const totalWHT = wht.reduce((sum, value) => sum + value, 0);

      CustomerForm.setFieldsValue({
        totalOpenBalance: totalAmount.toFixed(2),
        totalDiscount: totalDiscount.toFixed(2),
        totalWHT: totalWHT.toFixed(2),
        totalReceipt: totalReceipt.toFixed(2),
        total: total.toFixed(2),
        amount: totalReceipt.toFixed(2),
        unAllocatedBalance: 0,
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

  const handleBankChange = (value) => {
    const bank = ListOfBank.find((b) => b.accountCode == value);
    // //Console.log(bank)
    if (bank) {
      CustomerForm.setFieldsValue({
        bank: bank.accountDescription,
      });
    }
    setSelectedBank(value);
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
        <h5>Sales Payment</h5>
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
              Add Credit Note Payment
            </h3>
          </div>

          {initialLoading ? (
            <>
              <Skeleton active paragraph={{ rows: 4 }} />
              <Skeleton active paragraph={{ rows: 4 }} />
            </>
          ) : (
            <Form layout="vertical" form={CustomerForm} onFinish={handleSubmit}>
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
                        option.label.toLowerCase().includes(input.toLowerCase())
                      }
                      notFoundContent={
                        CustomerLoading ? <Spin size="small" /> : null
                      }
                      options={customerOptions}
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
                    initialValue="501081001"
                  >
                    <Select
                      showSearch
                      filterOption={(input, option) =>
                        option.label.toLowerCase().includes(input.toLowerCase())
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
                  <Form.Item name="mailingAddress" label="Mailing Address">
                    <Input onFocus={(e) => e.target.select()} disabled />
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
                    <Col xs={24} md={24}>
                      <Form.Item
                        name="amount"
                        label="Amount"
                        onChange={(e) => handleAmountChange(e)}
                      >
                        <Input
                          onFocus={(e) => e.target.select()}
                          placeholder="0.00"
                        />
                      </Form.Item>
                    </Col>
                    {/* <Col xs={24} md={12}>
                              <Form.Item
                                name="customerBaseOpeningBalance"
                                label="WHT Rate"
                                onChange={(e) => handleWHTRateChange(e)}
                              >
                                <Input onFocus={(e) => e.target.select()} readOnly placeholder="0.00" />
                              </Form.Item>
                            </Col> */}
                    <Col xs={24} md={24}>
                      <Form.Item
                        name="unAllocatedBalance"
                        label="Unallocated Balance"
                      >
                        <Input
                          onFocus={(e) => e.target.select()}
                          placeholder="0.00"
                          readOnly
                          disabled
                        />
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
                    <Col xs={24} md={24}>
                      <Form.Item
                        name="customerOpeningBalance"
                        label="Current Balance"
                      >
                        <Input
                          onFocus={(e) => e.target.select()}
                          readOnly
                          placeholder="0.00"
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
                        docNo: (
                          <Form.Item
                            {...restField}
                            name={[name, "docNo"]}
                            fieldKey={[fieldKey, "docNo"]}
                          >
                            <Input
                              onFocus={(e) => e.target.select()}
                              variant="borderless"
                              readOnly
                            />
                          </Form.Item>
                        ),
                        invoiceNo: (
                          <Form.Item
                            {...restField}
                            name={[name, "invoiceNo"]}
                            fieldKey={[fieldKey, "invoiceNo"]}
                          >
                            <Input
                              onFocus={(e) => e.target.select()}
                              readOnly
                              variant="borderless"
                            />
                          </Form.Item>
                        ),
                        id: (
                          <Form.Item
                            {...restField}
                            name={[name, "id"]}
                            fieldKey={[fieldKey, "id"]}
                          >
                            <Input
                              onFocus={(e) => e.target.select()}
                              readOnly
                              variant="borderless"
                              hidden
                            />
                          </Form.Item>
                        ),
                        dueDate: (
                          <Form.Item
                            {...restField}
                            name={[name, "dueDate"]}
                            fieldKey={[fieldKey, "dueDate"]}
                          >
                            <Input
                              onFocus={(e) => e.target.select()}
                              variant="borderless"
                              readOnly
                            />
                          </Form.Item>
                        ),
                        total: (
                          <Form.Item
                            {...restField}
                            name={[name, "total"]}
                            fieldKey={[fieldKey, "total"]}
                          >
                            <Input
                              onFocus={(e) => e.target.select()}
                              variant="borderless"
                              readOnly
                            />
                          </Form.Item>
                        ),
                        balance: (
                          <Form.Item
                            {...restField}
                            name={[name, "balance"]}
                            fieldKey={[fieldKey, "balance"]}
                          >
                            <Input
                              onFocus={(e) => e.target.select()}
                              readOnly
                              variant="borderless"
                            />
                          </Form.Item>
                        ),
                        whtRate: (
                          <Form.Item
                            {...restField}
                            name={[name, "whtRate"]}
                            fieldKey={[fieldKey, "whtRate"]}
                            onChange={(e) => handleWHTChange(e, index)}
                          >
                            <Input
                              onFocus={(e) => e.target.select()}
                              variant="borderless"
                            />
                          </Form.Item>
                        ),
                        wht: (
                          <Form.Item
                            {...restField}
                            name={[name, "wht"]}
                            fieldKey={[fieldKey, "wht"]}
                          >
                            <Input
                              readOnly
                              variant="borderless"
                              placeholder="0.00"
                            />
                          </Form.Item>
                        ),
                        discount: (
                          <Form.Item
                            {...restField}
                            name={[name, "discount"]}
                            fieldKey={[fieldKey, "discount"]}
                            onChange={(e) => handleDiscountChange(e, index)}
                          >
                            <Input
                              onFocus={(e) => e.target.select()}
                              placeholder="0.00"
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
                        net: (
                          <Form.Item
                            {...restField}
                            name={[name, "net"]}
                            fieldKey={[fieldKey, "net"]}
                          >
                            <Input
                              placeholder="0.00"
                              readOnly
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
                    <Form.Item name="totalWHT" label="Total WHT">
                      <Input onFocus={(e) => e.target.select()} readOnly />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="totalDiscount" label="Total Discount">
                      <Input onFocus={(e) => e.target.select()} readOnly />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="totalReceipt" label="Total Receipt">
                      <Input onFocus={(e) => e.target.select()} readOnly />
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
                        <Input onFocus={(e) => e.target.select()} readOnly />
                      </Form.Item>
                    </h4>
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
              <Col xs={24} md={4}>
                <Form.Item name="inComplete">
                  <Checkbox
                    checked={Complete}
                    onChange={(e) => setComplete(!Complete)}
                  >
                    InComplete
                  </Checkbox>
                </Form.Item>
              </Col>

              <Col xs={24} md={{ span: 4, offset: 20 }}>
                <Dropdown.Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<DownOutlined />}
                  menu={{ items }}
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

export default AddSalesPayment;
