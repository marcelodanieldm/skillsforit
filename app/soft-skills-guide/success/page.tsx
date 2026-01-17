'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  FaCheckCircle, FaDownload, FaRocket, FaStar, 
  FaEnvelope, FaCalendarAlt, FaBook, FaGraduationCap
} from 'react-icons/fa'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import confetti from 'canvas-confetti'

export const dynamic = 'force-dynamic'

/**
 * Sprint 24: Success/Confirmation Page
 * 
 * Página post-compra que:
 * - Confirma la compra exitosa
 * - Muestra los productos adquiridos
 * - Provee acceso inmediato a los recursos
 * - Indica próximos pasos
 * - Tracking de conversión final
 */

interface PurchasedProduct {
  id: string
  name: string
  downloadLink?: string
  accessLink?: string
  icon: React.ReactNode
}

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams?.get('session')
  
  const [loading, setLoading] = useState(true)
  const [orderData, setOrderData] = useState<any>(null)

  useEffect(() => {
    // Confetti celebration
    const duration = 3 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      })
    }, 250)

    // Fetch order data
    if (sessionId) {
      fetch(`/api/checkout/order-status?session=${sessionId}`)
        .then(res => res.json())
        .then(data => {
          setOrderData(data)
          setLoading(false)
        })
        .catch(error => {
          console.error('Failed to fetch order data:', error)
          setLoading(false)
        })
    } else {
      setLoading(false)
    }

    return () => clearInterval(interval)
  }, [sessionId])

  const getProducts = (): PurchasedProduct[] => {
    const products: PurchasedProduct[] = [
      {
        id: 'soft-skills-guide',
        name: 'Guía Completa de Soft Skills',
        downloadLink: '/downloads/soft-skills-guide.pdf',
        accessLink: '/dashboard?product=soft-skills-guide',
        icon: <FaBook className="text-4xl text-purple-600" />
      }
    ]

    if (orderData?.orderBumpAccepted) {
      products.push({
        id: 'cv-audit',
        name: 'Auditoría de CV con IA',
        accessLink: '/upload?audit=cv',
        icon: <FaRocket className="text-4xl text-orange-600" />
      })
    }

    if (orderData?.upsellAccepted) {
      products.push({
        id: 'mentorship',
        name: '1 Mes de Mentoría',
        accessLink: '/mentors',
        icon: <FaGraduationCap className="text-4xl text-blue-600" />
      })
    }

    return products
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando tu pedido...</p>
        </div>
      </div>
    )
  }

  const products = getProducts()
  const totalPaid = orderData?.amount || (products.length === 1 ? 10 : products.length === 2 ? 17 : 42)

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-slate-900 dark:to-slate-800 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-block p-6 bg-green-100 dark:bg-green-900/30 rounded-full mb-6">
            <FaCheckCircle className="text-6xl text-green-600" />
          </div>
          
          <h1 className="text-5xl font-black text-gray-900 dark:text-white mb-4">
            ¡Compra Exitosa! 🎉
          </h1>
          
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-6">
            Tu inversión en desarrollo profesional ha sido confirmada
          </p>

          <div className="inline-block px-6 py-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <span className="text-gray-600 dark:text-gray-400">Total pagado: </span>
            <span className="text-3xl font-black text-purple-600">${totalPaid} USD</span>
          </div>
        </motion.div>

        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            📦 Tus Productos
          </h2>

          <div className="space-y-4">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg"
              >
                <div className="flex-shrink-0">
                  {product.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {product.name}
                  </h3>
                  {product.downloadLink && (
                    <a
                      href={product.downloadLink}
                      className="text-purple-600 hover:text-purple-700 text-sm font-semibold flex items-center gap-2 mt-1"
                    >
                      <FaDownload />
                      Descargar ahora
                    </a>
                  )}
                  {product.accessLink && (
                    <Link
                      href={product.accessLink}
                      className="text-purple-600 hover:text-purple-700 text-sm font-semibold flex items-center gap-2 mt-1"
                    >
                      <FaRocket />
                      Acceder ahora
                    </Link>
                  )}
                </div>
                <FaCheckCircle className="text-2xl text-green-600" />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Email Confirmation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-600 rounded-xl p-6 mb-8"
        >
          <div className="flex items-start gap-4">
            <FaEnvelope className="text-3xl text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Revisa tu Email
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Te enviamos un email de confirmación a <strong>{orderData?.email || 'tu correo'}</strong> con:
              </p>
              <ul className="mt-3 space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-600" />
                  Links de descarga de todos tus productos
                </li>
                <li className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-600" />
                  Recibo de pago (para tus registros)
                </li>
                <li className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-600" />
                  Instrucciones de acceso
                </li>
              </ul>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                Si no lo ves, revisa tu carpeta de spam o promociones
              </p>
            </div>
          </div>
        </motion.div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            🚀 Próximos Pasos
          </h2>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                  Descarga y lee la Guía de Soft Skills
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Comienza con el módulo que más te interese. Recomendamos empezar por Negociación de Salario.
                </p>
              </div>
            </div>

            {orderData?.orderBumpAccepted && (
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                    Sube tu CV para auditoría
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    Mientras lees, nuestra IA auditará tu CV y te dirá exactamente qué mejorar.
                  </p>
                  <Link
                    href="/upload?audit=cv"
                    className="inline-flex items-center gap-2 mt-2 text-purple-600 hover:text-purple-700 font-semibold"
                  >
                    <FaRocket />
                    Subir CV ahora
                  </Link>
                </div>
              </div>
            )}

            {orderData?.upsellAccepted && (
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                  {orderData?.orderBumpAccepted ? '3' : '2'}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                    Agenda tu primera sesión de mentoría
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    Tienes 4 sesiones de 30 minutos. Nuestros mentores están listos para ayudarte.
                  </p>
                  <Link
                    href="/mentors"
                    className="inline-flex items-center gap-2 mt-2 text-purple-600 hover:text-purple-700 font-semibold"
                  >
                    <FaCalendarAlt />
                    Ver mentores disponibles
                  </Link>
                </div>
              </div>
            )}

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                {products.length + 1}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                  Únete a nuestra comunidad
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Conecta con 12,000+ desarrolladores que están transformando sus carreras.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Social Proof */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg p-8 text-white text-center"
        >
          <div className="flex items-center justify-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <FaStar key={i} className="text-3xl text-yellow-400" />
            ))}
          </div>
          <p className="text-2xl font-bold mb-2">
            4.9/5 de satisfacción
          </p>
          <p className="text-lg opacity-90">
            Basado en más de 12,000 desarrolladores que ya transformaron sus carreras
          </p>
        </motion.div>

        {/* Support */}
        <div className="text-center mt-12">
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            ¿Necesitas ayuda? Estamos aquí para ti
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-all"
          >
            Ir a Mi Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-green-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}