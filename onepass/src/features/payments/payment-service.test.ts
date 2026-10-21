import { describe, it, expect, beforeEach } from "vitest"
import crypto from "crypto"
import {
  createPaymentOrder,
  processPaymentWebhook,
  verifyWebhookSignature,
  getPaymentOrder,
  resetPaymentServiceState,
  WebhookSignatureError,
  OrderVerificationError,
} from "./payment-service"
import { getUserCreditBalance } from "@/features/credits/credit-ledger-service"

describe("Payment Provider Sandbox & Entitlements (Phase 5 acceptance)", () => {
  const TEST_USER = "user-member-payment"
  const WEBHOOK_SECRET = "whsec_test_secret_key_123456"

  function signPayload(body: string, secret = WEBHOOK_SECRET): string {
    return crypto.createHmac("sha256", secret).update(body).digest("hex")
  }

  beforeEach(() => {
    resetPaymentServiceState()
  })

  it("verifies webhook signatures correctly using timing-safe comparison", () => {
    const body = '{"event":"payment.captured"}'
    const signature = signPayload(body)
    expect(verifyWebhookSignature(body, signature, WEBHOOK_SECRET)).toBe(true)
    expect(verifyWebhookSignature(body, "wrong_sig", WEBHOOK_SECRET)).toBe(false)
  })

  it("creates server-side order with correct integer paise amount and idempotency", async () => {
    const order = await createPaymentOrder({
      userId: TEST_USER,
      productSlug: "active-pack-50",
      idempotencyKey: `ord-key-${Date.now()}`,
    })

    expect(order).toBeDefined()
    expect(order.amountPaise).toBe(449900) // ₹4,499
    expect(order.currency).toBe("INR")
    expect(order.creditsToGrant).toBe(50)
    expect(order.status).toBe("created")

    // Check retrieval
    const retrieved = await getPaymentOrder(order.providerOrderId)
    expect(retrieved?.id).toBe(order.id)
  })

  it("strictly rejects invalid webhook signature", async () => {
    const order = await createPaymentOrder({
      userId: TEST_USER,
      productSlug: "starter-pack-20",
      idempotencyKey: `ord-sig-${Date.now()}`,
    })

    const rawBody = JSON.stringify({
      event: "payment.captured",
      order_id: order.providerOrderId,
    })

    await expect(
      processPaymentWebhook(
        {
          providerEventId: `evt-${Date.now()}`,
          eventType: "payment.captured",
          providerOrderId: order.providerOrderId,
          amountPaise: 199900,
          currency: "INR",
          rawBody,
          signature: "invalid_tampered_signature_hex",
        },
        WEBHOOK_SECRET
      )
    ).rejects.toThrow(WebhookSignatureError)
  })

  it("processes payment.captured, updates order status, and grants credits to ledger atomically", async () => {
    const balanceBefore = await getUserCreditBalance(TEST_USER)

    const order = await createPaymentOrder({
      userId: TEST_USER,
      productSlug: "active-pack-50",
      idempotencyKey: `ord-grant-${Date.now()}`,
    })

    const rawBody = JSON.stringify({
      event: "payment.captured",
      order_id: order.providerOrderId,
      amount: 449900,
    })
    const signature = signPayload(rawBody)

    const result = await processPaymentWebhook(
      {
        providerEventId: `evt-cap-${Date.now()}`,
        eventType: "payment.captured",
        providerOrderId: order.providerOrderId,
        amountPaise: 449900,
        currency: "INR",
        rawBody,
        signature,
      },
      WEBHOOK_SECRET
    )

    expect(result.status).toBe("processed")

    // Verify order status updated to captured
    const updatedOrder = await getPaymentOrder(order.providerOrderId)
    expect(updatedOrder?.status).toBe("captured")

    // Verify credits granted
    const balanceAfter = await getUserCreditBalance(TEST_USER)
    expect(balanceAfter).toBe(balanceBefore + 50)
  })

  it("deduplicates webhook: duplicate delivery creates exactly one credit grant", async () => {
    const order = await createPaymentOrder({
      userId: TEST_USER,
      productSlug: "starter-pack-20",
      idempotencyKey: `ord-dedup-${Date.now()}`,
    })

    const balanceBefore = await getUserCreditBalance(TEST_USER)
    const eventId = `evt-dedup-${Date.now()}`

    const rawBody = JSON.stringify({ event: "payment.captured", order_id: order.providerOrderId })
    const signature = signPayload(rawBody)

    // First delivery
    const res1 = await processPaymentWebhook(
      {
        providerEventId: eventId,
        eventType: "payment.captured",
        providerOrderId: order.providerOrderId,
        amountPaise: 199900,
        currency: "INR",
        rawBody,
        signature,
      },
      WEBHOOK_SECRET
    )
    expect(res1.status).toBe("processed")
    expect(await getUserCreditBalance(TEST_USER)).toBe(balanceBefore + 20)

    // Duplicate delivery with identical eventId
    const res2 = await processPaymentWebhook(
      {
        providerEventId: eventId,
        eventType: "payment.captured",
        providerOrderId: order.providerOrderId,
        amountPaise: 199900,
        currency: "INR",
        rawBody,
        signature,
      },
      WEBHOOK_SECRET
    )
    expect(res2.status).toBe("ignored")

    // Verify credits were NOT granted a second time
    expect(await getUserCreditBalance(TEST_USER)).toBe(balanceBefore + 20)
  })

  it("strictly rejects mismatched amount and flags order without granting credits", async () => {
    const order = await createPaymentOrder({
      userId: TEST_USER,
      productSlug: "pro-pack-100", // Expected ₹7,999 (799900 paise)
      idempotencyKey: `ord-mismatch-${Date.now()}`,
    })

    const balanceBefore = await getUserCreditBalance(TEST_USER)

    const rawBody = JSON.stringify({
      event: "payment.captured",
      order_id: order.providerOrderId,
      amount: 100000, // tampered amount
    })
    const signature = signPayload(rawBody)

    await expect(
      processPaymentWebhook(
        {
          providerEventId: `evt-mismatch-${Date.now()}`,
          eventType: "payment.captured",
          providerOrderId: order.providerOrderId,
          amountPaise: 100000, // 100000 !== 799900
          currency: "INR",
          rawBody,
          signature,
        },
        WEBHOOK_SECRET
      )
    ).rejects.toThrow(OrderVerificationError)

    // Verify balance unchanged
    expect(await getUserCreditBalance(TEST_USER)).toBe(balanceBefore)

    // Verify order marked failed
    const updatedOrder = await getPaymentOrder(order.providerOrderId)
    expect(updatedOrder?.status).toBe("failed")
  })

  it("records payment.failed event and updates order status without altering credits", async () => {
    const order = await createPaymentOrder({
      userId: TEST_USER,
      productSlug: "starter-pack-20",
      idempotencyKey: `ord-fail-${Date.now()}`,
    })

    const balanceBefore = await getUserCreditBalance(TEST_USER)

    const rawBody = JSON.stringify({ event: "payment.failed", order_id: order.providerOrderId })
    const signature = signPayload(rawBody)

    const res = await processPaymentWebhook(
      {
        providerEventId: `evt-fail-${Date.now()}`,
        eventType: "payment.failed",
        providerOrderId: order.providerOrderId,
        amountPaise: 199900,
        currency: "INR",
        rawBody,
        signature,
      },
      WEBHOOK_SECRET
    )

    expect(res.status).toBe("processed")
    const updatedOrder = await getPaymentOrder(order.providerOrderId)
    expect(updatedOrder?.status).toBe("failed")
    expect(await getUserCreditBalance(TEST_USER)).toBe(balanceBefore)
  })
})
