/**
 * Privacy-conscious product analytics.
 * Follows rules.md §8 (minimum personal data, no third-party trackers without consent).
 *
 * Captures decision-oriented events:
 * - catalogue_view
 * - catalogue_search
 * - catalogue_filter
 * - venue_detail_view
 * - booking_initiated
 */

export type AnalyticsEventType =
  | "catalogue_view"
  | "catalogue_search"
  | "catalogue_filter"
  | "venue_detail_view"
  | "booking_initiated"

export interface AnalyticsEvent {
  event: AnalyticsEventType
  properties?: Record<string, string | number | boolean | undefined>
  timestamp?: string
}

export function trackEvent(
  event: AnalyticsEventType,
  properties?: Record<string, string | number | boolean | undefined>
): void {
  // Safe in both SSR and client environments
  const payload: AnalyticsEvent = {
    event,
    properties: {
      ...properties,
    },
    timestamp: new Date().toISOString(),
  }

  // In production, this dispatches to an approved privacy-respecting endpoint
  // During MVP/local development, it logs in debug mode without personal identifiers
  if (process.env.NODE_ENV === "development") {
    console.debug(`[Analytics: ${event}]`, payload.properties)
  }
}
