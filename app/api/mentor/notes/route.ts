import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { sendMentorFeedbackNotification } from '@/lib/notifications'

export const dynamic = 'force-dynamic'

/**
 * GET /api/mentor/notes
 * Obtener las notas de una sesión específica
 * Query params: sessionId (required)
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = req.nextUrl.searchParams
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'sessionId es requerido' },
        { status: 400 }
      )
    }

    const { data: notes, error } = await supabase
      .from('mentorship_notes')
      .select('*')
      .eq('session_id', sessionId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error fetching notes:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: notes || null
    })
  } catch (error: any) {
    console.error('Unexpected error in GET /api/mentor/notes:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/mentor/notes
 * Crear o actualizar notas de una sesión
 * Body: { sessionId, actionItems, privateMentorNotes, studentVisibleFeedback, progressRating }
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await req.json()

    const {
      sessionId,
      actionItems,
      privateMentorNotes,
      studentVisibleFeedback,
      progressRating
    } = body

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'sessionId es requerido' },
        { status: 400 }
      )
    }

    // Validar progressRating si está presente
    if (progressRating !== undefined && (progressRating < 1 || progressRating > 5)) {
      return NextResponse.json(
        { success: false, error: 'progressRating debe estar entre 1 y 5' },
        { status: 400 }
      )
    }

    // Verificar que la sesión existe
    const { data: session, error: sessionError } = await supabase
      .from('mentor_bookings')
      .select('id, status')
      .eq('id', sessionId)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { success: false, error: 'Sesión no encontrada' },
        { status: 404 }
      )
    }

    // Verificar si ya existen notas para esta sesión
    const { data: existingNotes } = await supabase
      .from('mentorship_notes')
      .select('id')
      .eq('session_id', sessionId)
      .single()

    let result

    if (existingNotes) {
      // Actualizar notas existentes
      const { data: updatedNotes, error: updateError } = await supabase
        .from('mentorship_notes')
        .update({
          action_items: actionItems,
          private_mentor_notes: privateMentorNotes,
          student_visible_feedback: studentVisibleFeedback,
          progress_rating: progressRating,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingNotes.id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating notes:', updateError)
        return NextResponse.json(
          { success: false, error: updateError.message },
          { status: 500 }
        )
      }

      result = updatedNotes
    } else {
      // Crear nuevas notas
      const { data: newNotes, error: insertError } = await supabase
        .from('mentorship_notes')
        .insert({
          session_id: sessionId,
          action_items: actionItems,
          private_mentor_notes: privateMentorNotes,
          student_visible_feedback: studentVisibleFeedback,
          progress_rating: progressRating
        })
        .select()
        .single()

      if (insertError) {
        console.error('Error creating notes:', insertError)
        return NextResponse.json(
          { success: false, error: insertError.message },
          { status: 500 }
        )
      }

      result = newNotes
    }

    // Enviar notificación al estudiante (en background)
    try {
      setImmediate(() => {
        sendMentorFeedbackNotification(sessionId)
      })
    } catch (notificationError) {
      console.error('Error sending notification:', notificationError)
      // No fallar la respuesta por error en notificación
    }

    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error: any) {
    console.error('Unexpected error in POST /api/mentor/notes:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/mentor/notes
 * Actualización parcial de notas (útil para autosave)
 * Body: { sessionId, ...campos a actualizar }
 */
export async function PUT(req: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await req.json()
    const { sessionId, ...updates } = body

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'sessionId es requerido' },
        { status: 400 }
      )
    }

    // Verificar si existen notas
    const { data: existingNotes } = await supabase
      .from('mentorship_notes')
      .select('id')
      .eq('session_id', sessionId)
      .single()

    if (!existingNotes) {
      // Si no existen, crearlas
      const { data: newNotes, error: insertError } = await supabase
        .from('mentorship_notes')
        .insert({
          session_id: sessionId,
          ...updates
        })
        .select()
        .single()

      if (insertError) {
        console.error('Error creating notes:', insertError)
        return NextResponse.json(
          { success: false, error: insertError.message },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        data: newNotes
      })
    }

    // Actualizar solo los campos proporcionados
    const { data: updatedNotes, error: updateError } = await supabase
      .from('mentorship_notes')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingNotes.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating notes:', updateError)
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: updatedNotes
    })
  } catch (error: any) {
    console.error('Unexpected error in PUT /api/mentor/notes:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
