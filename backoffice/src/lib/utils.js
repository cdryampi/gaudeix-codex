/**
 * Utility functions
 */
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
/**
 * Merge Tailwind CSS classes with proper precedence
 * Combines clsx for conditional classes and tailwind-merge for deduplication
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
/**
 * Format a date to a localized string
 */
export function formatDate(date, locale = "es-ES") {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(dateObj);
}
/**
 * Format a date and time to a localized string
 */
export function formatDateTime(date, locale = "es-ES") {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(dateObj);
}
/**
 * Format a relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date, locale = "es-ES") {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  if (diffDays > 0) return rtf.format(-diffDays, "day");
  if (diffHours > 0) return rtf.format(-diffHours, "hour");
  if (diffMins > 0) return rtf.format(-diffMins, "minute");
  return rtf.format(-diffSecs, "second");
}
/**
 * Truncate text to a maximum length
 */
export function truncate(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}
/**
 * Capitalize first letter of a string
 */
export function capitalize(text) {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}
/**
 * Format a number with thousand separators
 */
export function formatNumber(num, locale = "es-ES") {
  return new Intl.NumberFormat(locale).format(num);
}
/**
 * Format bytes to human-readable size
 */
export function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}
/**
 * Sleep/delay function
 */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
/**
 * Debounce function
 */
export function debounce(func, wait) {
  let timeout = null;
  return function (...args) {
    const context = this;
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}
/**
 * Generate a random ID
 */
export function randomId(length = 8) {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length);
}
/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 */
export function isEmpty(value) {
  if (value == null) return true;
  if (typeof value === "string") return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
}
