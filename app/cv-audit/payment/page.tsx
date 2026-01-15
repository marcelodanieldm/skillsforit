'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export const dynamic = 'force-dynamic'
import { FaLock, FaUnlock, FaCreditCard, FaShieldAlt } from 'react-icons/fa'
import PaymentForm from '@/components/ebook/PaymentForm'

export default function CVAuditPaymentPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const analysisId = searchParams.get('analysisId')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [emailSubmitted, setEmailSubmitted] = useState(false)

  useEffect(() => {
    if (!analysisId) {
      setError('ID de análisis no encontrado')
      setLoading(false)
    } else {
      setLoading(false)
    }
  }, [analysisId])

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setEmailSubmitted(true)
  }

  const handlePaymentSuccess = (paymentIntent: any) => {
    // Redirect to success page with analysisId
    router.push(`/cv-audit/success?analysisId=${analysisId}&paymentId=${paymentIntent.id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  if (!emailSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8"
        >
          <div className="text-center mb-6">
            <FaUnlock className="text-4xl text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Desbloquear Análisis Completo
            </h1>
            <p className="text-gray-600">
              Ingresa tu email para continuar con el pago de $7
            </p>
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="tu@email.com"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300"
            >
              Continuar al Pago
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => window.history.back()}
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              ← Volver al análisis gratuito
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Desbloquear Auditoría Completa
          </h1>
          <p className="text-xl text-gray-600">
            Obtén consejos detallados y keywords específicas para mejorar tu CV
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* What You Get */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FaUnlock className="text-green-500" />
              Lo que Desbloquearás
            </h2>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <FaLock className="text-red-500 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Consejos Detallados</h3>
                  <p className="text-sm text-gray-600">
                    Soluciones específicas para cada problema detectado
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FaLock className="text-red-500 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Keywords Específicas</h3>
                  <p className="text-sm text-gray-600">
                    Lista completa de términos que necesitas incluir
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FaLock className="text-red-500 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Plan de Mejora</h3>
                  <p className="text-sm text-gray-600">
                    Pasos concretos para aumentar tu score en 30-50 puntos
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FaLock className="text-red-500 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Ejemplos Prácticos</h3>
                  <p className="text-sm text-gray-600">
                    Antes/Después de frases y secciones completas
                  </p>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">$7</div>
              <div className="text-gray-600 mb-4">Una sola vez • Acceso inmediato</div>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <FaShieldAlt className="text-green-500" />
                <span>Pago seguro con Stripe</span>
              </div>
            </div>
          </motion.div>

          {/* Payment Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FaCreditCard className="text-blue-500" />
              Información de Pago
            </h2>

            <PaymentForm
              amount={700} // $7.00 in cents
              productName="Auditoría Completa de CV con IA"
              productType="cv_audit_full"
              metadata={{
                email,
                analysisId,
                product: 'cv_audit_full'
              }}
              onSuccess={handlePaymentSuccess}
              buttonText="Pagar $7 y Desbloquear"
            />

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 mb-4">
                ✅ Sin suscripción • ✅ Resultados inmediatos • ✅ Soporte incluido
              </p>
              <button
                onClick={() => window.history.back()}
                className="text-blue-600 hover:text-blue-800 text-sm underline"
              >
                ← Volver al análisis gratuito
              </button>
            </div>
          </motion.div>
        </div>

        {/* Trust Signals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 bg-white rounded-xl shadow-lg p-6 text-center"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Miles de profesionales ya mejoraron su CV
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="text-2xl font-bold text-blue-600">94%</div>
              <div className="text-sm text-gray-600">Aumentaron su score ATS</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">67%</div>
              <div className="text-sm text-gray-600">Recibieron más entrevistas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">4.9/5</div>
              <div className="text-sm text-gray-600">Satisfacción de usuarios</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}