import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./assets/css/style.css";
import Login from "./components/Onboarding/Login";
import Signup from "./components/Onboarding/Signup";
import Welcome from "./components/Onboarding/Welcome";
import RegisterCompany from "./components/Onboarding/RegisterCompany";
import VerifyEmail from "./components/Onboarding/VerifyEmail";
import Dashboard from "./components/Dashboard/Dashboard";
import Main from "./components/Layout/Main";
import SelectCompany from "./components/Onboarding/SelectCompany";
import { ConfigProvider, theme } from "antd";
import ChangeCompany from "./components/Company/ChangeCompany";
import SendInvitation from "./components/Setting/SendInvitation";
import ForgetPassword from "./components/Onboarding/ForgetPassword";
import SettingDashboard from "./components/Setting/SettingDashboard";

import AddAccount from "./components/Accounts/AddAccount";
import ManageAccounts from "./components/Accounts/ManageAccounts";
import AddVouchers from "./components/Accounts/Voucher/AddVouchers";
import ManageEmployees from "./components/Payroll/Employee/ManageEmployees";
import ManageVouchers from "./components/Accounts/Voucher/ManageVouchers";
import TrialBalanceLevelWise from "./components/Accounts/TrialBalanceLevelWise";
import TrialBalanceHeadWise from "./components/Accounts/TrialBalanceHeadWise";
import BudgetHeadWise from "./components/Accounts/BudgetHeadWise";
import ReceiptPaymentAccount from "./components/Accounts/ReceiptPaymentAccount";
import OpeningBalances from "./components/Accounts/OpeningBalances";
import AddEmployee from "./components/Payroll/Employee/AddEmployee";
import Designation from "./components/Payroll/Employee/Designation";
import SalaryType from "./components/Payroll/Salary/SalaryType";
import BanksalaryList from "./components/Payroll/Salary/BankSalaryList";
import Createsalary from "./components/Payroll/Salary/CreateSalary";
import IncreaseDecreaseSalary from "./components/Payroll/Salary/IncreaseDecreaseSalary";
import Viewreports from "./components/Payroll/Reports/ViewReports";
import Zeroreports from "./components/Payroll/Reports/ZeroReports";
import SummarySheet from "./components/Payroll/Reports/SummarySheet";
import AddArrears from "./components/Payroll/ArrearLeave/AddArrears";
import ManageLeaves from "./components/Payroll/ArrearLeave/ManageLeaves";
import ManageLoanDeduction from "./components/Payroll/Deductions/ManageLoanDeduction";
import ManageOtherDeduction from "./components/Payroll/Deductions/ManageOtherDeduction";
import ImportAccounts from "./components/Accounts/ImportAccounts";
import EditVouchers from "./components/Accounts/Voucher/EditVouchers";
import EditAccount from "./components/Accounts/EditAccount";
import ManageCustomer from "./components/Customer/ManageCustomer";
import DropdownTest from "./components/Common/CustomerFieldsDropdown";
import ImportCustomer from "./components/Customer/ImportCustomer";
import ManageSupplier from "./components/Suppliers/ManageSupplier";
import ImportSupplier from "./components/Suppliers/ImportSupplier";
import ManageBill from "./components/Bill/ManageBill";
import ImportBill from "./components/Bill/ImportBill";
import SupplierBill from "./components/Suppliers/Bill/SupplierBill";
import ManageBank from "./components/Bank/ManageBank";
import ImportBank from "./components/Bank/ImportBank";
import AddBankPayments from "./components/Bank/AddBankPayments";
import AddWHTPayments from "./components/Bank/AddWHTPayments";
import AddBankReceipts from "./components/Bank/AddBankReceipts";
import ManageReceipts from "./components/Bank/ManageReceipts";
import AddTransfers from "./components/Bank/AddTransfers";
import ManageTransfers from "./components/Bank/ManageTransfers";
import ComponentTestPage from "./ComponentTestPage";
import ReconcileStatementBalance from "./components/Bank/ReconcileStatementBalance";
import ManageReconcile from "./components/Bank/ManageReconcile";
import SalesInvoices from "./components/Sales/SalesInvoices/SalesInvoices";
import SaleReceipts from "./components/Sales/SalesReceipt/SaleReceipts";
import AddSalesInvoice from "./components/Sales/SalesInvoices/AddSalesInvoice";
import AddCreditNote from "./components/Sales/SalesInvoices/AddCreditNote";
import BatchInvoice from "./components/Sales/SalesInvoices/BatchInvoice";
import BulkInvoicing from "./components/Sales/SalesInvoices/BulkInvoicing";
import ResetPassword from "./components/Onboarding/ResetPassword";
import axios from "axios";
import Config from "./Config";
import EditBalance from "./components/Accounts/EditBalance";
import InviteSignup from "./components/Onboarding/InviteSignup";
import VerifyInvite from "./components/Onboarding/VerifyInvite";
import ManageUsers from "./components/Setting/ManageUsers";
import EditUser from "./components/Setting/EditUser";
import ManageInvitations from "./components/Setting/ManageInvitations";
import ProductionMenu from "./components/Production/ProductionMenu";
import ManageProducts from "./components/Production/ManageProducts";
import AddStockProducts from "./components/Production/AddStockProducts";
import AddNonStockProducts from "./components/Production/AddNonStockProducts";
import EditStockProducts from "./components/Production/EditStockProduct";
import EditNonStockProducts from "./components/Production/EditNonStockProduct";
import ImportProducts from "./components/Production/ImportProducts";
import EditSaleInvoice from "./components/Sales/SalesInvoices/EditSaleInvoice";
import EditCreditNote from "./components/Sales/SalesInvoices/EditCreditNote";
import AddSupplierBill from "./components/Purchases/AddSupplierBill";
import Bills from "./components/Purchases/SupplierBills";
import AddSalesReceipt from "./components/Sales/SalesReceipt/AddSaleReceipt";
import AddSalesPayment from "./components/Sales/SalesReceipt/AddSalePayment";
import EditSaleReceipt from "./components/Sales/SalesReceipt/EditSaleReceipt";
import EditCreditPayment from "./components/Sales/SalesReceipt/EditCreditPayment";
import AddReturnReceipt from "./components/Sales/SalesReceipt/AddReturnReciept";
import AddCreditBill from "./components/Purchases/AddCreditBill";
import BatchBill from "./components/Purchases/BatchBill";
import AddReturnPayment from "./components/Sales/SalesReceipt/AddReturnPayment";
import EditReturnReceipt from "./components/Sales/SalesReceipt/EditReturnReceipt";
import EditReturnPayment from "./components/Sales/SalesReceipt/EditReturnPayment";
import EditSupplierBill from "./components/Purchases/EditSupplierBill";
import EditSupplierPayment from "./components/Purchases/Payments/EditSupplierPayment";
import Payments from "./components/Purchases/Payments/Payments";
import AddSupplierPayment from "./components/Purchases/Payments/AddSupplierPayment";
import EditCreditBill from "./components/Purchases/EditCreditBill";
import AddSupplierReceipt from "./components/Purchases/Payments/AddSupplierReceipt";
import AddReturnSupplierPayment from "./components/Purchases/Payments/AddReturnSupplierPayment";
import EditSupplierReceipt from "./components/Purchases/Payments/EditSupplierReceipt";
import ResetCompany from "./components/Setting/ResetCompany";
import CustomerReport from "./components/Customer/CustomerReport";
import AccountBalance from "./components/Bank/AccountBalance";
import SupplierReport from "./components/Suppliers/SupplierReport";
import ProductReport from "./components/Production/ProductReport";
import EditBankReceipts from "./components/Bank/EditBankReceipts";
import EditBankPayments from "./components/Bank/EditBankPayments";
import EditWHTPayments from "./components/Bank/EditWHTPayments";
import AddReturnSupplierReceipt from "./components/Purchases/Payments/AddReturnSupplierReceipt";
import BankReports from "./components/Bank/BankReports";
import BatchReceipt from "./components/Sales/SalesReceipt/BatchReceipt";
import BatchPayments from "./components/Sales/SalesReceipt/BatchPayments";
import StockIn from "./components/Production/Stock/StockIn";
import StockAdjustment from "./components/Production/Stock/StockAdjustment";
import StockOut from "./components/Production/Stock/StockOut";
import BatchReceipts from "./components/Purchases/Payments/BatchReceipts";
import BatchPayment from "./components/Purchases/Payments/BatchPayment";
import ImportStock from "./components/Production/Stock/ImportStock";
import EditTransfers from "./components/Bank/EditTransfers";
import EditStockIn from "./components/Production/Stock/EditStockIn";
import EditStockOut from "./components/Production/Stock/EditStockkOut";
import EditReturnSupplierPayment from "./components/Purchases/Payments/EditReturnSupplierPayment";
import EditReturnSupplierReceipt from "./components/Purchases/Payments/EditReturnSupplierReceipt";
import UpdateProfile from "./components/profile/UpdateProfile"; // "./components/profile/UpdateProfile";
import ChangePassword from "./components/profile/ChangePassword";
import EditCompany from "./components/Company/EditCompany";
import CustomerSummary from "./components/Customer/CustomerSummary";
import SupplierSummary from "./components/Suppliers/SupplierSummary";
import ProductSummary from "./components/Production/ProductSummary";
import IncompleteSaleReceipts from "./components/Sales/SalesReceipt/IncompleteSaleReceipts";
import IncompleteSaleInvoice from "./components/Sales/SalesInvoices/IncompleteSaleInvoice";
import IncompleteSupplierBills from "./components/Purchases/IncompleteSupplierBills";
import IncompletePayments from "./components/Purchases/Payments/IncompletePayments";
import ManageCategory from "./components/Production/ManageCategory";
import ImportInvoice from "./components/Sales/SalesInvoices/ImportInvoice";
import ImportReceipt from "./components/Sales/SalesReceipt/ImportReceipt";
import MultiReceipt from "./components/Sales/SalesReceipt/MultiReceipts";
import MultiPayments from "./components/Sales/SalesReceipt/MultiPayment";
import MultiSupplierReceipt from "./components/Purchases/Payments/MultiSupplierReceipt";
import MultiSupplierPayments from "./components/Purchases/Payments/MultiSupplierPayments";
import AddJournalVoucher from "./components/Bank/AddJournalVoucher";
import ManageJournalVoucher from "./components/Bank/ManageJournalVoucher";
import EditJournalVoucher from "./components/Bank/EditJournalVoucher";
import ImportBills from "./components/Purchases/ImportBills";
import ImportPayments from "./components/Purchases/Payments/ImportPayments";
import ManageJobs from "./components/Assembly/Jobs/ManageJobs";
import ManageTemplates from "./components/Assembly/Templates/ManageTemplates";
import AddTemplate from "./components/Assembly/Templates/AddTemplate";
import ReportsMenu from "./components/Reports/ReportsMenu";
import AddJob from "./components/Assembly/Jobs/AddJob";
import EditTemplate from "./components/Assembly/Templates/EditTemplate";
import ManageLocation from "./components/Setting/ManageLocation";
import CustomerReceiptDetails from "./components/Customer/CustomerReceiptDetails";
import SupplierPaymentsDetail from "./components/Suppliers/SupplierPaymentsDetail";
import PrintInvoice from "./components/Sales/SalesInvoices/PrintInvoice";
import PrintBill from "./components/Purchases/PrintBill";
import ProductSummaryByCategory from "./components/Production/SummaryByCategory";
import ManageType from "./components/Production/ManageType";
import ManageBanks from "./components/Bank/ManageBanks";
import AccountsReport from "./components/Accounts/AccountsReport";
import AccountsSummary from "./components/Accounts/AccountsSummary";
import RecentLogins from "./components/Setting/RecentLogin";
import CustomerInvoiceDetails from "./components/Customer/CustomerInvoiceDetails";
import SaleDetailByCustomerProduct from "./components/Customer/SaleDetailByCustomerProduct";
import PurchaseDetailBySupplierProduct from "./components/Suppliers/PurchaseDetailBySupplierProduct";
import CustomerReportWithInvoiceDetail from "./components/Customer/CustomerReportWithInvoiceDetail";
import SupplierReportWithBillDetail from "./components/Suppliers/SupplierReportWithBillDetail";
import SupplierBillDetails from "./components/Suppliers/SupplierBillDetails";

function Index() {
  const { defaultAlgorithm, darkAlgorithm } = theme;

  const pictureId = localStorage.getItem("ID");
  const AccessKey = localStorage.getItem("AccessKey");
  const [imageSrc, setImageSrc] = useState(null);

  useEffect(() => {
    if (pictureId) {
      axios
        .get(Config.base_url + `Pictures/${pictureId}`, {
          headers: {
            Authorization: `Bearer ${AccessKey}`,
          },
          responseType: "blob",
        })
        .then((response) => {
          const url = URL.createObjectURL(
            new Blob([response.data], {
              type: response.headers["content-type"],
            })
          );
          setImageSrc(url);
        })
        .catch((error) => {
          console.error("Error fetching image:", error);
        });
    }
  }, [pictureId]);

  return (
    <ConfigProvider
      theme={{
        // algorithm: darkAlgorithm,
        //type: 'dark',

        components: {
          Button: {
            primaryColor: "#fff",
            fontWeight: "600",
            contentFontSize: 16,
            defaultBorderColor: "#2046CF",
            defaultColor: "#2046CF",
          },
          Form: {
            labelColor: "#68757D",
            labelFontSize: 14,
          },
        },

        token: {
          // Seed Token
          colorPrimary: "#2046CF",
          //borderRadius: 12,

          // Alias Token
          //colorBgContainer: '#324F94',
        },
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/invite-signup/:id" element={<InviteSignup />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/verify-invite/:id" element={<VerifyInvite />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/company" element={<SelectCompany />} />
          <Route path="/forgot-password" element={<ForgetPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/company-register" element={<RegisterCompany />} />
          <Route path="/printInvoice/:id" element={<PrintInvoice />} />
          <Route path="/printBill/:id" element={<PrintBill />} />

          <Route path="/" element={<Main image={imageSrc} />}>
            <Route path="/test-page" element={<ComponentTestPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/register-company" element={<RegisterCompany />} />
            <Route path="/change-company" element={<ChangeCompany />} />
            <Route path="/edit-company" element={<EditCompany />} />
            <Route
              path="/setting/send-invitation"
              element={<SendInvitation />}
            />
            <Route path="/setting/manage-users" element={<ManageUsers />} />
            <Route path="/setting/recent-login" element={<RecentLogins />} />
            <Route
              path="/setting/manage-invites"
              element={<ManageInvitations />}
            />
            <Route path="/setting/edit-user/:id" element={<EditUser />} />
            <Route path="/setting" element={<SettingDashboard />} />
            <Route path="/setting/reset-company" element={<ResetCompany />} />
            <Route path="/setting/locations" element={<ManageLocation />} />

            {/* Production */}
            <Route path="/production" element={<ProductionMenu />} />
            <Route path="/products/manage" element={<ManageProducts />} />
            <Route path="/category/manage" element={<ManageCategory />} />
            <Route path="/type/manage" element={<ManageType />} />
            <Route
              path="/production/add-stock-products"
              element={<AddStockProducts />}
            />

            <Route
              path="/production/add-non-stock-products"
              element={<AddNonStockProducts />}
            />
            <Route
              path="/product/edit-stock-products/:id"
              element={<EditStockProducts />}
            />
            <Route
              path="/product/edit-Nonstock-products/:id"
              element={<EditNonStockProducts />}
            />
            <Route path="/products/import" element={<ImportProducts />} />
            <Route path="/products/report" element={<ProductReport />} />
            <Route
              path="/products/summary/by-category"
              element={<ProductSummaryByCategory />}
            />
            <Route path="/products/stock-in" element={<StockIn />} />
            <Route path="/products/stock-out" element={<StockOut />} />
            <Route
              path="/products/edit-stock-in/:id"
              element={<EditStockIn />}
            />
            <Route
              path="/products/edit-stock-out/:id"
              element={<EditStockOut />}
            />
            <Route
              path="/products/stock-adjustment"
              element={<StockAdjustment />}
            />
            <Route path="/stock-adjustment/import" element={<ImportStock />} />
            <Route path="/products/summary" element={<ProductSummary />} />

            {/* accounts */}
            <Route path="/accounts/add-account" element={<AddAccount />} />
            <Route
              path="/accounts/edit-account/:id"
              element={<EditAccount />}
            />
            <Route
              path="/accounts/edit-balance/:id"
              element={<EditBalance />}
            />
            <Route path="/accounts/manage" element={<ManageAccounts />} />
            <Route path="/accounts/report" element={<AccountsReport />} />
            <Route path="/accounts/summary" element={<AccountsSummary />} />
            <Route
              path="/accounts/opening-balances"
              element={<OpeningBalances />}
            />
            <Route
              path="/accounts/trial-balance-level-wise"
              element={<TrialBalanceLevelWise />}
            />
            <Route
              path="/accounts/trial-balance-Head-wise"
              element={<TrialBalanceHeadWise />}
            />
            <Route
              path="/accounts/Budget-Head-wise"
              element={<BudgetHeadWise />}
            />
            <Route
              path="/accounts/Receipt-Payment-Account"
              element={<ReceiptPaymentAccount />}
            />
            <Route path="/accounts/import" element={<ImportAccounts />} />

            <Route
              path="/profile"
              element={<UpdateProfile image={imageSrc} />}
            />
            <Route path="/change-password" element={<ChangePassword />} />

            {/* Bank */}

            <Route path="/bank/import" element={<ImportBank />} />
            <Route path="/bank/manage-banks" element={<ManageBanks />} />
            <Route path="/bank/report" element={<BankReports />} />
            <Route path="/bank/account-balance" element={<AccountBalance />} />

            <Route path="/bank/manage" element={<ManageBank />} />
            <Route
              path="/bank/add-bank-payment"
              element={<AddBankPayments />}
            />
            <Route
              path="/bank/edit-bank-payment/:id"
              element={<EditBankPayments />}
            />
            <Route path="/bank/wht-bank-payment" element={<AddWHTPayments />} />
            <Route
              path="/bank/edit-wht-bank-payment/:id"
              element={<EditWHTPayments />}
            />

            <Route path="/bank/receipts" element={<ManageReceipts />} />
            <Route
              path="/bank/add-bank-receipts"
              element={<AddBankReceipts />}
            />
            <Route
              path="/bank/edit-bank-receipts/:id"
              element={<EditBankReceipts />}
            />

            <Route path="/bank/transfers" element={<ManageTransfers />} />
            <Route path="/bank/add-transfers" element={<AddTransfers />} />
            <Route
              path="/bank/edit-bank-transfers/:id"
              element={<EditTransfers />}
            />
            <Route
              path="/bank/journalVoucher"
              element={<ManageJournalVoucher />}
            />
            <Route
              path="/bank/add-journalVoucher"
              element={<AddJournalVoucher />}
            />
            <Route
              path="/bank/edit-journalVoucher/:id"
              element={<EditJournalVoucher />}
            />

            <Route path="/bank/reconcile" element={<ManageReconcile />} />
            <Route
              path="/bank/reconcile-statement-balance"
              element={<ReconcileStatementBalance />}
            />

            {/* sales */}

            <Route path="/sales/sales-invoices" element={<SalesInvoices />} />
            <Route
              path="/sales/incomplete-sales-invoices"
              element={<IncompleteSaleInvoice />}
            />
            <Route path="/sales/sales-receipts" element={<SaleReceipts />} />
            <Route
              path="/sales/incomplete-sales-receipts"
              element={<IncompleteSaleReceipts />}
            />
            <Route
              path="/sales/sales-receipts/add-batch-receipts"
              element={<BatchReceipt />}
            />
            <Route
              path="/sales/sales-receipts/add-batch-payments"
              element={<BatchPayments />}
            />
            <Route
              path="/sales/sales-receipts/add-multi-receipts"
              element={<MultiReceipt />}
            />
            <Route
              path="/sales/sales-receipts/add-multi-payments"
              element={<MultiPayments />}
            />

            <Route
              path="/sales/sales-invoices/add-sales-invoices"
              element={<AddSalesInvoice />}
            />
            <Route
              path="/sales/sales-receipts/add-sales-receipts"
              element={<AddSalesReceipt />}
            />
            <Route
              path="/sales/sales-invoices/add-credit-note"
              element={<AddCreditNote />}
            />
            <Route
              path="/sales/sales-receipts/add-sales-payment"
              element={<AddSalesPayment />}
            />
            <Route
              path="/sales/sales-receipts/add-return-receipt"
              element={<AddReturnReceipt />}
            />
            <Route
              path="/sales/sales-receipts/add-return-payment"
              element={<AddReturnPayment />}
            />
            <Route
              path="/sales/sales-invoices/batch-invoice"
              element={<BatchInvoice />}
            />
            <Route
              path="/sales/sales-invoices/bulk-invoicing"
              element={<BulkInvoicing />}
            />
            <Route
              path="/sales/sales-invoices/edit-sales-invoices/:id"
              element={<EditSaleInvoice />}
            />
            <Route
              path="/sales/sales-receipts/edit-sales-receipts/:id"
              element={<EditSaleReceipt />}
            />
            <Route
              path="/sales/sales-receipts/edit-return-receipts/:id"
              element={<EditReturnReceipt />}
            />
            <Route
              path="/sales/sales-invoices/edit-credit-note/:id"
              element={<EditCreditNote />}
            />
            <Route
              path="/sales/sales-receipts/edit-credit-payments/:id"
              element={<EditCreditPayment />}
            />
            <Route
              path="/sales/sales-receipts/edit-return-payment/:id"
              element={<EditReturnPayment />}
            />
            <Route
              path="/sales/sales-invoice/import"
              element={<ImportInvoice />}
            />
            <Route
              path="/sales/sales-receipt/import"
              element={<ImportReceipt />}
            />

            {/* Purchases */}
            <Route path="/purchases/purchase-bills" element={<Bills />} />
            <Route
              path="/purchases/incomplete-purchase-bills"
              element={<IncompleteSupplierBills />}
            />
            <Route path="/purchases/purchase-payments" element={<Payments />} />
            <Route
              path="/purchases/incomplete-purchase-payments"
              element={<IncompletePayments />}
            />

            <Route
              path="/purchases/purchase-bills/add-purchase-bills"
              element={<AddSupplierBill />}
            />
            <Route
              path="/purchases/purchase-bills/add-credit-bill"
              element={<AddCreditBill />}
            />
            <Route
              path="/purchases/purchase-bills/batch-bill"
              element={<BatchBill />}
            />
            <Route
              path="/purchases/purchase-bills/edit-purchase-bill/:id"
              element={<EditSupplierBill />}
            />
            <Route
              path="/purchases/purchase-bills/edit-credit-bill/:id"
              element={<EditCreditBill />}
            />

            <Route
              path="/purchases/purchase-payments/add-batch-receipts"
              element={<BatchReceipts />}
            />

            <Route
              path="/purchases/purchase-payments/add-batch-payments"
              element={<BatchPayment />}
            />
            <Route
              path="/purchases/purchase-payments/add-multi-receipts"
              element={<MultiSupplierReceipt />}
            />

            <Route
              path="/purchases/purchase-payments/add-multi-payments"
              element={<MultiSupplierPayments />}
            />
            <Route
              path="/purchases/purchase-payments/add-supplier-payment"
              element={<AddSupplierPayment />}
            />
            <Route
              path="/purchases/purchase-payments/add-supplier-receipt"
              element={<AddSupplierReceipt />}
            />
            <Route
              path="/purchases/purchase-payments/add-return-supplier-payment"
              element={<AddReturnSupplierPayment />}
            />
            <Route
              path="/purchases/purchase-payments/edit-return-supplier-payment/:id"
              element={<EditReturnSupplierPayment />}
            />
            <Route
              path="/purchases/purchase-payments/add-return-supplier-receipt"
              element={<AddReturnSupplierReceipt />}
            />
            <Route
              path="/purchases/purchase-payments/edit-return-supplier-receipt/:id"
              element={<EditReturnSupplierReceipt />}
            />
            <Route
              path="/purchases/purchase-payments/edit-supplier-payment/:id"
              element={<EditSupplierPayment />}
            />
            <Route
              path="/purchases/purchase-payments/edit-supplier-receipt/:id"
              element={<EditSupplierReceipt />}
            />
            <Route
              path="/purchases/supplier-bill/import"
              element={<ImportBills />}
            />
            <Route
              path="/purchases/purchase-payments/import"
              element={<ImportPayments />}
            />

            {/*  Voucher */}

            <Route path="/vouchers" element={<ManageVouchers />} />
            <Route path="/vouchers/add" element={<AddVouchers />} />
            <Route path="/vouchers/edit/:id" element={<EditVouchers />} />

            {/*  Customer */}

            <Route path="/customer/manage" element={<ManageCustomer />} />
            <Route path="/customer/report" element={<CustomerReport />} />
            <Route path="/customer/import" element={<ImportCustomer />} />
            <Route path="/customer/summary" element={<CustomerSummary />} />
            <Route
              path="/customer/receipt/details"
              element={<CustomerReceiptDetails />}
            />
            <Route
              path="/customer/invoice/details"
              element={<CustomerInvoiceDetails />}
            />
            <Route
              path="/customer/sale-detail-by-customer-product"
              element={<SaleDetailByCustomerProduct />}
            />
            <Route
              path="/customer/report/with-invoice-detail"
              element={<CustomerReportWithInvoiceDetail />}
            />

            {/* Supplier */}

            <Route path="/supplier/manage" element={<ManageSupplier />} />
            <Route path="/supplier/report" element={<SupplierReport />} />
            <Route path="/supplier/import" element={<ImportSupplier />} />
            <Route path="/supplier/summary" element={<SupplierSummary />} />
            <Route
              path="/supplier/payment/details"
              element={<SupplierPaymentsDetail />}
            />
            <Route
              path="/supplier/purchase-detail-by-supplier-product"
              element={<PurchaseDetailBySupplierProduct />}
            />
            <Route
              path="/supplier/report/with-bill-detail"
              element={<SupplierReportWithBillDetail />}
            />
            <Route
              path="/supplier/bills/details"
              element={<SupplierBillDetails />}
            />

            {/* Bill */}

            <Route path="/bill/manage" element={<ManageBill />} />
            <Route path="/bill/import" element={<ImportBill />} />

            <Route
              path="/supplier/supplier-bill/add-supplier-bill"
              element={<SupplierBill />}
            />
            <Route
              path="/supplier/supplier-bill/add-supplier-bill"
              element={<SupplierBill />}
            />

            <Route
              path="/supplier/supplier-bill/add-supplier-bill"
              element={<SupplierBill />}
            />

            {/* Assembly */}
            <Route path="/jobs/manage" element={<ManageJobs />} />
            <Route path="/jobs/add-job" element={<AddJob />} />

            <Route
              path="/product-recipes/manage"
              element={<ManageTemplates />}
            />
            <Route
              path="/assembly/add-product-recipe"
              element={<AddTemplate />}
            />
            <Route
              path="/assembly/edit-product-recipe/:id"
              element={<EditTemplate />}
            />

            {/* Reports */}
            <Route path="/reports" element={<ReportsMenu />} />

            {/* Payroll */}

            <Route
              path="/payroll/employee/manage"
              element={<ManageEmployees />}
            />
            <Route path="/payroll/employee/add" element={<AddEmployee />} />
            <Route
              path="/payroll/employee/designations"
              element={<Designation />}
            />
            <Route
              path="/payroll/salary/salary-type"
              element={<SalaryType />}
            />
            <Route
              path="/payroll/salary/bank-salary-list"
              element={<BanksalaryList />}
            />
            <Route
              path="/payroll/salary/create-salary"
              element={<Createsalary />}
            />
            <Route
              path="/payroll/salary/increase/decrease-salary"
              element={<IncreaseDecreaseSalary />}
            />
            <Route
              path="/payroll/reports/view-reports"
              element={<Viewreports />}
            />
            <Route
              path="/payroll/reports/zero-reports"
              element={<Zeroreports />}
            />
            <Route
              path="/payroll/reports/summary-sheet"
              element={<SummarySheet />}
            />
            <Route
              path="/payroll/ArrearLeave/AddArrears"
              element={<AddArrears />}
            />
            <Route
              path="/payroll/ArrearLeave/mange-leave"
              element={<ManageLeaves />}
            />
            <Route
              path="/payroll/Deductions/manage-loan-deduction"
              element={<ManageLoanDeduction />}
            />
            <Route
              path="/payroll/Deductions/manage-other-deduction"
              element={<ManageOtherDeduction />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Index />);
