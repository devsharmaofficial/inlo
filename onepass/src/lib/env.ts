/**
 * Environment configuration and validation.
 *
 * All environment variable access should flow through this module to ensure
 * consistency, type safety, and early detection of missing configuration.
 *
 * SECURITY:
 * - Server secrets (SUPABASE_SERVICE_ROLE_KEY, RAZORPAY_KEY_SECRET, etc.)
 *   must NEVER be exposed to the client bundle (no NEXT_PUBLIC_ prefix).
 * - During local development and build time, optional variables fall back safely.
 */

export interface AppEnv {
  // Application
  appUrl: string
  isProduction: boolean
  isDevelopment: boolean
  isTest: boolean

  // Supabase (candidate database & auth)
  supabaseUrl?: string
  supabaseAnonKey?: string
  supabaseServiceRoleKey?: string

  // Authentication
  jwtSecret?: string

  // Payments (Razorpay candidate — gated until Phase 5)
  razorpayKeyId?: string
  razorpayKeySecret?: string
  razorpayWebhookSecret?: string

  // Email (Resend candidate)
  resendApiKey?: string

  // Feature Flags
  features: {
    paymentsEnabled: boolean
    bookingsEnabled: boolean
    partnerSelfServe: boolean
  }
}

function parseBool(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined) return defaultValue
  return value.toLowerCase() === "true" || value === "1"
}

export function getEnv(): AppEnv {
  const nodeEnv = process.env.NODE_ENV ?? "development"

  return {
    appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    isProduction: nodeEnv === "production",
    isDevelopment: nodeEnv === "development",
    isTest: nodeEnv === "test",

    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,

    jwtSecret: process.env.JWT_SECRET,

    razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET,
    razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,

    resendApiKey: process.env.RESEND_API_KEY,

    features: {
      paymentsEnabled: parseBool(process.env.NEXT_PUBLIC_FEATURE_PAYMENTS_ENABLED, false),
      bookingsEnabled: parseBool(process.env.NEXT_PUBLIC_FEATURE_BOOKINGS_ENABLED, false),
      partnerSelfServe: parseBool(process.env.NEXT_PUBLIC_FEATURE_PARTNER_SELF_SERVE, false),
    },
  }
}

export const env = getEnv()
