import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
})

export async function POST(req: Request) {
  const { amount, productType, metadata } = await req.json()

  // Puedes personalizar la lógica según el tipo de producto
  if (productType !== 'mentoria') {
    return NextResponse.json({ error: 'Tipo de producto inválido' }, { status: 400 })
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: {
        ...metadata,
        productType: 'mentoria',
      },
      description: 'Pago de sesión de mentoría',
    })
    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
