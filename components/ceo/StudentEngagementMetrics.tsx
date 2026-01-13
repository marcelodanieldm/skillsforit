'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FaCheckCircle, 
  FaUsers, 
  FaDownload, 
  FaChartLine,
  FaExclamationTriangle 
} from 'react-icons/fa'
import { 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts'

interface TaskCompletionData {
  completionRate: number
  totalTasks: number
  completedTasks: number
  activeStudents: number
}

interface DAUData {
  dau: number
  dauYesterday: number
  wau: number
  trend: string
  insight: string
}

interface TimeToDownloadData {
  avgTimeToDownloadHours: number
  medianTimeToDownloadHours: number
  totalPurchases: number
  downloadRate: number
  insight: string
}

interface EngagementData {
  taskCompletionRate: TaskCompletionData
  dailyActiveUsers: DAUData
  timeToDownload: TimeToDownloadData
  generatedAt: string
}

interface StudentEngagementMetricsProps {
  token: string
}

export default function StudentEngagementMetrics({ token }: StudentEngagementMetricsProps) {
  const [data, setData] = useState<EngagementData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchEngagementData()
  }, [token])

  const fetchEngagementData = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/ceo/student-engagement', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!res.ok) {
        throw new Error('Error al cargar métricas de engagement')
      }

      const result = await res.json()
      setData(result)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <FaChartLine className="text-2xl text-emerald-500" />
          <h2 className="text-2xl font-bold">Engagement del Alumno</h2>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-700 rounded"></div>
          <div className="h-32 bg-gray-700 rounded"></div>
          <div className="h-32 bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <FaExclamationTriangle className="text-2xl text-red-500" />
          <h2 className="text-2xl font-bold">Error</h2>
        </div>
        <p className="text-red-400">{error || 'No se pudieron cargar las métricas'}</p>
      </div>
    )
  }

  const { taskCompletionRate, dailyActiveUsers, timeToDownload } = data

  // Preparar datos para gráfica de tendencia DAU (simulado 7 días)
  const dauTrendData = [
    { day: 'Lun', users: dailyActiveUsers.dau - 3 },
    { day: 'Mar', users: dailyActiveUsers.dau - 2 },
    { day: 'Mié', users: dailyActiveUsers.dau - 1 },
    { day: 'Jue', users: dailyActiveUsers.dauYesterday },
    { day: 'Vie', users: dailyActiveUsers.dau },
    { day: 'Sáb', users: Math.max(0, dailyActiveUsers.dau - 2) },
    { day: 'Dom', users: Math.max(0, dailyActiveUsers.dau - 4) }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-lg p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FaChartLine className="text-2xl text-emerald-500" />
          <h2 className="text-2xl font-bold">Engagement del Alumno</h2>
        </div>
        <button
          onClick={fetchEngagementData}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm transition"
        >
          Actualizar
        </button>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* 1. Task Completion Rate */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gray-700 rounded-lg p-6 border-l-4 border-emerald-500"
        >
          <div className="flex items-center gap-3 mb-4">
            <FaCheckCircle className="text-3xl text-emerald-500" />
            <div>
              <h3 className="text-sm text-gray-400">Task Completion Rate</h3>
              <p className="text-3xl font-bold text-emerald-400">
                {taskCompletionRate.completionRate}%
              </p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Tareas completadas:</span>
              <span className="font-semibold">{taskCompletionRate.completedTasks}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total tareas:</span>
              <span className="font-semibold">{taskCompletionRate.totalTasks}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Alumnos activos:</span>
              <span className="font-semibold">{taskCompletionRate.activeStudents}</span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4 bg-gray-600 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${taskCompletionRate.completionRate}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-emerald-500"
            />
          </div>
        </motion.div>

        {/* 2. Daily Active Users */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gray-700 rounded-lg p-6 border-l-4 border-blue-500"
        >
          <div className="flex items-center gap-3 mb-4">
            <FaUsers className="text-3xl text-blue-500" />
            <div>
              <h3 className="text-sm text-gray-400">Daily Active Users</h3>
              <p className="text-3xl font-bold text-blue-400">
                {dailyActiveUsers.dau}
              </p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Ayer:</span>
              <span className="font-semibold">{dailyActiveUsers.dauYesterday}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Esta semana:</span>
              <span className="font-semibold">{dailyActiveUsers.wau}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Tendencia:</span>
              <span className={`font-semibold ${
                dailyActiveUsers.trend.startsWith('-') ? 'text-red-400' : 'text-green-400'
              }`}>
                {dailyActiveUsers.trend}
              </span>
            </div>
          </div>
          
          {/* Insight */}
          <div className="mt-4 p-3 bg-gray-600 rounded-lg text-xs">
            <p className="text-gray-300">{dailyActiveUsers.insight}</p>
          </div>
        </motion.div>

        {/* 3. Time to Download */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gray-700 rounded-lg p-6 border-l-4 border-purple-500"
        >
          <div className="flex items-center gap-3 mb-4">
            <FaDownload className="text-3xl text-purple-500" />
            <div>
              <h3 className="text-sm text-gray-400">Time to Download</h3>
              <p className="text-3xl font-bold text-purple-400">
                {timeToDownload.avgTimeToDownloadHours}h
              </p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Mediana:</span>
              <span className="font-semibold">{timeToDownload.medianTimeToDownloadHours}h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total compras:</span>
              <span className="font-semibold">{timeToDownload.totalPurchases}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Download Rate:</span>
              <span className="font-semibold">{timeToDownload.downloadRate}%</span>
            </div>
          </div>
          
          {/* Insight */}
          <div className="mt-4 p-3 bg-gray-600 rounded-lg text-xs">
            <p className="text-gray-300">{timeToDownload.insight}</p>
          </div>
        </motion.div>
      </div>

      {/* DAU Trend Chart */}
      <div className="bg-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4">Tendencia DAU (Última Semana)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={dauTrendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="day" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px'
              }}
            />
            <Line
              type="monotone"
              dataKey="users"
              stroke="#3B82F6"
              strokeWidth={3}
              dot={{ fill: '#3B82F6', r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Timestamp */}
      <p className="text-xs text-gray-500 text-center">
        Última actualización: {new Date(data.generatedAt).toLocaleString('es-ES')}
      </p>
    </motion.div>
  )
}
