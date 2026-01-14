'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { FaCheckCircle, FaExclamationTriangle, FaBook, FaFileAlt, FaVideo, FaArrowRight, FaSpinner } from 'react-icons/fa'
import Link from 'next/link'

/**
 * Soft Skills Report & Sales Funnel
 * 
 * Sprint 37: Página de resultados detallados + funnel de conversión
 * 
 * Flujo:
 * 1. Muestra análisis completo con red flags específicos
 * 2. Ofrece Guía de Soft Skills por USD 10 (producto principal)
 * 3. Order bump: Auditoría de CV por +USD 7
 * 4. Upsell: Mentoría 10 min por +USD 15
 */

interface RedFlag {
  category: string
  severity: string
  description: string
  example: string
  fix: string
}

interface ReportData {
  sessionId: string
  overallScore: number
  finalLevel: string
  totalRedFlags: number
  criticalRedFlags: number
  redFlagsDetail: RedFlag[]
  topRecommendations: Array<{
    priority: number
    action: string
    impact: string
  }>
}

function SoftSkillsReportContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('sessionId')
  const email = searchParams.get('email')

  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionId || !email) {
      setError('Invalid session. Please complete the simulator first.')
      setLoading(false)
      return
    }

    // Fetch full report
    // En producción, esto vendría de la DB con el sessionId
    // Por ahora, simulamos los datos
    setTimeout(() => {
      setReportData({
        sessionId,
        overallScore: 54,
        finalLevel: 'Colaborador Reactivo',
        totalRedFlags: 7,
        criticalRedFlags: 2,
        redFlagsDetail: [
          {
            category: 'ownership',
            severity: 'critical',
            description: 'Falta de ownership - Usa lenguaje pasivo',
            example: '"Se decidió cambiar el approach" en lugar de "Yo decidí cambiar el approach"',
            fix: 'Usa "yo" cuando hables de tus decisiones: "Yo analicé las opciones y decidí implementar X porque..."'
          },
          {
            category: 'vagueness',
            severity: 'high',
            description: 'No cuantifica resultados',
            example: '"El proyecto salió bien" sin métricas específicas',
            fix: 'Cuantifica: "El proyecto redujo el tiempo de carga en 40% y aumentó la conversión en 15%"'
          },
          {
            category: 'blame',
            severity: 'high',
            description: 'Culpa a factores externos',
            example: '"El equipo no entendía mi visión"',
            fix: '"Yo no comuniqué mi visión de forma clara, así que organicé una sesión de alineamiento"'
          }
        ],
        topRecommendations: [
          {
            priority: 1,
            action: 'Lee nuestra Guía de Soft Skills (ver oferta abajo)',
            impact: 'Aprenderás a reescribir tus respuestas con método STAR en 1 hora'
          },
          {
            priority: 1,
            action: 'Audita tu CV para alinear lo que dices con lo que escribes',
            impact: 'El 70% de rechazos viene de incoherencias entre CV y entrevista'
          },
          {
            priority: 2,
            action: 'Practica tus respuestas en voz alta 10 veces',
            impact: 'Reducirás nervios y ganarás fluidez natural'
          }
        ]
      })
      setLoading(false)
    }, 2000)
  }, [sessionId, email])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-6xl text-purple-600 mx-auto mb-4" />
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Generando tu reporte detallado...
          </p>
        </div>
      </div>
    )
  }

  if (error || !reportData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <FaExclamationTriangle className="text-6xl text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Error al cargar reporte
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || 'No pudimos encontrar tu sesión. Por favor, completa el simulador primero.'}
          </p>
          <Link
            href="/soft-skills/simulator"
            className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-all"
          >
            Volver al Simulador
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Tu Análisis Completo de Soft Skills
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Basado en tus respuestas al simulador de entrevista
          </p>
        </motion.div>

        {/* Overall Score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg mb-8"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Tu Nivel: {reportData.finalLevel}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Score general: {Math.round(reportData.overallScore)}/100
              </p>
            </div>
            <div className={`text-6xl font-bold ${
              reportData.overallScore >= 80 ? 'text-green-600' :
              reportData.overallScore >= 60 ? 'text-blue-600' :
              reportData.overallScore >= 40 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {Math.round(reportData.overallScore)}
            </div>
          </div>
        </motion.div>

        {/* Red Flags */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <FaExclamationTriangle className="text-3xl text-red-600" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Red Flags Detectados ({reportData.totalRedFlags})
            </h2>
          </div>

          <div className="space-y-6">
            {reportData.redFlagsDetail.map((flag, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-xl border-2 ${
                  flag.severity === 'critical' 
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
                    : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {flag.description}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    flag.severity === 'critical'
                      ? 'bg-red-600 text-white'
                      : 'bg-yellow-600 text-white'
                  }`}>
                    {flag.severity.toUpperCase()}
                  </span>
                </div>
                
                <div className="mb-3">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    ❌ Lo que dijiste:
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 italic">
                    "{flag.example}"
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    ✅ Cómo mejorarlo:
                  </p>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {flag.fix}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Recomendaciones Prioritarias
          </h2>
          
          <div className="space-y-4">
            {reportData.topRecommendations.map((rec, idx) => (
              <div
                key={idx}
                className="flex gap-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">
                  {rec.priority}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white mb-1">
                    {rec.action}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    💡 {rec.impact}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* SALES FUNNEL: Guía de Soft Skills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-8 shadow-2xl text-white mb-8"
        >
          <div className="text-center mb-8">
            <FaBook className="text-6xl mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">
              🎯 Corrige estos Red Flags en 1 Hora
            </h2>
            <p className="text-xl opacity-90 mb-2">
              Guía Completa: "Dominando Entrevistas de Comportamiento"
            </p>
            <p className="text-lg opacity-80">
              40 páginas · Método STAR · 20+ Ejemplos Reales · Plantillas de Respuestas
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
            <h3 className="text-xl font-bold mb-4">Incluye:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                'Método STAR paso a paso',
                '20 preguntas más comunes (Google, Amazon, Meta)',
                'Plantillas de respuestas por rol (Frontend, Backend, DevOps)',
                'Cómo corregir lenguaje pasivo',
                'Técnicas de storytelling técnico',
                'Negociación de salario asertiva',
                'Casos de éxito reales',
                'Checklist pre-entrevista'
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-300 flex-shrink-0" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <div className="mb-4">
              <span className="text-4xl font-bold">USD 10</span>
              <span className="text-lg opacity-80 line-through ml-3">USD 29</span>
              <span className="ml-3 px-3 py-1 bg-red-500 rounded-full text-sm font-bold">
                -65% OFF
              </span>
            </div>
            <Link
              href={`/checkout/soft-skills-guide?email=${encodeURIComponent(email || '')}&sessionId=${sessionId}`}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-600 hover:bg-gray-100 font-bold rounded-xl text-lg transition-all shadow-lg"
            >
              Obtener la Guía Ahora
              <FaArrowRight />
            </Link>
            <p className="text-sm opacity-80 mt-4">
              🔒 Pago seguro · Descarga inmediata · 30 días de garantía
            </p>
          </div>
        </motion.div>

        {/* Order Bump Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border-2 border-dashed border-purple-300 dark:border-purple-600"
        >
          <div className="flex items-center gap-4">
            <FaFileAlt className="text-4xl text-purple-600" />
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                💡 Sugerencia: Auditoría de CV
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                En el checkout, podrás agregar una auditoría profesional de tu CV por solo +USD 7 adicionales
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default function SoftSkillsReportPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <FaSpinner className="animate-spin text-6xl text-purple-600" />
      </div>
    }>
      <SoftSkillsReportContent />
    </Suspense>
  )
}
