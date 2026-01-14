/**
 * Sprint 37: Soft Skills Simulator API
 * 
 * Endpoint para análisis de respuestas comportamentales
 */

import { NextRequest, NextResponse } from 'next/server'
import { 
  analyzeResponse, 
  generateFullReport, 
  censorReport,
  SOFT_SKILL_QUESTIONS,
  type SoftSkillsReport 
} from '@/lib/soft-skills-analyzer'

// In-memory storage para sesiones de simulador (mover a DB en producción)
const simulatorSessions = new Map<string, {
  responses: Array<{ questionId: string; answer: string; timestamp: Date }>
  email?: string
  fullReport?: SoftSkillsReport
  createdAt: Date
}>()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, sessionId, questionId, answer, email } = body

    switch (action) {
      case 'start': {
        // Iniciar nueva sesión de simulador
        const newSessionId = `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        simulatorSessions.set(newSessionId, {
          responses: [],
          createdAt: new Date()
        })

        return NextResponse.json({
          success: true,
          sessionId: newSessionId,
          questions: SOFT_SKILL_QUESTIONS.map(q => ({
            id: q.id,
            category: q.category,
            question: q.question
          })),
          totalQuestions: SOFT_SKILL_QUESTIONS.length
        })
      }

      case 'answer': {
        // Procesar una respuesta individual
        if (!sessionId || !questionId || !answer) {
          return NextResponse.json(
            { error: 'Missing required fields: sessionId, questionId, answer' },
            { status: 400 }
          )
        }

        const session = simulatorSessions.get(sessionId)
        if (!session) {
          return NextResponse.json(
            { error: 'Session not found. Start a new simulation.' },
            { status: 404 }
          )
        }

        const question = SOFT_SKILL_QUESTIONS.find(q => q.id === questionId)
        if (!question) {
          return NextResponse.json(
            { error: 'Invalid question ID' },
            { status: 400 }
          )
        }

        // Guardar respuesta
        session.responses.push({
          questionId,
          answer,
          timestamp: new Date()
        })

        // Calcular progreso
        const progress = session.responses.length / SOFT_SKILL_QUESTIONS.length
        const isComplete = session.responses.length >= SOFT_SKILL_QUESTIONS.length

        // Análisis rápido de la respuesta (para feedback inmediato)
        const wordCount = answer.split(/\s+/).length
        const quickFeedback = {
          wordCount,
          isDetailed: wordCount > 50,
          hasNumbers: /\d+/.test(answer),
          usesFirstPerson: /\b(yo|mi|me|hice|logré|implementé)\b/i.test(answer)
        }

        // Si es la última respuesta, generar reporte
        if (isComplete) {
          const fullReport = await generateFullReport(session.responses)
          session.fullReport = fullReport

          // Retornar versión censurada (sin email)
          const censoredReport = censorReport(fullReport)

          return NextResponse.json({
            success: true,
            progress: 1,
            isComplete: true,
            quickFeedback,
            report: censoredReport,
            unlockMessage: 'Ingresa tu email para ver el análisis completo y cómo corregir tus Red Flags'
          })
        }

        // Siguiente pregunta
        const nextQuestion = SOFT_SKILL_QUESTIONS[session.responses.length]

        return NextResponse.json({
          success: true,
          progress,
          isComplete: false,
          quickFeedback,
          nextQuestion: nextQuestion ? {
            id: nextQuestion.id,
            category: nextQuestion.category,
            question: nextQuestion.question
          } : null
        })
      }

      case 'unlock': {
        // Desbloquear reporte completo con email
        if (!sessionId || !email) {
          return NextResponse.json(
            { error: 'Missing required fields: sessionId, email' },
            { status: 400 }
          )
        }

        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
          return NextResponse.json(
            { error: 'Invalid email format' },
            { status: 400 }
          )
        }

        const session = simulatorSessions.get(sessionId)
        if (!session || !session.fullReport) {
          return NextResponse.json(
            { error: 'Session not found or report not generated' },
            { status: 404 }
          )
        }

        // Guardar email y retornar reporte completo
        session.email = email

        // TODO: Guardar lead en base de datos
        // await saveLead({ email, sessionId, report: session.fullReport })

        // TODO: Enviar email con resultados
        // await sendSoftSkillsResultEmail(email, session.fullReport)

        return NextResponse.json({
          success: true,
          email,
          report: session.fullReport,
          upsells: {
            ebookOffer: {
              title: 'Guía de Soft Skills para IT',
              description: 'Aprende a comunicar tu valor técnico y superar entrevistas comportamentales',
              originalPrice: 19,
              discountedPrice: 10,
              discount: '47% OFF',
              cta: 'Corregir mis Red Flags'
            },
            orderBump: {
              title: 'Auditoría de CV Premium',
              description: 'Alinea lo que dices con lo que escribes en tu CV',
              price: 7,
              cta: 'Agregar auditoría'
            },
            mentorshipOffer: {
              title: 'Mentoría Express (10 min)',
              description: 'Practica estas respuestas con un mentor real',
              price: 15,
              cta: 'Agendar práctica'
            }
          }
        })
      }

      case 'analyze-single': {
        // Análisis individual de una respuesta (para testing/debug)
        if (!questionId || !answer) {
          return NextResponse.json(
            { error: 'Missing required fields: questionId, answer' },
            { status: 400 }
          )
        }

        const question = SOFT_SKILL_QUESTIONS.find(q => q.id === questionId)
        if (!question) {
          return NextResponse.json(
            { error: 'Invalid question ID' },
            { status: 400 }
          )
        }

        const analysis = await analyzeResponse(question, answer)

        return NextResponse.json({
          success: true,
          questionId,
          analysis
        })
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: start, answer, unlock, or analyze-single' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Soft skills API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  switch (action) {
    case 'questions':
      // Retornar lista de preguntas
      return NextResponse.json({
        questions: SOFT_SKILL_QUESTIONS.map(q => ({
          id: q.id,
          category: q.category,
          question: q.question
        })),
        totalQuestions: SOFT_SKILL_QUESTIONS.length
      })

    case 'stats':
      // Estadísticas del simulador (para CEO dashboard)
      const activeSessions = simulatorSessions.size
      const completedSessions = Array.from(simulatorSessions.values())
        .filter(s => s.fullReport).length
      const convertedLeads = Array.from(simulatorSessions.values())
        .filter(s => s.email).length

      return NextResponse.json({
        activeSessions,
        completedSessions,
        convertedLeads,
        conversionRate: completedSessions > 0 
          ? ((convertedLeads / completedSessions) * 100).toFixed(1) + '%'
          : '0%'
      })

    default:
      return NextResponse.json({
        message: 'Soft Skills Simulator API',
        version: '1.0.0',
        actions: {
          GET: ['questions', 'stats'],
          POST: ['start', 'answer', 'unlock', 'analyze-single']
        }
      })
  }
}
