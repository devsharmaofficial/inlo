import type { Metadata } from "next"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, ArrowRight } from "lucide-react"

export const metadata: Metadata = { title: "Partner directory — Admin" }

const PILOT_PARTNERS = [
  {
    id: "part-01",
    businessName: "The Hub Sports Arena Pvt Ltd",
    brandName: "The Hub Sports Arena",
    venueId: "ven-hub-arena",
    locality: "Domlur",
    contactName: "Vikram Sen",
    phone: "+91 98450 88214",
    email: "operations@thehubsports.in",
    status: "active",
    settlementCycle: "Bi-weekly NEFT",
    payoutRate: "₹70.00 / credit",
  },
  {
    id: "part-02",
    businessName: "AquaLife Aquatic Centre LLP",
    brandName: "AquaLife Aquatic Centre",
    venueId: "ven-aqualife",
    locality: "Indiranagar",
    contactName: "Nisha Rao",
    phone: "+91 98860 11920",
    email: "desk@aqualifeblr.com",
    status: "active",
    settlementCycle: "Bi-weekly NEFT",
    payoutRate: "₹70.00 / credit",
  },
  {
    id: "part-03",
    businessName: "Iron & Movement Athletic Club",
    brandName: "Iron & Movement Club",
    venueId: "ven-iron-club",
    locality: "Koramangala",
    contactName: "Rohit Verma",
    phone: "+91 97410 44829",
    email: "hello@ironandmovement.in",
    status: "active",
    settlementCycle: "Bi-weekly NEFT",
    payoutRate: "₹70.00 / credit",
  },
  {
    id: "part-04",
    businessName: "Prana Shala Wellness Studios",
    brandName: "Prana Shala",
    venueId: "ven-prana-shala",
    locality: "Indiranagar",
    contactName: "Ananya Deshmukh",
    phone: "+91 99000 66318",
    email: "namaste@pranashala.org",
    status: "active",
    settlementCycle: "Bi-weekly NEFT",
    payoutRate: "₹70.00 / credit",
  },
  {
    id: "part-05",
    businessName: "Veloce Sports & Racquets",
    brandName: "Veloce Hub",
    venueId: "ven-veloce",
    locality: "Domlur",
    contactName: "Karthik Pillai",
    phone: "+91 98440 33012",
    email: "contact@velocehub.in",
    status: "active",
    settlementCycle: "Bi-weekly NEFT",
    payoutRate: "₹70.00 / credit",
  },
]

export default function AdminPartnersPage() {
  return (
    <div className="p-6 md:p-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-[--color-border]">
        <div>
          <h1 className="text-h2 text-[--color-foreground] mb-1">Partner directory</h1>
          <p className="text-body text-[--color-muted]">
            Verified facility operators, banking settlement parameters, and multi-tenant isolation audit.
          </p>
        </div>

        <Badge variant="outline" className="text-xs">
          {PILOT_PARTNERS.length} Active Partners
        </Badge>
      </div>

      <div className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[--color-surface-muted] border-b border-[--color-border] text-[--color-muted] uppercase font-[650]">
              <tr>
                <th className="px-5 py-3">Partner Entity</th>
                <th className="px-5 py-3">Assigned Venue</th>
                <th className="px-5 py-3">Point of Contact</th>
                <th className="px-5 py-3">Settlement Terms</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Portal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[--color-border]">
              {PILOT_PARTNERS.map((partner) => (
                <tr key={partner.id} className="hover:bg-[--color-surface-muted]/50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-[650] text-sm text-[--color-foreground]">
                      {partner.brandName}
                    </p>
                    <p className="text-[11px] text-[--color-muted]">
                      {partner.businessName} · <span className="font-mono">{partner.id}</span>
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-mono text-[--color-foreground]">{partner.venueId}</span>
                    <p className="text-[11px] text-[--color-muted]">{partner.locality}, Bengaluru</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-[--color-foreground] font-[600]">{partner.contactName}</p>
                    <p className="text-[11px] text-[--color-muted] font-mono">{partner.phone}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-mono text-[--color-forest] font-[600]">{partner.payoutRate}</p>
                    <p className="text-[11px] text-[--color-muted]">{partner.settlementCycle}</p>
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant="success">
                      <CheckCircle2 size={11} className="mr-1" />
                      {partner.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Button asChild variant="secondary" size="sm">
                      <Link href="/partner/dashboard">
                        Partner Desk <ArrowRight size={12} className="ml-1" />
                      </Link>
                    </Button>
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
