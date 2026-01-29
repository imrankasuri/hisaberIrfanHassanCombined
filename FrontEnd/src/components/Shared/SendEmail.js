import axios from "axios";
import Config from "../../Config";
import { message } from "antd";

async function SendEmail(props) {
  const AccessKey = localStorage.getItem("AccessKey");
  const UserID = localStorage.getItem("ID");

  const data = {
    AccessKey: AccessKey,
    UserID: UserID,
    TransactionType: props.TransactionType,
  };
  //////Console.log(data);

  var api_config = {
    method: "post",
    url: Config.base_url + "Security/SendAuthenticationCode",
    headers: {
      "Content-Type": "application/json",
    },
    data: data,
  };

  try {
    const response = await axios(api_config);
    if (response.data.status_code == 1) {
      message.success(response.data.status_message);
      return true;
    } else {
      message.error(response.data.status_message);
      return false;
    }
    // Additional logic or handling of the response
  } catch (error) {
    message.error("Network Error..");
  }
}

export default SendEmail;
