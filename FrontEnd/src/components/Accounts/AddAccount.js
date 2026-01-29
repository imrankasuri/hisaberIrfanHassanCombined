import React, { useState, useEffect } from "react";
import AccountsMenu from "./AccountsMenu";
import { PlusOutlined } from "@ant-design/icons";

import { ArrowLeftIcon } from "@heroicons/react/24/solid";

import { NavLink, useLocation } from "react-router-dom";

import {
  Card,
  Col,
  Form,
  Input,
  Row,
  Radio,
  Select,
  Button,
  message,
  Spin,
  Typography,
  Table,
} from "antd";
import axios from "axios";

import Config from "../../Config";
import SubMenuToggle from "../Common/SubMenuToggle";
import { useForm } from "antd/es/form/Form";
import LevelWiseAccounts from "../Shared/LevelWiseAccounts";
import LevelWiseAccount2 from "../Shared/LevelWiseAccount2";

function AddAccount(props) {
  const AccessKey = localStorage.getItem("AccessKey");
  const UserID = localStorage.getItem("ID");
  const FYear = localStorage.getItem("DefaultFYear");
  const CompanyID = localStorage.getItem("CompanyID");

  const location = useLocation();
  const presetFirstLevelCode = location?.state?.firstLevelCode || "";
  const presetSecondLevelCode = location?.state?.secondLevelCode || 0;

  const [FirstLevelCode, setFirstLevelCode] = useState(presetFirstLevelCode);
  const [SecondLevelCode, setSecondLevelCode] = useState(presetSecondLevelCode);
  const [ThirdLevelCode, setThirdLevelCode] = useState(0);

  // account level accounts arrays
  const [FirstLevelAccounts, setFirstLevelAccounts] = useState([]);
  const [SecondLevelAccounts, setSecondLevelAccounts] = useState([]);

  // loadings
  const [loading, setLoading] = useState(false);
  const [loadingSaveAccount, setLoadingSaveAccount] = useState(false);
  const [firstLevelLoading, setFirstLevelLoading] = useState(false);
  const [secondLevelLoading, setSecondLevelLoading] = useState(false);
  const [thirdLevelLoading, setThirdLevelLoading] = useState(false);
  const [Level1Accounts, setLevel1Accounts] = useState([]);
  const [Level2Accounts, setLevel2Accounts] = useState([]);
  const [ThirdLevelAccounts, setThirdLevelAccounts] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    document.title = "Add Account";
    const fetchAccounts = async () => {
      const level1 = await LevelWiseAccounts(1);
      setLevel1Accounts(level1);
      const level2 = await LevelWiseAccount2(2, FirstLevelCode);
      setLevel2Accounts(level2);
      const level3 = await LevelWiseAccount2(3, SecondLevelCode);
      setThirdLevelAccounts(level3);
    };
    fetchAccounts();
  }, [FirstLevelCode, SecondLevelCode]);

  useEffect(() => {
    // Pre-fill form if presets exist
    if (presetFirstLevelCode) {
      form.setFieldsValue({ firstLevel: presetFirstLevelCode });
    }
    if (presetSecondLevelCode) {
      form.setFieldsValue({ secondLevel: presetSecondLevelCode });
    }
  }, [presetFirstLevelCode, presetSecondLevelCode]);

  const handleFirstLevelChange = (value) => {
    setFirstLevelCode(value);
    // Reset dependent values when first level changes
    setSecondLevelCode(0);
    form.setFieldsValue({ secondLevel: undefined });
  };

  const handleSecondLevelChange = (value) => {
    setSecondLevelCode(value);
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
    {
      title: "Level",
      dataIndex: "iLevel",
      key: "iLevel",
    },
  ];

  const handleSubmit = async (FormData) => {
    setLoading(true);

    const data = {
      ...FormData,
      accountCode: (
        parseInt(
          ThirdLevelAccounts[ThirdLevelAccounts.length - 1].accountCode
        ) + 1
      ).toString(),
      accountDescription: FormData.thirdLevel,
      iLevel: 3,
      remarks: FormData.remarks,
      year: FYear,
      isActive: true,
      isDeleted: false,
      companyID: CompanyID,
    };

    try {
      const response = await axios.post(
        Config.base_url + `AccountMain/AddAccount`,
        data,
        {
          headers: {
            Authorization: `Bearer ${AccessKey}`,
          },
        }
      );
      if (response.data.status_code === 1) {
        setLoading(false);
        message.success(response.data.status_message);
        const level3 = await LevelWiseAccount2(3, SecondLevelCode);
        setThirdLevelAccounts(level3);
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

  // Dynamic Remarks
  const isNameManuallyEdited = { current: false };

  const handleUpdateProductName = (changedValues, allValues) => {
    const { thirdLevel } = allValues;

    // Check if the change is from a field that should update the name
    if (!isNameManuallyEdited.current && changedValues.thirdLevel) {
      // Construct the new combined name
      const combinedName = [thirdLevel].filter(Boolean).join(" ");

      // Set the new combined name in the form
      form.setFieldsValue({ remarks: combinedName });
      ////Console.log("Combined Name:", combinedName);
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

  // const Level1Accounts = LevelWiseAccounts(1);
  // const Level2Accounts = LevelWiseAccount2(2, FirstLevelCode);
  // const ThirdLevelAccounts = LevelWiseAccount2(3, SecondLevelCode);

  return (
    <>
      <div id="sub-menu-wrap">
        <h5>Accounts</h5>
        <AccountsMenu />
      </div>
      <div className="right-side-contents">
        <div className="page-content">
          <div className="page-header">
            <SubMenuToggle />
            <h3 className="page-title">
              <NavLink to="/accounts/manage">
                <ArrowLeftIcon />
              </NavLink>
              Add Account
            </h3>
          </div>
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} md={16}>
              <Form
                layout="horizontal"
                className="form-compact"
                scrollToFirstError={true}
                onFinish={handleSubmit}
                form={form}
                onValuesChange={(changedValues, allValues) => {
                  handleFieldChange();
                  handleUpdateProductName(changedValues, allValues);
                }}
                labelCol={{
                  span: 8,
                }}
                wrapperCol={{
                  span: 16,
                }}
              >
                <div className="form-section">
                  <div className="form-header">
                    <Row>
                      <Col md={10} xs={24}>
                        <div className="left-form-tittle">
                          <span className="count">1</span>
                          <h2>Level 1</h2>
                          <p>
                            Basic access with limited permissions for essential
                            functionalities.
                          </p>
                        </div>
                      </Col>
                      <Col md={14} xs={24}>
                        <div style={{ maxWidth: "500px" }}>
                          <Form.Item label="Select First Level" name="firstLevel">
                            <Select
                              placeholder="Select First Level"
                              showSearch
                              filterOption={(input, option) =>
                                option.label
                                  .toLowerCase()
                                  .indexOf(input.toLowerCase()) >= 0
                              }
                              loading={firstLevelLoading}
                              options={Level1Accounts.map((item) => ({
                                label: item.accountDescription,
                                value: item.accountCode,
                              }))}
                              onSelect={handleFirstLevelChange}
                              value={FirstLevelCode || undefined}
                              disabled={!!presetFirstLevelCode}
                            />
                          </Form.Item>
                          {FirstLevelCode > 0 && (
                            <Form.Item label="Account Code">
                              {FirstLevelCode}
                            </Form.Item>
                          )}
                        </div>
                      </Col>
                    </Row>
                  </div>

                  <div className="form-header">
                    <Row>
                      <Col md={10} xs={24}>
                        <div className="left-form-tittle">
                          <span className="count">2</span>
                          <h2>Level 2</h2>
                          <p>
                            Intermediate access with expanded permissions for
                            moderate functionalities.
                          </p>
                        </div>
                      </Col>
                      <Col md={14} xs={24}>
                        <div style={{ maxWidth: "500px" }}>
                          <Form.Item label="Select Second Level" name="secondLevel">
                            <Select
                              disabled={!FirstLevelCode || !!presetSecondLevelCode}
                              placeholder="Select Second Level"
                              showSearch
                              filterOption={(input, option) =>
                                option.label
                                  .toLowerCase()
                                  .indexOf(input.toLowerCase()) >= 0
                              }
                              loading={secondLevelLoading}
                              options={Level2Accounts.map((item) => ({
                                label: item.accountDescription,
                                value: item.accountCode,
                              }))}
                              onSelect={handleSecondLevelChange}
                              value={SecondLevelCode || undefined}
                            />
                          </Form.Item>

                          {SecondLevelCode > 0 && (
                            <Form.Item label="Account Code">
                              {SecondLevelCode}
                            </Form.Item>
                          )}
                        </div>
                      </Col>
                    </Row>
                  </div>
                  <div className="form-header">
                    <Row>
                      <Col md={10} xs={24}>
                        <div className="left-form-tittle">
                          <span className="count">3</span>
                          <h2>Level 3</h2>
                          <p>
                            Advanced access with full permissions for
                            comprehensive functionalities.
                          </p>
                        </div>
                      </Col>
                      <Col md={14} xs={24}>
                        <div style={{ maxWidth: "500px" }}>
                          <Form.Item
                            label="Account Name"
                            name="thirdLevel"
                            rules={[
                              {
                                required: true,
                                message: "Please input the Account Name!",
                              },
                            ]}
                          >
                            <Input disabled={!SecondLevelCode} />
                          </Form.Item>
                          <Form.Item label="Remarks" name="remarks">
                            <Input
                              disabled={!SecondLevelCode}
                              onChange={handleNameChange}
                            />
                          </Form.Item>
                          <Form.Item label="Account Code">
                            <Input
                              readOnly
                              disabled={!SecondLevelCode}
                              value={
                                ThirdLevelAccounts &&
                                ThirdLevelAccounts.length > 0
                                  ? parseInt(
                                      ThirdLevelAccounts[
                                        ThirdLevelAccounts.length - 1
                                      ].accountCode
                                    ) + 1
                                  : ""
                              }
                            />
                          </Form.Item>
                        </div>
                      </Col>
                    </Row>
                  </div>

                  {/* Level 3 similar implementation can go here */}
                </div>

                <div className="form-footer">
                  <Button
                    htmlType="submit"
                    type="primary"
                    size="large"
                    loading={loading}
                  >
                    Save
                  </Button>
                </div>
              </Form>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Typography.Text strong style={{ fontSize: "15px" }}>
                Existing Nominal Accounts
              </Typography.Text>
              <Table
                scroll={{
                  x: "100%",
                }}
                columns={columns}
                dataSource={ThirdLevelAccounts}
                size="small"
                loading={thirdLevelLoading}
              />
            </Col>
          </Row>
        </div>
      </div>
    </>
  );
}

export default AddAccount;
