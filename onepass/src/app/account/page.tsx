import type { Metadata } from "next"
import Link from "next/link"
import {
  CreditCard,
  Shield,
  CalendarDays,
  HelpCircle,
  ExternalLink,
  ArrowRight,
} from "lucide-react"
import { getUserCreditBalance } from "@/features/credits/credit-ledger-service"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/lib/constants"

export const metadata: Metadata = {
  title: "My account · Inlo",
  description: "Manage your Inlo profile, credit balance, membership packs, and privacy settings.",
}

export default async function AccountPage() {
  const DEMO_USER_ID = "user-member-1"
  const balance = await getUserCreditBalance(DEMO_USER_ID)

  return (
    <div className="mx-auto max-w-[1000px] px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-[--color-border]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <h1 className="text-h1 text-[--color-foreground]">Account</h1>
            <Badge variant="outline" className="text-xs">
              Pilot Member
            </Badge>
          </div>
          <p className="text-body text-[--color-muted]">
            Logged in as <code className="text-data text-xs">{DEMO_USER_ID}</code> · Bengaluru, KA
          </p>
        </div>

        {/* Credit Card preview */}
        <div className="flex items-center gap-3 p-3.5 rounded-[--radius-md] border border-[--color-border] bg-[--color-surface] shadow-sm">
          <div>
            <p className="text-[11px] font-[600] uppercase text-[--color-muted]">
              Available Credits
            </p>
            <p className="text-h2 font-[750] text-[--color-foreground] tabular-nums">
              {balance}
            </p>
          </div>
          <Button asChild variant="primary" size="sm">
            <Link href={ROUTES.membership}>Add credits</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bookings & Passes */}
        <div className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="p-2 rounded-[--radius-md] bg-[--color-surface-muted] text-[--color-forest] w-fit mb-3">
              <CalendarDays size={20} />
            </div>
            <h2 className="text-h3 font-[650] text-[--color-foreground] mb-1">
              My Activity Bookings
            </h2>
            <p className="text-xs text-[--color-muted] leading-relaxed">
              View upcoming court reservations, access single-use digital check-in passes, and view attendance history.
            </p>
          </div>
          <div className="mt-5 pt-4 border-t border-[--color-border]">
            <Button asChild variant="secondary" size="sm" className="w-full">
              <Link href={ROUTES.bookings} className="flex items-center justify-center gap-1">
                View my bookings <ArrowRight size={14} />
              </Link>
            </Button>
          </div>
        </div>

        {/* Membership & Packs */}
        <div className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="p-2 rounded-[--radius-md] bg-[--color-surface-muted] text-[--color-forest] w-fit mb-3">
              <CreditCard size={20} />
            </div>
            <h2 className="text-h3 font-[650] text-[--color-foreground] mb-1">
              Membership &amp; Credit Packs
            </h2>
            <p className="text-xs text-[--color-muted] leading-relaxed">
              Explore prepaid 20, 50, or 100 credit packs with upfront pricing in INR and instant atomic ledger fulfillment.
            </p>
          </div>
          <div className="mt-5 pt-4 border-t border-[--color-border]">
            <Button asChild variant="secondary" size="sm" className="w-full">
              <Link href={ROUTES.membership} className="flex items-center justify-center gap-1">
                Explore credit packs <ArrowRight size={14} />
              </Link>
            </Button>
          </div>
        </div>

        {/* DPDP Act Privacy Controls */}
        <div className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="p-2 rounded-[--radius-md] bg-[--color-surface-muted] text-[--color-forest] w-fit mb-3">
              <Shield size={20} />
            </div>
            <h2 className="text-h3 font-[650] text-[--color-foreground] mb-1">
              Privacy &amp; Data Rights
            </h2>
            <p className="text-xs text-[--color-muted] leading-relaxed">
              Review our compliance with India&apos;s Digital Personal Data Protection Act, 2023. Request data summaries, corrections, or full account deletion.
            </p>
          </div>
          <div className="mt-5 pt-4 border-t border-[--color-border]">
            <Button asChild variant="secondary" size="sm" className="w-full">
              <Link href="/legal/privacy" className="flex items-center justify-center gap-1">
                Privacy policy &amp; rights <ExternalLink size={13} />
              </Link>
            </Button>
          </div>
        </div>

        {/* Concierge & Support */}
        <div className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="p-2 rounded-[--radius-md] bg-[--color-surface-muted] text-[--color-forest] w-fit mb-3">
              <HelpCircle size={20} />
            </div>
            <h2 className="text-h3 font-[650] text-[--color-foreground] mb-1">
              Help &amp; Concierge Support
            </h2>
            <p className="text-xs text-[--color-muted] leading-relaxed">
              Need assistance with an arrival check-in, refund cutoff question, or venue feedback? Our Bengaluru pilot desk is on standby.
            </p>
          </div>
          <div className="mt-5 pt-4 border-t border-[--color-border]">
            <Button asChild variant="secondary" size="sm" className="w-full">
              <Link href="/support" className="flex items-center justify-center gap-1">
                Contact support desk <ArrowRight size={14} />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
