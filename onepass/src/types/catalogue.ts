/**
 * Catalogue Domain Types.
 * Source of truth: architecture.md §4 and 001_catalogue.sql.
 */

export interface Activity {
  id: string
  slug: string
  name: string
  description?: string
  icon: string
  isActive: boolean
  sortOrder: number
}

export interface VenueImage {
  id: string
  venueId: string
  url: string
  altText: string
  isPrimary: boolean
  displayOrder: number
}

export interface VenueActivityOffering {
  id: string
  venueId: string
  activityId: string
  activityName: string
  activitySlug: string
  creditCost: number
  durationMinutes: number
  description?: string
  isActive: boolean
}

export interface OpeningHourEntry {
  open: string // e.g. "06:00"
  close: string // e.g. "22:00"
  closed?: boolean
}

export type DayOfWeek = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"

export type OpeningHours = Record<DayOfWeek, OpeningHourEntry>

export type VenueStatus = "draft" | "pending_approval" | "approved" | "suspended"

export interface Venue {
  id: string
  partnerId: string
  slug: string
  name: string
  description: string
  shortDescription?: string
  addressLine1: string
  addressLine2?: string
  locality: string
  city: string
  postalCode: string
  latitude?: number
  longitude?: number
  status: VenueStatus
  featured: boolean
  amenities: string[]
  rules: string[]
  openingHours: OpeningHours
  phone?: string
  email?: string
  createdAt: string
  updatedAt: string
}

export type VenueTier = "tier_standard" | "tier_premium" | "tier_elite"

export interface VenueCardData {
  id: string
  slug: string
  name: string
  locality: string
  city: string
  shortDescription?: string
  minCredits: number
  maxCredits: number
  tier?: VenueTier
  tierLabel?: string
  hourlyCredits?: number
  dailyCapCredits?: number
  accessMode?: "universal_pass" | "advance_reservation" | "hybrid"
  activities: {
    name: string
    slug: string
    creditCost: number
  }[]
  primaryImage?: {
    url: string
    altText: string
  }
  featured: boolean
  amenities: string[]
}

export interface VenueDetailData extends Venue {
  offerings: VenueActivityOffering[]
  images: VenueImage[]
  minCredits: number
  maxCredits: number
  tier?: VenueTier
  tierLabel?: string
  hourlyCredits?: number
  dailyCapCredits?: number
  accessMode?: "universal_pass" | "advance_reservation" | "hybrid"
}

export interface CatalogueFilterParams {
  query?: string
  activity?: string
  locality?: string
}
