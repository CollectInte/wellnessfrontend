import axios from "axios";

const api = axios.create({
  // baseURL: "http://localhost:5000",
  baseURL: "http://localhost:5000",

  withCredentials: true, // 🔥 sends cookie automatically
});

export default api;
