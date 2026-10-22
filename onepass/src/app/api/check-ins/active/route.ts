import { NextResponse, type NextRequest } from "next/server"
import {
  getActiveSessionsForVenue,
  getActiveSessionForUser,
} from "@/features/metering/metering-service"
import { getEffectiveUserId } from "@/features/auth/auth-service"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const venueId = searchParams.get("venueId")
    const targetUserId = searchParams.get("userId")

    if (venueId) {
      const sessions = await getActiveSessionsForVenue(venueId)
      return NextResponse.json({ success: true, count: sessions.length, sessions })
    }

    const userId = targetUserId || (await getEffectiveUserId())
    const session = await getActiveSessionForUser(userId)

    return NextResponse.json({ success: true, active: !!session, session })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch active sessions"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
