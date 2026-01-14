import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
})

// Catálogo de productos
const PRODUCTS = {
  'soft-skills-guide': {
    name: '📚 Guía Completa de Soft Skills',
    price: 10_00, // $10.00 en centavos
    description: '120 páginas de estrategias prácticas para dominar entrevistas técnicas'
  },
  'cv-audit': {
    name: '✅ Auditoría Profesional de CV',
    price: 7_00, // $7.00 en centavos
    description: 'Revisión experta de tu CV con sugerencias personalizadas'
  },
  'mentoring-session': {
    name: '🎯 Sesión de Mentoría 1:1',
    price: 15_00, // $15.00 en centavos
    description: '30 minutos con experto + simulacro de entrevista'
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, source, issue, items } = body

    if (!email || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Email y items son requeridos' },
        { status: 400 }
      )
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('[Checkout] STRIPE_SECRET_KEY not configured')
      return NextResponse.json(
        { error: 'Stripe no está configurado. Contacta al administrador.' },
        { status: 500 }
      )
    }

    // Construir line items para Stripe
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item: any) => {
      const product = PRODUCTS[item.productId as keyof typeof PRODUCTS]
      
      if (!product) {
        throw new Error(`Producto no encontrado: ${item.productId}`)
      }

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            description: product.description
          },
          unit_amount: product.price
        },
        quantity: item.quantity || 1
      }
    })

    // Crear sesión de Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/soft-skills-guide?email=${encodeURIComponent(email)}&source=${source}`,
      customer_email: email,
      metadata: {
        email,
        source: source || 'audio-feedback',
        issue: issue || 'Soft Skills',
        timestamp: new Date().toISOString()
      }
    })

    console.log('[Checkout] Session created:', {
      sessionId: session.id,
      email,
      items: items.map((i: any) => i.productId),
      total: session.amount_total
    })

    return NextResponse.json({
      sessionId: session.id,
      url: session.url
    })
  } catch (error: any) {
    console.error('[Checkout] Error creating session:', error)
    return NextResponse.json(
      { error: error.message || 'Error al crear la sesión de pago' },
      { status: 500 }
    )
  }
}
