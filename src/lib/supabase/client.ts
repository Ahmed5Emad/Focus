import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

function createNoopClient(): SupabaseClient {
  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from: () => ({
      select: () => ({
        order: () => Promise.resolve({ data: [], error: null }),
      }),
    }),
    channel: () => ({ subscribe: () => {}, on: () => {} }),
  } as unknown as SupabaseClient
}

function initSupabase(): SupabaseClient {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase URL or key not configured. Auth will be disabled.')
      return createNoopClient()
    }

    return createSupabaseClient(supabaseUrl, supabaseKey, {
      auth: {
        flowType: 'pkce',
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true,
      },
    })
  } catch (e) {
    console.error('Failed to initialize Supabase client:', e)
    return createNoopClient()
  }
}

export const supabase = initSupabase()

export function createClient() {
  return supabase
}
