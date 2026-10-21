/**
 * Membership and Payments Domain Types.
 * Source of truth: architecture.md §4, §6 and 004_membership_payments.sql.
 */

export interface MembershipProduct {
  id: string
  slug: string
  name: string
  credits: number
  pricePaise: number // Integer paise (e.g. 449900 = ₹4,499)
  currency: string // "INR"
  validityDays: number
  isActive: boolean
  sortOrder: number
  description: string
  featured?: boolean
}

export type OrderStatus = "created" | "attempted" | "captured" | "failed" | "refunded"

export interface PaymentOrder {
  id: string
  userId: string
  productId: string
  providerOrderId: string
  amountPaise: number
  currency: string
  status: OrderStatus
  idempotencyKey: string
  creditsToGrant: number
  createdAt: string
  updatedAt: string
}

export type PaymentEventStatus = "pending" | "processed" | "ignored" | "failed"

export interface PaymentEvent {
  id: string
  providerEventId: string
  provider: "razorpay" | "cashfree"
  eventType: string
  payloadDigest: string
  orderId?: string
  status: PaymentEventStatus
  errorMessage?: string
  createdAt: string
  processedAt?: string
}

export interface CreateOrderInput {
  userId: string
  productSlug: string
  idempotencyKey: string
}

export interface WebhookProcessInput {
  providerEventId: string
  eventType: "payment.captured" | "payment.failed" | "refund.processed" | string
  providerOrderId: string
  amountPaise: number
  currency: string
  rawBody: string
  signature: string
}
