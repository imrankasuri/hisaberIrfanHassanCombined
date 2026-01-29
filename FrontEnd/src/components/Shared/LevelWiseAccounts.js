import axios from "axios";
import Config from "../../Config";

async function LevelWiseAccounts(Level1) {
    const AccessKey = localStorage.getItem("AccessKey");
    const CompanyID = localStorage.getItem("CompanyID");

    const data = {
        CompanyID: CompanyID,
        Level1: Level1,
    };

    const api_config = {
        method: "post",
        url: `${Config.base_url}AccountMain/GetAccountsByLevel`,
        headers: {
            Authorization: `Bearer ${AccessKey}`,
            "Content-Type": "application/json",
        },
        data: data,
    };

    try {
        const response = await axios(api_config);
        if (response.data.status_code === 1) {
            return response.data.listofAccounts || [];
        } else {
            return [];
        }
    } catch (error) {
        // console.error("Error fetching data:", error);
        return [];
    }
}

export default LevelWiseAccounts;