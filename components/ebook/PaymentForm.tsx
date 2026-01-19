'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FaCreditCard, FaLock, FaCheck, FaSpinner } from 'react-icons/fa'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

interface PaymentFormProps {
  amount: number // in cents
  productName: string
  productType: string
  metadata?: Record<string, any>
  onSuccess?: (paymentIntent: any) => void
  buttonText?: string
}

function PaymentFormInner({ amount, productName, productType, metadata = {}, onSuccess, buttonText = "Pagar Ahora" }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setProcessing(true)
    setError(null)

    try {
      // Determine API endpoint based on product type
      let endpoint = '/api/ebook/create-payment-intent';
      if (productType === 'cv_audit_full') {
        endpoint = '/api/cv-audit/create-payment-intent';
      } else if (productType === 'mentoria') {
        endpoint = '/api/mentor/create-payment-intent';
      }

      // Create payment intent
      const requestBody: any = {
        amount,
        productType,
        metadata,
      }

      // For CV audit, include email from metadata
      if (productType === 'cv_audit_full' && metadata.email) {
        requestBody.email = metadata.email
        requestBody.analysisId = metadata.analysisId
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      const { clientSecret, error: serverError } = await response.json()

      if (serverError) {
        throw new Error(serverError)
      }

      // Confirm payment
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      })

      if (stripeError) {
        throw new Error(stripeError.message)
      }

      if (paymentIntent?.status === 'succeeded') {
        if (onSuccess) {
          onSuccess(paymentIntent)
        } else {
          // Fallback redirect
          if (productType === 'mentoria') {
            window.location.href = '/mentor/checkout/success';
          } else {
            window.location.href = `/cv-audit/report?paymentIntentId=${paymentIntent.id}`;
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error processing payment')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Información de Pago
        </h1>
        <p className="text-gray-600">
          Pago seguro procesado por Stripe
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card Element */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Información de la Tarjeta
          </label>
          <div className="border border-gray-300 rounded-lg p-4 focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-orange-500">
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

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Security Notice */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <FaLock className="text-green-500" />
            <div>
              <p className="font-medium text-gray-900">Pago 100% Seguro</p>
              <p className="text-sm text-gray-600">
                Tus datos están protegidos con encriptación SSL de 256 bits
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!stripe || processing}
          className={`w-full font-bold py-4 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
            !stripe || processing
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white transform hover:scale-105'
          }`}
        >
          {processing ? (
            <>
              <FaSpinner className="animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <FaCreditCard />
              {buttonText}
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-500">
        ✅ Sin cargos ocultos • ✅ Reembolso garantizado • ✅ Acceso inmediato
      </div>
    </div>
  )
}

export default function PaymentForm(props: PaymentFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <PaymentFormInner {...props} />
    </Elements>
  )
}