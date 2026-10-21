import type { Metadata } from "next"
import Link from "next/link"
import { CalendarDays, MapPin, Users, Clock, ArrowRight } from "lucide-react"
import { PILOT_VENUES } from "@/features/catalogue/pilot-seed"
import { getPartnerVenueSlots } from "@/features/partner/inventory-service"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = { title: "Partner Dashboard | Inlo" }

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

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <Badge variant="forest">Partner Operator</Badge>
          <span className="text-xs text-[--color-muted]">The Hub Sports LLP</span>
        </div>
        <h1 className="text-h2 text-[--color-foreground]">Operations Dashboard</h1>
        <p className="text-body text-[--color-muted]">
          Real-time slot capacity, upcoming member bookings, and venue status.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-[--radius-md] border border-[--color-border] bg-[--color-surface] p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-[--color-muted] mb-2 font-[600]">
            <span>Assigned Venues</span>
            <MapPin size={16} className="text-[--color-forest]" />
          </div>
          <p className="text-h2 text-[--color-foreground]">{partnerVenues.length}</p>
          <p className="text-xs text-[--color-muted] mt-1">Domlur micro-market</p>
        </div>

        <div className="rounded-[--radius-md] border border-[--color-border] bg-[--color-surface] p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-[--color-muted] mb-2 font-[600]">
            <span>Active Slots</span>
            <CalendarDays size={16} className="text-[--color-forest]" />
          </div>
          <p className="text-h2 text-[--color-foreground]">{slots.length}</p>
          <p className="text-xs text-[--color-muted] mt-1">Today & upcoming</p>
        </div>

        <div className="rounded-[--radius-md] border border-[--color-border] bg-[--color-surface] p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-[--color-muted] mb-2 font-[600]">
            <span>Confirmed Bookings</span>
            <Users size={16} className="text-[--color-forest]" />
          </div>
          <p className="text-h2 text-[--color-foreground]">{totalReserved}</p>
          <p className="text-xs text-[--color-muted] mt-1">Across all slots</p>
        </div>

        <div className="rounded-[--radius-md] border border-[--color-border] bg-[--color-surface] p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-[--color-muted] mb-2 font-[600]">
            <span>Capacity Utilisation</span>
            <Clock size={16} className="text-[--color-forest]" />
          </div>
          <p className="text-h2 text-[--color-foreground]">{occupancyRate}%</p>
          <p className="text-xs text-[--color-muted] mt-1">
            {totalReserved} of {totalCapacity} slots filled
          </p>
        </div>
      </div>

      {/* Bookable Schedule List */}
      <div className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] overflow-hidden shadow-sm">
        <div className="p-5 border-b border-[--color-border] flex items-center justify-between">
          <div>
            <h2 className="text-h3 text-[--color-foreground]">Today&apos;s Bookable Slots</h2>
            <p className="text-xs text-[--color-muted]">
              {primaryVenue?.name} · Verified availability
            </p>
          </div>
          <Button asChild variant="secondary" size="sm">
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
                    <span className="font-[650] text-sm text-[--color-foreground]">
                      {start.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })} –{" "}
                      {end.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
                    </span>
                    <Badge variant={isFull ? "danger" : "success"}>
                      {isFull ? "Full" : "Bookable"}
                    </Badge>
                  </div>
                  <p className="text-[--color-muted]">
                    Cut-off: {slot.bookingCutoffMinutes} mins before session · {slot.creditCost} credits
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-[650] text-[--color-foreground]">
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
