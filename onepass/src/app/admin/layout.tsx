import type { Metadata } from "next"
import Link from "next/link"
import { MapPin, BookOpen, CreditCard, Users, FileSearch, ScrollText, TrendingUp, Sliders } from "lucide-react"
import { ROUTES } from "@/lib/constants"

export const metadata: Metadata = {
  title: "Admin — Operations",
  description: "OnePass operations and administration portal.",
}

/**
 * Admin layout — design.md §8.I / §9 Partner/admin.
 *
 * ACCESS CONTROL (enforced in Phase 3 / Phase 7):
 * - Server session must verify ops_admin or platform_admin role
 * - Admin privileges NEVER derived from user-editable profile fields (rules.md §4)
 * - Every admin action generates an audit record
 * - Separate navigation from member-facing shell — distinct role-specific shell
 *
 * Design: operational, not marketing-like. Strong filters, status badges,
 * reliable tables, confirm dialogs for sensitive changes. (design.md §8.I)
 */
const adminNav = [
  { href: ROUTES.admin.pilot, label: "Pilot metrics", icon: TrendingUp },
  { href: ROUTES.admin.venues, label: "Venues", icon: MapPin },
  { href: ROUTES.admin.bookings, label: "Bookings", icon: BookOpen },
  { href: ROUTES.admin.payments, label: "Payments", icon: CreditCard },
  { href: ROUTES.admin.ledger, label: "Credit ledger", icon: FileSearch },
  { href: ROUTES.admin.partners, label: "Partners", icon: Users },
  { href: ROUTES.admin.audit, label: "Audit log", icon: ScrollText },
  { href: ROUTES.admin.controls, label: "System controls", icon: Sliders },
] as const

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Phase 3+: Server-side role check — redirect if no ops_admin/platform_admin role.

  return (
    <div className="flex min-h-[calc(100dvh-4rem)]">
      {/* Admin sidebar */}
      <aside
        className="hidden md:flex flex-col w-56 border-r border-[--color-border] bg-[--color-forest] flex-shrink-0"
        aria-label="Admin navigation"
      >
        <div className="p-4 border-b border-white/10">
          <p className="text-label font-[650] text-[--color-forest-foreground]">Operations</p>
          <p className="text-xs text-white/50 mt-0.5">Internal use only</p>
        </div>

        <nav className="flex-1 p-2 space-y-0.5">
          {adminNav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-[--radius-sm] text-sm font-[550] text-white/70 hover:text-white hover:bg-white/10 transition-colors duration-[140ms] focus-visible:outline-2 focus-visible:outline-white"
            >
              <Icon size={16} strokeWidth={1.8} aria-hidden="true" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10">
          <p className="text-xs text-white/40 leading-relaxed">
            All admin actions are audited. Use carefully.
          </p>
        </div>
      </aside>

      {/* Admin main content */}
      <div className="flex-1 overflow-auto bg-[--color-background]">
        {children}
      </div>
    </div>
  )
}
