import { NextRequest, NextResponse } from 'next/server';
import { mentorshipSubscriptionsDb } from '@/lib/mentorship_subscriptions';

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'userId requerido' }, { status: 400 });
  const sub = mentorshipSubscriptionsDb.findByUserId(userId)[0];
  if (!sub) return NextResponse.json({ error: 'No tienes una suscripción activa.' }, { status: 404 });
  return NextResponse.json({
    plan: sub.plan,
    sessionsTotal: sub.sessionsTotal,
    sessionsUsed: sub.sessionsUsed,
    startDate: sub.startDate,
    endDate: sub.endDate,
    active: sub.active,
  });
}
