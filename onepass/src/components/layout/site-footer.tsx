import * as React from "react"
import Link from "next/link"
import { Logo } from "@/components/layout/logo"

/**
 * Site footer — member-facing.
 * design.md §8.A: support, terms, privacy, cancellation/refund policy, partner contact.
 * NOTE: Terms/privacy links are placeholders until legal content is drafted.
 */
export function SiteFooter() {
  const currentYear = 2026

  return (
    <footer
      className="border-t border-[--color-border] bg-[--color-background]"
      role="contentinfo"
    >
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-10 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand column */}
          <div className="md:col-span-1">
            <Logo />
            <p className="mt-3 text-sm text-[--color-muted] leading-relaxed max-w-xs">
              One membership. Many ways to move across the city.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-label font-[650] text-[--color-foreground] mb-3">Product</h3>
            <ul className="space-y-2.5" role="list">
              {[
                { href: "/explore", label: "Explore activities" },
                { href: "/membership", label: "Membership plans" },
                { href: "/#how-it-works", label: "How it works" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-[--color-muted] hover:text-[--color-foreground] transition-colors duration-[140ms]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Partners */}
          <div>
            <h3 className="text-label font-[650] text-[--color-foreground] mb-3">Partners</h3>
            <ul className="space-y-2.5" role="list">
              {[
                { href: "/partner", label: "Partner portal" },
                { href: "/partner/apply", label: "List your venue" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-[--color-muted] hover:text-[--color-foreground] transition-colors duration-[140ms]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & support */}
          <div>
            <h3 className="text-label font-[650] text-[--color-foreground] mb-3">Legal & support</h3>
            <ul className="space-y-2.5" role="list">
              {[
                { href: "/support", label: "Help & support" },
                { href: "/legal/terms", label: "Terms of use" },
                { href: "/legal/privacy", label: "Privacy policy" },
                { href: "/legal/cancellations", label: "Cancellations & refunds" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-[--color-muted] hover:text-[--color-foreground] transition-colors duration-[140ms]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-[--color-border] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs text-[--color-muted]">
            © {currentYear} OnePass. Working codename — not a cleared trademark.
          </p>
          <p className="text-xs text-[--color-muted]">
            India · INR · IST
          </p>
        </div>
      </div>
    </footer>
  )
}
