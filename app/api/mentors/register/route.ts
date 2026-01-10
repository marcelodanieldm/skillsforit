import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { mentorsDb, usersDb } from '@/lib/database'
import type { MentorAvailability } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, bio, expertise, linkedinUrl, hourlyRate, availability } = body

    // Validate required fields
    if (!name || !email || !password || !bio || !expertise || !hourlyRate) {
      return NextResponse.json(
        { error: 'Todos los campos obligatorios deben ser completados' },
        { status: 400 }
      )
    }

    if (expertise.length === 0) {
      return NextResponse.json(
        { error: 'Selecciona al menos una área de expertise' },
        { status: 400 }
      )
    }

    // Check if mentor already exists
    const existingMentor = mentorsDb.findByEmail(email)
    if (existingMentor) {
      return NextResponse.json(
        { error: 'Ya existe un mentor con este email' },
        { status: 409 }
      )
    }

    // Create user account
    const userId = uuidv4()
    usersDb.create({
      id: userId,
      email,
      password, // In production, hash the password!
      role: 'mentor',
      name,
      createdAt: new Date()
    })

    // Create mentor profile
    const mentorId = uuidv4()
    const defaultAvailability: MentorAvailability[] = [
      {
        dayOfWeek: 1, // Monday
        startTime: '09:00',
        endTime: '17:00',
        timezone: 'America/New_York'
      },
      {
        dayOfWeek: 2, // Tuesday
        startTime: '09:00',
        endTime: '17:00',
        timezone: 'America/New_York'
      },
      {
        dayOfWeek: 3, // Wednesday
        startTime: '09:00',
        endTime: '17:00',
        timezone: 'America/New_York'
      },
      {
        dayOfWeek: 4, // Thursday
        startTime: '09:00',
        endTime: '17:00',
        timezone: 'America/New_York'
      },
      {
        dayOfWeek: 5, // Friday
        startTime: '09:00',
        endTime: '17:00',
        timezone: 'America/New_York'
      }
    ]

    const mentor = mentorsDb.create({
      id: mentorId,
      userId,
      name,
      email,
      bio,
      expertise,
      linkedinUrl: linkedinUrl || '',
      hourlyRate,
      availability: availability || defaultAvailability,
      rating: 5.0, // Start with perfect rating
      totalSessions: 0,
      reviewCount: 0
    })

    return NextResponse.json({
      success: true,
      mentorId: mentor.id,
      message: '¡Registro exitoso! Bienvenido como mentor'
    })
  } catch (error: any) {
    console.error('Error registering mentor:', error)
    return NextResponse.json(
      { error: 'Error al registrar mentor: ' + error.message },
      { status: 500 }
    )
  }
}
