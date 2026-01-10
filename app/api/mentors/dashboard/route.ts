import { NextRequest, NextResponse } from 'next/server'
import { mentorsDb, sessionsDb } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const mentorId = searchParams.get('mentorId')

    if (!mentorId) {
      return NextResponse.json(
        { error: 'mentorId es requerido' },
        { status: 400 }
      )
    }

    const mentor = mentorsDb.findById(mentorId)
    if (!mentor) {
      return NextResponse.json(
        { error: 'Mentor no encontrado' },
        { status: 404 }
      )
    }

    // Get all sessions for this mentor
    const allSessions = sessionsDb.findByMentor(mentorId)

    // For each upcoming session, check if there's a previous session with notes
    const sessionsWithPreviousNotes = await Promise.all(
      allSessions.map(async (session) => {
        if (session.status === 'scheduled') {
          // Find the most recent completed session with this mentee
          const previousSession = sessionsDb.findPreviousSession(
            mentorId,
            session.menteeEmail,
            session.scheduledAt
          )
          
          return {
            ...session,
            previousNote: previousSession?.notes?.[0] || null
          }
        }
        return session
      })
    )

    return NextResponse.json({
      success: true,
      mentor: {
        id: mentor.id,
        name: mentor.name,
        email: mentor.email,
        expertise: mentor.expertise,
        hourlyRate: mentor.hourlyRate,
        rating: mentor.rating,
        totalSessions: mentor.totalSessions,
        reviewCount: mentor.reviewCount
      },
      sessions: sessionsWithPreviousNotes
    })
  } catch (error: any) {
    console.error('Error fetching mentor dashboard:', error)
    return NextResponse.json(
      { error: 'Error al cargar dashboard: ' + error.message },
      { status: 500 }
    )
  }
}
