"use server"

import { revalidatePath } from "next/cache"
import { validateCheckinPass } from "@/features/bookings/booking-engine"
import { calculateVenueSettlement } from "@/features/partner/settlement-service"

// In pilot deployment: default staff context for partner part-01
const DEMO_PARTNER_ID = "part-01"
const DEMO_STAFF_ID = "staff-hub-01"

export async function validateCheckinAction(checkinToken: string) {
  if (!checkinToken || !checkinToken.trim()) {
    return {
      success: false,
      message: "Please enter or scan a valid check-in token.",
    }
  }

  const cleanToken = checkinToken.trim()

  try {
    const result = await validateCheckinPass(cleanToken, DEMO_STAFF_ID)

    if (result.success) {
      revalidatePath("/partner/checkin")
      revalidatePath("/partner/dashboard")
      revalidatePath("/partner/statements")
      revalidatePath("/bookings")
    }

    return result
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to process check-in"
    return { success: false, message }
  }
}

export async function getVenueSettlementAction(
  venueId: string,
  billingPeriod = "2026-10"
) {
  try {
    const statement = await calculateVenueSettlement(
      DEMO_PARTNER_ID,
      venueId,
      billingPeriod
    )
    return { success: true, statement }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to generate settlement statement"
    return { success: false, error: message }
  }
}
