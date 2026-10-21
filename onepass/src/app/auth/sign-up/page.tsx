"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { User, Mail, Lock, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react"
import { Logo } from "@/components/layout/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ROUTES } from "@/lib/constants"
import { signUpAction } from "@/app/actions/auth-actions"

export default function SignUpPage() {
  const router = useRouter()
  const [fullName, setFullName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.")
      return
    }

    setLoading(true)
    const res = await signUpAction(fullName, email, password)
    setLoading(false)

    if (res.success && res.redirectUrl) {
      router.push(res.redirectUrl)
      router.refresh()
    } else {
      setError(res.error || "Account creation failed. Please verify your details.")
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
            <h1 className="text-h2 text-[--color-foreground]">Create your account</h1>
            <p className="text-body text-[--color-muted] mt-1">
              One membership pass for badminton, swimming, gyms & studios across Bengaluru.
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
              <Label htmlFor="signup-name">Full name</Label>
              <div className="relative">
                <Input
                  id="signup-name"
                  type="text"
                  autoComplete="name"
                  placeholder="e.g. Aryan Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
                <User size={16} className="absolute right-3 top-3 text-[--color-muted] pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="signup-email">Email address</Label>
              <div className="relative">
                <Input
                  id="signup-email"
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
              <Label htmlFor="signup-password">Create password</Label>
              <div className="relative">
                <Input
                  id="signup-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Lock size={16} className="absolute right-3 top-3 text-[--color-muted] pointer-events-none" />
              </div>
              <p className="text-[11px] text-[--color-muted]">Minimum 6 characters.</p>
            </div>

            <div className="rounded-[--radius-md] bg-[--color-surface-muted] p-3 text-xs text-[--color-muted] flex items-start gap-2 border border-[--color-border]">
              <CheckCircle2 size={15} className="text-[--color-forest] shrink-0 mt-0.5" />
              <span>
                Zero subscription traps. Buy credits only when you want to play.
              </span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              loading={loading}
              disabled={loading}
            >
              Join Inlo & continue
              <ArrowRight size={16} />
            </Button>
          </form>

          <p className="text-center text-body text-[--color-muted] pt-2">
            Already have an account?{" "}
            <Link
              href={ROUTES.signIn}
              className="text-[--color-forest] font-[600] hover:underline"
            >
              Sign in
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
