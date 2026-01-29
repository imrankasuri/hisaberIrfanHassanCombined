import axios from "axios";
import Config from "../../Config";

async function BankModeDropdown(CompanyID, Type) {
    const AccessKey = localStorage.getItem("AccessKey");

    if (Type == "") {
        return [];
    }

    const api_config = {
        method: "get",
        url: `${Config.base_url}DropdownData/GetDropdownData/${CompanyID}?Type=${Type}`,
        headers: {
            Authorization: `Bearer ${AccessKey}`,
            "Content-Type": "application/json",
        },
    };

    try {
        const response = await axios(api_config);
        if (response.data.status_code === 1) {
            return response.data.dropdownData || [];
        } else {
            return [];
        }
    } catch (error) {
        // console.error("Error fetching data:", error);
        return [];
    }
}

export default BankModeDropdown;