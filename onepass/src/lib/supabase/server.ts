import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// In-memory cookie fallback for execution outside Next.js request contexts (e.g. unit tests)
const fallbackMemoryCookies = new Map<string, string>()

/**
 * Creates a Supabase client for Server Components, Server Actions,
 * and Route Handlers with secure cookie handling.
 */
export async function createServerSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    return null
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cookieStore: any = null
  try {
    cookieStore = await cookies()
  } catch {
    // Expected when invoked in unit test runners without an active HTTP request
  }

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        if (cookieStore) {
          return cookieStore.getAll()
        }
        return Array.from(fallbackMemoryCookies.entries()).map(([name, value]) => ({
          name,
          value,
        }))
      },
      setAll(cookiesToSet) {
        if (cookieStore) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignored if called in read-only render phase
          }
        } else {
          cookiesToSet.forEach(({ name, value }) => {
            fallbackMemoryCookies.set(name, value)
          })
        }
      },
    },
  })
}
