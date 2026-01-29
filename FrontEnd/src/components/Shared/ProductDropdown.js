import React, { useEffect } from "react";
import { Select } from "antd";
import axios from "axios";
import Config from "../../Config";
const { Option } = Select;

async function ProductDropdown() {
    const AccessKey = localStorage.getItem("AccessKey");
    const CompanyID = localStorage.getItem("CompanyID");


    const api_config = {
        method: "get",
        url: `${Config.base_url}Product/GetBy/${CompanyID}?pageNumber=1&pageSize=100000000`,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${AccessKey}`,
        },
    };

    try {
        const response = await axios(api_config);
        if (response.data.status_code === 1) {
            return response.data.listofProducts
        } else {
            return [];
        }
    } catch (error) {
        return [];
    }
};

export default ProductDropdown;