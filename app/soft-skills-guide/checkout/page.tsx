'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaCheckCircle, FaLock, FaCreditCard, FaShieldAlt,
  FaStar, FaRocket, FaGift, FaClock, FaChartLine
} from 'react-icons/fa'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

/**
 * Sprint 24: Checkout Flow con Order Bumps y Upsells
 * 
 * Estrategia de maximización de AOV:
 * 
 * Base Product: $10 (Guía de Soft Skills)
 * ├─ Step 1: Order Bump: +$7 (Auditoría CV con IA)
 * │  └─ Conversión esperada: 40%
 * │     └─ AOV con bump: $17 (70% incremento)
 * │
 * └─ Step 2: Upsell: +$25 (1 mes Mentoría - 4 sesiones)
 *    └─ Conversión esperada: 25%
 *       └─ AOV máximo: $42 (320% incremento)
 * 
 * Psicología aplicada:
 * - Order Bump antes de pago (baja fricción)
 * - Upsell después de commitment (ya ingresó tarjeta)
 * - Descuento por bundle (30% off)
 * - Escasez (oferta limitada)
 * - Social proof en cada paso
 */

interface CartItem {
  id: string
  name: string
  price: number
  originalPrice?: number
  description: string
  included: string[]
}

interface CheckoutState {
  step: 1 | 2 | 3
  orderBumpSelected: boolean
  upsellSelected: boolean
  cart: CartItem[]
  email: string
  sessionId: string
  orderBumpStartTime: number
  processing: boolean
  error: string | null
}

function CheckoutForm() {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  
  const [state, setState] = useState<CheckoutState>({
    step: 1,
    orderBumpSelected: false,
    upsellSelected: false,
    cart: [
      {
        id: 'soft-skills-guide',
        name: 'Guía Completa de Soft Skills',
        price: 10,
        originalPrice: 20,
        description: '3 módulos intensivos con 35 ejercicios prácticos',
        included: [
          '200+ páginas de contenido',
          '7.5 horas de material',
          'Scripts de negociación word-by-word',
          'Framework STAR++ para entrevistas',
          'Actualizaciones gratuitas de por vida'
        ]
      }
    ],
    email: '',
    sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    orderBumpStartTime: 0,
    processing: false,
    error: null
  })

  // Track when user sees order bump
  useEffect(() => {
    if (state.step === 1 && state.orderBumpStartTime === 0) {
      setState(prev => ({ ...prev, orderBumpStartTime: Date.now() }))
    }
  }, [state.step])

  const orderBumpProduct: CartItem = {
    id: 'cv-audit-ai',
    name: 'Auditoría de CV con IA',
    price: 7,
    originalPrice: 15,
    description: 'Análisis profesional de tu CV en minutos',
    included: [
      'Análisis ATS completo',
      'Detección de 50+ errores comunes',
      'Recomendaciones priorizadas',
      'Comparación con CVs exitosos',
      'Informe PDF descargable'
    ]
  }

  const upsellProduct: CartItem = {
    id: 'mentorship-month',
    name: '1 Mes de Mentoría Profesional',
    price: 25,
    originalPrice: 35,
    description: '4 sesiones 1-on-1 con mentores senior',
    included: [
      '4 sesiones de 30 minutos',
      'Revisión personalizada de CV',
      'Mock interviews con feedback',
      'Estrategia de búsqueda de empleo',
      'Acceso a comunidad privada',
      'Soporte por Slack'
    ]
  }

  const calculateTotal = () => {
    return state.cart.reduce((sum, item) => sum + item.price, 0)
  }

  const calculateSavings = () => {
    return state.cart.reduce((sum, item) => {
      if (item.originalPrice) {
        return sum + (item.originalPrice - item.price)
      }
      return sum
    }, 0)
  }

  const handleOrderBumpToggle = async (selected: boolean) => {
    setState(prev => {
      const newCart = selected
        ? [...prev.cart, orderBumpProduct]
        : prev.cart.filter(item => item.id !== 'cv-audit-ai')
      
      return {
        ...prev,
        orderBumpSelected: selected,
        cart: newCart
      }
    })

    // Track order bump decision
    const timeSpent = Date.now() - state.orderBumpStartTime
    try {
      await fetch('/api/checkout/track-order-bump', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: state.sessionId,
          email: state.email,
          accepted: selected,
          timeSpent,
          variant: 'default'
        })
      })
    } catch (error) {
      console.error('Failed to track order bump:', error)
    }
  }

  const handleContinueToPayment = () => {
    if (!state.email || !state.email.includes('@')) {
      setState(prev => ({ ...prev, error: 'Por favor ingresa un email válido' }))
      return
    }
    setState(prev => ({ ...prev, step: 2, error: null }))
  }

  const handleCompletePayment = async () => {
    if (!stripe || !elements) {
      return
    }

    setState(prev => ({ ...prev, processing: true, error: null }))

    try {
      // Create payment intent
      const response = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: state.email,
          products: state.cart.map(item => ({ id: item.id, name: item.name, price: item.price })),
          sessionId: state.sessionId,
          orderBumpAccepted: state.orderBumpSelected,
          upsellAccepted: false
        })
      })

      const { clientSecret, orderId } = await response.json()

      // Confirm payment
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) {
        throw new Error('Card element not found')
      }

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            email: state.email
          }
        }
      })

      if (stripeError) {
        throw new Error(stripeError.message)
      }

      // Payment successful - show upsell
      setState(prev => ({ ...prev, processing: false, step: 3 }))
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        processing: false, 
        error: error.message || 'Error al procesar el pago' 
      }))
    }
  }

  const handleShowUpsell = () => {
    handleCompletePayment()
  }

  const handleUpsellAccept = async () => {
    setState(prev => ({
      ...prev,
      upsellSelected: true,
      cart: [...prev.cart, upsellProduct],
      processing: true
    }))

    // Track upsell acceptance
    try {
      await fetch('/api/checkout/track-upsell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: state.sessionId,
          email: state.email,
          accepted: true,
          hadOrderBump: state.orderBumpSelected,
          variant: 'default'
        })
      })

      // Process additional payment for upsell
      // Then redirect to success page
      router.push(`/soft-skills-guide/success?session=${state.sessionId}`)
    } catch (error) {
      console.error('Failed to process upsell:', error)
      setState(prev => ({ ...prev, processing: false }))
    }
  }

  const handleUpsellDecline = async () => {
    // Track upsell decline
    try {
      await fetch('/api/checkout/track-upsell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: state.sessionId,
          email: state.email,
          accepted: false,
          hadOrderBump: state.orderBumpSelected,
          variant: 'default'
        })
      })

      // Redirect to success page without upsell
      router.push(`/soft-skills-guide/success?session=${state.sessionId}`)
    } catch (error) {
      console.error('Failed to track upsell decline:', error)
      router.push(`/soft-skills-guide/success?session=${state.sessionId}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Progress Indicator */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-4">
            {[
              { num: 1, label: 'Información' },
              { num: 2, label: 'Pago' },
              { num: 3, label: 'Confirmación' }
            ].map((step, index) => (
              <div key={step.num} className="flex items-center">
                <div className={`flex items-center gap-2 ${
                  state.step >= step.num ? 'text-purple-600' : 'text-gray-400'
                }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    state.step >= step.num 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600'
                  }`}>
                    {state.step > step.num ? <FaCheckCircle /> : step.num}
                  </div>
                  <span className="hidden md:block font-semibold">{step.label}</span>
                </div>
                {index < 2 && (
                  <div className={`w-16 h-1 mx-4 ${
                    state.step > step.num ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Step 1 & 2 */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence mode="wait">
              {state.step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  {/* Email Section */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                      📧 Información de Contacto
                    </h2>
                    <input
                      type="email"
                      placeholder="tu@email.com"
                      value={state.email}
                      onChange={(e) => setState(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:border-purple-600 outline-none"
                    />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Te enviaremos la guía inmediatamente después del pago
                    </p>
                  </div>

                  {/* Order Bump - Before Payment */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl border-2 border-orange-300 dark:border-orange-600 p-8 relative overflow-hidden"
                  >
                    {/* Badge */}
                    <div className="absolute top-4 right-4 px-4 py-2 bg-red-500 text-white font-bold text-sm rounded-full shadow-lg">
                      OFERTA ESPECIAL
                    </div>

                    <div className="flex items-start gap-6">
                      <div className="flex-shrink-0">
                        <input
                          type="checkbox"
                          id="order-bump"
                          checked={state.orderBumpSelected}
                          onChange={(e) => handleOrderBumpToggle(e.target.checked)}
                          className="w-8 h-8 text-purple-600 rounded border-2 border-gray-300 focus:ring-2 focus:ring-purple-500 cursor-pointer"
                        />
                      </div>

                      <div className="flex-1">
                        <label htmlFor="order-bump" className="cursor-pointer">
                          <div className="flex items-center gap-3 mb-3">
                            <FaRocket className="text-3xl text-orange-600" />
                            <div>
                              <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                                ⚡ ¿Quieres que la IA audite tu CV AHORA?
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-gray-500 line-through">$15</span>
                                <span className="text-2xl font-black text-orange-600">+$7</span>
                                <span className="text-sm text-gray-600 dark:text-gray-400">(53% OFF)</span>
                              </div>
                            </div>
                          </div>

                          <p className="text-gray-700 dark:text-gray-300 mb-4">
                            <strong>Ahorra tiempo:</strong> Mientras lees la guía, nuestra IA ya habrá auditado tu CV 
                            y te dirá exactamente qué cambiar para conseguir más entrevistas.
                          </p>

                          <div className="grid md:grid-cols-2 gap-3">
                            {orderBumpProduct.included.map((feature, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <FaCheckCircle className="text-green-600 flex-shrink-0" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                              </div>
                            ))}
                          </div>

                          <div className="mt-4 p-4 bg-white dark:bg-slate-800 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">🔥 Usuarios que lo añadieron:</div>
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">4,200+ este mes</div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-gray-600 dark:text-gray-400">Satisfacción:</div>
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <FaStar key={i} className="text-yellow-400" />
                                  ))}
                                  <span className="ml-2 font-bold text-gray-900 dark:text-white">4.9/5</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>
                  </motion.div>

                  {/* Continue Button */}
                  <button
                    onClick={handleContinueToPayment}
                    className="w-full px-8 py-5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xl font-bold rounded-xl shadow-lg hover:shadow-2xl transition-all flex items-center justify-center gap-3"
                  >
                    <FaCreditCard />
                    Continuar al Pago
                  </button>

                  <div className="flex items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <FaShieldAlt className="text-green-600" />
                      <span>Pago seguro con Stripe</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaLock className="text-green-600" />
                      <span>Cifrado SSL</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {state.step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  {/* Payment Form */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                      💳 Información de Pago
                    </h2>

                    {state.error && (
                      <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-600 rounded-lg text-red-700 dark:text-red-300">
                        {state.error}
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg">
                        <CardElement
                          options={{
                            style: {
                              base: {
                                fontSize: '16px',
                                color: '#424770',
                                '::placeholder': {
                                  color: '#aab7c4',
                                },
                              },
                              invalid: {
                                color: '#9e2146',
                              },
                            },
                          }}
                        />
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                      <FaLock className="inline mr-1" />
                      Tu pago está protegido con cifrado SSL de 256 bits
                    </p>
                  </div>

                  {/* Complete Payment Button */}
                  <button
                    onClick={handleShowUpsell}
                    disabled={state.processing || !stripe}
                    className={`w-full px-8 py-5 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xl font-bold rounded-xl shadow-lg hover:shadow-2xl transition-all flex items-center justify-center gap-3 ${
                      state.processing || !stripe ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <FaLock />
                    {state.processing ? 'Procesando...' : `Completar Pago - $${calculateTotal()} USD`}
                  </button>

                  <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                    Al hacer clic, aceptas nuestros términos y condiciones
                  </p>
                </motion.div>
              )}

              {state.step === 3 && (
                <UpsellModal
                  upsellProduct={upsellProduct}
                  onAccept={handleUpsellAccept}
                  onDecline={handleUpsellDecline}
                  processing={state.processing}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 sticky top-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                📦 Resumen del Pedido
              </h3>

              <div className="space-y-4 mb-6">
                {state.cart.map((item) => (
                  <div key={item.id} className="pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">{item.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.description}</p>
                      </div>
                      <div className="text-right ml-4">
                        {item.originalPrice && (
                          <div className="text-sm text-gray-500 line-through">${item.originalPrice}</div>
                        )}
                        <div className="text-lg font-bold text-purple-600">${item.price}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-gray-700 dark:text-gray-300">
                  <span>Subtotal:</span>
                  <span className="font-semibold">${calculateTotal() + calculateSavings()}</span>
                </div>
                {calculateSavings() > 0 && (
                  <div className="flex items-center justify-between text-green-600">
                    <span className="font-semibold">Ahorros:</span>
                    <span className="font-bold">-${calculateSavings()}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mb-6">
                <span className="text-xl font-bold text-gray-900 dark:text-white">Total:</span>
                <span className="text-3xl font-black text-purple-600">${calculateTotal()}</span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-green-600">
                  <FaCheckCircle />
                  <span>Acceso inmediato</span>
                </div>
                {/* Garantía eliminada */}
                <div className="flex items-center gap-2 text-green-600">
                  <FaCheckCircle />
                  <span>Actualizaciones gratis</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Upsell Modal Component with Countdown Timer
interface UpsellModalProps {
  upsellProduct: CartItem
  onAccept: () => void
  onDecline: () => void
  processing: boolean
}

function UpsellModal({ upsellProduct, onAccept, onDecline, processing }: UpsellModalProps) {
  const [timeLeft, setTimeLeft] = useState(10 * 60) // 10 minutes in seconds
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  return (
    <motion.div
      key="step3"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6"
    >
      <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-2xl p-10 text-white text-center">
        <div className="text-6xl mb-6">🎉</div>
        <h2 className="text-4xl font-black mb-4">
          ¡ESPERA! Oferta Exclusiva Solo Para Ti
        </h2>
        <p className="text-xl opacity-90 mb-8">
          Ya invertiste en tu desarrollo. ¿Por qué no asegurar tu éxito con mentoría personalizada?
        </p>

        <div className="bg-white rounded-xl p-8 text-gray-900 mb-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <FaGift className="text-4xl text-purple-600" />
            <div>
              <h3 className="text-3xl font-black">{upsellProduct.name}</h3>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="text-gray-500 line-through text-xl">$35</span>
                <span className="text-4xl font-black text-purple-600">+$25</span>
                <span className="text-sm text-gray-600">(Ahorras 30%)</span>
              </div>
            </div>
          </div>

          <p className="text-lg text-gray-700 mb-6">
            {upsellProduct.description}
          </p>

          <div className="grid md:grid-cols-2 gap-3 mb-6">
            {upsellProduct.included.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-left">
                <FaCheckCircle className="text-green-600 flex-shrink-0" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>

          {/* Countdown Timer */}
          <div className="bg-purple-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">✨ Solo quedan:</div>
                <div className="text-2xl font-bold">3 spots disponibles este mes</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">⏰ Oferta expira en:</div>
                <div className={`text-3xl font-black ${timeLeft <= 60 ? 'text-red-600 animate-pulse' : 'text-orange-600'}`}>
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onAccept}
              disabled={processing}
              className={`w-full px-8 py-5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xl font-bold rounded-xl shadow-lg hover:shadow-2xl transition-all flex items-center justify-center gap-3 ${
                processing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <FaRocket />
              {processing ? 'Procesando...' : 'SÍ, Añadir Mentoría por +$25'}
            </motion.button>

            <button
              onClick={onDecline}
              disabled={processing}
              className="w-full px-8 py-3 text-gray-600 hover:text-gray-800 font-semibold transition-all disabled:opacity-50"
            >
              No gracias, solo quiero la guía
            </button>
          </div>
        </div>

        <p className="text-sm opacity-75">
          💡 <strong>Dato:</strong> El 87% de nuestros usuarios con mentoría consiguen empleo en 45 días o menos
        </p>
      </div>
    </motion.div>
  )
}

// Main component wrapper with Stripe Elements
export default function CheckoutPage() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  )
}
