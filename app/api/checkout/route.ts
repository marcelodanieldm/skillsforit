import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { db } from '@/lib/database'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Support both old format (analysisId) and new format (cvId + includeEbook)
    const analysisId = body.analysisId || body.cvId
    const includeEbook = body.includeEbook || false

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

    // Create line items for Stripe
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Auditoría de CV con IA',
            description: 'Análisis profesional con GPT-4, score ATS, y 15+ mejoras específicas',
          },
          unit_amount: 700, // $7.00 in cents
        },
        quantity: 1,
      },
    ]

    // Add E-book if selected
    if (includeEbook) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'E-book: "CV Perfecto para IT"',
            description: '50+ plantillas, keywords ATS, y estrategias de networking',
          },
          unit_amount: 500, // $5.00 in cents (normally $8, special offer)
        },
        quantity: 1,
      })
    }

    // Create Stripe checkout session
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}&ebook=${includeEbook}`,
      cancel_url: `${appUrl}/cart?cvId=${analysisId}`,
      customer_email: analysis.email,
      metadata: {
        analysisId: analysis.id,
        type: 'cv_analysis',
        includeEbook: includeEbook ? 'true' : 'false',
        email: analysis.email,
        name: analysis.name,
        country: analysis.country,
        profession: analysis.profession,
      },
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
