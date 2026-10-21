import type { Metadata } from "next"
import Link from "next/link"
import { PILOT_VENUES } from "@/features/catalogue/pilot-seed"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, CheckCircle2, ArrowRight } from "lucide-react"

export const metadata: Metadata = { title: "Venue moderation — Admin" }

export default function AdminVenuesPage() {
  return (
    <div className="p-6 md:p-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-[--color-border]">
        <div>
          <h1 className="text-h2 text-[--color-foreground] mb-1">Venue moderation</h1>
          <p className="text-body text-[--color-muted]">
            Review, approve, and audit verified partner venues across Bengaluru pilot localities.
          </p>
        </div>

        <Badge variant="outline" className="text-xs">
          {PILOT_VENUES.length} Verified Venues
        </Badge>
      </div>

      <div className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[--color-surface-muted] border-b border-[--color-border] text-[--color-muted] uppercase font-[650]">
              <tr>
                <th className="px-5 py-3">Venue Name</th>
                <th className="px-5 py-3">Locality</th>
                <th className="px-5 py-3">Partner ID</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[--color-border]">
              {PILOT_VENUES.map((venue) => (
                <tr key={venue.id} className="hover:bg-[--color-surface-muted]/50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-[650] text-sm text-[--color-foreground]">{venue.name}</p>
                    <p className="text-[11px] text-[--color-muted] font-mono mt-0.5">{venue.id}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1 text-[--color-foreground]">
                      <MapPin size={12} className="text-[--color-forest]" />
                      {venue.locality}
                    </span>
                    <p className="text-[11px] text-[--color-muted] truncate max-w-xs">{venue.addressLine1}</p>
                  </td>
                  <td className="px-5 py-4 font-mono text-[--color-muted]">
                    {venue.partnerId}
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant={venue.status === "approved" ? "success" : "default"}>
                      <CheckCircle2 size={11} className="mr-1" />
                      {venue.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Button asChild variant="secondary" size="sm">
                      <Link href={`/venues/${venue.slug}`}>
                        Public View <ArrowRight size={12} className="ml-1" />
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
