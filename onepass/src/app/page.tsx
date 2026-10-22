import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowRight,
  MapPin,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Coins,
  Activity,
  Waves,
  Dumbbell,
  Sparkles,
  QrCode,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ROUTES } from "@/lib/constants"
import { getApprovedVenues } from "@/features/catalogue/catalogue-repository"
import { VenueCard } from "@/components/catalogue/venue-card"
import { HeroSearch } from "@/components/home/hero-search"

export const metadata: Metadata = {
  title: "Inlo — A city with more ways to move",
  description:
    "One membership for every court, pool, gym & studio in Bengaluru. Book verified badminton, swimming, functional fitness and yoga with transparent credits.",
}

const ACTIVITIES_LIST = [
  {
    name: "Badminton",
    slug: "badminton",
    tagline: "BWF-certified wooden & synthetic courts",
    rate: "16 credits / hr",
    image: "/images/venues/hub-arena-badminton.webp",
    icon: Activity,
    venueCount: "3 venues in Domlur & Indiranagar",
  },
  {
    name: "Swimming",
    slug: "swimming",
    tagline: "25m heated pools with dedicated lap lanes",
    rate: "18 credits / session",
    image: "/images/venues/aqualife-pool.webp",
    icon: Waves,
    venueCount: "Semi-Olympic pool in Indiranagar",
  },
  {
    name: "Gym & Strength",
    slug: "gym",
    tagline: "Power racks, free weights & open conditioning",
    rate: "12 credits / session (or 4 cr/30m)",
    image: "/images/venues/iron-movement-gym.webp",
    icon: Dumbbell,
    venueCount: "Open gym floor in Koramangala",
  },
  {
    name: "Yoga & Flow",
    slug: "yoga",
    tagline: "Quiet shalas for Vinyasa, Hatha & mobility",
    rate: "14 credits / class",
    image: "/images/venues/prana-shala-yoga.webp",
    icon: Sparkles,
    venueCount: "Boutique studio in Indiranagar",
  },
]

export default async function HomePage() {
  const featuredVenues = (await getApprovedVenues()).slice(0, 3)

  return (
    <div className="bg-[--color-background] text-[--color-foreground]">
      {/* ── 1. EDITORIAL HERO SECTION (design.md §8.A) ───────────────── */}
      <section
        aria-labelledby="hero-heading"
        className="border-b border-[--color-border] bg-[--color-background]"
      >
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 pt-12 pb-16 md:pt-20 md:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Editorial Value & Discovery */}
            <div className="lg:col-span-7 space-y-6">
              {/* Early Locality / Pilot City Context */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[--radius-pill] border border-[--color-forest]/20 bg-[--color-forest]/5 text-xs font-[650] text-[--color-forest]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
                </span>
                <span>Now live in Bengaluru · Domlur, Indiranagar &amp; Koramangala</span>
              </div>

              {/* Specific Promise / Display Headline */}
              <div className="space-y-3">
                <h1
                  id="hero-heading"
                  className="text-display text-4xl sm:text-5xl lg:text-6xl font-[800] tracking-[-0.035em] text-[--color-foreground] leading-[1.04]"
                >
                  A city with more <br />
                  <span className="text-[--color-forest]">ways to move.</span>
                </h1>
                <p className="text-sm sm:text-base font-[700] text-[--color-muted] tracking-wide uppercase">
                  One membership for every court, pool, gym &amp; studio.
                </p>
              </div>

              {/* Compact Editorial Explanation */}
              <p className="text-body-lg text-[--color-muted] max-w-xl text-base sm:text-lg leading-relaxed">
                Instead of buying a separate annual commitment for every facility, use flexible credits to book participating badminton courts, lap pools, functional gyms, and yoga studios across your neighbourhood.
              </p>

              {/* Interactive Discovery Control */}
              <div className="pt-1 pb-1 max-w-xl">
                <HeroSearch />
              </div>

              {/* Clear Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                <Button asChild size="lg" variant="primary" id="hero-cta-explore" className="font-[750] text-sm gap-2">
                  <Link href={ROUTES.explore}>
                    Explore verified venues
                    <ArrowRight size={16} strokeWidth={2.5} aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="secondary" id="hero-cta-plans" className="font-[650] text-sm">
                  <Link href="#credit-breakdown">
                    How credits work
                  </Link>
                </Button>
              </div>

              {/* Honest Operational Invariants (No fake ratings per anti-slop rules) */}
              <div className="pt-6 border-t border-[--color-border] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-[--color-forest] shrink-0" />
                  <div>
                    <p className="font-[750] text-[--color-foreground]">Curated Supply</p>
                    <p className="text-[11px] text-[--color-muted]">Verified venues only</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Zap size={16} className="text-[--color-forest] shrink-0" />
                  <div>
                    <p className="font-[750] text-[--color-foreground]">Atomic Booking</p>
                    <p className="text-[11px] text-[--color-muted]">No double-booking</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-[--color-forest] shrink-0" />
                  <div>
                    <p className="font-[750] text-[--color-foreground]">2h Free Cancel</p>
                    <p className="text-[11px] text-[--color-muted]">Instant credit refund</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Coins size={16} className="text-[--color-forest] shrink-0" />
                  <div>
                    <p className="font-[750] text-[--color-foreground]">Zero Lock-in</p>
                    <p className="text-[11px] text-[--color-muted]">No recurring auto-debit</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Strong Activity Photograph & Editorial Visual Panel */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-[--radius-xl] border-2 border-[--color-border] bg-white p-3 shadow-md overflow-hidden">
                {/* Primary Hero Photograph */}
                <div className="relative aspect-[4/3] w-full rounded-[--radius-lg] overflow-hidden bg-[--color-surface-muted]">
                  <Image
                    src="/images/venues/hub-arena-badminton.webp"
                    alt="The Hub Sports Arena indoor tournament badminton court in Domlur"
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 500px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="inline-block px-2.5 py-0.5 rounded-[--radius-pill] bg-[--color-forest] text-[11px] font-[700] tracking-wide uppercase mb-1">
                      Featured Partner
                    </span>
                    <h3 className="text-lg font-[750] leading-tight text-white">
                      The Hub Sports Arena
                    </h3>
                    <p className="text-xs text-white/80 mt-0.5">
                      BWF Wooden Courts · Domlur · 16 credits / hr
                    </p>
                  </div>
                </div>

                {/* Sub-panel Secondary Venue Inset */}
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="relative aspect-[16/10] rounded-[--radius-md] overflow-hidden bg-[--color-surface-muted]">
                    <Image
                      src="/images/venues/aqualife-pool.webp"
                      alt="AquaLife heated lap pool in Indiranagar"
                      fill
                      sizes="250px"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2 text-white">
                      <p className="text-xs font-[700] truncate">AquaLife Aquatic</p>
                      <p className="text-[10px] text-white/80">Indiranagar · 18 cr</p>
                    </div>
                  </div>

                  <div className="relative aspect-[16/10] rounded-[--radius-md] overflow-hidden bg-[--color-surface-muted]">
                    <Image
                      src="/images/venues/iron-movement-gym.webp"
                      alt="Iron & Movement Club functional fitness gym in Koramangala"
                      fill
                      sizes="250px"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2 text-white">
                      <p className="text-xs font-[700] truncate">Iron &amp; Movement</p>
                      <p className="text-[10px] text-white/80">Koramangala · 12 cr</p>
                    </div>
                  </div>
                </div>

                {/* Pass badge overlay */}
                <div className="mt-3 p-3 rounded-[--radius-md] bg-[--color-surface-muted] border border-[--color-border] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-[--color-forest] text-white flex items-center justify-center shrink-0">
                      <QrCode size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-[750] text-[--color-foreground]">Cryptographic Digital Pass</p>
                      <p className="text-[11px] text-[--color-muted]">Present at reception for instant admittance</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono border-[--color-forest]/30 text-[--color-forest]">
                    RECONCILED
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. CURATED ACTIVITY STRIP (design.md §8.A) ───────────────── */}
      <section
        id="activities"
        aria-labelledby="activities-heading"
        className="border-b border-[--color-border] bg-[--color-surface] py-16 md:py-20"
      >
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <Badge variant="accent" className="mb-2 font-[650]">
                Curated Disciplines
              </Badge>
              <h2 id="activities-heading" className="text-h1 text-[--color-foreground]">
                Explore by Activity
              </h2>
              <p className="text-body text-[--color-muted] max-w-lg mt-1">
                Every venue is physically inspected for tournament-grade standards, clean amenities, and fair access.
              </p>
            </div>
            <Button asChild variant="secondary" size="md">
              <Link href={ROUTES.explore} className="gap-1.5 font-[650]">
                Browse all activities
                <ArrowRight size={15} />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {ACTIVITIES_LIST.map((act) => {
              const Icon = act.icon
              return (
                <Link
                  key={act.slug}
                  href={`/explore?activity=${act.slug}`}
                  className="group relative flex flex-col rounded-[--radius-lg] border border-[--color-border] bg-white overflow-hidden shadow-xs hover:shadow-md hover:border-[--color-forest]/40 transition-all duration-200"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-[--color-surface-muted]">
                    <Image
                      src={act.image}
                      alt={act.name}
                      fill
                      sizes="(max-width: 640px) 100vw, 300px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 p-1.5 rounded-[--radius-sm] bg-white/95 text-[--color-forest] shadow-xs">
                      <Icon size={16} />
                    </div>
                    <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-[--radius-sm] bg-[--color-foreground]/90 text-white text-[11px] font-mono font-[600]">
                      {act.rate}
                    </div>
                  </div>

                  <div className="p-4 flex flex-col justify-between flex-1">
                    <div>
                      <h3 className="text-base font-[750] text-[--color-foreground] group-hover:text-[--color-forest] transition-colors">
                        {act.name}
                      </h3>
                      <p className="text-xs text-[--color-muted] mt-1 line-clamp-2">
                        {act.tagline}
                      </p>
                    </div>
                    <div className="mt-3 pt-3 border-t border-[--color-border] flex items-center justify-between text-[11px] text-[--color-forest] font-[600]">
                      <span>{act.venueCount}</span>
                      <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── 3. HOW IT WORKS (3 STEPS) ─────────────────────────────────── */}
      <section
        id="how-it-works"
        aria-labelledby="how-heading"
        className="border-b border-[--color-border] bg-[--color-background] py-16 md:py-24"
      >
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <Badge variant="accent" className="mb-2 font-[650]">
              Simple &amp; Predictable
            </Badge>
            <h2 id="how-heading" className="text-h1 text-[--color-foreground] mb-2">
              How Inlo Works
            </h2>
            <p className="text-body-lg text-[--color-muted]">
              One pass gives you complete freedom to move between activities across your city on your terms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Step 1 */}
            <div className="rounded-[--radius-lg] border border-[--color-border] bg-white p-6 sm:p-8 flex flex-col justify-between shadow-xs hover:border-[--color-forest]/40 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-3xl font-[800] text-[--color-forest]/25">
                    01
                  </span>
                  <div className="h-10 w-10 rounded-[--radius-md] bg-[--color-forest] text-white flex items-center justify-center">
                    <Coins size={20} />
                  </div>
                </div>
                <h3 className="text-h3 font-[750] text-[--color-foreground] mb-2">
                  Pick your activity pack
                </h3>
                <p className="text-sm text-[--color-muted] leading-relaxed">
                  Purchase flexible credit bundles (20, 50, or 100). No monthly expirations or automatic recurring bank debits.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[--color-border] text-xs font-[600] text-[--color-forest]">
                From ₹70 per credit →
              </div>
            </div>

            {/* Step 2 */}
            <div className="rounded-[--radius-lg] border border-[--color-border] bg-white p-6 sm:p-8 flex flex-col justify-between shadow-xs hover:border-[--color-forest]/40 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-3xl font-[800] text-[--color-forest]/25">
                    02
                  </span>
                  <div className="h-10 w-10 rounded-[--radius-md] bg-[--color-forest] text-white flex items-center justify-center">
                    <MapPin size={20} />
                  </div>
                </div>
                <h3 className="text-h3 font-[750] text-[--color-foreground] mb-2">
                  Choose venue &amp; slot
                </h3>
                <p className="text-sm text-[--color-muted] leading-relaxed">
                  Browse verified local courts, pools, and studios. Lock real-time slots atomically on PostgreSQL—never double-booked.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[--color-border] text-xs font-[600] text-[--color-forest]">
                Guaranteed slot lock →
              </div>
            </div>

            {/* Step 3 */}
            <div className="rounded-[--radius-lg] border border-[--color-border] bg-white p-6 sm:p-8 flex flex-col justify-between shadow-xs hover:border-[--color-forest]/40 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-3xl font-[800] text-[--color-forest]/25">
                    03
                  </span>
                  <div className="h-10 w-10 rounded-[--radius-md] bg-[--color-forest] text-white flex items-center justify-center">
                    <Zap size={20} />
                  </div>
                </div>
                <h3 className="text-h3 font-[750] text-[--color-foreground] mb-2">
                  Scan QR &amp; play
                </h3>
                <p className="text-sm text-[--color-muted] leading-relaxed">
                  Present your scannable check-in pass at the partner desk. For open gyms, enjoy hard-capped metered exit checkout.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[--color-border] text-xs font-[600] text-[--color-forest]">
                Single-use secure pass →
              </div>
            </div>
          </div>

          {/* ── 4. CREDIT ECONOMICS & TRANSPARENCY (PRD §8) ──────────── */}
          <div id="credit-breakdown" className="mt-12 p-6 sm:p-8 rounded-[--radius-xl] border-2 border-[--color-forest]/20 bg-[--color-forest]/5">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <span className="text-[11px] uppercase font-[750] tracking-wider text-[--color-forest] block mb-1">
                  Credit Pricing Transparency (Illustrative Example per PRD §8)
                </span>
                <h3 className="text-h3 font-[750] text-[--color-foreground]">
                  What does an experience actually cost?
                </h3>
                <p className="text-xs text-[--color-muted] mt-1 max-w-xl">
                  Credit costs are strictly upfront before booking. Inlo uses an immutable append-only ledger for 100% auditable accounting.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="px-4 py-2.5 rounded-[--radius-md] bg-white border border-[--color-border] shadow-xs">
                  <p className="text-[11px] font-[600] text-[--color-muted]">Badminton Court</p>
                  <p className="text-sm font-[750] text-[--color-foreground]">16 cr <span className="text-[11px] font-normal text-[--color-muted]">(60 min · 4 players)</span></p>
                </div>
                <div className="px-4 py-2.5 rounded-[--radius-md] bg-white border border-[--color-border] shadow-xs">
                  <p className="text-[11px] font-[600] text-[--color-muted]">Gym Workout</p>
                  <p className="text-sm font-[750] text-[--color-foreground]">12 cr <span className="text-[11px] font-normal text-[--color-muted]">(or 4 cr/30m, max 16 cr)</span></p>
                </div>
                <div className="px-4 py-2.5 rounded-[--radius-md] bg-white border border-[--color-border] shadow-xs">
                  <p className="text-[11px] font-[600] text-[--color-muted]">Olympic Lap Pool</p>
                  <p className="text-sm font-[750] text-[--color-foreground]">18 cr <span className="text-[11px] font-normal text-[--color-muted]">(50-min lane slot)</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. VERIFIED VENUES PREVIEW (design.md §8.A) ──────────────── */}
      <section
        aria-labelledby="featured-venues-heading"
        className="border-b border-[--color-border] bg-[--color-surface] py-16 md:py-24"
      >
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <Badge variant="accent" className="mb-2 font-[650]">
                Verified Partner Network
              </Badge>
              <h2
                id="featured-venues-heading"
                className="text-h1 text-[--color-foreground] mb-2"
              >
                Featured Venues in Bengaluru
              </h2>
              <p className="text-body text-[--color-muted] max-w-lg">
                Audited for cleanliness, court maintenance, certified coaches, and seamless Inlo QR desk admission.
              </p>
            </div>
            <Button asChild variant="secondary" size="md">
              <Link href={ROUTES.explore} className="gap-1.5 font-[650]">
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

      {/* ── 6. DUAL VALUE PROPOSITION: MEMBERS VS VENUE OWNERS ────────── */}
      <section
        aria-labelledby="value-heading"
        className="border-b border-[--color-border] bg-[--color-background] py-16 md:py-24"
      >
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 id="value-heading" className="text-h1 text-[--color-foreground] mb-3">
              Why Bengaluru Athletes &amp; Venues Choose Inlo
            </h2>
            <p className="text-body-lg text-[--color-muted]">
              Everything built for operational fairness, predictable pricing, and zero lock-in.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Member Value Card */}
            <div className="rounded-[--radius-xl] border border-[--color-border] bg-white p-8 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-[--color-forest] font-[750] text-xs uppercase tracking-wider mb-3">
                  <Sparkles size={16} />
                  <span>For Athletes &amp; Members</span>
                </div>
                <h3 className="text-h2 font-[750] text-[--color-foreground] mb-4">
                  Freedom to train however you want.
                </h3>
                <ul className="space-y-3.5 text-sm" role="list">
                  {[
                    "One pass covers badminton, swimming, gym and yoga.",
                    "Exact credit pricing visible before committing — never a surprise.",
                    "Guaranteed slots: atomic reservation prevents double-booking.",
                    "Cancel with a single tap up to 2 hours before session start.",
                    "Instant credit refund into your account on valid cancellations.",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-[--color-foreground] font-[500]">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-[--color-border]">
                <Button asChild variant="primary" size="md" className="w-full">
                  <Link href={ROUTES.membership}>Explore Membership Packs</Link>
                </Button>
              </div>
            </div>

            {/* Venue Partner Value Card */}
            <div className="rounded-[--radius-xl] border border-[--color-border] bg-white p-8 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-[--color-forest] font-[750] text-xs uppercase tracking-wider mb-3">
                  <ShieldCheck size={16} />
                  <span>For Venue Operators &amp; Studios</span>
                </div>
                <h3 className="text-h2 font-[750] text-[--color-foreground] mb-4">
                  Monetize empty slots effortlessly.
                </h3>
                <ul className="space-y-3.5 text-sm" role="list">
                  {[
                    "Fill off-peak morning and afternoon court capacity automatically.",
                    "Guaranteed ₹70/credit bi-weekly direct bank settlements.",
                    "Zero hardware needed: staff scans member pass via phone browser.",
                    "Retain 100% control over blackout dates and court limits.",
                    "Zero setup fees and zero upfront integration costs in pilot.",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle2 size={18} className="text-[--color-forest] shrink-0 mt-0.5" />
                      <span className="text-[--color-foreground] font-[500]">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-[--color-border]">
                <Button asChild variant="secondary" size="md" className="w-full">
                  <Link href="/partner/apply">Apply as Venue Partner</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. BOTTOM CTA ────────────────────────────────────────────── */}
      <section
        aria-labelledby="bottom-cta-heading"
        className="relative overflow-hidden bg-[--color-forest] text-white py-20 md:py-24"
      >
        <div className="relative mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 text-center max-w-2xl mx-auto space-y-6">
          <Badge variant="accent" className="font-[700] px-3 py-1">
            Get Moving Today
          </Badge>
          <h2
            id="bottom-cta-heading"
            className="text-display text-3xl sm:text-4xl md:text-5xl font-[800] text-white"
          >
            Ready to experience fitness with zero lock-in?
          </h2>
          <p className="text-body-lg text-white/80 max-w-xl mx-auto">
            Join the pilot cohort in Bengaluru. Access participating badminton arenas, swimming pools, yoga shalas, and functional gyms near you.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button asChild size="lg" variant="primary" id="bottom-cta-explore" className="w-full sm:w-auto font-[750]">
              <Link href={ROUTES.explore} className="gap-2">
                Browse Venues &amp; Slots
                <ArrowRight size={16} />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border-white/20">
              <Link href={ROUTES.membership}>
                View Credit Packs
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
