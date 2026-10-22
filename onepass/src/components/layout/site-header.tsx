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
import { createClient } from "@/lib/supabase/client"
import { signOutAction } from "@/app/actions/auth-actions"
import { getMemberCreditBalanceAction } from "@/app/actions/booking-actions"

interface SiteHeaderProps {
  /** Initial prop fallback for authentication state */
  isAuthenticated?: boolean
  /** Initial prop fallback for display name */
  displayName?: string
  /** Initial prop fallback for credit balance */
  creditBalance?: number
}

export function SiteHeader({
  isAuthenticated: initialAuth = false,
  displayName: initialName = "",
  creditBalance: initialBalance = 0,
}: SiteHeaderProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [prevPathname, setPrevPathname] = React.useState(pathname)

  // Synchronously sync menu state on path change
  if (prevPathname !== pathname) {
    setPrevPathname(pathname)
    setMobileMenuOpen(false)
  }

  const [authState, setAuthState] = React.useState({
    isAuthenticated: initialAuth,
    displayName: initialName,
    creditBalance: initialBalance,
  })

  // Synchronize active Supabase user session and live credit balance
  React.useEffect(() => {
    let isMounted = true
    const supabase = createClient()
    if (!supabase) return

    const syncSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!isMounted) return

        if (session?.user) {
          const user = session.user
          const name =
            (user.user_metadata?.full_name as string) ||
            (user.user_metadata?.name as string) ||
            user.email?.split("@")[0] ||
            "Member"

          setAuthState((prev) => ({
            ...prev,
            isAuthenticated: true,
            displayName: name,
          }))

          // Fetch credit balance in background
          getMemberCreditBalanceAction().then((balance) => {
            if (isMounted) {
              setAuthState((prev) => ({ ...prev, creditBalance: balance }))
            }
          })
        } else {
          setAuthState({
            isAuthenticated: false,
            displayName: "",
            creditBalance: 0,
          })
        }
      } catch {
        // Fallback silently if network or offline
      }
    }

    syncSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return
      if (session?.user) {
        const name =
          (session.user.user_metadata?.full_name as string) ||
          (session.user.user_metadata?.name as string) ||
          session.user.email?.split("@")[0] ||
          "Member"

        setAuthState((prev) => ({
          ...prev,
          isAuthenticated: true,
          displayName: name,
        }))

        getMemberCreditBalanceAction().then((balance) => {
          if (isMounted) {
            setAuthState((prev) => ({ ...prev, creditBalance: balance }))
          }
        })
      } else {
        setAuthState({
          isAuthenticated: false,
          displayName: "",
          creditBalance: 0,
        })
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    await signOutAction()
  }

  const navLinks = [
    { href: ROUTES.explore, label: "Explore" },
    { href: "/#how-it-works", label: "How it works" },
    { href: ROUTES.membership, label: "Plans & Packs" },
    { href: ROUTES.partner.root, label: "For Venues" },
  ]

  const { isAuthenticated, displayName, creditBalance } = authState

  return (
    <header
      className="sticky top-0 z-40 w-full border-b border-[--color-border] bg-[#F7F7F2]/95 backdrop-blur-[16px] shadow-[0_1px_3px_0_rgba(25,27,24,0.04)] transition-all"
      style={{ backgroundColor: "rgba(247, 247, 242, 0.96)" }}
    >
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
                  "px-3.5 py-2 rounded-[--radius-sm] text-sm transition-colors duration-[140ms]",
                  isActive
                    ? "text-[--color-forest] bg-[--color-forest]/10 font-[700]"
                    : "text-[#2B3028] hover:text-[--color-foreground] hover:bg-[--color-surface-muted] font-[600]"
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
              {/* Credit Wallet Pill */}
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
                className="hidden sm:block px-3 py-2 rounded-[--radius-sm] text-sm font-[650] text-[#2B3028] hover:text-[--color-foreground] hover:bg-[--color-surface-muted] transition-colors"
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
                    className="h-9 w-9 rounded-full bg-[--color-surface-muted] border border-[--color-border] flex items-center justify-center text-sm font-[700] text-[--color-foreground] hover:bg-[--color-border] hover:border-[--color-forest]/40 transition-colors focus-visible:outline-2 focus-visible:outline-[--color-focus-ring] cursor-pointer"
                  >
                    <span aria-hidden="true">
                      {displayName.charAt(0).toUpperCase() || "M"}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-1.5">
                  <DropdownMenuLabel className="pb-1">
                    <p className="font-[700] text-[--color-foreground] text-sm leading-tight">
                      {displayName}
                    </p>
                    <p className="text-[11px] font-normal text-[--color-muted] mt-0.5">
                      {creditBalance} credits available (≈ ₹{creditBalance * 70})
                    </p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={ROUTES.account} className="flex items-center gap-2 cursor-pointer">
                      <User size={15} />
                      <span>Wallet & Account</span>
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
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="flex items-center gap-2 text-red-600 focus:text-red-700 cursor-pointer"
                  >
                    <LogOut size={15} />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href={ROUTES.signIn}
                className="hidden sm:block px-3.5 py-2 rounded-[--radius-sm] text-sm font-[650] text-[#2B3028] hover:text-[--color-foreground] hover:bg-[--color-surface-muted] transition-colors"
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
            className="md:hidden p-2 rounded-[--radius-sm] text-[#2B3028] hover:text-[--color-foreground] hover:bg-[--color-surface-muted] transition-colors cursor-pointer"
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
          {isAuthenticated ? (
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
          ) : (
            <div className="grid grid-cols-2 gap-2 mb-2">
              <Button asChild variant="secondary" size="sm">
                <Link href={ROUTES.signIn}>Sign in</Link>
              </Button>
              <Button asChild variant="primary" size="sm">
                <Link href={ROUTES.signUp}>Join Inlo</Link>
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
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full text-left px-3 py-2.5 rounded-[--radius-sm] text-sm font-[600] text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                >
                  <LogOut size={15} />
                  <span>Sign out</span>
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
