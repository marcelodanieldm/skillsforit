'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import { 
  FaChartLine, FaDollarSign, FaUsers, FaRocket, FaServer, 
  FaClock, FaCoins, FaStar, FaBriefcase, FaTrophy,
  FaArrowUp, FaArrowDown, FaCircle, FaDownload, FaCalendar
} from 'react-icons/fa'
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts'

// Tipos de Métricas
interface GrowthMetrics {
  cac: number // Customer Acquisition Cost
  cacTrend: number // % cambio vs mes anterior
  ltv: number // Lifetime Value
  ltvTrend: number
  churn: number // % mensual
  churnTrend: number
  viralKFactor: number // K-Factor viral
  viralTrend: number
}

interface InfrastructureMetrics {
  aiResponseTime: number // ms
  aiResponseTrend: number
  edgeFunctionLatency: number // ms
  edgeLatencyTrend: number
  costPerToken: number // USD
  costPerTokenTrend: number
  totalTokensUsed: number
  infrastructureCost: number // USD/mes
}

interface ProductMetrics {
  mentorNPS: number // -100 to 100
  mentorNPSTrend: number
  auditSuccessRate: number // % usuarios con entrevista
  auditSuccessTrend: number
  avgTimeToInterview: number // días
  interviewTimeTrend: number
  userSatisfaction: number // 1-5
  satisfactionTrend: number
}

interface HistoricalData {
  month: string
  cac: number
  ltv: number
  churn: number
  nps: number
  successRate: number
}

export default function CEODashboard() {
  const { user } = useAuth()
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [loading, setLoading] = useState(true)
  
  // Métricas (simulated data - replace with real API calls)
  const [growthMetrics, setGrowthMetrics] = useState<GrowthMetrics>({
    cac: 45.50,
    cacTrend: -12.5, // -12.5% vs mes anterior (mejor)
    ltv: 380.00,
    ltvTrend: 18.3,
    churn: 4.2,
    churnTrend: -8.7, // reducción es bueno
    viralKFactor: 1.3,
    viralTrend: 22.1
  })

  const [infraMetrics, setInfraMetrics] = useState<InfrastructureMetrics>({
    aiResponseTime: 850, // ms
    aiResponseTrend: -15.2, // mejora (reducción)
    edgeFunctionLatency: 120, // ms
    edgeLatencyTrend: -8.5,
    costPerToken: 0.0012, // USD
    costPerTokenTrend: -3.2,
    totalTokensUsed: 2500000,
    infrastructureCost: 3200 // USD/mes
  })

  const [productMetrics, setProductMetrics] = useState<ProductMetrics>({
    mentorNPS: 68,
    mentorNPSTrend: 12.5,
    auditSuccessRate: 42.5, // % usuarios que consiguen entrevista
    auditSuccessTrend: 15.8,
    avgTimeToInterview: 18, // días
    interviewTimeTrend: -22.3, // reducción es mejor
    userSatisfaction: 4.6,
    satisfactionTrend: 8.2
  })

  // Datos históricos para gráficos
  const historicalData: HistoricalData[] = [
    { month: 'Jul', cac: 65, ltv: 280, churn: 6.5, nps: 52, successRate: 28 },
    { month: 'Aug', cac: 58, ltv: 310, churn: 5.8, nps: 58, successRate: 32 },
    { month: 'Sep', cac: 52, ltv: 340, churn: 5.2, nps: 62, successRate: 36 },
    { month: 'Oct', cac: 48, ltv: 360, churn: 4.8, nps: 65, successRate: 39 },
    { month: 'Nov', cac: 45, ltv: 380, churn: 4.2, nps: 68, successRate: 42.5 }
  ]

  // Distribución de usuarios por fuente
  const userSourceData = [
    { name: 'Orgánico', value: 45, color: '#10b981' },
    { name: 'Referidos', value: 30, color: '#8b5cf6' },
    { name: 'Paid Ads', value: 15, color: '#f59e0b' },
    { name: 'Partnerships', value: 10, color: '#3b82f6' }
  ]

  // Métricas por país (top 5)
  const countryMetrics = [
    { country: 'España', users: 4500, revenue: 12500, satisfaction: 4.7 },
    { country: 'México', users: 3200, revenue: 8900, satisfaction: 4.5 },
    { country: 'Argentina', users: 2800, revenue: 7200, satisfaction: 4.6 },
    { country: 'Colombia', users: 2100, revenue: 5800, satisfaction: 4.4 },
    { country: 'Chile', users: 1800, revenue: 5200, satisfaction: 4.6 }
  ]

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => setLoading(false), 1000)
    
    // TODO: Replace with real API calls
    // fetchGrowthMetrics()
    // fetchInfrastructureMetrics()
    // fetchProductMetrics()
  }, [timeRange])

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <FaTrophy className="text-6xl text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Acceso Restringido
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Solo administradores pueden acceder al Dashboard Ejecutivo
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando métricas ejecutivas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-[1600px] mx-auto px-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-2xl p-8 mb-8 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Hola, CEO! 👋
              </h1>
              <div className="flex items-center gap-3 mb-2">
                <FaTrophy className="text-3xl" />
                <h2 className="text-3xl font-semibold">Dashboard Ejecutivo</h2>
              </div>
              <p className="text-purple-100">Vista de 360° de SkillsForIT - {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Time Range Selector */}
              <div className="bg-white/20 rounded-lg p-2 flex gap-2">
                {(['7d', '30d', '90d', '1y'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      timeRange === range
                        ? 'bg-white text-purple-600'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    {range === '7d' && '7 días'}
                    {range === '30d' && '30 días'}
                    {range === '90d' && '90 días'}
                    {range === '1y' && '1 año'}
                  </button>
                ))}
              </div>
              
              {/* Export Button */}
              <button className="px-6 py-3 bg-white text-purple-600 font-bold rounded-lg hover:bg-purple-50 transition-all flex items-center gap-2">
                <FaDownload />
                Exportar PDF
              </button>
            </div>
          </div>
        </div>

        {/* === PILAR 1: MÉTRICAS DE CRECIMIENTO === */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FaChartLine className="text-green-500" />
            Métricas de Crecimiento
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* CAC */}
            <MetricCard
              title="CAC"
              subtitle="Customer Acquisition Cost"
              value={`$${growthMetrics.cac.toFixed(2)}`}
              trend={growthMetrics.cacTrend}
              icon={<FaDollarSign className="text-3xl" />}
              iconColor="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
              inverseGood={true} // Lower CAC is better
            />
            
            {/* LTV */}
            <MetricCard
              title="LTV"
              subtitle="Lifetime Value"
              value={`$${growthMetrics.ltv.toFixed(2)}`}
              trend={growthMetrics.ltvTrend}
              icon={<FaTrophy className="text-3xl" />}
              iconColor="bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
            />
            
            {/* Churn Rate */}
            <MetricCard
              title="Churn"
              subtitle="Tasa de Cancelación Mensual"
              value={`${growthMetrics.churn.toFixed(1)}%`}
              trend={growthMetrics.churnTrend}
              icon={<FaUsers className="text-3xl" />}
              iconColor="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
              inverseGood={true}
            />
            
            {/* Viral K-Factor */}
            <MetricCard
              title="Viral K-Factor"
              subtitle="Usuarios generados por usuario"
              value={growthMetrics.viralKFactor.toFixed(2)}
              trend={growthMetrics.viralTrend}
              icon={<FaRocket className="text-3xl" />}
              iconColor="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
              highlight={growthMetrics.viralKFactor > 1}
            />
          </div>

          {/* LTV/CAC Ratio & Historical Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LTV/CAC Ratio */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Ratio LTV/CAC
              </h3>
              <div className="text-center">
                <div className="text-5xl font-bold text-purple-600 mb-2">
                  {(growthMetrics.ltv / growthMetrics.cac).toFixed(1)}x
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Objetivo: &gt; 3x (Saludable)
                </p>
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-4">
                  <div 
                    className={`h-4 rounded-full transition-all ${
                      growthMetrics.ltv / growthMetrics.cac >= 3 
                        ? 'bg-green-500' 
                        : 'bg-yellow-500'
                    }`}
                    style={{ width: `${Math.min((growthMetrics.ltv / growthMetrics.cac) / 5 * 100, 100)}%` }}
                  />
                </div>
                <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                  <p>{'< 1x: Negocio insostenible'}</p>
                  <p>{'1-3x: Crecimiento lento'}</p>
                  <p>{'> 3x: Crecimiento saludable ✅'}</p>
                </div>
              </div>
            </div>

            {/* Historical Trend */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Evolución CAC vs LTV
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="cac" stroke="#ef4444" strokeWidth={3} name="CAC ($)" />
                  <Line type="monotone" dataKey="ltv" stroke="#10b981" strokeWidth={3} name="LTV ($)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* === PILAR 2: MÉTRICAS DE INFRAESTRUCTURA === */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FaServer className="text-blue-500" />
            Métricas de Infraestructura
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* AI Response Time */}
            <MetricCard
              title="AI Response"
              subtitle="Tiempo de respuesta promedio"
              value={`${infraMetrics.aiResponseTime}ms`}
              trend={infraMetrics.aiResponseTrend}
              icon={<FaClock className="text-3xl" />}
              iconColor="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
              inverseGood={true}
            />
            
            {/* Edge Function Latency */}
            <MetricCard
              title="Edge Latency"
              subtitle="Latencia de Edge Functions"
              value={`${infraMetrics.edgeFunctionLatency}ms`}
              trend={infraMetrics.edgeLatencyTrend}
              icon={<FaRocket className="text-3xl" />}
              iconColor="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
              inverseGood={true}
            />
            
            {/* Cost Per Token */}
            <MetricCard
              title="Costo/Token"
              subtitle="USD por 1k tokens"
              value={`$${(infraMetrics.costPerToken * 1000).toFixed(3)}`}
              trend={infraMetrics.costPerTokenTrend}
              icon={<FaCoins className="text-3xl" />}
              iconColor="bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
              inverseGood={true}
            />
            
            {/* Infrastructure Cost */}
            <MetricCard
              title="Costo Total"
              subtitle="Infraestructura mensual"
              value={`$${infraMetrics.infrastructureCost.toLocaleString()}`}
              trend={-2.5}
              icon={<FaDollarSign className="text-3xl" />}
              iconColor="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
              inverseGood={true}
            />
          </div>

          {/* Infrastructure Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Token Usage */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Uso de Tokens (mes actual)
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total tokens usados</span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {(infraMetrics.totalTokensUsed / 1000000).toFixed(2)}M
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Costo por token</span>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    ${(infraMetrics.costPerToken * 1000).toFixed(4)}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-slate-700">
                  <span className="text-gray-600 dark:text-gray-400">Costo total tokens</span>
                  <span className="text-2xl font-bold text-purple-600">
                    ${(infraMetrics.totalTokensUsed * infraMetrics.costPerToken).toFixed(2)}
                  </span>
                </div>
                
                {/* Usage by Service */}
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Distribución por servicio
                  </h4>
                  <div className="space-y-2">
                    <UsageBar label="CV Analysis" percentage={45} color="bg-blue-500" />
                    <UsageBar label="Mentorship" percentage={30} color="bg-purple-500" />
                    <UsageBar label="Interview Prep" percentage={15} color="bg-green-500" />
                    <UsageBar label="Other" percentage={10} color="bg-gray-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Performance SLA
              </h3>
              <div className="space-y-6">
                <PerformanceIndicator
                  label="AI Response Time"
                  current={infraMetrics.aiResponseTime}
                  target={1000}
                  unit="ms"
                  lowerIsBetter={true}
                />
                <PerformanceIndicator
                  label="Edge Function Latency"
                  current={infraMetrics.edgeFunctionLatency}
                  target={150}
                  unit="ms"
                  lowerIsBetter={true}
                />
                <PerformanceIndicator
                  label="Uptime"
                  current={99.94}
                  target={99.9}
                  unit="%"
                />
                <PerformanceIndicator
                  label="Error Rate"
                  current={0.12}
                  target={0.5}
                  unit="%"
                  lowerIsBetter={true}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* === PILAR 3: MÉTRICAS DE PRODUCTO === */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FaStar className="text-yellow-500" />
            Métricas de Producto
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Mentor NPS */}
            <MetricCard
              title="NPS Mentor"
              subtitle="Net Promoter Score"
              value={productMetrics.mentorNPS.toString()}
              trend={productMetrics.mentorNPSTrend}
              icon={<FaStar className="text-3xl" />}
              iconColor="bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
              highlight={productMetrics.mentorNPS > 50}
            />
            
            {/* Audit Success Rate */}
            <MetricCard
              title="Éxito Auditoría"
              subtitle="% usuarios con entrevista"
              value={`${productMetrics.auditSuccessRate.toFixed(1)}%`}
              trend={productMetrics.auditSuccessTrend}
              icon={<FaBriefcase className="text-3xl" />}
              iconColor="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
              highlight={productMetrics.auditSuccessRate > 40}
            />
            
            {/* Time to Interview */}
            <MetricCard
              title="Tiempo a Entrevista"
              subtitle="Días promedio"
              value={`${productMetrics.avgTimeToInterview}d`}
              trend={productMetrics.interviewTimeTrend}
              icon={<FaCalendar className="text-3xl" />}
              iconColor="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
              inverseGood={true}
            />
            
            {/* User Satisfaction */}
            <MetricCard
              title="Satisfacción"
              subtitle="Promedio general"
              value={`${productMetrics.userSatisfaction.toFixed(1)}/5.0`}
              trend={productMetrics.satisfactionTrend}
              icon={<FaStar className="text-3xl" />}
              iconColor="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
              highlight={productMetrics.userSatisfaction >= 4.5}
            />
          </div>

          {/* Product Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* NPS Distribution */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Distribución NPS
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-green-600 font-semibold">Promotores (9-10)</span>
                  <span className="text-2xl font-bold text-green-600">58%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3">
                  <div className="bg-green-500 h-3 rounded-full" style={{ width: '58%' }} />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-yellow-600 font-semibold">Pasivos (7-8)</span>
                  <span className="text-2xl font-bold text-yellow-600">32%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3">
                  <div className="bg-yellow-500 h-3 rounded-full" style={{ width: '32%' }} />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-red-600 font-semibold">Detractores (0-6)</span>
                  <span className="text-2xl font-bold text-red-600">10%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3">
                  <div className="bg-red-500 h-3 rounded-full" style={{ width: '10%' }} />
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-slate-700 text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-1">
                    {productMetrics.mentorNPS}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    NPS = % Promotores - % Detractores
                  </p>
                </div>
              </div>
            </div>

            {/* Success Rate by Country */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Tasa de Éxito por País
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="successRate" fill="#10b981" radius={[8, 8, 0, 0]} name="Éxito (%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* === RESUMEN EJECUTIVO === */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FaChartLine className="text-purple-500" />
            Resumen Ejecutivo
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Acquisition Sources */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Fuentes de Adquisición
              </h3>
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={userSourceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {userSourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {userSourceData.map((source) => (
                  <div key={source.name} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: source.color }}
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {source.name}: {source.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Countries */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Top 5 Países
              </h3>
              <div className="space-y-3">
                {countryMetrics.map((country, index) => (
                  <div 
                    key={country.country}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {country.country}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {country.users.toLocaleString()} usuarios
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">
                        ${country.revenue.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        ⭐ {country.satisfaction}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer with Key Insights */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-6 border-2 border-green-200 dark:border-green-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            💡 Insights Clave
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <FaArrowUp className="text-green-500 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Crecimiento Viral</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  K-Factor de 1.3 significa crecimiento orgánico sostenible sin aumentar inversión en marketing
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FaArrowUp className="text-blue-500 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Infraestructura Optimizada</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Reducción de 15% en tiempos de respuesta mejora experiencia y reduce costos operativos
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FaArrowUp className="text-yellow-500 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Producto Validado</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  42.5% de éxito en conseguir entrevistas valida el valor del producto para Bootcamps
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// === COMPONENTES AUXILIARES ===

interface MetricCardProps {
  title: string
  subtitle: string
  value: string
  trend: number
  icon: React.ReactNode
  iconColor: string
  inverseGood?: boolean // true si valores menores son mejores
  highlight?: boolean
}

function MetricCard({ title, subtitle, value, trend, icon, iconColor, inverseGood = false, highlight = false }: MetricCardProps) {
  const isPositive = inverseGood ? trend < 0 : trend > 0
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 ${
        highlight ? 'ring-2 ring-purple-500' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${iconColor}`}>
          {icon}
        </div>
        <div className={`flex items-center gap-1 font-bold ${
          isPositive ? 'text-green-600' : 'text-red-600'
        }`}>
          {isPositive ? <FaArrowUp /> : <FaArrowDown />}
          <span>{Math.abs(trend).toFixed(1)}%</span>
        </div>
      </div>
      <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
        {title}
      </h3>
      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
        {value}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {subtitle}
      </p>
    </motion.div>
  )
}

interface UsageBarProps {
  label: string
  percentage: number
  color: string
}

function UsageBar({ label, percentage, color }: UsageBarProps) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-gray-600 dark:text-gray-400">{label}</span>
        <span className="font-semibold text-gray-900 dark:text-white">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
        <div 
          className={`${color} h-2 rounded-full transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

interface PerformanceIndicatorProps {
  label: string
  current: number
  target: number
  unit: string
  lowerIsBetter?: boolean
}

function PerformanceIndicator({ label, current, target, unit, lowerIsBetter = false }: PerformanceIndicatorProps) {
  const percentage = lowerIsBetter 
    ? Math.min((target / current) * 100, 100)
    : Math.min((current / target) * 100, 100)
  
  const isGood = lowerIsBetter ? current <= target : current >= target
  
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            {current.toFixed(2)}{unit}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            / {target}{unit}
          </span>
        </div>
      </div>
      <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all ${
            isGood ? 'bg-green-500' : 'bg-yellow-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
