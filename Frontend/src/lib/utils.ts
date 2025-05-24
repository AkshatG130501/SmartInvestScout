/**
 * @file Utility functions
 * @description Common utility functions used throughout the application
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { RiskAppetite, InvestmentGoal } from "./api/types";

/**
 * Combines Tailwind CSS classes with proper precedence
 * @param inputs - Class values to merge
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats a file size in bytes to a human-readable string
 * @param bytes - File size in bytes
 * @returns Formatted file size string (e.g., "2.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Formats a date string to a human-readable format
 * @param dateString - ISO date string
 * @returns Formatted date string (e.g., "May 24, 2025")
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

/**
 * Truncates text to a specified length and adds ellipsis if needed
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

/**
 * Converts a risk appetite enum value to a human-readable string
 * @param riskAppetite - Risk appetite enum value
 * @returns Human-readable risk appetite string
 */
export function formatRiskAppetite(riskAppetite: RiskAppetite): string {
  const labels = {
    [RiskAppetite.CONSERVATIVE]: "Conservative",
    [RiskAppetite.MODERATE]: "Moderate",
    [RiskAppetite.AGGRESSIVE]: "Aggressive",
  };
  return labels[riskAppetite] || "Unknown";
}

/**
 * Converts an investment goal enum value to a human-readable string
 * @param goal - Investment goal enum value
 * @returns Human-readable investment goal string
 */
export function formatInvestmentGoal(goal: InvestmentGoal): string {
  const labels = {
    [InvestmentGoal.LONG_TERM_GROWTH]: "Long-term Growth",
    [InvestmentGoal.PASSIVE_INCOME]: "Passive Income",
    [InvestmentGoal.RETIREMENT]: "Retirement",
    [InvestmentGoal.SHORT_TERM_GAINS]: "Short-term Gains",
    [InvestmentGoal.WEALTH_PRESERVATION]: "Wealth Preservation",
  };
  return labels[goal] || "Unknown";
}
