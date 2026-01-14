'use client'

/**
 * Sprint 37: Soft Skills Simulator - Interactive Landing Page
 * 
 * Simulador de entrevistas comportamentales para Google/Amazon
 * con análisis IA y gráfica radar
 */

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaBrain,
  FaRocket,
  FaLock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaGoogle,
  FaAmazon,
  FaMicrosoft,
  FaApple,
  FaChartLine,
  FaPaperPlane,
  FaSpinner,
  FaArrowRight,
  FaEnvelope,
  FaShoppingCart,
  FaUserTie,
  FaBook
} from 'react-icons/fa'
import Link from 'next/link'

// =====================================================
// TIPOS
// =====================================================

interface Question {
  id: string
  category: string
  question: string
}

interface QuickFeedback {
  wordCount: number
  isDetailed: boolean
  hasNumbers: boolean
  usesFirstPerson: boolean
}

interface RadarData {
  leadership: number
  communication: number
  conflictResolution: number
  problemSolving: number
  emotionalIntelligence: number
  adaptability: number
}

interface RedFlag {
  category: string
  severity: string
  description: string
  impact: string
  solution: string
}

interface CensoredReport {
  sessionId: string
  overallLevel: string
  overallScore: number
  radarData: RadarData
  responseDepth: number
  engagementLevel: string
  redFlags: RedFlag[]
  strengths: string[]
  recommendations: string[]
}

// =====================================================
// COMPONENTE RADAR CHART (Chart.js)
// =====================================================

interface RadarChartProps {
  data: RadarData
  showLabels?: boolean
}

function RadarChart({ data, showLabels = true }: RadarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) - 40

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const labels = [
      { key: 'leadership', label: 'Liderazgo' },
      { key: 'communication', label: 'Comunicación' },
      { key: 'conflictResolution', label: 'Conflictos' },
      { key: 'problemSolving', label: 'Resolución' },
      { key: 'emotionalIntelligence', label: 'Inteligencia EQ' },
      { key: 'adaptability', label: 'Adaptabilidad' }
    ]

    const numPoints = labels.length
    const angleStep = (2 * Math.PI) / numPoints

    // Draw background circles
    for (let level = 1; level <= 5; level++) {
      const levelRadius = (radius * level) / 5
      ctx.beginPath()
      for (let i = 0; i <= numPoints; i++) {
        const angle = i * angleStep - Math.PI / 2
        const x = centerX + levelRadius * Math.cos(angle)
        const y = centerY + levelRadius * Math.sin(angle)
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.strokeStyle = level === 5 ? '#374151' : '#1f2937'
      ctx.lineWidth = 1
      ctx.stroke()
    }

    // Draw axis lines
    labels.forEach((_, i) => {
      const angle = i * angleStep - Math.PI / 2
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(
        centerX + radius * Math.cos(angle),
        centerY + radius * Math.sin(angle)
      )
      ctx.strokeStyle = '#374151'
      ctx.lineWidth = 1
      ctx.stroke()
    })

    // Draw data polygon
    ctx.beginPath()
    labels.forEach((item, i) => {
      const value = data[item.key as keyof RadarData] / 100
      const angle = i * angleStep - Math.PI / 2
      const x = centerX + radius * value * Math.cos(angle)
      const y = centerY + radius * value * Math.sin(angle)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.closePath()
    ctx.fillStyle = 'rgba(59, 130, 246, 0.3)'
    ctx.fill()
    ctx.strokeStyle = '#3b82f6'
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw data points
    labels.forEach((item, i) => {
      const value = data[item.key as keyof RadarData] / 100
      const angle = i * angleStep - Math.PI / 2
      const x = centerX + radius * value * Math.cos(angle)
      const y = centerY + radius * value * Math.sin(angle)

      ctx.beginPath()
      ctx.arc(x, y, 6, 0, 2 * Math.PI)
      ctx.fillStyle = '#3b82f6'
      ctx.fill()
      ctx.strokeStyle = '#1e3a8a'
      ctx.lineWidth = 2
      ctx.stroke()
    })

    // Draw labels
    if (showLabels) {
      ctx.font = '12px Inter, sans-serif'
      ctx.fillStyle = '#9ca3af'
      ctx.textAlign = 'center'
      labels.forEach((item, i) => {
        const angle = i * angleStep - Math.PI / 2
        const labelRadius = radius + 25
        const x = centerX + labelRadius * Math.cos(angle)
        const y = centerY + labelRadius * Math.sin(angle) + 4
        ctx.fillText(item.label, x, y)
      })
    }
  }, [data, showLabels])

  return (
    <canvas
      ref={canvasRef}
      width={350}
      height={350}
      className="max-w-full h-auto"
    />
  )
}

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

type SimulatorPhase = 'landing' | 'chat' | 'results' | 'unlock'

export default function SoftSkillsSimulatorPage() {
  const [phase, setPhase] = useState<SimulatorPhase>('landing')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [report, setReport] = useState<CensoredReport | null>(null)
  const [email, setEmail] = useState('')
  const [isUnlocking, setIsUnlocking] = useState(false)
  const [fullReport, setFullReport] = useState<any>(null)
  const [chatHistory, setChatHistory] = useState<Array<{
    type: 'question' | 'answer' | 'feedback'
    content: string
    feedback?: QuickFeedback
  }>>([])

  const chatEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory])

  // Start simulation
  const handleStartSimulation = async () => {
    try {
      const res = await fetch('/api/soft-skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' })
      })

      const data = await res.json()
      if (data.success) {
        setSessionId(data.sessionId)
        setQuestions(data.questions)
        setChatHistory([{
          type: 'question',
          content: data.questions[0].question
        }])
        setPhase('chat')
      }
    } catch (error) {
      console.error('Error starting simulation:', error)
    }
  }

  // Submit answer
  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim() || !sessionId) return

    setIsSubmitting(true)

    // Add answer to chat
    setChatHistory(prev => [...prev, {
      type: 'answer',
      content: currentAnswer
    }])

    try {
      const res = await fetch('/api/soft-skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'answer',
          sessionId,
          questionId: questions[currentQuestionIndex].id,
          answer: currentAnswer
        })
      })

      const data = await res.json()

      // Add feedback to chat
      if (data.quickFeedback) {
        setChatHistory(prev => [...prev, {
          type: 'feedback',
          content: getFeedbackMessage(data.quickFeedback),
          feedback: data.quickFeedback
        }])
      }

      if (data.isComplete) {
        // Simulation complete, show results
        setReport(data.report)
        setTimeout(() => setPhase('results'), 1500)
      } else if (data.nextQuestion) {
        // Next question
        setTimeout(() => {
          setChatHistory(prev => [...prev, {
            type: 'question',
            content: data.nextQuestion.question
          }])
          setCurrentQuestionIndex(prev => prev + 1)
        }, 1000)
      }

      setCurrentAnswer('')
    } catch (error) {
      console.error('Error submitting answer:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get feedback message based on quick analysis
  const getFeedbackMessage = (feedback: QuickFeedback): string => {
    const messages: string[] = []
    
    if (feedback.wordCount < 30) {
      messages.push('Tu respuesta es muy corta. Los entrevistadores esperan más detalle.')
    } else if (feedback.wordCount > 150) {
      messages.push('¡Excelente nivel de detalle!')
    }

    if (feedback.hasNumbers) {
      messages.push('✓ Incluyes métricas, eso es muy valorado.')
    }

    if (feedback.usesFirstPerson) {
      messages.push('✓ Usas primera persona, mostrando ownership.')
    } else {
      messages.push('Intenta usar más "yo hice" en lugar de "se hizo".')
    }

    return messages.join(' ')
  }

  // Unlock full report
  const handleUnlock = async () => {
    if (!email.trim() || !sessionId) return

    setIsUnlocking(true)

    try {
      const res = await fetch('/api/soft-skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'unlock',
          sessionId,
          email
        })
      })

      const data = await res.json()

      if (data.success) {
        setFullReport(data)
        setPhase('unlock')
      }
    } catch (error) {
      console.error('Error unlocking report:', error)
    } finally {
      setIsUnlocking(false)
    }
  }

  // =====================================================
  // RENDER: LANDING PAGE
  // =====================================================

  if (phase === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
        {/* Hero Section */}
        <section className="pt-20 pb-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            {/* Company logos */}
            <div className="flex justify-center gap-8 mb-8 opacity-50">
              <FaGoogle className="text-3xl" />
              <FaAmazon className="text-3xl" />
              <FaMicrosoft className="text-3xl" />
              <FaApple className="text-3xl" />
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold mb-6"
            >
              ¿Superarías la entrevista de comportamiento en{' '}
              <span className="text-blue-400">Google</span> o{' '}
              <span className="text-orange-400">Amazon</span>?
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto"
            >
              Responde 3 preguntas críticas de situación (STAR Method) y nuestra IA 
              auditará tu nivel de <strong>liderazgo</strong>, <strong>resolución de conflictos</strong> y{' '}
              <strong>comunicación</strong>.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <button
                onClick={handleStartSimulation}
                className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all transform hover:scale-105 shadow-lg shadow-blue-500/25"
              >
                <FaRocket />
                Iniciar Simulación Gratis
                <FaArrowRight />
              </button>
            </motion.div>

            <p className="mt-4 text-sm text-gray-400">
              ⏱️ Solo toma 2-3 minutos • Sin tarjeta de crédito
            </p>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 px-4 bg-gray-800/50">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-12">
              Cómo Funciona el Simulador
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaBrain className="text-2xl text-blue-400" />
                </div>
                <h3 className="font-semibold mb-2">1. Responde 3 Preguntas</h3>
                <p className="text-gray-400 text-sm">
                  Preguntas reales de entrevistas comportamentales de FAANG
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaChartLine className="text-2xl text-purple-400" />
                </div>
                <h3 className="font-semibold mb-2">2. IA Analiza tu Narrativa</h3>
                <p className="text-gray-400 text-sm">
                  Detectamos estructura STAR, tono y asertividad
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaCheckCircle className="text-2xl text-green-400" />
                </div>
                <h3 className="font-semibold mb-2">3. Obtén tu Reporte</h3>
                <p className="text-gray-400 text-sm">
                  Gráfica radar con tus fortalezas y áreas de mejora
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Social proof */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-gray-400 mb-4">
              +2,500 developers han probado su nivel de soft skills
            </p>
            <div className="flex justify-center gap-2">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-yellow-400 text-xl">★</span>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              4.8/5 basado en feedback de usuarios
            </p>
          </div>
        </section>
      </div>
    )
  }

  // =====================================================
  // RENDER: CHAT INTERFACE
  // =====================================================

  if (phase === 'chat') {
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100

    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 px-4 py-3">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">
                Pregunta {currentQuestionIndex + 1} de {questions.length}
              </span>
              <span className="text-sm text-blue-400">
                {Math.round(progress)}% completado
              </span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>

        {/* Chat container */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-2xl mx-auto space-y-4">
            <AnimatePresence>
              {chatHistory.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.type === 'answer' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.type === 'answer'
                        ? 'bg-blue-600 text-white'
                        : message.type === 'question'
                        ? 'bg-gray-700 text-white'
                        : 'bg-gray-800 border border-gray-600 text-gray-300 text-sm'
                    }`}
                  >
                    {message.type === 'question' && (
                      <div className="flex items-center gap-2 mb-2 text-blue-400 text-sm">
                        <FaUserTie />
                        <span>Entrevistador IA</span>
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    {message.feedback && (
                      <div className="mt-2 pt-2 border-t border-gray-600 flex items-center gap-2 text-xs">
                        <span className="text-gray-400">
                          {message.feedback.wordCount} palabras
                        </span>
                        {message.feedback.isDetailed && (
                          <span className="text-green-400">✓ Detallado</span>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Input area */}
        <div className="bg-gray-800 border-t border-gray-700 px-4 py-4">
          <div className="max-w-2xl mx-auto">
            <div className="flex gap-3">
              <textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Escribe tu respuesta aquí... (Intenta ser específico y usar ejemplos reales)"
                className="flex-1 bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                disabled={isSubmitting}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    handleSubmitAnswer()
                  }
                }}
              />
              <button
                onClick={handleSubmitAnswer}
                disabled={!currentAnswer.trim() || isSubmitting}
                className="self-end bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2"
              >
                {isSubmitting ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaPaperPlane />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Ctrl + Enter para enviar • Tip: Incluye números y métricas cuando sea posible
            </p>
          </div>
        </div>
      </div>
    )
  }

  // =====================================================
  // RENDER: RESULTS (Censored)
  // =====================================================

  if (phase === 'results' && report) {
    return (
      <div className="min-h-screen bg-gray-900 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl font-bold mb-4">Tu Reporte de Soft Skills</h1>
            <div className="inline-flex items-center gap-2 bg-gray-800 rounded-full px-4 py-2">
              <span className="text-gray-400">Nivel:</span>
              <span className={`font-semibold ${
                report.overallScore >= 70 ? 'text-green-400' :
                report.overallScore >= 50 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {report.overallLevel}
              </span>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Radar Chart */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800 rounded-2xl p-6"
            >
              <h2 className="text-xl font-semibold mb-4 text-center">
                Tu Perfil de Competencias
              </h2>
              <div className="flex justify-center">
                <RadarChart data={report.radarData} />
              </div>
              <div className="mt-4 text-center">
                <span className="text-4xl font-bold text-blue-400">
                  {report.overallScore}
                </span>
                <span className="text-gray-400">/100</span>
              </div>
            </motion.div>

            {/* Red Flags (Censored) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-800 rounded-2xl p-6"
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FaExclamationTriangle className="text-yellow-400" />
                Red Flags Detectados
              </h2>

              <div className="space-y-4">
                {report.redFlags.map((flag, index) => (
                  <div
                    key={index}
                    className="bg-gray-700/50 rounded-lg p-4 border border-gray-600"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`w-2 h-2 rounded-full ${
                        flag.severity === 'high' ? 'bg-red-500' :
                        flag.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`} />
                      <span className="font-medium">{flag.category}</span>
                    </div>
                    <p className="text-gray-400 text-sm mb-2">{flag.description}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <FaLock className="text-yellow-400" />
                      <span>{flag.solution}</span>
                    </div>
                  </div>
                ))}
              </div>

              {report.redFlags.length === 0 && (
                <p className="text-gray-400 text-center py-8">
                  No se detectaron red flags críticos. ¡Buen trabajo!
                </p>
              )}
            </motion.div>
          </div>

          {/* Strengths */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 bg-gray-800 rounded-2xl p-6"
          >
            <h2 className="text-xl font-semibold mb-4">Tus Fortalezas</h2>
            <div className="flex flex-wrap gap-3">
              {report.strengths.map((strength, index) => (
                <span
                  key={index}
                  className="bg-green-600/20 text-green-400 px-4 py-2 rounded-full text-sm"
                >
                  ✓ {strength}
                </span>
              ))}
              <span className="bg-gray-700 text-gray-400 px-4 py-2 rounded-full text-sm flex items-center gap-2">
                <FaLock />
                +3 fortalezas bloqueadas
              </span>
            </div>
          </motion.div>

          {/* CTA: Unlock */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center"
          >
            <FaLock className="text-4xl mx-auto mb-4 text-white/80" />
            <h2 className="text-2xl font-bold mb-2">
              Desbloquea tu Análisis Completo
            </h2>
            <p className="text-blue-100 mb-6 max-w-lg mx-auto">
              Tu respuesta a la pregunta 2 mostró una <strong>señal de alerta de falta de liderazgo</strong>.
              Ingresa tu email para ver el análisis detallado y cómo corregir tu narrativa.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
              <div className="flex-1 relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 pl-11 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>
              <button
                onClick={handleUnlock}
                disabled={!email.trim() || isUnlocking}
                className="bg-white text-blue-600 hover:bg-blue-50 disabled:bg-gray-300 px-6 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {isUnlocking ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <>
                    Ver Reporte Completo
                    <FaArrowRight />
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-blue-200 mt-4">
              🔒 Tu email está seguro. No spam, solo valor.
            </p>
          </motion.div>
        </div>
      </div>
    )
  }

  // =====================================================
  // RENDER: UNLOCKED REPORT + UPSELLS
  // =====================================================

  if (phase === 'unlock' && fullReport) {
    return (
      <div className="min-h-screen bg-gray-900 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Success message */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-600/20 border border-green-500/30 rounded-2xl p-6 mb-8 text-center"
          >
            <FaCheckCircle className="text-4xl text-green-400 mx-auto mb-3" />
            <h2 className="text-xl font-semibold mb-2">¡Reporte Desbloqueado!</h2>
            <p className="text-gray-300">
              Hemos enviado una copia a <strong>{fullReport.email}</strong>
            </p>
          </motion.div>

          {/* Full Report */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Radar Chart */}
            <div className="bg-gray-800 rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-4 text-center">
                Tu Perfil Completo
              </h2>
              <div className="flex justify-center">
                <RadarChart data={fullReport.report.radarData} />
              </div>
            </div>

            {/* Full Recommendations */}
            <div className="bg-gray-800 rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-4">
                Recomendaciones Personalizadas
              </h2>
              <div className="space-y-3">
                {fullReport.report.recommendations?.map((rec: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 bg-gray-700/50 rounded-lg p-3"
                  >
                    <span className="text-blue-400 mt-1">💡</span>
                    <p className="text-gray-300 text-sm">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Upsells Section */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700">
            <h2 className="text-2xl font-bold text-center mb-2">
              🚀 Corrige tus Red Flags Ahora
            </h2>
            <p className="text-gray-400 text-center mb-8">
              Recursos diseñados específicamente para mejorar tus áreas débiles
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Ebook Offer */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gray-800 rounded-xl p-6 border-2 border-blue-500 relative"
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {fullReport.upsells.ebookOffer.discount}
                </div>
                <FaBook className="text-3xl text-blue-400 mb-4" />
                <h3 className="font-semibold mb-2">
                  {fullReport.upsells.ebookOffer.title}
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  {fullReport.upsells.ebookOffer.description}
                </p>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl font-bold text-green-400">
                    ${fullReport.upsells.ebookOffer.discountedPrice}
                  </span>
                  <span className="text-gray-500 line-through">
                    ${fullReport.upsells.ebookOffer.originalPrice}
                  </span>
                </div>
                <Link
                  href="/soft-skills-guide"
                  className="block w-full bg-blue-600 hover:bg-blue-500 text-center py-3 rounded-lg font-medium transition-colors"
                >
                  {fullReport.upsells.ebookOffer.cta}
                </Link>
              </motion.div>

              {/* Order Bump: CV Audit */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gray-800 rounded-xl p-6 border border-gray-600"
              >
                <FaShoppingCart className="text-3xl text-purple-400 mb-4" />
                <h3 className="font-semibold mb-2">
                  {fullReport.upsells.orderBump.title}
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  {fullReport.upsells.orderBump.description}
                </p>
                <div className="mb-4">
                  <span className="text-2xl font-bold text-green-400">
                    ${fullReport.upsells.orderBump.price}
                  </span>
                </div>
                <Link
                  href="/checkout?product=cv-audit"
                  className="block w-full bg-purple-600 hover:bg-purple-500 text-center py-3 rounded-lg font-medium transition-colors"
                >
                  {fullReport.upsells.orderBump.cta}
                </Link>
              </motion.div>

              {/* Mentorship Offer */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gray-800 rounded-xl p-6 border border-gray-600"
              >
                <FaUserTie className="text-3xl text-green-400 mb-4" />
                <h3 className="font-semibold mb-2">
                  {fullReport.upsells.mentorshipOffer.title}
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  {fullReport.upsells.mentorshipOffer.description}
                </p>
                <div className="mb-4">
                  <span className="text-2xl font-bold text-green-400">
                    ${fullReport.upsells.mentorshipOffer.price}
                  </span>
                </div>
                <Link
                  href="/mentors"
                  className="block w-full bg-green-600 hover:bg-green-500 text-center py-3 rounded-lg font-medium transition-colors"
                >
                  {fullReport.upsells.mentorshipOffer.cta}
                </Link>
              </motion.div>
            </div>
          </div>

          {/* Footer CTA */}
          <div className="mt-8 text-center">
            <Link
              href="/"
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return null
}
