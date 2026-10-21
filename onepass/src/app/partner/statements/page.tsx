import type { Metadata } from "next"
import { calculateVenueSettlement } from "@/features/partner/settlement-service"
import { ExportStatementButton } from "@/components/partner/export-statement-button"
import { Badge } from "@/components/ui/badge"
import { formatPaise } from "@/lib/utils"
import {
  FileText,
  Calendar,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Building2,
  TrendingUp,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Partner settlement statements",
  description: "View verified visits, credit redemptions, and reconciled payout statements.",
}

export default async function PartnerStatementsPage() {
  const DEMO_PARTNER_ID = "part-01"
  const DEMO_VENUE_ID = "ven-hub-arena"

  const statement = await calculateVenueSettlement(DEMO_PARTNER_ID, DEMO_VENUE_ID, "2026-10")

  return (
    <div className="p-6 md:p-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-[--color-border]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <h1 className="text-h1 text-[--color-foreground]">Settlement statements</h1>
            <Badge variant="success" className="text-xs">
              <CheckCircle2 size={12} className="mr-1" />
              Reconciled
            </Badge>
          </div>
          <p className="text-body text-[--color-muted]">
            Reconciled session visits, credit redemption earnings, and payout status for {statement.venueName}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ExportStatementButton statement={statement} />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] p-5">
          <p className="text-xs font-[600] uppercase text-[--color-muted]">Net Settlement</p>
          <p className="text-h2 text-[--color-foreground] font-[750] mt-1 tabular-nums">
            {formatPaise(statement.netPayoutPaise)}
          </p>
          <p className="text-[11px] text-[--color-forest] font-[600] mt-1 flex items-center gap-1">
            <TrendingUp size={12} /> 100% of gross (0% commission)
          </p>
        </div>

        <div className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] p-5">
          <p className="text-xs font-[600] uppercase text-[--color-muted]">Credits Redeemed</p>
          <p className="text-h2 text-[--color-foreground] font-[750] mt-1 tabular-nums">
            {statement.totalCreditsRedeemed}
          </p>
          <p className="text-[11px] text-[--color-muted] mt-1">
            Across {statement.completedVisitsCount} verified check-ins
          </p>
        </div>

        <div className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] p-5">
          <p className="text-xs font-[600] uppercase text-[--color-muted]">Agreed Payout Rate</p>
          <p className="text-h2 text-[--color-foreground] font-[750] mt-1 tabular-nums">
            {formatPaise(statement.payoutRatePerCreditPaise)}
          </p>
          <p className="text-[11px] text-[--color-muted] mt-1">Per redeemed credit</p>
        </div>

        <div className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] p-5">
          <p className="text-xs font-[600] uppercase text-[--color-muted]">Disbursement Status</p>
          <div className="mt-2">
            <Badge variant="outline" className="border-amber-600 text-amber-800 bg-amber-50">
              Batch approval pending
            </Badge>
          </div>
          <p className="text-[11px] text-[--color-muted] mt-2">
            RBI settlement window
          </p>
        </div>
      </div>

      {/* Reconciled Statement Breakdown */}
      <div className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] p-6 shadow-sm mb-8">
        <div className="flex items-center justify-between pb-4 border-b border-[--color-border] mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-[--radius-md] bg-[--color-surface-muted] text-[--color-foreground]">
              <FileText size={18} />
            </div>
            <div>
              <h2 className="text-h3 text-[--color-foreground]">
                Statement for {statement.billingPeriod}
              </h2>
              <p className="text-xs text-[--color-muted]">
                Generated on {new Date(statement.generatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>
          </div>

          <Badge variant="outline" className="font-mono text-xs">
            Ref: STMT-{statement.billingPeriod}-{statement.venueId}
          </Badge>
        </div>

        <div className="divide-y divide-[--color-border] text-sm">
          <div className="py-3 flex justify-between items-center">
            <span className="text-[--color-muted]">Venue Partner</span>
            <span className="font-[650] text-[--color-foreground] flex items-center gap-1.5">
              <Building2 size={14} className="text-[--color-forest]" />
              {statement.venueName}
            </span>
          </div>

          <div className="py-3 flex justify-between items-center">
            <span className="text-[--color-muted]">Billing Period</span>
            <span className="font-mono text-[--color-foreground] flex items-center gap-1.5">
              <Calendar size={14} className="text-[--color-forest]" />
              October 2026 (Launch Pilot)
            </span>
          </div>

          <div className="py-3 flex justify-between items-center">
            <span className="text-[--color-muted]">Total Completed Visits Admitted</span>
            <span className="font-[650] text-[--color-foreground] tabular-nums">
              {statement.completedVisitsCount} sessions
            </span>
          </div>

          <div className="py-3 flex justify-between items-center">
            <span className="text-[--color-muted]">Gross Credits Redeemed</span>
            <span className="font-[650] text-[--color-foreground] tabular-nums">
              {statement.totalCreditsRedeemed} credits
            </span>
          </div>

          <div className="py-3 flex justify-between items-center">
            <span className="text-[--color-muted]">Payout Rate per Redeemed Credit</span>
            <span className="font-mono text-[--color-foreground]">
              ₹{(statement.payoutRatePerCreditPaise / 100).toFixed(2)}
            </span>
          </div>

          <div className="py-3 flex justify-between items-center">
            <span className="text-[--color-muted]">Gross Reconciled Amount</span>
            <span className="font-[650] text-[--color-foreground] tabular-nums">
              {formatPaise(statement.grossPayoutPaise)}
            </span>
          </div>

          <div className="py-3 flex justify-between items-center">
            <span className="text-[--color-muted]">Platform Commission (Pilot 0% fee)</span>
            <span className="text-[--color-forest] font-[600]">
              - ₹0.00 (Incentive waiver applied)
            </span>
          </div>

          <div className="py-4 flex justify-between items-center bg-[--color-surface-muted] -mx-6 px-6 font-[700] text-base">
            <span className="text-[--color-foreground]">Net Amount Payable</span>
            <span className="text-[--color-forest] text-h3 tabular-nums">
              {formatPaise(statement.netPayoutPaise)}
            </span>
          </div>
        </div>
      </div>

      {/* Operational Policy & Disbursement Guardrails (rules.md §4) */}
      <div className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface-muted] p-5 space-y-3">
        <div className="flex items-center gap-2 text-[--color-foreground] font-[650] text-sm">
          <AlertCircle size={16} className="text-[--color-forest]" />
          <span>Operational Control Notice (Phase 6 Pilot Invariant)</span>
        </div>
        <p className="text-xs text-[--color-muted] leading-relaxed">
          In strict accordance with project financial governance rules, <strong>live automated direct payouts remain disabled</strong>.
          Every partner statement is systematically reconciled against immutable digital pass check-in ledger entries. Batch bank NEFT/RTGS disbursements are initiated upon partner confirmation and operational sign-off.
        </p>
        <div className="flex items-center gap-2 text-[11px] text-[--color-muted] font-mono pt-1">
          <CreditCard size={13} />
          Registered Disbursement Bank: HDFC Bank · Account ending **4921 · IFSC: HDFC0000045
        </div>
      </div>
    </div>
  )
}
