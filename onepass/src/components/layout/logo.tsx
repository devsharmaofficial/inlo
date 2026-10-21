import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { APP_NAME, ROUTES } from "@/lib/constants"

export interface LogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
  variant?: "dark" | "light"
  markOnly?: boolean
  href?: string
}

/**
 * Inlo brand logo — featuring the official brand mark icon and typography.
 * Uses the authentic high-resolution vector-quality Inlo wordmark with natural 2.04:1 aspect ratio.
 */
export function Logo({
  className,
  size = "md",
  variant = "dark",
  markOnly = false,
  href = ROUTES.home,
}: LogoProps) {
  // Proportions strictly matching official Inlo brand assets (936x460 px = 2.035 : 1 ratio)
  const dimensions = markOnly
    ? {
        sm: { width: 26, height: 26 },
        md: { width: 34, height: 34 },
        lg: { width: 44, height: 44 },
      }[size]
    : {
        sm: { width: 53, height: 26 },
        md: { width: 65, height: 32 },
        lg: { width: 86, height: 42 },
      }[size]

  const logoSrc = markOnly
    ? variant === "light"
      ? "/inlo-brand-mark-light.png"
      : "/inlo-brand-mark.png"
    : variant === "light"
    ? "/inlo-brand-logo-light.png"
    : "/inlo-brand-logo.png"

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center shrink-0 no-underline group select-none transition-transform duration-[140ms]",
        "focus-visible:outline-2 focus-visible:outline-[--color-focus-ring] focus-visible:rounded-[--radius-sm]",
        className
      )}
      aria-label={`${APP_NAME} — home`}
    >
      <div className="relative shrink-0 flex items-center justify-center">
        <Image
          src={logoSrc}
          alt={APP_NAME}
          width={dimensions.width}
          height={dimensions.height}
          className="object-contain transition-transform duration-[140ms] group-hover:scale-[1.04]"
          priority
        />
      </div>
    </Link>
  )
}


