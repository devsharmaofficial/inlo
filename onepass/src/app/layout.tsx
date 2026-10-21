import type { Metadata, Viewport } from "next"
import { Manrope, Geist_Mono } from "next/font/google"
import { Suspense } from "react"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav"
import { OperationalBanner } from "@/components/layout/operational-banner"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

/**
 * Fonts — design.md §3.
 * Manrope for interface and headings.
 * Geist Mono for prices, credit counts, booking IDs and tabular figures.
 * Self-hosted via next/font — avoids blocking external requests.
 */
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  // Use intentional weights — do not load the entire variable range
  weight: ["400", "500", "600", "700", "800"],
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
})

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F7F7F2",
}

export const metadata: Metadata = {
  title: {
    default: "OnePass — A city with more ways to move",
    template: "%s | OnePass",
  },
  description:
    "One membership, many activities. Discover and book gyms, yoga, swimming, badminton and more across participating venues in your city.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "OnePass",
  },
  robots: {
    // No indexing until the product is validated and ready for public launch
    index: false,
    follow: false,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en-IN"
      className={`${manrope.variable} ${geistMono.variable}`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-dvh flex flex-col antialiased">
        {/* Member-facing header — auth state to be resolved server-side in Phase 3+ */}
        <SiteHeader />

        {/* Operational & Emergency Kill-switch Banner */}
        <OperationalBanner />

        {/* Main content area */}
        <main
          id="main-content"
          className="flex-1"
          // Bottom padding accounts for mobile bottom nav on small screens
          style={{ paddingBottom: "calc(4rem + env(safe-area-inset-bottom))" }}
        >
          {children}
        </main>

        <SiteFooter />

        {/* Mobile bottom nav — shown only on member-facing routes */}
        <Suspense fallback={null}>
          <MobileBottomNav />
        </Suspense>

        {/* Toast notifications */}
        <Toaster />

        {/* Skip link for keyboard users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:bg-[--color-accent] focus:text-[--color-accent-foreground] focus:rounded-[--radius-sm] focus:text-sm focus:font-[600]"
        >
          Skip to main content
        </a>
      </body>
    </html>
  )
}
