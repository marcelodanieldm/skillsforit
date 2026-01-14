import { createClient } from '@supabase/supabase-js'
import { revenueDb } from './database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const db = createClient(supabaseUrl, supabaseServiceKey)

// Re-export revenueDb for compatibility
export { revenueDb }

// Mock tracking events for now
export const trackingEvents = {
  getAll: async (): Promise<any[]> => [],
  getByType: async (type: string): Promise<any[]> => [],
  create: async (event: any): Promise<void> => {}
}