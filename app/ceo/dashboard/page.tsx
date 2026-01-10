'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  FaChartLine, 
  FaDollarSign, 
  FaUsers, 
  FaFunnelDollar, 
  FaLock,
  FaSignOutAlt,
  FaLightbulb
} from 'react-icons/fa'
import { 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  FunnelChart,
  Funnel,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell,
  LabelList
} from 'recharts'

interface ProjectionData {
  historical: { month: string; year: number; realistic: number; optimistic: number; actual?: number }[]
  future: { month: string; year: number; realistic: number; optimistic: number }[]
  assumptions: any
  insights: string[]
}

interface LTVData {
  segment: string
  totalUsers: number
  ltv: number
  churnRate: number
  lifetimeMonths: number
  revenueBreakdown: {
    cvAnalysis: number
    mentorship: number
    ebooks: number
  }
}

interface FunnelStage {
  stage: string
  users: number
  conversionRate: number
  dropOffRate: number
}

const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6']

export default function CEODashboard() {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [projections, setProjections] = useState<ProjectionData | null>(null)
  const [ltv, setLtv] = useState<LTVData[]>([])
  const [funnel, setFunnel] = useState<FunnelStage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if logged in
    const storedToken = localStorage.getItem('ceo_token')
    const storedUser = localStorage.getItem('ceo_user')

    if (!storedToken || !storedUser) {
      router.push('/ceo/login')
      return
    }

    setToken(storedToken)
    setUser(JSON.parse(storedUser))

    fetchDashboardData(storedToken)
  }, [])

  const fetchDashboardData = async (authToken: string) => {
    setLoading(true)
    setError(null)

    try {
      // Fetch projections
      const projectionsRes = await fetch('/api/ceo/projections', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      if (!projectionsRes.ok) {
        if (projectionsRes.status === 403) {
          throw new Error('Acceso denegado. Solo CEO puede ver este dashboard.')
        }
        throw new Error('Error al cargar proyecciones')
      }

      const projectionsData = await projectionsRes.json()
      if (projectionsData.success) {
        setProjections(projectionsData.data)
      }

      // Fetch LTV
      const ltvRes = await fetch('/api/ceo/ltv?period=180', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      if (ltvRes.ok) {
        const ltvData = await ltvRes.json()
        if (ltvData.success) {
          setLtv(ltvData.data)
        }
      }

      // Fetch funnel
      const funnelRes = await fetch('/api/analytics/funnel?period=30')

      if (funnelRes.ok) {
        const funnelData = await funnelRes.json()
        if (funnelData.success) {
          setFunnel(funnelData.data.stages)
        }
      }

    } catch (err: any) {
      console.error('Error fetching dashboard:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('ceo_token')
    localStorage.removeItem('ceo_user')
    router.push('/ceo/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Cargando Dashboard Ejecutivo...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex items-center justify-center">
        <div className="bg-red-900/20 border-2 border-red-500 rounded-xl p-8 max-w-md">
          <FaLock className="text-red-500 text-5xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4 text-center">Acceso Denegado</h2>
          <p className="text-red-200 text-center mb-6">{error}</p>
          <button
            onClick={() => router.push('/ceo/login')}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-all"
          >
            Volver al Login
          </button>
        </div>
      </div>
    )
  }

  // Prepare chart data
  const combinedData = [
    ...(projections?.historical || []),
    ...(projections?.future || [])
  ].map(item => ({
    month: `${item.month} ${item.year}`,
    Realista: item.realistic,
    Optimista: item.optimistic,
    Actual: item.actual
  }))

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
                <FaChartLine className="text-indigo-400" />
                Dashboard Ejecutivo
              </h1>
              <p className="text-gray-300">Bienvenido, {user?.name}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
            >
              <FaSignOutAlt />
              Cerrar Sesión
            </button>
          </div>
        </motion.div>

        {/* Revenue Projections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border-2 border-purple-500/50 mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <FaDollarSign className="text-green-400" />
            Proyecciones de Ingresos: Realista vs Optimista
          </h2>

          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={combinedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563', borderRadius: '8px' }}
                labelStyle={{ color: '#f3f4f6' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="Actual" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ fill: '#10b981', r: 5 }}
              />
              <Line 
                type="monotone" 
                dataKey="Realista" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                strokeDasharray="5 5"
              />
              <Line 
                type="monotone" 
                dataKey="Optimista" 
                stroke="#ec4899" 
                strokeWidth={2}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Insights */}
          {projections && projections.insights.length > 0 && (
            <div className="mt-6 space-y-3">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <FaLightbulb className="text-yellow-400" />
                Insights Estratégicos
              </h3>
              {projections.insights.map((insight, index) => (
                <div key={index} className="bg-indigo-900/30 border-l-4 border-indigo-500 rounded-r-lg p-4">
                  <p className="text-gray-200 text-sm">{insight}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* LTV by Segment */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border-2 border-blue-500/50"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <FaUsers className="text-blue-400" />
              LTV por Segmento
            </h2>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ltv}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="segment" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563', borderRadius: '8px' }}
                />
                <Bar dataKey="ltv" fill="#3b82f6" name="LTV ($)">
                  {ltv.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <div className="mt-6 space-y-3">
              {ltv.map((segment, index) => (
                <div key={index} className="bg-slate-700/50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-white">{segment.segment}</h4>
                    <span className="text-2xl font-bold text-indigo-400">${segment.ltv}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm text-gray-300">
                    <div>
                      <span className="text-gray-500">Usuarios:</span> {segment.totalUsers}
                    </div>
                    <div>
                      <span className="text-gray-500">Churn:</span> {(segment.churnRate * 100).toFixed(0)}%
                    </div>
                    <div>
                      <span className="text-gray-500">Lifetime:</span> {segment.lifetimeMonths} meses
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Funnel Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border-2 border-orange-500/50"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <FaFunnelDollar className="text-orange-400" />
              Embudo de Conversión
            </h2>

            <div className="space-y-2">
              {funnel.map((stage, index) => {
                const widthPercentage = stage.conversionRate
                const isBottleneck = stage.dropOffRate > 30

                return (
                  <div key={index} className="relative">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-300">{stage.stage}</span>
                      <span className="text-sm text-gray-400">{stage.users} usuarios</span>
                    </div>
                    <div className="relative h-12 bg-slate-700 rounded-lg overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          isBottleneck ? 'bg-gradient-to-r from-red-600 to-red-500' : 
                          'bg-gradient-to-r from-indigo-600 to-purple-600'
                        }`}
                        style={{ width: `${widthPercentage}%` }}
                      >
                        <div className="flex items-center justify-between h-full px-4 text-white text-sm font-semibold">
                          <span>{stage.conversionRate.toFixed(1)}%</span>
                          {stage.dropOffRate > 0 && (
                            <span className="text-xs opacity-75">-{stage.dropOffRate.toFixed(0)}%</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {isBottleneck && (
                      <span className="absolute right-0 top-0 bg-red-600 text-white text-xs px-2 py-1 rounded">
                        Cuello de Botella
                      </span>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="mt-6 bg-orange-900/30 border-l-4 border-orange-500 rounded-r-lg p-4">
              <p className="text-orange-200 text-sm">
                <strong>Conversión Total:</strong> {funnel[funnel.length - 1]?.conversionRate.toFixed(1)}% 
                de visitantes completan el funnel completo.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-4 gap-6"
        >
          {[
            { 
              label: 'Revenue Actual', 
              value: `$${projections?.historical[projections.historical.length - 1]?.actual?.toLocaleString() || 0}`,
              color: 'green',
              icon: FaDollarSign
            },
            { 
              label: 'LTV Promedio', 
              value: `$${Math.round(ltv.reduce((sum, s) => sum + s.ltv, 0) / (ltv.length || 1))}`,
              color: 'blue',
              icon: FaUsers
            },
            { 
              label: 'Conversión Total', 
              value: `${funnel[funnel.length - 1]?.conversionRate.toFixed(1)}%`,
              color: 'purple',
              icon: FaFunnelDollar
            },
            { 
              label: 'Crecimiento MoM', 
              value: `+${projections?.assumptions.realistic.growthRate.toFixed(0)}%`,
              color: 'pink',
              icon: FaChartLine
            }
          ].map((stat, index) => (
            <div key={index} className={`bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border-2 border-${stat.color}-500/50`}>
              <stat.icon className={`text-${stat.color}-400 text-3xl mb-3`} />
              <div className={`text-3xl font-bold text-${stat.color}-400 mb-2`}>
                {stat.value}
              </div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
