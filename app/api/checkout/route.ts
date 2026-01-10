import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSession } from '@/lib/stripe'
import { db } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const { analysisId } = await request.json()

    if (!analysisId) {
      return NextResponse.json(
        { error: 'Analysis ID es requerido' },
        { status: 400 }
      )
    }

    // Get analysis from database
    const analysis = db.findById(analysisId)

    if (!analysis) {
      return NextResponse.json(
        { error: 'Análisis no encontrado' },
        { status: 404 }
      )
    }

    // Create Stripe checkout session
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const session = await createCheckoutSession({
      email: analysis.email,
      analysisId: analysis.id,
      successUrl: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${appUrl}/checkout?id=${analysisId}&canceled=true`,
    })

    // Update analysis with Stripe session ID
    db.update(analysisId, {
      stripeSessionId: session.id,
    })

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Error al crear sesión de pago', details: error.message },
      { status: 500 }
    )
  }
}
