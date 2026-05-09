// src/lib/supabase/admin.ts
// Admin Supabase client — uses SERVICE ROLE KEY, bypasses RLS
// SERVER-SIDE ONLY — never import in Client Components
// Lazy-initialized to prevent build-time crash when env vars are missing

import { createClient } from '@supabase/supabase-js'

let _adminClient: ReturnType<typeof createClient> | null = null

export function getAdminClient() {
  if (!_adminClient) {
    _adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return _adminClient
}

// Back-compat alias
export const adminClient = new Proxy({} as ReturnType<typeof createClient>, {
  get(_target, prop) {
    return (getAdminClient() as any)[prop]
  },
})
