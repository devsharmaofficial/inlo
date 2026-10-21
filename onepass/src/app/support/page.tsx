import type { Metadata } from "next"
import Link from "next/link"
import { SupportForm } from "@/components/support/support-form"
import { Badge } from "@/components/ui/badge"
import {
  MessageCircle,
  Mail,
  Clock,
  HelpCircle,
  ArrowRight,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Help & Support",
  description: "Contact the Inlo Bengaluru pilot support desk or browse frequently asked questions.",
}

const FAQS = [
  {
    q: "How do I check in when I arrive at the venue?",
    a: "Open your confirmed booking in 'My bookings' and show the digital pass token or screen to the front desk staff. The venue staff verifies it on their terminal and confirms your entry instantly.",
  },
  {
    q: "What is the cancellation cutoff window?",
    a: "You can cancel any booking up to 2 hours before the session start time for an instant 100% refund of debited credits to your account. Sessions cancelled under 2 hours forfeit credits to compensate the partner venue.",
  },
  {
    q: "How long are credit packs valid?",
    a: "All credit packs are valid for 30 calendar days from the moment of purchase. You can book any session taking place during your active pack period.",
  },
  {
    q: "Can I bring a friend or book multiple spots?",
    a: "During the initial Bengaluru pilot, each booking reserves 1 spot for the account holder to ensure accurate venue headcounts. Group pack features are planned for our next milestone.",
  },
  {
    q: "What should I wear or bring to the venue?",
    a: "Please follow standard athletic facility rules: non-marking shoes are strictly required on wooden badminton courts; proper swimwear and caps are required for swimming pools. Venues provide court access and nets; bring your own racquets or rent at the desk.",
  },
]

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      {/* Page Title */}
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <Badge variant="outline" className="text-xs mb-2">
          Concierge Support
        </Badge>
        <h1 className="text-h1 text-[--color-foreground] mb-3">Help &amp; Support</h1>
        <p className="text-body text-[--color-muted]">
          Have a question about a booking, your credits, or partner venue check-ins? Our Bengaluru pilot support team is here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
        {/* Support Inquiry Form (7 cols) */}
        <div className="lg:col-span-7 rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-h3 text-[--color-foreground]">Send an Inquiry</h2>
          </div>
          <p className="text-xs text-[--color-muted] mb-6">
            We will reply to your registered mobile number or email address.
          </p>
          <SupportForm />
        </div>

        {/* Contact Information & Channels (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] p-6 shadow-sm space-y-4">
            <h3 className="text-label font-[700] text-[--color-foreground]">
              Direct Contact Channels
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3 p-3 rounded-[--radius-md] bg-[--color-surface-muted]">
                <MessageCircle size={18} className="text-[--color-forest] shrink-0 mt-0.5" />
                <div>
                  <p className="font-[650] text-[--color-foreground]">WhatsApp Support</p>
                  <p className="text-[--color-muted] mt-0.5">+91 80 4920 1800</p>
                  <span className="text-[10px] text-[--color-forest] font-[600]">Fastest for live check-in queries</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-[--radius-md] bg-[--color-surface-muted]">
                <Mail size={18} className="text-[--color-forest] shrink-0 mt-0.5" />
                <div>
                  <p className="font-[650] text-[--color-foreground]">Email Desk</p>
                  <p className="text-[--color-muted] mt-0.5">support@inlo.in</p>
                  <span className="text-[10px] text-[--color-muted]">For billing &amp; account queries</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-[--radius-md] bg-[--color-surface-muted]">
                <Clock size={18} className="text-[--color-forest] shrink-0 mt-0.5" />
                <div>
                  <p className="font-[650] text-[--color-foreground]">Operating Hours</p>
                  <p className="text-[--color-muted] mt-0.5">06:00 AM – 10:00 PM IST</p>
                  <span className="text-[10px] text-[--color-muted]">Monday through Sunday</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick links to policies */}
          <div className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface-muted] p-5 text-xs space-y-2.5">
            <p className="font-[650] text-[--color-foreground]">Helpful Policies</p>
            <ul className="space-y-1.5 text-[--color-muted]">
              <li>
                <Link href="/legal/cancellations" className="hover:text-[--color-foreground] flex items-center justify-between">
                  <span>Cancellations &amp; Refund Rules</span>
                  <ArrowRight size={12} />
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="hover:text-[--color-foreground] flex items-center justify-between">
                  <span>Terms of Service</span>
                  <ArrowRight size={12} />
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="hover:text-[--color-foreground] flex items-center justify-between">
                  <span>Privacy Notice (DPDP Act)</span>
                  <ArrowRight size={12} />
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="border-t border-[--color-border] pt-12">
        <div className="text-center mb-8">
          <h2 className="text-h2 text-[--color-foreground] mb-2">Frequently Asked Questions</h2>
          <p className="text-sm text-[--color-muted]">Quick answers to common questions about Inlo</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="rounded-[--radius-md] border border-[--color-border] bg-[--color-surface] p-5 text-xs space-y-1.5"
            >
              <p className="font-[700] text-sm text-[--color-foreground] flex items-start gap-2">
                <HelpCircle size={15} className="text-[--color-forest] shrink-0 mt-0.5" />
                <span>{faq.q}</span>
              </p>
              <p className="text-[--color-muted] leading-relaxed pl-6">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
