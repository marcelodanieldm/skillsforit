/**
 * Módulo de Proyecciones de Ingresos con Regresión Lineal
 * Sprint 17: Observabilidad y Analytics de Negocio
 * 
 * Implementa regresión lineal simple para proyectar ingresos basándose
 * en el crecimiento histórico de las últimas 4 semanas.
 */

interface WeeklyRevenue {
  week: number
  revenue: number
  date: Date
}

interface ProjectionScenario {
  scenario: 'optimistic' | 'realistic' | 'pessimistic'
  growthRate: number
  baseMultiplier: number
  description: string
}

interface RegressionResult {
  slope: number          // Pendiente (m en y = mx + b)
  intercept: number      // Intercepto (b en y = mx + b)
  r2: number            // Coeficiente de determinación (0-1)
  weeklyGrowth: number  // Crecimiento semanal en %
}

export class RevenueProjector {
  
  /**
   * Calcula regresión lineal simple usando el método de mínimos cuadrados
   * Formula: y = mx + b
   * 
   * @param data Array de {week, revenue}
   * @returns {slope, intercept, r2, weeklyGrowth}
   */
  static calculateLinearRegression(data: WeeklyRevenue[]): RegressionResult {
    const n = data.length
    
    if (n < 2) {
      throw new Error('Se requieren al menos 2 puntos de datos para regresión')
    }

    // Calcular sumatorias
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0
    
    data.forEach((point, index) => {
      const x = index + 1 // Week number (1, 2, 3, 4)
      const y = point.revenue
      
      sumX += x
      sumY += y
      sumXY += x * y
      sumX2 += x * x
      sumY2 += y * y
    })

    // Calcular pendiente (m) e intercepto (b)
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n

    // Calcular R² (coeficiente de determinación)
    const meanY = sumY / n
    let ssTotal = 0, ssResidual = 0
    
    data.forEach((point, index) => {
      const x = index + 1
      const y = point.revenue
      const yPredicted = slope * x + intercept
      
      ssTotal += Math.pow(y - meanY, 2)
      ssResidual += Math.pow(y - yPredicted, 2)
    })
    
    const r2 = 1 - (ssResidual / ssTotal)

    // Calcular crecimiento semanal en porcentaje
    const firstWeekRevenue = data[0].revenue
    const weeklyGrowth = (slope / firstWeekRevenue) * 100

    return {
      slope,
      intercept,
      r2,
      weeklyGrowth
    }
  }

  /**
   * Genera proyecciones para los próximos 3 meses (12 semanas)
   * basándose en datos de las últimas 4 semanas
   * 
   * @param historicalData Últimas 4 semanas de revenue
   * @returns Proyecciones para 3 escenarios (optimista, realista, pesimista)
   */
  static projectNextQuarter(historicalData: WeeklyRevenue[]) {
    if (historicalData.length < 4) {
      throw new Error('Se requieren datos de al menos 4 semanas para proyectar')
    }

    // Ordenar por fecha ascendente
    const sortedData = [...historicalData].sort((a, b) => 
      a.date.getTime() - b.date.getTime()
    )

    // Calcular regresión lineal
    const regression = this.calculateLinearRegression(sortedData)

    // Definir escenarios
    const scenarios: ProjectionScenario[] = [
      {
        scenario: 'optimistic',
        growthRate: Math.max(regression.weeklyGrowth * 1.3, 8), // 30% más optimista o mínimo 8%
        baseMultiplier: 1.2,
        description: 'Mejor escenario con adopción acelerada'
      },
      {
        scenario: 'realistic',
        growthRate: regression.weeklyGrowth,
        baseMultiplier: 1.0,
        description: 'Basado en tendencia histórica'
      },
      {
        scenario: 'pessimistic',
        growthRate: Math.max(regression.weeklyGrowth * 0.7, 2), // 30% menos o mínimo 2%
        baseMultiplier: 0.85,
        description: 'Escenario conservador con desaceleración'
      }
    ]

    // Generar proyecciones para 12 semanas (3 meses)
    const lastWeekRevenue = sortedData[sortedData.length - 1].revenue
    const projections = scenarios.map(scenario => {
      const weeks = []
      let currentRevenue = lastWeekRevenue * scenario.baseMultiplier

      for (let week = 1; week <= 12; week++) {
        // Aplicar crecimiento semanal
        currentRevenue *= (1 + scenario.growthRate / 100)
        
        const projectedDate = new Date(sortedData[sortedData.length - 1].date)
        projectedDate.setDate(projectedDate.getDate() + (week * 7))

        weeks.push({
          week,
          revenue: Math.round(currentRevenue * 100) / 100,
          date: projectedDate,
          cumulativeRevenue: weeks.reduce((sum, w) => sum + w.revenue, currentRevenue)
        })
      }

      return {
        scenario: scenario.scenario,
        description: scenario.description,
        growthRate: scenario.growthRate,
        baseMultiplier: scenario.baseMultiplier,
        weeks,
        totalProjected: weeks.reduce((sum, w) => sum + w.revenue, 0),
        regressionStats: regression
      }
    })

    return {
      historicalData: sortedData,
      regression,
      projections,
      insights: this.generateInsights(regression, projections)
    }
  }

  /**
   * Genera insights automáticos basados en las proyecciones
   */
  private static generateInsights(
    regression: RegressionResult,
    projections: any[]
  ): string[] {
    const insights: string[] = []
    const optimistic = projections.find(p => p.scenario === 'optimistic')!
    const realistic = projections.find(p => p.scenario === 'realistic')!
    const pessimistic = projections.find(p => p.scenario === 'pessimistic')!

    // Insight 1: Calidad de la predicción
    if (regression.r2 > 0.9) {
      insights.push(`📈 Alta Confiabilidad: R² = ${(regression.r2 * 100).toFixed(1)}% - Tendencia muy predecible`)
    } else if (regression.r2 > 0.7) {
      insights.push(`📊 Confiabilidad Media: R² = ${(regression.r2 * 100).toFixed(1)}% - Tendencia moderada`)
    } else {
      insights.push(`⚠️ Volatilidad Alta: R² = ${(regression.r2 * 100).toFixed(1)}% - Tendencia poco predecible`)
    }

    // Insight 2: Crecimiento proyectado
    const growth = ((realistic.totalProjected / realistic.weeks[0].revenue) - 1) * 100
    insights.push(`💰 Crecimiento Trimestral: ${growth.toFixed(0)}% esperado en escenario realista`)

    // Insight 3: Rango de incertidumbre
    const range = optimistic.totalProjected - pessimistic.totalProjected
    insights.push(`📏 Rango de Proyección: $${pessimistic.totalProjected.toFixed(0)} - $${optimistic.totalProjected.toFixed(0)} (±$${range.toFixed(0)})`)

    // Insight 4: Tendencia semanal
    if (regression.weeklyGrowth > 5) {
      insights.push(`🚀 Crecimiento Acelerado: +${regression.weeklyGrowth.toFixed(1)}% semanal - Momentum positivo`)
    } else if (regression.weeklyGrowth > 0) {
      insights.push(`📈 Crecimiento Estable: +${regression.weeklyGrowth.toFixed(1)}% semanal - Progreso consistente`)
    } else {
      insights.push(`⚠️ Decrecimiento: ${regression.weeklyGrowth.toFixed(1)}% semanal - Requiere intervención`)
    }

    // Insight 5: Recomendación de acción
    if (regression.weeklyGrowth > 10) {
      insights.push(`✅ Acelerar Marketing: Invertir en adquisición para capitalizar momentum`)
    } else if (regression.weeklyGrowth > 3) {
      insights.push(`💡 Optimizar Conversión: Enfocarse en retención y upsell`)
    } else {
      insights.push(`🎯 Pivotar Estrategia: Analizar churn y revisar product-market fit`)
    }

    return insights
  }

  /**
   * Convierte proyecciones semanales a mensuales para el dashboard
   */
  static convertToMonthlyProjections(weeklyProjections: any) {
    const { projections, historicalData, regression } = weeklyProjections

    const monthlyProjections = projections.map((projection: any) => {
      const months: any[] = []
      
      // Agrupar semanas en meses (4 semanas = 1 mes aprox)
      for (let month = 0; month < 3; month++) {
        const startWeek = month * 4
        const endWeek = startWeek + 4
        const weeksInMonth = projection.weeks.slice(startWeek, endWeek)
        
        const monthlyRevenue = weeksInMonth.reduce((sum: number, w: any) => sum + w.revenue, 0)
        const monthDate = weeksInMonth[0]?.date || new Date()
        
        months.push({
          month: monthDate.toLocaleString('es', { month: 'short' }),
          year: monthDate.getFullYear(),
          revenue: Math.round(monthlyRevenue),
          weeksIncluded: weeksInMonth.length
        })
      }

      return {
        scenario: projection.scenario,
        months,
        totalQuarterly: months.reduce((sum, m) => sum + m.revenue, 0)
      }
    })

    return {
      historical: this.convertHistoricalToMonthly(historicalData),
      projections: monthlyProjections,
      regression,
      insights: weeklyProjections.insights
    }
  }

  /**
   * Convierte datos históricos semanales a mensuales
   */
  private static convertHistoricalToMonthly(weeklyData: WeeklyRevenue[]) {
    const monthlyMap = new Map<string, { revenue: number; count: number; date: Date }>()

    weeklyData.forEach(week => {
      const monthKey = `${week.date.getFullYear()}-${week.date.getMonth()}`
      
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, {
          revenue: 0,
          count: 0,
          date: week.date
        })
      }

      const monthData = monthlyMap.get(monthKey)!
      monthData.revenue += week.revenue
      monthData.count++
    })

    return Array.from(monthlyMap.values()).map(data => ({
      month: data.date.toLocaleString('es', { month: 'short' }),
      year: data.date.getFullYear(),
      revenue: Math.round(data.revenue),
      actual: true
    }))
  }
}

/**
 * Ejemplo de uso:
 * 
 * const lastFourWeeks = [
 *   { week: 1, revenue: 5000, date: new Date('2026-01-01') },
 *   { week: 2, revenue: 5500, date: new Date('2026-01-08') },
 *   { week: 3, revenue: 6200, date: new Date('2026-01-15') },
 *   { week: 4, revenue: 6800, date: new Date('2026-01-22') }
 * ]
 * 
 * const projections = RevenueProjector.projectNextQuarter(lastFourWeeks)
 * const monthlyView = RevenueProjector.convertToMonthlyProjections(projections)
 */
