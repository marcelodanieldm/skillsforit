import { NextRequest, NextResponse } from 'next/server'
import { SessionCreditsManager } from '@/lib/session-credits'
import { mentorshipDb, getMentorById } from '@/lib/database'
import { createMeeting, formatMeetingDetailsForEmail } from '@/lib/zoom-integration'

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

    // 2. Obtener información del mentor
    const mentor = getMentorById(mentorId)
    
    if (!mentor) {
      return NextResponse.json(
        { success: false, error: 'Mentor no encontrado' },
        { status: 404 }
      )
    }

    // 3. Crear reunión de Zoom automáticamente
    const scheduledAt = new Date(`${date}T${time}:00`)
    
    let meetingLink = `https://meet.skillsforit.com/${Date.now()}` // Fallback
    let meetingDetails = null

    try {
      const meeting = await createMeeting({
        topic: `Mentoría: ${mentor.name} ↔ ${userName || email}`,
        startTime: scheduledAt,
        duration: 10,
        hostEmail: mentor.email,
        attendeeEmail: email,
        attendeeName: userName
      })

      meetingLink = meeting.joinUrl
      meetingDetails = meeting
      
      console.log(`✅ Meeting created successfully: ${meeting.meetingId}`)
    } catch (error) {
      console.error('Failed to create meeting, using fallback link:', error)
    }

    // 4. Crear sesión de mentoría (10 minutos)
    const sessionId = `session_${Date.now()}_${userId.substring(0, 8)}`
    
    const session = mentorshipDb.create({
      id: sessionId,
      mentorId,
      menteeEmail: email,
      menteeName: userName,
      scheduledAt,
      duration: 10, // 10 minutos
      status: 'scheduled',
      meetingLink,
      // Datos adicionales del usuario
      userPain,
      userProfession,
      userCountry
    })

    // 5. Usar un crédito
    const creditResult = SessionCreditsManager.useCredit(userId, sessionId)

    if (!creditResult.success) {
      // Rollback: eliminar sesión si no se pudo usar el crédito
      mentorshipDb.delete(sessionId)
      
      return NextResponse.json(
        { success: false, error: creditResult.message },
        { status: 500 }
      )
    }

    // 6. Enviar email de confirmación con detalles del meeting
    await sendBookingConfirmation({
      email,
      userName,
      mentorName: mentor.name,
      date: scheduledAt.toLocaleDateString('es', { dateStyle: 'full' }),
      time,
      meetingLink: session.meetingLink,
      creditsRemaining: creditResult.credits!.creditsRemaining,
      meetingDetails
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
  mentorName: string
  date: string
  time: string
  meetingLink: string
  creditsRemaining: number
  meetingDetails: any
}) {
  console.log('📧 Sending booking confirmation to:', data.email)
  console.log('👤 Mentor:', data.mentorName)
  console.log('📅 Date:', data.date, 'at', data.time)
  console.log('🔗 Meeting link:', data.meetingLink)
  console.log('💳 Credits remaining:', data.creditsRemaining)
  
  if (data.meetingDetails) {
    console.log('\n' + formatMeetingDetailsForEmail(data.meetingDetails))
  }

  // TODO: Implementar con Nodemailer
  // const mailOptions = {
  //   to: data.email,
  //   subject: `✅ Sesión confirmada con ${data.mentorName}`,
  //   html: `
  //     <h2>¡Tu sesión ha sido reservada exitosamente!</h2>
  //     <p>Hola ${data.userName},</p>
  //     <p><strong>Mentor:</strong> ${data.mentorName}</p>
  //     <p><strong>Fecha:</strong> ${data.date} a las ${data.time}</p>
  //     <p><strong>Duración:</strong> 10 minutos</p>
  //     <br>
  //     <a href="${data.meetingLink}" style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">
  //       Unirse a la Reunión
  //     </a>
  //     ${data.meetingDetails ? `<br><br>${formatMeetingDetailsForEmail(data.meetingDetails).replace(/\n/g, '<br>')}` : ''}
  //     <p><em>Te quedan ${data.creditsRemaining} créditos este mes.</em></p>
  //   `
  // }
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
