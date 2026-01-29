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
  message,
  Pagination,
  Divider,
  Radio,
  DatePicker,
  Badge,
  Flex,
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
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

import { Link, NavLink } from "react-router-dom";
import SalesMenu from "./../SalesMenu";
import Config from "../../../Config";
import SubMenuToggle from "../../Common/SubMenuToggle";
import axios from "axios";
import dayjs from "dayjs";
import moment from "moment";
import { QueueListIcon } from "@heroicons/react/24/outline";

const ExcelJS = require("exceljs");

function IncompleteSaleReceipts() {
  const AccessKey = localStorage.getItem("AccessKey");
  const UserID = localStorage.getItem("ID");
  const CompanyID = localStorage.getItem("CompanyID");
  const FYear = localStorage.getItem("DefaultFYear");

  const [loading, setLoading] = useState(false);
  const [ListOfRecords, setListOfRecords] = useState([]);
  const [OrderBy, setOrderBy] = useState("");
  const [Name, setName] = useState("");
  const [AccountCode, setAccountCode] = useState("");
  const [Type, setType] = useState("");
  const [Date, setDate] = useState("");
  const [CustomerID, setCustomerID] = useState("");

  const [IsDeleted, setIsDeleted] = useState(false);
  const [CustomerLoading, setCustomerLoading] = useState(false);
  const [open, setOpen] = useState(false);
  // pagination
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [OpenDate, setOpenDate] = useState("");
  const [receiptBody, setReceiptBody] = useState([]);
  const [IncompleteReceipt, setIncompleteReceipt] = useState(0);

  const [form] = Form.useForm();
  const [formMain] = Form.useForm();

  const fetchSales = async () => {
    setLoading(true);
    const api_config = {
      method: "get",
      url: `${Config.base_url}ReceiptHead/GetBy/${CompanyID}?orderBy=${OrderBy}&customerAccountCode=${AccountCode}&customerName=${Name}&InComplete=true&receiptType=${Type}&date=${Date}`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AccessKey}`,
      },
    };

    try {
      const response = await axios(api_config);
      if (response.data && response.data.status_code === 1) {
        setListOfRecords(response.data.listofSales || []);
      } else {
        setListOfRecords([]);
      }
    } catch (error) {
      message.error("Network Error..");
      setListOfRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Incomplete Sales Receipts";
    fetchSales();
  }, [OrderBy, AccountCode, Name, Type, Date]);

  const handleFilters = (formData) => {
    ////Console.log("Form Data Submitted:", formData);
    setAccountCode(formData["customerAccountCode"] || "");
    setName(formData["customerName"] || "");
    setOrderBy(formData["OrderBy"] || "");
    setType(formData["receiptType"] || "");
    setDate(OpenDate);
    ////Console.log("Type State after set:", formData["saleType"]);
    // fetchAccounts();
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
      title: "Bank",
      dataIndex: "bank",
      key: "bank",
      render: (text, record) => <>{record.bank.split("(")[0]}</>,
    },

    {
      title: "A/C No.",
      dataIndex: "customerAccountCode",
      key: "customerAccountCode",
    },

    {
      title: "Customer",
      dataIndex: "customerName",
      key: "customerName",
      render: (text, record) => <>{record.customerName.split("(")[0]}</>,
    },

    {
      title: "Type",
      dataIndex: "receiptType",
      key: "receiptType",
    },

    {
      title: "V. No.",
      dataIndex: "",
      key: "voucherNo",
      render: (_, record) => {
        let link = "";

        if (record.receiptType === "Receipt") {
          link = `/sales/sales-receipts/edit-sales-receipts/${record.voucherNo}`;
        } else if (record.receiptType === "Payment") {
          link = `/sales/sales-receipts/edit-credit-payments/${record.voucherNo}`;
        } else if (record.receiptType === "Return Receipt") {
          link = `/sales/sales-receipts/edit-return-receipts/${record.voucherNo}`;
        } else if (record.receiptType === "Return Payment") {
          link = `/sales/sales-receipts/edit-return-payment/${record.voucherNo}`;
        }

        return (
          <NavLink className={"primary"} to={link}>
            {record.voucherNo}
          </NavLink>
        );
      },
    },

    {
      title: "Ref No.",
      dataIndex: "refNo",
      key: "refNo",
    },

    {
      title: "Amount",
      dataIndex: "",
      key: "amount",
      render: (text, record) => (
        <>
          {record.receiptType === "Receipt" ||
          record.receiptType === "Return Payment" ? (
            <>{record.amount}</>
          ) : (
            <>{-record.amount}</>
          )}
        </>
      ),
    },
    {
      title: "Total",
      dataIndex: "",
      key: "total",
      render: (text, record) => (
        <>
          {record.receiptType === "Receipt" ||
          record.receiptType === "Return Payment" ? (
            <>{record.total}</>
          ) : (
            <>{-record.total}</>
          )}
        </>
      ),
    },

    {
      title: "Balance",
      dataIndex: "",
      key: "unAllocatedBalance",
      render: (text, record) => (
        <>
          {record.receiptType === "Receipt" ||
          record.receiptType === "Return Payment" ? (
            <>{record.unAllocatedBalance}</>
          ) : (
            <>{-record.unAllocatedBalance}</>
          )}
        </>
      ),
    },
    {
      title: "Actions",
      dataIndex: "Actions",
      key: "Actions",
      render: (_, record) => {
        let link = "";

        if (record.receiptType === "Receipt") {
          link = `/sales/sales-receipts/edit-sales-receipts/${record.voucherNo}`;
        } else if (record.receiptType === "Payment") {
          link = `/sales/sales-receipts/edit-credit-payments/${record.voucherNo}`;
        } else if (record.receiptType === "Return Receipt") {
          link = `/sales/sales-receipts/edit-return-receipts/${record.voucherNo}`;
        } else if (record.receiptType === "Return Payment") {
          link = `/sales/sales-receipts/edit-return-payment/${record.voucherNo}`;
        }

        return (
          <div className="table-actions">
            <NavLink className="primary" to={link}>
              <EditOutlined />
            </NavLink>
            <Popconfirm
              title="Delete the task"
              description="Are you sure to delete this account?"
              onConfirm={
                record.receiptType === "Receipt"
                  ? (e) => handleDeleteReceipt(record.id)
                  : record.receiptType === "Return Receipt"
                  ? (e) => deleteReturnReceipt(record.id)
                  : record.receiptType === "Payment"
                  ? (e) => handleDeleteReceipt(record.id)
                  : (e) => deleteReturnPayment(record.id)
              }
              okText="Yes"
              cancelText="No"
            >
              <DeleteOutlined />
            </Popconfirm>
          </div>
        );
      },
    },
  ];

  const handleDeleteReceipt = async (sno) => {
    setLoading(true);
    try {
      const data = {
        ID: sno,
        CompanyID: CompanyID,
      };
      const response = await axios.patch(
        `${Config.base_url}Sales/DeleteReceipt`,
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
        setLoading(false);
      } else {
        message.error(response.data.status_message);
        setLoading(false);
      }
    } catch (error) {
      ////Console.log(error);
      message.error("Network Error..");
      setLoading(false);
    }
    fetchSales();
  };

  const deleteReturnReceipt = async (sno) => {
    setLoading(true);
    try {
      const accountToUpdate = ListOfRecords.find((u) => u.id === sno);
      ////Console.log(accountToUpdate);
      if (!accountToUpdate) {
        message.error("Sale not found!");
        return;
      }

      const name = accountToUpdate.customerName.match(/^[^\(]+/)[0].trim();
      const code = accountToUpdate.customerAccountCode;

      const CustomerData = await axios.get(
        `${Config.base_url}CustomerSupplier/GetCustomersBy/${CompanyID}?accountCode=${code}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${AccessKey}`,
          },
        }
      );
      ////Console.log(CustomerData.data.listofCustomers[0]);

      const deleteCustomer = CustomerData.data.listofCustomers[0];
      if (!accountToUpdate) {
        message.error("Receipt not found!");
        return;
      }

      const updatedAccount = {
        ...accountToUpdate,
        isActive: false,
        isDeleted: true,
      };

      const response = await axios.patch(
        `${Config.base_url}ReceiptHead/UpdateRecord/${sno}`,
        updatedAccount,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${AccessKey}`,
          },
        }
      );
      if (response.data.status_code == 1) {
        try {
          ////Console.log(response.data)
          const voucherNo = response.data.receiptHead.voucherNo;
          let ReceiptBodyData = await axios.get(
            `${Config.base_url}ReceiptBody/GetReceiptBodyBy/${voucherNo}/${CompanyID}`,
            {
              headers: {
                Authorization: `Bearer ${AccessKey}`,
              },
            }
          );

          ////Console.log(ReceiptBodyData.data);
          setReceiptBody(ReceiptBodyData.data.saleBodyData);

          for (const item of ReceiptBodyData.data.saleBodyData) {
            try {
              const ReceiptHeadToUpdate = await axios.get(
                `${Config.base_url}ReceiptHead/GetReceiptHeadDataBy/${item.voucherID}/${CompanyID}`,
                {
                  headers: {
                    Authorization: `Bearer ${AccessKey}`,
                  },
                }
              );
              ////Console.log(ReceiptHeadToUpdate.data.saleHeadData);

              const ReceiptDataToUpdate =
                ReceiptHeadToUpdate.data.saleHeadData.map((receipt, index) => {
                  // const correspondingField = fields[index] || {};
                  return {
                    ...receipt,
                    unAllocatedBalance:
                      parseFloat(receipt.unAllocatedBalance || 0) +
                      parseFloat(
                        ReceiptBodyData.data.saleBodyData[index].receipt || 0
                      ),
                  };
                });
              ////Console.log(ReceiptDataToUpdate);
              try {
                const saleResponse = await axios.patch(
                  `${Config.base_url}ReceiptHead/UpdateRecords`,
                  ReceiptDataToUpdate,
                  {
                    headers: {
                      Authorization: `Bearer ${AccessKey}`,
                    },
                  }
                );
                ////Console.log(saleResponse);
              } catch (error) {
                message.error("Network Error..");
              }
            } catch (error) {
              message.error("Network Error..");
            }
          }
        } catch (error) {
          message.error("Network Error..");
        }

        const updateCustomerData = {
          ...deleteCustomer,
          isSupplier: false,
          customerOpeningBalance:
            deleteCustomer.customerOpeningBalance - accountToUpdate.amount,
        };
        await axios.patch(
          Config.base_url +
            `CustomerSupplier/UpdateRecord/${deleteCustomer.id}`,
          updateCustomerData,
          {
            headers: {
              Authorization: `Bearer ${AccessKey}`,
            },
          }
        );
        message.success(response.data.status_message);
      }
    } catch (error) {
      ////Console.log(error);
      message.error("Network Error..");
    }
    fetchSales();
  };

  const deleteReturnPayment = async (sno) => {
    setLoading(true);
    try {
      const accountToUpdate = ListOfRecords.find((u) => u.id === sno);
      ////Console.log(accountToUpdate);
      if (!accountToUpdate) {
        message.error("Sale not found!");
        return;
      }

      const name = accountToUpdate.customerName.match(/^[^\(]+/)[0].trim();
      const code = accountToUpdate.customerAccountCode;

      const CustomerData = await axios.get(
        `${Config.base_url}CustomerSupplier/GetCustomersBy/${CompanyID}?accountCode=${code}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${AccessKey}`,
          },
        }
      );
      ////Console.log(CustomerData.data.listofCustomers[0]);

      const deleteCustomer = CustomerData.data.listofCustomers[0];
      if (!accountToUpdate) {
        message.error("Receipt not found!");
        return;
      }

      const updatedAccount = {
        ...accountToUpdate,
        isActive: false,
        isDeleted: true,
      };

      const response = await axios.patch(
        `${Config.base_url}ReceiptHead/UpdateRecord/${sno}`,
        updatedAccount,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${AccessKey}`,
          },
        }
      );
      if (response.data.status_code == 1) {
        try {
          ////Console.log(response.data)
          const voucherNo = response.data.receiptHead.voucherNo;
          var ReceiptBodyData = await axios.get(
            `${Config.base_url}ReceiptBody/GetReceiptBodyBy/${voucherNo}/${CompanyID}`,
            {
              headers: {
                Authorization: `Bearer ${AccessKey}`,
              },
            }
          );

          ////Console.log(ReceiptBodyData.data);
          setReceiptBody(ReceiptBodyData.data.saleBodyData);

          for (const item of ReceiptBodyData.data.saleBodyData) {
            try {
              const ReceiptHeadToUpdate = await axios.get(
                `${Config.base_url}ReceiptHead/GetReceiptHeadDataBy/${item.voucherID}/${CompanyID}`,
                {
                  headers: {
                    Authorization: `Bearer ${AccessKey}`,
                  },
                }
              );
              ////Console.log(ReceiptHeadToUpdate.data.saleHeadData);

              const ReceiptDataToUpdate =
                ReceiptHeadToUpdate.data.saleHeadData.map((receipt, index) => {
                  // const correspondingField = fields[index] || {};
                  return {
                    ...receipt,
                    unAllocatedBalance:
                      parseFloat(receipt.unAllocatedBalance || 0) +
                      parseFloat(
                        ReceiptBodyData.data.saleBodyData[index].receipt || 0
                      ),
                  };
                });
              ////Console.log(ReceiptDataToUpdate);
              try {
                const saleResponse = await axios.patch(
                  `${Config.base_url}ReceiptHead/UpdateRecords`,
                  ReceiptDataToUpdate,
                  {
                    headers: {
                      Authorization: `Bearer ${AccessKey}`,
                    },
                  }
                );
                ////Console.log(saleResponse);
              } catch (error) {
                console.error("Error updating records:", error);
              }
            } catch (error) {
              console.error("Error updating records:", error);
            }
          }
        } catch (error) {
          console.error("Error updating records:", error);
        }

        const updateCustomerData = {
          ...deleteCustomer,
          isSupplier: false,
          customerOpeningBalance:
            deleteCustomer.customerOpeningBalance + accountToUpdate.amount,
        };
        await axios.patch(
          Config.base_url +
            `CustomerSupplier/UpdateRecord/${deleteCustomer.id}`,
          updateCustomerData,
          {
            headers: {
              Authorization: `Bearer ${AccessKey}`,
            },
          }
        );
        message.success(response.data.status_message);
      }
    } catch (error) {
      ////Console.log(error);
      message.error("Network Error..");
    }
    fetchSales();
  };

  const onReset = () => {
    form.resetFields();
    setType("");
    setAccountCode("");
    setName("");
    setDate("");
    setOrderBy("");
    setOpenDate("");
  };

  const items = [
    {
      key: "1",
      label: (
        <Link to={`/sales/sales-receipts/add-sales-receipts`}>
          Receipt (SR)
        </Link>
      ),
    },
    {
      key: "2",
      label: (
        <Link to={`/sales/sales-receipts/add-sales-payment`}>
          Payment (SCP)
        </Link>
      ),
    },
    {
      key: "3",
      label: (
        <Link to={`/sales/sales-receipts/add-return-receipt`}>
          Return Receipt (RSR)
        </Link>
      ),
    },
    {
      key: "4",
      label: (
        <Link to={`/sales/sales-receipts/add-return-payment`}>
          Return Payment (RSCP)
        </Link>
      ),
    },
  ];

  const BatchItems = (
    <Menu>
      <Menu.Item key="5">
        <Link to={`/sales/sales-receipts/add-batch-receipts`}>
          Receipts (SR)
        </Link>
      </Menu.Item>
      <Menu.Item key="6">
        <Link to={`/sales/sales-receipts/add-batch-payments`}>
          Payments (SCP)
        </Link>
      </Menu.Item>
    </Menu>
  );

  const handleExport = () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Sales");

    // Set column headers and their widths
    sheet.columns = [
      { header: "Sr#", key: "sr", width: 10 },
      { header: "Date", key: "date", width: 20 },
      { header: "Account Number", key: "customerAccountCode", width: 30 },
      { header: "Customer Name", key: "customerName", width: 50 },
      { header: "Type", key: "receiptType", width: 20 },
      { header: "Voucher Number", key: "voucherNo", width: 20 },
      { header: "Ref No", key: "refNo", width: 20 },
      { header: "Amount", key: "amount", width: 20 },
      { header: "Total", key: "total", width: 15 },
      { header: "Balance", key: "unAllocatedBalance", width: 15 },
    ];

    // Add rows to the sheet
    ListOfRecords.forEach((salesReceipt, index) => {
      sheet.addRow({
        sr: index + 1,
        date: salesReceipt.date,
        customerAccountCode: salesReceipt.customerAccountCode,
        customerName: salesReceipt.customerName,
        receiptType: salesReceipt.receiptType,
        voucherNo: salesReceipt.voucherNo,
        refNo: salesReceipt.refNo,
        amount: salesReceipt.amount,
        total: salesReceipt.total,
        unAllocatedBalance: salesReceipt.unAllocatedBalance,
      });
    });

    const now = new window.Date();
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
      anchor.download = `ReceiptsList_${dateString}.xlsx`;
      anchor.click();
      window.URL.revokeObjectURL(url);
    });
  };

  const handleDateChange = (e, value) => {
    setOpenDate(value);
  };

  const sortedData = ListOfRecords.sort(
    (a, b) => dayjs(b.date).unix() - dayjs(a.date).unix()
  );

  return (
    <>
      <div id="sub-menu-wrap">
        <h5>Sales Receipt</h5>
        {/* <SalesMenu /> */}
      </div>
      <div className="right-side-contents">
        <div className="page-content">
          <div className="page-header">
            <SubMenuToggle />
            <h3 className="page-title">
              {" "}
              <NavLink to="/sales/sales-receipts">
                <ArrowLeftIcon />
              </NavLink>
              Incomplete Sales Receipts
            </h3>
            <div className="header-actions">
              <Button
                type="dashed"
                onClick={handleExport}
                icon={<UploadOutlined />}
              >
                Export
              </Button>
              <Dropdown
                menu={{
                  items,
                }}
                placement="bottomLeft"
                arrow
              >
                <Button type="primary" icon={<PlusOutlined />}>
                  New
                </Button>
              </Dropdown>
              <Dropdown overlay={BatchItems} placement="bottomLeft" arrow>
                <Button type="primary" icon={<PlusOutlined />}>
                  Batch
                </Button>
              </Dropdown>
            </div>
          </div>
          <div className="filters-wrap">
            <Flex justify="space-between" align="center">
              <Form onFinish={handleFilters} form={form}>
                <Form.Item name="OrderBy">
                  <Select placeholder="Order By" style={{ width: 120 }}>
                    <Select.Option value="customeraccountcode">
                      A/C Code
                    </Select.Option>
                    <Select.Option value="customername">
                      Customer Name
                    </Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item name="receiptType">
                  <Select placeholder="Type" style={{ width: 120 }}>
                    <Select.Option value="">All Types</Select.Option>
                    <Select.Option value="Receipt">Receipt</Select.Option>
                    <Select.Option value="Payment">Payment</Select.Option>
                    <Select.Option value="Return Receipt">
                      Return Receipt
                    </Select.Option>
                    <Select.Option value="Return Payment">
                      Return Payment
                    </Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item name="customerName">
                  <Input
                    onFocus={(e) => e.target.select()}
                    placeholder="Customer Name"
                  />
                </Form.Item>
                <Form.Item name="customerAccountCode">
                  <Input
                    onFocus={(e) => e.target.select()}
                    placeholder="A / C No"
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
            columns={columns}
            dataSource={sortedData}
            size="small"
            loading={loading}
            pagination={true}
          />
        </div>
      </div>
    </>
  );
}

export default IncompleteSaleReceipts;
