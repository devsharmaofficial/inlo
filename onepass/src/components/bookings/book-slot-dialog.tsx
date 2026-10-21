"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { CalendarDays, AlertCircle, ShieldCheck, Clock, Users } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createBookingAction } from "@/app/actions/booking-actions"

interface BookSlotDialogProps {
  slotId: string
  venueName: string
  activityName: string
  startTimeFormatted: string
  durationMinutes: number
  creditCost: number
  userBalance: number
  trigger?: React.ReactNode
}

export function BookSlotDialog({
  slotId,
  venueName,
  activityName,
  startTimeFormatted,
  durationMinutes,
  creditCost,
  userBalance,
  trigger,
}: BookSlotDialogProps) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Group booking state (Component 9 from audit)
  const [inviteFriend, setInviteFriend] = React.useState(false)
  const [friendEmail, setFriendEmail] = React.useState("")

  const totalCost = creditCost
  const hasEnoughCredits = userBalance >= totalCost

  const handleConfirmBooking = async () => {
    if (!hasEnoughCredits) return

    setLoading(true)
    setError(null)

    // Generate unique client idempotency key
    const idempotencyKey = `user-book-${slotId}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`

    const res = await createBookingAction(slotId, idempotencyKey)
    setLoading(false)

    if (res.success && res.bookingId) {
      setOpen(false)
      router.push(`/bookings/${res.bookingId}`)
    } else {
      setError(res.error || "Failed to confirm session booking.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="primary" size="sm">
            Book session
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="accent">{activityName}</Badge>
            <span className="text-xs text-[--color-muted] font-[600]">{venueName}</span>
          </div>
          <DialogTitle className="text-h2 font-[800]">Confirm session reservation</DialogTitle>
          <DialogDescription className="text-body text-[--color-muted] text-xs">
            Review session timings and credit cost before generating your single-use pass.
          </DialogDescription>
        </DialogHeader>

        {/* Slot Overview */}
        <div className="space-y-4 py-2">
          <div className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface-muted]/50 p-4 space-y-3 text-[--color-foreground]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[--color-muted] flex items-center gap-1.5 font-[550]">
                <Clock size={13} className="text-[--color-forest]" />
                Timing &amp; Duration
              </span>
              <span className="font-[700] text-[--color-foreground]">
                {startTimeFormatted} ({durationMinutes} mins)
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-2.5 border-t border-[--color-border]">
              <span className="text-[--color-muted] font-[550]">Cost for this session</span>
              <span className="font-[800] text-[--color-forest] text-sm tabular-nums">
                {creditCost} credits <span className="text-[11px] font-normal text-[--color-muted]">(≈ ₹{creditCost * 70})</span>
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-2.5 border-t border-[--color-border]">
              <span className="text-[--color-muted] font-[550]">Your available balance</span>
              <span className="font-[700] text-[--color-foreground] tabular-nums">
                {userBalance} credits
              </span>
            </div>
          </div>

          {/* Group Booking / Friend Invite Toggle (Section 4 Component 9) */}
          <div className="rounded-[--radius-md] border border-[--color-border] p-3.5 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={15} className="text-[--color-forest]" />
                <span className="text-xs font-[700] text-[--color-foreground]">Bringing a friend or teammate?</span>
              </div>
              <button
                type="button"
                onClick={() => setInviteFriend(!inviteFriend)}
                className={`text-xs font-[650] px-2.5 py-1 rounded-[--radius-pill] transition-colors ${
                  inviteFriend ? "bg-[--color-forest] text-white" : "bg-[--color-surface-muted] text-[--color-muted] hover:text-[--color-foreground]"
                }`}
              >
                {inviteFriend ? "Added" : "+ Invite"}
              </button>
            </div>

            {inviteFriend && (
              <div className="pt-2 border-t border-[--color-border] space-y-2 animate-in fade-in-50">
                <Label htmlFor="friend-email" className="text-[11px] text-[--color-muted]">
                  Friend&apos;s email or phone (optional invite link)
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="friend-email"
                    type="email"
                    placeholder="friend@gmail.com"
                    value={friendEmail}
                    onChange={(e) => setFriendEmail(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <p className="text-[10px] text-[--color-muted]">
                  They will receive a calendar invite and venue directions.
                </p>
              </div>
            )}
          </div>

          {/* Cancellation Policy Disclosure */}
          <div className="rounded-[--radius-md] bg-[--color-surface] border border-[--color-border] p-3 text-xs space-y-1 text-[--color-foreground]">
            <div className="flex items-center gap-1.5 font-[650]">
              <ShieldCheck size={14} className="text-emerald-700" />
              Guaranteed cancellation policy
            </div>
            <p className="text-[11px] text-[--color-muted] leading-relaxed">
              Free cancellation up to <strong>2 hours</strong> before session start.
              Credits will be instantly refunded to your balance.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-[--radius-sm] bg-[--color-danger]/10 border border-[--color-danger]/20 text-xs text-[--color-danger]">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {!hasEnoughCredits && (
            <p className="text-xs text-[--color-danger] font-[600]">
              You need {totalCost - userBalance} more credits to book this session.
            </p>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleConfirmBooking}
            loading={loading}
            disabled={!hasEnoughCredits || loading}
            className="font-[700]"
          >
            <CalendarDays size={15} />
            Confirm {creditCost} credits
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
