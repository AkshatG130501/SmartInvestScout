/**
 * @file API client configuration
 * @description Configures the Axios instance for all API requests
 */

import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
const DEFAULT_TIMEOUT = 60000;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: DEFAULT_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
