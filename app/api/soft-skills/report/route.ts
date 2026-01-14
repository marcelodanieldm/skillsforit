import { NextRequest, NextResponse } from 'next/server'

/**
 * Soft Skills Complete Report API
 * 
 * Sprint 37: Genera reporte agregado de las 3 respuestas para radar chart
 * 
 * POST /api/soft-skills/report
 * Body: { analyses: Array<AnalysisResult> }
 * 
 * Returns: Radar data + nivel final + recomendaciones
 */

interface AnalysisResult {
  questionNumber: 1 | 2 | 3
  wordCount: number
  overallScore: number
  overallLevel: string
  redFlags: Array<{
    category: string
    severity: string
    description: string
  }>
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { analyses } = body

    // Validación
    if (!analyses || !Array.isArray(analyses) || analyses.length !== 3) {
      return NextResponse.json(
        { error: 'Invalid analyses. Must be an array of 3 results.' },
        { status: 400 }
      )
    }

    // Calcular métricas agregadas (simplificado)
    const avgScore = analyses.reduce((sum, a) => sum + (a.overallScore || 0), 0) / 3
    
    // Simular scores por dimensión (en producción vendría del análisis completo)
    const starAvg = avgScore
    const leadershipAvg = avgScore + (Math.random() * 20 - 10)  // ±10 variación
    const conflictAvg = avgScore + (Math.random() * 20 - 10)
    const accountabilityAvg = avgScore + (Math.random() * 20 - 10)
    const communicationAvg = avgScore + (Math.random() * 20 - 10)
    
    // Normalizar a 0-100
    const normalize = (score: number) => Math.max(0, Math.min(100, score))
    
    const radarData = {
      labels: [
        'STAR Method',
        'Liderazgo',
        'Resolución de Conflictos',
        'Accountability',
        'Comunicación Asertiva'
      ],
      scores: [
        normalize(starAvg),
        normalize(leadershipAvg),
        normalize(conflictAvg),
        normalize(accountabilityAvg),
        normalize(communicationAvg)
      ]
    }
    
    // Determinar nivel final
    let finalLevel: string
    if (avgScore >= 80) finalLevel = 'Líder Estratégico'
    else if (avgScore >= 60) finalLevel = 'Colaborador Proactivo'
    else if (avgScore >= 40) finalLevel = 'Colaborador Reactivo'
    else finalLevel = 'Colaborador Pasivo'
    
    // Red flags totales
    const totalRedFlags = analyses.reduce((sum, a) => sum + (a.redFlags?.length || 0), 0)
    const criticalRedFlags = analyses.reduce((sum, a) => {
      return sum + (a.redFlags?.filter(rf => rf.severity === 'critical').length || 0)
    }, 0)
    
    // Top recomendaciones
    const topRecommendations = []
    
    if (avgScore < 60) {
      topRecommendations.push({
        priority: 1,
        action: 'Estudia el método STAR y practica con 10 ejemplos de tu carrera',
        impact: 'Aumentarás tu credibilidad en entrevistas en un 200%'
      })
    }
    
    if (criticalRedFlags > 0) {
      topRecommendations.push({
        priority: 1,
        action: 'Lee nuestra Guía de Soft Skills para corregir tus red flags críticos',
        impact: 'Evitarás ser descartado automáticamente en entrevistas técnicas'
      })
    }
    
    topRecommendations.push({
      priority: 2,
      action: 'Practica tus respuestas en voz alta con un mentor o grabándote',
      impact: 'Ganarás confianza y reducirás nervios en 70%'
    })

    return NextResponse.json({
      success: true,
      radarData,
      finalLevel,
      overallScore: avgScore,
      totalRedFlags,
      criticalRedFlags,
      topRecommendations
    })

  } catch (error: any) {
    console.error('[SoftSkills Report API] Error:', error)
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
