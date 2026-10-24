import type { Metadata } from "next"
import Link from "next/link"
import { ShieldCheck, Coins, MapPin } from "lucide-react"
import { DigitalPassCard } from "@/components/pass/digital-pass-card"
import { Button } from "@/components/ui/button"
import { getEffectiveUserId, getCurrentUser } from "@/features/auth/auth-service"
import { getUserCreditBalance } from "@/features/credits/credit-ledger-service"
import { ROUTES } from "@/lib/constants"

export const metadata: Metadata = {
  title: "Inlo Pass — Universal Tap-In / Tap-Out",
  description:
    "Your all-in-one digital pass for every gym, pool, badminton arena, and studio in Bengaluru. Tap at arrival, train, tap at exit.",
}

const VENUE_TIERS = [
  {
    tier: "Tier 1 · Standard",
    hourly: "4 credits / hr",
    cap: "Max 12 cr / visit",
    description: "Functional gym floors, neighborhood badminton courts, open conditioning.",
    examples: "Iron & Movement Club · Veloce Badminton",
  },
  {
    tier: "Tier 2 · Premium",
    hourly: "6 credits / hr",
    cap: "Max 16 cr / visit",
    description: "Semi-Olympic heated lap pools, tournament-grade wooden courts with anti-glare LEDs.",
    examples: "The Hub Sports Arena · AquaLife Aquatic Centre",
  },
  {
    tier: "Tier 3 · Elite",
    hourly: "8 credits / hr",
    cap: "Max 20 cr / visit",
    description: "Boutique natural hardwood yoga studios, small-group mobility shalas, Olympic platforms.",
    examples: "Prana Shala Yoga",
  },
]

export default async function PassPage() {
  const userId = await getEffectiveUserId()
  const user = await getCurrentUser()
  const balance = await getUserCreditBalance(userId)

  const memberName = user?.fullName || "Aryan Sharma"
  const memberNumber = `INLO-2026-${userId.slice(-4).padStart(4, "0")}-0428`

  return (
    <div className="bg-[--color-background] text-[--color-foreground] min-h-screen">
      {/* ── Editorial Header ────────────────────────────────────────────── */}
      <section className="border-b border-[--color-border] bg-white py-12 md:py-16">
        <div className="mx-auto max-w-[1080px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-[800] tracking-tight text-[--color-foreground]">
                Inlo Pass
              </h1>
              <p className="text-sm sm:text-base text-[--color-muted] max-w-xl">
                Scan at entry and exit. Credits meter by visit duration.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button asChild variant="secondary" size="md">
                <Link href={ROUTES.explore} className="gap-1.5 font-[650]">
                  <MapPin size={15} />
                  <span>Explore clubs</span>
                </Link>
              </Button>
              <Button asChild variant="primary" size="md">
                <Link href={ROUTES.membership} className="gap-1.5 font-[700]">
                  <Coins size={15} />
                  <span>Top up credits</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Pass Interface ─────────────────────────────────────────── */}
      <main className="mx-auto max-w-[1080px] px-4 sm:px-6 lg:px-8 py-10 md:py-14 space-y-12">
        <DigitalPassCard
          initialMemberName={memberName}
          initialBalance={balance}
          memberId={memberNumber}
        />

        {/* ── Transparent Venue Tier Rate Cards ─────────────────────────── */}
        <section aria-labelledby="tier-heading" className="space-y-6 pt-4">
          <div className="border-b border-[--color-border] pb-4">
            <h2 id="tier-heading" className="text-xl font-[800] text-[--color-foreground] tracking-tight">
              Access tiers &amp; rates
            </h2>
            <p className="text-xs sm:text-sm text-[--color-muted] mt-1">
              Charges meter strictly by duration with hard daily caps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {VENUE_TIERS.map((tier) => (
              <div
                key={tier.tier}
                className="rounded-[--radius-xl] border border-[--color-border] bg-white p-6 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-[750] px-2.5 py-1 rounded-full bg-[--color-forest]/10 text-[--color-forest]">
                      {tier.tier}
                    </span>
                    <span className="text-xs font-mono font-[600] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm">
                      {tier.cap}
                    </span>
                  </div>

                  <p className="font-mono text-2xl font-[800] text-[--color-foreground] tracking-tight my-2">
                    {tier.hourly}
                  </p>

                  <p className="text-xs text-[--color-muted] leading-relaxed">
                    {tier.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[--color-border] text-[11px] text-[--color-muted]">
                  <span className="font-[650] text-[--color-foreground] block mb-0.5">Participating:</span>
                  <span>{tier.examples}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Guarantee Pill */}
          <div className="rounded-[--radius-lg] border border-[--color-forest]/20 bg-[--color-forest]/5 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <ShieldCheck size={18} className="text-[--color-forest] shrink-0" />
              <span className="text-[--color-foreground] font-[550]">
                Visits are capped at the daily maximum. You are never billed beyond the cap if you forget to tap out.
              </span>
            </div>
            <Link href="/support" className="font-[650] text-[--color-forest] hover:underline shrink-0">
              Read metering policy →
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
