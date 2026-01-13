import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/mentor/availability
 * Obtener la disponibilidad de un mentor
 * Query params: mentorId (required), dayOfWeek (optional)
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = req.nextUrl.searchParams
    const mentorId = searchParams.get('mentorId')
    const dayOfWeek = searchParams.get('dayOfWeek')

    if (!mentorId) {
      return NextResponse.json(
        { success: false, error: 'mentorId es requerido' },
        { status: 400 }
      )
    }

    let query = supabase
      .from('mentor_availability')
      .select('*')
      .eq('mentor_id', mentorId)
      .eq('is_active', true)
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true })

    if (dayOfWeek !== null) {
      const day = parseInt(dayOfWeek)
      if (!isNaN(day) && day >= 0 && day <= 6) {
        query = query.eq('day_of_week', day)
      }
    }

    const { data: availability, error } = await query

    if (error) {
      console.error('Error fetching availability:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: availability || []
    })
  } catch (error: any) {
    console.error('Unexpected error in GET /api/mentor/availability:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/mentor/availability
 * Crear o actualizar un slot de disponibilidad
 * Body: { mentorId, dayOfWeek, startTime, endTime, slotDurationMinutes }
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await req.json()

    const {
      mentorId,
      dayOfWeek,
      startTime,
      endTime,
      slotDurationMinutes = 10
    } = body

    // Validaciones
    if (!mentorId || dayOfWeek === undefined || !startTime || !endTime) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    if (dayOfWeek < 0 || dayOfWeek > 6) {
      return NextResponse.json(
        { success: false, error: 'dayOfWeek debe estar entre 0 (Domingo) y 6 (Sábado)' },
        { status: 400 }
      )
    }

    // Validar formato de tiempo (HH:MM:SS o HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return NextResponse.json(
        { success: false, error: 'Formato de tiempo inválido. Usar HH:MM o HH:MM:SS' },
        { status: 400 }
      )
    }

    // Verificar que el mentor existe
    const { data: mentor, error: mentorError } = await supabase
      .from('mentors')
      .select('id')
      .eq('id', mentorId)
      .single()

    if (mentorError || !mentor) {
      return NextResponse.json(
        { success: false, error: 'Mentor no encontrado' },
        { status: 404 }
      )
    }

    // Verificar conflictos de disponibilidad (overlapping)
    const { data: conflicts, error: conflictError } = await supabase
      .from('mentor_availability')
      .select('id')
      .eq('mentor_id', mentorId)
      .eq('day_of_week', dayOfWeek)
      .eq('is_active', true)
      .or(`and(start_time.lte.${endTime},end_time.gte.${startTime})`)

    if (conflictError) {
      console.error('Error checking conflicts:', conflictError)
      return NextResponse.json(
        { success: false, error: conflictError.message },
        { status: 500 }
      )
    }

    if (conflicts && conflicts.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Ya existe disponibilidad en ese horario' },
        { status: 409 }
      )
    }

    // Insertar disponibilidad
    const { data: newAvailability, error: insertError } = await supabase
      .from('mentor_availability')
      .insert({
        mentor_id: mentorId,
        day_of_week: dayOfWeek,
        start_time: startTime,
        end_time: endTime,
        slot_duration_minutes: slotDurationMinutes,
        is_active: true
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating availability:', insertError)
      return NextResponse.json(
        { success: false, error: insertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: newAvailability
    }, { status: 201 })
  } catch (error: any) {
    console.error('Unexpected error in POST /api/mentor/availability:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/mentor/availability
 * Desactivar un slot de disponibilidad (soft delete)
 * Body: { availabilityId }
 */
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await req.json()
    const { availabilityId } = body

    if (!availabilityId) {
      return NextResponse.json(
        { success: false, error: 'availabilityId es requerido' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('mentor_availability')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', availabilityId)

    if (error) {
      console.error('Error deleting availability:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Disponibilidad desactivada correctamente'
    })
  } catch (error: any) {
    console.error('Unexpected error in DELETE /api/mentor/availability:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
