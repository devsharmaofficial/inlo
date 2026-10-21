import { NextRequest, NextResponse } from "next/server"
import { validateCheckinPass } from "@/features/bookings/booking-engine"

/**
 * POST /api/checkin/validate
 *
 * Validates a check-in pass token (submitted either by typing or QR scan).
 * This is the single authoritative validation endpoint used by:
 *   - Partner check-in desk (QR camera scan or manual token entry)
 *   - Admin ledger override tools
 *
 * Body: { token: string; staffActorId?: string }
 * Returns: { success, message, booking? }
 *
 * Security:
 * - Token is a 32-byte cryptographically random hex string.
 * - Single-use: invalidated atomically on first successful validation.
 * - No rate-limiting here yet — add WAF/IP throttle at edge before launch.
 */
export async function POST(req: NextRequest) {
  try {
    let body: { token?: string; staffActorId?: string } = {}
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: "Malformed JSON body" }, { status: 400 })
    }

    const { token, staffActorId } = body

    if (!token || typeof token !== "string" || !token.trim()) {
      return NextResponse.json(
        { error: "A check-in token is required." },
        { status: 400 }
      )
    }

    const normalizedToken = token.trim().toLowerCase()
    const actorId = staffActorId?.trim() || "staff-desk"

    const result = await validateCheckinPass(normalizedToken, actorId)

    return NextResponse.json(result, { status: result.success ? 200 : 422 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
