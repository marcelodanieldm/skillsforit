import { createClient } from '@supabase/supabase-js'
import { revenueDb } from './database'

let _supabaseClient: any = null

function getSupabaseClient() {
  if (!_supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    _supabaseClient = createClient(supabaseUrl, supabaseServiceKey)
  }
  return _supabaseClient
}

export const db = new Proxy({} as any, {
  get(_target, prop) {
    return getSupabaseClient()[prop]
  }
})

// Re-export revenueDb for compatibility
export { revenueDb }

// Mock tracking events for now
export const trackingEvents = {
  getAll: async (): Promise<any[]> => [],
  getByType: async (type: string): Promise<any[]> => [],
  create: async (event: any): Promise<void> => {}
}