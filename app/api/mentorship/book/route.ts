import { NextRequest, NextResponse } from 'next/server'
import { SessionCreditsManager } from '@/lib/session-credits'
import { mentorshipDb } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, email, mentorId, date, time, userPain, userName, userProfession, userCountry } = body

    // Validar campos requeridos
    if (!userId || !email || !mentorId || !date || !time) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // 1. Verificar créditos disponibles
    const creditCheck = SessionCreditsManager.canBookSession(userId)
    
    if (!creditCheck.canBook) {
      return NextResponse.json(
        { 
          success: false, 
          error: creditCheck.reason,
          credits: creditCheck.credits
        },
        { status: 403 }
      )
    }

    // 2. Crear sesión de mentoría (10 minutos)
    const sessionId = `session_${Date.now()}_${userId.substring(0, 8)}`
    
    const scheduledAt = new Date(`${date}T${time}:00`)
    
    const session = mentorshipDb.create({
      id: sessionId,
      mentorId,
      menteeEmail: email,
      menteeName: userName,
      scheduledAt,
      duration: 10, // 10 minutos
      status: 'scheduled',
      meetingLink: `https://meet.skillsforit.com/${sessionId}`,
      // Datos adicionales del usuario
      userPain,
      userProfession,
      userCountry
    })

    // 3. Usar un crédito
    const creditResult = SessionCreditsManager.useCredit(userId, sessionId)

    if (!creditResult.success) {
      // Rollback: eliminar sesión si no se pudo usar el crédito
      mentorshipDb.delete(sessionId)
      
      return NextResponse.json(
        { success: false, error: creditResult.message },
        { status: 500 }
      )
    }

    // 4. Enviar email de confirmación (implementar)
    await sendBookingConfirmation({
      email,
      userName,
      date: scheduledAt.toLocaleDateString('es'),
      time,
      meetingLink: session.meetingLink,
      creditsRemaining: creditResult.credits!.creditsRemaining
    })

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        scheduledAt: session.scheduledAt,
        meetingLink: session.meetingLink,
        duration: session.duration
      },
      credits: creditResult.credits,
      message: `Sesión reservada exitosamente. Te quedan ${creditResult.credits!.creditsRemaining} créditos este mes.`
    })

  } catch (error: any) {
    console.error('Error booking session:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Error al reservar sesión' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const userId = searchParams.get('userId')

    if (!sessionId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Faltan parámetros' },
        { status: 400 }
      )
    }

    // 1. Obtener sesión
    const session = mentorshipDb.findById(sessionId)

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Sesión no encontrada' },
        { status: 404 }
      )
    }

    // 2. Verificar si se puede cancelar (al menos 24h antes)
    const hoursUntilSession = (new Date(session.scheduledAt).getTime() - Date.now()) / (1000 * 60 * 60)
    
    if (hoursUntilSession < 24) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Solo puedes cancelar con al menos 24 horas de anticipación. Crédito no reembolsable.' 
        },
        { status: 400 }
      )
    }

    // 3. Actualizar sesión
    session.status = 'cancelled'

    // 4. Reembolsar crédito
    const refundResult = SessionCreditsManager.refundCredit(
      userId, 
      sessionId, 
      'Cancelación con más de 24h de anticipación'
    )

    // 5. Enviar email de cancelación
    await sendCancellationEmail({
      email: session.menteeEmail,
      userName: session.menteeName || session.menteeEmail,
      date: new Date(session.scheduledAt).toLocaleDateString('es'),
      creditRefunded: refundResult.success
    })

    return NextResponse.json({
      success: true,
      message: 'Sesión cancelada y crédito reembolsado',
      credits: refundResult.credits
    })

  } catch (error: any) {
    console.error('Error cancelling session:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// Helper functions
async function sendBookingConfirmation(data: {
  email: string
  userName: string
  date: string
  time: string
  meetingLink: string
  creditsRemaining: number
}) {
  // TODO: Implementar con Nodemailer
  console.log('Sending booking confirmation to:', data.email)
  console.log('Meeting link:', data.meetingLink)
  console.log('Credits remaining:', data.creditsRemaining)
}

async function sendCancellationEmail(data: {
  email: string
  userName: string
  date: string
  creditRefunded: boolean
}) {
  // TODO: Implementar con Nodemailer
  console.log('Sending cancellation email to:', data.email)
  console.log('Credit refunded:', data.creditRefunded)
}
