import React, { useEffect } from "react";
import { Select } from "antd";
import axios from "axios";
import Config from "../../Config";
const { Option } = Select;

async function TemplateDropdown() {
  const AccessKey = localStorage.getItem("AccessKey");
  const CompanyID = localStorage.getItem("CompanyID");

  const data = {
    CompanyID: CompanyID,
    PageSize: 100000,
    PageNo: 1,
  };
  const api_config = {
    method: "post",
    url: `${Config.base_url}Templates/GetTemplates`,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AccessKey}`,
    },

    data: data,
  };

  try {
    const response = await axios(api_config);
    if (response.data.status_code === 1) {
      //Console.log(response.data);
      return response.data.listofTemps;
    } else {
      return [];
    }
  } catch (error) {
    //Console.log(error);
    return [];
  }
}

export default TemplateDropdown;
