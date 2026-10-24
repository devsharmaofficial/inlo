import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowRight,
  QrCode,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/lib/constants"
import { getApprovedVenues } from "@/features/catalogue/catalogue-repository"
import { VenueCard } from "@/components/catalogue/venue-card"
import { HeroSearch } from "@/components/home/hero-search"
import HoloCardDemo from "@/components/ui/demo"

export const metadata: Metadata = {
  title: "Inlo — One Pass. Every Club.",
  description:
    "Universal tap-in / tap-out access to badminton courts, lap pools, gyms, and yoga studios in Bengaluru. Credits exhaust automatically based on venue tier and visit duration.",
}

const DISCIPLINES = [
  {
    name: "Badminton",
    slug: "badminton",
    tier: "Tier 1 & 2",
    rate: "From 4 cr/hr",
    image: "/images/venues/hub-arena-badminton.webp",
    description: "Tournament wooden & synthetic BWF courts in Domlur & Koramangala.",
  },
  {
    name: "Swimming",
    slug: "swimming",
    tier: "Tier 2",
    rate: "6 cr/hr",
    image: "/images/venues/aqualife-pool.webp",
    description: "Semi-Olympic 25m heated pool with ozone filtration in Indiranagar.",
  },
  {
    name: "Strength & Conditioning",
    slug: "gym",
    tier: "Tier 1",
    rate: "4 cr/hr",
    image: "/images/venues/iron-movement-gym.webp",
    description: "Eleiko platforms, power racks, and functional turf on 100ft Road.",
  },
  {
    name: "Yoga & Restorative Flow",
    slug: "yoga",
    tier: "Tier 3",
    rate: "8 cr/hr",
    image: "/images/venues/prana-shala-yoga.webp",
    description: "Natural hardwood shala with cork props in leafy Koramangala.",
  },
]

const TIERS_SUMMARY = [
  {
    name: "Tier 1 · Standard",
    rate: "4 cr / hr",
    cap: "Max 12 cr / visit",
    description: "Functional gym floors, neighborhood synthetic courts, open conditioning.",
    venues: "Iron & Movement Club · Veloce Badminton",
  },
  {
    name: "Tier 2 · Premium",
    rate: "6 cr / hr",
    cap: "Max 16 cr / visit",
    description: "Semi-Olympic heated pools, BWF wooden tournament courts with anti-glare LEDs.",
    venues: "The Hub Sports Arena · AquaLife Aquatic Centre",
  },
  {
    name: "Tier 3 · Elite",
    rate: "8 cr / hr",
    cap: "Max 20 cr / visit",
    description: "Boutique natural hardwood studios, small-group mobility shalas, Olympic platforms.",
    venues: "Prana Shala Yoga",
  },
]

export default async function HomePage() {
  const featuredVenues = (await getApprovedVenues()).slice(0, 3)

  return (
    <div className="bg-[--color-background] text-[--color-foreground]">
      {/* ── 1. MINIMALIST HERO WITH LIVE PASS ──────────────────────────── */}
      <section
        aria-labelledby="hero-heading"
        className="border-b border-[--color-border] bg-white relative overflow-hidden"
      >
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 pt-12 pb-16 md:pt-20 md:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Direct, Confident Value Proposition */}
            <div className="lg:col-span-6 space-y-6">
              {/* Pilot Locality Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[--color-forest]/20 bg-[--color-forest]/5 text-xs font-[650] text-[--color-forest]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
                </span>
                <span>Bengaluru Pilot · Domlur, Indiranagar &amp; Koramangala</span>
              </div>

              {/* Bold Minimalist Headline */}
              <div className="space-y-3">
                <h1
                  id="hero-heading"
                  className="text-4xl sm:text-5xl lg:text-6xl font-[850] tracking-[-0.035em] text-[--color-foreground] leading-[1.05]"
                >
                  One pass. <br />
                  <span className="text-[--color-forest]">Every club.</span>
                </h1>
                <p className="text-base sm:text-lg text-[--color-muted] font-[450] leading-relaxed max-w-xl">
                  Train at multiple venues with one pass.
                </p>
              </div>

              {/* Search Control */}
              <div className="pt-1 pb-1 max-w-xl">
                <HeroSearch />
              </div>

              {/* Direct Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Button asChild size="lg" variant="primary" className="font-[750] text-sm gap-2">
                  <Link href={ROUTES.pass}>
                    <QrCode size={16} />
                    <span>Open Inlo Pass</span>
                  </Link>
                </Button>
                <Button asChild size="lg" variant="secondary" className="font-[650] text-sm">
                  <Link href={ROUTES.explore}>
                    <span>View clubs &amp; rates</span>
                    <ArrowRight size={15} />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right Column: Tactile Holographic Pass Demo */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-[--radius-2xl] border border-[--color-border] bg-[#F7F7F2] p-4 sm:p-6 shadow-sm overflow-hidden flex flex-col items-center">
                <div className="w-full flex items-center justify-between mb-4 px-2">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-600" />
                    <span className="text-xs font-[700] text-[--color-foreground] uppercase tracking-wider">
                      Digital Pass
                    </span>
                  </div>
                </div>

                <div className="w-full flex justify-center">
                  <HoloCardDemo />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. THE UNIVERSAL TAP-IN / TAP-OUT FLOW ────────────────────── */}
      <section
        id="how-it-works"
        aria-labelledby="flow-heading"
        className="border-b border-[--color-border] bg-[--color-surface] py-16 md:py-24"
      >
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <h2 id="flow-heading" className="text-2xl sm:text-3xl font-[800] text-[--color-foreground] tracking-tight">
              How it works
            </h2>
            <p className="text-sm sm:text-base text-[--color-muted] mt-1.5 leading-relaxed">
              Tap in at the door, train, and tap out. Credits exhaust by visit duration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Step 1 */}
            <div className="rounded-[--radius-xl] border border-[--color-border] bg-white p-6 sm:p-8 flex flex-col justify-between shadow-xs">
              <div>
                <span className="font-mono text-3xl font-[800] text-[--color-forest]/25 block mb-4">
                  01
                </span>
                <h3 className="text-lg font-[750] text-[--color-foreground] mb-2">
                  Tap in at the door
                </h3>
                <p className="text-xs sm:text-sm text-[--color-muted] leading-relaxed">
                  Present your Inlo Pass QR at the front desk. Your session starts instantly.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="rounded-[--radius-xl] border border-[--color-border] bg-white p-6 sm:p-8 flex flex-col justify-between shadow-xs">
              <div>
                <span className="font-mono text-3xl font-[800] text-[--color-forest]/25 block mb-4">
                  02
                </span>
                <h3 className="text-lg font-[750] text-[--color-foreground] mb-2">
                  Train on your schedule
                </h3>
                <p className="text-xs sm:text-sm text-[--color-muted] leading-relaxed">
                  Play badminton, swim laps, lift, or practice yoga. No rigid time slots.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="rounded-[--radius-xl] border border-[--color-border] bg-white p-6 sm:p-8 flex flex-col justify-between shadow-xs">
              <div>
                <span className="font-mono text-3xl font-[800] text-[--color-forest]/25 block mb-4">
                  03
                </span>
                <h3 className="text-lg font-[750] text-[--color-foreground] mb-2">
                  Tap out on departure
                </h3>
                <p className="text-xs sm:text-sm text-[--color-muted] leading-relaxed">
                  Scan out when done. Credits exhaust based on the venue tier, clamped to the daily cap.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. TRANSPARENT VENUE ACCESS TIERS ─────────────────────────── */}
      <section
        aria-labelledby="tiers-heading"
        className="border-b border-[--color-border] bg-white py-16 md:py-24"
      >
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <h2 id="tiers-heading" className="text-2xl sm:text-3xl font-[800] text-[--color-foreground] tracking-tight">
                Access tiers
              </h2>
              <p className="text-sm text-[--color-muted] max-w-lg mt-1">
                Fixed hourly rates and daily caps.
              </p>
            </div>
            <Button asChild variant="secondary" size="md">
              <Link href={ROUTES.pass} className="gap-1.5 font-[650]">
                <span>Open your pass</span>
                <ArrowRight size={15} />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TIERS_SUMMARY.map((t) => (
              <div
                key={t.name}
                className="rounded-[--radius-xl] border border-[--color-border] bg-[#FAFAF8] p-6 sm:p-8 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-[750] text-[--color-forest] bg-[--color-forest]/10 px-2.5 py-1 rounded-full">
                      {t.name}
                    </span>
                    <span className="text-xs font-mono font-[600] text-emerald-800 bg-emerald-100/60 px-2.5 py-0.5 rounded-full">
                      {t.cap}
                    </span>
                  </div>

                  <p className="font-mono text-3xl font-[850] text-[--color-foreground] my-3">
                    {t.rate}
                  </p>

                  <p className="text-xs sm:text-sm text-[--color-muted] leading-relaxed">
                    {t.description}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-[--color-border] text-xs text-[--color-muted]">
                  <span className="font-[650] text-[--color-foreground] block mb-1">Clubs:</span>
                  <span>{t.venues}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. FEATURED CLUBS DIRECTORY ───────────────────────────────── */}
      <section
        aria-labelledby="clubs-heading"
        className="border-b border-[--color-border] bg-[--color-surface] py-16 md:py-24"
      >
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <h2 id="clubs-heading" className="text-2xl sm:text-3xl font-[800] text-[--color-foreground] tracking-tight">
                Featured clubs
              </h2>
            </div>
            <Button asChild variant="secondary" size="md">
              <Link href={ROUTES.explore} className="gap-1.5 font-[650]">
                <span>Browse all venues</span>
                <ArrowRight size={15} />
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

      {/* ── 5. CURATED DISCIPLINES ────────────────────────────────────── */}
      <section
        aria-labelledby="disciplines-heading"
        className="border-b border-[--color-border] bg-white py-16 md:py-20"
      >
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10">
            <h2 id="disciplines-heading" className="text-2xl sm:text-3xl font-[800] text-[--color-foreground] tracking-tight">
              Disciplines
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {DISCIPLINES.map((d) => (
              <Link
                key={d.slug}
                href={`/explore?activity=${d.slug}`}
                className="group flex flex-col rounded-[--radius-xl] border border-[--color-border] bg-[#FAFAF8] overflow-hidden hover:border-[--color-forest] hover:shadow-xs transition-all"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-[--color-surface-muted]">
                  <Image
                    src={d.image}
                    alt={d.name}
                    fill
                    sizes="(max-width: 640px) 100vw, 300px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-mono font-[600] backdrop-blur-sm">
                    {d.tier}
                  </div>
                  <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-full bg-white/95 text-[--color-foreground] text-[11px] font-mono font-[750] shadow-xs">
                    {d.rate}
                  </div>
                </div>

                <div className="p-4 flex flex-col justify-between flex-1">
                  <div>
                    <h3 className="text-sm font-[750] text-[--color-foreground] group-hover:text-[--color-forest] transition-colors">
                      {d.name}
                    </h3>
                    <p className="text-xs text-[--color-muted] mt-1 line-clamp-2">
                      {d.description}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[--color-border] flex items-center justify-between text-xs text-[--color-forest] font-[650]">
                    <span>Explore venues</span>
                    <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. MINIMALIST BOTTOM CTA ──────────────────────────────────── */}
      <section
        aria-labelledby="cta-heading"
        className="bg-[--color-forest] text-white py-16 md:py-20"
      >
        <div className="mx-auto max-w-[960px] px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <h2
            id="cta-heading"
            className="text-3xl sm:text-4xl font-[850] text-white tracking-tight"
          >
            Train anywhere in Bengaluru.
          </h2>
          <p className="text-sm sm:text-base text-white/80 max-w-lg mx-auto">
            Get your pass today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button asChild size="lg" variant="primary" className="w-full sm:w-auto font-[750]">
              <Link href={ROUTES.pass} className="gap-2">
                <QrCode size={16} />
                <span>Open Digital Pass</span>
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border-white/20">
              <Link href={ROUTES.membership}>
                <span>Get Credit Pack</span>
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
