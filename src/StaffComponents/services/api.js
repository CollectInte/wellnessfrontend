import axios from "axios";

const api = axios.create({
  // baseURL: "http://localhost:5000",
  baseURL: "https://gym.caredesk360.com",

  withCredentials: true, // 🔥 sends cookie automatically
});

export default api;
