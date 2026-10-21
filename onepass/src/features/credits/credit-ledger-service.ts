import type {
  CreditAccount,
  CreditLedgerEntry,
  CreditSourceType,
} from "@/types/booking"

export class InsufficientCreditsError extends Error {
  constructor(required: number, available: number) {
    super(
      `Insufficient credits: booking requires ${required} credits, but member only has ${available} credits available.`
    )
    this.name = "InsufficientCreditsError"
  }
}

export class DuplicateLedgerIdempotencyError extends Error {
  constructor(idempotencyKey: string) {
    super(`A credit ledger entry with idempotency key "${idempotencyKey}" already exists.`)
    this.name = "DuplicateLedgerIdempotencyError"
  }
}

// In-memory ledger entries (source of truth)
const ledgerStore: CreditLedgerEntry[] = [
  // Seed demo credit grant for testing member "user-member-1"
  {
    id: "leg-seed-01",
    userId: "user-member-1",
    delta: 50,
    entryType: "grant",
    sourceType: "seed_pack",
    sourceId: "order-seed-01",
    idempotencyKey: "seed-grant-user-member-1",
    reason: "Initial trial credit grant (50 credits)",
    createdAt: "2026-10-20T00:00:00Z",
  },
]

// In-memory cached accounts projection
const accountStore: Map<string, CreditAccount> = new Map([
  [
    "user-member-1",
    {
      userId: "user-member-1",
      cachedBalance: 50,
      lastReconciledAt: "2026-10-20T00:00:00Z",
    },
  ],
])

/**
 * Calculates current ledger balance by summing all immutable delta entries for the user.
 */
export async function calculateAuthoritativeBalance(userId: string): Promise<number> {
  const userEntries = ledgerStore.filter((entry) => entry.userId === userId)
  return userEntries.reduce((total, entry) => total + entry.delta, 0)
}

/**
 * Gets the current available credit balance for a member.
 */
export async function getUserCreditBalance(userId: string): Promise<number> {
  // Reconcile and return authoritative balance
  const account = accountStore.get(userId)
  if (!account) {
    const authoritative = await calculateAuthoritativeBalance(userId)
    accountStore.set(userId, {
      userId,
      cachedBalance: authoritative,
      lastReconciledAt: new Date().toISOString(),
    })
    return authoritative
  }
  return account.cachedBalance
}

/**
 * Reconciles the projected account balance against the immutable ledger source of truth.
 * Invariant: cachedBalance must match sum(ledger deltas).
 */
export async function reconcileCreditBalance(userId: string): Promise<{
  balance: number
  isConsistent: boolean
}> {
  const authoritative = await calculateAuthoritativeBalance(userId)
  const cached = accountStore.get(userId)?.cachedBalance ?? 0
  const isConsistent = authoritative === cached

  accountStore.set(userId, {
    userId,
    cachedBalance: authoritative,
    lastReconciledAt: new Date().toISOString(),
  })

  return {
    balance: authoritative,
    isConsistent,
  }
}

/**
 * Appends an immutable grant entry and updates cached balance.
 */
export async function grantCredits(
  userId: string,
  amount: number,
  sourceType: CreditSourceType,
  sourceId: string,
  idempotencyKey: string,
  reason?: string
): Promise<CreditLedgerEntry> {
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new Error("Credit grant amount must be a positive integer.")
  }

  const existing = ledgerStore.find((e) => e.idempotencyKey === idempotencyKey)
  if (existing) {
    return existing // Idempotent replay
  }

  const entry: CreditLedgerEntry = {
    id: `leg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    userId,
    delta: amount,
    entryType: "grant",
    sourceType,
    sourceId,
    idempotencyKey,
    reason: reason || "Credit grant",
    createdAt: new Date().toISOString(),
  }

  ledgerStore.push(entry)
  const newBalance = await calculateAuthoritativeBalance(userId)
  accountStore.set(userId, {
    userId,
    cachedBalance: newBalance,
    lastReconciledAt: new Date().toISOString(),
  })

  return entry
}

/**
 * Appends an immutable debit entry and updates cached balance atomically.
 * Throws InsufficientCreditsError if user does not have enough credits.
 */
export async function debitCredits(
  userId: string,
  amount: number,
  sourceType: CreditSourceType,
  sourceId: string,
  idempotencyKey: string,
  reason?: string
): Promise<CreditLedgerEntry> {
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new Error("Credit debit amount must be a positive integer.")
  }

  // Idempotency check: if already processed, return original
  const existing = ledgerStore.find((e) => e.idempotencyKey === idempotencyKey)
  if (existing) {
    return existing
  }

  const currentBalance = await calculateAuthoritativeBalance(userId)
  if (currentBalance < amount) {
    throw new InsufficientCreditsError(amount, currentBalance)
  }

  const entry: CreditLedgerEntry = {
    id: `leg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    userId,
    delta: -amount, // Negative delta
    entryType: "debit",
    sourceType,
    sourceId,
    idempotencyKey,
    reason: reason || "Booking debit",
    createdAt: new Date().toISOString(),
  }

  ledgerStore.push(entry)
  const newBalance = await calculateAuthoritativeBalance(userId)
  accountStore.set(userId, {
    userId,
    cachedBalance: newBalance,
    lastReconciledAt: new Date().toISOString(),
  })

  return entry
}

/**
 * Appends an immutable refund entry when a booking is cancelled within policy.
 */
export async function refundCredits(
  userId: string,
  amount: number,
  sourceType: CreditSourceType,
  sourceId: string,
  idempotencyKey: string,
  reason?: string
): Promise<CreditLedgerEntry> {
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new Error("Credit refund amount must be a positive integer.")
  }

  const existing = ledgerStore.find((e) => e.idempotencyKey === idempotencyKey)
  if (existing) {
    return existing
  }

  const entry: CreditLedgerEntry = {
    id: `leg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    userId,
    delta: amount, // Positive delta for refund
    entryType: "refund",
    sourceType,
    sourceId,
    idempotencyKey,
    reason: reason || "Booking cancellation refund",
    createdAt: new Date().toISOString(),
  }

  ledgerStore.push(entry)
  const newBalance = await calculateAuthoritativeBalance(userId)
  accountStore.set(userId, {
    userId,
    cachedBalance: newBalance,
    lastReconciledAt: new Date().toISOString(),
  })

  return entry
}

/**
 * Test helper to reset or inspect ledger state in test environments.
 */
export function getRawLedgerStore(): CreditLedgerEntry[] {
  return [...ledgerStore]
}
