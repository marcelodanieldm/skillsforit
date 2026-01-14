import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * CEO Dashboard - Audio Feedback Metrics API
 * 
 * Sprint 39: Métricas de lead generation y conversión
 * 
 * GET /api/ceo/audio-feedback-metrics
 * 
 * Retorna:
 * - Lead Capture Rate (% que completan formulario)
 * - Experience Distribution (Junior/Mid/Senior/Staff)
 * - Optional Conversion (% que compran E-book)
 * - Avg Tone Score por nivel
 * - Avg Filler Words por nivel
 * - Top countries
 * - Top roles
 */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const period = searchParams.get('period') || '7d' // 7d, 30d, 90d

    // Calcular fecha de inicio según período
    const now = new Date()
    const startDate = new Date()
    if (period === '7d') startDate.setDate(now.getDate() - 7)
    else if (period === '30d') startDate.setDate(now.getDate() - 30)
    else if (period === '90d') startDate.setDate(now.getDate() - 90)

    // 1. Lead Capture Rate
    // (leads con audio_feedback_completed / total sessions iniciadas)
    const { data: completedLeads, count: completedCount } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('audio_feedback_completed', true)
      .gte('audio_feedback_completed_at', startDate.toISOString())

    // Total sessions (incluye completadas + abandonadas)
    // Asumimos que hay un evento 'audio_simulation_started' en funnel_events
    const { count: totalSessions } = await supabase
      .from('funnel_events')
      .select('*', { count: 'exact', head: true })
      .eq('event', 'audio_simulation_started')
      .gte('created_at', startDate.toISOString())

    const leadCaptureRate = totalSessions ? ((completedCount || 0) / totalSessions) * 100 : 0

    // 2. Experience Distribution
    const { data: experienceDist } = await supabase
      .from('leads')
      .select('experience_level')
      .eq('audio_feedback_completed', true)
      .gte('audio_feedback_completed_at', startDate.toISOString())

    const expDistribution = {
      Junior: 0,
      Mid: 0,
      Senior: 0,
      Staff: 0
    }

    experienceDist?.forEach((lead: any) => {
      if (lead.experience_level in expDistribution) {
        expDistribution[lead.experience_level as keyof typeof expDistribution]++
      }
    })

    // 3. Optional Conversion (E-book purchases from audio feedback source)
    const { count: ebookPurchases } = await supabase
      .from('purchases')
      .select('*', { count: 'exact', head: true })
      .eq('product_id', 'soft-skills-guide')
      .eq('source', 'audio-feedback')
      .gte('created_at', startDate.toISOString())

    const optionalConversion = completedCount ? ((ebookPurchases || 0) / completedCount) * 100 : 0

    // 4. Avg metrics por nivel
    const { data: analyses } = await supabase
      .from('audio_feedback_analyses')
      .select('*')
      .gte('created_at', startDate.toISOString())

    const metricsByLevel: Record<string, { toneSum: number; fillerSum: number; count: number }> = {
      Junior: { toneSum: 0, fillerSum: 0, count: 0 },
      Mid: { toneSum: 0, fillerSum: 0, count: 0 },
      Senior: { toneSum: 0, fillerSum: 0, count: 0 },
      Staff: { toneSum: 0, fillerSum: 0, count: 0 }
    }

    analyses?.forEach((analysis: any) => {
      const level = analysis.experience_level
      if (level in metricsByLevel) {
        metricsByLevel[level].toneSum += analysis.tone_score
        metricsByLevel[level].fillerSum += analysis.filler_words_count
        metricsByLevel[level].count++
      }
    })

    const avgMetricsByLevel = Object.entries(metricsByLevel).map(([level, data]) => ({
      level,
      avgTone: data.count > 0 ? Math.round(data.toneSum / data.count) : 0,
      avgFillerWords: data.count > 0 ? Math.round(data.fillerSum / data.count) : 0,
      count: data.count
    }))

    // 5. Top Countries
    const { data: countries } = await supabase
      .from('leads')
      .select('country')
      .eq('audio_feedback_completed', true)
      .gte('audio_feedback_completed_at', startDate.toISOString())

    const countryCount: Record<string, number> = {}
    countries?.forEach((lead: any) => {
      countryCount[lead.country] = (countryCount[lead.country] || 0) + 1
    })

    const topCountries = Object.entries(countryCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([country, count]) => ({ country, count }))

    // 6. Top Roles
    const { data: roles } = await supabase
      .from('leads')
      .select('role')
      .eq('audio_feedback_completed', true)
      .gte('audio_feedback_completed_at', startDate.toISOString())

    const roleCount: Record<string, number> = {}
    roles?.forEach((lead: any) => {
      roleCount[lead.role] = (roleCount[lead.role] || 0) + 1
    })

    const topRoles = Object.entries(roleCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([role, count]) => ({ role, count }))

    // 7. Trend data (últimos 7 días)
    const trendDays = 7
    const trendData = []

    for (let i = trendDays - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const { count: dailyCompleted } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('audio_feedback_completed', true)
        .gte('audio_feedback_completed_at', date.toISOString())
        .lt('audio_feedback_completed_at', nextDate.toISOString())

      const { count: dailyPurchases } = await supabase
        .from('purchases')
        .select('*', { count: 'exact', head: true })
        .eq('product_id', 'soft-skills-guide')
        .eq('source', 'audio-feedback')
        .gte('created_at', date.toISOString())
        .lt('created_at', nextDate.toISOString())

      trendData.push({
        date: date.toISOString().split('T')[0],
        leadsGenerated: dailyCompleted || 0,
        conversions: dailyPurchases || 0
      })
    }

    // 8. Retornar todo
    return NextResponse.json({
      period,
      overview: {
        totalLeads: completedCount || 0,
        leadCaptureRate: Math.round(leadCaptureRate),
        targetCaptureRate: 60,
        optionalConversion: Math.round(optionalConversion * 10) / 10,
        targetOptionalConversion: 7,
        totalSessions: totalSessions || 0,
        ebookPurchases: ebookPurchases || 0
      },
      experienceDistribution: expDistribution,
      avgMetricsByLevel,
      topCountries,
      topRoles,
      trendData,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('[Audio Feedback Metrics API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
