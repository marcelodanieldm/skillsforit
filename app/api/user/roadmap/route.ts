import { NextRequest } from 'next/server'
import { db, notesDb, sessionsDb, roadmapDb } from '@/lib/database'
import { AuthService } from '@/lib/auth'
import { queueNotification } from '@/lib/notifications'

type MentorTask = {
  id: number
  task: string
  completed: boolean
}

type ActionPlanResponse = {
  roadmap_status: string
  career_score: {
    cv_score: number
    soft_skills_score: number
    interview_readiness: number
    total: number
  }
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
    const userName = auth.authorized && auth.user ? auth.user.name || auth.user.email : 'Usuario'

    // Obtener score anterior para comparación (solo para usuarios autenticados)
    let previousScore = 0
    if (auth.authorized && auth.user) {
      // En un sistema real, esto vendría de la base de datos
      // Por ahora, usamos un valor almacenado en memoria o localStorage simulado
      previousScore = roadmapDb.getPreviousScore?.(email) || 0
    }

    // Build mentor_tasks from mentor notes' actionItems for this user
    const sessionsForTasks = sessionsDb.findByMentee(email)
    const mentorTasks: MentorTask[] = []
    const completedSet = roadmapDb.getCompleted(email)
    let taskId = 1

    for (const s of sessionsForTasks) {
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

    // Calculate Career Score - key motivator for the virtuous cycle
    const latestCvScore = audits.length > 0 ? (audits[0].analysisResult?.score ?? audits[0].analysisResult?.atsScore ?? 0) : 0
    
    // Soft skills score: percentage of completed mentor tasks
    const completedTasks = mentorTasks.filter(task => task.completed).length
    const softSkillsScore = mentorTasks.length > 0 ? Math.round((completedTasks / mentorTasks.length) * 100) : 0
    
    // Interview readiness: based on completed sessions (assume 5 sessions = 100%)
    const userSessions = sessionsDb.findByMentee(email)
    const completedSessions = userSessions.filter(s => s.status === 'completed').length
    const interviewReadiness = Math.min(100, Math.round((completedSessions / 5) * 100))
    
    // Total career score with weights: 40% CV, 35% Soft Skills, 25% Interview Readiness
    const totalScore = Math.round((latestCvScore * 0.4) + (softSkillsScore * 0.35) + (interviewReadiness * 0.25))
    
    const careerScore = {
      cv_score: Math.round(latestCvScore),
      soft_skills_score: softSkillsScore,
      interview_readiness: interviewReadiness,
      total: totalScore
    }

    // Enviar notificación si el score aumentó significativamente (solo para usuarios autenticados)
    if (auth.authorized && auth.user && totalScore > previousScore && totalScore - previousScore >= 5) {
      try {
        queueNotification({
          type: 'career_score_update',
          userEmail: email,
          userName: userName,
          oldScore: previousScore,
          newScore: totalScore,
          scheduledFor: new Date() // Enviar inmediatamente
        })
        console.log(`Career score notification queued for ${email}: ${previousScore}% -> ${totalScore}%`)
      } catch (notificationError) {
        console.error('Error queuing career score notification:', notificationError)
      }
    }

    // Actualizar score anterior para la próxima comparación
    if (auth.authorized && auth.user) {
      roadmapDb.setPreviousScore?.(email, totalScore)
    }

    // Fallback mentor tasks for demo purposes
    const fallbackMentorTasks: MentorTask[] = [
      { id: 1, task: "Completar tu CV con keywords técnicas", completed: false },
      { id: 2, task: "Preparar 3 preguntas específicas para tu mentor", completed: false },
      { id: 3, task: "Revisar tu perfil de LinkedIn", completed: false }
    ]

    const payload: ActionPlanResponse = {
      roadmap_status: "in_progress",
      career_score: careerScore,
      mentor_tasks: mentorTasks.length > 0 ? mentorTasks : fallbackMentorTasks,
      ai_recommendations: aiRecommendations
    }

    return new Response(JSON.stringify(payload), { status: 200, headers: { 'content-type': 'application/json' } })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || 'Internal error' }), { status: 500 })
  }
}
