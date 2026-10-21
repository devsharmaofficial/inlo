/**
 * Partner Inventory Domain Types.
 * Source of truth: architecture.md §4 and 002_partner_inventory.sql.
 */

export type PartnerRole = "partner_admin" | "partner_staff"

export interface PartnerMember {
  id: string
  userId: string
  partnerId: string
  role: PartnerRole
  createdAt: string
}

export type SlotStatus = "available" | "full" | "cancelled" | "completed"

export interface AvailabilitySlot {
  id: string
  venueId: string
  activityId: string
  startsAt: string // ISO UTC
  endsAt: string // ISO UTC
  capacity: number
  reservedCount: number
  creditCost: number
  bookingCutoffMinutes: number
  status: SlotStatus
  createdAt: string
  updatedAt: string
}

export interface CreateSlotInput {
  venueId: string
  activityId: string
  startsAt: string
  endsAt: string
  capacity: number
  creditCost: number
  bookingCutoffMinutes?: number
}

export interface InventoryAuditEntry {
  id: string
  actorId: string
  actorRole: string
  partnerId?: string
  action: string
  targetType: "slot" | "venue_hours" | "blackout"
  targetId: string
  beforeState?: Record<string, unknown>
  afterState?: Record<string, unknown>
  reason?: string
  createdAt: string
}
