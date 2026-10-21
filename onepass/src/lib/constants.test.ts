import { describe, it, expect } from "vitest"
import { BOOKING_STATUS, PAYMENT_STATUS, VENUE_STATUS, ROLES } from "@/lib/constants"

/**
 * Constants integrity tests.
 * These ensure the status enums remain consistent — they mirror
 * the DB enums defined in architecture.md §8.
 * If you change a value here, you must change the DB migration too.
 */
describe("BOOKING_STATUS", () => {
  it("has all required states from architecture.md §8", () => {
    const required = ["CONFIRMED", "CHECKED_IN", "COMPLETED", "CANCELLED", "NO_SHOW", "VENUE_CANCELLED", "DISPUTED"]
    required.forEach((status) => {
      expect(Object.values(BOOKING_STATUS)).toContain(status)
    })
  })

  it("all values are uppercase strings", () => {
    Object.values(BOOKING_STATUS).forEach((v) => {
      expect(typeof v).toBe("string")
      expect(v).toBe(v.toUpperCase())
    })
  })
})

describe("PAYMENT_STATUS", () => {
  it("has all required states from architecture.md §8", () => {
    const required = ["CREATED", "PENDING", "CAPTURED", "FAILED", "REFUNDED"]
    required.forEach((status) => {
      expect(Object.values(PAYMENT_STATUS)).toContain(status)
    })
  })
})

describe("ROLES", () => {
  it("has all required role types", () => {
    expect(ROLES.member).toBe("member")
    expect(ROLES.partnerStaff).toBe("partner_staff")
    expect(ROLES.opsAdmin).toBe("ops_admin")
    expect(ROLES.platformAdmin).toBe("platform_admin")
  })

  it("admin role values do not match member role", () => {
    // Critical: admin privileges must not be achievable by member role values
    expect(ROLES.member).not.toBe(ROLES.opsAdmin)
    expect(ROLES.member).not.toBe(ROLES.platformAdmin)
    expect(ROLES.member).not.toBe(ROLES.partnerAdmin)
  })
})

describe("VENUE_STATUS", () => {
  it("approved is the only status that allows public booking", () => {
    // This test documents the invariant: only VENUE_STATUS.approved
    // should appear in public-facing catalogue queries.
    expect(VENUE_STATUS.approved).toBe("approved")
    expect(VENUE_STATUS.suspended).not.toBe("approved")
    expect(VENUE_STATUS.draft).not.toBe("approved")
    expect(VENUE_STATUS.pendingReview).not.toBe("approved")
  })
})
