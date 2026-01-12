import { NextRequest, NextResponse } from 'next/server'
import { createMeeting, MeetingProvider } from '@/lib/zoom-integration'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      topic,
      startTime,
      duration,
      hostEmail,
      attendeeEmail,
      attendeeName,
      provider
    } = body

    // Validación
    if (!topic || !startTime || !duration || !hostEmail || !attendeeEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: topic, startTime, duration, hostEmail, attendeeEmail' },
        { status: 400 }
      )
    }

    // Crear meeting
    const meeting = await createMeeting({
      topic,
      startTime: new Date(startTime),
      duration,
      hostEmail,
      attendeeEmail,
      attendeeName,
      provider: provider as MeetingProvider
    })

    return NextResponse.json({
      success: true,
      meeting
    })
  } catch (error) {
    console.error('Error creating meeting:', error)
    return NextResponse.json(
      { error: 'Failed to create meeting', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
