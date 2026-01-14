import { NextRequest, NextResponse } from 'next/server'
import { analyzeSoftSkillsResponse } from '@/lib/prompts/soft-skills-analyzer'

/**
 * Soft Skills Analysis API
 * 
 * Sprint 37: Análisis de respuestas STAR con detección de patrones de comunicación
 * 
 * POST /api/soft-skills/analyze
 * Body: { questionNumber: 1|2|3, userResponse: string }
 * 
 * Returns: SoftSkillsAnalysis con STAR scores, communication style, red flags
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { questionNumber, userResponse } = body

    // Validación
    if (!questionNumber || ![1, 2, 3].includes(questionNumber)) {
      return NextResponse.json(
        { error: 'Invalid questionNumber. Must be 1, 2, or 3.' },
        { status: 400 }
      )
    }

    if (!userResponse || typeof userResponse !== 'string') {
      return NextResponse.json(
        { error: 'Invalid userResponse. Must be a non-empty string.' },
        { status: 400 }
      )
    }

    if (userResponse.trim().length < 10) {
      return NextResponse.json(
        { error: 'Response too short. Minimum 10 characters required.' },
        { status: 400 }
      )
    }

    // Análisis con IA
    const analysis = await analyzeSoftSkillsResponse(
      questionNumber as 1 | 2 | 3,
      userResponse.trim()
    )

    if (!analysis) {
      return NextResponse.json(
        { error: 'AI analysis failed. Please try again.' },
        { status: 500 }
      )
    }

    // Retornar análisis
    return NextResponse.json({
      success: true,
      responseId: analysis.responseId,
      timestamp: analysis.timestamp,
      questionNumber: analysis.questionNumber,
      wordCount: analysis.wordCount,
      
      // STAR scores
      starScore: analysis.starScore,
      
      // Communication style
      communicationStyle: analysis.communicationStyle,
      
      // Behavioral scores
      leadershipScore: analysis.leadershipScore,
      conflictResolutionScore: analysis.conflictResolutionScore,
      accountabilityScore: analysis.accountabilityScore,
      
      // Red flags (solo cantidad y severidad, no detalles)
      redFlags: analysis.redFlags.map(rf => ({
        category: rf.category,
        severity: rf.severity,
        description: rf.description
        // example y fix bloqueados hasta email gate
      })),
      
      // Overall
      overallLevel: analysis.overallLevel,
      overallScore: analysis.overallScore
    })

  } catch (error: any) {
    console.error('[SoftSkills API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// GET method not allowed
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405 }
  )
}
