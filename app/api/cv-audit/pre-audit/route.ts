import { NextRequest, NextResponse } from 'next/server'
import { analyzeCVWithAI } from '@/lib/ai-analysis'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  )
}

export async function POST(request: NextRequest) {
  const supabase = getSupabase()

  try {
    const formData = await request.formData()
    const file = formData.get('cv') as File
    const profession = formData.get('profession') as string
    const country = formData.get('country') as string

    console.log('[CV Pre-Audit] Payload recibido:', {
      fileType: file?.type,
      fileName: file?.name,
      fileSize: file?.size,
      profession,
      country
    })

    if (!file || !profession || !country) {
      console.error('[CV Pre-Audit] Faltan campos requeridos', { file, profession, country })
      return NextResponse.json(
        { error: 'Missing required fields: cv file, profession, country' },
        { status: 400 }
      )
    }

    // Extract text from PDF (simplified - in production use pdf-parse)
    let cvText = ''
    try {
      cvText = await extractTextFromFile(file)
      console.log('[CV Pre-Audit] Texto extraído del CV:', cvText.slice(0, 200) + (cvText.length > 200 ? '...' : ''))
    } catch (err) {
      console.error('[CV Pre-Audit] Error extrayendo texto del archivo:', err)
      throw err
    }

    // Perform AI analysis
    let fullAnalysis
    try {
      fullAnalysis = await analyzeCVWithAI(cvText, profession, country)
      console.log('[CV Pre-Audit] Resultado de análisis IA:', JSON.stringify(fullAnalysis, null, 2))
    } catch (err) {
      console.error('[CV Pre-Audit] Error en análisis IA:', err)
      throw err
    }

    // Create censored version for freemium
    let preAuditResult
    try {
      preAuditResult = createPreAuditResult(fullAnalysis)
      console.log('[CV Pre-Audit] Resultado pre-audit:', JSON.stringify(preAuditResult, null, 2))
    } catch (err) {
      console.error('[CV Pre-Audit] Error creando preAuditResult:', err)
      throw err
    }

    // Store the full analysis temporarily (24 hours)
    const analysisId = generateAnalysisId()
    try {
      await supabase
        .from('cv_analyses')
        .insert({
          id: analysisId,
          cv_text: cvText,
          profession,
          country,
          full_analysis: fullAnalysis,
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        })
      console.log('[CV Pre-Audit] Análisis guardado en Supabase con ID:', analysisId)
    } catch (err) {
      console.error('[CV Pre-Audit] Error guardando en Supabase:', err)
      throw err
    }

    return NextResponse.json({
      analysisId,
      ...preAuditResult
    })

  } catch (error: any) {
    console.error('[CV Pre-Audit] Error general:', error)
    return NextResponse.json(
      { error: 'Failed to analyze CV', details: error?.message || error },
      { status: 500 }
    )
  }
}

function createPreAuditResult(fullAnalysis: any) {
  return {
    score: fullAnalysis.score,
    atsScore: fullAnalysis.atsScore,
    problems: fullAnalysis.problems.slice(0, 3), // Show only first 3 problems
    improvements: fullAnalysis.improvements.map((imp: any) => ({
      category: imp.category,
      before: imp.before,
      after: maskText(imp.after, 10), // Mask detailed fixes
      explanation: maskText(imp.explanation, 20),
      impact: imp.impact
    })),
    strengths: fullAnalysis.strengths,
    recommendations: fullAnalysis.recommendations.map((rec: string) =>
      rec.includes('keyword') ? maskText(rec, 15) : rec
    ),
    isPreview: true
  }
}

function maskText(text: string, visibleChars: number): string {
  if (text.length <= visibleChars) return text
  return text.substring(0, visibleChars) + '... [CONTENIDO BLOQUEADO - COMPRAR AUDITORÍA]'
}

function generateAnalysisId(): string {
  return 'analysis_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

async function extractTextFromFile(file: File): Promise<string> {
  // Simplified text extraction - in production use proper PDF parsing
  const buffer = await file.arrayBuffer()
  const text = new TextDecoder('utf-8').decode(buffer)

  // Basic cleanup
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim()
}