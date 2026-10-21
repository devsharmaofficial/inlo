"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Lock, Mail, ArrowRight, ShieldCheck, UserCheck, Building2, AlertCircle } from "lucide-react"
import { Logo } from "@/components/layout/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ROUTES } from "@/lib/constants"
import { signInAction, quickDemoLoginAction } from "@/app/actions/auth-actions"

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [quickLoading, setQuickLoading] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const res = await signInAction(email, password)
    setLoading(false)

    if (res.success && res.redirectUrl) {
      router.push(res.redirectUrl)
      router.refresh()
    } else {
      setError(res.error || "Unable to sign in. Please verify your details.")
    }
  }

  const handleQuickLogin = async (type: "athlete" | "partner" | "admin") => {
    setError(null)
    setQuickLoading(type)

    const res = await quickDemoLoginAction(type)
    setQuickLoading(null)

    if (res.success && res.redirectUrl) {
      router.push(res.redirectUrl)
      router.refresh()
    } else {
      setError(res.error || "Demo login failed.")
    }
  }

  return (
    <div className="min-h-[calc(100dvh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Centred Logo */}
        <div className="text-center">
          <Logo className="inline-flex" size="lg" />
        </div>

        <div className="rounded-[--radius-xl] border border-[--color-border] bg-[--color-surface] p-7 sm:p-8 shadow-md space-y-6">
          <div>
            <h1 className="text-h2 text-[--color-foreground]">Welcome back</h1>
            <p className="text-body text-[--color-muted] mt-1">
              Sign in to manage bookings, track credits, and reserve courts.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="p-3.5 rounded-[--radius-md] bg-[--color-danger]/10 border border-[--color-danger]/25 text-xs text-[--color-danger] flex items-start gap-2.5"
            >
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="signin-email">Email address</Label>
              <div className="relative">
                <Input
                  id="signin-email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Mail size={16} className="absolute right-3 top-3 text-[--color-muted] pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="signin-password">Password</Label>
              </div>
              <div className="relative">
                <Input
                  id="signin-password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Lock size={16} className="absolute right-3 top-3 text-[--color-muted] pointer-events-none" />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              loading={loading}
              disabled={loading || !!quickLoading}
            >
              Sign in to Inlo
              <ArrowRight size={16} />
            </Button>
          </form>

          {/* Quick 1-Click Evaluation Logins */}
          <div className="pt-5 border-t border-[--color-border] space-y-3">
            <span className="text-xs font-[650] text-[--color-muted] uppercase tracking-wider block text-center">
              Instant 1-Click Demo Login
            </span>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="flex flex-col h-auto py-2.5 px-2 gap-1"
                loading={quickLoading === "athlete"}
                disabled={loading || !!quickLoading}
                onClick={() => handleQuickLogin("athlete")}
              >
                <UserCheck size={16} className="text-[--color-forest]" />
                <span className="font-[600] text-[11px]">Athlete</span>
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="flex flex-col h-auto py-2.5 px-2 gap-1"
                loading={quickLoading === "partner"}
                disabled={loading || !!quickLoading}
                onClick={() => handleQuickLogin("partner")}
              >
                <Building2 size={16} className="text-[--color-forest]" />
                <span className="font-[600] text-[11px]">Partner</span>
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="flex flex-col h-auto py-2.5 px-2 gap-1"
                loading={quickLoading === "admin"}
                disabled={loading || !!quickLoading}
                onClick={() => handleQuickLogin("admin")}
              >
                <ShieldCheck size={16} className="text-[--color-forest]" />
                <span className="font-[600] text-[11px]">Admin</span>
              </Button>
            </div>
          </div>

          <p className="text-center text-body text-[--color-muted] pt-2">
            New to Inlo?{" "}
            <Link
              href={ROUTES.signUp}
              className="text-[--color-forest] font-[600] hover:underline"
            >
              Join now
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-[--color-muted]">
          By continuing, you agree to Inlo&apos;s{" "}
          <Link href="/legal/terms" className="underline hover:text-[--color-foreground]">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/legal/privacy" className="underline hover:text-[--color-foreground]">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
