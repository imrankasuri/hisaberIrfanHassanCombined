import {
  Form,
  Input,
  Select,
  Table,
  Button,
  Popconfirm,
  message,
  DatePicker,
  Spin,
  Pagination,
} from "antd";
import React, { useEffect, useState } from "react";
import {
  PlusOutlined,
  DownloadOutlined,
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
  DownOutlined,
  CodeSandboxOutlined,
  CaretDownFilled,
  StockOutlined,
} from "@ant-design/icons";
import { Dropdown, Space, Tooltip } from "antd";
import { NavLink } from "react-router-dom";
import ProductionMenu from "./../ProductionMenu";
import Config from "../../../Config";
import SubMenuToggle from "../../Common/SubMenuToggle";
import axios from "axios";
import LevelWiseAccounts from "../../Shared/LevelWiseAccounts";
import dayjs from "dayjs";
const ExcelJS = require("exceljs");

function StockAdjustment(props) {
  const AccessKey = localStorage.getItem("AccessKey");
  const CompanyID = localStorage.getItem("CompanyID");

  const [loading, setLoading] = useState(false);
  const [ListOfProducts, setListOfProducts] = useState([]);
  const [NominalAccount, setNominalAccount] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [Type, setType] = useState("");
  const [date, setDate] = useState(null);
  const [openDate, setOpenDate] = useState(null);
  const [ListOfAccounts, setListOfAccounts] = useState([]);
  const [ListOfAccountsLoading, setListOfAccountsLoading] = useState(false);
  const [TotalRecords, setTotalRecords] = useState(0);

  const [form] = Form.useForm();

  const onShowSizeChange = (current, pageSize) => {
    setPageNumber(current);
    setPageSize(pageSize);
  };

  const onPageChange = (newPageNumber, newPageSize) => {
    setPageNumber(newPageNumber);
    setPageSize(newPageSize);
  };

  const fetchStocks = async () => {
    setLoading(true);

    const data = {
      CompanyID: CompanyID,
      AccountCode: NominalAccount,
      Type: Type,
      Date: date,
      PageSize: pageSize,
      PageNo: pageNumber,
    };
    const api_config = {
      method: "post",
      url: `${Config.base_url}Stock/GetStocks`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AccessKey}`,
      },
      data: data,
    };

    try {
      const response = await axios(api_config);
      ////Console.log(response.data)
      if (response.data.status_code === 1) {
        setListOfProducts(response.data.listOfStocks || []);
        setTotalRecords(response.data.totalRecords || 0);
      } else {
        setListOfProducts([]);
      }
    } catch (error) {
      //console.error("Error fetching data:", error);
      setListOfProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    setListOfAccountsLoading(true);

    try {
      const response = await LevelWiseAccounts(0);
      if (response) {
        setListOfAccounts(response);
      } else {
        setListOfAccounts([]);
      }
    } catch (error) {
      //console.error("Error fetching data:", error);
      setListOfAccounts([]);
    } finally {
      setListOfAccountsLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Stock Adjustment";
    fetchStocks();
    fetchAccounts();
  }, [date, NominalAccount, Type]);

  const handleFilters = (formData) => {
    setNominalAccount(formData["nominalAccount"] || "");
    setType(formData["adjustType"] || "");
    setDate(openDate);
    setPageNumber(1);
    setPageSize(100000);
  };

  const handleDelteStock = async (sno) => {
    try {
      setLoading(true);
      const data = {
        ID: sno,
        CompanyID: CompanyID,
      };
      // Send patch request to update the stock record
      const response = await axios.patch(
        `${Config.base_url}Stock/DeleteStock`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${AccessKey}`,
          },
        }
      );
      if (response.data.status_code === 1) {
        message.success(response.data.status_message);
        setLoading(false);
        fetchStocks();
      } else {
        message.error(response.data.status_message);
        setLoading(false);
      }
    } catch (error) {
      message.error("Network Error..");
      setLoading(false);
    }
  };

  const onReset = () => {
    form.resetFields();
    setNominalAccount("");
    setType("");
    setDate(null);
    setPageNumber(1);
    setPageSize(20);
    setOpenDate(null);
    // fetchAccounts(); // Fetch all data again without any filters
  };

  const columns = [
    {
      title: "Sr#",
      dataIndex: "",
      key: "SR",
      render: (_, record, index) => index + 1,
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Nominal Account",
      dataIndex: "nominalAccount",
      key: "nominalAccount",
    },
    {
      title: "Type",
      dataIndex: "adjustType",
      key: "adjustType",
    },
    {
      title: "Invoice No",
      dataIndex: "invoiceNo",
      key: "invoiceNo",
      render: (text, record) => (
        <NavLink
          className="primary"
          to={
            record.adjustType === "In"
              ? `/products/edit-stock-in/${record.invoiceNo}`
              : `/products/edit-stock-out/${record.invoiceNo}`
          }
        >
          {record.invoiceNo}
        </NavLink>
      ),
    },
    {
      title: "Doc No",
      dataIndex: "docNo",
      key: "docNo",
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
    },
    {
      title: "Action",
      dataIndex: "Actions",
      key: "Actions",
      render: (_, record) => (
        <div className="table-actions">
          <NavLink
            className="primary"
            to={
              record.adjustType === "In"
                ? `/products/edit-stock-in/${record.invoiceNo}`
                : `/products/edit-stock-out/${record.invoiceNo}`
            }
          >
            <EditOutlined />
          </NavLink>
          <Popconfirm
            title="Delete the task"
            description="Are you sure to delete this Invoice?"
            onConfirm={() => handleDelteStock(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <DeleteOutlined />
          </Popconfirm>
        </div>
      ),
    },
  ];

  const items = [
    {
      label: <NavLink to="/products/stock-out">Stock Out (ADO)</NavLink>,
      key: "1",
      icon: <StockOutlined />,
    },
    {
      label: <NavLink to="/products/stock-in">Stock In (ADI)</NavLink>,
      key: "2",
      icon: <StockOutlined />,
    },
  ];
  const menuProps = {
    items,
  };

  const handleExport = () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Stock Adjustment");

    // Set column headers and their widths
    sheet.columns = [
      { header: "Date", key: "date", width: 30 },
      { header: "Nominal Account", key: "nominalAccount", width: 30 },
      { header: "Type", key: "adjustType", width: 30 },
      { header: "Invoice No", key: "invoiceNo", width: 20 },
      { header: "Doc No", key: "docNo", width: 30 },
      { header: "Total", key: "total", width: 20 },
    ];

    // Add rows to the sheet
    ListOfProducts.forEach((stock, index) => {
      sheet.addRow({
        sr: index + 1,
        date: stock.date,
        nominalAccount: stock.nominalAccount,
        adjustType: stock.adjustType,
        invoiceNo: stock.invoiceNo,
        docNo: stock.docNo,
        openingQuantity: stock.openingQuantity,
        total: stock.total,
      });
    });

    const now = new Date();
    const dateString = now
      .toLocaleString("sv-SE", { timeZoneName: "short" }) // Format: YYYY-MM-DD HH:mm:ss
      .replace(/[^0-9]/g, ""); // Remove special characters like : and space

    // Generate the Excel file and prompt the user to download it
    workbook.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `StockAdjustmentList_${dateString}.xlsx`;
      anchor.click();
      window.URL.revokeObjectURL(url);
    });
  };

  const sortedData = ListOfProducts.sort((a, b) => {
    if (a.code < b.code) return 1;
    if (a.code > b.code) return -1;
    return 0;
  });

  const handleDateChange = (e, value) => {
    setOpenDate(value);
  };
  return (
    <>
      <div id="sub-menu-wrap">
        <h5>Production</h5>
        <ProductionMenu />
      </div>
      <div className="right-side-contents">
        <div className="page-content">
          <div className="page-header">
            <SubMenuToggle />
            <h3 className="page-title">Stock Adjustment</h3>
            <div className="header-actions">
              {/* <NavLink to="/stock-adjustment/import">
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
              <NavLink>
                <Dropdown menu={menuProps}>
                  <Button type="primary">
                    <Space>
                      <PlusOutlined />
                      New
                    </Space>
                  </Button>
                </Dropdown>
              </NavLink>
            </div>
          </div>
          <div className="filters-wrap">
            <Form onFinish={handleFilters} form={form} layout="vertical">
              <Form.Item name="adjustType">
                <Select placeholder="Type" style={{ width: 120 }}>
                  <Select.Option value="">All Types</Select.Option>
                  <Select.Option value="In">In</Select.Option>
                  <Select.Option value="Out">Out</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name="nominalAccount">
                <Select
                  showSearch
                  filterOption={(input, option) =>
                    option.label.toLowerCase().includes(input.toLowerCase())
                  }
                  placeholder="Nominal Account"
                  style={{ width: "250px" }}
                  notFoundContent={ListOfAccountsLoading ? <Spin /> : null}
                  options={ListOfAccounts.map((record) => ({
                    label: `${record.accountDescription} (${record.accountCode})`,
                    value: record.accountCode,
                  }))}
                />
              </Form.Item>
              <Form.Item name="date">
                <DatePicker
                  format="YYYY-MM-DD"
                  onChange={handleDateChange}
                  placeholder="Date"
                  style={{ width: "100%" }}
                />
              </Form.Item>
              <Button type="primary" htmlType="submit">
                Filter
              </Button>
              <Button type="link" onClick={onReset}>
                Reset
              </Button>
            </Form>
          </div>

          <Table
            columns={columns}
            scroll={{
              x: "100%",
            }}
            dataSource={sortedData}
            size="small"
            loading={loading}
            pagination={false}
          />
          <div style={{ margin: "50px 0" }}>
            <Pagination
              align="end"
              showSizeChanger
              size="small"
              pageSizeOptions={["10", "50", "100", "500", "1000"]}
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

export default StockAdjustment;
