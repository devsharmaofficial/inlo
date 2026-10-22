"use client"

import * as React from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Search, X, MapPin, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { Activity } from "@/types/catalogue"
import { cn } from "@/lib/utils"

interface ExploreFiltersProps {
  activities: Activity[]
  localities: string[]
  currentActivity?: string
  currentLocality?: string
  currentQuery?: string
}

export function ExploreFilters({
  activities,
  localities,
  currentActivity,
  currentLocality,
  currentQuery = "",
}: ExploreFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [isPending, startTransition] = React.useTransition()

  // Optimistic UI states: update instantly (0ms) on click frame
  const [prevActivity, setPrevActivity] = React.useState(currentActivity)
  const [selectedActivity, setSelectedActivity] = React.useState(currentActivity || "all")
  if (currentActivity !== prevActivity) {
    setPrevActivity(currentActivity)
    setSelectedActivity(currentActivity || "all")
  }

  const [prevLocality, setPrevLocality] = React.useState(currentLocality)
  const [selectedLocality, setSelectedLocality] = React.useState(currentLocality || "all")
  if (currentLocality !== prevLocality) {
    setPrevLocality(currentLocality)
    setSelectedLocality(currentLocality || "all")
  }

  const [prevQuery, setPrevQuery] = React.useState(currentQuery)
  const [searchTerm, setSearchTerm] = React.useState(currentQuery)
  if (currentQuery !== prevQuery) {
    setPrevQuery(currentQuery)
    setSearchTerm(currentQuery)
  }

  const updateFilters = React.useCallback(
    (updates: { activity?: string; locality?: string; query?: string }) => {
      // 1. Optimistic instant visual response (0ms)
      if (updates.activity !== undefined) {
        setSelectedActivity(updates.activity)
      }
      if (updates.locality !== undefined) {
        setSelectedLocality(updates.locality)
      }
      if (updates.query !== undefined) {
        setSearchTerm(updates.query)
      }

      // 2. Compute searchParams
      const params = new URLSearchParams(searchParams?.toString() || "")

      if (updates.activity !== undefined) {
        if (!updates.activity || updates.activity === "all") {
          params.delete("activity")
        } else {
          params.set("activity", updates.activity)
        }
      }

      if (updates.locality !== undefined) {
        if (!updates.locality || updates.locality === "all") {
          params.delete("locality")
        } else {
          params.set("locality", updates.locality)
        }
      }

      if (updates.query !== undefined) {
        if (!updates.query.trim()) {
          params.delete("query")
        } else {
          params.set("query", updates.query.trim())
        }
      }

      const queryString = params.toString()
      const nextUrl = queryString ? `${pathname}?${queryString}` : pathname

      // 3. React transition ensures UI stays buttery smooth and responsive
      startTransition(() => {
        router.push(nextUrl, { scroll: false })
      })
    },
    [pathname, router, searchParams]
  )

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilters({ query: searchTerm })
  }

  const hasActiveFilters = Boolean(
    (selectedActivity && selectedActivity !== "all") ||
      (selectedLocality && selectedLocality !== "all") ||
      searchTerm
  )

  const clearAllFilters = () => {
    setSelectedActivity("all")
    setSelectedLocality("all")
    setSearchTerm("")
    startTransition(() => {
      router.push(pathname, { scroll: false })
    })
  }

  return (
    <div className="space-y-4 mb-8">
      {/* Search Bar & Locality Selector */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1" role="search">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[--color-muted]"
            aria-hidden="true"
          />
          <Input
            id="explore-search"
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search venue names, activities, or amenities..."
            className="pl-9 pr-20 h-11 bg-[--color-surface]"
            aria-label="Search venues"
          />
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {searchTerm && (
              <button
                type="button"
                onClick={() => updateFilters({ query: "" })}
                className="p-1 rounded-full text-[--color-muted] hover:text-[--color-foreground] hover:bg-[--color-surface-muted] cursor-pointer"
                aria-label="Clear search text"
              >
                <X size={14} />
              </button>
            )}
            <Button
              type="submit"
              size="sm"
              variant="ghost"
              className="h-8 text-xs font-[600] cursor-pointer active:scale-95 transition-transform"
            >
              Search
            </Button>
          </div>
        </form>

        {/* Locality Dropdown */}
        <div className="relative min-w-[200px]">
          <MapPin
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[--color-muted] pointer-events-none"
            aria-hidden="true"
          />
          <select
            value={selectedLocality || "all"}
            onChange={(e) => updateFilters({ locality: e.target.value })}
            className="w-full h-11 pl-9 pr-8 rounded-[--radius-md] border border-[--color-border] bg-[--color-surface] text-sm text-[--color-foreground] font-[500] focus-visible:outline-2 focus-visible:outline-[--color-focus-ring] cursor-pointer touch-manipulation transition-colors"
            aria-label="Filter by neighbourhood"
          >
            <option value="all">All neighbourhoods</option>
            {localities.map((loc) => (
              <option key={loc} value={loc.toLowerCase()}>
                {loc}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Activity Filter Chips */}
      <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Activity filters">
        <button
          type="button"
          onClick={() => updateFilters({ activity: "all" })}
          aria-pressed={!selectedActivity || selectedActivity === "all"}
          className={cn(
            "px-3.5 py-1.5 rounded-[--radius-pill] text-xs font-[600] cursor-pointer select-none touch-manipulation",
            "transition-all duration-[100ms] ease-out active:scale-[0.96]",
            "border focus-visible:outline-2 focus-visible:outline-[--color-focus-ring]",
            !selectedActivity || selectedActivity === "all"
              ? "bg-[--color-foreground] text-[--color-background] border-[--color-foreground] shadow-xs"
              : "bg-[--color-surface] text-[--color-muted] border-[--color-border] hover:bg-[--color-surface-muted] hover:text-[--color-foreground]"
          )}
        >
          All activities
        </button>

        {activities.map((act) => {
          const isSelected = selectedActivity === act.slug
          const actIcons: Record<string, string> = {
            badminton: "🏸",
            swimming: "🏊",
            gym: "🏋️",
            yoga: "🧘",
          }
          const icon = actIcons[act.slug] || "⚡"

          return (
            <button
              key={act.id}
              type="button"
              onClick={() => updateFilters({ activity: isSelected ? "all" : act.slug })}
              aria-pressed={isSelected}
              className={cn(
                "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[--radius-pill] text-xs font-[650] cursor-pointer select-none touch-manipulation",
                "transition-all duration-[100ms] ease-out active:scale-[0.96]",
                "border focus-visible:outline-2 focus-visible:outline-[--color-focus-ring]",
                isSelected
                  ? "bg-[--color-forest] text-white border-[--color-forest] shadow-xs"
                  : "bg-[--color-surface] text-[--color-muted] border-[--color-border] hover:bg-[--color-surface-muted] hover:text-[--color-foreground]"
              )}
            >
              <span>{icon}</span>
              <span>{act.name}</span>
            </button>
          )
        })}

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-8 gap-1 text-xs text-[--color-danger] hover:bg-[--color-danger]/10 active:scale-95 transition-transform"
          >
            <X size={13} aria-hidden="true" />
            Clear filters
          </Button>
        )}

        {/* Loading Spinner for pending filter transitions */}
        {isPending && (
          <div className="inline-flex items-center gap-1.5 text-xs text-[--color-forest] font-[600] animate-in fade-in duration-100 pl-1">
            <Loader2 size={13} className="animate-spin text-[--color-forest]" />
            <span className="text-[11px]">Updating…</span>
          </div>
        )}
      </div>
    </div>
  )
}
