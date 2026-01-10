import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      )
    }

    // Find all analyses for this email
    const analyses = db.findByEmail(email)

    // Filter to only show paid analyses
    const paidAnalyses = analyses.filter(a => a.paymentStatus === 'completed')

    return NextResponse.json({
      analyses: paidAnalyses,
    })
  } catch (error: any) {
    console.error('Dashboard error:', error)
    return NextResponse.json(
      { error: 'Error al obtener análisis', details: error.message },
      { status: 500 }
    )
  }
}
