import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'
import { revenueDb } from '@/lib/database'

interface MonthlyProjection {
  month: string
  year: number
  realistic: number
  optimistic: number
  actual?: number
}

interface ProjectionData {
  historical: MonthlyProjection[]
  future: MonthlyProjection[]
  assumptions: {
    realistic: {
      growthRate: number
      churnRate: number
      conversionRate: number
    }
    optimistic: {
      growthRate: number
      churnRate: number
      conversionRate: number
    }
  }
  insights: string[]
}

export async function GET(request: NextRequest) {
  try {
    // Require CEO role
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    const auth = AuthService.requireRole(token, 'ceo')

    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error || 'No autorizado' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const historicalMonths = parseInt(searchParams.get('historical') || '6')
    const futureMonths = parseInt(searchParams.get('future') || '12')

    // Get historical revenue
    const allRevenue = revenueDb.findAll()

    // Group by month
    const revenueByMonth = new Map<string, number>()

    for (const rev of allRevenue) {
      const date = new Date(rev.createdAt)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

      revenueByMonth.set(
        monthKey,
        (revenueByMonth.get(monthKey) || 0) + rev.amount
      )
    }

    // Calculate historical data
    const historical: MonthlyProjection[] = []
    const now = new Date()

    for (let i = historicalMonths - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setMonth(date.getMonth() - i)

      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const actual = revenueByMonth.get(monthKey) || 0

      historical.push({
        month: date.toLocaleString('es', { month: 'short' }),
        year: date.getFullYear(),
        realistic: actual,
        optimistic: actual,
        actual
      })
    }

    // Calculate growth rate from historical data
    let averageGrowthRate = 0
    if (historical.length >= 2) {
      const growthRates: number[] = []

      for (let i = 1; i < historical.length; i++) {
        const prev = historical[i - 1].actual || 0
        const current = historical[i].actual || 0

        if (prev > 0) {
          const growthRate = ((current - prev) / prev) * 100
          growthRates.push(growthRate)
        }
      }

      if (growthRates.length > 0) {
        averageGrowthRate = growthRates.reduce((a, b) => a + b, 0) / growthRates.length
      }
    }

    // Set assumptions based on historical data
    const assumptions = {
      realistic: {
        growthRate: Math.max(5, Math.min(averageGrowthRate, 15)), // 5-15% monthly
        churnRate: 0.20, // 20% monthly churn
        conversionRate: 0.35 // 35% conversion rate
      },
      optimistic: {
        growthRate: Math.max(15, averageGrowthRate * 1.5), // 15-30% monthly
        churnRate: 0.12, // 12% monthly churn (improved retention)
        conversionRate: 0.50 // 50% conversion rate (optimized funnel)
      }
    }

    // Calculate future projections
    const future: MonthlyProjection[] = []
    const lastActual = historical[historical.length - 1]?.actual || 1000

    let realisticRevenue = lastActual
    let optimisticRevenue = lastActual

    for (let i = 1; i <= futureMonths; i++) {
      const date = new Date(now)
      date.setMonth(date.getMonth() + i)

      // Realistic scenario: Conservative growth with churn
      realisticRevenue = realisticRevenue * (1 + assumptions.realistic.growthRate / 100)
      realisticRevenue = realisticRevenue * (1 - assumptions.realistic.churnRate * 0.1) // Churn impact

      // Optimistic scenario: High growth with low churn
      optimisticRevenue = optimisticRevenue * (1 + assumptions.optimistic.growthRate / 100)
      optimisticRevenue = optimisticRevenue * (1 - assumptions.optimistic.churnRate * 0.1)

      future.push({
        month: date.toLocaleString('es', { month: 'short' }),
        year: date.getFullYear(),
        realistic: Math.round(realisticRevenue),
        optimistic: Math.round(optimisticRevenue)
      })
    }

    // Generate insights
    const insights = generateProjectionInsights(historical, future, assumptions)

    const result: ProjectionData = {
      historical,
      future,
      assumptions,
      insights
    }

    return NextResponse.json({
      success: true,
      data: result,
      metadata: {
        calculatedAt: new Date().toISOString(),
        historicalMonths,
        futureMonths
      }
    })

  } catch (error: any) {
    console.error('Error calculating projections:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

function generateProjectionInsights(
  historical: MonthlyProjection[],
  future: MonthlyProjection[],
  assumptions: ProjectionData['assumptions']
): string[] {
  const insights: string[] = []

  // Insight 1: Revenue trajectory
  const currentMonth = historical[historical.length - 1]
  const lastFutureMonth = future[future.length - 1]

  if (currentMonth && lastFutureMonth) {
    const realisticGrowth = ((lastFutureMonth.realistic - currentMonth.actual!) / currentMonth.actual!) * 100
    const optimisticGrowth = ((lastFutureMonth.optimistic - currentMonth.actual!) / currentMonth.actual!) * 100

    insights.push(
      `📈 **Proyección 12 Meses**: Escenario Realista: +${Math.round(realisticGrowth)}% ` +
      `($${Math.round(lastFutureMonth.realistic).toLocaleString()}). ` +
      `Escenario Optimista: +${Math.round(optimisticGrowth)}% ` +
      `($${Math.round(lastFutureMonth.optimistic).toLocaleString()}).`
    )
  }

  // Insight 2: Marketing budget recommendation
  const sixMonthRealistic = future[5]?.realistic || 0
  const suggestedMarketingBudget = sixMonthRealistic * 0.25 // 25% of projected revenue

  insights.push(
    `💰 **Presupuesto Marketing**: Con proyección de $${Math.round(sixMonthRealistic).toLocaleString()} ` +
    `en 6 meses, invertir $${Math.round(suggestedMarketingBudget).toLocaleString()} (25% del revenue proyectado) ` +
    `en marketing para mantener crecimiento del ${assumptions.realistic.growthRate}%.`
  )

  // Insight 3: Churn impact
  const churnSavings = currentMonth?.actual 
    ? (currentMonth.actual * (assumptions.realistic.churnRate - assumptions.optimistic.churnRate) * 12)
    : 0

  if (churnSavings > 0) {
    insights.push(
      `🎯 **Oportunidad Retención**: Reducir churn del ${assumptions.realistic.churnRate * 100}% al ` +
      `${assumptions.optimistic.churnRate * 100}% generaría $${Math.round(churnSavings).toLocaleString()} ` +
      `adicionales en 12 meses. Priorizar: onboarding mejorado, email engagement, value delivery.`
    )
  }

  // Insight 4: Conversion optimization
  const conversionImpact = currentMonth?.actual
    ? currentMonth.actual * ((assumptions.optimistic.conversionRate - assumptions.realistic.conversionRate) / assumptions.realistic.conversionRate)
    : 0

  insights.push(
    `🚀 **Optimización Conversión**: Aumentar conversión del ${assumptions.realistic.conversionRate * 100}% al ` +
    `${assumptions.optimistic.conversionRate * 100}% añadiría $${Math.round(conversionImpact * 12).toLocaleString()} ` +
    `anuales. A/B testing de landing page, checkout simplificado, y social proof son críticos.`
  )

  // Insight 5: Break-even and profitability
  const monthlyOperatingCost = 5000 // Estimate (adjust based on actual costs)
  const breakEvenMonth = future.findIndex(m => m.realistic >= monthlyOperatingCost)

  if (breakEvenMonth >= 0) {
    insights.push(
      `✅ **Break-Even**: Se alcanza en ${breakEvenMonth + 1} meses con escenario realista. ` +
      `Después de esto, cada mes genera $${Math.round(future[breakEvenMonth].realistic - monthlyOperatingCost).toLocaleString()} ` +
      `de margen.`
    )
  }

  return insights
}
