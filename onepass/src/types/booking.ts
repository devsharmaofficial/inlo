/**
 * Booking Engine and Credit Ledger Domain Types.
 * Source of truth: architecture.md §4, §5 and 003_booking_ledger.sql.
 */

export type BookingStatus = "confirmed" | "cancelled" | "completed" | "no_show"
export type CheckinStatus = "pending" | "checked_in" | "expired"

export type CreditEntryType = "grant" | "debit" | "refund" | "expiry" | "adjustment"
export type CreditSourceType =
  | "seed_pack"
  | "order"
  | "booking"
  | "cancellation"
  | "admin"
  | "metered_session"
  | "usage_adjustment"

export interface CancellationPolicySnapshot {
  cutoffHours: number
  fullRefundAllowed: boolean
  termsVersion: string
  rules: string[]
}

export interface CreditLedgerEntry {
  id: string
  userId: string
  delta: number // positive for grants/refunds, negative for debits
  entryType: CreditEntryType
  sourceType: CreditSourceType
  sourceId: string
  idempotencyKey: string
  reason?: string
  createdAt: string
}

export interface CreditAccount {
  userId: string
  cachedBalance: number
  lastReconciledAt: string
}

export interface Booking {
  id: string
  userId: string
  slotId: string
  venueId: string
  activityId: string
  status: BookingStatus
  creditsDebited: number
  idempotencyKey: string
  confirmedAt: string
  cancelledAt?: string
  cancellationReason?: string

  // Immutable snapshots taken at booking confirmation time
  venueNameSnapshot: string
  venueLocalitySnapshot: string
  venueAddressSnapshot: string
  activityNameSnapshot: string
  slotStartsAtSnapshot: string
  slotEndsAtSnapshot: string
  policySnapshot: CancellationPolicySnapshot

  // Cryptographically unguessable check-in token (never booking ID)
  checkinToken: string
  checkinStatus: CheckinStatus
  checkedInAt?: string

  createdAt: string
  updatedAt: string
}

export interface BookingEvent {
  id: string
  bookingId: string
  statusFrom?: BookingStatus
  statusTo: BookingStatus
  actorId: string
  actorRole: string
  reason?: string
  createdAt: string
}

export interface CreateBookingInput {
  userId: string
  slotId: string
  idempotencyKey: string
}

export interface CancelBookingInput {
  userId: string
  bookingId: string
  reason?: string
  actorId: string
}
