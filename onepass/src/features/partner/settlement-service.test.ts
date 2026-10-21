import { describe, it, expect } from "vitest"
import { calculateVenueSettlement } from "./settlement-service"
import { AuthorizationError, ValidationError } from "./inventory-service"

describe("Partner Settlement Service (Phase 6 operational controls)", () => {
  it("calculates accurate reconciled settlement statement for authorized venue", async () => {
    const statement = await calculateVenueSettlement("part-01", "ven-hub-arena", "2026-10")

    expect(statement).toBeDefined()
    expect(statement.partnerId).toBe("part-01")
    expect(statement.venueId).toBe("ven-hub-arena")
    expect(statement.venueName).toBe("The Hub Sports Arena")
    expect(statement.billingPeriod).toBe("2026-10")
    expect(statement.completedVisitsCount).toBe(14)
    expect(statement.totalCreditsRedeemed).toBe(216)
    expect(statement.payoutRatePerCreditPaise).toBe(7000) // ₹70/credit

    // Gross = 216 * 7000 = 1512000 paise (₹15,120)
    expect(statement.grossPayoutPaise).toBe(1512000)
    expect(statement.platformCommissionPaise).toBe(0) // 0% pilot incentive
    expect(statement.netPayoutPaise).toBe(1512000)

    // Invariant: Live automated payouts remain disabled until approved
    expect(statement.status).toBe("reconciled")
    expect(statement.payoutStatus).toBe("held_for_approval")
  })

  it("strictly enforces partner isolation: unauthorized partner cannot access venue settlement", async () => {
    // part-02 does not own ven-hub-arena
    await expect(
      calculateVenueSettlement("part-02", "ven-hub-arena", "2026-10")
    ).rejects.toThrow(AuthorizationError)
  })

  it("fails cleanly when venue ID does not exist", async () => {
    // Even if partner check passes or venue doesn't exist
    await expect(
      calculateVenueSettlement("part-01", "ven-non-existent", "2026-10")
    ).rejects.toThrow(ValidationError)
  })
})
