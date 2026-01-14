/**
 * Sprint 37: CEO Dashboard - Soft Skills Metrics API
 * 
 * Métricas del simulador de soft skills para el tablero de comando
 */

import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'

// In-memory storage para métricas (mover a DB en producción)
interface SoftSkillsMetrics {
  totalSessions: number
  completedSessions: number
  convertedLeads: number
  avgResponseDepth: number
  redFlagDetectionRate: number
  ebookConversions: number
  cvAuditConversions: number
  mentorshipConversions: number
  dailyStats: Array<{
    date: string
    sessions: number
    completions: number
    conversions: number
  }>
}

// Mock metrics data
const mockMetrics: SoftSkillsMetrics = {
  totalSessions: 847,
  completedSessions: 623,
  convertedLeads: 89,
  avgResponseDepth: 112,
  redFlagDetectionRate: 64.2,
  ebookConversions: 47,
  cvAuditConversions: 28,
  mentorshipConversions: 14,
  dailyStats: [
    { date: '2026-01-07', sessions: 45, completions: 32, conversions: 5 },
    { date: '2026-01-08', sessions: 52, completions: 41, conversions: 7 },
    { date: '2026-01-09', sessions: 61, completions: 48, conversions: 8 },
    { date: '2026-01-10', sessions: 58, completions: 44, conversions: 6 },
    { date: '2026-01-11', sessions: 72, completions: 55, conversions: 9 },
    { date: '2026-01-12', sessions: 89, completions: 68, conversions: 12 },
    { date: '2026-01-13', sessions: 95, completions: 71, conversions: 14 }
  ]
}

export async function GET(request: NextRequest) {
  // Verify CEO authentication
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.split(' ')[1]

  if (token) {
    const auth = await AuthService.requireRole(token, ['admin', 'ceo'])
    if (!auth.authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const { searchParams } = new URL(request.url)
  const period = searchParams.get('period') || '7d'

  // Calculate KPIs
  const completionRate = (mockMetrics.completedSessions / mockMetrics.totalSessions * 100).toFixed(1)
  const leadConversionRate = (mockMetrics.convertedLeads / mockMetrics.completedSessions * 100).toFixed(1)
  const totalUpsellRevenue = (
    mockMetrics.ebookConversions * 10 + 
    mockMetrics.cvAuditConversions * 7 + 
    mockMetrics.mentorshipConversions * 15
  )

  // Build response with CEO metrics format
  const response = {
    success: true,
    period,
    metrics: {
      // Core funnel metrics
      funnel: {
        totalSessions: mockMetrics.totalSessions,
        completedSessions: mockMetrics.completedSessions,
        completionRate: parseFloat(completionRate),
        convertedLeads: mockMetrics.convertedLeads,
        leadConversionRate: parseFloat(leadConversionRate),
        target: {
          completionRate: 75,
          leadConversionRate: 12
        }
      },
      
      // Engagement metrics
      engagement: {
        avgResponseDepth: mockMetrics.avgResponseDepth,
        responseDepthTarget: 100,
        responseDepthStatus: mockMetrics.avgResponseDepth >= 100 ? 'on-target' : 'below-target',
        redFlagDetectionRate: mockMetrics.redFlagDetectionRate,
        redFlagTarget: 60
      },

      // Revenue metrics
      revenue: {
        ebookConversions: mockMetrics.ebookConversions,
        ebookRevenue: mockMetrics.ebookConversions * 10,
        cvAuditConversions: mockMetrics.cvAuditConversions,
        cvAuditRevenue: mockMetrics.cvAuditConversions * 7,
        mentorshipConversions: mockMetrics.mentorshipConversions,
        mentorshipRevenue: mockMetrics.mentorshipConversions * 15,
        totalUpsellRevenue,
        avgRevenuePerLead: (totalUpsellRevenue / mockMetrics.convertedLeads).toFixed(2)
      },

      // Conversion funnel breakdown
      conversionFunnel: {
        step1_started: mockMetrics.totalSessions,
        step2_completed: mockMetrics.completedSessions,
        step3_registered: mockMetrics.convertedLeads,
        step4_purchased: mockMetrics.ebookConversions + mockMetrics.cvAuditConversions,
        dropoffRates: {
          startToComplete: ((1 - mockMetrics.completedSessions / mockMetrics.totalSessions) * 100).toFixed(1),
          completeToRegister: ((1 - mockMetrics.convertedLeads / mockMetrics.completedSessions) * 100).toFixed(1),
          registerToPurchase: ((1 - (mockMetrics.ebookConversions + mockMetrics.cvAuditConversions) / mockMetrics.convertedLeads) * 100).toFixed(1)
        }
      },

      // Daily trends for charts
      dailyTrends: mockMetrics.dailyStats,

      // Top insights
      insights: [
        {
          type: mockMetrics.avgResponseDepth >= 100 ? 'positive' : 'warning',
          message: mockMetrics.avgResponseDepth >= 100 
            ? `Response depth (${mockMetrics.avgResponseDepth} words) indica alto engagement`
            : `Response depth (${mockMetrics.avgResponseDepth} words) por debajo del target de 100`
        },
        {
          type: parseFloat(leadConversionRate) >= 12 ? 'positive' : 'info',
          message: parseFloat(leadConversionRate) >= 12
            ? `Lead conversion rate (${leadConversionRate}%) supera el target del 12%`
            : `Oportunidad: Lead conversion (${leadConversionRate}%) puede mejorar`
        },
        {
          type: 'positive',
          message: `El simulador genera $${totalUpsellRevenue} en upsells ($${(totalUpsellRevenue / mockMetrics.convertedLeads).toFixed(2)}/lead)`
        }
      ]
    },
    
    // CEO Dashboard specific format
    dashboardCards: [
      {
        title: 'Sesiones Simulador',
        value: mockMetrics.totalSessions,
        change: '+18%',
        changeType: 'positive',
        period: 'vs semana anterior'
      },
      {
        title: 'Completion Rate',
        value: `${completionRate}%`,
        target: '75%',
        status: parseFloat(completionRate) >= 75 ? 'on-target' : 'below-target'
      },
      {
        title: 'Lead Conversion',
        value: `${leadConversionRate}%`,
        target: '12%',
        status: parseFloat(leadConversionRate) >= 12 ? 'on-target' : 'below-target'
      },
      {
        title: 'Revenue Upsells',
        value: `$${totalUpsellRevenue}`,
        change: '+24%',
        changeType: 'positive'
      }
    ]
  }

  return NextResponse.json(response)
}

// POST endpoint for tracking events
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event, sessionId, data } = body

    // Track events (in production, save to analytics DB)
    console.log('Soft Skills Event:', { event, sessionId, data, timestamp: new Date() })

    // Valid events
    const validEvents = [
      'simulation_started',
      'question_answered',
      'simulation_completed',
      'email_submitted',
      'ebook_clicked',
      'cv_audit_clicked',
      'mentorship_clicked',
      'purchase_completed'
    ]

    if (!validEvents.includes(event)) {
      return NextResponse.json(
        { error: 'Invalid event type' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      event,
      tracked: true,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error tracking event:', error)
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    )
  }
}
