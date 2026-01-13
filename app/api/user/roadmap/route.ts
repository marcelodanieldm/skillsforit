import { NextRequest } from 'next/server'
import { db, notesDb, sessionsDb, roadmapDb } from '@/lib/database'
import { AuthService } from '@/lib/auth'

type RoadmapItem = {
  id: string
  title: string
  completed: boolean
  source: 'mentor' | 'ai'
  sessionId?: string
  createdAt?: string
}

type RoadmapResponse = {
  email: string
  careerScore: {
    cvScore: number
    softSkillsScore: number
    interviewReadiness: number
    total: number
  }
  aiAudits: Array<{
    id: string
    reportUrl?: string
    score?: number
    createdAt: string
  }>
  checklist: RoadmapItem[]
}

export async function GET(req: NextRequest) {
  try {
    // Auth: read token from header
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || ''
    const auth = AuthService.requireRole(token, ['user', 'mentor', 'admin', 'ceo'])
    // Fallback a modo demo si no hay token válido
    const email = auth.authorized && auth.user ? auth.user.email : 'user@example.com'

    // Gather AI CV audits for this user
    const audits = db.findByEmail(email) || []
    const aiAudits = audits
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map(a => ({
        id: a.id,
        reportUrl: a.reportUrl,
        score: a.analysisResult?.score ?? a.analysisResult?.atsScore,
        createdAt: a.createdAt.toISOString()
      }))

    const latestCvScore = aiAudits[0]?.score ?? 0

    // Build checklist from mentor notes' actionItems for this user
    const userSessions = sessionsDb.findByMentee(email)
    const checklist: RoadmapItem[] = []
    const completedSet = roadmapDb.getCompleted(email)
    for (const s of userSessions) {
      const sessionNotes = notesDb.findBySession(s.id)
      for (const n of sessionNotes) {
        (n.actionItems || []).forEach((item, idx) => {
          checklist.push({
            id: `${n.id}_${idx}`,
            title: item,
            completed: completedSet.has(`${n.id}_${idx}`),
            source: 'mentor',
            sessionId: s.id,
            createdAt: n.createdAt.toISOString()
          })
        })
      }
    }

    // Soft skills score proxy: percentage of completed action items (none persisted yet, default 50)
    const softSkillsScore = checklist.length > 0 ? Math.min(100, Math.round((checklist.filter(i => i.completed).length / checklist.length) * 100)) : 50

    // Interview readiness proxy: average of last completed sessions count vs total (simple heuristic)
    const completedCount = userSessions.filter(s => s.status === 'completed').length
    const interviewReadiness = Math.min(100, Math.round((completedCount / Math.max(1, userSessions.length)) * 100))

    const careerScore = {
      cvScore: Math.round(latestCvScore || 0),
      softSkillsScore,
      interviewReadiness,
      total: Math.round((latestCvScore * 0.5) + (softSkillsScore * 0.2) + (interviewReadiness * 0.3))
    }

    // Fallback demo data si no hay registros
    const fallbackAudits = aiAudits.length === 0 ? [{ id: 'demo_audit', reportUrl: '#', score: 72, createdAt: new Date().toISOString() }] : aiAudits
    const fallbackChecklist = checklist.length === 0 ? [
      { id: 'demo_1', title: 'Rehacer sección de experiencia', completed: false, source: 'mentor' as const },
      { id: 'demo_2', title: 'Practicar el Elevator Pitch', completed: true, source: 'mentor' as const }
    ] : checklist

    const payload: RoadmapResponse = {
      email,
      careerScore: aiAudits.length === 0 && checklist.length === 0 ? {
        cvScore: 72,
        softSkillsScore: 50,
        interviewReadiness: 50,
        total: Math.round((72 * 0.5) + (50 * 0.2) + (50 * 0.3))
      } : careerScore,
      aiAudits: fallbackAudits,
      checklist: fallbackChecklist
    }

    return new Response(JSON.stringify(payload), { status: 200, headers: { 'content-type': 'application/json' } })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || 'Internal error' }), { status: 500 })
  }
}
