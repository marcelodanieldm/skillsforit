'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaPaperPlane, FaMicrophone, FaRobot, FaUser, FaSpinner, FaCheckCircle } from 'react-icons/fa'
import SoftSkillsRadarChart from './SoftSkillsRadarChart'
import { SOFT_SKILLS_QUESTIONS } from '@/lib/prompts/soft-skills-analyzer'

/**
 * Soft Skills Simulator - Interactive Chat
 * 
 * Sprint 37: Simulador de entrevista con 3 preguntas STAR
 * 
 * Flujo:
 * 1. Usuario responde 3 preguntas
 * 2. AI analiza cada respuesta en tiempo real
 * 3. Muestra radar chart con resultados preliminares
 * 4. Email gate para ver análisis completo
 */

interface Message {
  id: string
  role: 'assistant' | 'user'
  content: string
  timestamp: Date
}

interface SimulatorStep {
  step: 'intro' | 'question1' | 'question2' | 'question3' | 'analyzing' | 'results' | 'email-gate'
  currentQuestion: number
}

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

export default function SoftSkillsSimulator() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '¡Hola! 👋 Soy tu entrenador de entrevistas de IA. Voy a hacerte 3 preguntas que te harían en Google, Amazon o Microsoft. **Responde con honestidad** como si estuvieras en una entrevista real.\n\n¿Listo para empezar?',
      timestamp: new Date()
    }
  ])
  
  const [input, setInput] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [simulatorStep, setSimulatorStep] = useState<SimulatorStep>({
    step: 'intro',
    currentQuestion: 0
  })
  
  const [responses, setResponses] = useState<string[]>([])
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([])
  const [radarData, setRadarData] = useState<{ labels: string[], scores: number[] } | null>(null)
  const [finalLevel, setFinalLevel] = useState<string>('Colaborador Reactivo')
  const [email, setEmail] = useState('')
  const [showEmailGate, setShowEmailGate] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus en input
  useEffect(() => {
    if (!isAnalyzing && simulatorStep.step !== 'results') {
      inputRef.current?.focus()
    }
  }, [isAnalyzing, simulatorStep])

  const addMessage = (role: 'assistant' | 'user', content: string) => {
    const newMessage: Message = {
      id: `${Date.now()}-${Math.random()}`,
      role,
      content,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, newMessage])
  }

  const startSimulation = () => {
    setSimulatorStep({ step: 'question1', currentQuestion: 1 })
    addMessage('assistant', `**Pregunta 1 de 3:**\n\n${SOFT_SKILLS_QUESTIONS[0].text}\n\n💡 *Tip: Una buena respuesta tiene 100-150 palabras y sigue el método STAR (Situación, Tarea, Acción, Resultado)*`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isAnalyzing) return

    const userMessage = input.trim()
    setInput('')

    // Intro step
    if (simulatorStep.step === 'intro') {
      addMessage('user', userMessage)
      startSimulation()
      return
    }

    // Question steps
    if (simulatorStep.step.startsWith('question')) {
      addMessage('user', userMessage)
      setIsAnalyzing(true)
      
      // Guardar respuesta
      const questionNum = simulatorStep.currentQuestion
      const newResponses = [...responses, userMessage]
      setResponses(newResponses)

      // Analizar con IA (llamada al backend)
      try {
        const response = await fetch('/api/soft-skills/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questionNumber: questionNum,
            userResponse: userMessage
          })
        })

        if (!response.ok) throw new Error('Analysis failed')

        const result = await response.json()
        
        // Guardar análisis
        setAnalyses(prev => [...prev, {
          questionNumber: questionNum as 1 | 2 | 3,
          wordCount: result.wordCount,
          overallScore: result.overallScore,
          overallLevel: result.overallLevel,
          redFlags: result.redFlags
        }])

        // Feedback inmediato
        if (result.wordCount < 50) {
          addMessage('assistant', `⚠️ Respuesta muy corta (${result.wordCount} palabras). En una entrevista real, esto indicaría falta de preparación. Intenta desarrollar más tus respuestas.`)
        } else if (result.overallScore >= 70) {
          addMessage('assistant', `✅ Buena respuesta (${result.wordCount} palabras). Detecté buena estructura y ejemplos concretos.`)
        } else {
          addMessage('assistant', `📝 Respuesta recibida (${result.wordCount} palabras). Detecté algunas áreas de mejora que veremos al final.`)
        }

        // Siguiente pregunta o finalizar
        if (questionNum < 3) {
          const nextStep = `question${questionNum + 1}` as 'question2' | 'question3'
          setSimulatorStep({ step: nextStep, currentQuestion: questionNum + 1 })
          
          setTimeout(() => {
            addMessage('assistant', `**Pregunta ${questionNum + 1} de 3:**\n\n${SOFT_SKILLS_QUESTIONS[questionNum].text}\n\n💡 *Tip: Usa verbos de acción en primera persona ("yo implementé", "yo lideré") y cuantifica resultados*`)
          }, 1500)
        } else {
          // Todas las preguntas contestadas
          setSimulatorStep({ step: 'analyzing', currentQuestion: 3 })
          addMessage('assistant', '🎯 ¡Perfecto! Analizando tus 3 respuestas con IA...')
          
          // Generar reporte completo
          setTimeout(async () => {
            try {
              const reportResponse = await fetch('/api/soft-skills/report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  analyses: [...analyses, {
                    questionNumber: questionNum,
                    wordCount: result.wordCount,
                    overallScore: result.overallScore,
                    overallLevel: result.overallLevel,
                    redFlags: result.redFlags
                  }]
                })
              })

              if (!reportResponse.ok) throw new Error('Report generation failed')

              const report = await reportResponse.json()
              
              setRadarData(report.radarData)
              setFinalLevel(report.finalLevel)
              setSimulatorStep({ step: 'results', currentQuestion: 3 })
              
              addMessage('assistant', `📊 **Análisis completado.** Tu nivel detectado: **${report.finalLevel}**\n\nVe tu gráfica de radar abajo para ver tus fortalezas y debilidades.`)
              
              // Email gate después de 5 segundos
              setTimeout(() => {
                setShowEmailGate(true)
              }, 5000)
              
            } catch (error) {
              console.error('Report generation error:', error)
              addMessage('assistant', '❌ Hubo un error al generar el reporte. Por favor, intenta de nuevo.')
            }
          }, 3000)
        }

      } catch (error) {
        console.error('Analysis error:', error)
        addMessage('assistant', '❌ Hubo un error al analizar tu respuesta. Por favor, intenta de nuevo.')
      } finally {
        setIsAnalyzing(false)
      }
    }
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    try {
      // Guardar lead y enviar reporte completo
      const response = await fetch('/api/soft-skills/unlock-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          responses,
          analyses
        })
      })

      if (!response.ok) throw new Error('Failed to unlock report')

      // Redirigir a página de resultados detallados con oferta de ebook
      window.location.href = `/soft-skills/report?email=${encodeURIComponent(email)}`
      
    } catch (error) {
      console.error('Email submission error:', error)
      alert('Hubo un error. Por favor, intenta de nuevo.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Simulador de Entrevista
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            ¿Superarías la entrevista de comportamiento en Google o Amazon?
          </p>
          
          {/* Progress bar */}
          {simulatorStep.step !== 'intro' && simulatorStep.step !== 'results' && (
            <div className="mt-6 max-w-md mx-auto">
              <div className="flex justify-between mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <span>Pregunta {simulatorStep.currentQuestion} de 3</span>
                <span>{Math.round((simulatorStep.currentQuestion / 3) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(simulatorStep.currentQuestion / 3) * 100}%` }}
                  transition={{ duration: 0.5 }}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full"
                />
              </div>
            </div>
          )}
        </motion.div>

        {/* Chat Container */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden">
          {/* Messages */}
          <div className="h-[500px] overflow-y-auto p-6 space-y-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      message.role === 'user' 
                        ? 'bg-gradient-to-br from-purple-600 to-blue-600' 
                        : 'bg-gradient-to-br from-green-500 to-emerald-600'
                    }`}>
                      {message.role === 'user' ? (
                        <FaUser className="text-white" />
                      ) : (
                        <FaRobot className="text-white" />
                      )}
                    </div>
                    
                    {/* Message bubble */}
                    <div className={`rounded-2xl p-4 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white'
                    }`}>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content}
                      </p>
                      <span className="text-xs opacity-70 mt-2 block">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {/* Analyzing indicator */}
            {isAnalyzing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="flex gap-3 items-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <FaRobot className="text-white" />
                  </div>
                  <div className="bg-gray-100 dark:bg-slate-700 rounded-2xl p-4">
                    <div className="flex items-center gap-2">
                      <FaSpinner className="animate-spin text-purple-600" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Analizando tu respuesta con IA...
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          {simulatorStep.step !== 'results' && (
            <form onSubmit={handleSubmit} className="border-t border-gray-200 dark:border-slate-700 p-4">
              <div className="flex gap-3">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSubmit(e)
                    }
                  }}
                  placeholder={
                    simulatorStep.step === 'intro' 
                      ? 'Escribe "Sí, estoy listo" para comenzar...'
                      : 'Escribe tu respuesta aquí... (mínimo 50 palabras recomendadas)'
                  }
                  disabled={isAnalyzing}
                  className="flex-1 resize-none rounded-xl border-2 border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-3 text-gray-900 dark:text-white focus:border-purple-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  rows={3}
                />
                <button
                  type="submit"
                  disabled={isAnalyzing || !input.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <FaPaperPlane />
                  Enviar
                </button>
              </div>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Presiona Enter para enviar, Shift+Enter para nueva línea
              </div>
            </form>
          )}
        </div>

        {/* Radar Chart Results */}
        {simulatorStep.step === 'results' && radarData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8"
          >
            <SoftSkillsRadarChart
              labels={radarData.labels}
              scores={radarData.scores}
              level={finalLevel}
              animate={true}
            />
          </motion.div>
        )}

        {/* Email Gate */}
        <AnimatePresence>
          {showEmailGate && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setShowEmailGate(false)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-lg w-full shadow-2xl"
              >
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  🔓 Desbloquea tu análisis completo
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Detectamos {analyses.filter(a => a.redFlags.length > 0).length} áreas críticas de mejora en tus respuestas.
                  <br /><br />
                  Ingresa tu email para recibir:
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Análisis detallado de tus 3 respuestas con Red Flags específicos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Reescritura de tus respuestas usando el método STAR</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Guía PDF: "Dominando Entrevistas de Comportamiento" (USD 10)</span>
                  </li>
                </ul>
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-slate-600 rounded-xl focus:border-purple-500 focus:outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  />
                  <button
                    type="submit"
                    className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-xl transition-all text-lg"
                  >
                    Ver mi análisis completo →
                  </button>
                </form>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
                  No spam. Solo insights valiosos para tu carrera.
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
