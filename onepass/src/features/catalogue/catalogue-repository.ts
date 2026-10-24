import type {
  Activity,
  CatalogueFilterParams,
  VenueCardData,
  VenueDetailData,
} from "@/types/catalogue"
import { PILOT_ACTIVITIES, PILOT_VENUES } from "./pilot-seed"

/**
 * Catalogue Data Access Layer.
 * In MVP / Phase 2, queries against verified pilot dataset or Supabase when configured.
 * Guarantees:
 * 1. Only "approved" status venues are returned in public views.
 * 2. Search matches against venue name, description, address, or activity offerings.
 * 3. Exact activity filtering filters by activity slug.
 * 4. Locality filtering matches case-insensitively.
 */
export async function getApprovedVenues(
  filters: CatalogueFilterParams = {}
): Promise<VenueCardData[]> {
  const { query, activity, locality } = filters
  const normalizedQuery = query?.trim().toLowerCase()
  const normalizedLocality = locality?.trim().toLowerCase()
  const normalizedActivity = activity?.trim().toLowerCase()

  const approvedVenues = PILOT_VENUES.filter((venue) => venue.status === "approved")

  const filtered = approvedVenues.filter((venue) => {
    // 1. Locality match
    if (
      normalizedLocality &&
      normalizedLocality !== "all" &&
      venue.locality.toLowerCase() !== normalizedLocality
    ) {
      return false
    }

    // 2. Activity match
    if (
      normalizedActivity &&
      normalizedActivity !== "all" &&
      !venue.offerings.some(
        (off) => off.isActive && off.activitySlug.toLowerCase() === normalizedActivity
      )
    ) {
      return false
    }

    // 3. Text query match
    if (normalizedQuery) {
      const nameMatch = venue.name.toLowerCase().includes(normalizedQuery)
      const descMatch = venue.description.toLowerCase().includes(normalizedQuery)
      const localityMatch = venue.locality.toLowerCase().includes(normalizedQuery)
      const offeringMatch = venue.offerings.some((off) =>
        off.activityName.toLowerCase().includes(normalizedQuery)
      )

      if (!nameMatch && !descMatch && !localityMatch && !offeringMatch) {
        return false
      }
    }

    return true
  })

  // Map to lightweight card projection
  return filtered.map((venue) => ({
    id: venue.id,
    slug: venue.slug,
    name: venue.name,
    locality: venue.locality,
    city: venue.city,
    shortDescription: venue.shortDescription,
    minCredits: venue.minCredits,
    maxCredits: venue.maxCredits,
    tier: venue.tier,
    tierLabel: venue.tierLabel,
    hourlyCredits: venue.hourlyCredits,
    dailyCapCredits: venue.dailyCapCredits,
    accessMode: venue.accessMode || "universal_pass",
    featured: venue.featured,
    amenities: venue.amenities.slice(0, 3), // Top 3 amenities for card display
    activities: venue.offerings.map((off) => ({
      name: off.activityName,
      slug: off.activitySlug,
      creditCost: off.creditCost,
    })),
    primaryImage: venue.images.find((img) => img.isPrimary) || venue.images[0],
  }))
}

export async function getVenueBySlug(slug: string): Promise<VenueDetailData | null> {
  const venue = PILOT_VENUES.find(
    (v) => v.slug === slug && v.status === "approved"
  )
  return venue ?? null
}

export async function getActivities(): Promise<Activity[]> {
  return PILOT_ACTIVITIES.filter((a) => a.isActive).sort(
    (a, b) => a.sortOrder - b.sortOrder
  )
}

export async function getLocalities(): Promise<string[]> {
  const localities = new Set(
    PILOT_VENUES.filter((v) => v.status === "approved").map((v) => v.locality)
  )
  return Array.from(localities).sort()
}
