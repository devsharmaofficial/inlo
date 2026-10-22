"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Search, MapPin, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

const QUICK_ACTIVITIES = [
  { id: "all", label: "All Activities", icon: "⚡" },
  { id: "badminton", label: "Badminton", icon: "🏸" },
  { id: "swimming", label: "Swimming", icon: "🏊" },
  { id: "gym", label: "Gym & Fitness", icon: "🏋️" },
  { id: "yoga", label: "Yoga & Flow", icon: "🧘" },
]

const LOCALITIES = [
  "All Localities",
  "Indiranagar",
  "Domlur",
  "Koramangala",
  "HSR Layout",
]

export function HeroSearch() {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()
  const [selectedActivity, setSelectedActivity] = React.useState("all")
  const [selectedLocality, setSelectedLocality] = React.useState("All Localities")
  const [query, setQuery] = React.useState("")
  const [pendingTarget, setPendingTarget] = React.useState<string | null>(null)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPendingTarget("submit")
    const params = new URLSearchParams()
    if (query.trim()) params.set("query", query.trim())
    if (selectedActivity !== "all") params.set("activity", selectedActivity)
    if (selectedLocality !== "All Localities") params.set("locality", selectedLocality)

    startTransition(() => {
      router.push(`/explore?${params.toString()}`)
    })
  }

  const handlePillClick = (activityId: string) => {
    // 1. Instant 0ms visual selection
    setSelectedActivity(activityId)
    setPendingTarget(activityId)

    // 2. Smoothly transition to the filtered exploration view
    const params = new URLSearchParams()
    if (activityId !== "all") params.set("activity", activityId)
    if (selectedLocality !== "All Localities") params.set("locality", selectedLocality)
    if (query.trim()) params.set("query", query.trim())

    startTransition(() => {
      router.push(`/explore?${params.toString()}`)
    })
  }

  return (
    <div className="w-full max-w-2xl bg-white/95 dark:bg-zinc-900/90 rounded-[--radius-xl] p-3 sm:p-4 border border-[--color-border] shadow-[0_12px_40px_rgba(25,27,24,0.08)] backdrop-blur-[16px]">
      {/* Activity Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2.5 sm:pb-3 no-scrollbar" role="tablist">
        {QUICK_ACTIVITIES.map((act) => {
          const isSelected = selectedActivity === act.id
          const isPillPending = isPending && pendingTarget === act.id

          return (
            <button
              key={act.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => handlePillClick(act.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[--radius-pill] text-xs font-[650] shrink-0 select-none touch-manipulation cursor-pointer transition-all duration-[100ms] active:scale-[0.96] ${
                isSelected
                  ? "bg-[--color-forest] text-white shadow-xs"
                  : "bg-[--color-surface-muted] text-[--color-muted] hover:text-[--color-foreground] hover:bg-[--color-border]"
              }`}
            >
              {isPillPending ? (
                <Loader2 size={12} className="animate-spin text-white" />
              ) : (
                <span>{act.icon}</span>
              )}
              <span>{act.label}</span>
            </button>
          )
        })}
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1 border-t border-[--color-border]/60">
        <div className="flex-1 flex items-center gap-2.5 px-3 py-2 rounded-[--radius-md] bg-[--color-surface-muted]/60 focus-within:bg-white focus-within:ring-2 focus-within:ring-[--color-forest]/30 transition-all">
          <Search size={16} className="text-[--color-muted] shrink-0" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search venue name, sport or facility..."
            aria-label="Search venues"
            className="w-full bg-transparent text-sm text-[--color-foreground] placeholder:text-[--color-muted] outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Locality select */}
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-[--radius-md] bg-[--color-surface-muted]/60 text-xs text-[--color-foreground] shrink-0">
            <MapPin size={14} className="text-[--color-forest] shrink-0" aria-hidden="true" />
            <select
              value={selectedLocality}
              onChange={(e) => setSelectedLocality(e.target.value)}
              aria-label="Select locality"
              className="bg-transparent text-xs font-[600] text-[--color-foreground] outline-none cursor-pointer touch-manipulation"
            >
              {LOCALITIES.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            id="hero-search-submit"
            loading={isPending && pendingTarget === "submit"}
            disabled={isPending}
            className="shrink-0 gap-1.5 font-[700] px-4 active:scale-95 transition-transform"
          >
            <span>Find Slots</span>
            <ArrowRight size={14} aria-hidden="true" />
          </Button>
        </div>
      </form>
    </div>
  )
}
