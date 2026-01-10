'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FaDownload, FaCheckCircle, FaClock, FaExclamationTriangle } from 'react-icons/fa'
import Link from 'next/link'

export default function DashboardPage() {
  const [email, setEmail] = useState('')
  const [analyses, setAnalyses] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // In production, implement proper authentication
      // For MVP, simple email lookup
      const response = await fetch(`/api/dashboard?email=${encodeURIComponent(email)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al buscar análisis')
      }

      setAnalyses(data.analyses || [])
      if (data.analyses?.length === 0) {
        setError('No se encontraron análisis para este email')
      }
    } catch (err: any) {
      setError(err.message)
      setAnalyses([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle className="text-green-400" />
      case 'processing':
        return <FaClock className="text-blue-400" />
      case 'pending':
        return <FaClock className="text-yellow-400" />
      default:
        return <FaExclamationTriangle className="text-red-400" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completado'
      case 'processing':
        return 'Procesando'
      case 'pending':
        return 'Pendiente'
      default:
        return 'Error'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Dashboard
          </h1>
          <p className="text-xl text-gray-300">
            Accede a tus análisis de CV
          </p>
        </motion.div>

        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-2xl mx-auto mb-12"
        >
          <form onSubmit={handleSearch} className="bg-slate-800 rounded-2xl p-8 border-2 border-slate-700">
            <label className="block text-white font-semibold mb-4">
              Ingresa tu email para ver tus análisis
            </label>
            <div className="flex gap-4">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="flex-1 px-6 py-4 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
            {error && (
              <p className="mt-4 text-red-400 text-sm">{error}</p>
            )}
          </form>
        </motion.div>

        {/* Results */}
        {analyses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6">
              Tus análisis ({analyses.length})
            </h2>

            <div className="grid gap-6">
              {analyses.map((analysis) => (
                <div
                  key={analysis.id}
                  className="bg-slate-800 border border-slate-700 rounded-2xl p-8 hover:border-blue-500/50 transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-white">
                          {analysis.cvFileName}
                        </h3>
                        <div className="flex items-center gap-2 text-sm">
                          {getStatusIcon(analysis.analysisStatus)}
                          <span className="text-gray-300">
                            {getStatusText(analysis.analysisStatus)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-3 gap-4 mt-4 text-sm">
                        <div>
                          <span className="text-gray-400">Profesión:</span>
                          <p className="text-white font-semibold">{analysis.profession}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">País:</span>
                          <p className="text-white font-semibold">{analysis.country}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Fecha:</span>
                          <p className="text-white font-semibold">
                            {new Date(analysis.createdAt).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                      </div>

                      {analysis.analysisResult && (
                        <div className="mt-4 flex gap-6">
                          <div className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                            <span className="text-gray-400 text-sm">Score General</span>
                            <p className="text-white font-bold text-2xl">
                              {analysis.analysisResult.score}/100
                            </p>
                          </div>
                          <div className="px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
                            <span className="text-gray-400 text-sm">Score ATS</span>
                            <p className="text-white font-bold text-2xl">
                              {analysis.analysisResult.atsScore}/100
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {analysis.reportUrl && (
                      <a
                        href={analysis.reportUrl}
                        download
                        className="px-8 py-4 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold rounded-full transition-all transform hover:scale-105 shadow-xl flex items-center justify-center gap-2"
                      >
                        <FaDownload />
                        Descargar Reporte
                      </a>
                    )}
                    
                    {analysis.analysisStatus === 'processing' && (
                      <div className="px-8 py-4 bg-slate-700 text-gray-300 font-semibold rounded-full flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Procesando...
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty state */}
        {!loading && analyses.length === 0 && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-gray-400 mb-8">
              Ingresa tu email arriba para ver tus análisis
            </p>
            <Link
              href="/upload"
              className="inline-block px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-full transition-all transform hover:scale-105"
            >
              Crear nuevo análisis
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  )
}
