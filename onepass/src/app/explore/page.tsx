import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { Search } from "lucide-react"
import {
  getApprovedVenues,
  getActivities,
  getLocalities,
} from "@/features/catalogue/catalogue-repository"
import { VenueCard } from "@/components/catalogue/venue-card"
import { ExploreFilters } from "@/components/catalogue/explore-filters"
import { EmptyState } from "@/components/ui/empty-state"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/lib/constants"

export const metadata: Metadata = {
  title: "Explore activities & venues",
  description:
    "Discover verified gyms, swimming pools, badminton courts, and yoga studios in Bengaluru with Inlo.",
}

interface ExplorePageProps {
  searchParams: Promise<{
    query?: string
    activity?: string
    locality?: string
  }>
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const { query, activity, locality } = await searchParams

  const [venues, activities, localities] = await Promise.all([
    getApprovedVenues({ query, activity, locality }),
    getActivities(),
    getLocalities(),
  ])

  return (
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-h1 text-[--color-foreground] mb-2">Explore</h1>
        <p className="text-body text-[--color-muted] max-w-xl">
          Browse verified partner venues in the Bengaluru pilot cluster. Credit costs
          are guaranteed upfront with no hidden subscription lock-ins.
        </p>
      </div>

      {/* Filter and Search Controls */}
      <Suspense fallback={<div className="h-24 bg-[--color-surface-muted] animate-pulse rounded-[--radius-md] mb-8" />}>
        <ExploreFilters
          activities={activities}
          localities={localities}
          currentActivity={activity}
          currentLocality={locality}
          currentQuery={query}
        />
      </Suspense>

      {/* Venues Grid or Empty State */}
      {venues.length > 0 ? (
        <section aria-label="Available partner venues">
          <div className="mb-4 flex items-center justify-between text-xs text-[--color-muted]">
            <span>
              Showing <strong className="text-[--color-foreground]">{venues.length}</strong> verified {venues.length === 1 ? "venue" : "venues"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {venues.map((venue) => (
              <VenueCard key={venue.id} venue={venue} />
            ))}
          </div>
        </section>
      ) : (
        <EmptyState
          icon={Search}
          title="No venues found"
          description="We couldn't find any participating venues matching your current criteria. Try expanding your search or clearing active filters."
          action={
            <Button asChild variant="primary" size="md">
              <Link href={ROUTES.explore}>Reset all filters</Link>
            </Button>
          }
          className="my-12"
        />
      )}
    </div>
  )
}
