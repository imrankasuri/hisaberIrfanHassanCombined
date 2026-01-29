import { useEffect, useState } from "react";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Config from "../../../Config";
import Logo from "../../../assets/images/logo/dark-h.svg";
import axios from "axios";
import { Button, Col, message, Row, Table } from "antd";

const PrintInvoice = () => {
  const [sale, setSale] = useState([]);
  const [totalSale, setTotalSale] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isContentReady, setIsContentReady] = useState(false);
  const contentRef = useRef(null);

  const location = useLocation();
  const params = useParams();

  const navigate = useNavigate();

  const CompanyName = localStorage.getItem("CompanyName");
  const AccessKey = localStorage.getItem("AccessKey");
  const UserName = localStorage.getItem("Full_Name");
  const CompanyID = localStorage.getItem("CompanyID");
  const Address = localStorage.getItem("CompanyAddress");
  const Mobile = localStorage.getItem("Mobile_No");

  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: `Sales Invoice - ${params.id}`,
    removeAfterPrint: true,
  });

  const fetchSales = async () => {
    setLoading(true);
    try {
      const data = {
        ID: params.id,
        CompanyID: CompanyID,
      };
      const response = await axios.post(
        `${Config.base_url}Sales/GetSaleDataForEdit`,
        data,
        {
          headers: {
            Authorization: `Bearer ${AccessKey}`,
          },
        }
      );
      // //Console.log(response.data);
      if (response.data.status_code === 1) {
        if (CompanyID != response.data.saleHead.companyID) {
          navigate("/sales/sales-invoices");
        }
        setTotalSale(response.data.saleHead);
        setSale(response.data.listofSaleBody);
      }
    } catch (error) {
      // //console.error("Error fetching salehead data:", error);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  useEffect(() => {
    document.title = "Print Invoice";
    fetchSales();
  }, []);
  ////Console.log(totalSale);

  useEffect(() => {
    if (sale.length > 0 && totalSale) {
      setIsContentReady(true);
    }
  }, [sale, totalSale]);

  const columns = [
    {
      title: "Product",
      dataIndex: "product",
      key: "product",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Weight",
      dataIndex: "weight",
      key: "weight",
    },
    {
      title: "Length",
      dataIndex: "length",
      key: "length",
    },
    {
      title: "Rate",
      dataIndex: "rate",
      key: "rate",
    },
    {
      title: "Rate Unit",
      dataIndex: "defaultUnit",
      key: "defaultUnit",
    },
    {
      title: "Total",
      dataIndex: "net",
      key: "net",
    },
  ];

  return (
    <>
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          fontFamily: "Arial, sans-serif",
          maxWidth: "800px",
          margin: "auto",
          border: "1px solid #ddd",
        }}
      >
        <div ref={contentRef} className="print-content px-5 py-3">
          {/* Header Section */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "20px",
              borderBottom: "2px solid #000",
              paddingBottom: "10px",
            }}
          >
            <div style={{ flex: "0 0 auto" }}>
              <img src={Logo} alt="Company Logo" style={{ height: "60px" }} />
            </div>
            <div
              style={{
                flex: "1",
                textAlign: "right",
                fontSize: "28px",
                fontWeight: "bold",
                textTransform: "uppercase",
              }}
            >
              {CompanyName}
            </div>
          </div>

          {/* Customer & Invoice Details */}
          <div
            style={{
              borderBottom: "1px solid #ddd",
              paddingBottom: "10px",
              marginBottom: "10px",
            }}
          >
            <div
              className="d-flex flex-column flex-md-row justify-content-between"
              style={{ display: "flex", flexWrap: "wrap" }}
            >
              {/* Left Side - Customer & Invoice */}
              <div
                className="text-start"
                style={{ flex: "1", minWidth: "200px" }}
              >
                <p
                  style={{
                    margin: "5px 0",
                    fontSize: "16px",
                  }}
                >
                  <strong>Customer:</strong> {totalSale.customerName}
                </p>
                <p
                  style={{
                    margin: "5px 0",
                    fontSize: "16px",
                  }}
                >
                  <strong>Invoice No:</strong> {params.id}
                </p>
                <p
                  style={{
                    margin: "5px 0",
                    fontSize: "16px",
                  }}
                >
                  <strong>Date:</strong> {totalSale.date}
                </p>
              </div>

              {/* Right Side - Issued By, Address, Contact */}
              <div
                className="text-end"
                style={{ flex: "1", minWidth: "250px" }}
              >
                <p style={{ margin: "5px 0", fontSize: "16px" }}>
                  <strong>Issued By:</strong> {UserName}
                </p>

                <p style={{ margin: "5px 0", fontSize: "16px" }}>
                  <strong>Contact No:</strong> {Mobile}
                </p>
                <p style={{ margin: "5px 0", fontSize: "16px" }}>
                  <strong>Company Address:</strong> {Address}
                </p>
              </div>
            </div>
          </div>

          {/* Invoice Table */}
          <Table
            columns={columns}
            dataSource={sale}
            size="small"
            loading={loading}
            pagination={false}
            scroll={{ x: "100%" }}
            style={{ marginBottom: "20px" }}
          />

          {/* Summary Section */}
          <Row
            className="mt-3"
            style={{ fontSize: "16px", fontWeight: "bold" }}
          >
            <Col span={12} style={{ textAlign: "left" }}>
              <b>Sub Total:</b> <br />
              <b>Discount:</b> <br />
              <b>Sale Tax:</b> <br />
              <b>Overall Discount:</b> <br />
              <b>Total:</b>
            </Col>
            <Col span={12} style={{ textAlign: "right" }}>
              {totalSale.subTotal} <br />
              {totalSale.totalDiscount} <br />
              {totalSale.totalSaleTax} <br />
              {totalSale.overallDiscount} <br />
              <b>{totalSale.total}</b>
            </Col>
          </Row>

          {/* Terms & Conditions */}
          <div
            className="mt-3"
            style={{
              fontSize: "14px",
              borderTop: "1px solid #ddd",
              paddingTop: "10px",
              marginTop: "20px",
            }}
          >
            <b>Terms & Conditions:</b>
            <ul style={{ paddingLeft: "20px", marginTop: "5px" }}>
              <li>
                All transactions (sales, purchases, receipts, payments) are
                final once recorded.
              </li>
              <li>
                Payments must be made as per agreed terms; late payments may
                incur penalties.
              </li>
              <li>
                Returns and refunds, if applicable, are subject to approval
                within the allowed period.
              </li>
              <li>
                Invoices and receipts must be verified for accuracy at the time
                of issuance.
              </li>
              <li>
                The company is not responsible for errors due to incorrect
                transaction details provided by users.
              </li>
              <li>
                All transactions must comply with applicable tax and legal
                regulations.
              </li>
              <li>
                Any disputes will be resolved as per the company’s policies or
                legal framework.
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="text-center">
        <Button
          type="primary"
          onClick={() => handlePrint()}
          style={{ marginTop: "20px" }}
          disabled={!isContentReady}
        >
          Print Invoice
        </Button>
      </div>
    </>
  );
};

export default PrintInvoice;
