import React, { useEffect, useState } from "react";

import {
  Form,
  Input,
  Button,
  Row,
  Col,
  Select,
  DatePicker,
  message,
  Skeleton,
} from "antd";

import AccountsMenu from "../AccountsMenu";
import { NavLink, useParams } from "react-router-dom";

import {
  ArrowLeftIcon,
  PlusCircleIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

import { calculateColumnTotal } from "../../Shared/Utility";

import Config from "../../../Config";
import SubMenuToggle from "../../Common/SubMenuToggle";
import axios from "axios";
import moment from "moment";
import dayjs from "dayjs";

function EditVouchers(props) {
  const AccessKey = localStorage.getItem("AccessKey");
  const UserID = localStorage.getItem("ID");
  const CompanyID = localStorage.getItem("CompanyID");
  const FYear = localStorage.getItem("DefaultFYear");
  let params = useParams();

  const [VoucherNo, setVoucherNo] = useState("");
  const [VoucherTypeDesc, setVoucherTypeDesc] = useState("");
  const [VoucherDate, setVoucherDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [VoucherRemarks, setVoucherRemarks] = useState("");

  // voucher
  const [VouchersTypes, setVouchersTypes] = useState([]);
  const [VouchersTypesDropdown, setVouchersTypesDropdown] = useState([]);
  const [VoucherTypeID, setVoucherTypeID] = useState("");
  const [VoucherList, setVoucherList] = useState([]);

  //loadings
  const [loading, setLoading] = useState(false);
  const [loadingVoucherTypes, setloadingVoucherTypes] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [loadingAddVoucher, setLoadingAddVoucher] = useState(false);

  // account
  const [Accounts, setAccounts] = useState([]);
  const [AccountsDropdown, setAccountsDropdown] = useState([]);
  const [AccountCode, setAccountCode] = useState("");
  const [AccountDesc, setAccountDesc] = useState("");
  const [mainRemarks, setmainRemarks] = useState("");

  const [form] = Form.useForm();
  const [formMain] = Form.useForm();

  useEffect(() => {
    setLoading(true);
    const data = {
      AccessKey: AccessKey,
      UserID: UserID,
      ID: params.id,
    };

    ////Console.log(data);

    var api_config = {
      method: "post",
      url: Config.base_url + "Voucher/GetVoucherByID",
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    // ////Console.log(data);

    axios(api_config)
      .then(function (response) {
        if (response.data.status_code == 1) {
          setVoucherList(response.data.ListofRecords);

          let date = response.data.Voucher?.Voucher_Date;

          setVoucherDate(dayjs(date).format("YYYY-MM-DD"));

          let VoucherTypeID = response.data.Voucher?.VoucherTypeID;
          let VoucherTypeDesc =
            response.data.Voucher?.Selected_VoucherType?.VoucherType_dsc;
          let VoucherNo = response.data.Voucher?.Voucher_Number;

          setVoucherNo(response.data.Voucher?.Voucher_Number);
          setVoucherRemarks(response.data.Voucher?.Remarks);
          setVoucherTypeDesc(VoucherTypeDesc);
          setVoucherTypeID(VoucherTypeID);

          formMain.setFieldValue("VoucherType", VoucherTypeID);
          formMain.setFieldValue("VoucherTypeDesc", VoucherTypeDesc);
          formMain.setFieldValue("VoucheNo", VoucherNo);
          formMain.setFieldValue(
            "VoucherRemarks",
            response.data.Voucher?.Remarks
          );

          setLoading(false);
        }
      })
      .catch(function (error) {
        // ////Console.log(error);
      });
  }, []);

  useEffect(() => {
    setloadingVoucherTypes(true);

    const data = {
      AccessKey: AccessKey,
      UserID: UserID,
      CompanyID: CompanyID,
    };

    // ////Console.log(data);

    var api_config = {
      method: "post",
      url: Config.base_url + "Voucher/GetVouchersTypes",
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    axios(api_config)
      .then(function (response) {
        ////Console.log(response.data);

        if (response.data.status_code == 1) {
          setloadingVoucherTypes(false);
          setVouchersTypes(response.data.ListofRecords);

          let vt = response.data.ListofRecords;

          if (vt) {
            const vtSelect = vt.map((item) => ({
              value: item.ID,
              label: item.VoucherType,
            }));

            // ////Console.log(vtSelect);

            setVouchersTypesDropdown(vtSelect);
          }
        } else {
          setloadingVoucherTypes(false);
        }
      })
      .catch(function (error) {
        ////Console.log(error);
      });
  }, []);

  useEffect(() => {
    document.title = "Add Voucher";
    setLoadingAccounts(true);

    const data = {
      AccessKey: AccessKey,
      UserID: UserID,
      FYear: FYear,
      AccountLevel: 3,
      pageNo: 1,
      pageSize: 1000,
      CompanyID: CompanyID,
      // pAccountID: props.ParentAccountID,
    };

    ////Console.log(data);

    var api_config = {
      method: "post",
      url: Config.base_url + "Accounts/GetAccountsByYear",
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    // ////Console.log(data);

    axios(api_config)
      .then(function (response) {
        // ////Console.log(response.data);
        setAccounts(response.data.ListofRecords);

        let ac = response.data.ListofRecords;

        if (ac) {
          const acSelect = ac.map((item) => ({
            value: item.ID,
            label: item.Account_Code + " " + item.Account_Description,
            code: item.Account_Code,
            desc: item.Account_Description,
          }));

          setAccountsDropdown(acSelect);
        }

        setLoadingAccounts(false);
      })
      .catch(function (error) {
        ////Console.log(error);
      });
  }, []);

  const handleNextVoucher = (value) => {
    setloadingVoucherTypes(true);
    setVoucherTypeID(value);
    const data = {
      AccessKey: AccessKey,
      UserID: UserID,
      FYear: FYear,
      VoucherTypeID: value,
      CompanyID: CompanyID,
    };

    // ////Console.log(data);

    var api_config = {
      method: "post",
      url: Config.base_url + "Voucher/GetNextVoucherNo",
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    axios(api_config)
      .then(function (response) {
        // ////Console.log(response.data);
        if (response.data.status_code == 1) {
          setVoucherNo(response.data.VoucherNo);
          setVoucherTypeDesc(response.data.VoucherTypeDesc);

          formMain.setFieldValue("VoucherTypeDesc", response.data.VoucherNo);
          formMain.setFieldValue("VoucheNo", response.data.VoucherTypeDesc);

          setloadingVoucherTypes(false);
        }
      })
      .catch(function (error) {});
  };

  const handleAccountChange = (value, account) => {
    setAccountCode(account.code);
    setAccountDesc(account.desc);

    form.setFieldValue("Description", account.desc);
    form.setFieldValue("Code", account.code);
  };

  const handleAddItem = (formData) => {
    const newItem = {
      Seq: VoucherList.length,
      ...formData,
    };

    setVoucherList([...VoucherList, newItem]);
    form.resetFields();

    //form.setFieldValue('AccountDesc', formData['desc']);

    //form.setFieldsValue({ AccountDesc: 'shafat' });
  };

  const handleDebitChange = (e) => {
    form.setFieldValue("Cr_Amt", 0);
  };

  const handleCreditChange = (value) => {
    form.setFieldValue("Dr_Amt", 0);
  };

  const handleSaveVoucher = (value) => {
    setLoadingAddVoucher(true);
    setVoucherTypeID(value);
    const data = {
      AccessKey: AccessKey,
      UserID: UserID,
      CompanyID: CompanyID,
      ID: params.id,
      FYear: FYear,
      VoucherTypeID: VoucherTypeID,
      Voucher_number: VoucherNo,
      Voucher_date: VoucherDate,
      Remarks: VoucherRemarks,
      ListofVoucherDetail: VoucherList,
    };

    // ////Console.log(data, 'data');

    var api_config = {
      method: "post",
      url: Config.base_url + "Voucher/UpdateVoucher",
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
          setLoadingAddVoucher(false);
        } else {
          message.error(response.data.status_message);
          setLoadingAddVoucher(false);
        }
      })
      .catch(function (error) {});
  };

  const handleDateChange = (e, value) => {
    setVoucherDate(value);
  };

  const handleDelete = (index) => {
    const updatedFormData = [...VoucherList];

    // index, number of items to be removed, new elements to be added
    updatedFormData.splice(index, 1);
    setVoucherList(updatedFormData);
  };

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
              <NavLink to="/vouchers/">
                <ArrowLeftIcon />
              </NavLink>
              Edit Voucher
            </h3>
          </div>

          <Row gutter={[24, 0]}>
            <Col xs={24} md={6}>
              {loading ? (
                <>
                  <Skeleton active />
                  <Skeleton active />
                  <Skeleton active />
                </>
              ) : (
                <Form
                  loading={true}
                  layout="vertical"
                  className="form-default"
                  form={formMain}
                >
                  <Form.Item
                    name="Date"
                    label="Date"

                    // Setting initial value
                  >
                    <DatePicker
                      defaultValue={dayjs(VoucherDate, "YYYY-MM-DD")}
                      style={{ width: "100%" }}
                      onChange={handleDateChange}
                    />
                  </Form.Item>
                  <Form.Item name="VoucherType" label={`Voucher Type`}>
                    <Select
                      onChange={handleNextVoucher}
                      loading={loadingVoucherTypes}
                      placeholder="Select Voucher Type"
                      options={VouchersTypesDropdown}
                    />
                  </Form.Item>
                  <Form.Item
                    name="VoucherTypeDesc"
                    label="Voucher Type Description"
                  >
                    <Input readOnly />
                  </Form.Item>
                  <Form.Item name="VoucheNo" label="Voucher Number">
                    <Input readOnly />
                  </Form.Item>
                  <Form.Item
                    name="VoucherRemarks"
                    style={{ width: "100%" }}
                    label="Remarks"
                  >
                    <Input.TextArea
                      onChange={(e) => setVoucherRemarks(e.target.value)}
                    />
                  </Form.Item>
                </Form>
              )}
            </Col>
            <Col xs={24} md={18}>
              {loading ? (
                <>
                  <Skeleton active />
                  <Skeleton active />
                  <Skeleton active />
                </>
              ) : (
                <>
                  <Form onFinish={handleAddItem} form={form}>
                    <div className="ant-table-custom table-compact">
                      <table>
                        <thead>
                          <tr>
                            <th scope="col">Select Account</th>
                            <th scope="col">Description</th>
                            <th scope="col">Code</th>
                            <th scope="col">Debit</th>
                            <th scope="col">Credit</th>
                            <th scope="col">Remarks</th>
                            <th scope="col">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {VoucherList.map((item, index) => (
                            <tr key={index}>
                              <td></td>
                              <td>{item.Description}</td>
                              <td>{item.Code}</td>
                              <td>{item.Dr_Amt}</td>
                              <td>{item.Cr_Amt}</td>
                              <td>{item.Remarks}</td>
                              <td>
                                <div className="delete">
                                  <TrashIcon
                                    onClick={() => handleDelete(index)}
                                  />
                                </div>
                              </td>
                            </tr>
                          ))}
                          <tr className="bg-light">
                            <td></td>
                            <td></td>
                            <td></td>
                            <td>
                              <strong>
                                {calculateColumnTotal(VoucherList, "Dr_Amt")}
                              </strong>
                            </td>
                            <td>
                              <strong>
                                {calculateColumnTotal(VoucherList, "Cr_Amt")}
                              </strong>
                            </td>
                            <td></td>
                            <td></td>
                          </tr>

                          <tr className="table-form">
                            <td>
                              <Form.Item
                                name="AccountID"
                                rules={[{ required: true }]}
                              >
                                <Select
                                  showSearch
                                  filterOption={(input, option) =>
                                    option.label
                                      .toLowerCase()
                                      .includes(input.toLowerCase())
                                  }
                                  placeholder="Account"
                                  variant="borderless"
                                  style={{
                                    width: 250,
                                  }}
                                  onChange={handleAccountChange}
                                  loading={loadingAccounts}
                                  options={AccountsDropdown}
                                />
                              </Form.Item>
                            </td>
                            <td>
                              <Form.Item name="Description">
                                <Input
                                  placeholder="Description"
                                  variant="borderless"
                                />
                              </Form.Item>
                            </td>
                            <td>
                              <Form.Item name="Code">
                                <Input
                                  placeholder="Account Code"
                                  variant="borderless"
                                />
                              </Form.Item>
                            </td>
                            <td>
                              <Form.Item
                                name="Dr_Amt"
                                rules={[{ required: true }]}
                              >
                                <Input
                                  placeholder="Debit"
                                  onChange={handleDebitChange}
                                  variant="borderless"
                                />
                              </Form.Item>
                            </td>
                            <td>
                              <Form.Item
                                name="Cr_Amt"
                                rules={[{ required: true }]}
                              >
                                <Input
                                  placeholder="Credit"
                                  onChange={handleCreditChange}
                                  variant="borderless"
                                />
                              </Form.Item>
                            </td>
                            <td>
                              <Form.Item name="Remarks">
                                <Input
                                  placeholder="Remarks"
                                  variant="borderless"
                                />
                              </Form.Item>
                            </td>

                            <td>
                              <Button
                                icon={<PlusCircleIcon />}
                                htmlType="submit"
                              ></Button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </Form>
                  <div className="form-footer">
                    <Button
                      onClick={handleSaveVoucher}
                      type="primary"
                      size="large"
                      loading={loadingAddVoucher}
                      disabled={loadingVoucherTypes}
                    >
                      Save
                    </Button>
                  </div>
                </>
              )}
            </Col>
          </Row>
        </div>
      </div>
    </>
  );
}

export default EditVouchers;
