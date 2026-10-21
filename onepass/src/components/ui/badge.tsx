import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Badge — semantic status chips.
 * Never use colour alone to communicate status; always pair with text/icon.
 */
const badgeVariants = cva(
  [
    "inline-flex items-center gap-1.5 px-2.5 py-0.5",
    "rounded-[--radius-pill]",
    "text-xs font-[580] leading-none",
    "select-none whitespace-nowrap",
  ],
  {
    variants: {
      variant: {
        /** Default — neutral */
        default: "bg-[--color-surface-muted] text-[--color-muted]",
        /** Primary — chartreuse for active/selected states */
        accent: "bg-[--color-accent] text-[--color-accent-foreground]",
        /** Success / confirmed */
        success: "bg-[#DCF3E8] text-[--color-success]",
        /** Warning */
        warning: "bg-[#FDEFD9] text-[--color-warning]",
        /** Danger / cancelled */
        danger: "bg-[#FAEAE9] text-[--color-danger]",
        /** Forest — for trust/completion contexts */
        forest: "bg-[--color-forest] text-[--color-forest-foreground]",
        /** Info */
        info: "bg-[#DBE9F5] text-[--color-info]",
        /** Outline — minimal, for tags/filters */
        outline: "border border-[--color-border] text-[--color-muted] bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
)
Badge.displayName = "Badge"

export { Badge, badgeVariants }
