import { NextRequest, NextResponse } from 'next/server';
import { mentorshipSubscriptionsDb } from '@/lib/mentorship_subscriptions';
import { sessionsDb } from '@/lib/database';

// Simulación de base de datos de reservas
const reservas: { [userId: string]: Date[] } = {};

export async function POST(req: NextRequest) {
  const { userId, date } = await req.json();
  const sub = mentorshipSubscriptionsDb.findByUserId(userId)[0];
  if (!sub || !sub.active) {
    return NextResponse.json({ error: 'No tienes una suscripción activa.' }, { status: 403 });
  }
  if (!reservas[userId]) reservas[userId] = [];
  if (reservas[userId].length >= sub.sessionsTotal) {
    return NextResponse.json({ error: 'Ya reservaste todas tus sesiones.' }, { status: 400 });
  }
  const fecha = new Date(date);
  if (reservas[userId].find(d => d.toDateString() === fecha.toDateString())) {
    return NextResponse.json({ error: 'Ya reservaste esa fecha.' }, { status: 400 });
  }
  // Bloquear si el mentor ya tiene una sesión en ese horario
  const mentorId = sub.mentorId;
  if (mentorId) {
    const mentorSessions = sessionsDb.findByMentor(mentorId, 'scheduled');
    if (mentorSessions.find(s => new Date(s.scheduledAt).toISOString().slice(0,16) === fecha.toISOString().slice(0,16))) {
      return NextResponse.json({ error: 'El mentor ya tiene una sesión agendada en ese horario.' }, { status: 400 });
    }
  }
  reservas[userId].push(fecha);
  mentorshipSubscriptionsDb.update(sub.id, { sessionsUsed: reservas[userId].length });
  // Crear sesión en sessionsDb para el mentor
  if (mentorId) {
    sessionsDb.create({
      id: `${userId}-${fecha.toISOString()}`,
      mentorId,
      menteeEmail: sub.email,
      menteeName: '',
      scheduledAt: fecha,
      duration: 10,
      status: 'scheduled',
      meetingLink: '',
    });
  }
  return NextResponse.json({ success: true, reserved: reservas[userId] });
}

export async function DELETE(req: NextRequest) {
  const { userId, date } = await req.json();
  const sub = mentorshipSubscriptionsDb.findByUserId(userId)[0];
  if (!sub || !sub.active) {
    return NextResponse.json({ error: 'No tienes una suscripción activa.' }, { status: 403 });
  }
  if (!reservas[userId]) reservas[userId] = [];
  const fecha = new Date(date);
  reservas[userId] = reservas[userId].filter(d => d.toDateString() !== fecha.toDateString());
  mentorshipSubscriptionsDb.update(sub.id, { sessionsUsed: reservas[userId].length });
  return NextResponse.json({ success: true, reserved: reservas[userId] });
}

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'userId requerido' }, { status: 400 });
  return NextResponse.json({ reserved: reservas[userId] || [] });
}
