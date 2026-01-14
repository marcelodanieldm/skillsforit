'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FaLock, FaUnlock, FaCheck, FaExclamationTriangle, FaRocket } from 'react-icons/fa'

interface PreAuditResult {
  analysisId: string
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
  isPreview: boolean
}

interface PreAuditReportProps {
  result: PreAuditResult
  onUnlock: () => void
}

export default function PreAuditReport({ result, onUnlock }: PreAuditReportProps) {
  const [unlocking, setUnlocking] = useState(false)

  const handleUnlock = async () => {
    setUnlocking(true)
    await onUnlock()
    setUnlocking(false)
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

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          ¡Auditoría de CV Completada!
        </h1>
        <p className="text-gray-600">
          Analizamos tu CV contra 50+ criterios profesionales para roles IT
        </p>
      </motion.div>

      {/* Score Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <div className="grid md:grid-cols-2 gap-6">
          <div className="text-center">
            <div className={`text-5xl font-bold ${getScoreColor(result.score)} mb-2`}>
              {result.score}/100
            </div>
            <div className="text-gray-600">Score General</div>
          </div>
          <div className="text-center">
            <div className={`text-5xl font-bold ${getScoreColor(result.atsScore)} mb-2`}>
              {result.atsScore}/100
            </div>
            <div className="text-gray-600">Score ATS</div>
          </div>
        </div>
      </motion.div>

      {/* Critical Problems */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FaExclamationTriangle className="text-red-500" />
          Errores Críticos Detectados
        </h2>
        <div className="space-y-4">
          {result.problems.map((problem, index) => (
            <div key={index} className="border-l-4 border-red-500 pl-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={`font-semibold ${getSeverityColor(problem.severity)}`}>
                  {problem.severity.toUpperCase()}
                </span>
                <span className="text-gray-600">• {problem.category}</span>
              </div>
              <p className="text-gray-800 mb-2">{problem.description}</p>
              <p className="text-sm text-gray-600 italic">{problem.impact}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Strengths */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FaCheck className="text-green-500" />
          Tus Fortalezas
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {result.strengths.map((strength, index) => (
            <div key={index} className="flex items-start gap-3">
              <FaCheck className="text-green-500 mt-1 flex-shrink-0" />
              <span className="text-gray-700">{strength}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Blocked Improvements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          💡 Consejos para Mejorar tu Score
        </h2>
        <div className="space-y-4">
          {result.improvements.map((improvement, index) => (
            <div key={index} className="relative">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {improvement.category}
                </h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Antes: </span>
                    <span className="text-gray-800">{improvement.before}</span>
                  </div>
                  <div className="relative">
                    <span className="text-sm font-medium text-gray-600">Después: </span>
                    <span className="text-gray-800 blur-sm select-none">
                      {improvement.after}
                    </span>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-2 border">
                        <FaLock className="text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">
                          Contenido Bloqueado
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <span className="text-sm font-medium text-gray-600">Por qué: </span>
                    <span className="text-gray-800 blur-sm select-none">
                      {improvement.explanation}
                    </span>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-2 border">
                        <FaLock className="text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">
                          Explicación Completa
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            ¡Desbloquea tu Auditoría Completa!
          </h3>
          <p className="text-gray-600 mb-6">
            Obtén consejos detallados, keywords específicas y un plan de mejora personalizado
            para aumentar tu score en un 30-50%.
          </p>

          <div className="bg-white rounded-lg p-4 mb-6 inline-block">
            <div className="text-3xl font-bold text-green-600 mb-2">$7 USD</div>
            <div className="text-sm text-gray-600">Una sola vez • Acceso inmediato</div>
          </div>

          <button
            onClick={handleUnlock}
            disabled={unlocking}
            className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 flex items-center gap-2 mx-auto disabled:opacity-50"
          >
            {unlocking ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Procesando...
              </>
            ) : (
              <>
                <FaUnlock />
                Desbloquear mi Auditoría Completa por $7
              </>
            )}
          </button>

          <p className="text-sm text-gray-500 mt-4">
            ✅ Pago seguro con Stripe • ✅ Resultados inmediatos • ✅ Sin suscripción
          </p>
        </div>
      </motion.div>

      {/* Recommendations Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          📋 Recomendaciones Generales
        </h2>
        <div className="space-y-3">
          {result.recommendations.map((rec, index) => (
            <div key={index} className="flex items-start gap-3">
              <FaRocket className="text-blue-500 mt-1 flex-shrink-0" />
              <span className="text-gray-700">{rec}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}