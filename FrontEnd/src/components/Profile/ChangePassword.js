import React, { useState, useEffect } from "react";
import { Col, Row, Card, Form, Input, Button, message, Space } from "antd";
import ProfileMenu from "./ProfileMenu";
import axios from "axios";
import Config from "../../Config";
import SubMenuToggle from "../Common/SubMenuToggle";
import { useNavigate } from "react-router-dom";

function ChangePassword(props) {
  const [AccessKey, setAccessKey] = useState(localStorage.getItem("AccessKey"));
  const [Email, setEmail] = useState(localStorage.getItem("Email_Address"));
  const userID = localStorage.getItem("ID");

  const [loading, setLoading] = useState(false);

  // messages
  const [messageApi, contextHolder] = message.useMessage();

  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [timer, setTimer] = useState(60); // 60 seconds

  useEffect(() => {
    document.title = "Change Password";
  }, []);

  const navigate = useNavigate();

  const onFinish = (formData) => {
    ////Console.log("data", formData.NewPassword);
    setLoading(true);

    axios
      .get(`${Config.base_url}OTPSent/GetOTPdata/${userID}`, {
        headers: {
          Authorization: `Bearer ${AccessKey}`,
        },
      })
      .then((response) => {
        ////Console.log(response.data.data);

        const data = {
          ...formData,
        };
        if (response.data.data.otp === data.AuthorizationCode) {
          var api_config = {
            method: "post",
            url:
              Config.base_url +
              `Account/ChangePassword/${response.data.data.expiryDate}`,
            headers: {
              Authorization: `Bearer ${AccessKey}`,
              "Content-Type": "application/json",
            },
            data: data,
          };
          axios(api_config)
            .then(function (response) {
              ////Console.log(response.data);
              if (response.data.status_code == 1) {
                setLoading(false);
                message.success(response.data.status_message);
                navigate("/dashboard");
              } else {
                setLoading(false);
                message.error(response.data.status_message);
              }
            })
            .catch(function (error) {
              message.error("Network Error");
            });
        } else {
          message.error("OTP is not valid.");
          setLoading(false);
        }
      })

      .catch((error) => {
        message.error("Network Error");
      });
  };

  const handleSendCode = () => {
    setIsButtonDisabled(true);
    axios
      .post(
        `${Config.base_url}Account/Otp-send/${Email}?subject=[HISAABER] Change Password OTP&title=Change Your Password&data=Your change password OTP is`,
        {},
        {
          headers: {
            Authorization: `Bearer ${AccessKey}`,
          },
        }
      )
      .then((response) => {
        if (response.data.status_code === 1) {
          message.success(response.data.status_message);
          try {
            axios.post(
              `${Config.base_url}OTPSent/SendOTP`,
              {
                memberID: userID,
                emailAddress: Email,
                transactionType: "ChangePassword",
                otp: response.data.verificationCode,
                isActive: true,
                isDeleted: false,
              },
              {
                headers: {
                  Authorization: `Bearer ${AccessKey}`,
                },
              }
            );
          } catch (error) {
            message.error("Network Error...");
          }
          try {
            axios.post(Config.base_url + "EmailLog/RegisterEmail", {
              emailTo: Email,
              emailFrom: "noreply@hisaaber.com",
              subject: "[HISAABER] Change Password OTP",
              reference: "Personal",
              eventType: "ChangePassword",
              deliveryStatus: "Success",
              isActive: true,
              isDeleted: false,
            });
          } catch (error) {
            message.error("Network Error..");
          }
        } else {
          message.error(response.data.status_message);
        }
      })
      .catch((error) => {
        setIsButtonDisabled(false);
        messageApi.open({
          type: "error",
          content: "Fail to send Authentication code",
        });
      });

    setTimeout(() => {
      setIsButtonDisabled(false);
    }, 60000);
    setTimer(60);
  };

  return (
    <>
      <div id="sub-menu-wrap">
        <h5>Profile</h5>
        <ProfileMenu />
      </div>

      <div className="right-side-contents">
        <div className="page-content">
          <div className="page-header">
            <SubMenuToggle />
            <h3 className="page-title">Change Password</h3>
          </div>
          <Row>
            <Col md={{ span: 8 }} xs={24}>
              <Card bordered={false}>
                <div className="profile-wrap">
                  <Form
                    name="basic"
                    layout="vertical"
                    size="large"
                    onFinish={onFinish}
                    className="form-default"
                    autoComplete="off"
                  >
                    <Form.Item
                      label="Old Password"
                      name="oldPassword"
                      rules={[
                        {
                          required: true,
                          message: "Please input your old password!",
                        },
                      ]}
                    >
                      <Input.Password />
                    </Form.Item>
                    <Form.Item
                      label="New Password"
                      name="newPassword"
                      rules={[
                        {
                          required: true,
                          message: "Please input your password!",
                        },
                      ]}
                    >
                      <Input.Password />
                    </Form.Item>
                    <Form.Item
                      label="Confirm Password"
                      name="confirmPassword"
                      rules={[
                        {
                          required: true,
                          message: "Please input your password!",
                        },
                      ]}
                    >
                      <Input.Password />
                    </Form.Item>
                    {/* <Row gutter={20} align={'middle'}>
                                    <Col xs={24} md={18}>
                                        <Form.Item
                                            label="Email Authentication Code"
                                            name="AuthorizationCode"
                                            autoComplete={false}
                                            rules={[
                                                {
                                                    required: true,
                                                    message: 'Please enter valid verification code!',
                                                },
                                            ]}
                                        >
                                            <Input />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={6}>
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            className="mt-3"
                                            block
                                            loading={codeloading}
                                            disabled={true} // Conditionally enable the button based on authCodeValid
                                        >
                                            Get Code
                                        </Button>
                                    </Col>
                                </Row> */}
                    <Form.Item
                      name="AuthorizationCode"
                      label="Authentication Code"
                      rules={[
                        {
                          required: true,
                          message: "Please enter Authentication Code",
                        },
                      ]}
                    >
                      <Space.Compact
                        style={{
                          width: "100%",
                        }}
                      >
                        <Input />
                        <Button
                          type="default"
                          onClick={handleSendCode}
                          disabled={isButtonDisabled}
                        >
                          GET CODE
                        </Button>
                      </Space.Compact>
                    </Form.Item>
                    <Form.Item>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                      >
                        Save
                      </Button>
                    </Form.Item>
                  </Form>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </>
  );
}

export default ChangePassword;
