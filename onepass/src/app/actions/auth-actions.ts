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
      // If user already registered, provide friendly guidance
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
 * Sign out action terminating session and clearing auth cookies.
 */
export async function signOutAction(): Promise<void> {
  const supabase = await createServerSupabaseClient()
  if (supabase) {
    await supabase.auth.signOut()
  }
  revalidatePath("/", "layout")
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
