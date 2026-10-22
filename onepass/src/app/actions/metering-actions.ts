"use server"

import { revalidatePath } from "next/cache"
import {
  processEntryScan,
  processExitScan,
  handleMissingExitAutoCap,
  getActiveSessionsForVenue,
  getActiveSessionForUser,
  getRateCardForVenue,
} from "@/features/metering/metering-service"
import { getEffectiveUserId } from "@/features/auth/auth-service"

function safeRevalidate(path: string) {
  try {
    revalidatePath(path)
  } catch {
    // In test runner
  }
}

export async function entryScanAction({
  venueId,
  venueName,
  targetUserId,
  activitySlug = "gym",
}: {
  venueId: string
  venueName?: string
  targetUserId?: string
  activitySlug?: string
}) {
  try {
    const currentUserId = await getEffectiveUserId()
    const userId = targetUserId || currentUserId
    const idempotencyKey = `entry-${userId}-${venueId}-${Date.now()}`

    const res = await processEntryScan({
      userId,
      venueId,
      venueName,
      activitySlug,
      actorId: currentUserId,
      idempotencyKey,
    })

    if (res.success) {
      safeRevalidate("/partner/checkin")
      safeRevalidate("/bookings")
      safeRevalidate("/account")
    }

    return res
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to process entry scan"
    return { success: false, error: message, message: "Entry scan failed" }
  }
}

export async function exitScanAction({
  sessionId,
}: {
  sessionId: string
}) {
  try {
    const currentUserId = await getEffectiveUserId()
    const idempotencyKey = `exit-${sessionId}-${Date.now()}`

    const res = await processExitScan({
      sessionId,
      actorId: currentUserId,
      idempotencyKey,
    })

    if (res.success) {
      safeRevalidate("/partner/checkin")
      safeRevalidate("/bookings")
      safeRevalidate("/account")
    }

    return res
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to process exit scan"
    return { success: false, error: message, message: "Exit scan failed" }
  }
}

export async function getActiveUserSessionAction() {
  try {
    const userId = await getEffectiveUserId()
    return await getActiveSessionForUser(userId)
  } catch {
    return null
  }
}

export async function getVenueActiveSessionsAction(venueId: string) {
  try {
    return await getActiveSessionsForVenue(venueId)
  } catch {
    return []
  }
}

export async function getVenueRateCardAction(venueId: string) {
  try {
    return await getRateCardForVenue(venueId, "gym")
  } catch {
    return null
  }
}

export async function autoCapSessionAction(sessionId: string) {
  try {
    const actorId = await getEffectiveUserId()
    const res = await handleMissingExitAutoCap(sessionId, actorId)
    safeRevalidate("/partner/checkin")
    safeRevalidate("/admin/controls")
    return res
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to auto-cap session"
    return { success: false, error: message, message: "Auto-cap failed" }
  }
}
