import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { scheduleSessionReminder } from '@/lib/notifications'

/**
 * POST /api/sessions/reminders
 * Programar recordatorios para sesiones próximas
 * Body: { sessionId, reminderMinutesBefore }
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await req.json()
    const { sessionId, reminderMinutesBefore = 15 } = body

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'sessionId es requerido' },
        { status: 400 }
      )
    }

    // Obtener detalles de la sesión
    const { data: session, error: sessionError } = await supabase
      .from('mentor_bookings')
      .select(`
        id,
        scheduled_at,
        title,
        mentor_id,
        mentee_id,
        join_url,
        status
      `)
      .eq('id', sessionId)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { success: false, error: 'Sesión no encontrada' },
        { status: 404 }
      )
    }

    if (session.status !== 'confirmed') {
      return NextResponse.json(
        { success: false, error: 'La sesión debe estar confirmada para programar recordatorios' },
        { status: 400 }
      )
    }

    // Calcular cuándo enviar el recordatorio
    const sessionTime = new Date(session.scheduled_at)
    const reminderTime = new Date(sessionTime.getTime() - (reminderMinutesBefore * 60 * 1000))

    // Solo programar si el recordatorio es en el futuro
    if (reminderTime <= new Date()) {
      return NextResponse.json(
        { success: false, error: 'La sesión es demasiado pronto para programar recordatorio' },
        { status: 400 }
      )
    }

    // Programar la notificación
    scheduleSessionReminder(session.id, reminderTime)

    return NextResponse.json({
      success: true,
      message: `Recordatorio programado para ${reminderTime.toISOString()}`,
      reminderTime: reminderTime.toISOString()
    })

  } catch (error: any) {
    console.error('Error programming session reminder:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

/**
 * GET /api/sessions/reminders
 * Obtener recordatorios programados (para debugging)
 */
export async function GET(req: NextRequest) {
  try {
    // En un sistema real, esto vendría de una base de datos
    // Por ahora, solo devolvemos un mensaje informativo
    return NextResponse.json({
      success: true,
      message: 'Los recordatorios se procesan automáticamente en background',
      note: 'Para verificar el estado, revisar los logs del servidor'
    })
  } catch (error: any) {
    console.error('Error getting reminders:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}