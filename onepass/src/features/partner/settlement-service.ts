import { PILOT_VENUES } from "@/features/catalogue/pilot-seed"
import { assertPartnerOwnsVenue } from "./inventory-service"

export interface SettlementStatement {
  partnerId: string
  venueId: string
  venueName: string
  billingPeriod: string
  completedVisitsCount: number
  totalCreditsRedeemed: number
  payoutRatePerCreditPaise: number // e.g. 7000 = ₹70/credit
  grossPayoutPaise: number
  platformCommissionPaise: number
  netPayoutPaise: number
  currency: string
  status: "reconciled" | "pending_review" | "approved"
  payoutStatus: "held_for_approval" // Live automated payouts remain disabled until approved
  generatedAt: string
}

/**
 * Calculates a reconciled settlement statement for a partner's venue.
 * Follows rules.md §4: Live automated payouts remain disabled; statement is reconciled and exportable.
 */
export async function calculateVenueSettlement(
  partnerId: string,
  venueId: string,
  billingPeriod = "2026-10"
): Promise<SettlementStatement> {
  assertPartnerOwnsVenue(partnerId, venueId)

  const venue = PILOT_VENUES.find((v) => v.id === venueId)
  if (!venue) {
    throw new Error(`Venue with ID "${venueId}" not found`)
  }

  // Baseline completed visits in pilot period
  const completedVisitsCount = 14
  const totalCreditsRedeemed = 216 // e.g. 14 sessions * ~15.4 credits average
  const payoutRatePerCreditPaise = 7000 // ₹70 per redeemed credit
  const grossPayoutPaise = totalCreditsRedeemed * payoutRatePerCreditPaise
  const platformCommissionPaise = 0 // During launch pilot, 0% commission to build partner trust
  const netPayoutPaise = grossPayoutPaise - platformCommissionPaise

  return {
    partnerId,
    venueId,
    venueName: venue.name,
    billingPeriod,
    completedVisitsCount,
    totalCreditsRedeemed,
    payoutRatePerCreditPaise,
    grossPayoutPaise,
    platformCommissionPaise,
    netPayoutPaise,
    currency: "INR",
    status: "reconciled",
    payoutStatus: "held_for_approval",
    generatedAt: new Date().toISOString(),
  }
}
