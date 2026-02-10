// src/services/api.js
import axios from "axios";
import { auth } from "./firebase";

const API_BASE = process.env.REACT_APP_API_URL || "https://localhost:7243";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(async (config) => {
  try {
    const user = auth?.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    console.warn("Token attach failed:", err);
  }
  return config;
}, (error) => Promise.reject(error));

export default api;
