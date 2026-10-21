"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { MapPin, Sparkles } from "lucide-react"
import type { VenueCardData } from "@/types/catalogue"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface VenueCardProps {
  venue: VenueCardData
  className?: string
}

/**
 * VenueCard — design.md §7.5 & §8.B.
 *
 * Requirements:
 * - Clear pricing in credits: visible before clicking.
 * - Real locality displayed prominently.
 * - Activity badges showing what this venue provides.
 * - Image fallback when photography is loading or unavailable.
 * - No fake ratings or invented reviews.
 */
export function VenueCard({ venue, className }: VenueCardProps) {
  const [imageError, setImageError] = React.useState(false)

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface]",
        "transition-all duration-[220ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
        "hover:border-[#C4C8BE] hover:shadow-md",
        className
      )}
    >
      {/* Venue Media / Image Banner */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[--color-surface-muted]">
        {venue.primaryImage && !imageError ? (
          <Image
            src={venue.primaryImage.url}
            alt={venue.primaryImage.altText || venue.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-[320ms] group-hover:scale-[1.02]"
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

        {/* Featured Badge */}
        {venue.featured && (
          <div className="absolute left-3 top-3">
            <Badge variant="accent" className="gap-1 shadow-sm font-[650]">
              <Sparkles size={11} aria-hidden="true" />
              Featured
            </Badge>
          </div>
        )}

        {/* Credits Badge Overlay */}
        <div className="absolute bottom-3 right-3">
          <span className="inline-flex items-center gap-1 rounded-[--radius-sm] bg-[--color-foreground]/90 px-2.5 py-1 text-xs font-[600] text-[--color-background] backdrop-blur-[4px] shadow-sm">
            <span className="text-data text-xs font-[700] text-[--color-accent]">
              {venue.minCredits}
            </span>
            {venue.maxCredits > venue.minCredits ? `–${venue.maxCredits}` : ""} credits
          </span>
        </div>
      </div>

      {/* Venue Details */}
      <div className="flex flex-1 flex-col p-5">
        {/* Locality & Location */}
        <div className="flex items-center gap-1 text-xs text-[--color-muted] mb-1.5">
          <MapPin size={13} strokeWidth={2} className="text-[--color-forest]" aria-hidden="true" />
          <span>
            {venue.locality}, {venue.city}
          </span>
        </div>

        {/* Venue Title with Clickable Overlay Link */}
        <h3 className="text-h3 text-[--color-foreground] font-[650] mb-2 leading-snug">
          <Link
            href={`/venues/${venue.slug}`}
            className="focus-visible:outline-2 focus-visible:outline-[--color-focus-ring] rounded-[--radius-sm] after:absolute after:inset-0"
          >
            {venue.name}
          </Link>
        </h3>

        {venue.shortDescription && (
          <p className="text-body text-xs text-[--color-muted] line-clamp-2 mb-4 leading-relaxed">
            {venue.shortDescription}
          </p>
        )}

        {/* Activity Chips */}
        <div className="mt-auto pt-3 border-t border-[--color-border] flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {venue.activities.map((act) => (
              <Badge key={act.slug} variant="default" className="text-[11px] px-2 py-0.5">
                {act.name}
              </Badge>
            ))}
          </div>

          <span className="text-xs font-[600] text-[--color-forest] group-hover:translate-x-0.5 transition-transform duration-[140ms]">
            View slots →
          </span>
        </div>
      </div>
    </article>
  )
}
