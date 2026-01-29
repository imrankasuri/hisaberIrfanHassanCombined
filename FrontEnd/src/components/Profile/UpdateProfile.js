import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Col,
  Row,
  Card,
  Form,
  Input,
  Button,
  message,
  Space,
  Select,
  Image,
  Flex,
} from "antd";

import ProfileMenu from "./ProfileMenu";
// import Cropper, { ReactCropperElement } from "react-cropper";
// import "cropperjs/dist/cropper.css";
import Config from "../../Config";
import SubMenuToggle from "../Common/SubMenuToggle";
import LoginCheck from "../Shared/LoginCheck";

function UpdateProfile(props) {
  const onFinish = (values) => {
    ////Console.log("Success:", values);
    // Add logic to save the form data
  };

  const Name = localStorage.getItem("Full_Name");
  const mobile = localStorage.getItem("Mobile_No");
  const [AccessKey, setAccessKey] = useState(localStorage.getItem("AccessKey"));
  const [UserID, setUserID] = useState(localStorage.getItem("ID"));
  const [Email, setEmail] = useState(localStorage.getItem("Email_Address"));
  const { TextArea } = Input;
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const [fileList, setFileList] = useState([]);
  const [imageUploaded, setImageUploaded] = useState(false);
  const [newNameLoading, setNewNameLoading] = useState(false);
  const [NewName, setNewName] = useState(Name);

  const [newAddressLoading, setNewAddressLoading] = useState(false);
  const [NewAddress, setNewAddress] = useState(mobile);
  const [upload_image, setupload_image] = useState(false);

  // imgage
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState("");
  const [cropData, setCropData] = useState("#");
  const [cropper, setCropper] = useState();
  const [imageSelected, setImageSelected] = useState(false);
  const [imageCropped, setImageCropped] = useState(false);
  const [isUpdated, setIsUpdated] = useState(false);

  const [profile, setProfileData] = useState({});

  // messages
  const [messageApi, contextHolder] = message.useMessage();

  const [newCountryLoading, setNewCountryLoading] = useState(false);

  const [NewcountryName, setNewCountryName] = useState("");
  const [country, setCountry] = useState({});
  const [countries, setCountries] = useState([]);
  const [countriesOld, setCountriesOld] = useState([]);
  const [file, setFile] = useState(null);
  const { Option } = Select;
  const [form] = Form.useForm();

  let navigate = useNavigate();

  useEffect(() => {
    document.title = "Edit Profile";
  }, []);

  const UpdateName = () => {
    if (NewName == "") {
      messageApi.open({
        type: "error",
        content: "Please enter name",
      });
      return false;
    }

    setNewNameLoading(true);

    var api_config = {
      method: "post",
      url:
        Config.base_url +
        `Account/ChangeFullName?id=${UserID}&fullName=${NewName}`,
      headers: {
        Authorization: `Bearer ${AccessKey}`,
        "Content-Type": "application/json",
      },
    };

    axios(api_config)
      .then(function (response) {
        ////Console.log(response.data);
        if (response.data.status_code == 1) {
          setNewNameLoading(false);
          message.success(response.data.status_message);
          setNewName("");
          localStorage.setItem("Full_Name", NewName);
          navigate("/dashboard");
        } else {
          setNewNameLoading(false);
          messageApi.open({
            type: "error",
            content: response.data.status_message,
          });

          // settriggerUpdate(true);
        }
      })
      .catch(function (error) {
        ////Console.log(error);
        message.error("Network Error");
      });
  };

  const updateAddress = () => {
    if (NewAddress == "") {
      messageApi.open({
        type: "error",
        content: "Please enter mobile",
      });
      return false;
    }

    setNewAddressLoading(true);

    var api_config = {
      method: "post",
      url:
        Config.base_url +
        `Account/ChangePhoneNumber?id=${UserID}&phoneNumber=${NewAddress}`,
      headers: {
        Authorization: `Bearer ${AccessKey}`,
        "Content-Type": "application/json",
      },
    };

    axios(api_config)
      .then(function (response) {
        ////Console.log(response.data);
        if (response.data.status_code == 1) {
          setNewAddressLoading(false);
          message.success(response.data.status_message);

          setNewAddress("");
          localStorage.setItem("Mobile_No", NewAddress);
          navigate("/dashboard");
        } else {
          setNewAddressLoading(false);
          message.error(response.data.status_message);
        }
      })
      .catch(function (error) {
        ////Console.log(error);
        message.error("Network Error...");
      });
  };

  const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

  const updateProfile_Img = async () => {
    setupload_image(true);
    if (!file) {
      setupload_image(false);
      messageApi.open({
        type: "error",
        content: "Please select an image.",
      });
      return;
    }
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        Config.base_url + `Pictures/AddImage/${UserID}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${AccessKey}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      ////Console.log(response.data);
      ////Console.log("File uploaded successfully, ID:", response.data.id);
      messageApi.open({
        type: "success",
        content: "Profiel picture has saved successfully.",
      });
      setFile(null);
      setImageSelected(false);
      setupload_image(false);
      navigate("/dashboard");
      window.location.reload();
    } catch (error) {
      console.error("Error uploading file:", error);
      messageApi.open({
        type: "error",
        content: "Error uploading file",
      });
      setupload_image(false);
    }
  };

  const onFileChange = (e) => {
    setImageSelected(true);
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const fileSize = selectedFile.size;
      const fileType = selectedFile.type;

      if (fileSize > MAX_IMAGE_SIZE) {
        setImageSelected(false);
        messageApi.open({
          type: "error",
          content: "Image size must be less than 2 MB",
        });
        setFile(null);
        return;
      }

      if (fileType !== "image/jpeg" && fileType !== "image/png") {
        messageApi.open({
          type: "error",
          content: "Only JPG,PNG files are allowed.",
        });
        setFile(null);
        return;
      }

      setFile(selectedFile);
    }
  };

  const [dragging, setDragging] = useState(false);

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragging(true);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    setImageSelected(true);

    const files = event.dataTransfer.files;

    if (files.length > 0) {
      const selectedFile = files[0];
      const fileSize = selectedFile.size;
      const fileType = selectedFile.type;

      if (fileSize > MAX_IMAGE_SIZE) {
        setImageSelected(false);
        messageApi.open({
          type: "error",
          content: "Image size must be less than 2 MB",
        });
        setFile(null);
        return;
      }

      if (fileType !== "image/jpeg" && fileType !== "image/png") {
        messageApi.open({
          type: "error",
          content: "Only JPG and PNG files are allowed.",
        });
        setFile(null);
        return;
      }

      setFile(selectedFile);
    }
  };

  const getFirstChar = (str) => {
    const firstChars = str
      .split(" ")
      .map((word) => word[0])
      .join("");
    return firstChars;
  };

  return (
    <>
      {contextHolder}
      <LoginCheck />

      <div id="sub-menu-wrap">
        <h5>Profile</h5>
        <ProfileMenu />
      </div>
      <div className="right-side-contents">
        <div className="page-content">
          <div className="page-header">
            <SubMenuToggle />
            <h3 className="page-title">Profile</h3>
          </div>

          <Row gutter={[24, 24]}>
            <Col md={{ span: 16 }} xs={24}>
              <Card bordered={false} loading={loading}>
                <div className="profile-wrap">
                  <Form
                    name="basic"
                    layout="vertical"
                    size="large"
                    onFinish={onFinish}
                    autoComplete="off"
                    form={form}
                  >
                    <Row gutter={[24, 0]} align={"top"}>
                      <Col xs={24} md={24}>
                        <Form.Item
                          label="Full Name"
                          name="Full_Name"
                          rules={[
                            {
                              required: true,
                              message: "Please input your full name!",
                            },
                          ]}
                        >
                          <Space.Compact
                            style={{
                              width: "100%",
                            }}
                          >
                            <Input
                              value={NewName}
                              onChange={(e) => setNewName(e.target.value)}
                            />
                            <Button
                              type="default"
                              onClick={UpdateName}
                              loading={newNameLoading}
                            >
                              Update
                            </Button>
                          </Space.Compact>
                        </Form.Item>
                      </Col>

                      <Col xs={24} md={24}>
                        <Form.Item
                          label="Mobile Number"
                          name="Address"
                          rules={[
                            {
                              required: true,
                              message: "Please input your address!",
                            },
                          ]}
                        >
                          <Space.Compact
                            style={{
                              width: "100%",
                            }}
                          >
                            <Input
                              value={NewAddress}
                              onChange={(e) => setNewAddress(e.target.value)}
                            />
                            <Button
                              type="default"
                              onClick={updateAddress}
                              loading={newAddressLoading}
                            >
                              Update
                            </Button>
                          </Space.Compact>
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={{ span: 24 }} align={"middle"}>
                        <Form.Item
                          label="Profile Picture"
                          name="ProfilePicture"
                          rules={[
                            {
                              required: !imageUploaded, // Make it required if no image uploaded
                              message: "Please upload an image!",
                            },
                          ]}
                        >
                          <div
                            className={`upload-box ${
                              dragging ? "dragging" : ""
                            }`}
                            id="drop-area"
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                          >
                            {imageSelected ? (
                              <>
                                {/* <Cropper
                                zoomTo={0}
                                aspectRatio={8 / 8}
                                preview=".img-preview"
                                src={image}
                                dragMode="move"
                                viewMode={2}
                                minCropBoxHeight={10}
                                minCropBoxWidth={10}
                                background={false}
                                responsive={true}
                                autoCropArea={1}
                                checkOrientation={false} // https://github.com/fengyuanchen/cropperjs/issues/671
                                onInitialized={(instance) => {
                                  setCropper(instance);
                                }}
                                guides={true}
                              /> */}
                                <div style={{ marginTop: "15px" }}>
                                  <label htmlFor="ChoosePhoto1">
                                    <span
                                      htmlFor="ChoosePhoto1"
                                      type="button"
                                      className="button button-outline-primary mt-3"
                                    >
                                      Re Upload
                                    </span>
                                    <input
                                      style={{
                                        position: "absolute",
                                        opacity: "0",
                                      }}
                                      id="ChoosePhoto1"
                                      accept="image/jpeg,image/png"
                                      type="file"
                                      onChange={onFileChange}
                                    />
                                  </label>
                                </div>
                              </>
                            ) : (
                              <>
                                <label htmlFor="ChoosePhoto">
                                  <h4>Drag and drop your document</h4>
                                  <p>Max size 2 MB. Files allowed: JPG, PNG</p>
                                  <span
                                    htmlFor="ChoosePhoto"
                                    type="button"
                                    className="button button-outline-primary"
                                  >
                                    Browse File
                                  </span>
                                  <input
                                    id="ChoosePhoto"
                                    style={{
                                      position: "absolute",
                                      opacity: "0",
                                    }}
                                    accept="image/jpeg,image/png"
                                    type="file"
                                    onChange={onFileChange}
                                  />
                                </label>
                              </>
                            )}
                          </div>
                        </Form.Item>
                        <Form.Item>
                          <Button
                            type="primary"
                            block
                            shape="rounded"
                            loading={upload_image}
                            onClick={updateProfile_Img}
                          >
                            Save Photo
                          </Button>
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form>
                </div>
              </Card>
            </Col>
            {props.image ? (
              <Col
                xs={24}
                md={8}
                className="flex-image"
                style={{ maxHeight: "300px", maxWidth: "350px" }}
              >
                <Image
                  width="100%"
                  height={"100%"}
                  src={props.image}
                  // preview={false}
                  alt="Uploaded"
                  className="rounded-pill"
                />
              </Col>
            ) : (
              <>
                <Col
                  xs={24}
                  md={8}
                  className="flex-image rounded-pill profile-loadBox"
                  style={{ maxHeight: "300px", maxWidth: "350px" }}
                >
                  <Flex align="center" gap="middle">
                    <div className="profile-loadtext">{getFirstChar(Name)}</div>
                  </Flex>
                </Col>
              </>
            )}
          </Row>
        </div>
      </div>
    </>
  );
}

export default UpdateProfile;
