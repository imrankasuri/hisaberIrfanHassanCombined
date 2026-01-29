import React, { useState, useRef, useEffect, useCallback } from "react";
import { debounce, throttle } from "lodash";
import {
  DeleteOutlined,
  DownOutlined,
  MinusCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { PlusCircleIcon } from "@heroicons/react/24/solid";
import LevelWiseAccount2 from "../../Shared/LevelWiseAccount2";
import BankModeDropdown from "../../Shared/BankModeDropdown";
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
import AddSupplierModal from "../../Common/AddSupplierModal";
import SuppliersDropdown from "../../Shared/SuppliersDropdown";
import PurchaseMenu from "../PurchaseMenu";

const { Option } = Select;

const AddSupplierReceipt = () => {
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
  const [loadingMode, setLoadingMode] = useState(false);
  const [loadingBank, setLoadingBank] = useState(false);
  const [Complete, setComplete] = useState(false);

  const [SupplierForm] = Form.useForm();
  const [formMain] = Form.useForm();
  const [OpenDate, setOpenDate] = useState(null);
  const [SupplierID, setSupplierID] = useState("");
  const [open, setOpen] = useState(false);

  const [ListOfRecords, setListOfRecords] = useState([]);
  const [ListOfProducts, setListOfProducts] = useState([]);
  const [ListOfBank, setListOfBank] = useState([]);
  const [BankMode, setBankMode] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedSupplier, setSelectedSupplier] = useState({});
  const [overallDiscount, setOverallDiscount] = useState(0);
  const [selectedBank, setSelectedBank] = useState("501081001");

  const [form] = Form.useForm();

  const handleSubmit = async (FormData) => {
    setLoading(true);
    const fields = form.getFieldValue("users");

    const PaymentHead = {
      ...FormData,
      date: OpenDate || dayjs().format("YYYY-MM-DD"),
      purchaseType: "Receipt",
      purchaseBy: UserName,
      extra2: "",
      companyID: CompanyID,
      isActive: true,
      isDeleted: false,
      inComplete: Complete,
      whtRate: FormData.whtRate || 0,
      userID: UserID,
      bankCode: selectedBank,
    };
    let PaymentBody = [];
    if (fields != undefined && fields.length > 0) {
      PaymentBody = fields.map((item) => ({
        ...item,
        purchaseType: "Receipt",
        billNo: item.billNumber || "",
        purchaseBy: UserName,
        companyID: CompanyID,
        isActive: true,
        isDeleted: false,
        amount: item.total || 0,
        openBalance: item.balance || 0,
        total: item.net || 0,
        inComplete: Complete,
        userID: UserID,
        inComplete: Complete,
      }));
    }

    const data = {
      PaymentHead: PaymentHead,
      PaymentBody: PaymentBody,
    };

    // //Console.log(data)
    try {
      const response = await axios.post(
        Config.base_url + `Purchase/AddPayment`,
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
            Payment Added Successfully Against <br />
            Voucher No:{" "}
            <span style={{ color: "blue" }}>{response.data.voucher}</span>
          </>
        );
        //setProductList([]);
        setLoading(false);
        // navigate("/sales/sales-receipts");
        SupplierForm.resetFields();
        Productform.resetFields();
        form.resetFields();
      } else {
        setLoading(false);
        message.error(response.data.status_message);
      }
    } catch (error) {
      message.error("Network Error..");
      setLoading(false);
    }
  };

  // Helper function to reset forms
  const resetForms = () => {
    //setProductList([]);
    SupplierForm.resetFields();
    Productform.resetFields();
    form.resetFields();
    setLoading(false);
  };

  useEffect(() => {
    document.title = "Add Credit Note Payment";
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

  const handleSupplierChange = async (value) => {
    SupplierForm.resetFields();

    const supplier = ListOfRecords.find((record) => record.id === value);
    setSelectedSupplier(supplier);
    ////Console.log(supplier);
    if (supplier) {
      SupplierForm.setFieldsValue({
        mailingAddress: supplier.billingAddress,
        supplierAccountCode: supplier.accountCode,
        supplierOpeningBalance: supplier.supplierOpeningBalance,
        supplierName: supplier.businessName,
      });
    }
    setDataLoading(true);

    const apiUrl = `${Config.base_url}PurchaseHead/GetByBalance/${CompanyID}?supplierCode=${supplier.accountCode}&purchaseType=Credit`;

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
      ////Console.log(response.data)
      if (response.data.status_code === 1) {
        form.setFieldsValue({ users: response.data.listofPurchases });
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

  const handleAmountChange = (e) => {
    const fields = form.getFieldValue("users"); // Get the fields
    const amount = parseFloat(e.target.value) || 0;

    if (fields === undefined || fields.length === 0) {
      // If no fields are defined, set the amount to unAllocatedBalance
      SupplierForm.setFieldsValue({
        unAllocatedBalance: amount,
        total: amount,
      });
    } else {
      // Reset unAllocatedBalance initially to 0
      SupplierForm.setFieldsValue({
        unAllocatedBalance: 0,
      });

      let remainingAmount = amount;

      // Iterate over the fields to set amounts based on conditions
      for (let i = 0; i < fields.length; i++) {
        const openingBalance = parseInt(fields[i].balance) || 0;
        let payment = parseInt(fields[i].payment) || 0;

        if (remainingAmount > openingBalance) {
          // If remainingAmount exceeds the opening balance, allocate full amount to this field
          payment = openingBalance;
          remainingAmount -= openingBalance;
        } else {
          // If remainingAmount is within the opening balance, allocate the remaining amount to this field
          payment = remainingAmount;
          remainingAmount = 0; // No remaining amount after allocation
        }

        const formInstance = fields[i];
        const discount = parseFloat(formInstance.discount) || 0;
        const whtRate = parseFloat(formInstance.wht) || 0;
        const net = whtRate + payment + discount;

        if (net > openingBalance) {
          SupplierForm.setFieldsValue({
            unAllocatedBalance: net - openingBalance,
          });

          fields[i] = {
            ...fields[i],
            payment: payment.toFixed(2),
            net: openingBalance.toFixed(2),
          };
        } else {
          // Update the field with the calculated values
          fields[i] = {
            ...fields[i],
            payment: payment.toFixed(2),
            net: net.toFixed(2),
          };
        }
      }

      // If there is any remaining amount after processing all fields, set it to unAllocatedBalance
      if (remainingAmount > 0) {
        SupplierForm.setFieldsValue({
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
        const payment = parseInt(fields[i].payment) || 0;
        if (remainingWHT > 100) {
          message.error("WHT cannot more than 100.");
          return;
        } else {
          const wht = (openingBalance * remainingWHT) / 100 || 0;
          const formInstance = fields[i];
          const discount = parseFloat(formInstance.discount) || 0;
          const net = wht + payment - discount;
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
      const payment = fields.map((item) => parseFloat(item.payment) || 0);
      const net = fields.map((item) => parseFloat(item.net) || 0);
      const wht = fields.map((item) => parseFloat(item.wht) || 0);
      const amount = parseFloat(SupplierForm.getFieldValue("amount")) || 0;

      const totalAmount = balance.reduce((sum, value) => sum + value, 0);
      const totalDiscount = discount.reduce((sum, value) => sum + value, 0);
      const totalPayment = payment.reduce((sum, value) => sum + value, 0);
      const total = net.reduce((sum, value) => sum + value, 0);
      const totalWHT = wht.reduce((sum, value) => sum + value, 0);

      SupplierForm.setFieldsValue({
        totalOpenBalance: totalAmount.toFixed(2),
        totalDiscount: totalDiscount.toFixed(2),
        totalWHT: totalWHT.toFixed(2),
        totalPayment: totalPayment.toFixed(2),
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
    const payment = (totalOpenBalance - discount).toFixed(2);
    const net = whtRate + totalOpenBalance;

    fields[index] = {
      ...fields[index],
      payment: payment,
      discount: discount,
      net: net.toFixed(2),
    };

    form.setFieldsValue({
      users: fields,
    });

    // Debounced form change handler
    debouncedHandleFormChange();
  };

  const handlepaymentChange = (e, index) => {
    const fields = form.getFieldValue("users");

    const formInstance = fields[index];
    const payment = parseFloat(e.target.value) || 0;
    const totalOpenBalance = parseFloat(formInstance.balance) || 0;
    if (payment > totalOpenBalance) {
      message.error("Payment must be less or equal to Open Balance.");
      fields[index] = {
        ...fields[index],
        payment: 0.0,
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
      const net = whtRate + payment - discount;
      fields[index] = {
        ...fields[index],
        net: payment.toFixed(2),
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
      const payment = parseFloat(formInstance.payment) || 0;
      const discount = parseFloat(formInstance.discount) || 0;
      const net = whtRate + payment - discount;
      if (WHT > 0) {
        fields[index] = {
          ...fields[index],
          wht: whtRate.toFixed(2),
          net: net.toFixed(2),
        };
        form.setFieldsValue({
          users: fields,
        });
        debouncedHandleFormChange();
      } else {
        console.error("Invalid product selection or quantity");
      }
    }
  };

  const handleOverAllDiscountChange = (e) => {
    const discount = e.target.value;
    const subTotal = SupplierForm.getFieldValue("totalReceipt");
    const totalSaleTax = SupplierForm.getFieldValue("totalWHT");
    const totalDiscount = SupplierForm.getFieldValue("totalDiscount");
    const amount = SupplierForm.getFieldValue("amount");

    const subTotalNum = parseFloat(subTotal) || 0;
    const discountNum = parseFloat(discount);
    const amt = parseFloat(amount);

    const netTotal = subTotalNum + discountNum;
    const newTotal = discountNum + amt;

    if (subTotalNum == 0) {
      SupplierForm.setFieldsValue({
        total: newTotal.toFixed(2),
      });
    } else {
      SupplierForm.setFieldsValue({
        total: netTotal.toFixed(2),
      });
    }
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      width: 210,
    },
    {
      title: "Bill ID",
      dataIndex: "billID",
      key: "billID",
      width: 100,
    },
    {
      title: "Bill No.",
      dataIndex: "billNumber",
      key: "billNumber",
      width: 100,
    },
    { title: "Due Date", dataIndex: "dueDate", key: "dueDate", width: 210 },
    { title: "Original Amount", dataIndex: "total", key: "total", width: 200 },
    { title: "Open Balance", dataIndex: "balance", key: "balance", width: 200 },
    { title: "WHT Rate", dataIndex: "whtRate", key: "whtRate", width: 200 },
    { title: "WHT", dataIndex: "wht", key: "wht", width: 200 },
    { title: "Discount", dataIndex: "discount", key: "discount", width: 150 },
    { title: "Payment", dataIndex: "payment", key: "payment", width: 150 },
    { title: "Total", dataIndex: "net", key: "net", width: 200 },
  ];

  const debouncedHandleFormChange = useCallback(
    debounce(() => {
      const fields = form.getFieldValue("users");
      const balance = fields.map((item) => parseFloat(item.balance) || 0);
      const discount = fields.map((item) => parseFloat(item.discount) || 0);
      const payment = fields.map((item) => parseFloat(item.payment) || 0);
      const net = fields.map((item) => parseFloat(item.net) || 0);
      const wht = fields.map((item) => parseFloat(item.wht) || 0);

      const totalAmount = balance.reduce((sum, value) => sum + value, 0);
      const totalDiscount = discount.reduce((sum, value) => sum + value, 0);
      const totalPayment = payment.reduce((sum, value) => sum + value, 0);
      const total = net.reduce((sum, value) => sum + value, 0);
      const totalWHT = wht.reduce((sum, value) => sum + value, 0);

      SupplierForm.setFieldsValue({
        totalOpenBalance: totalAmount.toFixed(2),
        totalDiscount: totalDiscount.toFixed(2),
        totalWHT: totalWHT.toFixed(2),
        totalPayment: totalPayment.toFixed(2),
        total: total.toFixed(2),
        amount: totalPayment.toFixed(2),
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
        <h5>Supplier Receipt</h5>
        {/* <PurchaseMenu /> */}
      </div>
      <div className="right-side-contents">
        <div className="page-content mb-5">
          <div className="page-header">
            <SubMenuToggle />
            <h3 className="page-title">
              <NavLink to="/purchases/purchase-payments">
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
                      options={supplierOptions}
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
                        name="supplierOpeningBalance"
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
                        billID: (
                          <Form.Item
                            {...restField}
                            name={[name, "billID"]}
                            fieldKey={[fieldKey, "billID"]}
                          >
                            <Input
                              onFocus={(e) => e.target.select()}
                              variant="borderless"
                              readOnly
                            />
                          </Form.Item>
                        ),
                        billNumber: (
                          <Form.Item
                            {...restField}
                            name={[name, "billNumber"]}
                            fieldKey={[fieldKey, "billNumber"]}
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
                        payment: (
                          <Form.Item
                            {...restField}
                            name={[name, "payment"]}
                            fieldKey={[fieldKey, "payment"]}
                            onChange={(e) => handlepaymentChange(e, index)}
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
                    <Form.Item name="totalPayment" label="Total Payment">
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
            form={SupplierForm}
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

export default AddSupplierReceipt;
