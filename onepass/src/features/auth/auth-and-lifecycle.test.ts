import { describe, it, expect } from "vitest"
import { signInAction, signUpAction, quickDemoLoginAction } from "@/app/actions/auth-actions"
import { createBookingAction, cancelBookingAction } from "@/app/actions/booking-actions"
import { grantCredits } from "@/features/credits/credit-ledger-service"
import { getEffectiveUserId } from "@/features/auth/auth-service"

describe("Auth and Member Booking Actions", () => {
  it("fails sign in gracefully with empty credentials", async () => {
    const res = await signInAction("", "")
    expect(res.success).toBe(false)
    expect(res.error).toContain("both email and password")
  })

  it("fails sign up with short password", async () => {
    const res = await signUpAction("Test User", "test@inlo.tech", "123")
    expect(res.success).toBe(false)
    expect(res.error).toContain("at least 6 characters")
  })

  it("creates a new member account with valid credentials", async () => {
    const uniqueEmail = `athlete_unit_${Date.now()}_${Math.random().toString(36).slice(2)}@inlo.tech`
    const res = await signUpAction("Unit Test Runner", uniqueEmail, "SecurePass123!")
    expect(res.success).toBe(true)
    expect(res.redirectUrl).toBe("/membership")
  })

  it("executes 1-click quick demo login for athlete, partner, and admin", async () => {
    const athleteRes = await quickDemoLoginAction("athlete")
    expect(athleteRes.success).toBe(true)
    expect(athleteRes.redirectUrl).toBe("/explore")

    const partnerRes = await quickDemoLoginAction("partner")
    expect(partnerRes.success).toBe(true)
    expect(partnerRes.redirectUrl).toBe("/partner/dashboard")

    const adminRes = await quickDemoLoginAction("admin")
    expect(adminRes.success).toBe(true)
    expect(adminRes.redirectUrl).toBe("/admin")
  })

  it("rejects booking when member has insufficient credits", async () => {
    // Current user is admin who has 0 credits
    const idempKey = `fail-book-${Date.now()}-${Math.random()}`
    const bookRes = await createBookingAction("slot-hub-1", idempKey)
    expect(bookRes.success).toBe(false)
    expect(bookRes.error).toContain("Insufficient credits")
  })

  it("allows booking once credits are granted and supports cancellation", async () => {
    const userId = await getEffectiveUserId()
    // Grant credits for booking
    await grantCredits(
      userId,
      50,
      "order",
      `test-order-${Date.now()}`,
      `grant-test-${Date.now()}-${Math.random()}`,
      "Unit test credit grant"
    )

    const idempKey = `test-book-${Date.now()}-${Math.random()}`
    const bookRes = await createBookingAction("slot-hub-1", idempKey)
    expect(bookRes.success).toBe(true)
    expect(bookRes.bookingId).toBeDefined()

    if (bookRes.bookingId) {
      const cancelRes = await cancelBookingAction(bookRes.bookingId, "Unit test cancellation")
      expect(cancelRes.success).toBe(true)
      expect(cancelRes.bookingId).toBe(bookRes.bookingId)
    }
  })
})
