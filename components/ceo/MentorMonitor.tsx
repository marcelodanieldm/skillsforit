'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaUserTie, FaStar, FaChartLine, FaCheckCircle, FaClock } from 'react-icons/fa'

interface Mentor {
  id: string
  name: string
  email: string
  specialty: string
  totalSessions: number
  completedSessions: number
  averageRating: number
  npsScore: number
  renewalRate: number
  totalRevenue: number
  active: boolean
}

export function MentorMonitor() {
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMentors()
  }, [])

  async function fetchMentors() {
    setLoading(true)
    try {
      const response = await fetch('/api/ceo/mentors')
      const result = await response.json()
      
      if (result.success) {
        setMentors(result.mentors)
      }
    } catch (error) {
      console.error('Error fetching mentors:', error)
    } finally {
      setLoading(false)
    }
  }

  function getNPSColor(nps: number) {
    if (nps >= 50) return 'text-green-400'
    if (nps >= 0) return 'text-yellow-400'
    return 'text-red-400'
  }

  function getRatingStars(rating: number) {
    return Array.from({ length: 5 }, (_, i) => (
      <FaStar
        key={i}
        className={i < Math.floor(rating) ? 'text-yellow-400' : 'text-slate-600'}
      />
    ))
  }

  if (loading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border-2 border-blue-500/50">
        <div className="flex items-center justify-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="text-slate-300">Cargando mentores...</p>
        </div>
      </div>
    )
  }

  const activeMentors = mentors.filter(m => m.active)
  const avgNPS = mentors.length > 0
    ? mentors.reduce((sum, m) => sum + m.npsScore, 0) / mentors.length
    : 0
  const avgRenewal = mentors.length > 0
    ? mentors.reduce((sum, m) => sum + m.renewalRate, 0) / mentors.length
    : 0

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border-2 border-blue-500/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <FaUserTie className="text-blue-400" />
            Monitor de Mentores
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            {activeMentors.length} mentores activos • NPS promedio: {avgNPS.toFixed(0)}
          </p>
        </div>

        <div className="flex gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400">
              {avgRenewal.toFixed(0)}%
            </p>
            <p className="text-xs text-slate-400">Renovación</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400">
              {mentors.reduce((sum, m) => sum + m.completedSessions, 0)}
            </p>
            <p className="text-xs text-slate-400">Sesiones</p>
          </div>
        </div>
      </div>

      {/* Mentors List */}
      <div className="space-y-3">
        {mentors.length === 0 ? (
          <div className="text-center py-12">
            <FaUserTie className="text-6xl text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No hay mentores registrados</p>
          </div>
        ) : (
          mentors.map((mentor, index) => (
            <motion.div
              key={mentor.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-slate-700/50 rounded-xl p-4 border-2 ${
                mentor.active ? 'border-blue-500/30' : 'border-slate-600/30 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <FaUserTie className="text-xl text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold">{mentor.name}</h3>
                      <p className="text-slate-400 text-sm">{mentor.specialty}</p>
                    </div>
                    {!mentor.active && (
                      <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full">
                        Inactivo
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {/* Rating */}
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Calificación</p>
                      <div className="flex items-center gap-1">
                        {getRatingStars(mentor.averageRating)}
                      </div>
                      <p className="text-sm text-white font-semibold mt-1">
                        {mentor.averageRating.toFixed(1)}
                      </p>
                    </div>

                    {/* NPS */}
                    <div>
                      <p className="text-xs text-slate-400 mb-1">NPS</p>
                      <p className={`text-2xl font-bold ${getNPSColor(mentor.npsScore)}`}>
                        {mentor.npsScore.toFixed(0)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {mentor.npsScore >= 50
                          ? 'Excelente'
                          : mentor.npsScore >= 0
                          ? 'Bueno'
                          : 'Mejorar'}
                      </p>
                    </div>

                    {/* Renewal Rate */}
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Renovación</p>
                      <p className="text-2xl font-bold text-green-400">
                        {mentor.renewalRate.toFixed(0)}%
                      </p>
                      <p className="text-xs text-slate-500">
                        {mentor.completedSessions} sesiones
                      </p>
                    </div>

                    {/* Revenue */}
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Revenue</p>
                      <p className="text-2xl font-bold text-purple-400">
                        ${mentor.totalRevenue.toFixed(0)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {mentor.totalSessions} totales
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Summary Insights */}
      {mentors.length > 0 && (
        <div className="mt-6 bg-slate-700/30 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
            <FaChartLine className="text-blue-400" />
            Insights del Equipo
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-slate-400">
                <span className="text-white font-semibold">Top Mentor:</span>
                {' '}
                {[...mentors].sort((a, b) => b.npsScore - a.npsScore)[0]?.name || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-slate-400">
                <span className="text-white font-semibold">NPS Promedio:</span>
                {' '}
                <span className={getNPSColor(avgNPS)}>
                  {avgNPS.toFixed(0)}
                  {avgNPS >= 50 ? ' ✓ Excelente' : avgNPS >= 0 ? ' ↗ Bueno' : ' ⚠ Mejorar'}
                </span>
              </p>
            </div>
            <div>
              <p className="text-slate-400">
                <span className="text-white font-semibold">Renovación Promedio:</span>
                {' '}
                <span className={avgRenewal >= 70 ? 'text-green-400' : 'text-yellow-400'}>
                  {avgRenewal.toFixed(0)}%
                  {avgRenewal >= 70 ? ' ✓ Fuerte' : ' → Optimizar'}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
