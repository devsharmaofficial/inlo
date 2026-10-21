import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { APP_NAME, ROUTES } from "@/lib/constants"

/**
 * Inlo wordmark — text-based, not an image.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href={ROUTES.home}
      className={cn(
        "inline-flex items-center gap-1 no-underline",
        "focus-visible:outline-2 focus-visible:outline-[--color-focus-ring] focus-visible:rounded-[--radius-sm]",
        className
      )}
      aria-label={`${APP_NAME} — home`}
    >
      {/* Chartreuse accent dot */}
      <span
        aria-hidden="true"
        className="h-2.5 w-2.5 rounded-full bg-[--color-accent] flex-shrink-0"
      />
      <span className="text-[--color-foreground] font-[750] tracking-[-0.04em] text-lg leading-none">
        {APP_NAME}
      </span>
    </Link>
  )
}
