'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Confetti from 'react-confetti'

function SuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  
  const [showConfetti, setShowConfetti] = useState(true)
  const [loading, setLoading] = useState(true)
  const [sessionData, setSessionData] = useState<any>(null)

  useEffect(() => {
    // Detener confetti después de 5 segundos
    const timer = setTimeout(() => setShowConfetti(false), 5000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (sessionId) {
      // Aquí podrías verificar el pago con tu backend
      // Por ahora solo simulamos la carga
      setTimeout(() => {
        setSessionData({ email: 'usuario@example.com' })
        setLoading(false)
      }, 1000)
    }
  }, [sessionId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-teal-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl">Verificando tu pago...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-teal-800 py-12 px-4">
      {showConfetti && (
        <Confetti
          width={typeof window !== 'undefined' ? window.innerWidth : 1000}
          height={typeof window !== 'undefined' ? window.innerHeight : 1000}
          recycle={false}
          numberOfPieces={500}
        />
      )}

      <div className="max-w-2xl mx-auto">
        {/* Success Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-4xl font-bold text-white mb-4">
            ¡Pago Exitoso!
          </h1>
          <p className="text-xl text-green-200 mb-8">
            Tu compra se ha procesado correctamente
          </p>

          {/* Detalles */}
          <div className="bg-white/5 rounded-xl p-6 mb-8 text-left">
            <h2 className="text-xl font-semibold text-white mb-4">
              📧 ¿Qué sigue?
            </h2>
            <ul className="space-y-3 text-white/90">
              <li className="flex items-start gap-3">
                <span className="text-green-400 text-xl">✓</span>
                <span>
                  Recibirás un email de confirmación con tu E-book en formato PDF
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 text-xl">✓</span>
                <span>
                  El link de descarga también aparecerá en tu dashboard
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 text-xl">✓</span>
                <span>
                  Si compraste extras (CV Audit o Mentoría), nos contactaremos en 24h
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 text-xl">✓</span>
                <span>
                  Podrás re-descargar el E-book en cualquier momento desde tu cuenta
                </span>
              </li>
            </ul>
          </div>

          {/* CTAs */}
          <div className="space-y-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl transition-all transform hover:scale-105"
            >
              📊 Ir a Mi Dashboard
            </button>

            <button
              onClick={() => router.push('/soft-skills/simulator')}
              className="w-full py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all border border-white/20"
            >
              🔄 Hacer Otro Simulacro
            </button>
          </div>

          {/* Support */}
          <div className="mt-8 pt-6 border-t border-white/20">
            <p className="text-white/70 text-sm">
              ¿Problemas con tu pedido?{' '}
              <a
                href="mailto:soporte@skillsforit.com"
                className="text-green-400 hover:text-green-300 underline"
              >
                Contáctanos
              </a>
            </p>
          </div>
        </div>

        {/* Upsell / Cross-sell */}
        <div className="mt-8 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 backdrop-blur-md rounded-xl p-6 border border-indigo-500/30">
          <div className="flex items-start gap-4">
            <div className="text-4xl">💎</div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-2">
                ¿Te gustó el simulador?
              </h3>
              <p className="text-white/80 mb-4">
                Únete a nuestro programa PRO y accede a:
              </p>
              <ul className="space-y-2 text-white/90 text-sm mb-4">
                <li>✓ 100+ preguntas de entrevista adicionales</li>
                <li>✓ Feedback AI ilimitado en tus respuestas</li>
                <li>✓ Mentoría grupal semanal en vivo</li>
                <li>✓ Plantillas de CV para FAANG</li>
              </ul>
              <button
                onClick={() => router.push('/pricing')}
                className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 font-bold rounded-lg transition-all transform hover:scale-105"
              >
                Ver Planes PRO →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-teal-800 flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
