import { createBrowserClient } from "@supabase/ssr"

/**
 * Creates a Supabase client for use in browser / client components.
 * Automatically handles auth tokens in cookies.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    return null
  }

  return createBrowserClient(url, anonKey)
}
