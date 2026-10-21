import { NextRequest, NextResponse } from "next/server"
import {
  processPaymentWebhook,
  WebhookSignatureError,
  OrderVerificationError,
} from "@/features/payments/payment-service"

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get("x-razorpay-signature") || req.headers.get("signature") || ""
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "whsec_test_secret_key_123456"

    if (!signature) {
      return NextResponse.json(
        { error: "Missing webhook signature header" },
        { status: 400 }
      )
    }

    let payload: {
      event?: string
      payload?: {
        payment?: {
          entity?: {
            id?: string
            order_id?: string
            amount?: number
            currency?: string
          }
        }
      }
    } = {}

    try {
      payload = JSON.parse(rawBody)
    } catch {
      return NextResponse.json({ error: "Malformed JSON payload" }, { status: 400 })
    }

    const eventType = payload.event || "unknown"
    const paymentEntity = payload.payload?.payment?.entity
    const providerEventId = (req.headers.get("x-razorpay-event-id") || `evt_${Date.now()}`)
    const providerOrderId = paymentEntity?.order_id || ""
    const amountPaise = paymentEntity?.amount || 0
    const currency = paymentEntity?.currency || "INR"

    const result = await processPaymentWebhook(
      {
        providerEventId,
        eventType,
        providerOrderId,
        amountPaise,
        currency,
        rawBody,
        signature,
      },
      webhookSecret
    )

    return NextResponse.json({ success: true, ...result }, { status: 200 })
  } catch (err: unknown) {
    if (err instanceof WebhookSignatureError) {
      return NextResponse.json({ error: err.message }, { status: 401 })
    }
    if (err instanceof OrderVerificationError) {
      return NextResponse.json({ error: err.message }, { status: 422 })
    }
    const message = err instanceof Error ? err.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
