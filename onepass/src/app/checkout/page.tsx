import type { Metadata } from "next"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ShieldCheck, Zap, Calendar } from "lucide-react"
import { getProductBySlug } from "@/features/payments/products"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SandboxCheckoutButton } from "@/components/checkout/sandbox-checkout-button"
import { formatINR } from "@/lib/utils"
import { ROUTES } from "@/lib/constants"

export const metadata: Metadata = {
  title: "Checkout & order review",
}

interface CheckoutPageProps {
  searchParams: Promise<{ product?: string }>
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const { product: productSlug } = await searchParams

  if (!productSlug) {
    redirect(ROUTES.membership)
  }

  const product = getProductBySlug(productSlug)
  if (!product) {
    redirect(ROUTES.membership)
  }

  const amountFormatted = formatINR(product.pricePaise / 100)

  return (
    <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <div className="mb-6">
        <Link
          href={ROUTES.membership}
          className="inline-flex items-center gap-1.5 text-xs font-[600] text-[--color-muted] hover:text-[--color-foreground] transition-colors duration-[140ms]"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Back to plans
        </Link>
      </div>

      <div className="space-y-6">
        <div>
          <h1 className="text-h1 text-[--color-foreground] mb-2">Review your order</h1>
          <p className="text-body text-[--color-muted]">
            Confirm your credit pack selection before checkout.
          </p>
        </div>

        <Card className="border-[--color-border] bg-[--color-surface] shadow-md">
          <CardHeader className="p-6 border-b border-[--color-border]">
            <div className="flex items-center justify-between">
              <CardTitle className="text-h3 text-[--color-foreground]">
                {product.name}
              </CardTitle>
              <span className="text-h2 font-[750] text-[--color-foreground] tabular-nums">
                {amountFormatted}
              </span>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-5">
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1">
                <span className="text-[--color-muted] flex items-center gap-1.5 font-[600]">
                  <Zap size={14} className="text-[--color-forest]" />
                  Credits Included
                </span>
                <span className="font-[700] text-[--color-forest] text-sm tabular-nums">
                  {product.credits} credits
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-t border-[--color-border]">
                <span className="text-[--color-muted] flex items-center gap-1.5 font-[600]">
                  <Calendar size={14} className="text-[--color-forest]" />
                  Validity Period
                </span>
                <span className="font-[600] text-[--color-foreground]">
                  {product.validityDays} days from purchase
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-t border-[--color-border]">
                <span className="text-[--color-muted]">Taxes & Fees</span>
                <span className="font-[600] text-[--color-foreground]">
                  Included (GST 18%)
                </span>
              </div>
            </div>

            <div className="rounded-[--radius-md] border border-[--color-border] bg-[--color-surface-muted] p-4 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-[650] text-[--color-foreground]">
                <ShieldCheck size={14} className="text-[--color-forest]" />
                <span>Authoritative Webhook Security</span>
              </div>
              <p className="text-[--color-muted] leading-relaxed">
                Credits are strictly granted upon cryptographic verification of payment webhook
                events. Browser redirects alone never modify balances.
              </p>
            </div>

            <div className="pt-2">
              <SandboxCheckoutButton
                productSlug={product.slug}
                amountFormatted={amountFormatted}
                credits={product.credits}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
