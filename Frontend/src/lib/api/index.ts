import api from "./client";

// Define and export API base URL
export const API_BASE_URL =
  import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:3000/api";

// Export types
export * from "./types";

// Export domain-specific APIs
export * from "./documents";
export * from "./profiles";
export * from "./chat";
export * from "./search";

// Export the base API client as default
export default api;
