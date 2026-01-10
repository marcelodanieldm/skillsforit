import { NextRequest, NextResponse } from 'next/server'
import { SentimentAnalyzer, type MentorComment, type MonthlyAnalysis } from '@/lib/sentiment-analysis'

// Mock database de comentarios (en producción vendría de database.ts)
const mockComments: MentorComment[] = []

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const monthParam = searchParams.get('month') // 0-11
    const yearParam = searchParams.get('year')

    const now = new Date()
    const month = monthParam ? parseInt(monthParam) : now.getMonth()
    const year = yearParam ? parseInt(yearParam) : now.getFullYear()

    // Analizar comentarios del mes
    const analysis = SentimentAnalyzer.analyzeMonthlyComments(mockComments, month, year)

    return NextResponse.json({
      success: true,
      analysis,
      metadata: {
        month,
        year,
        analyzedAt: new Date().toISOString()
      }
    })

  } catch (error: any) {
    console.error('Error analyzing soft skills:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, mentorId, menteeEmail, comment } = body

    if (!comment || comment.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'El comentario no puede estar vacío' },
        { status: 400 }
      )
    }

    // Crear comentario
    const newComment: MentorComment = {
      id: `comment_${Date.now()}_${mentorId}`,
      sessionId,
      mentorId,
      menteeEmail,
      comment: comment.trim(),
      createdAt: new Date()
    }

    mockComments.push(newComment)

    // Análisis inmediato del comentario
    const sentiment = SentimentAnalyzer.analyzeSentiment(comment)
    const issues = SentimentAnalyzer.extractSoftSkillIssues(comment)

    return NextResponse.json({
      success: true,
      comment: newComment,
      analysis: {
        sentiment,
        detectedIssues: issues,
        issuesCount: issues.length
      },
      message: issues.length > 0 
        ? `Comentario guardado. Se detectaron ${issues.length} áreas de mejora.`
        : 'Comentario guardado exitosamente.'
    })

  } catch (error: any) {
    console.error('Error saving comment:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// Endpoint para obtener análisis de múltiples meses
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { months = 6 } = body // Analizar últimos 6 meses por defecto

    const now = new Date()
    const analyses: MonthlyAnalysis[] = []

    for (let i = 0; i < months; i++) {
      const targetDate = new Date(now)
      targetDate.setMonth(targetDate.getMonth() - i)

      const analysis = SentimentAnalyzer.analyzeMonthlyComments(
        mockComments,
        targetDate.getMonth(),
        targetDate.getFullYear()
      )

      analyses.push(analysis)
    }

    // Agregar análisis de tendencias
    const trends = analyzeTrends(analyses)

    return NextResponse.json({
      success: true,
      analyses,
      trends,
      summary: {
        totalComments: mockComments.length,
        monthsAnalyzed: months,
        overallTop3: getOverallTop3(analyses)
      }
    })

  } catch (error: any) {
    console.error('Error analyzing trends:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// Helper functions

function getOverallTop3(analyses: MonthlyAnalysis[]) {
  // Agregar todos los issues de todos los meses
  const issuesMap = new Map<string, { skill: string, totalMentions: number }>()

  for (const analysis of analyses) {
    for (const issue of analysis.allIssues) {
      if (issuesMap.has(issue.skill)) {
        issuesMap.get(issue.skill)!.totalMentions += issue.mentions
      } else {
        issuesMap.set(issue.skill, {
          skill: issue.skill,
          totalMentions: issue.mentions
        })
      }
    }
  }

  return Array.from(issuesMap.values())
    .sort((a, b) => b.totalMentions - a.totalMentions)
    .slice(0, 3)
}

function analyzeTrends(analyses: MonthlyAnalysis[]) {
  if (analyses.length < 2) {
    return {
      improving: [],
      worsening: [],
      stable: []
    }
  }

  const improving: string[] = []
  const worsening: string[] = []
  const stable: string[] = []

  // Comparar mes más reciente con el anterior
  const current = analyses[0]
  const previous = analyses[1]

  const currentIssuesMap = new Map(current.allIssues.map(i => [i.skill, i.mentions]))
  const previousIssuesMap = new Map(previous.allIssues.map(i => [i.skill, i.mentions]))

  // Analizar cada skill
  const allSkills = new Set([
    ...Array.from(currentIssuesMap.keys()),
    ...Array.from(previousIssuesMap.keys())
  ])

  for (const skill of allSkills) {
    const currentMentions = currentIssuesMap.get(skill) || 0
    const previousMentions = previousIssuesMap.get(skill) || 0

    if (currentMentions < previousMentions * 0.8) {
      improving.push(skill) // Mejoró más del 20%
    } else if (currentMentions > previousMentions * 1.2) {
      worsening.push(skill) // Empeoró más del 20%
    } else {
      stable.push(skill)
    }
  }

  return {
    improving,
    worsening,
    stable
  }
}
