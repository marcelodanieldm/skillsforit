import { NextRequest, NextResponse } from 'next/server';
import { sessionsDb } from '@/lib/database';

// PATCH /api/mentor/sesion-reprogramar
export async function PATCH(req: NextRequest) {
  const { sessionId, newDate } = await req.json();
  const session = sessionsDb.findById(sessionId);
  if (!session) return NextResponse.json({ error: 'Sesión no encontrada.' }, { status: 404 });
  // Validar que la nueva fecha no esté ocupada por otra sesión del mentor
  const mentorSessions = sessionsDb.findByMentor(session.mentorId, 'scheduled');
  if (mentorSessions.find(s => s.id !== sessionId && new Date(s.scheduledAt).toISOString().slice(0,16) === new Date(newDate).toISOString().slice(0,16))) {
    return NextResponse.json({ error: 'El mentor ya tiene una sesión agendada en ese horario.' }, { status: 400 });
  }
  // Actualizar fecha
  sessionsDb.update(sessionId, { scheduledAt: new Date(newDate) });
  return NextResponse.json({ success: true });
}
