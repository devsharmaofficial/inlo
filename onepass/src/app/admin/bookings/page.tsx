import type { Metadata } from "next"
import { getMemberBookings } from "@/features/bookings/booking-engine"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Clock } from "lucide-react"

export const metadata: Metadata = { title: "Booking operations — Admin" }

export default async function AdminBookingsPage() {
  const bookings = await getMemberBookings("user-member-1")

  return (
    <div className="p-6 md:p-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-[--color-border]">
        <div>
          <h1 className="text-h2 text-[--color-foreground] mb-1">Booking operations</h1>
          <p className="text-body text-[--color-muted]">
            Real-time session reservations, capacity locks, and check-in status across venues.
          </p>
        </div>

        <Badge variant="outline" className="text-xs">
          {bookings.length} Tracked Bookings
        </Badge>
      </div>

      <div className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[--color-surface-muted] border-b border-[--color-border] text-[--color-muted] uppercase font-[650]">
              <tr>
                <th className="px-5 py-3">Booking Reference</th>
                <th className="px-5 py-3">Member</th>
                <th className="px-5 py-3">Activity &amp; Venue</th>
                <th className="px-5 py-3">Schedule</th>
                <th className="px-5 py-3">Credits</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[--color-border]">
              {bookings.map((b) => {
                const start = new Date(b.slotStartsAtSnapshot)
                const end = new Date(b.slotEndsAtSnapshot)

                return (
                  <tr key={b.id} className="hover:bg-[--color-surface-muted]/50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-mono font-[650] text-sm text-[--color-foreground]">{b.id}</p>
                      <p className="text-[11px] text-[--color-muted] font-mono mt-0.5">
                        Token: {b.checkinToken.slice(0, 16)}...
                      </p>
                    </td>
                    <td className="px-5 py-4 font-mono text-[--color-foreground]">
                      {b.userId}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-[650] text-[--color-foreground]">{b.activityNameSnapshot}</p>
                      <p className="text-[11px] text-[--color-muted]">
                        {b.venueNameSnapshot} ({b.venueLocalitySnapshot})
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 text-[--color-foreground]">
                        <CalendarDays size={12} className="text-[--color-forest]" />
                        <span>
                          {start.toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-[--color-muted]">
                        <Clock size={11} />
                        <span>
                          {start.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} –{" "}
                          {end.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono font-[650] text-[--color-forest]">
                      {b.creditsDebited}cr
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={b.status === "confirmed" ? "success" : "default"}>
                        {b.status}
                      </Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
