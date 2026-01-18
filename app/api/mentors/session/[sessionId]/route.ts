import { NextRequest, NextResponse } from 'next/server'
import { sessionsDb } from '@/lib/database'

/**
 * GET /api/mentors/session/[sessionId]
 * Devuelve el estado de una sesión de mentoría por sessionId
 * Ejemplo de respuesta:
 * {
 *   sessionId: string,
 *   mentorId: string,
 *   menteeEmail: string,
 *   menteeName: string,
 *   scheduledAt: string,
 *   duration: number,
 *   status: string, // 'scheduled', 'paid', 'completed', etc.
 *   paymentStatus: string, // 'pending', 'paid', 'failed', etc.
 *   stripeSessionId: string
 * }
 */


export async function GET(request: NextRequest) {
  // Extract sessionId from the URL pathname
  const url = new URL(request.url)
  const parts = url.pathname.split('/')
  const sessionId = parts[parts.length - 1]
  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId requerido' }, { status: 400 })
  }
  const session = sessionsDb.findById(sessionId)
  if (!session) {
    return NextResponse.json({ error: 'Sesión no encontrada' }, { status: 404 })
  }
  return NextResponse.json({
    sessionId: session.id,
    mentorId: session.mentorId,
    menteeEmail: session.menteeEmail,
    menteeName: session.menteeName,
    scheduledAt: session.scheduledAt,
    duration: session.duration,
    status: session.status,
    paymentStatus: session.paymentStatus,
    stripeSessionId: session.stripeSessionId || null
  })
}
