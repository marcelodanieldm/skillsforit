import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-12-15.clover'
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, includeCVAudit, amount } = body

    // Validation
    if (!email || !amount) {
      return NextResponse.json(
        { error: 'Email and amount are required' },
        { status: 400 }
      )
    }

    // Calculate final amount
    const basePrice = 27 // USD for e-book
    const cvAuditPrice = includeCVAudit ? 7 : 0
    const totalAmount = basePrice + cvAuditPrice

    // Verify amount matches calculation
    if (amount !== totalAmount * 100) {
      return NextResponse.json(
        { error: 'Amount mismatch' },
        { status: 400 }
      )
    }

    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      receipt_email: email,
      metadata: {
        email,
        product: 'ebook',
        includeCVAudit: String(includeCVAudit),
        basePrice: String(basePrice),
        cvAuditPrice: String(cvAuditPrice)
      },
      description: `SkillsForIT - E-book${includeCVAudit ? ' + CV Audit' : ''}`
    })

    // Save order to database
    const { data: order, error: orderError } = await supabase
      .from('ebook_orders')
      .insert({
        email,
        stripe_payment_intent_id: paymentIntent.id,
        amount: totalAmount,
        currency: 'usd',
        include_cv_audit: includeCVAudit,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (orderError) {
      console.error('[EbookPaymentIntent] Error saving order:', orderError)
      // Continue anyway - Stripe payment is more critical
    }

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      orderId: order?.id
    })
  } catch (error: any) {
    console.error('[EbookPaymentIntent] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}