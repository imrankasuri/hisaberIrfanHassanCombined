import React, { useState } from "react";
import {
  Row,
  Col,
  Form,
  Input,
  Select,
  Button,
  DatePicker,
  Collapse,
  Space,
} from "antd";
import { Link } from "react-router-dom";
import { DeleteOutlined } from "@ant-design/icons";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import dayjs from "dayjs";

const ComponentTestPage = () => {
  const [Productform] = Form.useForm();
  const [MainForm] = Form.useForm();
  const [ProductList, setProductList] = useState([]);

  const handleAddItem = (event, formData) => {
    event.preventDefault();

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

  const [loadingProduct, setloadingProduct] = useState(false);
  const [loadingMode, setloadingMode] = useState(false);
  const [loadingBank, setLoadingBank] = useState(false);
  const [ReceiptDate, setReceiptDate] = useState(null);

  const ProductDetail = () => {
    return (
      <Row>
        <Col xs={24} md={24}>
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
        </Col>
      </Row>
    );
  };

  const AddPayment = () => {
    return (
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
                        option.label.toLowerCase().includes(input.toLowerCase())
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
                        option.label.toLowerCase().includes(input.toLowerCase())
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
    );
  };

  const onFinish = (FormData) => {
    ////Console.log('Form Data:', FormData);
  };

  return (
    <Form form={MainForm} onFinish={onFinish}>
      <Space direction="vertical" style={{ width: "100%" }}>
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
        <Row gutter={[24, 0]}>
          <Col xs={24} md={12}>
            <Form.Item name="Notes" label="Notes">
              <Input.TextArea rows={5} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Row gutter={[24, 0]}>
              <Col xs={24} md={12}>
                <Form.Item name="SubTotal" label="Sub Total">
                  <Input disabled readOnly />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="Discount" label="Discount">
                  <Input disabled readOnly />
                </Form.Item>
              </Col>
              <Col xs={24} md={24}>
                <Form.Item name="SaleTax" label="Sale Tax">
                  <Input disabled readOnly />
                </Form.Item>
              </Col>
              <Col xs={24} md={24}>
                <h4>Total</h4>
              </Col>
            </Row>
          </Col>
        </Row>
        <Collapse
          collapsible="header"
          defaultActiveKey={["Add Receipt"]}
          items={[
            {
              key: "Add Receipt",
              label: "Add Receipt",
              children: <AddPayment />,
            },
          ]}
        />
        <Button htmlType="submit">Save</Button>
      </Space>
    </Form>
  );
};

export default ComponentTestPage;
