import { NextRequest, NextResponse } from 'next/server'
import { trackEvent, getUserSegment } from '@/lib/analytics'
import { db, mentorshipDb } from '@/lib/database'

interface FunnelStage {
  stage: string
  users: number
  conversionRate: number
  dropOffRate: number
  averageTimeToNext?: number // days
}

interface FunnelData {
  stages: FunnelStage[]
  totalUsers: number
  overallConversion: number
  bottleneck: string
  insights: string[]
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = parseInt(searchParams.get('period') || '30') // days
    const segment = searchParams.get('segment') // Filter by user segment

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - period)

    // Get all events
    const allEvents = trackEvent('', '', '', '', '', true) as any[]

    // Filter by period
    const periodEvents = allEvents.filter(e => new Date(e.timestamp) >= startDate)

    // Filter by segment if specified
    const events = segment
      ? periodEvents.filter(e => e.userSegment === segment)
      : periodEvents

    // Define funnel stages
    const funnelStages = [
      'landing_view',      // 1. Landing page visit
      'cv_upload_start',   // 2. Started CV upload
      'cv_upload_complete',// 3. Completed CV upload
      'payment_initiated', // 4. Started checkout
      'payment_completed', // 5. Completed payment
      'analysis_viewed',   // 6. Viewed analysis results
      'mentorship_browse', // 7. Browsed mentors
      'mentorship_booked', // 8. Booked mentorship
      'mentorship_completed' // 9. Completed mentorship
    ]

    const stageDisplayNames: Record<string, string> = {
      'landing_view': 'Visita Inicial',
      'cv_upload_start': 'Inició Carga CV',
      'cv_upload_complete': 'Completó Carga CV',
      'payment_initiated': 'Inició Pago',
      'payment_completed': 'Pagó Análisis',
      'analysis_viewed': 'Vio Resultados',
      'mentorship_browse': 'Exploró Mentores',
      'mentorship_booked': 'Reservó Mentoría',
      'mentorship_completed': 'Completó Mentoría'
    }

    // Count unique users per stage
    const usersByStage = new Map<string, Set<string>>()

    for (const stage of funnelStages) {
      const usersInStage = new Set<string>()

      for (const event of events) {
        if (event.eventType === stage) {
          const userId = event.userId || event.email || event.sessionId
          usersInStage.add(userId)
        }
      }

      usersByStage.set(stage, usersInStage)
    }

    // Calculate conversion and drop-off rates
    const funnelData: FunnelStage[] = []
    const totalUsers = usersByStage.get(funnelStages[0])?.size || 1

    for (let i = 0; i < funnelStages.length; i++) {
      const stage = funnelStages[i]
      const users = usersByStage.get(stage)?.size || 0
      const conversionRate = totalUsers > 0 ? (users / totalUsers) * 100 : 0

      let dropOffRate = 0
      if (i > 0) {
        const previousUsers = usersByStage.get(funnelStages[i - 1])?.size || 0
        dropOffRate = previousUsers > 0 ? ((previousUsers - users) / previousUsers) * 100 : 0
      }

      // Calculate average time to next stage
      let averageTimeToNext: number | undefined

      if (i < funnelStages.length - 1) {
        const currentStageUsers = usersByStage.get(stage)
        const nextStage = funnelStages[i + 1]
        const nextStageUsers = usersByStage.get(nextStage)

        if (currentStageUsers && nextStageUsers) {
          const timeDifferences: number[] = []

          for (const userId of currentStageUsers) {
            if (nextStageUsers.has(userId)) {
              // Find time difference
              const currentEvent = events.find(e =>
                (e.userId || e.email || e.sessionId) === userId && e.eventType === stage
              )
              const nextEvent = events.find(e =>
                (e.userId || e.email || e.sessionId) === userId && e.eventType === nextStage
              )

              if (currentEvent && nextEvent) {
                const diffMs = new Date(nextEvent.timestamp).getTime() - new Date(currentEvent.timestamp).getTime()
                const diffDays = diffMs / (1000 * 60 * 60 * 24)
                timeDifferences.push(diffDays)
              }
            }
          }

          if (timeDifferences.length > 0) {
            averageTimeToNext = timeDifferences.reduce((a, b) => a + b, 0) / timeDifferences.length
          }
        }
      }

      funnelData.push({
        stage: stageDisplayNames[stage] || stage,
        users,
        conversionRate: Math.round(conversionRate * 100) / 100,
        dropOffRate: Math.round(dropOffRate * 100) / 100,
        averageTimeToNext: averageTimeToNext ? Math.round(averageTimeToNext * 10) / 10 : undefined
      })
    }

    // Find bottleneck (highest drop-off)
    const bottleneck = funnelData.reduce((max, stage) =>
      stage.dropOffRate > max.dropOffRate ? stage : max
    , funnelData[0])

    // Calculate overall conversion
    const lastStageUsers = funnelData[funnelData.length - 1].users
    const overallConversion = totalUsers > 0 ? (lastStageUsers / totalUsers) * 100 : 0

    // Generate insights
    const insights = generateFunnelInsights(funnelData, bottleneck, totalUsers)

    const result: FunnelData = {
      stages: funnelData,
      totalUsers,
      overallConversion: Math.round(overallConversion * 100) / 100,
      bottleneck: bottleneck.stage,
      insights
    }

    return NextResponse.json({
      success: true,
      data: result,
      metadata: {
        period,
        segment: segment || 'all',
        calculatedAt: new Date().toISOString()
      }
    })

  } catch (error: any) {
    console.error('Error calculating funnel:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

function generateFunnelInsights(
  stages: FunnelStage[],
  bottleneck: FunnelStage,
  totalUsers: number
): string[] {
  const insights: string[] = []

  // Insight 1: Bottleneck
  insights.push(
    `🔴 **Cuello de Botella**: "${bottleneck.stage}" tiene ${bottleneck.dropOffRate}% de abandono. ` +
    `Mejorar esta etapa recuperaría ~${Math.round(totalUsers * bottleneck.dropOffRate / 100)} usuarios.`
  )

  // Insight 2: Top of funnel
  const firstStage = stages[0]
  const secondStage = stages[1]
  if (secondStage.dropOffRate > 50) {
    insights.push(
      `⚠️ **Interés Inicial Bajo**: ${secondStage.dropOffRate}% abandona antes de subir CV. ` +
      `Landing page necesita optimización (propuesta de valor más clara, reducir fricción).`
    )
  }

  // Insight 3: Payment conversion
  const paymentStageIndex = stages.findIndex(s => s.stage.includes('Pago'))
  if (paymentStageIndex >= 0) {
    const paymentStage = stages[paymentStageIndex]
    if (paymentStage.dropOffRate > 30) {
      insights.push(
        `💳 **Fricción en Pago**: ${paymentStage.dropOffRate}% abandona en checkout. ` +
        `Considerar: simplificar formulario, agregar más métodos de pago, mostrar garantía de devolución.`
      )
    }
  }

  // Insight 4: Time to convert
  const firstWithTime = stages.find(s => s.averageTimeToNext !== undefined)
  if (firstWithTime && firstWithTime.averageTimeToNext && firstWithTime.averageTimeToNext > 7) {
    insights.push(
      `⏰ **Ciclo Largo**: Usuarios tardan ${Math.round(firstWithTime.averageTimeToNext)} días en avanzar. ` +
      `Email nurturing y urgencia (ofertas limitadas) pueden acelerar conversión.`
    )
  }

  // Insight 5: Mentorship activation
  const mentorshipIndex = stages.findIndex(s => s.stage.includes('Mentoría'))
  if (mentorshipIndex >= 0) {
    const mentorshipStage = stages[mentorshipIndex]
    const previousStage = stages[mentorshipIndex - 1]

    if (previousStage && previousStage.users > 0) {
      const activationRate = (mentorshipStage.users / previousStage.users) * 100
      if (activationRate < 40) {
        insights.push(
          `📈 **Oportunidad de Activación**: Solo ${Math.round(activationRate)}% de usuarios activa mentoría. ` +
          `Agregar CTA en resultados del análisis, email drip campaign, o descuento de primera sesión.`
        )
      }
    }
  }

  // Insight 6: Overall conversion
  const lastStage = stages[stages.length - 1]
  if (lastStage.conversionRate < 5) {
    insights.push(
      `📊 **Conversión Total Baja**: ${lastStage.conversionRate}% completa el funnel completo. ` +
      `Benchmark de industria es 8-12%. Optimizar cada etapa puede duplicar conversión.`
    )
  } else if (lastStage.conversionRate > 12) {
    insights.push(
      `🎉 **Conversión Excelente**: ${lastStage.conversionRate}% completa el funnel completo. ` +
      `Supera benchmark de industria (8-12%). Mantener calidad y escalar adquisición.`
    )
  }

  return insights
}
