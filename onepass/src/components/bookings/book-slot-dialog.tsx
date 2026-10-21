"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { CalendarDays, AlertCircle, ShieldCheck, Clock } from "lucide-react"
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

  const hasEnoughCredits = userBalance >= creditCost

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
            <span className="text-xs text-[--color-muted]">{venueName}</span>
          </div>
          <DialogTitle className="text-h2">Confirm session booking</DialogTitle>
          <DialogDescription className="text-body text-[--color-muted]">
            Review session timings and credit cost before confirming.
          </DialogDescription>
        </DialogHeader>

        {/* Slot Overview */}
        <div className="space-y-4 py-3">
          <div className="rounded-[--radius-md] border border-[#E2E5DC] bg-[#F7F7F2] p-4 space-y-3 text-[#191B18]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#686D64] flex items-center gap-1.5">
                <Clock size={13} className="text-[#244638]" />
                Timing & Duration
              </span>
              <span className="font-[650] text-[#191B18]">
                {startTimeFormatted} ({durationMinutes} mins)
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-[#E2E5DC]">
              <span className="text-[#686D64]">Cost for this session</span>
              <span className="font-[700] text-[#244638] text-sm tabular-nums">
                {creditCost} credits
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-[#E2E5DC]">
              <span className="text-[#686D64]">Your available balance</span>
              <span className="font-[600] text-[#191B18] tabular-nums">
                {userBalance} credits
              </span>
            </div>
          </div>

          {/* Cancellation Policy Disclosure */}
          <div className="rounded-[--radius-md] bg-white border border-[#E2E5DC] p-3 text-xs space-y-1.5 text-[#191B18]">
            <div className="flex items-center gap-1.5 font-[600] text-[#191B18]">
              <ShieldCheck size={14} className="text-[#244638]" />
              Cancellation policy
            </div>
            <p className="text-[#686D64] leading-relaxed">
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
            <p className="text-xs text-[--color-danger] font-[550]">
              You need {creditCost - userBalance} more credits to book this session.
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
          >
            <CalendarDays size={15} />
            Confirm booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
