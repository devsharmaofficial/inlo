import { cookies } from "next/headers"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export interface AuthUser {
  id: string
  email: string
  fullName: string
  role: string
}

/**
 * Retrieves the currently authenticated Supabase user on the server.
 * Returns null if no active session or invalid tokens.
 * Short-circuits in 0ms when no Supabase auth cookies are present.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    let hasAuthCookie = false
    try {
      const cookieStore = await cookies()
      if (cookieStore) {
        hasAuthCookie = cookieStore.getAll().some(
          (c) =>
            (c.name.startsWith("sb-") && c.name.includes("auth-token")) ||
            c.name.includes("sb:token") ||
            c.name.startsWith("sb-access-token")
        )
      }
    } catch {
      // In test runners or non-request contexts, allow fallbackMemoryCookies to function
      hasAuthCookie = true
    }

    if (!hasAuthCookie) {
      return null
    }

    const supabase = await createServerSupabaseClient()
    if (!supabase) return null

    // Safe timeout to prevent hanging on slow network
    const userPromise = supabase.auth.getUser()
    const timeoutPromise = new Promise<{ data: { user: null }; error: Error }>((resolve) =>
      setTimeout(() => resolve({ data: { user: null }, error: new Error("Auth check timed out") }), 1200)
    )

    const {
      data: { user },
      error,
    } = await Promise.race([userPromise, timeoutPromise])

    if (error || !user) {
      return null
    }

    const fullName =
      (user.user_metadata?.full_name as string) ||
      (user.user_metadata?.name as string) ||
      user.email?.split("@")[0] ||
      "Inlo Member"

    const role = (user.user_metadata?.role as string) || "member"

    return {
      id: user.id,
      email: user.email || "",
      fullName,
      role,
    }
  } catch {
    return null
  }
}

/**
 * Returns the effective user ID for the current request.
 * Prioritizes the authenticated Supabase user ID, falling back to
 * the demo pilot ID ("user-member-1") if unauthenticated.
 */
export async function getEffectiveUserId(): Promise<string> {
  const user = await getCurrentUser()
  return user?.id || "user-member-1"
}
