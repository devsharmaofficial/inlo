import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { APP_NAME, ROUTES } from "@/lib/constants"

interface LogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
  showWordmark?: boolean
  href?: string
}

/**
 * Inlo brand logo — featuring the official brand mark icon and typography.
 */
export function Logo({
  className,
  size = "md",
  showWordmark = true,
  href = ROUTES.home,
}: LogoProps) {
  const iconDimensions = {
    sm: 24,
    md: 32,
    lg: 40,
  }[size]

  const textStyles = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-xl",
  }[size]

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2.5 no-underline group select-none",
        "focus-visible:outline-2 focus-visible:outline-[--color-focus-ring] focus-visible:rounded-[--radius-sm]",
        className
      )}
      aria-label={`${APP_NAME} — home`}
    >
      {/* Official Inlo Brand Icon */}
      <div className="relative shrink-0 flex items-center justify-center rounded-[--radius-sm] overflow-hidden">
        <Image
          src="/inlo-logo.png"
          alt="Inlo Logo"
          width={iconDimensions}
          height={iconDimensions}
          className="object-contain rounded-md transition-transform duration-[140ms] group-hover:scale-105"
          priority
        />
      </div>

      {showWordmark && (
        <span
          className={cn(
            "text-[--color-foreground] font-[800] tracking-[-0.04em] leading-none transition-colors",
            textStyles
          )}
        >
          {APP_NAME}
        </span>
      )}
    </Link>
  )
}

