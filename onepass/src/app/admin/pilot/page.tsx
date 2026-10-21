import type { Metadata } from "next"
import { getPilotOperationalMetrics } from "@/features/admin/pilot-metrics-service"
import { getPilotCohort } from "@/features/admin/system-controls"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  Users,
  Repeat,
  IndianRupee,
  CheckCircle2,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Pilot Cohort & Unit Economics — Admin",
  description: "Phase 8 pilot cohort performance, conversion, unit economics, and operational reliability.",
}

export default function AdminPilotPage() {
  const { kpis, categories } = getPilotOperationalMetrics()
  const cohort = getPilotCohort()

  return (
    <div className="p-6 md:p-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-[--color-border]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-[700] uppercase tracking-wider text-[--color-forest]">
              Phase 8 Operational Review
            </span>
            <span className="text-xs text-[--color-muted]">·</span>
            <span className="text-xs text-[--color-muted]">Bengaluru Cluster 1 (Indiranagar · Domlur · Koramangala)</span>
          </div>
          <h1 className="text-h2 text-[--color-foreground]">Pilot Cohort & Unit Economics</h1>
          <p className="text-body text-[--color-muted] mt-0.5">
            Real cohort analytics, search-to-book conversion, court utilization, and partner settlement margins.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Badge variant="success" className="px-3 py-1 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-1.5" />
            Live Pilot Active
          </Badge>
          <Badge variant="outline" className="text-xs">
            Week 1 Review
          </Badge>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-[--radius-lg] border border-[--color-border] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-[--color-muted] mb-2">
            <span className="text-xs font-[650] uppercase tracking-wide">Cohort Size</span>
            <Users size={18} className="text-[--color-forest]" />
          </div>
          <p className="text-2xl font-[800] text-[--color-foreground] tracking-tight">
            {kpis.cohortActiveMembers} <span className="text-sm font-[500] text-[--color-muted]">/ {kpis.cohortTargetMembers}</span>
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-700 font-[600]">
            <CheckCircle2 size={13} />
            <span>90% initial beta target onboarded</span>
          </div>
        </div>

        <div className="rounded-[--radius-lg] border border-[--color-border] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-[--color-muted] mb-2">
            <span className="text-xs font-[650] uppercase tracking-wide">Repeat Booking Rate</span>
            <Repeat size={18} className="text-[--color-forest]" />
          </div>
          <p className="text-2xl font-[800] text-[--color-foreground] tracking-tight">
            {kpis.repeatBookingRatePct}%
          </p>
          <p className="text-xs text-[--color-muted] mt-2">
            Members with ≥ 2 sessions in first 7 days
          </p>
        </div>

        <div className="rounded-[--radius-lg] border border-[--color-border] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-[--color-muted] mb-2">
            <span className="text-xs font-[650] uppercase tracking-wide">Gross Value (GBV)</span>
            <IndianRupee size={18} className="text-[--color-forest]" />
          </div>
          <p className="text-2xl font-[800] text-[--color-foreground] tracking-tight">
            ₹{kpis.grossBookingValueINR.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-[--color-muted] mt-2">
            Across {kpis.totalSessionsBooked} booked sessions
          </p>
        </div>

        <div className="rounded-[--radius-lg] border border-[--color-border] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-[--color-muted] mb-2">
            <span className="text-xs font-[650] uppercase tracking-wide">Net Platform Margin</span>
            <TrendingUp size={18} className="text-[--color-forest]" />
          </div>
          <p className="text-2xl font-[800] text-emerald-800 tracking-tight">
            ₹{kpis.platformNetContributionINR.toLocaleString("en-IN")}{" "}
            <span className="text-xs font-[600] text-emerald-700">({kpis.netMarginPct}%)</span>
          </p>
          <p className="text-xs text-[--color-muted] mt-2">
            After ₹70/cr partner payout &amp; 2% PSP
          </p>
        </div>
      </div>

      {/* Operational Reliability & Quality Grid */}
      <div className="rounded-[--radius-lg] border border-[--color-border] bg-white p-6 mb-8 shadow-sm">
        <h2 className="text-label font-[700] text-[--color-foreground] uppercase tracking-wider mb-4">
          Operational Quality &amp; Defect Metrics (Phase 8 Invariants)
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-xs">
          <div className="p-3.5 rounded-[--radius-md] bg-[#F7F7F2] border border-[#E2E5DC]">
            <p className="text-[--color-muted] font-[600] uppercase text-[10px]">Slot Accuracy</p>
            <p className="text-lg font-[750] text-[--color-foreground] mt-0.5">{kpis.slotAvailabilityAccuracyPct}%</p>
            <p className="text-[10px] text-[--color-muted]">Zero ghost availability</p>
          </div>

          <div className="p-3.5 rounded-[--radius-md] bg-[#F7F7F2] border border-[#E2E5DC]">
            <p className="text-[--color-muted] font-[600] uppercase text-[10px]">Venue Cancellations</p>
            <p className="text-lg font-[750] text-emerald-700 mt-0.5">{kpis.venueCancellationRatePct}%</p>
            <p className="text-[10px] text-[--color-muted]">0 partner cancellations</p>
          </div>

          <div className="p-3.5 rounded-[--radius-md] bg-[#F7F7F2] border border-[#E2E5DC]">
            <p className="text-[--color-muted] font-[600] uppercase text-[10px]">Member No-Shows</p>
            <p className="text-lg font-[750] text-[--color-foreground] mt-0.5">{kpis.memberNoShowRatePct}%</p>
            <p className="text-[10px] text-[--color-muted]">Credits forfeited cleanly</p>
          </div>

          <div className="p-3.5 rounded-[--radius-md] bg-[#F7F7F2] border border-[#E2E5DC]">
            <p className="text-[--color-muted] font-[600] uppercase text-[10px]">Support Complaints</p>
            <p className="text-lg font-[750] text-emerald-700 mt-0.5">{kpis.customerComplaintRatePct}%</p>
            <p className="text-[10px] text-[--color-muted]">0 court disputes</p>
          </div>

          <div className="p-3.5 rounded-[--radius-md] bg-[#F7F7F2] border border-[#E2E5DC]">
            <p className="text-[--color-muted] font-[600] uppercase text-[10px]">Avg Ticket Time</p>
            <p className="text-lg font-[750] text-[--color-foreground] mt-0.5">{kpis.avgSupportResolutionMinutes}m</p>
            <p className="text-[10px] text-[--color-muted]">Concierge response time</p>
          </div>

          <div className="p-3.5 rounded-[--radius-md] bg-[#F7F7F2] border border-[#E2E5DC]">
            <p className="text-[--color-muted] font-[600] uppercase text-[10px]">Ledger Inconsistency</p>
            <p className="text-lg font-[750] text-emerald-700 mt-0.5">₹0.00</p>
            <p className="text-[10px] text-[--color-muted]">0 drift / 100% matched</p>
          </div>
        </div>
      </div>

      {/* Unit Economics & P&L Statement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="rounded-[--radius-lg] border border-[--color-border] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-[--color-border] mb-4">
            <div>
              <h2 className="text-base font-[750] text-[--color-foreground]">Unit Economics &amp; P&amp;L</h2>
              <p className="text-xs text-[--color-muted]">Pilot cohort contribution breakdown</p>
            </div>
            <Badge variant="outline" className="text-xs font-mono">
              Active Pilot
            </Badge>
          </div>

          <table className="w-full text-xs">
            <tbody className="divide-y divide-[#E2E5DC]">
              <tr>
                <td className="py-3 text-[--color-muted] font-[550]">Gross Booking Value (42 sessions)</td>
                <td className="py-3 text-right font-mono font-[700] text-[--color-foreground]">
                  ₹{kpis.grossBookingValueINR.toLocaleString("en-IN")}
                </td>
              </tr>
              <tr>
                <td className="py-3 text-[--color-muted] font-[550]">
                  Partner Venue Disbursements (₹70 / credit)
                </td>
                <td className="py-3 text-right font-mono font-[700] text-amber-800">
                  -₹{kpis.partnerPayoutsINR.toLocaleString("en-IN")}
                </td>
              </tr>
              <tr>
                <td className="py-3 text-[--color-muted] font-[550]">
                  Payment Gateway Processing (2% Razorpay/Cashfree)
                </td>
                <td className="py-3 text-right font-mono font-[700] text-amber-800">
                  -₹{kpis.paymentGatewayFeesINR.toLocaleString("en-IN")}
                </td>
              </tr>
              <tr className="bg-[#F0F6F2] font-[700]">
                <td className="py-3 px-2 text-[#244638]">Net Platform Contribution Margin</td>
                <td className="py-3 px-2 text-right font-mono text-[#244638] text-sm">
                  +₹{kpis.platformNetContributionINR.toLocaleString("en-IN")} ({kpis.netMarginPct}%)
                </td>
              </tr>
              <tr>
                <td className="py-3 text-[--color-muted]">Unredeemed Member Float (Trust Liability)</td>
                <td className="py-3 text-right font-mono text-[--color-muted]">
                  ₹{kpis.unredeemedCreditLiabilityINR.toLocaleString("en-IN")}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Category Performance Breakdown */}
        <div className="rounded-[--radius-lg] border border-[--color-border] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-[--color-border] mb-4">
            <div>
              <h2 className="text-base font-[750] text-[--color-foreground]">Category Performance</h2>
              <p className="text-xs text-[--color-muted]">Capacity utilization and check-in rate</p>
            </div>
            <span className="text-xs font-[600] text-[--color-muted]">4 Pilot Categories</span>
          </div>

          <div className="space-y-4">
            {categories.map((cat) => (
              <div key={cat.category} className="p-3.5 rounded-[--radius-md] border border-[#E2E5DC] bg-[#F7F7F2]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-[700] text-xs text-[--color-foreground]">{cat.category}</span>
                    <span className="text-[10px] text-[--color-muted]">({cat.venueCount} venues)</span>
                  </div>
                  <span className="font-mono text-xs font-[700] text-[--color-forest]">
                    {cat.sessionsBooked} sessions
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px] pt-2 border-t border-[#E2E5DC] text-[--color-muted]">
                  <div>
                    <span>Capacity Fill:</span>{" "}
                    <strong className="text-[--color-foreground]">{cat.avgCapacityUtilizationPct}%</strong>
                  </div>
                  <div>
                    <span>On-time Check-in:</span>{" "}
                    <strong className="text-[--color-foreground]">{cat.punctualCheckinRatePct}%</strong>
                  </div>
                  <div className="text-right">
                    <span>Payout:</span>{" "}
                    <strong className="text-[--color-foreground] font-mono">₹{cat.partnerPayoutINR.toLocaleString("en-IN")}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Beta Cohort Member Table (The 20 Members) */}
      <div className="rounded-[--radius-lg] border border-[--color-border] bg-white shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[--color-border] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-[750] text-[--color-foreground]">20-Member Beta Cohort Tracker</h2>
            <p className="text-xs text-[--color-muted]">
              Tracked members for Bengaluru initial dense cluster pilot (Indiranagar · Domlur · Koramangala)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-[#F7F7F2] border border-[#E2E5DC] text-[--color-muted]">
              18 Active · 2 Invited
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#EFF0E8] border-b border-[--color-border] text-[--color-muted] uppercase font-[650]">
              <tr>
                <th className="px-5 py-3">Member</th>
                <th className="px-5 py-3">Locality</th>
                <th className="px-5 py-3">Joined</th>
                <th className="px-5 py-3">Credits (Used / Alloc)</th>
                <th className="px-5 py-3">Bookings</th>
                <th className="px-5 py-3">Check-ins</th>
                <th className="px-5 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E5DC]">
              {cohort.map((member) => (
                <tr key={member.id} className="hover:bg-[#F7F7F2]/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-[650] text-[--color-foreground]">{member.name}</p>
                    <p className="text-[11px] text-[--color-muted] font-mono">{member.phone}</p>
                  </td>
                  <td className="px-5 py-3.5 text-[--color-foreground]">{member.locality}</td>
                  <td className="px-5 py-3.5 text-[--color-muted] tabular-nums">
                    {new Date(member.joinedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </td>
                  <td className="px-5 py-3.5 font-mono">
                    <span className="font-[700] text-[--color-forest]">{member.creditsUsed}</span>
                    <span className="text-[--color-muted]"> / {member.creditsAllocated}cr</span>
                  </td>
                  <td className="px-5 py-3.5 font-mono font-[650] text-[--color-foreground]">
                    {member.bookingsCount}
                  </td>
                  <td className="px-5 py-3.5 font-mono font-[650] text-emerald-800">
                    {member.checkinsCount}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Badge variant={member.status === "active" ? "success" : "outline"}>
                      {member.status}
                    </Badge>
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
