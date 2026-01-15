/**
 * Sprint 24: Backend de Funnel Tracking y Conversión
 * 
 * Sistema de gestión de Order Bumps y Upsells con tracking de métricas:
 * - Order Bump Manager (gestión de offers pre-pago)
 * - Upsell Manager (gestión de offers post-commitment)
 * - Conversion Tracker (métricas de funnel)
 * - AOV Calculator (Average Order Value analytics)
 * - A/B Testing support (variantes de offers)
 * 
 * Métricas clave a trackear:
 * - Conversion rate por step
 * - Order Bump acceptance rate (meta: 40%)
 * - Upsell acceptance rate (meta: 25%)
 * - AOV por segmento
 * - Time to purchase
 * - Cart abandonment rate
 */

import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  )
}

// ============================================
// TYPES & INTERFACES
// ============================================

export interface OrderBump {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  discountPercentage?: number
  productIds: string[]  // IDs de productos incluidos
  conversionRate?: number
  enabled: boolean
  position: 'pre-payment' | 'in-cart'
  priority: number
}

export interface Upsell {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  discountPercentage?: number
  productIds: string[]
  conversionRate?: number
  enabled: boolean
  timing: 'post-payment-info' | 'post-purchase'
  expiresIn?: number  // Segundos de urgencia
  urgencyMessage?: string
}

export interface FunnelEvent {
  id?: string
  sessionId: string
  userId?: string
  email?: string
  eventType: 
    | 'page_view'
    | 'diagnostic_started'
    | 'diagnostic_completed'
    | 'checkout_started'
    | 'order_bump_viewed'
    | 'order_bump_accepted'
    | 'order_bump_declined'
    | 'payment_info_entered'
    | 'upsell_viewed'
    | 'upsell_accepted'
    | 'upsell_declined'
    | 'purchase_completed'
    | 'cart_abandoned'
  timestamp: string
  metadata?: Record<string, any>
  cartValue: number
  products: string[]
}

export interface FunnelAnalytics {
  totalVisitors: number
  diagnosticStarts: number
  diagnosticCompletions: number
  checkoutStarts: number
  orderBumpViews: number
  orderBumpAccepts: number
  upsellViews: number
  upsellAccepts: number
  purchases: number
  
  // Calculated metrics
  diagnosticCompletionRate: number
  checkoutConversionRate: number
  orderBumpConversionRate: number
  upsellConversionRate: number
  overallConversionRate: number
  
  // AOV metrics
  avgOrderValue: number
  avgOrderValueWithBump: number
  avgOrderValueWithUpsell: number
  avgOrderValueMax: number
}

// ============================================
// ORDER BUMP MANAGER
// ============================================

export class OrderBumpManager {
  private orderBumps: Map<string, OrderBump> = new Map()

  constructor() {
    this.initializeDefaultBumps()
  }

  private initializeDefaultBumps() {
    // Default Order Bump: CV Audit with AI
    const cvAuditBump: OrderBump = {
      id: 'cv-audit-ai',
      name: 'Auditoría de CV con IA',
      description: 'Análisis profesional de tu CV en minutos con recomendaciones priorizadas',
      price: 7,
      originalPrice: 15,
      discountPercentage: 53,
      productIds: ['cv-audit-premium'],
      conversionRate: 0,  // Will be calculated from data
      enabled: true,
      position: 'pre-payment',
      priority: 1
    }

    this.orderBumps.set(cvAuditBump.id, cvAuditBump)
  }

  getOrderBump(id: string): OrderBump | undefined {
    return this.orderBumps.get(id)
  }

  getAllOrderBumps(): OrderBump[] {
    return Array.from(this.orderBumps.values())
      .filter(bump => bump.enabled)
      .sort((a, b) => a.priority - b.priority)
  }

  addOrderBump(bump: OrderBump): void {
    this.orderBumps.set(bump.id, bump)
  }

  updateConversionRate(id: string, rate: number): void {
    const bump = this.orderBumps.get(id)
    if (bump) {
      bump.conversionRate = rate
      this.orderBumps.set(id, bump)
    }
  }

  calculateDiscount(bump: OrderBump): number {
    if (!bump.originalPrice) return 0
    return bump.originalPrice - bump.price
  }

  getRecommendedBump(cartValue: number, userSegment?: string): OrderBump | null {
    const bumps = this.getAllOrderBumps()
    
    // Strategy: Recommend bump based on cart value and user segment
    // For now, return highest converting bump
    const sortedByConversion = bumps.sort((a, b) => 
      (b.conversionRate || 0) - (a.conversionRate || 0)
    )

    return sortedByConversion[0] || null
  }
}

// ============================================
// UPSELL MANAGER
// ============================================

export class UpsellManager {
  private upsells: Map<string, Upsell> = new Map()

  constructor() {
    this.initializeDefaultUpsells()
  }

  private initializeDefaultUpsells() {
    // Default Upsell: 1 Month Mentorship
    const mentorshipUpsell: Upsell = {
      id: 'mentorship-month',
      name: '1 Mes de Mentoría Profesional',
      description: '4 sesiones 1-on-1 con mentores senior para acelerar tu búsqueda de empleo',
      price: 25,
      originalPrice: 35,
      discountPercentage: 30,
      productIds: ['mentorship-basic-month'],
      conversionRate: 0,
      enabled: true,
      timing: 'post-payment-info',
      expiresIn: 600,  // 10 minutes urgency
      urgencyMessage: 'Esta oferta expira en 10 minutos'
    }

    this.upsells.set(mentorshipUpsell.id, mentorshipUpsell)
  }

  getUpsell(id: string): Upsell | undefined {
    return this.upsells.get(id)
  }

  getAllUpsells(): Upsell[] {
    return Array.from(this.upsells.values())
      .filter(upsell => upsell.enabled)
  }

  addUpsell(upsell: Upsell): void {
    this.upsells.set(upsell.id, upsell)
  }

  updateConversionRate(id: string, rate: number): void {
    const upsell = this.upsells.get(id)
    if (upsell) {
      upsell.conversionRate = rate
      this.upsells.set(id, upsell)
    }
  }

  getRecommendedUpsell(
    cartValue: number, 
    purchasedProducts: string[], 
    userSegment?: string
  ): Upsell | null {
    const upsells = this.getAllUpsells()
    
    // Strategy: Recommend upsell that complements purchased products
    // For now, return highest converting upsell
    const sortedByConversion = upsells.sort((a, b) => 
      (b.conversionRate || 0) - (a.conversionRate || 0)
    )

    return sortedByConversion[0] || null
  }
}

// ============================================
// CONVERSION TRACKER
// ============================================

export class ConversionTracker {
  async trackEvent(event: FunnelEvent): Promise<void> {
    const supabase = getSupabase()
    
    try {
      // Save to Supabase
      const { error } = await supabase
        .from('funnel_events')
        .insert({
          session_id: event.sessionId,
          user_id: event.userId,
          email: event.email,
          event_type: event.eventType,
          timestamp: event.timestamp,
          metadata: event.metadata,
          cart_value: event.cartValue,
          products: event.products
        })

      if (error) {
        console.error('[ConversionTracker] Error saving event:', error)
      }

      // Also log to console for development
      console.log('[ConversionTracker] Event tracked:', {
        type: event.eventType,
        sessionId: event.sessionId,
        cartValue: event.cartValue,
        timestamp: event.timestamp
      })
    } catch (error) {
      console.error('[ConversionTracker] Exception:', error)
    }
  }

  async getSessionEvents(sessionId: string): Promise<FunnelEvent[]> {
    const supabase = getSupabase()
    
    try {
      const { data, error } = await supabase
        .from('funnel_events')
        .select('*')
        .eq('session_id', sessionId)
        .order('timestamp', { ascending: true })

      if (error) {
        console.error('[ConversionTracker] Error fetching session:', error)
        return []
      }

      return data.map(row => ({
        id: row.id,
        sessionId: row.session_id,
        userId: row.user_id,
        email: row.email,
        eventType: row.event_type,
        timestamp: row.timestamp,
        metadata: row.metadata,
        cartValue: row.cart_value,
        products: row.products
      }))
    } catch (error) {
      console.error('[ConversionTracker] Exception:', error)
      return []
    }
  }

  async getAnalytics(
    startDate?: Date, 
    endDate?: Date
  ): Promise<FunnelAnalytics> {
    const supabase = getSupabase()
    
    try {
      const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
      const end = endDate || new Date()

      // Fetch all events in date range
      const { data, error } = await supabase
        .from('funnel_events')
        .select('*')
        .gte('timestamp', start.toISOString())
        .lte('timestamp', end.toISOString())

      if (error) {
        console.error('[ConversionTracker] Error fetching analytics:', error)
        return this.getEmptyAnalytics()
      }

      // Count events by type
      const events = data || []
      const totalVisitors = new Set(events.map(e => e.session_id)).size
      const diagnosticStarts = events.filter(e => e.event_type === 'diagnostic_started').length
      const diagnosticCompletions = events.filter(e => e.event_type === 'diagnostic_completed').length
      const checkoutStarts = events.filter(e => e.event_type === 'checkout_started').length
      const orderBumpViews = events.filter(e => e.event_type === 'order_bump_viewed').length
      const orderBumpAccepts = events.filter(e => e.event_type === 'order_bump_accepted').length
      const upsellViews = events.filter(e => e.event_type === 'upsell_viewed').length
      const upsellAccepts = events.filter(e => e.event_type === 'upsell_accepted').length
      const purchases = events.filter(e => e.event_type === 'purchase_completed').length

      // Calculate conversion rates
      const diagnosticCompletionRate = diagnosticStarts > 0 
        ? (diagnosticCompletions / diagnosticStarts) * 100 
        : 0
      
      const checkoutConversionRate = totalVisitors > 0 
        ? (checkoutStarts / totalVisitors) * 100 
        : 0
      
      const orderBumpConversionRate = orderBumpViews > 0 
        ? (orderBumpAccepts / orderBumpViews) * 100 
        : 0
      
      const upsellConversionRate = upsellViews > 0 
        ? (upsellAccepts / upsellViews) * 100 
        : 0
      
      const overallConversionRate = totalVisitors > 0 
        ? (purchases / totalVisitors) * 100 
        : 0

      // Calculate AOV metrics
      const purchaseEvents = events.filter(e => e.event_type === 'purchase_completed')
      const totalRevenue = purchaseEvents.reduce((sum, e) => sum + (e.cart_value || 0), 0)
      const avgOrderValue = purchases > 0 ? totalRevenue / purchases : 0

      const withBump = purchaseEvents.filter(e => (e.products || []).includes('cv-audit-ai'))
      const avgOrderValueWithBump = withBump.length > 0 
        ? withBump.reduce((sum, e) => sum + e.cart_value, 0) / withBump.length 
        : 0

      const withUpsell = purchaseEvents.filter(e => (e.products || []).includes('mentorship-month'))
      const avgOrderValueWithUpsell = withUpsell.length > 0 
        ? withUpsell.reduce((sum, e) => sum + e.cart_value, 0) / withUpsell.length 
        : 0

      const maxOrders = purchaseEvents.filter(e => 
        (e.products || []).includes('cv-audit-ai') && 
        (e.products || []).includes('mentorship-month')
      )
      const avgOrderValueMax = maxOrders.length > 0 
        ? maxOrders.reduce((sum, e) => sum + e.cart_value, 0) / maxOrders.length 
        : 0

      return {
        totalVisitors,
        diagnosticStarts,
        diagnosticCompletions,
        checkoutStarts,
        orderBumpViews,
        orderBumpAccepts,
        upsellViews,
        upsellAccepts,
        purchases,
        diagnosticCompletionRate,
        checkoutConversionRate,
        orderBumpConversionRate,
        upsellConversionRate,
        overallConversionRate,
        avgOrderValue,
        avgOrderValueWithBump,
        avgOrderValueWithUpsell,
        avgOrderValueMax
      }
    } catch (error) {
      console.error('[ConversionTracker] Exception:', error)
      return this.getEmptyAnalytics()
    }
  }

  private getEmptyAnalytics(): FunnelAnalytics {
    return {
      totalVisitors: 0,
      diagnosticStarts: 0,
      diagnosticCompletions: 0,
      checkoutStarts: 0,
      orderBumpViews: 0,
      orderBumpAccepts: 0,
      upsellViews: 0,
      upsellAccepts: 0,
      purchases: 0,
      diagnosticCompletionRate: 0,
      checkoutConversionRate: 0,
      orderBumpConversionRate: 0,
      upsellConversionRate: 0,
      overallConversionRate: 0,
      avgOrderValue: 0,
      avgOrderValueWithBump: 0,
      avgOrderValueWithUpsell: 0,
      avgOrderValueMax: 0
    }
  }
}

// ============================================
// AOV CALCULATOR
// ============================================

export class AOVCalculator {
  private basePrice: number = 10  // Soft Skills Guide

  calculateAOV(
    includeOrderBump: boolean,
    includeUpsell: boolean,
    orderBumpPrice: number = 7,
    upsellPrice: number = 25
  ): number {
    let total = this.basePrice

    if (includeOrderBump) {
      total += orderBumpPrice
    }

    if (includeUpsell) {
      total += upsellPrice
    }

    return total
  }

  calculateAOVIncrease(
    originalAOV: number,
    newAOV: number
  ): { absolute: number; percentage: number } {
    const absolute = newAOV - originalAOV
    const percentage = originalAOV > 0 ? (absolute / originalAOV) * 100 : 0

    return { absolute, percentage }
  }

  getAOVScenarios(): {
    scenario: string
    aov: number
    increase: number
    products: string[]
  }[] {
    return [
      {
        scenario: 'Base (solo guía)',
        aov: this.basePrice,
        increase: 0,
        products: ['soft-skills-guide']
      },
      {
        scenario: 'Con Order Bump',
        aov: this.calculateAOV(true, false),
        increase: 70,  // 70% increase
        products: ['soft-skills-guide', 'cv-audit-ai']
      },
      {
        scenario: 'Con Upsell',
        aov: this.calculateAOV(false, true),
        increase: 250,  // 250% increase
        products: ['soft-skills-guide', 'mentorship-month']
      },
      {
        scenario: 'Máximo (todo)',
        aov: this.calculateAOV(true, true),
        increase: 320,  // 320% increase
        products: ['soft-skills-guide', 'cv-audit-ai', 'mentorship-month']
      }
    ]
  }

  calculateExpectedRevenue(
    visitors: number,
    conversionRate: number,
    orderBumpRate: number,
    upsellRate: number
  ): {
    baseRevenue: number
    revenueWithBumps: number
    revenueIncrease: number
    revenueIncreasePercentage: number
  } {
    const conversions = visitors * (conversionRate / 100)
    const baseRevenue = conversions * this.basePrice

    // Calculate revenue with bumps
    const bumpConversions = conversions * (orderBumpRate / 100)
    const upsellConversions = conversions * (upsellRate / 100)
    
    const bumpRevenue = bumpConversions * 7
    const upsellRevenue = upsellConversions * 25
    
    const revenueWithBumps = baseRevenue + bumpRevenue + upsellRevenue
    const revenueIncrease = revenueWithBumps - baseRevenue
    const revenueIncreasePercentage = baseRevenue > 0 
      ? (revenueIncrease / baseRevenue) * 100 
      : 0

    return {
      baseRevenue,
      revenueWithBumps,
      revenueIncrease,
      revenueIncreasePercentage
    }
  }
}

// ============================================
// FACTORY & SINGLETON
// ============================================

let orderBumpManagerInstance: OrderBumpManager | null = null
let upsellManagerInstance: UpsellManager | null = null
let conversionTrackerInstance: ConversionTracker | null = null
let aovCalculatorInstance: AOVCalculator | null = null

export function getOrderBumpManager(): OrderBumpManager {
  if (!orderBumpManagerInstance) {
    orderBumpManagerInstance = new OrderBumpManager()
  }
  return orderBumpManagerInstance
}

export function getUpsellManager(): UpsellManager {
  if (!upsellManagerInstance) {
    upsellManagerInstance = new UpsellManager()
  }
  return upsellManagerInstance
}

export function getConversionTracker(): ConversionTracker {
  if (!conversionTrackerInstance) {
    conversionTrackerInstance = new ConversionTracker()
  }
  return conversionTrackerInstance
}

export function getAOVCalculator(): AOVCalculator {
  if (!aovCalculatorInstance) {
    aovCalculatorInstance = new AOVCalculator()
  }
  return aovCalculatorInstance
}

// ============================================
// HELPER FUNCTIONS
// ============================================

export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function trackFunnelStep(
  sessionId: string,
  eventType: FunnelEvent['eventType'],
  cartValue: number,
  products: string[],
  metadata?: Record<string, any>
): void {
  const tracker = getConversionTracker()
  
  tracker.trackEvent({
    sessionId,
    eventType,
    timestamp: new Date().toISOString(),
    cartValue,
    products,
    metadata
  })
}
