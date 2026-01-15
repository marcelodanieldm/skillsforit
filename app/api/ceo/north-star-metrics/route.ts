import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(req: Request) {
  const supabase = getSupabase()
  try {
    const { searchParams } = new URL(req.url)
    const filter = searchParams.get('filter') || 'month' // day, week, month

    // Sprint 29: Usar vista business_summary para optimización
    // Un solo query en lugar de múltiples joins
    const { data: summary, error } = await supabase
      .from('business_summary')
      .select('*')
      .single()

    if (error) throw error

    // Extraer métricas según el filtro de tiempo
    let grossRevenue = 0
    let netMargin = 0
    let netMarginPercentage = 0
    let cac = 0
    let totalCosts = 0
    let openaiCosts = 0
    let mentorCommissions = 0
    let newUsersCount = 0

    switch (filter) {
      case 'day':
        grossRevenue = summary.revenue_today || 0
        netMargin = summary.net_margin_today || 0
        netMarginPercentage = summary.margin_percentage_today || 0
        cac = summary.cac_today || 0
        totalCosts = summary.total_costs_today || 0
        openaiCosts = summary.openai_cost_today || 0
        mentorCommissions = summary.mentor_cost_today || 0
        newUsersCount = summary.new_users_today || 0
        break
      case 'week':
        grossRevenue = summary.revenue_week || 0
        netMargin = summary.net_margin_week || 0
        netMarginPercentage = summary.margin_percentage_week || 0
        cac = summary.cac_week || 0
        totalCosts = summary.total_costs_week || 0
        openaiCosts = summary.openai_cost_week || 0
        mentorCommissions = summary.mentor_cost_week || 0
        newUsersCount = summary.new_users_week || 0
        break
      case 'month':
      default:
        grossRevenue = summary.revenue_month || 0
        netMargin = summary.net_margin_month || 0
        netMarginPercentage = summary.margin_percentage_month || 0
        cac = summary.cac_month || 0
        totalCosts = summary.total_costs_month || 0
        openaiCosts = summary.openai_cost_month || 0
        mentorCommissions = summary.mentor_cost_month || 0
        newUsersCount = summary.new_users_month || 0
        break
    }

    const ltv = summary.ltv_total || 0
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
        conversionRates: {
          cvAudit: summary.conversion_cv_audit || 0,
          mentorship: summary.conversion_mentorship || 0,
          softSkills: summary.conversion_soft_skills || 0
        },
        ltvByProduct: {
          cvAudit: summary.ltv_cv_audit || 0,
          mentorship: summary.ltv_mentorship || 0,
          softSkills: summary.ltv_soft_skills || 0
        },
        metadata: {
          filter,
          newUsersCount,
          excludesTestPayments: true
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
