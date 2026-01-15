import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import Stripe from 'stripe'
import { sessionsDb, mentorsDb } from '@/lib/database'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-12-15.clover'
  })
}

export async function POST(request: NextRequest) {
  const stripe = getStripe()
  
  try {
    const body = await request.json()
    const { mentorId, menteeEmail, menteeName, scheduledAt, duration, amount } = body

    if (!mentorId || !menteeEmail || !menteeName || !scheduledAt || !amount) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    // Verify mentor exists
    const mentor = mentorsDb.findById(mentorId)
    if (!mentor) {
      return NextResponse.json(
        { error: 'Mentor no encontrado' },
        { status: 404 }
      )
    }

    // Create session record
    const sessionId = uuidv4()
    const session = sessionsDb.create({
      id: sessionId,
      mentorId,
      menteeEmail,
      menteeName,
      scheduledAt: new Date(scheduledAt),
      duration: duration || 10,
      status: 'scheduled',
      meetingLink: `https://meet.google.com/${uuidv4().substring(0, 10)}`, // Mock meeting link
      paymentStatus: 'pending'
    })

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Sesión de Mentoría con ${mentor.name}`,
              description: `${duration} minutos - ${new Date(scheduledAt).toLocaleString('es')}`,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/mentors/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/mentors/book?mentorId=${mentorId}`,
      customer_email: menteeEmail,
      metadata: {
        sessionId,
        mentorId,
        menteeEmail,
        menteeName,
        type: 'mentorship'
      }
    })

    // Update session with Stripe session ID
    sessionsDb.update(sessionId, {
      stripeSessionId: checkoutSession.id
    })

    return NextResponse.json({
      success: true,
      sessionId,
      checkoutUrl: checkoutSession.url,
      message: 'Sesión creada exitosamente'
    })
  } catch (error: any) {
    console.error('Error booking session:', error)
    return NextResponse.json(
      { error: 'Error al reservar sesión: ' + error.message },
      { status: 500 }
    )
  }
}
