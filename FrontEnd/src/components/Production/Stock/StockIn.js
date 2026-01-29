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
import ProductionMenu from "../ProductionMenu";
import ProductDropdown from "../../Shared/ProductDropdown";
import LevelWiseAccounts from "../../Shared/LevelWiseAccounts";
import { async } from "q";

const { Option } = Select;

const StockIn = () => {
  const navigate = useNavigate();
  const AccessKey = localStorage.getItem("AccessKey");
  const UserName = localStorage.getItem("Full_Name");
  const UserID = localStorage.getItem("ID");
  const CompanyID = localStorage.getItem("CompanyID");
  const FYear = localStorage.getItem("DefaultFYear");

  const [ProductForm] = Form.useForm();
  const [MainForm] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [productLoading, setProductLoading] = useState(false);
  const [CustomerForm] = Form.useForm();
  const [OpenDate, setOpenDate] = useState(null);
  const [ListOfProducts, setListOfProducts] = useState([]);
  const [ListOfBank, setListOfBank] = useState([]);
  const [loadingBank, setLoadingBank] = useState(false);
  const [SelectedAccountCode, setSelectedAccountCode] = useState("50101");
  const [initialLoading, setInitialLoading] = useState(true);
  const [form] = Form.useForm();

  const handleSubmit = async (FormData) => {
    setLoading(true);

    const fields = form.getFieldValue("users");

    // Prepare customer data
    const StockHead = {
      ...FormData,
      date: OpenDate || dayjs().format("YYYY-MM-DD"),
      AdjustType: "In",
      AdjustBy: UserName,
      companyID: CompanyID,
      isActive: true,
      isDeleted: false,
      accountCode: SelectedAccountCode,
      userID: UserID,
    };

    const StockBody = fields.map((item) => ({
      ...item,
      date: OpenDate || dayjs().format("YYYY-MM-DD"),
      productName: item.product,
      weight: item.weight || 0,
      length: item.length || 0,
      extra1: "",
      extra2: "",
      extra3: "",
      AdjustType: "In",
      AdjustBy: UserName,
      companyID: CompanyID,
      isActive: true,
      isDeleted: false,
      userID: UserID,
    }));

    const data = {
      StockHead: StockHead,
      StockBody: StockBody,
    };

    try {
      // Add stock head
      const response = await axios.post(
        `${Config.base_url}Stock/AddStock`,
        data,
        {
          headers: {
            Authorization: `Bearer ${AccessKey}`,
          },
        }
      );
      if (response.data.status_code === 1) {
        setLoading(false);

        message.success(
          <>
            Invoice Added Successfully Against <br />
            Invoice No:{" "}
            <span style={{ color: "blue" }}>{response.data.invoice}</span>
          </>
        );

        setLoading(false);
        navigate("/products/stock-adjustment");
        CustomerForm.resetFields();
        ProductForm.resetFields();
      } else {
        message.error(response.data.status_message);
        setLoading(false);
      }
    } catch (error) {
      // Error in adding stock head
      message.error("Network Error..");
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Stock In";

    fetchProducts();
    fetchBankAccounts();
  }, []);

  const fetchProducts = async () => {
    setProductLoading(true);
    setInitialLoading(true);

    try {
      const response = await ProductDropdown();
      if (response) {
        setProductLoading(false);
        setListOfProducts(response);
      } else {
        setProductLoading(false);

        setListOfProducts([]);
      }
    } catch (error) {
      //console.error("Error fetching data:", error);
      setProductLoading(false);

      setListOfProducts([]);
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchBankAccounts = async () => {
    setLoadingBank(true);
    try {
      const response = await LevelWiseAccounts(0);
      if (response != null) {
        setListOfBank(response);
      }
    } catch (error) {
      // ////console.error(error);
    } finally {
      setLoadingBank(false);
    }
  };

  const CustomerDetail = () => {
    const handleDateChange = (e, value) => {
      setOpenDate(value);
    };

    const handleAccountChange = (value) => {
      const account = ListOfBank.find((b) => b.accountCode == value);
      ////Console.log(account)
      if (account) {
        CustomerForm.setFieldsValue({
          nominalAccount: account.accountDescription,
        });
      }
      setSelectedAccountCode(value);
    };
    // ////Console.log(SelectedAccountCode)

    return (
      <>
        <Form layout="vertical" form={CustomerForm} onFinish={handleSubmit}>
          <Row gutter={[24, 0]}>
            <Col xs={24} md={8}>
              <Form.Item
                name="nominalAccount"
                initialValue="Stock"
                label="COA"
                rules={[
                  {
                    required: true,
                    message: "Please select Account",
                  },
                ]}
              >
                <Select
                  showSearch
                  filterOption={(input, option) =>
                    option.label.toLowerCase().includes(input.toLowerCase())
                  }
                  placeholder="Select.."
                  notFoundContent={loadingBank ? <Spin size="small" /> : null}
                  loading={loadingBank}
                  style={{ width: "350px" }}
                  options={ListOfBank.map((item) => ({
                    label: `${item.accountDescription} (${item.accountCode})`,
                    value: item.accountCode,
                  }))}
                  onChange={handleAccountChange}
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
                <Form.Item name="accountCode" label="Term Days" hidden>
                  <Input onFocus={(e) => e.target.select()} />
                </Form.Item>

                <Col xs={24} md={12}>
                  <Form.Item name="docNo" label="Doc No.">
                    <Input onFocus={(e) => e.target.select()} />
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
    const handleSelectChange = (value, index) => {
      const selectedProduct = ListOfProducts.find((item) => item.id === value);
      // //Console.log(selectedProduct);
      if (selectedProduct) {
        const fields = form.getFieldValue("users");
        const quantity = fields[index].quantity || 0;
        const weight = fields[index].quantity || 0;
        const length = fields[index].quantity || 0;
        const rate = selectedProduct.salePrice;
        const amount = (quantity * rate).toFixed(2) || 0;
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
                  weight,
                  length,
                  quantity,
                  rate,
                  amount,
                  discPercentege: selectedProduct.saleDiscount,
                  discount,
                  taxRate: selectedProduct.gstRate,
                  saleTax,
                  net,
                  defaultUnit: selectedProduct.defaultUnit,
                  openingQuantity: selectedProduct.openingQuantity,
                  selectedProduct: selectedProduct.id,
                  productCode: selectedProduct.code,
                }
              : field
          ),
        });
      } else {
        //console.error("Selected product not found in ListOfProducts:", value);
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
      const quantity = parseFloat(formInstance.quantity) || 1;
      const length = parseFloat(formInstance.length) || 1;
      const weight = parseFloat(formInstance.weight) || 1;
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
        const net = fields.map((item) => parseFloat(item.net) || 0);
        const total = net.reduce((sum, value) => sum + value, 0);

        CustomerForm.setFieldsValue({
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
                  scroll={{
                    x: "100%",
                  }}
                  dataSource={fields.map(
                    ({ key, name, fieldKey, ...restField }, index) => ({
                      key,
                      product: (
                        <Form.Item
                          {...restField}
                          name={[name, "product"]}
                          fieldKey={[fieldKey, "product"]}
                          style={{ width: "250px" }}
                        >
                          <Select
                            showSearch
                            filterOption={(input, option) =>
                              option.label
                                .toLowerCase()
                                .includes(input.toLowerCase())
                            }
                            onChange={(value) => {
                              handleSelectChange(value, index);
                            }}
                            placeholder="Product / Services"
                            variant="borderless"
                            loading={productLoading}
                            notFoundContent={
                              productLoading ? <Spin size="small" /> : null
                            }
                            options={ListOfProducts.map((record) => ({
                              label: `${record.name} - Q : ${record.openingQuantity}`,
                              value: record.id,
                            }))}
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
                      selectedProduct: (
                        <Form.Item
                          {...restField}
                          name={[name, "selectedProduct"]}
                          fieldKey={[fieldKey, "selectedProduct"]}
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
                      action: (
                        <MinusCircleOutlined onClick={() => remove(name)} />
                      ),
                    })
                  )}
                  columns={columns(remove)}
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
      <div id="sub-menu-wrap">
        <h5>Production</h5>
        <ProductionMenu />
      </div>
      <div className="right-side-contents">
        <div className="page-content mb-5">
          <div className="page-header">
            <SubMenuToggle />
            <h3 className="page-title">
              <NavLink to="/products/stock-adjustment">
                <ArrowLeftIcon />
              </NavLink>
              Stock In
            </h3>
          </div>

          {initialLoading ? (
            <>
              <Skeleton active paragraph={{ rows: 4 }} />
              <Skeleton active paragraph={{ rows: 4 }} />
            </>
          ) : (
            <>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Collapse
                  collapsible="header"
                  defaultActiveKey={["Customer Details"]}
                  items={[
                    {
                      key: "Customer Details",
                      label: "Details",
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
                  onFinish={handleSubmit}
                >
                  <Row gutter={[24, 0]}>
                    <Col xs={24} md={12}>
                      <Form.Item name="notes" label="Notes">
                        <Input.TextArea rows={5} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
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
                </Form>
              </Space>
              <Form
                layout="vertical"
                className="my-5"
                form={CustomerForm}
                onFinish={handleSubmit}
              >
                <Row justify="end" className="text-end">
                  <Col xs={24} md={{ span: 4, offset: 20 }}>
                    <Button type="primary" htmlType="submit" loading={loading}>
                      Approve and Close
                    </Button>
                  </Col>
                </Row>
              </Form>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default StockIn;
