import axios from "axios";
import Config from "../../Config";
import { message } from "antd";

async function AddAccount(formData, accounts) {
  // Extract constants
  const accessKey = localStorage.getItem("AccessKey");
  const companyID = localStorage.getItem("CompanyID");
  const fiscalYear = localStorage.getItem("DefaultFYear");

  if (accounts?.length < 1) {
    message.error("Please enter valid data.");
    return false;
  }
  // //Console.log(accounts)
  const newAccountCode = (
    parseInt(accounts[accounts.length - 1]?.accountCode ?? 0, 10) + 1
  ).toString();
  const data = {
    ...formData,
    accountCode: newAccountCode,
    iLevel: 3,
    year: fiscalYear,
    isActive: true,
    isDeleted: false,
    companyID: companyID,
  };

  try {
    // Make the API call
    const response = await axios.post(
      `${Config.base_url}AccountMain/AddAccount`,
      data,
      {
        headers: {
          Authorization: `Bearer ${accessKey}`,
        },
      }
    );

    if (response.data.status_code === 1) {
      message.success(response.data.status_message);
      return true;
    } else {
      message.error(response.data.status_message);
      return false;
    }
  } catch (error) {
    message.error("Network Error...");
    return false;
  }
}

export default AddAccount;
