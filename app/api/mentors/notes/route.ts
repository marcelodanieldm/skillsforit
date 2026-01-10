import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { notesDb, sessionsDb } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, mentorId, content, topics, actionItems, nextSteps } = body

    if (!sessionId || !mentorId || !content) {
      return NextResponse.json(
        { error: 'sessionId, mentorId y content son requeridos' },
        { status: 400 }
      )
    }

    // Verify session exists
    const session = sessionsDb.findById(sessionId)
    if (!session) {
      return NextResponse.json(
        { error: 'Sesión no encontrada' },
        { status: 404 }
      )
    }

    // Verify mentor owns this session
    if (session.mentorId !== mentorId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    // Create note
    const noteId = uuidv4()
    const note = notesDb.create({
      id: noteId,
      sessionId,
      mentorId,
      content,
      topics: topics || [],
      actionItems: actionItems || [],
      nextSteps: nextSteps || [],
      createdAt: new Date()
    })

    // Update session status to completed if it was scheduled
    if (session.status === 'scheduled') {
      sessionsDb.update(sessionId, {
        status: 'completed',
        notes: [...(session.notes || []), note]
      })
    } else {
      // Just add the note to existing notes
      sessionsDb.update(sessionId, {
        notes: [...(session.notes || []), note]
      })
    }

    return NextResponse.json({
      success: true,
      note,
      message: 'Notas guardadas exitosamente'
    })
  } catch (error: any) {
    console.error('Error saving notes:', error)
    return NextResponse.json(
      { error: 'Error al guardar notas: ' + error.message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId es requerido' },
        { status: 400 }
      )
    }

    const notes = notesDb.findBySession(sessionId)

    return NextResponse.json({
      success: true,
      notes
    })
  } catch (error: any) {
    console.error('Error fetching notes:', error)
    return NextResponse.json(
      { error: 'Error al cargar notas: ' + error.message },
      { status: 500 }
    )
  }
}
