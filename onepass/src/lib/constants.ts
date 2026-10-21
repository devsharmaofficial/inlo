/**
 * Application-wide constants.
 * Do NOT hardcode business values here — prices, credit costs,
 * cancellation windows, refund percentages. These must come from
 * server-side configuration/database once the business model is approved.
 */

export const APP_NAME = "OnePass" as const
export const APP_TAGLINE = "A city with more ways to move." as const

/** Maximum content width matching design.md layout grid */
export const MAX_CONTENT_WIDTH = "1280px" as const

/**
 * Route constants — keep route strings in one place.
 * Server actions and API routes should use separate typed constants.
 */
export const ROUTES = {
  home: "/",
  explore: "/explore",
  venue: (slug: string) => `/venues/${slug}`,
  membership: "/membership",
  checkout: "/checkout",
  bookings: "/bookings",
  booking: (id: string) => `/bookings/${id}`,
  account: "/account",
  // Partner portal
  partner: {
    root: "/partner",
    dashboard: "/partner/dashboard",
    venues: "/partner/venues",
    bookings: "/partner/bookings",
    statements: "/partner/statements",
    checkin: "/partner/checkin",
  },
  // Admin portal
  admin: {
    root: "/admin",
    venues: "/admin/venues",
    bookings: "/admin/bookings",
    payments: "/admin/payments",
    ledger: "/admin/ledger",
    partners: "/admin/partners",
    audit: "/admin/audit",
    pilot: "/admin/pilot",
    controls: "/admin/controls",
  },
  // Auth
  signIn: "/auth/sign-in",
  signUp: "/auth/sign-up",
} as const

/**
 * Role constants — must match server-enforced role values.
 * Never derive admin/partner access from client-editable profile fields.
 */
export const ROLES = {
  member: "member",
  partnerStaff: "partner_staff",
  partnerAdmin: "partner_admin",
  opsAdmin: "ops_admin",
  platformAdmin: "platform_admin",
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

/**
 * Booking status enum — mirrors DB enum in architecture.md §8.
 * Server is authoritative; these are display references only.
 */
export const BOOKING_STATUS = {
  confirmed: "CONFIRMED",
  checkedIn: "CHECKED_IN",
  completed: "COMPLETED",
  cancelled: "CANCELLED",
  noShow: "NO_SHOW",
  venueCancelled: "VENUE_CANCELLED",
  disputed: "DISPUTED",
} as const

export type BookingStatus = (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS]

/**
 * Payment status enum — mirrors DB enum in architecture.md §8.
 */
export const PAYMENT_STATUS = {
  created: "CREATED",
  pending: "PENDING",
  captured: "CAPTURED",
  failed: "FAILED",
  refundPending: "REFUND_PENDING",
  refunded: "REFUNDED",
  disputed: "DISPUTED",
  reconciliationRequired: "RECONCILIATION_REQUIRED",
} as const

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS]

/**
 * Venue listing status.
 */
export const VENUE_STATUS = {
  draft: "draft",
  pendingReview: "pending_review",
  approved: "approved",
  suspended: "suspended",
} as const

export type VenueStatus = (typeof VENUE_STATUS)[keyof typeof VENUE_STATUS]
