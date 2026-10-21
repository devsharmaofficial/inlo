"use server"

import { revalidatePath } from "next/cache"
import {
  createBooking,
  cancelBooking,
} from "@/features/bookings/booking-engine"
import { getUserCreditBalance } from "@/features/credits/credit-ledger-service"
import { getEffectiveUserId } from "@/features/auth/auth-service"

function safeRevalidate(path: string) {
  try {
    revalidatePath(path)
  } catch {
    // Expected when invoked in test environments outside Next.js request context
  }
}

export async function createBookingAction(slotId: string, idempotencyKey: string) {
  try {
    const userId = await getEffectiveUserId()
    const booking = await createBooking({
      userId,
      slotId,
      idempotencyKey,
    })

    safeRevalidate("/bookings")
    safeRevalidate(`/bookings/${booking.id}`)
    safeRevalidate("/explore")
    safeRevalidate("/account")

    return { success: true, bookingId: booking.id }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create booking"
    return { success: false, error: message }
  }
}

export async function cancelBookingAction(bookingId: string, reason?: string) {
  try {
    const userId = await getEffectiveUserId()
    const booking = await cancelBooking({
      userId,
      bookingId,
      reason: reason || "Cancelled by member via web portal",
      actorId: userId,
    })

    safeRevalidate("/bookings")
    safeRevalidate(`/bookings/${booking.id}`)
    safeRevalidate("/account")

    return { success: true, bookingId: booking.id }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to cancel booking"
    return { success: false, error: message }
  }
}

export async function getMemberCreditBalanceAction() {
  const userId = await getEffectiveUserId()
  return getUserCreditBalance(userId)
}
