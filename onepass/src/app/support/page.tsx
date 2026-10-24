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
    q: "How do I check in at a venue?",
    a: "Open your booking in 'My bookings' and show the QR pass to the front desk. Entry is confirmed instantly.",
  },
  {
    q: "What is the cancellation cutoff?",
    a: "Cancel up to 2 hours before the session for a full credit refund. Under 2 hours forfeits credits.",
  },
  {
    q: "How long are credit packs valid?",
    a: "30 days from purchase. Book any session within the active pack period.",
  },
  {
    q: "Can I bring a guest?",
    a: "Each booking reserves one spot. Group features are on the roadmap.",
  },
  {
    q: "What should I bring to the venue?",
    a: "Non-marking shoes for courts, swimwear + cap for pools. Bring your own racquets or rent at the desk.",
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
        <h1 className="text-h1 text-[--color-foreground] mb-1">Help &amp; Support</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
        {/* Support Inquiry Form (7 cols) */}
        <div className="lg:col-span-7 rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] p-6 sm:p-8 shadow-sm">
          <h2 className="text-h3 text-[--color-foreground]">Send an inquiry</h2>
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
                  <p className="text-[--color-muted] mt-0.5">support@inlo.tech</p>
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
