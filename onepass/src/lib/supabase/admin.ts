import { createClient } from "@supabase/supabase-js"

/**
 * Creates an administrative Supabase client using SUPABASE_SERVICE_ROLE_KEY.
 *
 * CRITICAL SECURITY INVARIANT:
 * - This client bypasses Row-Level Security (RLS).
 * - It must NEVER be called or imported in client-side code.
 * - Used strictly in server-side services (e.g. Credit Ledger, Webhook inbox, Health checks).
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    return null
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
