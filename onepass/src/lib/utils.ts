import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merge Tailwind classes with conflict resolution.
 * Use this for all conditional className construction.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format an integer credit amount for display.
 * e.g. formatCredits(12) → "12 credits"
 */
export function formatCredits(amount: number, short = false): string {
  if (short) return `${amount}cr`
  return `${amount} ${amount === 1 ? "credit" : "credits"}`
}

/**
 * Format integer paise to INR display string.
 * e.g. formatPaise(49900) → "₹499"
 */
export function formatPaise(paise: number): string {
  const rupees = paise / 100
  return formatINR(rupees)
}

/**
 * Format rupees to INR display string.
 * e.g. formatINR(4499) → "₹4,499"
 */
export function formatINR(rupees: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(rupees)
}

/**
 * Format a Date to a readable local date string.
 * Always pass a timezone — never infer from browser for venue times.
 */
export function formatDate(
  date: Date | string,
  timezone: string = "Asia/Kolkata",
  opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }
): string {
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("en-IN", { ...opts, timeZone: timezone }).format(d)
}

/**
 * Format time for display in venue local timezone.
 */
export function formatTime(
  date: Date | string,
  timezone: string = "Asia/Kolkata"
): string {
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: timezone,
  }).format(d)
}

/**
 * Truncate a string to a max length with ellipsis.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - 1) + "…"
}
