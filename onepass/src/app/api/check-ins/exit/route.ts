import { NextResponse, type NextRequest } from "next/server"
import { processExitScan } from "@/features/metering/metering-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, actorId, idempotencyKey } = body

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "sessionId or passToken is required" },
        { status: 400 }
      )
    }

    if (!idempotencyKey) {
      return NextResponse.json(
        { success: false, error: "idempotencyKey is required" },
        { status: 400 }
      )
    }

    const result = await processExitScan({
      sessionId,
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
      creditsDebited: result.creditsDebited,
      durationMinutes: result.durationMinutes,
      capped: result.capped,
      message: result.message,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to process exit checkout"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
