import React, { useEffect, useState } from "react";

import Logo from "../../assets/images/logo/white-v.svg";
import { NavLink } from "react-router-dom";
import { Link, useNavigate } from "react-router-dom";

import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { Button, Skeleton, Row, Col, message } from "antd";
import Config from "../../Config";
import SubMenuToggle from "../Common/SubMenuToggle";
import axios from "axios";

function ChangeCompany(props) {
  const AccessKey = localStorage.getItem("AccessKey");
  const UserID = localStorage.getItem("ID");
  const Email = localStorage.getItem("Email_Address");
  const [ListOfCompanies, setListOfCompanies] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.clear();
    navigate("/login");
  };

  useEffect(() => {
    const fetchRoles = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          Config.base_url + `Account/GetCompaniesByUserID/${UserID}`,
          {
            headers: {
              Authorization: `Bearer ${AccessKey}`,
            },
          }
        );
        ////Console.log(response.data);

        const extractCompanyInfo = (data) => {
          return data.map((item) => item.companyInfo);
        };

        const list = extractCompanyInfo(response.data.listofRecords);

        if (list) {
          setLoading(false);
          if (list.length == 1) {
            message.info("You Have Only One Company.");
          }
          if (list.length > 1) {
            setListOfCompanies(list);
            setLoading(false);
          } else if (list.length === 0) {
            navigate("/company-register");
          } else {
            const first = list[0];
            localStorage.setItem("CompanyCode", first.companyCode);
            localStorage.setItem("CompanyID", first.id);
            localStorage.setItem("CompanyName", first.name);
            localStorage.setItem("CompanyAddress", first.address);
            navigate("/dashboard");
          }
        } else {
          setLoading(false);
        }
      } catch (error) {
        setLoading(false);
        message.error("Network Error...");
      }
    };
    fetchRoles();
  }, [UserID, AccessKey, navigate]);

  const handleCompany = async (item) => {
    try {
      const data = {
        Email: UserID,
        CompanyID: item.id,
      };
      const response = await axios.post(
        `${Config.base_url}Account/SelectCompany`,
        data,
        {
          headers: {
            Authorization: `Bearer ${AccessKey}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.data.status_code == 1) {
        localStorage.setItem("CompanyCode", item.companyCode);
        localStorage.setItem("CompanyID", item.id);
        localStorage.setItem("CompanyName", item.name);
        localStorage.setItem("CompanyAddress", item.address);
        navigate("/dashboard");
      } else {
        message.error(response.data.status_message);
      }
    } catch (error) {
      message.error("Network Error...");
    }
  };

  return (
    <>
      <div className="right-side-contents">
        <div className="page-content">
          <Row justify="center">
            <Col xs={24} md={12}>
              <h4>Change Company</h4>
              {loading ? (
                <Skeleton active />
              ) : (
                <ul className="list-actions">
                  {ListOfCompanies.map((item, index) => (
                    <li key={index}>
                      <a href="#" onClick={(e) => handleCompany(item)}>
                        <span>{item.name}</span>
                        <ChevronRightIcon />
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </Col>
          </Row>
        </div>
      </div>
    </>
  );
}

export default ChangeCompany;
