'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { FaCheckCircle, FaEnvelope, FaDownload, FaBook, FaChartLine, FaRocket } from 'react-icons/fa'
import Confetti from 'react-confetti'

export const dynamic = 'force-dynamic'

/**
 * Success Page - Post Lead Capture
 * 
 * Sprint 39: Página de éxito con confirmación y upsell
 * 
 * Shows:
 * - Confirmación de envío de reporte
 * - Upsell de Guía de Soft Skills (USD 10)
 * - Beneficios específicos según áreas de mejora detectadas
 */

function AudioFeedbackSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const email = searchParams.get('email')
  const level = searchParams.get('level') || 'Mid'
  const toneScore = parseInt(searchParams.get('toneScore') || '70')
  const fillerCount = parseInt(searchParams.get('fillerCount') || '5')
  
  const [showConfetti, setShowConfetti] = useState(true)
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight
    })
    
    const timer = setTimeout(() => setShowConfetti(false), 5000)
    return () => clearTimeout(timer)
  }, [])

  // Determinar qué problema detectar para el upsell
  const detectedIssue = fillerCount > 5 
    ? 'Negociación (demasiadas muletillas reducen tu autoridad)'
    : toneScore < 70
    ? 'Confianza en Tono (titubeos en respuestas clave)'
    : 'Storytelling (estructura STAR incompleta)'

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-slate-900 dark:to-slate-800 py-12 px-4">
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
        />
      )}

      <div className="max-w-4xl mx-auto">
        {/* Confirmación de envío */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-2xl text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
          >
            <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
          </motion.div>
          
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            ¡Reporte Enviado! 🎉
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
            Revisa tu bandeja de entrada en <strong>{email}</strong>
          </p>
          
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div className="bg-purple-50 dark:bg-purple-900/20 px-6 py-3 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400">Tu Nivel</div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{level}</div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 px-6 py-3 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400">Tono</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{toneScore}%</div>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 px-6 py-3 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400">Muletillas</div>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{fillerCount}</div>
            </div>
          </div>
        </motion.div>

        {/* El Gancho - Área de mejora detectada */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/10 dark:to-orange-900/10 rounded-2xl p-8 border-2 border-red-200 dark:border-red-800 mb-8"
        >
          <div className="flex items-start gap-4">
            <div className="text-4xl">⚠️</div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Tu reporte indica que fallas en:
              </h2>
              <p className="text-xl text-red-600 dark:text-red-400 font-bold mb-4">
                {detectedIssue}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Esto puede costarte hasta <strong>USD 15,000 anuales</strong> en negociaciones salariales 
                y oportunidades de promoción perdidas.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Upsell - Guía de Soft Skills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              ¿Quieres el guion exacto para ganar un 20% más?
            </h2>
            <div className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold">
              65% OFF
            </div>
          </div>

          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            Suma la <strong>Guía de Soft Skills</strong> y obtén las respuestas exactas que usan 
            ingenieros de Google, Amazon y Meta para:
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <FaCheckCircle className="text-purple-600 text-xl mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                  20+ Respuestas STAR Perfectas
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Copy-paste adaptable a tu experiencia
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <FaCheckCircle className="text-blue-600 text-xl mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                  Elimina Muletillas en 7 Días
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Técnica de "Pausa Activa" probada
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <FaCheckCircle className="text-green-600 text-xl mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                  Guion de Negociación Salarial
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  +20% de incremento promedio documentado
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <FaCheckCircle className="text-yellow-600 text-xl mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                  Plantillas Editables
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Word/Notion · 40 páginas · Casos reales
                </p>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-6 rounded-xl mb-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-500 dark:text-gray-400 line-through text-xl">
                  USD 29
                </div>
                <div className="text-5xl font-bold text-purple-600 dark:text-purple-400">
                  USD 10
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Pago único · Descarga inmediata · Acceso de por vida
                </div>
              </div>
              
              <FaBook className="text-6xl text-purple-600 dark:text-purple-400 opacity-20" />
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={() => {
              router.push(`/checkout/soft-skills-guide?email=${encodeURIComponent(email || '')}&source=audio-feedback&issue=${encodeURIComponent(detectedIssue)}`)
            }}
            className="w-full px-8 py-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-xl text-2xl transition-all flex items-center justify-center gap-3 group"
          >
            <FaRocket className="group-hover:translate-x-1 transition-transform" />
            Obtener la Guía Ahora
            <FaRocket className="group-hover:translate-x-1 transition-transform" />
          </button>

          <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-4">
            🔒 Pago seguro con Stripe · Garantía de 30 días
          </p>

          {/* Opcional - No gracias */}
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full mt-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm underline"
          >
            No gracias, continuar sin la guía
          </button>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center"
        >
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            ⭐⭐⭐⭐⭐ 4.9/5 basado en 127 reviews
          </p>
          <div className="flex items-center justify-center gap-8 flex-wrap">
            <div className="flex items-center gap-2">
              <FaChartLine className="text-green-600 text-2xl" />
              <div className="text-left">
                <div className="font-bold text-gray-900 dark:text-white">+20%</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Incremento promedio</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <FaDownload className="text-blue-600 text-2xl" />
              <div className="text-left">
                <div className="font-bold text-gray-900 dark:text-white">500+</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Descargas</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <FaCheckCircle className="text-purple-600 text-2xl" />
              <div className="text-left">
                <div className="font-bold text-gray-900 dark:text-white">94%</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Tasa de éxito</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default function AudioFeedbackSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <AudioFeedbackSuccessContent />
    </Suspense>
  )
}
