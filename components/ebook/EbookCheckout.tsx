'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FaEnvelope, FaCreditCard, FaCheck, FaArrowRight, FaFileAlt, FaRobot } from 'react-icons/fa'
import OrderBump from '@/components/ebook/OrderBump'
import PaymentForm from '@/components/ebook/PaymentForm'

type CheckoutStep = 'email' | 'order-bump' | 'payment'

export default function EbookCheckout() {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('email')
  const [email, setEmail] = useState('')
  const [includeCVAudit, setIncludeCVAudit] = useState(false)

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setCurrentStep('order-bump')
    }
  }

  const handleOrderBumpChoice = (include: boolean) => {
    setIncludeCVAudit(include)
    setCurrentStep('payment')
  }

  const totalPrice = 7 + (includeCVAudit ? 7 : 0)

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep === 'email' ? 'bg-orange-500 text-white' :
                ['order-bump', 'payment'].includes(currentStep) ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                <FaEnvelope className="text-sm" />
              </div>
              <div className={`w-16 h-1 ${
                ['order-bump', 'payment'].includes(currentStep) ? 'bg-green-500' : 'bg-gray-300'
              }`}></div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep === 'order-bump' ? 'bg-orange-500 text-white' :
                currentStep === 'payment' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                <FaFileAlt className="text-sm" />
              </div>
              <div className={`w-16 h-1 ${
                currentStep === 'payment' ? 'bg-green-500' : 'bg-gray-300'
              }`}></div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep === 'payment' ? 'bg-orange-500 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                <FaCreditCard className="text-sm" />
              </div>
            </div>
          </div>
          <div className="flex justify-center mt-4 text-sm text-gray-600">
            <span className={currentStep === 'email' ? 'font-semibold text-orange-600' : ''}>Email</span>
            <span className="mx-4">→</span>
            <span className={currentStep === 'order-bump' ? 'font-semibold text-orange-600' : ''}>Oferta Especial</span>
            <span className="mx-4">→</span>
            <span className={currentStep === 'payment' ? 'font-semibold text-orange-600' : ''}>Pago</span>
          </div>
        </div>

        {/* Step Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          {currentStep === 'email' && (
            <div>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Obtén tu Guía de Soft Skills
                </h1>
                <p className="text-gray-600">
                  Ingresa tu email para recibir acceso inmediato a la guía completa
                </p>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="tu@email.com"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Continuar
                  <FaArrowRight />
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-gray-500">
                ✅ Pago seguro • ✅ Acceso inmediato • ✅ Sin spam
              </div>
            </div>
          )}

          {currentStep === 'order-bump' && (
            <OrderBump
              onChoice={handleOrderBumpChoice}
              currentTotal={7}
            />
          )}

          {currentStep === 'payment' && (
            <PaymentForm
              amount={totalPrice * 100}
              productName={includeCVAudit ? "Guía de Soft Skills + Auditoría de CV con IA" : "Guía de Soft Skills"}
              productType="ebook"
              metadata={{ 
                email, 
                includeCVAudit,
                ebook: true,
                cvAudit: includeCVAudit
              }}
            />
          )}
        </motion.div>

        {/* Order Summary */}
        {(currentStep === 'order-bump' || currentStep === 'payment') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="font-semibold text-gray-900 mb-4">Resumen del pedido</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Guía de Soft Skills IT</span>
                <span className="font-medium">USD 7</span>
              </div>
              {includeCVAudit && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Auditoría CV con IA (+7 USD)</span>
                  <span className="font-medium text-green-600">USD 7</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-orange-600">USD {totalPrice}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}