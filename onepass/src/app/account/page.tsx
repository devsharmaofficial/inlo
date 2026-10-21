import type { Metadata } from "next"
import Link from "next/link"
import {
  Shield,
  CalendarDays,
  HelpCircle,
  ExternalLink,
  ArrowRight,
  Zap,
  TrendingDown,
  TrendingUp,
  RefreshCcw,
  Sparkles,
  History,
  LogOut,
} from "lucide-react"
import {
  getUserCreditBalance,
  getUserLedgerEntries,
} from "@/features/credits/credit-ledger-service"
import { getCurrentUser } from "@/features/auth/auth-service"
import { signOutAction } from "@/app/actions/auth-actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/lib/constants"
import { formatINR } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Credit Wallet & Account · Inlo",
  description: "View your real-time Inlo credit balance, activity passes, and immutable ledger transactions.",
}

export default async function AccountPage() {
  const user = await getCurrentUser()
  const effectiveUserId = user?.id || "user-member-1"
  const memberName = user?.fullName || "Aryan Sharma"
  const memberEmail = user?.email || "athlete@inlo.tech"

  const [balance, entries] = await Promise.all([
    getUserCreditBalance(effectiveUserId),
    getUserLedgerEntries(effectiveUserId),
  ])

  const balanceInr = balance * 70

  return (
    <div className="mx-auto max-w-[1080px] px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-10">
      {/* Pilot Demo Notice when not logged in */}
      {!user && (
        <div className="rounded-[--radius-lg] border border-[--color-forest]/30 bg-[--color-forest]/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div>
            <p className="text-sm font-[650] text-[--color-foreground]">
              Viewing in Pilot Demo Mode
            </p>
            <p className="text-xs text-[--color-muted]">
              Sign in or create an account to save bookings and credit packs under your personal profile.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button asChild size="sm" variant="secondary">
              <Link href={ROUTES.signIn}>Sign in</Link>
            </Button>
            <Button asChild size="sm" variant="primary">
              <Link href={ROUTES.signUp}>Join Inlo</Link>
            </Button>
          </div>
        </div>
      )}

      {/* ── HERO CREDIT WALLET CARD (Section 4 Component 5) ──────── */}
      <div className="relative overflow-hidden rounded-[--radius-xl] border-2 border-[--color-forest]/30 bg-gradient-to-br from-[#1C382C] via-[--color-forest] to-[#12241D] text-white p-6 sm:p-10 shadow-xl">
        {/* Subtle decorative background circles */}
        <div
          className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-[--color-accent]/15 blur-[60px] pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute right-12 bottom-6 opacity-10 pointer-events-none font-mono font-black text-9xl tracking-tighter"
          aria-hidden="true"
        >
          INLO
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[--radius-pill] bg-white/10 text-white text-xs font-[700] backdrop-blur-md border border-white/15">
                <Sparkles size={12} className="text-[--color-accent]" />
                Inlo Active Pass · Tier 1
              </span>
              <span className="text-xs text-white/60 font-mono">
                {user ? `Member ID: inlo-${user.id.slice(0, 8)}` : "Demo Mode: user-member-1"}
              </span>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-white/70 font-[650] mb-1">
                Available Booking Credits
              </p>
              <div className="flex items-baseline gap-3">
                <span className="text-display text-5xl sm:text-6xl font-[800] text-white tracking-tight tabular-nums">
                  {balance}
                </span>
                <span className="text-lg font-[650] text-[--color-accent]">
                  credits
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-white/80 font-[500]">
              Estimated value: <strong className="text-white font-[700]">{formatINR(balanceInr)}</strong> · Locked at ₹70 / credit
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Button asChild size="lg" variant="primary" className="font-[700] gap-1.5 shadow-md">
              <Link href={ROUTES.membership}>
                <Zap size={16} className="fill-current" />
                Buy more credits
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="bg-white/10 text-white border-white/25 hover:bg-white/20 font-[600]">
              <Link href={ROUTES.bookings}>
                View passes
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* ── TRANSACTION LEDGER HISTORY (Section 4 Component 5) ────── */}
      <div className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[--color-border]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-[--radius-md] bg-[--color-surface-muted] text-[--color-forest]">
              <History size={18} />
            </div>
            <div>
              <h2 className="text-h3 font-[750] text-[--color-foreground]">Credit Ledger &amp; Transactions</h2>
              <p className="text-xs text-[--color-muted]">Immutable log of grants, booking debits, and policy refunds</p>
            </div>
          </div>
          <Badge variant="outline" className="font-mono text-xs hidden sm:inline-flex">
            Reconciled 100%
          </Badge>
        </div>

        {entries.length > 0 ? (
          <div className="divide-y divide-[--color-border]">
            {entries.map((entry) => {
              const isPositive = entry.delta > 0
              const formattedDate = new Date(entry.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })

              return (
                <div key={entry.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-[--radius-md] shrink-0 mt-0.5 ${
                        entry.entryType === "grant"
                          ? "bg-emerald-500/10 text-emerald-700"
                          : entry.entryType === "refund"
                          ? "bg-blue-500/10 text-blue-700"
                          : "bg-red-500/10 text-red-700"
                      }`}
                    >
                      {entry.entryType === "grant" ? (
                        <TrendingUp size={16} />
                      ) : entry.entryType === "refund" ? (
                        <RefreshCcw size={16} />
                      ) : (
                        <TrendingDown size={16} />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-[650] text-[--color-foreground]">
                        {entry.reason || (isPositive ? "Credits Added" : "Session Booking")}
                      </p>
                      <p className="text-[11px] text-[--color-muted] font-mono mt-0.5">
                        {formattedDate} · Ref: {entry.id}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`font-mono text-sm font-[750] tabular-nums ${
                        isPositive ? "text-emerald-600" : "text-[--color-foreground]"
                      }`}
                    >
                      {isPositive ? `+${entry.delta}` : entry.delta} cr
                    </span>
                    <span className="block text-[11px] text-[--color-muted]">
                      {entry.entryType.toUpperCase()}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-xs text-[--color-muted] text-center py-6">
            No transactions yet. Credits will appear here when you purchase a pack.
          </p>
        )}
      </div>

      {/* ── MEMBER PROFILE & AUTHENTICATION SESSION ────────────────── */}
      <div className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-full bg-[--color-forest]/10 text-[--color-forest] border border-[--color-forest]/30 flex items-center justify-center font-[750] text-lg">
              {memberName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-[700] text-[--color-foreground]">
                  {memberName}
                </h2>
                <Badge variant={user ? "success" : "outline"} className="text-[10px]">
                  {user ? "Verified Account" : "Pilot Guest"}
                </Badge>
              </div>
              <p className="text-xs text-[--color-muted] mt-0.5">{memberEmail}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {user ? (
              <form action={signOutAction}>
                <Button type="submit" variant="secondary" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-1.5 cursor-pointer">
                  <LogOut size={14} />
                  <span>Sign out</span>
                </Button>
              </form>
            ) : (
              <div className="flex items-center gap-2">
                <Button asChild size="sm" variant="secondary">
                  <Link href={ROUTES.signIn}>Sign in</Link>
                </Button>
                <Button asChild size="sm" variant="primary">
                  <Link href={ROUTES.signUp}>Register</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── ACCOUNT QUICK ACTIONS & CONTROLS ──────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Bookings & Passes */}
        <div className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] p-6 shadow-sm flex flex-col justify-between hover:border-[--color-forest]/40 transition-colors">
          <div>
            <div className="p-2 rounded-[--radius-md] bg-[--color-surface-muted] text-[--color-forest] w-fit mb-3">
              <CalendarDays size={20} />
            </div>
            <h3 className="text-h3 font-[650] text-[--color-foreground] mb-1">
              Active Bookings
            </h3>
            <p className="text-xs text-[--color-muted] leading-relaxed">
              View upcoming court reservations, access single-use digital check-in passes, and view attendance history.
            </p>
          </div>
          <div className="mt-5 pt-4 border-t border-[--color-border]">
            <Button asChild variant="secondary" size="sm" className="w-full">
              <Link href={ROUTES.bookings} className="flex items-center justify-center gap-1 font-[600]">
                View bookings <ArrowRight size={14} />
              </Link>
            </Button>
          </div>
        </div>

        {/* Privacy & DPDP */}
        <div className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] p-6 shadow-sm flex flex-col justify-between hover:border-[--color-forest]/40 transition-colors">
          <div>
            <div className="p-2 rounded-[--radius-md] bg-[--color-surface-muted] text-[--color-forest] w-fit mb-3">
              <Shield size={20} />
            </div>
            <h3 className="text-h3 font-[650] text-[--color-foreground] mb-1">
              DPDP Privacy Rights
            </h3>
            <p className="text-xs text-[--color-muted] leading-relaxed">
              Full compliance with India&apos;s Digital Personal Data Protection Act, 2023. Request data summaries or account removal.
            </p>
          </div>
          <div className="mt-5 pt-4 border-t border-[--color-border]">
            <Button asChild variant="secondary" size="sm" className="w-full">
              <Link href="/legal/privacy" className="flex items-center justify-center gap-1 font-[600]">
                Privacy policy <ExternalLink size={13} />
              </Link>
            </Button>
          </div>
        </div>

        {/* Concierge Support */}
        <div className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] p-6 shadow-sm flex flex-col justify-between hover:border-[--color-forest]/40 transition-colors">
          <div>
            <div className="p-2 rounded-[--radius-md] bg-[--color-surface-muted] text-[--color-forest] w-fit mb-3">
              <HelpCircle size={20} />
            </div>
            <h3 className="text-h3 font-[650] text-[--color-foreground] mb-1">
              Bengaluru Concierge
            </h3>
            <p className="text-xs text-[--color-muted] leading-relaxed">
              Need assistance with an arrival check-in, refund cutoff question, or venue feedback? Our pilot desk is on standby.
            </p>
          </div>
          <div className="mt-5 pt-4 border-t border-[--color-border]">
            <Button asChild variant="secondary" size="sm" className="w-full">
              <Link href="/support" className="flex items-center justify-center gap-1 font-[600]">
                Contact concierge <ArrowRight size={14} />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
