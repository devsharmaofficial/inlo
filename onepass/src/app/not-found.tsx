import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/lib/constants"

/**
 * Global not-found page — Next.js App Router convention.
 * Must have a designed state, not a raw browser 404. (design.md §7.10)
 * Answers: what happened, what can the user do, where can they go next.
 */
export default function NotFound() {
  return (
    <div className="min-h-[calc(100dvh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="text-center max-w-sm">
        <p
          className="text-data text-[--color-muted] mb-3 tabular-nums"
          aria-hidden="true"
        >
          404
        </p>
        <h1 className="text-h2 text-[--color-foreground] mb-3">Page not found</h1>
        <p className="text-body text-[--color-muted] mb-8">
          This page doesn&apos;t exist or has moved. Try exploring
          available activities or go back to the homepage.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="primary" size="md" id="notfound-explore">
            <Link href={ROUTES.explore}>Explore activities</Link>
          </Button>
          <Button asChild variant="secondary" size="md" id="notfound-home">
            <Link href={ROUTES.home}>Go home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

// Satisfy TypeScript — notFound() is used in server components, not here directly
void notFound
