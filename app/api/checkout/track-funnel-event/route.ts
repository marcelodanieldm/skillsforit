import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * Sprint 24: Funnel Analytics API
 * 
 * Endpoint: POST /api/checkout/track-funnel-event
 * 
 * Purpose: Track todos los eventos del funnel de conversión
 * para análisis y optimización.
 * 
 * Eventos rastreados:
 * - landing_view: Usuario llegó a la landing page
 * - diagnostic_started: Comenzó el mini-diagnóstico
 * - diagnostic_completed: Completó el mini-diagnóstico
 * - checkout_started: Inició el checkout
 * - order_bump_viewed: Vio el order bump
 * - payment_started: Comenzó el proceso de pago
 * - upsell_viewed: Vio el modal de upsell
 * - purchase_completed: Completó la compra
 */

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  )
}

interface FunnelEvent {
  eventType: string
  sessionId: string
  email?: string
  metadata?: Record<string, any>
}

export async function POST(request: NextRequest) {
  const supabase = getSupabase()
  
  try {
    const body: FunnelEvent = await request.json()
    const { eventType, sessionId, email, metadata } = body

    // Validation
    if (!eventType || !sessionId) {
      return NextResponse.json(
        { error: 'eventType and sessionId are required' },
        { status: 400 }
      )
    }

    // Save event
    const { data, error } = await supabase
      .from('funnel_events')
      .insert({
        event_type: eventType,
        session_id: sessionId,
        email: email || null,
        data: {
          timestamp: new Date().toISOString(),
          userAgent: request.headers.get('user-agent'),
          referer: request.headers.get('referer'),
          ...metadata
        },
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('[Funnel Tracking] Database error:', error)
      return NextResponse.json(
        { error: 'Failed to track event' },
        { status: 500 }
      )
    }

    console.log('[Funnel Tracking] Event recorded:', {
      eventType,
      sessionId,
      email: email || 'anonymous'
    })

    return NextResponse.json({
      success: true,
      event: data
    })
  } catch (error) {
    console.error('[Funnel Tracking] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET: Obtener estadísticas del funnel completo
export async function GET(request: NextRequest) {
  const supabase = getSupabase()
  
  try {
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')

    const dateThreshold = new Date()
    dateThreshold.setDate(dateThreshold.getDate() - days)

    const { data: events, error } = await supabase
      .from('funnel_events')
      .select('event_type, session_id, created_at')
      .gte('created_at', dateThreshold.toISOString())

    if (error) {
      throw error
    }

    // Group by session to calculate conversion rates
    const sessions = new Map<string, Set<string>>()
    events?.forEach((event: any) => {
      if (!sessions.has(event.session_id)) {
        sessions.set(event.session_id, new Set())
      }
      sessions.get(event.session_id)!.add(event.event_type)
    })

    // Calculate funnel metrics
    const metrics = {
      totalSessions: sessions.size,
      landingViews: 0,
      diagnosticStarts: 0,
      diagnosticCompletions: 0,
      checkoutStarts: 0,
      orderBumpViews: 0,
      paymentStarts: 0,
      upsellViews: 0,
      purchases: 0
    }

    sessions.forEach((eventSet) => {
      if (eventSet.has('landing_view')) metrics.landingViews++
      if (eventSet.has('diagnostic_started')) metrics.diagnosticStarts++
      if (eventSet.has('diagnostic_completed')) metrics.diagnosticCompletions++
      if (eventSet.has('checkout_started')) metrics.checkoutStarts++
      if (eventSet.has('order_bump_viewed')) metrics.orderBumpViews++
      if (eventSet.has('payment_started')) metrics.paymentStarts++
      if (eventSet.has('upsell_viewed')) metrics.upsellViews++
      if (eventSet.has('purchase_completed')) metrics.purchases++
    })

    // Calculate conversion rates
    const conversionRates = {
      landingToCheckout: metrics.landingViews > 0 
        ? (metrics.checkoutStarts / metrics.landingViews) * 100 
        : 0,
      diagnosticCompletion: metrics.diagnosticStarts > 0
        ? (metrics.diagnosticCompletions / metrics.diagnosticStarts) * 100
        : 0,
      checkoutToPayment: metrics.checkoutStarts > 0
        ? (metrics.paymentStarts / metrics.checkoutStarts) * 100
        : 0,
      paymentToPurchase: metrics.paymentStarts > 0
        ? (metrics.purchases / metrics.paymentStarts) * 100
        : 0,
      overallConversion: metrics.landingViews > 0
        ? (metrics.purchases / metrics.landingViews) * 100
        : 0
    }

    return NextResponse.json({
      period: `${days} days`,
      metrics,
      conversionRates: Object.fromEntries(
        Object.entries(conversionRates).map(([key, value]) => [
          key,
          `${Math.round(value * 10) / 10}%`
        ])
      ),
      dropOffPoints: [
        {
          stage: 'Landing → Checkout',
          dropOffRate: `${Math.round((100 - conversionRates.landingToCheckout) * 10) / 10}%`,
          potential: metrics.landingViews - metrics.checkoutStarts
        },
        {
          stage: 'Checkout → Payment',
          dropOffRate: `${Math.round((100 - conversionRates.checkoutToPayment) * 10) / 10}%`,
          potential: metrics.checkoutStarts - metrics.paymentStarts
        },
        {
          stage: 'Payment → Purchase',
          dropOffRate: `${Math.round((100 - conversionRates.paymentToPurchase) * 10) / 10}%`,
          potential: metrics.paymentStarts - metrics.purchases
        }
      ]
    })
  } catch (error) {
    console.error('[Funnel Analytics] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
