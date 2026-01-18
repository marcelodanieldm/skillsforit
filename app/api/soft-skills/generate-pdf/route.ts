import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { generatePDFReport } from '@/lib/pdf-generator'
import { SOFT_SKILLS_QUESTIONS } from '@/lib/prompts/soft-skills-analyzer'

/**
 * POST /api/soft-skills/generate-pdf
 * Body: { sessionId: string, premiumAnswers?: string[] }
 * Returns: { url: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { sessionId, premiumAnswers } = await request.json()
    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId requerido' }, { status: 400 })
    }
    // Buscar análisis en la base de datos (simulador o CV)
    const analysis = db.findById(sessionId)
    if (!analysis || !analysis.analysisResult) {
      return NextResponse.json({ error: 'Análisis no encontrado o incompleto' }, { status: 404 })
    }
    // Si no se pasan premiumAnswers, usar undefined
    const pdfUrl = await generatePDFReport(analysis, analysis.analysisResult, premiumAnswers)
    return NextResponse.json({ url: pdfUrl })
  } catch (error) {
    console.error('[PDF] Error:', error)
    return NextResponse.json({ error: 'Error generando PDF' }, { status: 500 })
  }
}
