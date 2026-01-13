'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaDollarSign, FaChartLine, FaUsers, FaTrophy, FaSync } from 'react-icons/fa'

type TimeFilter = 'day' | 'week' | 'month'

interface NorthStarData {
  grossRevenue: number
  netMargin: number
  netMarginPercentage: number
  cac: number
  ltv: number
  ltvCacRatio: number
  costs: {
    openaiCosts: number
    mentorCommissions: number
    totalCosts: number
  }
}

export function NorthStarMetrics() {
  const [filter, setFilter] = useState<TimeFilter>('month')
  const [data, setData] = useState<NorthStarData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  useEffect(() => {
    fetchMetrics()
  }, [filter])

  async function fetchMetrics() {
    setLoading(true)
    try {
      const response = await fetch(`/api/ceo/north-star-metrics?filter=${filter}`)
      const result = await response.json()
      
      if (result.success) {
        setData(result.data)
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error('Error fetching north star metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterButtons: { value: TimeFilter; label: string }[] = [
    { value: 'day', label: 'Hoy' },
    { value: 'week', label: 'Semana' },
    { value: 'month', label: 'Mes' }
  ]

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl p-8 border-2 border-emerald-500/50">
        <div className="flex items-center justify-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          <p className="text-slate-300">Cargando métricas...</p>
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border-2 border-emerald-500/50">
      {/* Header con filtros */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-2">
            <FaTrophy className="text-emerald-400" />
            The North Star Metrics
          </h2>
          <p className="text-slate-400 text-sm">
            Actualizado: {lastUpdated.toLocaleTimeString('es-ES')}
          </p>
        </div>

        <div className="flex items-center gap-2 mt-4 md:mt-0">
          {/* Time Filter Buttons */}
          <div className="flex bg-slate-700/30 rounded-lg p-1">
            {filterButtons.map((btn) => (
              <button
                key={btn.value}
                onClick={() => setFilter(btn.value)}
                className={`px-4 py-2 rounded-md text-sm font-semibold transition ${
                  filter === btn.value
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchMetrics}
            className="p-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition"
            title="Actualizar métricas"
          >
            <FaSync className="text-emerald-400" />
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid md:grid-cols-4 gap-6">
        {/* Gross Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-emerald-900/30 to-emerald-800/20 rounded-xl p-6 border border-emerald-500/30"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="bg-emerald-500/20 p-3 rounded-lg">
              <FaDollarSign className="text-2xl text-emerald-400" />
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400 uppercase tracking-wide">Ingresos Totales</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-white mb-1">
            ${data.grossRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-emerald-400">
            Gross Revenue
          </p>
          <div className="mt-3 pt-3 border-t border-emerald-500/20">
            <p className="text-xs text-slate-400">
              Costos totales: ${data.costs.totalCosts.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </motion.div>

        {/* Net Margin */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`bg-gradient-to-br rounded-xl p-6 border ${
            data.netMarginPercentage >= 70
              ? 'from-green-900/30 to-green-800/20 border-green-500/30'
              : data.netMarginPercentage >= 50
              ? 'from-yellow-900/30 to-yellow-800/20 border-yellow-500/30'
              : 'from-red-900/30 to-red-800/20 border-red-500/30'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`p-3 rounded-lg ${
              data.netMarginPercentage >= 70
                ? 'bg-green-500/20'
                : data.netMarginPercentage >= 50
                ? 'bg-yellow-500/20'
                : 'bg-red-500/20'
            }`}>
              <FaChartLine className={`text-2xl ${
                data.netMarginPercentage >= 70
                  ? 'text-green-400'
                  : data.netMarginPercentage >= 50
                  ? 'text-yellow-400'
                  : 'text-red-400'
              }`} />
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400 uppercase tracking-wide">Margen Neto</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-white mb-1">
            ${data.netMargin.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className={`text-sm font-semibold ${
            data.netMarginPercentage >= 70
              ? 'text-green-400'
              : data.netMarginPercentage >= 50
              ? 'text-yellow-400'
              : 'text-red-400'
          }`}>
            {data.netMarginPercentage.toFixed(1)}% margen
          </p>
          <div className="mt-3 pt-3 border-t border-slate-500/20">
            <div className="space-y-1">
              <p className="text-xs text-slate-400">
                OpenAI: ${data.costs.openaiCosts.toFixed(2)}
              </p>
              <p className="text-xs text-slate-400">
                Mentores: ${data.costs.mentorCommissions.toFixed(2)}
              </p>
            </div>
          </div>
        </motion.div>

        {/* CAC (Cost of Acquisition) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 rounded-xl p-6 border border-blue-500/30"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="bg-blue-500/20 p-3 rounded-lg">
              <FaUsers className="text-2xl text-blue-400" />
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400 uppercase tracking-wide">Costo Adquisición</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-white mb-1">
            ${data.cac.toFixed(2)}
          </p>
          <p className="text-sm text-blue-400">
            CAC por cliente
          </p>
          <div className="mt-3 pt-3 border-t border-blue-500/20">
            <p className="text-xs text-slate-400">
              Orgánico (LinkedIn) + Tiempo
            </p>
          </div>
        </motion.div>

        {/* LTV (Lifetime Value) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`bg-gradient-to-br rounded-xl p-6 border ${
            data.ltvCacRatio >= 3
              ? 'from-purple-900/30 to-purple-800/20 border-purple-500/30'
              : 'from-orange-900/30 to-orange-800/20 border-orange-500/30'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`p-3 rounded-lg ${
              data.ltvCacRatio >= 3 ? 'bg-purple-500/20' : 'bg-orange-500/20'
            }`}>
              <FaTrophy className={`text-2xl ${
                data.ltvCacRatio >= 3 ? 'text-purple-400' : 'text-orange-400'
              }`} />
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400 uppercase tracking-wide">Lifetime Value</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-white mb-1">
            ${data.ltv.toFixed(2)}
          </p>
          <p className={`text-sm font-semibold ${
            data.ltvCacRatio >= 3 ? 'text-purple-400' : 'text-orange-400'
          }`}>
            Ratio LTV:CAC {data.ltvCacRatio.toFixed(1)}:1
          </p>
          <div className="mt-3 pt-3 border-t border-purple-500/20">
            <p className="text-xs text-slate-400">
              E-book + CV + Mentorías
            </p>
            <p className={`text-xs mt-1 ${
              data.ltvCacRatio >= 3 ? 'text-green-400' : 'text-yellow-400'
            }`}>
              {data.ltvCacRatio >= 3 ? '✓ Ratio saludable (>3:1)' : '⚠ Optimizar CAC (<3:1)'}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Insights Section */}
      <div className="mt-6 bg-slate-700/30 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
          <FaChartLine className="text-emerald-400" />
          Insights
        </h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-slate-400">
              <span className="text-white font-semibold">Eficiencia Operativa:</span>
              {' '}
              {data.netMarginPercentage >= 70
                ? 'Excelente - Costos bien controlados'
                : data.netMarginPercentage >= 50
                ? 'Bueno - Margen saludable'
                : 'Atención - Revisar estructura de costos'}
            </p>
          </div>
          <div>
            <p className="text-slate-400">
              <span className="text-white font-semibold">Rentabilidad Cliente:</span>
              {' '}
              {data.ltvCacRatio >= 3
                ? `Fuerte (${data.ltvCacRatio.toFixed(1)}:1) - Modelo sostenible`
                : `Mejorar (${data.ltvCacRatio.toFixed(1)}:1) - Optimizar CAC o aumentar LTV`}
            </p>
          </div>
          <div>
            <p className="text-slate-400">
              <span className="text-white font-semibold">Revenue Run Rate:</span>
              {' '}
              ${(data.grossRevenue * (filter === 'day' ? 365 : filter === 'week' ? 52 : 12)).toLocaleString('en-US', { maximumFractionDigits: 0 })}
              {' '}/año
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
