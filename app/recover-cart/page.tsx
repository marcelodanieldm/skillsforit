'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ShoppingCart, CheckCircle, XCircle, Loader2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

function RecoverCartContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'invalid'>('loading')
  const [message, setMessage] = useState('')
  const [cart, setCart] = useState<any>(null)

  useEffect(() => {
    if (!token) {
      setStatus('invalid')
      setMessage('Link inválido. No se proporcionó un token.')
      return
    }

    recoverCart(token)
  }, [token])

  const recoverCart = async (token: string) => {
    try {
      setStatus('loading')
      setMessage('Recuperando tu carrito...')

      const response = await fetch('/api/cart/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Error al recuperar el carrito')
      }

      setStatus('success')
      setMessage('¡Carrito recuperado! Redirigiendo al checkout...')
      setCart(data.cart)

      // Track click en el email
      await fetch('/api/cart/track-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })

      // Redirigir al checkout después de 2 segundos
      setTimeout(() => {
        // Pre-cargar carrito en localStorage
        if (data.cart && data.cart.cart_data) {
          localStorage.setItem('recovered_cart', JSON.stringify(data.cart))
        }

        // Aplicar cupón si existe
        if (data.coupon) {
          localStorage.setItem('recovery_coupon', data.coupon.code)
        }

        router.push('/checkout')
      }, 2000)

    } catch (error: any) {
      console.error('Error recovering cart:', error)
      setStatus('error')
      setMessage(error.message || 'Error al recuperar el carrito')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
      >
        {/* Loading State */}
        {status === 'loading' && (
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Recuperando tu carrito
            </h2>
            <p className="text-gray-600">
              {message}
            </p>
          </div>
        )}

        {/* Success State */}
        {status === 'success' && (
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 10 }}
            >
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Listo!
            </h2>
            <p className="text-gray-600 mb-4">
              {message}
            </p>
            {cart && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total:</span>
                  <span className="text-lg font-bold text-gray-900">
                    ${cart.total_amount?.toFixed(2)} USD
                  </span>
                </div>
              </div>
            )}
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              Redirigiendo...
            </div>
          </div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <div className="text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Error
            </h2>
            <p className="text-gray-600 mb-6">
              {message}
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Volver al inicio
            </button>
          </div>
        )}

        {/* Invalid Token State */}
        {status === 'invalid' && (
          <div className="text-center">
            <XCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Link inválido
            </h2>
            <p className="text-gray-600 mb-6">
              {message}
            </p>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/checkout')}
                className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
              >
                Ir al checkout
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Volver al inicio
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default function RecoverCartPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading cart...</p>
        </div>
      </div>
    }>
      <RecoverCartContent />
    </Suspense>
  )
}