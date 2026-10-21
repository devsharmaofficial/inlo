import type { Metadata } from "next"
import Link from "next/link"
import { MapPin, Clock, ArrowRight } from "lucide-react"
import { PILOT_VENUES } from "@/features/catalogue/pilot-seed"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "My Venues | Partner Portal",
  description: "View and manage venues assigned to your partner account.",
}

// In Phase 3, this resolves from partner session. Using pilot partner "part-01" (The Hub Sports) as default.
export default async function PartnerVenuesPage() {
  const currentPartnerId = "part-01"
  const partnerVenues = PILOT_VENUES.filter((v) => v.partnerId === currentPartnerId)

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-h2 text-[--color-foreground] mb-1">My Venues</h1>
          <p className="text-body text-[--color-muted]">
            Venues assigned to your partner organisation.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {partnerVenues.map((venue) => (
          <div
            key={venue.id}
            className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] p-6 shadow-sm space-y-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <h2 className="text-h3 text-[--color-foreground]">{venue.name}</h2>
                  <Badge variant="success">Approved</Badge>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[--color-muted]">
                  <MapPin size={13} className="text-[--color-forest]" aria-hidden="true" />
                  <span>
                    {venue.addressLine1}, {venue.locality}, {venue.city}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button asChild variant="secondary" size="sm">
                  <Link href={`/venues/${venue.slug}`} target="_blank">
                    Public listing
                    <ArrowRight size={13} className="ml-1" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Offerings and Capacity Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-4 border-t border-[--color-border]">
              {venue.offerings.map((off) => (
                <div
                  key={off.id}
                  className="rounded-[--radius-md] border border-[--color-border] bg-[--color-surface-muted] p-3 text-xs"
                >
                  <p className="font-[650] text-[--color-foreground] mb-1">
                    {off.activityName}
                  </p>
                  <p className="text-[--color-forest] font-[600]">
                    {off.creditCost} credits / slot
                  </p>
                  <div className="mt-1 flex items-center gap-1 text-[--color-muted] text-[11px]">
                    <Clock size={11} aria-hidden="true" />
                    <span>{off.durationMinutes} minutes</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-[--color-muted]">
              <span>Partner ID: <code className="text-data">{venue.partnerId}</code></span>
              <span>Updated {new Date(venue.updatedAt).toLocaleDateString("en-IN")}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
