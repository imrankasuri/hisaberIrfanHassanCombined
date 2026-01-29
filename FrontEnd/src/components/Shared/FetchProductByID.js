import axios from "axios";
import Config from "../../Config";
async function FetchProductByID(ID) {
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
    url: `${Config.base_url}Product/GetProductBy/${ID}`,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AccessKey}`,
    },
  };

  try {
    const response = await axios(api_config);
    // //Console.log("API response:", response.data);

    if (response.data.status_code === 1) {
      return response.data.productData || {};
    } else {
      return {};
    }
  } catch (error) {
    return {};
  }
}

export default FetchProductByID;
