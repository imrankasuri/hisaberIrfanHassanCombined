import React, { useState, useEffect, useRef } from "react";
import ProductionMenu from "./ProductionMenu";
import {
  PlusOutlined,
  PlusCircleOutlined,
  InboxOutlined,
} from "@ant-design/icons";

import { ArrowLeftIcon } from "@heroicons/react/24/solid";

import { NavLink, Link, useNavigate } from "react-router-dom";

import {
  Card,
  Col,
  Form,
  Input,
  Row,
  Radio,
  Select,
  Button,
  Upload,
  message,
  Collapse,
  Flex,
  Typography,
  DatePicker,
  Spin,
  Modal,
  Divider,
  Space,
  Table,
  Checkbox,
} from "antd";
import axios from "axios";

import Config from "../../Config";
import SubMenuToggle from "../Common/SubMenuToggle";
import BankModeDropdown from "../Shared/BankModeDropdown";
import LevelWiseAccount2 from "../Shared/LevelWiseAccount2";
import SuppliersDropdown from "../Shared/SuppliersDropdown";
import dayjs from "dayjs";
import AddDropdowndata from "../Shared/AddDropdowndata";
import AddAccount from "../Shared/AddAccount";

function AddStockProducts(props) {
  const navigate = useNavigate();
  const AccessKey = localStorage.getItem("AccessKey");
  const UserID = localStorage.getItem("ID");
  const FYear = localStorage.getItem("DefaultFYear");
  const CompanyID = localStorage.getItem("CompanyID");

  // Drop Down Arrays
  const [stockAsset, setStockAsset] = useState([]);
  const [incomeAsset, setIncomeAsset] = useState([]);
  const [expenseAsset, setExpenseAsset] = useState([]);
  const [stockAsset1, setStockAsset1] = useState([]);
  const [stockAsset2, setStockAsset2] = useState([]);
  const [incomeAsset1, setIncomeAsset1] = useState([]);
  const [incomeAsset2, setIncomeAsset2] = useState([]);
  const [expenseAsset1, setExpenseAsset1] = useState([]);
  const [expenseAsset2, setExpenseAsset2] = useState([]);
  const [Category, setCategory] = useState([]);
  const [Type, setType] = useState([]);
  const [Size, setSize] = useState([]);
  const [Unit, setUnit] = useState([]);

  // // loadings
  const [loading, setLoading] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [typeLoading, setTypeLoading] = useState(false);
  const [sizeLoading, setSizeLoading] = useState(false);
  const [unitLoading, setUnitLoading] = useState(false);
  const [stockAssetLoading, setStockAssetLoading] = useState(false);
  const [incomeAssetLoading, setIncomeAssetLoading] = useState(false);
  const [expenseAssetLoading, setExpenseAssetLoading] = useState(false);
  const [showInputs, setShowInputs] = useState(false);

  //Suppliers
  const [SupplierLoading, setSupplierLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [open, setOpen] = useState(false);
  const [ListOfRecords, setListOfRecords] = useState([]);
  const [SupplierForm] = Form.useForm();

  // Modal Opening
  const [isCategoeyModalOpen, setIsCategoryModal] = useState(false);
  const [isTypeModalOpen, setIsTypeModal] = useState(false);
  const [isSizeModalOpen, setIsSizeModal] = useState(false);
  const [isUnitModalOpen, setIsUnitModal] = useState(false);
  const [isStockAccountModalOpen, setIsStockAccountModalOpen] = useState(false);
  const [isIncomeAccountModalOpen, setIsIncomeAccountModalOpen] =
    useState(false);
  const [isExpenseAccountModalOpen, setIsExpenseAccountModalOpen] =
    useState(false);

  //Image Upload
  const [file, setFile] = useState(null);
  const [imageSelected, setImageSelected] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [OpenDate, setOpenDate] = useState(null);
  const [CategoryCode, setCategoryCode] = useState("");
  const [form] = Form.useForm();
  const [AccountForm] = Form.useForm();
  const [CategoryForm] = Form.useForm();
  const [TypeForm] = Form.useForm();
  const [SizeForm] = Form.useForm();
  const [UnitForm] = Form.useForm();

  const handleSubmit = async (FormData) => {
    setLoading(true);
    const data = {
      name: FormData.name || "",
      type: FormData.type || "",
      date: OpenDate || dayjs().format("YYYY-MM-DD"),
      cost: FormData.cost || 0,
      unit: FormData.unit || "",
      notes: FormData.notes || "",
      weight: FormData.weight || 0,
      field1: FormData.field1 || "",
      field2: FormData.field2 || "",
      field3: FormData.field3 || "",
      field4: FormData.field4 || "",
      fieldA: FormData.fieldA || "",
      fieldB: FormData.fieldB || "",
      fieldC: FormData.fieldC || "",
      fieldD: FormData.fieldD || "",
      category: FormData.category || "",
      maxRRExTax: FormData.maxRRExTax || 0,
      salePrice: FormData.salePrice || 0,
      openingRate: FormData.openingRate || 0,
      saleDiscount: FormData.saleDiscount || 0,
      stockAssetAccount: FormData.stockAssetAccount || "",
      lowStockLevel: FormData.lowStockLevel || 0,
      incomeAccount: FormData.incomeAccount || "",
      expenseAccount: FormData.expenseAccount || "",
      purchaseDiscount: FormData.purchaseDiscount || 0,
      gstRate: FormData.gstRate || "",
      openingQuantity: FormData.openingQuantity || 0,
      baseOpeningQuantity: FormData.openingQuantity || 0,
      saleInformation: FormData.saleInformation || "",
      nonFilerGSTRate: FormData.nonFilerGSTRate || "",
      maxRRIncTax: FormData.maxRRIncTax || 0,
      binLocation: FormData.binLocation || "",
      largePackSize: FormData.largePackSize || 0,
      smallPackSize: FormData.smallPackSize || 0,
      prefferedSupplier: FormData.prefferedSupplier || "",
      defaultUnit: FormData.defaultUnit || "Quantity",
      productType: "Stock",
      size: FormData.size || "",
      openingWeight: FormData.openingWeight || 0,
      openingLength: FormData.openingLength || 0,
      isActive: true,
      isDeleted: false,
      companyID: CompanyID,
      categoryCode: CategoryCode,
    };

    //////Console.log(data);
    try {
      const response = await axios.post(
        Config.base_url + `Product/AddProduct`,
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
        if (FormData.Image) {
          await updateProfile_Img(data.name);
        } else {
          navigate("/products/manage");
        }
        form.resetFields();
      } else {
        message.error(response.data.status_message);
        setLoading(false);
      }
    } catch (error) {
      message.error("Network Error..");
      setLoading(false);
    }
  };

  const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

  const onFileChange = (info) => {
    const { file } = info;

    if (file.status === "done" || file.status === "uploading") {
      if (file.size > MAX_IMAGE_SIZE) {
        message.error("Image size must be less than 2 MB");
        return;
      }

      if (file.type !== "image/jpeg" && file.type !== "image/png") {
        message.error("Only JPG, PNG files are allowed.");
        return;
      }

      setFile(file);
      setImageSelected(true);
      //////Console.log("File selected:", file);
    }
  };

  const updateProfile_Img = async (type) => {
    setLoading(true);
    if (!file) {
      message.error("No file selected");
      setLoading(false);
      return;
    }
    //////Console.log(file);
    const formData = new FormData();
    formData.append("file", file.originFileObj);

    //////Console.log(formData);
    try {
      setUploading(true);
      const response = await axios.post(
        `${Config.base_url}Logo/AddLogo/${CompanyID}?type=${type}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${AccessKey}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      message.success("Image has been saved successfully.");
      setLoading(false);
      setFile(null);
      setImageSelected(false);
      navigate("/products/manage");
    } catch (error) {
      message.error("Error uploading file");
      //console.error("Upload error:", error); // Log the error
      setLoading(false);
    } finally {
      setUploading(false);
    }
  };

  const columns = [
    {
      title: "Account Name",
      dataIndex: "accountDescription",
      key: "accountDescription",
    },
    {
      title: "Account Code",
      dataIndex: "accountCode",
      key: "accountCode",
    },
  ];

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  useEffect(() => {
    document.title = "Add Stock Products";

    const fetchAccounts = async () => {
      // Initialize a loading state
      setStockAssetLoading(true);
      setExpenseAssetLoading(true);
      setIncomeAssetLoading(true);
      setCategoryLoading(true);
      setSizeLoading(true);
      setUnitLoading(true);
      setTypeLoading(true);
      setSupplierLoading(true);

      try {
        // Concurrently fetch data
        const [expense, income, stock, category, type, size, unit, suppliers] =
          await Promise.all([
            LevelWiseAccount2(3, "70101"),
            LevelWiseAccount2(3, "60103"),
            LevelWiseAccount2(3, "50101"),
            BankModeDropdown(CompanyID, "ProductCategory"),
            BankModeDropdown(CompanyID, "ProductType"),
            BankModeDropdown(CompanyID, "ProductSize"),
            BankModeDropdown(CompanyID, "ProductUnit"),
            SuppliersDropdown(),
          ]);

        // Update state with fetched data
        setExpenseAsset(expense);
        setIncomeAsset(income);
        setStockAsset(stock);
        setCategory(category);
        setType(type);
        setSize(size);
        setUnit(unit);
        setListOfRecords(suppliers);

        // Set loading states to false
        setExpenseAssetLoading(false);
        setIncomeAssetLoading(false);
        setStockAssetLoading(false);
        setCategoryLoading(false);
        setSizeLoading(false);
        setUnitLoading(false);
        setTypeLoading(false);
        setSupplierLoading(false);
      } catch (error) {
        message.error("Network Error...");
      }
    };

    fetchAccounts();
  }, [CompanyID]); // Ensure CompanyID is stable

  // Modal Opening Funcitons
  const showCategoryModal = () => {
    setIsCategoryModal(true);
  };
  const showTypeModal = () => {
    setIsTypeModal(true);
  };
  const showSizeModal = () => {
    setIsSizeModal(true);
  };
  const showUnitModal = () => {
    setIsUnitModal(true);
  };
  const showStockAccountModal = async () => {
    setIsStockAccountModalOpen(true);
    try {
      const response1 = await LevelWiseAccount2(1, "50");
      setStockAsset1(response1);
      const response2 = await LevelWiseAccount2(2, "50101");
      setStockAsset2(response2);
    } catch (error) {
      // //console.error(error);
    }
  };
  const showIncomeAccountModal = async () => {
    setIsIncomeAccountModalOpen(true);
    try {
      const response1 = await LevelWiseAccount2(1, "60");
      setIncomeAsset1(response1);
      const response2 = await LevelWiseAccount2(2, "60103");
      setIncomeAsset2(response2);
    } catch (error) {
      // //console.error(error);
    }
  };
  const showExpenseAccountModal = async () => {
    setIsExpenseAccountModalOpen(true);
    try {
      const response1 = await LevelWiseAccount2(1, "70");
      setExpenseAsset1(response1);
      const response2 = await LevelWiseAccount2(2, "70101");
      setExpenseAsset2(response2);
    } catch (error) {
      // //console.error(error);
    }
  };

  const handleCancel = () => {
    setIsCategoryModal(false);
    setIsTypeModal(false);
    setIsSizeModal(false);
    setIsUnitModal(false);
    setIsStockAccountModalOpen(false);
    setIsIncomeAccountModalOpen(false);
    setIsExpenseAccountModalOpen(false);
  };
  const handleDateChange = (e, value) => {
    setOpenDate(value);
    //////Console.log(value);
  };

  const handleSupplierChange = (value) => {
    const supplier = ListOfRecords.find(
      (supplier) =>
        supplier.businessName + " " + `(${supplier.accountNo})` === value
    );

    if (supplier) {
      SupplierForm.setFieldsValue({
        address: supplier.billingAddress,
        creditLimit: supplier.creditLimit,
        balance: supplier.openingBalance,
        CustomerAccountCode: supplier.accountNo,
      });
    }
  };
  // Modal OnFinishes
  const onFinish = async (FormData) => {
    setCategoryLoading(true);
    try {
      const response = await AddDropdowndata(FormData, "ProductCategory");
      if (response) {
        // message.success(response.data.status_message);
        setIsCategoryModal(false);
        // Reset the form field
        CategoryForm.resetFields();
        setCategoryLoading(false);
        const categoryData = await BankModeDropdown(
          CompanyID,
          "ProductCategory"
        );
        setCategory(categoryData);
      } else {
        setCategoryLoading(false);
      }
    } catch (error) {
      // //console.error(error);
      message.error("Network Error...");
      setCategoryLoading(false);
    }
  };
  const onFinishType = async (FormData) => {
    setTypeLoading(true);
    try {
      const response = await AddDropdowndata(FormData, "ProductType");
      if (response) {
        setIsTypeModal(false);
        // Reset the form field
        TypeForm.resetFields();
        setTypeLoading(false);
        const typeData = await BankModeDropdown(CompanyID, "ProductType");
        setType(typeData);
      } else {
        setTypeLoading(false);
      }
    } catch (error) {
      // //console.error(error);
      message.error("Network Error...");
      setTypeLoading(false);
    }
  };
  const onFinishSize = async (FormData) => {
    setSizeLoading(true);
    try {
      const response = await AddDropdowndata(FormData, "ProductSize");
      if (response) {
        setIsSizeModal(false);
        // Reset the form field
        SizeForm.resetFields();
        setSizeLoading(false);
        const sizeData = await BankModeDropdown(CompanyID, "ProductSize");
        setSize(sizeData);
      } else {
        setSizeLoading(false);
      }
    } catch (error) {
      // //console.error(error);
      message.error("Network Error...");
      setSizeLoading(false);
    }
  };
  const onFinishUnit = async (FormData) => {
    setUnitLoading(true);
    try {
      const response = await AddDropdowndata(FormData, "ProductUnit");
      if (response) {
        setIsUnitModal(false);
        // Reset the form field
        UnitForm.resetFields();
        setUnitLoading(false);
        const typeData = await BankModeDropdown(CompanyID, "ProductUnit");
        setUnit(typeData);
      } else {
        setUnitLoading(false);
      }
    } catch (error) {
      // //console.error(error);
      message.error("Network Error...");
      setUnitLoading(false);
    }
  };
  const onFinishStockAccount = async (FormData) => {
    setStockAssetLoading(true);

    try {
      const stockData = await LevelWiseAccount2(3, "50101");
      //Console.log(stockData, FormData)
      const response = await AddAccount(FormData, stockData);
      if (response) {
        setIsStockAccountModalOpen(false);
        // Reset the form field
        AccountForm.resetFields();
        setStockAssetLoading(false);
        const Data = await LevelWiseAccount2(3, "50101");
        setStockAsset(Data);
      } else {
        setStockAssetLoading(false);
      }
    } catch (error) {
      // //console.error(error);
      message.error("Network Error...");
      setStockAssetLoading(false);
    }
  };
  const onFinishIncomeAccount = async (FormData) => {
    setIncomeAssetLoading(true);

    try {
      const stockData = await LevelWiseAccount2(3, "60103");
      const response = await AddAccount(FormData, stockData);
      if (response) {
        setIsIncomeAccountModalOpen(false);
        // Reset the form field
        AccountForm.resetFields();
        setIncomeAssetLoading(false);
        const Data = await LevelWiseAccount2(3, "60103");
        setIncomeAsset(Data);
      } else {
        setIncomeAssetLoading(false);
      }
    } catch (error) {
      // //console.error(error);
      message.error("Network Error...");
      setIncomeAssetLoading(false);
    }
  };
  const onFinishExpenseAccount = async (FormData) => {
    setExpenseAssetLoading(true);

    try {
      const stockData = await LevelWiseAccount2(3, "70101");
      const response = await AddAccount(FormData, stockData);
      if (response) {
        setIsExpenseAccountModalOpen(false);
        // Reset the form field
        AccountForm.resetFields();
        setExpenseAssetLoading(false);
        const Data = await LevelWiseAccount2(3, "70101");
        setExpenseAsset(Data);
      } else {
        setExpenseAssetLoading(false);
      }
    } catch (error) {
      // //console.error(error);
      message.error("Network Error...");
      setExpenseAssetLoading(false);
    }
  };
  // Dynamic Product Name
  const isNameManuallyEdited = { current: false };

  const handleUpdateProductName = (changedValues, allValues) => {
    const { category, type, size } = allValues;

    // Check if the change is from a field that should update the name
    if (
      !isNameManuallyEdited.current &&
      (changedValues.category || changedValues.type || changedValues.size)
    ) {
      // Construct the new combined name
      const combinedName = [category, type, size].filter(Boolean).join(" ");

      // Set the new combined name in the form
      form.setFieldsValue({ name: combinedName });
      //////Console.log("Combined Name:", combinedName);
    }
  };

  const handleNameChange = () => {
    // Mark the name field as manually edited
    isNameManuallyEdited.current = true;
  };

  const handleFieldChange = () => {
    // Reset the flag if any other field changes
    isNameManuallyEdited.current = false;
  };

  const handleCategoryCodeChange = (value) => {
    ////Console.log(value);
    const catCode = Category.find((item) => item.name === value);
    ////Console.log(catCode.shortName);
    setCategoryCode(catCode.shortName);
  };

  const handleCheckboxChange = (e) => {
    setShowInputs(e.target.checked);
  };

  return (
    <>
      {/* Category Modal */}
      <Modal
        title="New Category"
        open={isCategoeyModalOpen}
        onCancel={handleCancel}
        footer={null}
      >
        <Form layout="vertical" form={CategoryForm} onFinish={onFinish}>
          <Form.Item
            label="Name"
            name="name"
            rules={[
              {
                required: true,
                message: "Please input the category name!",
              },
            ]}
          >
            <Input onFocus={(e) => e.target.select()} placeholder="Name" />
          </Form.Item>
          <Form.Item
            label="Short Code"
            name="shortName"
            rules={[
              {
                required: true,
                message: "Please input the category name!",
              },
            ]}
          >
            <Input onFocus={(e) => e.target.select()} placeholder="Name" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Save
            </Button>
            <Button
              type="default"
              style={{ marginLeft: "8px" }}
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Type Modal */}
      <Modal
        title="New Type"
        open={isTypeModalOpen}
        onCancel={handleCancel}
        footer={null}
      >
        <Form layout="vertical" form={TypeForm} onFinish={onFinishType}>
          <Form.Item
            label="Name"
            name="name"
            rules={[
              {
                required: true,
                message: "Please input the type!",
              },
            ]}
          >
            <Input onFocus={(e) => e.target.select()} placeholder="Name" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Save
            </Button>
            <Button
              type="default"
              style={{ marginLeft: "8px" }}
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Size Modal */}
      <Modal
        title="New Size"
        open={isSizeModalOpen}
        onCancel={handleCancel}
        footer={null}
      >
        <Form layout="vertical" form={SizeForm} onFinish={onFinishSize}>
          <Form.Item
            label="Name"
            name="name"
            rules={[
              {
                required: true,
                message: "Please input the size!",
              },
            ]}
          >
            <Input onFocus={(e) => e.target.select()} placeholder="Name" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Save
            </Button>
            <Button
              type="default"
              style={{ marginLeft: "8px" }}
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Unit Modal */}
      <Modal
        title="New Unit"
        open={isUnitModalOpen}
        onCancel={handleCancel}
        footer={null}
      >
        <Form layout="vertical" form={UnitForm} onFinish={onFinishUnit}>
          <Form.Item
            label="Name"
            name="name"
            rules={[
              {
                required: true,
                message: "Please input the unit!",
              },
            ]}
          >
            <Input onFocus={(e) => e.target.select()} placeholder="Name" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Save
            </Button>
            <Button
              type="default"
              style={{ marginLeft: "8px" }}
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Stock Asset Account Modal */}
      <Modal
        title="Nominal Account New"
        open={isStockAccountModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={750}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={12}>
            <Form
              layout="vertical"
              onFinish={onFinishStockAccount}
              form={AccountForm}
            >
              {/* Nominal Account Category */}
              <Form.Item
                label="Nominal Account Category"
                name="firstLevel"
                rules={[
                  {
                    required: true,
                    message: "Please input the nominal account category!",
                  },
                ]}
              >
                <Select placeholder="Nominal Account Category">
                  {stockAssetLoading ? (
                    <Select.Option value="loading" disabled>
                      <Spin />
                    </Select.Option>
                  ) : (
                    stockAsset1.map((option) => (
                      <Select.Option
                        value={option.accountDescription}
                        key={option.id}
                      >
                        {option.accountDescription} ({option.accountCode})
                      </Select.Option>
                    ))
                  )}
                </Select>
              </Form.Item>

              {/* Section */}
              <Form.Item
                label="Section"
                name="secondLevel"
                rules={[
                  { required: true, message: "Please input the section!" },
                ]}
              >
                <Select placeholder="Section">
                  {stockAssetLoading ? (
                    <Select.Option value="loading" disabled>
                      <Spin />
                    </Select.Option>
                  ) : (
                    stockAsset2.map((option) => (
                      <Select.Option
                        value={option.accountDescription}
                        key={option.id}
                      >
                        {option.accountDescription} ({option.accountCode})
                      </Select.Option>
                    ))
                  )}
                </Select>
              </Form.Item>

              {/* Nominal Account */}
              <Form.Item
                label="Nominal Account"
                name="accountDescription"
                rules={[
                  {
                    required: true,
                    message: "Please input the nominal account!",
                  },
                ]}
              >
                <Input
                  onFocus={(e) => e.target.select()}
                  placeholder="Nominal Account"
                />
              </Form.Item>

              {/* Code */}
              <Form.Item label="Code" name="code">
                <Input
                  onFocus={(e) => e.target.select()}
                  placeholder="Code"
                  disabled
                />
              </Form.Item>

              {/* Description */}
              <Form.Item label="Description" name="remarks">
                <Input
                  onFocus={(e) => e.target.select()}
                  placeholder="Description"
                />
              </Form.Item>

              {/* Form Actions */}
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={stockAssetLoading}
                >
                  Save
                </Button>
                <Button
                  type="default"
                  style={{ marginLeft: "8px" }}
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              </Form.Item>
            </Form>
          </Col>

          {/* Existing Nominal Accounts */}
          <Col xs={24} sm={12} md={12}>
            <Typography.Text strong>Existing Nominal Accounts</Typography.Text>
            <Table
              columns={columns}
              dataSource={stockAsset}
              size="small"
              loading={loading}
            />
          </Col>
        </Row>
      </Modal>

      {/* Income Account Modal */}
      <Modal
        title="Nominal Account New"
        open={isIncomeAccountModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={750}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={12}>
            <Form
              layout="vertical"
              onFinish={onFinishIncomeAccount}
              form={AccountForm}
            >
              {/* Nominal Account Category */}
              <Form.Item
                label="Nominal Account Category"
                name="name"
                rules={[
                  {
                    required: true,
                    message: "Please input the nominal account category!",
                  },
                ]}
              >
                <Select placeholder="Nominal Account Category">
                  {incomeAssetLoading ? (
                    <Select.Option value="loading" disabled>
                      <Spin />
                    </Select.Option>
                  ) : (
                    incomeAsset1.map((option) => (
                      <Select.Option
                        value={option.accountDescription}
                        key={option.id}
                      >
                        {option.accountDescription} ({option.accountCode})
                      </Select.Option>
                    ))
                  )}
                </Select>
              </Form.Item>

              {/* Section */}
              <Form.Item
                label="Section"
                name="section"
                rules={[
                  { required: true, message: "Please input the section!" },
                ]}
              >
                <Select placeholder="Section">
                  {incomeAssetLoading ? (
                    <Select.Option value="loading" disabled>
                      <Spin />
                    </Select.Option>
                  ) : (
                    incomeAsset2.map((option) => (
                      <Select.Option
                        value={option.accountDescription}
                        key={option.id}
                      >
                        {option.accountDescription} ({option.accountCode})
                      </Select.Option>
                    ))
                  )}
                </Select>
              </Form.Item>

              {/* Nominal Account */}
              <Form.Item
                label="Nominal Account"
                name="accountDescription"
                rules={[
                  {
                    required: true,
                    message: "Please input the nominal account!",
                  },
                ]}
              >
                <Input
                  onFocus={(e) => e.target.select()}
                  placeholder="Nominal Account"
                />
              </Form.Item>

              {/* Code */}
              <Form.Item label="Code" name="code">
                <Input
                  onFocus={(e) => e.target.select()}
                  placeholder="Code"
                  disabled
                />
              </Form.Item>

              {/* Description */}
              <Form.Item label="Description" name="remarks">
                <Input
                  onFocus={(e) => e.target.select()}
                  placeholder="Description"
                />
              </Form.Item>

              {/* Form Actions */}
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={incomeAssetLoading}
                >
                  Save
                </Button>
                <Button
                  type="default"
                  style={{ marginLeft: "8px" }}
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              </Form.Item>
            </Form>
          </Col>

          {/* Existing Nominal Accounts */}
          <Col xs={24} sm={12} md={12}>
            <Typography.Text strong>Existing Nominal Accounts</Typography.Text>
            <Table
              columns={columns}
              dataSource={incomeAsset}
              size="small"
              loading={loading}
            />
          </Col>
        </Row>
      </Modal>

      {/* Expense Account Modal */}
      <Modal
        title="Nominal Account New"
        open={isExpenseAccountModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={750}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={12}>
            <Form
              layout="vertical"
              onFinish={onFinishExpenseAccount}
              form={AccountForm}
            >
              {/* Nominal Account Category */}
              <Form.Item
                label="Nominal Account Category"
                name="name"
                rules={[
                  {
                    required: true,
                    message: "Please input the nominal account category!",
                  },
                ]}
              >
                <Select placeholder="Nominal Account Category">
                  {expenseAssetLoading ? (
                    <Select.Option value="loading" disabled>
                      <Spin />
                    </Select.Option>
                  ) : (
                    expenseAsset1.map((option) => (
                      <Select.Option
                        value={option.accountDescription}
                        key={option.id}
                      >
                        {option.accountDescription} ({option.accountCode})
                      </Select.Option>
                    ))
                  )}
                </Select>
              </Form.Item>

              {/* Section */}
              <Form.Item
                label="Section"
                name="section"
                rules={[
                  { required: true, message: "Please input the section!" },
                ]}
              >
                <Select placeholder="Section">
                  {expenseAssetLoading ? (
                    <Select.Option value="loading" disabled>
                      <Spin />
                    </Select.Option>
                  ) : (
                    expenseAsset2.map((option) => (
                      <Select.Option
                        value={option.accountDescription}
                        key={option.id}
                      >
                        {option.accountDescription} ({option.accountCode})
                      </Select.Option>
                    ))
                  )}
                </Select>
              </Form.Item>

              {/* Nominal Account */}
              <Form.Item
                label="Nominal Account"
                name="accountDescription"
                rules={[
                  {
                    required: true,
                    message: "Please input the nominal account!",
                  },
                ]}
              >
                <Input
                  onFocus={(e) => e.target.select()}
                  placeholder="Nominal Account"
                />
              </Form.Item>

              {/* Code */}
              <Form.Item label="Code" name="code">
                <Input
                  onFocus={(e) => e.target.select()}
                  placeholder="Code"
                  disabled
                />
              </Form.Item>

              {/* Description */}
              <Form.Item label="Description" name="remarks">
                <Input
                  onFocus={(e) => e.target.select()}
                  placeholder="Description"
                />
              </Form.Item>

              {/* Form Actions */}
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={expenseAssetLoading}
                >
                  Save
                </Button>
                <Button
                  type="default"
                  style={{ marginLeft: "8px" }}
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              </Form.Item>
            </Form>
          </Col>

          <Col xs={24} sm={12} md={12}>
            <Typography.Text strong>Existing Nominal Accounts</Typography.Text>
            <Table
              columns={columns}
              dataSource={expenseAsset}
              size="small"
              loading={loading}
            />
          </Col>
        </Row>
      </Modal>

      <div id="sub-menu-wrap">
        <h5>Inventory</h5>
        <ProductionMenu />
      </div>
      <div className="right-side-contents">
        <div className="page-content">
          <div className="page-header">
            <SubMenuToggle />
            <h3 className="page-title">
              <NavLink to="/products/manage">
                <ArrowLeftIcon />
              </NavLink>
              Add Stock Products
            </h3>
          </div>
          <Form
            layout="vertical"
            size="medium"
            className="form-default"
            onFinish={handleSubmit}
            form={form}
            onValuesChange={(changedValues, allValues) => {
              handleFieldChange();
              handleUpdateProductName(changedValues, allValues);
            }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={9}>
                <Form.Item
                  name="category"
                  label="Category"
                  rules={[
                    {
                      required: true,
                      message: "Please select categoty!",
                    },
                  ]}
                >
                  <Select
                    style={{
                      width: "100%",
                    }}
                    placeholder="Select Category"
                    showSearch
                    filterOption={(input, option) =>
                      option.label.toLowerCase().indexOf(input.toLowerCase()) >=
                      0
                    }
                    dropdownRender={(menufieldone) => (
                      <>
                        <Space
                          style={{
                            padding: "0 8px 4px",
                          }}
                        >
                          <Button
                            type="text"
                            icon={<PlusOutlined />}
                            onClick={showCategoryModal}
                          >
                            Add Category
                          </Button>
                        </Space>
                        {menufieldone}
                      </>
                    )}
                    loading={categoryLoading}
                    options={Category.map((item) => ({
                      label: item.name,
                      value: item.name,
                    }))}
                    onSelect={handleCategoryCodeChange}
                  />
                </Form.Item>

                <Form.Item name="type" label="Type">
                  <Select
                    style={{
                      width: "100%",
                    }}
                    placeholder="Select Type"
                    loading={typeLoading}
                    showSearch
                    filterOption={(input, option) =>
                      option.label.toLowerCase().indexOf(input.toLowerCase()) >=
                      0
                    }
                    dropdownRender={(menufieldone) => (
                      <>
                        <Space
                          style={{
                            padding: "0 8px 4px",
                          }}
                        >
                          <Button
                            type="text"
                            icon={<PlusOutlined />}
                            onClick={showTypeModal}
                          >
                            Add Type
                          </Button>
                        </Space>
                        {menufieldone}
                      </>
                    )}
                    options={Type.map((item) => ({
                      label: item.name,
                      value: item.name,
                    }))}
                  />
                </Form.Item>

                <Form.Item name="size" label="Size">
                  <Select
                    style={{
                      width: "100%",
                    }}
                    placeholder="Select Size"
                    showSearch
                    filterOption={(input, option) =>
                      option.label.toLowerCase().indexOf(input.toLowerCase()) >=
                      0
                    }
                    loading={sizeLoading}
                    dropdownRender={(menufieldone) => (
                      <>
                        <Space
                          style={{
                            padding: "0 8px 4px",
                          }}
                        >
                          <Button
                            type="text"
                            icon={<PlusOutlined />}
                            onClick={showSizeModal}
                          >
                            Add Size
                          </Button>
                        </Space>
                        {menufieldone}
                      </>
                    )}
                    options={Size.map((item) => ({
                      label: item.name,
                      value: item.name,
                    }))}
                  />
                </Form.Item>
                <Form.Item
                  label="Product Name"
                  name="name"
                  rules={[
                    {
                      required: true,
                      message: "Please input your Product Name!",
                    },
                  ]}
                >
                  <Input
                    onFocus={(e) => e.target.select()}
                    onChange={handleNameChange}
                  />
                </Form.Item>

                <Form.Item label="Code / Number" name="code">
                  <Input
                    onFocus={(e) => e.target.select()}
                    disabled
                    placeholder="Code / Number"
                  />
                </Form.Item>
                <Form.Item label="Sale Information" name="SaleInformation">
                  <Input.TextArea />
                </Form.Item>
                <Form.Item label="Notes" name="Notes">
                  <Input.TextArea />
                </Form.Item>
              </Col>
              <Col xs={24} md={15}>
                <Row gutter={[16]}>
                  <Col xs={24} sm={12} md={12}>
                    <Form.Item
                      label="Opening Quantity"
                      name="openingQuantity"
                      rules={[
                        {
                          required: true,
                          message: "Please enter Opening Quantity!",
                        },
                      ]}
                    >
                      <Input onFocus={(e) => e.target.select()} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      label="Opening Rate"
                      name="openingRate"
                      rules={[
                        {
                          required: true,
                          message: "Please Enter Opening Rate!",
                        },
                      ]}
                    >
                      <Input onFocus={(e) => e.target.select()} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item name="unit" label="Unit">
                      <Select
                        style={{
                          width: "100%",
                        }}
                        placeholder="Select Unit"
                        showSearch
                        filterOption={(input, option) =>
                          option.label
                            .toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                        }
                        loading={unitLoading}
                        dropdownRender={(menufieldone) => (
                          <>
                            <Space
                              style={{
                                padding: "0 8px 4px",
                              }}
                            >
                              <Button
                                type="text"
                                icon={<PlusOutlined />}
                                onClick={showUnitModal}
                              >
                                Add Unit
                              </Button>
                            </Space>
                            {menufieldone}
                          </>
                        )}
                        options={Unit.map((item) => ({
                          label: item.name,
                          value: item.name,
                        }))}
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12} md={12}>
                    <Form.Item
                      name="stockAssetAccount"
                      label="Stock Asset Account"
                    >
                      <Select
                        style={{
                          width: "100%",
                        }}
                        placeholder="Stock Asset Account"
                        loading={stockAssetLoading}
                        dropdownRender={(menufieldone) => (
                          <>
                            <Space
                              style={{
                                padding: "0 8px 4px",
                              }}
                            >
                              <Button
                                type="text"
                                icon={<PlusOutlined />}
                                onClick={showStockAccountModal}
                              >
                                Add Account
                              </Button>
                            </Space>
                            {menufieldone}
                          </>
                        )}
                        options={stockAsset.map((item) => ({
                          label: `${item.accountDescription} (${item.accountCode})`,
                          value: `${item.accountDescription} (${item.accountCode})`,
                        }))}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={12}>
                    <Form.Item label="Low Stock Level" name="lowStockLevel">
                      <Input onFocus={(e) => e.target.select()} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={12}>
                    <Form.Item name="incomeAccount" label="Income Account">
                      <Select
                        style={{
                          width: "100%",
                        }}
                        placeholder="Stock Asset Account"
                        loading={incomeAssetLoading}
                        dropdownRender={(menufieldone) => (
                          <>
                            <Space
                              style={{
                                padding: "0 8px 4px",
                              }}
                            >
                              <Button
                                type="text"
                                icon={<PlusOutlined />}
                                onClick={showIncomeAccountModal}
                              >
                                Add Account
                              </Button>
                            </Space>
                            {menufieldone}
                          </>
                        )}
                        options={incomeAsset.map((item) => ({
                          label: `${item.accountDescription} (${item.accountCode})`,
                          value: `${item.accountDescription} (${item.accountCode})`,
                        }))}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={12}>
                    <Form.Item label="Sale Price / Rate" name="salePrice">
                      <Input onFocus={(e) => e.target.select()} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={12}>
                    <Form.Item name="expenseAccount" label="Expense Account">
                      <Select
                        style={{
                          width: "100%",
                        }}
                        loading={expenseAssetLoading}
                        placeholder="Expense Account"
                        dropdownRender={(menufieldone) => (
                          <>
                            <Space
                              style={{
                                padding: "0 8px 4px",
                              }}
                            >
                              <Button
                                type="text"
                                icon={<PlusOutlined />}
                                onClick={showExpenseAccountModal}
                              >
                                Add Account
                              </Button>
                            </Space>
                            {menufieldone}
                          </>
                        )}
                        options={expenseAsset.map((item) => ({
                          label: `${item.accountDescription} (${item.accountCode})`,
                          value: `${item.accountDescription} (${item.accountCode})`,
                        }))}
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12} md={6}>
                    <Form.Item label="Date">
                      <DatePicker
                        defaultValue={
                          OpenDate ? dayjs(OpenDate, "YYYY-MM-DD") : dayjs()
                        }
                        onChange={handleDateChange}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item label="Cost" name="cost">
                      <Input onFocus={(e) => e.target.select()} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item label="Sale Discount (%)" name="saleDiscount">
                      <Input onFocus={(e) => e.target.select()} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      label="Purchase Discount (%)"
                      name="purchaseDiscount"
                    >
                      <Input onFocus={(e) => e.target.select()} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item label="Weight" name="weight">
                      <Input onFocus={(e) => e.target.select()} />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12} md={6}>
                    <Form.Item label="GST Rate" name="gstRate">
                      <Input onFocus={(e) => e.target.select()} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      label="Non Filer GST Rate"
                      name="nonFilerGstRate"
                    >
                      <Input onFocus={(e) => e.target.select()} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item label="MRP Ex. Tax" name="mrpExTax">
                      <Input onFocus={(e) => e.target.select()} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item label="MRP Inc. Tax" name="mrpIncTax">
                      <Input onFocus={(e) => e.target.select()} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item label="Bin Location" name="binLocation">
                      <Input
                        onFocus={(e) => e.target.select()}
                        placeholder="Bin Location"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item label="Large Pack Size" name="largePackSize">
                      <Input onFocus={(e) => e.target.select()} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item label="Small Pack Size" name="smallPackSize">
                      <Input onFocus={(e) => e.target.select()} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      name="prefferedSupplier"
                      label="Preferred Supplier"
                    >
                      <Select
                        style={{
                          width: "100%",
                        }}
                        placeholder="Select Supplier"
                        dropdownRender={(menufieldone) => (
                          <>
                            {menufieldone}
                            <Space
                              style={{
                                padding: "0 8px 4px",
                              }}
                            >
                              {/* <Button
                                type="text"
                                icon={<PlusOutlined />}
                                onClick={() => setOpen(true)}
                              >
                                Add Field
                              </Button> */}
                            </Space>
                          </>
                        )}
                        loading={SupplierLoading}
                        notFoundContent={
                          SupplierLoading ? <Spin size="small" /> : null
                        }
                        options={ListOfRecords.map((item) => ({
                          label:
                            item.businessName + " " + `(${item.accountNo})`,
                          value:
                            item.businessName + " " + `(${item.accountNo})`,
                        }))}
                        onSelect={handleSupplierChange}
                      />
                    </Form.Item>
                  </Col>
                  {showInputs && (
                    <Col xs={24} sm={12} md={6}>
                      <Form.Item
                        label="Default Unit"
                        initialValue="Quantity"
                        name="defaultUnit"
                      >
                        <Select placeholder="Select Default Unit">
                          <Select.Option value="Quantity">
                            Quantity
                          </Select.Option>
                          <Select.Option value="Weight">Weight</Select.Option>
                          <Select.Option value="Length">Length</Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  )}
                  <Col xs={24} sm={12} md={12}>
                    <Form.Item>
                      <Checkbox onChange={handleCheckboxChange}>
                        MultiUnit Product
                      </Checkbox>
                    </Form.Item>
                  </Col>

                  {showInputs && (
                    <>
                      <Col xs={24} sm={12} md={6}>
                        <Form.Item name="openingWeight" label="Opening Weight">
                          <Input onFocus={(e) => e.target.select()} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12} md={6}>
                        <Form.Item name="openingLength" label="Opening Length">
                          <Input onFocus={(e) => e.target.select()} />
                        </Form.Item>
                      </Col>
                    </>
                  )}
                </Row>
              </Col>
            </Row>

            <Collapse>
              <Collapse.Panel header="Advance Options">
                <Typography.Text>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={10}>
                      <Form.Item
                        name="Image"
                        label="Add Image"
                        valuePropName="fileList"
                        getValueFromEvent={normFile}
                      >
                        <Upload.Dragger
                          name="file"
                          multiple={false}
                          listType="picture-card"
                          showUploadList={{
                            showPreviewIcon: true,
                            showRemoveIcon: true,
                          }}
                          onChange={onFileChange} // Handle file change
                        >
                          <p className="ant-upload-drag-icon">
                            <InboxOutlined />
                          </p>
                          <p className="ant-upload-text">
                            Click or drag file to this area to upload
                          </p>
                        </Upload.Dragger>
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={14}>
                      <Row gutter={[16]}>
                        <Col xs={24} sm={12}>
                          <Form.Item label="Field 1" name="field1">
                            <Input
                              onFocus={(e) => e.target.select()}
                              placeholder="Field 1"
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Form.Item label="Field 2" name="field2">
                            <Input
                              onFocus={(e) => e.target.select()}
                              placeholder="Field 2"
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Form.Item label="Field 3" name="field3">
                            <Input
                              onFocus={(e) => e.target.select()}
                              placeholder="Field 3"
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Form.Item label="Field 4" name="field4">
                            <Input
                              onFocus={(e) => e.target.select()}
                              placeholder="Field 4"
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Form.Item label="Field A" name="fieldA">
                            <Input.TextArea placeholder="Field A" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Form.Item label="Field B" name="fieldB">
                            <Input.TextArea placeholder="Field B" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Form.Item label="Field C" name="fieldC">
                            <Input.TextArea placeholder="Field C" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Form.Item label="Field D" name="fieldD">
                            <Input.TextArea placeholder="Field D" />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Typography.Text>
              </Collapse.Panel>
            </Collapse>
            <br />
            <Form.Item>
              <Flex justify="space-between" align="center">
                <NavLink to="/products/manage">
                  <Button type="default">Cancel</Button>
                </NavLink>

                <Button type="primary" htmlType="submit" loading={loading}>
                  Add Stock Product
                </Button>
              </Flex>
            </Form.Item>
          </Form>
        </div>
      </div>
    </>
  );
}

export default AddStockProducts;
