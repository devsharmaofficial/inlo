import type { Metadata } from "next"
import Link from "next/link"
import { getVenueBookings } from "@/features/bookings/booking-engine"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarDays, Clock, QrCode, User, CheckCircle2 } from "lucide-react"
import { ROUTES } from "@/lib/constants"

export const metadata: Metadata = {
  title: "Venue bookings · Partner portal",
  description: "View scheduled court and session bookings for your venue.",
}

export default async function PartnerBookingsPage() {
  const DEMO_VENUE_ID = "ven-hub-arena"
  const bookings = await getVenueBookings(DEMO_VENUE_ID)

  return (
    <div className="p-6 md:p-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-[--color-border]">
        <div>
          <h1 className="text-h1 text-[--color-foreground] mb-1.5">Venue bookings</h1>
          <p className="text-body text-[--color-muted]">
            Scheduled athlete reservations for The Hub Sports Arena (Domlur).
          </p>
        </div>

        <Button asChild variant="primary" size="sm">
          <Link href={ROUTES.partner.checkin}>
            <QrCode size={14} className="mr-1.5" />
            Open check-in desk
          </Link>
        </Button>
      </div>

      {/* Bookings List */}
      {bookings.length > 0 ? (
        <div className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] overflow-hidden shadow-sm">
          <div className="divide-y divide-[--color-border]">
            {bookings.map((b) => {
              const start = new Date(b.slotStartsAtSnapshot)
              const end = new Date(b.slotEndsAtSnapshot)

              return (
                <div key={b.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          b.status === "completed"
                            ? "success"
                            : b.status === "confirmed"
                            ? "default"
                            : "outline"
                        }
                      >
                        {b.status === "completed"
                          ? "Checked in"
                          : b.status === "confirmed"
                          ? "Confirmed"
                          : b.status}
                      </Badge>
                      <span className="font-[650] text-sm text-[--color-foreground]">
                        {b.activityNameSnapshot}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[--color-muted]">
                      <span className="flex items-center gap-1">
                        <CalendarDays size={13} className="text-[--color-forest]" />
                        {start.toLocaleDateString("en-IN", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={13} className="text-[--color-forest]" />
                        {start.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} –{" "}
                        {end.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <span className="flex items-center gap-1">
                        <User size={13} className="text-[--color-forest]" />
                        Member: {b.userId}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div className="text-right">
                      <p className="font-[700] text-[--color-forest]">
                        +{b.creditsDebited} credits
                      </p>
                      <p className="text-[10px] text-[--color-muted]">
                        ₹{b.creditsDebited * 70} payout
                      </p>
                    </div>

                    {b.status === "confirmed" ? (
                      <Button asChild variant="secondary" size="sm">
                        <Link href={ROUTES.partner.checkin}>
                          Verify pass
                        </Link>
                      </Button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-[--color-forest] font-[600]">
                        <CheckCircle2 size={13} /> Admitted
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="p-8 text-center rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] text-xs text-[--color-muted]">
          No bookings scheduled yet for this venue.
        </div>
      )}
    </div>
  )
}
