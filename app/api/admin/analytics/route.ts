import { NextRequest, NextResponse } from 'next/server'
import { revenueDb, db, sessionsDb } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const professionFilter = searchParams.get('profession')

    // Get all revenue data
    let revenueData = revenueDb.findAll()

    // Apply profession filter if specified
    if (professionFilter && professionFilter !== 'all') {
      revenueData = revenueDb.findByProfession(professionFilter)
    }

    // Calculate KPIs
    const totalRevenue = professionFilter && professionFilter !== 'all'
      ? revenueData.reduce((sum, r) => sum + r.amount, 0)
      : revenueDb.getTotalRevenue()

    const revenueByType = revenueDb.getRevenueByType()
    const revenueByProfession = revenueDb.getRevenueByProfession()
    const revenueByCountry = revenueDb.getRevenueByCountry()
    const dailyRevenue = revenueDb.getDailyRevenue(30)

    // Total customers
    const allAnalyses = db.findAll()
    const totalCustomers = new Set(allAnalyses.map(a => a.email)).size

    // Total mentorship sessions
    const allSessions = sessionsDb.findAll()
    const completedSessions = allSessions.filter(s => s.status === 'completed').length

    // Calculate growth (mock projection for now)
    const last30DaysRevenue = dailyRevenue.reduce((sum, d) => sum + d.revenue, 0)
    const avgDailyRevenue = last30DaysRevenue / 30
    const projectedMonthlyRevenue = avgDailyRevenue * 30

    // Get unique professions for filter
    const professions = Array.from(
      new Set(allAnalyses.map(a => a.profession).filter(p => p))
    ).sort()

    // Revenue breakdown by service type
    const cvAnalysisRevenue = revenueByType.cv_analysis.revenue
    const mentorshipRevenue = revenueByType.mentorship.revenue

    return NextResponse.json({
      success: true,
      kpis: {
        totalRevenue,
        totalCustomers,
        completedSessions,
        avgRevenuePerCustomer: totalCustomers > 0 ? totalRevenue / totalCustomers : 0,
        projectedMonthlyRevenue
      },
      revenueByType: {
        cvAnalysis: {
          count: revenueByType.cv_analysis.count,
          revenue: cvAnalysisRevenue,
          percentage: totalRevenue > 0 ? (cvAnalysisRevenue / totalRevenue) * 100 : 0
        },
        mentorship: {
          count: revenueByType.mentorship.count,
          revenue: mentorshipRevenue,
          percentage: totalRevenue > 0 ? (mentorshipRevenue / totalRevenue) * 100 : 0
        }
      },
      revenueByProfession: revenueByProfession.map(item => ({
        ...item,
        percentage: totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0
      })),
      revenueByCountry,
      dailyRevenue,
      professions,
      currentFilter: professionFilter || 'all',
      totalRecords: revenueData.length
    })
  } catch (error: any) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Error al cargar analytics: ' + error.message },
      { status: 500 }
    )
  }
}
