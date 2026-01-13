import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// GET /api/ceo/funnel-analytics
// Obtiene métricas de conversión del funnel de ventas y AOV
export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1. Obtener eventos del funnel
    const { data: funnelEvents, error: eventsError } = await supabase
      .from('funnel_events')
      .select('event_name, created_at')
      .order('created_at', { ascending: false })

    if (eventsError) {
      console.error('Error fetching funnel events:', eventsError)
      throw eventsError
    }

    // 2. Obtener datos de order bumps y upsells
    const { data: orderBumps, error: bumpError } = await supabase
      .from('order_bump_tracking')
      .select('accepted, created_at')

    if (bumpError) {
      console.error('Error fetching order bumps:', bumpError)
    }

    const { data: upsells, error: upsellError } = await supabase
      .from('upsell_tracking')
      .select('accepted, created_at')

    if (upsellError) {
      console.error('Error fetching upsells:', upsellError)
    }

    // 3. Obtener todas las órdenes completadas
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'completed')
      .order('created_at', { ascending: false })

    if (ordersError) {
      console.error('Error fetching orders:', ordersError)
      throw ordersError
    }

    // 4. Calcular métricas del funnel
    const eventCounts = {
      landing_view: funnelEvents?.filter(e => e.event_name === 'landing_view').length || 0,
      diagnostic_start: funnelEvents?.filter(e => e.event_name === 'diagnostic_start').length || 0,
      diagnostic_complete: funnelEvents?.filter(e => e.event_name === 'diagnostic_complete').length || 0,
      checkout_start: funnelEvents?.filter(e => e.event_name === 'checkout_start').length || 0,
      order_bump_view: funnelEvents?.filter(e => e.event_name === 'order_bump_view').length || 0,
      payment_start: funnelEvents?.filter(e => e.event_name === 'payment_start').length || 0,
      payment_success: funnelEvents?.filter(e => e.event_name === 'payment_success').length || 0,
      upsell_view: funnelEvents?.filter(e => e.event_name === 'upsell_view').length || 0
    }

    // 5. Calcular tasas de conversión
    const conversionRates = {
      landing_to_diagnostic: eventCounts.landing_view > 0 
        ? (eventCounts.diagnostic_start / eventCounts.landing_view) * 100 
        : 0,
      diagnostic_to_checkout: eventCounts.diagnostic_complete > 0 
        ? (eventCounts.checkout_start / eventCounts.diagnostic_complete) * 100 
        : 0,
      checkout_to_payment: eventCounts.checkout_start > 0 
        ? (eventCounts.payment_start / eventCounts.checkout_start) * 100 
        : 0,
      payment_to_success: eventCounts.payment_start > 0 
        ? (eventCounts.payment_success / eventCounts.payment_start) * 100 
        : 0,
      overall_conversion: eventCounts.landing_view > 0 
        ? (eventCounts.payment_success / eventCounts.landing_view) * 100 
        : 0
    }

    // 6. Calcular drop-off rates
    const dropOffRates = {
      landing: eventCounts.landing_view > 0 
        ? ((eventCounts.landing_view - eventCounts.diagnostic_start) / eventCounts.landing_view) * 100 
        : 0,
      diagnostic: eventCounts.diagnostic_start > 0 
        ? ((eventCounts.diagnostic_start - eventCounts.diagnostic_complete) / eventCounts.diagnostic_start) * 100 
        : 0,
      checkout: eventCounts.checkout_start > 0 
        ? ((eventCounts.checkout_start - eventCounts.payment_start) / eventCounts.checkout_start) * 100 
        : 0,
      payment: eventCounts.payment_start > 0 
        ? ((eventCounts.payment_start - eventCounts.payment_success) / eventCounts.payment_start) * 100 
        : 0
    }

    // 7. Calcular métricas de Order Bump
    const orderBumpMetrics = {
      total_views: orderBumps?.length || 0,
      accepted: orderBumps?.filter(b => b.accepted).length || 0,
      rejected: orderBumps?.filter(b => !b.accepted).length || 0,
      acceptance_rate: orderBumps && orderBumps.length > 0
        ? (orderBumps.filter(b => b.accepted).length / orderBumps.length) * 100
        : 0
    }

    // 8. Calcular métricas de Upsell
    const upsellMetrics = {
      total_views: upsells?.length || 0,
      accepted: upsells?.filter(u => u.accepted).length || 0,
      rejected: upsells?.filter(u => !u.accepted).length || 0,
      acceptance_rate: upsells && upsells.length > 0
        ? (upsells.filter(u => u.accepted).length / upsells.length) * 100
        : 0
    }

    // 9. Calcular AOV (Average Order Value)
    const basePrice = 10 // Guía de Soft Skills
    const orderBumpPrice = 7 // CV Audit
    const upsellPrice = 25 // Mentoría

    // AOV total considerando todas las órdenes
    const totalRevenue = orders?.reduce((sum, order) => {
      const orderTotal = order.total_amount || basePrice
      return sum + orderTotal
    }, 0) || 0

    const averageOrderValue = orders && orders.length > 0 
      ? totalRevenue / orders.length 
      : 0

    // AOV breakdown
    const aovBreakdown = {
      base_product: {
        name: 'Guía Soft Skills',
        price: basePrice,
        conversion_rate: 100, // Base del funnel
        aov_contribution: basePrice
      },
      order_bump: {
        name: 'Auditor CV (Bump)',
        price: orderBumpPrice,
        conversion_rate: orderBumpMetrics.acceptance_rate,
        aov_contribution: (orderBumpPrice * orderBumpMetrics.acceptance_rate) / 100
      },
      upsell: {
        name: 'Mentoría (Upsell)',
        price: upsellPrice,
        conversion_rate: upsellMetrics.acceptance_rate,
        aov_contribution: (upsellPrice * upsellMetrics.acceptance_rate) / 100
      }
    }

    const projectedAOV = 
      aovBreakdown.base_product.aov_contribution +
      aovBreakdown.order_bump.aov_contribution +
      aovBreakdown.upsell.aov_contribution

    // 10. Métricas de revenue
    const revenueMetrics = {
      total_orders: orders?.length || 0,
      total_revenue: totalRevenue,
      average_order_value: averageOrderValue,
      projected_aov: projectedAOV,
      base_product_revenue: orders?.length ? orders.length * basePrice : 0,
      order_bump_revenue: orderBumpMetrics.accepted * orderBumpPrice,
      upsell_revenue: upsellMetrics.accepted * upsellPrice,
      revenue_lift_percentage: basePrice > 0 
        ? ((projectedAOV - basePrice) / basePrice) * 100 
        : 0
    }

    // 11. Time series data (últimos 30 días)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentOrders = orders?.filter(
      o => new Date(o.created_at) >= thirtyDaysAgo
    ) || []

    const dailyMetrics = Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (29 - i))
      date.setHours(0, 0, 0, 0)
      
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const dayOrders = recentOrders.filter(o => {
        const orderDate = new Date(o.created_at)
        return orderDate >= date && orderDate < nextDate
      })

      const dayRevenue = dayOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
      const dayAOV = dayOrders.length > 0 ? dayRevenue / dayOrders.length : 0

      return {
        date: date.toISOString().split('T')[0],
        orders: dayOrders.length,
        revenue: dayRevenue,
        aov: dayAOV
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        funnel: {
          events: eventCounts,
          conversion_rates: conversionRates,
          drop_off_rates: dropOffRates
        },
        order_bump: orderBumpMetrics,
        upsell: upsellMetrics,
        aov: {
          current: averageOrderValue,
          projected: projectedAOV,
          breakdown: aovBreakdown
        },
        revenue: revenueMetrics,
        trends: {
          daily: dailyMetrics,
          period: '30_days'
        }
      }
    })

  } catch (error) {
    console.error('Error in /api/ceo/funnel-analytics:', error)
    return NextResponse.json(
      { 
        error: 'Error al obtener analytics del funnel',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
