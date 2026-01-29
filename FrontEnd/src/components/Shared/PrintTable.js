import React from "react";
import { Button } from "antd";
import { PrinterOutlined } from "@ant-design/icons";

const PrintTable = ({
  selectedSupplier = null,
  startDate = null,
  endDate = null,
  User = "Unknown User",
  title = "Report Title",
}) => {
  const handlePrint = () => {
    const supplierDetails = selectedSupplier
      ? `
        <h2>${selectedSupplier.businessName}</h2>
        <h3>Account Code: ${selectedSupplier.accountNo}</h3>
      `
      : "<h2>All </h2>";

    const dateRange =
      startDate && endDate
        ? `<h3>Date Range: ${startDate} - ${endDate}</h3>`
        : "";

    const table = document.querySelector(".ant-table");
    const tableClone = table?.cloneNode(true);

    if (tableClone) {
      // Remove sorters and unnecessary elements
      tableClone
        .querySelectorAll(".ant-table-column-sorters .anticon")
        .forEach((icon) => {
          icon.style.display = "none"; // Hide the sort icons
        });

      // Add borders to all table cells
      tableClone.querySelectorAll("th, td").forEach((cell) => {
        cell.style.border = "1px solid #000";
        cell.style.padding = "6px";
        cell.style.textAlign = "left";
      });
    }

    const tableHTML = tableClone?.outerHTML || "<p>No table data available</p>";

    const printWindow = window.open("", "", "height=600,width=800");
    printWindow.document.write(`
      <html>
        <head>
        <title>${title}</title> 
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/antd/4.21.7/antd.min.css" />
          <style>
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
              font-family: "Lato", sans-serif; /* Custom font */
              color: #324f94;
              text-align: center;
            }

            .report-company-name {
              justify-content: center;
            }

            .report-content {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              width: 100%;
            }

            .report-left {
              text-align: left;
            }

            .report-left h3 {
              margin: 4px 0;
              font-size: 1rem;
              font-weight: 500;
            }

            .report-right {
              text-align: right;
            }

            .report-right h3 {
              margin: 4px 0;
              font-size: 1rem;
              font-weight: 500;
            }

            .report-right h3:last-child {
              font-size: 1rem;
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
          </style>
        </head>
        <body>
          <div class="reports-main-div">
            <div class="report-content">
              <div class="report-left">
                ${supplierDetails}
              </div>
              <h2>Hisaaber Accounts</h2>
              <div class="report-right">
                <h2>${title}</h2>
                <h3>Printed by: ${User}</h3>
                <h3>Printed on: ${new Date().toLocaleString()}</h3>
              </div>
            </div>
            ${dateRange}
          </div>
          <div style="display: flex; justify-content: center;">
            ${tableHTML}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <Button type="default" onClick={handlePrint} icon={<PrinterOutlined />}>
      Print
    </Button>
  );
};

export default PrintTable;
