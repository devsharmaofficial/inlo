import { describe, it, expect, beforeEach } from "vitest"
import {
  createBooking,
  cancelBooking,
  getBookingById,
  getMemberBookings,
  validateCheckinPass,
  resetBookingEngineState,
  SlotUnavailableError,
  CancellationCutoffExceededError,
  BookingNotFoundError,
} from "./booking-engine"
import {
  getUserCreditBalance,
  reconcileCreditBalance,
  grantCredits,
  InsufficientCreditsError,
} from "@/features/credits/credit-ledger-service"

describe("Booking Engine & Credit Ledger (Phase 4 acceptance)", () => {
  const TEST_USER = "user-member-1"
  const OTHER_USER = "user-member-2"

  beforeEach(async () => {
    resetBookingEngineState()
    // Grant baseline credits for testing
    await grantCredits(TEST_USER, 100, "admin", "test-setup", `setup-${Date.now()}-${Math.random()}`)
  })

  it("creates a confirmed booking with atomic capacity increment, credit debit, and snapshot capture", async () => {
    const initialBalance = await getUserCreditBalance(TEST_USER)
    expect(initialBalance).toBeGreaterThanOrEqual(16)

    const booking = await createBooking({
      userId: TEST_USER,
      slotId: "slot-hub-1",
      idempotencyKey: `book-test-1-${Date.now()}`,
    })

    expect(booking).toBeDefined()
    expect(booking.status).toBe("confirmed")
    expect(booking.creditsDebited).toBe(16)
    expect(booking.venueNameSnapshot).toBe("The Hub Sports Arena")
    expect(booking.venueLocalitySnapshot).toBe("Domlur")
    expect(booking.checkinToken).toMatch(/^pass_[a-f0-9]{32}$/)
    expect(booking.policySnapshot.cutoffHours).toBe(2)

    // Verify atomic credit debit
    const newBalance = await getUserCreditBalance(TEST_USER)
    expect(newBalance).toBe(initialBalance - 16)

    // Verify reconciliation invariant: cached balance === sum(deltas)
    const recon = await reconcileCreditBalance(TEST_USER)
    expect(recon.isConsistent).toBe(true)
    expect(recon.balance).toBe(newBalance)
  })

  it("handles idempotency: repeating booking with same key returns original without double debiting", async () => {
    const idempotencyKey = `idemp-${Date.now()}`
    const balanceBefore = await getUserCreditBalance(TEST_USER)

    const firstBooking = await createBooking({
      userId: TEST_USER,
      slotId: "slot-hub-1",
      idempotencyKey,
    })

    const balanceAfterFirst = await getUserCreditBalance(TEST_USER)
    expect(balanceAfterFirst).toBe(balanceBefore - 16)

    // Repeat identical request
    const secondBooking = await createBooking({
      userId: TEST_USER,
      slotId: "slot-hub-1",
      idempotencyKey,
    })

    expect(secondBooking.id).toBe(firstBooking.id)
    expect(secondBooking.confirmedAt).toBe(firstBooking.confirmedAt)

    // Verify NO additional debit occurred
    const balanceAfterSecond = await getUserCreditBalance(TEST_USER)
    expect(balanceAfterSecond).toBe(balanceAfterFirst)
  })

  it("strictly prevents overselling: attempts beyond slot capacity fail cleanly", async () => {
    // slot-hub-2 has capacity of 2
    const key1 = `key-over-1-${Date.now()}`
    const key2 = `key-over-2-${Date.now()}`
    const key3 = `key-over-3-${Date.now()}`

    await createBooking({ userId: TEST_USER, slotId: "slot-hub-2", idempotencyKey: key1 })
    await createBooking({ userId: TEST_USER, slotId: "slot-hub-2", idempotencyKey: key2 })

    // Third attempt on 2-capacity slot must fail
    await expect(
      createBooking({ userId: TEST_USER, slotId: "slot-hub-2", idempotencyKey: key3 })
    ).rejects.toThrow(SlotUnavailableError)
  })

  it("fails cleanly when user has insufficient credits without side effects", async () => {
    const poorUser = "user-poor-1" // 0 credits
    const balanceBefore = await getUserCreditBalance(poorUser)
    expect(balanceBefore).toBe(0)

    await expect(
      createBooking({
        userId: poorUser,
        slotId: "slot-hub-1",
        idempotencyKey: `poor-book-${Date.now()}`,
      })
    ).rejects.toThrow(InsufficientCreditsError)

    // Verify zero side effect on balance
    expect(await getUserCreditBalance(poorUser)).toBe(0)
  })

  it("cancels booking inside policy window and issues atomic credit refund", async () => {
    const booking = await createBooking({
      userId: TEST_USER,
      slotId: "slot-hub-1",
      idempotencyKey: `cancel-test-${Date.now()}`,
    })

    const balanceBeforeCancel = await getUserCreditBalance(TEST_USER)

    const cancelledBooking = await cancelBooking({
      userId: TEST_USER,
      bookingId: booking.id,
      actorId: TEST_USER,
      reason: "Scheduling conflict",
    })

    expect(cancelledBooking.status).toBe("cancelled")
    expect(cancelledBooking.cancellationReason).toBe("Scheduling conflict")

    // Verify credits refunded
    const balanceAfterCancel = await getUserCreditBalance(TEST_USER)
    expect(balanceAfterCancel).toBe(balanceBeforeCancel + 16)

    // Verify reconciliation holds
    const recon = await reconcileCreditBalance(TEST_USER)
    expect(recon.isConsistent).toBe(true)
  })

  it("strictly enforces multi-tenant ownership: User A cannot view or cancel User B's booking", async () => {
    const booking = await createBooking({
      userId: TEST_USER,
      slotId: "slot-hub-1",
      idempotencyKey: `user-a-book-${Date.now()}`,
    })

    // Other user attempts to fetch booking by ID
    const found = await getBookingById(OTHER_USER, booking.id)
    expect(found).toBeNull()

    // Other user attempts to cancel
    await expect(
      cancelBooking({
        userId: OTHER_USER,
        bookingId: booking.id,
        actorId: OTHER_USER,
      })
    ).rejects.toThrow(BookingNotFoundError)
  })

  it("validates check-in pass and rejects reused or expired tokens", async () => {
    const booking = await createBooking({
      userId: TEST_USER,
      slotId: "slot-hub-1",
      idempotencyKey: `checkin-test-${Date.now()}`,
    })

    // First validation by staff succeeds
    const checkinResult = await validateCheckinPass(booking.checkinToken, "staff-01")
    expect(checkinResult.success).toBe(true)
    expect(checkinResult.booking?.status).toBe("completed")
    expect(checkinResult.booking?.checkinStatus).toBe("checked_in")

    // Second validation attempt is strictly rejected
    const secondAttempt = await validateCheckinPass(booking.checkinToken, "staff-01")
    expect(secondAttempt.success).toBe(false)
    expect(secondAttempt.message).toContain("already used")
  })

  it("handles case-insensitive and whitespace-padded QR tokens gracefully", async () => {
    const booking = await createBooking({
      userId: TEST_USER,
      slotId: "slot-hub-1",
      idempotencyKey: `padded-qr-test-${Date.now()}`,
    })

    // QR scanner or typed token with uppercase & whitespace padding
    const rawScannedInput = `  ${booking.checkinToken.toUpperCase()}  `
    const result = await validateCheckinPass(rawScannedInput, "staff-01")
    expect(result.success).toBe(true)
    expect(result.booking?.id).toBe(booking.id)
    expect(result.booking?.checkinStatus).toBe("checked_in")
  })

  it("filters member bookings by status (upcoming vs cancelled)", async () => {
    const booking1 = await createBooking({
      userId: TEST_USER,
      slotId: "slot-hub-1",
      idempotencyKey: `filter-book-1-${Date.now()}`,
    })

    const booking2 = await createBooking({
      userId: TEST_USER,
      slotId: "slot-hub-2",
      idempotencyKey: `filter-book-2-${Date.now()}`,
    })

    // Cancel booking2
    await cancelBooking({
      userId: TEST_USER,
      bookingId: booking2.id,
      actorId: TEST_USER,
    })

    const upcoming = await getMemberBookings(TEST_USER, "upcoming")
    expect(upcoming.some((b) => b.id === booking1.id)).toBe(true)
    expect(upcoming.some((b) => b.id === booking2.id)).toBe(false)

    const cancelled = await getMemberBookings(TEST_USER, "cancelled")
    expect(cancelled.some((b) => b.id === booking2.id)).toBe(true)
  })

  it("rejects cancellation when cutoff window has passed", async () => {
    const booking = await createBooking({
      userId: TEST_USER,
      slotId: "slot-hub-1",
      idempotencyKey: `cutoff-test-${Date.now()}`,
    })

    // Artificially simulate session starting in 30 minutes (policy requires 2 hours)
    booking.slotStartsAtSnapshot = new Date(Date.now() + 30 * 60 * 1000).toISOString()

    await expect(
      cancelBooking({
        userId: TEST_USER,
        bookingId: booking.id,
        actorId: TEST_USER,
      })
    ).rejects.toThrow(CancellationCutoffExceededError)
  })
})
