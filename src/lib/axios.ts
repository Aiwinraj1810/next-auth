// lib/axios.ts
import axios from "axios";

export function getApi(jwt?: string) {
  const instance = axios.create({
    baseURL: process.env.STRAPI_URL || "http://localhost:1337/api/",
  });
  const strapiToken =
    process.env.STRAPI_TOKEN ||
    "1f9611d43cacd916f959518ba82be3ee01a4d531c1b05b3c1d6fd38343ba8ebc18df2a37a9af806b75557636ff843eeb9cf421fff87eb5cc44c678ac969e01c4f9890f368f760337158a352d4836147a7d49809f6f22fe00d463689e73ce7a7644c7fec284845f1f7d909d0b3d8f669d8a61c84ccff8a2c16430f46cefe013b6";

  // Always attach the latest token before every request
  instance.interceptors.request.use((config) => {
    const token = jwt || strapiToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("⚠️ No JWT or STRAPI_TOKEN found for request:", config.url);
    }

    return config;
  });

  return instance;
}
