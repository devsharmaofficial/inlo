import type { Metadata } from "next"
import Link from "next/link"
import { Lock, EyeOff, UserCheck, ArrowLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Inlo Privacy Notice aligned with India's Digital Personal Data Protection (DPDP) Act, 2023.",
}

export default function PrivacyPolicyPage() {
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
          Data Governance
        </Badge>
        <span className="text-xs text-[--color-muted]">DPDP Act 2023 Compliant · Last updated: 20 October 2026</span>
      </div>

      <h1 className="text-h1 text-[--color-foreground] mb-4">Privacy Policy</h1>

      {/* Privacy Principles Card */}
      <div className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] p-6 mb-10 shadow-sm">
        <h2 className="text-label font-[700] text-[--color-foreground] mb-3">Our Core Privacy Commitments</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[--color-forest] font-[650]">
              <EyeOff size={15} />
              <span>Zero Background Tracking</span>
            </div>
            <p className="text-[--color-muted]">
              We do not track continuous background GPS or sell your location data to advertisers.
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[--color-forest] font-[650]">
              <Lock size={15} />
              <span>PCI-DSS Payments</span>
            </div>
            <p className="text-[--color-muted]">
              Payment card numbers, UPI PINs, and banking credentials never touch Inlo servers.
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[--color-forest] font-[650]">
              <UserCheck size={15} />
              <span>Your Right to Erase</span>
            </div>
            <p className="text-[--color-muted]">
              You can request complete account and data erasure anytime through our support desk.
            </p>
          </div>
        </div>
      </div>

      {/* Detailed DPDP Disclosure */}
      <div className="prose prose-neutral max-w-none space-y-8 text-sm leading-relaxed text-[--color-foreground]">
        <section>
          <h2 className="text-h3 text-[--color-foreground] font-[700] mb-3">1. Scope and Applicability</h2>
          <p className="text-[--color-muted]">
            This Privacy Notice is issued in compliance with the Digital Personal Data Protection Act, 2023 (DPDP Act) and the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011. It applies to all personal data processed by Inlo Technologies Private Limited (&quot;Data Fiduciary&quot;) when you use our mobile and web applications.
          </p>
        </section>

        <section>
          <h2 className="text-h3 text-[--color-foreground] font-[700] mb-3">2. Personal Data We Collect</h2>
          <div className="space-y-3 text-[--color-muted]">
            <div>
              <p className="font-[650] text-[--color-foreground]">A. Account &amp; Identity Data</p>
              <p>Mobile number, full name, email address, and profile preferences collected during sign-up for account creation and authentication via OTP.</p>
            </div>

            <div>
              <p className="font-[650] text-[--color-foreground]">B. Activity &amp; Booking Data</p>
              <p>Session reservation history, redeemed activity passes, venue attendance check-in timestamps, and credit ledger balance.</p>
            </div>

            <div>
              <p className="font-[650] text-[--color-foreground]">C. Transaction &amp; Billing Data</p>
              <p>Payment transaction IDs, pack purchase amounts, GST invoice numbers, and payment status. Card details are processed directly by RBI-licensed payment aggregators.</p>
            </div>

            <div>
              <p className="font-[650] text-[--color-foreground]">D. Locality Preferences</p>
              <p>Selected pilot neighborhoods (e.g. Indiranagar, Domlur, Koramangala) chosen by you to filter venue discovery.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-h3 text-[--color-foreground] font-[700] mb-3">3. Purpose of Processing (Lawful Basis)</h2>
          <p className="text-[--color-muted]">
            We process your personal data strictly for specified, explicit, and legitimate purposes:
          </p>
          <ul className="list-disc list-inside space-y-1.5 mt-2 text-[--color-muted]">
            <li>To fulfill booking reservations and provide digital check-in passes to venue partners.</li>
            <li>To manage your prepaid credit ledger and process secure membership transactions.</li>
            <li>To communicate transactional updates (booking confirmations, schedule changes, refunds).</li>
            <li>To comply with statutory financial accounting and taxation mandates under Indian law.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-h3 text-[--color-foreground] font-[700] mb-3">4. Data Sharing &amp; Third Parties</h2>
          <p className="text-[--color-muted]">
            We do not sell, rent, or trade your personal data. Personal data is shared only with:
          </p>
          <ul className="list-disc list-inside space-y-1.5 mt-2 text-[--color-muted]">
            <li><strong>Partner Venues:</strong> Only the necessary attendee name, booking reference, and single-use check-in token for venue admission.</li>
            <li><strong>Payment Aggregators:</strong> PCI-DSS compliant payment gateways (e.g. Razorpay) to process payments securely.</li>
            <li><strong>Cloud Infrastructure:</strong> Secured cloud database infrastructure located within India in compliance with data residency best practices.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-h3 text-[--color-foreground] font-[700] mb-3">5. Your Rights as a Data Principal</h2>
          <p className="text-[--color-muted]">
            Under Chapter III of the DPDP Act 2023, you have the following enforceable rights:
          </p>
          <div className="mt-3 pl-4 border-l-2 border-[--color-border] space-y-2 text-[--color-muted]">
            <p><strong>Right to Access:</strong> Request a summary of personal data being processed and identities of parties with whom it has been shared.</p>
            <p><strong>Right to Correction &amp; Completion:</strong> Request correction of inaccurate personal data or completion of incomplete profiles.</p>
            <p><strong>Right to Erasure:</strong> Request deletion of your account and personal data, subject to legal record-keeping obligations (e.g., GST audit requirements).</p>
            <p><strong>Right to Grievance Redressal:</strong> Avail of expeditious redressal of any grievance regarding our processing of your personal data.</p>
          </div>
        </section>

        <section className="pt-6 border-t border-[--color-border]">
          <h2 className="text-h3 text-[--color-foreground] font-[700] mb-2">Data Protection Officer / Grievance Officer</h2>
          <p className="text-[--color-muted]">
            In accordance with the DPDP Act 2023 and Information Technology Act rules, the Data Protection Officer can be reached at:
          </p>
          <div className="mt-2 text-xs text-[--color-muted] font-mono space-y-0.5">
            <p>Designation: Data Protection Officer (DPO)</p>
            <p>Inlo Technologies Private Limited</p>
            <p>Indiranagar, Bengaluru, Karnataka 560038, India</p>
            <p>Email: privacy@inlo.tech · Response SLA: 48 business hours</p>
          </div>
        </section>
      </div>
    </div>
  )
}
