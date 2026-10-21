import type { Metadata } from "next"
import { getRawLedgerStore, reconcileCreditBalance } from "@/features/credits/credit-ledger-service"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2 } from "lucide-react"

export const metadata: Metadata = { title: "Credit ledger audit — Admin" }

export default async function AdminLedgerPage() {
  const entries = getRawLedgerStore().reverse()
  const recon = await reconcileCreditBalance("user-member-1")

  return (
    <div className="p-6 md:p-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-[--color-border]">
        <div>
          <h1 className="text-h2 text-[--color-foreground] mb-1">Credit ledger audit</h1>
          <p className="text-body text-[--color-muted]">
            Immutable, append-only double-entry credit ledger with mathematical consistency verification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={recon.isConsistent ? "success" : "danger"}>
            <CheckCircle2 size={12} className="mr-1" />
            {recon.isConsistent ? "Ledger Reconciled (0 Drift)" : "Discrepancy Detected"}
          </Badge>
        </div>
      </div>

      {/* Ledger Architecture Invariants */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 text-xs">
        <div className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] p-4">
          <p className="font-[600] text-[--color-muted] uppercase">Demo Account Balance</p>
          <p className="text-h3 font-[750] text-[--color-foreground] mt-1 tabular-nums">
            {recon.balance} credits
          </p>
          <p className="text-[11px] text-[--color-forest] font-[600] mt-1">
            Authoritative sum of all deltas
          </p>
        </div>

        <div className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] p-4">
          <p className="font-[600] text-[--color-muted] uppercase">Total Ledger Transactions</p>
          <p className="text-h3 font-[750] text-[--color-foreground] mt-1 tabular-nums">
            {entries.length} entries
          </p>
          <p className="text-[11px] text-[--color-muted] mt-1">
            Zero destructive mutations
          </p>
        </div>

        <div className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] p-4">
          <p className="font-[600] text-[--color-muted] uppercase">Audit Ledger Standard</p>
          <p className="font-[650] text-sm text-[--color-foreground] mt-1">
            Append-Only Snapshot
          </p>
          <p className="text-[11px] text-[--color-muted] mt-1">
            Idempotency keys enforced
          </p>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[--color-surface-muted] border-b border-[--color-border] text-[--color-muted] uppercase font-[650]">
              <tr>
                <th className="px-5 py-3">Ledger ID</th>
                <th className="px-5 py-3">Member</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Delta</th>
                <th className="px-5 py-3">Source &amp; Idempotency</th>
                <th className="px-5 py-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[--color-border]">
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-[--color-surface-muted]/50 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-[--color-foreground]">
                    {entry.id}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-[--color-muted]">
                    {entry.userId}
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge
                      variant={
                        entry.entryType === "grant" || entry.entryType === "refund"
                          ? "success"
                          : "default"
                      }
                      className="uppercase text-[10px]"
                    >
                      {entry.entryType}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 font-mono font-[700]">
                    <span
                      className={
                        entry.delta > 0
                          ? "text-[--color-forest]"
                          : "text-amber-800"
                      }
                    >
                      {entry.delta > 0 ? `+${entry.delta}` : entry.delta}cr
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-[--color-foreground] font-[600]">{entry.sourceType}</p>
                    <p className="text-[10px] text-[--color-muted] font-mono truncate max-w-xs">
                      Key: {entry.idempotencyKey}
                    </p>
                  </td>
                  <td className="px-5 py-3.5 text-[--color-muted] tabular-nums">
                    {new Date(entry.createdAt).toLocaleString("en-IN", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
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
