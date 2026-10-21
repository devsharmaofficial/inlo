import { describe, it, expect, beforeEach } from "vitest"
import {
  getSystemControls,
  setBookingsPaused,
  setMaintenanceNotice,
  getPilotCohort,
  _resetSystemControlsForTest,
} from "./system-controls"
import { getPilotOperationalMetrics } from "./pilot-metrics-service"
import {
  createBooking,
  cancelBooking,
  resetBookingEngineState,
  BookingsPausedError,
} from "@/features/bookings/booking-engine"
import { grantCredits, getUserCreditBalance } from "@/features/credits/credit-ledger-service"

describe("Phase 8 System Controls & Operational Metrics", () => {
  beforeEach(() => {
    _resetSystemControlsForTest()
    resetBookingEngineState()
  })

  it("initializes with active bookings and no pause", () => {
    const controls = getSystemControls()
    expect(controls.isBookingsPaused).toBe(false)
    expect(controls.pauseReason).toBeNull()
    expect(controls.pausedAt).toBeNull()
  })

  it("activates emergency kill-switch and blocks new bookings", async () => {
    const TEST_USER = "user-test-pause"
    await grantCredits(TEST_USER, 50, "admin", "test-setup", `setup-pause-${Date.now()}-${Math.random()}`)

    setBookingsPaused(true, "Monsoon storm warning in Indiranagar", "adm-lead")
    const controls = getSystemControls()
    expect(controls.isBookingsPaused).toBe(true)
    expect(controls.pauseReason).toBe("Monsoon storm warning in Indiranagar")
    expect(controls.pausedBy).toBe("adm-lead")
    expect(controls.pausedAt).toBeDefined()

    // Attempting to book while paused throws BookingsPausedError
    await expect(
      createBooking({
        userId: TEST_USER,
        slotId: "slot-hub-1",
        idempotencyKey: `pause-test-${Date.now()}-${Math.random()}`,
      })
    ).rejects.toThrow(BookingsPausedError)
  })

  it("allows cancellations and refunds even when new bookings are paused", async () => {
    const TEST_USER = "user-test-cancel-during-pause"
    await grantCredits(TEST_USER, 50, "admin", "test-setup", `setup-cancel-${Date.now()}-${Math.random()}`)

    // Create booking while active
    const booking = await createBooking({
      userId: TEST_USER,
      slotId: "slot-hub-1",
      idempotencyKey: `book-pre-pause-${Date.now()}-${Math.random()}`,
    })
    expect(booking.status).toBe("confirmed")

    // Emergency pause activated
    setBookingsPaused(true, "Emergency track repair", "adm-lead")

    // Cancellation still succeeds and refunds credits
    const balanceBeforeCancel = await getUserCreditBalance(TEST_USER)
    const cancelled = await cancelBooking({
      bookingId: booking.id,
      userId: TEST_USER,
      actorId: TEST_USER,
      reason: "User cancelled during weather warning",
    })

    expect(cancelled.status).toBe("cancelled")
    const balanceAfterCancel = await getUserCreditBalance(TEST_USER)
    expect(balanceAfterCancel).toBe(balanceBeforeCancel + booking.creditsDebited)
  })

  it("sets and clears maintenance notice banner", () => {
    setMaintenanceNotice("Scheduled DB optimization at midnight.")
    expect(getSystemControls().maintenanceNotice).toBe("Scheduled DB optimization at midnight.")

    setMaintenanceNotice(null)
    expect(getSystemControls().maintenanceNotice).toBeNull()
  })

  it("provides full 20-member beta cohort registry", () => {
    const cohort = getPilotCohort()
    expect(cohort.length).toBe(20)

    // Verify all cohort members have required pilot attributes
    cohort.forEach((m) => {
      expect(m.id).toMatch(/^usr-pilot-\d{3}$/)
      expect(m.name).toBeTruthy()
      expect(m.phone).toMatch(/^\+91/)
      expect(m.creditsAllocated).toBeGreaterThan(0)
      expect(["active", "invited", "churned"]).toContain(m.status)
    })
  })

  it("calculates pilot operational metrics with positive contribution and 0 ledger drift", () => {
    const { kpis, categories, weeklyTrends } = getPilotOperationalMetrics()

    // Cohort invariants
    expect(kpis.cohortTargetMembers).toBe(20)
    expect(kpis.cohortActiveMembers).toBe(18)
    expect(kpis.repeatBookingRatePct).toBeGreaterThan(50)
    expect(kpis.slotAvailabilityAccuracyPct).toBeGreaterThan(95)
    expect(kpis.ledgerDriftRupees).toBe(0)

    // Unit economics
    expect(kpis.grossBookingValueINR).toBeGreaterThan(0)
    expect(kpis.partnerPayoutsINR).toBeGreaterThan(0)
    expect(kpis.platformNetContributionINR).toBeGreaterThan(0)
    expect(kpis.netMarginPct).toBeGreaterThan(20)

    // Category breakdown
    expect(categories.length).toBe(4)
    expect(weeklyTrends.length).toBeGreaterThan(0)
  })
})
