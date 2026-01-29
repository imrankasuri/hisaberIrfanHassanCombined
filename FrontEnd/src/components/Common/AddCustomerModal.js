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
  Spin,
  Skeleton,
} from "antd";
import CustomerFieldsDropdown from "./CustomerFieldsDropdown";
import Config from "../../Config";
import SubMenuToggle from "../Common/SubMenuToggle";
import axios from "axios";
import moment from "moment";
import dayjs from "dayjs";
import { PlusOutlined } from "@ant-design/icons";
import AddDropdowndata from "../Shared/AddDropdowndata";
import BankModeDropdown from "../Shared/BankModeDropdown";
const { Option } = Select;

const AddCustomerModal = (props) => {
  const AccessKey = localStorage.getItem("AccessKey");
  const UserID = localStorage.getItem("ID");
  const CompanyID = localStorage.getItem("CompanyID");
  const FYear = localStorage.getItem("DefaultFYear");
  const [loading, setLoading] = useState(false);
  const [OpenDate, setOpenDate] = useState(null);
  const [CustomerLoading, setCustomerLoading] = useState(false);
  const [country, setCountry] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [countryLoading, setCountryLoading] = useState(false);
  const [provinceLoading, setProvinceLoading] = useState(false);
  const [cityLoading, setCityLoading] = useState(false);
  const [formMain] = Form.useForm();
  const [CustomerData, setCustomerData] = useState({});
  const [FieldOneItems, setFieldOneItems] = useState([]);
  const [FieldOneName, setFieldOneName] = useState("");
  const [input1Error, setInput1Error] = useState(false);

  const [Customer, setCustomer] = useState(false);
  const [Filer, setFiler] = useState(false);

  const fetchCustomer = async (ID) => {
    setCustomerLoading(true);
    try {
      const { data } = await axios.get(
        `${Config.base_url}CustomerSupplier/GetCustomerBy/${ID}`,
        {
          headers: {
            Authorization: `Bearer ${AccessKey}`,
          },
        }
      );
      //////Console.log(data);
      if (data.status_code === 1) {
        formMain.setFieldsValue(data.customerData);
        const productDate = formMain.getFieldValue("openingDate");
        setOpenDate(productDate);
        setCustomer(formMain.getFieldValue("isSupplier"));
        setFiler(formMain.getFieldValue("isFiler"));
        setCustomerData(data.customerData);
      }
    } catch (error) {
      //console.error("Error fetching product data:", error);
    } finally {
      setCustomerLoading(false);
    }
  };

  useEffect(() => {
    if (props.CustomerID) {
      fetchCustomer(props.CustomerID);
    } else {
      formMain.resetFields();
    }
  }, [props.CustomerID]);

  useEffect(() => {
    fetchCountry();
    GetField1DropdownData();
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      fetchProvinces(selectedCountry);
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedCountry && selectedProvince) {
      fetchCities(selectedCountry, selectedProvince);
    }
  }, [selectedProvince]);

  const fetchCountry = async () => {
    setCountryLoading(true);
    try {
      const response = await fetch("https://restcountries.com/v3.1/all");
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
        setCountryLoading(false);
      }

      const data = await response.json();
      const countryNames = data.map((country) => country.name.common);
      setCountry(countryNames);
      setCountryLoading(false);
    } catch (error) {
      //console.error("Error:", error);
      setCountryLoading(false);
    }
  };

  const fetchProvinces = async (countryName) => {
    setProvinceLoading(true);
    try {
      const response = await axios.post(
        "https://countriesnow.space/api/v0.1/countries/states",
        { country: countryName },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${AccessKey}`, // Add your token here
          },
        }
      );

      // //////Console.log(response.data.data.states);
      const provincesNames = response.data.data.states.map(
        (country) => country.name
      );
      setProvinces(provincesNames);
      setProvinceLoading(false);
    } catch (error) {
      //console.error("Error:", error);
      setProvinceLoading(false);
    }
  };

  const fetchCities = async (countryName, stateName) => {
    setCityLoading(true);
    try {
      const response = await axios.post(
        "https://countriesnow.space/api/v0.1/countries/state/cities",
        { country: countryName, state: stateName },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${AccessKey}`, // Add your token here
          },
        }
      );
      const citiesNames = response.data.data.map((country) => country);
      setCities(citiesNames);
      setCityLoading(false);
    } catch (error) {
      //console.error("Error:", error);
      setCityLoading(false);
    }
  };

  const handleDateChange = (e, value) => {
    setOpenDate(value);
  };
  const handleCountryChange = (value) => {
    setSelectedCountry(value);
    setProvinces([]); // Reset provinces when country changes
    setCities([]); // Reset cities when country changes
    setSelectedProvince(""); // Reset selected province
  };

  const handleProvinceChange = (value) => {
    setSelectedProvince(value);
  };

  const Address = () => {
    return (
      <>
        <Row gutter={[24, 0]}>
          <Col xs={24} md={24}>
            <Form.Item name="billingAddress" label="Billing Address">
              <Input placeholder="Billing Address" />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item name="country" label="Country">
              <Select
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.children ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                placeholder="Select Country"
                onChange={handleCountryChange}
              >
                {countryLoading ? (
                  <Select.Option value="loading" disabled>
                    <Spin />
                  </Select.Option>
                ) : (
                  country.map((countryName, index) => (
                    <Select.Option key={index} value={countryName}>
                      {countryName}
                    </Select.Option>
                  ))
                )}
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} md={6}>
            <Form.Item name="province" label="Province">
              <Select
                placeholder="Select Province"
                onChange={handleProvinceChange}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.children ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {provinceLoading ? (
                  <Select.Option value="loading" disabled>
                    <Spin />
                  </Select.Option>
                ) : (
                  provinces.map((province, index) => (
                    <Select.Option key={index} value={province}>
                      {province}
                    </Select.Option>
                  ))
                )}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item name="city" label="City">
              <Select
                placeholder="Select City"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.children ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {cityLoading ? (
                  <Select.Option value="loading" disabled>
                    <Spin />
                  </Select.Option>
                ) : (
                  cities.map((city, index) => (
                    <Select.Option key={index} value={city}>
                      {city}
                    </Select.Option>
                  ))
                )}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item name="postalCode" label="Postal Code">
              <Input placeholder="Postal Code" />
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
            <Form.Item name="ntnNumber" label="NTN">
              <Input placeholder="NTN" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="salesTaxNumber" label="Sales Tax Number">
              <Input placeholder="STN" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="cnic" label="CNIC">
              <Input placeholder="CNIC" min={13} max={13} />
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
            <Form.Item name="payementTermDays" label="Payments Term days">
              <Input placeholder="Payments Term days" />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item name="creditLimit" label="Credit Limit">
              <Input placeholder="Credit Limit" />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item label="Date">
              <DatePicker
                defaultValue={
                  OpenDate === null ? dayjs() : dayjs(OpenDate, "YYYY-MM-DD")
                }
                style={{ width: "100%" }}
                onChange={handleDateChange}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item
              name="customerBaseOpeningBalance"
              label="Opening Balance"
            >
              <Input
                placeholder="Opening Balance"
                disabled={props.CustomerID ? true : false}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item name="discount" label="Discount">
              <Input placeholder="Discount" />
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
  const Notes = () => {
    return (
      <>
        <Row gutter={[24, 0]}>
          <Col xs={24} md={24}>
            <Form.Item name="notes" label="Notes">
              <Input.TextArea placeholder="Notes" rows={6} />
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
            <CustomerFieldsDropdown />
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="fieldA" label="Field A">
              <Input placeholder="Field A" />
            </Form.Item>
            <Form.Item name="fieldB" label="Field B">
              <Input placeholder="Field B" />
            </Form.Item>
            <Form.Item name="fieldC" label="Field C">
              <Input placeholder="Field C" />
            </Form.Item>
            <Form.Item name="fieldD" label="Field D">
              <Input placeholder="Field D" />
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

  const onFinish = async (FormData) => {
    setLoading(true);

    const data = {
      ...FormData,
      companyID: CompanyID,
      businessName: FormData.businessName || "",
      shippingCity: FormData.city || "",
      shippingProvince: FormData.province || "",
      shippingPostalCode: FormData.postalCode || "",
      shippingCountry: FormData.country || "",
      shippingAddress: FormData.billingAddress || "",
      openingDate: OpenDate || dayjs().format("YYYY-MM-DD"),
      customerOpeningBalance: FormData.customerBaseOpeningBalance || 0,
      customerBaseOpeningBalance: FormData.customerBaseOpeningBalance || 0,
      groups: "",
      isCustomer: true,
      isFiler: Filer,
      isSupplier: Customer,
      discount: FormData.discount || 0,
      isActive: true,
      isDeleted: false,
      accountNo: "",
      accountCode: "",
    };

    //////Console.log(data);
    try {
      const response = await axios.post(
        Config.base_url + `CustomerSupplier/AddCustomer`,
        data,
        {
          headers: {
            Authorization: `Bearer ${AccessKey}`,
          },
        }
      );
      ////Console.log(response);
      if (response.data.status_code === 1) {
        message.success(response.data.status_message);
        setLoading(false);
        formMain.resetFields();
        props.handleOk();
        window.location.reload();
      } else {
        message.error(response.data.status_message);
        setLoading(false);
      }
    } catch (error) {
      message.error("Network Error..");
      setLoading(false);
    }
  };

  const handleSubmit = async (FormData) => {
    setLoading(true);

    const data = {
      ...CustomerData,
      ...FormData,
      companyID: CompanyID,
      businessName: FormData.businessName || "",
      shippingCity: FormData.city || "",
      shippingProvince: FormData.province || "",
      shippingPostalCode: FormData.postalCode || "",
      shippingCountry: FormData.country || "",
      shippingAddress: FormData.billingAddress || "",
      openingDate: OpenDate || dayjs().format("YYYY-MM-DD"),
      groups: "",
      isCustomer: true,
      isFiler: Filer,
      isSupplier: Customer,
      discount: FormData.discount || 0,
      isActive: true,
      isDeleted: false,
    };
    //////Console.log(data);
    try {
      const response = await axios.patch(
        Config.base_url + `CustomerSupplier/UpdateRecord/${props.CustomerID}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${AccessKey}`,
          },
        }
      );

      if (response.data.status_code === 1) {
        message.success(response.data.status_message);
        setLoading(false);
        formMain.resetFields();
        props.handleOk();
        window.location.reload();
      } else {
        message.error(response.data.status_message);
        setLoading(false);
      }
    } catch (error) {
      message.error("Network Error..");
      setLoading(false);
    }
  };

  const onFieldOneNameChange = (event) => {
    setFieldOneName(event.target.value);
    setInput1Error(false);
  };
  const addFieldOneItem = async (e) => {
    e.preventDefault();
    if (!FieldOneName.trim()) {
      setInput1Error(true);
      message.error("Field 1 Name is required.");
      return;
    }
    const data = {
      name: FieldOneName,
      type: "Field1",
      isActive: true,
      isDeleted: false,
      companyID: CompanyID,
      shortName: "",
    };

    try {
      const response = await AddDropdowndata(data, "Field1");

      if (response) {
        GetField1DropdownData();
        setFieldOneName("");
      }
    } catch (error) {
      //console.error(error);
    }
  };

  const GetField1DropdownData = async () => {
    try {
      const response = await BankModeDropdown(CompanyID, "Field1");
      ////Console.log(response);
      if (response) {
        setFieldOneItems(response);
      }
    } catch (error) {
      //console.error(error);
    }
  };

  return (
    <>
      <Modal
        width={"800px"}
        open={props.show}
        title={props.CustomerID ? "Edit Customer" : "Add Customer"}
        onOk={props.handleOk}
        onCancel={props.handleCancel}
        footer={null}
      >
        {/* <Skeleton active /> */}
        {CustomerLoading ? (
          <>
            <Skeleton active />
            <Skeleton active />
            <Skeleton active />
          </>
        ) : (
          <Form
            layout="vertical"
            form={formMain}
            onFinish={props.CustomerID ? handleSubmit : onFinish}
          >
            <Row gutter={[24, 0]}>
              <Col xs={24} md={10}>
                <Form.Item
                  name="businessName"
                  label="Business Name"
                  rules={[
                    {
                      required: true,
                      message: "Please enter the business name.",
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item name="field1" label="Customer Type">
                  <Select
                    style={{
                      width: "100%",
                    }}
                    placeholder="Select Type"
                    showSearch
                    filterOption={
                      (input, option) =>
                        option.value.toLowerCase().includes(input.toLowerCase()) // Use option.value, which is a string
                    }
                    notFoundContent={
                      CustomerLoading ? <Spin size="small" /> : null
                    }
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
                          <Input
                            placeholder="Enter Name"
                            value={FieldOneName}
                            onChange={onFieldOneNameChange}
                            status={input1Error ? "error" : ""}
                          />
                          <Button
                            type="text"
                            icon={<PlusOutlined />}
                            onClick={addFieldOneItem}
                          >
                            Add Type
                          </Button>
                        </Space>
                      </>
                    )}
                    options={FieldOneItems.map((item) => ({
                      label: item.name,
                      value: item.name,
                    }))}
                  />
                </Form.Item>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    {
                      type: "email",
                      message: "Please enter a valid email address.",
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={14}>
                <Row gutter={[24, 0]}>
                  <Col xs={24} md={4}>
                    <Form.Item name="title" label="Title">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={10}>
                    <Form.Item name="firstName" label="First Name">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={10}>
                    <Form.Item name="lastName" label="Last Name">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="mobile" label="Mobile">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="phone" label="Phone">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="website" label="Website">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="accountNo" label="Account No.">
                      <Input readOnly disabled />
                    </Form.Item>
                  </Col>
                </Row>
              </Col>
            </Row>
            <Tabs defaultActiveKey="Address" items={tabitems} />
            <Row gutter={[24, 0]} justify="end">
              <Col xs={24} md={4}>
                <Button
                  type="primary"
                  block
                  htmlType="submit"
                  loading={loading}
                >
                  {props.CustomerID ? "Update" : "Submit"}
                </Button>
              </Col>
            </Row>
          </Form>
        )}
      </Modal>
    </>
  );
};

export default AddCustomerModal;
