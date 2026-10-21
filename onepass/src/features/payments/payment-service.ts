import crypto from "crypto"
import type {
  CreateOrderInput,
  PaymentEvent,
  PaymentOrder,
  WebhookProcessInput,
} from "@/types/payment"
import { getProductBySlug } from "./products"
import { grantCredits } from "@/features/credits/credit-ledger-service"
import { ValidationError } from "@/features/partner/inventory-service"

export class WebhookSignatureError extends Error {
  constructor(message = "Invalid payment webhook signature.") {
    super(message)
    this.name = "WebhookSignatureError"
  }
}

export class OrderVerificationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "OrderVerificationError"
  }
}

// In-memory payment orders store
const ordersStore: Map<string, PaymentOrder> = new Map()

// In-memory payment events inbox (idempotent tracking)
const eventsInbox: Map<string, PaymentEvent> = new Map()

/**
 * Verifies webhook HMAC SHA256 signature against the raw request body.
 */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  secret: string
): boolean {
  if (!rawBody || !signature || !secret) {
    return false
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex")

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, "utf8"),
      Buffer.from(expectedSignature, "utf8")
    )
  } catch {
    return false
  }
}

/**
 * Creates an authoritative server-side payment order.
 * Idempotent: repeating with the same idempotencyKey returns the existing order.
 */
export async function createPaymentOrder(input: CreateOrderInput): Promise<PaymentOrder> {
  const { userId, productSlug, idempotencyKey } = input

  if (!idempotencyKey) {
    throw new ValidationError("An idempotency key is required to create a payment order.")
  }

  const existing = Array.from(ordersStore.values()).find(
    (o) => o.idempotencyKey === idempotencyKey
  )
  if (existing) {
    return existing
  }

  const product = getProductBySlug(productSlug)
  if (!product) {
    throw new ValidationError(`Product with slug "${productSlug}" not found or inactive.`)
  }

  const orderId = `ord-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
  const providerOrderId = `order_${crypto.randomBytes(8).toString("hex")}`

  const order: PaymentOrder = {
    id: orderId,
    userId,
    productId: product.id,
    providerOrderId,
    amountPaise: product.pricePaise,
    currency: product.currency,
    status: "created",
    idempotencyKey,
    creditsToGrant: product.credits,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  ordersStore.set(order.providerOrderId, order)
  return order
}

/**
 * Authoritative Webhook Processor.
 * Guarantees:
 * 1. Signature must be valid (using raw body).
 * 2. Event deduplication: duplicate provider_event_id is ignored idempotently.
 * 3. Amount and currency tamper verification.
 * 4. Atomic credit grant on successful capture.
 */
export async function processPaymentWebhook(
  input: WebhookProcessInput,
  webhookSecret: string
): Promise<{ status: "processed" | "ignored" | "rejected"; message: string }> {
  const {
    providerEventId,
    eventType,
    providerOrderId,
    amountPaise,
    currency,
    rawBody,
    signature,
  } = input

  // 1. Signature Verification
  const isValid = verifyWebhookSignature(rawBody, signature, webhookSecret)
  if (!isValid) {
    throw new WebhookSignatureError("Signature mismatch: webhook payload could not be verified.")
  }

  // 2. Event Inbox Deduplication
  const existingEvent = eventsInbox.get(providerEventId)
  if (existingEvent) {
    return {
      status: "ignored",
      message: `Event ${providerEventId} already processed with status ${existingEvent.status}.`,
    }
  }

  const payloadDigest = crypto.createHash("sha256").update(rawBody).digest("hex")

  const eventRecord: PaymentEvent = {
    id: `pevt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    providerEventId,
    provider: "razorpay",
    eventType,
    payloadDigest,
    status: "pending",
    createdAt: new Date().toISOString(),
  }
  eventsInbox.set(providerEventId, eventRecord)

  // 3. Match Order Reference
  const order = ordersStore.get(providerOrderId)
  if (!order) {
    eventRecord.status = "failed"
    eventRecord.errorMessage = `No matching order found for provider_order_id "${providerOrderId}".`
    return { status: "rejected", message: eventRecord.errorMessage }
  }

  eventRecord.orderId = order.id

  // 4. Handle Different Event Types
  if (eventType === "payment.failed") {
    order.status = "failed"
    order.updatedAt = new Date().toISOString()
    eventRecord.status = "processed"
    eventRecord.processedAt = new Date().toISOString()
    return { status: "processed", message: "Recorded payment failure." }
  }

  if (eventType === "payment.captured") {
    // Tamper & amount check: amount and currency must strictly match order
    if (order.amountPaise !== amountPaise || order.currency !== currency) {
      eventRecord.status = "failed"
      eventRecord.errorMessage = `Amount mismatch: expected ${order.amountPaise} ${order.currency}, received ${amountPaise} ${currency}.`
      order.status = "failed"
      order.updatedAt = new Date().toISOString()
      throw new OrderVerificationError(eventRecord.errorMessage)
    }

    // Atomic credit grant with unique idempotency key tied to order
    const grantIdempotencyKey = `grant-order-${order.id}`
    await grantCredits(
      order.userId,
      order.creditsToGrant,
      "order",
      order.id,
      grantIdempotencyKey,
      `Credit pack purchase (${order.creditsToGrant} credits)`
    )

    order.status = "captured"
    order.updatedAt = new Date().toISOString()

    eventRecord.status = "processed"
    eventRecord.processedAt = new Date().toISOString()

    return {
      status: "processed",
      message: `Successfully captured order ${order.id} and granted ${order.creditsToGrant} credits.`,
    }
  }

  // Unsupported or other informational events
  eventRecord.status = "ignored"
  return { status: "ignored", message: `Event type ${eventType} ignored.` }
}

/**
 * Retrieves order status by providerOrderId or internal id.
 */
export async function getPaymentOrder(providerOrderId: string): Promise<PaymentOrder | null> {
  return ordersStore.get(providerOrderId) || null
}

/**
 * Test helper to clear payment state.
 */
export function resetPaymentServiceState(): void {
  ordersStore.clear()
  eventsInbox.clear()
}
