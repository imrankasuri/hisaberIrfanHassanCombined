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
  Spin,
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
import SalesMenu from "./../SalesMenu";
import Config from "../../../Config";
import SubMenuToggle from "../../Common/SubMenuToggle";
import axios from "axios";
import dayjs from "dayjs";
import moment from "moment";
import { QueueListIcon } from "@heroicons/react/24/outline";
import BadgeComponent from "../../Common/Badge";
import LevelWiseAccount2 from "../../Shared/LevelWiseAccount2";

const ExcelJS = require("exceljs");

function SaleReceipts() {
  const AccessKey = localStorage.getItem("AccessKey");
  const UserID = localStorage.getItem("ID");
  const CompanyID = localStorage.getItem("CompanyID");
  const FYear = localStorage.getItem("DefaultFYear");

  const [loading, setLoading] = useState(false);
  const [ListOfRecords, setListOfRecords] = useState([]);
  const [BankLoading, setBankLoading] = useState(false);
  const [BankList, setBankList] = useState([]);
  const [OrderBy, setOrderBy] = useState("");
  const [Name, setName] = useState("");
  const [AccountCode, setAccountCode] = useState("");
  const [Bank, setBank] = useState("");
  const [VoucherNo, setVoucherNo] = useState(0);
  const [RefNo, setRefNo] = useState("");
  const [Type, setType] = useState("");
  const [Date, setDate] = useState("");
  const [CustomerID, setCustomerID] = useState("");
  const [customerList, setCustomerList] = useState([]);
  const [selectedBank, setSelectedBank] = useState(null);
  const [bankCode, setBankCode] = useState("");

  const [IsDeleted, setIsDeleted] = useState(false);
  const [CustomerLoading, setCustomerLoading] = useState(false);
  const [open, setOpen] = useState(false);
  // pagination
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [TotalRecords, setTotalRecords] = useState(0);
  const [TotalCustomerRecords, setTotalCustomerRecords] = useState(0);
  const [OpenDate, setOpenDate] = useState("");
  const [receiptBody, setReceiptBody] = useState([]);
  const [IncompleteReceipt, setIncompleteReceipt] = useState(0);

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

  const fetchSales = async () => {
    setLoading(true);
    const api_config = {
      method: "get",
      url: `${Config.base_url}ReceiptHead/GetBy/${CompanyID}?orderBy=${OrderBy}&pageNumber=${pageNumber}&pageSize=${pageSize}&bank=${Bank}&customerName=${Name}&voucherNo=${VoucherNo}&refNo=${RefNo}&InComplete=false&receiptType=${Type}&date=${Date}`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AccessKey}`,
      },
    };

    try {
      const response = await axios(api_config);
      // //Console.log(response);
      if (response.data && response.data.status_code === 1) {
        setListOfRecords(response.data.listofSales || []);
        setTotalRecords(response.data.totalRecords || 0);
      } else {
        setListOfRecords([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setListOfRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchIncompleteReceipts = async () => {
    setLoading(true);
    const api_config = {
      method: "get",
      url: `${Config.base_url}ReceiptHead/GetBy/${CompanyID}?orderBy=${OrderBy}&pageNumber=${pageNumber}&pageSize=${pageSize}&bank=${Bank}&customerName=${Name}&voucherNo=${VoucherNo}&refNo=${RefNo}&InComplete=true&receiptType=${Type}&date=${Date}`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AccessKey}`,
      },
    };

    try {
      const response = await axios(api_config);
      if (response.data && response.data.status_code === 1) {
        setIncompleteReceipt(response.data.totalRecords || 0);
      } else {
        setIncompleteReceipt(0);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setIncompleteReceipt(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Sales Receipts";
    fetchSales();
    fetchIncompleteReceipts();
    fetchCustomer();
    fetchBankAccounts();
  }, [
    OrderBy,
    AccountCode,
    Name,
    Type,
    Date,
    Bank,
    VoucherNo,
    RefNo,
    pageNumber,
    pageSize,
  ]);

  const fetchCustomer = async () => {
    setLoading(true);

    const api_config = {
      method: "get",
      url: `${Config.base_url}CustomerSupplier/GetCustomersBy/${CompanyID}`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AccessKey}`,
      },
    };

    ////Console.log("Fetching data from URL:", api_config.url);

    try {
      const response = await axios(api_config);
      ////Console.log("API response:", response.data);

      if (response.data && response.data.status_code === 1) {
        ////Console.log("Filtered Customers:", response.data.listofCustomers);
        ////Console.log("Total Records:", response.data.totalRecords);

        setCustomerList(response.data.listofCustomers || []);
        setTotalCustomerRecords(response.data.totalRecords || 0);
      } else {
        console.warn(
          "No data or error status_code:",
          response.data.status_code
        );
        setCustomerList([]);
      }
    } catch (error) {
      console.error(
        "Error fetching data:",
        error.response?.data || error.message
      );
      setListOfRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBankAccounts = async () => {
    setBankLoading(true);
    try {
      const response = await LevelWiseAccount2(3, "50108");
      if (response != null) {
        setBankList(response);
      }
    } catch (error) {
      // //console.error(error);
    } finally {
      setBankLoading(false);
    }
  };

  const handleFilters = (formData) => {
    console.log("Form Data Submitted:", formData);

    // Handle bank filter
    const bankValue = formData["bank"] || "";
    setBank(bankValue);

    // Handle other filters
    setVoucherNo(formData["voucherNo"] || 0);
    setRefNo(formData["refNo"] || "");
    setName(formData["customerName"] || "");
    setOrderBy(formData["OrderBy"] || "");
    setType(formData["receiptType"] || "");
    setDate(OpenDate);

    // Reset pagination
    setPageNumber(1);
    setPageSize(20);

    // Update bank-related states
    if (bankValue && bankValue !== "all") {
      const bank = BankList.find(
        (bank) =>
          bank.accountDescription + " " + `(${bank.accountCode})` === bankValue
      );
      if (bank) {
        setSelectedBank(bank);
        setBankCode(bank.accountCode);
      }
    } else {
      setSelectedBank(null);
      setBankCode("");
    }

    // Validate and clean up filter values
    if (formData["voucherNo"] && isNaN(formData["voucherNo"])) {
      setVoucherNo(0);
      message.warning("Voucher No must be a number");
    }
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
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
    },
    {
      title: "Bank",
      dataIndex: "bank",
      key: "bank",
      sorter: (a, b) => a.bank.localeCompare(b.bank),
      render: (text, record) => (
        <>
          <>
            <NavLink
              className={"primary"}
              to={`/bank/report?source=${record.bankCode}`}
            >
              {record.bank.split(" (")[0]}
            </NavLink>
          </>
        </>
      ),
    },

    {
      title: "A/C No.",
      dataIndex: "customerAccountCode",
      key: "customerAccountCode",
      sorter: (a, b) => a.customerAccountCode - b.customerAccountCode,
    },

    {
      title: "Customer",
      dataIndex: "customerName",
      key: "customerName",
      sorter: (a, b) => a.customerName.localeCompare(b.customerName),
      render: (text, record) => (
        <>
          <>
            <NavLink
              className={"primary"}
              to={`/customer/report?source=${record.customerAccountCode}`}
            >
              {record.customerName.split(" (")[0]}
            </NavLink>
          </>
        </>
      ),
    },

    {
      title: "Type",
      dataIndex: "receiptType",
      key: "receiptType",
      sorter: (a, b) => a.receiptType.localeCompare(b.receiptType),
    },

    {
      title: "V. No.",
      dataIndex: "",
      key: "voucherNo",
      sorter: (a, b) => a.voucherNo - b.voucherNo,
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
      sorter: (a, b) => a.refNo.localeCompare(b.refNo),
    },

    {
      title: "Amount",
      dataIndex: "",
      key: "amount",
      sorter: (a, b) => a.amount - b.amount,
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
      sorter: (a, b) => a.total - b.total,
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
      sorter: (a, b) => a.unAllocatedBalance - b.unAllocatedBalance,
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
    setBank("");
    setVoucherNo(0);
    setRefNo("");
    setName("");
    setDate("");
    setOrderBy("");
    setOpenDate("");
    setPageNumber(1);
    setPageSize(20);
    setSelectedBank(null);
    setBankCode("");
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
          Receipt Return (SCP)
        </Link>
      ),
    },
    // {
    //   key: "3",
    //   label: (
    //     <Link to={`/sales/sales-receipts/add-return-receipt`}>
    //       Return Receipt (RSR)
    //     </Link>
    //   ),
    // },
    // {
    //   key: "4",
    //   label: (
    //     <Link to={`/sales/sales-receipts/add-return-payment`}>
    //       Return Payment (RSCP)
    //     </Link>
    //   ),
    // },
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
          Receipt Return (SCP)
        </Link>
      </Menu.Item>
    </Menu>
  );

  const MultiItems = (
    <Menu>
      <Menu.Item key="5">
        <Link to={`/sales/sales-receipts/add-multi-receipts`}>
          Receipts (SR)
        </Link>
      </Menu.Item>
      <Menu.Item key="6">
        <Link to={`/sales/sales-receipts/add-multi-payments`}>
          Receipt Return (SCP)
        </Link>
      </Menu.Item>
    </Menu>
  );

  const handleExport = async () => {
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

    const api_config = {
      method: "get",
      url: `${Config.base_url}ReceiptHead/GetBy/${CompanyID}?orderBy=${OrderBy}&pageNumber=1&pageSize=1000000&bank=${Bank}&customerAccountCode=${AccountCode}&customerName=${Name}&receiptType=${Type}&date=${Date}`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AccessKey}`,
      },
    };

    try {
      const response = await axios(api_config);
      if (response.data && response.data.status_code === 1) {
        const DataToExport = response.data.listofSales || [];
        // Add rows to the sheet
        DataToExport.forEach((salesReceipt, index) => {
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
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleBankChange = (value) => {
    if (value === "all") {
      setSelectedBank(null);
      setBankCode("");
      setBank("");
    } else {
      const bank = BankList.find(
        (bank) =>
          bank.accountDescription + " " + `(${bank.accountCode})` === value
      );
      setSelectedBank(bank);
      setBankCode(bank.accountCode);
      setBank(value);
    }
  };

  const handleDateChange = (e, value) => {
    setOpenDate(value);
  };

  const sortedData = ListOfRecords.sort((a, b) => b.voucherNo - a.voucherNo);

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
            <h3 className="page-title">Sales Receipts</h3>
            <div className="header-actions">
              <NavLink to="/sales/sales-receipt/import">
                <Button type="dashed" icon={<DownloadOutlined />}>
                  Import
                </Button>
              </NavLink>
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
              <Dropdown overlay={MultiItems} placement="bottomLeft" arrow>
                <Button type="primary" icon={<PlusOutlined />}>
                  Multi
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
            <Form onFinish={handleFilters} form={form}>
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
                <Select
                  showSearch
                  filterOption={(input, option) =>
                    option.label.toLowerCase().includes(input.toLowerCase())
                  }
                  placeholder="Customer"
                  style={{ width: "250px" }}
                  loading={CustomerLoading}
                  notFoundContent={
                    CustomerLoading ? (
                      <Spin size="small" />
                    ) : (
                      "No customers found"
                    )
                  }
                  disabled={CustomerLoading}
                  options={
                    customerList && customerList.length > 0
                      ? customerList.map((record) => ({
                          label: `${record.businessName}`,
                          value: `${record.businessName}`,
                        }))
                      : []
                  }
                />
              </Form.Item>
              <Form.Item name="bank">
                <Select
                  placeholder="Select Bank"
                  style={{ width: "200px" }}
                  loading={BankLoading}
                  showSearch
                  filterOption={(input, option) =>
                    option.value.toLowerCase().includes(input.toLowerCase())
                  }
                  notFoundContent={
                    BankLoading ? <Spin size="small" /> : "No banks found"
                  }
                  onChange={handleBankChange}
                  disabled={BankLoading}
                >
                  <Select.Option value="all">All Banks</Select.Option>
                  {BankList && BankList.length > 0
                    ? BankList.map((bank) => (
                        <Select.Option
                          key={bank.accountNo || bank.accountCode}
                          value={`${bank.accountDescription} (${bank.accountCode})`}
                        >
                          {bank.accountDescription} ({bank.accountCode})
                        </Select.Option>
                      ))
                    : null}
                </Select>
              </Form.Item>
              <Form.Item name="voucherNo">
                <Input
                  onFocus={(e) => e.target.select()}
                  placeholder="Voucher No"
                  style={{ width: "150px" }}
                />
              </Form.Item>
              <Form.Item name="refNo">
                <Input
                  onFocus={(e) => e.target.select()}
                  placeholder="Ref No"
                  style={{ width: "150px" }}
                />
              </Form.Item>
              <Form.Item name="date">
                <DatePicker
                  format="YYYY-MM-DD"
                  onChange={handleDateChange}
                  placeholder="Date"
                  style={{ width: "150px" }}
                />
              </Form.Item>

              <Form.Item>
                <Button htmlType="submit" type="primary" loading={loading}>
                  Filter
                </Button>
                <Button htmlType="button" onClick={onReset} type="link">
                  Reset
                </Button>
              </Form.Item>

              <div className="incomplete-badge">
                <BadgeComponent
                  text="Receipts"
                  link="/sales/incomplete-sales-receipts"
                  count={IncompleteReceipt}
                />
              </div>
            </Form>
          </div>

          <Table
            columns={columns}
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
              onShowSizeChange={onShowSizeChange}
              onChange={onPageChange}
              current={pageNumber}
              pageSize={pageSize}
              pageSizeOptions={["10", "50", "100", "500", "1000"]}
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

export default SaleReceipts;
