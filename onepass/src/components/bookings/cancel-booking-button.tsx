"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle } from "lucide-react"
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
import { cancelBookingAction } from "@/app/actions/booking-actions"

interface CancelBookingButtonProps {
  bookingId: string
  creditsToRefund: number
}

export function CancelBookingButton({
  bookingId,
  creditsToRefund,
}: CancelBookingButtonProps) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleCancel = async () => {
    setLoading(true)
    setError(null)

    const res = await cancelBookingAction(bookingId)
    setLoading(false)

    if (res.success) {
      setOpen(false)
      router.refresh()
    } else {
      setError(res.error || "Failed to cancel booking.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-[--color-danger] hover:bg-[--color-danger]/10">
          Cancel booking
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[--color-danger]/10 text-[--color-danger] mb-2">
            <AlertTriangle size={20} />
          </div>
          <DialogTitle className="text-h2">Cancel this session?</DialogTitle>
          <DialogDescription className="text-body text-[--color-muted]">
            Cancelling will release your reserved slot. Since this session is within the cancellation window,
            <strong className="text-[--color-foreground]"> {creditsToRefund} credits</strong> will be instantly refunded to your balance.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 rounded-[--radius-sm] bg-[--color-danger]/10 border border-[--color-danger]/20 text-xs text-[--color-danger]">
            {error}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Keep booking
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleCancel}
            loading={loading}
          >
            Yes, cancel and refund
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
