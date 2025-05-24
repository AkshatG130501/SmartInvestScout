/**
 * @deprecated This file is deprecated and will be removed in a future version.
 * Please import from 'src/lib/api/' instead.
 * 
 * Example:
 * import { getUserProfile } from 'src/lib/api/profiles';
 * or
 * import { getUserProfile } from 'src/lib/api';
 */

// Re-export everything from the new modular API structure
import api from './api/client';

// Export types
export * from './api/types';

// Export domain-specific APIs
export * from './api/documents';
export * from './api/profiles';
export * from './api/chat';

// Export the base API client as default
export default api;
