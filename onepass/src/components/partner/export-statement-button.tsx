"use client"

import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { SettlementStatement } from "@/features/partner/settlement-service"

export function ExportStatementButton({ statement }: { statement: SettlementStatement }) {
  const handleExport = () => {
    const csvRows = [
      ["Inlo Partner Settlement Statement"],
      ["Generated", statement.generatedAt],
      ["Billing Period", statement.billingPeriod],
      ["Partner ID", statement.partnerId],
      ["Venue ID", statement.venueId],
      ["Venue Name", `"${statement.venueName}"`],
      ["Status", statement.status],
      ["Payout Status", statement.payoutStatus],
      [],
      ["Metric", "Value"],
      ["Completed Visits", statement.completedVisitsCount.toString()],
      ["Total Credits Redeemed", statement.totalCreditsRedeemed.toString()],
      ["Payout Rate Per Credit (INR)", (statement.payoutRatePerCreditPaise / 100).toFixed(2)],
      ["Gross Payout (INR)", (statement.grossPayoutPaise / 100).toFixed(2)],
      ["Platform Commission (INR)", (statement.platformCommissionPaise / 100).toFixed(2)],
      ["Net Payout (INR)", (statement.netPayoutPaise / 100).toFixed(2)],
    ]

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map((e) => e.join(",")).join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute(
      "download",
      `inlo-settlement-${statement.venueId}-${statement.billingPeriod}.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Button variant="secondary" size="sm" onClick={handleExport}>
      <Download size={14} className="mr-1.5" />
      Export statement (.csv)
    </Button>
  )
}
