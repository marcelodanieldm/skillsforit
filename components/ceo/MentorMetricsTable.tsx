'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, TrendingUp, Star, DollarSign, RefreshCw, Award } from 'lucide-react'

interface MentorMetric {
  mentorId: string
  mentorName: string
  mentorEmail: string
  totalSessions: number
  completedSessions: number
  avgRating: number
  retentionRate: number
  totalEarnings: number
  pendingPayout: number
  activeStudents: number
  repeatStudents: number
}

interface Summary {
  totalMentors: number
  avgRetentionRate: number
  avgRating: number
  totalPendingPayout: number
  totalEarningsThisMonth: number
}

export default function MentorMetricsTable() {
  const [mentors, setMentors] = useState<MentorMetric[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchMetrics()
  }, [])

  const fetchMetrics = async () => {
    setIsLoading(true)
    setError('')
    try {
      const res = await fetch('/api/ceo/mentor-metrics')
      const data = await res.json()

      if (data.success) {
        setMentors(data.data.mentors)
        setSummary(data.data.summary)
      } else {
        setError(data.error)
      }
    } catch (err: any) {
      setError('Error al cargar métricas')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-400'
    if (rating >= 3.5) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getRetentionColor = (rate: number) => {
    if (rate >= 70) return 'text-green-400'
    if (rate >= 50) return 'text-yellow-400'
    return 'text-red-400'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
        <p className="text-red-400">{error}</p>
        <button
          onClick={fetchMetrics}
          className="mt-4 bg-red-500/20 hover:bg-red-500/30 px-4 py-2 rounded-lg text-sm transition-colors"
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 border border-purple-500/30 rounded-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Total Mentores</p>
                <p className="text-3xl font-bold text-purple-400">{summary.totalMentors}</p>
              </div>
              <Users className="w-8 h-8 text-purple-400/50" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-900 border border-green-500/30 rounded-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Retention Promedio</p>
                <p className="text-3xl font-bold text-green-400">{summary.avgRetentionRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400/50" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-900 border border-yellow-500/30 rounded-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Rating Promedio</p>
                <p className="text-3xl font-bold text-yellow-400">{summary.avgRating.toFixed(1)}</p>
              </div>
              <Star className="w-8 h-8 text-yellow-400/50" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-900 border border-emerald-500/30 rounded-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Payout Pendiente</p>
                <p className="text-3xl font-bold text-emerald-400">
                  ${summary.totalPendingPayout.toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-emerald-400/50" />
            </div>
          </motion.div>
        </div>
      )}

      {/* Table Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Award className="w-6 h-6 text-purple-400" />
          Rendimiento por Mentor
        </h3>
        <button
          onClick={fetchMetrics}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </button>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/50 border-b border-slate-700">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Mentor</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-300">Sesiones</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-300">Alumnos</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-300">Retention Rate</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-300">Rating</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">Earnings Total</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">Payout Pendiente</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {mentors.map((mentor, index) => (
                <motion.tr
                  key={mentor.mentorId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-slate-800/50 transition-colors"
                >
                  {/* Mentor Name */}
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-white">{mentor.mentorName}</p>
                      <p className="text-sm text-slate-400">{mentor.mentorEmail}</p>
                    </div>
                  </td>

                  {/* Sessions */}
                  <td className="px-6 py-4 text-center">
                    <div>
                      <p className="font-medium text-white">{mentor.completedSessions}</p>
                      <p className="text-xs text-slate-500">de {mentor.totalSessions}</p>
                    </div>
                  </td>

                  {/* Students */}
                  <td className="px-6 py-4 text-center">
                    <div>
                      <p className="font-medium text-white">{mentor.activeStudents}</p>
                      <p className="text-xs text-slate-500">{mentor.repeatStudents} repiten</p>
                    </div>
                  </td>

                  {/* Retention Rate */}
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className={`text-lg font-bold ${getRetentionColor(mentor.retentionRate)}`}>
                        {mentor.retentionRate}%
                      </span>
                      {mentor.retentionRate >= 70 && (
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                          Top
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Rating */}
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Star className={`w-4 h-4 fill-current ${getRatingColor(mentor.avgRating)}`} />
                      <span className={`font-bold ${getRatingColor(mentor.avgRating)}`}>
                        {mentor.avgRating.toFixed(1)}
                      </span>
                    </div>
                  </td>

                  {/* Total Earnings */}
                  <td className="px-6 py-4 text-right">
                    <p className="font-medium text-white">
                      ${mentor.totalEarnings.toLocaleString()}
                    </p>
                  </td>

                  {/* Pending Payout */}
                  <td className="px-6 py-4 text-right">
                    <div>
                      <p className="font-bold text-emerald-400">
                        ${mentor.pendingPayout.toLocaleString()}
                      </p>
                      {mentor.pendingPayout >= 50 && (
                        <p className="text-xs text-slate-500">Listo para pago</p>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {mentors.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No hay mentores registrados</p>
          </div>
        )}
      </div>
    </div>
  )
}
