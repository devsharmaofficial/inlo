import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, MapPin, Zap, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ROUTES, APP_TAGLINE } from "@/lib/constants"
import { getApprovedVenues } from "@/features/catalogue/catalogue-repository"
import { VenueCard } from "@/components/catalogue/venue-card"

export const metadata: Metadata = {
  title: "Inlo — A city with more ways to move",
  description:
    "Discover and book gyms, yoga, swimming, badminton and more across participating venues with one membership.",
}

/**
 * Marketing homepage — design.md §8.A
 *
 * IMPORTANT: No fake venue data, invented ratings, fabricated scarcity
 * or placeholder imagery presented as real partners.
 * This page is for concept communication only until real supply exists.
 *
 * "Do not imitate one reference site wholesale." — design.md §1
 */
export default async function HomePage() {
  const featuredVenues = (await getApprovedVenues()).slice(0, 3)

  return (
    <>
      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section
        aria-labelledby="hero-heading"
        className="relative overflow-hidden"
      >
        {/* Warm editorial background — no gradient blobs */}
        <div className="absolute inset-0 bg-[--color-background]" aria-hidden="true" />

        <div className="relative mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 pt-16 pb-20 md:pt-24 md:pb-28 lg:pt-32 lg:pb-36">
          <div className="max-w-3xl">
            {/* City context — early, per design.md §8.A */}
            <div className="inline-flex items-center gap-1.5 mb-6 px-3 py-1.5 rounded-[--radius-pill] border border-[--color-border] bg-[--color-surface]">
              <MapPin size={13} strokeWidth={2} className="text-[--color-muted]" aria-hidden="true" />
              <span className="text-label text-[--color-muted]">
                Launching in one city — location being finalised
              </span>
            </div>

            <h1
              id="hero-heading"
              className="text-h1 text-[--color-foreground] mb-5"
            >
              {APP_TAGLINE}
            </h1>

            <p className="text-body-lg text-[--color-muted] max-w-xl mb-8">
              One membership that lets you book gyms, yoga, swimming, badminton and
              more at participating venues near you. Real availability, clear
              credit pricing, no guesswork.
            </p>

            {/* Credit explanation — plain language, one example, labelled as example */}
            <div className="mb-8 p-4 rounded-[--radius-md] border border-[--color-border] bg-[--color-surface] max-w-sm">
              <p className="text-label text-[--color-muted] mb-1">Example</p>
              <p className="text-body text-[--color-foreground]">
                A gym session costs <strong className="text-data">12 credits</strong>.
                A swimming slot costs <strong className="text-data">18 credits</strong>.
                Your monthly plan includes a set number of credits to use across
                participating venues — credit costs are shown before you book.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" variant="primary" id="hero-cta-explore">
                <Link href={ROUTES.explore}>
                  Explore activities
                  <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary" id="hero-cta-howitworks">
                <Link href="/#how-it-works">How it works</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────── */}
      <section
        id="how-it-works"
        aria-labelledby="how-heading"
        className="border-t border-[--color-border] bg-[--color-surface]"
      >
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-20 md:py-24">
          <h2 id="how-heading" className="text-h2 text-[--color-foreground] mb-3">
            One membership. Your schedule.
          </h2>
          <p className="text-body-lg text-[--color-muted] mb-14 max-w-xl">
            No separate apps or long-term commitments for every venue.
          </p>

          <ol
            className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10"
            aria-label="How Inlo works"
          >
            {[
              {
                step: "01",
                title: "Choose your area",
                description:
                  "Browse participating venues near a neighbourhood you choose. Filter by activity, date, time and how many credits a session costs.",
                icon: MapPin,
              },
              {
                step: "02",
                title: "See the exact cost",
                description:
                  "Every slot shows the credit cost, duration, venue rules and cancellation terms before you confirm. No hidden pricing.",
                icon: Zap,
              },
              {
                step: "03",
                title: "Book and show up",
                description:
                  "Your booking is confirmed instantly. Show your booking pass at the venue. Credits are deducted only when the booking is confirmed.",
                icon: ShieldCheck,
              },
            ].map(({ step, title, description, icon: Icon }) => (
              <li key={step} className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="text-data text-[--color-muted] tabular-nums"
                  >
                    {step}
                  </span>
                  <div
                    aria-hidden="true"
                    className="h-9 w-9 rounded-[--radius-sm] bg-[--color-surface-muted] flex items-center justify-center"
                  >
                    <Icon size={18} strokeWidth={1.8} className="text-[--color-forest]" />
                  </div>
                </div>
                <div>
                  <h3 className="text-h3 text-[--color-foreground] mb-1.5">{title}</h3>
                  <p className="text-body text-[--color-muted]">{description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── FEATURED VENUES PREVIEW ───────────────────────────────── */}
      <section
        aria-labelledby="featured-venues-heading"
        className="border-t border-[--color-border] bg-[--color-background]"
      >
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-20 md:py-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <h2
                id="featured-venues-heading"
                className="text-h2 text-[--color-foreground] mb-2"
              >
                Verified pilot venues
              </h2>
              <p className="text-body text-[--color-muted] max-w-lg">
                High-standard facilities across Domlur, Indiranagar, and Koramangala.
                Transparent credit costs for every single session.
              </p>
            </div>
            <Button asChild variant="secondary" size="md">
              <Link href={ROUTES.explore} className="gap-1.5">
                View all venues
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredVenues.map((venue) => (
              <VenueCard key={venue.id} venue={venue} />
            ))}
          </div>
        </div>
      </section>

      {/* ── MEMBER + PARTNER VALUE ────────────────────────────────── */}
      <section
        aria-labelledby="value-heading"
        className="border-t border-[--color-border] bg-[--color-background]"
      >
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-20 md:py-24">
          <h2 id="value-heading" className="text-h2 text-[--color-foreground] mb-14">
            For members and venues
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Member value */}
            <div className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] p-8">
              <h3 className="text-h3 text-[--color-foreground] mb-3">Members</h3>
              <ul className="space-y-3" role="list">
                {[
                  "Discover multiple activities without separate memberships",
                  "See the exact credit cost before committing",
                  "Reliable slot availability — no overbooking",
                  "Easy cancellation and clear refund terms",
                  "One booking history for all your activities",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span
                      aria-hidden="true"
                      className="mt-1 h-1.5 w-1.5 rounded-full bg-[--color-accent] flex-shrink-0"
                    />
                    <span className="text-body text-[--color-muted]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Venue / partner value */}
            <div className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] p-8">
              <h3 className="text-h3 text-[--color-foreground] mb-3">Venue partners</h3>
              <ul className="space-y-3" role="list">
                {[
                  "Reach members looking for your type of activity",
                  "Fill off-peak capacity without discounting peak hours",
                  "Simple booking validation and check-in flow",
                  "Clear completed-visit statements for reconciliation",
                  "You control your schedule, capacity and blackout dates",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span
                      aria-hidden="true"
                      className="mt-1 h-1.5 w-1.5 rounded-full bg-[--color-forest] flex-shrink-0"
                    />
                    <span className="text-body text-[--color-muted]">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-5 border-t border-[--color-border]">
                <Button asChild variant="secondary" size="sm" id="partner-enquiry-cta">
                  <Link href="/partner/apply">Enquire about listing your venue</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ────────────────────────────────────────────── */}
      <section
        aria-labelledby="bottom-cta-heading"
        className="border-t border-[#1C382C] bg-[#244638] text-white"
      >
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="max-w-xl">
            <h2
              id="bottom-cta-heading"
              className="text-h2 text-white mb-3 font-[750]"
            >
              Start exploring
            </h2>
            <p className="text-body-lg mb-8 text-white/85">
              Browse participating venues and see what&apos;s available near you.
              Membership plans and pricing will be shown once you&apos;re ready to join.
            </p>
            <Button asChild size="lg" variant="primary" id="bottom-cta-explore">
              <Link href={ROUTES.explore}>
                Explore activities
                <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
