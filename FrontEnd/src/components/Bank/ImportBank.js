import React, { useState, useEffect } from "react";
import { InboxOutlined, DownloadOutlined } from "@ant-design/icons";

import { ArrowLeftIcon } from "@heroicons/react/24/solid";

import { NavLink } from "react-router-dom";

import {
  Card,
  Col,
  Form,
  Input,
  Row,
  Upload,
  Select,
  Button,
  message,
  Skeleton,
} from "antd";
import axios from "axios";
import Config from "../../Config";
import * as XLSX from "xlsx";
import SubMenuToggle from "../Common/SubMenuToggle";

function ImportBank() {
  const AccessKey = localStorage.getItem("AccessKey");
  const UserID = localStorage.getItem("ID");
  const FYear = localStorage.getItem("DefaultFYear");
  const CompanyID = localStorage.getItem("CompanyID");

  // loadings
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (event) => {
    setLoading(true);
    const file = event.target.files[0];

    // ////Console.log(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      const filedata = e.target.result;
      const workbook = XLSX.read(filedata, { type: "binary" });
      // Assuming that the Excel file has only one sheet
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      // Convert the sheet to JSON format
      const jsonData = XLSX.utils.sheet_to_json(sheet);
      // ////Console.log(jsonData);

      const data = {
        UserID: UserID,
        AccessKey: AccessKey,
        CompanyID: CompanyID,
        ListofCustomers: jsonData,
      };

      // ////Console.log(data);

      var api_config = {
        method: "post",
        url: Config.base_url + "Customer/ImportCustomers",
        headers: {
          "Content-Type": "application/json",
        },
        data: data,
      };

      axios(api_config)
        .then(function (response) {
          // ////Console.log(response.data);
          if (response.data.status_code == 1) {
            message.success(response.data.status_message);
            setLoading(false);
            //navigate("/Accounts/ManageAccounts");
          } else {
            setLoading(false);
            message.error(response.data.status_message);
          }

          setLoading(false);
        })
        .catch(function (error) {
          setLoading(false);
        });
    };
    reader.readAsBinaryString(file);
  };
  return (
    <>
      <div id="sub-menu-wrap">
        <h5>Customer</h5>
      </div>
      <div className="right-side-contents">
        <div className="page-content">
          <div className="page-header">
            <SubMenuToggle />
            <h3 className="page-title">
              <NavLink to="/Customer/manage">
                <ArrowLeftIcon />
              </NavLink>
              Import Customer
            </h3>
          </div>

          <div className="form-section">
            <div className="form-header">
              <Row align="middle">
                <Col md={10} xs={24}>
                  <div className="left-form-tittle">
                    <h2>Import CSV List of Customer</h2>
                    <p style={{ marginTop: "10px", marginBottom: "30px" }}>
                      Please make sure that your file follows the template that
                      can be downloaded from below link.
                    </p>

                    <NavLink
                      to={`https://hisaaber.com/ExcelFiles/CustomerImportSample.xlsx`}
                      target="_blank"
                    >
                      <Button type="default">Download Template</Button>
                    </NavLink>
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
                          accept=".xlsx, .xls"
                          onChange={handleFileUpload}
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
            >
              Import
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default ImportBank;
