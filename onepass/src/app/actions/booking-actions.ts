"use server"

import { revalidatePath } from "next/cache"
import {
  createBooking,
  cancelBooking,
} from "@/features/bookings/booking-engine"
import { getUserCreditBalance } from "@/features/credits/credit-ledger-service"

// In Phase 4 demo / concierge pilot: default member session
const DEMO_USER_ID = "user-member-1"

export async function createBookingAction(slotId: string, idempotencyKey: string) {
  try {
    const booking = await createBooking({
      userId: DEMO_USER_ID,
      slotId,
      idempotencyKey,
    })

    revalidatePath("/bookings")
    revalidatePath(`/bookings/${booking.id}`)
    revalidatePath("/explore")

    return { success: true, bookingId: booking.id }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create booking"
    return { success: false, error: message }
  }
}

export async function cancelBookingAction(bookingId: string, reason?: string) {
  try {
    const booking = await cancelBooking({
      userId: DEMO_USER_ID,
      bookingId,
      reason: reason || "Cancelled by member via web portal",
      actorId: DEMO_USER_ID,
    })

    revalidatePath("/bookings")
    revalidatePath(`/bookings/${booking.id}`)

    return { success: true, bookingId: booking.id }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to cancel booking"
    return { success: false, error: message }
  }
}

export async function getMemberCreditBalanceAction() {
  return getUserCreditBalance(DEMO_USER_ID)
}
