import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate, useParams } from "react-router-dom";
import { Form, Button, Input, message, Row, Col } from "antd";
import axios from "axios";
import Config from "../../Config";
import SubMenuToggle from "../Common/SubMenuToggle";
import Logo from "../../assets/images/logo/white-v.svg";
import { responsiveArray } from "antd/es/_util/responsiveObserver";

function VerifyInvite() {
  const [acceptLoading, setAcceptLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [inviteData, setInviteData] = useState({});
  const [disabled, setDisabled] = useState(false);
  const [Loading, setLoading] = useState(false);

  const params = useParams();
  const navigate = useNavigate();

  const email = localStorage.getItem("Email_Address");
  const AccessKey = localStorage.getItem("AccessKey");

  useEffect(() => {
    document.title = "Verify Invite";
    GetInvite();
  }, []);

  const GetInvite = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${Config.base_url}Invitation/ReadInvite/${params.id}`,
        {
          headers: { Authorization: `Bearer ${AccessKey}` },
        }
      );
      ////Console.log(response.data);
      if (response.data.status_code === 1) {
        setInviteData(response.data.invite);
        setLoading(false);
      }
      if (response.data.status_code === 0) {
        message.error(response.data.status_message);
        setDisabled(true);
        setLoading(false);
      }
      if (response.data.status_code === 2) {
        message.warning(response.data.status_message);
        navigate(`/invite-signup/${response.data.invite.inviteCode}`);
        setLoading(false);
      }
    } catch (error) {
      //console.error("Error checking user existence:", error);
      message.error("Network Error...");
    }
  };

  const handleVerifyEmail = async ({ code }) => {
    setAcceptLoading(true);
    try {
      const acceptResponse = await axios.get(
        `${Config.base_url}Invitation/accept?code=${code}`,
        {
          headers: { Authorization: `Bearer ${AccessKey}` },
        }
      );

      if (acceptResponse.data.status_code === 1) {
        await axios.post(
          `${Config.base_url}Account/assign-roles`,
          {
            companyID: inviteData.fromUserCompanyID,
            email: inviteData.toEmail,
            roles: [inviteData.invitedRole],
          },
          {
            headers: { Authorization: `Bearer ${AccessKey}` },
          }
        );

        message.success(acceptResponse.data.status_message);
        navigate("/");
      } else {
        message.error(acceptResponse.data.status_message);
      }
    } catch (error) {
      //console.error("Error during email verification:", error);
      message.error("Network Error...");
    } finally {
      setAcceptLoading(false);
    }
  };

  const handleReject = async () => {
    setRejectLoading(true);
    try {
      const response = await axios.get(
        `${Config.base_url}Invitation/reject?code=${params.id}`,
        {
          headers: { Authorization: `Bearer ${AccessKey}` },
        }
      );

      if (response.data.status_code === 1) {
        message.success(response.data.status_message);
        navigate("/");
      } else {
        message.error(response.data.status_message);
      }
    } catch (error) {
      //console.error("Error rejecting invitation:", error);
      message.error("Network Error...");
    } finally {
      setRejectLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="left-col">
        <div>
          <img src={Logo} alt="Logo" />
          <h3>
            Streamline Your Finances: Welcome to Effortless Invoicing &
            Accounting!
          </h3>
        </div>
      </div>
      <div className="right-col">
        <div className="header">
          <p>Already have an account?</p>
          <NavLink to="/login">
            <Button>Login</Button>
          </NavLink>
        </div>
        <div className="auth-form-wrap">
          <div className="section-title" style={{ marginBottom: "50px" }}>
            <h2>Verify your Invitation</h2>
            <p>
              An invitation code has been sent to your email at the time of
              invitation.
              <br />
              <br />
            </p>
          </div>
          <Form layout="vertical" size="large" onFinish={handleVerifyEmail}>
            <Form.Item
              label="Invitation Code"
              name="code"
              rules={[
                {
                  required: true,
                  message: "Please enter the verification code",
                },
              ]}
            >
              <Input disabled={disabled} />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={acceptLoading}
                  disabled={disabled}
                  block
                >
                  Accept Invite
                </Button>
              </Col>
              <Col span={12}>
                <Button
                  type="primary"
                  onClick={handleReject}
                  loading={rejectLoading}
                  disabled={disabled}
                  block
                >
                  Reject Invite
                </Button>
              </Col>
            </Row>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default VerifyInvite;
