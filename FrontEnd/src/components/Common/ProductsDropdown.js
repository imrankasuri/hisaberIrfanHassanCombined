import React, { useEffect } from "react";
import { Select } from "antd";
import axios from "axios";
import Config from "../../Config";
const { Option } = Select;

const ProductsDropdown = () => {
  const AccessKey = localStorage.getItem("AccessKey");
  const CompanyID = localStorage.getItem("CompanyID");
  const [ListOfProducts, setListOfProducts] = React.useState([]);
  const [productLoading, setProductLoading] = React.useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setProductLoading(true);
    const api_config = {
      method: "get",
      url: `${Config.base_url}Product/GetBy/${CompanyID}?pageNumber=1&pageSize=1000000`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AccessKey}`,
      },
    };

    try {
      const response = await axios(api_config);
      if (response.data && response.data.status_code === 1) {
        ////Console.log(response.data.listofProducts);
        setListOfProducts(response.data.listofProducts || []);
      } else {
        setListOfProducts([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setListOfProducts([]);
    } finally {
      setProductLoading(false);
    }
  };

  if (!productLoading) {
    // Return the array of objects in the specified format
    const result = ListOfProducts.map((item) => ({
      value: item.id,
      label: `${item.name} - Q: ${item.openingQuantity}`,
    }));
    return result;
  } else {
    return false;
  }
};

export default ProductsDropdown;
