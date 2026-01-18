'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FaDollarSign, 
  FaUsers, 
  FaChartLine, 
  FaCalendar,
  FaBriefcase,
  FaGlobe,
  FaFilter,
  FaTrophy
} from 'react-icons/fa'


interface AnalyticsData {
  kpis: {
    totalRevenue: number
    totalCustomers: number
    completedSessions: number
    avgRevenuePerCustomer: number
    projectedMonthlyRevenue: number
  }
  revenueByType: {
    cvAnalysis: {
      count: number
      revenue: number
      percentage: number
    }
    mentorship: {
      count: number
      revenue: number
      percentage: number
    }
  }
  revenueByProfession: Array<{
    profession: string
    count: number
    revenue: number
    avgRevenuePerUser: number
    percentage: number
  }>
  revenueByCountry: Array<{
    country: string
    count: number
    revenue: number
  }>
  dailyRevenue: Array<{
    date: string
    revenue: number
  }>
  professions: string[]
  currentFilter: string
  totalRecords: number
}

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1']

export default function CEODashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedProfession, setSelectedProfession] = useState('all')

  useEffect(() => {
    fetchAnalytics()
  }, [selectedProfession])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const url = `/api/admin/analytics${selectedProfession !== 'all' ? `?profession=${selectedProfession}` : ''}`
      const response = await fetch(url)
      const result = await response.json()
      
      if (result.success) {
        setData(result)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es', { month: 'short', day: 'numeric' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500"></div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">No hay datos disponibles</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Hola, Admin! 👋
              </h1>
              <h2 className="text-3xl font-semibold text-purple-400 mb-2">
                📊 Dashboard CEO
              </h2>
              <p className="text-gray-300">Analytics & Revenue Insights</p>
            </div>

            {/* Profession Filter */}
            <div className="flex items-center gap-3 bg-slate-800 border-2 border-purple-500/50 rounded-xl p-3">
              <FaFilter className="text-purple-400" />
              <select
                value={selectedProfession}
                onChange={(e) => setSelectedProfession(e.target.value)}
                className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="all">Todas las Profesiones</option>
                {data.professions.map((prof) => (
                  <option key={prof} value={prof}>
                    {prof}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedProfession !== 'all' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 inline-block px-4 py-2 bg-purple-500/20 border border-purple-500/50 rounded-lg"
            >
              <span className="text-purple-300">
                📌 Filtrando por: <span className="font-bold text-white">{selectedProfession}</span>
              </span>
              <button
                onClick={() => setSelectedProfession('all')}
                className="ml-3 text-purple-400 hover:text-purple-300"
              >
                ✕
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* KPIs Grid */}
                {/* Info box: KPIs explanation */}
                <div className="mb-4 p-4 bg-slate-900/30 border-l-4 border-slate-400 rounded">
                  <strong>¿Qué significa cada KPI?</strong><br />
                  <ul className="list-disc ml-6">
                    <li><b>Ingresos Totales:</b> Todo el dinero generado hasta ahora.</li>
                    <li><b>Clientes Únicos:</b> Número de personas que han comprado.</li>
                    <li><b>Promedio por Cliente:</b> Gasto promedio por cliente.</li>
                    <li><b>Proyección Mensual:</b> Estimación de ingresos para el mes actual.</li>
                  </ul>
                </div>
                {/* Info box: Revenue by Service Type explanation */}
                <div className="mb-4 p-4 bg-purple-900/30 border-l-4 border-purple-400 rounded">
                  <strong>¿Qué significa "Ingresos por Tipo de Servicio"?</strong><br />
                  Muestra cuánto dinero y cuántas ventas provienen de cada servicio (CV Analysis vs. Mentorship). Ayuda a identificar cuál servicio es más popular y rentable.
                </div>
                {/* Info box: Daily Revenue explanation */}
                <div className="mb-4 p-4 bg-green-900/30 border-l-4 border-green-400 rounded">
                  <strong>¿Qué significa "Ingresos Diarios"?</strong><br />
                  Muestra cuánto dinero se gana cada día (últimos 30 días). Permite detectar tendencias, estacionalidad o el impacto de campañas.
                </div>
                {/* Info box: Revenue by Profession explanation */}
                <div className="mb-4 p-4 bg-yellow-900/30 border-l-4 border-yellow-400 rounded">
                  <strong>¿Qué significa "Ingresos por Profesión"?</strong><br />
                  Muestra las profesiones de los clientes que más ingresos generan. Ayuda a identificar los segmentos más valiosos y enfocar el marketing.
                </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {/* Total Revenue */}
          <div className="bg-slate-800 border-2 border-green-500/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <FaDollarSign className="text-3xl text-green-400" />
              <span className="text-green-400 text-sm font-semibold">Total</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {formatCurrency(data.kpis.totalRevenue)}
            </div>
            <div className="text-gray-400 text-sm">Ingresos Totales</div>
          </div>

          {/* Total Customers */}
          <div className="bg-slate-800 border-2 border-blue-500/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <FaUsers className="text-3xl text-blue-400" />
              <span className="text-blue-400 text-sm font-semibold">Clientes</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {data.kpis.totalCustomers}
            </div>
            <div className="text-gray-400 text-sm">Clientes Únicos</div>
          </div>

          {/* Avg Revenue Per Customer */}
          <div className="bg-slate-800 border-2 border-purple-500/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <FaChartLine className="text-3xl text-purple-400" />
              <span className="text-purple-400 text-sm font-semibold">Promedio</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {formatCurrency(data.kpis.avgRevenuePerCustomer)}
            </div>
            <div className="text-gray-400 text-sm">Por Cliente</div>
          </div>

          {/* Projected Monthly Revenue */}
          <div className="bg-slate-800 border-2 border-yellow-500/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <FaCalendar className="text-3xl text-yellow-400" />
              <span className="text-yellow-400 text-sm font-semibold">Proyección</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {formatCurrency(data.kpis.projectedMonthlyRevenue)}
            </div>
            <div className="text-gray-400 text-sm">Mensual</div>
          </div>
        </motion.div>

        {/* Charts Row 1: Revenue by Type & Daily Revenue */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue by Type - Pie Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-800 border-2 border-slate-700 rounded-xl p-6"
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FaBriefcase className="text-purple-400" />
              Ingresos por Tipo de Servicio
            </h3>

            <div className="text-gray-400 text-center py-12">[Gráfico removido]</div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {formatCurrency(data.revenueByType.cvAnalysis.revenue)}
                </div>
                <div className="text-gray-400 text-sm">CV Analysis ({data.revenueByType.cvAnalysis.count})</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {formatCurrency(data.revenueByType.mentorship.revenue)}
                </div>
                <div className="text-gray-400 text-sm">Mentorship ({data.revenueByType.mentorship.count})</div>
              </div>
            </div>
          </motion.div>

          {/* Daily Revenue - Line Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-800 border-2 border-slate-700 rounded-xl p-6"
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FaChartLine className="text-green-400" />
              Ingresos Diarios (Últimos 30 días)
            </h3>

            <div className="text-gray-400 text-center py-12">[Gráfico removido]</div>
          </motion.div>
        </div>

        {/* Charts Row 2: Revenue by Profession - THE KEY FEATURE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-2 border-purple-500/50 rounded-xl p-6 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <FaTrophy className="text-4xl text-yellow-400" />
            <div>
              <h3 className="text-2xl font-bold text-white">
                Ingresos por Profesión
              </h3>
              <p className="text-gray-300 text-sm">
                Identifica el nicho más rentable
              </p>
            </div>
          </div>


          <div className="text-gray-400 text-center py-12">[Gráfico removido]</div>

          {/* Top 3 Professions Table */}
          <div className="mt-6 grid md:grid-cols-3 gap-4">
            {data.revenueByProfession.slice(0, 3).map((item, index) => (
              <div 
                key={item.profession}
                className={`p-4 rounded-xl ${
                  index === 0 ? 'bg-yellow-500/20 border-2 border-yellow-500/50' :
                  index === 1 ? 'bg-gray-400/20 border-2 border-gray-400/50' :
                  'bg-orange-500/20 border-2 border-orange-500/50'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {index === 0 && <span className="text-2xl">🥇</span>}
                  {index === 1 && <span className="text-2xl">🥈</span>}
                  {index === 2 && <span className="text-2xl">🥉</span>}
                  <span className="text-white font-bold">{item.profession}</span>
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {formatCurrency(item.revenue)}
                </div>
                <div className="text-gray-300 text-sm">
                  {item.count} clientes • {formatCurrency(item.avgRevenuePerUser)} promedio
                </div>
                <div className="text-gray-400 text-xs mt-2">
                  {item.percentage.toFixed(1)}% del total
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Revenue by Country */}
                {/* Info box: Revenue by Country explanation */}
                <div className="mb-4 p-4 bg-blue-900/30 border-l-4 border-blue-400 rounded">
                  <strong>¿Qué significa "Ingresos por País"?</strong><br />
                  Muestra los países que más ingresos y clientes aportan. Útil para decidir dónde enfocar esfuerzos y posibles expansiones.
                </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-slate-800 border-2 border-slate-700 rounded-xl p-6"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FaGlobe className="text-blue-400" />
            Ingresos por País
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.revenueByCountry.slice(0, 6).map((item, index) => (
              <div key={item.country} className="bg-slate-700 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-white font-semibold">{item.country}</span>
                  <span className="text-gray-400 text-sm">{item.count} clientes</span>
                </div>
                <div className="text-2xl font-bold text-green-400">
                  {formatCurrency(item.revenue)}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
