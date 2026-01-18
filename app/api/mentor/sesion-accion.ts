import { NextRequest, NextResponse } from 'next/server';
import { sessionsDb, usersDb } from '@/lib/database';
import { sendEmail } from '@/lib/email';

  const { sessionId, action } = await req.json();
  const session = sessionsDb.findById(sessionId);
  if (!session) return NextResponse.json({ error: 'Sesión no encontrada.' }, { status: 404 });
  let status = '';
  if (action === 'cancelar') {
    sessionsDb.update(sessionId, { status: 'cancelled' });
    status = 'cancelled';
    // Notificar usuario IT
    const user = usersDb.findByEmail(session.menteeEmail);
    if (user) {
      await sendEmail({
        to: user.email,
        subject: '🚨 Tu mentoría fue cancelada',
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#fffbe6;padding:32px 24px;border-radius:12px;border:1px solid #fbbf24;">
            <h2 style="color:#b91c1c;">Tu mentoría fue cancelada</h2>
            <p>Hola <b>${user.name || user.email}</b>,<br>
            Lamentablemente, tu mentor ha cancelado la sesión agendada para <b>${new Date(session.scheduledAt).toLocaleString()}</b>.<br>
            Puedes reservar una nueva fecha desde tu <a href="${process.env.NEXT_PUBLIC_APP_URL}/user/dashboard" style="color:#2563eb;">Dashboard</a>.<br><br>
            <b>¿Dudas?</b> Responde este email y te ayudamos a reprogramar tu sesión.
            </p>
            <div style="margin-top:24px;font-size:13px;color:#64748b;">SkillsForIT Mentoring</div>
          </div>`
      });
      // Notificación in-app: persistir en localStorage (si está en entorno browser)
      if (typeof window !== 'undefined' && user.email) {
        const notifRaw = localStorage.getItem('mentorias_notificaciones');
        let notifs = [];
        try { notifs = notifRaw ? JSON.parse(notifRaw) : []; } catch { notifs = []; }
        notifs.push({
          tipo: 'cancelada',
          mensaje: `Tu mentoría del ${new Date(session.scheduledAt).toLocaleString()} fue cancelada por el mentor. Puedes reservar una nueva fecha desde el dashboard.`,
          fecha: new Date().toISOString(),
        });
        localStorage.setItem('mentorias_notificaciones', JSON.stringify(notifs));
      }
    }
  }
  if (action === 'completar') {
    sessionsDb.update(sessionId, { status: 'completed' });
    status = 'completed';
    // Notificar usuario IT
    const user = usersDb.findByEmail(session.menteeEmail);
    if (user) {
      await sendEmail({
        to: user.email,
        subject: '✅ ¡Sesión de mentoría completada!',
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#f0fdf4;padding:32px 24px;border-radius:12px;border:1px solid #22c55e;">
            <h2 style="color:#16a34a;">¡Sesión completada!</h2>
            <p>Hola <b>${user.name || user.email}</b>,<br>
            Tu mentor ha marcado como <b>completada</b> la sesión del <b>${new Date(session.scheduledAt).toLocaleString()}</b>.<br>
            Revisa tus notas y sigue avanzando en tu plan desde tu <a href="${process.env.NEXT_PUBLIC_APP_URL}/user/dashboard" style="color:#2563eb;">Dashboard</a>.<br><br>
            <b>¿Necesitas feedback?</b> Responde este email y tu mentor te ayudará a mejorar aún más.
            </p>
            <div style="margin-top:24px;font-size:13px;color:#64748b;">SkillsForIT Mentoring</div>
          </div>`
      });
      // Notificación in-app: persistir en localStorage (si está en entorno browser)
      if (typeof window !== 'undefined' && user.email) {
        const notifRaw = localStorage.getItem('mentorias_notificaciones');
        let notifs = [];
        try { notifs = notifRaw ? JSON.parse(notifRaw) : []; } catch { notifs = []; }
        notifs.push({
          tipo: 'completada',
          mensaje: `¡Sesión del ${new Date(session.scheduledAt).toLocaleString()} marcada como completada por tu mentor! Revisa tus notas y sigue avanzando en tu plan.`,
          fecha: new Date().toISOString(),
        });
        localStorage.setItem('mentorias_notificaciones', JSON.stringify(notifs));
      }
    }
  }
  if (!status) return NextResponse.json({ error: 'Acción no válida.' }, { status: 400 });
  return NextResponse.json({ success: true, status });
}
