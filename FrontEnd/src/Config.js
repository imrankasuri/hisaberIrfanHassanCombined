"use client";
const host = window.location.hostname;

let base_url;
let path;
let img_path;
let imge;
let assets;
let root;
let admin_path;
let path_realestate;

if (host == "localhost") {
  // base_url = "https://localhost:7143/api/";
  // path = "https://localhost:7143/api/";
  // img_path = "https://localhost:7143/Personal/MemberImages/";
  // assets = "https://localhost:7143/assets/";
  // root = "https://localhost:7143/api/";

  base_url = "https://api.hisaaber.com/api/";
  path = "https://api.hisaaber.com/api/";
  img_path = "https://api.hisaaber.com/Personal/MemberImages/";
  assets = "https://api.hisaaber.com/assets/";
  root = "https://api.hisaaber.com/api/";
} else {
  base_url = "https://api.hisaaber.com/api/";
  path = "https://api.hisaaber.com/api/";
  img_path = "https://api.hisaaber.com/Personal/MemberImages/";
  assets = "https://api.hisaaber.com/assets/";
  root = "https://api.hisaaber.com/api/";
}

const Config = {
  base_url,
  path,
  img_path,
  imge,
  assets,
  root,
  admin_path,
  path_realestate,
  date_format: "DD/MM/YYYY",
  date_format_input: "YYYY-MM-DD",
};

export default Config;
