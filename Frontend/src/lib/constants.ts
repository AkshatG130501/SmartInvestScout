/**
 * @file Application constants
 * @description Centralized constants for the SmartInvestScout application
 * 
 * This file contains all application-wide constants to ensure consistency
 * and make maintenance easier by having a single source of truth.
 */

// API Configuration
export const API = {
  DEFAULT_TIMEOUT: 60000,
  DEFAULT_PAGE_SIZE: 20,
};

// File Upload
export const UPLOAD = {
  MAX_FILE_SIZE: 5 * 1024 * 1024,
  ACCEPTED_FILE_TYPES: {
    "application/pdf": [".pdf"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
      ".docx",
    ],
    "text/plain": [".txt"],
  },
};

// User Profile
export const PROFILE = {
  DEFAULT_RISK_APPETITE: "moderate",
  DEFAULT_INVESTMENT_GOALS: ["long_term_growth"],
};

// Chat
export const CHAT = {
  MAX_MESSAGE_LENGTH: 1000,
  MESSAGES_PER_PAGE: 20,
};

// UI
export const UI = {
  ANIMATION_DURATION: 300,
  TOAST_DURATION: 5000,
};

// Routes
export const ROUTES = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
  SETTINGS: "/settings",
  SUMMARY: "/summary",
  SEARCH: "/search",
  SEARCH_WITH_QUERY: (query: string) => `/search/${encodeURIComponent(query)}`,
  CHAT: "/chat",
  ABOUT: "/about",
  FEATURES: "/features",
  PRICING: "/pricing",
  ALERTS: "/alerts",
  TERMS: "/terms",
  PRIVACY: "/privacy"
};

// API Endpoints
export const API_ENDPOINTS = {
  SEARCH_SUGGESTIONS: "/api/search/suggestions",
  SEARCH_HISTORY: "/api/search/history",
  SEARCH_RECENT: "/api/search/recent",
  CHAT: "/api/chat",
  CHAT_HISTORY: "/api/chat/history",
  PROFILE: "/api/profile",
  UPLOAD: "/api/upload"
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "smart_invest_scout_auth_token",
  USER_PROFILE: "smart_invest_scout_user_profile",
  THEME: "smart_invest_scout_theme",
  DOCUMENT_SUMMARY: "documentSummary"
};
