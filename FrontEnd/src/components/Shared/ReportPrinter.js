import React from "react";
import { Button } from "antd";
import { PrinterOutlined } from "@ant-design/icons";

const ReportPrinter = ({
  printRef,
  selectedSupplier = null,
  startDate = null,
  endDate = null,
  User = "Unknown User",
  title = "Report Title",
}) => {
  const handleReportPrint = () => {
    setTimeout(() => {
      const printContent = printRef.current;
      const supplierDetails = selectedSupplier
        ? `
      <h2>${selectedSupplier.businessName || selectedSupplier.name}</h2>
      <h3>Account Code: ${selectedSupplier.accountNo || ""}</h3>
    `
        : "<h2>All</h2>";

      const dateRange =
        startDate && endDate
          ? `<h3>Date Range: ${startDate} - ${endDate}</h3>`
          : "";

      const printWindow = window.open("", "", "width=900,height=650");
      printWindow.document.write(`
        <html>
          <head>
            <title>${title}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                font-size: 12px;
                color: #333;
                padding: 16px;
              }

              .reports-main-div {
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-direction: column;
                padding: 16px;
                background-color: white;
                border-radius: 8px;
                box-shadow: 0 4px 8px #324f94;
                margin-bottom: 16px;
                color: #324f94;
                text-align: center;
              }

              .report-content {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                width: 100%;
              }

              .report-left, .report-right {
                width: 30%;
                text-align: left;
              }

              .report-right {
                text-align: right;
              }

              .report-left h3, .report-right h3 {
                margin: 4px 0;
                font-size: 1rem;
                font-weight: 500;
              }

              .report-company-name {
                text-align: center;
                flex: 1;
              }

              table {
                border-collapse: collapse;
                width: 100%;
                margin: 16px 0;
              }

              th, td {
                border: 1px solid #000;
                padding: 8px;
                text-align: center;
              }

              .invoice-card { margin-bottom: 25px; border: 1px solid #ddd; border-radius: 5px; overflow: hidden; }
              .items-header, .item-row, .subtotal-row {
                display: grid;
                grid-template-columns: 3fr 1fr 1fr 1fr;
                gap: 15px;
                padding: 10px;
                border-bottom: 1px solid #ccc;
              }

              .items-header {
                background-color: #e9ecef;
                font-weight: bold;
              }

              .subtotal-row {
                background-color: #f8f9fa;
                font-weight: bold;
                border-top: 2px solid #ddd;
              }

              .grand-total {
                margin-top: 30px;
                padding: 15px;
                background-color: #e3f2fd;
                border: 2px solid #2196f3;
                border-radius: 5px;
                text-align: right;
                font-size: 18px;
                font-weight: bold;
              }

              @media print {
                .print-button { display: none; }
                .invoice-card {
                  break-inside: avoid;
                }
              }
            </style>
          </head>
          <body>
            <div class="reports-main-div">
              <div class="report-content">
                <div class="report-left">
                  ${supplierDetails}
                </div>
                <div class="report-company-name">
                  <h2>Hisaaber Accounts</h2>
                </div>
                <div class="report-right">
                  <h2>${title}</h2>
                  <h3>Printed by: ${User}</h3>
                  <h3>Printed on: ${new Date().toLocaleString()}</h3>
                </div>
              </div>
              ${dateRange}
            </div>

            <div>
              ${printContent?.innerHTML}
            </div>
          </body>
        </html>
      `);

      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, 100);
  };

  return (
    <Button
      type="default"
      onClick={handleReportPrint}
      icon={<PrinterOutlined />}
    >
      Print
    </Button>
  );
};

export default ReportPrinter;
