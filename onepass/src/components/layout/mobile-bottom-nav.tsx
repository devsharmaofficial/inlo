"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Compass, CalendarDays, CreditCard, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { ROUTES } from "@/lib/constants"

/**
 * Mobile bottom navigation — member-facing.
 * design.md §9: 4 top-level destinations; rarely-used ones go into Account.
 * Primary booking action must remain reachable.
 * Accessible labels, current state visible.
 */
const memberNavItems = [
  {
    href: ROUTES.explore,
    label: "Explore",
    icon: Compass,
  },
  {
    href: ROUTES.bookings,
    label: "Bookings",
    icon: CalendarDays,
  },
  {
    href: ROUTES.membership,
    label: "Membership",
    icon: CreditCard,
  },
  {
    href: ROUTES.account,
    label: "Account",
    icon: User,
  },
] as const

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Mobile navigation"
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40",
        "md:hidden", // Desktop uses the header nav
        "border-t border-[--color-border] bg-[#F7F7F2]/95 backdrop-blur-[12px]",
        // Safe area for devices with home indicator
        "pb-[env(safe-area-inset-bottom)]",
      )}
      style={{ backgroundColor: "rgba(247, 247, 242, 0.96)" }}
    >
      <div className="grid grid-cols-4 h-16">
        {memberNavItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`)
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex flex-col items-center justify-center gap-1",
                "text-xs font-[580]",
                "transition-colors duration-[140ms]",
                "focus-visible:outline-2 focus-visible:outline-[--color-focus-ring] focus-visible:rounded-[--radius-sm]",
                isActive
                  ? "text-[--color-foreground]"
                  : "text-[--color-muted] hover:text-[--color-foreground]"
              )}
            >
              <span className="relative">
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.2 : 1.8}
                  aria-hidden="true"
                />
                {/* Active indicator dot */}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-[--color-accent]"
                  />
                )}
              </span>
              <span className="leading-none">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
