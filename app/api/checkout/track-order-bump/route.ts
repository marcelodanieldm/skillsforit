import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * Sprint 24: Order Bump Tracking API
 * 
 * Endpoint: POST /api/checkout/track-order-bump
 * 
 * Purpose: Track cuando un usuario acepta o rechaza el order bump
 * de Auditoría de CV (+$7) durante el checkout.
 * 
 * Métricas registradas:
 * - Acceptance rate (target: 40%)
 * - Time to decision
 * - Session context
 * - A/B test variants
 * 
 * Usado para:
 * - Optimización de copy
 * - Cálculo de AOV
 * - Revenue forecasting
 */

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  )
}

interface OrderBumpEvent {
  sessionId: string
  email?: string
  accepted: boolean
  timeSpent?: number // ms desde que vio el order bump
  variant?: string // Para A/B testing
  metadata?: Record<string, any>
}

export async function POST(request: NextRequest) {
  const supabase = getSupabase()
  
  try {
    const body: OrderBumpEvent = await request.json()
    const { sessionId, email, accepted, timeSpent, variant, metadata } = body

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
        event_type: 'order_bump_decision',
        session_id: sessionId,
        email: email || null,
        data: {
          accepted,
          product_id: 'cv-audit-ai',
          product_name: 'Auditoría de CV con IA',
          price: 7,
          time_spent_ms: timeSpent,
          variant: variant || 'default',
          timestamp: new Date().toISOString(),
          ...metadata
        },
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('[Order Bump Tracking] Database error:', error)
      return NextResponse.json(
        { error: 'Failed to track event' },
        { status: 500 }
      )
    }

    // Calculate real-time acceptance rate (last 100 events)
    const { data: recentEvents, error: statsError } = await supabase
      .from('funnel_events')
      .select('data')
      .eq('event_type', 'order_bump_decision')
      .order('created_at', { ascending: false })
      .limit(100)

    let acceptanceRate = 0
    if (!statsError && recentEvents) {
      const accepted = recentEvents.filter((e: any) => e.data.accepted).length
      acceptanceRate = (accepted / recentEvents.length) * 100
    }

    console.log('[Order Bump Tracking] Event recorded:', {
      sessionId,
      accepted,
      acceptanceRate: `${acceptanceRate.toFixed(1)}%`,
      target: '40%'
    })

    return NextResponse.json({
      success: true,
      event: data,
      stats: {
        acceptanceRate: Math.round(acceptanceRate * 10) / 10, // 1 decimal
        target: 40,
        performance: acceptanceRate >= 40 ? 'on-target' : 'below-target'
      }
    })
  } catch (error) {
    console.error('[Order Bump Tracking] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET: Obtener estadísticas del order bump
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')

    const dateThreshold = new Date()
    dateThreshold.setDate(dateThreshold.getDate() - days)

    const { data: events, error } = await supabase
      .from('funnel_events')
      .select('data, created_at')
      .eq('event_type', 'order_bump_decision')
      .gte('created_at', dateThreshold.toISOString())

    if (error) {
      throw error
    }

    const total = events?.length || 0
    const accepted = events?.filter((e: any) => e.data.accepted).length || 0
    const acceptanceRate = total > 0 ? (accepted / total) * 100 : 0

    // AOV impact
    const baseAOV = 10
    const avgAOV = baseAOV + (accepted / total) * 7
    const revenueImpact = accepted * 7

    // Time to decision stats
    const decisionsWithTime = events?.filter((e: any) => e.data.time_spent_ms) || []
    const avgTimeToDecision = decisionsWithTime.length > 0
      ? decisionsWithTime.reduce((sum: number, e: any) => sum + e.data.time_spent_ms, 0) / decisionsWithTime.length
      : 0

    return NextResponse.json({
      period: `${days} days`,
      total,
      accepted,
      rejected: total - accepted,
      acceptanceRate: Math.round(acceptanceRate * 10) / 10,
      target: 40,
      performance: acceptanceRate >= 40 ? 'on-target' : 'below-target',
      avgTimeToDecisionSeconds: Math.round(avgTimeToDecision / 1000),
      aov: {
        base: baseAOV,
        withBump: Math.round(avgAOV * 100) / 100,
        lift: `${Math.round(((avgAOV - baseAOV) / baseAOV) * 100)}%`
      },
      revenue: {
        fromBump: revenueImpact,
        potential: total * 7,
        captureRate: `${Math.round((revenueImpact / (total * 7)) * 100)}%`
      }
    })
  } catch (error) {
    console.error('[Order Bump Stats] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
