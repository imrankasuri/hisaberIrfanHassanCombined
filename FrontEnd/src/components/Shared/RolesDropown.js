import React, { useState, useEffect } from "react";
import Config from "../../Config";
import SubMenuToggle from "../Common/SubMenuToggle";
import axios from "axios";
import dayjs from "dayjs";

function RolesDropDown(props) {
  const AccessKey = localStorage.getItem("AccessKey");
  const UserID = localStorage.getItem("ID");
  const FYear = localStorage.getItem("DefaultFYear");
  const CompanyID = localStorage.getItem("CompanyID");

  const [loading, setLoading] = useState(false);
  const [ListOfRoles, setListOfRoles] = useState([]);

  useEffect(() => {
    FetchRoles();
  }, []);

  const FetchRoles = async () => {
    if (storedRoles.includes("0d42ee65-ea41-421e-81a3-af81fa61dcb8")) {
      try {
        const response = await axios.get(Config.base_url + "Account/GetRoles", {
          headers: {
            Authorization: `Bearer ${AccessKey}`,
          },
        });
        //Console.log(response)
        if (response.data.status_code == 1) {
          setRoles(response.data);
        }
      } catch (error) {
        // message.error("Network Error..");
      }
    }
  };

  return ListOfRoles; // Return the list of years
}

export default RolesDropDown;
