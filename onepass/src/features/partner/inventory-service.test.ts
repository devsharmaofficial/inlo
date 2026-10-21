import { describe, it, expect } from "vitest"
import {
  getPartnerVenueSlots,
  createPartnerSlot,
  updatePartnerSlotCapacity,
  getInventoryAuditLogs,
  AuthorizationError,
  ValidationError,
  CapacityExceptionError,
} from "./inventory-service"

describe("inventory-service (Phase 3 acceptance)", () => {
  const PARTNER_A = "part-01" // Owns ven-hub-arena
  const PARTNER_B = "part-02" // Owns ven-aqualife

  const ACTOR_STAFF = { actorId: "user-staff-1", actorRole: "partner_staff" }

  describe("Negative multi-tenant isolation tests", () => {
    it("strictly prevents Partner B from reading Partner A's venue slots", async () => {
      // ven-hub-arena belongs to part-01
      await expect(
        getPartnerVenueSlots(PARTNER_B, "ven-hub-arena")
      ).rejects.toThrow(AuthorizationError)
    })

    it("strictly prevents Partner B from creating slots in Partner A's venue", async () => {
      await expect(
        createPartnerSlot(
          PARTNER_B,
          {
            venueId: "ven-hub-arena",
            activityId: "act-badminton",
            startsAt: "2026-10-23T10:00:00Z",
            endsAt: "2026-10-23T11:00:00Z",
            capacity: 4,
            creditCost: 16,
          },
          ACTOR_STAFF
        )
      ).rejects.toThrow(AuthorizationError)
    })

    it("strictly prevents Partner B from modifying Partner A's slot capacity", async () => {
      // slot-hub-1 belongs to ven-hub-arena (part-01)
      await expect(
        updatePartnerSlotCapacity(
          PARTNER_B,
          "slot-hub-1",
          6,
          "Attempted unauthorized change",
          ACTOR_STAFF
        )
      ).rejects.toThrow(AuthorizationError)
    })
  })

  describe("Slot validation constraints", () => {
    it("rejects slot when end time is before or equal to start time", async () => {
      await expect(
        createPartnerSlot(
          PARTNER_A,
          {
            venueId: "ven-hub-arena",
            activityId: "act-badminton",
            startsAt: "2026-10-23T11:00:00Z",
            endsAt: "2026-10-23T10:00:00Z", // end before start!
            capacity: 4,
            creditCost: 16,
          },
          ACTOR_STAFF
        )
      ).rejects.toThrow(ValidationError)
    })

    it("rejects slot with zero or negative capacity", async () => {
      await expect(
        createPartnerSlot(
          PARTNER_A,
          {
            venueId: "ven-hub-arena",
            activityId: "act-badminton",
            startsAt: "2026-10-23T14:00:00Z",
            endsAt: "2026-10-23T15:00:00Z",
            capacity: 0,
            creditCost: 16,
          },
          ACTOR_STAFF
        )
      ).rejects.toThrow(ValidationError)
    })

    it("rejects slot with invalid booking cutoff minutes", async () => {
      await expect(
        createPartnerSlot(
          PARTNER_A,
          {
            venueId: "ven-hub-arena",
            activityId: "act-badminton",
            startsAt: "2026-10-23T14:00:00Z",
            endsAt: "2026-10-23T15:00:00Z",
            capacity: 4,
            creditCost: 16,
            bookingCutoffMinutes: -10,
          },
          ACTOR_STAFF
        )
      ).rejects.toThrow(ValidationError)
    })

    it("rejects duplicate slot at identical venue, activity, and start time", async () => {
      // Create first slot
      await createPartnerSlot(
        PARTNER_A,
        {
          venueId: "ven-hub-arena",
          activityId: "act-badminton",
          startsAt: "2026-10-24T09:00:00Z",
          endsAt: "2026-10-24T10:00:00Z",
          capacity: 4,
          creditCost: 16,
        },
        ACTOR_STAFF
      )

      // Duplicate attempt
      await expect(
        createPartnerSlot(
          PARTNER_A,
          {
            venueId: "ven-hub-arena",
            activityId: "act-badminton",
            startsAt: "2026-10-24T09:00:00Z",
            endsAt: "2026-10-24T10:00:00Z",
            capacity: 4,
            creditCost: 16,
          },
          ACTOR_STAFF
        )
      ).rejects.toThrow("A slot already exists")
    })
  })

  describe("Inventory changes after bookings exception handling", () => {
    it("triggers CapacityExceptionError when reducing capacity below existing confirmed bookings", async () => {
      // slot-hub-1 has reservedCount = 2
      await expect(
        updatePartnerSlotCapacity(
          PARTNER_A,
          "slot-hub-1",
          1, // below reservedCount 2
          "Emergency reduction",
          ACTOR_STAFF
        )
      ).rejects.toThrow(CapacityExceptionError)

      // Verify that this conflict attempt was recorded in the audit trail
      const auditLogs = await getInventoryAuditLogs("slot-hub-1")
      const conflictLog = auditLogs.find(
        (l) => l.action === "capacity_reduction_conflict_rejected"
      )
      expect(conflictLog).toBeDefined()
      expect(conflictLog?.reason).toContain("Exception")
    })

    it("allows valid capacity increase and records audit log", async () => {
      const updated = await updatePartnerSlotCapacity(
        PARTNER_A,
        "slot-hub-2",
        8,
        "Opened second court",
        ACTOR_STAFF
      )
      expect(updated.capacity).toBe(8)

      const auditLogs = await getInventoryAuditLogs("slot-hub-2")
      const changeLog = auditLogs.find((l) => l.action === "capacity_changed")
      expect(changeLog).toBeDefined()
      expect(changeLog?.actorId).toBe(ACTOR_STAFF.actorId)
      expect(changeLog?.reason).toBe("Opened second court")
    })
  })
})
