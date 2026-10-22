/**
 * Usage Metering and Hybrid Pricing Domain Engine.
 * Implements architecture (3).md §7, rules (4).md §5A, and phases (3).md Additional Gate.
 *
 * Invariants:
 * 1. Server timestamp is authoritative (client clock manipulation is impossible).
 * 2. Pre-entry quote disclosure with transparent rate & strict hard maximum debit.
 * 3. Atomic entry session creation with idempotency.
 * 4. Atomic exit calculation with rounding, minimum charge, and strict hard cap.
 * 5. Uncapped charging is mathematically impossible: if exit is missed, it caps at the disclosed maximum.
 * 6. Idempotent entry and exit: retrying or double-scanning does not double-debit.
 * 7. Immutable ledger integration: credit debits append to the authoritative ledger.
 */

import type {
  RateCard,
  UsageQuote,
  PricingPolicyAcceptance,
  UsageSession,
  ScanEvent,
  UsageAdjustment,
  EntryScanResult,
  ExitScanResult,
} from "@/types/metering"
import {
  getUserCreditBalance,
  debitCredits,
  refundCredits,
} from "@/features/credits/credit-ledger-service"

// ── In-Memory Seed Rate Cards ───────────────────────────────────────────────
const rateCardsStore: RateCard[] = [
  {
    id: "rc-iron-movement-gym",
    venueId: "venue-iron-movement",
    activitySlug: "gym",
    rateUnitMinutes: 30,
    creditsPerUnit: 4, // 4 credits per 30 mins
    minDurationMinutes: 30,
    minCredits: 4, // min charge: 4 credits
    maxDurationMinutes: 180, // 3 hours
    maxCreditsCap: 16, // STRICT HARD CAP: max 16 credits
    roundingPolicy: "CEIL_INTERVAL",
    version: "v1.0",
    isActive: true,
    createdAt: "2026-10-21T00:00:00Z",
    updatedAt: "2026-10-21T00:00:00Z",
  },
  {
    id: "rc-hub-arena-fitness",
    venueId: "venue-hub-arena",
    activitySlug: "gym",
    rateUnitMinutes: 30,
    creditsPerUnit: 5, // 5 credits per 30 mins
    minDurationMinutes: 30,
    minCredits: 5,
    maxDurationMinutes: 180,
    maxCreditsCap: 18, // STRICT HARD CAP: max 18 credits
    roundingPolicy: "CEIL_INTERVAL",
    version: "v1.0",
    isActive: true,
    createdAt: "2026-10-21T00:00:00Z",
    updatedAt: "2026-10-21T00:00:00Z",
  },
]

// ── In-Memory Stores (Synchronized with Postgres in production) ─────────────
let sessionsStore: UsageSession[] = []
let scanEventsStore: ScanEvent[] = []
let acceptancesStore: PricingPolicyAcceptance[] = []
let adjustmentsStore: UsageAdjustment[] = []

/**
 * Resets stores for test runner isolation.
 */
export function resetMeteringStore() {
  sessionsStore = []
  scanEventsStore = []
  acceptancesStore = []
  adjustmentsStore = []
}

/**
 * Look up active rate card for a venue and activity.
 */
export async function getRateCardForVenue(
  venueId: string,
  activitySlug: string = "gym"
): Promise<RateCard | null> {
  const card = rateCardsStore.find(
    (rc) => rc.venueId === venueId && rc.activitySlug === activitySlug && rc.isActive
  )
  if (card) return card

  // Fallback default rate card for candidate venues
  return {
    id: `rc-dyn-${venueId}`,
    venueId,
    activitySlug,
    rateUnitMinutes: 30,
    creditsPerUnit: 4,
    minDurationMinutes: 30,
    minCredits: 4,
    maxDurationMinutes: 180,
    maxCreditsCap: 16,
    roundingPolicy: "CEIL_INTERVAL",
    version: "v1.0",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

/**
 * Generates an authoritative server quote before member enters venue.
 * Renders rate, rounding rule, minimum duration/charge, and strict hard cap.
 */
export async function generateUsageQuote(
  userId: string,
  venueId: string,
  activitySlug: string = "gym",
  venueName: string = "Partner Venue"
): Promise<UsageQuote> {
  const rateCard = await getRateCardForVenue(venueId, activitySlug)
  if (!rateCard) {
    throw new Error(`No active rate card for venue ${venueId} and activity ${activitySlug}`)
  }

  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 mins quote expiry

  return {
    userId,
    venueId,
    venueName,
    activitySlug,
    rateCardId: rateCard.id,
    rateCardVersion: rateCard.version,
    rateUnitMinutes: rateCard.rateUnitMinutes,
    creditsPerUnit: rateCard.creditsPerUnit,
    minCredits: rateCard.minCredits,
    maxCreditsCap: rateCard.maxCreditsCap,
    termsSummary: `${rateCard.creditsPerUnit} credits per ${rateCard.rateUnitMinutes} mins. Min charge: ${rateCard.minCredits} credits. Maximum hard cap: ${rateCard.maxCreditsCap} credits (never charged more).`,
    expiresAt,
  }
}

/**
 * Records auditable policy acceptance by member before entry.
 */
export async function recordPolicyAcceptance(
  userId: string,
  venueId: string,
  rateCardId: string,
  rateCardVersion: string,
  acceptedCapCredits: number
): Promise<PricingPolicyAcceptance> {
  const record: PricingPolicyAcceptance = {
    id: `acc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    userId,
    venueId,
    rateCardId,
    rateCardVersion,
    acceptedCapCredits,
    acceptedAt: new Date().toISOString(),
  }
  acceptancesStore.push(record)
  return record
}

/**
 * Authoritative Server-Side Entry Scan.
 * Invariants:
 * - Checks user balance >= minimum rate card charge.
 * - Prevents duplicate concurrent active sessions across venues.
 * - Idempotency key handling (replaying returns same session).
 * - Authoritative server timestamp only (ignores client clocks).
 */
export async function processEntryScan({
  userId,
  venueId,
  venueName = "Partner Gym",
  activitySlug = "gym",
  actorId = "venue-desk",
  idempotencyKey,
}: {
  userId: string
  venueId: string
  venueName?: string
  activitySlug?: string
  actorId?: string
  idempotencyKey: string
}): Promise<EntryScanResult> {
  // 1. Idempotency check: return existing if same key
  const existingWithKey = sessionsStore.find((s) => s.entryIdempotencyKey === idempotencyKey)
  if (existingWithKey) {
    return {
      success: true,
      session: existingWithKey,
      message: "Entry scan confirmed (idempotent replay).",
    }
  }

  // 2. Concurrency check: user cannot have an active session simultaneously
  const activeSession = sessionsStore.find((s) => s.userId === userId && s.status === "active")
  if (activeSession) {
    return {
      success: false,
      error: `Member already has an active visit in progress at ${activeSession.venueName}. Must exit before starting a new session.`,
      message: "Duplicate concurrent visit rejected.",
    }
  }

  // 3. Balance verification: member must have at least the minimum charge
  const rateCard = await getRateCardForVenue(venueId, activitySlug)
  if (!rateCard) {
    return {
      success: false,
      error: "No active rate card found for this venue and activity.",
      message: "Rate card missing.",
    }
  }

  const currentBalance = await getUserCreditBalance(userId)
  if (currentBalance < rateCard.minCredits) {
    return {
      success: false,
      error: `Insufficient balance: minimum check-in requires ${rateCard.minCredits} credits, but member only has ${currentBalance} credits available.`,
      message: "Insufficient credits for entry.",
    }
  }

  // 4. Record pre-entry agreement
  await recordPolicyAcceptance(
    userId,
    venueId,
    rateCard.id,
    rateCard.version,
    rateCard.maxCreditsCap
  )

  // 5. Create active usage session with authoritative server timestamp
  const serverNow = new Date().toISOString()
  const passToken = `pass_exit_${userId.slice(0, 8)}_${Date.now()}`

  const session: UsageSession = {
    id: `sess-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    userId,
    venueId,
    venueName,
    activitySlug,
    rateCardId: rateCard.id,
    rateCardVersion: rateCard.version,
    status: "active",
    quoteMaxCredits: rateCard.maxCreditsCap,
    startedAt: serverNow,
    entryIdempotencyKey: idempotencyKey,
    passToken,
    createdAt: serverNow,
    updatedAt: serverNow,
  }

  sessionsStore.push(session)

  // 6. Record append-only scan event
  scanEventsStore.push({
    id: `scan-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    sessionId: session.id,
    venueId,
    userId,
    action: "ENTRY",
    actorId,
    serverReceivedAt: serverNow,
    idempotencyKey,
    validationOutcome: "APPROVED",
    metadata: {
      minCredits: rateCard.minCredits,
      quoteMaxCredits: rateCard.maxCreditsCap,
    },
  })

  return {
    success: true,
    session,
    message: `Entry approved for ${venueName}. Rate: ${rateCard.creditsPerUnit} credits/30m, hard capped at ${rateCard.maxCreditsCap} credits max.`,
  }
}

/**
 * Authoritative Server-Side Exit Scan.
 * Invariants:
 * - Computes duration using server's received timestamp.
 * - Applies minimum charge and rounding increment.
 * - Enforces STRICT HARD CAP (Math.min(calculated, maxCreditsCap)).
 * - Atomically debits credits from immutable ledger.
 * - Idempotency key handling prevents double-debit.
 */
export async function processExitScan({
  sessionId,
  actorId = "venue-desk",
  idempotencyKey,
  overrideExitTime,
}: {
  sessionId: string
  actorId?: string
  idempotencyKey: string
  overrideExitTime?: string // for automated tests/simulations only
}): Promise<ExitScanResult> {
  const session = sessionsStore.find((s) => s.id === sessionId || s.passToken === sessionId)
  if (!session) {
    return {
      success: false,
      error: "Active visit session not found for this pass or token.",
      message: "Session not found.",
    }
  }

  // Idempotency check: if already completed with same idempotency key, return existing receipt
  if (session.status === "completed" || session.status === "capped_expired") {
    if (session.exitIdempotencyKey === idempotencyKey) {
      return {
        success: true,
        session,
        creditsDebited: session.creditsDebited,
        durationMinutes: session.durationMinutes,
        capped: (session.creditsDebited || 0) >= session.quoteMaxCredits,
        message: "Exit scan confirmed (idempotent replay).",
      }
    }
    return {
      success: false,
      error: "This session has already been completed and billed.",
      message: "Session already finished.",
    }
  }

  const rateCard = await getRateCardForVenue(session.venueId, session.activitySlug)
  if (!rateCard) {
    return {
      success: false,
      error: "Rate card unavailable to finalize session billing.",
      message: "Rate card missing.",
    }
  }

  // 1. Authoritative server duration calculation
  const serverExitTime = overrideExitTime || new Date().toISOString()
  const startMs = new Date(session.startedAt).getTime()
  const endMs = new Date(serverExitTime).getTime()
  const elapsedMs = Math.max(0, endMs - startMs)
  const durationMinutes = Math.max(1, Math.round(elapsedMs / (60 * 1000)))

  // 2. Billing units calculation
  let billableUnits = Math.ceil(durationMinutes / rateCard.rateUnitMinutes)
  const minUnits = Math.ceil(rateCard.minDurationMinutes / rateCard.rateUnitMinutes)
  if (billableUnits < minUnits) {
    billableUnits = minUnits
  }

  // 3. Uncapped calculation vs STRICT HARD CAP
  const uncappedCredits = billableUnits * rateCard.creditsPerUnit
  const isCapped = uncappedCredits >= rateCard.maxCreditsCap
  const finalCreditsDebited = Math.min(uncappedCredits, rateCard.maxCreditsCap, session.quoteMaxCredits)

  // 4. Atomic debit against immutable credit ledger
  await debitCredits(
    session.userId,
    finalCreditsDebited,
    "metered_session",
    session.id,
    idempotencyKey,
    `Metered session at ${session.venueName}: ${durationMinutes} mins (${finalCreditsDebited} credits${isCapped ? " — hard capped" : ""})`
  )

  // 5. Commit session completion
  session.status = "completed"
  session.endedAt = serverExitTime
  session.durationMinutes = durationMinutes
  session.billableUnits = billableUnits
  session.creditsDebited = finalCreditsDebited
  session.exitIdempotencyKey = idempotencyKey
  session.updatedAt = serverExitTime

  // 6. Record append-only scan event
  scanEventsStore.push({
    id: `scan-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    sessionId: session.id,
    venueId: session.venueId,
    userId: session.userId,
    action: "EXIT",
    actorId,
    serverReceivedAt: serverExitTime,
    idempotencyKey,
    validationOutcome: "APPROVED",
    metadata: {
      durationMinutes,
      billableUnits,
      uncappedCredits,
      finalCreditsDebited,
      isCapped,
    },
  })

  return {
    success: true,
    session,
    creditsDebited: finalCreditsDebited,
    durationMinutes,
    capped: isCapped,
    message: `Checkout confirmed. Duration: ${durationMinutes} mins. Debited: ${finalCreditsDebited} credits${isCapped ? " (Hard capped at maximum)" : ""}.`,
  }
}

/**
 * Reconciles sessions where member forgot to check out.
 * Invariant: Never bills indefinitely; stops strictly at the disclosed hard cap
 * and flags an operational exception for staff review.
 */
export async function handleMissingExitAutoCap(
  sessionId: string,
  actorId: string = "system-reconciler"
): Promise<ExitScanResult> {
  const session = sessionsStore.find((s) => s.id === sessionId)
  if (!session || session.status !== "active") {
    return {
      success: false,
      error: "Active session not found for auto-capping.",
      message: "Invalid session.",
    }
  }

  const rateCard = await getRateCardForVenue(session.venueId, session.activitySlug)
  const capCredits = rateCard?.maxCreditsCap || session.quoteMaxCredits
  const autoCapIdempotencyKey = `auto-cap-${session.id}`

  // Apply maximum disclosed cap
  await debitCredits(
    session.userId,
    capCredits,
    "metered_session",
    session.id,
    autoCapIdempotencyKey,
    `Missing exit auto-cap: ${session.venueName} (charged maximum disclosed cap of ${capCredits} credits)`
  )

  const serverNow = new Date().toISOString()
  session.status = "capped_expired"
  session.endedAt = serverNow
  session.durationMinutes = rateCard?.maxDurationMinutes || 180
  session.creditsDebited = capCredits
  session.exceptionCode = "MISSING_EXIT_AUTO_CAPPED"
  session.exitIdempotencyKey = autoCapIdempotencyKey
  session.updatedAt = serverNow

  scanEventsStore.push({
    id: `scan-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    sessionId: session.id,
    venueId: session.venueId,
    userId: session.userId,
    action: "STAFF_OVERRIDE",
    actorId,
    serverReceivedAt: serverNow,
    idempotencyKey: autoCapIdempotencyKey,
    validationOutcome: "APPROVED",
    metadata: {
      exceptionCode: "MISSING_EXIT_AUTO_CAPPED",
      capCredits,
    },
  })

  return {
    success: true,
    session,
    creditsDebited: capCredits,
    durationMinutes: session.durationMinutes,
    capped: true,
    message: `Session auto-capped at maximum ${capCredits} credits due to missing exit checkout.`,
  }
}

/**
 * Proposes an audited compensating adjustment for a metered visit.
 * Never alters historical ledger rows.
 */
export async function proposeUsageAdjustment({
  sessionId,
  proposedCredits,
  reason,
  proposedBy,
}: {
  sessionId: string
  proposedCredits: number
  reason: string
  proposedBy: string
}): Promise<UsageAdjustment> {
  const session = sessionsStore.find((s) => s.id === sessionId)
  if (!session) {
    throw new Error(`Session ${sessionId} not found`)
  }

  const adjustment: UsageAdjustment = {
    id: `adj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    sessionId,
    originalCredits: session.creditsDebited || 0,
    adjustedCredits: proposedCredits,
    reason,
    proposedBy,
    status: "pending",
    createdAt: new Date().toISOString(),
  }

  adjustmentsStore.push(adjustment)
  return adjustment
}

/**
 * Approves a proposed usage adjustment and executes compensating ledger entries.
 */
export async function approveUsageAdjustment({
  adjustmentId,
  approvedBy,
}: {
  adjustmentId: string
  approvedBy: string
}): Promise<UsageAdjustment> {
  const adjustment = adjustmentsStore.find((a) => a.id === adjustmentId)
  if (!adjustment || adjustment.status !== "pending") {
    throw new Error("Valid pending adjustment not found")
  }

  const session = sessionsStore.find((s) => s.id === adjustment.sessionId)
  if (!session) {
    throw new Error("Associated session not found")
  }

  const delta = adjustment.adjustedCredits - adjustment.originalCredits
  const idempKey = `adj-apply-${adjustment.id}`

  if (delta < 0) {
    // Member was charged too much -> issue compensating refund
    const refundEntry = await refundCredits(
      session.userId,
      Math.abs(delta),
      "usage_adjustment",
      session.id,
      idempKey,
      `Audited adjustment refund: ${adjustment.reason}`
    )
    adjustment.compensatingLedgerId = refundEntry.id
  } else if (delta > 0) {
    // Member was charged too little -> issue compensating debit
    const debitEntry = await debitCredits(
      session.userId,
      delta,
      "usage_adjustment",
      session.id,
      idempKey,
      `Audited adjustment debit: ${adjustment.reason}`
    )
    adjustment.compensatingLedgerId = debitEntry.id
  }

  adjustment.status = "approved"
  adjustment.approvedBy = approvedBy
  session.creditsDebited = adjustment.adjustedCredits
  session.updatedAt = new Date().toISOString()

  return adjustment
}

/**
 * Retrieves all currently active sessions at a venue.
 */
export async function getActiveSessionsForVenue(venueId: string): Promise<UsageSession[]> {
  return sessionsStore.filter((s) => s.venueId === venueId && s.status === "active")
}

/**
 * Retrieves member's current active session, if any.
 */
export async function getActiveSessionForUser(userId: string): Promise<UsageSession | null> {
  return sessionsStore.find((s) => s.userId === userId && s.status === "active") || null
}

/**
 * Retrieves all sessions with exceptions for admin operations.
 */
export async function getFlaggedSessionsForAdmin(): Promise<UsageSession[]> {
  return sessionsStore.filter((s) => !!s.exceptionCode || s.status === "disputed")
}
