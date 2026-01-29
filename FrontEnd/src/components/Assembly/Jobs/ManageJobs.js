import {
  Form,
  Input,
  Select,
  Table,
  Button,
  Dropdown,
  Space,
  Menu,
  Popconfirm,
  Modal,
  message,
  Badge,
  DatePicker,
  Flex,
  Pagination,
} from "antd";
import React, { useEffect, useRef, useState } from "react";
import {
  PlusOutlined,
  DownloadOutlined,
  UploadOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

import { Link, NavLink } from "react-router-dom";
import AssemblyMenu from "./../AssemblyMenu";
import Config from "../../../Config";
import SubMenuToggle from "../../Common/SubMenuToggle";
import axios from "axios";
import dayjs from "dayjs";
import ProductDropdown from "../../Shared/ProductDropdown";

const ExcelJS = require("exceljs");

function ManageJobs() {
  const AccessKey = localStorage.getItem("AccessKey");
  const UserID = localStorage.getItem("ID");
  const CompanyID = localStorage.getItem("CompanyID");
  const FYear = localStorage.getItem("DefaultFYear");

  const [loading, setLoading] = useState(false);
  const [ListOfRecords, setListOfRecords] = useState([]);
  const [ProductName, setProductName] = useState("");
  const [Status, setStatus] = useState("");
  const [JobId, setJobId] = useState(0);
  const [startDate, setStartDate] = useState(null);
  const [finishDate, setFinishDate] = useState(null);

  const [ProductLoading, setProductLoading] = useState(false);
  // pagination
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [TotalRecords, setTotalRecords] = useState(0);
  const [ListOfProducts, setListOfProducts] = useState([]);

  const [form] = Form.useForm();
  const [formMain] = Form.useForm();

  const onShowSizeChange = (current, pageSize) => {
    setPageNumber(current);
    setPageSize(pageSize);
  };

  const onPageChange = (newPageNumber, newPageSize) => {
    setPageNumber(newPageNumber);
    setPageSize(newPageSize);
  };

  const fetchTemplates = async () => {
    setLoading(true);
    const data = {
      CompanyID: CompanyID,
      ProductName: ProductName,
      OrderBy: Status,
      PageNo: pageNumber,
      PageSize: pageSize,
      ID: JobId,
      StartDate: startDate,
      EndDate: finishDate,
    };
    const api_config = {
      method: "post",
      url: `${Config.base_url}Jobs/GetJobs`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AccessKey}`,
      },
      data: data,
    };
    ////Console.log(data);

    try {
      const response = await axios(api_config);
      ////Console.log(response.data);
      if (response.data && response.data.status_code === 1) {
        setListOfRecords(response.data.listofJobs || []);
        setTotalRecords(response.data.totalRecords || 0);
        setLoading(false);
      } else {
        setListOfRecords([]);
        setLoading(false);
        //message.error(response.data.status_message);
      }
    } catch (error) {
      //console.error("Error fetching data:", error);
      message.error("Network Error..");
      setListOfRecords([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Jobs";
    fetchTemplates();
    fetchProducts();
  }, [Status, JobId, ProductName, finishDate, startDate, pageNumber, pageSize]);

  const fetchProducts = async () => {
    setProductLoading(true);
    try {
      const response = await ProductDropdown();
      if (response != null) {
        setListOfProducts(response || []);
      }
    } catch (error) {
      // console.error(error);
    } finally {
      setProductLoading(false);
    }
  };

  const handleFilters = (formData) => {
    // //Console.log("Form Data Submitted:", formData);
    setProductName(formData["productName"] || "");
    setStatus(formData["status"] || "");
    setJobId(formData["jobId"] || 0);
    setStartDate(startDate);
    setFinishDate(finishDate);
    setPageNumber(1);
    setPageSize(100000);
  };

  const columns = [
    {
      title: "Sr#",
      dataIndex: "",
      key: "SR",
      render: (_, record, index) => index + 1,
    },
    {
      title: "Product Code",
      dataIndex: "code",
      key: "code",
      sorter: (a, b) => a.code - b.code,
    },

    {
      title: "Product Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },

    {
      title: "Ref No",
      dataIndex: "ref",
      key: "ref",
      sorter: (a, b) => a.ref.localeCompare(b.ref),
    },

    {
      title: "Location",
      dataIndex: "locat",
      key: "locat",
      sorter: (a, b) => a.locat.localeCompare(b.locat),
    },

    {
      title: "Job ID",
      dataIndex: "jobID",
      key: "jobID",
      sorter: (a, b) => a.jobID - b.jobID,
    },
    {
      title: "Unit",
      dataIndex: "jobUnit",
      key: "jobUnit",
      sorter: (a, b) => a.jobUnit.localeCompare(b.jobUnit),
    },
    {
      title: "Quantity",
      dataIndex: "qty",
      key: "qty",
      sorter: (a, b) => a.qty - b.qty,
    },
    {
      title: "Start Date",
      dataIndex: "date",
      key: "date",
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
    },
    {
      title: "Finished Date",
      dataIndex: "finDate",
      key: "finDate",
      sorter: (a, b) => dayjs(a.finDate).unix() - dayjs(b.finDate).unix(),
    },
    {
      title: "Status",
      dataIndex: "stat",
      key: "stat",
      sorter: (a, b) => a.stat.localeCompare(b.stat),
    },

    {
      title: "Actions",
      dataIndex: "Actions",
      key: "Actions",
      render: (_, record) =>
        record.docNo !== "COP" ? (
          <div className="table-actions">
            <Popconfirm
              title="Edit Status"
              description="Are you sure to edit status to Finished?"
              onConfirm={(e) => handleStatusChange(record.jobID)}
              okText="Yes"
              cancelText="No"
            >
              <EditOutlined />
            </Popconfirm>
            <Popconfirm
              title="Delete the task"
              description="Are you sure to delete this Job?"
              onConfirm={(e) => deleteJob(record.jobID)}
              okText="Yes"
              cancelText="No"
            >
              <DeleteOutlined />
            </Popconfirm>
          </div>
        ) : (
          ""
        ),
    },
  ];

  const deleteJob = async (id) => {
    setLoading(true);
    try {
      const response = await axios.patch(
        `${Config.base_url}Jobs/DeleteJobDataByDetailID/${id}/${CompanyID}`,
        {
          headers: {
            Authorization: `Bearer ${AccessKey}`,
          },
        }
      );
      if (response.data.status_code == 1) {
        message.success(response.data.status_message);
        setLoading(false);
      } else {
        message.error(response.data.status_message);
        setLoading(false);
      }
    } catch (error) {
      message.error("Network Error..");
      //console.error(error);
      setLoading(false);
    }
    fetchTemplates();
  };

  const handleStatusChange = async (id) => {
    setLoading(true);
    try {
      const response = await axios.patch(
        `${Config.base_url}Jobs/EditJobStatus/${id}/${CompanyID}`,
        {
          headers: {
            Authorization: `Bearer ${AccessKey}`,
          },
        }
      );

      if (response.data.status_code === 1) {
        message.success(response.data.status_message);
        setLoading(false);
      } else {
        message.error(response.data.status_message);
        setLoading(false);
      }
    } catch (error) {
      message.error("Sorry! Something went wrong...");
    } finally {
      fetchTemplates();
      setLoading(false);
    }
  };

  const onReset = () => {
    form.resetFields();
    setStatus("");
    setProductName("");
    setJobId(0);
    setStartDate(null);
    setFinishDate(null);
    setPageNumber(1);
    setPageSize(20);
  };

  const items = [
    {
      key: "1",
      label: (
        <Link to={`/sales/sales-invoices/add-sales-invoices`}>
          Sales Invoice (SI)
        </Link>
      ),
    },
    {
      key: "2",
      label: (
        <Link to={`/sales/sales-invoices/add-credit-note`}>
          Credit Note (SC)
        </Link>
      ),
    },
    {
      key: "3",
      label: (
        <Link to={`/sales/sales-invoices/batch-invoice`}>
          Batch Invoice (SI)
        </Link>
      ),
    },
    {
      key: "4",
      label: (
        <Link to={`/sales/sales-invoices/bulk-invoicing`}>
          Bank Invoice (SI)
        </Link>
      ),
    },
  ];

  const handleExport = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Jobs");

    // Set column headers and their widths
    sheet.columns = [
      { header: "Sr#", key: "sr", width: 5 },
      { header: "Product Code", key: "code", width: 15 },
      { header: "Product Name", key: "name", width: 25 },
      { header: "Ref No", key: "ref", width: 15 },
      { header: "Location", key: "locat", width: 30 },
      {
        header: "Job ID",
        key: "jobID",
        width: 15,
        render: (date) => dayjs(date).format("YYYY-MM-DD"),
      },
      { header: "Unit", key: "jobUnit", width: 15 },
      { header: "Quantity", key: "qty", width: 15 },
      { header: "Start Date", key: "date", width: 15 },
      { header: "Finished Date", key: "finDate", width: 15 },
      { header: "Status", key: "stat", width: 20 },
    ];

    // Add rows to the sheet
    ListOfRecords.forEach((job, index) => {
      sheet.addRow({
        sr: index + 1,
        code: job.code,
        name: job.name,
        ref: job.ref,
        locat: job.locat,
        jobID: job.jobID,
        jobUnit: job.jobUnit,
        qty: job.qty,
        date: job.date,
        finDate: job.finDate,
        stat: job.stat,
      });
    });

    const now = new window.Date();
    const dateString = now
      .toLocaleString("sv-SE", { timeZoneName: "short" }) // Using Swedish locale for formatting
      .replace(/[^0-9]/g, ""); // Removing non-numeric characters

    // Generate the Excel file and prompt the user to download it
    workbook.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `JobList_${dateString}.xlsx`;
      anchor.click();
      window.URL.revokeObjectURL(url);
    });
  };

  const handleStartDateChange = (e, value) => {
    setStartDate(value);
  };

  const handleFinishDateChange = (e, value) => {
    setFinishDate(value);
  };

  const sortedData = ListOfRecords.sort((a, b) => b.jobID - a.jobID);

  return (
    <>
      <div id="sub-menu-wrap">
        <h5>Assembly</h5>
        <AssemblyMenu />
      </div>
      <div className="right-side-contents">
        <div className="page-content">
          <div className="page-header">
            <SubMenuToggle />
            <h3 className="page-title">Jobs</h3>
            <div className="header-actions">
              {/* <NavLink to="/sales/sales-invoice/import">
                <Button type="dashed" icon={<DownloadOutlined />}>
                  Import
                </Button>
              </NavLink> */}
              <Button
                type="dashed"
                onClick={handleExport}
                icon={<UploadOutlined />}
              >
                Export
              </Button>
              <NavLink to="/jobs/add-job">
                <Button type="primary" icon={<PlusOutlined />}>
                  New
                </Button>
              </NavLink>
            </div>
          </div>
          <div className="filters-wrap">
            <Flex justify="space-between" align="center">
              <Form onFinish={handleFilters} form={form}>
                <Form.Item name="productName">
                  <Select
                    showSearch
                    filterOption={(input, option) =>
                      option.label.toLowerCase().includes(input.toLowerCase())
                    }
                    placeholder="Product Name"
                    style={{ width: "250px" }}
                    options={ListOfProducts.map((record) => ({
                      label: (
                        <>
                          {record.name} ({record.code})
                        </>
                      ),
                      value: record.name,
                    }))}
                  />
                </Form.Item>
                <Form.Item
                  name="status"
                  showSearch
                  filterOption={(input, option) =>
                    option.label.toLowerCase().includes(input.toLowerCase())
                  }
                  style={{ width: "150px" }}
                >
                  <Select placeholder="Status">
                    <Select.Option value="In Progress">
                      In Progress
                    </Select.Option>
                    <Select.Option value="Finished">Finished</Select.Option>
                    <Select.Option value="Pending">Pending</Select.Option>
                    <Select.Option value="Rolled Back">
                      Rolled Back
                    </Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item name="jobId">
                  <Input placeholder="Job ID" />
                </Form.Item>
                <Form.Item name="startDate">
                  <DatePicker
                    onChange={handleStartDateChange}
                    placeholder="Start Date"
                    style={{ width: "100%" }}
                  />
                </Form.Item>
                <Form.Item name="finishDate">
                  <DatePicker
                    onChange={handleFinishDateChange}
                    placeholder="Finish Date"
                    style={{ width: "100%" }}
                  />
                </Form.Item>

                <Button htmlType="submit" type="primary">
                  Filter
                </Button>
                <Button htmlType="button" onClick={onReset} type="link">
                  Reset
                </Button>
              </Form>
            </Flex>
          </div>

          <Table
            scroll={{
              x: "100%",
            }}
            columns={columns}
            dataSource={sortedData}
            size="small"
            loading={loading}
            pagination={false}
          />
          <div style={{ marginTop: 15 }}>
            <Pagination
              align="end"
              showSizeChanger
              pageSizeOptions={["10", "50", "100", "500", "1000"]}
              size="small"
              onShowSizeChange={onShowSizeChange}
              onChange={onPageChange}
              current={pageNumber}
              pageSize={pageSize}
              total={TotalRecords}
              defaultCurrent={1}
              showTotal={(total, range) => {
                return `${range[0]}-${range[1]} of ${total} items`;
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default ManageJobs;
