import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'
import { AnalyticsMaterializedView } from '@/lib/analytics-materialized-view'
import { trackingEvents } from '@/lib/db'

/**
 * Sprint 17: Analíticas de Embudo con Vista Materializada
 * 
 * Endpoint optimizado que usa vista materializada para cargar
 * instantáneamente sin recalcular miles de transacciones
 * 
 * Métricas:
 * - Visitas (landing_view)
 * - Pagos (payment_completed)
 * - Activaciones (cv_upload_complete)
 * - MRR y LTV por segmento
 */
export async function GET(request: NextRequest) {
  try {
    // Validar autenticación y permisos CEO/Admin
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const auth = AuthService.requireRole(token, ['ceo', 'admin'])

    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error },
        { status: 403 }
      )
    }

    const startTime = Date.now()
    console.log('📊 Cargando analytics desde vista materializada...')

    // Obtener vista materializada (con cache de 5 minutos)
    const materializedView = await AnalyticsMaterializedView.getView()

    // Calcular métricas del embudo
    const funnelMetrics = {
      visits: trackingEvents.filter(e => e.eventType === 'landing_view').length,
      payments: trackingEvents.filter(e => e.eventType === 'payment_completed').length,
      activations: trackingEvents.filter(e => e.eventType === 'cv_upload_complete').length,
      
      // Conversiones
      visitToPayment: 0,
      paymentToActivation: 0,
      visitToActivation: 0
    }

    if (funnelMetrics.visits > 0) {
      funnelMetrics.visitToPayment = (funnelMetrics.payments / funnelMetrics.visits) * 100
      funnelMetrics.visitToActivation = (funnelMetrics.activations / funnelMetrics.visits) * 100
    }

    if (funnelMetrics.payments > 0) {
      funnelMetrics.paymentToActivation = (funnelMetrics.activations / funnelMetrics.payments) * 100
    }

    // Preparar datos para gráfico de barras comparativo
    const comparisonChart = [
      {
        stage: 'Visitas',
        count: funnelMetrics.visits,
        percentage: 100,
        color: '#3b82f6'
      },
      {
        stage: 'Pagos',
        count: funnelMetrics.payments,
        percentage: funnelMetrics.visitToPayment,
        color: '#10b981'
      },
      {
        stage: 'Activaciones',
        count: funnelMetrics.activations,
        percentage: funnelMetrics.visitToActivation,
        color: '#8b5cf6'
      }
    ]

    // Identificar fugas (leaks)
    const leaks = []
    
    const visitToPaymentLoss = funnelMetrics.visits - funnelMetrics.payments
    if (visitToPaymentLoss > 0) {
      leaks.push({
        stage: 'Visita → Pago',
        usersLost: visitToPaymentLoss,
        lossRate: 100 - funnelMetrics.visitToPayment,
        severity: visitToPaymentLoss > (funnelMetrics.visits * 0.7) ? 'Crítico' : 'Alto',
        recommendation: 'Optimizar página de precios y reducir fricción en checkout'
      })
    }

    const paymentToActivationLoss = funnelMetrics.payments - funnelMetrics.activations
    if (paymentToActivationLoss > 0) {
      leaks.push({
        stage: 'Pago → Activación',
        usersLost: paymentToActivationLoss,
        lossRate: 100 - funnelMetrics.paymentToActivation,
        severity: paymentToActivationLoss > (funnelMetrics.payments * 0.3) ? 'Alto' : 'Medio',
        recommendation: 'Mejorar onboarding post-pago y enviar recordatorios de upload'
      })
    }

    // Generar insights automáticos
    const insights = []

    // Insight 1: Conversión principal
    if (funnelMetrics.visitToPayment < 10) {
      insights.push('🔴 Conversión Visita→Pago muy baja (<10%): Revisar propuesta de valor y pricing')
    } else if (funnelMetrics.visitToPayment < 30) {
      insights.push('⚠️ Conversión Visita→Pago por debajo de benchmark (30%): Optimizar landing page')
    } else {
      insights.push('✅ Conversión Visita→Pago saludable (>30%): Mantener estrategia actual')
    }

    // Insight 2: Activación
    if (funnelMetrics.paymentToActivation < 60) {
      insights.push('🔴 Activación baja (<60%): Mejorar UX de upload y enviar emails de seguimiento')
    } else if (funnelMetrics.paymentToActivation < 85) {
      insights.push('⚠️ Activación moderada (60-85%): Implementar tooltips y guías paso a paso')
    } else {
      insights.push('✅ Activación excelente (>85%): Onboarding post-pago efectivo')
    }

    // Insight 3: MRR
    const latestMRR = materializedView.mrr[materializedView.mrr.length - 1]
    if (latestMRR) {
      const mrrGrowth = materializedView.mrr.length > 1 ? 
        ((latestMRR.totalMRR - materializedView.mrr[materializedView.mrr.length - 2].totalMRR) / 
         materializedView.mrr[materializedView.mrr.length - 2].totalMRR * 100) : 0
      
      if (mrrGrowth > 20) {
        insights.push(`🚀 MRR creciendo rápidamente (+${mrrGrowth.toFixed(0)}%): Momento ideal para escalar marketing`)
      } else if (mrrGrowth > 0) {
        insights.push(`📈 MRR en crecimiento (+${mrrGrowth.toFixed(0)}%): Mantener momentum con retención`)
      } else {
        insights.push(`⚠️ MRR estancado o decreciente: Priorizar retención y reducir churn`)
      }
    }

    // Insight 4: LTV por segmento
    const highestLTV = materializedView.ltvBySegment.reduce((max, segment) => 
      segment.ltv > max.ltv ? segment : max
    )
    insights.push(`💰 Mayor LTV: ${highestLTV.segment} ($${highestLTV.ltv}) - Enfocarse en adquisición de este perfil`)

    const loadTime = Date.now() - startTime

    return NextResponse.json({
      success: true,
      data: {
        funnel: {
          metrics: funnelMetrics,
          comparisonChart,
          leaks
        },
        mrr: {
          current: latestMRR?.totalMRR || 0,
          growth: materializedView.mrr.length > 1 ?
            ((latestMRR.totalMRR - materializedView.mrr[materializedView.mrr.length - 2].totalMRR) / 
             materializedView.mrr[materializedView.mrr.length - 2].totalMRR * 100) : 0,
          history: materializedView.mrr.slice(-6), // Últimos 6 meses
          subscribers: latestMRR?.subscriberCount || 0,
          arpu: latestMRR?.averageRevenuePerUser || 0
        },
        ltv: {
          bySegment: materializedView.ltvBySegment,
          highest: highestLTV
        },
        insights
      },
      metadata: {
        loadTime: `${loadTime}ms`,
        cacheAge: `${Math.round((Date.now() - materializedView.lastRefresh.getTime()) / 1000)}s`,
        lastRefresh: materializedView.lastRefresh.toISOString(),
        refreshDuration: `${materializedView.refreshDuration}ms`,
        dataSource: 'Materialized View (Cached)'
      }
    })

  } catch (error: any) {
    console.error('Error loading business analytics:', error)
    return NextResponse.json(
      { error: 'Error al cargar analíticas', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * Forzar refresh de la vista materializada (cronjob o admin action)
 */
export async function POST(request: NextRequest) {
  try {
    // Validar autenticación CEO
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const auth = AuthService.requireRole(token, 'ceo')

    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error },
        { status: 403 }
      )
    }

    console.log('🔄 Forzando refresh de vista materializada...')
    const materializedView = await AnalyticsMaterializedView.forceRefresh()

    return NextResponse.json({
      success: true,
      message: 'Vista materializada actualizada',
      refreshDuration: `${materializedView.refreshDuration}ms`,
      lastRefresh: materializedView.lastRefresh.toISOString()
    })

  } catch (error: any) {
    console.error('Error refreshing materialized view:', error)
    return NextResponse.json(
      { error: 'Error al actualizar vista', details: error.message },
      { status: 500 }
    )
  }
}
