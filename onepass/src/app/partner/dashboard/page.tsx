import type { Metadata } from "next"
import Link from "next/link"
import { CalendarDays, MapPin, Users, Clock, ArrowRight, QrCode, TrendingUp } from "lucide-react"
import { PILOT_VENUES } from "@/features/catalogue/pilot-seed"
import { getPartnerVenueSlots } from "@/features/partner/inventory-service"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = { title: "Partner Operations Dashboard | Inlo" }

export default async function PartnerDashboardPage() {
  const currentPartnerId = "part-01" // In production: resolved from server session
  const partnerVenues = PILOT_VENUES.filter((v) => v.partnerId === currentPartnerId)
  const primaryVenue = partnerVenues[0]

  const slots = primaryVenue
    ? await getPartnerVenueSlots(currentPartnerId, primaryVenue.id)
    : []

  const totalCapacity = slots.reduce((acc, s) => acc + s.capacity, 0)
  const totalReserved = slots.reduce((acc, s) => acc + s.reservedCount, 0)
  const occupancyRate = totalCapacity > 0 ? Math.round((totalReserved / totalCapacity) * 100) : 0
  const estimatedPayout = totalReserved * 16 * 70 // approx per visit payout

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-5xl">
      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[--color-border]">
        <div>
          <div className="mb-1.5">
            <span className="text-xs text-[--color-forest] font-[700] uppercase tracking-wider">The Hub Sports LLP</span>
          </div>
          <h1 className="text-h1 font-[800] text-[--color-foreground]">Operations Dashboard</h1>
          <p className="text-body text-[--color-muted] text-xs sm:text-sm">
            Live slot occupancy and arrival check-ins.
          </p>
        </div>

        {/* Quick Launch QR Desk */}
        <Button asChild size="lg" variant="primary" className="font-[750] gap-2 shadow-sm shrink-0">
          <Link href="/partner/checkin">
            <QrCode size={18} />
            <span>Launch Check-in Desk</span>
          </Link>
        </Button>
      </div>

      {/* ── KPI METRICS CARDS (Section 4 Component 11) ─────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-[--color-muted] mb-2 font-[650]">
            <span>Assigned Venues</span>
            <MapPin size={16} className="text-[--color-forest]" />
          </div>
          <p className="text-h2 font-[800] text-[--color-foreground]">{partnerVenues.length}</p>
          <p className="text-[11px] text-[--color-muted] mt-1">Domlur micro-market</p>
        </div>

        <div className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-[--color-muted] mb-2 font-[650]">
            <span>Active Slots Today</span>
            <CalendarDays size={16} className="text-[--color-forest]" />
          </div>
          <p className="text-h2 font-[800] text-[--color-foreground]">{slots.length}</p>
          <p className="text-[11px] text-[--color-muted] mt-1">Real-time availability</p>
        </div>

        <div className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-[--color-muted] mb-2 font-[650]">
            <span>Confirmed Bookings</span>
            <Users size={16} className="text-[--color-forest]" />
          </div>
          <p className="text-h2 font-[800] text-[--color-foreground]">{totalReserved}</p>
          <p className="text-[11px] text-[--color-muted] mt-1">Across court schedules</p>
        </div>

        <div className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-[--color-muted] mb-2 font-[650]">
            <span>Capacity Utilisation</span>
            <Clock size={16} className="text-[--color-forest]" />
          </div>
          <p className="text-h2 font-[800] text-[--color-foreground]">{occupancyRate}%</p>
          <p className="text-[11px] text-[--color-muted] mt-1">
            {totalReserved} of {totalCapacity} slots filled
          </p>
        </div>
      </div>

      {/* ── SETTLEMENT BANNER ───────────────────────────────────────── */}
      <div className="rounded-[--radius-xl] border-2 border-[--color-forest]/20 bg-[--color-forest]/5 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-[700] text-[--color-forest] uppercase tracking-wider">
            <TrendingUp size={14} />
            <span>Pilot Bi-Weekly Payout Tracker</span>
          </div>
          <p className="text-base font-[750] text-[--color-foreground]">
            Est. Accrued Payout: ₹{estimatedPayout.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-[--color-muted]">
            Settlement period: 2026-10 · Direct bank transfer with 0% platform take-rate in pilot.
          </p>
        </div>
        <Button asChild variant="secondary" size="sm" className="font-[650] shrink-0">
          <Link href="/partner/statements">View statements &amp; invoices</Link>
        </Button>
      </div>

      {/* ── BOOKABLE SCHEDULE LIST ─────────────────────────────────── */}
      <div className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] overflow-hidden shadow-sm">
        <div className="p-5 border-b border-[--color-border] flex items-center justify-between">
          <div>
            <h2 className="text-h3 font-[750] text-[--color-foreground]">Today&apos;s Bookable Slots</h2>
            <p className="text-xs text-[--color-muted]">
              {primaryVenue?.name} · Verified availability &amp; capacity limits
            </p>
          </div>
          <Button asChild variant="secondary" size="sm" className="font-[650]">
            <Link href="/partner/venues" className="gap-1">
              Manage inventory
              <ArrowRight size={13} aria-hidden="true" />
            </Link>
          </Button>
        </div>

        <div className="divide-y divide-[--color-border]">
          {slots.map((slot) => {
            const start = new Date(slot.startsAt)
            const end = new Date(slot.endsAt)
            const isFull = slot.reservedCount >= slot.capacity

            return (
              <div
                key={slot.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-[750] text-sm text-[--color-foreground]">
                      {start.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })} –{" "}
                      {end.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
                    </span>
                    <Badge variant={isFull ? "danger" : "success"}>
                      {isFull ? "Full" : "Bookable"}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-[--color-muted]">
                    Cut-off: {slot.bookingCutoffMinutes} mins before session · {slot.creditCost} credits
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-[700] text-[--color-foreground]">
                      {slot.reservedCount} / {slot.capacity} booked
                    </p>
                    <p className="text-[11px] text-[--color-muted]">
                      {slot.capacity - slot.reservedCount} spots remaining
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
