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
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const supabase = await createServerSupabaseClient()
    if (!supabase) return null

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

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
