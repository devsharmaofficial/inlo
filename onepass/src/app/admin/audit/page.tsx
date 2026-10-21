import type { Metadata } from "next"
import { getInventoryAuditLogs } from "@/features/partner/inventory-service"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck } from "lucide-react"

export const metadata: Metadata = { title: "Operational audit log — Admin" }

export default async function AdminAuditPage() {
  const logs = await getInventoryAuditLogs()

  return (
    <div className="p-6 md:p-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-[--color-border]">
        <div>
          <h1 className="text-h2 text-[--color-foreground] mb-1">Operational audit log</h1>
          <p className="text-body text-[--color-muted]">
            Tamper-evident trail of inventory capacity modifications, blackout periods, and administrative overrides.
          </p>
        </div>

        <Badge variant="outline" className="text-xs">
          <ShieldCheck size={12} className="mr-1 text-[--color-forest]" />
          Immutable Audit Stream
        </Badge>
      </div>

      {/* Audit Invariant Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 text-xs">
        <div className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] p-4">
          <p className="font-[600] text-[--color-muted] uppercase">Actor Identity</p>
          <p className="font-[650] text-sm text-[--color-foreground] mt-1">
            Server Session Bound
          </p>
          <p className="text-[11px] text-[--color-muted] mt-1">
            Never derived from client-editable fields
          </p>
        </div>

        <div className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] p-4">
          <p className="font-[600] text-[--color-muted] uppercase">Logged Events</p>
          <p className="text-h3 font-[750] text-[--color-foreground] mt-1 tabular-nums">
            {logs.length}
          </p>
          <p className="text-[11px] text-[--color-forest] font-[600] mt-1">
            Real-time capture on mutation
          </p>
        </div>

        <div className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] p-4">
          <p className="font-[600] text-[--color-muted] uppercase">Regulatory Retention</p>
          <p className="font-[650] text-sm text-[--color-foreground] mt-1">
            180 Days Minimum
          </p>
          <p className="text-[11px] text-[--color-muted] mt-1">
            DPDP Act &amp; CERT-In compliant
          </p>
        </div>
      </div>

      {/* Log Table */}
      <div className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] overflow-hidden shadow-sm">
        {logs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[--color-surface-muted] border-b border-[--color-border] text-[--color-muted] uppercase font-[650]">
                <tr>
                  <th className="px-5 py-3">Timestamp</th>
                  <th className="px-5 py-3">Actor &amp; Role</th>
                  <th className="px-5 py-3">Action</th>
                  <th className="px-5 py-3">Target</th>
                  <th className="px-5 py-3">Reason / Context</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[--color-border]">
                {logs.map((entry) => (
                  <tr key={entry.id} className="hover:bg-[--color-surface-muted]/50 transition-colors">
                    <td className="px-5 py-3.5 text-[--color-muted] tabular-nums whitespace-nowrap">
                      {new Date(entry.createdAt).toLocaleString("en-IN", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-mono text-[--color-foreground]">{entry.actorId}</p>
                      <span className="text-[10px] text-[--color-forest] uppercase font-[600]">
                        {entry.actorRole}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant="outline" className="font-mono text-[10px] uppercase">
                        {entry.action}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-[--color-muted]">
                      {entry.targetType}: {entry.targetId}
                    </td>
                    <td className="px-5 py-3.5 text-[--color-foreground]">
                      {entry.reason || "Operational configuration"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-[--color-muted]">
            No inventory mutation audit events recorded in current shift.
          </div>
        )}
      </div>
    </div>
  )
}
