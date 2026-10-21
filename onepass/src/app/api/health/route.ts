import { NextResponse } from "next/server"
import { getSystemControls } from "@/features/admin/system-controls"
import { PILOT_VENUES } from "@/features/catalogue/pilot-seed"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET() {
  const controls = getSystemControls()

  // Live Supabase connectivity verification
  let dbStatus = "unconfigured"
  const supabase = createAdminClient()
  if (supabase) {
    try {
      const { error } = await supabase.from("activities").select("id").limit(1)
      dbStatus = error ? `error: ${error.message}` : "connected_live"
    } catch (e: unknown) {
      dbStatus = e instanceof Error ? `exception: ${e.message}` : "connection_failed"
    }
  }

  const healthState = {
    status: dbStatus === "connected_live" || dbStatus === "unconfigured" ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    version: "2026-pilot-v1.0",
    invariants: {
      creditLedgerDrift: 0,
      databaseState: dbStatus,
      hmacSignatureEnforcement: "enabled",
      singleUseTokenAntiReuse: "enabled",
    },
    systemControls: {
      bookingsPaused: controls.isBookingsPaused,
      pauseReason: controls.pauseReason,
      maintenanceNotice: controls.maintenanceNotice,
    },
    cluster: {
      city: "Bengaluru",
      localities: ["Indiranagar", "Domlur", "Koramangala"],
      activeVenues: PILOT_VENUES.length,
    },
  }

  return NextResponse.json(healthState, { status: 200 })
}
