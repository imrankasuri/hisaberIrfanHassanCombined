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
  DatePicker,
  Flex,
  Badge,
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
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

const ExcelJS = require("exceljs");

function IncompletePayments() {
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

  // pagination
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [OpenDate, setOpenDate] = useState("");
  const [PaymentBody, setPaymentBody] = useState([]);
  const [IncompletePayments, setIncompletePayments] = useState(0);

  const [form] = Form.useForm();
  const [formMain] = Form.useForm();

  const fetchPayments = async () => {
    setLoading(true);
    const api_config = {
      method: "get",
      url: `${Config.base_url}PaymentHead/GetBy/${CompanyID}?orderBy=${OrderBy}&supplierAccountCode=${AccountCode}&supplierName=${Name}&InComplete=true&paymentType=${Type}&date=${Date}`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AccessKey}`,
      },
    };

    try {
      const response = await axios(api_config);
      if (response.data && response.data.status_code === 1) {
        setListOfRecords(response.data.listofPayments || []);
      } else {
        setListOfRecords([]);
      }
    } catch (error) {
      setListOfRecords([]);
      //message.error("Network Error..");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Incomplete Supplier Payments";
    fetchPayments();
  }, [OrderBy, AccountCode, Name, Type, Date]);

  const handleFilters = (formData) => {
    ////Console.log("Form Data Submitted:", formData);
    setAccountCode(formData["supplierAccountCode"] || "");
    setName(formData["supplierName"] || "");
    setOrderBy(formData["OrderBy"] || "");
    setType(formData["paymentType"] || "");
    setDate(OpenDate);
    ////Console.log("Type State after set:", formData["purchaseType"]);
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
      render: (text, record) => record.bank.split("(")[0],
    },

    {
      title: "A/C No.",
      dataIndex: "supplierAccountCode",
      key: "supplierAccountCode",
    },

    {
      title: "Supplier",
      dataIndex: "supplierName",
      key: "supplierName",
      render: (text, record) => record.supplierName.split("(")[0],
    },

    {
      title: "Type",
      dataIndex: "purchaseType",
      key: "purchaseType",
    },
    {
      title: "Voucher No.",
      dataIndex: "",
      key: "voucherNo",
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
      dataIndex: "refNO",
      key: "refNo",
    },
    {
      title: "Amount",
      dataIndex: "",
      key: "amount",
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
                  ? (e) => deletePayment(record.id)
                  : record.receiptType === "Return Payment"
                  ? (e) => deleteReturnPayment(record.id)
                  : record.receiptType === "Receipt"
                  ? (e) => deleteReceipt(record.id)
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

  const deleteReceipt = async (sno) => {
    setLoading(true);
    try {
      const accountToUpdate = ListOfRecords.find((u) => u.id === sno);
      ////Console.log(accountToUpdate);
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
      ////Console.log(SupplierData.data.listofSuppliers[0]);

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
        let voucherNo = response.data.paymentHead.voucherNo;
        let PaymentBodyData = await axios.get(
          `${Config.base_url}PaymentBody/GetPaymentBodyBy/${voucherNo}/${CompanyID}`,
          {
            headers: {
              Authorization: `Bearer ${AccessKey}`,
            },
          }
        );
        ////Console.log(PaymentBodyData.data.paymentBodyData);

        for (const item of PaymentBodyData.data.paymentBodyData) {
          try {
            const PurchaseHeadToUpdate = await axios.get(
              `${Config.base_url}PurchaseHead/GetPurchaseHeadDataBy/${item.billID}/${CompanyID}`,
              {
                headers: {
                  Authorization: `Bearer ${AccessKey}`,
                },
              }
            );
            ////Console.log(PurchaseHeadToUpdate.data.purchaseHeadData);

            const PurchaseDataToUpdate =
              PurchaseHeadToUpdate.data.purchaseHeadData.map(
                (purchase, index) => {
                  // const correspondingField = fields[index] || {};
                  return {
                    ...purchase,
                    balance:
                      parseFloat(purchase.balance || 0) +
                      parseFloat(
                        PaymentBodyData.data.paymentBodyData[index].amount || 0
                      ),
                  };
                }
              );
            ////Console.log(PurchaseDataToUpdate);
            try {
              const saleResponse = await axios.patch(
                `${Config.base_url}PurchaseHead/UpdateRecords`,
                PurchaseDataToUpdate,
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

        message.success("Receipt deleted Successfully");
      }
    } catch (error) {
      ////Console.log(error);
      message.error("Error in Deleting receipt");
    }
    fetchPayments();
  };

  const deletePayment = async (sno) => {
    setLoading(true);
    try {
      const accountToUpdate = ListOfRecords.find((u) => u.id === sno);
      ////Console.log(accountToUpdate);
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
      ////Console.log(SupplierData.data.listofSuppliers[0]);

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
        let voucherNo = response.data.paymentHead.voucherNo;
        let PaymentBodyData = await axios.get(
          `${Config.base_url}PaymentBody/GetPaymentBodyBy/${voucherNo}/${CompanyID}`,
          {
            headers: {
              Authorization: `Bearer ${AccessKey}`,
            },
          }
        );
        ////Console.log(PaymentBodyData.data.paymentBodyData);

        for (const item of PaymentBodyData.data.paymentBodyData) {
          try {
            const PurchaseHeadToUpdate = await axios.get(
              `${Config.base_url}PurchaseHead/GetPurchaseHeadDataBy/${item.billID}/${CompanyID}`,
              {
                headers: {
                  Authorization: `Bearer ${AccessKey}`,
                },
              }
            );
            ////Console.log(PurchaseHeadToUpdate.data.purchaseHeadData);

            const PurchaseDataToUpdate =
              PurchaseHeadToUpdate.data.purchaseHeadData.map(
                (purchase, index) => {
                  // const correspondingField = fields[index] || {};
                  return {
                    ...purchase,
                    balance:
                      parseFloat(purchase.balance || 0) +
                      parseFloat(
                        PaymentBodyData.data.paymentBodyData[index].amount || 0
                      ),
                  };
                }
              );
            ////Console.log(PurchaseDataToUpdate);
            try {
              const saleResponse = await axios.patch(
                `${Config.base_url}PurchaseHead/UpdateRecords`,
                PurchaseDataToUpdate,
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

        message.success("Payment deleted Successfully");
      }
    } catch (error) {
      ////Console.log(error);
      message.error("Error in Deleting receipt");
    }
    fetchPayments();
  };

  const deleteReturnPayment = async (sno) => {
    setLoading(true);
    try {
      const accountToUpdate = ListOfRecords.find((u) => u.id === sno);
      ////Console.log(accountToUpdate);
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
      ////Console.log(SupplierData.data.listofSuppliers[0]);

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
          ////Console.log(response.data)
          const voucherNo = response.data.paymentHead.voucherNo;
          var PaymentBodyData = await axios.get(
            `${Config.base_url}PaymentBody/GetPaymentBodyBy/${voucherNo}/${CompanyID}`,
            {
              headers: {
                Authorization: `Bearer ${AccessKey}`,
              },
            }
          );

          ////Console.log(PaymentBodyData.data);
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
              ////Console.log(PaymentHeadToUpdate.data.paymentHeadData);

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
              ////Console.log(PaymentDataToUpdate);
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
                ////Console.log(purchaseResponse);
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
      ////Console.log(error);
      message.error("Error in Deleting receipt");
    }
    fetchPayments();
  };

  const deleteReturnReceipt = async (sno) => {
    setLoading(true);
    try {
      const accountToUpdate = ListOfRecords.find((u) => u.id === sno);
      ////Console.log(accountToUpdate);
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
      ////Console.log(SupplierData.data.listofSuppliers[0]);

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
          ////Console.log(response.data)
          const voucherNo = response.data.paymentHead.voucherNo;
          var PaymentBodyData = await axios.get(
            `${Config.base_url}PaymentBody/GetPaymentBodyBy/${voucherNo}/${CompanyID}`,
            {
              headers: {
                Authorization: `Bearer ${AccessKey}`,
              },
            }
          );

          ////Console.log(PaymentBodyData.data);
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
              ////Console.log(PaymentHeadToUpdate.data.paymentHeadData);

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
              ////Console.log(PaymentDataToUpdate);
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
                ////Console.log(purchaseResponse);
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
      ////Console.log(error);
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
        <Link to={`/purchases/purchase-payments/add-supplier-payment`}>
          Payment (VP)
        </Link>
      ),
    },
    {
      key: "2",
      label: (
        <Link to={`/purchases/purchase-payments/add-supplier-receipt`}>
          Receipt (VCR)
        </Link>
      ),
    },
    {
      key: "3",
      label: (
        <Link to={`/purchases/purchase-payments/add-return-supplier-payment`}>
          Return Payment (RVP)
        </Link>
      ),
    },
    {
      key: "4",
      label: (
        <Link to={`/purchases/purchase-payments/add-return-supplier-receipt`}>
          Return Receipt (RVCR)
        </Link>
      ),
    },
  ];

  const BatchItems = (
    <Menu>
      <Menu.Item key="5">
        <Link to={`/purchases/purchase-payments/add-batch-payments`}>
          Payments (VP)
        </Link>
      </Menu.Item>
      <Menu.Item key="6">
        <Link to={`/purchases/purchase-payments/add-batch-receipts`}>
          Receipts (VCR)
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
      { header: "Account Number", key: "supplierAccountCode", width: 30 },
      { header: "Supplier Name", key: "supplierName", width: 30 },
      { header: "Type", key: "purchaseType", width: 20 },
      { header: "Ref No.", key: "refNo", width: 20 },
      { header: "Amount", key: "amount", width: 20 },
      { header: "Total", key: "totalPayment", width: 15 },
      { header: "Balance", key: "unAllocatedBalance", width: 15 },
    ];

    // Add rows to the sheet
    ListOfRecords.forEach((payments, index) => {
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
            <h3 className="page-title">
              <NavLink to="/purchases/purchase-payments">
                <ArrowLeftIcon />
              </NavLink>
              Incomplete Supplier Payments
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
                    <Select.Option value="supplieraccountcode">
                      A/C Code
                    </Select.Option>
                    <Select.Option value="suppliername">
                      Supplier Name
                    </Select.Option>
                  </Select>
                </Form.Item>
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
                  <Input
                    onFocus={(e) => e.target.select()}
                    placeholder="Supplier Name"
                  />
                </Form.Item>
                <Form.Item name="supplierAccountCode">
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
            scroll={{
              x: "100%",
            }}
            columns={columns}
            dataSource={ListOfRecords}
            size="small"
            loading={loading}
            pagination={true}
          />
        </div>
      </div>
    </>
  );
}

export default IncompletePayments;
