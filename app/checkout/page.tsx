'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { motion } from 'framer-motion'
import { FaCreditCard, FaLock, FaCheckCircle, FaArrowLeft } from 'react-icons/fa'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const analysisId = searchParams.get('id')
  const canceled = searchParams.get('canceled')

  useEffect(() => {
    if (!analysisId) {
      router.push('/upload')
    }
  }, [analysisId, router])

  const handleCheckout = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ analysisId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear sesión de pago')
      }

      // Redirect to Stripe Checkout
      const stripe = await stripePromise
      if (stripe) {
        const result = await stripe.redirectToCheckout({
          sessionId: data.sessionId,
        })

        if (result.error) {
          setError(result.error.message || 'Error al redirigir a pago')
        }
      }
    } catch (err: any) {
      console.error('Checkout error:', err)
      setError(err.message || 'Error al procesar el pago')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {canceled && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-yellow-300"
          >
            ⚠️ El pago fue cancelado. Puedes intentar nuevamente cuando estés listo.
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Último paso: Pago seguro
          </h1>
          <p className="text-xl text-gray-300">
            Completa tu pago y recibe tu análisis en minutos
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-800 rounded-2xl p-8 border-2 border-slate-700"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Resumen del pedido</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-700">
                <div>
                  <h3 className="text-white font-semibold">Análisis de CV con IA</h3>
                  <p className="text-gray-400 text-sm">Análisis completo + Reporte PDF</p>
                </div>
                <span className="text-white font-bold">$7.00</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-2 text-gray-300 text-sm">
                  <FaCheckCircle className="text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Score ATS detallado</span>
                </div>
                <div className="flex items-start gap-2 text-gray-300 text-sm">
                  <FaCheckCircle className="text-green-400 mt-0.5 flex-shrink-0" />
                  <span>15+ mejoras específicas</span>
                </div>
                <div className="flex items-start gap-2 text-gray-300 text-sm">
                  <FaCheckCircle className="text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Comparación antes/después</span>
                </div>
                <div className="flex items-start gap-2 text-gray-300 text-sm">
                  <FaCheckCircle className="text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Recomendaciones personalizadas</span>
                </div>
                <div className="flex items-start gap-2 text-gray-300 text-sm">
                  <FaCheckCircle className="text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Entrega por email inmediata</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-700">
              <div className="flex justify-between items-center text-2xl font-bold mb-2">
                <span className="text-white">Total</span>
                <span className="text-green-400">USD $7.00</span>
              </div>
              <p className="text-gray-400 text-sm">Pago único • Sin suscripciones</p>
            </div>
          </motion.div>

          {/* Payment Button */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-800 rounded-2xl p-8 border-2 border-slate-700"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Método de pago</h2>

            <div className="space-y-4 mb-8">
              <div className="p-4 bg-slate-700 rounded-lg flex items-center gap-3">
                <FaCreditCard className="text-3xl text-blue-400" />
                <div>
                  <p className="text-white font-semibold">Tarjeta de crédito/débito</p>
                  <p className="text-gray-400 text-sm">Procesado por Stripe</p>
                </div>
              </div>

              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center gap-2 text-green-400 font-semibold mb-2">
                  <FaLock />
                  <span>Pago 100% seguro</span>
                </div>
                <p className="text-gray-300 text-sm">
                  Utilizamos Stripe, la plataforma de pagos más segura del mundo. 
                  Tus datos están encriptados y protegidos.
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
                {error}
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full px-8 py-5 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold text-xl rounded-full transition-all transform hover:scale-105 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  Procesando...
                </>
              ) : (
                <>
                  <FaCreditCard />
                  Pagar USD $7.00
                </>
              )}
            </button>

            <button
              onClick={() => router.push('/upload')}
              className="w-full mt-4 px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-full transition-all flex items-center justify-center gap-2"
            >
              <FaArrowLeft />
              Volver
            </button>

            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                🔒 Garantía de 30 días • Reembolso completo
              </p>
            </div>
          </motion.div>
        </div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <div className="flex flex-wrap justify-center gap-8 text-gray-400">
            <div className="flex items-center gap-2">
              <FaLock className="text-green-400" />
              <span>SSL Encriptado</span>
            </div>
            <div className="flex items-center gap-2">
              <FaCheckCircle className="text-green-400" />
              <span>Stripe Verified</span>
            </div>
            <div className="flex items-center gap-2">
              <FaCheckCircle className="text-green-400" />
              <span>500+ pagos exitosos</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}
