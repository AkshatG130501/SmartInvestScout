/**
 * @file API client configuration
 * @description Configures the Axios instance for all API requests
 */

import axios from "axios";
import { supabase } from "../supabase";
import { API } from "../constants";

/**
 * API client configuration
 */
const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || "";

/**
 * Create and configure the Axios instance
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API.DEFAULT_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

/**
 * Add auth token to requests
 */
const addAuthToken = async (config: any) => {
  try {
    const { data } = await supabase.auth.getSession();
    const session = data?.session;

    if (session?.access_token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${session.access_token}`,
      };
    }
  } catch (error) {
    console.error("Error adding auth token:", error);
  }
  
  return config;
};

/**
 * Handle request errors
 */
const handleRequestError = (error: any) => {
  console.error("API request error:", error);
  return Promise.reject(error);
};

/**
 * Handle response errors
 */
const handleResponseError = async (error: any) => {
  if (error.response?.status === 401) {
    try {
      // Try to refresh the token
      const { data, error: refreshError } = await supabase.auth.refreshSession();
      
      if (!refreshError && data.session) {
        // Retry the original request with the new token
        const originalRequest = error.config;
        originalRequest.headers["Authorization"] = `Bearer ${data.session.access_token}`;
        return axios(originalRequest);
      } else {
        // Redirect to login if refresh fails
        window.location.href = "/";
      }
    } catch (refreshError) {
      console.error("Error refreshing session:", refreshError);
    }
  }
  
  // Handle rate limiting
  if (error.response?.status === 429) {
    console.warn("Rate limit exceeded. Please try again later.");
  }
  
  return Promise.reject(error);
};

// Add request interceptor
api.interceptors.request.use(addAuthToken, handleRequestError);

// Add response interceptor
api.interceptors.response.use(response => response, handleResponseError);

/**
 * Helper functions for common API operations
 */
export const apiHelpers = {
  /**
   * Handle API errors consistently
   */
  handleError: (error: any, fallbackMessage = "An error occurred"): string => {
    // Check if it's an Axios error by looking for response property
    if (error && error.response) {
      const responseData = error.response.data;
      return responseData?.message || error.message || fallbackMessage;
    }
    
    return error?.message || fallbackMessage;
  },
};

export default api;
