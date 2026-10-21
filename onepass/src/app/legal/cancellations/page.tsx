import type { Metadata } from "next"
import Link from "next/link"
import { Clock, AlertCircle, CheckCircle2, ArrowLeft, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/lib/constants"

export const metadata: Metadata = {
  title: "Cancellation & Refund Policy",
  description: "Clear, transparent cancellation rules and instant credit refund terms for Inlo sessions.",
}

export default function CancellationsPage() {
  return (
    <div className="mx-auto max-w-[840px] px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs text-[--color-muted] hover:text-[--color-foreground] mb-6 transition-colors"
      >
        <ArrowLeft size={14} /> Back to home
      </Link>

      <div className="flex items-center gap-2 mb-2">
        <Badge variant="outline" className="text-xs">
          Transparent Policy
        </Badge>
        <span className="text-xs text-[--color-muted]">Last updated: 20 October 2026</span>
      </div>

      <h1 className="text-h1 text-[--color-foreground] mb-4">Cancellations &amp; Refunds</h1>
      <p className="text-body text-[--color-muted] mb-10">
        Our cancellation policy is built on fairness. We protect your flexibility while ensuring partner venues are compensated when court slots are held exclusively.
      </p>

      {/* Visual Window Diagram */}
      <div className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] p-6 mb-10 shadow-sm">
        <h2 className="text-label font-[700] text-[--color-foreground] mb-4">Session Cancellation Window</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* More than 2 hours */}
          <div className="rounded-[--radius-md] border-2 border-[#244638] bg-[#F0F6F2] p-5 shadow-sm">
            <div className="flex items-center gap-2 text-[#244638] mb-2 font-[750] text-sm">
              <CheckCircle2 size={20} />
              <span>&gt; 2 Hours Before Session</span>
            </div>
            <p className="text-h3 font-[800] text-[#244638] mb-1">100% Credit Refund</p>
            <p className="text-xs text-[#191B18] leading-relaxed">
              Full credits returned to your Inlo account balance immediately upon cancellation. No cancellation fees, questions, or penalties.
            </p>
          </div>

          {/* Under 2 hours */}
          <div className="rounded-[--radius-md] border border-[#E2E5DC] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-[#9A5B10] mb-2 font-[750] text-sm">
              <Clock size={20} />
              <span>&lt; 2 Hours Before Session</span>
            </div>
            <p className="text-h3 font-[800] text-[#191B18] mb-1">Credits Forfeited</p>
            <p className="text-xs text-[#686D64] leading-relaxed">
              Because the venue reserved this slot and cannot re-book it at the last minute, debited credits cannot be refunded.
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Rules */}
      <div className="space-y-8 text-sm leading-relaxed text-[--color-foreground]">
        <section>
          <h2 className="text-h3 text-[--color-foreground] font-[700] mb-3">1. How to Cancel a Session</h2>
          <ol className="list-decimal list-inside space-y-2 text-[--color-muted]">
            <li>Open the <strong>My Bookings</strong> section in your Inlo app or web dashboard.</li>
            <li>Select the upcoming booking you wish to cancel.</li>
            <li>Click <strong>&quot;Cancel booking&quot;</strong> and confirm the action.</li>
            <li>Your credits will be restored to your account ledger immediately.</li>
          </ol>
          <div className="mt-4">
            <Button asChild variant="secondary" size="sm">
              <Link href={ROUTES.bookings}>
                Go to my bookings <ArrowRight size={14} className="ml-1" />
              </Link>
            </Button>
          </div>
        </section>

        <section>
          <h2 className="text-h3 text-[--color-foreground] font-[700] mb-3">2. When a Venue Partner Cancels</h2>
          <p className="text-[--color-muted]">
            Occasionally, unforeseen circumstances (such as severe monsoon rains affecting outdoor courts, emergency pool sanitation, or equipment maintenance) require a partner venue to cancel a session. In such cases:
          </p>
          <ul className="list-disc list-inside space-y-1.5 mt-2 text-[--color-muted]">
            <li>100% of debited credits are refunded immediately to your account.</li>
            <li>You will receive an SMS and in-app notification explaining the cancellation.</li>
            <li>Our concierge team is available to help reschedule or find an alternative court.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-h3 text-[--color-foreground] font-[700] mb-3">3. Credit Pack Purchase Refunds</h2>
          <div className="space-y-2 text-[--color-muted]">
            <p>
              <strong>Unused Packs:</strong> If you purchased a credit pack and have <em>not redeemed any credits</em>, you may request a 100% monetary refund to your original payment method within 7 days of purchase.
            </p>
            <p>
              <strong>Partially Used Packs:</strong> Once any credits from a pack have been utilized for confirmed sessions, the monetary purchase is non-refundable. Remaining credits stay valid for the full 30-day pack period.
            </p>
          </div>
        </section>

        <section className="p-5 rounded-[--radius-md] border border-[--color-border] bg-[--color-surface-muted]">
          <div className="flex items-center gap-2 font-[650] text-[--color-foreground] text-sm mb-1.5">
            <AlertCircle size={16} className="text-[--color-forest]" />
            <span>Need Help with an Extraordinary Situation?</span>
          </div>
          <p className="text-xs text-[--color-muted]">
            If you experienced an emergency, medical issue, or venue service irregularity, please submit a ticket through our Help &amp; Support center. We review each incident on a case-by-case basis.
          </p>
          <div className="mt-3">
            <Button asChild variant="secondary" size="sm">
              <Link href="/support">Contact support desk</Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}
