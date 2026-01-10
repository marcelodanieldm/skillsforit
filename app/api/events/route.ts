import { NextRequest, NextResponse } from 'next/server'
import { eventTracker } from '@/lib/analytics'
import type { EventType } from '@/lib/analytics'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventType, userId, sessionId, metadata } = body

    if (!eventType || !sessionId) {
      return NextResponse.json(
        { error: 'eventType and sessionId are required' },
        { status: 400 }
      )
    }

    // Track the event
    const event = eventTracker.track({
      eventType: eventType as EventType,
      userId,
      sessionId,
      metadata: metadata || {}
    })

    return NextResponse.json({
      success: true,
      event: {
        id: event.id,
        eventType: event.eventType,
        timestamp: event.timestamp
      }
    })
  } catch (error: any) {
    console.error('Error tracking event:', error)
    return NextResponse.json(
      { error: 'Failed to track event: ' + error.message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const eventType = searchParams.get('eventType')
    const userId = searchParams.get('userId')
    const sessionId = searchParams.get('sessionId')

    let events

    if (eventType) {
      events = eventTracker.getEventsByType(eventType as EventType)
    } else if (userId) {
      events = eventTracker.getEventsByUser(userId)
    } else if (sessionId) {
      events = eventTracker.getEventsBySession(sessionId)
    } else {
      // Return summary metrics
      const funnelMetrics = eventTracker.getFunnelMetrics()
      const conversionBySegment = eventTracker.getConversionBySegment()

      return NextResponse.json({
        funnelMetrics,
        conversionBySegment
      })
    }

    return NextResponse.json({ events })
  } catch (error: any) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events: ' + error.message },
      { status: 500 }
    )
  }
}
