'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Mail,
  Tag,
  Calendar,
  BarChart3,
  RefreshCw,
  AlertCircle
} from 'lucide-react'
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
  PieChart,
  Pie,
  Cell


interface RecoveryAnalytics {
  // Carritos
  total_abandoned: number
  total_recovered: number
  total_pending: number
  total_expired: number
  total_abandoned_revenue: number
  total_recovered_revenue: number
  avg_cart_value: number
  recovery_rate_percent: number
  abandon_rate_percent: number
  
  // Emails
  total_emails_sent: number
  total_opened: number
  total_clicked: number
  total_converted: number
  emails_hour_1: number
  emails_hour_24: number
  open_rate_percent: number
  click_rate_percent: number
  conversion_rate_percent: number
  
  // Cupones
  total_coupons_created: number
  total_coupons_used: number
  total_coupons_expired: number
  avg_discount_value: number
  coupon_usage_percent: number
}

interface TimelineItem {
  cart_id: string
  user_email: string
  total_amount: number
  cart_status: string
  abandoned_at: string
  recovered_at: string | null
  hours_to_recovery: number | null
  emails_sent: number
  last_email_type: string | null
  coupon_used: string | null
  discount_applied: number | null
  recovery_method: string | null
}

export function CartRecoveryWidget() {
  const [analytics, setAnalytics] = useState<RecoveryAnalytics | null>(null)
  const [timeline, setTimeline] = useState<TimelineItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/ceo/cart-recovery-analytics')
      const data = await response.json()

      if (data.success) {
        setAnalytics(data.analytics)
        setTimeline(data.timeline || [])
      } else {
        setError('Error al cargar métricas de recuperación')
      }
    } catch (err) {
      console.error('Error fetching cart recovery analytics:', err)
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-700 rounded w-1/2 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-slate-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !analytics) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-red-500/30">
        <div className="flex items-center gap-3 text-red-400">
          <AlertCircle className="w-6 h-6" />
          <p>{error || 'No se pudieron cargar las métricas'}</p>
        </div>
      </div>
    )
  }

  // Datos para gráficos
  const statusData = [
    { name: 'Recuperados', value: analytics.total_recovered, color: '#10b981' },
    { name: 'Pendientes', value: analytics.total_pending, color: '#f59e0b' },
    { name: 'Expirados', value: analytics.total_expired, color: '#6b7280' }
  ]

  const emailPerformanceData = [
    { name: 'Enviados', value: analytics.total_emails_sent, fill: '#6366f1' },
    { name: 'Abiertos', value: analytics.total_opened, fill: '#8b5cf6' },
    { name: 'Clicks', value: analytics.total_clicked, fill: '#a78bfa' },
    { name: 'Convertidos', value: analytics.total_converted, fill: '#10b981' }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShoppingCart className="w-7 h-7 text-purple-400" />
            Recuperación de Carritos Abandonados
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Sistema automatizado de emails + cupones dinámicos
          </p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg transition-colors"
          title="Actualizar métricas"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Recovery Rate */}
        <div className="bg-gradient-to-br from-emerald-900/50 to-emerald-800/30 rounded-xl p-5 border border-emerald-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-emerald-300 text-sm font-semibold">Recovery Rate</span>
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-bold text-white mb-1">
            {analytics.recovery_rate_percent.toFixed(1)}%
          </p>
          <p className="text-xs text-emerald-200">
            Meta: 15-20% | {analytics.total_recovered} de {analytics.total_abandoned} carritos
          </p>
          {analytics.recovery_rate_percent >= 15 ? (
            <div className="mt-2 text-xs text-emerald-300 font-semibold">
              ✓ Dentro del objetivo
            </div>
          ) : (
            <div className="mt-2 text-xs text-orange-300 font-semibold">
              ⚠️ Bajo el objetivo
            </div>
          )}
        </div>

        {/* Abandon Rate */}
        <div className="bg-gradient-to-br from-orange-900/50 to-orange-800/30 rounded-xl p-5 border border-orange-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-orange-300 text-sm font-semibold">Abandon Rate</span>
            <TrendingDown className="w-5 h-5 text-orange-400" />
          </div>
          <p className="text-3xl font-bold text-white mb-1">
            {analytics.abandon_rate_percent.toFixed(1)}%
          </p>
          <p className="text-xs text-orange-200">
            Meta: {'<'} 60% | {analytics.total_abandoned} carritos abandonados
          </p>
          {analytics.abandon_rate_percent < 60 ? (
            <div className="mt-2 text-xs text-emerald-300 font-semibold">
              ✓ Checkout optimizado
            </div>
          ) : (
            <div className="mt-2 text-xs text-red-300 font-semibold">
              ⚠️ Revisar fricción en checkout
            </div>
          )}
        </div>

        {/* Coupon Usage */}
        <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 rounded-xl p-5 border border-purple-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-purple-300 text-sm font-semibold">Coupon Usage</span>
            <Tag className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-3xl font-bold text-white mb-1">
            {analytics.coupon_usage_percent.toFixed(1)}%
          </p>
          <p className="text-xs text-purple-200">
            Meta: {'>'} 10% | {analytics.total_coupons_used} de {analytics.total_coupons_created} cupones
          </p>
          {analytics.coupon_usage_percent > 10 ? (
            <div className="mt-2 text-xs text-emerald-300 font-semibold">
              ✓ Descuento efectivo
            </div>
          ) : (
            <div className="mt-2 text-xs text-orange-300 font-semibold">
              ⚠️ Revisar incentivo
            </div>
          )}
        </div>
      </div>

      {/* Revenue Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-slate-400" />
            <span className="text-sm text-slate-400">Revenue Abandonado</span>
          </div>
          <p className="text-2xl font-bold text-white">
            ${analytics.total_abandoned_revenue.toFixed(0)}
          </p>
        </div>

        <div className="bg-slate-900/50 rounded-xl p-4 border border-emerald-700">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <span className="text-sm text-emerald-400">Revenue Recuperado</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400">
            ${analytics.total_recovered_revenue.toFixed(0)}
          </p>
          <p className="text-xs text-emerald-300 mt-1">
            "Ventas gratis" que se hubieran perdido
          </p>
        </div>

        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingCart className="w-5 h-5 text-slate-400" />
            <span className="text-sm text-slate-400">Valor Promedio</span>
          </div>
          <p className="text-2xl font-bold text-white">
            ${analytics.avg_cart_value.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Status Distribution */}
        <div className="bg-slate-900/30 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Distribución de Carritos
          </h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #475569',
                  borderRadius: '8px'
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Email Performance Funnel */}
        <div className="bg-slate-900/30 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Funnel de Emails
          </h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={emailPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #475569',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Email Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-slate-900/50 rounded-lg p-3 text-center">
          <p className="text-xs text-slate-400 mb-1">Open Rate</p>
          <p className="text-xl font-bold text-indigo-400">
            {analytics.open_rate_percent.toFixed(1)}%
          </p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3 text-center">
          <p className="text-xs text-slate-400 mb-1">Click Rate</p>
          <p className="text-xl font-bold text-purple-400">
            {analytics.click_rate_percent.toFixed(1)}%
          </p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3 text-center">
          <p className="text-xs text-slate-400 mb-1">Email 1hr</p>
          <p className="text-xl font-bold text-blue-400">
            {analytics.emails_hour_1}
          </p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3 text-center">
          <p className="text-xs text-slate-400 mb-1">Email 24hr</p>
          <p className="text-xl font-bold text-amber-400">
            {analytics.emails_hour_24}
          </p>
        </div>
      </div>

      {/* Timeline reciente */}
      {timeline.length > 0 && (
        <div className="bg-slate-900/30 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Recuperaciones Recientes (últimos 10)
          </h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {timeline.slice(0, 10).map((item, index) => (
              <div 
                key={item.cart_id}
                className="bg-slate-800/50 rounded-lg p-3 text-xs border border-slate-700"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-300 font-mono">{item.user_email}</span>
                  <span className="text-emerald-400 font-bold">${item.total_amount.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <span>{item.cart_status}</span>
                  {item.recovery_method && (
                    <>
                      <span>•</span>
                      <span className="text-purple-400">{item.recovery_method}</span>
                    </>
                  )}
                  {item.coupon_used && (
                    <>
                      <span>•</span>
                      <span className="text-amber-400">Cupón: {item.coupon_used}</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insights */}
      <div className="mt-6 bg-indigo-900/20 rounded-xl p-4 border border-indigo-500/30">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
          <div>
            <h5 className="text-sm font-semibold text-indigo-300 mb-2">Insights</h5>
            <ul className="text-xs text-slate-300 space-y-1">
              <li>• {analytics.total_recovered} carritos salvados = ${analytics.total_recovered_revenue.toFixed(0)} en ventas que se hubieran perdido</li>
              <li>• Email 1 (1hr): {analytics.emails_hour_1} enviados | Email 2 (24hr + 15% off): {analytics.emails_hour_24} enviados</li>
              <li>• {analytics.total_coupons_used} cupones usados de {analytics.total_coupons_created} generados ({analytics.coupon_usage_percent.toFixed(1)}%)</li>
              <li>• Tiempo promedio de recuperación: {timeline.length > 0 ? (timeline.filter(t => t.hours_to_recovery).reduce((acc, t) => acc + (t.hours_to_recovery || 0), 0) / timeline.filter(t => t.hours_to_recovery).length).toFixed(1) : 'N/A'} horas</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
