import { NextRequest, NextResponse } from 'next/server'
import { mentorsDb } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const mentors = mentorsDb.findAll()

    // Return mentor data without sensitive info
    const publicMentors = mentors.map(mentor => ({
      id: mentor.id,
      name: mentor.name,
      bio: mentor.bio,
      expertise: mentor.expertise,
      linkedinUrl: mentor.linkedinUrl,
      hourlyRate: mentor.hourlyRate,
      rating: mentor.rating,
      totalSessions: mentor.totalSessions,
      reviewCount: mentor.reviewCount
    }))

    return NextResponse.json({
      success: true,
      mentors: publicMentors
    })
  } catch (error: any) {
    console.error('Error fetching mentors:', error)
    return NextResponse.json(
      { error: 'Error al cargar mentores: ' + error.message },
      { status: 500 }
    )
  }
}
