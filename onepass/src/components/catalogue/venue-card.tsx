"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { MapPin, Sparkles, ArrowRight } from "lucide-react"
import type { VenueCardData } from "@/types/catalogue"
import { cn } from "@/lib/utils"

export interface VenueCardProps {
  venue: VenueCardData
  className?: string
}

/**
 * VenueCard — Ultra-clean, minimalist presentation.
 * Displays venue tier, hourly rate card, daily cap, and walk-in pass access.
 */
export function VenueCard({ venue, className }: VenueCardProps) {
  const [imageError, setImageError] = React.useState(false)

  const hourlyRate = venue.hourlyCredits ?? Math.round(venue.minCredits / 2) ?? 6
  const dailyCap = venue.dailyCapCredits ?? venue.maxCredits ?? 16
  const tierName = venue.tierLabel ?? (hourlyRate <= 4 ? "Tier 1 · Standard" : hourlyRate <= 6 ? "Tier 2 · Premium" : "Tier 3 · Elite")

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[--radius-xl] border border-[--color-border] bg-white",
        "transition-all duration-[240ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
        "hover:border-[--color-forest]/50 hover:shadow-md hover:-translate-y-0.5",
        className
      )}
    >
      {/* Venue Image Banner */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[--color-surface-muted]">
        {venue.primaryImage && !imageError ? (
          <Image
            src={venue.primaryImage.url}
            alt={venue.primaryImage.altText || venue.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-[360ms] group-hover:scale-[1.03]"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center">
            <span className="text-display text-4xl text-[--color-muted]/40 font-[700]">
              {venue.name.charAt(0)}
            </span>
            <span className="mt-2 text-xs text-[--color-muted]">
              {venue.locality}
            </span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute left-3 top-3 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-mono font-[650] text-white backdrop-blur-md">
            {tierName}
          </span>
          {venue.featured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[--color-forest] px-2 py-0.5 text-[10px] font-[700] text-white uppercase tracking-wider">
              <Sparkles size={10} />
              Featured
            </span>
          )}
        </div>

        {/* Rate Pill Overlay */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
          {venue.hourlyCredits ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1 text-xs font-mono font-[750] text-[--color-foreground] backdrop-blur-sm shadow-xs">
              <span className="text-emerald-700">{venue.hourlyCredits} cr</span>
              <span className="text-[10px] text-[--color-muted] font-normal">/ hr</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-[--radius-sm] bg-[--color-foreground]/90 px-2.5 py-1 text-xs font-[600] text-[--color-background] backdrop-blur-[4px] shadow-sm">
              <span className="text-data text-xs font-[700] text-[--color-accent]">
                {venue.minCredits}
              </span>
              {venue.maxCredits > venue.minCredits ? `–${venue.maxCredits} credits` : " credits"}
            </span>
          )}
        </div>
      </div>

      {/* Venue Details */}
      <div className="flex flex-1 flex-col p-5">
        {/* Locality & Daily Cap */}
        <div className="flex items-center justify-between text-xs text-[--color-muted] mb-2">
          <div className="flex items-center gap-1">
            <MapPin size={13} className="text-[--color-forest] shrink-0" />
            <span className="font-[550]">
              {venue.locality}, {venue.city}
            </span>
          </div>
          <span className="font-mono text-[11px] text-[--color-muted]">
            Cap: max {dailyCap} cr
          </span>
        </div>

        {/* Venue Title with Clickable Overlay Link */}
        <h3 className="text-base font-[750] text-[--color-foreground] mb-1.5 leading-snug group-hover:text-[--color-forest] transition-colors">
          <Link
            href={`/venues/${venue.slug}`}
            className="focus-visible:outline-2 focus-visible:outline-[--color-focus-ring] rounded-[--radius-sm] after:absolute after:inset-0"
          >
            {venue.name}
          </Link>
        </h3>

        {venue.shortDescription && (
          <p className="text-xs text-[--color-muted] line-clamp-2 mb-4 leading-relaxed">
            {venue.shortDescription}
          </p>
        )}

        {/* Activity Chips & Direct Pass Access */}
        <div className="mt-auto pt-3 border-t border-[--color-border] flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {venue.activities.map((act) => (
              <span
                key={act.slug}
                className="text-[11px] font-[550] px-2 py-0.5 rounded-sm bg-[--color-surface-muted] text-[--color-foreground]"
              >
                {act.name}
              </span>
            ))}
          </div>

          <span className="inline-flex items-center gap-1 text-xs font-[700] text-[--color-forest] group-hover:translate-x-0.5 transition-transform shrink-0">
            <span>Pass rates</span>
            <ArrowRight size={13} />
          </span>
        </div>
      </div>
    </article>
  )
}
