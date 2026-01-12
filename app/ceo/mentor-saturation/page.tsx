'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  FaUsers,
  FaChartLine,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaFire
} from 'react-icons/fa'

interface SaturationData {
  analysis: any
  ceoMetrics: any
  summary: any
}

export default function MentorSaturationPage() {
  const [data, setData] = useState<SaturationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSaturationData()
    
    // Auto-refresh cada 5 minutos
    const interval = setInterval(fetchSaturationData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const fetchSaturationData = async () => {
    try {
      const response = await fetch('/api/analytics/mentor-saturation')
      const result = await response.json()
      
      if (result.success) {
        setData(result)
        setError(null)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Failed to fetch saturation data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500"></div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="bg-red-500/10 border-2 border-red-500 rounded-xl p-8 text-center">
          <FaExclamationTriangle className="text-5xl text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Error</h2>
          <p className="text-gray-300">{error || 'No data available'}</p>
          <button
            onClick={fetchSaturationData}
            className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const { analysis, ceoMetrics, summary } = data

  const urgencyConfig = {
    low: { icon: FaCheckCircle, color: 'green', bg: 'bg-green-500/10', border: 'border-green-500' },
    medium: { icon: FaClock, color: 'yellow', bg: 'bg-yellow-500/10', border: 'border-yellow-500' },
    high: { icon: FaExclamationTriangle, color: 'orange', bg: 'bg-orange-500/10', border: 'border-orange-500' },
    critical: { icon: FaFire, color: 'red', bg: 'bg-red-500/10', border: 'border-red-500' }
  }

  const config = urgencyConfig[analysis.urgency as keyof typeof urgencyConfig]
  const Icon = config.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <FaChartLine className="text-purple-400" />
            Saturación de Mentores
          </h1>
          <p className="text-gray-400">
            Análisis de capacidad vs demanda • Última actualización: {new Date(analysis.timestamp).toLocaleString('es')}
          </p>
        </motion.div>

        {/* Status Alert */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`${config.bg} ${config.border} border-2 rounded-2xl p-8 mb-8`}
        >
          <div className="flex items-center gap-4">
            <Icon className={`text-5xl text-${config.color}-500`} />
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white mb-2">
                {summary.message}
              </h2>
              <p className="text-gray-300 text-lg">
                Estado: <span className="font-bold uppercase">{analysis.urgency}</span>
              </p>
            </div>
            {analysis.needsHiring && (
              <div className="text-right">
                <div className="text-4xl font-bold text-white">{analysis.recommendedHires}</div>
                <div className="text-gray-300">mentor{analysis.recommendedHires > 1 ? 'es' : ''} a contratar</div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-slate-800 border-2 border-purple-500/50 rounded-xl p-6">
            <FaUsers className="text-3xl text-purple-400 mb-3" />
            <div className="text-3xl font-bold text-white mb-1">
              {analysis.activeMentors}
            </div>
            <div className="text-gray-400">Mentores Activos</div>
            <div className="text-sm text-gray-500 mt-2">
              {analysis.totalMentors} total
            </div>
          </div>

          <div className="bg-slate-800 border-2 border-blue-500/50 rounded-xl p-6">
            <FaChartLine className="text-3xl text-blue-400 mb-3" />
            <div className="text-3xl font-bold text-white mb-1">
              {analysis.totalWeeklyCapacity}
            </div>
            <div className="text-gray-400">Capacidad Semanal</div>
            <div className="text-sm text-gray-500 mt-2">
              sesiones por semana
            </div>
          </div>

          <div className="bg-slate-800 border-2 border-green-500/50 rounded-xl p-6">
            <FaClock className="text-3xl text-green-400 mb-3" />
            <div className="text-3xl font-bold text-white mb-1">
              {analysis.currentWeekDemand}
            </div>
            <div className="text-gray-400">Demanda Actual</div>
            <div className="text-sm text-gray-500 mt-2">
              esta semana
            </div>
          </div>

          <div className={`bg-slate-800 border-2 ${
            analysis.utilizationRate > 80 ? 'border-red-500/50' : 'border-yellow-500/50'
          } rounded-xl p-6`}>
            <FaFire className={`text-3xl ${
              analysis.utilizationRate > 80 ? 'text-red-400' : 'text-yellow-400'
            } mb-3`} />
            <div className="text-3xl font-bold text-white mb-1">
              {analysis.utilizationRate.toFixed(1)}%
            </div>
            <div className="text-gray-400">Utilización</div>
            <div className="text-sm text-gray-500 mt-2">
              {analysis.availableCapacity} disponibles
            </div>
          </div>
        </motion.div>

        {/* Growth Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-2 gap-6 mb-8"
        >
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">📈 Crecimiento</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Tasa de crecimiento semanal</span>
                <span className={`font-bold ${
                  analysis.growthRate > 0 ? 'text-green-400' : 'text-gray-400'
                }`}>
                  {analysis.growthRate > 0 ? '+' : ''}{analysis.growthRate.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Promedio semanal</span>
                <span className="font-bold text-white">
                  {analysis.averageWeeklyDemand.toFixed(1)} sesiones
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Eficiencia por mentor</span>
                <span className="font-bold text-white">
                  {ceoMetrics.mentorEfficiency} sesiones/mentor
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">💰 Capacidad de Ingresos</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Capacidad semanal</span>
                <span className="font-bold text-green-400">
                  ${ceoMetrics.revenueCapacity}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Proyección 4 semanas</span>
                <span className="font-bold text-green-400">
                  ${ceoMetrics.projectedRevenue}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Health Score</span>
                <span className={`font-bold ${
                  ceoMetrics.healthScore > 50 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {ceoMetrics.healthScore.toFixed(0)}/100
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Projections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-8"
        >
          <h3 className="text-2xl font-bold text-white mb-6">🔮 Proyecciones</h3>
          <div className="grid md:grid-cols-4 gap-4">
            {analysis.projections.map((proj: any) => (
              <div
                key={proj.weeks}
                className={`border-2 rounded-xl p-4 ${
                  proj.projectedUtilization > 90
                    ? 'border-red-500 bg-red-500/10'
                    : proj.projectedUtilization > 75
                    ? 'border-yellow-500 bg-yellow-500/10'
                    : 'border-green-500 bg-green-500/10'
                }`}
              >
                <div className="text-sm text-gray-400 mb-2">
                  {proj.weeks} semana{proj.weeks > 1 ? 's' : ''}
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {proj.projectedUtilization.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-400">
                  {proj.projectedDemand} sesiones
                </div>
                {proj.capacityShortfall > 0 && (
                  <div className="mt-2 text-xs text-red-400 font-semibold">
                    ⚠️ Déficit: {proj.capacityShortfall}
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Reasoning */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-8"
        >
          <h3 className="text-2xl font-bold text-white mb-4">💡 Análisis</h3>
          <div className="space-y-2">
            {analysis.reasoning.map((reason: string, idx: number) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 bg-slate-700/50 rounded-lg"
              >
                <span className="text-xl">{reason.split(' ')[0]}</span>
                <span className="text-gray-300 flex-1">{reason.substring(reason.indexOf(' ') + 1)}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Mentor Capacities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-slate-800 border border-slate-700 rounded-xl p-6"
        >
          <h3 className="text-2xl font-bold text-white mb-4">👥 Capacidad por Mentor</h3>
          <div className="space-y-3">
            {analysis.mentorCapacities.map((mentor: any) => (
              <div
                key={mentor.mentorId}
                className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg"
              >
                <div>
                  <div className="font-semibold text-white">{mentor.mentorName}</div>
                  <div className="text-sm text-gray-400">
                    {mentor.weeklyHours}h/semana • {mentor.sessionsPerHour} sesiones/hora
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-400">
                    {mentor.weeklyCapacity}
                  </div>
                  <div className="text-xs text-gray-400">sesiones/semana</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Refresh Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center"
        >
          <button
            onClick={fetchSaturationData}
            disabled={loading}
            className="px-8 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-all"
          >
            {loading ? '⏳ Actualizando...' : '🔄 Actualizar Datos'}
          </button>
        </motion.div>
      </div>
    </div>
  )
}
