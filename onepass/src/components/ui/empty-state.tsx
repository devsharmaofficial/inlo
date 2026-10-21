import * as React from "react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Main heading explaining the situation directly and plainly */
  title: string
  /** Concrete explanation and helpful guidance — never a dead end */
  description?: string
  /** Restrained iconography */
  icon?: LucideIcon
  /** Primary next action (e.g. "Clear filters", "Browse all activities") */
  action?: React.ReactNode
  /** Secondary action if relevant */
  secondaryAction?: React.ReactNode
}

/**
 * EmptyState — design.md §7.10.
 *
 * Rules:
 * 1. Plain language: clear, helpful, specific.
 * 2. Never a dead end: always provide an actionable recovery path.
 * 3. Restrained appearance: no cartoon illustrations or generic blobs.
 */
export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ title, description, icon: Icon, action, secondaryAction, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="status"
        aria-live="polite"
        className={cn(
          "flex flex-col items-center justify-center text-center",
          "rounded-[--radius-lg] border border-dashed border-[--color-border] bg-[--color-surface]",
          "px-6 py-12 sm:py-16 max-w-lg mx-auto",
          className
        )}
        {...props}
      >
        {Icon && (
          <div
            aria-hidden="true"
            className="mb-4 flex h-12 w-12 items-center justify-center rounded-[--radius-md] bg-[--color-surface-muted] text-[--color-muted]"
          >
            <Icon size={24} strokeWidth={1.8} />
          </div>
        )}
        <h3 className="text-h3 text-[--color-foreground] mb-2">{title}</h3>
        {description && (
          <p className="text-body text-[--color-muted] max-w-sm mb-6 leading-relaxed">
            {description}
          </p>
        )}
        {(action || secondaryAction) && (
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {action}
            {secondaryAction}
          </div>
        )}
      </div>
    )
  }
)
EmptyState.displayName = "EmptyState"
