'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { FaCheckCircle, FaEnvelope, FaDownload, FaClock } from 'react-icons/fa'
import Link from 'next/link'

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [processing, setProcessing] = useState(true)

  useEffect(() => {
    // Simulate processing time
    const timer = setTimeout(() => {
      setProcessing(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {processing ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-500 rounded-full mb-8">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white"></div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Procesando tu análisis...
            </h1>
            <p className="text-xl text-gray-300">
              Nuestra IA está analizando tu CV en este momento
            </p>
            <div className="mt-8 flex justify-center gap-2">
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="inline-flex items-center justify-center w-24 h-24 bg-green-500 rounded-full mb-8"
            >
              <FaCheckCircle className="text-6xl text-white" />
            </motion.div>

            {/* Success Message */}
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              ¡Pago exitoso!
            </h1>
            <p className="text-2xl text-gray-300 mb-8">
              Tu análisis de CV está siendo procesado
            </p>

            {/* Info Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-slate-800 border border-green-500/50 rounded-2xl p-6"
              >
                <FaEnvelope className="text-4xl text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Email enviado</h3>
                <p className="text-gray-300">
                  Recibirás tu reporte completo por email en los próximos minutos
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-slate-800 border border-blue-500/50 rounded-2xl p-6"
              >
                <FaClock className="text-4xl text-blue-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Tiempo estimado</h3>
                <p className="text-gray-300">
                  Tu análisis estará listo en aproximadamente 2 minutos
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-slate-800 border border-purple-500/50 rounded-2xl p-6"
              >
                <FaDownload className="text-4xl text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Formato PDF</h3>
                <p className="text-gray-300">
                  Reporte profesional descargable con todas las mejoras
                </p>
              </motion.div>
            </div>

            {/* What's included */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-2xl p-8 mb-8"
            >
              <h2 className="text-2xl font-bold text-white mb-6">
                Tu reporte incluye:
              </h2>
              <div className="grid md:grid-cols-2 gap-4 text-left">
                <div className="flex items-start gap-3">
                  <FaCheckCircle className="text-green-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-semibold">Score ATS detallado</h4>
                    <p className="text-gray-300 text-sm">Análisis de compatibilidad con sistemas de reclutamiento</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FaCheckCircle className="text-green-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-semibold">15+ mejoras específicas</h4>
                    <p className="text-gray-300 text-sm">Cambios concretos con ejemplos antes/después</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FaCheckCircle className="text-green-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-semibold">Problemas identificados</h4>
                    <p className="text-gray-300 text-sm">Análisis de issues que reducen tus oportunidades</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FaCheckCircle className="text-green-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-semibold">Recomendaciones personalizadas</h4>
                    <p className="text-gray-300 text-sm">Adaptadas a tu profesión y mercado</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-4"
            >
              <Link
                href="/dashboard"
                className="inline-block px-10 py-4 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold text-lg rounded-full transition-all transform hover:scale-105 shadow-xl"
              >
                Ver Dashboard
              </Link>
              
              <p className="text-gray-400">
                También puedes revisar tu inbox para el reporte completo
              </p>
            </motion.div>

            {/* Additional info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-12 p-6 bg-slate-800/50 border border-slate-700 rounded-xl"
            >
              <p className="text-gray-300 text-sm">
                <strong className="text-white">💡 Próximos pasos:</strong><br />
                1. Revisa el reporte completo<br />
                2. Implementa las mejoras sugeridas<br />
                3. Actualiza tu LinkedIn con el CV optimizado<br />
                4. Comienza a aplicar a posiciones con más confianza
              </p>
            </motion.div>

            {/* Session ID (for debugging) */}
            {sessionId && (
              <p className="mt-4 text-xs text-gray-500">
                Session ID: {sessionId}
              </p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
