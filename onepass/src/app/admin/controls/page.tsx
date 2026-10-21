import type { Metadata } from "next"
import { getSystemControls } from "@/features/admin/system-controls"
import { ControlsClient } from "./controls-client"

export const metadata: Metadata = {
  title: "System Controls & Emergency Kill-Switch — Admin",
  description: "Phase 8 operational circuit breakers, emergency pause, and integrity diagnostics.",
}

export default function AdminControlsPage() {
  const controls = getSystemControls()

  return (
    <div className="p-6 md:p-8 max-w-5xl">
      <div className="mb-8 pb-6 border-b border-[--color-border]">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xs font-[700] uppercase tracking-wider text-[--color-forest]">
            Phase 8 Operational Safeguards
          </span>
          <span className="text-xs text-[--color-muted]">·</span>
          <span className="text-xs text-[--color-muted]">Incident Response &amp; Circuit Breakers</span>
        </div>
        <h1 className="text-h2 text-[--color-foreground]">System Controls &amp; Emergency Kill-Switch</h1>
        <p className="text-body text-[--color-muted] mt-0.5">
          Operational controls to pause new reservations, broadcast announcements, and monitor health invariants.
        </p>
      </div>

      <ControlsClient initialControls={controls} />
    </div>
  )
}
