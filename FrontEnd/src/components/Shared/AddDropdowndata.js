import axios from "axios";
import Config from "../../Config";
import { message } from "antd";

async function AddDropdowndata(FormData, Type) {
  const AccessKey = localStorage.getItem("AccessKey");
  const CompanyID = localStorage.getItem("CompanyID");
  const FYear = localStorage.getItem("DefaultFYear");

  if (FormData == null || Type == "") {
    message.error("Please enter valid data.");
    return false;
  }

  const data = {
    ...FormData,
    Name: FormData.name,
    type: Type,
    isActive: true,
    isDeleted: false,
    companyID: CompanyID,
    shortName: FormData.shortName || "",
  };
  // //Console.log(data)

  try {
    const response = await axios.post(
      Config.base_url + `DropdownData/AddDropdownData`,
      data,
      {
        headers: {
          Authorization: `Bearer ${AccessKey}`,
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
    console.error(error);
    return false;
  }
}

export default AddDropdowndata;
