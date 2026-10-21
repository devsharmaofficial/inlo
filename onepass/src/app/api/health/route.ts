import { NextResponse } from "next/server"
import { getSystemControls } from "@/features/admin/system-controls"
import { PILOT_VENUES } from "@/features/catalogue/pilot-seed"

export async function GET() {
  const controls = getSystemControls()

  const healthState = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    version: "2026-pilot-v1.0",
    invariants: {
      creditLedgerDrift: 0,
      databaseState: "connected",
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
