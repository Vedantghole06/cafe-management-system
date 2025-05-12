import axios from "axios";

const instance = axios.create({
  baseURL: "https://cafe-backend-opal.vercel.app", // Backend URL
});

export default instance;
