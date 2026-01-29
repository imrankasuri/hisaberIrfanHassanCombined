import React, { useState } from "react";
import { InboxOutlined } from "@ant-design/icons";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { NavLink } from "react-router-dom";
import { Col, Row, Button, message, Skeleton } from "antd";
import axios from "axios";
import Config from "../../Config";
import SubMenuToggle from "../Common/SubMenuToggle";
import * as XLSX from "xlsx";
import PurchaseMenu from "./PurchaseMenu";

function ImportBills() {
  const AccessKey = localStorage.getItem("AccessKey");
  const UserID = localStorage.getItem("ID");
  const CompanyID = localStorage.getItem("CompanyID");
  const FYear = localStorage.getItem("DefaultFYear");

  const [loading, setLoading] = useState(false);
  const [excelFile, setExcelFile] = useState(null);
  const [typeError, setTypeError] = useState(null);

  // submit state
  const [excelData, setExcelData] = useState(null);

  // onchange event

  const handleFile = async (e) => {
    const fileTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
    ];
    const selectedFile = e.target.files[0];

    if (!selectedFile) {
      message.error("Please select a file");
      return;
    }

    if (!fileTypes.includes(selectedFile.type)) {
      message.error("Please select only Excel file types");
      return;
    }

    setTypeError(null);
    setLoading(true);

    // Prepare the form data
    const formData = new FormData();
    formData.append("file", selectedFile); // Append the file
    formData.append("CompanyID", CompanyID); // Append only the CompanyID

    try {
      const response = await axios.post(
        `${Config.base_url}PurchaseHead/UploadPurchaseExcel/${CompanyID}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${AccessKey}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.status_code == 1) {
        message.success(response.data.status_message);
      } else {
        message.error(response.data.status_message);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      message.error("Network Error..");
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div id="sub-menu-wrap">
        <h5>Purchases</h5>
        <PurchaseMenu />
      </div>
      <div className="right-side-contents">
        <div className="page-content">
          <div className="page-header">
            <SubMenuToggle />
            <h3 className="page-title">
              <NavLink to="/purchases/purchase-bills">
                <ArrowLeftIcon />
              </NavLink>
              Import Bill
            </h3>
          </div>

          <div className="form-section">
            <div className="form-header">
              <Row align="middle">
                <Col md={10} xs={24}>
                  <div className="left-form-tittle">
                    <h2>Import CSV List of Bills</h2>
                    <p style={{ marginTop: "10px", marginBottom: "30px" }}>
                      Please make sure that your file follows the template that
                      can be downloaded from below link.
                    </p>

                    <a
                      href="https://new.hisaaber.com/SheetSamples/SampleInvoice.xlsx"
                      download
                    >
                      <Button type="default">Download Template</Button>
                    </a>
                  </div>
                </Col>
                <Col md={14} xs={24}>
                  {loading ? (
                    <Skeleton />
                  ) : (
                    <div className="upload-box">
                      <label htmlFor="File">
                        <input
                          type="file"
                          id="File"
                          accept=".xlsx, .xls, .csv"
                          onChange={handleFile}
                        />

                        <div className="upload-icon">
                          <InboxOutlined />
                        </div>
                        <p className="upload-text">Click here to select file</p>
                        <p className="upload-hint">
                          Quickly import your account list by simply uploading
                          your Excel file. Streamline the process and get
                          started in seconds!
                        </p>
                      </label>
                      {typeError && <p style={{ color: "red" }}>{typeError}</p>}
                    </div>
                  )}
                </Col>
              </Row>
            </div>
          </div>
          <div className="form-footer">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              //   onClick={handleFile}
            >
              Import
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default ImportBills;
