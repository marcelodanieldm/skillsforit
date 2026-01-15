import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { scheduleSessionReminder } from '@/lib/notifications'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// GET: Obtener sesiones del mentor
export async function GET(req: Request) {
  const supabase = getSupabase()
  
  try {
    const { searchParams } = new URL(req.url)
    const mentorId = searchParams.get('mentorId')
    const status = searchParams.get('status') // 'scheduled', 'in_progress', 'completed'
    const date = searchParams.get('date') // YYYY-MM-DD

    if (!mentorId) {
      return NextResponse.json({ 
        success: false, 
        error: 'mentorId es requerido' 
      }, { status: 400 })
    }

    let query = supabase
      .from('mentor_bookings')
      .select(`
        *,
        student:profiles!mentor_bookings_user_id_fkey(
          id,
          email,
          full_name,
          avatar_url
        ),
        cv_report:cv_audits(
          id,
          analysis_result,
          overall_score,
          created_at
        )
      `)
      .eq('mentor_id', mentorId)
      .order('scheduled_at', { ascending: true })

    // Filtrar por estado
    if (status) {
      query = query.eq('status', status)
    }

    // Filtrar por fecha (agenda del día)
    if (date) {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)

      query = query
        .gte('scheduled_at', startOfDay.toISOString())
        .lte('scheduled_at', endOfDay.toISOString())
    }

    const { data: sessions, error } = await query

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: sessions
    })
  } catch (error: any) {
    console.error('Error fetching mentor sessions:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}

// POST: Crear nueva sesión
export async function POST(req: Request) {
  const supabase = getSupabase()
  
  try {
    const body = await req.json()
    const { 
      mentor_id, 
      user_id, 
      scheduled_at, 
      duration_minutes = 10,
      product_type = 'mentorship'
    } = body

    // Validar campos requeridos
    if (!mentor_id || !user_id || !scheduled_at) {
      return NextResponse.json({ 
        success: false, 
        error: 'Faltan campos requeridos' 
      }, { status: 400 })
    }

    // Verificar que no haya conflicto de horario
    const sessionStart = new Date(scheduled_at)
    const sessionEnd = new Date(sessionStart.getTime() + duration_minutes * 60000)

    const { data: conflicts } = await supabase
      .from('mentor_bookings')
      .select('id')
      .eq('mentor_id', mentor_id)
      .eq('status', 'scheduled')
      .gte('scheduled_at', sessionStart.toISOString())
      .lte('scheduled_at', sessionEnd.toISOString())

    if (conflicts && conflicts.length > 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'El mentor ya tiene una sesión programada en ese horario' 
      }, { status: 409 })
    }

    // Crear sesión
    const { data: newSession, error } = await supabase
      .from('mentor_bookings')
      .insert({
        mentor_id,
        user_id,
        scheduled_at,
        duration_minutes,
        product_type,
        status: 'scheduled',
        amount: 199.99, // Precio estándar mentoría
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    // Programar recordatorio automático 15 minutos antes de la sesión
    try {
      const sessionTime = new Date(scheduled_at)
      const reminderTime = new Date(sessionTime.getTime() - 15 * 60 * 1000) // 15 minutos antes

      // Solo programar si el recordatorio es en el futuro
      if (reminderTime > new Date()) {
        scheduleSessionReminder(newSession.id, reminderTime)
        console.log(`Recordatorio programado para sesión ${newSession.id} a las ${reminderTime.toISOString()}`)
      }
    } catch (reminderError) {
      console.error('Error scheduling reminder:', reminderError)
      // No fallar la creación de sesión por error en recordatorio
    }

    return NextResponse.json({
      success: true,
      data: newSession
    })
  } catch (error: any) {
    console.error('Error creating session:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}
