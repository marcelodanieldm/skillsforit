/**
 * Vista Materializada para Analytics de CEO Dashboard
 * Sprint 17: Observabilidad y Analytics de Negocio
 * 
 * Simula vistas materializadas de PostgreSQL para cálculo eficiente de:
 * - MRR (Monthly Recurring Revenue)
 * - LTV (Lifetime Value) por segmento
 * - Métricas agregadas por mes/país/segmento
 * 
 * En producción, usar PostgreSQL con MATERIALIZED VIEW:
 * CREATE MATERIALIZED VIEW analytics_mrr AS ...
 * REFRESH MATERIALIZED VIEW analytics_mrr;
 */

import { revenueDb } from './db'
import { UserSegment } from './analytics'

interface MRRData {
  month: string
  year: number
  totalMRR: number
  newMRR: number       // De nuevos clientes
  expansionMRR: number // De upgrades
  churnMRR: number     // Pérdida por cancelaciones
  netMRR: number       // newMRR + expansionMRR - churnMRR
  subscriberCount: number
  averageRevenuePerUser: number
}

interface LTVSegmentData {
  segment: UserSegment
  totalUsers: number
  averageMonthlyRevenue: number
  churnRate: number
  lifetimeMonths: number
  ltv: number
  revenueBreakdown: {
    cvAnalysis: number
    mentorship: number
    ebooks: number
  }
  lastCalculated: Date
}

interface MaterializedView {
  mrr: MRRData[]
  ltvBySegment: LTVSegmentData[]
  lastRefresh: Date
  refreshDuration: number // ms
}

export class AnalyticsMaterializedView {
  private static cache: MaterializedView | null = null
  private static CACHE_TTL = 5 * 60 * 1000 // 5 minutos en producción
  private static isRefreshing = false

  /**
   * Obtiene datos de la vista materializada (con cache)
   */
  static async getView(): Promise<MaterializedView> {
    // Check cache
    if (this.cache && this.isViewFresh()) {
      console.log('✅ Cache hit - Usando vista materializada en memoria')
      return this.cache
    }

    // Refresh if stale
    console.log('🔄 Cache miss - Refrescando vista materializada...')
    return await this.refresh()
  }

  /**
   * Verifica si la vista en cache está fresca
   */
  private static isViewFresh(): boolean {
    if (!this.cache) return false
    
    const age = Date.now() - this.cache.lastRefresh.getTime()
    return age < this.CACHE_TTL
  }

  /**
   * Refresca la vista materializada calculando todas las métricas
   * Equivalente a: REFRESH MATERIALIZED VIEW analytics_mrr;
   */
  static async refresh(): Promise<MaterializedView> {
    if (this.isRefreshing) {
      // Evitar refresh concurrentes
      while (this.isRefreshing) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      return this.cache!
    }

    this.isRefreshing = true
    const startTime = Date.now()

    try {
      // Calcular MRR por mes
      const mrr = this.calculateMRR()

      // Calcular LTV por segmento
      const ltvBySegment = this.calculateLTVBySegment()

      const view: MaterializedView = {
        mrr,
        ltvBySegment,
        lastRefresh: new Date(),
        refreshDuration: Date.now() - startTime
      }

      this.cache = view
      console.log(`✅ Vista materializada actualizada en ${view.refreshDuration}ms`)
      
      return view
    } finally {
      this.isRefreshing = false
    }
  }

  /**
   * Calcula Monthly Recurring Revenue (MRR) por mes
   * 
   * MRR = Suma de revenue mensual de suscripciones recurrentes
   * newMRR = MRR de nuevos clientes este mes
   * expansionMRR = MRR adicional por upgrades
   * churnMRR = MRR perdido por cancelaciones
   * netMRR = newMRR + expansionMRR - churnMRR
   */
  private static calculateMRR(): MRRData[] {
    const monthlyData = new Map<string, {
      totalRevenue: number
      newUsers: Set<string>
      existingUsers: Set<string>
      churnedUsers: Set<string>
      revenues: number[]
    }>()

    // Agrupar revenue por mes
    revenueDb.findAll().forEach(entry => {
      const date = new Date(entry.createdAt)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, {
          totalRevenue: 0,
          newUsers: new Set(),
          existingUsers: new Set(),
          churnedUsers: new Set(),
          revenues: []
        })
      }

      const monthData = monthlyData.get(monthKey)!
      monthData.totalRevenue += entry.amount
      monthData.revenues.push(entry.amount)
      
      // Determinar si es nuevo usuario o existente
      const previousEntries = revenueDb.findAll().filter(r => 
        r.userId === entry.userId && 
        new Date(r.createdAt) < date
      )
      
      if (previousEntries.length === 0) {
        monthData.newUsers.add(entry.userId)
      } else {
        monthData.existingUsers.add(entry.userId)
      }
    })

    // Calcular métricas MRR por mes
    const mrrData: MRRData[] = []
    const sortedMonths = Array.from(monthlyData.keys()).sort()

    sortedMonths.forEach((monthKey, index) => {
      const monthData = monthlyData.get(monthKey)!
      const [year, month] = monthKey.split('-').map(Number)
      
      // Calcular MRR components
      const totalMRR = monthData.totalRevenue
      const newMRR = Array.from(monthData.newUsers).reduce((sum, userId) => {
        const userRevenue = revenueDb.findAll()
          .filter(r => {
            const rDate = new Date(r.createdAt)
            const rMonthKey = `${rDate.getFullYear()}-${String(rDate.getMonth() + 1).padStart(2, '0')}`
            return r.userId === userId && rMonthKey === monthKey
          })
          .reduce((s, r) => s + r.amount, 0)
        return sum + userRevenue
      }, 0)

      // Estimar churn (usuarios que compraron mes anterior pero no este mes)
      const previousMonthKey = sortedMonths[index - 1]
      let churnMRR = 0
      
      if (previousMonthKey) {
        const previousMonthData = monthlyData.get(previousMonthKey)!
        const currentMonthUsers = new Set([
          ...monthData.newUsers,
          ...monthData.existingUsers
        ])
        
        previousMonthData.existingUsers.forEach(userId => {
          if (!currentMonthUsers.has(userId)) {
            // Usuario churned
            const lastRevenue = revenueDb.findAll()
              .filter(r => {
                const rDate = new Date(r.createdAt)
                const rMonthKey = `${rDate.getFullYear()}-${String(rDate.getMonth() + 1).padStart(2, '0')}`
                return r.userId === userId && rMonthKey === previousMonthKey
              })
              .reduce((s, r) => s + r.amount, 0)
            churnMRR += lastRevenue
          }
        })
      }

      const expansionMRR = totalMRR - newMRR // Simplificación: revenue de usuarios existentes
      const netMRR = newMRR + expansionMRR - churnMRR
      
      const subscriberCount = monthData.newUsers.size + monthData.existingUsers.size
      const averageRevenuePerUser = subscriberCount > 0 ? totalMRR / subscriberCount : 0

      mrrData.push({
        month: new Date(year, month - 1).toLocaleString('es', { month: 'short' }),
        year,
        totalMRR: Math.round(totalMRR * 100) / 100,
        newMRR: Math.round(newMRR * 100) / 100,
        expansionMRR: Math.round(expansionMRR * 100) / 100,
        churnMRR: Math.round(churnMRR * 100) / 100,
        netMRR: Math.round(netMRR * 100) / 100,
        subscriberCount,
        averageRevenuePerUser: Math.round(averageRevenuePerUser * 100) / 100
      })
    })

    return mrrData
  }

  /**
   * Calcula LTV por segmento de usuario
   * 
   * LTV = Average Monthly Revenue × (1 / Monthly Churn Rate)
   * 
   * Segmentos: Junior, Transition, Leadership
   */
  private static calculateLTVBySegment(): LTVSegmentData[] {
    const segments: UserSegment[] = ['Junior', 'Transition', 'Leadership']
    
    // Tasas de churn por segmento (basado en histórico)
    const churnRates: Record<UserSegment, number> = {
      'Junior': 0.35,      // 35% churn mensual
      'Transition': 0.20,  // 20% churn mensual
      'Leadership': 0.12   // 12% churn mensual
    }

    return segments.map(segment => {
      // Filtrar usuarios del segmento
      const segmentRevenues = revenueDb.findAll().filter(r => {
        // Simulación: segmentar por monto (en producción usar datos reales)
        if (segment === 'Junior') return r.amount <= 30
        if (segment === 'Transition') return r.amount > 30 && r.amount <= 100
        if (segment === 'Leadership') return r.amount > 100
        return false
      })

      const totalUsers = new Set(segmentRevenues.map(r => r.userId)).size
      
      if (totalUsers === 0) {
        return {
          segment,
          totalUsers: 0,
          averageMonthlyRevenue: 0,
          churnRate: churnRates[segment],
          lifetimeMonths: 0,
          ltv: 0,
          revenueBreakdown: {
            cvAnalysis: 0,
            mentorship: 0,
            ebooks: 0
          },
          lastCalculated: new Date()
        }
      }

      // Calcular revenue promedio mensual
      const totalRevenue = segmentRevenues.reduce((sum, r) => sum + r.amount, 0)
      const averageMonthlyRevenue = totalRevenue / totalUsers

      // Calcular desglose por fuente
      const cvAnalysisRevenue = segmentRevenues
        .filter(r => r.source === 'cv_analysis')
        .reduce((sum, r) => sum + r.amount, 0)
      
      const mentorshipRevenue = segmentRevenues
        .filter(r => r.source === 'mentorship')
        .reduce((sum, r) => sum + r.amount, 0)
      
      const ebooksRevenue = segmentRevenues
        .filter(r => r.source === 'ebook')
        .reduce((sum, r) => sum + r.amount, 0)

      const churnRate = churnRates[segment]
      const lifetimeMonths = 1 / churnRate
      const ltv = averageMonthlyRevenue * lifetimeMonths

      return {
        segment,
        totalUsers,
        averageMonthlyRevenue: Math.round(averageMonthlyRevenue * 100) / 100,
        churnRate,
        lifetimeMonths: Math.round(lifetimeMonths * 100) / 100,
        ltv: Math.round(ltv * 100) / 100,
        revenueBreakdown: {
          cvAnalysis: Math.round((cvAnalysisRevenue / totalRevenue) * 100),
          mentorship: Math.round((mentorshipRevenue / totalRevenue) * 100),
          ebooks: Math.round((ebooksRevenue / totalRevenue) * 100)
        },
        lastCalculated: new Date()
      }
    })
  }

  /**
   * Fuerza un refresh manual (para testing o cronjobs)
   */
  static async forceRefresh(): Promise<MaterializedView> {
    this.cache = null
    return await this.refresh()
  }

  /**
   * Limpia el cache (útil en testing)
   */
  static clearCache(): void {
    this.cache = null
  }

  /**
   * Obtiene estadísticas de la vista
   */
  static getStats() {
    if (!this.cache) {
      return {
        isCached: false,
        lastRefresh: null,
        age: null,
        refreshDuration: null
      }
    }

    const age = Date.now() - this.cache.lastRefresh.getTime()
    
    return {
      isCached: true,
      lastRefresh: this.cache.lastRefresh,
      age: Math.round(age / 1000), // segundos
      refreshDuration: this.cache.refreshDuration,
      mrrEntries: this.cache.mrr.length,
      segments: this.cache.ltvBySegment.length
    }
  }
}

/**
 * Script de PostgreSQL equivalente (para referencia):
 * 
 * CREATE MATERIALIZED VIEW analytics_mrr AS
 * SELECT 
 *   DATE_TRUNC('month', date) as month,
 *   SUM(amount) as total_mrr,
 *   SUM(CASE WHEN is_new_user THEN amount ELSE 0 END) as new_mrr,
 *   SUM(CASE WHEN NOT is_new_user THEN amount ELSE 0 END) as expansion_mrr,
 *   COUNT(DISTINCT user_id) as subscriber_count,
 *   AVG(amount) as average_revenue_per_user
 * FROM revenue
 * GROUP BY DATE_TRUNC('month', date)
 * ORDER BY month DESC;
 * 
 * CREATE INDEX ON analytics_mrr (month);
 * 
 * -- Refresh cada hora
 * REFRESH MATERIALIZED VIEW analytics_mrr;
 */
