import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Input component — design.md §7.2.
 * Always pair with a <Label>. Placeholder is NOT a label.
 * Validation errors are inline, specific, connected to the field.
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Error state — shows danger ring */
  error?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "flex h-11 w-full rounded-[10px] border border-[--color-border]",
          "bg-[--color-surface] px-3 py-2",
          "text-sm text-[--color-foreground] placeholder:text-[--color-muted]",
          "transition-colors duration-[140ms]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-focus-ring] focus-visible:ring-offset-1",
          "disabled:cursor-not-allowed disabled:bg-[--color-surface-muted] disabled:opacity-60",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          error && "border-[--color-danger] focus-visible:ring-[--color-danger]",
          className
        )}
        aria-invalid={error || undefined}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
