import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
})

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature')
  const body = await req.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  // Manejo de eventos relevantes
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const sessionId = paymentIntent.metadata?.sessionId;
    if (sessionId) {
      const { mentorshipDb, usersDb } = await import('@/lib/database');
      const session = mentorshipDb.findById(sessionId);
      mentorshipDb.update(sessionId, {
        paymentStatus: 'completed',
        stripeSessionId: paymentIntent.id
      });
      // Enviar email de confirmación al usuario y mentor
      if (session && session.menteeEmail && session.mentorId) {
        try {
          const { sendEmail } = await import('@/lib/email');
          const user = usersDb.findByEmail(session.menteeEmail);
          // Email para el usuario
          await sendEmail({
            to: session.menteeEmail,
            subject: '✅ Reserva de mentoría confirmada',
            html: `<div style=\"font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#f0fdf4;padding:32px 24px;border-radius:12px;border:1px solid #22c55e;\">
              <h2 style=\"color:#16a34a;\">¡Reserva confirmada!</h2>
              <p>Hola <b>${user?.name || session.menteeEmail}</b>,<br>
              Tu pago fue recibido y tu sesión de mentoría está confirmada para <b>${new Date(session.scheduledAt).toLocaleString()}</b>.<br>
              Accede a tu panel para ver detalles y unirte a la reunión.<br><br>
              <b>¿Dudas?</b> Responde este email y te ayudamos.
              </p>
              <div style=\"margin-top:24px;font-size:13px;color:#64748b;\">SkillsForIT Mentoring</div>
            </div>`
          });
          // Email para el mentor
          const { mentorsDb } = await import('@/lib/database');
          const mentor = mentorsDb.findById(session.mentorId);
          if (mentor && mentor.email) {
            await sendEmail({
              to: mentor.email,
              subject: '🆕 Nueva sesión de mentoría reservada',
              html: `<div style=\"font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#e0e7ff;padding:32px 24px;border-radius:12px;border:1px solid #6366f1;\">
                <h2 style=\"color:#4f46e5;\">¡Nueva sesión reservada!</h2>
                <p>Hola <b>${mentor.name || mentor.email}</b>,<br>
                Un usuario ha reservado y pagado una sesión de mentoría para <b>${new Date(session.scheduledAt).toLocaleString()}</b>.<br>
                Mentee: <b>${user?.name || session.menteeEmail}</b><br>
                Revisa tu panel para ver detalles y preparar la sesión.<br><br>
                <b>¿Dudas?</b> Responde este email y el equipo te ayudará.
                </p>
                <div style=\"margin-top:24px;font-size:13px;color:#64748b;\">SkillsForIT Mentoring</div>
              </div>`
            });
          }
        } catch (e) {
          // Log error, no bloquear webhook
          console.error('Error enviando email de confirmación:', e);
        }
        // Notificación in-app para usuario (si está en browser)
        if (typeof window !== 'undefined') {
          const notifRaw = localStorage.getItem('mentorias_notificaciones');
          let notifs = [];
          try { notifs = notifRaw ? JSON.parse(notifRaw) : []; } catch { notifs = []; }
          notifs.push({
            tipo: 'confirmada',
            mensaje: `Tu pago fue recibido y tu sesión de mentoría está confirmada para el ${new Date(session.scheduledAt).toLocaleString()}.`,
            fecha: new Date().toISOString(),
          });
          localStorage.setItem('mentorias_notificaciones', JSON.stringify(notifs));
        }
        // Notificación in-app para mentor (si está en browser)
        if (typeof window !== 'undefined' && session.mentorId) {
          const notifRaw = localStorage.getItem('mentorias_notificaciones_mentor');
          let notifs = [];
          try { notifs = notifRaw ? JSON.parse(notifRaw) : []; } catch { notifs = []; }
          notifs.push({
            tipo: 'nueva_sesion',
            mensaje: `Un usuario ha reservado y pagado una sesión para el ${new Date(session.scheduledAt).toLocaleString()}.`,
            fecha: new Date().toISOString(),
          });
          localStorage.setItem('mentorias_notificaciones_mentor', JSON.stringify(notifs));
        }
      }
    }
  }

  return NextResponse.json({ received: true })
}
