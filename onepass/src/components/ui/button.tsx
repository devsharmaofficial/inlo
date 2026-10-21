import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Inlo Button component.
 * Follows design.md §7.1 — 5 variants, 4 sizes, complete states.
 * Primary action per screen is visually strongest; do not put two
 * competing primary buttons side by side.
 */
const buttonVariants = cva(
  // Base — shared across all variants
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "font-semibold leading-none tracking-[-0.01em]",
    "cursor-pointer select-none",
    "transition-all duration-[140ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--color-focus-ring]",
    "disabled:cursor-not-allowed disabled:opacity-50",
    // Loading state: preserve dimensions
    "[&[data-loading=true]]:pointer-events-none",
  ],
  {
    variants: {
      variant: {
        /** Primary CTA — chartreuse fill, ink text */
        primary: [
          "bg-[--color-accent] text-[--color-accent-foreground]",
          "hover:bg-[#bae85d] active:bg-[#acd84e]",
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]",
        ],
        /** Secondary — surface with ink border */
        secondary: [
          "bg-[--color-surface] text-[--color-foreground]",
          "border border-[--color-border]",
          "hover:bg-[--color-surface-muted] active:bg-[--color-border]",
        ],
        /** Ghost — no background, low emphasis */
        ghost: [
          "text-[--color-foreground]",
          "hover:bg-[--color-surface-muted] active:bg-[--color-border]",
        ],
        /** Destructive — reserved for irreversible actions */
        destructive: [
          "bg-[--color-danger] text-white",
          "hover:opacity-90 active:opacity-80",
        ],
        /** Forest — deep brand fill for trust contexts */
        forest: [
          "bg-[--color-forest] text-[--color-forest-foreground]",
          "hover:opacity-90 active:opacity-80",
        ],
        /** Link — text-only action */
        link: [
          "text-[--color-forest] underline-offset-4 hover:underline",
          "px-0 h-auto",
        ],
      },
      size: {
        sm: "h-8 px-3 text-xs rounded-[--radius-sm]",
        md: "h-11 px-5 text-sm rounded-[--radius-md]",
        lg: "h-13 px-7 text-base rounded-[--radius-md]",
        icon: "h-11 w-11 rounded-[--radius-md]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Renders as child element (Radix Slot pattern for polymorphic buttons) */
  asChild?: boolean
  /** Shows a loading spinner and prevents duplicate submits */
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || loading}
        data-loading={loading || undefined}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? (
          <>
            <svg
              aria-hidden="true"
              className="h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span>{children}</span>
          </>
        ) : (
          children
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
