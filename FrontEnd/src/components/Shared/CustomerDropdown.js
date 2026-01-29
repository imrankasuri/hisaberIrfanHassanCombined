import axios from "axios";
import Config from "../../Config";
async function CustomerDropdown() {
  const AccessKey = localStorage.getItem("AccessKey");
  const UserID = localStorage.getItem("ID");
  const FYear = localStorage.getItem("DefaultFYear");
  const CompanyID = localStorage.getItem("CompanyID");

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

    if (response.data.status_code === 1) {
      return response.data.listofCustomers || [];
    } else {
      return [];
    }
  } catch (error) {
    return [];
  }
}

export default CustomerDropdown;
