'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import ChatBubble from './ChatBubble'
import DualInput from './DualInput'
import SoftSkillsRadarChart from './SoftSkillsRadarChart'
import LeadCaptureForm from './LeadCaptureForm'
import { SOFT_SKILLS_QUESTIONS } from '@/lib/prompts/soft-skills-analyzer'

/**
 * Soft Skills Simulator - Hybrid Chat (Voice + Text)
 * 
 * Sprint 41: Simulador híbrido con input dual
 * 
 * Flujo:
 * 1. Usuario responde 3 preguntas (texto O voz, puede alternar)
 * 2. AI analiza según el canal (texto: gramática/vocabulario; voz: + tono/muletillas)
 * 3. Muestra radar chart + feedback comparativo (comunicación escrita vs verbal)
 * 4. Lead capture form con reporte personalizado
 */

interface ChatMessage {
  id: string
  sender: 'ai' | 'user'
  content: string
  timestamp: Date
  channel?: 'text' | 'voice' // Para trackear el canal usado
}

interface AnalysisResult {
  questionNumber: 1 | 2 | 3
  channel: 'text' | 'voice'
  wordCount: number
  overallScore: number
  
  // Text-specific metrics
  grammarScore?: number
  vocabularyScore?: number
  
  // Voice-specific metrics
  toneScore?: number
  fillerWordsCount?: number
  
  // Common metrics
  starCompliance: number
  redFlags: Array<{
    category: string
    severity: string
    description: string
  }>
}

export default function HybridSoftSkillsSimulator() {
  const router = useRouter()
  
  // State
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<number>(0) // 0=intro, 1-3=questions, 4=complete
  const [isAITyping, setIsAITyping] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  
  const [responses, setResponses] = useState<Array<{ text: string; channel: 'text' | 'voice' }>>([])
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([])
  const [channelUsage, setChannelUsage] = useState<{ text: number; voice: number }>({ text: 0, voice: 0 })
  
  const [radarData, setRadarData] = useState<{ labels: string[], scores: number[] } | null>(null)
  const [comparativeScores, setComparativeScores] = useState<{ written: number; verbal: number } | null>(null)
  const [showLeadCapture, setShowLeadCapture] = useState(false)
  const [showMotivationalNudge, setShowMotivationalNudge] = useState(false)
  
  const [sessionId] = useState(`hybrid_sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [chatHistory, isAITyping])

  // Initialize with welcome message
  useEffect(() => {
    addAIMessage(
      '¡Hola! 👋 Soy tu entrenador de entrevistas de IA.\n\n' +
      'Voy a hacerte 3 preguntas que te harían en Google, Amazon o Microsoft.\n\n' +
      '✨ **Novedad:** Puedes responder escribiendo O hablando. Elige el método que prefieras para cada pregunta.\n\n' +
      '¿Listo para empezar? Escribe "sí" o di "empecemos".'
    )
  }, [])

  // Add AI message with typing simulation
  const addAIMessage = (content: string, delay: number = 500) => {
    setIsAITyping(true)
    
    setTimeout(() => {
      const message: ChatMessage = {
        id: `ai_${Date.now()}_${Math.random()}`,
        sender: 'ai',
        content,
        timestamp: new Date()
      }
      setChatHistory(prev => [...prev, message])
      setIsAITyping(false)
    }, delay)
  }

  // Add user message
  const addUserMessage = (content: string, channel: 'text' | 'voice') => {
    const message: ChatMessage = {
      id: `user_${Date.now()}_${Math.random()}`,
      sender: 'user',
      content,
      timestamp: new Date(),
      channel
    }
    setChatHistory(prev => [...prev, message])
  }

  // Handle text input
  const handleTextSubmit = async (text: string) => {
    if (isProcessing) return

    addUserMessage(text, 'text')
    setChannelUsage(prev => ({ ...prev, text: prev.text + 1 }))

    // Intro -> Start questions
    if (currentQuestion === 0) {
      setCurrentQuestion(1)
      addAIMessage(
        `**Pregunta 1 de 3:**\n\n${SOFT_SKILLS_QUESTIONS[0].text}\n\n` +
        `💡 *Tip: Usa el método STAR (Situación, Tarea, Acción, Resultado) para estructurar tu respuesta.*`,
        800
      )
      return
    }

    // Process question response
    if (currentQuestion >= 1 && currentQuestion <= 3) {
      await processResponse(text, 'text')
    }
  }

  // Handle audio input
  const handleAudioSubmit = async (audioBlob: Blob) => {
    if (isProcessing) return

    addUserMessage('🎤 [Respuesta de audio grabada]', 'voice')
    setChannelUsage(prev => ({ ...prev, voice: prev.voice + 1 }))

    // Intro -> Start questions
    if (currentQuestion === 0) {
      setCurrentQuestion(1)
      addAIMessage(
        `**Pregunta 1 de 3:**\n\n${SOFT_SKILLS_QUESTIONS[0].text}\n\n` +
        `💡 *Tip: Habla con claridad y evita muletillas como "este...", "eh...", "o sea..."*`,
        800
      )
      return
    }

    // Process question response
    if (currentQuestion >= 1 && currentQuestion <= 3) {
      // Convert audio to text first (Whisper API)
      const transcribedText = await transcribeAudio(audioBlob)
      await processResponse(transcribedText, 'voice', audioBlob)
    }
  }

  // Transcribe audio using Whisper API
  const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'response.webm')

      const response = await fetch('/api/soft-skills/transcribe', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) throw new Error('Transcription failed')

      const { transcription } = await response.json()
      return transcription
    } catch (error) {
      console.error('Transcription error:', error)
      throw error
    }
  }

  // Process response (text or voice)
  const processResponse = async (text: string, channel: 'text' | 'voice', audioBlob?: Blob) => {
    setIsProcessing(true)
    addAIMessage('🤔 Analizando tu respuesta...', 500)

    try {
      // Prepare form data
      const formData = new FormData()
      formData.append('questionNumber', currentQuestion.toString())
      formData.append('userResponse', text)
      formData.append('channel', channel)
      
      if (audioBlob) {
        formData.append('audio', audioBlob, 'response.webm')
      }

      // Call analysis API
      const response = await fetch('/api/soft-skills/analyze-hybrid', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) throw new Error('Analysis failed')

      const result = await response.json()
      
      // Save response and analysis
      setResponses(prev => [...prev, { text, channel }])
      setAnalyses(prev => [...prev, {
        questionNumber: currentQuestion as 1 | 2 | 3,
        channel,
        wordCount: result.wordCount,
        overallScore: result.overallScore,
        grammarScore: result.grammarScore,
        vocabularyScore: result.vocabularyScore,
        toneScore: result.toneScore,
        fillerWordsCount: result.fillerWordsCount,
        starCompliance: result.starCompliance,
        redFlags: result.redFlags
      }])

      // Immediate feedback based on channel
      let feedbackMsg = ''
      
      if (channel === 'text') {
        if (result.grammarScore >= 80 && result.vocabularyScore >= 80) {
          feedbackMsg = `✅ Excelente comunicación escrita (${result.wordCount} palabras). Gramática clara y vocabulario técnico apropiado.`
        } else if (result.grammarScore < 60) {
          feedbackMsg = `⚠️ Detecté algunos errores gramaticales. En entrevistas escritas (email, Slack), la ortografía es crucial.`
        } else {
          feedbackMsg = `📝 Respuesta recibida (${result.wordCount} palabras). La estructura es clara, pero hay margen de mejora.`
        }
      } else {
        if (result.toneScore >= 75 && result.fillerWordsCount <= 3) {
          feedbackMsg = `✅ Excelente comunicación verbal. Tono confiado y pocas muletillas (${result.fillerWordsCount}).`
        } else if (result.fillerWordsCount > 8) {
          feedbackMsg = `⚠️ Detecté ${result.fillerWordsCount} muletillas. Esto puede restar autoridad en entrevistas presenciales.`
        } else {
          feedbackMsg = `🎤 Audio procesado (${result.wordCount} palabras). El tono es adecuado, con áreas de mejora.`
        }
      }

      addAIMessage(feedbackMsg, 1000)

      // Next question or finish
      if (currentQuestion < 3) {
        setCurrentQuestion(prev => prev + 1)
        const nextQ = currentQuestion + 1
        
        setTimeout(() => {
          addAIMessage(
            `**Pregunta ${nextQ} de 3:**\n\n${SOFT_SKILLS_QUESTIONS[nextQ - 1].text}\n\n` +
            `💡 *Tip: ${channel === 'text' ? 'Puedes seguir escribiendo o cambiar a voz si prefieres' : 'Puedes seguir hablando o cambiar a texto si prefieres'}*`,
            1500
          )
        }, 2000)
      } else {
        // All questions answered -> Generate full report
        setCurrentQuestion(4)
        addAIMessage('🎯 ¡Perfecto! Generando tu análisis comparativo...', 1500)
        
        setTimeout(() => {
          generateFinalReport()
        }, 3000)
      }

    } catch (error) {
      console.error('Processing error:', error)
      addAIMessage('❌ Error al procesar tu respuesta. Por favor, intenta de nuevo.', 500)
    } finally {
      setIsProcessing(false)
    }
  }

  // Generate final report with comparative analysis
  const generateFinalReport = async () => {
    try {
      const response = await fetch('/api/soft-skills/report-hybrid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          analyses,
          channelUsage
        })
      })

      if (!response.ok) throw new Error('Report generation failed')

      const report = await response.json()
      
      setRadarData(report.radarData)
      setComparativeScores(report.comparativeScores)
      
      // Comparative feedback message
      let comparativeMsg = '📊 **Análisis completado.**\n\n'
      
      if (report.comparativeScores) {
        const { written, verbal } = report.comparativeScores
        comparativeMsg += `**Comunicación Escrita:** ${written}/100\n`
        comparativeMsg += `**Comunicación Verbal:** ${verbal}/100\n\n`
        
        if (written > verbal + 15) {
          comparativeMsg += `💡 Te comunicas mejor escribiendo. Considera practicar más tus habilidades de presentación oral.`
        } else if (verbal > written + 15) {
          comparativeMsg += `💡 Te comunicas mejor hablando. Considera mejorar tu redacción técnica (emails, documentación).`
        } else {
          comparativeMsg += `✨ Tienes un balance equilibrado entre comunicación escrita y verbal. ¡Excelente!`
        }
      }
      
      addAIMessage(comparativeMsg, 1000)
      
      // Show motivational nudge if user only used text
      if (channelUsage.text > 0 && channelUsage.voice === 0) {
        setTimeout(() => {
          setShowMotivationalNudge(true)
          addAIMessage(
            '💬 **Nota:** Escribir es el primer paso, pero **los grandes salarios se cierran hablando**.\n\n' +
            '¿Te gustaría reintentar una pregunta con audio para ver cómo te desenvuelves verbalmente? ' +
            'Esto te ayudará a prepararte mejor para entrevistas presenciales y videollamadas.',
            2000
          )
        }, 3000)
      }
      
      // Show lead capture after 3 seconds
      setTimeout(() => {
        setShowLeadCapture(true)
      }, channelUsage.voice === 0 ? 8000 : 5000) // Más tiempo si mostramos el nudge

    } catch (error) {
      console.error('Report generation error:', error)
      addAIMessage('❌ Error al generar el reporte. Por favor, intenta de nuevo.', 500)
    }
  }

  const handleLeadCaptureSuccess = () => {
    // Redirect handled by LeadCaptureForm
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Simulador Híbrido de Entrevista
          </h1>
          <p className="text-lg text-purple-200">
            Responde con texto o voz - Descubre cómo te comunicas mejor
          </p>
          
          {/* Progress bar */}
          {currentQuestion > 0 && currentQuestion <= 3 && (
            <div className="mt-4 max-w-md mx-auto">
              <div className="flex justify-between mb-2 text-sm font-semibold text-white">
                <span>Pregunta {currentQuestion} de 3</span>
                <span>{Math.round((currentQuestion / 3) * 100)}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentQuestion / 3) * 100}%` }}
                  transition={{ duration: 0.5 }}
                  className="bg-gradient-to-r from-green-400 to-teal-500 h-2 rounded-full"
                />
              </div>
            </div>
          )}

          {/* Channel usage stats (after first question) */}
          {currentQuestion >= 2 && (
            <div className="mt-4 flex items-center justify-center gap-6 text-sm text-purple-200">
              <div className="flex items-center gap-2">
                <span>✍️</span>
                <span>{channelUsage.text} texto</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🎤</span>
                <span>{channelUsage.voice} voz</span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Chat Container */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
          {/* Messages Area */}
          <div
            ref={chatContainerRef}
            className="h-[500px] overflow-y-auto p-6 space-y-4"
          >
            {chatHistory.map(msg => (
              <ChatBubble
                key={msg.id}
                message={msg.content}
                sender={msg.sender}
                timestamp={msg.timestamp}
              />
            ))}

            {isAITyping && (
              <ChatBubble
                message=""
                sender="ai"
                isTyping={true}
              />
            )}

            {/* Radar Chart (after completion) */}
            {radarData && currentQuestion === 4 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="my-8"
              >
                <SoftSkillsRadarChart
                  labels={radarData.labels}
                  scores={radarData.scores}
                />
              </motion.div>
            )}

            {/* Comparative Scores Card */}
            {comparativeScores && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 backdrop-blur-sm rounded-xl p-6 border border-white/30"
              >
                <h3 className="text-xl font-bold text-white mb-4 text-center">
                  📊 Tu Comunicación: Escrita vs Verbal
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 rounded-lg p-4 text-center">
                    <div className="text-3xl mb-2">✍️</div>
                    <div className="text-4xl font-bold text-white mb-1">
                      {comparativeScores.written}
                    </div>
                    <div className="text-sm text-purple-200">Comunicación Escrita</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4 text-center">
                    <div className="text-3xl mb-2">🎤</div>
                    <div className="text-4xl font-bold text-white mb-1">
                      {comparativeScores.verbal}
                    </div>
                    <div className="text-sm text-purple-200">Comunicación Verbal</div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Input Area */}
          {currentQuestion <= 3 && !showLeadCapture && (
            <div className="border-t border-white/20 p-4">
              <DualInput
                onSendText={handleTextSubmit}
                onSendAudio={handleAudioSubmit}
                disabled={isProcessing || isAITyping}
                placeholder={currentQuestion === 0 ? 'Escribe "sí" para empezar...' : 'Escribe tu respuesta aquí...'}
              />
            </div>
          )}
        </div>

        {/* Lead Capture Overlay */}
        <AnimatePresence>
          {showLeadCapture && radarData && (
            <LeadCaptureForm
              sessionId={sessionId}
              analysisResults={{
                toneScore: analyses.reduce((sum, a) => sum + (a.toneScore || 0), 0) / analyses.filter(a => a.toneScore).length || 70,
                fillerWordsCount: Math.round(analyses.reduce((sum, a) => sum + (a.fillerWordsCount || 0), 0) / analyses.filter(a => a.fillerWordsCount).length) || 5,
                starCompliance: Math.round(analyses.reduce((sum, a) => sum + a.starCompliance, 0) / analyses.length),
                transcriptions: responses.map(r => r.text)
              }}
              onSuccess={handleLeadCaptureSuccess}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
