"use client"

import * as React from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Search, X, MapPin } from "lucide-react"
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

  const [searchTerm, setSearchTerm] = React.useState(currentQuery)
  const [prevQuery, setPrevQuery] = React.useState(currentQuery)

  if (prevQuery !== currentQuery) {
    setPrevQuery(currentQuery)
    setSearchTerm(currentQuery)
  }

  const updateFilters = React.useCallback(
    (updates: { activity?: string; locality?: string; query?: string }) => {
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
      router.push(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false })
    },
    [pathname, router, searchParams]
  )

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilters({ query: searchTerm })
  }

  const hasActiveFilters = Boolean(
    (currentActivity && currentActivity !== "all") ||
      (currentLocality && currentLocality !== "all") ||
      currentQuery
  )

  const clearAllFilters = () => {
    setSearchTerm("")
    router.push(pathname, { scroll: false })
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
          <Button
            type="submit"
            size="sm"
            variant="ghost"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 text-xs font-[600]"
          >
            Search
          </Button>
        </form>

        {/* Locality Dropdown */}
        <div className="relative min-w-[200px]">
          <MapPin
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[--color-muted] pointer-events-none"
            aria-hidden="true"
          />
          <select
            value={currentLocality || "all"}
            onChange={(e) => updateFilters({ locality: e.target.value })}
            className="w-full h-11 pl-9 pr-8 rounded-[--radius-md] border border-[--color-border] bg-[--color-surface] text-sm text-[--color-foreground] font-[500] focus-visible:outline-2 focus-visible:outline-[--color-focus-ring] cursor-pointer"
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
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => updateFilters({ activity: "all" })}
          aria-pressed={!currentActivity || currentActivity === "all"}
          className={cn(
            "px-3.5 py-1.5 rounded-[--radius-pill] text-xs font-[600] transition-all duration-[140ms]",
            "border focus-visible:outline-2 focus-visible:outline-[--color-focus-ring]",
            !currentActivity || currentActivity === "all"
              ? "bg-[--color-foreground] text-[--color-background] border-[--color-foreground]"
              : "bg-[--color-surface] text-[--color-muted] border-[--color-border] hover:bg-[--color-surface-muted] hover:text-[--color-foreground]"
          )}
        >
          All activities
        </button>

        {activities.map((act) => {
          const isSelected = currentActivity === act.slug
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
                "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[--radius-pill] text-xs font-[650] transition-all duration-[140ms]",
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
            className="h-8 gap-1 text-xs text-[--color-danger] hover:bg-[--color-danger]/10"
          >
            <X size={13} aria-hidden="true" />
            Clear filters
          </Button>
        )}
      </div>
    </div>
  )
}
