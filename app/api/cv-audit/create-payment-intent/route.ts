import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-12-15.clover'
  })
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  )
}

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe()
    const supabase = getSupabase()
    const body = await request.json()
    const { email, analysisId } = body

    // Validation
    if (!email || !analysisId) {
      return NextResponse.json(
        { error: 'Email and analysis ID are required' },
        { status: 400 }
      )
    }

    // Verify analysis exists and belongs to user
    const { data: analysis, error: analysisError } = await supabase
      .from('cv_analyses')
      .select('id, email, status')
      .eq('id', analysisId)
      .eq('email', email)
      .single()

    if (analysisError || !analysis) {
      return NextResponse.json(
        { error: 'Analysis not found or access denied' },
        { status: 404 }
      )
    }

    if (analysis.status === 'paid') {
      return NextResponse.json(
        { error: 'Analysis already paid for' },
        { status: 400 }
      )
    }

    const amount = 7 * 100 // $7 in cents

    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      receipt_email: email,
      metadata: {
        email,
        product: 'cv_audit_full',
        analysis_id: analysisId,
        amount: String(amount)
      },
      description: 'SkillsForIT - CV Audit Full Report'
    })

    // Save payment record
    const { data: payment, error: paymentError } = await supabase
      .from('cv_audit_payments')
      .insert({
        analysis_id: analysisId,
        email,
        stripe_payment_intent_id: paymentIntent.id,
        amount: 7,
        currency: 'usd',
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (paymentError) {
      console.error('[CVAuditPaymentIntent] Error saving payment:', paymentError)
      // Continue anyway - Stripe payment is more critical
    }

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentId: payment?.id
    })
  } catch (error: any) {
    console.error('[CVAuditPaymentIntent] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}