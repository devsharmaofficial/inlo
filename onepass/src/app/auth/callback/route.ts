import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse, type NextRequest } from "next/server"

/**
 * Handles the OAuth and Email Confirmation redirect callback from Supabase Auth.
 * Exchanges the PKCE code parameter for user session tokens and sets HTTP-only cookies.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next") ?? "/explore"

  if (code) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (url && anonKey) {
      const cookieStore = await cookies()
      const supabase = createServerClient(url, anonKey, {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Ignored if called during response streaming
            }
          },
        },
      })

      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error) {
        return NextResponse.redirect(new URL(next, requestUrl.origin))
      }
    }
  }

  // Redirect back to sign-in with query parameter if verification fails
  return NextResponse.redirect(
    new URL("/auth/sign-in?error=verification_failed", requestUrl.origin)
  )
}
