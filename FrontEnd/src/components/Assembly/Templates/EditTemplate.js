import { useState, useEffect, useCallback, useRef } from "react";
import { debounce } from "lodash";
import {
  DeleteOutlined,
  MinusCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  Button,
  Col,
  Form,
  Input,
  Row,
  Skeleton,
  Select,
  message,
  Space,
  Collapse,
  Spin,
  Table,
  Typography,
} from "antd";
import { Link, NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Config from "../../../Config";
import SubMenuToggle from "../../Common/SubMenuToggle";
import AssemblyMenu from "../AssemblyMenu";
import AddProductModal from "../../Common/AddProductModal";
import FormItem from "antd/es/form/FormItem";
import ProductDropdown from "../../Shared/ProductDropdown";
import LevelWiseAccount2 from "../../Shared/LevelWiseAccount2";
import { useParams } from "react-router-dom";
const { Text } = Typography;

const { Option } = Select;

const EditTemplate = () => {
  const navigate = useNavigate();
  const AccessKey = localStorage.getItem("AccessKey");
  const UserName = localStorage.getItem("Full_Name");
  const UserID = localStorage.getItem("ID");
  const CompanyID = localStorage.getItem("CompanyID");
  const FYear = localStorage.getItem("DefaultFYear");

  const [ExpenseForm] = Form.useForm();
  const [nonStockForm] = Form.useForm();
  const [DetailsForm] = Form.useForm();
  const [RmForm] = Form.useForm();
  const [form] = Form.useForm();
  const [FinishedGoodsForm] = Form.useForm();
  const [formMain] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [CustomerLoading, setCustomerLoading] = useState(false);
  const [productLoading, setProductLoading] = useState(false);
  const [ProductID, setProductID] = useState("");
  const [productOpen, setProductOpen] = useState(false);
  const [bankLoading, setBankLoading] = useState(false);

  const [finishedGoodsQty, setFinishedGoodsQty] = useState(1);
  const [prevFinishedQty, setPrevFinishedQty] = useState(1);

  const [ListOfRecords, setListOfRecords] = useState([]);
  const [ListOfProducts, setListOfProducts] = useState([]);

  const { id } = useParams();

  const handleSubmit = async (FormData) => {
    setLoading(true);

    const fields = FinishedGoodsForm.getFieldValue("users");
    if (fields.length === 0) {
      message.error("Please add at least one Product in Finished Goods.");
      return;
    }

    const RmData = RmForm.getFieldValue("users");
    if (RmData.length === 0) {
      message.error("Please add at least one Product in Raw Material.");
      return;
    }

    const NonStockData = nonStockForm.getFieldValue("users");
    if (NonStockData.length === 0) {
      message.error("Please add at least one Product in Non Stock.");
      return;
    }

    const ExpenseData = ExpenseForm.getFieldValue("users");
    if (ExpenseData.length === 0) {
      message.error("Please add data in Expense.");
      return;
    }

    const DetailsData = {
      ...FormData,
      rmFactor: FormData.rmFactor || 0,
      assemblyType: "Template",
      CompanyID: CompanyID,
      isActive: true,
      isDeleted: false,
      UserID: UserID,
    };
    const FinishedGoods = fields.map((item) => ({
      ...item,
      unit: item.unit || "",
      CompanyID: CompanyID,
      isActive: true,
      isDeleted: false,
      UserID: UserID,
    }));

    const RawMaterial = RmData.map((item) => ({
      ...item,
      unit: item.unit || "",
      location: item.location || "",
      assemblyType: "Template",
      CompanyID: CompanyID,
      isActive: true,
      isDeleted: false,
      UserID: UserID,
    }));

    const NonStock = NonStockData.map((item) => ({
      ...item,
      unit: item.unit || "",
      location: item.location || "",
      assemblyType: "Template",
      CompanyID: CompanyID,
      isActive: true,
      isDeleted: false,
      UserID: UserID,
    }));

    const Expense = ExpenseData.map((item) => ({
      ...item,
      CompanyID: CompanyID,
      assemblyType: "Template",
      isActive: true,
      isDeleted: false,
      UserID: UserID,
    }));

    const data = {
      tempDetails: DetailsData,
      finishedGoods: FinishedGoods,
      rawMaterials: RawMaterial,
      nonStocks: NonStock,
      expenses: Expense,
    };
    //////Console.log(data);
    try {
      const response = await axios.patch(
        `${Config.base_url}Templates/UpdateTemplateDataByDetailID/${id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${AccessKey}`,
          },
        }
      );
      if (response.data.status_code == 1) {
        message.success(response.data.status_message);
        setLoading(false);
        navigate("/product-recipes/manage");
      } else {
        message.error(response.data.status_message);
        setLoading(false);
      }
    } catch (error) {
      message.error("Network Error..");
      //console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Edit Product Recipe";
    fetchTemplates();
    fetchProducts();
    fetchBankAccounts();
  }, []);

  const prevFinishedQtyRef = useRef(finishedGoodsQty);

  const debouncedHandleQuantityChange = useCallback(
    debounce(async (newQty) => {
      const finishedQty = parseFloat(newQty);
      const prevFinishedQty = prevFinishedQtyRef.current;

      if (
        finishedQty === prevFinishedQty ||
        isNaN(finishedQty) ||
        prevFinishedQty === 0
      )
        return;

      const ratio = finishedQty / prevFinishedQty;

      await updateFormQuantities(RmForm, ratio, "qtyRequired");
      await updateFormQuantities(RmForm, ratio, "amount");
      await updateFormQuantities(nonStockForm, ratio, "qtyRequired");
      await updateFormQuantities(nonStockForm, ratio, "amount");
      await updateFormQuantities(ExpenseForm, ratio, "qtyRequired");
      await updateFormQuantities(ExpenseForm, ratio, "amount");

      prevFinishedQtyRef.current = finishedQty;
      setPrevFinishedQty(finishedQty);
    }, 1000),
    []
  );

  const updateFormQuantities = async (form, ratio, fieldName) => {
    const fields = form.getFieldValue("users") || [];
    const updatedFields = fields.map((field) => ({
      ...field,
      [fieldName]: parseFloat((field[fieldName] * ratio).toFixed(2)),
    }));
    form.setFieldsValue({ users: updatedFields });
  };

  const fetchTemplates = async () => {
    setLoading(true);
    const api_config = {
      method: "get",
      url: `${Config.base_url}Templates/GetTemplateForEditBy/${CompanyID}?iD=${id}`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AccessKey}`,
      },
    };

    try {
      const response = await axios(api_config);
      //////Console.log(response.data);
      if (response.data && response.data.status_code === 1) {
        DetailsForm.setFieldsValue(response.data.details);
        FinishedGoodsForm.setFieldsValue({
          users: response.data.listofFinishedGoods,
        });
        RmForm.setFieldsValue({ users: response.data.listofRawMaterial });
        nonStockForm.setFieldsValue({
          users: response.data.listofNonStock,
        });
        ExpenseForm.setFieldsValue({ users: response.data.listofExpenses });
        setLoading(false);
      } else {
        setListOfRecords([]);
        setLoading(false);
        //message.error(response.data.status_message);
      }
    } catch (error) {
      ////console.error("Error fetching data:", error);
      message.error("Network Error..");
      setListOfRecords([]);
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    setProductLoading(true);
    try {
      const response = await ProductDropdown();
      if (response != null) {
        setListOfProducts(response || []);
      }
    } catch (error) {
      // //console.error(error);
    } finally {
      setProductLoading(false);
    }
  };

  const fetchBankAccounts = async () => {
    setBankLoading(true);
    try {
      const response = await LevelWiseAccount2(3, "70");
      if (response != null) {
        setListOfRecords(response);
      }
    } catch (error) {
      // //console.error(error);
    } finally {
      setBankLoading(false);
    }
  };

  const handleProductOk = (FormData) => {
    setLoading(true);
    setProductOpen(false);
    setLoading(false);
  };

  const handleProductCancel = () => {
    setProductOpen(false);
  };

  const FinishedGoods = () => {
    const handleSelectChange = (value, index) => {
      const selectedProduct = ListOfProducts.find(
        (item) => item.name === value
      );
      //////Console.log(selectedProduct);
      if (selectedProduct) {
        const fields = FinishedGoodsForm.getFieldValue("users");
        const quantity = fields[index].quantity || 0;
        const rate = selectedProduct.salePrice;
        const amount = (quantity * rate).toFixed(2);
        const discount = (amount * selectedProduct.saleDiscount) / 100;
        const saleTax = (selectedProduct.gstRate * amount) / 100;
        const net = (amount - discount + saleTax).toFixed(2);

        FinishedGoodsForm.setFieldsValue({
          users: fields.map((field, i) =>
            i === index
              ? {
                  ...field,
                  description: `${selectedProduct.name} ${selectedProduct.saleInformation}`,
                  unit: selectedProduct.unit,
                  productID: selectedProduct.id,
                  productCode: selectedProduct.code,
                }
              : field
          ),
        });
        //////Console.log(selectedProduct.code);
        //debouncedHandleFormChange();
      } else {
        //console.error("Selected product not found in ListOfProducts:", value);
      }
    };

    const columns = (remove) => [
      { title: "Sr No", dataIndex: "srNo", key: "srNo", width: 25 },
      {
        title: "Product / Services",
        dataIndex: "productName",
        key: "productName",
        width: 300,
      },
      {
        title: "",
        dataIndex: "productID",
        key: "productID",
        width: 0,
      },

      {
        title: "Description",
        dataIndex: "description",
        key: "description",
        width: 250,
      },
      //{ title: "Qty FI %", dataIndex: "qtyfi", key: "qtyfi", width: 180 },
      { title: "Unit", dataIndex: "unit", key: "unit", width: 180 },
      { title: "Qty", dataIndex: "quantity", key: "quantity", width: 180 },
      { title: "Total", dataIndex: "total", key: "total", width: 180 },
      // {
      //   title: "Cost FI %",
      //   dataIndex: "costFi",
      //   key: "costFi",
      //   width: 180,
      // },
      {
        title: "",
        dataIndex: "productCode",
        key: "productCode",
        width: 0,
      },
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

    // 1. Declare total state
    const [totalAmount, setTotalAmount] = useState("0.00");

    // 2. Watch all 3 forms
    const rmUsers = Form.useWatch("users", RmForm) || [];
    const nsUsers = Form.useWatch("users", nonStockForm) || [];
    const exUsers = Form.useWatch("users", ExpenseForm) || [];

    // 3. Effect to update total when any form changes
    useEffect(() => {
      const total = calculateTotal(rmUsers, nsUsers, exUsers);
      //////Console.log(total)
      const fields = FinishedGoodsForm.getFieldValue("users") || [];
      for (let i = 0; i < fields.length; i++) {
        fields[i] = {
          ...fields[i],
          total: total,
        };
      }

      setTotalAmount(total);
    }, [rmUsers, nsUsers, exUsers]);

    // 4. Pure function to calculate total
    const calculateTotal = (rmUsers, nsUsers, exUsers) => {
      //////Console.log([...rmUsers, ...nsUsers, ...exUsers])
      const grandTotal = [...rmUsers, ...nsUsers, ...exUsers].reduce(
        (sum, row) => {
          const amount =
            parseFloat(row?.amount) ||
            (parseFloat(row?.rate) || 0) * (parseFloat(row?.qtyRequired) || 0);
          // //////Console.log(sum + amount);
          return sum + amount;
        },
        0
      );
      // //////Console.log(grandTotal)
      return grandTotal.toFixed(2);
    };

    return (
      <>
        <Form
          form={FinishedGoodsForm}
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
                      productName: (
                        <Form.Item
                          {...restField}
                          name={[name, "productName"]}
                          fieldKey={[fieldKey, "productName"]}
                          style={{ width: "300px" }}
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
                            disabled
                            notFoundContent={
                              productLoading ? <Spin size="small" /> : ""
                            }
                            loading={productLoading}
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
                      description: (
                        <Form.Item
                          {...restField}
                          name={[name, "description"]}
                          fieldKey={[fieldKey, "description"]}
                        >
                          <Input
                            placeholder="Description"
                            variant="borderless"
                            onFocus={(e) => e.target.select()}
                          />
                        </Form.Item>
                      ),
                      qtyfi: (
                        <Form.Item
                          {...restField}
                          name={[name, "qtyfi"]}
                          fieldKey={[fieldKey, "qtyfi"]}
                        >
                          <Input
                            type="Number"
                            placeholder="Qty FI %"
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
                            placeholder="Qty"
                            type="Number"
                            variant="borderless"
                            onFocus={(e) => e.target.select()}
                            onChange={(e) =>
                              debouncedHandleQuantityChange(e.target.value)
                            }
                          />
                        </Form.Item>
                      ),
                      costFi: (
                        <Form.Item
                          {...restField}
                          name={[name, "costFI"]}
                          fieldKey={[fieldKey, "costFI"]}
                        >
                          <Input
                            placeholder="Cost FI %"
                            type="Number"
                            variant="borderless"
                            onFocus={(e) => e.target.select()}
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
                            placeholder="Total"
                            type="Number"
                            variant="borderless"
                            readOnly
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

  const RawMaterial = () => {
    const [totalAmount, setTotalAmount] = useState(0);

    const handleSelectChange = (value, index) => {
      const selectedProduct = ListOfProducts.find(
        (item) => item.name === value
      );

      if (selectedProduct) {
        const fields = RmForm.getFieldValue("users");
        const quantity = fields[index].quantity || 0;
        const rate = selectedProduct.salePrice;
        const amount = (quantity * rate).toFixed(2);
        const discount = (amount * selectedProduct.saleDiscount) / 100;
        const saleTax = (selectedProduct.gstRate * amount) / 100;
        const net = (amount - discount + saleTax).toFixed(2);

        RmForm.setFieldsValue({
          users: fields.map((field, i) =>
            i === index
              ? {
                  ...field,
                  description: `${selectedProduct.name} ${selectedProduct.saleInformation}`,
                  unit: selectedProduct.unit,
                  productID: selectedProduct.id,
                  productCode: selectedProduct.code,
                  rate: selectedProduct.salePrice || 0,
                }
              : field
          ),
        });

        // Recalculate total after product selection
        setTimeout(() => calculateTotal(), 100);
      } else {
        //console.error("Selected product not found in ListOfProducts:", value);
      }
    };

    const calculateAmount = (rate, qty) => {
      const rateValue = parseFloat(rate) || 0;
      const qtyValue = parseFloat(qty) || 0;
      return (rateValue * qtyValue).toFixed(2);
    };

    const calculateTotal = () => {
      const fields = RmForm.getFieldValue("users") || [];
      const total = fields.reduce((sum, field) => {
        // Use the amount field directly if it exists, otherwise calculate from rate * qty
        const amount =
          parseFloat(field?.amount) ||
          (parseFloat(field?.rate) || 0) *
            (parseFloat(field?.qtyRequired) || 0);
        return sum + amount;
      }, 0);
      setTotalAmount(total.toFixed(2));
      return total.toFixed(2);
    };

    const handleRateChange = (value, index) => {
      const fields = RmForm.getFieldValue("users");
      const updatedFields = [...fields];
      const qty = parseFloat(updatedFields[index]?.qtyRequired) || 0;
      const calculatedAmount = calculateAmount(value, qty);

      updatedFields[index] = {
        ...updatedFields[index],
        rate: value,
        amount: calculatedAmount, // Auto-calculate amount
      };
      RmForm.setFieldsValue({ users: updatedFields });
      calculateTotal();
    };

    const handleQtyChange = (value, index) => {
      const fields = RmForm.getFieldValue("users");
      const updatedFields = [...fields];
      const rate = parseFloat(updatedFields[index]?.rate) || 0;
      const calculatedAmount = calculateAmount(rate, value);

      updatedFields[index] = {
        ...updatedFields[index],
        qtyRequired: value,
        amount: calculatedAmount, // Auto-calculate amount
      };
      RmForm.setFieldsValue({ users: updatedFields });
      calculateTotal();
    };

    const handleAmountChange = (value, index) => {
      const fields = RmForm.getFieldValue("users");
      const updatedFields = [...fields];
      updatedFields[index] = {
        ...updatedFields[index],
        amount: value,
      };
      RmForm.setFieldsValue({ users: updatedFields });
      calculateTotal();
    };

    const columns = (remove) => [
      { title: "Sr No", dataIndex: "srNo", key: "srNo", width: 60 },
      {
        title: "Product / Services",
        dataIndex: "productName",
        key: "productName",
        width: 300,
      },
      { title: "Unit", dataIndex: "unit", key: "unit", width: 100 },
      { title: "Rate", dataIndex: "rate", key: "rate", width: 120 },
      {
        title: "Qty Required",
        dataIndex: "qtyRequired",
        key: "qtyRequired",
        width: 120,
      },
      {
        title: "Amount",
        dataIndex: "amount",
        key: "amount",
        width: 120,
      },
      {
        title: "Action",
        dataIndex: "action",
        key: "action",
        width: 80,
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

    return (
      <>
        <Form
          form={RmForm}
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
                    ({ key, name, fieldKey, ...restField }, index) => {
                      const currentFields = RmForm.getFieldValue("users") || [];
                      const currentField = currentFields[index] || {};

                      return {
                        srNo: index + 1,
                        key,
                        productName: (
                          <Form.Item
                            {...restField}
                            name={[name, "productName"]}
                            fieldKey={[fieldKey, "productName"]}
                            style={{ width: "280px", margin: 0 }}
                          >
                            <Select
                              showSearch
                              filterOption={(input, option) =>
                                option.value
                                  .toLowerCase()
                                  .includes(input.toLowerCase())
                              }
                              onChange={(value) => {
                                handleSelectChange(value, index);
                              }}
                              placeholder="Product / Services"
                              variant="borderless"
                              loading={productLoading}
                              options={ListOfProducts.filter(
                                (record) => record.productType === "Stock"
                              ).map((record) => ({
                                label: (
                                  <>
                                    {record.name} - Q : {record.openingQuantity}
                                  </>
                                ),
                                value: record.name,
                              }))}
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
                            style={{ margin: 0 }}
                          >
                            <Input
                              placeholder="Unit"
                              variant="borderless"
                              onFocus={(e) => e.target.select()}
                              readOnly
                            />
                          </Form.Item>
                        ),
                        rate: (
                          <Form.Item
                            {...restField}
                            name={[name, "rate"]}
                            fieldKey={[fieldKey, "rate"]}
                            style={{ margin: 0 }}
                          >
                            <Input
                              placeholder="Rate"
                              variant="borderless"
                              onFocus={(e) => e.target.select()}
                              onChange={(e) => {
                                const value = e.target.value.replace(
                                  /[^0-9.]/g,
                                  ""
                                );
                                handleRateChange(value, index);
                              }}
                            />
                          </Form.Item>
                        ),
                        qtyRequired: (
                          <Form.Item
                            {...restField}
                            name={[name, "qtyRequired"]}
                            fieldKey={[fieldKey, "qtyRequired"]}
                            style={{ margin: 0 }}
                          >
                            <Input
                              placeholder="Qty Required"
                              variant="borderless"
                              onFocus={(e) => e.target.select()}
                              onChange={(e) => {
                                const value = e.target.value.replace(
                                  /[^0-9.]/g,
                                  ""
                                );
                                handleQtyChange(value, index);
                              }}
                            />
                          </Form.Item>
                        ),
                        amount: (
                          <Form.Item
                            {...restField}
                            name={[name, "amount"]}
                            fieldKey={[fieldKey, "amount"]}
                            style={{ margin: 0 }}
                          >
                            <Input
                              placeholder="Amount"
                              variant="borderless"
                              onFocus={(e) => e.target.select()}
                              onChange={(e) => {
                                const value = e.target.value.replace(
                                  /[^0-9.]/g,
                                  ""
                                );
                                handleAmountChange(value, index);
                              }}
                            />
                          </Form.Item>
                        ),
                        action: (
                          <MinusCircleOutlined
                            onClick={() => {
                              remove(name);
                              setTimeout(() => calculateTotal(), 100);
                            }}
                          />
                        ),
                      };
                    }
                  )}
                  columns={columns(remove)}
                  pagination={false}
                  size="small"
                  footer={() => (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        padding: "8px 0",
                        borderTop: "2px solid #f0f0f0",
                      }}
                    >
                      <Text strong style={{ fontSize: "16px" }}>
                        Total Amount: {calculateTotal()}
                      </Text>
                    </div>
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

  const NonStock = () => {
    const [totalAmount, setTotalAmount] = useState(0);

    const handleSelectChange = (value, index) => {
      const selectedProduct = ListOfProducts.find(
        (item) => item.name === value
      );
      //////Console.log(selectedProduct);
      if (selectedProduct) {
        const fields = nonStockForm.getFieldValue("users");
        const quantity = fields[index].quantity || 0;
        const rate = selectedProduct.salePrice;
        const amount = (quantity * rate).toFixed(2);
        const discount = (amount * selectedProduct.saleDiscount) / 100;
        const saleTax = (selectedProduct.gstRate * amount) / 100;
        const net = (amount - discount + saleTax).toFixed(2);

        nonStockForm.setFieldsValue({
          users: fields.map((field, i) =>
            i === index
              ? {
                  ...field,
                  details: `${selectedProduct.name} ${selectedProduct.saleInformation}`,
                  productID: selectedProduct.id,
                  productCode: selectedProduct.code,
                  rate: selectedProduct.salePrice || 0,
                }
              : field
          ),
        });

        // Recalculate total after product selection
        setTimeout(() => calculateTotal(), 100);
      } else {
        //console.error("Selected product not found in ListOfProducts:", value);
      }
    };

    const calculateTotal = () => {
      const fields = nonStockForm.getFieldValue("users") || [];
      const total = fields.reduce((sum, field) => {
        const amount = parseFloat(field?.amount) || 0;
        return sum + amount;
      }, 0);
      setTotalAmount(total.toFixed(2));
      return total.toFixed(2);
    };

    const columns = (remove) => [
      { title: "Sr No", dataIndex: "srNo", key: "srNo", width: 25 },
      {
        title: "Product",
        dataIndex: "productName",
        key: "productName",
        width: 250,
      },

      { title: "Rate", dataIndex: "rate", key: "rate", width: 200 },
      {
        title: "Qty Required",
        dataIndex: "qtyRequired",
        key: "qtyRequired",
        width: 200,
      },
      {
        title: "Amount",
        dataIndex: "amount",
        key: "amount",
        width: 200,
      },
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

    const calculateAmount = (nonStockForm, name) => {
      const rate = nonStockForm.getFieldValue(["users", name, "rate"]);
      const qtyRequired = nonStockForm.getFieldValue([
        "users",
        name,
        "qtyRequired",
      ]);
      const amount = parseFloat(rate || 0) * parseFloat(qtyRequired || 0);
      nonStockForm.setFields([
        {
          name: ["users", name, "amount"],
          value: isNaN(amount) ? 0 : amount,
        },
      ]);

      // Recalculate total after amount calculation
      setTimeout(() => calculateTotal(), 100);
    };

    const handleRateChange = (e, nonStockForm, name) => {
      const value = e.target.value;
      nonStockForm.setFields([
        {
          name: ["users", name, "rate"],
          value: value,
        },
      ]);
      calculateAmount(nonStockForm, name);
    };

    const handleQtyChange = (e, nonStockForm, name) => {
      const value = e.target.value;
      nonStockForm.setFields([
        {
          name: ["users", name, "qtyRequired"],
          value: value,
        },
      ]);
      calculateAmount(nonStockForm, name);
    };

    const handleAmountChange = (e, nonStockForm, name) => {
      const value = e.target.value;
      nonStockForm.setFields([
        {
          name: ["users", name, "amount"],
          value: value,
        },
      ]);

      // Recalculate total after manual amount change
      setTimeout(() => calculateTotal(), 100);
    };

    return (
      <>
        <Form
          form={nonStockForm}
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
                              option.value
                                .toLowerCase()
                                .includes(input.toLowerCase())
                            }
                            onChange={(value) => {
                              handleSelectChange(value, index);
                            }}
                            placeholder="Product"
                            variant="borderless"
                            loading={productLoading}
                            options={ListOfProducts.filter(
                              (record) => record.productType === "NonStock"
                            ).map((record) => ({
                              label: <>{record.name}</>,
                              value: record.name,
                            }))}
                            dropdownRender={(menu) => (
                              <>
                                {menu}
                                <Space
                                  style={{
                                    padding: "0 8px 4px",
                                    display: "flex",
                                    justifyContent: "space-between",
                                  }}
                                ></Space>
                              </>
                            )}
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
                            type="Number"
                            variant="borderless"
                            onFocus={(e) => e.target.select()}
                            onChange={(e) =>
                              handleRateChange(e, nonStockForm, name)
                            }
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
                            placeholder="Amount"
                            type="Number"
                            variant="borderless"
                            onFocus={(e) => e.target.select()}
                            onChange={(e) =>
                              handleAmountChange(e, nonStockForm, name)
                            }
                          />
                        </Form.Item>
                      ),
                      qtyRequired: (
                        <Form.Item
                          {...restField}
                          name={[name, "qtyRequired"]}
                          fieldKey={[fieldKey, "qtyRequired"]}
                        >
                          <Input
                            placeholder="Qty Required"
                            type="Number"
                            variant="borderless"
                            onFocus={(e) => e.target.select()}
                            onChange={(e) =>
                              handleQtyChange(e, nonStockForm, name)
                            }
                          />
                        </Form.Item>
                      ),
                      action: (
                        <MinusCircleOutlined
                          onClick={() => {
                            remove(name);
                            setTimeout(() => calculateTotal(), 100);
                          }}
                        />
                      ),
                    })
                  )}
                  columns={columns(remove)}
                  pagination={false}
                  size="small"
                  footer={() => (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        padding: "8px 0",
                        borderTop: "2px solid #f0f0f0",
                      }}
                    >
                      <Text strong style={{ fontSize: "16px" }}>
                        Total Amount: {calculateTotal()}
                      </Text>
                    </div>
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
    const handleSelectChange = (value, index) => {
      const selectedAccount = ListOfRecords.find(
        (item) => item.accountDescription === value
      );
      //////Console.log(selectedAccount);
      if (selectedAccount) {
        const fields = ExpenseForm.getFieldValue("users");
        const quantity = fields[index].quantity || 0;
        const rate = selectedAccount.salePrice;
        const amount = (quantity * rate).toFixed(2);
        const discount = (amount * selectedAccount.saleDiscount) / 100;
        const saleTax = (selectedAccount.gstRate * amount) / 100;
        const net = (amount - discount + saleTax).toFixed(2);

        ExpenseForm.setFieldsValue({
          users: fields.map((field, i) =>
            i === index
              ? {
                  ...field,
                  details: `${selectedAccount.accountDescription} (${selectedAccount.accountCode})`,
                  expenseAccountID: selectedAccount.id,
                }
              : field
          ),
        });
        //////Console.log(selectedAccount.accountCode);
        //debouncedHandleFormChange();
      } else {
        //console.error("Selected Account not found in ListOfRecords:", value);
      }
    };

    const calculateAmount = (ExpenseForm, name) => {
      const rate = ExpenseForm.getFieldValue(["users", name, "rate"]);
      const qtyRequired = ExpenseForm.getFieldValue([
        "users",
        name,
        "qtyRequired",
      ]);
      const amount = parseFloat(rate || 0) * parseFloat(qtyRequired || 0);
      ExpenseForm.setFields([
        {
          name: ["users", name, "amount"],
          value: isNaN(amount) ? 0 : amount,
        },
      ]);
    };

    const handleRateChange = (e, ExpenseForm, name) => {
      const value = e.target.value;
      ExpenseForm.setFields([
        {
          name: ["users", name, "rate"],
          value: value,
        },
      ]);
      calculateAmount(ExpenseForm, name);
    };

    const handleQtyChange = (e, ExpenseForm, name) => {
      const value = e.target.value;
      ExpenseForm.setFields([
        {
          name: ["users", name, "qtyRequired"],
          value: value,
        },
      ]);
      calculateAmount(ExpenseForm, name);
    };

    // Function to calculate total amount
    const calculateTotalAmount = () => {
      const users = ExpenseForm.getFieldValue("users") || [];
      const total = users.reduce((sum, user) => {
        const amount = parseFloat(user?.amount || 0);
        return sum + amount;
      }, 0);
      return total.toFixed(2);
    };

    const columns = (remove) => [
      {
        title: "Expenses",
        dataIndex: "expenseAccount",
        key: "expenseAccount",
        width: 300,
      },
      {
        title: "Details",
        dataIndex: "details",
        key: "details",
        width: 300,
      },
      { title: "Rate", dataIndex: "rate", key: "rate", width: 200 },
      {
        title: "Qty Required",
        dataIndex: "qtyRequired",
        key: "qtyRequired",
        width: 200,
      },
      { title: "Amount", dataIndex: "amount", key: "amount", width: 200 },
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

    return (
      <>
        <Form
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
                      expenseAccount: (
                        <Form.Item
                          {...restField}
                          name={[name, "expenseAccount"]}
                          fieldKey={[fieldKey, "expenseAccount"]}
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
                            onChange={(value) => {
                              handleSelectChange(value, index);
                            }}
                            style={{ width: 300 }}
                            options={ListOfRecords.map((fieldThreeitem) => ({
                              label: `${fieldThreeitem.accountDescription} (${fieldThreeitem.accountCode})`,
                              value: `${fieldThreeitem.accountDescription}`,
                            }))}
                          ></Select>
                        </Form.Item>
                      ),
                      details: (
                        <Form.Item
                          {...restField}
                          name={[name, "details"]}
                          fieldKey={[fieldKey, "details"]}
                        >
                          <Input
                            placeholder="Details"
                            variant="borderless"
                            onFocus={(e) => e.target.select()}
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
                            placeholder="Amount"
                            type="Number"
                            variant="borderless"
                            onFocus={(e) => e.target.select()}
                          />
                        </Form.Item>
                      ),
                      qtyRequired: (
                        <Form.Item
                          {...restField}
                          name={[name, "qtyRequired"]}
                          fieldKey={[fieldKey, "qtyRequired"]}
                        >
                          <Input
                            placeholder="Qty Required"
                            type="Number"
                            variant="borderless"
                            onFocus={(e) => e.target.select()}
                            onChange={(e) =>
                              handleQtyChange(e, ExpenseForm, name)
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
                            type="Number"
                            variant="borderless"
                            onFocus={(e) => e.target.select()}
                            onChange={(e) =>
                              handleRateChange(e, ExpenseForm, name)
                            }
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
                  footer={() => (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        padding: "8px 0",
                        borderTop: "2px solid #f0f0f0",
                      }}
                    >
                      <Text strong style={{ fontSize: "16px" }}>
                        Total Amount: {calculateTotalAmount()}
                      </Text>
                    </div>
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
      <AddProductModal
        show={productOpen}
        handleOk={handleProductOk}
        handleCancel={handleProductCancel}
        loading={CustomerLoading}
        ProductID={ProductID}
      />
      <div id="sub-menu-wrap">
        <h5>Assembly</h5>
        <AssemblyMenu />
      </div>
      <div className="right-side-contents">
        <div className="page-content mb-5">
          <div className="page-header">
            <SubMenuToggle />
            <h3 className="page-title">
              <NavLink to="/product-recipes/manage">
                <ArrowLeftIcon />
              </NavLink>
              Edit Product Recipe
            </h3>
          </div>
          {!loading ? (
            <>
              <Space direction="vertical" style={{ width: "100%" }}>
                {/* <Collapse
                  collapsible="header"
                  defaultActiveKey={["Details"]}
                  items={[
                    {
                      key: "Details",
                      label: "Details",
                      children: <Details />,
                    },
                  ]}
                /> */}
                <Collapse
                  collapsible="header"
                  defaultActiveKey={["Finished Goods"]}
                  items={[
                    {
                      key: "Finished Goods",
                      label: "Finished Goods",
                      children: <FinishedGoods />,
                    },
                  ]}
                />

                <Collapse
                  collapsible="header"
                  defaultActiveKey={["Raw Material"]}
                  items={[
                    {
                      key: "Raw Material",
                      label: "Raw Material",
                      children: <RawMaterial />,
                    },
                  ]}
                />
                <Collapse
                  collapsible="header"
                  defaultActiveKey={["Non Stock"]}
                  items={[
                    {
                      key: "Non Stock",
                      label: "Non Stock",
                      children: <NonStock />,
                    },
                  ]}
                />
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
                <Form
                  layout="vertical"
                  form={DetailsForm}
                  onFinish={handleSubmit}
                >
                  <Row gutter={[24, 0]}>
                    <Col xs={24} md={12}>
                      <Form.Item name="notes" label="Notes">
                        <Input.TextArea rows={5} />
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              </Space>
              <Form
                layout="vertical"
                className="my-5"
                form={DetailsForm}
                onFinish={handleSubmit}
              >
                <Row justify="end" className="text-end">
                  <Col xs={24} md={{ span: 4, offset: 20 }}>
                    <Button type="primary" htmlType="submit" loading={loading}>
                      Save and Close
                    </Button>
                  </Col>
                </Row>
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

export default EditTemplate;
