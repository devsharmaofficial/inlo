import type { MembershipProduct } from "@/types/payment"

export const MEMBERSHIP_PRODUCTS: MembershipProduct[] = [
  {
    id: "prod-starter-20",
    slug: "starter-pack-20",
    name: "Starter Pack",
    credits: 20,
    pricePaise: 199900, // ₹1,999
    currency: "INR",
    validityDays: 30,
    isActive: true,
    sortOrder: 1,
    description: "20 flexible credits for casual weekend sessions and trial workouts.",
    featured: false,
  },
  {
    id: "prod-active-50",
    slug: "active-pack-50",
    name: "Active Pack",
    credits: 50,
    pricePaise: 449900, // ₹4,499
    currency: "INR",
    validityDays: 30,
    isActive: true,
    sortOrder: 2,
    description: "50 credits per month. Perfect for a regular 3-day weekly routine across gyms, courts, and pools.",
    featured: true,
  },
  {
    id: "prod-pro-100",
    slug: "pro-pack-100",
    name: "Pro Pack",
    credits: 100,
    pricePaise: 799900, // ₹7,999
    currency: "INR",
    validityDays: 45,
    isActive: true,
    sortOrder: 3,
    description: "100 credits with extended 45-day validity. Designed for multi-sport players and daily training.",
    featured: false,
  },
]

export function getProductBySlug(slug: string): MembershipProduct | null {
  return MEMBERSHIP_PRODUCTS.find((p) => p.slug === slug && p.isActive) || null
}

export function getAllActiveProducts(): MembershipProduct[] {
  return MEMBERSHIP_PRODUCTS.filter((p) => p.isActive).sort(
    (a, b) => a.sortOrder - b.sortOrder
  )
}
