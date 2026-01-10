import { NextResponse } from 'next/server'
import { seedTestData } from '@/scripts/seed-data'

export async function POST() {
  try {
    seedTestData()
    
    return NextResponse.json({
      success: true,
      message: 'Test data seeded successfully! Visit /admin/dashboard to see the results.'
    })
  } catch (error: any) {
    console.error('Error seeding data:', error)
    return NextResponse.json(
      { error: 'Failed to seed data: ' + error.message },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST method to seed test data',
    endpoint: '/api/seed',
    method: 'POST'
  })
}
