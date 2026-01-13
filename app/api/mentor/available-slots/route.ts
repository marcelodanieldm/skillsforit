import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/mentor/available-slots
 * Obtener slots disponibles de un mentor para una fecha específica
 * Query params: mentorId (required), date (YYYY-MM-DD, required)
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = req.nextUrl.searchParams
    const mentorId = searchParams.get('mentorId')
    const dateParam = searchParams.get('date')

    if (!mentorId || !dateParam) {
      return NextResponse.json(
        { success: false, error: 'mentorId y date son requeridos' },
        { status: 400 }
      )
    }

    // Parsear fecha
    const targetDate = new Date(dateParam)
    if (isNaN(targetDate.getTime())) {
      return NextResponse.json(
        { success: false, error: 'Formato de fecha inválido. Usar YYYY-MM-DD' },
        { status: 400 }
      )
    }

    const dayOfWeek = targetDate.getDay() // 0=Domingo, 6=Sábado

    // Obtener disponibilidad configurada para ese día
    const { data: availability, error: availError } = await supabase
      .from('mentor_availability')
      .select('*')
      .eq('mentor_id', mentorId)
      .eq('day_of_week', dayOfWeek)
      .eq('is_active', true)

    if (availError) {
      console.error('Error fetching availability:', availError)
      return NextResponse.json(
        { success: false, error: availError.message },
        { status: 500 }
      )
    }

    if (!availability || availability.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          date: dateParam,
          dayOfWeek,
          availableSlots: []
        }
      })
    }

    // Obtener sesiones ya reservadas para esa fecha
    const startOfDay = new Date(targetDate)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(targetDate)
    endOfDay.setHours(23, 59, 59, 999)

    const { data: bookedSessions, error: bookedError } = await supabase
      .from('mentor_bookings')
      .select('scheduled_at, duration_minutes')
      .eq('mentor_id', mentorId)
      .in('status', ['scheduled', 'in_progress'])
      .gte('scheduled_at', startOfDay.toISOString())
      .lte('scheduled_at', endOfDay.toISOString())

    if (bookedError) {
      console.error('Error fetching booked sessions:', bookedError)
      return NextResponse.json(
        { success: false, error: bookedError.message },
        { status: 500 }
      )
    }

    // Generar todos los slots disponibles
    const allSlots: Array<{
      startTime: string
      endTime: string
      isAvailable: boolean
    }> = []

    availability.forEach((avail) => {
      const startTime = avail.start_time // "09:00:00"
      const endTime = avail.end_time // "17:00:00"
      const duration = avail.slot_duration_minutes

      // Generar slots dentro de este rango
      const [startHour, startMin] = startTime.split(':').map(Number)
      const [endHour, endMin] = endTime.split(':').map(Number)

      let currentTime = new Date(targetDate)
      currentTime.setHours(startHour, startMin, 0, 0)

      const endDateTime = new Date(targetDate)
      endDateTime.setHours(endHour, endMin, 0, 0)

      while (currentTime < endDateTime) {
        const slotStart = new Date(currentTime)
        const slotEnd = new Date(currentTime)
        slotEnd.setMinutes(slotEnd.getMinutes() + duration)

        // Verificar si este slot está ocupado
        const isBooked = bookedSessions?.some((booking) => {
          const bookingStart = new Date(booking.scheduled_at)
          const bookingEnd = new Date(bookingStart)
          bookingEnd.setMinutes(bookingEnd.getMinutes() + (booking.duration_minutes || duration))

          // Hay overlap si:
          // slotStart < bookingEnd && slotEnd > bookingStart
          return slotStart < bookingEnd && slotEnd > bookingStart
        })

        allSlots.push({
          startTime: slotStart.toISOString(),
          endTime: slotEnd.toISOString(),
          isAvailable: !isBooked
        })

        // Avanzar al siguiente slot
        currentTime.setMinutes(currentTime.getMinutes() + duration)
      }
    })

    // Ordenar por hora
    allSlots.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())

    return NextResponse.json({
      success: true,
      data: {
        date: dateParam,
        dayOfWeek,
        totalSlots: allSlots.length,
        availableSlots: allSlots.filter((s) => s.isAvailable).length,
        slots: allSlots
      }
    })
  } catch (error: any) {
    console.error('Unexpected error in GET /api/mentor/available-slots:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
