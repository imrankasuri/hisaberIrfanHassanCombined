import React, { useEffect, useState } from "react";
import { Select } from "antd";
import axios from "axios";
import Config from "../../Config";
const { Option } = Select;

const CustomersDropdown = () => {
  const AccessKey = localStorage.getItem("AccessKey");
  const CompanyID = localStorage.getItem("CompanyID");
  const [ListOfRecords, setListOfRecords] = useState([]);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    fetchCustomer();
  }, []);

  const fetchCustomer = async () => {
    setCustomerLoading(true);
    const api_config = {
      method: "get",
      url: `${Config.base_url}CustomerSupplier/GetCustomersBy/${CompanyID}`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AccessKey}`,
      },
    };

    try {
      const response = await axios(api_config);
      ////Console.log("API response:", response.data);

      if (response.data && response.data.status_code === 1) {
        setListOfRecords(response.data.listofCustomers || []);
        setTotalRecords(response.data.totalRecords || 0);
        setCustomerLoading(false);
      } else {
        console.warn(
          "No data or error status_code:",
          response.data.status_code
        );
        setCustomerLoading(false);
        setListOfRecords([]);
      }
    } catch (error) {
      setCustomerLoading(false);
      console.error(
        "Error fetching data:",
        error.response?.data || error.message
      );
      setListOfRecords([]);
    }
  };

  if (!customerLoading) {
    // Return the array of objects in the specified format
    const result = ListOfRecords.map((record) => ({
      label: `${record.businessName.trim()} (${
        record.isSupplier && parseInt(record.accountCode) < 9000
          ? record.accountNo + " (S)"
          : record.isCustomer && parseInt(record.accountCode) > 9000
          ? record.accountNo + " (C)"
          : record.accountNo
      })`.trim(),
      value: record.id,
    }));
    return result;
  } else {
    return false;
  }
};

export default CustomersDropdown;
