import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  MapPin,
  Clock,
  ShieldCheck,
  Phone,
  Mail,
  ArrowLeft,
  CalendarDays,
  Sparkles,
  CheckCircle2,
} from "lucide-react"
import { getVenueBySlug } from "@/features/catalogue/catalogue-repository"
import { getUserCreditBalance } from "@/features/credits/credit-ledger-service"
import { BookSlotDialog } from "@/components/bookings/book-slot-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ROUTES } from "@/lib/constants"

interface VenuePageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: VenuePageProps): Promise<Metadata> {
  const { slug } = await params
  const venue = await getVenueBySlug(slug)

  if (!venue) {
    return {
      title: "Venue not found",
    }
  }

  return {
    title: `${venue.name} — ${venue.locality}, ${venue.city}`,
    description: venue.shortDescription || venue.description,
  }
}

export default async function VenuePage({ params }: VenuePageProps) {
  const { slug } = await params
  const venue = await getVenueBySlug(slug)

  if (!venue) {
    notFound()
  }

  const balance = await getUserCreditBalance("user-member-1")
  const primaryImage = venue.images.find((img) => img.isPrimary) || venue.images[0]

  return (
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Breadcrumb / Back Navigation */}
      <div className="mb-6">
        <Link
          href={ROUTES.explore}
          className="inline-flex items-center gap-1.5 text-xs font-[600] text-[--color-muted] hover:text-[--color-foreground] transition-colors duration-[140ms]"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Back to all venues
        </Link>
      </div>

      {/* Main Grid: Details (Left) + Offerings & Booking Box (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Venue Information & Visuals (8 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-8">
          {/* Header */}
          <div>
            <div className="text-xs font-[600] text-[--color-forest] uppercase tracking-wider mb-2">
              {venue.locality} · {venue.city}
            </div>

            <h1 className="text-h1 text-[--color-foreground] mb-3">{venue.name}</h1>

            <div className="flex items-center gap-1.5 text-sm text-[--color-muted]">
              <MapPin size={16} strokeWidth={2} className="text-[--color-forest] shrink-0" aria-hidden="true" />
              <span>{venue.addressLine1}, {venue.locality}, {venue.city} {venue.postalCode}</span>
            </div>
          </div>

          {/* Hero Photography Banner */}
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface-muted]">
            {primaryImage ? (
              <Image
                src={primaryImage.url}
                alt={primaryImage.altText || venue.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 800px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-4xl text-[--color-muted]/40 font-[700]">
                {venue.name.charAt(0)}
              </div>
            )}
          </div>

          {/* About Description */}
          <section aria-labelledby="about-heading" className="space-y-3">
            <h2 id="about-heading" className="text-h2 text-[--color-foreground]">
              About this venue
            </h2>
            <p className="text-body text-[--color-muted] leading-relaxed">
              {venue.description}
            </p>
          </section>

          {/* Amenities & Facility Features */}
          <section aria-labelledby="amenities-heading" className="space-y-4">
            <h2 id="amenities-heading" className="text-h2 text-[--color-foreground]">
              Amenities & facilities
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {venue.amenities.map((amenity) => (
                <div
                  key={amenity}
                  className="flex items-center gap-2 rounded-[--radius-md] border border-[--color-border] bg-[--color-surface] p-3 text-xs font-[550] text-[--color-foreground]"
                >
                  <CheckCircle2 size={15} className="text-[--color-forest] shrink-0" aria-hidden="true" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Operating Hours */}
          <section aria-labelledby="hours-heading" className="space-y-4">
            <h2 id="hours-heading" className="text-h2 text-[--color-foreground]">
              Operating hours
            </h2>
            <div className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="border-b border-[--color-border] bg-[--color-surface-muted] text-[--color-muted] font-[600]">
                  <tr>
                    <th className="py-2.5 px-4">Day</th>
                    <th className="py-2.5 px-4">Timings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[--color-border]">
                  {Object.entries(venue.openingHours).map(([day, timings]) => (
                    <tr key={day} className="hover:bg-[--color-surface-muted]/50 transition-colors">
                      <td className="py-2.5 px-4 font-[600] capitalize text-[--color-foreground]">
                        {day}
                      </td>
                      <td className="py-2.5 px-4 text-[--color-muted]">
                        {timings.closed ? (
                          <span className="text-[--color-danger] font-[550]">Closed</span>
                        ) : (
                          `${timings.open} – ${timings.close}`
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Venue Rules & Policies */}
          <section aria-labelledby="rules-heading" className="space-y-3">
            <h2 id="rules-heading" className="text-h2 text-[--color-foreground]">
              Venue rules & entry requirements
            </h2>
            <ul className="space-y-2" role="list">
              {venue.rules.map((rule, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 text-xs text-[--color-muted] leading-relaxed"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[--color-forest] mt-1.5 shrink-0" />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Contact Details */}
          {(venue.phone || venue.email) && (
            <div className="pt-4 border-t border-[--color-border] flex items-center gap-6 text-xs text-[--color-muted]">
              {venue.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone size={13} className="text-[--color-forest]" aria-hidden="true" />
                  <span>{venue.phone}</span>
                </div>
              )}
              {venue.email && (
                <div className="flex items-center gap-1.5">
                  <Mail size={13} className="text-[--color-forest]" aria-hidden="true" />
                  <span>{venue.email}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Bookable Activities & Pricing Card (4/5 cols sticky) */}
        <div className="lg:col-span-5 xl:col-span-4">
          <div className="sticky top-20 space-y-4">
            <Card className="border-[--color-border] bg-[--color-surface] shadow-md">
              <CardContent className="p-6 space-y-6">
                <div>
                  <span className="text-xs font-[600] text-[--color-muted] uppercase tracking-wider">
                    Included with Inlo
                  </span>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-h1 text-[--color-foreground]">
                      {venue.minCredits}
                    </span>
                    {venue.maxCredits > venue.minCredits && (
                      <span className="text-h2 text-[--color-muted]">
                        – {venue.maxCredits}
                      </span>
                    )}
                    <span className="text-body font-[600] text-[--color-muted]">
                      credits / session
                    </span>
                  </div>
                </div>

                {/* Offerings breakdown */}
                <div className="space-y-3 pt-4 border-t border-[--color-border]">
                  <h3 className="text-label text-[--color-foreground]">
                    Bookable activities
                  </h3>

                  <div className="space-y-2.5">
                    {venue.offerings.map((offering) => (
                      <div
                        key={offering.id}
                        className="rounded-[--radius-md] border border-[--color-border] bg-[--color-surface-muted] p-3 text-xs space-y-2"
                      >
                        <div className="flex items-center justify-between font-[600] text-[--color-foreground]">
                          <span>{offering.activityName}</span>
                          <span className="text-data text-xs text-[--color-forest] font-[700]">
                            {offering.creditCost} credits
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[--color-muted] text-[11px]">
                          <Clock size={12} aria-hidden="true" />
                          <span>{offering.durationMinutes} minutes slot</span>
                        </div>
                        {offering.description && (
                          <p className="text-[11px] text-[--color-muted] leading-normal">
                            {offering.description}
                          </p>
                        )}
                        <div className="pt-1">
                          <BookSlotDialog
                            slotId={`slot-${offering.id}`}
                            venueName={venue.name}
                            activityName={offering.activityName}
                            startTimeFormatted="Today, 06:00 AM"
                            durationMinutes={offering.durationMinutes}
                            creditCost={offering.creditCost}
                            userBalance={balance}
                            trigger={
                              <Button variant="secondary" size="sm" className="w-full text-xs">
                                Book {offering.activityName}
                              </Button>
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Booking Call to Action */}
                <div className="pt-2 space-y-2">
                  <BookSlotDialog
                    slotId="slot-hub-1"
                    venueName={venue.name}
                    activityName={venue.offerings[0]?.activityName || "Activity"}
                    startTimeFormatted="Upcoming: Today, 06:00 AM"
                    durationMinutes={venue.offerings[0]?.durationMinutes || 60}
                    creditCost={venue.offerings[0]?.creditCost || venue.minCredits}
                    userBalance={balance}
                    trigger={
                      <Button size="lg" variant="primary" className="w-full">
                        <CalendarDays size={16} strokeWidth={2} aria-hidden="true" />
                        Book next available slot
                      </Button>
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
