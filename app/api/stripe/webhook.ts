import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { usersDb } from '@/lib/database';
import { mentorshipSubscriptionsDb } from '@/lib/mentorship_subscriptions';
import { mentorsDb, sessionsDb } from '@/lib/database';
import { sendEmail } from '@/lib/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-12-15.clover' });

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature')!;
  const rawBody = await req.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return NextResponse.json({ error: 'Webhook signature verification failed.' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const email = session.customer_email!;
    const plan = session.metadata?.plan as 'aceleracion' | 'transformacion';
    const sessionsTotal = plan === 'aceleracion' ? 4 : 8;
    let user = usersDb.findByEmail(email);
    let tempPassword: string | undefined = undefined;
    if (!user) {
      tempPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-2);
      user = usersDb.create({
        id: session.id,
        name: email.split('@')[0],
        email,
        password: tempPassword,
        role: 'mentee',
        createdAt: new Date(),
      });
    }
    // Asignar mentor con menos sesiones activas
    const allMentors = mentorsDb.findAll();
    let mentorId = allMentors[0]?.id;
    let minActive = Number.MAX_SAFE_INTEGER;
    for (const mentor of allMentors) {
      const activeSessions = sessionsDb.findByMentor(mentor.id, 'scheduled').length;
      if (activeSessions < minActive) {
        minActive = activeSessions;
        mentorId = mentor.id;
      }
    }
    mentorshipSubscriptionsDb.create({
      id: session.id,
      userId: user.id,
      email,
      plan,
      sessionsTotal,
      sessionsUsed: 0,
      startDate: new Date(),
      endDate: new Date(Date.now() + (plan === 'aceleracion' ? 30 : 60) * 24 * 60 * 60 * 1000),
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      mentorId,
    });
    // Enviar email de onboarding
    await sendEmail({
      to: email,
      subject: '¡Bienvenido a SkillsForIT Mentorías!',
      html: `<h1>¡Mentoría confirmada!</h1><p>Accede a tu dashboard con:<br><b>Usuario:</b> ${email}<br><b>Contraseña temporal:</b> ${tempPassword || 'La que elegiste al registrarte'}</p><p>Reserva tus sesiones desde el panel.</p>`,
    });
  }

  return NextResponse.json({ received: true });
}
