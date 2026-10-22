import { NextResponse, type NextRequest } from "next/server"
import { processEntryScan } from "@/features/metering/metering-service"
import { getEffectiveUserId } from "@/features/auth/auth-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { venueId, venueName, activitySlug, actorId, idempotencyKey, targetUserId } = body

    if (!venueId) {
      return NextResponse.json(
        { success: false, error: "venueId is required" },
        { status: 400 }
      )
    }

    if (!idempotencyKey) {
      return NextResponse.json(
        { success: false, error: "idempotencyKey is required" },
        { status: 400 }
      )
    }

    // Effective user to check in (either passed by staff or the authenticated session)
    const currentUserId = await getEffectiveUserId()
    const userId = targetUserId || currentUserId

    const result = await processEntryScan({
      userId,
      venueId,
      venueName: venueName || "Inlo Partner Venue",
      activitySlug: activitySlug || "gym",
      actorId: actorId || "staff-desk",
      idempotencyKey,
    })

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error, message: result.message },
        { status: 422 }
      )
    }

    return NextResponse.json({
      success: true,
      session: result.session,
      message: result.message,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to process entry scan"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
