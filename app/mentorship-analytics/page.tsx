'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaGlobe, FaDollarSign, FaUsers, FaChartLine, FaLightbulb } from 'react-icons/fa'


interface CountryConversion {
  country: string
  totalUsers: number
  usersWithMentorship: number
  conversionRate: number
  averageSessionsPerUser: number
  totalRevenue: number
  averageRevenuePerUser: number
  recommendedPrice: number
  priceAdjustmentFactor: number
}

interface SoftSkillIssue {
  skill: string
  category: string
  severity: string
  mentions: number
  examples: string[]
}

interface MonthlyAnalysis {
  month: string
  year: number
  totalComments: number
  top3Issues: SoftSkillIssue[]
  insights: string[]
}

const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444']

export default function MentorshipAnalyticsPage() {
  const [conversionData, setConversionData] = useState<CountryConversion[]>([])
  const [softSkillsData, setSoftSkillsData] = useState<MonthlyAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30')

  useEffect(() => {
    fetchAnalytics()
  }, [period])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      // Fetch country conversion data
      const conversionResponse = await fetch(`/api/analytics/mentorship-conversion?period=${period}&minUsers=1`)
      const conversionJson = await conversionResponse.json()
      
      if (conversionJson.success) {
        setConversionData(conversionJson.data || [])
      }

      // Fetch soft skills analysis
      const now = new Date()
      const softSkillsResponse = await fetch(`/api/analytics/soft-skills?month=${now.getMonth()}&year=${now.getFullYear()}`)
      const softSkillsJson = await softSkillsResponse.json()
      
      if (softSkillsJson.success) {
        setSoftSkillsData(softSkillsJson.analysis)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Analizando datos de mentoría...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <FaChartLine className="text-indigo-600" />
            Analítica de Mentoría
          </h1>
          <p className="text-gray-600 text-lg">
            Conversión por país y análisis de soft skills
          </p>
        </motion.div>

        {/* Period Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 bg-white rounded-xl shadow-lg p-6"
        >
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Período de Análisis
          </label>
          <div className="flex gap-3">
            {['7', '30', '90', '180'].map((days) => (
              <button
                key={days}
                onClick={() => setPeriod(days)}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  period === days
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {days === '7' ? '7 días' : days === '30' ? '1 mes' : days === '90' ? '3 meses' : '6 meses'}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Conversion by Country */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FaGlobe className="text-indigo-600" />
              Conversión de Mentoría por País
            </h2>

            {conversionData.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No hay suficientes datos para mostrar conversión por país
              </div>
            ) : (
              <>
                {/* Chart removido: dependía de recharts */}
                <div className="mb-8 flex items-center justify-center min-h-[200px] text-gray-400">
                  <span>Gráfico no disponible</span>
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">País</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Usuarios</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Conversión</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Sesiones/User</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Precio Actual</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Precio Recomendado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {conversionData.map((row, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-900">{row.country}</td>
                          <td className="py-3 px-4 text-right text-gray-700">{row.totalUsers}</td>
                          <td className="py-3 px-4 text-right">
                            <span className={`inline-block px-3 py-1 rounded-full font-semibold ${
                              row.conversionRate > 50 ? 'bg-green-100 text-green-800' :
                              row.conversionRate > 30 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {row.conversionRate}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right text-gray-700">{row.averageSessionsPerUser}</td>
                          <td className="py-3 px-4 text-right text-gray-700">$29</td>
                          <td className="py-3 px-4 text-right">
                            <span className={`inline-block px-3 py-1 rounded-full font-semibold ${
                              row.recommendedPrice > 29 ? 'bg-purple-100 text-purple-800' :
                              row.recommendedPrice < 29 ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              ${row.recommendedPrice}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Soft Skills Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FaUsers className="text-indigo-600" />
              Análisis de Soft Skills - {softSkillsData?.month} {softSkillsData?.year}
            </h2>

            {!softSkillsData || softSkillsData.totalComments === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No hay comentarios de mentores este mes para analizar
              </div>
            ) : (
              <>
                {/* Summary */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border-2 border-indigo-200">
                    <div className="text-3xl font-bold text-indigo-600 mb-2">
                      {softSkillsData.totalComments}
                    </div>
                    <div className="text-gray-700 font-medium">Comentarios Analizados</div>
                  </div>
                  <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 border-2 border-red-200">
                    <div className="text-3xl font-bold text-red-600 mb-2">
                      {softSkillsData.top3Issues.length}
                    </div>
                    <div className="text-gray-700 font-medium">Problemas Principales</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {softSkillsData.insights.length}
                    </div>
                    <div className="text-gray-700 font-medium">Insights Generados</div>
                  </div>
                </div>

                {/* Top 3 Issues */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    🔴 Top 3 Problemas de Soft Skills
                  </h3>
                  <div className="space-y-4">
                    {softSkillsData.top3Issues.map((issue, index) => (
                      <div key={index} className="border-2 border-gray-200 rounded-xl p-6 hover:border-indigo-300 transition-all">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                              #{index + 1}
                            </div>
                            <div>
                              <h4 className="text-lg font-bold text-gray-900 capitalize">
                                {issue.skill.replace(/_/g, ' ')}
                              </h4>
                              <p className="text-sm text-gray-600">Categoría: {issue.category}</p>
                            </div>
                          </div>
                          <span className={`px-4 py-1 rounded-full font-semibold border-2 ${getSeverityColor(issue.severity)}`}>
                            {issue.severity.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-700">
                          <span className="font-semibold">{issue.mentions} menciones</span>
                          <span className="text-gray-400">•</span>
                          <span>{Math.round((issue.mentions / softSkillsData.totalComments) * 100)}% de comentarios</span>
                        </div>
                        {issue.examples.length > 0 && (
                          <div className="mt-4 bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-700 italic">"{issue.examples[0]}"</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Insights */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FaLightbulb className="text-yellow-500" />
                    Insights Accionables
                  </h3>
                  <div className="space-y-3">
                    {softSkillsData.insights.map((insight, index) => (
                      <div key={index} className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500 rounded-r-lg p-4">
                        <p className="text-gray-800 leading-relaxed">{insight}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-lg p-8 text-white"
        >
          <h3 className="text-2xl font-bold mb-4">Próximas Acciones</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <FaDollarSign />
                Ajuste de Precios
              </h4>
              <p className="text-indigo-100 text-sm">
                Implementar precios dinámicos según país y conversión
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <FaUsers />
                Talleres Grupales
              </h4>
              <p className="text-indigo-100 text-sm">
                Crear talleres sobre los top 3 problemas de soft skills
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <FaChartLine />
                Campañas de Marketing
              </h4>
              <p className="text-indigo-100 text-sm">
                Enfocar esfuerzos en países con baja conversión
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
