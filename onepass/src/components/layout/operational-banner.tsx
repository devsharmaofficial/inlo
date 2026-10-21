import { getSystemControls } from "@/features/admin/system-controls"
import { AlertTriangle, Info } from "lucide-react"

export function OperationalBanner() {
  const controls = getSystemControls()

  if (controls.isBookingsPaused) {
    return (
      <aside
        role="alert"
        className="w-full bg-amber-500 text-amber-950 px-4 py-2 text-xs font-[600] flex items-center justify-center gap-2 border-b border-amber-600/30"
      >
        <AlertTriangle size={15} className="shrink-0" />
        <span>
          <strong>Operational Notice:</strong> {controls.pauseReason || "New bookings are temporarily paused by operations for facility updates. Existing bookings and check-ins remain active."}
        </span>
      </aside>
    )
  }

  if (controls.maintenanceNotice) {
    return (
      <aside
        role="status"
        className="w-full bg-[#244638] text-white px-4 py-2 text-xs font-[550] flex items-center justify-center gap-2 border-b border-white/10"
      >
        <Info size={15} className="text-[--color-chartreuse] shrink-0" />
        <span>{controls.maintenanceNotice}</span>
      </aside>
    )
  }

  return null
}
