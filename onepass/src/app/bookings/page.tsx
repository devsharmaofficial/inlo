import type { Metadata } from "next"
import Link from "next/link"
import { CalendarDays, MapPin, Clock, ArrowRight } from "lucide-react"
import { getMemberBookings } from "@/features/bookings/booking-engine"
import { getUserCreditBalance } from "@/features/credits/credit-ledger-service"
import { getEffectiveUserId } from "@/features/auth/auth-service"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { ROUTES } from "@/lib/constants"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "My bookings",
  description: "View your upcoming, past, and cancelled activity bookings.",
}

interface BookingsPageProps {
  searchParams: Promise<{
    tab?: "upcoming" | "past" | "cancelled"
  }>
}

export default async function BookingsPage({ searchParams }: BookingsPageProps) {
  const { tab = "upcoming" } = await searchParams
  const userId = await getEffectiveUserId()

  const [bookings, balance] = await Promise.all([
    getMemberBookings(userId, tab),
    getUserCreditBalance(userId),
  ])

  return (
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Header and Credit Balance Summary */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-h1 text-[--color-foreground] mb-2">My bookings</h1>
          <p className="text-body text-[--color-muted]">
            Manage your sessions, access digital check-in passes, and view history.
          </p>
        </div>

        {/* Member Credit Account Summary */}
        <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-[--radius-md] border border-[--color-border] bg-[--color-surface] shadow-sm">
          <div>
            <p className="text-[11px] text-[--color-muted] font-[600] uppercase tracking-wider">
              Available Credits
            </p>
            <p className="text-h3 text-[--color-foreground] tabular-nums font-[700]">
              {balance} <span className="text-xs font-[500] text-[--color-muted]">credits</span>
            </p>
          </div>
          <Button asChild variant="secondary" size="sm">
            <Link href={ROUTES.membership}>Add credits</Link>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-2 mb-6 border-b border-[--color-border]"
        role="tablist"
        aria-label="Filter bookings by status"
      >
        {[
          { key: "upcoming", label: "Upcoming" },
          { key: "past", label: "Past" },
          { key: "cancelled", label: "Cancelled" },
        ].map(({ key, label }) => {
          const isActive = tab === key
          return (
            <Link
              key={key}
              href={`/bookings?tab=${key}`}
              role="tab"
              aria-selected={isActive}
              className={cn(
                "px-4 py-2.5 text-sm font-[600] border-b-2 transition-colors duration-[140ms] -mb-px",
                "focus-visible:outline-2 focus-visible:outline-[--color-focus-ring]",
                isActive
                  ? "border-[--color-foreground] text-[--color-foreground]"
                  : "border-transparent text-[--color-muted] hover:text-[--color-foreground]"
              )}
            >
              {label}
            </Link>
          )
        })}
      </div>

      {/* Bookings List or Differentiated Empty State */}
      {bookings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bookings.map((booking) => {
            const start = new Date(booking.slotStartsAtSnapshot)
            const end = new Date(booking.slotEndsAtSnapshot)

            return (
              <div
                key={booking.id}
                className="group relative rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] p-6 shadow-sm hover:shadow-md transition-all duration-[220ms] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <Badge variant={booking.status === "confirmed" ? "success" : "default"}>
                      {booking.status === "confirmed" ? "Confirmed" : booking.status}
                    </Badge>
                    <span className="text-data text-xs text-[--color-forest] font-[700]">
                      {booking.creditsDebited} credits
                    </span>
                  </div>

                  <h2 className="text-h3 text-[--color-foreground] mb-1 font-[650]">
                    {booking.activityNameSnapshot}
                  </h2>
                  <p className="text-body text-xs text-[--color-muted] mb-3">
                    {booking.venueNameSnapshot} · {booking.venueLocalitySnapshot}
                  </p>

                  <div className="space-y-1.5 text-xs text-[--color-foreground]">
                    <div className="flex items-center gap-1.5 text-[--color-muted]">
                      <CalendarDays size={13} className="text-[--color-forest]" />
                      <span>
                        {start.toLocaleDateString("en-IN", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[--color-muted]">
                      <Clock size={13} className="text-[--color-forest]" />
                      <span>
                        {start.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} –{" "}
                        {end.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[--color-muted]">
                      <MapPin size={13} className="text-[--color-forest]" />
                      <span className="truncate">{booking.venueAddressSnapshot}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-[--color-border] flex items-center justify-between">
                  <span className="text-xs text-[--color-muted]">
                    Ref: <code className="text-data text-xs">{booking.id}</code>
                  </span>

                  <Button asChild variant="primary" size="sm">
                    <Link href={`/bookings/${booking.id}`}>
                      View digital pass
                      <ArrowRight size={13} className="ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <EmptyState
          icon={CalendarDays}
          title={
            tab === "upcoming"
              ? "No upcoming bookings"
              : tab === "past"
              ? "No past bookings yet"
              : "No cancelled bookings"
          }
          description={
            tab === "upcoming"
              ? "You don't have any sessions scheduled. Browse verified partner venues near you to book a court or class."
              : "Your completed sessions and attendance history will appear here."
          }
          action={
            tab === "upcoming" ? (
              <Button asChild variant="primary" size="md">
                <Link href={ROUTES.explore}>Explore activities</Link>
              </Button>
            ) : undefined
          }
          className="my-10"
        />
      )}
    </div>
  )
}
