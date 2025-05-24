/**
 * @deprecated This file is deprecated and will be removed in a future version.
 * Please import from 'src/lib/api/' instead.
 */

// Re-export everything from the new modular API structure
import api from "./api/client";

// Export types
export * from "./api/types";

// Export domain-specific APIs
export * from "./api/documents";
export * from "./api/profiles";
export * from "./api/chat";

// Export the base API client as default
export default api;
