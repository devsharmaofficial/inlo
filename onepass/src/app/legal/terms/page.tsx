import type { Metadata } from "next"
import Link from "next/link"
import { ShieldCheck, ArrowLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Inlo platform terms of service, membership rules, and user obligations.",
}

export default function TermsOfUsePage() {
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
          Legal Agreement
        </Badge>
        <span className="text-xs text-[--color-muted]">Last updated: 20 October 2026 · Version 1.0</span>
      </div>

      <h1 className="text-h1 text-[--color-foreground] mb-4">Terms of Use</h1>

      {/* Plain Language Summary Box */}
      <div className="rounded-[--radius-lg] border-2 border-[#244638]/20 bg-[#F0F6F2] p-6 mb-10 shadow-sm">
        <div className="flex items-center gap-2 text-[#244638] font-[750] text-sm mb-3">
          <ShieldCheck size={18} />
          <span>At a glance · Plain language summary</span>
        </div>
        <ul className="text-xs text-[#191B18] space-y-2 list-disc list-inside leading-relaxed">
          <li>Inlo is a booking platform connecting you with independent fitness, sport, and wellness venues in Bengaluru.</li>
          <li>Credits purchased are prepaid entitlements used to reserve venue slots. Credits are non-cashable and non-transferable.</li>
          <li>You can cancel any booking up to 2 hours before start time for a full credit refund.</li>
          <li>Each digital pass is single-use and valid only for the booked slot.</li>
          <li>Venues set their own facility rules (dress code, safety guidelines, and waiver requirements).</li>
        </ul>
      </div>

      {/* Main Legal Sections */}
      <div className="prose prose-neutral max-w-none space-y-8 text-sm leading-relaxed text-[--color-foreground]">
        <section>
          <h2 className="text-h3 text-[--color-foreground] font-[700] mb-3">1. Nature of the Platform</h2>
          <p className="text-[--color-muted]">
            Inlo Technologies Private Limited (&quot;Inlo&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates an online marketplace and technological intermediary platform under Section 79 of the Information Technology Act, 2000. Inlo connects verified fitness, sports, recreation, and wellness venue operators (&quot;Partner Venues&quot;) with individual members (&quot;Members&quot; or &quot;you&quot;).
          </p>
          <p className="text-[--color-muted] mt-2">
            Inlo does not own, manage, or operate physical sports courts, studios, gyms, or swimming pools, unless expressly stated otherwise in writing. All activities are conducted at facilities managed by independent Partner Venues.
          </p>
        </section>

        <section>
          <h2 className="text-h3 text-[--color-foreground] font-[700] mb-3">2. Membership, Packs &amp; Credits</h2>
          <div className="space-y-2 text-[--color-muted]">
            <p>
              <strong>2.1 Credit Currency:</strong> Inlo credits are prepaid digital tokens of access designed strictly for redemption against activity slots listed on the platform. Credits do not represent cash, sovereign currency, deposit liabilities, or stored value wallets.
            </p>
            <p>
              <strong>2.2 Non-Transferability:</strong> Credits are tied strictly to your registered Inlo account and cannot be transferred, gifted, exchanged, or resold to third parties.
            </p>
            <p>
              <strong>2.3 Validity:</strong> Credit packs are valid for 30 calendar days from the date of capture and credit fulfillment. Unused credits expire automatically upon pack expiration unless renewed pursuant to platform terms.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-h3 text-[--color-foreground] font-[700] mb-3">3. Booking, Passes &amp; Check-in Verification</h2>
          <div className="space-y-2 text-[--color-muted]">
            <p>
              <strong>3.1 Real-Time Reservations:</strong> When you book a slot, credits are debited from your ledger balance atomically and the slot capacity is immediately locked at the venue.
            </p>
            <p>
              <strong>3.2 Digital Check-In Pass:</strong> Confirmed reservations generate an unguessable single-use cryptographically signed check-in token. You must present this token at the venue front desk before accessing the court or session.
            </p>
            <p>
              <strong>3.3 Single-Use Guarantee:</strong> Once verified by venue staff, the digital pass token is permanently marked as used and cannot be redeemed again.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-h3 text-[--color-foreground] font-[700] mb-3">4. Cancellations, Rescheduling &amp; Refunds</h2>
          <p className="text-[--color-muted]">
            Our cancellation policy is designed to be fair to both members and partner venue operators who hold court slots exclusively for you:
          </p>
          <div className="mt-2 pl-4 border-l-2 border-[--color-border] space-y-1.5 text-[--color-muted]">
            <p>
              <strong>Standard Window:</strong> You may cancel any upcoming booking up to <strong>2 hours prior to the session start time</strong> for an immediate 100% credit refund restored to your balance.
            </p>
            <p>
              <strong>Late Cancellations / No-Shows:</strong> Cancellations attempted within 2 hours of session start time or failure to check in forfeit the debited credits to compensate the partner venue.
            </p>
            <p>
              <strong>Partner Cancellations:</strong> If a venue cancels a slot (e.g., weather or maintenance), 100% of debited credits are refunded immediately.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-h3 text-[--color-foreground] font-[700] mb-3">5. Health, Safety &amp; Assumption of Risk</h2>
          <p className="text-[--color-muted]">
            Physical activity, racquet sports, strength training, and aquatic exercises inherently involve physical exertion and risk of injury. By booking and participating:
          </p>
          <ul className="list-disc list-inside space-y-1 mt-2 text-[--color-muted]">
            <li>You affirm that you are physically fit and have no medical conditions preventing participation.</li>
            <li>You agree to comply with all safety instructions, equipment rules, and attire requirements (e.g., non-marking court shoes, swim caps).</li>
            <li>You acknowledge that Partner Venues are independent contractors and assume ordinary athletic risks.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-h3 text-[--color-foreground] font-[700] mb-3">6. Governing Law &amp; Jurisdiction</h2>
          <p className="text-[--color-muted]">
            These Terms shall be governed by and construed in accordance with the laws of the Republic of India. Any disputes arising out of or related to these Terms or platform operations shall be subject to the exclusive jurisdiction of the competent courts in Bengaluru, Karnataka, India.
          </p>
        </section>

        <section className="pt-6 border-t border-[--color-border]">
          <h2 className="text-h3 text-[--color-foreground] font-[700] mb-2">Grievance &amp; Contact</h2>
          <p className="text-[--color-muted]">
            For inquiries, grievances, or legal notices, contact our Grievance Officer:
          </p>
          <div className="mt-2 text-xs text-[--color-muted] font-mono space-y-0.5">
            <p>Grievance Officer: Legal &amp; Compliance Team</p>
            <p>Inlo Technologies Private Limited</p>
            <p>Indiranagar 100ft Road, Bengaluru, Karnataka 560038, India</p>
            <p>Email: legal@inlo.tech / grievance@inlo.tech</p>
          </div>
        </section>
      </div>
    </div>
  )
}
