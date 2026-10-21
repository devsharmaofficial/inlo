import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import {
  createPaymentOrder,
  processPaymentWebhook,
} from "@/features/payments/payment-service"
import { getEffectiveUserId } from "@/features/auth/auth-service"

export async function POST(req: NextRequest) {
  try {
    const { productSlug, idempotencyKey } = await req.json()
    const effectiveUserId = await getEffectiveUserId()

    if (!productSlug || !idempotencyKey) {
      return NextResponse.json(
        { error: "Product slug and idempotency key are required." },
        { status: 400 }
      )
    }

    // 1. Create authoritative server order for the authenticated user
    const order = await createPaymentOrder({
      userId: effectiveUserId,
      productSlug,
      idempotencyKey,
    })

    // 2. Simulate provider checkout event & sign with webhook secret
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "whsec_test_secret_key_123456"
    const providerEventId = `sim_evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`

    const webhookBody = JSON.stringify({
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: `pay_${Date.now()}`,
            order_id: order.providerOrderId,
            amount: order.amountPaise,
            currency: order.currency,
          },
        },
      },
    })

    const signature = crypto
      .createHmac("sha256", webhookSecret)
      .update(webhookBody)
      .digest("hex")

    // 3. Process via authoritative webhook engine
    const webhookResult = await processPaymentWebhook(
      {
        providerEventId,
        eventType: "payment.captured",
        providerOrderId: order.providerOrderId,
        amountPaise: order.amountPaise,
        currency: order.currency,
        rawBody: webhookBody,
        signature,
      },
      webhookSecret
    )

    return NextResponse.json({
      success: true,
      orderId: order.id,
      creditsGranted: order.creditsToGrant,
      webhookResult,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal simulation error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
