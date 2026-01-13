import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

    // 1. OpenAI API Status (from cv_audits)
    const { data: audits, error: auditsError } = await supabase
      .from('cv_audits')
      .select('response_time, status, created_at')
      .gte('created_at', oneDayAgo.toISOString())

    if (auditsError) throw auditsError

    const totalRequests = audits?.length || 0
    const failedRequests = audits?.filter(a => a.status === 'failed').length || 0
    const successRate = totalRequests > 0
      ? ((totalRequests - failedRequests) / totalRequests) * 100
      : 100

    const avgResponseTime = audits && audits.length > 0
      ? audits.reduce((sum, a) => sum + (a.response_time || 0), 0) / audits.length
      : 0

    let openaiStatus: 'healthy' | 'degraded' | 'down'
    if (successRate >= 95 && avgResponseTime < 5000) {
      openaiStatus = 'healthy'
    } else if (successRate >= 90 || avgResponseTime < 10000) {
      openaiStatus = 'degraded'
    } else {
      openaiStatus = 'down'
    }

    // 2. Stripe Logs (from payments and abandoned_carts)
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .gte('created_at', oneDayAgo.toISOString())
      .order('created_at', { ascending: false })

    if (paymentsError) throw paymentsError

    const { data: abandonedCarts, error: cartsError } = await supabase
      .from('abandoned_carts')
      .select('*')
      .gte('created_at', oneDayAgo.toISOString())
      .order('created_at', { ascending: false })

    if (cartsError) throw cartsError

    // Transform to logs format
    const stripeLogs = [
      ...(payments?.map(p => ({
        id: p.id,
        type: p.status === 'succeeded' ? 'payment_success' : 'payment_failed' as const,
        amount: p.amount / 100,
        email: p.user_email || 'unknown',
        timestamp: p.created_at,
        message: p.status === 'succeeded'
          ? 'Pago exitoso'
          : 'Pago fallido'
      })) || []),
      ...(abandonedCarts?.map(cart => ({
        id: cart.id,
        type: 'cart_abandoned' as const,
        amount: cart.total_amount,
        email: cart.user_email,
        timestamp: cart.abandoned_at,
        message: 'Carrito abandonado'
      })) || [])
    ]

    // Sort by timestamp (most recent first)
    stripeLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return NextResponse.json({
      success: true,
      openai: {
        avgResponseTime,
        successRate,
        totalRequests,
        failedRequests,
        status: openaiStatus
      },
      stripeLogs: stripeLogs.slice(0, 20) // Last 20 logs
    })

  } catch (error) {
    console.error('Error fetching system health:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
