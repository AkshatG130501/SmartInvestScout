/**
 * @file Application constants
 * @description Centralized constants for the SmartInvestScout application
 */

// API Configuration
export const API = {
  DEFAULT_TIMEOUT: 30000,
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
  SUMMARY: "/summary",
  SEARCH_RESULTS: "/search-results",
  CHAT: "/chat",
};
