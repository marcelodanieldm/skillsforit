'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { FaLock, FaEnvelope, FaKey, FaChartLine } from 'react-icons/fa'

export default function CEOLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Credenciales inválidas')
      }

      if (data.user.role !== 'ceo') {
        throw new Error('Solo usuarios con rol CEO pueden acceder a este dashboard')
      }

      // Save token and user
      localStorage.setItem('ceo_token', data.token)
      localStorage.setItem('ceo_user', JSON.stringify(data.user))

      // Redirect to dashboard
      router.push('/ceo/dashboard')

    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="inline-block bg-gradient-to-br from-indigo-600 to-purple-600 p-4 rounded-2xl mb-4"
          >
            <FaChartLine className="text-white text-5xl" />
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard CEO</h1>
          <p className="text-gray-300">Acceso Ejecutivo</p>
        </div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border-2 border-indigo-500/50"
        >
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-gray-300 mb-2 font-medium">
                Email Corporativo
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-700 text-white border-2 border-slate-600 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:border-indigo-500 transition-all"
                  placeholder="ceo@skillsforit.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-300 mb-2 font-medium">
                Contraseña
              </label>
              <div className="relative">
                <FaKey className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-700 text-white border-2 border-slate-600 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:border-indigo-500 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-900/30 border-l-4 border-red-500 rounded-r-lg p-4"
              >
                <div className="flex items-center gap-2">
                  <FaLock className="text-red-400" />
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 rounded-lg font-semibold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Verificando...
                </>
              ) : (
                <>
                  <FaLock />
                  Acceder al Dashboard
                </>
              )}
            </button>
          </form>

          {/* Test Credentials */}
          <div className="mt-6 pt-6 border-t-2 border-slate-700">
            <p className="text-gray-400 text-sm mb-2 font-medium">Credenciales de Prueba:</p>
            <div className="bg-slate-700/50 rounded-lg p-3 space-y-1 text-xs">
              <p className="text-gray-300">
                <span className="text-indigo-400 font-semibold">CEO:</span> ceo@skillsforit.com / ceo123
              </p>
              <p className="text-gray-300">
                <span className="text-red-400 font-semibold">Usuario:</span> user@example.com / user123 
                <span className="text-red-300 ml-2">(Sin acceso)</span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center"
        >
          <div className="inline-flex items-center gap-2 bg-slate-800/30 border border-slate-700 rounded-lg px-4 py-2">
            <FaLock className="text-indigo-400" />
            <p className="text-gray-400 text-sm">
              Dashboard protegido con autenticación por roles
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
