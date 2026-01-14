import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * Sprint 24: Upsell Tracking API
 * 
 * Endpoint: POST /api/checkout/track-upsell
 * 
 * Purpose: Track cuando un usuario acepta o rechaza el upsell
 * de 1 mes de Mentoría (+$25) en el modal post-pago.
 * 
 * Métricas registradas:
 * - Acceptance rate (target: 25%)
 * - Time to decision
 * - Posición en funnel
 * - Impacto en AOV final
 * 
 * Usado para:
 * - Optimización del modal timing
 * - Cálculo de AOV máximo
 * - Revenue maximization
 */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

interface UpsellEvent {
  sessionId: string
  email?: string
  accepted: boolean
  timeSpent?: number // ms desde que vio el upsell
  hadOrderBump?: boolean // Si también aceptó el order bump
  variant?: string
  metadata?: Record<string, any>
}

export async function POST(request: NextRequest) {
  try {
    const body: UpsellEvent = await request.json()
    const { 
      sessionId, 
      email, 
      accepted, 
      timeSpent, 
      hadOrderBump = false,
      variant,
      metadata 
    } = body

    // Validation
    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      )
    }

    // Save to database
    const { data, error } = await supabase
      .from('funnel_events')
      .insert({
        event_type: 'upsell_decision',
        session_id: sessionId,
        email: email || null,
        data: {
          accepted,
          product_id: 'mentorship-month',
          product_name: '1 Mes de Mentoría Profesional',
          price: 25,
          time_spent_ms: timeSpent,
          had_order_bump: hadOrderBump,
          variant: variant || 'default',
          timestamp: new Date().toISOString(),
          ...metadata
        },
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('[Upsell Tracking] Database error:', error)
      return NextResponse.json(
        { error: 'Failed to track event' },
        { status: 500 }
      )
    }

    // Calculate real-time acceptance rate (last 100 events)
    const { data: recentEvents, error: statsError } = await supabase
      .from('funnel_events')
      .select('data')
      .eq('event_type', 'upsell_decision')
      .order('created_at', { ascending: false })
      .limit(100)

    let acceptanceRate = 0
    if (!statsError && recentEvents) {
      const accepted = recentEvents.filter((e: any) => e.data.accepted).length
      acceptanceRate = (accepted / recentEvents.length) * 100
    }

    console.log('[Upsell Tracking] Event recorded:', {
      sessionId,
      accepted,
      hadOrderBump,
      acceptanceRate: `${acceptanceRate.toFixed(1)}%`,
      target: '25%'
    })

    return NextResponse.json({
      success: true,
      event: data,
      stats: {
        acceptanceRate: Math.round(acceptanceRate * 10) / 10,
        target: 25,
        performance: acceptanceRate >= 25 ? 'on-target' : 'below-target'
      }
    })
  } catch (error) {
    console.error('[Upsell Tracking] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET: Obtener estadísticas del upsell
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')

    const dateThreshold = new Date()
    dateThreshold.setDate(dateThreshold.getDate() - days)

    const { data: events, error } = await supabase
      .from('funnel_events')
      .select('data, created_at')
      .eq('event_type', 'upsell_decision')
      .gte('created_at', dateThreshold.toISOString())

    if (error) {
      throw error
    }

    const total = events?.length || 0
    const accepted = events?.filter((e: any) => e.data.accepted).length || 0
    const acceptanceRate = total > 0 ? (accepted / total) * 100 : 0

    // Breakdown by order bump status
    const withBump = events?.filter((e: any) => e.data.had_order_bump) || []
    const withoutBump = events?.filter((e: any) => !e.data.had_order_bump) || []
    
    const acceptedWithBump = withBump.filter((e: any) => e.data.accepted).length
    const acceptedWithoutBump = withoutBump.filter((e: any) => e.data.accepted).length

    // AOV calculations
    const baseAOV = 10
    const withBumpAOV = 17 // $10 + $7
    const maxAOV = 42 // $10 + $7 + $25
    
    const avgAOV = baseAOV + 
      (accepted / total) * 25 + 
      (events?.filter((e: any) => e.data.had_order_bump).length / total) * 7

    // Revenue impact
    const revenueFromUpsell = accepted * 25

    return NextResponse.json({
      period: `${days} days`,
      total,
      accepted,
      rejected: total - accepted,
      acceptanceRate: Math.round(acceptanceRate * 10) / 10,
      target: 25,
      performance: acceptanceRate >= 25 ? 'on-target' : 'below-target',
      breakdown: {
        withOrderBump: {
          total: withBump.length,
          accepted: acceptedWithBump,
          rate: withBump.length > 0 ? Math.round((acceptedWithBump / withBump.length) * 1000) / 10 : 0
        },
        withoutOrderBump: {
          total: withoutBump.length,
          accepted: acceptedWithoutBump,
          rate: withoutBump.length > 0 ? Math.round((acceptedWithoutBump / withoutBump.length) * 1000) / 10 : 0
        }
      },
      aov: {
        base: baseAOV,
        withBump: withBumpAOV,
        max: maxAOV,
        actual: Math.round(avgAOV * 100) / 100,
        lift: `${Math.round(((avgAOV - baseAOV) / baseAOV) * 100)}%`
      },
      revenue: {
        fromUpsell: revenueFromUpsell,
        potential: total * 25,
        captureRate: `${Math.round((revenueFromUpsell / (total * 25)) * 100)}%`
      }
    })
  } catch (error) {
    console.error('[Upsell Stats] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
