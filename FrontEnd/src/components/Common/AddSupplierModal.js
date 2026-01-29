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
  Spin,
  Divider,
  Space,
  message,
  Skeleton,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import SupplierFieldsDropdown from "./SupplierFieldsDropdown";
import Config from "../../Config";
import AddDropdowndata from "../Shared/AddDropdowndata";
import BankModeDropdown from "../Shared/BankModeDropdown";
import axios from "axios";
import moment from "moment";
import dayjs from "dayjs";

const AddSupplierModal = (props) => {
  const AccessKey = localStorage.getItem("AccessKey");
  const UserID = localStorage.getItem("ID");
  const CompanyID = localStorage.getItem("CompanyID");
  const FYear = localStorage.getItem("DefaultFYear");
  const [loading, setLoading] = useState(false);
  const [SupplierData, setSupplierData] = useState("");
  const [OpenDate, setOpenDate] = useState(null);
  const [SupplierLoading, setSupplierLoading] = useState(false);

  const [country, setCountry] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [countryLoading, setCountryLoading] = useState(false);
  const [cityLoading, setCityLoading] = useState(false);
  const [provinceLoading, setProvinceLoading] = useState(false);
  const [FieldOneName, setFieldOneName] = useState("");
  const [FieldOneItems, setFieldOneItems] = useState([]);
  const [input1Error, setInput1Error] = useState(false);

  const [formMain] = Form.useForm();

  const [Supplier, setSupplier] = useState(false);

  const fetchSupplier = async (ID) => {
    setSupplierLoading(true);
    try {
      const response = await axios.get(
        `${Config.base_url}CustomerSupplier/GetCustomerBy/${ID}`,
        {
          headers: {
            Authorization: `Bearer ${AccessKey}`,
          },
        }
      );

      if (response.data.status_code === 1) {
        // Setting form fields
        formMain.setFieldsValue(response.data.customerData);

        // Getting and setting the opening date
        const productDate = formMain.getFieldValue("openingDate");
        setOpenDate(productDate);

        // Set supplier data and other states
        setSupplier(formMain.getFieldValue("isCustomer"));
        setSupplierData(response.data.customerData);
        setSupplierLoading(false);
      } else {
        console.error("Unexpected status code:", response.data.status_code);
      }
    } catch (error) {
      console.error("Error fetching supplier data:", error);
    } finally {
      setSupplierLoading(false);
    }
  };

  useEffect(() => {
    if (props.SupplierID) {
      ////Console.log(props.SupplierID);
      fetchSupplier(props.SupplierID);
    } else {
      formMain.resetFields();
    }
  }, [props.SupplierID]);

  useEffect(() => {
    fetchCountry();
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
      console.error("Error:", error);
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

      // ////Console.log(response.data.data.states);
      const provincesNames = response.data.data.states.map(
        (country) => country.name
      );
      setProvinces(provincesNames);
      setProvinceLoading(false);
    } catch (error) {
      console.error("Error:", error);
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
      console.error("Error:", error);
      setCityLoading(false);
    }
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

  const handleDateChange = (e, value) => {
    setOpenDate(value);
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
            <Form.Item name="payementTermDays" label="Payement Term Days">
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
              name="supplierBaseOpeningBalance"
              label="Opening Balance"
            >
              <Input
                placeholder="Opening Balance"
                disabled={props.SupplierID ? true : false}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item>
              <Checkbox
                checked={Supplier}
                onChange={(e) => setSupplier(!Supplier)}
              >
                Customer
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
            <Form.Item name="bankName" label="Bank Name">
              <Input placeholder="Bank Name" />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item name="accountName" label="Account Name">
              <Input placeholder="Account Name" />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item name="accountNumber" label="Account Number">
              <Input placeholder="Account Number" />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item name="ibanNumber" label="IBAN">
              <Input placeholder="IBAN" />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item name="swiftCode" label="Swift Code">
              <Input placeholder="Swift Code" />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item name="address" label="Address">
              <Input placeholder="Address" />
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
            <SupplierFieldsDropdown />
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="smsMobile" label="Mobile Number">
              <Input placeholder="Mobile Number" />
            </Form.Item>
            <Form.Item name="whatsAppMobile" label="WhatsApp Number">
              <Input placeholder="WhatsApp Number" />
            </Form.Item>
            <Form.Item name="fieldA" label="Field A">
              <Input placeholder="Field A" />
            </Form.Item>
            <Form.Item name="fieldB" label="Field B">
              <Input placeholder="Field B" />
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
      key: "Bank",
      label: "Bank",
      children: <Bank />,
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
      companyID: CompanyID,
      businessName: FormData.businessName || "",
      title: FormData.title || "",
      firstName: FormData.firstName || "",
      lastName: FormData.lastName || "",
      email: FormData.email || "",
      mobile: FormData.mobile || "",
      phone: FormData.phone || "",
      website: FormData.website || "",
      billingAddress: FormData.billingAddress || "",
      city: FormData.city || "",
      province: FormData.province || "",
      postalCode: FormData.postalCode || "",
      country: FormData.country || "",
      shippingCity: FormData.city || "",
      shippingProvince: FormData.province || "",
      shippingPostalCode: FormData.postalCode || "",
      shippingCountry: FormData.country || "",
      shippingAddress: FormData.billingAddress || "",
      ntnNumber: FormData.ntnNumber || "",
      cnic: FormData.cnic || "",
      notes: FormData.notes || "",
      openingDate: OpenDate || dayjs().format("YYYY-MM-DD"),
      salesTaxNumber: FormData.salesTaxNumber || "",
      payementTermDays: FormData.payementTermDays || 0,
      creditLimit: FormData.creditLimit || 0,
      supplierOpeningBalance: FormData.supplierBaseOpeningBalance || 0,
      supplierBaseOpeningBalance: FormData.supplierBaseOpeningBalance || 0,
      groups: "",
      isCustomer: Supplier,
      address: FormData.address || "",
      swiftCode: FormData.swiftCode || "",
      ibanNumber: FormData.ibanNumber || "",
      accountNumber: FormData.accountNumber || "",
      accountName: FormData.accountName || "",
      bankName: FormData.bankName || "",
      field1: FormData.field1 || "",
      field2: FormData.field2 || "",
      field3: FormData.field3 || "",
      field4: FormData.field4 || "",
      fieldA: FormData.fieldA || "",
      fieldB: FormData.fieldB || "",
      fieldC: FormData.fieldC || "",
      fieldD: FormData.fieldD || "",
      isFiler: false,
      isSupplier: true,
      discount: FormData.discount || 0,
      smsMobile: FormData.smsMobile || "",
      whatsAppMobile: FormData.whatsAppMobile || "",
      extra1: "",
      extra2: "",
      isActive: true,
      isDeleted: false,
      accountNo: "",
      accountCode: "",
    };
    ////Console.log(data);
    try {
      const response = await axios.post(
        Config.base_url + `CustomerSupplier/AddSupplier`,
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
      }
    } catch (error) {
      message.error("Network Error..");
      setLoading(false);
    }
  };

  const handleSubmit = async (FormData) => {
    setLoading(true);
    const data = {
      ...SupplierData,
      companyID: CompanyID,
      businessName: FormData.businessName || "",
      title: FormData.title || "",
      firstName: FormData.firstName || "",
      lastName: FormData.lastName || "",
      email: FormData.email || "",
      mobile: FormData.mobile || "",
      phone: FormData.phone || "",
      website: FormData.website || "",
      billingAddress: FormData.billingAddress || "",
      city: FormData.city || "",
      province: FormData.province || "",
      postalCode: FormData.postalCode || "",
      country: FormData.country || "",
      shippingCity: FormData.city || "",
      shippingProvince: FormData.province || "",
      shippingPostalCode: FormData.postalCode || "",
      shippingCountry: FormData.country || "",
      shippingAddress: FormData.billingAddress || "",
      ntnNumber: FormData.ntnNumber || "",
      cnic: FormData.cnic || "",
      notes: FormData.notes || "",
      openingDate: OpenDate || dayjs().format("YYYY-MM-DD"),
      salesTaxNumber: FormData.salesTaxNumber || "",
      payementTermDays: FormData.payementTermDays || 0,
      creditLimit: FormData.creditLimit || 0,
      groups: "",
      isCustomer: Supplier,
      address: FormData.address || "",
      swiftCode: FormData.swiftCode || "",
      ibanNumber: FormData.ibanNumber || "",
      accountNumber: FormData.accountNumber || "",
      accountName: FormData.accountName || "",
      bankName: FormData.bankName || "",
      smsMobile: FormData.smsMobile || "",
      whatsAppMobile: FormData.whatsAppMobile || "",
      extra1: "",
      extra2: "",
      isActive: true,
      isDeleted: false,
      discount: FormData.discount || 0,
      isSupplier: true,
      isFiler: false,
    };
    try {
      const response = await axios.patch(
        Config.base_url + `CustomerSupplier/UpdateRecord/${props.SupplierID}`,
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
        title={props.SupplierID ? "Edit Supplier" : "Add Supplier"}
        onOk={props.handleOk}
        onCancel={props.handleCancel}
        footer={null}
      >
        {SupplierLoading ? (
          <>
            <Skeleton active />
            <Skeleton active />
            <Skeleton active />
          </>
        ) : (
          <Form
            layout="vertical"
            form={formMain}
            onFinish={props.SupplierID ? handleSubmit : onFinish}
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
                <Form.Item name="field1" label="Supplier Type">
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
                      SupplierLoading ? <Spin size="small" /> : null
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
                  {props.SupplierID ? "Update" : "Submit"}
                </Button>
              </Col>
            </Row>
          </Form>
        )}
      </Modal>
    </>
  );
};

export default AddSupplierModal;
