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
  title: "Membership Plans · Inlo",
  description: "Activity credit packs for gyms, courts, pools, and studios across Bengaluru.",
}

export default async function MembershipPage() {
  const DEMO_USER_ID = "user-member-1"
  const [products, balance] = await Promise.all([
    getAllActiveProducts(),
    getUserCreditBalance(DEMO_USER_ID),
  ])

  return (
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[--color-border]">
        <div className="space-y-2">
          <Badge variant="accent" className="font-[700] px-3 py-1">Zero Lock-In</Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-[800] text-[--color-foreground]">Credit Packs</h1>
          <p className="text-[--color-muted]">One pass. Every partner venue in Bengaluru.</p>
        </div>
        <div className="rounded-[--radius-lg] border-2 border-[--color-forest]/20 bg-[--color-surface] p-4 shadow-sm min-w-[200px]">
          <span className="text-[11px] text-[--color-muted] font-[700] uppercase tracking-wider block mb-1">Your Wallet</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-[800] text-[--color-foreground] tabular-nums">{balance}</span>
            <span className="text-xs font-[650] text-[--color-forest]">cr · ≈ ₹{balance * 70}</span>
          </div>
        </div>
      </div>

      {/* Credit Pack Cards */}
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
                    <Sparkles size={12} className="text-amber-800" /> Most popular
                  </Badge>
                </div>
              )}
              <CardHeader className="p-6 sm:p-8 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-h3 font-[800] text-[--color-foreground]">{pack.name}</h2>
                  <span className="text-xs text-[--color-forest] font-[700] bg-[--color-forest]/5 px-2.5 py-1 rounded-[--radius-pill]">{pack.validityDays}d</span>
                </div>
                <div className="my-4">
                  <span className="text-4xl sm:text-5xl font-[800] text-[--color-foreground] tabular-nums">{formatINR(pack.pricePaise / 100)}</span>
                  <span className="text-xs text-[--color-muted] block mt-1">incl. GST · ₹{perCreditCost}/credit</span>
                </div>
              </CardHeader>
              <CardContent className="p-6 sm:p-8 pt-0">
                <div className="pt-4 border-t border-[--color-border] space-y-2.5 text-xs">
                  <div className="flex items-center gap-2 font-[700] text-[--color-foreground]">
                    <Zap size={14} className="text-[--color-forest] fill-current" />
                    <span>{pack.credits} credits</span>
                  </div>
                  <div className="flex items-center gap-2 text-[--color-foreground]">
                    <Check size={13} className="text-emerald-600 shrink-0" /><span>All partner venues</span>
                  </div>
                  <div className="flex items-center gap-2 text-[--color-foreground]">
                    <Check size={13} className="text-emerald-600 shrink-0" /><span>Free cancellation · 2h cutoff</span>
                  </div>
                  <div className="flex items-center gap-2 text-[--color-foreground]">
                    <Check size={13} className="text-emerald-600 shrink-0" /><span>Instant QR entry pass</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-6 sm:p-8 pt-0">
                <Button asChild variant={pack.featured ? "primary" : "secondary"} size="lg" className="w-full font-[700] gap-1.5">
                  <Link href={`/checkout?product=${pack.slug}`}>Get {pack.name} <ArrowRight size={15} /></Link>
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      <PassShowcase />

      {/* Comparison Table */}
      <div className="rounded-[--radius-xl] border border-[--color-border] bg-[--color-surface] p-6 sm:p-8 shadow-sm space-y-6">
        <h3 className="text-h2 font-[800] text-[--color-foreground]">Compare packs</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[--color-border] text-[--color-muted] uppercase tracking-wider text-[11px]">
                <th className="py-3 pr-4 font-[700]">Feature</th>
                <th className="py-3 px-4 font-[700]">Starter (20cr)</th>
                <th className="py-3 px-4 font-[700] text-[--color-forest]">Pro Flex (50cr)</th>
                <th className="py-3 px-4 font-[700]">Power (100cr)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[--color-border] text-[--color-foreground]">
              <tr>
                <td className="py-3 pr-4 font-[650]">Sessions/month</td>
                <td className="py-3 px-4 text-[--color-muted]">1–2</td>
                <td className="py-3 px-4 font-[700] text-[--color-forest]">4–5</td>
                <td className="py-3 px-4">8–10</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-[650]">Cost/credit</td>
                <td className="py-3 px-4 text-[--color-muted]">₹75</td>
                <td className="py-3 px-4 font-[700] text-[--color-forest]">₹70</td>
                <td className="py-3 px-4">₹65</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-[650]">Advance booking</td>
                <td className="py-3 px-4 text-[--color-muted]">5 days</td>
                <td className="py-3 px-4 font-[700] text-[--color-forest]">7 days</td>
                <td className="py-3 px-4">14 days</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-[650]">Cancellations</td>
                <td className="py-3 px-4 text-emerald-600 font-[700]">✓ Free</td>
                <td className="py-3 px-4 text-emerald-600 font-[700]">✓ Free</td>
                <td className="py-3 px-4 text-emerald-600 font-[700]">✓ Free</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-[650]">Guest passes</td>
                <td className="py-3 px-4 text-[--color-muted]">1</td>
                <td className="py-3 px-4 font-[700] text-[--color-forest]">3</td>
                <td className="py-3 px-4">Unlimited</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-[650]">Support</td>
                <td className="py-3 px-4 text-[--color-muted]">Standard</td>
                <td className="py-3 px-4 font-[700] text-[--color-forest]">Priority WA</td>
                <td className="py-3 px-4">24/7 VIP</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="flex items-center gap-2 text-xs text-[--color-muted] pt-2 border-t border-[--color-border]">
          <ShieldCheck size={13} className="text-[--color-forest] shrink-0" />
          <span>Credits refunded on cancellation. No auto-renewal.</span>
        </div>
      </div>
    </div>
  )
}
