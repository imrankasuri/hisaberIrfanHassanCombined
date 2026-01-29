import {
  Form,
  Input,
  DatePicker,
  Button,
  Row,
  Col,
  message,
  Select,
  Divider,
  Table,
  Spin,
  Skeleton,
} from "antd";
import React, { useEffect, useState, useCallback } from "react";
import { debounce, throttle, values } from "lodash";

import { Link, NavLink, useNavigate } from "react-router-dom";
import SalesMenu from "./../SalesMenu";
import Config from "../../../Config";
import SubMenuToggle from "../../Common/SubMenuToggle";
import axios from "axios";
import CustomerDropdown from "../../Shared/CustomerDropdown";
import ProductDropdown from "../../Shared/ProductDropdown";
import dayjs from "dayjs";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import {
  DeleteOutlined,
  PlusCircleOutlined,
  PlusOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";

const { Option } = Select;
function BatchInvoice() {
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
  const [Address, setAddress] = useState("");
  const [Code, setCode] = useState("");
  const [CustomerLoading, setCustomerLoading] = useState(false);
  const [ProductLoading, setProductLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [ListOfProducts, setListOfProducts] = useState([]);
  const [Productform] = Form.useForm();
  const [form] = Form.useForm();
  useEffect(() => {
    document.title = "Batch Invoice";
    const fetchInitialData = async () => {
      setInitialLoading(true);
      try {
        await Promise.all([fetchCustomers(), fetchProducts()]);
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
      // console.error(error);
    } finally {
      setCustomerLoading(false);
    }
  };

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

  const handleDateChange = (e, value) => {
    setOpenDate(value);
  };

  const handleSubmit = async () => {
    setLoading(true);
    const fields = form.getFieldValue("users");
    ////Console.log(fields);

    const data = fields.map((item) => ({
      ...item,
      customerName: item.customerData.businessName,
      customerAccountCode: item.CustomerAccountCode || "",
      address: item.address || "",
      date: OpenDate || dayjs().format("YYYY-MM-DD"),
      dueDate: dayjs().format("YYYY-MM-DD"),
      product: item.product,
      description: item.description || "",
      unit: item.unit,
      quantity: item.quantity,
      rate: item.rate,
      amount: item.amount,
      discPercentage: item.discPercentege,
      discount: item.discount,
      taxRate: item.taxRate,
      saleTax: item.saleTax,
      net: item.net,
      field1: item.field1 || "",
      field2: item.field2 || "",
      field3: item.field3 || "",
      field4: item.field4 || "",
      notes: item.notes || "",
      docNo: item.docNo || "",
      balance: item.total,
      saleType: "Invoice",
      saleBy: UserName,
      extra2: "",
      companyID: CompanyID,
      isActive: true,
      isDeleted: false,
      total: item.net,
      balance: item.net,
      userID: UserID,
    }));

    if (fields.length === 0) {
      message.error("Please add at least one product.");
      setLoading(false);
      return;
    }

    try {
      // Create SaleHead and get the sale ID
      const response = await axios.post(
        Config.base_url + `Sales/AddSaleHeadArray`,
        data,
        {
          headers: {
            Authorization: `Bearer ${AccessKey}`,
          },
        }
      );

      if (response.data.status_code === 1) {
        const updateCustomerData = fields.map((item, index) => ({
          ...item.customerData,
          customerOpeningBalance:
            parseInt(item.balance) +
            parseInt(response.data.saleBodies[index].balance),
        }));
        ////Console.log(updateCustomerData);
        await axios.patch(
          Config.base_url + `CustomerSupplier/UpdateRecords`,
          updateCustomerData,
          {
            headers: {
              Authorization: `Bearer ${AccessKey}`,
            },
          }
        );
        const saleBodies = fields.map((item, index) => ({
          ...item,
          product: item.product,
          description: item.description || "",
          unit: item.unit,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount,
          discPercentage: item.discPercentege,
          discount: item.discount,
          taxRate: item.taxRate,
          saleTax: item.saleTax,
          net: item.net,
          field1: item.field1 || "",
          field2: item.field2 || "",
          field3: item.field3 || "",
          field4: item.field4 || "",
          notes: item.notes || "",
          docNo: item.docNo || "",
          balance: item.total,
          saleType: "Invoice",
          saleBy: UserName,
          extra2: "",
          companyID: CompanyID,
          isActive: true,
          isDeleted: false,
          userID: UserID,
          total: item.net,
          balance: item.net,
          invoiceNo: response.data.saleBodies[index].invoiceNo,
          defaultUnit: "",
        }));
        ////Console.log(saleBodies);

        // Create SaleBody records
        const ProductResponse = await axios.post(
          Config.base_url + `Sales/AddSaleBody`,
          saleBodies,
          {
            headers: {
              Authorization: `Bearer ${AccessKey}`,
            },
          }
        );

        if (ProductResponse.data.status_code === 1) {
          message.success(response.data.status_message);
          setProductList([]);
          setLoading(false);
          navigate("/sales/sales-invoices");
          Productform.resetFields();
        } else {
          message.error(response.data.status_message);
        }
      } else {
        message.error(response.data.status_message);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
      message.error("Network Error..");
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
      // console.error(error);
    } finally {
      setProductLoading(false);
    }
  };

  const productOptions = ProductList.map((item) => ({
    value: item.id,
    label: `${item.name} - Q :  ${item.openingQuantity}`,
  }));

  const handleCustomerChange = (value, index) => {
    const customer = ListOfRecords.find((record) => record.id === value);
    ////Console.log(customer);
    if (customer) {
      const fields = form.getFieldValue("users");
      fields[index] = {
        ...fields[index],
        CustomerAccountCode: customer.accountNo,
        balance: customer.customerOpeningBalance,
        customerData: customer,
      };
      //Console.log(fields);
      form.setFieldsValue({
        users: fields,
      });
    }
  };

  const handleSelectChange = (value, index) => {
    const selectedProduct = ProductList.find((item) => item.id === value);

    if (selectedProduct) {
      const fields = form.getFieldValue("users");
      const quantity = fields[index].quantity || 1;
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
                product: selectedProduct.name,
                description: `${selectedProduct.name} ${selectedProduct.saleInformation}`,
                unit: selectedProduct.unit,
                quantity,
                rate,
                amount,
                discPercentege: selectedProduct.saleDiscount,
                discount,
                taxRate: selectedProduct.gstRate,
                saleTax,
                net,
              }
            : field
        ),
      });
    } else {
      console.error("Selected product not found in ListOfProducts:", value);
    }
  };

  const handleQuantityChange = (e, index) => {
    const quantity = parseFloat(e.target.value);
    const fields = form.getFieldValue("users");

    const formInstance = fields[index];

    if (quantity > 0) {
      const amount = (quantity * formInstance.rate).toFixed(2) || 0;
      const discountAmt = (formInstance.discPercentege * amount) / 100 || 0;
      const Tax = (formInstance.taxRate * amount) / 100 || 0;
      const net = (amount - discountAmt + Tax).toFixed(2);

      const fields = form.getFieldValue("users");
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
    } else {
      ////Console.log("Invalid product selection or quantity");
    }
  };

  const handleRateChange = (e, index) => {
    const fields = form.getFieldValue("users");

    const formInstance = fields[index];
    const rate = parseFloat(e.target.value) || 0;
    const quantity = parseFloat(formInstance.quantity) || 0;
    const discountPercentage = parseFloat(formInstance.discPercentege) || 0;

    if (quantity > 0) {
      const amount = quantity * rate;
      const discountAmt = (discountPercentage * amount) / 100 || 0;
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
    } else {
      console.error("Invalid product selection or quantity");
    }
  };

  const handleTaxRateChange = (e, index) => {
    const fields = form.getFieldValue("users");

    const formInstance = fields[index];
    const TaxRate = parseFloat(e.target.value);
    // const discountPercentage = parseFloat(formInstance.discPercentege) || 0;
    const quantity = parseFloat(formInstance.quantity) || 0;
    const rate = parseFloat(formInstance.rate) || 0;

    if (quantity > 0) {
      const amount = quantity * rate;
      //   const discountAmt = (discountPercentage * amount) / 100 || 0;
      const Tax = (TaxRate * amount) / 100 || 0;
      const net = (amount + Tax).toFixed(2);

      fields[index] = {
        ...fields[index],
        quantity,
        amount,
        // discount: discountAmt,
        saleTax: Tax,
        net,
      };
      form.setFieldsValue({
        users: fields,
      });
    } else {
      console.error("Invalid product selection or quantity");
    }
  };

  const columns = (remove) => [
    { title: "Date", dataIndex: "date", key: "date", width: 280 },
    { title: "Customer", dataIndex: "customer", key: "customer", width: 250 },
    { title: "Doc No.", dataIndex: "docNo", key: "docNo", width: 120 },
    {
      title: "Product / Services",
      dataIndex: "product",
      key: "product",
      width: 250,
    },
    { title: "Unit", dataIndex: "unit", key: "unit", width: 120 },
    { title: "Quantity", dataIndex: "quantity", key: "quantity", width: 150 },
    { title: "Rate", dataIndex: "rate", key: "rate", width: 120 },
    { title: "Amount", dataIndex: "amount", key: "amount", width: 130 },
    // { title: "Tax Rate %", dataIndex: "taxRate", key: "taxRate", width: 120 },
    // { title: "Sale Tax", dataIndex: "saleTax", key: "saleTax", width: 120 },
    // { title: "Net", dataIndex: "net", key: "net", width: 200 },
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

  // //Console.log(form.getFieldValue("users"))

  return (
    <>
      <div id="sub-menu-wrap">
        <h5>Sales</h5>
        <SalesMenu />
      </div>
      <div className="right-side-contents">
        <div className="page-content">
          <div className="page-header">
            <SubMenuToggle />
            <h3 className="page-title">
              <NavLink to="/sales/sales-invoices">
                <ArrowLeftIcon />
              </NavLink>
              Batch Invoice
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
                form={form}
                onFinish={handleSubmit}
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
                                  defaultValue={
                                    OpenDate === null
                                      ? dayjs()
                                      : dayjs(OpenDate, "YYYY-MM-DD")
                                  }
                                  onChange={handleDateChange}
                                />
                              </Form.Item>
                            ),
                            customer: (
                              <Form.Item
                                {...restField}
                                name={[name, "customer"]}
                                fieldKey={[fieldKey, "customer"]}
                                style={{ width: "200px" }}
                              >
                                <Select
                                  variant="borderless"
                                  placeholder="Customer"
                                  loading={CustomerLoading}
                                  showSearch
                                  filterOption={(input, option) =>
                                    option.label
                                      .toLowerCase()
                                      .includes(input.toLowerCase())
                                  }
                                  notFoundContent={
                                    CustomerLoading ? (
                                      <Spin size="small" />
                                    ) : null
                                  }
                                  options={customer}
                                  onSelect={(value) => {
                                    handleCustomerChange(value, index);
                                  }}
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
                                  placeholder="Doc No"
                                  variant="borderless"
                                />
                              </Form.Item>
                            ),
                            customerData: (
                              <Form.Item
                                {...restField}
                                name={[name, "customerData"]}
                                fieldKey={[fieldKey, "customerData"]}
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
                            product: (
                              <Form.Item
                                {...restField}
                                name={[name, "product"]}
                                fieldKey={[fieldKey, "product"]}
                              >
                                <Select
                                  showSearch
                                  filterOption={(input, option) =>
                                    option.label
                                      .toLowerCase()
                                      .includes(input.toLowerCase())
                                  }
                                  notFoundContent={
                                    ProductLoading ? (
                                      <Spin size="small" />
                                    ) : null
                                  }
                                  onChange={(value) => {
                                    handleSelectChange(value, index);
                                  }}
                                  placeholder="Product / Services"
                                  variant="borderless"
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
                                  onFocus={(e) => e.target.select()}
                                  placeholder="Unit"
                                  variant="borderless"
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
                                  onChange={(e) =>
                                    handleQuantityChange(e, index)
                                  }
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
                                  onChange={(e) => handleRateChange(e, index)}
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
                                  placeholder="Amount"
                                  variant="borderless"
                                />
                              </Form.Item>
                            ),
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
                            //     <Input
                            //       placeholder="Sale Tax"
                            //       variant="borderless"
                            //     />
                            //   </Form.Item>
                            // ),
                            // net: (
                            //   <Form.Item
                            //     {...restField}
                            //     name={[name, "net"]}
                            //     fieldKey={[fieldKey, "net"]}
                            //   >
                            //     <Input
                            //       onFocus={(e) => e.target.select()}
                            //       placeholder="Net"
                            //       variant="borderless"
                            //     />
                            //   </Form.Item>
                            // ),
                            action: (
                              <MinusCircleOutlined
                                onClick={() => remove(name)}
                              />
                            ),
                          })
                        )}
                        size="small"
                        columns={columns(remove)}
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
                <Form.Item>
                  <Row justify="end">
                    <Col xs={24} md={{ span: 4, offset: 20 }}>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                      >
                        Approve and Close
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

export default BatchInvoice;
