import axios from "axios";

const api = axios.create({
  baseURL: "/api", // Next.js API routes
});

export default api;
