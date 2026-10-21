import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/layout/logo"
import { ROUTES } from "@/lib/constants"

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your OnePass account.",
}

/**
 * Sign-in page — Phase 3.
 * Phase 1 shell — form built out when auth provider is configured.
 *
 * Auth provider: Supabase Auth (candidate) or comparable managed auth.
 * OTP/phone delivery must be tested for India compliance before live launch.
 * Do NOT implement custom password hashing or auth infrastructure.
 */
export default function SignInPage() {
  return (
    <div className="min-h-[calc(100dvh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo centred for auth pages */}
        <div className="text-center mb-8">
          <Logo className="inline-flex" />
        </div>

        <div className="rounded-[--radius-xl] border border-[--color-border] bg-[--color-surface] p-7 shadow-[--shadow-md]">
          <h1 className="text-h3 text-[--color-foreground] mb-1">Sign in</h1>
          <p className="text-body text-[--color-muted] mb-6">
            Enter your email or phone to continue.
          </p>

          {/* Phase 3: wire to managed auth provider (Supabase/equivalent) */}
          <form className="space-y-4" aria-label="Sign in form" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="signin-email">Email address</Label>
              <Input
                id="signin-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                disabled
                aria-describedby="signin-email-hint"
              />
              <p id="signin-email-hint" className="text-xs text-[--color-muted]">
                Or use your registered phone number.
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled
              id="signin-submit"
            >
              Continue
            </Button>
          </form>

          <p className="mt-5 text-center text-body text-[--color-muted]">
            New to OnePass?{" "}
            <Link
              href={ROUTES.signUp}
              className="text-[--color-forest] font-[580] hover:underline focus-visible:outline-2 focus-visible:outline-[--color-focus-ring] focus-visible:rounded-sm"
            >
              Join now
            </Link>
          </p>
        </div>

        <p className="mt-5 text-center text-xs text-[--color-muted]">
          By continuing, you agree to our{" "}
          <Link href="/legal/terms" className="underline hover:text-[--color-foreground]">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/legal/privacy" className="underline hover:text-[--color-foreground]">
            Privacy policy
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
