import { NextRequest } from 'next/server'
import { roadmapDb } from '@/lib/database'
import { AuthService } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || ''
    const auth = AuthService.requireRole(token, ['user', 'mentor', 'admin', 'ceo'])
    const email = auth.authorized && auth.user ? auth.user.email : 'user@example.com'

    const body = await req.json()
    const { id, completed } = body as { id: string; completed: boolean }
    if (!id || typeof completed !== 'boolean') {
      return new Response(JSON.stringify({ error: 'Parámetros inválidos' }), { status: 400 })
    }

    const set = roadmapDb.setItem(email, id, completed)
    return new Response(JSON.stringify({ success: true, completedCount: set.size }), { status: 200 })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || 'Internal error' }), { status: 500 })
  }
}
