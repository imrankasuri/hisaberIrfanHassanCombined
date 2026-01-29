import React, { useEffect } from "react";
import { Select } from "antd";
import axios from "axios";
import Config from "../../Config";
const { Option } = Select;

async function LocationDropdown() {
  const AccessKey = localStorage.getItem("AccessKey");
  const CompanyID = localStorage.getItem("CompanyID");

  const api_config = {
    method: "get",
    url: `${Config.base_url}Location/GetLocations/${CompanyID}`,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AccessKey}`,
    },
  };

  try {
    const response = await axios(api_config);
    if (response.data.status_code === 1) {
      ////Console.log(response.data);
      return response.data.data;
    } else {
      return [];
    }
  } catch (error) {
    //Console.log(error);
    return [];
  }
}

export default LocationDropdown;
