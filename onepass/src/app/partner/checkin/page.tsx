import type { Metadata } from "next"
import { CheckinForm } from "@/components/partner/checkin-form"
import { Badge } from "@/components/ui/badge"
import { MapPin, ShieldCheck } from "lucide-react"

export const metadata: Metadata = {
  title: "Front desk check-in",
  description: "Verify and admit Inlo members via single-use digital pass tokens.",
}

export default function PartnerCheckinPage() {
  return (
    <div className="p-6 md:p-8 max-w-4xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-[--color-border]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <h1 className="text-h1 text-[--color-foreground]">Check-in desk</h1>
            <Badge variant="outline" className="bg-[--color-surface] text-xs">
              <ShieldCheck size={12} className="mr-1 text-[--color-forest]" />
              Staff terminal
            </Badge>
          </div>
          <p className="text-body text-[--color-muted]">
            Validate member single-use passes at arrival to log attendance and accrue payout credits.
          </p>
        </div>

        {/* Current Active Venue Context */}
        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-[--radius-md] border border-[--color-border] bg-[--color-surface] text-xs text-[--color-foreground]">
          <MapPin size={14} className="text-[--color-forest] shrink-0" />
          <div>
            <span className="font-[650] block">The Hub Sports Arena</span>
            <span className="text-[--color-muted]">Domlur · Pilot Venue #1</span>
          </div>
        </div>
      </div>

      {/* Main Check-in Interface */}
      <CheckinForm />
    </div>
  )
}
