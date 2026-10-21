import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { getBookingById } from "@/features/bookings/booking-engine"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { CancelBookingButton } from "@/components/bookings/cancel-booking-button"
import { ROUTES } from "@/lib/constants"

interface BookingDetailPageProps {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = {
  title: "Booking digital pass & details",
}

export default async function BookingDetailPage({ params }: BookingDetailPageProps) {
  const { id } = await params
  const DEMO_USER_ID = "user-member-1"

  const booking = await getBookingById(DEMO_USER_ID, id)
  if (!booking) {
    notFound()
  }

  const start = new Date(booking.slotStartsAtSnapshot)
  const end = new Date(booking.slotEndsAtSnapshot)
  const isConfirmed = booking.status === "confirmed"
  const isCancelled = booking.status === "cancelled"
  const isCompleted = booking.status === "completed"

  // Cancellation cutoff calculation for policy display
  const cutoffThresholdMs = start.getTime() - booking.policySnapshot.cutoffHours * 60 * 60 * 1000

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Navigation breadcrumb */}
      <div className="mb-6">
        <Link
          href={ROUTES.bookings}
          className="inline-flex items-center gap-1.5 text-xs font-[600] text-[--color-muted] hover:text-[--color-foreground] transition-colors duration-[140ms]"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Back to all bookings
        </Link>
      </div>

      <div className="space-y-6">
        {/* Status Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-[--color-border]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Badge
                variant={
                  isConfirmed
                    ? "success"
                    : isCompleted
                    ? "forest"
                    : isCancelled
                    ? "danger"
                    : "default"
                }
              >
                {isConfirmed && <CheckCircle2 size={12} className="mr-1" />}
                {isCancelled && <XCircle size={12} className="mr-1" />}
                {booking.status.toUpperCase()}
              </Badge>
              <span className="text-xs text-[--color-muted]">
                Ref: <code className="text-data">{booking.id}</code>
              </span>
            </div>
            <h1 className="text-h1 text-[--color-foreground]">
              {booking.activityNameSnapshot}
            </h1>
            <p className="text-body text-[--color-muted]">
              {booking.venueNameSnapshot} · {booking.venueLocalitySnapshot}
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-[--color-muted] font-[600] block">Credits Paid</span>
            <span className="text-h2 text-[--color-forest] font-[700] tabular-nums">
              {booking.creditsDebited} credits
            </span>
          </div>
        </div>

        {/* Digital Check-in Pass Card (Restrained design.md aesthetic) */}
        {isConfirmed && (
          <Card className="border-[--color-border] bg-[--color-surface] shadow-md overflow-hidden">
            <div className="bg-[--color-forest] px-6 py-4 text-[--color-forest-foreground] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode size={18} />
                <span className="text-sm font-[650] tracking-wide">DIGITAL CHECK-IN PASS</span>
              </div>
              <span className="text-xs opacity-80">One-time pass</span>
            </div>

            <CardContent className="p-6 sm:p-8 space-y-6 text-center">
              <div>
                <p className="text-xs text-[--color-muted] mb-1">
                  Show this pass code to front desk staff upon venue arrival:
                </p>
                <div className="my-3 inline-block rounded-[--radius-md] border-2 border-dashed border-[--color-forest]/40 bg-[--color-surface-muted] px-6 py-3">
                  <span className="font-mono text-xl sm:text-2xl font-[700] tracking-wider text-[--color-foreground]">
                    {booking.checkinToken.toUpperCase()}
                  </span>
                </div>
                <p className="text-[11px] text-[--color-muted]">
                  Single-use token. Verified against venue roster at redemption.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Session Details */}
        <div className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] p-6 space-y-4">
          <h2 className="text-h3 text-[--color-foreground]">Session details</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-[--color-muted] flex items-center gap-1.5 font-[600]">
                <CalendarDays size={14} className="text-[--color-forest]" />
                Date
              </span>
              <p className="text-sm font-[650] text-[--color-foreground]">
                {start.toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[--color-muted] flex items-center gap-1.5 font-[600]">
                <Clock size={14} className="text-[--color-forest]" />
                Timing
              </span>
              <p className="text-sm font-[650] text-[--color-foreground]">
                {start.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} –{" "}
                {end.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-[--color-border] space-y-1 text-xs">
            <span className="text-[--color-muted] flex items-center gap-1.5 font-[600]">
              <MapPin size={14} className="text-[--color-forest]" />
              Venue Address
            </span>
            <p className="text-body text-xs text-[--color-foreground]">
              {booking.venueAddressSnapshot}
            </p>
          </div>
        </div>

        {/* Cancellation Policy Snapshot & Actions */}
        <div className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-[--color-forest]" />
              <h2 className="text-h3 text-[--color-foreground]">Policy & cancellation</h2>
            </div>
            {isConfirmed && (
              <CancelBookingButton
                bookingId={booking.id}
                creditsToRefund={booking.creditsDebited}
              />
            )}
          </div>

          <div className="text-xs text-[--color-muted] space-y-2">
            <p>
              Free cancellation cutoff:{" "}
              <strong>
                {new Date(cutoffThresholdMs).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })}
                ,{" "}
                {new Date(cutoffThresholdMs).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </strong>{" "}
              ({booking.policySnapshot.cutoffHours} hours before session start).
            </p>
            {isCancelled && (
              <p className="text-[--color-danger] font-[600]">
                This session was cancelled on {new Date(booking.cancelledAt || "").toLocaleDateString("en-IN")}. Credits were refunded.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
