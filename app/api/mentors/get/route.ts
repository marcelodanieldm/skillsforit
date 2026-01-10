import { NextRequest, NextResponse } from 'next/server'
import { mentorsDb } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const mentorId = searchParams.get('mentorId')

    if (!mentorId) {
      return NextResponse.json(
        { error: 'mentorId es requerido' },
        { status: 400 }
      )
    }

    const mentor = mentorsDb.findById(mentorId)

    if (!mentor) {
      return NextResponse.json(
        { error: 'Mentor no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      mentor: {
        id: mentor.id,
        name: mentor.name,
        bio: mentor.bio,
        expertise: mentor.expertise,
        linkedinUrl: mentor.linkedinUrl,
        hourlyRate: mentor.hourlyRate,
        rating: mentor.rating,
        totalSessions: mentor.totalSessions,
        reviewCount: mentor.reviewCount,
        availability: mentor.availability
      }
    })
  } catch (error: any) {
    console.error('Error fetching mentor:', error)
    return NextResponse.json(
      { error: 'Error al cargar mentor: ' + error.message },
      { status: 500 }
    )
  }
}
