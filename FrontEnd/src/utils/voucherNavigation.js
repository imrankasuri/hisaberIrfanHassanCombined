import { NavLink } from "react-router-dom";
import { Button } from "antd";
import { EditOutlined } from "@ant-design/icons";

/**
 * Utility function to determine the correct edit route for voucher numbers
 * based on the transaction type and details
 */

export const getVoucherEditRoute = (record, readonly = true) => {
  const { type, details, voucherNo } = record;

  const readonlyParam = readonly ? "?readonly=true" : "";

  if (!voucherNo || voucherNo === "") {
    return null;
  }

  // Bank related transactions

  if (type === "Bank Transfer" || details === "Bank Transfer") {
    return `/bank/edit-bank-transfers/${voucherNo}${readonlyParam}`;
  }

  if (type === "Journal Voucher" || details === "Journal Voucher") {
    return `/bank/edit-journalVoucher/${voucherNo}${readonlyParam}`;
  }

  if (type === "WHT Payment" || details === "WHT Payment") {
    return `/bank/edit-wht-bank-payment/${voucherNo}${readonlyParam}`;
  }

  if (type === "Purchase  Payment" || type === "Purchase Payment" || details === "Purchase  Payment" || details === "Purchase Payment") {
    return `/purchases/purchase-payments/edit-supplier-payment/${voucherNo}${readonlyParam}`;
  }

  if (type === "Sale Receipt" || details === "Sale Receipt") {
    return `/sales/sales-receipts/edit-sales-receipts/${voucherNo}${readonlyParam}`;
  }

  if (type === "Expense Payment" || details === "Expense Payment") {
    return `/bank/edit-bank-payment/${voucherNo}${readonlyParam}`;
  }

  if (type === "Income Receipt" || details === "Income Receipt") {
    return `/bank/edit-bank-receipts/${voucherNo}${readonlyParam}`;
  }

  // Sales related transactions
  if (type === "Invoice" || details === "Invoice") {
    return `/sales/sales-invoices/edit-sales-invoices/${voucherNo}${readonlyParam}`;
  }

  if (type === "Credit" || details === "Credit") {
    return `/sales/sales-invoices/edit-credit-note/${voucherNo}${readonlyParam}`;
  }

  if (type === "Receipt" || details === "Receipt") {
    return `/sales/sales-receipts/edit-sales-receipts/${voucherNo}${readonlyParam}`;
  }

  if (type === "Payment" || details === "Payment") {
    return `/purchases/purchase-payments/edit-supplier-payment/${voucherNo}${readonlyParam}`;
  }

  if (type === "Return Receipt" || details === "Return Receipt") {
    return `/sales/sales-receipts/edit-return-receipts/${voucherNo}${readonlyParam}`;
  }

  if (type === "Return Payment" || details === "Return Payment") {
    return `/sales/sales-receipts/edit-return-payment/${voucherNo}${readonlyParam}`;
  }

  // Purchase related transactions
  if (type === "Bill" || details === "Bill") {
    return `/purchases/purchase-bills/edit-purchase-bill/${voucherNo}${readonlyParam}`;
  }

  if (
    type === "Credit" &&
    (details === "Credit" || details === "Purchase Credit")
  ) {
    return `/purchases/purchase-bills/edit-credit-bill/${voucherNo}${readonlyParam}`;
  }

  if (
    type === "Payment" &&
    (details === "Payment" || details === "Purchase Payment")
  ) {
    return `/purchases/purchase-payments/edit-supplier-payment/${voucherNo}${readonlyParam}`;
  }

  if (
    type === "Receipt" &&
    (details === "Receipt" || details === "Purchase Receipt")
  ) {
    return `/purchases/purchase-payments/edit-supplier-receipt/${voucherNo}${readonlyParam}`;
  }

  if (type === "Return Payment" || details === "Return Payment") {
    return `/purchases/purchase-payments/edit-return-supplier-payment/${voucherNo}${readonlyParam}`;
  }

  if (type === "Return Receipt" || details === "Return Receipt") {
    return `/purchases/purchase-payments/edit-return-supplier-receipt/${voucherNo}${readonlyParam}`;
  }

  //Banks

  // Voucher related transactions
  if (type === "Voucher" || details === "Voucher") {
    return `/vouchers/edit/${voucherNo}`;
  }

  // Default case - return null if no matching route found
  return null;
};

/**
 * Get editable route for voucher (without readonly parameter)
 */
export const getVoucherEditableRoute = (record) => {
  const route = getVoucherEditRoute(record, false);
  return route;
};

/**
 * Render function for V.No column that makes it clickable if a route exists
 */
export const renderVoucherNumber = (text, record) => {
  const route = getVoucherEditRoute(record);

  if (route) {
    return (
      <NavLink className="primary" to={route}>
        {text}
      </NavLink>
    );
  }

  return text;
};

/**
 * Button component to navigate to editable voucher
 * Use this in voucher edit pages when readonly=true
 */
export const EditableVoucherButton = ({ 
  record, 
  children = "Edit Voucher", 
  type = "primary",
  icon = <EditOutlined />,
  size = "middle",
  ...buttonProps 
}) => {
  const editableRoute = getVoucherEditableRoute(record);
  
  if (!editableRoute) {
    return null;
  }

  return (
    <NavLink to={editableRoute}>
      <Button 
        type={type}
        icon={icon}
        size={size}
        {...buttonProps}
      >
        {children}
      </Button>
    </NavLink>
  );
};

/**
 * Hook to check if current page is in readonly mode
 */
export const useReadonlyMode = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('readonly') === 'true';
};

/**
 * Hook to get voucher record from current URL
 * This can be used in voucher edit pages to get the current voucher data
 */
export const useVoucherRecord = () => {
  const pathname = window.location.pathname;
  const urlParams = new URLSearchParams(window.location.search);
  
  // Extract voucher number from URL path
  const pathParts = pathname.split('/');
  const voucherNo = pathParts[pathParts.length - 1];
  
  // Try to determine type from URL path
  let type = '';
  let details = '';
  
  if (pathname.includes('/edit-bank-transfers/')) {
    type = 'Bank Transfer';
    details = 'Bank Transfer';
  } else if (pathname.includes('/edit-journalVoucher/')) {
    type = 'Journal Voucher';
    details = 'Journal Voucher';
  } else if (pathname.includes('/edit-wht-bank-payment/')) {
    type = 'WHT Payment';
    details = 'WHT Payment';
  } else if (pathname.includes('/edit-supplier-payment/')) {
    type = 'Purchase Payment';
    details = 'Purchase Payment';
  } else if (pathname.includes('/edit-sales-receipts/')) {
    type = 'Sale Receipt';
    details = 'Sale Receipt';
  } else if (pathname.includes('/edit-bank-payment/')) {
    type = 'Expense Payment';
    details = 'Expense Payment';
  } else if (pathname.includes('/edit-bank-receipts/')) {
    type = 'Income Receipt';
    details = 'Income Receipt';
  } else if (pathname.includes('/edit-sales-invoices/')) {
    type = 'Invoice';
    details = 'Invoice';
  } else if (pathname.includes('/edit-credit-note/')) {
    type = 'Credit';
    details = 'Credit';
  } else if (pathname.includes('/edit-return-receipts/')) {
    type = 'Return Receipt';
    details = 'Return Receipt';
  } else if (pathname.includes('/edit-return-payment/')) {
    type = 'Return Payment';
    details = 'Return Payment';
  } else if (pathname.includes('/edit-purchase-bill/')) {
    type = 'Bill';
    details = 'Bill';
  } else if (pathname.includes('/edit-credit-bill/')) {
    type = 'Credit';
    details = 'Purchase Credit';
  } else if (pathname.includes('/edit-supplier-receipt/')) {
    type = 'Receipt';
    details = 'Purchase Receipt';
  } else if (pathname.includes('/edit-return-supplier-payment/')) {
    type = 'Return Payment';
    details = 'Return Payment';
  } else if (pathname.includes('/edit-return-supplier-receipt/')) {
    type = 'Return Receipt';
    details = 'Return Receipt';
  }
  
  return {
    voucherNo,
    type,
    details,
    isReadonly: urlParams.get('readonly') === 'true'
  };
};
