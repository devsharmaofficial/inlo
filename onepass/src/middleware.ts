import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    return response
  }

  // If OAuth provider returned ?code=... to root or another page, route through /auth/callback
  const code = request.nextUrl.searchParams.get("code")
  if (code && !request.nextUrl.pathname.startsWith("/auth/callback")) {
    const callbackUrl = new URL("/auth/callback", request.url)
    callbackUrl.searchParams.set("code", code)
    const next = request.nextUrl.searchParams.get("next")
    if (next) callbackUrl.searchParams.set("next", next)
    return NextResponse.redirect(callbackUrl)
  }

  const allCookies = request.cookies.getAll()
  const hasAuthCookie = allCookies.some(
    (c) =>
      (c.name.startsWith("sb-") && c.name.includes("auth-token")) ||
      c.name.includes("sb:token") ||
      c.name.startsWith("sb-access-token")
  )

  // Short-circuit: If no auth token cookie is present, skip network request entirely (0ms)
  if (!hasAuthCookie) {
    return response
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
      },
    },
  })

  // Refreshes the auth token with safety timeout to prevent stalling page clicks
  try {
    await Promise.race([
      supabase.auth.getUser(),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 1000)),
    ])
  } catch {
    // Continue gracefully on network timeout or failure
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|inlo-logo.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
