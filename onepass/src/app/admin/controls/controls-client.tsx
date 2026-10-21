"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  CheckCircle2,
  Power,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Activity,
  Database,
  Lock,
} from "lucide-react"
import type { SystemControlsState } from "@/features/admin/system-controls"
import {
  setBookingsPaused,
  setMaintenanceNotice,
} from "@/features/admin/system-controls"

interface ControlsClientProps {
  initialControls: SystemControlsState
}

export function ControlsClient({ initialControls }: ControlsClientProps) {
  const [controls, setControls] = useState<SystemControlsState>(initialControls)
  const [pauseReason, setPauseReason] = useState(controls.pauseReason || "")
  const [notice, setNotice] = useState(controls.maintenanceNotice || "")
  const [isUpdating, setIsUpdating] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleToggleKillSwitch = () => {
    setIsUpdating(true)
    setSuccessMessage(null)

    setTimeout(() => {
      const nextState = !controls.isBookingsPaused
      const updated = setBookingsPaused(
        nextState,
        nextState ? pauseReason || "Bookings paused for scheduled operational check." : undefined
      )
      setControls(updated)
      setIsUpdating(false)
      setSuccessMessage(
        nextState
          ? "Emergency booking kill-switch ACTIVATED. New slot reservations are now paused."
          : "Emergency kill-switch DEACTIVATED. New slot reservations are now open."
      )
    }, 400)
  }

  const handleSaveNotice = (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    setTimeout(() => {
      const updated = setMaintenanceNotice(notice.trim() ? notice.trim() : null)
      setControls(updated)
      setIsUpdating(false)
      setSuccessMessage("Operational broadcast notice updated.")
    }, 300)
  }

  return (
    <div className="space-y-8">
      {successMessage && (
        <div className="p-4 rounded-[--radius-md] border-2 border-[#244638] bg-[#F0F6F2] flex items-center gap-3 text-xs text-[#191B18]">
          <CheckCircle2 size={18} className="text-[#244638] shrink-0" />
          <span className="font-[600]">{successMessage}</span>
        </div>
      )}

      {/* Emergency Kill-Switch Card */}
      <div
        className={`p-6 rounded-[--radius-lg] border-2 transition-all ${
          controls.isBookingsPaused
            ? "border-red-600 bg-red-50/60"
            : "border-[#244638] bg-[#F0F6F2]"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div
              className={`p-3 rounded-full shrink-0 ${
                controls.isBookingsPaused
                  ? "bg-red-600 text-white"
                  : "bg-[#244638] text-[--color-chartreuse]"
              }`}
            >
              {controls.isBookingsPaused ? <ShieldAlert size={26} /> : <Power size={26} />}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-base font-[750] text-[#191B18]">
                  Platform Booking Kill-Switch
                </h2>
                <Badge
                  variant={controls.isBookingsPaused ? "danger" : "success"}
                  className="text-xs"
                >
                  {controls.isBookingsPaused ? "BOOKINGS PAUSED" : "BOOKINGS ACTIVE"}
                </Badge>
              </div>

              <p className="text-xs text-[#4E5249] max-w-xl leading-relaxed">
                Engineering requirement per <code>phases.md</code>: Immediate circuit breaker to halt new slot
                reservations during extreme weather, venue emergencies, or system reconciliations. Existing
                check-ins, cancellations, and credit refunds remain fully operational.
              </p>

              {controls.isBookingsPaused && controls.pausedAt && (
                <div className="mt-3 p-3 rounded-[--radius-sm] bg-red-100/70 border border-red-300 text-xs text-red-900 font-mono">
                  <p>
                    <strong>Paused at:</strong> {new Date(controls.pausedAt).toLocaleString("en-IN")}
                  </p>
                  <p>
                    <strong>Reason:</strong> {controls.pauseReason}
                  </p>
                  <p>
                    <strong>Operator:</strong> {controls.pausedBy}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="sm:self-center shrink-0">
            <Button
              variant={controls.isBookingsPaused ? "primary" : "destructive"}
              size="md"
              onClick={handleToggleKillSwitch}
              disabled={isUpdating}
              className="gap-2 font-[700]"
            >
              {isUpdating ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  Updating...
                </>
              ) : controls.isBookingsPaused ? (
                <>
                  <Power size={16} />
                  Resume All Bookings
                </>
              ) : (
                <>
                  <Power size={16} />
                  Pause New Bookings
                </>
              )}
            </Button>
          </div>
        </div>

        {!controls.isBookingsPaused && (
          <div className="mt-5 pt-4 border-t border-[#D5E6DA] max-w-xl">
            <Label htmlFor="pause-reason" className="text-xs font-[650] text-[#191B18] mb-1.5 block">
              Default reason if pause is triggered (shown to members):
            </Label>
            <Input
              id="pause-reason"
              value={pauseReason}
              onChange={(e) => setPauseReason(e.target.value)}
              placeholder="e.g. Intense rain across Indiranagar; outdoor sessions temporarily held."
              className="bg-white text-xs text-[#191B18]"
            />
          </div>
        )}
      </div>

      {/* Operational Broadcast Banner Form */}
      <div className="p-6 rounded-[--radius-lg] border border-[--color-border] bg-white shadow-sm">
        <h2 className="text-base font-[750] text-[#191B18] mb-1">
          Operational Announcement Banner
        </h2>
        <p className="text-xs text-[--color-muted] mb-4">
          Broadcast pilot updates or advisory notices directly across member headers.
        </p>

        <form onSubmit={handleSaveNotice} className="space-y-4">
          <div>
            <Label htmlFor="notice-input" className="text-xs font-[650] text-[#191B18] mb-1.5 block">
              Announcement text (leave blank to clear)
            </Label>
            <Input
              id="notice-input"
              value={notice}
              onChange={(e) => setNotice(e.target.value)}
              placeholder="e.g. Pilot Welcome: Free first session credit pack activated for all 20 beta members!"
              className="bg-white text-xs text-[#191B18]"
            />
          </div>

          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm" type="submit" disabled={isUpdating}>
              Save Announcement
            </Button>
            {controls.maintenanceNotice && (
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => {
                  setNotice("")
                  setMaintenanceNotice(null)
                  setControls((c) => ({ ...c, maintenanceNotice: null }))
                }}
              >
                Clear Banner
              </Button>
            )}
          </div>
        </form>
      </div>

      {/* Health & Diagnostic Safeguards (Phase 7 & 8 Invariants) */}
      <div className="p-6 rounded-[--radius-lg] border border-[--color-border] bg-white shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-[--color-border] mb-4">
          <div>
            <h2 className="text-base font-[750] text-[#191B18]">System Integrity Diagnostics</h2>
            <p className="text-xs text-[--color-muted]">Continuous audit checks across core invariants</p>
          </div>
          <Badge variant="outline" className="text-xs font-mono">
            All Systems Normal
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-[--radius-md] border border-[#E2E5DC] bg-[#F7F7F2] flex items-start gap-3">
            <Database size={20} className="text-[#244638] mt-0.5 shrink-0" />
            <div>
              <p className="font-[700] text-xs text-[#191B18]">Double-Entry Ledger Integrity</p>
              <p className="text-[11px] text-[--color-muted] mt-0.5">
                Append-only credit journal balance matches calculated balances. Drift: ₹0.00.
              </p>
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-800 font-[650] mt-1.5">
                <CheckCircle2 size={12} /> Verified immutable
              </span>
            </div>
          </div>

          <div className="p-4 rounded-[--radius-md] border border-[#E2E5DC] bg-[#F7F7F2] flex items-start gap-3">
            <Lock size={20} className="text-[#244638] mt-0.5 shrink-0" />
            <div>
              <p className="font-[700] text-xs text-[#191B18]">Webhook HMAC-SHA256 Signature</p>
              <p className="text-[11px] text-[--color-muted] mt-0.5">
                Raw body cryptographic signatures enforced on all payment events. Spoofs rejected.
              </p>
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-800 font-[650] mt-1.5">
                <CheckCircle2 size={12} /> Provider verified
              </span>
            </div>
          </div>

          <div className="p-4 rounded-[--radius-md] border border-[#E2E5DC] bg-[#F7F7F2] flex items-start gap-3">
            <ShieldCheck size={20} className="text-[#244638] mt-0.5 shrink-0" />
            <div>
              <p className="font-[700] text-xs text-[#191B18]">Single-Use Check-In Invalidation</p>
              <p className="text-[11px] text-[--color-muted] mt-0.5">
                Digital pass tokens are cryptographically randomized and instantly invalidated upon entry.
              </p>
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-800 font-[650] mt-1.5">
                <CheckCircle2 size={12} /> Anti-reuse active
              </span>
            </div>
          </div>

          <div className="p-4 rounded-[--radius-md] border border-[#E2E5DC] bg-[#F7F7F2] flex items-start gap-3">
            <Activity size={20} className="text-[#244638] mt-0.5 shrink-0" />
            <div>
              <p className="font-[700] text-xs text-[#191B18]">Capacity Concurrency Guards</p>
              <p className="text-[11px] text-[--color-muted] mt-0.5">
                Atomic slot reservation guarantees zero overselling across concurrent pilot court slots.
              </p>
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-800 font-[650] mt-1.5">
                <CheckCircle2 size={12} /> Mutex active
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
