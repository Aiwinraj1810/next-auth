// lib/axios.ts
import axios from "axios";

export function getApi(jwt?: string) {

  const instance = axios.create({
    baseURL: process.env.STRAPI_URL || "http://localhost:1337/api",
  });

  // Always attach the latest token before every request
  instance.interceptors.request.use((config) => {
    const token = jwt || process.env.STRAPI_TOKEN;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("⚠️ No JWT or STRAPI_TOKEN found for request:", config.url);
    }

    return config;
  });

  return instance;
}
