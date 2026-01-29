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
  Flex,
  Badge,
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
import Config from "../../../Config";
import SubMenuToggle from "../../Common/SubMenuToggle";
import axios from "axios";
import dayjs from "dayjs";
import moment from "moment";
import { QueueListIcon } from "@heroicons/react/24/outline";
import PurchaseMenu from "./../PurchaseMenu";
import BadgeComponent from "../../Common/Badge";
import LevelWiseAccount2 from "../../Shared/LevelWiseAccount2";
const ExcelJS = require("exceljs");

function Payments() {
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
  const [VoucherNo, setVoucherNo] = useState(0);
  const [RefNo, setRefNo] = useState("");

  // pagination
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [TotalRecords, setTotalRecords] = useState(0);
  const [OpenDate, setOpenDate] = useState("");
  const [PaymentBody, setPaymentBody] = useState([]);
  const [IncompletePayments, setIncompletePayments] = useState(0);
  const [TotalSupplierRecords, setTotalSupplierRecords] = useState(0);
  const [supplierList, setSupplierList] = useState([]);
  const [BankLoading, setBankLoading] = useState(false);
  const [BankList, setBankList] = useState([]);
  const [Bank, setBank] = useState("");
  const [selectedBank, setSelectedBank] = useState(null);
  const [bankCode, setBankCode] = useState("");
  const [SupplierLoading, setSupplierLoading] = useState(false);

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

  const fetchPayments = async () => {
    setLoading(true);
    const api_config = {
      method: "get",
      url: `${Config.base_url}PaymentHead/GetBy/${CompanyID}?orderBy=${OrderBy}&pageNumber=${pageNumber}&pageSize=${pageSize}&bank=${Bank}&voucherNo=${VoucherNo}&refNo=${RefNo}&supplierName=${Name}&InComplete=false&paymentType=${Type}&date=${Date}`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AccessKey}`,
      },
    };

    try {
      const response = await axios(api_config);
      if (response.data && response.data.status_code === 1) {
        setListOfRecords(response.data.listofPayments || []);
        setTotalRecords(response.data.totalRecords || 0);
      } else {
        setListOfRecords([]);
      }
    } catch (error) {
      //console.error("Error fetching data:", error);
      setListOfRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchIncompletePayments = async () => {
    setLoading(true);
    const api_config = {
      method: "get",
      url: `${Config.base_url}PaymentHead/GetBy/${CompanyID}?orderBy=${OrderBy}&pageNumber=${pageNumber}&pageSize=${pageSize}&bank=${Bank}&voucherNo=${VoucherNo}&refNo=${RefNo}&supplierName=${Name}&InComplete=true&paymentType=${Type}&date=${Date}`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AccessKey}`,
      },
    };

    try {
      const response = await axios(api_config);
      if (response.data && response.data.status_code === 1) {
        setIncompletePayments(response.data.totalRecords || 0);
      }
    } catch (error) {
      //console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Supplier Payments";
    fetchPayments();
    fetchIncompletePayments();
    fetchSupplier();
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

  const fetchSupplier = async () => {
    setSupplierLoading(true);

    const api_config = {
      method: "get",
      url: `${Config.base_url}CustomerSupplier/GetSuppliersBy/${CompanyID}`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AccessKey}`,
      },
    };

    //////Console.log("Fetching data from URL:", api_config.url);

    try {
      const response = await axios(api_config);
      //////Console.log("API response:", response.data);

      if (response.data && response.data.status_code === 1) {
        //////Console.log("Filtered Customers:", response.data.listofCustomers);
        //////Console.log("Total Records:", response.data.totalRecords);

        setSupplierList(response.data.listofSuppliers || []);
        setTotalSupplierRecords(response.data.totalRecords || 0);
      } else {
        //console.warn(
        //   "No data or error status_code:",
        //   response.data.status_code
        // );
        setSupplierList([]);
      }
    } catch (error) {
      //console.error(
      //   "Error fetching data:",
      //   error.response?.data || error.message
      // );
      setSupplierList([]);
    } finally {
      setSupplierLoading(false);
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
    //////Console.log("Form Data Submitted:", formData);

    // Handle bank filter
    const bankValue = formData["bank"] || "";
    setBank(bankValue);

    // Handle other filters
    setRefNo(formData["refNo"] || "");
    setVoucherNo(formData["voucherNo"] || 0);
    setName(formData["supplierName"] || "");
    setOrderBy(formData["OrderBy"] || "");
    setType(formData["paymentType"] || "");
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
      dataIndex: "supplierAccountCode",
      key: "supplierAccountCode",
      sorter: (a, b) => a.supplierAccountCode - b.supplierAccountCode,
    },

    {
      title: "Supplier",
      dataIndex: "supplierName",
      key: "supplierName",
      sorter: (a, b) => a.supplierName.localeCompare(b.supplierName),
      render: (text, record) => (
        <>
          <>
            <NavLink
              className={"primary"}
              to={`/supplier/report?source=${record.supplierAccountCode}`}
            >
              {record.supplierName.split(" (")[0]}
            </NavLink>
          </>
        </>
      ),
    },

    {
      title: "Type",
      dataIndex: "purchaseType",
      key: "purchaseType",
      sorter: (a, b) => a.purchaseType.localeCompare(b.purchaseType),
    },
    {
      title: "Voucher No.",
      dataIndex: "",
      key: "voucherNo",
      sorter: (a, b) => a.voucherNo - b.voucherNo,
      render: (_, record) => {
        let link = "";

        if (record.purchaseType === "Payment") {
          link = `/purchases/purchase-payments/edit-supplier-payment/${record.voucherNo}`;
        } else if (record.purchaseType === "Receipt") {
          link = `/purchases/purchase-payments/edit-supplier-receipt/${record.voucherNo}`;
        } else if (record.purchaseType === "Return Payment") {
          link = `/purchases/purchase-payments/edit-return-supplier-payment/${record.voucherNo}`;
        } else if (record.purchaseType === "Return Receipt") {
          link = `/purchases/purchase-payments/edit-return-supplier-receipt/${record.voucherNo}`;
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
          {record.purchaseType === "Payment" ||
          record.purchaseType === "Return Receipt" ? (
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
          {record.purchaseType === "Payment" ||
          record.purchaseType === "Return Receipt" ? (
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
          {record.purchaseType === "Payment" ||
          record.purchaseType === "Return Receipt" ? (
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

        if (record.purchaseType === "Payment") {
          link = `/purchases/purchase-payments/edit-supplier-payment/${record.voucherNo}`;
        } else if (record.purchaseType === "Receipt") {
          link = `/purchases/purchase-payments/edit-supplier-receipt/${record.voucherNo}`;
        } else if (record.purchaseType === "Return Payment") {
          link = `/purchases/purchase-payments/edit-return-supplier-payment/${record.voucherNo}`;
        } else if (record.purchaseType === "Return Receipt") {
          link = `/purchases/purchase-payments/edit-return-supplier-receipt/${record.voucherNo}`;
        }

        return (
          <div className="table-actions">
            <NavLink className={"primary"} to={link}>
              <EditOutlined />
            </NavLink>
            <Popconfirm
              title="Delete the task"
              description="Are you sure to delete this account?"
              onConfirm={
                record.purchaseType === "Payment"
                  ? (e) => handleDeletePayment(record.id)
                  : record.receiptType === "Return Payment"
                  ? (e) => deleteReturnPayment(record.id)
                  : record.receiptType === "Receipt"
                  ? (e) => handleDeletePayment(record.id)
                  : (e) => deleteReturnReceipt(record.id)
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

  const handleDeletePayment = async (sno) => {
    setLoading(true);
    try {
      const data = {
        ID: sno,
        CompanyID: CompanyID,
      };
      const response = await axios.patch(
        `${Config.base_url}Purchase/DeletePayment`,
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
      //Console.log(error);
      message.error("Network Error..");
      setLoading(false);
    }
    fetchPayments();
  };

  const deleteReturnPayment = async (sno) => {
    setLoading(true);
    try {
      const accountToUpdate = ListOfRecords.find((u) => u.id === sno);
      //////Console.log(accountToUpdate);
      if (!accountToUpdate) {
        message.error("Payment not found!");
        return;
      }

      const code = accountToUpdate.supplierAccountCode;

      const SupplierData = await axios.get(
        `${Config.base_url}CustomerSupplier/GetSuppliersBy/${CompanyID}?accountCode=${code}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${AccessKey}`,
          },
        }
      );
      //////Console.log(SupplierData.data.listofSuppliers[0]);

      const deleteSupplier = SupplierData.data.listofSuppliers[0];
      if (!accountToUpdate) {
        message.error("Payment not found!");
        return;
      }

      const updatedAccount = {
        ...accountToUpdate,
        isActive: false,
        isDeleted: true,
      };

      const response = await axios.patch(
        `${Config.base_url}PaymentHead/UpdateRecord/${sno}`,
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
          //////Console.log(response.data)
          const voucherNo = response.data.paymentHead.voucherNo;
          var PaymentBodyData = await axios.get(
            `${Config.base_url}PaymentBody/GetPaymentBodyBy/${voucherNo}/${CompanyID}`,
            {
              headers: {
                Authorization: `Bearer ${AccessKey}`,
              },
            }
          );

          //////Console.log(PaymentBodyData.data);
          setPaymentBody(PaymentBodyData.data.paymentBodyData);

          for (const item of PaymentBodyData.data.paymentBodyData) {
            try {
              const PaymentHeadToUpdate = await axios.get(
                `${Config.base_url}PaymentHead/GetPaymentHeadDataBy/${item.voucherID}/${CompanyID}`,
                {
                  headers: {
                    Authorization: `Bearer ${AccessKey}`,
                  },
                }
              );
              //////Console.log(PaymentHeadToUpdate.data.paymentHeadData);

              const PaymentDataToUpdate =
                PaymentHeadToUpdate.data.paymentHeadData.map(
                  (payment, index) => {
                    // const correspondingField = fields[index] || {};
                    return {
                      ...payment,
                      unAllocatedBalance:
                        parseFloat(payment.unAllocatedBalance || 0) +
                        parseFloat(
                          PaymentBodyData.data.paymentBodyData[index].payment ||
                            0
                        ),
                    };
                  }
                );
              //////Console.log(PaymentDataToUpdate);
              try {
                const purchaseResponse = await axios.patch(
                  `${Config.base_url}PaymentHead/UpdateRecords`,
                  PaymentDataToUpdate,
                  {
                    headers: {
                      Authorization: `Bearer ${AccessKey}`,
                    },
                  }
                );
                //////Console.log(purchaseResponse);
              } catch (error) {
                //console.error("Error updating records:", error);
              }
            } catch (error) {
              //console.error("Error updating records:", error);
            }
          }
        } catch (error) {
          //console.error("Error updating records:", error);
        }

        const updateSupplierData = {
          ...deleteSupplier,
          isCustomer: false,
          supplierOpeningBalance:
            deleteSupplier.supplierOpeningBalance - accountToUpdate.amount,
        };
        await axios.patch(
          Config.base_url +
            `CustomerSupplier/UpdateRecord/${deleteSupplier.id}`,
          updateSupplierData,
          {
            headers: {
              Authorization: `Bearer ${AccessKey}`,
            },
          }
        );
        message.success("Return Payment deleted Successfully");
      }
    } catch (error) {
      //////Console.log(error);
      message.error("Error in Deleting receipt");
    }
    fetchPayments();
  };

  const deleteReturnReceipt = async (sno) => {
    setLoading(true);
    try {
      const accountToUpdate = ListOfRecords.find((u) => u.id === sno);
      //////Console.log(accountToUpdate);
      if (!accountToUpdate) {
        message.error("Payment not found!");
        return;
      }

      const code = accountToUpdate.supplierAccountCode;

      const SupplierData = await axios.get(
        `${Config.base_url}CustomerSupplier/GetSuppliersBy/${CompanyID}?accountCode=${code}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${AccessKey}`,
          },
        }
      );
      //////Console.log(SupplierData.data.listofSuppliers[0]);

      const deleteSupplier = SupplierData.data.listofSuppliers[0];
      if (!accountToUpdate) {
        message.error("Payment not found!");
        return;
      }

      const updatedAccount = {
        ...accountToUpdate,
        isActive: false,
        isDeleted: true,
      };

      const response = await axios.patch(
        `${Config.base_url}PaymentHead/UpdateRecord/${sno}`,
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
          //////Console.log(response.data)
          const voucherNo = response.data.paymentHead.voucherNo;
          var PaymentBodyData = await axios.get(
            `${Config.base_url}PaymentBody/GetPaymentBodyBy/${voucherNo}/${CompanyID}`,
            {
              headers: {
                Authorization: `Bearer ${AccessKey}`,
              },
            }
          );

          //////Console.log(PaymentBodyData.data);
          setPaymentBody(PaymentBodyData.data.paymentBodyData);

          for (const item of PaymentBodyData.data.paymentBodyData) {
            try {
              const PaymentHeadToUpdate = await axios.get(
                `${Config.base_url}PaymentHead/GetPaymentHeadDataBy/${item.voucherID}/${CompanyID}`,
                {
                  headers: {
                    Authorization: `Bearer ${AccessKey}`,
                  },
                }
              );
              //////Console.log(PaymentHeadToUpdate.data.paymentHeadData);

              const PaymentDataToUpdate =
                PaymentHeadToUpdate.data.paymentHeadData.map(
                  (payment, index) => {
                    // const correspondingField = fields[index] || {};
                    return {
                      ...payment,
                      unAllocatedBalance:
                        parseFloat(payment.unAllocatedBalance || 0) +
                        parseFloat(
                          PaymentBodyData.data.paymentBodyData[index].payment ||
                            0
                        ),
                    };
                  }
                );
              //////Console.log(PaymentDataToUpdate);
              try {
                const purchaseResponse = await axios.patch(
                  `${Config.base_url}PaymentHead/UpdateRecords`,
                  PaymentDataToUpdate,
                  {
                    headers: {
                      Authorization: `Bearer ${AccessKey}`,
                    },
                  }
                );
                //////Console.log(purchaseResponse);
              } catch (error) {
                //console.error("Error updating records:", error);
              }
            } catch (error) {
              //console.error("Error updating records:", error);
            }
          }
        } catch (error) {
          //console.error("Error updating records:", error);
        }

        const updateSupplierData = {
          ...deleteSupplier,
          isCustomer: false,
          supplierOpeningBalance:
            deleteSupplier.supplierOpeningBalance + accountToUpdate.amount,
        };
        await axios.patch(
          Config.base_url +
            `CustomerSupplier/UpdateRecord/${deleteSupplier.id}`,
          updateSupplierData,
          {
            headers: {
              Authorization: `Bearer ${AccessKey}`,
            },
          }
        );
        message.success("Return Payment deleted Successfully");
      }
    } catch (error) {
      //////Console.log(error);
      message.error("Error in Deleting receipt");
    }
    fetchPayments();
  };

  const handleDateChange = (e, value) => {
    setOpenDate(value);
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
        <Link to={`/purchases/purchase-payments/add-supplier-payment`}>
          Payment (VP)
        </Link>
      ),
    },
    {
      key: "2",
      label: (
        <Link to={`/purchases/purchase-payments/add-supplier-receipt`}>
          Payment Return (VCR)
        </Link>
      ),
    },
    // {
    //   key: "3",
    //   label: (
    //     <Link to={`/purchases/purchase-payments/add-return-supplier-payment`}>
    //       Return Payment (RVP)
    //     </Link>
    //   ),
    // },
    // {
    //   key: "4",
    //   label: (
    //     <Link to={`/purchases/purchase-payments/add-return-supplier-receipt`}>
    //       Return Receipt (RVCR)
    //     </Link>
    //   ),
    // },
  ];

  const MultiItems = (
    <Menu>
      <Menu.Item key="5">
        <Link to={`/purchases/purchase-payments/add-multi-payments`}>
          Payments (VP)
        </Link>
      </Menu.Item>
      <Menu.Item key="6">
        <Link to={`/purchases/purchase-payments/add-multi-receipts`}>
          Payment Return (VCR)
        </Link>
      </Menu.Item>
    </Menu>
  );
  const BatchItems = (
    <Menu>
      <Menu.Item key="5">
        <Link to={`/purchases/purchase-payments/add-batch-payments`}>
          Payments (VP)
        </Link>
      </Menu.Item>
      <Menu.Item key="6">
        <Link to={`/purchases/purchase-payments/add-batch-receipts`}>
          Payment Return (VCR)
        </Link>
      </Menu.Item>
    </Menu>
  );

  const handleExport = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Sales");

    const api_config = {
      method: "get",
      url: `${Config.base_url}PaymentHead/GetBy/${CompanyID}?orderBy=${OrderBy}&pageNumber=1&pageSize=100000&bank=${Bank}&voucherNo=${VoucherNo}&refNo=${RefNo}&supplierName=${Name}&InComplete=false&paymentType=${Type}&date=${Date}`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AccessKey}`,
      },
    };

    try {
      const response = await axios(api_config);
      if (response.data && response.data.status_code === 1) {
        const ExportData = response.data.listofPayments || [];

        // Set column headers and their widths
        sheet.columns = [
          { header: "Sr#", key: "sr", width: 10 },
          { header: "Date", key: "date", width: 20 },
          { header: "Account Number", key: "supplierAccountCode", width: 30 },
          { header: "Supplier Name", key: "supplierName", width: 30 },
          { header: "Type", key: "purchaseType", width: 20 },
          { header: "Ref No.", key: "refNo", width: 20 },
          { header: "Amount", key: "amount", width: 20 },
          { header: "Total", key: "totalPayment", width: 15 },
          { header: "Balance", key: "unAllocatedBalance", width: 15 },
        ];

        // Add rows to the sheet
        ExportData.forEach((payments, index) => {
          sheet.addRow({
            sr: index + 1,
            date: payments.date,
            supplierAccountCode: payments.supplierAccountCode,
            supplierName: payments.supplierName,
            purchaseType: payments.purchaseType,
            refNo: payments.refNo,
            amount: payments.amount,
            totalPayment: payments.totalPayment,
            unAllocatedBalance: payments.unAllocatedBalance,
          });
        });

        const now = new window.Date();
        const dateString = now
          .toLocaleString("sv-SE", { timeZoneName: "short" })
          .replace(/[^0-9]/g, "");

        // Generate the Excel file and prompt the user to download it
        workbook.xlsx.writeBuffer().then((data) => {
          const blob = new Blob([data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });
          const url = window.URL.createObjectURL(blob);
          const anchor = document.createElement("a");
          anchor.href = url;
          anchor.download = `PaymentsList_${dateString}.xlsx`;
          anchor.click();
          window.URL.revokeObjectURL(url);
        });
      }
    } catch (error) {
      //console.error("Error fetching data:", error);
      setListOfRecords([]);
    }
  };

  return (
    <>
      <div id="sub-menu-wrap">
        <h5>Payments</h5>
        {/* <PurchaseMenu /> */}
      </div>
      <div className="right-side-contents">
        <div className="page-content">
          <div className="page-header">
            <SubMenuToggle />
            <h3 className="page-title">Supplier Payments</h3>
            <div className="header-actions">
              <NavLink to="/purchases/purchase-payments/import">
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
              <Form.Item name="paymentType">
                <Select placeholder="Type" style={{ width: 120 }}>
                  <Select.Option value="">All Types</Select.Option>
                  <Select.Option value="Payment">Payment</Select.Option>
                  <Select.Option value="Receipt">Receipt</Select.Option>
                  <Select.Option value="Return Payment">
                    Return Payment
                  </Select.Option>
                  <Select.Option value="Return Receipt">
                    Return Receipt
                  </Select.Option>
                </Select>
              </Form.Item>

              <Form.Item name="supplierName">
                <Select
                  showSearch
                  filterOption={(input, option) =>
                    option.label.toLowerCase().includes(input.toLowerCase())
                  }
                  placeholder="Supplier"
                  style={{ width: "250px" }}
                  loading={SupplierLoading}
                  notFoundContent={
                    SupplierLoading ? (
                      <Spin size="small" />
                    ) : (
                      "No suppliers found"
                    )
                  }
                  disabled={SupplierLoading}
                  options={
                    supplierList && supplierList.length > 0
                      ? supplierList.map((record) => ({
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
                  text="Payments"
                  link="/purchases/incomplete-purchase-payments"
                  count={IncompletePayments}
                />
              </div>
            </Form>
          </div>

          <Table
            scroll={{
              x: "100%",
            }}
            columns={columns}
            dataSource={ListOfRecords}
            size="small"
            loading={loading}
            pagination={false}
          />
          <div style={{ margin: "50px 0" }}>
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

export default Payments;
