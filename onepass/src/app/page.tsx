import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight,
  MapPin,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Star,
  Clock,
  Coins,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ROUTES } from "@/lib/constants"
import { getApprovedVenues } from "@/features/catalogue/catalogue-repository"
import { VenueCard } from "@/components/catalogue/venue-card"
import { HeroSearch } from "@/components/home/hero-search"

export const metadata: Metadata = {
  title: "Inlo — One Pass for Every Court, Pool, Gym & Studio",
  description:
    "Discover and book premium gyms, yoga, swimming, badminton and sports facilities across Bengaluru with one flexible membership pass.",
}

export default async function HomePage() {
  const featuredVenues = (await getApprovedVenues()).slice(0, 3)

  return (
    <>
      {/* ── HERO SECTION ───────────────────────────────────────────── */}
      <section
        aria-labelledby="hero-heading"
        className="relative overflow-hidden border-b border-[--color-border] bg-gradient-to-b from-[--color-background] via-[--color-surface] to-[--color-background]"
      >
        {/* Subtle decorative mesh / background accents */}
        <div
          className="absolute -top-40 right-[-10%] w-[500px] h-[500px] rounded-full bg-[--color-accent]/15 blur-[120px] pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute top-1/2 -left-40 w-[400px] h-[400px] rounded-full bg-[--color-forest]/5 blur-[100px] pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="max-w-3xl space-y-6">
            {/* Live City Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[--radius-pill] border border-[--color-forest]/20 bg-[--color-forest]/5 text-xs font-[650] text-[--color-forest]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[--color-forest] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[--color-forest]" />
              </span>
              <span>Now live in Bengaluru · Indiranagar, Domlur &amp; Koramangala</span>
            </div>

            {/* Main Headline */}
            <h1
              id="hero-heading"
              className="text-display text-4xl sm:text-5xl lg:text-6xl font-[800] tracking-[-0.03em] text-[--color-foreground] leading-[1.1]"
            >
              One pass for every <br className="hidden sm:inline" />
              <span className="text-[--color-forest] underline decoration-[--color-accent] decoration-wavy decoration-from-font">
                court, pool, gym &amp; studio.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-body-lg text-[--color-muted] max-w-2xl leading-relaxed text-base sm:text-lg">
              No separate subscriptions or annual contracts. Book top badminton courts,
              Olympic-standard swimming pools, boutique yoga shalas, and functional gyms
              near you with flexible activity credits.
            </p>

            {/* Interactive Hero Search & Quick Filter Component */}
            <div className="pt-2 pb-2">
              <HeroSearch />
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Button asChild size="lg" variant="primary" id="hero-cta-explore" className="font-[700] text-sm gap-2">
                <Link href={ROUTES.explore}>
                  Explore verified venues
                  <ArrowRight size={16} strokeWidth={2.5} aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary" id="hero-cta-plans" className="font-[650] text-sm">
                <Link href={ROUTES.membership}>
                  View credit packs
                </Link>
              </Button>
            </div>

            {/* Trust and Feature Metrics Bar */}
            <div className="pt-8 border-t border-[--color-border] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="flex items-center gap-2 text-[--color-foreground]">
                <Star size={16} className="text-amber-500 fill-amber-500 shrink-0" />
                <div>
                  <p className="font-[750]">4.9 / 5 Rating</p>
                  <p className="text-[11px] text-[--color-muted]">Verified athletes</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[--color-foreground]">
                <Zap size={16} className="text-[--color-forest] shrink-0" />
                <div>
                  <p className="font-[750]">Instant QR Entry</p>
                  <p className="text-[11px] text-[--color-muted]">2-second check-in</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[--color-foreground]">
                <Clock size={16} className="text-[--color-forest] shrink-0" />
                <div>
                  <p className="font-[750]">Free Cancellation</p>
                  <p className="text-[11px] text-[--color-muted]">Up to 2h prior</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[--color-foreground]">
                <ShieldCheck size={16} className="text-[--color-forest] shrink-0" />
                <div>
                  <p className="font-[750]">Zero Lock-in</p>
                  <p className="text-[11px] text-[--color-muted]">No recurring debt</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────── */}
      <section
        id="how-it-works"
        aria-labelledby="how-heading"
        className="border-b border-[--color-border] bg-[--color-surface] py-20 md:py-24"
      >
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-14">
            <Badge variant="accent" className="mb-3 font-[650]">
              Simple &amp; Transparent
            </Badge>
            <h2 id="how-heading" className="text-h1 text-[--color-foreground] mb-3">
              How Inlo Works
            </h2>
            <p className="text-body-lg text-[--color-muted]">
              One pass gives you complete freedom to move between activities across your city on your terms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface-muted]/40 p-6 sm:p-8 flex flex-col justify-between hover:border-[--color-forest]/40 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-3xl font-[800] text-[--color-forest]/25">
                    01
                  </span>
                  <div className="h-10 w-10 rounded-[--radius-md] bg-[--color-forest] text-white flex items-center justify-center">
                    <Coins size={20} />
                  </div>
                </div>
                <h3 className="text-h3 font-[700] text-[--color-foreground] mb-2">
                  Pick your activity pack
                </h3>
                <p className="text-sm text-[--color-muted] leading-relaxed">
                  Purchase flexible credits in bundles (20, 50, or 100). No monthly expirations or automatic recurring bank debits.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[--color-border] text-xs font-[600] text-[--color-forest]">
                From ₹70 per credit →
              </div>
            </div>

            {/* Step 2 */}
            <div className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface-muted]/40 p-6 sm:p-8 flex flex-col justify-between hover:border-[--color-forest]/40 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-3xl font-[800] text-[--color-forest]/25">
                    02
                  </span>
                  <div className="h-10 w-10 rounded-[--radius-md] bg-[--color-forest] text-white flex items-center justify-center">
                    <MapPin size={20} />
                  </div>
                </div>
                <h3 className="text-h3 font-[700] text-[--color-foreground] mb-2">
                  Choose venue &amp; time slot
                </h3>
                <p className="text-sm text-[--color-muted] leading-relaxed">
                  Browse verified local courts, pools, and studios. Filter by real-time slot availability, activity, and distance.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[--color-border] text-xs font-[600] text-[--color-forest]">
                Real-time slot lock →
              </div>
            </div>

            {/* Step 3 */}
            <div className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface-muted]/40 p-6 sm:p-8 flex flex-col justify-between hover:border-[--color-forest]/40 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-3xl font-[800] text-[--color-forest]/25">
                    03
                  </span>
                  <div className="h-10 w-10 rounded-[--radius-md] bg-[--color-forest] text-white flex items-center justify-center">
                    <Zap size={20} />
                  </div>
                </div>
                <h3 className="text-h3 font-[700] text-[--color-foreground] mb-2">
                  Scan QR &amp; start moving
                </h3>
                <p className="text-sm text-[--color-muted] leading-relaxed">
                  Arrive at the venue desk, show your cryptographic digital QR check-in pass, and play. Credits deduct automatically.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[--color-border] text-xs font-[600] text-[--color-forest]">
                Single-use secure pass →
              </div>
            </div>
          </div>

          {/* Credit Calculator / Example Card */}
          <div className="mt-12 p-6 sm:p-8 rounded-[--radius-xl] border-2 border-[--color-forest]/20 bg-[--color-forest]/5">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <span className="text-xs uppercase font-[700] tracking-wider text-[--color-forest] block mb-1">
                  Credit Pricing Transparency
                </span>
                <h4 className="text-h3 font-[750] text-[--color-foreground]">
                  What does a session actually cost?
                </h4>
                <p className="text-xs text-[--color-muted] mt-1 max-w-xl">
                  Credit costs are strictly upfront before you book. No surge surprises or hidden facility charges.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="px-4 py-2.5 rounded-[--radius-md] bg-white border border-[--color-border] shadow-xs">
                  <p className="text-[11px] font-[600] text-[--color-muted]">Gym Session</p>
                  <p className="text-sm font-[750] text-[--color-foreground]">12 cr <span className="text-[11px] font-normal text-[--color-muted]">(≈ ₹840)</span></p>
                </div>
                <div className="px-4 py-2.5 rounded-[--radius-md] bg-white border border-[--color-border] shadow-xs">
                  <p className="text-[11px] font-[600] text-[--color-muted]">Badminton Court</p>
                  <p className="text-sm font-[750] text-[--color-foreground]">14 cr <span className="text-[11px] font-normal text-[--color-muted]">(≈ ₹980)</span></p>
                </div>
                <div className="px-4 py-2.5 rounded-[--radius-md] bg-white border border-[--color-border] shadow-xs">
                  <p className="text-[11px] font-[600] text-[--color-muted]">Olympic Pool</p>
                  <p className="text-sm font-[750] text-[--color-foreground]">18 cr <span className="text-[11px] font-normal text-[--color-muted]">(≈ ₹1,260)</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VERIFIED VENUES PREVIEW ───────────────────────────────── */}
      <section
        aria-labelledby="featured-venues-heading"
        className="border-b border-[--color-border] bg-[--color-background] py-20 md:py-24"
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

      {/* ── VALUE COMPARISON (MEMBERS & VENUES) ─────────────────────── */}
      <section
        aria-labelledby="value-heading"
        className="border-b border-[--color-border] bg-[--color-surface] py-20 md:py-24"
      >
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 id="value-heading" className="text-h1 text-[--color-foreground] mb-3">
              Why Bengaluru Athletes Choose Inlo
            </h2>
            <p className="text-body-lg text-[--color-muted]">
              Everything designed for maximum flexibility, fairness, and zero friction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Member Value Card */}
            <div className="rounded-[--radius-xl] border-2 border-[--color-border] bg-white p-8 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-[--color-forest] font-[750] text-sm uppercase tracking-wider mb-3">
                  <Sparkles size={16} />
                  <span>For Members</span>
                </div>
                <h3 className="text-h2 font-[750] text-[--color-foreground] mb-4">
                  Freedom to train however you want.
                </h3>
                <ul className="space-y-3.5 text-sm" role="list">
                  {[
                    "One digital wallet covers badminton, swimming, gym and yoga.",
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
            <div className="rounded-[--radius-xl] border-2 border-[--color-border] bg-white p-8 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-[--color-forest] font-[750] text-sm uppercase tracking-wider mb-3">
                  <ShieldCheck size={16} />
                  <span>For Venue Owners</span>
                </div>
                <h3 className="text-h2 font-[750] text-[--color-foreground] mb-4">
                  Monetize empty slots effortlessly.
                </h3>
                <ul className="space-y-3.5 text-sm" role="list">
                  {[
                    "Fill off-peak morning and afternoon capacity automatically.",
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

      {/* ── BOTTOM CTA ────────────────────────────────────────────── */}
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
            Join the pilot cohort in Bengaluru. Access participating badminton arenas, swimming pools, yoga shalas, and gyms near you.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button asChild size="lg" variant="primary" id="bottom-cta-explore" className="w-full sm:w-auto font-[700]">
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
    </>
  )
}
