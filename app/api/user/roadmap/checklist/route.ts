import { NextRequest } from 'next/server'
import { roadmapDb } from '@/lib/database'
import { AuthService } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || ''
    const auth = AuthService.requireRole(token, ['user', 'mentor', 'admin', 'ceo'])
    const email = auth.authorized && auth.user ? auth.user.email : 'user@example.com'

    const body = await req.json()
    const { id, completed } = body as { id: number; completed: boolean }
    if (typeof id !== 'number' || typeof completed !== 'boolean') {
      return new Response(JSON.stringify({ error: 'Parámetros inválidos: id debe ser número, completed debe ser boolean' }), { status: 400 })
    }

    // Use the numeric id directly as the key for completion tracking
    const set = roadmapDb.setItem(email, id.toString(), completed)
    return new Response(JSON.stringify({ success: true, completedCount: set.size }), { status: 200 })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || 'Internal error' }), { status: 500 })
  }
}
