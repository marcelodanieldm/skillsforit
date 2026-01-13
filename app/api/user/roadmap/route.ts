import { NextRequest } from 'next/server'
import { db, notesDb, sessionsDb, roadmapDb } from '@/lib/database'
import { AuthService } from '@/lib/auth'

type MentorTask = {
  id: number
  task: string
  completed: boolean
}

type ActionPlanResponse = {
  roadmap_status: string
  mentor_tasks: MentorTask[]
  ai_recommendations: string[]
}

export async function GET(req: NextRequest) {
  try {
    // Auth: read token from header
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || ''
    const auth = AuthService.requireRole(token, ['user', 'mentor', 'admin', 'ceo'])
    // Fallback a modo demo si no hay token válido
    const email = auth.authorized && auth.user ? auth.user.email : 'user@example.com'

    // Build mentor_tasks from mentor notes' actionItems for this user
    const userSessions = sessionsDb.findByMentee(email)
    const mentorTasks: MentorTask[] = []
    const completedSet = roadmapDb.getCompleted(email)
    let taskId = 1

    for (const s of userSessions) {
      const sessionNotes = notesDb.findBySession(s.id)
      for (const n of sessionNotes) {
        (n.actionItems || []).forEach((item) => {
          mentorTasks.push({
            id: taskId++,
            task: item,
            completed: completedSet.has(`${n.id}_${mentorTasks.length}`)
          })
        })
      }
    }

    // Generate AI recommendations based on CV analysis
    const audits = db.findByEmail(email) || []
    const latestAudit = audits.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0]
    const aiRecommendations: string[] = []

    if (latestAudit?.analysisResult) {
      const score = latestAudit.analysisResult.score ?? latestAudit.analysisResult.atsScore ?? 0

      if (score < 60) {
        aiRecommendations.push("Tu CV necesita más keywords técnicas específicas de tu rol")
        aiRecommendations.push("Repasa el capítulo 2 del E-book sobre 'Estructura del CV'")
      } else if (score < 80) {
        aiRecommendations.push("Considera agregar métricas cuantificables a tus logros")
        aiRecommendations.push("Repasa el capítulo 4 del E-book sobre 'Logros y Métricas'")
      }

      // Add recommendations from the analysis result
      if (latestAudit.analysisResult.recommendations?.length > 0) {
        aiRecommendations.push(...latestAudit.analysisResult.recommendations.slice(0, 2))
      }
    }

    // Default recommendations if no audit data
    if (aiRecommendations.length === 0) {
      aiRecommendations.push("Tu CV necesita más keywords de Cloud (AWS/Azure)")
      aiRecommendations.push("Repasa el capítulo 3 del E-book sobre Negociación")
    }

    // Fallback demo data si no hay registros
    const fallbackMentorTasks = mentorTasks.length === 0 ? [
      { id: 1, task: "Optimizar perfil de LinkedIn", completed: true },
      { id: 2, task: "Practicar respuesta a 'Háblame de ti'", completed: false }
    ] : mentorTasks

    const payload: ActionPlanResponse = {
      roadmap_status: "in_progress",
      mentor_tasks: fallbackMentorTasks,
      ai_recommendations: aiRecommendations
    }

    return new Response(JSON.stringify(payload), { status: 200, headers: { 'content-type': 'application/json' } })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || 'Internal error' }), { status: 500 })
  }
}
