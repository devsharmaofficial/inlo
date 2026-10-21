"use client"

import { useState, useTransition } from "react"
import { CheckCircle2, AlertTriangle, ShieldCheck, QrCode, ArrowRight, UserCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { validateCheckinAction } from "@/app/actions/partner-actions"
import type { Booking } from "@/types/booking"

interface CheckinResult {
  success: boolean
  message: string
  booking?: Booking
}

export function CheckinForm() {
  const [token, setToken] = useState("")
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<CheckinResult | null>(null)
  const [recentCheckins, setRecentCheckins] = useState<Array<{
    token: string
    bookingId: string
    activity: string
    time: string
    credits: number
  }>>([])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!token.trim()) return

    startTransition(async () => {
      const res = await validateCheckinAction(token)
      setResult(res)

      if (res.success && res.booking) {
        setRecentCheckins((prev) => [
          {
            token,
            bookingId: res.booking!.id,
            activity: res.booking!.activityNameSnapshot,
            time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
            credits: res.booking!.creditsDebited,
          },
          ...prev.slice(0, 4),
        ])
        setToken("")
      }
    })
  }

  const loadSampleToken = () => {
    setToken("pass_pilot_demo_7f9b2a14")
    setResult(null)
  }

  return (
    <div className="space-y-6">
      {/* Verification Input Card */}
      <div className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-[--radius-md] bg-[--color-forest] text-[--color-chartreuse]">
            <QrCode size={20} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-h3 text-[--color-foreground]">Validate Member Digital Pass</h2>
            <p className="text-xs text-[--color-muted]">
              Enter or scan the cryptographically signed pass token presented by the member.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="pass-token-input" className="block text-label mb-1.5 text-[--color-foreground]">
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
                className="font-mono text-sm uppercase sm:text-base flex-1"
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
                className="shrink-0"
              >
                {isPending ? "Validating..." : "Verify & Admit"}
                <ArrowRight size={16} className="ml-1" />
              </Button>
            </div>
          </div>

          {/* Quick Demo Helper */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-[--color-muted]">
            <span>Pilot Test helper:</span>
            <button
              type="button"
              onClick={loadSampleToken}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[--radius-sm] bg-[--color-surface-muted] hover:bg-[--color-border] text-[--color-foreground] font-mono transition-colors text-xs border border-[--color-border]"
            >
              Use demo pass token (pass_pilot_demo_7f9b2a14)
            </button>
          </div>
        </form>

        {/* Verification Result Feedback */}
        {result && (
          <div className="mt-6 pt-6 border-t border-[--color-border]">
            {result.success && result.booking ? (
              <div className="rounded-[--radius-md] border-2 border-[#244638] bg-[#F0F6F2] p-5">
                <div className="flex items-center gap-2 text-[--color-forest] mb-3">
                  <CheckCircle2 size={22} className="shrink-0" />
                  <span className="font-[700] text-sm uppercase tracking-wide">
                    Pass Confirmed · Entry Approved
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[--color-foreground]">
                  <div>
                    <p className="text-[--color-muted] font-[600] uppercase text-[10px]">Session / Court</p>
                    <p className="font-[650] text-sm text-[--color-foreground] mt-0.5">
                      {result.booking.activityNameSnapshot}
                    </p>
                    <p className="text-[--color-muted]">
                      {result.booking.venueNameSnapshot} · {result.booking.venueLocalitySnapshot}
                    </p>
                  </div>

                  <div>
                    <p className="text-[--color-muted] font-[600] uppercase text-[10px]">Member ID</p>
                    <p className="font-mono text-sm mt-0.5">{result.booking.userId}</p>
                    <p className="text-[--color-forest] font-[600]">
                      {result.booking.creditsDebited} credits redeemed (₹{(result.booking.creditsDebited * 70).toLocaleString("en-IN")} payout)
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#D5E6DA] flex items-center justify-between text-xs text-[--color-muted]">
                  <span className="inline-flex items-center gap-1 font-mono">
                    <ShieldCheck size={14} className="text-[--color-forest]" /> Single-use pass invalidated
                  </span>
                  <span>Booking ref: {result.booking.id}</span>
                </div>
              </div>
            ) : (
              <div className="rounded-[--radius-md] border-2 border-[#B33B32] bg-[#FDF2F2] p-5">
                <div className="flex items-start gap-3 text-[--color-error]">
                  <AlertTriangle size={22} className="shrink-0 mt-0.5" />
                  <div>
                    <p className="font-[700] text-sm uppercase tracking-wide">Admission Denied</p>
                    <p className="text-xs text-[--color-foreground] mt-1">{result.message}</p>
                    <p className="text-[11px] text-[--color-muted] mt-2">
                      Please ask the member to refresh their OnePass digital pass or contact support. Do not admit members without a valid pass.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recent Check-ins Table for this shift */}
      {recentCheckins.length > 0 && (
        <div className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-label font-[650] text-[--color-foreground]">
              Recent Desk Check-ins (Current Shift)
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
                  <span className="text-[--color-muted] tabular-nums">
                    {entry.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Staff Operational Protocol */}
      <div className="rounded-[--radius-md] border border-[--color-border] bg-[--color-surface-muted] p-4 text-xs text-[--color-muted] space-y-2">
        <p className="font-[650] text-[--color-foreground] uppercase tracking-wide text-[11px]">
          Operational Protocols · Pilot Venue Desk
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>Never admit members without an instantaneous green check confirmation on this screen.</li>
          <li>Each digital pass is single-use and invalidates immediately upon redemption.</li>
          <li>Partners receive automated reconciliation credit for every verified admission.</li>
          <li>For disputes or session cancellations, direct members to the support desk via the app.</li>
        </ul>
      </div>
    </div>
  )
}
