import React, { useState, useEffect } from "react";
import Config from "../../Config";
import SubMenuToggle from "../Common/SubMenuToggle";
import axios from "axios";
import dayjs from "dayjs";

function YearsDropDown(props) {
  const AccessKey = localStorage.getItem("AccessKey");
  const UserID = localStorage.getItem("ID");
  const FYear = localStorage.getItem("DefaultFYear");
  const CompanyID = localStorage.getItem("CompanyID");

  const [loading, setLoading] = useState(false);
  const [ListOfYears, setListOfYears] = useState([]);

  useEffect(() => {
    setLoading(true);
    const apiData = {
      AccessKey: AccessKey,
      UserID: UserID,
      PageNo: 1,
      PageSize: 100,
      CompanyID: CompanyID,
    };
    ////Console.log(apiData)
    var api_config = {
      method: "post",
      url: Config.base_url + "Accounts/GetFYears",
      headers: {
        "Content-Type": "application/json",
      },
      data: apiData,
    };

    axios(api_config)
      .then(function (response) {
        ////Console.log(response.data);
        let years = response.data.ListofRecords;

        if (years) {
          const yearsSelect = years.map((item) => ({
            value: item.FYear,
            label: item.FYear,
          }));

          setListOfYears(yearsSelect);
        }

        setLoading(false);
      })
      .catch(function (error) {
        ////Console.log(error);
      });
  }, []);

  return ListOfYears; // Return the list of years
}

export default YearsDropDown;
