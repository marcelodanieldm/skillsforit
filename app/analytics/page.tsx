'use client'

import { useEffect, useState } from 'react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { FunnelMetrics, UserSegment } from '@/lib/analytics'

export default function AnalyticsDashboard() {
  const [funnelData, setFunnelData] = useState<FunnelMetrics[]>([])
  const [segmentConversion, setSegmentConversion] = useState<any[]>([])
  const [segmentDistribution, setSegmentDistribution] = useState<any>({})
  const [totalUsers, setTotalUsers] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      // Fetch events metrics
      const eventsRes = await fetch('/api/events')
      const eventsData = await eventsRes.json()
      
      setFunnelData(eventsData.funnelMetrics || [])
      setSegmentConversion(eventsData.conversionBySegment || [])

      // Fetch users data
      const usersRes = await fetch('/api/users')
      const usersData = await usersRes.json()
      
      setSegmentDistribution(usersData.segmentDistribution || {})
      setTotalUsers(usersData.totalUsers || 0)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const segmentColors = {
    Junior: '#3b82f6',
    Transition: '#8b5cf6',
    Leadership: '#ec4899',
    Uncategorized: '#6b7280'
  }

  const segmentEmojis = {
    Junior: '👶',
    Transition: '🔄',
    Leadership: '👔',
    Uncategorized: '❓'
  }

  const distributionData = Object.entries(segmentDistribution).map(([segment, count]) => ({
    name: `${segmentEmojis[segment as UserSegment]} ${segment}`,
    value: count as number,
    percentage: totalUsers > 0 ? ((count as number / totalUsers) * 100).toFixed(1) : '0'
  }))

  const funnelChartData = funnelData.map(stage => ({
    stage: stage.stage.charAt(0).toUpperCase() + stage.stage.slice(1),
    visitors: stage.visitors,
    conversions: stage.conversions,
    conversionRate: stage.conversionRate.toFixed(1),
    dropOffRate: stage.dropOffRate.toFixed(1)
  }))

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            📊 Analytics Dashboard - Embudo de Conversión
          </h1>
          <p className="text-gray-600">
            Sprint 5: Event tracking, user segmentation y métricas de conversión
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Usuarios</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{totalUsers}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>

          {funnelData[0] && (
            <>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Visitors Landing</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{funnelData[0].visitors}</p>
                  </div>
                  <div className="bg-purple-100 rounded-full p-3">
                    <span className="text-2xl">🏠</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Checkouts Iniciados</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {funnelData[2]?.visitors || 0}
                    </p>
                  </div>
                  <div className="bg-green-100 rounded-full p-3">
                    <span className="text-2xl">🛒</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Tasa Conversión</p>
                    <p className="text-3xl font-bold text-green-600 mt-1">
                      {funnelData[4]?.visitors && funnelData[0]?.visitors
                        ? ((funnelData[4].visitors / funnelData[0].visitors) * 100).toFixed(1)
                        : '0'}%
                    </p>
                  </div>
                  <div className="bg-green-100 rounded-full p-3">
                    <span className="text-2xl">✅</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Funnel Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            🔄 Embudo de Conversión
          </h2>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="stage" />
                <YAxis />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-white p-4 rounded-lg shadow-xl border border-gray-200">
                          <p className="font-bold text-gray-900 mb-2">{data.stage}</p>
                          <p className="text-sm text-gray-600">Visitors: <span className="font-semibold">{data.visitors}</span></p>
                          <p className="text-sm text-gray-600">Conversions: <span className="font-semibold">{data.conversions}</span></p>
                          <p className="text-sm text-green-600">Conv. Rate: <span className="font-semibold">{data.conversionRate}%</span></p>
                          <p className="text-sm text-red-600">Drop-off: <span className="font-semibold">{data.dropOffRate}%</span></p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Legend />
                <Bar dataKey="visitors" fill="#8b5cf6" name="Visitors" />
                <Bar dataKey="conversions" fill="#10b981" name="Conversions" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Drop-off highlights */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {funnelChartData.map((stage, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-semibold text-gray-700">{stage.stage}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-gray-600">Drop-off:</span>
                  <span className={`text-sm font-bold ${parseFloat(stage.dropOffRate) > 50 ? 'text-red-600' : 'text-yellow-600'}`}>
                    {stage.dropOffRate}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Segment Distribution & Conversion */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Segment Distribution */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              👥 Distribución por Segmento
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {distributionData.map((entry, index) => {
                      const segment = entry.name.split(' ')[1] as UserSegment
                      return <Cell key={`cell-${index}`} fill={segmentColors[segment]} />
                    })}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 space-y-2">
              {distributionData.map((entry, index) => {
                const segment = entry.name.split(' ')[1] as UserSegment
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: segmentColors[segment] }}
                      ></div>
                      <span className="text-sm text-gray-700">{entry.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {entry.value} ({entry.percentage}%)
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Conversion by Segment */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              📈 Conversión por Segmento
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={segmentConversion}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="segment" />
                  <YAxis />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-white p-4 rounded-lg shadow-xl border border-gray-200">
                            <p className="font-bold text-gray-900 mb-2">
                              {segmentEmojis[data.segment as UserSegment]} {data.segment}
                            </p>
                            <p className="text-sm text-gray-600">Total: <span className="font-semibold">{data.total}</span></p>
                            <p className="text-sm text-gray-600">Converted: <span className="font-semibold">{data.converted}</span></p>
                            <p className="text-sm text-green-600">Rate: <span className="font-semibold">{data.conversionRate.toFixed(1)}%</span></p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Legend />
                  <Bar dataKey="total" fill="#6b7280" name="Total Usuarios" />
                  <Bar dataKey="converted" fill="#10b981" name="Convertidos" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 space-y-3">
              {segmentConversion.map((segment, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">
                      {segmentEmojis[segment.segment as UserSegment]} {segment.segment}
                    </span>
                    <span className="text-lg font-bold text-green-600">
                      {segment.conversionRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${segment.conversionRate}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {segment.converted} de {segment.total} usuarios
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Insights & Recommendations */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            💡 Insights & Recomendaciones
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">👶</span>
                <h3 className="font-bold text-blue-900">Junior Segment</h3>
              </div>
              <p className="text-sm text-blue-800">
                Usuarios en etapa inicial de carrera. Optimizar mensajes hacia mejora de CV y preparación para entrevistas.
              </p>
            </div>

            <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🔄</span>
                <h3 className="font-bold text-purple-900">Transition Segment</h3>
              </div>
              <p className="text-sm text-purple-800">
                Profesionales en transición. Mayor potencial de conversión con mentoría personalizada y career coaching.
              </p>
            </div>

            <div className="bg-pink-50 border-2 border-pink-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">👔</span>
                <h3 className="font-bold text-pink-900">Leadership Segment</h3>
              </div>
              <p className="text-sm text-pink-800">
                Líderes y seniors. Enfocar en mentoría ejecutiva, networking y posiciones de alto nivel.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
