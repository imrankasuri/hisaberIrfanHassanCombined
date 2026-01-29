import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Spin } from "antd";
import Config from "../../Config";
import SubMenuToggle from "../Common/SubMenuToggle";

function LoginCheck(props) {
  let navigate = useNavigate();
  const [AccessKey, setAccessKey] = useState(localStorage.getItem("AccessKey"));
  const [UserID, setUserID] = useState(localStorage.getItem("ID"));
  const [loading, setLoading] = useState(false);

  return (
    <>
      {loading ? (
        <div className="loading-main">
          <Spin />
        </div>
      ) : (
        <></>
      )}
    </>
  );
}

export default LoginCheck;
