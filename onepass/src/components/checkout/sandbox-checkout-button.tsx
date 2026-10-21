"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Lock, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SandboxCheckoutButtonProps {
  productSlug: string
  amountFormatted: string
  credits: number
}

export function SandboxCheckoutButton({
  productSlug,
  amountFormatted,
  credits,
}: SandboxCheckoutButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [success, setSuccess] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSimulatePayment = async () => {
    setLoading(true)
    setError(null)

    try {
      const idempotencyKey = `user-ord-${productSlug}-${Date.now()}`

      // Call server order creation and simulated webhook processing via internal endpoint
      const res = await fetch("/api/checkout/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productSlug, idempotencyKey }),
      })

      const data = await res.json()
      setLoading(false)

      if (res.ok && data.success) {
        setSuccess(true)
        router.refresh()
      } else {
        setError(data.error || "Payment simulation failed.")
      }
    } catch {
      setLoading(false)
      setError("An unexpected network error occurred.")
    }
  }

  if (success) {
    return (
      <div className="rounded-[--radius-md] border border-[--color-success]/30 bg-[--color-success]/10 p-5 text-center space-y-3">
        <div className="flex items-center justify-center gap-1.5 text-sm font-[650] text-[--color-success]">
          <CheckCircle2 size={18} />
          <span>Payment Verified & Credits Granted</span>
        </div>
        <p className="text-xs text-[--color-muted]">
          <strong>{credits} credits</strong> have been added to your ledger via verified webhook.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
          <Button
            size="sm"
            variant="primary"
            onClick={() => router.push("/explore")}
          >
            Explore activities now
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => router.push("/bookings")}
          >
            Go to bookings
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="p-3 rounded-[--radius-sm] bg-[--color-danger]/10 border border-[--color-danger]/20 text-xs text-[--color-danger] flex items-center gap-2">
          <AlertCircle size={15} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Button
        type="button"
        variant="primary"
        size="lg"
        className="w-full gap-2"
        loading={loading}
        onClick={handleSimulatePayment}
      >
        <Lock size={16} />
        Complete purchase of {amountFormatted}
      </Button>

      <p className="text-[11px] text-center text-[--color-muted]">
        Sandbox mode: Simulates provider-hosted checkout with raw HMAC webhook signature verification.
      </p>
    </div>
  )
}
