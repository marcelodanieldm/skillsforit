'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FaChartBar, 
  FaDollarSign, 
  FaUsers, 
  FaExclamationTriangle,
  FaLightbulb,
  FaSync,
  FaClock
} from 'react-icons/fa'
import { 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts'

interface FunnelMetrics {
  visits: number
  payments: number
  activations: number
  visitToPayment: number
  paymentToActivation: number
  visitToActivation: number
}

interface ComparisonData {
  stage: string
  count: number
  percentage: number
  color: string
}

interface Leak {
  stage: string
  usersLost: number
  lossRate: number
  severity: string
  recommendation: string
}

interface MRRData {
  current: number
  growth: number
  history: any[]
  subscribers: number
  arpu: number
}

interface LTVData {
  bySegment: any[]
  highest: any
}

function FunnelAnalytics() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [funnelMetrics, setFunnelMetrics] = useState<FunnelMetrics | null>(null)
  const [comparisonChart, setComparisonChart] = useState<ComparisonData[]>([])
  const [leaks, setLeaks] = useState<Leak[]>([])
  const [mrr, setMRR] = useState<MRRData | null>(null)
  const [ltv, setLTV] = useState<LTVData | null>(null)
  const [insights, setInsights] = useState<string[]>([])
  const [metadata, setMetadata] = useState<any>(null)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('ceo_token')
      
      const response = await fetch('/api/ceo/business-analytics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Error al cargar analíticas')
      }

      const data = await response.json()

      if (data.success) {
        setFunnelMetrics(data.data.funnel.metrics)
        setComparisonChart(data.data.funnel.comparisonChart)
        setLeaks(data.data.funnel.leaks)
        setMRR(data.data.mrr)
        setLTV(data.data.ltv)
        setInsights(data.data.insights)
        setMetadata(data.metadata)
      }
    } catch (err: any) {
      console.error('Error fetching analytics:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    
    try {
      const token = localStorage.getItem('ceo_token')
      
      await fetch('/api/ceo/business-analytics', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      // Reload data
      await fetchAnalytics()
    } catch (err) {
      console.error('Error refreshing:', err)
    } finally {
      setRefreshing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Cargando analíticas...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex items-center justify-center">
        <div className="bg-red-900/20 border-2 border-red-500 rounded-xl p-8 max-w-md">
          <FaExclamationTriangle className="text-red-500 text-5xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4 text-center">Error</h2>
          <p className="text-red-200 text-center mb-6">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-all"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border-2 border-indigo-500/50 mb-8"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <FaChartBar className="text-indigo-400" />
                Analíticas de Embudo
              </h1>
              <p className="text-gray-300">
                Monitoreo en tiempo real de Visitas → Pagos → Activaciones
              </p>
            </div>
            <div className="text-right">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition-all disabled:opacity-50 mb-2"
              >
                <FaSync className={refreshing ? 'animate-spin' : ''} />
                {refreshing ? 'Actualizando...' : 'Actualizar'}
              </button>
              {metadata && (
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <FaClock />
                  Cache: {metadata.cacheAge} | Load: {metadata.loadTime}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Comparison Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border-2 border-purple-500/50 mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <FaChartBar className="text-purple-400" />
            Comparación: Visitas vs Pagos vs Activaciones
          </h2>

          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={comparisonChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="stage" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #4b5563', 
                  borderRadius: '8px' 
                }}
                labelStyle={{ color: '#f3f4f6' }}
              />
              <Bar dataKey="count" name="Usuarios">
                {comparisonChart.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Metrics Cards */}
          {funnelMetrics && (
            <div className="grid md:grid-cols-3 gap-4 mt-6">
              <div className="bg-blue-900/30 border-l-4 border-blue-500 rounded-r-lg p-4">
                <div className="text-sm text-blue-300 mb-1">Conversión Visita → Pago</div>
                <div className="text-3xl font-bold text-blue-400">
                  {funnelMetrics.visitToPayment.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {funnelMetrics.payments} de {funnelMetrics.visits} visitas
                </div>
              </div>

              <div className="bg-green-900/30 border-l-4 border-green-500 rounded-r-lg p-4">
                <div className="text-sm text-green-300 mb-1">Conversión Pago → Activación</div>
                <div className="text-3xl font-bold text-green-400">
                  {funnelMetrics.paymentToActivation.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {funnelMetrics.activations} de {funnelMetrics.payments} pagos
                </div>
              </div>

              <div className="bg-purple-900/30 border-l-4 border-purple-500 rounded-r-lg p-4">
                <div className="text-sm text-purple-300 mb-1">Conversión Total</div>
                <div className="text-3xl font-bold text-purple-400">
                  {funnelMetrics.visitToActivation.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  De visita a activación completa
                </div>
              </div>
            </div>
          )}
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Leaks (Fugas) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border-2 border-red-500/50"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <FaExclamationTriangle className="text-red-400" />
              Fugas Identificadas
            </h2>

            {leaks.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                ✅ No se detectaron fugas significativas
              </div>
            ) : (
              <div className="space-y-4">
                {leaks.map((leak, index) => (
                  <div 
                    key={index}
                    className={`border-l-4 rounded-r-lg p-4 ${
                      leak.severity === 'Crítico' 
                        ? 'bg-red-900/30 border-red-500' 
                        : leak.severity === 'Alto'
                        ? 'bg-orange-900/30 border-orange-500'
                        : 'bg-yellow-900/30 border-yellow-500'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-semibold text-white">{leak.stage}</div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        leak.severity === 'Crítico'
                          ? 'bg-red-600 text-white'
                          : leak.severity === 'Alto'
                          ? 'bg-orange-600 text-white'
                          : 'bg-yellow-600 text-white'
                      }`}>
                        {leak.severity}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                      {leak.usersLost} usuarios perdidos
                    </div>
                    <div className="text-sm text-gray-300 mb-3">
                      Tasa de fuga: {leak.lossRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-400 italic">
                      💡 {leak.recommendation}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* MRR */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border-2 border-green-500/50"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <FaDollarSign className="text-green-400" />
              Monthly Recurring Revenue
            </h2>

            {mrr && (
              <>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-green-900/30 rounded-lg p-4">
                    <div className="text-sm text-green-300 mb-1">MRR Actual</div>
                    <div className="text-3xl font-bold text-green-400">
                      ${mrr.current.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-blue-900/30 rounded-lg p-4">
                    <div className="text-sm text-blue-300 mb-1">Crecimiento</div>
                    <div className={`text-3xl font-bold ${
                      mrr.growth > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {mrr.growth > 0 ? '+' : ''}{mrr.growth.toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-purple-900/30 rounded-lg p-4">
                    <div className="text-sm text-purple-300 mb-1">Suscriptores</div>
                    <div className="text-3xl font-bold text-purple-400">
                      {mrr.subscribers}
                    </div>
                  </div>
                  <div className="bg-indigo-900/30 rounded-lg p-4">
                    <div className="text-sm text-indigo-300 mb-1">ARPU</div>
                    <div className="text-3xl font-bold text-indigo-400">
                      ${mrr.arpu.toFixed(0)}
                    </div>
                  </div>
                </div>

                {mrr.history && mrr.history.length > 0 && (
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={mrr.history}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="month" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip
                        contentStyle={{ 
                          backgroundColor: '#1f2937', 
                          border: '1px solid #4b5563' 
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="totalMRR" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        name="MRR"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </>
            )}
          </motion.div>
        </div>

        {/* LTV by Segment */}
        {ltv && ltv.bySegment && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border-2 border-blue-500/50 mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <FaUsers className="text-blue-400" />
              LTV por Segmento (desde Vista Materializada)
            </h2>

            <div className="grid md:grid-cols-3 gap-4">
              {ltv.bySegment.map((segment, index) => (
                <div 
                  key={index}
                  className={`bg-slate-700/50 rounded-lg p-4 ${
                    segment.segment === ltv.highest.segment 
                      ? 'border-2 border-yellow-500' 
                      : ''
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-white">{segment.segment}</h3>
                    {segment.segment === ltv.highest.segment && (
                      <span className="text-xs bg-yellow-600 text-white px-2 py-1 rounded">
                        Mayor LTV
                      </span>
                    )}
                  </div>
                  <div className="text-3xl font-bold text-indigo-400 mb-2">
                    ${segment.ltv}
                  </div>
                  <div className="space-y-1 text-sm text-gray-300">
                    <div>Usuarios: {segment.totalUsers}</div>
                    <div>Revenue/mes: ${segment.averageMonthlyRevenue}</div>
                    <div>Churn: {(segment.churnRate * 100).toFixed(0)}%</div>
                    <div>Lifetime: {segment.lifetimeMonths} meses</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Insights */}
        {insights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border-2 border-yellow-500/50"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <FaLightbulb className="text-yellow-400" />
              Insights Automáticos
            </h2>

            <div className="space-y-3">
              {insights.map((insight, index) => (
                <div 
                  key={index}
                  className="bg-yellow-900/20 border-l-4 border-yellow-500 rounded-r-lg p-4"
                >
                  <p className="text-gray-200">{insight}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

// Exportar con HOC de protección
export default FunnelAnalytics
