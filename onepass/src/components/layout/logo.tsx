import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { APP_NAME, ROUTES } from "@/lib/constants"

export interface LogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
  variant?: "dark" | "light"
  showWordmark?: boolean
  markOnly?: boolean
  href?: string
}

/**
 * Inlo brand logo — featuring the official brand mark icon.
 * Preserves the authentic Inlo brand badge cleanly with proper sizing and aspect ratio,
 * without duplicate wordmark repetition.
 */
export function Logo({
  className,
  size = "md",
  variant = "dark",
  showWordmark = false,
  markOnly = false,
  href = ROUTES.home,
}: LogoProps) {
  const iconDimensions = {
    sm: 32,
    md: 40,
    lg: 48,
  }[size]

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2.5 shrink-0 no-underline group select-none transition-transform duration-[140ms]",
        "focus-visible:outline-2 focus-visible:outline-[--color-focus-ring] focus-visible:rounded-[--radius-sm]",
        className
      )}
      aria-label={`${APP_NAME} — home`}
    >
      <div className="relative shrink-0 flex items-center justify-center rounded-[--radius-sm] overflow-hidden">
        <Image
          src="/inlo-logo.png"
          alt="Inlo Logo"
          width={iconDimensions}
          height={iconDimensions}
          className="object-contain rounded-md transition-transform duration-[140ms] group-hover:scale-[1.05]"
          priority
        />
      </div>

      {showWordmark && !markOnly && (
        <span
          className={cn(
            "text-[--color-foreground] font-[800] tracking-[-0.04em] leading-none transition-colors",
            size === "sm" && "text-base",
            size === "md" && "text-xl",
            size === "lg" && "text-2xl",
            variant === "light" && "text-white"
          )}
        >
          {APP_NAME}
        </span>
      )}
    </Link>
  )
}
