"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/lib/constants"

/**
 * Global error boundary — Next.js App Router error.tsx convention.
 * Shows a user-recoverable error with honest messaging.
 * Never exposes stack traces, SQL errors or secrets. (rules.md §8)
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-[calc(100dvh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="text-center max-w-sm">
        <p
          className="text-data text-[--color-muted] mb-3"
          aria-hidden="true"
        >
          Something went wrong
        </p>
        <h1 className="text-h2 text-[--color-foreground] mb-3">
          We hit an unexpected error
        </h1>
        <p className="text-body text-[--color-muted] mb-2">
          We&apos;re looking into it. Your data is safe — if you were in the
          middle of a booking or payment, check your bookings page before retrying.
        </p>
        {/* Error digest for support reference — safe to show, not a stack trace */}
        {error.digest && (
          <p className="text-xs text-[--color-muted] mb-6 font-mono">
            Error ref: {error.digest}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="primary"
            size="md"
            onClick={reset}
            id="error-retry"
          >
            Try again
          </Button>
          <Button asChild variant="secondary" size="md" id="error-home">
            <Link href={ROUTES.home}>Go home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
