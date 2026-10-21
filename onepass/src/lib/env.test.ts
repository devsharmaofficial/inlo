import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { getEnv } from "./env"

describe("getEnv", () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it("defaults to sensible local development values", () => {
    delete process.env.NEXT_PUBLIC_APP_URL
    delete process.env.NEXT_PUBLIC_FEATURE_PAYMENTS_ENABLED
    delete process.env.NEXT_PUBLIC_FEATURE_BOOKINGS_ENABLED
    delete process.env.NEXT_PUBLIC_FEATURE_PARTNER_SELF_SERVE
    const env = getEnv()
    expect(env.appUrl).toBe("http://localhost:3000")
    expect(env.features.paymentsEnabled).toBe(false)
    expect(env.features.bookingsEnabled).toBe(false)
    expect(env.features.partnerSelfServe).toBe(false)
  })

  it("parses feature flags correctly", () => {
    process.env.NEXT_PUBLIC_FEATURE_PAYMENTS_ENABLED = "true"
    process.env.NEXT_PUBLIC_FEATURE_BOOKINGS_ENABLED = "1"
    process.env.NEXT_PUBLIC_FEATURE_PARTNER_SELF_SERVE = "false"

    const env = getEnv()
    expect(env.features.paymentsEnabled).toBe(true)
    expect(env.features.bookingsEnabled).toBe(true)
    expect(env.features.partnerSelfServe).toBe(false)
  })

  it("detects environment mode flags accurately", () => {
    vi.stubEnv("NODE_ENV", "test")
    const env = getEnv()
    expect(env.isTest).toBe(true)
    expect(env.isProduction).toBe(false)
    vi.unstubAllEnvs()
  })
})
