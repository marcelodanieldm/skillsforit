import { NextRequest, NextResponse } from 'next/server'
import { userChecklistDB } from '@/lib/database'
import { cvAnalysisDB, sessionsDB } from '@/lib/database'
import { AuthService } from '@/lib/auth'

/**
 * GET /api/ceo/student-engagement
 * 
 * Métricas de engagement del alumno para el CEO:
 * 1. Task Completion Rate: % de tareas de mentores que los alumnos marcan como hechas
 * 2. Daily Active Users (DAU): ¿Entran los alumnos a revisar su progreso?
 * 3. Time to Download: ¿Cuánto tardan en descargar el E-book tras la compra?
 */
export async function GET(req: NextRequest) {
  try {
    // Auth: verificar que es CEO
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.split(' ')[1]
    
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const validation = AuthService.validateSession(token)
    if (!validation.valid || validation.session?.role !== 'ceo') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    // 1. Task Completion Rate
    const taskCompletionRate = calculateTaskCompletionRate()

    // 2. Daily Active Users (DAU)
    const dauData = calculateDAU()

    // 3. Time to Download E-book
    const timeToDownload = calculateTimeToDownload()

    return NextResponse.json({
      taskCompletionRate,
      dailyActiveUsers: dauData,
      timeToDownload,
      generatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error en student-engagement API:', error)
    return NextResponse.json(
      { error: 'Error al calcular métricas de engagement' },
      { status: 500 }
    )
  }
}

/**
 * 1. Task Completion Rate
 * % de action items marcados como completados por todos los alumnos
 */
function calculateTaskCompletionRate() {
  const allChecklistData = Array.from(userChecklistDB.entries())
  
  if (allChecklistData.length === 0) {
    return {
      completionRate: 0,
      totalTasks: 0,
      completedTasks: 0,
      activeStudents: 0
    }
  }

  let totalTasks = 0
  let completedTasks = 0
  const activeStudents = allChecklistData.length

  allChecklistData.forEach(([email, completedIds]) => {
    // Cada alumno tiene un Set de IDs completados
    const studentCompletedCount = completedIds.size
    completedTasks += studentCompletedCount

    // Suponemos que cada alumno tiene ~8-10 action items promedio
    // En producción, esto vendría de la DB real
    totalTasks += 10
  })

  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  return {
    completionRate: Math.round(completionRate * 10) / 10, // 1 decimal
    totalTasks,
    completedTasks,
    activeStudents
  }
}

/**
 * 2. Daily Active Users (DAU)
 * Simulamos tracking de última actividad en el dashboard
 * En producción: registrar cada vez que un alumno abre /user/dashboard
 */
function calculateDAU() {
  // En MVP: usamos sesiones completadas como proxy de engagement
  const allSessions = Array.from(sessionsDB.values())
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

  // Usuarios únicos con sesión hoy
  const usersToday = new Set(
    allSessions
      .filter(s => s.scheduledAt >= today)
      .map(s => s.menteeEmail)
  ).size

  // Usuarios únicos con sesión ayer
  const usersYesterday = new Set(
    allSessions
      .filter(s => s.scheduledAt >= yesterday && s.scheduledAt < today)
      .map(s => s.menteeEmail)
  ).size

  // Usuarios únicos esta semana
  const usersThisWeek = new Set(
    allSessions
      .filter(s => s.scheduledAt >= weekAgo)
      .map(s => s.menteeEmail)
  ).size

  // Insight: ¿los alumnos solo entran el día de la mentoría?
  const onlyMentorshipDays = usersToday === 0 && usersThisWeek > 0

  return {
    dau: usersToday,
    dauYesterday: usersYesterday,
    wau: usersThisWeek, // Weekly Active Users
    trend: usersYesterday > 0 
      ? ((usersToday - usersYesterday) / usersYesterday * 100).toFixed(1) + '%'
      : 'N/A',
    insight: onlyMentorshipDays 
      ? 'Alumnos solo activos en días de mentoría'
      : 'Alumnos activos fuera de mentorías'
  }
}

/**
 * 3. Time to Download E-book
 * ¿Cuánto tardan en descargar tras la compra?
 * En MVP: usamos CV audits como proxy (tiempo entre pago y primera descarga de reporte)
 */
function calculateTimeToDownload() {
  const allAnalyses = Array.from(cvAnalysisDB.values())
  const completedAnalyses = allAnalyses.filter(
    a => a.paymentStatus === 'completed' && a.analysisStatus === 'completed'
  )

  if (completedAnalyses.length === 0) {
    return {
      avgTimeToDownloadHours: 0,
      medianTimeToDownloadHours: 0,
      totalPurchases: 0,
      downloadRate: 0
    }
  }

  // Simular tiempo de descarga: diferencia entre createdAt y updatedAt
  const downloadTimes = completedAnalyses.map(a => {
    const diffMs = a.updatedAt.getTime() - a.createdAt.getTime()
    return diffMs / (1000 * 60 * 60) // horas
  })

  const avgTime = downloadTimes.reduce((sum, t) => sum + t, 0) / downloadTimes.length
  const sortedTimes = [...downloadTimes].sort((a, b) => a - b)
  const medianTime = sortedTimes[Math.floor(sortedTimes.length / 2)]

  // Download Rate: % de compras que resultaron en descarga
  const totalPurchases = allAnalyses.filter(a => a.paymentStatus === 'completed').length
  const downloadRate = (completedAnalyses.length / totalPurchases) * 100

  return {
    avgTimeToDownloadHours: Math.round(avgTime * 10) / 10,
    medianTimeToDownloadHours: Math.round(medianTime * 10) / 10,
    totalPurchases,
    downloadRate: Math.round(downloadRate * 10) / 10,
    insight: avgTime < 1 
      ? 'Descarga inmediata tras pago ✅'
      : avgTime > 24
      ? 'Demora >24h en descargar ⚠️'
      : 'Descarga dentro de 24h'
  }
}
