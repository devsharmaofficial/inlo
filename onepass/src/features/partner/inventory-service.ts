import type {
  AvailabilitySlot,
  CreateSlotInput,
  InventoryAuditEntry,
} from "@/types/inventory"
import { PILOT_VENUES } from "@/features/catalogue/pilot-seed"

export class AuthorizationError extends Error {
  constructor(message = "Forbidden: Access denied to partner resource") {
    super(message)
    this.name = "AuthorizationError"
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "ValidationError"
  }
}

export class CapacityExceptionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "CapacityExceptionError"
  }
}

// In-memory inventory state (initialized with sample slots for pilot venues)
const slotsStore: AvailabilitySlot[] = [
  {
    id: "slot-hub-1",
    venueId: "ven-hub-arena",
    activityId: "act-badminton",
    startsAt: "2026-10-22T06:00:00Z",
    endsAt: "2026-10-22T07:00:00Z",
    capacity: 4,
    reservedCount: 2,
    creditCost: 16,
    bookingCutoffMinutes: 60,
    status: "available",
    createdAt: "2026-10-20T00:00:00Z",
    updatedAt: "2026-10-20T00:00:00Z",
  },
  {
    id: "slot-hub-2",
    venueId: "ven-hub-arena",
    activityId: "act-badminton",
    startsAt: "2026-10-22T07:00:00Z",
    endsAt: "2026-10-22T08:00:00Z",
    capacity: 4,
    reservedCount: 0,
    creditCost: 16,
    bookingCutoffMinutes: 60,
    status: "available",
    createdAt: "2026-10-20T00:00:00Z",
    updatedAt: "2026-10-20T00:00:00Z",
  },
  {
    id: "slot-aqualife-1",
    venueId: "ven-aqualife",
    activityId: "act-swimming",
    startsAt: "2026-10-22T06:00:00Z",
    endsAt: "2026-10-22T06:50:00Z",
    capacity: 8,
    reservedCount: 2,
    creditCost: 18,
    bookingCutoffMinutes: 120,
    status: "available",
    createdAt: "2026-10-20T00:00:00Z",
    updatedAt: "2026-10-20T00:00:00Z",
  },
]

// In-memory audit log store
const auditLogStore: InventoryAuditEntry[] = []

/**
 * Verifies that the given partner owns the target venue.
 * Throws AuthorizationError if partnerId does not match the venue's partnerId.
 */
export function assertPartnerOwnsVenue(partnerId: string, venueId: string): void {
  const venue = PILOT_VENUES.find((v) => v.id === venueId)
  if (!venue) {
    throw new ValidationError(`Venue with ID "${venueId}" not found`)
  }

  if (venue.partnerId !== partnerId) {
    throw new AuthorizationError(
      `Partner "${partnerId}" is not authorized to access or modify venue "${venueId}"`
    )
  }
}

/**
 * Validates slot input parameters per business constraints:
 * - endsAt must be strictly greater than startsAt
 * - capacity must be positive integer > 0
 * - creditCost must be positive integer > 0
 * - bookingCutoffMinutes must be >= 0
 * - no duplicate slot at the exact same venue, activity, and start time
 */
export function validateSlotInput(input: CreateSlotInput, existingSlotId?: string): void {
  const startMs = new Date(input.startsAt).getTime()
  const endMs = new Date(input.endsAt).getTime()

  if (isNaN(startMs) || isNaN(endMs)) {
    throw new ValidationError("Invalid ISO timestamp format for slot start or end time")
  }

  if (endMs <= startMs) {
    throw new ValidationError("Slot end time must be strictly after slot start time")
  }

  if (!Number.isInteger(input.capacity) || input.capacity <= 0) {
    throw new ValidationError("Slot capacity must be a positive integer greater than 0")
  }

  if (!Number.isInteger(input.creditCost) || input.creditCost <= 0) {
    throw new ValidationError("Credit cost must be a positive integer greater than 0")
  }

  if (
    input.bookingCutoffMinutes !== undefined &&
    (!Number.isInteger(input.bookingCutoffMinutes) || input.bookingCutoffMinutes < 0)
  ) {
    throw new ValidationError("Booking cutoff minutes must be a non-negative integer")
  }

  // Duplicate collision check
  const duplicate = slotsStore.find(
    (s) =>
      s.id !== existingSlotId &&
      s.venueId === input.venueId &&
      s.activityId === input.activityId &&
      s.startsAt === input.startsAt &&
      s.status !== "cancelled"
  )

  if (duplicate) {
    throw new ValidationError(
      "A slot already exists for this venue, activity, and start time"
    )
  }
}

/**
 * Record an immutable audit log entry.
 */
export function recordAuditLog(entry: Omit<InventoryAuditEntry, "id" | "createdAt">): InventoryAuditEntry {
  const logEntry: InventoryAuditEntry = {
    ...entry,
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
  }
  auditLogStore.push(logEntry)
  return logEntry
}

/**
 * Get all slots for a venue owned by the calling partner.
 */
export async function getPartnerVenueSlots(
  partnerId: string,
  venueId: string
): Promise<AvailabilitySlot[]> {
  assertPartnerOwnsVenue(partnerId, venueId)
  return slotsStore.filter((s) => s.venueId === venueId)
}

/**
 * Create a new slot with full partner ownership verification and audit trail.
 */
export async function createPartnerSlot(
  partnerId: string,
  input: CreateSlotInput,
  actor: { actorId: string; actorRole: string }
): Promise<AvailabilitySlot> {
  assertPartnerOwnsVenue(partnerId, input.venueId)
  validateSlotInput(input)

  const newSlot: AvailabilitySlot = {
    id: `slot-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    venueId: input.venueId,
    activityId: input.activityId,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    capacity: input.capacity,
    reservedCount: 0,
    creditCost: input.creditCost,
    bookingCutoffMinutes: input.bookingCutoffMinutes ?? 60,
    status: "available",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  slotsStore.push(newSlot)

  recordAuditLog({
    actorId: actor.actorId,
    actorRole: actor.actorRole,
    partnerId,
    action: "slot_created",
    targetType: "slot",
    targetId: newSlot.id,
    afterState: { ...newSlot },
  })

  return newSlot
}

/**
 * Update slot capacity. If existing bookings exceed new capacity, trigger documented exception.
 */
export async function updatePartnerSlotCapacity(
  partnerId: string,
  slotId: string,
  newCapacity: number,
  reason: string,
  actor: { actorId: string; actorRole: string }
): Promise<AvailabilitySlot> {
  const slot = slotsStore.find((s) => s.id === slotId)
  if (!slot) {
    throw new ValidationError(`Slot with ID "${slotId}" not found`)
  }

  assertPartnerOwnsVenue(partnerId, slot.venueId)

  if (!Number.isInteger(newCapacity) || newCapacity <= 0) {
    throw new ValidationError("New capacity must be a positive integer greater than 0")
  }

  // Acceptance rule: Inventory changes after a booking trigger a documented exception process.
  if (newCapacity < slot.reservedCount) {
    recordAuditLog({
      actorId: actor.actorId,
      actorRole: actor.actorRole,
      partnerId,
      action: "capacity_reduction_conflict_rejected",
      targetType: "slot",
      targetId: slotId,
      beforeState: { capacity: slot.capacity, reservedCount: slot.reservedCount },
      afterState: { requestedCapacity: newCapacity },
      reason: `Exception: Attempted to reduce capacity to ${newCapacity} below existing reserved count of ${slot.reservedCount}. ${reason}`,
    })

    throw new CapacityExceptionError(
      `Cannot reduce capacity to ${newCapacity}: ${slot.reservedCount} bookings are already confirmed for this slot. Requires admin customer support resolution.`
    )
  }

  const before = { ...slot }
  slot.capacity = newCapacity
  slot.status = slot.reservedCount >= newCapacity ? "full" : "available"
  slot.updatedAt = new Date().toISOString()

  recordAuditLog({
    actorId: actor.actorId,
    actorRole: actor.actorRole,
    partnerId,
    action: "capacity_changed",
    targetType: "slot",
    targetId: slotId,
    beforeState: before,
    afterState: { ...slot },
    reason,
  })

  return slot
}

/**
 * Get audit logs (for admin or authorized partner inspection).
 */
export async function getInventoryAuditLogs(targetId?: string): Promise<InventoryAuditEntry[]> {
  if (targetId) {
    return auditLogStore.filter((l) => l.targetId === targetId)
  }
  return [...auditLogStore]
}
