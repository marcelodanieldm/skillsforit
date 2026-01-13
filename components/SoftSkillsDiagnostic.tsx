'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaCheckCircle, FaTimesCircle, FaChartLine, FaRocket } from 'react-icons/fa'
import Link from 'next/link'
import { useFunnelTracking } from '@/lib/hooks/useFunnelTracking'

/**
 * Sprint 24: Widget de Mini-diagnóstico de Soft Skills
 * 
 * Lead magnet interactivo que:
 * - Hace 3 preguntas clave sobre soft skills
 * - Genera un resultado personalizado
 * - Crea urgencia y deseo de comprar la guía
 * - Trackea engagement para optimización
 * 
 * Psicología de conversión:
 * - Efecto de compromiso (ya invirtieron tiempo)
 * - Gap de curiosidad (quieren saber más)
 * - Dolor + solución inmediata
 */

interface Question {
  id: number
  text: string
  options: {
    text: string
    value: 'weak' | 'medium' | 'strong'
  }[]
}

interface Result {
  score: number
  level: 'beginner' | 'intermediate' | 'advanced'
  title: string
  description: string
  weakPoints: string[]
  urgency: string
  cta: string
}

export default function SoftSkillsDiagnostic() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<('weak' | 'medium' | 'strong')[]>([])
  const [showResult, setShowResult] = useState(false)
  const [startTime] = useState(Date.now())
  const { trackEvent } = useFunnelTracking()

  const questions: Question[] = [
    {
      id: 1,
      text: "Cuando un reclutador te pregunta 'Cuál es tu expectativa salarial?', ¿cómo sueles responder?",
      options: [
        {
          text: "Doy un número específico sin investigar primero",
          value: 'weak'
        },
        {
          text: "Digo 'Estoy abierto a negociar' para no arriesgar",
          value: 'weak'
        },
        {
          text: "Pregunto por el rango presupuestado antes de responder",
          value: 'strong'
        },
        {
          text: "No estoy seguro, evito el tema",
          value: 'weak'
        }
      ]
    },
    {
      id: 2,
      text: "Tu líder te pide hacer horas extra sin compensación. ¿Cómo manejas esta situación?",
      options: [
        {
          text: "Acepto para no parecer conflictivo, aunque no quiero",
          value: 'weak'
        },
        {
          text: "Me niego directamente sin explicación",
          value: 'medium'
        },
        {
          text: "Explico mis límites asertivamente y propongo alternativas",
          value: 'strong'
        },
        {
          text: "Acepto con resentimiento y después busco otro trabajo",
          value: 'weak'
        }
      ]
    },
    {
      id: 3,
      text: "En una entrevista te preguntan: 'Cuéntame de un proyecto desafiante'. ¿Qué haces?",
      options: [
        {
          text: "Describo las tecnologías que usé sin contexto de negocio",
          value: 'weak'
        },
        {
          text: "Explico el problema, mi solución y el impacto con métricas",
          value: 'strong'
        },
        {
          text: "Digo que todos mis proyectos fueron desafiantes",
          value: 'weak'
        },
        {
          text: "Me pongo nervioso y olvido detalles importantes",
          value: 'weak'
        }
      ]
    }
  ]

  const handleAnswer = (value: 'weak' | 'medium' | 'strong') => {
    const newAnswers = [...answers, value]
    setAnswers(newAnswers)

    // Track engagement
    if (typeof window !== 'undefined') {
      const timeSpent = Date.now() - startTime
      console.log('[Diagnostic] Question answered:', {
        questionId: questions[currentQuestion].id,
        answer: value,
        timeSpent: `${timeSpent}ms`
      })
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      setShowResult(true)
      // Track completion
      const totalTime = Date.now() - startTime
      trackEvent('diagnostic_completed', {
        metadata: {
          totalTime: `${totalTime}ms`,
          answers: newAnswers,
          score: calculateScore(newAnswers)
        }
      })
      console.log('[Diagnostic] Completed:', {
        totalTime: `${totalTime}ms`,
        answers: newAnswers
      })
    }
  }

  const calculateScore = (answers: ('weak' | 'medium' | 'strong')[]) => {
    const scoreMap = { weak: 0, medium: 50, strong: 100 }
    const totalScore = answers.reduce((sum, answer) => sum + scoreMap[answer], 0)
    return Math.round(totalScore / answers.length)
  }

  const calculateResult = (): Result => {
    const scoreMap = { weak: 0, medium: 50, strong: 100 }
    const totalScore = answers.reduce((sum, answer) => sum + scoreMap[answer], 0)
    const avgScore = Math.round(totalScore / answers.length)

    if (avgScore < 40) {
      return {
        score: avgScore,
        level: 'beginner',
        title: '🚨 Tus Soft Skills Necesitan Atención URGENTE',
        description: 'Tu diagnóstico revela que las soft skills están frenando significativamente tu potencial de carrera. Esto explica por qué:',
        weakPoints: [
          'Probablemente estás dejando dinero sobre la mesa en negociaciones',
          'Te cuesta comunicar tu valor real en entrevistas',
          'Evitas conversaciones difíciles o las manejas mal',
          'Los reclutadores no ven tu verdadero potencial'
        ],
        urgency: '⚠️ Cada mes sin estas habilidades es un mes perdido de crecimiento profesional',
        cta: 'La buena noticia: Esto se puede arreglar en semanas, no años'
      }
    } else if (avgScore < 70) {
      return {
        score: avgScore,
        level: 'intermediate',
        title: '⚡ Tienes Bases, Pero Dejas Dinero Sobre la Mesa',
        description: 'Manejas algunas situaciones bien, pero hay gaps críticos que te están costando oportunidades:',
        weakPoints: [
          'Sabes lo básico pero te falta estructura en negociaciones',
          'Tus respuestas en entrevistas son correctas pero no memorables',
          'Podrías estar ganando 20-30% más con mejores técnicas',
          'Los ascensos se te escapan por falta de storytelling'
        ],
        urgency: '💰 Estás al 60% de tu potencial salarial. ¿Por qué conformarte?',
        cta: 'Sube al siguiente nivel y desbloquea las oportunidades que mereces'
      }
    } else {
      return {
        score: avgScore,
        level: 'advanced',
        title: '🎯 Tienes Buen Instinto, Pero Aún Hay Oro por Pulir',
        description: 'Manejas bien las soft skills intuitivamente, pero imagina si tuvieras frameworks probados:',
        weakPoints: [
          'Podrías estructurar tus respuestas con el método STAR++',
          'Negociaciones con scripts word-by-word serían más consistentes',
          'Técnicas avanzadas de storytelling te harían inolvidable',
          'Con frameworks puedes enseñar a tu equipo (valor de liderazgo)'
        ],
        urgency: '🚀 Estás cerca de la excelencia. No te quedes al 80%',
        cta: 'Afina estas habilidades y conviértete en el candidato que todos quieren'
      }
    }
  }

  const result = showResult ? calculateResult() : null

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!showResult ? (
          <motion.div
            key={`question-${currentQuestion}`}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            {/* Progress */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-gray-700">
                Pregunta {currentQuestion + 1} de {questions.length}
              </span>
              <div className="flex gap-2">
                {questions.map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 w-12 rounded-full transition-all ${
                      i <= currentQuestion ? 'bg-purple-600' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Question */}
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {questions[currentQuestion].text}
              </h3>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {questions[currentQuestion].options.map((option, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAnswer(option.value)}
                  className="w-full p-4 bg-white dark:bg-slate-700 rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:border-purple-600 dark:hover:border-purple-400 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center flex-shrink-0">
                      <div className="w-3 h-3 rounded-full bg-purple-600 opacity-0 group-hover:opacity-100"></div>
                    </div>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {option.text}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {/* Score Circle */}
            <div className="text-center mb-8">
              <div className="inline-block relative">
                <svg className="w-40 h-40">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="#e5e7eb"
                    strokeWidth="10"
                    fill="none"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke={result.level === 'beginner' ? '#ef4444' : result.level === 'intermediate' ? '#f59e0b' : '#10b981'}
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray={`${(result.score / 100) * 440} 440`}
                    strokeLinecap="round"
                    transform="rotate(-90 80 80)"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-4xl font-black text-gray-900">
                    {result.score}
                  </div>
                  <div className="text-sm text-gray-600">puntos</div>
                </div>
              </div>
            </div>

            {/* Result Title */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 border-2 border-purple-200 dark:border-purple-700">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3">
                {result.title}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {result.description}
              </p>
            </div>

            {/* Weak Points */}
            <div className="space-y-3">
              {result.weakPoints.map((point, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg"
                >
                  <FaTimesCircle className="text-red-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">{point}</span>
                </motion.div>
              ))}
            </div>

            {/* Urgency */}
            <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-300 dark:border-orange-600 rounded-xl p-6">
              <p className="text-lg font-bold text-orange-900 dark:text-orange-300">
                {result.urgency}
              </p>
            </div>

            {/* Solution */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border-2 border-green-300 dark:border-green-600">
              <div className="flex items-start gap-3 mb-4">
                <FaCheckCircle className="text-green-600 text-2xl flex-shrink-0" />
                <div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {result.cta}
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    La Guía de Soft Skills te da los frameworks exactos que necesitas para:
                  </p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center gap-2">
                      <FaCheckCircle className="text-green-600" />
                      <span className="text-gray-700 dark:text-gray-300">Negociar salario con scripts word-by-word</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <FaCheckCircle className="text-green-600" />
                      <span className="text-gray-700 dark:text-gray-300">Estructurar respuestas de entrevista con STAR++</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <FaCheckCircle className="text-green-600" />
                      <span className="text-gray-700 dark:text-gray-300">Comunicar asertivamente sin generar conflictos</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* CTA Button */}
              <Link href="/soft-skills-guide/checkout">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-2xl transition-all flex items-center justify-center gap-2"
                >
                  <FaRocket />
                  Obtener la Guía Completa por $10
                </motion.button>
              </Link>

              <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
                ⏰ Oferta limitada: 50% OFF - Solo este mes
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="text-center p-4 bg-white dark:bg-slate-700 rounded-lg">
                <div className="text-2xl font-black text-purple-600 mb-1">12K+</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Ya lo tienen</div>
              </div>
              <div className="text-center p-4 bg-white dark:bg-slate-700 rounded-lg">
                <div className="text-2xl font-black text-purple-600 mb-1">+28%</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Aumento promedio</div>
              </div>
              <div className="text-center p-4 bg-white dark:bg-slate-700 rounded-lg">
                <div className="text-2xl font-black text-purple-600 mb-1">4.9/5</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Satisfacción</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
