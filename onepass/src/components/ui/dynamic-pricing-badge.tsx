"use client"

import * as React from "react"
import { Zap, Flame, Sparkles, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

export type PricingBadgeType = "discount" | "popular" | "surge" | "off_peak" | "standard"

interface DynamicPricingBadgeProps {
  type: PricingBadgeType
  label?: string
  className?: string
}

export function DynamicPricingBadge({
  type,
  label,
  className,
}: DynamicPricingBadgeProps) {
  const configs = {
    discount: {
      defaultLabel: "Off-Peak Discount",
      icon: Zap,
      className: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-300",
    },
    off_peak: {
      defaultLabel: "Off-Peak Rates",
      icon: Clock,
      className: "bg-teal-500/10 text-teal-700 border-teal-500/30 dark:bg-teal-500/20 dark:text-teal-300",
    },
    popular: {
      defaultLabel: "High Demand",
      icon: Flame,
      className: "bg-amber-500/10 text-amber-700 border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-300",
    },
    surge: {
      defaultLabel: "Prime Slot",
      icon: Sparkles,
      className: "bg-purple-500/10 text-purple-700 border-purple-500/30 dark:bg-purple-500/20 dark:text-purple-300",
    },
    standard: {
      defaultLabel: "Guaranteed Slots",
      icon: Sparkles,
      className: "bg-[--color-surface-muted] text-[--color-muted] border-[--color-border]",
    },
  }[type]

  const Icon = configs.icon
  const displayLabel = label || configs.defaultLabel

  return (
    <span
      role="status"
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[--radius-pill] text-[11px] font-[650] border shadow-xs tracking-tight select-none",
        configs.className,
        className
      )}
    >
      <Icon size={11} className="shrink-0" aria-hidden="true" />
      <span>{displayLabel}</span>
    </span>
  )
}
