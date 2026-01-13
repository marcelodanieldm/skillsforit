'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { FaGoogle, FaEnvelope, FaKey, FaArrowLeft } from 'react-icons/fa'
import Link from 'next/link'

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Credenciales inválidas')
        setLoading(false)
        return
      }

      router.push(callbackUrl)
    } catch (error) {
      setError('Error al iniciar sesión')
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    signIn('google', { callbackUrl })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">SkillsForIt</h1>
          <p className="text-gray-300">Inicia sesión en tu cuenta</p>
        </div>

        {/* Card */}
        <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700">
          {/* Google Sign In */}
          <button
            onClick={handleGoogleLogin}
            className="w-full bg-white text-gray-800 font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-3 hover:bg-gray-100 transition-all mb-6"
          >
            <FaGoogle className="text-xl text-red-500" />
            Continuar con Google
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-800 text-gray-400">O continúa con email</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleCredentialsLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-gray-300 mb-2 font-medium">Email</label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-700 text-white border-2 border-slate-600 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:border-purple-500 transition-all"
                  placeholder="tu@email.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-300 mb-2 font-medium">Contraseña</label>
              <div className="relative">
                <FaKey className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-700 text-white border-2 border-slate-600 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:border-purple-500 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link
                href="/auth/forgot-password"
                className="text-purple-400 hover:text-purple-300 text-sm font-medium"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-900/30 border-l-4 border-red-500 rounded-r-lg p-4">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-3 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-gray-400 hover:text-white text-sm flex items-center justify-center gap-2"
            >
              <FaArrowLeft />
              Volver al inicio
            </Link>
          </div>
        </div>

        {/* Development Credentials */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <p className="text-gray-400 text-sm font-semibold mb-2">🔧 Credenciales de desarrollo:</p>
            <p className="text-gray-300 text-xs">CEO: ceo@skillsforit.com / ceo123</p>
            <p className="text-gray-300 text-xs">Mentor: mentor@skillsforit.com / mentor123</p>
            <p className="text-gray-300 text-xs">Usuario: user@example.com / user123</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}
