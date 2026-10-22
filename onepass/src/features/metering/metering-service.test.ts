import { describe, it, expect, beforeEach } from "vitest"
import {
  generateUsageQuote,
  recordPolicyAcceptance,
  processEntryScan,
  processExitScan,
  handleMissingExitAutoCap,
  proposeUsageAdjustment,
  approveUsageAdjustment,
  getActiveSessionsForVenue,
  getActiveSessionForUser,
  resetMeteringStore,
} from "./metering-service"
import {
  getUserCreditBalance,
  grantCredits,
  reconcileCreditBalance,
} from "@/features/credits/credit-ledger-service"

describe("Hybrid Pricing & Entry/Exit Usage Metering (Architecture §7 & Rules §5A)", () => {
  const TEST_USER = "user-meter-test-1"
  const SECOND_USER = "user-meter-test-2"
  const BROKE_USER = "user-meter-broke"
  const VENUE_ID = "venue-iron-movement"
  const VENUE_NAME = "Iron & Movement Club"

  beforeEach(async () => {
    resetMeteringStore()
    // Grant credits to test users
    await grantCredits(
      TEST_USER,
      50,
      "admin",
      "test-setup",
      `meter-setup-${TEST_USER}-${Date.now()}-${Math.random()}`
    )
    await grantCredits(
      SECOND_USER,
      50,
      "admin",
      "test-setup",
      `meter-setup-${SECOND_USER}-${Date.now()}-${Math.random()}`
    )
  })

  // ── 1. Pre-Entry Quotes & Disclosures ─────────────────────────────────────
  it("generates authoritative pre-entry quote disclosing rate, interval, and strict hard cap", async () => {
    const quote = await generateUsageQuote(TEST_USER, VENUE_ID, "gym", VENUE_NAME)

    expect(quote).toBeDefined()
    expect(quote.venueId).toBe(VENUE_ID)
    expect(quote.rateUnitMinutes).toBe(30)
    expect(quote.creditsPerUnit).toBe(4) // 4 credits per 30 mins
    expect(quote.minCredits).toBe(4)
    expect(quote.maxCreditsCap).toBe(16) // STRICT HARD CAP: 16 credits
    expect(quote.termsSummary).toContain("Maximum hard cap: 16 credits (never charged more)")
    expect(new Date(quote.expiresAt).getTime()).toBeGreaterThan(Date.now())
  })

  it("records auditable policy acceptance prior to venue admittance", async () => {
    const quote = await generateUsageQuote(TEST_USER, VENUE_ID, "gym", VENUE_NAME)
    const acceptance = await recordPolicyAcceptance(
      TEST_USER,
      VENUE_ID,
      quote.rateCardId,
      quote.rateCardVersion,
      quote.maxCreditsCap
    )

    expect(acceptance.id).toMatch(/^acc-/)
    expect(acceptance.userId).toBe(TEST_USER)
    expect(acceptance.acceptedCapCredits).toBe(16)
    expect(acceptance.acceptedAt).toBeDefined()
  })

  // ── 2. Entry Check-In & Invariants ────────────────────────────────────────
  it("admits member with sufficient balance, creates active session, and captures server timestamp", async () => {
    const balanceBefore = await getUserCreditBalance(TEST_USER)
    const idempotencyKey = `entry-idemp-${Date.now()}`

    const entry = await processEntryScan({
      userId: TEST_USER,
      venueId: VENUE_ID,
      venueName: VENUE_NAME,
      activitySlug: "gym",
      actorId: "desk-scanner-1",
      idempotencyKey,
    })

    expect(entry.success).toBe(true)
    expect(entry.session).toBeDefined()
    expect(entry.session?.status).toBe("active")
    expect(entry.session?.quoteMaxCredits).toBe(16)
    expect(entry.session?.passToken).toMatch(/^pass_exit_/)
    expect(entry.session?.startedAt).toBeDefined()

    // No debit occurs at entry: balance remains unchanged until exit
    const balanceAfter = await getUserCreditBalance(TEST_USER)
    expect(balanceAfter).toBe(balanceBefore)

    // Verify active session queries
    const activeForUser = await getActiveSessionForUser(TEST_USER)
    expect(activeForUser?.id).toBe(entry.session?.id)

    const activeForVenue = await getActiveSessionsForVenue(VENUE_ID)
    expect(activeForVenue.some((s) => s.id === entry.session?.id)).toBe(true)
  })

  it("rejects entry scan when member has insufficient credits to meet the minimum charge", async () => {
    const entry = await processEntryScan({
      userId: BROKE_USER, // 0 balance
      venueId: VENUE_ID,
      venueName: VENUE_NAME,
      activitySlug: "gym",
      idempotencyKey: `broke-entry-${Date.now()}`,
    })

    expect(entry.success).toBe(false)
    expect(entry.error).toContain("Insufficient balance")
    expect(entry.session).toBeUndefined()
  })

  it("strictly prevents concurrent active sessions across venues", async () => {
    // 1st check-in at Iron & Movement
    const firstEntry = await processEntryScan({
      userId: TEST_USER,
      venueId: VENUE_ID,
      venueName: VENUE_NAME,
      idempotencyKey: `entry-first-${Date.now()}`,
    })
    expect(firstEntry.success).toBe(true)

    // Attempt concurrent 2nd check-in at another venue
    const concurrentEntry = await processEntryScan({
      userId: TEST_USER,
      venueId: "venue-hub-arena",
      venueName: "The Hub Sports Arena",
      idempotencyKey: `entry-second-${Date.now()}`,
    })

    expect(concurrentEntry.success).toBe(false)
    expect(concurrentEntry.error).toContain("already has an active visit in progress")
  })

  it("handles entry idempotency: repeating scan with identical key returns original session", async () => {
    const idempKey = `same-key-${Date.now()}`
    const first = await processEntryScan({
      userId: TEST_USER,
      venueId: VENUE_ID,
      venueName: VENUE_NAME,
      idempotencyKey: idempKey,
    })
    expect(first.success).toBe(true)

    const replay = await processEntryScan({
      userId: TEST_USER,
      venueId: VENUE_ID,
      venueName: VENUE_NAME,
      idempotencyKey: idempKey,
    })
    expect(replay.success).toBe(true)
    expect(replay.session?.id).toBe(first.session?.id)
  })

  // ── 3. Exit Checkout, Rounding & Debits ────────────────────────────────────
  it("calculates duration rounding, debits immutable ledger, and completes visit", async () => {
    const entry = await processEntryScan({
      userId: TEST_USER,
      venueId: VENUE_ID,
      venueName: VENUE_NAME,
      idempotencyKey: `entry-exit-test-${Date.now()}`,
    })
    expect(entry.success).toBe(true)
    const session = entry.session!

    const balanceBeforeExit = await getUserCreditBalance(TEST_USER)

    // Simulate 45 minute visit (ceiling to 2 x 30m units = 8 credits)
    const startTime = new Date(session.startedAt).getTime()
    const simulatedExitTime = new Date(startTime + 45 * 60 * 1000).toISOString()

    const exit = await processExitScan({
      sessionId: session.id,
      actorId: "exit-scanner-1",
      idempotencyKey: `exit-key-${Date.now()}`,
      overrideExitTime: simulatedExitTime,
    })

    expect(exit.success).toBe(true)
    expect(exit.durationMinutes).toBe(45)
    expect(exit.creditsDebited).toBe(8) // 2 units * 4 credits = 8 credits
    expect(exit.capped).toBe(false)

    // Verify ledger debit
    const balanceAfterExit = await getUserCreditBalance(TEST_USER)
    expect(balanceAfterExit).toBe(balanceBeforeExit - 8)

    // Reconcile ledger
    const recon = await reconcileCreditBalance(TEST_USER)
    expect(recon.isConsistent).toBe(true)
    expect(recon.balance).toBe(balanceAfterExit)
  })

  it("enforces minimum charge for ultra-short visits", async () => {
    const entry = await processEntryScan({
      userId: TEST_USER,
      venueId: VENUE_ID,
      venueName: VENUE_NAME,
      idempotencyKey: `short-visit-${Date.now()}`,
    })
    const session = entry.session!

    // Simulate 5 minute visit (below 30 min minimum)
    const startTime = new Date(session.startedAt).getTime()
    const simulatedExitTime = new Date(startTime + 5 * 60 * 1000).toISOString()

    const exit = await processExitScan({
      sessionId: session.id,
      idempotencyKey: `exit-short-${Date.now()}`,
      overrideExitTime: simulatedExitTime,
    })

    expect(exit.success).toBe(true)
    expect(exit.creditsDebited).toBe(4) // Minimum 1 unit = 4 credits
    expect(exit.capped).toBe(false)
  })

  // ── 4. Strict Hard Cap Enforcement ────────────────────────────────────────
  it("strictly enforces hard cap: sessions exceeding cap duration are clamped to maximum disclosure", async () => {
    const entry = await processEntryScan({
      userId: TEST_USER,
      venueId: VENUE_ID,
      venueName: VENUE_NAME,
      idempotencyKey: `long-stay-${Date.now()}`,
    })
    const session = entry.session!
    const balanceBeforeExit = await getUserCreditBalance(TEST_USER)

    // Simulate 5 hour visit (300 mins = 10 units = 40 credits uncapped)
    const startTime = new Date(session.startedAt).getTime()
    const simulatedExitTime = new Date(startTime + 300 * 60 * 1000).toISOString()

    const exit = await processExitScan({
      sessionId: session.id,
      idempotencyKey: `exit-long-${Date.now()}`,
      overrideExitTime: simulatedExitTime,
    })

    expect(exit.success).toBe(true)
    expect(exit.durationMinutes).toBe(300)
    // STRICT HARD CAP: Must not charge 40 credits, strictly 16 credits
    expect(exit.creditsDebited).toBe(16)
    expect(exit.capped).toBe(true)

    const balanceAfterExit = await getUserCreditBalance(TEST_USER)
    expect(balanceAfterExit).toBe(balanceBeforeExit - 16)
  })

  it("handles exit idempotency: repeating exit scan with identical key does not double-debit", async () => {
    const entry = await processEntryScan({
      userId: TEST_USER,
      venueId: VENUE_ID,
      venueName: VENUE_NAME,
      idempotencyKey: `idemp-exit-entry-${Date.now()}`,
    })
    const session = entry.session!
    const balanceBeforeExit = await getUserCreditBalance(TEST_USER)

    const exitKey = `idemp-exit-key-${Date.now()}`
    const exit1 = await processExitScan({
      sessionId: session.id,
      idempotencyKey: exitKey,
    })
    expect(exit1.success).toBe(true)
    const debited = exit1.creditsDebited!

    const balanceAfterFirst = await getUserCreditBalance(TEST_USER)
    expect(balanceAfterFirst).toBe(balanceBeforeExit - debited)

    // Replay exact same exit request
    const exit2 = await processExitScan({
      sessionId: session.id,
      idempotencyKey: exitKey,
    })
    expect(exit2.success).toBe(true)
    expect(exit2.creditsDebited).toBe(debited)

    // Balance MUST NOT be debited a second time
    const balanceAfterSecond = await getUserCreditBalance(TEST_USER)
    expect(balanceAfterSecond).toBe(balanceAfterFirst)
  })

  // ── 5. Missing Exit Auto-Capping & Operational Exception ───────────────────
  it("auto-caps missing exit at maximum disclosed cap and flags operational exception", async () => {
    const entry = await processEntryScan({
      userId: TEST_USER,
      venueId: VENUE_ID,
      venueName: VENUE_NAME,
      idempotencyKey: `missing-exit-entry-${Date.now()}`,
    })
    const session = entry.session!
    const balanceBefore = await getUserCreditBalance(TEST_USER)

    const res = await handleMissingExitAutoCap(session.id, "system-nightly-reconciler")

    expect(res.success).toBe(true)
    expect(res.capped).toBe(true)
    expect(res.creditsDebited).toBe(16) // Max disclosed cap
    expect(res.session?.status).toBe("capped_expired")
    expect(res.session?.exceptionCode).toBe("MISSING_EXIT_AUTO_CAPPED")

    const balanceAfter = await getUserCreditBalance(TEST_USER)
    expect(balanceAfter).toBe(balanceBefore - 16)
  })

  // ── 6. Audited Usage Adjustments & Compensating Entries ────────────────────
  it("processes audited compensating adjustment for disputed visits via ledger entries", async () => {
    // 1. Complete a session billed at 16 credits
    const entry = await processEntryScan({
      userId: TEST_USER,
      venueId: VENUE_ID,
      venueName: VENUE_NAME,
      idempotencyKey: `adj-entry-${Date.now()}`,
    })
    const session = entry.session!

    const startTime = new Date(session.startedAt).getTime()
    await processExitScan({
      sessionId: session.id,
      idempotencyKey: `adj-exit-${Date.now()}`,
      overrideExitTime: new Date(startTime + 180 * 60 * 1000).toISOString(),
    })

    const balanceBeforeAdj = await getUserCreditBalance(TEST_USER)

    // 2. Member disputes: emergency power cut shortened workout to 30 mins (should be 4 credits)
    const proposed = await proposeUsageAdjustment({
      sessionId: session.id,
      proposedCredits: 4,
      reason: "Power outage at gym after 30 mins; member left early",
      proposedBy: "support-agent-42",
    })
    expect(proposed.status).toBe("pending")

    // 3. Manager approves adjustment -> issues compensating refund of 12 credits (16 - 4)
    const approved = await approveUsageAdjustment({
      adjustmentId: proposed.id,
      approvedBy: "manager-lead",
    })

    expect(approved.status).toBe("approved")
    expect(approved.compensatingLedgerId).toBeDefined()

    // 4. Verify wallet balance credited by +12
    const balanceAfterAdj = await getUserCreditBalance(TEST_USER)
    expect(balanceAfterAdj).toBe(balanceBeforeAdj + 12)

    // 5. Verify immutable ledger reconciliation
    const recon = await reconcileCreditBalance(TEST_USER)
    expect(recon.isConsistent).toBe(true)
    expect(recon.balance).toBe(balanceAfterAdj)
  })
})
