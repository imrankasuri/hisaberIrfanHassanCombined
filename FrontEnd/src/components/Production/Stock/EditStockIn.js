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
  Typography,
  Skeleton,
  Flex,
} from "antd";
import dayjs from "dayjs";
import { Link, NavLink, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Config from "../../../Config";
import SubMenuToggle from "../../Common/SubMenuToggle";
import ProductionMenu from "../ProductionMenu";
import ProductDropdown from "../../Shared/ProductDropdown";
import LevelWiseAccounts from "../../Shared/LevelWiseAccounts";
import { async } from "q";
import moment from "moment";

const { Option } = Select;

const EditStockIn = () => {
  const navigate = useNavigate();
  const params = useParams();
  const AccessKey = localStorage.getItem("AccessKey");
  const UserName = localStorage.getItem("Full_Name");
  const UserID = localStorage.getItem("ID");
  const CompanyID = localStorage.getItem("CompanyID");
  const FYear = localStorage.getItem("DefaultFYear");

  const [ProductForm] = Form.useForm();
  const [ProductList, setProductList] = useState([]);

  const [loadingMode, setloadingMode] = useState(false);

  const [loading, setLoading] = useState(false);
  const [productLoading, setProductLoading] = useState(false);
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [CustomerForm] = Form.useForm();
  const [OpenDate, setOpenDate] = useState(null);
  const [ListOfProducts, setListOfProducts] = useState([]);
  const [ListOfBank, setListOfBank] = useState([]);
  const [createdDate, setCreatedDate] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  const [loadingStockHeadData, setLoadingStockHeadData] = useState(false);
  const [product, setProduct] = useState([]);
  const [stockHead, setStockHead] = useState([]);
  const [loadingBank, setLoadingBank] = useState(false);
  const [SelectedAccountCode, setSelectedAccountCode] = useState("");

  const [form] = Form.useForm();

  const handleSubmit = async (FormData) => {
    setLoading(true);

    const fields = form.getFieldValue("users");

    const StockHead = {
      ...FormData,
      date: OpenDate || dayjs().format("YYYY-MM-DD"),
      total: FormData.total || 0,
      extra1: "",
      extra2: "",
      extra3: "",
      notes: FormData.notes || "",
      docNo: FormData.docNo || "",
      AdjustType: "In",
      AdjustBy: UserName,
      companyID: CompanyID,
      isActive: true,
      isDeleted: false,
      invoiceNo: params.id,
      accountCode: SelectedAccountCode,
    };

    const StockBody = fields.map((item) => ({
      ...item,
      date: OpenDate || dayjs().format("YYYY-MM-DD"),
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
    }));

    const data = {
      StockHead: StockHead,
      StockBody: StockBody,
    };
    // //Console.log(data)
    try {
      // Add stock head
      const response = await axios.patch(
        `${Config.base_url}Stock/EditStock`,
        data,
        {
          headers: {
            Authorization: `Bearer ${AccessKey}`,
          },
        }
      );

      if (response.data.status_code === 1) {
        message.success(
          <>
            Invoice Updated Successfully Against <br />
            Invoice No:{" "}
            <span style={{ color: "blue" }}>{response.data.invoice}</span>
          </>
        );

        setProductList([]);
        setLoading(false);
        navigate("/products/stock-adjustment");
        CustomerForm.resetFields();
        ProductForm.resetFields();
      } else {
        // Error adding product data
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
    document.title = "Edit Stock In";
    fetchProducts();
    fetchBankAccounts();
    fetchStock();
  }, []);

  const fetchStock = async () => {
    setLoadingStockHeadData(true);
    try {
      const data = {
        ID: params.id,
        CompanyID: CompanyID,
      };
      const response = await axios.post(
        `${Config.base_url}Stock/GetStockDataForEdit`,
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
        CustomerForm.setFieldsValue(response.data.stockHead);
        if (CompanyID != response.data.stockHead.companyID) {
          navigate("/products/stock-adjustment");
        }
        setProductList(response.data.listofStockBody);
        setProduct(response.data.listofStockBody);
        form.setFieldsValue({ users: response.data.listofStockBody });
        setCreatedDate(response.data.stockHead.createdDate);
        setCreatedBy(response.data.user);
        setSelectedAccountCode(response.data.stockHead.accountCode);
        const productDate = CustomerForm.getFieldValue("date");
        setOpenDate(productDate);
        setStockHead(response.data.stockHead);
        debouncedHandleFormChange();
      }
    } catch (error) {
      // console.error("Error fetching salehead data:", error);
    } finally {
      setLoadingStockHeadData(false); // Stop loading
    }
  };

  const debouncedHandleFormChange = useCallback(
    debounce(() => {
      const fields = form.getFieldValue("users");
      const amounts = fields.map((item) => parseFloat(item.amount) || 0);
      const discount = fields.map((item) => parseFloat(item.discount) || 0);
      const tax = fields.map((item) => parseFloat(item.saleTax) || 0);
      const net = fields.map((item) => parseFloat(item.amount) || 0);

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

  const fetchProducts = async () => {
    setProductLoading(true);

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
                  style={{ width: "350px" }}
                  loading={loadingBank}
                  notFoundContent={loadingBank ? <Spin size="small" /> : null}
                  onChange={handleAccountChange}
                  options={ListOfBank.map((item) => ({
                    label: `${item.accountDescription} (${item.accountCode})`,
                    value: item.accountCode,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Row gutter={[24, 0]}>
                <Col xs={24} md={12}>
                  <Form.Item name="Date" label="Date" required>
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
      ////Console.log(selectedProduct);
      if (selectedProduct) {
        const fields = form.getFieldValue("users");
        const quantity = fields[index].quantity || 0;
        const weight = fields[index].weight || 0;
        const length = fields[index].length || 0;
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
                  productName: selectedProduct.name,
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
        debouncedHandleFormChange();
      } else {
        // console.error("Selected product not found in ListOfProducts:", value);
      }
    };

    const handleQuantityChange = (e, index) => {
      const quantity = parseFloat(e.target.value);
      const fields = form.getFieldValue("users");
      const formInstance = fields[index];

      if (isNaN(quantity) || quantity <= 0) {
        ////Console.log("Invalid quantity value");
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
        ////Console.log("Rate unit is not Quantity");
      }
    };

    const handleWeightChange = (e, index) => {
      const weight = parseFloat(e.target.value);
      const fields = form.getFieldValue("users");
      const formInstance = fields[index];

      if (isNaN(weight) || weight <= 0) {
        ////Console.log("Invalid weight value");
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
        ////Console.log("Rate unit is not Weight");
      }
    };

    const handleLengthChange = (e, index) => {
      const length = parseFloat(e.target.value);
      const fields = form.getFieldValue("users");
      const formInstance = fields[index];

      if (isNaN(length) || length <= 0) {
        ////Console.log("Invalid length value");
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
        ////Console.log("Rate unit is not Length");
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
        // console.error("Invalid product selection or quantity");
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
          `${Config.base_url}Stock/DeleteStockBody`,
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

    const columns = (remove) => [
      {
        title: "Product / Services",
        dataIndex: "productName",
        key: "productName",
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
              <Link
                to={`#/`}
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
                  dataSource={fields.map(
                    ({ key, name, fieldKey, ...restField }, index) => ({
                      key,
                      productName: (
                        <Form.Item
                          {...restField}
                          name={[name, "productName"]}
                          fieldKey={[fieldKey, "productName"]}
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
                      id: (
                        <Form.Item
                          {...restField}
                          name={[name, "id"]}
                          fieldKey={[fieldKey, "id"]}
                          hidden
                        >
                          <Input onFocus={(e) => e.target.select()} />
                        </Form.Item>
                      ),
                      productCode: (
                        <Form.Item
                          {...restField}
                          name={[name, "productCode"]}
                          fieldKey={[fieldKey, "productCode"]}
                          hidden
                        >
                          <Input onFocus={(e) => e.target.select()} />
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
              Edit Stock In
            </h3>
          </div>

          {loadingStockHeadData ? (
            <>
              <Skeleton active />
              <Skeleton active />
              <Skeleton active />
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
              <Form form={CustomerForm} onFinish={handleSubmit}>
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
          )}
        </div>
      </div>
    </>
  );
};

export default EditStockIn;
