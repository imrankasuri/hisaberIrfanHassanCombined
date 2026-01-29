import {
  Form,
  Input,
  Select,
  Table,
  Button,
  Dropdown,
  Space,
  Menu,
  Popconfirm,
  message,
  Pagination,
  Divider,
  Radio,
  DatePicker,
  Steps,
  theme,
  Row,
  Col,
  Switch,
} from "antd";
import React, { useEffect, useRef, useState } from "react";
import {
  PlusOutlined,
  DownloadOutlined,
  UploadOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

import { Link, NavLink } from "react-router-dom";
import SalesMenu from "./../SalesMenu";
import Config from "../../../Config";
import SubMenuToggle from "../../Common/SubMenuToggle";
import axios from "axios";
import dayjs from "dayjs";
import moment from "moment";
import { PlusCircleIcon, QueueListIcon } from "@heroicons/react/24/outline";

function BulkInvoicing() {
  const AccessKey = localStorage.getItem("AccessKey");
  const UserID = localStorage.getItem("ID");
  const CompanyID = localStorage.getItem("CompanyID");
  const FYear = localStorage.getItem("DefaultFYear");

  const [loading, setLoading] = useState(false);
  const [ListOfRecords, setListOfRecords] = useState([]);
  const [OrderBy, setOrderBy] = useState("");
  const [AccountID, setAccountID] = useState("");
  const [AccountCode, setAccountCode] = useState("");
  const [Level, setLevel] = useState("0");

  const [IsDeleted, setIsDeleted] = useState(false);

  // pagination
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [totalRecords, setTotalRecords] = useState(0);

  const [formMain] = Form.useForm();
  const onFinish = (value) => {
    setLoading(true);
    const data = {
      AccessKey: AccessKey,
      UserID: UserID,
      FYear: FYear,
      CompanyID: CompanyID,
      AccountCode: "",
      ...value,
    };
  };

  useEffect(() => {
    document.title = "Bank Payments";

    setLoading(true);

    const data = {
      AccessKey: AccessKey,
      UserID: UserID,
      CompanyID: CompanyID,
      pageNo: pageNo,
      pageSize: pageSize,
    };

    // ////Console.log(data);
    var api_config = {
      method: "post",
      url: Config.base_url + "Customer/GetAllCustomers",
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    axios(api_config)
      .then(function (response) {
        ////Console.log(response.data);

        if (response.data.status_code == 1) {
          setListOfRecords(response.data.ListofRecords);
          setLoading(false);
          setTotalRecords(response.data.totalRecords);
        }
      })
      .catch(function (error) {
        // ////Console.log(error);
      });
  }, [pageNo, pageSize, Level, IsDeleted, AccountID, OrderBy, AccountCode]);

  const [loadingProduct, setloadingProduct] = useState(false);
  const [date, setDate] = useState(null);
  const [Productform] = Form.useForm();
  const [ProductList, setProductList] = useState([]);

  const handleAddItem = (formData) => {
    formData["Date"] = dayjs(formData["Date"]).format("YYYY-MM-DD");

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
  const steps = [
    {
      title: "First",
      content: "First-content",
    },
    {
      title: "Second",
      content: "Second-content",
    },
    {
      title: "Last",
      content: "Last-content",
    },
  ];
  const { token } = theme.useToken();
  const [current, setCurrent] = useState(0);
  const next = () => {
    setCurrent(current + 1);
  };
  const prev = () => {
    setCurrent(current - 1);
  };
  const items = steps.map((item) => ({
    key: item.title,
    title: item.title,
  }));
  const contentStyle = {
    lineHeight: "260px",
    textAlign: "center",
    color: token.colorTextTertiary,
    backgroundColor: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    border: `1px dashed ${token.colorBorder}`,
    marginTop: 16,
  };
  const onChange = (checked) => {
    ////Console.log(`switch to ${checked}`);
  };

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
            <h3 className="page-title">Bulk Invoicing</h3>
          </div>
          <Steps current={current} items={items} />
          <div style={contentStyle}>{steps[current].content}</div>
          <div
            style={{
              marginTop: 24,
            }}
          >
            {current < steps.length - 1 && (
              <Button type="primary" onClick={() => next()}>
                Next
              </Button>
            )}
            {current === steps.length - 1 && (
              <Button
                type="primary"
                onClick={() => message.success("Processing complete!")}
              >
                Done
              </Button>
            )}
            {current > 0 && (
              <Button
                style={{
                  margin: "0 8px",
                }}
                onClick={() => prev()}
              >
                Previous
              </Button>
            )}
          </div>
          <h3 className="page-title">Select Customer</h3>
          <Form layout="vertical" form={formMain} onFinish={onFinish}>
            <Row gutter={[24, 0]}>
              <Col xs={24} md={12}>
                <Form.Item name="Customer Name" label="Customer Name">
                  <Select
                    placeholder="Type"
                    showSearch
                    style={{ width: 200 }}
                    // onChange={handleChange}
                    options={[
                      {
                        value: "All",
                        label: "All",
                      },
                      {
                        value: "Invoice",
                        label: "Invoice",
                      },
                      {
                        value: "Credit",
                        label: "Credit",
                      },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Row gutter={[24, 0]}>
                  <Col xs={24} md={12}>
                    <Form.Item name="Mobile" label="Mobile">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="Fields" label="Fields">
                      <Switch defaultChecked onChange={onChange} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={24}>
                    <Form.Item name="Field 1" label="Field 1">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={24}>
                    <h4>Total</h4>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Form>
          <Form
            name="product_form"
            layout="horizontal"
            onFinish={handleAddItem}
            form={Productform}
          >
            <div className="ant-table-custom table-compact">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Date</th>
                    <th scope="col">Customer</th>
                    <th scope="col">Doc. #</th>
                    <th scope="col">Product Name</th>
                    <th scope="col">Unit</th>
                    <th scope="col">Qty</th>
                    <th scope="col">Rate</th>
                    <th scope="col">Subtotal</th>
                    <th scope="col">Tax Rate</th>
                    <th scope="col">Sale Tax</th>
                    <th scope="col">Total</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {ProductList.map((item, index) => (
                    <tr key={index}>
                      <td>{item.Date}</td>
                      <td>{item.Customer}</td>
                      <td>{item.Doc}</td>
                      <td>{item.ProductName}</td>
                      <td>{item.Unit}</td>
                      <td>{item.Qty}</td>
                      <td>{item.Rate}</td>
                      <td>{item.Subtotal}</td>
                      <td>{item.Tax_Rate}</td>
                      <td>{item.Sale_Tax}</td>
                      <td>{item.Total}</td>
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
                      <Form.Item name="Date" rules={[{ required: false }]}>
                        <DatePicker
                          defaultValue={
                            date == null ? dayjs() : dayjs(date, "YYYY-MM-DD")
                          }
                          style={{ width: "150px" }}
                          onChange={(value) => setDate(value)}
                        />
                      </Form.Item>
                    </td>
                    <td>
                      <Form.Item name="Customer">
                        <Input placeholder="Customer" variant="borderless" />
                      </Form.Item>
                    </td>
                    <td>
                      <Form.Item name="Doc">
                        <Input placeholder="Doc. #" variant="borderless" />
                      </Form.Item>
                    </td>
                    <td>
                      <Form.Item name="ProductName">
                        <Input
                          placeholder="Product Name"
                          variant="borderless"
                        />
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
                      <Form.Item name="Subtotal">
                        <Input placeholder="Subtotal" variant="borderless" />
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
                      <Form.Item name="Total">
                        <Input placeholder="Total" variant="borderless" />
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
        </div>
      </div>
    </>
  );
}

export default BulkInvoicing;
