import React, { useState, useEffect } from "react";
import ProfileMenu from "./ProfileMenu";
import LoginCheck from "../shared/LoginCheck";
import Config from "../../../Config";
import SubMenuToggle from "../../Common/SubMenuToggle";
import { Col, Row, Card, Form, Input, Button, message, Space } from "antd";
import axios from "axios";
import SendEmail from "../shared/SendEmail";

function ChangePin(props) {
  const [OTP, setOTP] = useState("");
  const [OTP1, setOTP1] = useState("");
  const [AccessKey, setAccessKey] = useState(localStorage.getItem("AccessKey"));
  const [UserID, setUserID] = useState(localStorage.getItem("ID"));
  const [Email, setEmail] = useState(localStorage.getItem("Email_Address"));
  const [loading, setLoading] = useState(false);
  const [loadingUpdateSmartpass, setloadingUpdateSmartpass] = useState(false);
  const [AuthCode, setAuthCode] = useState("");
  const [SmartPassStatus, setSmartPassStatus] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  useEffect(() => {
    document.title = "Change Security Pass";
    setLoading(true);
    const data = {
      AccessKey: AccessKey,
      UserID: UserID,
    };

    var api_config = {
      method: "post",
      url: config.base_url + "Members/GetSmartPassInfo",
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    axios(api_config)
      .then(function (response) {
        ////Console.log(response.data);
        if (response.data.status_code == 1) {
          setSmartPassStatus(response.data.Status);
          setLoading(false);
        }
      })
      .catch(function (error) {
        messageApi.open({
          type: "error",
          content: "Network Error.",
        });
      });
  }, []);

  const handleUpdateSmartPass = (formData) => {
    if (formData.NewPin == formData.ConfirmPin) {
      if (SmartPassStatus == true) {
        if (formData.AuthorizationCode == "") {
          messageApi.open({
            type: "error",
            content: "Please enter verification code",
          });

          return false;
        }
      }

      setloadingUpdateSmartpass(true);

      const data = {
        AccessKey: AccessKey,
        UserID: UserID,
        //OldPin: OldPin,
        // NewPin: OTP,
        // AuthorizationCode: AuthCode,
        ...formData,
      };

      var api_config = {
        method: "post",
        url: config.base_url + "Members/ChangeSmartPass",
        headers: {
          "Content-Type": "application/json",
        },
        data: data,
      };

      axios(api_config)
        .then(function (response) {
          if (response.data.status_code == 1) {
            messageApi.open({
              type: "success",
              content: response.data.status_message,
            });
            window.location.reload();

            setloadingUpdateSmartpass(false);
          } else {
            messageApi.open({
              type: "error",
              content: response.data.status_message,
            });
            setloadingUpdateSmartpass(false);
          }
        })
        .catch(function (error) {
          messageApi.open({
            type: "error",
            content: "Network Error.",
          });
        });
    } else {
      messageApi.open({
        type: "error",
        content: "Smart pass does not match",
      });
    }
  };

  const [timer, setTimer] = useState(60); // 60 seconds

  const handleSendCode = () => {
    const props = {
      TransactionType: "SmartPassChange",
    };

    if (SendEmail(props)) {
      setIsButtonDisabled(true);

      messageApi.open({
        type: "success",
        content: "Authentication code has been sent",
      });
    } else {
      setIsButtonDisabled(false);

      messageApi.open({
        type: "error",
        content: "Fail to send Authentication code",
      });
    }

    // setIsButtonDisabled(true);

    // Enable the button after 1 minute
    setTimeout(() => {
      setIsButtonDisabled(false);
      setTimer(60); // Reset the timer to 60 seconds after enabling the button
    }, 60000);

    // Start the timer countdown
    setTimer(60);
  };

  return (
    <>
      {contextHolder}
      <LoginCheck />
      <h3 className="card-title">Profile</h3>

      <Row gutter={[24, 24]}>
        <Col md={6} xs={24}>
          <ProfileMenu />
        </Col>
        <Col md={{ span: 16, offset: 2 }} xs={24}>
          <Card title="Change Security Pass" bordered={false}>
            <div className="profile-wrap">
              {SmartPassStatus == false ? (
                <>
                  <Form
                    name="basic"
                    layout="vertical"
                    size="large"
                    onFinish={handleUpdateSmartPass}
                    autoComplete="off"
                  >
                    <Form.Item
                      label="New Security Pass"
                      name="NewPin"
                      rules={[
                        {
                          required: true,
                          message: "Please enter your 6-digit Security Pass.",
                        },
                        {
                          pattern: /^\d{6}$/,
                          message: "Please enter a 6-digit number.",
                        },
                      ]}
                    >
                      <Input type="number" maxLength={6} showCount />
                    </Form.Item>
                    <Form.Item
                      label="Confirm Security Pass"
                      name="ConfirmPin"
                      dependencies={["New_Pin"]}
                      rules={[
                        {
                          required: true,
                          message: "Please enter your 6-digit Security Pass.",
                        },
                        {
                          pattern: /^\d{6}$/,
                          message: "Please enter a 6-digit number.",
                        },
                      ]}
                    >
                      <Input maxLength={6} showCount />
                    </Form.Item>

                    <Form.Item>
                      <Button
                        type="primary"
                        htmlType="submit"
                        //   loading={loading}
                      >
                        Save
                      </Button>
                    </Form.Item>
                  </Form>
                </>
              ) : (
                <Form
                  name="basic"
                  layout="vertical"
                  size="large"
                  onFinish={handleUpdateSmartPass}
                  autoComplete="off"
                >
                  <Form.Item
                    label="New Security Pass"
                    name="NewPin"
                    rules={[
                      {
                        required: true,
                        message: "Please enter your 6-digit Security Pass.",
                      },
                      {
                        pattern: /^\d{6}$/,
                        message: "Please enter a 6-digit number.",
                      },
                    ]}
                  >
                    <Input type="text" maxLength={6} showCount />
                  </Form.Item>
                  <Form.Item
                    label="Confirm Security Pass"
                    name="ConfirmPin"
                    dependencies={["New_Pin"]}
                    rules={[
                      {
                        required: true,
                        message: "Please enter your 6-digit Security Pass.",
                      },
                      {
                        pattern: /^\d{6}$/,
                        message: "Please enter a 6-digit number.",
                      },
                    ]}
                  >
                    <Input maxLength={6} showCount />
                  </Form.Item>
                  <Form.Item
                    name="AuthorizationCode"
                    label="Email Authentication Code"
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
                  {/* <Form.Item
                    label="Email Authentication Codee"
                    name="AuthorizationCode"

                    rules={[
                      {
                        required: true,
                        message: "Please input your Authentication Code",
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item>
                    <Button onClick={handleSendCode}>Get Code</Button>
                  </Form.Item> */}
                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loadingUpdateSmartpass}
                    >
                      Save
                    </Button>
                  </Form.Item>
                </Form>
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </>
  );
}

export default ChangePin;
