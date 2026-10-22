"use client"

import { useState, useTransition, useCallback, useEffect } from "react"
import {
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  QrCode,
  Keyboard,
  ArrowRight,
  UserCheck,
  RefreshCw,
  Timer,
  LogOut,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { QRScanner } from "@/components/partner/qr-scanner"
import { validateCheckinAction } from "@/app/actions/partner-actions"
import {
  entryScanAction,
  exitScanAction,
  getVenueActiveSessionsAction,
} from "@/app/actions/metering-actions"
import type { Booking } from "@/types/booking"
import type { UsageSession } from "@/types/metering"

type MainTab = "fixed-pass" | "gym-metering"
type FixedMode = "scan" | "manual"
type MeteringSubMode = "entry" | "exit" | "live-floor"

interface CheckinResult {
  success: boolean
  message: string
  booking?: Booking
}

export function CheckinForm() {
  const [mainTab, setMainTab] = useState<MainTab>("fixed-pass")
  const [fixedMode, setFixedMode] = useState<FixedMode>("scan")
  const [meteringMode, setMeteringMode] = useState<MeteringSubMode>("entry")
  const [token, setToken] = useState("")
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<CheckinResult | null>(null)
  const [scannerKey, setScannerKey] = useState(0)

  // Metering states
  const [meteringTargetUser, setMeteringTargetUser] = useState("user-member-1")
  const [meteringVenue] = useState({
    id: "venue-iron-movement",
    name: "Iron & Movement Club",
  })
  const [nowTimestamp, setNowTimestamp] = useState<number>(0)
  const [activeSessions, setActiveSessions] = useState<UsageSession[]>([])
  const [meteringReceipt, setMeteringReceipt] = useState<{
    action: "ENTRY" | "EXIT"
    session: UsageSession
    creditsDebited?: number
    durationMinutes?: number
    capped?: boolean
    message: string
  } | null>(null)

  const [recentCheckins, setRecentCheckins] = useState<
    Array<{
      bookingId: string
      activity: string
      time: string
      credits: number
    }>
  >([])

  // Load active sessions for selected venue
  const refreshActiveSessions = useCallback(async () => {
    const sessions = await getVenueActiveSessionsAction(meteringVenue.id)
    setActiveSessions(sessions)
    setNowTimestamp(Date.now())
  }, [meteringVenue.id])

  useEffect(() => {
    let isMounted = true
    const load = async () => {
      const sessions = await getVenueActiveSessionsAction(meteringVenue.id)
      if (isMounted) {
        setActiveSessions(sessions)
        setNowTimestamp(Date.now())
      }
    }
    load()
    const interval = setInterval(load, 5000)
    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [meteringVenue.id])

  // ─── Metering Exit Handler ─────────────────────────────────────────────────
  const handleMeteringExit = useCallback(
    async (sessionIdOrToken: string) => {
      setMeteringReceipt(null)
      startTransition(async () => {
        const res = await exitScanAction({
          sessionId: sessionIdOrToken,
        })

        if (res.success && res.session) {
          setMeteringReceipt({
            action: "EXIT",
            session: res.session,
            creditsDebited: res.creditsDebited,
            durationMinutes: res.durationMinutes,
            capped: res.capped,
            message: res.message,
          })
          refreshActiveSessions()
        } else {
          setResult({
            success: false,
            message: res.error || "Exit checkout failed.",
          })
        }
      })
    },
    [refreshActiveSessions]
  )

  // ─── Fixed-pass validation handler ─────────────────────────────────────────
  const processFixedToken = useCallback(
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
          setScannerKey((k) => k + 1)
        }
      })
    },
    []
  )

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    processFixedToken(token)
  }

  const handleQRScan = useCallback(
    (decoded: string) => {
      // Check if it's an exit pass token
      if (decoded.startsWith("pass_exit_")) {
        setMainTab("gym-metering")
        setMeteringMode("exit")
        handleMeteringExit(decoded)
        return
      }
      processFixedToken(decoded)
    },
    [handleMeteringExit, processFixedToken]
  )

  // ─── Metering Entry Handler ────────────────────────────────────────────────
  const handleMeteringEntry = async () => {
    setMeteringReceipt(null)
    startTransition(async () => {
      const res = await entryScanAction({
        venueId: meteringVenue.id,
        venueName: meteringVenue.name,
        targetUserId: meteringTargetUser,
        activitySlug: "gym",
      })

      if (res.success && res.session) {
        setMeteringReceipt({
          action: "ENTRY",
          session: res.session,
          message: res.message,
        })
        refreshActiveSessions()
      } else {
        setResult({
          success: false,
          message: res.error || "Entry scan failed.",
        })
      }
    })
  }

  const resetResult = () => {
    setResult(null)
    setMeteringReceipt(null)
    setScannerKey((k) => k + 1)
  }

  return (
    <div className="space-y-6">
      {/* ── TOP-LEVEL DESK SELECTOR: FIXED PASS vs GYM ENTRY/EXIT METERING ── */}
      <div className="flex rounded-[--radius-lg] border-2 border-[--color-border] bg-[--color-surface-muted] p-1 gap-1">
        <button
          type="button"
          onClick={() => {
            setMainTab("fixed-pass")
            resetResult()
          }}
          className={`flex-1 py-2.5 px-4 rounded-[--radius-md] text-xs font-[700] transition-all cursor-pointer flex items-center justify-center gap-2 ${
            mainTab === "fixed-pass"
              ? "bg-[--color-forest] text-white shadow-xs"
              : "text-[--color-muted] hover:text-[--color-foreground]"
          }`}
        >
          <QrCode size={15} />
          <span>Fixed Booking Passes</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setMainTab("gym-metering")
            resetResult()
            refreshActiveSessions()
          }}
          className={`flex-1 py-2.5 px-4 rounded-[--radius-md] text-xs font-[700] transition-all cursor-pointer flex items-center justify-center gap-2 ${
            mainTab === "gym-metering"
              ? "bg-[--color-forest] text-white shadow-xs"
              : "text-[--color-muted] hover:text-[--color-foreground]"
          }`}
        >
          <Timer size={15} />
          <span>Gym Entry / Exit Metering</span>
          {activeSessions.length > 0 && (
            <span className="bg-[--color-accent] text-[--color-accent-foreground] text-[10px] px-2 py-0.5 rounded-full font-[800]">
              {activeSessions.length} active
            </span>
          )}
        </button>
      </div>

      {/* ── MAIN TAB 1: FIXED PASS REDEMPTION ─────────────────────────────── */}
      {mainTab === "fixed-pass" && (
        <div className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] overflow-hidden shadow-sm">
          {/* Sub Mode Header */}
          <div className="flex border-b border-[--color-border]" role="tablist">
            <button
              id="tab-scan-qr"
              type="button"
              role="tab"
              onClick={() => {
                setFixedMode("scan")
                setResult(null)
              }}
              className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-[650] transition-colors duration-[140ms] cursor-pointer ${
                fixedMode === "scan"
                  ? "bg-[--color-forest] text-white"
                  : "text-[--color-muted] hover:text-[--color-foreground] hover:bg-[--color-surface-muted]"
              }`}
              aria-selected={fixedMode === "scan"}
            >
              <QrCode size={16} aria-hidden="true" />
              Scan QR Code
            </button>
            <button
              id="tab-manual-token"
              type="button"
              role="tab"
              onClick={() => {
                setFixedMode("manual")
                setResult(null)
              }}
              className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-[650] transition-colors duration-[140ms] cursor-pointer ${
                fixedMode === "manual"
                  ? "bg-[--color-forest] text-white"
                  : "text-[--color-muted] hover:text-[--color-foreground] hover:bg-[--color-surface-muted]"
              }`}
              aria-selected={fixedMode === "manual"}
            >
              <Keyboard size={16} aria-hidden="true" />
              Enter Token
            </button>
          </div>

          <div className="p-6">
            {/* Camera Mode */}
            {fixedMode === "scan" && (
              <div className="space-y-4">
                <p className="text-xs text-[--color-muted]">
                  Point camera at the member&apos;s digital Inlo pass. Single-use token is invalidated instantly upon admittance.
                </p>

                {!result && (
                  <QRScanner
                    key={scannerKey}
                    onScan={handleQRScan}
                    active={fixedMode === "scan" && !isPending}
                  />
                )}

                {isPending && (
                  <div className="flex flex-col items-center gap-2 py-8 text-[--color-muted]">
                    <div className="w-8 h-8 rounded-full border-2 border-[--color-forest] border-t-transparent animate-spin" />
                    <span className="text-xs">Verifying pass cryptographic token…</span>
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

            {/* Manual Token Mode */}
            {fixedMode === "manual" && (
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

                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-[--color-muted]">
                  <span>Pilot test:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setToken("pass_pilot_demo_7f9b2a14")
                      setResult(null)
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[--radius-sm] bg-[--color-surface-muted] hover:bg-[--color-border] text-[--color-foreground] font-mono transition-colors text-xs border border-[--color-border] cursor-pointer"
                  >
                    Use demo token
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── MAIN TAB 2: GYM ENTRY / EXIT METERING DESK ────────────────────── */}
      {mainTab === "gym-metering" && (
        <div className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] overflow-hidden shadow-sm space-y-6 p-6">
          {/* Header & Disclosures */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[--color-border]">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="forest">Gym Hybrid Metering</Badge>
                <span className="text-xs text-[--color-muted] font-[600]">
                  {meteringVenue.name}
                </span>
              </div>
              <h2 className="text-h3 font-[750] text-[--color-foreground] mt-1">
                Entry / Exit Attendance &amp; Capped Billing
              </h2>
            </div>

            {/* Rate card snapshot disclosure */}
            <div className="rounded-[--radius-md] border border-[--color-forest]/30 bg-[--color-forest]/5 px-3 py-2 text-xs">
              <span className="font-[700] text-[--color-forest] block">
                Rate Card (v1.0)
              </span>
              <span className="text-[11px] text-[--color-muted]">
                4 credits / 30m · Min: 4 credits · <strong>Hard Cap: 16 credits max</strong>
              </span>
            </div>
          </div>

          {/* Sub Navigation */}
          <div className="grid grid-cols-3 gap-1 bg-[--color-surface-muted] p-1 rounded-[--radius-md] text-xs">
            <button
              type="button"
              onClick={() => setMeteringMode("entry")}
              className={`py-2 rounded-[--radius-sm] font-[650] transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                meteringMode === "entry"
                  ? "bg-white text-[--color-foreground] shadow-xs"
                  : "text-[--color-muted] hover:text-[--color-foreground]"
              }`}
            >
              <UserCheck size={14} />
              <span>Admit Member (Entry)</span>
            </button>

            <button
              type="button"
              onClick={() => setMeteringMode("exit")}
              className={`py-2 rounded-[--radius-sm] font-[650] transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                meteringMode === "exit"
                  ? "bg-white text-[--color-foreground] shadow-xs"
                  : "text-[--color-muted] hover:text-[--color-foreground]"
              }`}
            >
              <LogOut size={14} />
              <span>Checkout Member (Exit)</span>
            </button>

            <button
              type="button"
              onClick={() => setMeteringMode("live-floor")}
              className={`py-2 rounded-[--radius-sm] font-[650] transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                meteringMode === "live-floor"
                  ? "bg-white text-[--color-foreground] shadow-xs"
                  : "text-[--color-muted] hover:text-[--color-foreground]"
              }`}
            >
              <Users size={14} />
              <span>Currently In Gym ({activeSessions.length})</span>
            </button>
          </div>

          {/* ── SUB-MODE: ADMIT MEMBER (ENTRY) ── */}
          {meteringMode === "entry" && (
            <div className="space-y-4 rounded-[--radius-md] border border-[--color-border] bg-[--color-surface-muted]/40 p-5">
              <div className="space-y-1">
                <h3 className="text-sm font-[700] text-[--color-foreground]">
                  Admit Member to Gym Floor
                </h3>
                <p className="text-xs text-[--color-muted]">
                  Verifies credit eligibility, checks for duplicate active sessions, and records authoritative server check-in time.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Input
                  value={meteringTargetUser}
                  onChange={(e) => setMeteringTargetUser(e.target.value)}
                  placeholder="Enter Member ID (e.g. user-member-1)"
                  className="bg-white font-mono text-xs flex-1"
                />
                <Button
                  type="button"
                  variant="primary"
                  loading={isPending}
                  disabled={isPending || !meteringTargetUser.trim()}
                  onClick={handleMeteringEntry}
                  className="font-[700]"
                >
                  <UserCheck size={15} />
                  Admit &amp; Start Timer
                </Button>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-[--color-muted] pt-1">
                <span>Demo shortcuts:</span>
                <button
                  type="button"
                  onClick={() => setMeteringTargetUser("user-member-1")}
                  className="px-2 py-0.5 rounded bg-white border border-[--color-border] hover:border-[--color-forest] cursor-pointer"
                >
                  user-member-1 (Member)
                </button>
              </div>
            </div>
          )}

          {/* ── SUB-MODE: CHECKOUT MEMBER (EXIT) ── */}
          {meteringMode === "exit" && (
            <div className="space-y-4 rounded-[--radius-md] border border-[--color-border] bg-[--color-surface-muted]/40 p-5">
              <div className="space-y-1">
                <h3 className="text-sm font-[700] text-[--color-foreground]">
                  Checkout Member (Exit Scan)
                </h3>
                <p className="text-xs text-[--color-muted]">
                  Computes authoritative server elapsed duration, enforces the 16-credit hard cap, and debits the member&apos;s ledger atomically.
                </p>
              </div>

              {activeSessions.length > 0 ? (
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-[600] text-[--color-muted] uppercase">
                    Select active member exiting:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeSessions.map((sess) => {
                      const start = new Date(sess.startedAt)
                      const referenceTime = nowTimestamp || start.getTime()
                      const elapsedMins = Math.max(
                        1,
                        Math.round((referenceTime - start.getTime()) / 60000)
                      )

                      return (
                        <div
                          key={sess.id}
                          className="p-3 rounded-[--radius-md] border border-[--color-border] bg-white flex items-center justify-between shadow-xs"
                        >
                          <div>
                            <p className="font-mono font-[700] text-xs text-[--color-foreground]">
                              {sess.userId}
                            </p>
                            <p className="text-[11px] text-[--color-muted] flex items-center gap-1 mt-0.5">
                              <Timer size={12} className="text-[--color-forest]" />
                              <span>{elapsedMins} mins elapsed</span>
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="secondary"
                            loading={isPending}
                            disabled={isPending}
                            onClick={() => handleMeteringExit(sess.id)}
                            className="text-xs font-[650]"
                          >
                            <LogOut size={13} className="mr-1" />
                            Checkout
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[--color-muted] italic py-2">
                  No active members currently checked into this gym.
                </p>
              )}
            </div>
          )}

          {/* ── SUB-MODE: LIVE FLOOR OCCUPANCY ── */}
          {meteringMode === "live-floor" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-[700] text-[--color-foreground]">
                  Live Gym Floor Status
                </span>
                <span className="text-xs text-[--color-forest] font-[700]">
                  {activeSessions.length} active sessions
                </span>
              </div>

              {activeSessions.length > 0 ? (
                <div className="divide-y divide-[--color-border] rounded-[--radius-md] border border-[--color-border] bg-white overflow-hidden">
                  {activeSessions.map((sess) => {
                    const start = new Date(sess.startedAt)
                    const referenceTime = nowTimestamp || start.getTime()
                    const elapsedMins = Math.max(
                      1,
                      Math.round((referenceTime - start.getTime()) / 60000)
                    )

                    return (
                      <div
                        key={sess.id}
                        className="p-3.5 flex items-center justify-between text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-[700] text-sm text-[--color-foreground]">
                              {sess.userId}
                            </span>
                            <Badge variant="success">IN GYM</Badge>
                          </div>
                          <p className="text-[11px] text-[--color-muted]">
                            Checked in at: {start.toLocaleTimeString("en-IN")} · Token:{" "}
                            <code className="text-[10px] font-mono">{sess.passToken}</code>
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="font-[750] text-[--color-forest] block text-sm">
                              {elapsedMins} mins
                            </span>
                            <span className="text-[10px] text-[--color-muted]">
                              Max cap: 16 credits
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleMeteringExit(sess.id)}
                            disabled={isPending}
                            className="text-xs"
                          >
                            Exit
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="p-6 text-center rounded-[--radius-md] border border-dashed border-[--color-border] text-xs text-[--color-muted]">
                  Gym floor is currently empty. Use the &ldquo;Admit Member&rdquo; tab to check in arriving athletes.
                </div>
              )}
            </div>
          )}

          {/* ── METERING RECEIPT / CONFIRMATION ── */}
          {meteringReceipt && (
            <div className="rounded-[--radius-lg] border-2 border-[--color-forest] bg-[#F0F6F2] p-5 animate-in fade-in space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[--color-forest]">
                  <CheckCircle2 size={20} className="shrink-0" />
                  <span className="font-[750] text-sm uppercase tracking-wide">
                    {meteringReceipt.action === "ENTRY"
                      ? "Entry Approved · Timer Active"
                      : "Exit Confirmed · Ledger Debited"}
                  </span>
                </div>
                {meteringReceipt.capped && (
                  <Badge variant="accent">Hard Capped at Max</Badge>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                <div>
                  <span className="text-[10px] text-[--color-muted] font-[600] uppercase block">
                    Member ID
                  </span>
                  <span className="font-mono font-[700] text-[--color-foreground]">
                    {meteringReceipt.session.userId}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-[--color-muted] font-[600] uppercase block">
                    Venue
                  </span>
                  <span className="font-[650] text-[--color-foreground]">
                    {meteringReceipt.session.venueName}
                  </span>
                </div>

                {meteringReceipt.action === "EXIT" && (
                  <>
                    <div>
                      <span className="text-[10px] text-[--color-muted] font-[600] uppercase block">
                        Elapsed Duration
                      </span>
                      <span className="font-[750] text-[--color-foreground]">
                        {meteringReceipt.durationMinutes} mins
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-[--color-muted] font-[600] uppercase block">
                        Credits Debited
                      </span>
                      <span className="font-[800] text-[--color-forest] text-sm">
                        {meteringReceipt.creditsDebited} credits
                      </span>
                    </div>
                  </>
                )}
              </div>

              <p className="text-[11px] text-[--color-muted] pt-1">
                {meteringReceipt.message}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── FIXED PASS RESULT MODAL/CARD ──────────────────────────────────── */}
      {result && (
        <div>
          {result.success && result.booking ? (
            <div className="rounded-[--radius-lg] border-2 border-[#244638] bg-[#F0F6F2] p-6 animate-in fade-in">
              <div className="flex items-center gap-2 text-[--color-forest] mb-4">
                <CheckCircle2 size={24} className="shrink-0" />
                <span className="font-[700] text-base uppercase tracking-wide">
                  Pass Confirmed · Entry Approved
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[--color-foreground]">
                <div>
                  <p className="text-[--color-muted] font-[600] uppercase text-[10px] mb-1">
                    Session
                  </p>
                  <p className="font-[650] text-sm">
                    {result.booking.activityNameSnapshot}
                  </p>
                  <p className="text-[--color-muted]">
                    {result.booking.venueNameSnapshot} ·{" "}
                    {result.booking.venueLocalitySnapshot}
                  </p>
                </div>
                <div>
                  <p className="text-[--color-muted] font-[600] uppercase text-[10px] mb-1">
                    Member
                  </p>
                  <p className="font-mono text-sm">{result.booking.userId}</p>
                  <p className="text-[--color-forest] font-[650]">
                    {result.booking.creditsDebited} credits · ₹
                    {(result.booking.creditsDebited * 70).toLocaleString("en-IN")}{" "}
                    payout
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
            <div className="rounded-[--radius-lg] border-2 border-[#B33B32] bg-[#FDF2F2] p-6 animate-in fade-in">
              <div className="flex items-start gap-3 text-[--color-danger]">
                <AlertTriangle size={22} className="shrink-0 mt-0.5" />
                <div>
                  <p className="font-[700] text-sm uppercase tracking-wide">
                    Admission Denied
                  </p>
                  <p className="text-xs text-[--color-foreground] mt-1">
                    {result.message}
                  </p>
                  <p className="text-[11px] text-[--color-muted] mt-2">
                    Verify that the pass has not expired or been previously used.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── RECENT CHECK-INS AUDIT ────────────────────────────────────────── */}
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
              <div
                key={idx}
                className="py-2.5 flex items-center justify-between text-xs"
              >
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
                  <span className="text-[--color-muted] tabular-nums">
                    {entry.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
