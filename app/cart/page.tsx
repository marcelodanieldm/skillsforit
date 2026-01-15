'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'

export const dynamic = 'force-dynamic'

interface CartItem {
  id: string
  name: string
  description: string
  price: number
  type: 'cv_analysis' | 'ebook'
}

function CartContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [showEbookBump, setShowEbookBump] = useState(true)

  useEffect(() => {
    // Initialize cart with CV Analysis
    const cvData = {
      email: searchParams.get('email') || '',
      name: searchParams.get('name') || '',
      country: searchParams.get('country') || '',
      profession: searchParams.get('profession') || '',
      cvId: searchParams.get('cvId') || ''
    }

    if (cvData.cvId) {
      sessionStorage.setItem('cart_cv_data', JSON.stringify(cvData))
    }

    setItems([
      {
        id: 'cv_analysis',
        name: 'Auditoría de CV con IA',
        description: 'Análisis profesional con GPT-4, score ATS, y 15+ mejoras específicas',
        price: 7,
        type: 'cv_analysis'
      }
    ])
  }, [searchParams])

  const addEbook = () => {
    if (!items.find(item => item.type === 'ebook')) {
      setItems([
        ...items,
        {
          id: 'ebook',
          name: 'E-book: "CV Perfecto para IT"',
          description: '50+ plantillas, keywords ATS, y estrategias de networking',
          price: 5,
          type: 'ebook'
        }
      ])
      setShowEbookBump(false)
    }
  }

  const removeEbook = () => {
    setItems(items.filter(item => item.type !== 'ebook'))
    setShowEbookBump(true)
  }

  const getTotal = () => {
    return items.reduce((sum, item) => sum + item.price, 0)
  }

  const handleCheckout = async () => {
    setLoading(true)
    try {
      const cvData = JSON.parse(sessionStorage.getItem('cart_cv_data') || '{}')
      
      // Create Stripe checkout session
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...cvData,
          includeEbook: items.some(item => item.type === 'ebook'),
          totalAmount: getTotal()
        })
      })

      const data = await response.json()
      
      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Error al crear la sesión de pago')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al procesar el pago')
    } finally {
      setLoading(false)
    }
  }

  const hasEbook = items.some(item => item.type === 'ebook')
  const savings = hasEbook ? 3 : 0 // E-book normally $8, bundle for $5

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🛒 Tu Carrito
          </h1>
          <p className="text-gray-600">
            Revisa tu orden antes de proceder al pago seguro
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {item.description}
                    </p>
                    {item.type === 'cv_analysis' && (
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                          ✨ Análisis IA
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          📊 Score ATS
                        </span>
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          📄 PDF Profesional
                        </span>
                        <span className="px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded-full">
                          📧 Envío por Email
                        </span>
                      </div>
                    )}
                    {item.type === 'ebook' && (
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                          📚 50+ Plantillas
                        </span>
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                          🎯 Keywords ATS
                        </span>
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                          💼 Networking Tips
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="ml-4 text-right">
                    <p className="text-2xl font-bold text-purple-600">
                      ${item.price}
                    </p>
                    {item.type === 'ebook' && (
                      <button
                        onClick={removeEbook}
                        className="text-sm text-red-600 hover:text-red-700 mt-2"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Order Bump - E-book Offer */}
            {showEbookBump && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-r from-yellow-50 to-orange-50 border-4 border-dashed border-yellow-400 rounded-xl p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 bg-yellow-400 rounded-full p-3">
                    <span className="text-3xl">🎁</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        ⚡ Oferta Especial - ¡Solo Hoy!
                      </h3>
                      <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                        AHORRA $3
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3">
                      <strong>E-book: "CV Perfecto para IT"</strong>
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1 mb-4">
                      <li>✅ 50+ plantillas profesionales de CV para roles IT</li>
                      <li>✅ Lista completa de keywords ATS por especialización</li>
                      <li>✅ Estrategias de networking y LinkedIn optimization</li>
                      <li>✅ Ejemplos reales de CVs que consiguieron ofertas $100K+</li>
                      <li>✅ Acceso inmediato por email tras el pago</li>
                    </ul>
                    <div className="flex items-center gap-4">
                      <div className="text-left">
                        <p className="text-sm text-gray-500 line-through">
                          Precio normal: $8
                        </p>
                        <p className="text-2xl font-bold text-green-600">
                          Hoy solo: $5
                        </p>
                      </div>
                      <button
                        onClick={addEbook}
                        className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg"
                      >
                        ✨ Sí, Agregar al Carrito
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Trust Signals */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-bold text-gray-900 mb-4">
                🔒 Compra 100% Segura
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🔐</span>
                  <span className="text-sm text-gray-600">
                    Pago encriptado con Stripe
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⚡</span>
                  <span className="text-sm text-gray-600">
                    Entrega instantánea
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">✅</span>
                  <span className="text-sm text-gray-600">
                    Garantía de calidad
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📧</span>
                  <span className="text-sm text-gray-600">
                    Soporte por email
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Resumen de Orden
              </h3>

              <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.name}</span>
                    <span className="font-semibold">${item.price}</span>
                  </div>
                ))}
              </div>

              {savings > 0 && (
                <div className="flex justify-between text-sm text-green-600 mb-2">
                  <span>Descuento E-book</span>
                  <span className="font-semibold">-${savings}</span>
                </div>
              )}

              <div className="flex justify-between text-lg font-bold text-gray-900 mb-6">
                <span>Total</span>
                <span className="text-2xl text-purple-600">
                  ${getTotal()}
                </span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg mb-3"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Procesando...
                  </span>
                ) : (
                  <>🔒 Pagar con Stripe</>
                )}
              </button>

              <p className="text-xs text-center text-gray-500">
                Serás redirigido a Stripe para completar el pago de forma segura
              </p>

              {hasEbook && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800 font-semibold text-center">
                    🎉 ¡Ahorraste ${savings} con el bundle!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CartPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading cart...</p>
        </div>
      </div>
    }>
      <CartContent />
    </Suspense>
  )
}
