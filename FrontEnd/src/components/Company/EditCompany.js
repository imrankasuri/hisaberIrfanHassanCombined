import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Button,
  message,
  Popconfirm,
  Select,
  Skeleton,
  Modal,
} from "antd";
import axios from "axios";
import Config from "../../Config";
import SubMenuToggle from "../Common/SubMenuToggle";
import { DeleteOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2 MB

const FileInput = ({ onFileChange, imageSelected, field }) => (
  <div
    className={`upload-box ${imageSelected ? "dragging" : ""}`}
    id="drop-area"
  >
    <label htmlFor={`file-upload-${field}`} className="file-upload-label">
      {imageSelected ? (
        <>
          <span className="button button-outline-primary mt-3">Re Upload</span>
          <input
            id={`file-upload-${field}`}
            type="file"
            accept="image/jpeg,image/png"
            style={{ display: "none" }}
            onChange={onFileChange}
          />
        </>
      ) : (
        <>
          <h4>Drag and drop your document</h4>
          <p>Max size 2 MB. Files allowed: JPG, PNG</p>
          <span className="button button-outline-primary">Browse File</span>
          <input
            id={`file-upload-${field}`}
            type="file"
            accept="image/jpeg,image/png"
            style={{ display: "none" }}
            onChange={onFileChange}
          />
        </>
      )}
    </label>
  </div>
);

const EditCompany = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [CustomerLoading, setCustomerLoading] = useState(false);
  const [company, setCompany] = useState({});
  const [form] = Form.useForm();
  const AccessKey = localStorage.getItem("AccessKey");
  const CompanyID = localStorage.getItem("CompanyID");
  const [currency, setCurrency] = useState("");
  const [CompanyDeleteLoading, setCompanyDeleteLoading] = useState(false);
  const [Open, setOpen] = useState(false);
  const [imageSelected, setImageSelected] = useState({
    logoLogin: false,
    logoTitle: false,
    logoReports: false,
  });
  const storedRoles = JSON.parse(localStorage.getItem("roles"));
  const [files, setFiles] = useState({
    logoLogin: null,
    logoTitle: null,
    logoReports: null,
  });

  const [DeleteForm] = Form.useForm();

  useEffect(() => {
    document.title = "Edit Company";

    fetchCompanyData();
  }, [AccessKey, CompanyID, form]);

  const fetchCompanyData = async () => {
    setCustomerLoading(true);
    try {
      const response = await axios.get(
        Config.base_url + `CompanyInfo/GetCompany/${CompanyID}`,
        {
          headers: {
            Authorization: `Bearer ${AccessKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status_code === 1) {
        setCompany(response.data.companyData);
        form.setFieldsValue(response.data.companyData);
        setCustomerLoading(false);
      } else {
        setCustomerLoading(false);
      }
    } catch (error) {
      message.error("Network Error...");
      setCustomerLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    if (!storedRoles.includes("0d42ee65-ea41-421e-81a3-af81fa61dcb8")) {
      message.error("You don't have access to perform this task.");
      return;
    }

    setLoading(true);
    try {
      const data = { ...company, ...formData };
      const response = await axios.patch(
        Config.base_url + `CompanyInfo/UpdateRecord`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${AccessKey}`,
          },
        }
      );
      if (response.data.status_code == 1) {
        message.success(response.data.status_message);
        fetchCompanyData();
        localStorage.setItem("CompanyName", data.name);
        localStorage.setItem("CompanyAddress", data.address);
        form.resetFields();

        await Promise.all(
          ["LogoLogin", "LogoTitle", "LogoReports"].map(async (type) => {
            if (files[type]) {
              await updateProfileImage(type);
            }
          })
        );
        setLoading(false);
      } else {
        message.error(response.data.status_message);
        setLoading(false);
      }
    } catch (error) {
      message.error("Network Error..");
      setLoading(false);
    }
  };

  const deleteCompany = async () => {
    if (!storedRoles.includes("0d42ee65-ea41-421e-81a3-af81fa61dcb8")) {
      message.error("You don't have access to perform this task.");
      return;
    }

    const data = {
      ID: CompanyID,
    };

    try {
      const response = await axios.post(
        `${Config.base_url}Reset/delete-company-email`,
        data,
        {
          headers: {
            Authorization: `Bearer ${AccessKey}`,
          },
        }
      );
      const { status_code, status_message } = response.data;
      if (status_code === 1) {
        message.success(status_message);
        setOpen(true);
      } else {
        message.error(status_message);
      }
    } catch (error) {
      message.error("Network Error...");
    }
  };

  const handleCurrencyChange = (value) => {
    setCurrency(value);
    ////Console.log("Selected currency:", value);
  };

  const handleFileInput = (event, type) => {
    event.preventDefault();
    const selectedFile = event.target.files[0] || event.dataTransfer.files[0];

    if (selectedFile) {
      const fileSize = selectedFile.size;
      const fileType = selectedFile.type;

      // Check file size
      if (fileSize > MAX_IMAGE_SIZE) {
        message.error("Image size must be less than 2 MB");
        setFiles((prev) => ({ ...prev, [type]: null }));
        return;
      }

      // Check file type
      if (fileType !== "image/jpeg" && fileType !== "image/png") {
        message.error("Only JPG and PNG files are allowed.");
        setFiles((prev) => ({ ...prev, [type]: null }));
        return;
      }

      // Load image to check dimensions
      const img = new Image();
      img.onload = () => {
        let validDimensions = true;

        // Check dimensions based on logo type
        if (type === "LogoLogin" && (img.width !== 250 || img.height !== 250)) {
          message.error("Login logo must be 250x250 pixels.");
          validDimensions = false;
        } else if (
          type === "LogoTitle" &&
          (img.width !== 500 || img.height !== 500)
        ) {
          message.error("Title logo must be 500x500 pixels.");
          validDimensions = false;
        } else if (
          type === "LogoReports" &&
          (img.width !== 800 || img.height !== 800)
        ) {
          message.error("Reports logo must be 800x800 pixels.");
          validDimensions = false;
        }

        if (validDimensions) {
          setFiles((prev) => ({ ...prev, [type]: selectedFile }));
          setImageSelected((prev) => ({ ...prev, [type]: true }));
        } else {
          setFiles((prev) => ({ ...prev, [type]: null }));
        }
      };

      img.src = URL.createObjectURL(selectedFile);
    }
  };

  const updateProfileImage = async (type) => {
    if (!files[type]) {
      message.error(`Please select an image for ${type}.`);
      return;
    }

    const formData = new FormData();
    formData.append("file", files[type]);

    try {
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
      if (response.data.status_code == 1) {
        message.success(response.data.status_message);
        setFiles((prev) => ({ ...prev, [type]: null })); // Clear the file after successful upload
        setImageSelected((prev) => ({ ...prev, [type]: false })); // Reset image selection state
      } else {
        message.error(response.data.status_message);
      }
    } catch (error) {
      message.error("Network Error...");
    }
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const onFinish = async (FormData) => {
    if (!storedRoles.includes("0d42ee65-ea41-421e-81a3-af81fa61dcb8")) {
      message.error("You don't have access to perform this task.");
      return;
    }

    const data = {
      ID: CompanyID,
      CompanyCode: FormData.code,
    };

    try {
      setCompanyDeleteLoading(true);

      const response = await axios.post(
        `${Config.base_url}Reset/delete-company`,
        data,
        {
          headers: {
            Authorization: `Bearer ${AccessKey}`,
          },
        }
      );

      const { status_code, status_message } = response.data;
      if (status_code === 1) {
        message.success(status_message);
        setOpen(false);
        setCompanyDeleteLoading(false);
        DeleteForm.resetFields();
        localStorage.clear();
        navigate("/");
      } else {
        message.error(status_message);
        setCompanyDeleteLoading(false);
      }
    } catch (error) {
      message.error("Network Error...");
      setCompanyDeleteLoading(false);
    }
  };

  return (
    <>
      <Modal
        title="Delete Company"
        open={Open}
        onCancel={handleCancel}
        footer={null}
      >
        <Form layout="vertical" onFinish={onFinish} form={DeleteForm}>
          <p>A code sent to your email.</p>
          <Form.Item
            label="Code"
            name="code"
            rules={[
              {
                required: true,
                message: "Please input the code!",
              },
            ]}
          >
            <Input onFocus={(e) => e.target.select()} placeholder="Code" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={CompanyDeleteLoading}
            >
              Delete
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

      <div className="right-side-contents">
        <div className="page-content">
          <div className="page-header">
            <SubMenuToggle />
            <h3 className="page-title">Edit Company</h3>
            <Link className="delete-icon" style={{ color: "black" }}>
              <Popconfirm
                title="Delete Company"
                description="Are you sure to delete this company?"
                onConfirm={deleteCompany}
                okText="Yes"
                cancelText="No"
              >
                <ul className="inline-action">
                  <li>
                    <div className="red">
                      <DeleteOutlined />
                    </div>
                  </li>
                </ul>
              </Popconfirm>
            </Link>
          </div>

          <Row justify="center">
            <Col xs={24} md={12}>
              <Card>
                {CustomerLoading ? (
                  <>
                    <Skeleton active />
                    <Skeleton active />
                    <Skeleton active />
                  </>
                ) : (
                  <>
                    <Form
                      form={form}
                      layout="vertical"
                      size="large"
                      className="form-default"
                      onFinish={handleSubmit}
                    >
                      <Row gutter={[24, 0]}>
                        {[
                          "name",
                          "mobile",
                          "phone",
                          "ntn",
                          "website",
                          "fax",
                          "address",
                        ].map((field, index) => (
                          <Col xs={24} md={index < 6 ? 12 : 24} key={field}>
                            <Form.Item
                              label={
                                field.charAt(0).toUpperCase() + field.slice(1)
                              }
                              name={field}
                              rules={[{ required: index != 5 ? true : false }]}
                            >
                              <Input />
                            </Form.Item>
                          </Col>
                        ))}
                        <Col xs={24} md={24}>
                          <Form.Item
                            label="Currency"
                            name="currency"
                            rules={[
                              {
                                required: true,
                                message: "Please select a currency!",
                              },
                            ]}
                          >
                            <Select
                              placeholder="Select a currency"
                              onChange={handleCurrencyChange}
                            >
                              <Select.Option value="PKR">PKR</Select.Option>
                              <Select.Option value="USD">
                                US Dollar
                              </Select.Option>
                              <Select.Option value="GBP">
                                UK Pound
                              </Select.Option>
                            </Select>
                          </Form.Item>
                        </Col>
                        {["LogoLogin", "LogoTitle", "LogoReports"].map(
                          (field, index) => (
                            <Col xs={24} md={index != 2 ? 12 : 24} key={field}>
                              <Form.Item
                                label={field.replace(/([A-Z])/g, " $1").trim()}
                                name={field}
                              >
                                <FileInput
                                  onFileChange={(event) =>
                                    handleFileInput(event, field)
                                  }
                                  imageSelected={imageSelected[field]}
                                  field={field}
                                />
                              </Form.Item>
                            </Col>
                          )
                        )}
                        <Col xs={24} className="text-center mt-4">
                          <Form.Item>
                            <Button
                              type="primary"
                              className="button-normal"
                              htmlType="submit"
                              loading={loading}
                            >
                              Update Company
                            </Button>
                          </Form.Item>
                        </Col>
                      </Row>
                    </Form>
                  </>
                )}
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </>
  );
};

export default EditCompany;
