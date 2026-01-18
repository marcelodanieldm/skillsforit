import { NextRequest, NextResponse } from 'next/server';
import { mentorshipSubscriptionsDb } from '@/lib/mentorship_subscriptions';
import { mentorsDb } from '@/lib/database';

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'userId requerido' }, { status: 400 });
  const sub = mentorshipSubscriptionsDb.findByUserId(userId)[0];
  if (!sub) return NextResponse.json({ error: 'No tienes una suscripción activa.' }, { status: 404 });
  // Para MVP: asignar mentor fijo o por lógica, aquí mockeamos mentorId = 'mentor1'
  const mentorId = sub.mentorId || 'mentor1';
  const mentor = mentorsDb.findById(mentorId);
  if (!mentor) return NextResponse.json({ error: 'Mentor no encontrado.' }, { status: 404 });
  return NextResponse.json({
    mentorId: mentor.id,
    mentorName: mentor.name,
    availability: mentor.availability,
    timezone: mentor.availability[0]?.timezone || 'America/Argentina/Buenos_Aires',
  });
}
