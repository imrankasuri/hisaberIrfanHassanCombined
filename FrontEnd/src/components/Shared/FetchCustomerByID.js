import axios from "axios";
import Config from "../../Config";
async function FetchCustomerByID(ID) {
  const AccessKey = localStorage.getItem("AccessKey");
  const UserID = localStorage.getItem("ID");
  const FYear = localStorage.getItem("DefaultFYear");
  const CompanyID = localStorage.getItem("CompanyID");
  // //Console.log(ID)
  if (ID < 0) {
    return {};
  }
  const api_config = {
    method: "get",
    url: `${Config.base_url}CustomerSupplier/GetCustomerBy/${ID}`,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AccessKey}`,
    },
  };

  try {
    const response = await axios(api_config);
    // //Console.log("API response:", response.data);

    if (response.data.status_code === 1) {
      return response.data.customerData || {};
    } else {
      return {};
    }
  } catch (error) {
    return {};
  }
}

export default FetchCustomerByID;
