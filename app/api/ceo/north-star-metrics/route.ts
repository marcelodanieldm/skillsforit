import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const filter = searchParams.get('filter') || 'month' // day, week, month

    // Calculate date range
    const now = new Date()
    let startDate: Date

    switch (filter) {
      case 'day':
        startDate = new Date(now.setHours(0, 0, 0, 0))
        break
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7))
        break
      case 'month':
      default:
        startDate = new Date(now.setDate(now.getDate() - 30))
        break
    }

    // 1. Calculate Gross Revenue (from Stripe payments)
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('amount, status, created_at')
      .eq('status', 'succeeded')
      .gte('created_at', startDate.toISOString())

    if (paymentsError) throw paymentsError

    const grossRevenue = payments?.reduce((sum, p) => sum + (p.amount / 100), 0) || 0

    // 2. Calculate OpenAI Costs (from cv_audits table)
    const { data: audits, error: auditsError } = await supabase
      .from('cv_audits')
      .select('tokens_used, created_at')
      .gte('created_at', startDate.toISOString())

    if (auditsError) throw auditsError

    // OpenAI pricing: ~$0.002 per 1K tokens (GPT-4 input+output average)
    const totalTokens = audits?.reduce((sum, a) => sum + (a.tokens_used || 0), 0) || 0
    const openaiCosts = (totalTokens / 1000) * 0.002

    // 3. Calculate Mentor Commissions (70% of mentorship fees)
    const { data: mentorships, error: mentorshipsError } = await supabase
      .from('mentor_bookings')
      .select('amount, status, created_at')
      .eq('status', 'completed')
      .gte('created_at', startDate.toISOString())

    if (mentorshipsError) throw mentorshipsError

    const mentorCommissions = mentorships?.reduce((sum, m) => sum + (m.amount * 0.7), 0) || 0

    // 4. Calculate Total Costs
    const totalCosts = openaiCosts + mentorCommissions

    // 5. Calculate Net Margin
    const netMargin = grossRevenue - totalCosts
    const netMarginPercentage = grossRevenue > 0 ? (netMargin / grossRevenue) * 100 : 0

    // 6. Calculate CAC (Cost of Acquisition)
    // For organic LinkedIn traffic, we estimate time cost
    // Assumption: 5 hours/week content creation = $50/week (at $10/hr opportunity cost)
    // Distributed across new users acquired in the period

    const { data: newUsers, error: usersError } = await supabase
      .from('profiles')
      .select('id, created_at')
      .gte('created_at', startDate.toISOString())

    if (usersError) throw usersError

    const userCount = newUsers?.length || 1 // Avoid division by zero

    // Calculate marketing time cost based on filter
    let marketingCost = 0
    switch (filter) {
      case 'day':
        marketingCost = 50 / 7 // ~$7/day
        break
      case 'week':
        marketingCost = 50
        break
      case 'month':
        marketingCost = 50 * 4.3 // ~$215/month
        break
    }

    const cac = marketingCost / userCount

    // 7. Calculate LTV (Lifetime Value)
    // LTV = Average revenue per user across all products

    const { data: userPurchases, error: purchasesError } = await supabase
      .from('payments')
      .select('user_id, amount')
      .eq('status', 'succeeded')

    if (purchasesError) throw purchasesError

    // Group by user and sum amounts
    const userTotals = new Map<string, number>()
    userPurchases?.forEach((p) => {
      const current = userTotals.get(p.user_id) || 0
      userTotals.set(p.user_id, current + (p.amount / 100))
    })

    const ltv = userTotals.size > 0
      ? Array.from(userTotals.values()).reduce((sum, val) => sum + val, 0) / userTotals.size
      : 0

    // 8. Calculate LTV:CAC Ratio
    const ltvCacRatio = cac > 0 ? ltv / cac : 0

    return NextResponse.json({
      success: true,
      data: {
        grossRevenue,
        netMargin,
        netMarginPercentage,
        cac,
        ltv,
        ltvCacRatio,
        costs: {
          openaiCosts,
          mentorCommissions,
          totalCosts
        },
        metadata: {
          filter,
          startDate: startDate.toISOString(),
          endDate: new Date().toISOString(),
          totalPayments: payments?.length || 0,
          totalAudits: audits?.length || 0,
          totalMentorships: mentorships?.length || 0,
          newUsersCount: userCount
        }
      }
    })

  } catch (error) {
    console.error('Error fetching north star metrics:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
