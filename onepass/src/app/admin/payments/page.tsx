import type { Metadata } from "next"
import Link from "next/link"
import { MEMBERSHIP_PRODUCTS } from "@/features/payments/products"
import { Button } from "@/components/ui/button"
import { formatPaise } from "@/lib/utils"
import { CreditCard, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react"

export const metadata: Metadata = { title: "Payment operations — Admin" }

export default function AdminPaymentsPage() {
  return (
    <div className="p-6 md:p-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-[--color-border]">
        <div>
          <h1 className="text-h2 text-[--color-foreground] mb-1">Payment operations</h1>
          <p className="text-body text-[--color-muted]">
            Membership pack catalog, webhook fulfillment security, and transaction audit trails.
          </p>
        </div>

        <Button asChild variant="secondary" size="sm">
          <Link href="/membership">
            Member Checkout View <ArrowRight size={12} className="ml-1" />
          </Link>
        </Button>
      </div>

      {/* Security Architecture Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 text-xs">
        <div className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] p-4">
          <div className="flex items-center gap-1.5 text-[--color-forest] font-[650] mb-1">
            <ShieldCheck size={16} />
            <span>HMAC SHA256 Webhook Auth</span>
          </div>
          <p className="text-[--color-muted]">
            Raw-body signature verification prevents tampering. Browser redirects alone never grant credits.
          </p>
        </div>

        <div className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] p-4">
          <div className="flex items-center gap-1.5 text-[--color-forest] font-[650] mb-1">
            <CreditCard size={16} />
            <span>Integer Paise Invariant</span>
          </div>
          <p className="text-[--color-muted]">
            All financial values are strictly handled in integer paise to eliminate floating-point rounding errors.
          </p>
        </div>

        <div className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] p-4">
          <div className="flex items-center gap-1.5 text-[--color-forest] font-[650] mb-1">
            <CheckCircle2 size={16} />
            <span>Deduplicated Event Inbox</span>
          </div>
          <p className="text-[--color-muted]">
            Duplicate payment webhook notifications return HTTP 200 without executing duplicate ledger grants.
          </p>
        </div>
      </div>

      {/* Product Catalog */}
      <h2 className="text-h3 text-[--color-foreground] mb-3">Live Membership Pack Catalog</h2>
      <div className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] overflow-hidden shadow-sm mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[--color-surface-muted] border-b border-[--color-border] text-[--color-muted] uppercase font-[650]">
              <tr>
                <th className="px-5 py-3">Pack Code</th>
                <th className="px-5 py-3">Display Name</th>
                <th className="px-5 py-3">Credits Granted</th>
                <th className="px-5 py-3">Price (INR)</th>
                <th className="px-5 py-3">Effective Per-Credit Cost</th>
                <th className="px-5 py-3">Validity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[--color-border]">
              {MEMBERSHIP_PRODUCTS.map((prod) => (
                <tr key={prod.id} className="hover:bg-[--color-surface-muted]/50 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-[--color-foreground]">
                    {prod.id}
                  </td>
                  <td className="px-5 py-3.5 font-[650] text-sm text-[--color-foreground]">
                    {prod.name}
                  </td>
                  <td className="px-5 py-3.5 font-mono font-[700] text-[--color-forest]">
                    {prod.credits} credits
                  </td>
                  <td className="px-5 py-3.5 font-mono font-[650] text-[--color-foreground]">
                    {formatPaise(prod.pricePaise)}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-[--color-muted]">
                    ₹{(prod.pricePaise / prod.credits / 100).toFixed(0)} / credit
                  </td>
                  <td className="px-5 py-3.5 text-[--color-muted]">
                    {prod.validityDays} days
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
