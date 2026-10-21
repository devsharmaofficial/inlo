"use client"

import { useState, useTransition, useCallback } from "react"
import {
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  QrCode,
  Keyboard,
  ArrowRight,
  UserCheck,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { QRScanner } from "@/components/partner/qr-scanner"
import { validateCheckinAction } from "@/app/actions/partner-actions"
import type { Booking } from "@/types/booking"

type Mode = "scan" | "manual"

interface CheckinResult {
  success: boolean
  message: string
  booking?: Booking
}

export function CheckinForm() {
  const [mode, setMode] = useState<Mode>("scan")
  const [token, setToken] = useState("")
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<CheckinResult | null>(null)
  const [scannerKey, setScannerKey] = useState(0) // increment to reset scanner
  const [recentCheckins, setRecentCheckins] = useState<
    Array<{
      bookingId: string
      activity: string
      time: string
      credits: number
    }>
  >([])

  // ─── Unified handler for both manual input and QR scan ───────────────────
  const processToken = useCallback(
    (rawToken: string) => {
      const clean = rawToken.trim()
      if (!clean) return

      startTransition(async () => {
        const res = await validateCheckinAction(clean)
        setResult(res)

        if (res.success && res.booking) {
          setRecentCheckins((prev) => [
            {
              bookingId: res.booking!.id,
              activity: res.booking!.activityNameSnapshot,
              time: new Date().toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              }),
              credits: res.booking!.creditsDebited,
            },
            ...prev.slice(0, 4),
          ])
          setToken("")
          // Reset scanner so the next member can be scanned
          setScannerKey((k) => k + 1)
        }
      })
    },
    []
  )

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    processToken(token)
  }

  const handleQRScan = useCallback(
    (decoded: string) => {
      processToken(decoded)
    },
    [processToken]
  )

  const resetResult = () => {
    setResult(null)
    setScannerKey((k) => k + 1)
  }

  return (
    <div className="space-y-6">
      {/* Mode Toggle Tabs */}
      <div className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] overflow-hidden shadow-sm">
        {/* Tab Header */}
        <div className="flex border-b border-[--color-border]" role="tablist">
          <button
            id="tab-scan-qr"
            type="button"
            role="tab"
            onClick={() => { setMode("scan"); setResult(null) }}
            className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-[650] transition-colors duration-[140ms] ${
              mode === "scan"
                ? "bg-[--color-forest] text-white"
                : "text-[--color-muted] hover:text-[--color-foreground] hover:bg-[--color-surface-muted]"
            }`}
            aria-selected={mode === "scan"}
          >
            <QrCode size={16} aria-hidden="true" />
            Scan QR Code
          </button>
          <button
            id="tab-manual-token"
            type="button"
            role="tab"
            onClick={() => { setMode("manual"); setResult(null) }}
            className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-[650] transition-colors duration-[140ms] ${
              mode === "manual"
                ? "bg-[--color-forest] text-white"
                : "text-[--color-muted] hover:text-[--color-foreground] hover:bg-[--color-surface-muted]"
            }`}
            aria-selected={mode === "manual"}
          >
            <Keyboard size={16} aria-hidden="true" />
            Enter Token
          </button>
        </div>

        <div className="p-6">
          {/* ── QR CAMERA MODE ─────────────────────────────────────────── */}
          {mode === "scan" && (
            <div className="space-y-4">
              <p className="text-xs text-[--color-muted]">
                Point the camera at the member&apos;s Inlo QR pass. Admission is confirmed
                automatically once the code is detected.
              </p>

              {/* Camera scanner — re-mounts on scannerKey change */}
              {!result && (
                <QRScanner
                  key={scannerKey}
                  onScan={handleQRScan}
                  active={mode === "scan" && !isPending}
                />
              )}

              {isPending && (
                <div className="flex flex-col items-center gap-2 py-8 text-[--color-muted]">
                  <div className="w-8 h-8 rounded-full border-2 border-[--color-forest] border-t-transparent animate-spin" />
                  <span className="text-xs">Verifying pass…</span>
                </div>
              )}

              {result && (
                <div className="flex justify-center pt-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={resetResult}
                    id="scan-next-member-btn"
                  >
                    <RefreshCw size={14} className="mr-1.5" />
                    Scan next member
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* ── MANUAL TOKEN MODE ──────────────────────────────────────── */}
          {mode === "manual" && (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="pass-token-input"
                  className="block text-label mb-1.5 text-[--color-foreground]"
                >
                  Digital Pass Token
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    id="pass-token-input"
                    name="passToken"
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="pass_..."
                    className="font-mono text-sm flex-1"
                    autoComplete="off"
                    spellCheck={false}
                    disabled={isPending}
                    required
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    disabled={isPending || !token.trim()}
                    id="manual-checkin-submit"
                    className="shrink-0"
                  >
                    {isPending ? "Validating…" : "Verify & Admit"}
                    <ArrowRight size={16} className="ml-1" />
                  </Button>
                </div>
              </div>

              {/* Demo helper */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-[--color-muted]">
                <span>Pilot test:</span>
                <button
                  type="button"
                  onClick={() => { setToken("pass_pilot_demo_7f9b2a14"); setResult(null) }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[--radius-sm] bg-[--color-surface-muted] hover:bg-[--color-border] text-[--color-foreground] font-mono transition-colors text-xs border border-[--color-border]"
                >
                  Use demo token
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* ── VERIFICATION RESULT ─────────────────────────────────────────────── */}
      {result && (
        <div>
          {result.success && result.booking ? (
            <div className="rounded-[--radius-lg] border-2 border-[#244638] bg-[#F0F6F2] p-6 animate-[fadeIn_0.2s_ease]">
              <div className="flex items-center gap-2 text-[--color-forest] mb-4">
                <CheckCircle2 size={24} className="shrink-0" />
                <span className="font-[700] text-base uppercase tracking-wide">
                  Pass Confirmed · Entry Approved
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[--color-foreground]">
                <div>
                  <p className="text-[--color-muted] font-[600] uppercase text-[10px] mb-1">Session</p>
                  <p className="font-[650] text-sm">{result.booking.activityNameSnapshot}</p>
                  <p className="text-[--color-muted]">
                    {result.booking.venueNameSnapshot} · {result.booking.venueLocalitySnapshot}
                  </p>
                </div>
                <div>
                  <p className="text-[--color-muted] font-[600] uppercase text-[10px] mb-1">Member</p>
                  <p className="font-mono text-sm">{result.booking.userId}</p>
                  <p className="text-[--color-forest] font-[650]">
                    {result.booking.creditsDebited} credits · ₹
                    {(result.booking.creditsDebited * 70).toLocaleString("en-IN")} payout
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#D5E6DA] flex items-center justify-between text-xs text-[--color-muted]">
                <span className="inline-flex items-center gap-1 font-mono">
                  <ShieldCheck size={13} className="text-[--color-forest]" />
                  Single-use pass invalidated
                </span>
                <span>Ref: {result.booking.id}</span>
              </div>
            </div>
          ) : (
            <div className="rounded-[--radius-lg] border-2 border-[#B33B32] bg-[#FDF2F2] p-6">
              <div className="flex items-start gap-3 text-[--color-danger]">
                <AlertTriangle size={22} className="shrink-0 mt-0.5" />
                <div>
                  <p className="font-[700] text-sm uppercase tracking-wide">Admission Denied</p>
                  <p className="text-xs text-[--color-foreground] mt-1">{result.message}</p>
                  <p className="text-[11px] text-[--color-muted] mt-2">
                    Ask the member to refresh their Inlo app pass, or contact support.
                    Do not admit without a green confirmation.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── RECENT CHECK-INS TABLE ────────────────────────────────────────── */}
      {recentCheckins.length > 0 && (
        <div className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-label font-[650] text-[--color-foreground]">
              Recent Admissions (This Shift)
            </h3>
            <Badge variant="success">
              <UserCheck size={12} className="mr-1" />
              {recentCheckins.length} admitted
            </Badge>
          </div>

          <div className="divide-y divide-[--color-border]">
            {recentCheckins.map((entry, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-[600] text-[--color-foreground] mr-2">
                    {entry.activity}
                  </span>
                  <span className="text-[--color-muted] font-mono text-[11px]">
                    Ref: {entry.bookingId}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[--color-forest] font-[600]">
                    +{entry.credits} credits
                  </span>
                  <span className="text-[--color-muted] tabular-nums">{entry.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── STAFF OPERATIONAL PROTOCOLS ───────────────────────────────────── */}
      <div className="rounded-[--radius-md] border border-[--color-border] bg-[--color-surface-muted] p-4 text-xs text-[--color-muted] space-y-2">
        <p className="font-[650] text-[--color-foreground] uppercase tracking-wide text-[11px]">
          Operational Protocols · Pilot Venue Desk
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>Never admit members without an instantaneous green check confirmation on this screen.</li>
          <li>Each digital QR pass is single-use and invalidates immediately upon redemption.</li>
          <li>Partners receive automated reconciliation credit for every verified admission.</li>
          <li>For disputes or session cancellations, direct members to support via the Inlo app.</li>
        </ul>
      </div>
    </div>
  )
}
