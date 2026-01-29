import React, { useRef, useState, useEffect } from "react";
import {
  Button,
  Checkbox,
  Col,
  DatePicker,
  Form,
  Input,
  Modal,
  Row,
  Tabs,
  Select,
  Divider,
  Space,
  message,
  Skeleton,
} from "antd";
import FieldsDropdown from "./FieldsDropdown";
import Config from "../../Config";
import SubMenuToggle from "../Common/SubMenuToggle";
import axios from "axios";
import moment from "moment";
import dayjs from "dayjs";

const AddCustomerModal = (props) => {
  const AccessKey = localStorage.getItem("AccessKey");
  const UserID = localStorage.getItem("ID");
  const CompanyID = localStorage.getItem("CompanyID");
  const FYear = localStorage.getItem("DefaultFYear");
  const [loading, setLoading] = useState(false);
  const [CustomerData, setCustomerData] = useState("");
  const [OpenDate, setOpenDate] = useState("");
  const [CustomerLoading, setCustomerLoading] = useState(false);

  const [formMain] = Form.useForm();

  const [Customer, setCustomer] = useState(false);
  const [Filer, setFiler] = useState(false);

  useEffect(() => {
    if (props && props.CustomerID) {
      setCustomerLoading(true);
      const data = {
        AccessKey: AccessKey,
        UserID: UserID,
        ID: props.CustomerID,
      };

      var api_config = {
        method: "post",
        url: Config.base_url + "Customer/GetCustomerByID",
        headers: {
          "Content-Type": "application/json",
        },
        data: data,
      };

      axios(api_config)
        .then(function (response) {
          if (response.data.status_code == 1) {
            setCustomerData(response.data.Customer);
            setCustomerLoading(false);

            formMain.setFieldsValue(response.data.Customer);

            let date = response.data.Customer?.OpeningDate;

            setOpenDate(dayjs(date).format("YYYY-MM-DD"));
          } else {
            // message.error(response.data.status_message);
          }
        })
        .catch(function (error) {
          // ////Console.log(error);
        });
    }
  }, [props && props.CustomerID]);

  const handleDateChange = (e, value) => {
    setOpenDate(value);
  };
  const Address = () => {
    return (
      <>
        <Row gutter={[24, 0]}>
          <Col xs={24} md={24}>
            <Form.Item name="BillingAddress" label="Billing Address">
              <Input
                onFocus={(e) => e.target.select()}
                placeholder="Billing Address"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item name="City">
              <Input onFocus={(e) => e.target.select()} placeholder="City" />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item name="Province">
              <Input
                onFocus={(e) => e.target.select()}
                placeholder="Province"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item name="PostalCode">
              <Input
                onFocus={(e) => e.target.select()}
                placeholder="Postal Code"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item name="Country">
              <Input onFocus={(e) => e.target.select()} placeholder="Country" />
            </Form.Item>
          </Col>
        </Row>
      </>
    );
  };
  const TaxInfo = () => {
    return (
      <>
        <Row gutter={[24, 0]} align="bottom">
          <Col xs={24} md={8}>
            <Form.Item name="NTNNumber" label="Tax Info">
              <Input onFocus={(e) => e.target.select()} placeholder="NTN" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="SalesTaxNumber">
              <Input onFocus={(e) => e.target.select()} placeholder="STN" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="CNIC">
              <Input
                onFocus={(e) => e.target.select()}
                placeholder="CNIC"
                min={13}
                max={13}
              />
            </Form.Item>
          </Col>
        </Row>
      </>
    );
  };
  const Terms = () => {
    return (
      <>
        <Row gutter={[24, 0]} align="bottom">
          <Col xs={24} md={6}>
            <Form.Item name="PaymentTermDays" label="Terms">
              <Input
                onFocus={(e) => e.target.select()}
                placeholder="Payments Term days"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item name="CreditLimit">
              <Input
                onFocus={(e) => e.target.select()}
                placeholder="Credit Limit"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item>
              <DatePicker
                defaultValue={dayjs(OpenDate, "YYYY-MM-DD")}
                style={{ width: "100%" }}
                onChange={handleDateChange}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item name="OpeningBalance">
              <Input
                onFocus={(e) => e.target.select()}
                placeholder="Opening Balance"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item name="Discount">
              <Input
                onFocus={(e) => e.target.select()}
                placeholder="Discount"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item>
              <Checkbox
                checked={Customer}
                onChange={(e) => setCustomer(!Customer)}
              >
                Supplier
              </Checkbox>
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item>
              <Checkbox checked={Filer} onChange={(e) => setFiler(!Filer)}>
                Filer
              </Checkbox>
            </Form.Item>
          </Col>
        </Row>
      </>
    );
  };
  const Bank = () => {
    return (
      <>
        <Row gutter={[24, 0]}>
          <Col xs={24} md={6}>
            <Form.Item name="">
              <Input
                onFocus={(e) => e.target.select()}
                placeholder="Bank Name"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item name="">
              <Input
                onFocus={(e) => e.target.select()}
                placeholder="Account Name"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item name="">
              <Input
                onFocus={(e) => e.target.select()}
                placeholder="Account Number"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item name="">
              <Input onFocus={(e) => e.target.select()} placeholder="IBAN" />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item name="">
              <Input
                onFocus={(e) => e.target.select()}
                placeholder="Swift Code"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item name="">
              <Input onFocus={(e) => e.target.select()} placeholder="Address" />
            </Form.Item>
          </Col>
        </Row>
      </>
    );
  };
  const Notes = () => {
    return (
      <>
        <Row gutter={[24, 0]}>
          <Col xs={24} md={24}>
            <Form.Item name="Notes" label="Notes">
              <Input.TextArea
                onFocus={(e) => e.target.select()}
                placeholder="Notes"
                rows={6}
              />
            </Form.Item>
          </Col>
        </Row>
      </>
    );
  };

  const Fields = () => {
    return (
      <>
        <Row gutter={[24, 0]} align="bottom">
          <Col xs={24} md={12}>
            <FieldsDropdown />
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="FieldA">
              <Input onFocus={(e) => e.target.select()} placeholder="Field A" />
            </Form.Item>
            <Form.Item name="FieldB">
              <Input onFocus={(e) => e.target.select()} placeholder="Field B" />
            </Form.Item>
            <Form.Item name="FieldC">
              <Input onFocus={(e) => e.target.select()} placeholder="Field C" />
            </Form.Item>
            <Form.Item name="FieldD">
              <Input onFocus={(e) => e.target.select()} placeholder="Field D" />
            </Form.Item>
          </Col>
        </Row>
      </>
    );
  };

  const tabitems = [
    {
      key: "Address",
      label: "Address",
      children: <Address />,
    },
    {
      key: "Tax Info",
      label: "Tax Info",
      children: <TaxInfo />,
    },
    {
      key: "Terms",
      label: "Terms",
      children: <Terms />,
    },
    {
      key: "Notes",
      label: "Notes",
      children: <Notes />,
    },
    {
      key: "Additional Fields",
      label: "Additional Fields",
      children: <Fields />,
    },
  ];

  const onFinish = (value) => {
    setLoading(true);
    const data = {
      AccessKey: AccessKey,
      UserID: UserID,
      FYear: FYear,
      CompanyID: CompanyID,
      AccountCode: "",
      ...value,
      IsFiler: Filer,
      IsSupplier: Customer,
      OpeningDate: OpenDate,
    };
    let url;
    if (props.CustomerID === undefined) {
      url = "Customer/AddCustomer";
    } else {
      url = "Customer/UpdateCustomer";
      data.ID = props.CustomerID;
    }

    // ////Console.log(data);

    let api_config = {
      method: "post",

      url: Config.base_url + url,
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    axios(api_config)
      .then(function (response) {
        // ////Console.log(response.data);
        if (response.data.status_code == 1) {
          message.success(response.data.status_message);
          setLoading(false);
          formMain.resetFields();
          props.handleOk();
          window.location.reload();
        } else {
          message.error(response.data.status_message);
          setLoading(false);
        }
      })
      .catch(function (error) {});
  };

  return (
    <>
      <Modal
        width={"800px"}
        open={props.show}
        title="Customer Information"
        onOk={props.handleOk}
        onCancel={props.handleCancel}
        footer={null}
      >
        {/* <Skeleton active /> */}
        <Form layout="vertical" form={formMain} onFinish={onFinish}>
          <Row gutter={[24, 0]}>
            <Col xs={24} md={10}>
              <Form.Item name="BusinessName" label="Business Name">
                <Input onFocus={(e) => e.target.select()} required />
              </Form.Item>
              <Form.Item
                name="Email"
                label="Email"
                rules={[
                  {
                    type: "email",
                  },
                ]}
              >
                <Input onFocus={(e) => e.target.select()} />
              </Form.Item>
              <Form.Item name="AccountNo" label="Account No.">
                <Input onFocus={(e) => e.target.select()} readOnly disabled />
              </Form.Item>
            </Col>
            <Col xs={24} md={14}>
              <Row gutter={[24, 0]}>
                <Col xs={24} md={4}>
                  <Form.Item name="Title" label="Title">
                    <Input onFocus={(e) => e.target.select()} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={10}>
                  <Form.Item name="FirstName" label="First Name">
                    <Input onFocus={(e) => e.target.select()} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={10}>
                  <Form.Item name="LastName" label="Last Name">
                    <Input onFocus={(e) => e.target.select()} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="Mobile" label="Mobile">
                    <Input onFocus={(e) => e.target.select()} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="Phone" label="Phone">
                    <Input onFocus={(e) => e.target.select()} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={24}>
                  <Form.Item name="Website" label="Website">
                    <Input onFocus={(e) => e.target.select()} />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>
          <Tabs defaultActiveKey="Address" items={tabitems} />
          <Row gutter={[24, 0]} justify="end">
            <Col xs={24} md={4}>
              <Button type="primary" block htmlType="submit" loading={loading}>
                Submit
              </Button>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};

export default AddCustomerModal;
