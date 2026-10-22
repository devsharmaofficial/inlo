"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import QRCode from "qrcode"
import {
  Timer,
  ShieldCheck,
  MapPin,
  Sparkles,
  LogOut,
  AlertCircle,
  CheckCircle2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { exitScanAction } from "@/app/actions/metering-actions"
import type { UsageSession } from "@/types/metering"

interface ActiveSessionBannerProps {
  session: UsageSession | null
}

export function ActiveSessionBanner({ session: initialSession }: ActiveSessionBannerProps) {
  const [session, setSession] = useState<UsageSession | null>(initialSession)
  const [elapsedMinutes, setElapsedMinutes] = useState(0)
  const [isPending, startTransition] = useTransition()
  const [checkoutReceipt, setCheckoutReceipt] = useState<{
    creditsDebited: number
    durationMinutes: number
    capped: boolean
  } | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Real-time elapsed duration clock
  useEffect(() => {
    if (!session || session.status !== "active") return

    const updateDuration = () => {
      const startMs = new Date(session.startedAt).getTime()
      const nowMs = Date.now()
      const diffMinutes = Math.max(0, Math.floor((nowMs - startMs) / (60 * 1000)))
      setElapsedMinutes(diffMinutes)
    }

    updateDuration()
    const interval = setInterval(updateDuration, 1000)
    return () => clearInterval(interval)
  }, [session])

  // Generate QR code for exit pass
  useEffect(() => {
    if (!session || !canvasRef.current || session.status !== "active") return

    QRCode.toCanvas(canvasRef.current, session.passToken, {
      width: 140,
      margin: 1,
      color: {
        dark: "#0F1A13",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "M",
    }).catch(() => {})
  }, [session])

  if (!session && !checkoutReceipt) {
    return null
  }

  // If checked out just now
  if (checkoutReceipt) {
    return (
      <div className="mb-8 rounded-[--radius-lg] border border-emerald-500/30 bg-emerald-500/10 p-5 sm:p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-emerald-500/20 text-emerald-600 shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-[700] text-[--color-foreground]">
              Checkout Confirmed &amp; Pass Settled
            </h3>
            <p className="text-xs text-[--color-muted] mt-1">
              Your open gym visit has ended. Duration:{" "}
              <strong className="text-[--color-foreground]">{checkoutReceipt.durationMinutes} minutes</strong>.{" "}
              Total billed:{" "}
              <strong className="text-[--color-foreground]">
                {checkoutReceipt.creditsDebited} credits
              </strong>
              {checkoutReceipt.capped ? " (Hard capped at maximum disclosure)" : ""}.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!session) return null

  // Calculate live estimated billable credits
  const ratePerUnit = 4 // standard default 4 credits / 30m
  const unitMinutes = 30
  const billableUnits = Math.max(1, Math.ceil(Math.max(1, elapsedMinutes) / unitMinutes))
  const rawEstCredits = billableUnits * ratePerUnit
  const estCredits = Math.min(rawEstCredits, session.quoteMaxCredits)
  const isCapped = rawEstCredits >= session.quoteMaxCredits

  const handleSelfCheckout = () => {
    startTransition(async () => {
      setErrorMessage(null)
      const res = await exitScanAction({ sessionId: session.id })
      if (res.success) {
        setCheckoutReceipt({
          creditsDebited: res.creditsDebited || estCredits,
          durationMinutes: res.durationMinutes || elapsedMinutes,
          capped: !!res.capped,
        })
        setSession(null)
      } else {
        setErrorMessage(res.error || "Failed to process exit scan")
      }
    })
  }

  return (
    <div className="mb-8 rounded-[--radius-lg] border-2 border-[--color-forest] bg-[--color-surface] p-6 shadow-md relative overflow-hidden">
      {/* Top accent badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-[--color-border]">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
          </span>
          <span className="text-xs font-[700] tracking-wider uppercase text-[--color-forest]">
            Active Open-Ended Gym Visit
          </span>
        </div>
        <Badge variant="outline" className="text-xs border-[--color-forest]/40 bg-[--color-forest]/5 text-[--color-forest]">
          Strict Cap: {session.quoteMaxCredits} Credits Max
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Left col: Venue & Live Timer */}
        <div className="md:col-span-2 space-y-3">
          <div>
            <h2 className="text-h3 font-[750] text-[--color-foreground] flex items-center gap-2">
              {session.venueName}
            </h2>
            <p className="text-xs text-[--color-muted] flex items-center gap-1.5 mt-0.5">
              <MapPin size={13} className="text-[--color-forest]" />
              <span>Checked in at {new Date(session.startedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
            </p>
          </div>

          {/* Live duration & Estimated charge ticker */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-[--radius-md] bg-[--color-surface-muted] border border-[--color-border]">
              <div className="flex items-center gap-1.5 text-[--color-muted] text-xs font-[600]">
                <Timer size={14} className="text-[--color-forest]" />
                <span>Elapsed</span>
              </div>
              <p className="text-h3 font-[800] text-[--color-foreground] tabular-nums mt-1">
                {elapsedMinutes} <span className="text-xs font-[500] text-[--color-muted]">mins</span>
              </p>
            </div>

            <div className="p-3 rounded-[--radius-md] bg-[--color-surface-muted] border border-[--color-border]">
              <div className="flex items-center gap-1.5 text-[--color-muted] text-xs font-[600]">
                <Sparkles size={14} className="text-[--color-forest]" />
                <span>Current Debit</span>
              </div>
              <p className="text-h3 font-[800] text-[--color-forest] tabular-nums mt-1">
                {estCredits}{" "}
                <span className="text-xs font-[500] text-[--color-muted]">
                  credits {isCapped && "(Capped)"}
                </span>
              </p>
            </div>

            <div className="col-span-2 sm:col-span-1 p-3 rounded-[--radius-md] bg-[--color-surface-muted] border border-[--color-border]">
              <div className="flex items-center gap-1.5 text-[--color-muted] text-xs font-[600]">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>Protection</span>
              </div>
              <p className="text-xs text-[--color-muted] mt-1 leading-snug">
                Cap strictly stops at {session.quoteMaxCredits} cr.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 text-xs text-[--color-muted]">
            <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
            <span>
              Authoritative server clock pricing. Never charged more than the disclosed {session.quoteMaxCredits} credit cap.
            </span>
          </div>

          {errorMessage && (
            <div className="p-2.5 rounded-[--radius-sm] bg-red-500/10 border border-red-500/20 text-xs text-red-600 flex items-center gap-2">
              <AlertCircle size={14} />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="pt-2">
            <Button
              onClick={handleSelfCheckout}
              disabled={isPending}
              variant="secondary"
              size="sm"
              className="gap-2 text-xs"
            >
              <LogOut size={14} />
              {isPending ? "Finalizing exit..." : "Checkout now / Exit venue"}
            </Button>
          </div>
        </div>

        {/* Right col: Scannable Exit Pass QR */}
        <div className="flex flex-col items-center justify-center p-4 rounded-[--radius-md] border border-[--color-border] bg-[--color-surface-muted] text-center">
          <p className="text-xs font-[600] text-[--color-foreground] mb-2">
            Exit Pass QR
          </p>
          <div className="p-2 bg-white rounded-md shadow-xs">
            <canvas ref={canvasRef} />
          </div>
          <p className="text-[10px] text-[--color-muted] mt-2 font-mono truncate max-w-[180px]">
            {session.passToken}
          </p>
          <p className="text-[11px] text-[--color-muted] mt-1">
            Scan at desk to exit
          </p>
        </div>
      </div>
    </div>
  )
}
