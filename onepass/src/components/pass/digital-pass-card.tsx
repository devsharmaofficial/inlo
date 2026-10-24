"use client"

import * as React from "react"
import {
  ShieldCheck,
  QrCode,
  Clock,
  ArrowRight,
  LogOut,
  CheckCircle2,
  RefreshCw,
  Zap,
} from "lucide-react"
import { HoloCard, type HoloCardHandle } from "@/components/ui/holo-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  entryScanAction,
  exitScanAction,
  getActiveUserSessionAction,
  getUserSessionsAction,
} from "@/app/actions/metering-actions"
import type { UsageSession } from "@/types/metering"

interface DigitalPassCardProps {
  initialMemberName?: string
  initialBalance?: number
  memberId?: string
}

const PILOT_TAP_VENUES = [
  { id: "ven-hub-arena", name: "The Hub Sports Arena", tier: "Tier 2", rate: "6 cr/hr", cap: 16, activity: "badminton" },
  { id: "ven-aqualife", name: "AquaLife Aquatic Centre", tier: "Tier 2", rate: "6 cr/hr", cap: 16, activity: "swimming" },
  { id: "ven-iron-movement", name: "Iron & Movement Club", tier: "Tier 1", rate: "4 cr/hr", cap: 12, activity: "gym" },
  { id: "ven-prana-shala", name: "Prana Shala Yoga", tier: "Tier 3", rate: "8 cr/hr", cap: 20, activity: "yoga" },
]

export function DigitalPassCard({
  initialMemberName = "Aryan Sharma",
  initialBalance = 50,
  memberId = "INLO-2026-8491-0428",
}: DigitalPassCardProps) {
  const holoCardRef = React.useRef<HoloCardHandle>(null)
  const [activeSession, setActiveSession] = React.useState<UsageSession | null>(null)
  const [sessionHistory, setSessionHistory] = React.useState<UsageSession[]>([])
  const [isPending, startTransition] = React.useTransition()
  const [actionMessage, setActionMessage] = React.useState<string | null>(null)
  const [nowTimestamp, setNowTimestamp] = React.useState<number>(0)
  const [isCardFlipped, setIsCardFlipped] = React.useState(false)

  // Fetch initial active session and history
  const refreshData = React.useCallback(async () => {
    try {
      const session = await getActiveUserSessionAction()
      setActiveSession(session)
      const history = await getUserSessionsAction()
      setSessionHistory(history)
    } catch {
      // Ignore network errors in demo
    }
  }, [])

  React.useEffect(() => {
    let isMounted = true
    const init = async () => {
      try {
        const session = await getActiveUserSessionAction()
        if (isMounted) setActiveSession(session)
        const history = await getUserSessionsAction()
        if (isMounted) setSessionHistory(history)
      } catch {
        // demo fallback
      }
    }
    const timer = setTimeout(init, 0)
    const interval = setInterval(init, 6000)
    const clockInterval = setInterval(() => {
      setNowTimestamp(Date.now())
    }, 1000)

    return () => {
      isMounted = false
      clearTimeout(timer)
      clearInterval(interval)
      clearInterval(clockInterval)
    }
  }, [])

  // Purely computed elapsed seconds
  const sessionStartedAt = activeSession?.startedAt
  const elapsedSeconds =
    sessionStartedAt && nowTimestamp > 0
      ? Math.max(0, Math.floor((nowTimestamp - new Date(sessionStartedAt).getTime()) / 1000))
      : 0

  // Format seconds to HH:MM:SS
  const formatTimer = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600)
    const mins = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Calculate live estimate for active session
  const estimateLiveDebitedCredits = () => {
    if (!activeSession) return 0
    const durationMins = Math.max(1, Math.ceil(elapsedSeconds / 60))
    // Match 30 min intervals, max capped at quoteMaxCredits
    const units = Math.ceil(durationMins / 30)
    const estimated = units * 3 // default unit estimate
    return Math.min(estimated, activeSession.quoteMaxCredits || 16)
  }

  // Handle simulated tap-in
  const handleTapIn = (venue: (typeof PILOT_TAP_VENUES)[number]) => {
    startTransition(async () => {
      setActionMessage(null)
      const res = await entryScanAction({
        venueId: venue.id,
        venueName: venue.name,
        activitySlug: venue.activity,
      })
      if (res.success) {
        setActionMessage(`Tapped in at ${venue.name}. Your session has started.`)
        await refreshData()
      } else {
        setActionMessage(res.error || res.message)
      }
    })
  }

  // Handle simulated tap-out
  const handleTapOut = () => {
    if (!activeSession) return
    startTransition(async () => {
      setActionMessage(null)
      const res = await exitScanAction({ sessionId: activeSession.id })
      if (res.success) {
        setActionMessage(
          `Tapped out. Duration: ${res.durationMinutes} min. Debited: ${res.creditsDebited} credits.`
        )
        await refreshData()
      } else {
        setActionMessage(res.error || res.message)
      }
    })
  }

  return (
    <div className="space-y-8">
      {/* ── Active Visit Banner (When member is physically in venue) ────── */}
      {activeSession ? (
        <div className="relative overflow-hidden rounded-[--radius-xl] border-2 border-emerald-600/30 bg-emerald-500/10 p-6 md:p-8 backdrop-blur-sm transition-all shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[--radius-pill] bg-emerald-600 text-white text-xs font-[700] tracking-wide uppercase">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                </span>
                <span>In Venue · Live Session Active</span>
              </div>
              <h2 className="text-2xl font-[800] text-[--color-foreground] tracking-tight">
                {activeSession.venueName}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-xs text-[--color-muted] font-[550]">
                <span className="flex items-center gap-1.5">
                  <Clock size={14} className="text-emerald-700" />
                  Started at {new Date(activeSession.startedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
                <span>·</span>
                <span>Disclosed Cap: max {activeSession.quoteMaxCredits} credits</span>
              </div>
            </div>

            {/* Live Counter & Tap Out Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
              <div className="bg-white rounded-[--radius-lg] border border-emerald-600/20 px-5 py-3 text-center shadow-xs">
                <p className="text-[11px] font-[650] uppercase tracking-wider text-[--color-muted]">Elapsed Time</p>
                <p className="font-mono text-2xl font-[800] text-emerald-800 tracking-tight">
                  {formatTimer(elapsedSeconds)}
                </p>
                <p className="text-[10px] text-[--color-muted] font-mono mt-0.5">
                  ~{estimateLiveDebitedCredits()} credits metered
                </p>
              </div>

              <Button
                size="lg"
                variant="primary"
                onClick={handleTapOut}
                disabled={isPending}
                className="bg-emerald-700 hover:bg-emerald-800 text-white gap-2 font-[750] h-auto py-3.5 px-6 shadow-sm"
              >
                <LogOut size={16} />
                <span>Tap Out &amp; End Visit</span>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-[--radius-xl] border border-[--color-border] bg-white p-5 md:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[--color-forest]/10 text-[--color-forest] flex items-center justify-center shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-[750] text-[--color-foreground]">Pass Ready to Tap</p>
                <Badge variant="outline" className="text-[10px] text-emerald-700 border-emerald-600/30 bg-emerald-50 font-[650]">
                  Active
                </Badge>
              </div>
              <p className="text-xs text-[--color-muted]">
                Walk into any partner club and present your pass at the turnstile or reception desk.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => holoCardRef.current?.flip()}
              className="gap-1.5 text-xs font-[650]"
            >
              <QrCode size={14} />
              <span>{isCardFlipped ? "Show Pass Face" : "Show QR Code"}</span>
            </Button>
          </div>
        </div>
      )}

      {/* ── Status Feedback Notification ─────────────────────────────────── */}
      {actionMessage && (
        <div className="p-4 rounded-[--radius-md] bg-[--color-forest]/5 border border-[--color-forest]/20 text-xs flex items-center gap-2 text-[--color-foreground]">
          <CheckCircle2 size={16} className="text-[--color-forest] shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* ── The Digital Inlo Pass (Interactive HoloCard) ────────────────── */}
      <div className="flex flex-col items-center justify-center pt-2 pb-6">
        <HoloCard
          ref={holoCardRef}
          holder={initialMemberName}
          number={memberId}
          expires={`${initialBalance} CREDITS`}
          tier="Titanium Access"
          cardType="pass"
          onReveal={(shown) => setIsCardFlipped(shown)}
        />

        <div className="mt-6 flex flex-wrap justify-center items-center gap-3 text-xs text-[--color-muted]">
          <button
            type="button"
            onClick={() => holoCardRef.current?.flip()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[--color-border] bg-white text-[--color-foreground] hover:border-[--color-forest] font-[600] transition-colors shadow-xs"
          >
            <QrCode size={14} className="text-[--color-forest]" />
            <span>Tap pass or click to flip for scanner QR</span>
          </button>
          <span className="hidden sm:inline">·</span>
          <span>Dynamic cryptographic token refreshes automatically</span>
        </div>
      </div>

      {/* ── Quick Tap-In Demonstration Simulator ─────────────────────────── */}
      {!activeSession && (
        <div className="rounded-[--radius-xl] border border-[--color-border] bg-[--color-surface] p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-sm font-[750] text-[--color-foreground] flex items-center gap-1.5">
                <Zap size={15} className="text-[--color-forest]" />
                Walk-in Tap Simulator
              </h3>
              <p className="text-xs text-[--color-muted]">
                Test the walk-in experience at any Bengaluru pilot venue. Tap to enter, observe live meter, tap to exit.
              </p>
            </div>
            <Badge variant="outline" className="text-[11px] font-mono self-start sm:self-auto">
              Staff Front Desk Mode
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {PILOT_TAP_VENUES.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => handleTapIn(v)}
                disabled={isPending}
                className="group flex flex-col items-start p-4 rounded-[--radius-lg] border border-[--color-border] bg-white hover:border-[--color-forest] hover:shadow-xs transition-all text-left disabled:opacity-50"
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="text-[10px] font-mono font-[700] px-2 py-0.5 rounded-full bg-[--color-forest]/10 text-[--color-forest]">
                    {v.tier}
                  </span>
                  <span className="text-[11px] font-mono text-[--color-muted] font-[600]">
                    {v.rate}
                  </span>
                </div>
                <p className="text-xs font-[750] text-[--color-foreground] group-hover:text-[--color-forest] transition-colors line-clamp-1">
                  {v.name}
                </p>
                <p className="text-[11px] text-[--color-muted] mt-1">
                  Daily Cap: max {v.cap} credits
                </p>
                <div className="mt-3 pt-2 border-t border-[--color-border]/60 w-full flex items-center justify-between text-[11px] font-[650] text-[--color-forest]">
                  <span>Tap in now</span>
                  <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Recent Metered Visits Ledger Receipts ───────────────────────── */}
      <div className="rounded-[--radius-xl] border border-[--color-border] bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-[750] text-[--color-foreground]">Recent Metered Visits</h3>
            <p className="text-xs text-[--color-muted]">
              Immutable audit ledger receipts generated on turnstile exit.
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={refreshData} className="gap-1.5 text-xs text-[--color-muted]">
            <RefreshCw size={13} />
            <span>Refresh</span>
          </Button>
        </div>

        {sessionHistory.length === 0 ? (
          <div className="py-8 text-center border border-dashed border-[--color-border] rounded-[--radius-lg] p-6">
            <p className="text-xs font-[600] text-[--color-foreground]">No completed metered visits yet</p>
            <p className="text-xs text-[--color-muted] mt-1 max-w-sm mx-auto">
              Use your Inlo Pass at any partner club. When you tap out, your itemized duration and credit receipt will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[--color-border] overflow-hidden rounded-[--radius-lg] border border-[--color-border]">
            {sessionHistory.slice(0, 5).map((session) => (
              <div
                key={session.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[--color-surface-muted] transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-[750] text-[--color-foreground]">
                      {session.venueName}
                    </p>
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-mono ${
                        session.status === "completed"
                          ? "text-emerald-700 border-emerald-600/30"
                          : session.status === "active"
                          ? "text-blue-700 border-blue-600/30"
                          : "text-amber-700 border-amber-600/30"
                      }`}
                    >
                      {session.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-[--color-muted] mt-0.5">
                    {new Date(session.startedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    · {session.durationMinutes ? `${session.durationMinutes} minutes` : "Session in progress"}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <p className="font-mono text-sm font-[800] text-[--color-foreground]">
                    {session.creditsDebited ? `-${session.creditsDebited} credits` : "Active"}
                  </p>
                  <p className="text-[11px] text-[--color-muted] font-mono">
                    Token: {session.passToken.slice(0, 12)}…
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
