/**
 * Usage Metering and Hybrid Pricing Domain Types.
 * Source of truth: architecture (3).md §7, rules (4).md §5A, and 005_metered_usage_sessions.sql.
 */

export type RoundingPolicy = "CEIL_INTERVAL" | "FLOOR_INTERVAL" | "STANDARD"

export interface RateCard {
  id: string
  venueId: string
  activitySlug: string
  rateUnitMinutes: number // e.g. 30 minutes
  creditsPerUnit: number // e.g. 4 credits per 30 mins
  minDurationMinutes: number // e.g. 30 mins
  minCredits: number // minimum debit
  maxDurationMinutes: number // e.g. 180 mins
  maxCreditsCap: number // STRICT HARD CAP (e.g. 16 credits)
  roundingPolicy: RoundingPolicy
  version: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface UsageQuote {
  userId: string
  venueId: string
  venueName: string
  activitySlug: string
  rateCardId: string
  rateCardVersion: string
  rateUnitMinutes: number
  creditsPerUnit: number
  minCredits: number
  maxCreditsCap: number
  termsSummary: string
  expiresAt: string
}

export interface PricingPolicyAcceptance {
  id: string
  userId: string
  venueId: string
  rateCardId: string
  rateCardVersion: string
  acceptedCapCredits: number
  acceptedAt: string
}

export type UsageSessionStatus = "active" | "completed" | "capped_expired" | "disputed"

export interface UsageSession {
  id: string
  userId: string
  venueId: string
  venueName: string
  activitySlug: string
  rateCardId: string
  rateCardVersion: string
  status: UsageSessionStatus
  quoteMaxCredits: number
  startedAt: string // Authoritative server timestamp (ISO UTC)
  endedAt?: string // Authoritative server timestamp (ISO UTC)
  durationMinutes?: number
  billableUnits?: number
  creditsDebited?: number
  entryIdempotencyKey: string
  exitIdempotencyKey?: string
  exceptionCode?: string // e.g. "MISSING_EXIT_AUTO_CAPPED"
  passToken: string // unique check-in/out verification token
  createdAt: string
  updatedAt: string
}

export type ScanAction = "ENTRY" | "EXIT" | "STAFF_OVERRIDE"

export interface ScanEvent {
  id: string
  sessionId: string
  venueId: string
  userId: string
  action: ScanAction
  actorId: string
  serverReceivedAt: string
  idempotencyKey: string
  validationOutcome: "APPROVED" | "REJECTED"
  metadata?: Record<string, unknown>
}

export interface UsageAdjustment {
  id: string
  sessionId: string
  originalCredits: number
  adjustedCredits: number
  compensatingLedgerId?: string
  reason: string
  proposedBy: string
  approvedBy?: string
  status: "pending" | "approved" | "rejected"
  createdAt: string
}

export interface EntryScanResult {
  success: boolean
  session?: UsageSession
  error?: string
  message: string
}

export interface ExitScanResult {
  success: boolean
  session?: UsageSession
  creditsDebited?: number
  durationMinutes?: number
  capped?: boolean
  error?: string
  message: string
}
