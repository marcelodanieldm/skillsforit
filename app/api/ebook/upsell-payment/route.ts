import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '')
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, basePaymentIntentId, mentorshipPrice } = body

    // Validation
    if (!email || !basePaymentIntentId || !mentorshipPrice) {
      return NextResponse.json(
        { error: 'Email, base payment intent ID, and mentorship price are required' },
        { status: 400 }
      )
    }

    // Verify the base payment was successful
    const basePayment = await stripe.paymentIntents.retrieve(basePaymentIntentId)
    if (basePayment.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Base payment not completed successfully' },
        { status: 400 }
      )
    }

    // Create new payment intent for mentorship
    const paymentIntent = await stripe.paymentIntents.create({
      amount: mentorshipPrice * 100, // Convert to cents
      currency: 'usd',
      receipt_email: email,
      metadata: {
        email,
        product: 'mentorship_upsell',
        base_payment_intent_id: basePaymentIntentId,
        mentorship_price: String(mentorshipPrice)
      },
      description: 'SkillsForIT - Mentorship Upsell (1 Month - 4 Sessions)'
    })

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    })
  } catch (error: any) {
    console.error('[UpsellPayment] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create mentorship payment' },
      { status: 500 }
    )
  }
}