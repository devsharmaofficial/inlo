"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Zap,
  Menu,
  X,
  CreditCard,
  CalendarDays,
  User,
  Building2,
  LogOut,
} from "lucide-react"
import { Logo } from "@/components/layout/logo"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ROUTES } from "@/lib/constants"
import { cn } from "@/lib/utils"

interface SiteHeaderProps {
  /** Whether a member session is active. Defaults to true in pilot demo mode */
  isAuthenticated?: boolean
  /** Display name for the authenticated user */
  displayName?: string
  /** Current credit balance */
  creditBalance?: number
}

export function SiteHeader({
  isAuthenticated = true,
  displayName = "Pilot Member",
  creditBalance = 50,
}: SiteHeaderProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [prevPathname, setPrevPathname] = React.useState(pathname)

  // Synchronously sync menu state on path change without cascading effects
  if (prevPathname !== pathname) {
    setPrevPathname(pathname)
    setMobileMenuOpen(false)
  }

  const navLinks = [
    { href: ROUTES.explore, label: "Explore" },
    { href: "/#how-it-works", label: "How it works" },
    { href: ROUTES.membership, label: "Plans & Packs" },
    { href: ROUTES.partner.root, label: "For Venues" },
  ]

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[--color-border] bg-[--color-background]/95 backdrop-blur-[12px] transition-all">
      <div
        className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-8"
        role="banner"
      >
        {/* Left: Brand Logo */}
        <Logo size="md" />

        {/* Centre: Nav links (desktop) */}
        <nav aria-label="Main navigation" className="hidden md:flex items-center gap-1.5">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3.5 py-2 rounded-[--radius-sm] text-sm font-[600] transition-colors duration-[140ms]",
                  isActive
                    ? "text-[--color-forest] bg-[--color-surface-muted]"
                    : "text-[--color-muted] hover:text-[--color-foreground] hover:bg-[--color-surface-muted]"
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Right: Wallet, Profile & Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-2.5">
              {/* Credit Wallet Pill (Section 4 Component 1 & 5) */}
              <Link
                href={ROUTES.membership}
                id="header-credit-wallet-pill"
                aria-label={`Credit wallet: ${creditBalance} credits available`}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[--radius-pill]",
                  "border border-[--color-forest]/30 bg-[--color-forest]/5 hover:bg-[--color-forest]/10",
                  "text-xs font-[700] text-[--color-forest] transition-all duration-[140ms]",
                  "focus-visible:outline-2 focus-visible:outline-[--color-focus-ring]"
                )}
              >
                <Zap size={13} className="fill-[--color-forest] text-[--color-forest]" aria-hidden="true" />
                <span className="tabular-nums">{creditBalance}</span>
                <span className="hidden sm:inline font-[550] text-[--color-muted]">credits</span>
              </Link>

              {/* Bookings shortcut */}
              <Link
                href={ROUTES.bookings}
                className="hidden sm:block px-3 py-2 rounded-[--radius-sm] text-sm font-[600] text-[--color-muted] hover:text-[--color-foreground] hover:bg-[--color-surface-muted] transition-colors"
              >
                Bookings
              </Link>

              {/* User Avatar Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    id="user-profile-menu-trigger"
                    aria-label="Open profile and wallet menu"
                    className="h-9 w-9 rounded-full bg-[--color-surface-muted] border border-[--color-border] flex items-center justify-center text-sm font-[700] text-[--color-foreground] hover:bg-[--color-border] hover:border-[--color-forest]/40 transition-colors focus-visible:outline-2 focus-visible:outline-[--color-focus-ring]"
                  >
                    <span aria-hidden="true">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-1.5">
                  <DropdownMenuLabel className="pb-1">
                    <p className="font-[700] text-[--color-foreground] text-sm leading-tight">
                      {displayName}
                    </p>
                    <p className="text-[11px] font-normal text-[--color-muted] mt-0.5">
                      {creditBalance} credits available (₹{creditBalance * 70})
                    </p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={ROUTES.account} className="flex items-center gap-2 cursor-pointer">
                      <User size={15} />
                      <span>My Account</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={ROUTES.bookings} className="flex items-center gap-2 cursor-pointer">
                      <CalendarDays size={15} />
                      <span>My Bookings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={ROUTES.membership} className="flex items-center gap-2 cursor-pointer">
                      <CreditCard size={15} />
                      <span>Buy Credits / Packs</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={ROUTES.partner.root} className="flex items-center gap-2 cursor-pointer">
                      <Building2 size={15} />
                      <span>Partner Portal</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={ROUTES.signIn} className="flex items-center gap-2 text-red-600 focus:text-red-700 cursor-pointer">
                      <LogOut size={15} />
                      <span>Sign out</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href={ROUTES.signIn}
                className="hidden sm:block px-3 py-2 rounded-[--radius-sm] text-sm font-[600] text-[--color-muted] hover:text-[--color-foreground] hover:bg-[--color-surface-muted] transition-colors"
              >
                Sign in
              </Link>
              <Button asChild size="sm" variant="primary">
                <Link href={ROUTES.signUp}>Join Inlo</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-[--radius-sm] text-[--color-muted] hover:text-[--color-foreground] hover:bg-[--color-surface-muted] transition-colors"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[--color-border] bg-[--color-surface] px-4 py-5 space-y-3 shadow-lg animate-in slide-in-from-top-2">
          {isAuthenticated && (
            <div className="flex items-center justify-between p-3 rounded-[--radius-md] bg-[--color-surface-muted] border border-[--color-border] mb-2">
              <div>
                <p className="text-xs font-[600] text-[--color-muted] uppercase">Wallet Balance</p>
                <p className="text-base font-[750] text-[--color-foreground]">
                  {creditBalance} Credits <span className="text-xs font-normal text-[--color-muted]">(≈ ₹{creditBalance * 70})</span>
                </p>
              </div>
              <Button asChild size="sm" variant="primary">
                <Link href={ROUTES.membership}>Add credits</Link>
              </Button>
            </div>
          )}

          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2.5 rounded-[--radius-sm] text-sm font-[600] text-[--color-foreground] hover:bg-[--color-surface-muted] transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated && (
              <>
                <Link
                  href={ROUTES.bookings}
                  className="px-3 py-2.5 rounded-[--radius-sm] text-sm font-[600] text-[--color-foreground] hover:bg-[--color-surface-muted] transition-colors"
                >
                  My Bookings
                </Link>
                <Link
                  href={ROUTES.account}
                  className="px-3 py-2.5 rounded-[--radius-sm] text-sm font-[600] text-[--color-foreground] hover:bg-[--color-surface-muted] transition-colors"
                >
                  My Account & Settings
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
