import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Skeleton — loading placeholder.
 * design.md §7.10: shape should approximate the content that will appear.
 * One quiet treatment; no full-page shimmer for tiny delays.
 */
const Skeleton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-[--radius-sm] bg-[--color-surface-muted]",
      "animate-pulse",
      className
    )}
    aria-hidden="true"
    {...props}
  />
))
Skeleton.displayName = "Skeleton"

export { Skeleton }
