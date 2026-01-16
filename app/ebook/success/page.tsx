'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { FaCheck, FaClock, FaUser, FaRocket, FaDownload, FaTimes } from 'react-icons/fa'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

function EbookSuccessContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const cvAudit = searchParams.get('cv_audit') === 'true'
  const paymentIntent = searchParams.get('payment_intent')

  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes in seconds
  const [showUpsell, setShowUpsell] = useState(true)
  const [acceptedUpsell, setAcceptedUpsell] = useState(false)

  useEffect(() => {
    if (timeLeft > 0 && showUpsell) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0) {
      setShowUpsell(false)
    }
  }, [timeLeft, showUpsell])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleUpsellAccept = async () => {
    setAcceptedUpsell(true)
    // Create additional payment for mentorship
    try {
      const response = await fetch('/api/ebook/upsell-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          basePaymentIntentId: paymentIntent,
          mentorshipPrice: 25
        }),
      })

      const { clientSecret, error: serverError } = await response.json()

      if (serverError) {
        throw new Error(serverError)
      }

      // Here we would redirect to a payment page for the additional $25
      // For now, we'll simulate success
      setTimeout(() => {
        setShowUpsell(false)
      }, 2000)

    } catch (error: any) {
      console.error('Error processing mentorship upsell:', error)
      // For demo purposes, still accept the upsell
      setShowUpsell(false)
    }
  }

  const handleUpsellDecline = () => {
    setShowUpsell(false)
  }

  if (showUpsell) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <FaCheck className="text-green-500 text-3xl" />
            </motion.div>
            <h1 className="text-3xl font-bold mb-2">¡Compra Exitosa!</h1>
            <p className="text-green-100">Tu guía de Soft Skills ya está lista para descargar</p>
          </div>

          {/* Timer */}
          <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mx-8 mt-6">
            <div className="flex items-center gap-3">
              <FaClock className="text-orange-500 text-xl" />
              <div>
                <p className="font-semibold text-orange-800">Oferta Especial por Tiempo Limitado</p>
                <p className="text-orange-700 text-sm">Esta oferta expira en: <span className="font-bold text-lg">{formatTime(timeLeft)}</span></p>
              </div>
            </div>
          </div>

          {/* Upsell Content */}
          <div className="p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                ¡Felicidades por tu Guía!
              </h2>
              <p className="text-gray-600 mb-6">
                Muchos de nuestros lectores logran mejores resultados con una sesión personalizada.
                Por ser cliente nuevo, añade <span className="font-bold text-orange-600">1 mes de Mentorías (4 sesiones de 10 min)</span> por solo <span className="font-bold text-2xl text-green-600">25 USD adicionales</span>.
              </p>
            </div>

            {/* Benefits */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-blue-50 p-6 rounded-xl">
                <FaUser className="text-blue-500 text-2xl mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Mentoría Personalizada</h3>
                <p className="text-sm text-gray-600">4 sesiones de 10 minutos con mentores expertos en IT</p>
              </div>
              <div className="bg-green-50 p-6 rounded-xl">
                <FaRocket className="text-green-500 text-2xl mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Aceleración de Carrera</h3>
                <p className="text-sm text-gray-600">Feedback directo para mejorar tu perfil profesional</p>
              </div>
            </div>

            {/* Price Comparison */}
            <div className="bg-gray-50 p-6 rounded-xl mb-8">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">Precio normal de mentoría:</span>
                <span className="text-gray-500 line-through">$97/mes</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">Tu precio especial (una vez):</span>
                <span className="font-bold text-2xl text-green-600">$25</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={handleUpsellAccept}
                className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105"
              >
                <FaRocket />
                Sí, añadir mentoría por $25
              </button>

              <button
                onClick={handleUpsellDecline}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                <FaTimes />
                No, gracias - continuar con la descarga
              </button>
            </div>

            <p className="text-center text-sm text-gray-500 mt-4">
              ✅ Pago seguro • ✅ Acceso inmediato • ✅ Sin compromisos
            </p>
          </div>
        </motion.div>
      </div>
    )
  }

  // Success page after upsell decision
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <FaCheck className="text-green-500 text-3xl" />
            </motion.div>
            <h1 className="text-3xl font-bold mb-2">¡Compra Completada!</h1>
            <p className="text-green-100">
              {acceptedUpsell
                ? "Tu guía y mentoría están listas. Revisa tu email para los detalles."
                : "Tu guía está lista. Revisa tu email para acceder al contenido."
              }
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-4">Resumen de tu compra</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Guía Completa de Soft Skills IT</span>
                    <span className="font-medium">USD 7</span>
                  </div>
                  {cvAudit && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Auditoría CV con IA</span>
                      <span className="font-medium">USD 7</span>
                    </div>
                  )}
                  {acceptedUpsell && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mentoría 1 Mes (4 sesiones)</span>
                      <span className="font-medium text-green-600">USD 25</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total pagado</span>
                      <span className="text-green-600">
                        USD {7 + (cvAudit ? 7 : 0) + (acceptedUpsell ? 25 : 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-blue-50 p-6 rounded-xl">
                <h3 className="font-semibold text-blue-900 mb-4">Próximos pasos</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">1</span>
                    </div>
                    <div>
                      <p className="font-medium text-blue-900">Revisa tu email</p>
                      <p className="text-sm text-blue-700">Hemos enviado los links de descarga a {email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">2</span>
                    </div>
                    <div>
                      <p className="font-medium text-blue-900">Accede a tu dashboard</p>
                      <p className="text-sm text-blue-700">Lee online o descarga el contenido completo</p>
                    </div>
                  </div>
                  {acceptedUpsell && (
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">3</span>
                      </div>
                      <div>
                        <p className="font-medium text-blue-900">Agenda tu primera sesión</p>
                        <p className="text-sm text-blue-700">Recibirás instrucciones para coordinar con tu mentor</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <Link
                  href="/dashboard"
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105 block text-center"
                >
                  <FaDownload />
                  Ir a mi Dashboard
                </Link>

                <p className="text-center text-sm text-gray-500">
                  ¿Necesitas ayuda? <a href="mailto:support@skillsforit.com" className="text-blue-600 hover:underline">Contáctanos</a>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default function EbookSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-green-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <EbookSuccessContent />
    </Suspense>
  )
}