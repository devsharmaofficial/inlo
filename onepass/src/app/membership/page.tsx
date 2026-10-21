import type { Metadata } from "next"
import Link from "next/link"
import { Check, Sparkles, ShieldCheck, Zap, ArrowRight } from "lucide-react"
import { getAllActiveProducts } from "@/features/payments/products"
import { getUserCreditBalance } from "@/features/credits/credit-ledger-service"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { formatINR } from "@/lib/utils"
import { PassShowcase } from "@/components/membership/pass-showcase"

export const metadata: Metadata = {
  title: "Membership Plans & Activity Credit Packs · Inlo",
  description:
    "Choose a flexible Inlo credit pack to book verified badminton courts, gyms, pools, and studios across Bengaluru with zero lock-in.",
}

export default async function MembershipPage() {
  const DEMO_USER_ID = "user-member-1"
  const [products, balance] = await Promise.all([
    getAllActiveProducts(),
    getUserCreditBalance(DEMO_USER_ID),
  ])

  return (
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-16">
      {/* ── HEADER & BALANCE NOTICE ──────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[--color-border]">
        <div className="max-w-2xl space-y-3">
          <Badge variant="accent" className="font-[700] px-3 py-1">
            Zero Contracts · Zero Lock-In
          </Badge>
          <h1 className="text-display text-3xl sm:text-4xl lg:text-5xl font-[800] text-[--color-foreground]">
            Flexible Activity Credit Packs
          </h1>
          <p className="text-body-lg text-[--color-muted] leading-relaxed">
            One membership unlocks participating gyms, badminton courts, Olympic pools, and yoga studios across Bengaluru. No auto-renew traps, no joining fees.
          </p>
        </div>

        {/* Live Wallet Balance Pill */}
        <div className="rounded-[--radius-lg] border-2 border-[--color-forest]/20 bg-[--color-surface] p-4 text-xs shadow-sm min-w-[240px]">
          <span className="text-[11px] text-[--color-muted] font-[700] uppercase tracking-wider block mb-1">
            Your Current Wallet
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-display text-3xl font-[800] text-[--color-foreground] tabular-nums">
              {balance}
            </span>
            <span className="text-xs font-[650] text-[--color-forest]">
              credits available (≈ ₹{balance * 70})
            </span>
          </div>
        </div>
      </div>

      {/* ── CREDIT PACK CARDS GRID (Section 4 Component 8) ───────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {products.map((pack) => {
          const perCreditCost = Math.round(pack.pricePaise / 100 / pack.credits)

          return (
            <Card
              key={pack.id}
              className={`flex flex-col justify-between border-2 bg-[--color-surface] rounded-[--radius-xl] shadow-sm relative transition-all duration-[240ms] hover:shadow-xl hover:-translate-y-1 ${
                pack.featured
                  ? "border-[--color-forest] ring-4 ring-[--color-forest]/10 shadow-lg"
                  : "border-[--color-border] hover:border-[--color-forest]/40"
              }`}
            >
              {pack.featured && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <Badge variant="accent" className="shadow-md font-[750] gap-1 px-3.5 py-1 text-xs">
                    <Sparkles size={12} className="text-amber-800" />
                    Most popular pack
                  </Badge>
                </div>
              )}

              <CardHeader className="p-6 sm:p-8 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-h3 font-[800] text-[--color-foreground]">{pack.name}</h2>
                  <span className="text-xs text-[--color-forest] font-[700] bg-[--color-forest]/5 px-2.5 py-1 rounded-[--radius-pill]">
                    {pack.validityDays} days validity
                  </span>
                </div>

                <div className="my-4">
                  <span className="text-display text-4xl sm:text-5xl font-[800] text-[--color-foreground] tabular-nums">
                    {formatINR(pack.pricePaise / 100)}
                  </span>
                  <span className="text-xs text-[--color-muted] block mt-1 font-[500]">
                    All taxes included · ≈ ₹{perCreditCost} / credit
                  </span>
                </div>

                <p className="text-body text-xs text-[--color-muted] leading-relaxed">
                  {pack.description}
                </p>
              </CardHeader>

              <CardContent className="p-6 sm:p-8 pt-0 space-y-4">
                <div className="pt-4 border-t border-[--color-border] space-y-3 text-xs">
                  <div className="flex items-center gap-2 font-[700] text-[--color-foreground]">
                    <Zap size={15} className="text-[--color-forest] fill-current" />
                    <span>{pack.credits} booking credits loaded instantly</span>
                  </div>
                  <div className="flex items-center gap-2 text-[--color-foreground] font-[500]">
                    <Check size={14} className="text-emerald-600 shrink-0" />
                    <span>All participating badminton, gym, pool &amp; yoga venues</span>
                  </div>
                  <div className="flex items-center gap-2 text-[--color-foreground] font-[500]">
                    <Check size={14} className="text-emerald-600 shrink-0" />
                    <span>Free cancellation up to 2 hours before start</span>
                  </div>
                  <div className="flex items-center gap-2 text-[--color-foreground] font-[500]">
                    <Check size={14} className="text-emerald-600 shrink-0" />
                    <span>Invite teammates and friends with shared credits</span>
                  </div>
                  <div className="flex items-center gap-2 text-[--color-foreground] font-[500]">
                    <Check size={14} className="text-emerald-600 shrink-0" />
                    <span>Instant cryptographic QR entry pass</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="p-6 sm:p-8 pt-0">
                <Button
                  asChild
                  variant={pack.featured ? "primary" : "secondary"}
                  size="lg"
                  className="w-full font-[700] gap-1.5"
                >
                  <Link href={`/checkout?product=${pack.slug}`}>
                    Get {pack.name} <ArrowRight size={15} />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {/* ── THE ALL-ACCESS PASS EXPERIENCE ────────────────────────── */}
      <PassShowcase />

      {/* ── PLAN COMPARISON TABLE (Section 4 Component 8) ─────────── */}
      <div className="rounded-[--radius-xl] border border-[--color-border] bg-[--color-surface] p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h3 className="text-h2 font-[800] text-[--color-foreground]">
            Compare Credit Pack Features
          </h3>
          <p className="text-xs text-[--color-muted] mt-1">
            Choose based on how frequently you train each month.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[--color-border] text-[--color-muted] uppercase tracking-wider text-[11px]">
                <th className="py-3 pr-4 font-[700]">Feature</th>
                <th className="py-3 px-4 font-[700]">Starter Pack (20cr)</th>
                <th className="py-3 px-4 font-[700] text-[--color-forest]">Pro Flex (50cr)</th>
                <th className="py-3 px-4 font-[700]">Unlimited Power (100cr)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[--color-border] font-[500] text-[--color-foreground]">
              <tr>
                <td className="py-3.5 pr-4 font-[650]">Estimated Sessions</td>
                <td className="py-3.5 px-4 text-[--color-muted]">1–2 sessions</td>
                <td className="py-3.5 px-4 font-[700] text-[--color-forest]">4–5 sessions</td>
                <td className="py-3.5 px-4">8–10 sessions</td>
              </tr>
              <tr>
                <td className="py-3.5 pr-4 font-[650]">Effective Cost / Credit</td>
                <td className="py-3.5 px-4 text-[--color-muted]">₹75</td>
                <td className="py-3.5 px-4 font-[700] text-[--color-forest]">₹70</td>
                <td className="py-3.5 px-4">₹65</td>
              </tr>
              <tr>
                <td className="py-3.5 pr-4 font-[650]">Advanced Booking Window</td>
                <td className="py-3.5 px-4 text-[--color-muted]">5 days ahead</td>
                <td className="py-3.5 px-4 font-[700] text-[--color-forest]">7 days ahead</td>
                <td className="py-3.5 px-4">14 days ahead</td>
              </tr>
              <tr>
                <td className="py-3.5 pr-4 font-[650]">Free Cancellations</td>
                <td className="py-3.5 px-4 text-emerald-600 font-[700]">✓ Included</td>
                <td className="py-3.5 px-4 text-emerald-600 font-[700]">✓ Included</td>
                <td className="py-3.5 px-4 text-emerald-600 font-[700]">✓ Included</td>
              </tr>
              <tr>
                <td className="py-3.5 pr-4 font-[650]">Bring Friends &amp; Guests</td>
                <td className="py-3.5 px-4 text-[--color-muted]">✓ Up to 1 guest</td>
                <td className="py-3.5 px-4 font-[700] text-[--color-forest]">✓ Up to 3 guests</td>
                <td className="py-3.5 px-4">✓ Unlimited guests</td>
              </tr>
              <tr>
                <td className="py-3.5 pr-4 font-[650]">Dedicated Concierge</td>
                <td className="py-3.5 px-4 text-[--color-muted]">Standard</td>
                <td className="py-3.5 px-4 font-[700] text-[--color-forest]">Priority WhatsApp</td>
                <td className="py-3.5 px-4">24/7 VIP Concierge</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── TRANSPARENT ENTITLEMENT DISCLOSURES ────────────────────── */}
      <div className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface-muted] p-6 sm:p-8 max-w-3xl mx-auto space-y-3">
        <div className="flex items-center gap-2 text-sm font-[700] text-[--color-foreground]">
          <ShieldCheck size={18} className="text-[--color-forest]" />
          <span>Inlo Consumer Guarantee &amp; Standards</span>
        </div>
        <p className="text-xs text-[--color-muted] leading-relaxed">
          Credits represent internal booking entitlements. When you book a slot, credits are debited
          from your ledger; if you cancel before the venue cut-off window (typically 2 hours), credits are refunded
          atomically to your balance. No hidden maintenance charges, no auto-renewal surprises.
        </p>
      </div>
    </div>
  )
}
