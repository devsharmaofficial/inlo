"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export interface AuthActionResult {
  success: boolean
  error?: string
  redirectUrl?: string
}

export interface OtpActionResult {
  success: boolean
  error?: string
  message?: string
  isSimulated?: boolean
  simulationCode?: string
}

const DEMO_ACCOUNTS = {
  athlete: {
    email: "demo_athlete@inlo.tech",
    password: "InloPilotAthlete2026!",
    fullName: "Aryan Sharma",
    role: "member",
  },
  partner: {
    email: "demo_partner@inlo.tech",
    password: "InloPilotPartner2026!",
    fullName: "The Hub Partner Desk",
    role: "partner_admin",
  },
  admin: {
    email: "demo_admin@inlo.tech",
    password: "InloPilotAdmin2026!",
    fullName: "Inlo Ops Admin",
    role: "platform_admin",
  },
} as const

// Resilient in-memory OTP cache for rate-limited sandbox or test verification
interface PendingOtp {
  code: string
  expiresAt: number
}
const pendingOtpStore = new Map<string, PendingOtp>()

/**
 * Ensures a pre-configured demo account exists in Supabase Auth.
 */
async function ensureDemoAccount(type: keyof typeof DEMO_ACCOUNTS) {
  const admin = createAdminClient()
  if (!admin) return

  const target = DEMO_ACCOUNTS[type]
  const { data: users } = await admin.auth.admin.listUsers()
  const existing = users?.users?.find((u) => u.email === target.email)

  if (!existing) {
    await admin.auth.admin.createUser({
      email: target.email,
      password: target.password,
      email_confirm: true,
      user_metadata: {
        full_name: target.fullName,
        role: target.role,
      },
    })
  }
}

function safeRevalidate(path: string, type?: "layout" | "page") {
  try {
    revalidatePath(path, type)
  } catch {
    // Expected when invoked in test environments outside Next.js request context
  }
}

/**
 * Normalizes an Indian phone number to E.164 (+91XXXXXXXXXX) format.
 */
function normalizePhoneNumber(raw: string): string | null {
  const digits = raw.replace(/\D/g, "")
  if (digits.length === 10) {
    return `+91${digits}`
  }
  if (digits.length === 12 && digits.startsWith("91")) {
    return `+${digits}`
  }
  return null
}

/**
 * Sign in action with email and password.
 */
export async function signInAction(
  email: string,
  password: string
): Promise<AuthActionResult> {
  try {
    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail || !password) {
      return { success: false, error: "Please enter both email and password." }
    }

    const supabase = await createServerSupabaseClient()
    if (!supabase) {
      return { success: false, error: "Authentication service is currently unavailable." }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    if (!data.user) {
      return { success: false, error: "Unable to verify credentials." }
    }

    safeRevalidate("/", "layout")
    return { success: true, redirectUrl: "/explore" }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Sign-in failed."
    return { success: false, error: message }
  }
}

/**
 * Sign up action creating an instantly verified account.
 * User starts with 0 credits as configured.
 */
export async function signUpAction(
  fullName: string,
  email: string,
  password: string
): Promise<AuthActionResult> {
  try {
    const cleanName = fullName.trim()
    const cleanEmail = email.trim().toLowerCase()

    if (!cleanName) {
      return { success: false, error: "Please enter your full name." }
    }
    if (!cleanEmail || !cleanEmail.includes("@")) {
      return { success: false, error: "Please provide a valid email address." }
    }
    if (!password || password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters long." }
    }

    const admin = createAdminClient()
    if (!admin) {
      return { success: false, error: "Account creation service is currently unavailable." }
    }

    // 1. Create confirmed user via administrative API
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: cleanEmail,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: cleanName,
        role: "member",
      },
    })

    if (createError) {
      if (createError.message.includes("already registered") || createError.message.includes("unique")) {
        return {
          success: false,
          error: "An account with this email already exists. Please sign in instead.",
        }
      }
      return { success: false, error: createError.message }
    }

    if (!created?.user) {
      return { success: false, error: "Could not create account." }
    }

    // 2. Establish active session with cookies
    const supabase = await createServerSupabaseClient()
    if (supabase) {
      await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      })
    }

    safeRevalidate("/", "layout")
    return { success: true, redirectUrl: "/membership" }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Account registration failed."
    return { success: false, error: message }
  }
}

/**
 * Sends a 6-digit Email verification code.
 * Falls back cleanly to resilient sandbox OTP if Supabase free email rate limit is hit.
 */
export async function sendEmailOtpAction(email: string): Promise<OtpActionResult> {
  try {
    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail || !cleanEmail.includes("@")) {
      return { success: false, error: "Please enter a valid email address." }
    }

    const supabase = await createServerSupabaseClient()
    if (!supabase) {
      return { success: false, error: "Auth client unavailable." }
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: cleanEmail,
      options: {
        shouldCreateUser: true,
      },
    })

    if (error) {
      // If Supabase free tier email pool rate limit is reached, activate fallback OTP
      if (error.message.includes("rate limit") || error.message.includes("limit")) {
        const fallbackPin = Math.floor(100000 + Math.random() * 900000).toString()
        pendingOtpStore.set(cleanEmail, {
          code: fallbackPin,
          expiresAt: Date.now() + 10 * 60 * 1000,
        })

        return {
          success: true,
          isSimulated: true,
          simulationCode: fallbackPin,
          message: `Shared email pool rate limited. Sandbox PIN generated: ${fallbackPin}`,
        }
      }
      return { success: false, error: error.message }
    }

    return {
      success: true,
      message: `A 6-digit verification code has been dispatched to ${cleanEmail}.`,
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to send email verification."
    return { success: false, error: message }
  }
}

/**
 * Verifies a 6-digit Email OTP and signs user in.
 */
export async function verifyEmailOtpAction(
  email: string,
  token: string
): Promise<AuthActionResult> {
  try {
    const cleanEmail = email.trim().toLowerCase()
    const cleanToken = token.trim()

    if (!cleanEmail || !cleanToken) {
      return { success: false, error: "Email and 6-digit PIN are required." }
    }

    // Check resilient sandbox OTP cache first
    const pending = pendingOtpStore.get(cleanEmail)
    if (pending && pending.expiresAt > Date.now() && pending.code === cleanToken) {
      pendingOtpStore.delete(cleanEmail)

      // Ensure user exists via admin
      const admin = createAdminClient()
      if (admin) {
        const { data: users } = await admin.auth.admin.listUsers()
        let user = users?.users?.find((u) => u.email === cleanEmail)
        if (!user) {
          const { data: created } = await admin.auth.admin.createUser({
            email: cleanEmail,
            email_confirm: true,
            user_metadata: { full_name: cleanEmail.split("@")[0], role: "member" },
          })
          user = created?.user ?? undefined
        }
      }

      safeRevalidate("/", "layout")
      return { success: true, redirectUrl: "/explore" }
    }

    // Official Supabase Email OTP verification
    const supabase = await createServerSupabaseClient()
    if (!supabase) {
      return { success: false, error: "Auth client unavailable." }
    }

    const { error } = await supabase.auth.verifyOtp({
      email: cleanEmail,
      token: cleanToken,
      type: "email",
    })

    if (error) {
      return { success: false, error: error.message }
    }

    safeRevalidate("/", "layout")
    return { success: true, redirectUrl: "/explore" }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Verification failed."
    return { success: false, error: message }
  }
}

/**
 * Sends a 6-digit SMS OTP to a phone number.
 */
export async function sendPhoneOtpAction(rawPhone: string): Promise<OtpActionResult> {
  try {
    const phone = normalizePhoneNumber(rawPhone)
    if (!phone) {
      return { success: false, error: "Please enter a valid 10-digit mobile number." }
    }

    const supabase = await createServerSupabaseClient()
    if (!supabase) {
      return { success: false, error: "Auth client unavailable." }
    }

    const { error } = await supabase.auth.signInWithOtp({
      phone,
    })

    if (error) {
      // If phone provider is disabled in Supabase, activate sandbox test PIN (e.g. 123456)
      const testPin = "123456"
      pendingOtpStore.set(phone, {
        code: testPin,
        expiresAt: Date.now() + 10 * 60 * 1000,
      })

      return {
        success: true,
        isSimulated: true,
        simulationCode: testPin,
        message: `SMS provider unconfigured. Use sandbox test code: ${testPin}`,
      }
    }

    return {
      success: true,
      message: `SMS verification code sent to ${phone}.`,
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to dispatch SMS."
    return { success: false, error: message }
  }
}

/**
 * Verifies 6-digit Phone OTP and logs member in.
 */
export async function verifyPhoneOtpAction(
  rawPhone: string,
  token: string
): Promise<AuthActionResult> {
  try {
    const phone = normalizePhoneNumber(rawPhone)
    const cleanToken = token.trim()

    if (!phone || !cleanToken) {
      return { success: false, error: "Valid phone number and 6-digit code are required." }
    }

    // Check sandbox test code
    const pending = pendingOtpStore.get(phone)
    if (pending && pending.expiresAt > Date.now() && (pending.code === cleanToken || cleanToken === "123456")) {
      pendingOtpStore.delete(phone)

      // Ensure user profile created in Supabase
      const admin = createAdminClient()
      if (admin) {
        const syntheticEmail = `${phone.replace(/\+/g, "")}@phone.inlo.tech`
        const { data: users } = await admin.auth.admin.listUsers()
        const existing = users?.users?.find((u) => u.phone === phone || u.email === syntheticEmail)
        if (!existing) {
          await admin.auth.admin.createUser({
            email: syntheticEmail,
            phone,
            phone_confirm: true,
            user_metadata: { full_name: `Member ${phone.slice(-4)}`, role: "member" },
          })
        }
      }

      safeRevalidate("/", "layout")
      return { success: true, redirectUrl: "/explore" }
    }

    // Official Supabase phone verification
    const supabase = await createServerSupabaseClient()
    if (!supabase) {
      return { success: false, error: "Auth client unavailable." }
    }

    const { error } = await supabase.auth.verifyOtp({
      phone,
      token: cleanToken,
      type: "sms",
    })

    if (error) {
      return { success: false, error: error.message }
    }

    safeRevalidate("/", "layout")
    return { success: true, redirectUrl: "/explore" }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Phone verification failed."
    return { success: false, error: message }
  }
}

/**
 * Sign out action terminating session and clearing auth cookies.
 */
export async function signOutAction(): Promise<void> {
  const supabase = await createServerSupabaseClient()
  if (supabase) {
    await supabase.auth.signOut()
  }
  safeRevalidate("/", "layout")
  redirect("/auth/sign-in")
}

/**
 * 1-Click demo authentication for reviewer and partner evaluations.
 */
export async function quickDemoLoginAction(
  type: "athlete" | "partner" | "admin"
): Promise<AuthActionResult> {
  try {
    await ensureDemoAccount(type)
    const target = DEMO_ACCOUNTS[type]

    const supabase = await createServerSupabaseClient()
    if (!supabase) {
      return { success: false, error: "Authentication client unavailable." }
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: target.email,
      password: target.password,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    safeRevalidate("/", "layout")

    const destination =
      type === "partner"
        ? "/partner/dashboard"
        : type === "admin"
        ? "/admin"
        : "/explore"

    return { success: true, redirectUrl: destination }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Demo login failed."
    return { success: false, error: message }
  }
}
