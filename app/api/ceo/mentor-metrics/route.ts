import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface MentorMetrics {
  mentorId: string
  mentorName: string
  mentorEmail: string
  totalSessions: number
  completedSessions: number
  avgRating: number
  retentionRate: number
  totalEarnings: number
  pendingPayout: number
  activeStudents: number
  repeatStudents: number
}

/**
 * GET /api/ceo/mentor-metrics
 * Obtener métricas de rendimiento de todos los mentores
 * Query params: startDate, endDate (opcional)
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = req.nextUrl.searchParams
    
    // Filtros opcionales de fecha
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Obtener todos los mentores
    const { data: mentors, error: mentorsError } = await supabase
      .from('mentors')
      .select(`
        id,
        profiles!inner(
          full_name,
          email
        )
      `)

    if (mentorsError) {
      console.error('Error fetching mentors:', mentorsError)
      return NextResponse.json(
        { success: false, error: mentorsError.message },
        { status: 500 }
      )
    }

    if (!mentors || mentors.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          mentors: [],
          summary: {
            totalMentors: 0,
            avgRetentionRate: 0,
            avgRating: 0,
            totalPendingPayout: 0,
            totalEarningsThisMonth: 0
          }
        }
      })
    }

    // Calcular métricas para cada mentor
    const metricsPromises = mentors.map(async (mentor) => {
      const mentorId = mentor.id

      // 1. Total de sesiones y completadas
      let sessionsQuery = supabase
        .from('mentor_bookings')
        .select('id, status, scheduled_at, amount, user_id', { count: 'exact' })
        .eq('mentor_id', mentorId)

      if (startDate) {
        sessionsQuery = sessionsQuery.gte('scheduled_at', startDate)
      }
      if (endDate) {
        sessionsQuery = sessionsQuery.lte('scheduled_at', endDate)
      }

      const { data: sessions, count: totalSessions } = await sessionsQuery

      const completedSessions = sessions?.filter(s => s.status === 'completed').length || 0

      // 2. Calcular Retention Rate
      // Obtener usuarios únicos que tuvieron sesiones
      const uniqueUsers = [...new Set(sessions?.map(s => s.user_id))]
      
      // Para cada usuario, verificar si tuvo sesiones en al menos 2 meses diferentes
      let repeatStudents = 0
      
      for (const userId of uniqueUsers) {
        const userSessions = sessions?.filter(s => s.user_id === userId) || []
        const months = new Set(
          userSessions.map(s => {
            const date = new Date(s.scheduled_at)
            return `${date.getFullYear()}-${date.getMonth()}`
          })
        )
        
        if (months.size >= 2) {
          repeatStudents++
        }
      }

      const retentionRate = uniqueUsers.length > 0 
        ? (repeatStudents / uniqueUsers.length) * 100 
        : 0

      // 3. Rating promedio (simulado - necesitarías una tabla de ratings)
      // Por ahora, generamos un valor basado en sessions completadas
      const avgRating = completedSessions > 0 
        ? Math.min(5, 3.5 + (completedSessions / 50)) 
        : 0

      // 4. Earnings y Payout
      const { data: wallet } = await supabase
        .from('mentor_wallets')
        .select('balance, total_earned')
        .eq('mentor_id', mentorId)
        .single()

      const totalEarnings = wallet?.total_earned || 0
      const pendingPayout = wallet?.balance || 0

      const profile = Array.isArray((mentor as any).profiles)
        ? (mentor as any).profiles[0]
        : (mentor as any).profiles

      return {
        mentorId,
        mentorName: profile?.full_name || 'Sin nombre',
        mentorEmail: profile?.email || '',
        totalSessions: totalSessions || 0,
        completedSessions,
        avgRating: Math.round(avgRating * 10) / 10,
        retentionRate: Math.round(retentionRate * 10) / 10,
        totalEarnings: Math.round(totalEarnings * 100) / 100,
        pendingPayout: Math.round(pendingPayout * 100) / 100,
        activeStudents: uniqueUsers.length,
        repeatStudents
      } as MentorMetrics
    })

    const mentorMetrics = await Promise.all(metricsPromises)

    // Calcular summary global
    const summary = {
      totalMentors: mentorMetrics.length,
      avgRetentionRate: mentorMetrics.length > 0
        ? Math.round((mentorMetrics.reduce((sum, m) => sum + m.retentionRate, 0) / mentorMetrics.length) * 10) / 10
        : 0,
      avgRating: mentorMetrics.length > 0
        ? Math.round((mentorMetrics.reduce((sum, m) => sum + m.avgRating, 0) / mentorMetrics.length) * 10) / 10
        : 0,
      totalPendingPayout: Math.round(mentorMetrics.reduce((sum, m) => sum + m.pendingPayout, 0) * 100) / 100,
      totalEarningsThisMonth: Math.round(mentorMetrics.reduce((sum, m) => sum + m.totalEarnings, 0) * 100) / 100
    }

    // Ordenar por retention rate descendente
    mentorMetrics.sort((a, b) => b.retentionRate - a.retentionRate)

    return NextResponse.json({
      success: true,
      data: {
        mentors: mentorMetrics,
        summary
      }
    })
  } catch (error: any) {
    console.error('Unexpected error in GET /api/ceo/mentor-metrics:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
