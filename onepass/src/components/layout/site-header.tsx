import * as React from "react"
import Link from "next/link"
import { Logo } from "@/components/layout/logo"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/lib/constants"

/**
 * Site header — member-facing.
 * Restrained: logo + key nav links + auth actions only.
 * No multiple sticky bars. Contextual actions change when authenticated.
 * design.md §9 Desktop: header/nav remains restrained.
 *
 * Auth state passed as props — resolved server-side.
 */
interface SiteHeaderProps {
  /** Whether a member session is active. Resolved on the server. */
  isAuthenticated?: boolean
  /** Display name for the authenticated user */
  displayName?: string
}

export function SiteHeader({ isAuthenticated = false }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[--color-border] bg-[--color-background]/95 backdrop-blur-[8px]">
      <div
        className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-8"
        role="banner"
      >
        {/* Left: Logo */}
        <Logo />

        {/* Centre: Nav links (desktop only) */}
        <nav aria-label="Main navigation" className="hidden md:flex items-center gap-1">
          <Link
            href={ROUTES.explore}
            className="px-3 py-2 rounded-[--radius-sm] text-sm font-[550] text-[--color-muted] hover:text-[--color-foreground] hover:bg-[--color-surface-muted] transition-colors duration-[140ms] focus-visible:outline-2 focus-visible:outline-[--color-focus-ring]"
          >
            Explore
          </Link>
          <Link
            href="/#how-it-works"
            className="px-3 py-2 rounded-[--radius-sm] text-sm font-[550] text-[--color-muted] hover:text-[--color-foreground] hover:bg-[--color-surface-muted] transition-colors duration-[140ms] focus-visible:outline-2 focus-visible:outline-[--color-focus-ring]"
          >
            How it works
          </Link>
        </nav>

        {/* Right: Auth actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link
                href={ROUTES.bookings}
                className="hidden sm:block px-3 py-2 rounded-[--radius-sm] text-sm font-[550] text-[--color-muted] hover:text-[--color-foreground] hover:bg-[--color-surface-muted] transition-colors duration-[140ms] focus-visible:outline-2 focus-visible:outline-[--color-focus-ring]"
              >
                Bookings
              </Link>
              <Link
                href={ROUTES.account}
                className="h-9 w-9 rounded-full bg-[--color-surface-muted] border border-[--color-border] flex items-center justify-center text-sm font-[600] text-[--color-foreground] hover:bg-[--color-border] transition-colors duration-[140ms] focus-visible:outline-2 focus-visible:outline-[--color-focus-ring]"
                aria-label="Account"
              >
                {/* Avatar placeholder — replaced with real initial/image once auth is wired */}
                <span aria-hidden="true">A</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                href={ROUTES.signIn}
                className="hidden sm:block px-3 py-2 rounded-[--radius-sm] text-sm font-[550] text-[--color-muted] hover:text-[--color-foreground] hover:bg-[--color-surface-muted] transition-colors duration-[140ms] focus-visible:outline-2 focus-visible:outline-[--color-focus-ring]"
              >
                Sign in
              </Link>
              <Button asChild size="sm" variant="primary">
                <Link href={ROUTES.signUp}>Join OnePass</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
