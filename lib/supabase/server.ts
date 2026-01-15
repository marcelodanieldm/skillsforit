import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createClient() {
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
	const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
	return createSupabaseClient(supabaseUrl, supabaseServiceKey)
}

let _supabaseClient: any = null

export const supabase = new Proxy({} as any, {
  get(_target, prop) {
    if (!_supabaseClient) {
      _supabaseClient = createClient()
    }
    return _supabaseClient[prop]
  }
})