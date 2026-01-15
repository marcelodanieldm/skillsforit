'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export const dynamic = 'force-dynamic'
import { motion } from 'framer-motion'
import { FaCheck, FaExclamationTriangle, FaLightbulb, FaRocket, FaDownload } from 'react-icons/fa'

interface FullAnalysisResult {
  score: number
  atsScore: number
  problems: Array<{
    category: string
    severity: 'high' | 'medium' | 'low'
    description: string
    impact: string
  }>
  improvements: Array<{
    category: string
    before: string
    after: string
    explanation: string
    impact: string
  }>
  strengths: string[]
  recommendations: string[]
}

export default function FullCVReportPage() {
  const searchParams = useSearchParams()
  const analysisId = searchParams.get('analysisId')
  const paymentIntentId = searchParams.get('paymentIntentId')
  const [result, setResult] = useState<FullAnalysisResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (paymentIntentId) {
      loadFullReport()
    } else {
      setError('ID de pago no encontrado')
      setLoading(false)
    }
  }, [paymentIntentId])

  const loadFullReport = async () => {
    try {
      const response = await fetch(`/api/cv-audit/full-report?analysisId=${analysisId}&paymentIntentId=${paymentIntentId}`)
      if (!response.ok) {
        throw new Error('No se pudo cargar el reporte completo')
      }
      const data = await response.json()
      setResult(data)
    } catch (err: any) {
      setError(err.message || 'Error al cargar el reporte')
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getSeverityColor = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high': return 'text-red-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tu auditoría completa...</p>
        </div>
      </div>
    )
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">{error || 'No se pudo cargar el reporte'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
            <FaCheck className="text-green-500 text-4xl mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-green-800 mb-2">
              ¡Auditoría Completa Desbloqueada!
            </h1>
            <p className="text-green-700">
              Ahora tienes acceso a todos los consejos detallados y recomendaciones específicas
            </p>
          </div>
        </motion.div>

        {/* Score Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="grid md:grid-cols-2 gap-6">
            <div className="text-center">
              <div className={`text-6xl font-bold ${getScoreColor(result.score)} mb-2`}>
                {result.score}/100
              </div>
              <div className="text-gray-600">Score General</div>
              <div className="text-sm text-gray-500 mt-2">
                Evaluación completa de 50+ criterios profesionales
              </div>
            </div>
            <div className="text-center">
              <div className={`text-6xl font-bold ${getScoreColor(result.atsScore)} mb-2`}>
                {result.atsScore}/100
              </div>
              <div className="text-gray-600">Score ATS</div>
              <div className="text-sm text-gray-500 mt-2">
                Compatibilidad con sistemas de reclutamiento automático
              </div>
            </div>
          </div>
        </motion.div>

        {/* Detailed Improvements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <FaLightbulb className="text-yellow-500" />
            Consejos Detallados para Mejorar
          </h2>
          <div className="space-y-6">
            {result.improvements.map((improvement, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {improvement.category}
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-red-600 mb-2">❌ ANTES (Problema)</h4>
                    <p className="text-gray-700 bg-red-50 p-3 rounded">{improvement.before}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-green-600 mb-2">✅ DESPUÉS (Solución)</h4>
                    <p className="text-gray-700 bg-green-50 p-3 rounded">{improvement.after}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <h4 className="font-medium text-blue-600 mb-2">💡 Explicación</h4>
                  <p className="text-gray-700">{improvement.explanation}</p>
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded">
                  <strong className="text-blue-800">Impacto:</strong> {improvement.impact}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Problems */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <FaExclamationTriangle className="text-red-500" />
            Problemas Críticos Identificados
          </h2>
          <div className="space-y-4">
            {result.problems.map((problem, index) => (
              <div key={index} className="border-l-4 border-red-500 pl-6 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`font-bold ${getSeverityColor(problem.severity)}`}>
                    {problem.severity.toUpperCase()}
                  </span>
                  <span className="text-gray-600 font-medium">• {problem.category}</span>
                </div>
                <p className="text-gray-800 mb-2">{problem.description}</p>
                <p className="text-sm text-gray-600 italic bg-gray-50 p-2 rounded">
                  💥 Impacto: {problem.impact}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Strengths */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <FaCheck className="text-green-500" />
            Tus Fortalezas
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {result.strengths.map((strength, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded">
                <FaCheck className="text-green-500 mt-1 flex-shrink-0" />
                <span className="text-gray-700">{strength}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <FaRocket className="text-blue-500" />
            Recomendaciones Estratégicas
          </h2>
          <div className="space-y-4">
            {result.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-blue-50 rounded">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <span className="text-gray-700">{rec}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-lg p-6 text-center"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            ¿Listo para Aplicar estos Cambios?
          </h3>
          <p className="text-gray-600 mb-6">
            Implementa estos consejos y aumenta tu score en 30-50 puntos
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.print()}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <FaDownload />
              Descargar Reporte PDF
            </button>
            <a
              href="/cv-audit"
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors text-center"
            >
              Analizar Otro CV
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  )
}