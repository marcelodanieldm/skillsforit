import { NextRequest, NextResponse } from 'next/server';
import { sessionsDb, db } from '@/lib/database';

export async function GET(req: NextRequest) {
  const mentorId = req.nextUrl.searchParams.get('mentorId');
  if (!mentorId) return NextResponse.json({ error: 'mentorId requerido' }, { status: 400 });
  const sessions = sessionsDb.findByMentor(mentorId).map(s => ({
    id: s.id,
    menteeEmail: s.menteeEmail,
    menteeName: s.menteeName,
    scheduledAt: s.scheduledAt,
    status: s.status,
  }));
  return NextResponse.json({ sessions });
}
