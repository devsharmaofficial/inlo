import crypto from "crypto"
import type {
  Booking,
  BookingEvent,
  CancelBookingInput,
  CancellationPolicySnapshot,
  CreateBookingInput,
} from "@/types/booking"
import { PILOT_VENUES } from "@/features/catalogue/pilot-seed"
import {
  debitCredits,
  refundCredits,
} from "@/features/credits/credit-ledger-service"
import { ValidationError } from "@/features/partner/inventory-service"
import { getSystemControls } from "@/features/admin/system-controls"

export class BookingsPausedError extends Error {
  constructor(message = "New bookings are temporarily paused by operations for maintenance or venue review.") {
    super(message)
    this.name = "BookingsPausedError"
  }
}

export class SlotUnavailableError extends Error {
  constructor(message = "This slot is no longer available or is fully booked.") {
    super(message)
    this.name = "SlotUnavailableError"
  }
}

export class CancellationCutoffExceededError extends Error {
  constructor(message = "Cancellation window has passed. Sessions cannot be cancelled within the cut-off period.") {
    super(message)
    this.name = "CancellationCutoffExceededError"
  }
}

export class BookingNotFoundError extends Error {
  constructor(message = "Booking not found or access denied.") {
    super(message)
    this.name = "BookingNotFoundError"
  }
}

// In-memory slot state for booking engine (synchronized with pilot inventory)
interface MutableSlot {
  id: string
  venueId: string
  activityId: string
  startsAt: string
  endsAt: string
  capacity: number
  reservedCount: number
  creditCost: number
  bookingCutoffMinutes: number
  status: "available" | "full" | "cancelled" | "completed"
}

const getFutureTime = (hoursAhead: number) =>
  new Date(Date.now() + hoursAhead * 60 * 60 * 1000).toISOString()

const mutableSlots: Map<string, MutableSlot> = new Map([
  [
    "slot-hub-1",
    {
      id: "slot-hub-1",
      venueId: "ven-hub-arena",
      activityId: "act-badminton",
      startsAt: getFutureTime(24),
      endsAt: getFutureTime(25),
      capacity: 4,
      reservedCount: 0,
      creditCost: 16,
      bookingCutoffMinutes: 60,
      status: "available",
    },
  ],
  [
    "slot-hub-2",
    {
      id: "slot-hub-2",
      venueId: "ven-hub-arena",
      activityId: "act-badminton",
      startsAt: getFutureTime(26),
      endsAt: getFutureTime(27),
      capacity: 2, // limited capacity for concurrency testing
      reservedCount: 0,
      creditCost: 16,
      bookingCutoffMinutes: 60,
      status: "available",
    },
  ],
  [
    "slot-aqualife-1",
    {
      id: "slot-aqualife-1",
      venueId: "ven-aqualife",
      activityId: "act-swimming",
      startsAt: getFutureTime(28),
      endsAt: getFutureTime(29),
      capacity: 8,
      reservedCount: 0,
      creditCost: 18,
      bookingCutoffMinutes: 120,
      status: "available",
    },
  ],
])

const bookingsStore: Map<string, Booking> = new Map([
  [
    "bk-pilot-001",
    {
      id: "bk-pilot-001",
      userId: "user-member-1",
      slotId: "slot-hub-1",
      venueId: "ven-hub-arena",
      activityId: "act-badminton",
      status: "confirmed",
      creditsDebited: 16,
      idempotencyKey: "seed-booking-001",
      confirmedAt: "2026-10-21T08:00:00Z",
      venueNameSnapshot: "The Hub Sports Arena",
      venueLocalitySnapshot: "Domlur",
      venueAddressSnapshot: "45 Intermediate Ring Road, Domlur, Bengaluru 560071",
      activityNameSnapshot: "Badminton Court (Wooden 1)",
      slotStartsAtSnapshot: "2026-10-23T06:00:00Z",
      slotEndsAtSnapshot: "2026-10-23T07:00:00Z",
      policySnapshot: {
        cutoffHours: 2,
        fullRefundAllowed: true,
        termsVersion: "2026-v1.0",
        rules: [
          "Free cancellation up to 2 hours before session start time.",
          "Late cancellations or no-shows forfeit credits.",
          "Show digital check-in token at venue desk upon arrival.",
        ],
      },
      checkinToken: "pass_pilot_demo_7f9b2a14",
      checkinStatus: "pending",
      createdAt: "2026-10-21T08:00:00Z",
      updatedAt: "2026-10-21T08:00:00Z",
    },
  ],
])
const bookingEventsStore: BookingEvent[] = []

/**
 * Standard test cancellation policy snapshot.
 * Cutoff: 2 hours before session start.
 */
export const DEFAULT_POLICY_SNAPSHOT: CancellationPolicySnapshot = {
  cutoffHours: 2,
  fullRefundAllowed: true,
  termsVersion: "2026-v1.0",
  rules: [
    "Free cancellation up to 2 hours before session start time.",
    "Late cancellations or no-shows forfeit credits.",
    "Show digital check-in token at venue desk upon arrival.",
  ],
}

/**
 * Creates a confirmed booking atomically with slot capacity reservation,
 * credit debit, and immutable snapshot capture.
 */
export async function createBooking(input: CreateBookingInput): Promise<Booking> {
  const { userId, slotId, idempotencyKey } = input

  if (!idempotencyKey || !idempotencyKey.trim()) {
    throw new ValidationError("An idempotency key is required for creating a booking.")
  }

  // 1. Idempotency Check: return original booking if already committed
  const existing = Array.from(bookingsStore.values()).find(
    (b) => b.idempotencyKey === idempotencyKey
  )
  if (existing) {
    return existing
  }

  // 1.5. Operations Kill-Switch Check (Phase 7/8 safety rule)
  const controls = getSystemControls()
  if (controls.isBookingsPaused) {
    throw new BookingsPausedError(
      controls.pauseReason || "New bookings are temporarily paused by platform operations."
    )
  }

  // 2. Fetch and Validate Slot
  const slot = mutableSlots.get(slotId)
  if (!slot || slot.status === "cancelled") {
    throw new SlotUnavailableError("Selected session slot does not exist or has been cancelled.")
  }

  // Check capacity
  if (slot.reservedCount >= slot.capacity) {
    throw new SlotUnavailableError("This session is fully booked. No capacity remaining.")
  }

  // Check booking cutoff time
  const startMs = new Date(slot.startsAt).getTime()
  const cutoffMs = startMs - slot.bookingCutoffMinutes * 60 * 1000
  if (Date.now() > cutoffMs) {
    throw new SlotUnavailableError("Booking cut-off window has closed for this slot.")
  }

  // 3. Resolve Venue and Activity details for Snapshot
  const venue = PILOT_VENUES.find((v) => v.id === slot.venueId)
  if (!venue || venue.status !== "approved") {
    throw new SlotUnavailableError("Venue is currently not available for bookings.")
  }

  const offering = venue.offerings.find((o) => o.activityId === slot.activityId)
  const creditCost = slot.creditCost

  // 4. Atomic Execution:
  // Step A: Reserve Capacity (guarded check)
  if (slot.reservedCount >= slot.capacity) {
    throw new SlotUnavailableError("Slot capacity reached.")
  }
  slot.reservedCount += 1
  if (slot.reservedCount >= slot.capacity) {
    slot.status = "full"
  }

  const bookingId = `book-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
  const ledgerIdempotencyKey = `debit-booking-${bookingId}-${idempotencyKey}`

  try {
    // Step B: Debit Credits from user account (throws InsufficientCreditsError if balance low)
    await debitCredits(
      userId,
      creditCost,
      "booking",
      bookingId,
      ledgerIdempotencyKey,
      `Session booking at ${venue.name}`
    )
  } catch (err) {
    // Rollback capacity if credit debit fails
    slot.reservedCount -= 1
    slot.status = "available"
    throw err
  }

  // Step C: Generate unguessable check-in token
  const checkinToken = `pass_${crypto.randomBytes(16).toString("hex")}`

  // Step D: Construct confirmed booking record
  const confirmedBooking: Booking = {
    id: bookingId,
    userId,
    slotId,
    venueId: slot.venueId,
    activityId: slot.activityId,
    status: "confirmed",
    creditsDebited: creditCost,
    idempotencyKey,
    confirmedAt: new Date().toISOString(),
    venueNameSnapshot: venue.name,
    venueLocalitySnapshot: venue.locality,
    venueAddressSnapshot: `${venue.addressLine1}, ${venue.locality}, ${venue.city}`,
    activityNameSnapshot: offering?.activityName || "Activity",
    slotStartsAtSnapshot: slot.startsAt,
    slotEndsAtSnapshot: slot.endsAt,
    policySnapshot: DEFAULT_POLICY_SNAPSHOT,
    checkinToken,
    checkinStatus: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  bookingsStore.set(bookingId, confirmedBooking)

  // Step E: Append booking event audit trail
  bookingEventsStore.push({
    id: `bevt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    bookingId,
    statusFrom: undefined,
    statusTo: "confirmed",
    actorId: userId,
    actorRole: "member",
    reason: "Initial member confirmation",
    createdAt: new Date().toISOString(),
  })

  return confirmedBooking
}

/**
 * Cancels a confirmed booking and initiates atomic credit refund if inside policy window.
 */
export async function cancelBooking(input: CancelBookingInput): Promise<Booking> {
  const { userId, bookingId, reason, actorId } = input
  const booking = bookingsStore.get(bookingId)

  if (!booking || booking.userId !== userId) {
    throw new BookingNotFoundError()
  }

  if (booking.status !== "confirmed") {
    throw new ValidationError(`Cannot cancel a booking that is currently ${booking.status}.`)
  }

  // Check Cancellation Window
  const sessionStartMs = new Date(booking.slotStartsAtSnapshot).getTime()
  const nowMs = Date.now()
  const cutoffHours = booking.policySnapshot.cutoffHours ?? 2
  const cutoffThresholdMs = sessionStartMs - cutoffHours * 60 * 60 * 1000

  if (nowMs > cutoffThresholdMs) {
    throw new CancellationCutoffExceededError(
      `Cancellation window closed: bookings must be cancelled at least ${cutoffHours} hours prior to start.`
    )
  }

  // Atomic state change:
  booking.status = "cancelled"
  booking.cancelledAt = new Date().toISOString()
  booking.cancellationReason = reason || "Member requested cancellation"
  booking.updatedAt = new Date().toISOString()

  // Release slot capacity
  const slot = mutableSlots.get(booking.slotId)
  if (slot) {
    slot.reservedCount = Math.max(0, slot.reservedCount - 1)
    slot.status = "available"
  }

  // Refund credits
  const refundIdempotencyKey = `refund-${bookingId}`
  await refundCredits(
    userId,
    booking.creditsDebited,
    "cancellation",
    bookingId,
    refundIdempotencyKey,
    `Refund for cancelled booking ${bookingId}`
  )

  // Append audit event
  bookingEventsStore.push({
    id: `bevt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    bookingId,
    statusFrom: "confirmed",
    statusTo: "cancelled",
    actorId,
    actorRole: "member",
    reason: booking.cancellationReason,
    createdAt: new Date().toISOString(),
  })

  return booking
}

/**
 * Retrieves member bookings filtered by status.
 */
export async function getMemberBookings(
  userId: string,
  filter?: "upcoming" | "past" | "cancelled"
): Promise<Booking[]> {
  const userBookings = Array.from(bookingsStore.values()).filter(
    (b) => b.userId === userId
  )

  const now = new Date().toISOString()

  if (filter === "upcoming") {
    return userBookings.filter(
      (b) => b.status === "confirmed" && b.slotStartsAtSnapshot >= now
    ).sort((a, b) => a.slotStartsAtSnapshot.localeCompare(b.slotStartsAtSnapshot))
  }

  if (filter === "past") {
    return userBookings.filter(
      (b) =>
        b.status === "completed" ||
        (b.status === "confirmed" && b.slotStartsAtSnapshot < now)
    ).sort((a, b) => b.slotStartsAtSnapshot.localeCompare(a.slotStartsAtSnapshot))
  }

  if (filter === "cancelled") {
    return userBookings.filter((b) => b.status === "cancelled").sort(
      (a, b) => (b.cancelledAt || "").localeCompare(a.cancelledAt || "")
    )
  }

  return userBookings.sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  )
}

/**
 * Retrieves a booking by ID ensuring user ownership (negative privacy test).
 */
export async function getBookingById(
  userId: string,
  bookingId: string
): Promise<Booking | null> {
  const booking = bookingsStore.get(bookingId)
  if (!booking || booking.userId !== userId) {
    return null
  }
  return booking
}

/**
 * Retrieves scheduled bookings for a specific venue (partner staff view).
 */
export async function getVenueBookings(venueId: string): Promise<Booking[]> {
  return Array.from(bookingsStore.values())
    .filter((b) => b.venueId === venueId)
    .sort((a, b) => b.slotStartsAtSnapshot.localeCompare(a.slotStartsAtSnapshot))
}

/**
 * Validates check-in pass at the venue desk (single-use validation).
 */
export async function validateCheckinPass(
  checkinToken: string,
  staffActorId: string
): Promise<{ success: boolean; message: string; booking?: Booking }> {
  const normalized = checkinToken.trim().toLowerCase()
  const booking = Array.from(bookingsStore.values()).find(
    (b) => b.checkinToken.toLowerCase() === normalized
  )

  if (!booking) {
    return { success: false, message: "Invalid or unrecognised check-in pass token." }
  }

  if (booking.checkinStatus === "checked_in") {
    return {
      success: false,
      message: `Pass already used. Checked in at ${booking.checkedInAt}. Single-use token.`,
    }
  }

  if (booking.status !== "confirmed") {
    return { success: false, message: `Pass invalid: booking is ${booking.status}.` }
  }

  booking.checkinStatus = "checked_in"
  booking.checkedInAt = new Date().toISOString()
  booking.status = "completed"
  booking.updatedAt = new Date().toISOString()

  bookingEventsStore.push({
    id: `bevt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    bookingId: booking.id,
    statusFrom: "confirmed",
    statusTo: "completed",
    actorId: staffActorId,
    actorRole: "partner_staff",
    reason: "Venue staff validated check-in pass",
    createdAt: new Date().toISOString(),
  })

  return { success: true, message: "Check-in successful. Welcome to the venue!", booking }
}

/**
 * Test helper to reset booking state between tests.
 */
export function resetBookingEngineState(): void {
  bookingsStore.clear()
  bookingEventsStore.length = 0
  const futureStart = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  const futureEnd = new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString()
  for (const slot of mutableSlots.values()) {
    slot.reservedCount = 0
    slot.status = "available"
    slot.startsAt = futureStart
    slot.endsAt = futureEnd
  }
}
