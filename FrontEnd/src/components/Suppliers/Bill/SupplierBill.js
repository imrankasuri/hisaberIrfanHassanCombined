import React, { useState, useRef } from "react";
import { DeleteOutlined, DownOutlined, PlusOutlined } from "@ant-design/icons";
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
} from "antd";
import dayjs from "dayjs";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { calculateColumnTotal } from "../../Shared/Utility";
import Config from "../../../Config";
import SubMenuToggle from "../../Common/SubMenuToggle";
import axios from "axios";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import AddSupplierModal from "../../Common/AddSupplierModal";

const SupplierBill = () => {
  const AccessKey = localStorage.getItem("AccessKey");
  const UserID = localStorage.getItem("ID");
  const CompanyID = localStorage.getItem("CompanyID");
  const FYear = localStorage.getItem("DefaultFYear");

  const [ReceiptDate, setReceiptDate] = useState(null);
  const [loadingBank, setLoadingBank] = useState(false);
  const [loadingMode, setloadingMode] = useState(false);

  const [loadingProduct, setloadingProduct] = useState(false);
  const [ProductList, setProductList] = useState([]);

  const [Productform] = Form.useForm();
  const [Expensesform] = Form.useForm();

  // voucher
  const [ExpenseList, setExpenseList] = useState([]);

  const [loadingAccounts, setLoadingAccounts] = useState(false);

  // account
  const [AccountsDropdown, setAccountsDropdown] = useState([]);

  const [loading, setLoading] = useState(false);
  const [SupplierLoading, setSupplierLoading] = useState(false);
  const [SupplierID, setSupplierID] = useState("");
  const [open, setOpen] = useState(false);

  const navigator = useNavigate();
  const [form] = Form.useForm();
  const [formMain] = Form.useForm();
  const [OpenDate, setOpenDate] = useState(null);

  const onFinish = (value) => {
    setLoading(true);
    const data = {
      AccessKey: AccessKey,
      UserID: UserID,
      FYear: FYear,
      CompanyID: CompanyID,
      AccountCode: "",
      ...value,
      ProductList,
      ExpenseList,
    };
  };
  const [FieldOneItems, setFieldOneItems] = useState([]);

  const handleOk = (FormData) => {
    setLoading(true);
    setOpen(false);
    setLoading(false);
  };
  const handleCancel = () => {
    setOpen(false);
  };

  const SupplierDetail = () => {
    return (
      <>
        <Form layout="vertical" form={formMain} onFinish={onFinish}>
          <Row gutter={[24, 0]}>
            <Col xs={24} md={10}>
              <Form.Item name="Supplie" label="Supplier" required>
                <Select
                  style={{
                    width: "100%",
                  }}
                  placeholder="Select Supplie"
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
                        {/* <Input
                                                        placeholder="Enter Name"
                                                        ref={FieldOneRef}
                                                        value={FieldOneName}
                                                        onChange={onFieldOneNameChange}
                                                        onKeyDown={(e) => e.stopPropagation()}
                                                    /> */}
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
                  options={FieldOneItems.map((fieldoneitem) => ({
                    label: fieldoneitem,
                    value: fieldoneitem,
                  }))}
                />
              </Form.Item>
              <Form.Item name="Address" label="Address">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={14}>
              <Row gutter={[24, 0]}>
                <Col xs={24} md={12}>
                  <Form.Item name="Bill No." label="Bill No.">
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="Days" label="Days" required>
                    <DatePicker
                      defaultValue={
                        OpenDate == null
                          ? dayjs()
                          : dayjs(OpenDate, "YYYY-MM-DD")
                      }
                      style={{ width: "100%" }}
                      onChange={(value) => setOpenDate(value)}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="Term Days" label="Term Days">
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="Due" label="Due">
                    <DatePicker
                      defaultValue={
                        OpenDate == null
                          ? dayjs()
                          : dayjs(OpenDate, "YYYY-MM-DD")
                      }
                      style={{ width: "100%" }}
                      onChange={(value) => setOpenDate(value)}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>
        </Form>
      </>
    );
  };
  const ExpensesDetail = () => {
    return (
      <>
        <Form onFinish={handleAddExpenseItem} form={Expensesform}>
          <div className="ant-table-custom table-compact">
            <table>
              <thead>
                <tr>
                  <th scope="col">Expense</th>
                  <th scope="col">Description</th>
                  <th scope="col">Amount</th>
                  <th scope="col">Disc %</th>
                  <th scope="col">Discount</th>
                  <th scope="col">Tax Rate</th>
                  <th scope="col">Sale Tax</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ExpenseList.map((item, index) => (
                  <tr key={index}>
                    <td>{item.Expense}</td>
                    <td>{item.Description}</td>
                    <td>{item.Amount}</td>
                    <td>{item.Disc}</td>
                    <td>{item.Discount}</td>
                    <td>{item.Tax_Rate}</td>
                    <td>{item.Sale_Tax}</td>
                    <td>
                      <ul className="inline-action">
                        <li>
                          <Link
                            to={`#/`}
                            onClick={() => handleDeleteExpense(index)}
                            className="red"
                          >
                            <DeleteOutlined />
                          </Link>
                        </li>
                      </ul>
                    </td>
                  </tr>
                ))}

                <tr className="table-form">
                  <td>
                    <Form.Item name="Expense" rules={[{ required: false }]}>
                      <Select
                        showSearch
                        filterOption={(input, option) =>
                          option.label
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                        placeholder="Expense"
                        variant="borderless"
                        style={{
                          width: 250,
                        }}
                        loading={loadingAccounts}
                        options={AccountsDropdown}
                      />
                    </Form.Item>
                  </td>
                  <td>
                    <Form.Item name="Description">
                      <Input placeholder="Description" variant="borderless" />
                    </Form.Item>
                  </td>
                  <td>
                    <Form.Item name="Amount">
                      <Input placeholder="Amount" variant="borderless" />
                    </Form.Item>
                  </td>
                  <td>
                    <Form.Item name="Disc">
                      <Input placeholder="Disc %" variant="borderless" />
                    </Form.Item>
                  </td>
                  <td>
                    <Form.Item name="Discount">
                      <Input placeholder="Discount" variant="borderless" />
                    </Form.Item>
                  </td>
                  <td>
                    <Form.Item name="Tax_Rate">
                      <Input placeholder="Tax Rate" variant="borderless" />
                    </Form.Item>
                  </td>
                  <td>
                    <Form.Item name="Sale_Tax">
                      <Input placeholder="Sale Tax" variant="borderless" />
                    </Form.Item>
                  </td>
                  <td>
                    <Button
                      icon={<PlusCircleIcon />}
                      htmlType="submit"
                    ></Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Form>
      </>
    );
  };
  const ProductDetail = () => {
    return (
      <>
        <Form
          name="product_form"
          layout="horizontal"
          onFinish={handleAddProduct}
          form={Productform}
        >
          <div className="ant-table-custom table-compact">
            <table>
              <thead>
                <tr>
                  <th scope="col">Product / Services</th>
                  <th scope="col">Description</th>
                  <th scope="col">Unit</th>
                  <th scope="col">Qty</th>
                  <th scope="col">Rate</th>
                  <th scope="col">Amount</th>
                  <th scope="col">Disc %</th>
                  <th scope="col">Discount</th>
                  <th scope="col">Tax Rate</th>
                  <th scope="col">Sale Tax</th>
                  <th scope="col">Net</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {ProductList.map((item, index) => (
                  <tr key={index}>
                    <td>{item.Product}</td>
                    <td>{item.Description}</td>
                    <td>{item.Unit}</td>
                    <td>{item.Qty}</td>
                    <td>{item.Rate}</td>
                    <td>{item.Amount}</td>
                    <td>{item.Disc}</td>
                    <td>{item.Discount}</td>
                    <td>{item.Tax_Rate}</td>
                    <td>{item.Sale_Tax}</td>
                    <td>{item.Net}</td>
                    <td>
                      <ul className="inline-action">
                        <li>
                          <Link
                            to={`#/`}
                            onClick={() => handleDeleteProducts(index)}
                            className="red"
                          >
                            <DeleteOutlined />
                          </Link>
                        </li>
                      </ul>
                    </td>
                  </tr>
                ))}
                <tr className="table-form">
                  <td>
                    <Form.Item name="Product" rules={[{ required: false }]}>
                      <Select
                        showSearch
                        filterOption={(input, option) =>
                          option.label
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                        placeholder="Product / Services"
                        variant="borderless"
                        style={{ width: "100%" }}
                        loading={loadingProduct}
                        options={[
                          { value: "jack", label: "Jack" },
                          { value: "lucy", label: "Lucy" },
                          { value: "tom", label: "Tom" },
                        ]}
                      />
                    </Form.Item>
                  </td>
                  <td>
                    <Form.Item name="Description">
                      <Input placeholder="Description" variant="borderless" />
                    </Form.Item>
                  </td>
                  <td>
                    <Form.Item name="Unit">
                      <Input placeholder="Unit" variant="borderless" />
                    </Form.Item>
                  </td>
                  <td>
                    <Form.Item name="Qty">
                      <Input placeholder="Qty" variant="borderless" />
                    </Form.Item>
                  </td>
                  <td>
                    <Form.Item name="Rate">
                      <Input placeholder="Rate" variant="borderless" />
                    </Form.Item>
                  </td>
                  <td>
                    <Form.Item name="Amount">
                      <Input placeholder="Amount" variant="borderless" />
                    </Form.Item>
                  </td>
                  <td>
                    <Form.Item name="Disc">
                      <Input placeholder="Disc %" variant="borderless" />
                    </Form.Item>
                  </td>
                  <td>
                    <Form.Item name="Discount">
                      <Input placeholder="Discount" variant="borderless" />
                    </Form.Item>
                  </td>
                  <td>
                    <Form.Item name="Tax_Rate">
                      <Input placeholder="Tax Rate" variant="borderless" />
                    </Form.Item>
                  </td>
                  <td>
                    <Form.Item name="Sale_Tax">
                      <Input placeholder="Sale Tax" variant="borderless" />
                    </Form.Item>
                  </td>
                  <td>
                    <Form.Item name="Net">
                      <Input placeholder="Net" variant="borderless" />
                    </Form.Item>
                  </td>
                  <td>
                    <Button
                      icon={<PlusCircleIcon />}
                      htmlType="submit"
                    ></Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Form>
      </>
    );
  };
  const AddPayment = () => {
    return (
      <>
        <Form layout="vertical" form={formMain} onFinish={onFinish}>
          <Form.Item name="AddPayment">
            <div className="ant-table-custom table-compact">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Date</th>
                    <th scope="col">Bank</th>
                    <th scope="col">Mode</th>
                    <th scope="col">Ref. No.</th>
                    <th scope="col">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="table-form">
                    <td style={{ borderBottom: "transparent" }}>
                      <DatePicker
                        defaultValue={
                          ReceiptDate == null
                            ? dayjs()
                            : dayjs(ReceiptDate, "YYYY-MM-DD")
                        }
                        style={{ width: "100%" }}
                        onChange={(value) => setReceiptDate(value)}
                      />
                    </td>
                    <td style={{ borderBottom: "transparent" }}>
                      <Form.Item name="Bank" rules={[{ required: false }]}>
                        <Select
                          showSearch
                          filterOption={(input, option) =>
                            option.label
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                          placeholder="Bank"
                          variant="borderless"
                          style={{ width: "100%" }}
                          loading={loadingBank}
                          options={[
                            { value: "jack", label: "Jack" },
                            { value: "lucy", label: "Lucy" },
                            { value: "tom", label: "Tom" },
                          ]}
                        />
                      </Form.Item>
                    </td>
                    <td style={{ borderBottom: "transparent" }}>
                      <Form.Item name="Mode" rules={[{ required: false }]}>
                        <Select
                          showSearch
                          filterOption={(input, option) =>
                            option.label
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                          placeholder="Mode"
                          variant="borderless"
                          style={{ width: "100%" }}
                          loading={loadingMode}
                          options={[
                            { value: "jack", label: "Jack" },
                            { value: "lucy", label: "Lucy" },
                            { value: "tom", label: "Tom" },
                          ]}
                        />
                      </Form.Item>
                    </td>
                    <td style={{ borderBottom: "transparent" }}>
                      <Form.Item name="RefNo">
                        <Input placeholder="Ref. No." variant="borderless" />
                      </Form.Item>
                    </td>
                    <td style={{ borderBottom: "transparent" }}>
                      <Form.Item name="Amount">
                        <Input placeholder="Amount" variant="borderless" />
                      </Form.Item>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Form.Item>
        </Form>
      </>
    );
  };

  const handleAddProduct = (formData) => {
    const newItem = {
      Seq: ProductList.length,
      ...formData,
    };
    setProductList([...ProductList, newItem]);
    Productform.resetFields();
  };

  const handleDeleteProducts = (index) => {
    const updatedFormData = [...ProductList];
    updatedFormData.splice(index, 1);
    setProductList(updatedFormData);
  };

  const handleAddExpenseItem = (formData) => {
    const newItem = {
      Seq: ExpenseList.length,
      ...formData,
    };
    setExpenseList([...ExpenseList, newItem]);
    Expensesform.resetFields();
  };

  const handleDeleteExpense = (index) => {
    const updatedFormData = [...ExpenseList];
    updatedFormData.splice(index, 1);
    setExpenseList(updatedFormData);
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
  ];
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
        <h5>Bill</h5>
      </div>
      <div className="right-side-contents">
        <div className="page-content">
          <div className="page-header">
            <SubMenuToggle />
            <h3 className="page-title">
              <NavLink to="/vouchers/">
                <ArrowLeftIcon />
              </NavLink>
              Add Supplier Bill
            </h3>
          </div>

          <Space direction="vertical" style={{ width: "100%" }}>
            <Collapse
              collapsible="header"
              defaultActiveKey={["Supplier Detail"]}
              items={[
                {
                  key: "Supplier Detail",
                  label: "Supplier Detail",
                  children: <SupplierDetail />,
                },
              ]}
            />
            <Collapse
              collapsible="header"
              defaultActiveKey={["Expenses Detail"]}
              items={[
                {
                  key: "Expenses Detail",
                  label: "Expenses Detail",
                  children: <ExpensesDetail />,
                },
              ]}
            />
            <Collapse
              collapsible="header"
              defaultActiveKey={["ProductDetail"]}
              items={[
                {
                  key: "ProductDetail",
                  label: "Product Detail",
                  children: <ProductDetail />,
                },
              ]}
            />
            <Form layout="vertical" form={formMain} onFinish={onFinish}>
              <Row gutter={[24, 0]}>
                <Col xs={24} md={12}>
                  <Form.Item name="Notes" label="Notes">
                    <Input.TextArea rows={5} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Row gutter={[24, 0]}>
                    <Col xs={24} md={12}>
                      <Form.Item name="Sub Total" label="Sub Total">
                        <Input disabled readOnly />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="Discount" label="Discount">
                        <Input disabled readOnly />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={24}>
                      <Form.Item name="Sale Tax" label="Sale Tax">
                        <Input disabled readOnly />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={24}>
                      <h4>Total</h4>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Form>
            <Collapse
              collapsible="header"
              defaultActiveKey={["AddPayment"]}
              items={[
                {
                  key: "AddPayment",
                  label: "Add Payment",
                  children: <AddPayment />,
                },
              ]}
            />
          </Space>
          <Form
            layout="vertical"
            form={formMain}
            onFinish={onFinish}
            className="my-5"
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
                  Approve and Close
                </Dropdown.Button>
              </Col>
            </Row>
          </Form>
        </div>
      </div>
    </>
  );
};

export default SupplierBill;
