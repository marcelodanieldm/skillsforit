'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export const dynamic = 'force-dynamic'

function SoftSkillsGuideCheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const email = searchParams.get('email') || ''
  const source = searchParams.get('source') || 'audio-feedback'
  const issue = searchParams.get('issue') || 'Soft Skills'

  // Order bump states
  const [includeCVAudit, setIncludeCVAudit] = useState(false)
  const [includeMentoring, setIncludeMentoring] = useState(false)

  const calculateTotal = () => {
    let total = 10 // E-book base price
    if (includeCVAudit) total += 7
    if (includeMentoring) total += 15
    return total
  }

  const handleCheckout = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source,
          issue,
          items: [
            { productId: 'soft-skills-guide', quantity: 1 },
            ...(includeCVAudit ? [{ productId: 'cv-audit', quantity: 1 }] : []),
            ...(includeMentoring ? [{ productId: 'mentoring-session', quantity: 1 }] : [])
          ]
        })
      })

      const { url, error: apiError } = await response.json()

      if (apiError) {
        setError(apiError)
        setLoading(false)
        return
      }

      if (!url) {
        setError('No se pudo obtener la URL de checkout')
        setLoading(false)
        return
      }

      // Redirect to Stripe Checkout
      window.location.href = url
    } catch (err) {
      console.error('Checkout error:', err)
      setError('Error al procesar el pago')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            📚 Guía Completa de Soft Skills
          </h1>
          <p className="text-purple-200 text-lg">
            Todo lo que necesitas para dominar {issue}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Producto Principal */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  E-book: Guía de Soft Skills
                </h2>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-3xl font-bold text-yellow-400">USD 10</span>
                  <span className="text-gray-400 line-through text-xl">USD 29</span>
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    -65%
                  </span>
                </div>
              </div>
              <div className="text-5xl">📚</div>
            </div>

            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2 text-white">
                <span className="text-green-400 mt-1">✓</span>
                <span>120 páginas de estrategias prácticas</span>
              </li>
              <li className="flex items-start gap-2 text-white">
                <span className="text-green-400 mt-1">✓</span>
                <span>50+ ejemplos reales de entrevistas</span>
              </li>
              <li className="flex items-start gap-2 text-white">
                <span className="text-green-400 mt-1">✓</span>
                <span>Método STAR paso a paso</span>
              </li>
              <li className="flex items-start gap-2 text-white">
                <span className="text-green-400 mt-1">✓</span>
                <span>Plantillas listas para usar</span>
              </li>
              <li className="flex items-start gap-2 text-white">
                <span className="text-green-400 mt-1">✓</span>
                <span>Checklist de preparación</span>
              </li>
            </ul>

            {/* Social Proof */}
            <div className="bg-indigo-500/20 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between text-white text-sm">
                <div>
                  <div className="font-semibold">⭐ 4.9/5</div>
                  <div className="text-purple-200">500+ descargas</div>
                </div>
                <div>
                  <div className="font-semibold">94%</div>
                  <div className="text-purple-200">Tasa de éxito</div>
                </div>
                <div>
                  <div className="font-semibold">+20%</div>
                  <div className="text-purple-200">Aumento salarial</div>
                </div>
              </div>
            </div>

            {/* Order Bumps */}
            <div className="space-y-3 mb-6">
              <label className="flex items-start gap-3 bg-white/5 p-4 rounded-lg border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                <input
                  type="checkbox"
                  checked={includeCVAudit}
                  onChange={(e) => setIncludeCVAudit(e.target.checked)}
                  className="mt-1 w-5 h-5"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-white">✅ Auditoría de CV</span>
                    <span className="text-yellow-400 font-bold">+USD 7</span>
                  </div>
                  <p className="text-sm text-purple-200">
                    Revisión profesional de tu CV + sugerencias específicas
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 bg-white/5 p-4 rounded-lg border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                <input
                  type="checkbox"
                  checked={includeMentoring}
                  onChange={(e) => setIncludeMentoring(e.target.checked)}
                  className="mt-1 w-5 h-5"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-white">🎯 Sesión de Mentoría 1:1</span>
                    <span className="text-yellow-400 font-bold">+USD 15</span>
                  </div>
                  <p className="text-sm text-purple-200">
                    30 min con experto + simulacro de entrevista
                  </p>
                </div>
              </label>
            </div>

            {/* Total */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between text-white">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-3xl font-bold">USD {calculateTotal()}</span>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={handleCheckout}
              disabled={loading || !email}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                loading || !email
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 transform hover:scale-105'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Procesando...
                </span>
              ) : (
                '🔒 Pagar Ahora con Stripe'
              )}
            </button>

            {error && (
              <div className="mt-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-white text-sm">
                ⚠️ {error}
              </div>
            )}

            {!email && (
              <div className="mt-4 p-4 bg-yellow-500/20 border border-yellow-500 rounded-lg text-white text-sm">
                ⚠️ Falta el email en la URL. Asegúrate de acceder desde el simulador.
              </div>
            )}

            <p className="text-center text-purple-200 text-sm mt-4">
              🔒 Pago 100% seguro procesado por Stripe
            </p>
          </div>

          {/* Testimonios */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white mb-4">
              ⭐ Lo que dicen nuestros usuarios
            </h3>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-2xl">
                  👨‍💼
                </div>
                <div>
                  <div className="font-semibold text-white">Carlos M.</div>
                  <div className="text-sm text-purple-200">Senior Developer</div>
                </div>
              </div>
              <p className="text-white/90 text-sm leading-relaxed">
                "La guía me ayudó a estructurar mis respuestas con el método STAR. 
                Conseguí 3 ofertas en 2 semanas. <strong>Aumenté mi salario 25%</strong>."
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-red-500 rounded-full flex items-center justify-center text-2xl">
                  👩‍💻
                </div>
                <div>
                  <div className="font-semibold text-white">Ana L.</div>
                  <div className="text-sm text-purple-200">Tech Lead</div>
                </div>
              </div>
              <p className="text-white/90 text-sm leading-relaxed">
                "Los ejemplos reales son oro puro. Pasé de nervios a confianza total. 
                <strong>10/10, totalmente vale la inversión</strong>."
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center text-2xl">
                  👨‍🎓
                </div>
                <div>
                  <div className="font-semibold text-white">Miguel R.</div>
                  <div className="text-sm text-purple-200">Junior Frontend</div>
                </div>
              </div>
              <p className="text-white/90 text-sm leading-relaxed">
                "Como junior me sentía perdido en entrevistas. Esta guía me dio un 
                framework claro. <strong>Conseguí mi primer trabajo en FAANG</strong> 🚀"
              </p>
            </div>

            {/* Garantía */}
            <div className="bg-gradient-to-r from-green-500/20 to-teal-500/20 backdrop-blur-md rounded-xl p-6 border border-green-500/50">
              <div className="flex items-start gap-3">
                <div className="text-4xl">✅</div>
                <div>
                  <h4 className="font-bold text-white text-lg mb-2">
                    Garantía de 30 días
                  </h4>
                  <p className="text-white/90 text-sm">
                    Si no estás 100% satisfecho, te devolvemos tu dinero. 
                    Sin preguntas, sin complicaciones.
                  </p>
                </div>
              </div>
            </div>

            {/* Urgencia */}
            <div className="bg-red-500/20 backdrop-blur-md rounded-xl p-6 border border-red-500/50">
              <div className="flex items-start gap-3">
                <div className="text-4xl">⏰</div>
                <div>
                  <h4 className="font-bold text-white text-lg mb-2">
                    Oferta limitada - 65% OFF
                  </h4>
                  <p className="text-white/90 text-sm">
                    Esta oferta especial solo está disponible para usuarios del 
                    simulador. El precio normal es USD 29.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SoftSkillsGuideCheckout() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading checkout...</p>
        </div>
      </div>
    }>
      <SoftSkillsGuideCheckoutContent />
    </Suspense>
  )
}
