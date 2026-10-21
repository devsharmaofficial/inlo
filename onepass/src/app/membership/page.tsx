import type { Metadata } from "next"
import Link from "next/link"
import { Check, Sparkles, ShieldCheck, Zap } from "lucide-react"
import { getAllActiveProducts } from "@/features/payments/products"
import { getUserCreditBalance } from "@/features/credits/credit-ledger-service"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { formatINR } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Membership plans & credit packs",
  description:
    "Choose a flexible OnePass credit pack to book verified badminton courts, gyms, pools, and studios.",
}

export default async function MembershipPage() {
  const DEMO_USER_ID = "user-member-1"
  const [products, balance] = await Promise.all([
    getAllActiveProducts(),
    getUserCreditBalance(DEMO_USER_ID),
  ])

  return (
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-12">
      {/* Header & Balance Notice */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="max-w-2xl">
          <Badge variant="accent" className="mb-3 font-[650]">
            Transparent Pricing
          </Badge>
          <h1 className="text-h1 text-[--color-foreground] mb-3">
            Choose your activity pack
          </h1>
          <p className="text-body-lg text-[--color-muted]">
            One membership unlocks participating venues across your city. No annual contracts,
            no auto-renew locks, and no surprise charges.
          </p>
        </div>

        <div className="rounded-[--radius-md] border border-[--color-border] bg-[--color-surface] p-4 text-xs shadow-sm min-w-[220px]">
          <span className="text-[--color-muted] font-[600] uppercase tracking-wider block mb-1">
            Current Account Balance
          </span>
          <span className="text-h2 text-[--color-foreground] font-[700] tabular-nums">
            {balance}{" "}
            <span className="text-xs font-[500] text-[--color-muted]">credits</span>
          </span>
        </div>
      </div>

      {/* Credit Pack Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {products.map((pack) => {
          const perCreditCost = Math.round(pack.pricePaise / 100 / pack.credits)

          return (
            <Card
              key={pack.id}
              className={`flex flex-col justify-between border-[--color-border] bg-[--color-surface] shadow-sm relative transition-all duration-[220ms] ${
                pack.featured ? "ring-2 ring-[--color-accent] shadow-md" : ""
              }`}
            >
              {pack.featured && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <Badge variant="accent" className="shadow-sm font-[650] gap-1 px-3 py-1">
                    <Sparkles size={11} />
                    Most popular
                  </Badge>
                </div>
              )}

              <CardHeader className="p-6 sm:p-8 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-h3 text-[--color-foreground]">{pack.name}</h2>
                  <span className="text-xs text-[--color-muted] font-[600]">
                    {pack.validityDays} days validity
                  </span>
                </div>

                <div className="my-4">
                  <span className="text-display text-4xl text-[--color-foreground] font-[750] tabular-nums">
                    {formatINR(pack.pricePaise / 100)}
                  </span>
                  <span className="text-xs text-[--color-muted] block mt-1">
                    Includes GST · ≈ ₹{perCreditCost} / credit
                  </span>
                </div>

                <p className="text-body text-xs text-[--color-muted] leading-relaxed">
                  {pack.description}
                </p>
              </CardHeader>

              <CardContent className="p-6 sm:p-8 pt-0 space-y-4">
                <div className="pt-4 border-t border-[--color-border] space-y-2.5 text-xs">
                  <div className="flex items-center gap-2 font-[600] text-[--color-foreground]">
                    <Zap size={14} className="text-[--color-forest]" />
                    <span>{pack.credits} booking credits included</span>
                  </div>
                  <div className="flex items-center gap-2 text-[--color-muted]">
                    <Check size={14} className="text-[--color-success]" />
                    <span>Access all participating gyms, pools & courts</span>
                  </div>
                  <div className="flex items-center gap-2 text-[--color-muted]">
                    <Check size={14} className="text-[--color-success]" />
                    <span>Free session cancellation within policy window</span>
                  </div>
                  <div className="flex items-center gap-2 text-[--color-muted]">
                    <Check size={14} className="text-[--color-success]" />
                    <span>Single digital pass on your phone</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="p-6 sm:p-8 pt-0">
                <Button
                  asChild
                  variant={pack.featured ? "primary" : "secondary"}
                  size="lg"
                  className="w-full"
                >
                  <Link href={`/checkout?product=${pack.slug}`}>
                    Select {pack.name}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {/* Transparent Entitlement Disclosures */}
      <div className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface-muted] p-6 sm:p-8 max-w-2xl mx-auto space-y-3">
        <div className="flex items-center gap-2 text-sm font-[650] text-[--color-foreground]">
          <ShieldCheck size={16} className="text-[--color-forest]" />
          <span>OnePass Consumer & Entitlement Standards</span>
        </div>
        <p className="text-xs text-[--color-muted] leading-relaxed">
          Credits represent internal booking entitlements. When you book a slot, credits are debited
          from your ledger; if you cancel before the venue cut-off window, credits are refunded
          atomically. Credit packs do not expire without prior notification and are subject to the
          terms approved at checkout.
        </p>
      </div>
    </div>
  )
}
