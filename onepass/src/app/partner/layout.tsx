import type { Metadata } from "next"
import { LayoutDashboard, MapPin, CalendarDays, FileText, QrCode } from "lucide-react"
import Link from "next/link"
import { ROUTES } from "@/lib/constants"

export const metadata: Metadata = {
  title: "Partner portal",
  description: "Manage your venues, schedules and bookings on Inlo.",
}

const partnerNav = [
  { href: ROUTES.partner.dashboard, label: "Dashboard", icon: LayoutDashboard },
  { href: ROUTES.partner.checkin, label: "Check-in desk", icon: QrCode },
  { href: ROUTES.partner.bookings, label: "Bookings", icon: CalendarDays },
  { href: ROUTES.partner.venues, label: "Venues", icon: MapPin },
  { href: ROUTES.partner.statements, label: "Statements", icon: FileText },
] as const

export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Phase 3+: Server-side role check here — redirect to /auth/sign-in if no session
  // or to / if no partner role.

  return (
    <div className="flex min-h-[calc(100dvh-4rem)]">
      {/* Partner sidebar — desktop */}
      <aside
        className="hidden md:flex flex-col w-56 border-r border-[--color-border] bg-[--color-surface] flex-shrink-0"
        aria-label="Partner navigation"
      >
        <div className="p-4 border-b border-[--color-border]">
          <p className="text-label font-[650] text-[--color-foreground]">Partner portal</p>
          <p className="text-xs text-[--color-muted] mt-0.5">
            {/* Phase 3: partner org name from session */}
            Your organisation
          </p>
        </div>

        <nav className="flex-1 p-2 space-y-0.5">
          {partnerNav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-[--radius-sm] text-sm font-[550] text-[--color-muted] hover:text-[--color-foreground] hover:bg-[--color-surface-muted] transition-colors duration-[140ms] focus-visible:outline-2 focus-visible:outline-[--color-focus-ring]"
            >
              <Icon size={16} strokeWidth={1.8} aria-hidden="true" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Partner main content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  )
}
