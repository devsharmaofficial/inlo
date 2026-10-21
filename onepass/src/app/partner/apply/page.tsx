import type { Metadata } from "next"
import Link from "next/link"
import { PartnerApplyForm } from "@/components/partner/partner-apply-form"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, ShieldCheck, Users, ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "List your venue · Partner with Inlo",
  description: "Monetize off-peak court and studio capacity across Bengaluru with guaranteed per-credit payouts.",
}

export default function PartnerApplyPage() {
  return (
    <div className="mx-auto max-w-[1000px] px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs text-[--color-muted] hover:text-[--color-foreground] mb-6 transition-colors"
      >
        <ArrowLeft size={14} /> Back to home
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left column: Value proposition (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <Badge variant="outline" className="text-xs mb-2">
              Pilot Onboarding
            </Badge>
            <h1 className="text-h1 text-[--color-foreground] mb-3">
              List your venue on Inlo
            </h1>
            <p className="text-body text-[--color-muted] leading-relaxed">
              Monetize empty court hours and open gym/studio slots in Indiranagar, Domlur, and Koramangala. Reach high-intent local athletes without discounting your walk-in rates.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-[--radius-md] bg-[--color-forest] text-[--color-chartreuse] shrink-0 mt-0.5">
                <TrendingUp size={16} />
              </div>
              <div>
                <p className="font-[650] text-sm text-[--color-foreground]">Fill Off-Peak Capacity</p>
                <p className="text-xs text-[--color-muted] mt-0.5">
                  Turn idle weekday morning and afternoon courts into guaranteed recurring revenue.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-[--radius-md] bg-[--color-forest] text-[--color-chartreuse] shrink-0 mt-0.5">
                <ShieldCheck size={16} />
              </div>
              <div>
                <p className="font-[650] text-sm text-[--color-foreground]">Zero Commission in Pilot</p>
                <p className="text-xs text-[--color-muted] mt-0.5">
                  100% of redeemed credit payouts go directly to you with bi-weekly bank settlements.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-[--radius-md] bg-[--color-forest] text-[--color-chartreuse] shrink-0 mt-0.5">
                <Users size={16} />
              </div>
              <div>
                <p className="font-[650] text-sm text-[--color-foreground]">Simple Front-Desk App</p>
                <p className="text-xs text-[--color-muted] mt-0.5">
                  Staff verifies check-ins in 2 seconds with single-use digital pass tokens on any phone or tablet.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Application Form (7 cols) */}
        <div className="lg:col-span-7 rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] p-6 sm:p-8 shadow-sm">
          <h2 className="text-h3 text-[--color-foreground] mb-1">Venue Application</h2>
          <p className="text-xs text-[--color-muted] mb-6">
            Fill in your facility details to join the Bengaluru pilot partner network.
          </p>
          <PartnerApplyForm />
        </div>
      </div>
    </div>
  )
}
