import React, { useEffect, useState } from "react";

import {
  Form,
  Select,
  Space,
  Table,
  Popconfirm,
  Button,
  Pagination,
} from "antd";

import {
  PlusOutlined,
  DownloadOutlined,
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

import { ChevronDownIcon, PlusCircleIcon } from "@heroicons/react/24/solid";
import { NavLink } from "react-router-dom";
import AccountsMenu from "../AccountsMenu";

import Config from "../../../Config";
import SubMenuToggle from "../../Common/SubMenuToggle";
import axios from "axios";
import dayjs from "dayjs";
import YearsDropDown from "../../Shared/YearsDropdown";

function ManageVouchers(props) {
  const AccessKey = localStorage.getItem("AccessKey");
  const UserID = localStorage.getItem("ID");
  const CompanyID = localStorage.getItem("CompanyID");
  const MemberType = localStorage.getItem("MemberType");
  const [FYear, setFYear] = useState(localStorage.getItem("DefaultFYear"));
  const [loading, setLoading] = useState(false);

  const [form] = Form.useForm();

  const [ListOfRecords, setListOfRecords] = useState([]);

  const [IsDeleted, setIsDeleted] = useState(false);

  const years = YearsDropDown();
  ////Console.log(years);

  // pagination
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [totalRecords, setTotalRecords] = useState(0);

  const [VoucherType, setVoucherType] = useState(0);

  const [loadingVoucherTypes, setloadingVoucherTypes] = useState(false);
  const [VouchersTypesDropdown, setVouchersTypesDropdown] = useState([]);

  useEffect(() => {
    setIsDeleted(false);
    setLoading(true);
    const data = {
      AccessKey: AccessKey,
      UserID: UserID,
      PageNo: pageNo,
      PageSize: pageSize,
      FYear: FYear,
      VoucherTypeID: VoucherType,
    };

    ////Console.log(data);

    var api_config = {
      method: "post",
      url: Config.base_url + "Voucher/GetVouchersByYear",
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    axios(api_config)
      .then(function (response) {
        ////Console.log(response.data);
        if (response.data.status_code != 0) {
          setListOfRecords(response.data.ListofRecords);
          setTotalRecords(response.data.totalRecords);
          setLoading(false);
        } else {
          setTotalRecords(0);
          setLoading(false);
        }
      })
      .catch(function (error) {
        ////Console.log(error);
      });
  }, [pageNo, pageSize, FYear, VoucherType, IsDeleted]);

  const handleFilters = (formData) => {
    if (formData["Type"] != undefined) {
      setVoucherType(formData["Type"]);
    } else if (formData["Year"] != undefined) {
      setFYear(formData["Year"]);
    } else {
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "ID",
      key: "id",
    },
    {
      title: "Code",
      dataIndex: "Voucher_Code",
      key: "code",
    },
    {
      title: "Voucher No",
      dataIndex: "Voucher_Number",
      key: "VoucherNo",
    },
    {
      title: "Dated",
      dataIndex: "Voucher_Date",
      key: "Dated",
      render: (_, record) => dayjs(record.Voucher_Date).format("DD/MM/YYYY"),
    },
    {
      title: "Year",
      dataIndex: "FYear",
      key: "Year",
    },
    {
      title: "Remarks",
      dataIndex: "Remarks",
      key: "Remarks",
    },
    {
      title: "Actions",
      dataIndex: "Actions",
      key: "Actions",
      render: (_, record) => (
        <div className="table-actions">
          <NavLink className={"primary"} to={`/vouchers/edit/${record.ID}`}>
            <EditOutlined />
          </NavLink>

          <Popconfirm
            title="Delete the task"
            description="Are you sure to delete this task?"
            //onConfirm={confirm}
            //onCancel={cancel}
            okText="Yes"
            cancelText="No"
          >
            <DeleteOutlined />
          </Popconfirm>
        </div>
      ),
    },
  ];

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

          let vt = response.data.ListofRecords;

          if (vt) {
            const vtSelect = vt.map((item) => ({
              value: item.ID,
              label: item.VoucherType,
            }));

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
  const onReset = () => {
    form.resetFields();
    setFYear(localStorage.getItem("DefaultFYear"));
    setVoucherType(0);
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
            <h3 className="page-title">Manage Vouchers</h3>
            <div className="header-actions">
              <Button type="dashed" icon={<DownloadOutlined />}>
                Import
              </Button>
              <Button type="dashed" icon={<UploadOutlined />}>
                Export
              </Button>
              <NavLink to="/vouchers/add">
                <Button type="primary" icon={<PlusOutlined />}>
                  New Voucher
                </Button>
              </NavLink>
            </div>
          </div>
          <div className="filters-wrap">
            <Form onFinish={handleFilters} form={form}>
              <Form.Item name="Year">
                <Select
                  placeholder="Year"
                  style={{ width: 120 }}
                  // onChange={handleChange}
                  options={years}
                />
              </Form.Item>
              <Form.Item name="Type">
                <Select
                  placeholder="Select Type"
                  style={{ width: 150 }}
                  // onChange={handleChange}
                  loading={loadingVoucherTypes}
                  options={VouchersTypesDropdown}
                />
              </Form.Item>

              <Button htmlType="submit">Filter</Button>
              <Button htmlType="button" onClick={onReset} type="link">
                Reset
              </Button>
            </Form>
          </div>

          <Table
            columns={columns}
            dataSource={ListOfRecords}
            size="small"
            loading={loading}
            pagination={false}
          />

          <div style={{ margin: "50px 0" }}>
            {totalRecords > 10 && (
              <>
                <Pagination
                  showQuickJumper
                  showSizeChanger
                  onShowSizeChange={(pageSize) => setPageSize(pageSize)}
                  defaultCurrent={pageNo}
                  pageSize={pageSize}
                  total={totalRecords}
                  onChange={(page) => setPageNo(page)}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default ManageVouchers;
