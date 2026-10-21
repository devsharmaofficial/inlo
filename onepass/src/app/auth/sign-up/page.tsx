import type { Metadata } from "next"
import Link from "next/link"
import { Logo } from "@/components/layout/logo"
import { AuthCard } from "@/components/auth/auth-card"

export const metadata: Metadata = {
  title: "Join Inlo · One Membership for Every Court, Gym & Pool",
  description: "Create an account with Google, Email OTP, or Phone verification. Zero subscription trap.",
}

export default function SignUpPage() {
  return (
    <div className="min-h-[calc(100dvh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Centred Brand Mark */}
        <div className="text-center">
          <Logo className="inline-flex" size="lg" />
        </div>

        {/* Multi-Modal Auth Interface */}
        <AuthCard initialView="sign-up" />

        {/* Legal Footer Links */}
        <p className="text-center text-xs text-[--color-muted]">
          By joining, you agree to Inlo&apos;s{" "}
          <Link href="/legal/terms" className="underline hover:text-[--color-foreground]">
            Terms of Service
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
