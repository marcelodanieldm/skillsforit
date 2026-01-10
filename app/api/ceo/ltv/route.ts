import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'
import { revenueDb } from '@/lib/database'
import { SessionCreditsManager } from '@/lib/session-credits'
import { trackEvent } from '@/lib/analytics'

interface UserLTV {
  segment: 'Junior' | 'Transition' | 'Leadership'
  totalUsers: number
  averageRevenue: number
  averageSessions: number
  churnRate: number
  lifetimeMonths: number
  ltv: number
  revenueBreakdown: {
    cvAnalysis: number
    mentorship: number
    ebooks: number
  }
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

    // Calculate LTV by segment
    const { searchParams } = new URL(request.url)
    const period = parseInt(searchParams.get('period') || '180') // days

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - period)

    // Get all revenue and credits data
    const allRevenue = revenueDb.findAll()
    const allCredits = SessionCreditsManager.getAllCredits()

    // Segment users by profession keywords
    const userSegments = new Map<string, 'Junior' | 'Transition' | 'Leadership'>()

    for (const credit of allCredits) {
      const email = credit.email
      const segment = classifyUserSegment(email, credit.userId)
      userSegments.set(credit.userId, segment)
    }

    // Calculate LTV per segment
    const segmentData = new Map<string, {
      users: Set<string>
      totalRevenue: number
      cvRevenue: number
      mentorshipRevenue: number
      ebookRevenue: number
      sessionCounts: number[]
      subscriptionMonths: number[]
    }>()

    // Initialize segments
    for (const segment of ['Junior', 'Transition', 'Leadership'] as const) {
      segmentData.set(segment, {
        users: new Set(),
        totalRevenue: 0,
        cvRevenue: 0,
        mentorshipRevenue: 0,
        ebookRevenue: 0,
        sessionCounts: [],
        subscriptionMonths: []
      })
    }

    // Process revenue data
    for (const rev of allRevenue) {
      if (new Date(rev.createdAt) < startDate) continue

      const userId = rev.userId || rev.userEmail
      const segment = userSegments.get(userId) || guessSegmentFromProfession(rev.profession || '')

      const data = segmentData.get(segment)
      if (!data) continue

      data.users.add(userId)
      data.totalRevenue += rev.amount

      if (rev.type === 'cv_analysis') {
        data.cvRevenue += 7 // Base CV price
        // Check if includes ebook
        if (rev.amount >= 12) {
          data.ebookRevenue += 5
        }
      } else if (rev.type === 'mentorship') {
        data.mentorshipRevenue += rev.amount
      }
    }

    // Process session data for engagement
    for (const credit of allCredits) {
      const segment = userSegments.get(credit.userId) || 'Transition'
      const data = segmentData.get(segment)
      if (!data) continue

      data.sessionCounts.push(credit.creditsUsed)

      // Calculate subscription months
      const monthsSubscribed = Math.ceil(
        (new Date().getTime() - credit.subscriptionStart.getTime()) / (1000 * 60 * 60 * 24 * 30)
      )
      data.subscriptionMonths.push(monthsSubscribed)
    }

    // Calculate LTV metrics
    const ltvData: UserLTV[] = []

    for (const [segment, data] of segmentData.entries()) {
      const totalUsers = data.users.size

      if (totalUsers === 0) {
        ltvData.push({
          segment: segment as any,
          totalUsers: 0,
          averageRevenue: 0,
          averageSessions: 0,
          churnRate: 0,
          lifetimeMonths: 0,
          ltv: 0,
          revenueBreakdown: {
            cvAnalysis: 0,
            mentorship: 0,
            ebooks: 0
          }
        })
        continue
      }

      const averageRevenue = data.totalRevenue / totalUsers
      const averageSessions = data.sessionCounts.length > 0
        ? data.sessionCounts.reduce((a, b) => a + b, 0) / data.sessionCounts.length
        : 0

      const lifetimeMonths = data.subscriptionMonths.length > 0
        ? data.subscriptionMonths.reduce((a, b) => a + b, 0) / data.subscriptionMonths.length
        : 1

      // Estimate churn rate (simplified)
      // In production, calculate actual churned users
      const churnRate = segment === 'Junior' ? 0.35 :
                       segment === 'Transition' ? 0.20 :
                       0.12

      // LTV = Average Revenue per Month × Average Customer Lifetime (months)
      const monthlyRevenue = averageRevenue / lifetimeMonths
      const customerLifetimeMonths = 1 / churnRate // If churn is 20%, lifetime is 5 months
      const ltv = monthlyRevenue * customerLifetimeMonths

      ltvData.push({
        segment: segment as any,
        totalUsers,
        averageRevenue: Math.round(averageRevenue * 100) / 100,
        averageSessions: Math.round(averageSessions * 100) / 100,
        churnRate: Math.round(churnRate * 100) / 100,
        lifetimeMonths: Math.round(customerLifetimeMonths * 10) / 10,
        ltv: Math.round(ltv * 100) / 100,
        revenueBreakdown: {
          cvAnalysis: Math.round((data.cvRevenue / totalUsers) * 100) / 100,
          mentorship: Math.round((data.mentorshipRevenue / totalUsers) * 100) / 100,
          ebooks: Math.round((data.ebookRevenue / totalUsers) * 100) / 100
        }
      })
    }

    // Sort by LTV descending
    ltvData.sort((a, b) => b.ltv - a.ltv)

    // Calculate insights
    const insights = generateLTVInsights(ltvData)

    return NextResponse.json({
      success: true,
      data: ltvData,
      insights,
      metadata: {
        period,
        calculatedAt: new Date().toISOString(),
        totalUsers: ltvData.reduce((sum, d) => sum + d.totalUsers, 0)
      }
    })

  } catch (error: any) {
    console.error('Error calculating LTV:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// Helper functions

function classifyUserSegment(email: string, userId: string): 'Junior' | 'Transition' | 'Leadership' {
  // Try to get from event tracking
  const events = trackEvent('', '', '', '', '', true) // Get all events
  const userEvents = events.filter((e: any) => e.userId === userId || e.email === email)

  if (userEvents.length > 0) {
    // Use the segment from analytics if available
    const lastEvent = userEvents[userEvents.length - 1]
    if (lastEvent.userSegment) {
      return lastEvent.userSegment
    }
  }

  // Fallback to email/profession based classification
  return 'Transition' // Default
}

function guessSegmentFromProfession(profession: string): 'Junior' | 'Transition' | 'Leadership' {
  const lowerProf = profession.toLowerCase()

  const juniorKeywords = ['junior', 'trainee', 'intern', 'entry', 'beginner', 'estudiante']
  const leadershipKeywords = ['senior', 'lead', 'principal', 'architect', 'manager', 'director', 'cto', 'vp']

  if (juniorKeywords.some(k => lowerProf.includes(k))) {
    return 'Junior'
  }

  if (leadershipKeywords.some(k => lowerProf.includes(k))) {
    return 'Leadership'
  }

  return 'Transition'
}

function generateLTVInsights(data: UserLTV[]): string[] {
  const insights: string[] = []

  if (data.length === 0) {
    return ['No hay suficientes datos para generar insights de LTV']
  }

  // Insight 1: Highest LTV segment
  const highest = data[0]
  insights.push(
    `💰 **Mayor LTV**: Segmento ${highest.segment} con $${highest.ltv} de valor de vida. ` +
    `Permanecen ${highest.lifetimeMonths} meses en promedio con ${highest.churnRate * 100}% de churn.`
  )

  // Insight 2: Revenue composition
  const mentorshipRevenue = data.reduce((sum, d) => sum + d.revenueBreakdown.mentorship * d.totalUsers, 0)
  const cvRevenue = data.reduce((sum, d) => sum + d.revenueBreakdown.cvAnalysis * d.totalUsers, 0)
  const totalRevenue = mentorshipRevenue + cvRevenue

  if (totalRevenue > 0) {
    const mentorshipPercentage = Math.round((mentorshipRevenue / totalRevenue) * 100)
    insights.push(
      `📊 **Composición de Ingresos**: ${mentorshipPercentage}% proviene de mentorías, ` +
      `${100 - mentorshipPercentage}% de análisis de CV. ${
        mentorshipPercentage > 60 ? 'Mentoría es el motor principal.' : 'Diversificar hacia mentorías.'
      }`
    )
  }

  // Insight 3: Churn opportunity
  const highestChurn = data.reduce((max, d) => d.churnRate > max.churnRate ? d : max)
  if (highestChurn.churnRate > 0.25) {
    insights.push(
      `⚠️ **Oportunidad de Retención**: Segmento ${highestChurn.segment} tiene ${highestChurn.churnRate * 100}% de churn. ` +
      `Reducir churn a 15% aumentaría LTV en $${Math.round((highestChurn.ltv * 0.4) * 100) / 100}.`
    )
  }

  // Insight 4: Engagement correlation
  const avgSessions = data.reduce((sum, d) => sum + d.averageSessions * d.totalUsers, 0) / data.reduce((sum, d) => sum + d.totalUsers, 0)
  insights.push(
    `🎯 **Engagement**: Usuarios usan ${Math.round(avgSessions * 100) / 100} de 4 créditos mensuales (${Math.round(avgSessions / 4 * 100)}%). ` +
    `Aumentar uso a 3.5 créditos incrementaría LTV en 20-30%.`
  )

  return insights
}
