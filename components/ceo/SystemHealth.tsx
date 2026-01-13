'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaHeartbeat, FaRobot, FaCreditCard, FaCheckCircle, FaExclamationTriangle, FaTimesCircle } from 'react-icons/fa'

interface OpenAIStatus {
  avgResponseTime: number
  successRate: number
  totalRequests: number
  failedRequests: number
  status: 'healthy' | 'degraded' | 'down'
}

interface StripeLog {
  id: string
  type: 'payment_success' | 'payment_failed' | 'cart_abandoned'
  amount: number
  email: string
  timestamp: string
  message: string
}

export function SystemHealth() {
  const [openaiStatus, setOpenaiStatus] = useState<OpenAIStatus | null>(null)
  const [stripeLogs, setStripeLogs] = useState<StripeLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSystemHealth()
    // Refresh every 30 seconds
    const interval = setInterval(fetchSystemHealth, 30000)
    return () => clearInterval(interval)
  }, [])

  async function fetchSystemHealth() {
    try {
      const response = await fetch('/api/ceo/system-health')
      const result = await response.json()
      
      if (result.success) {
        setOpenaiStatus(result.openai)
        setStripeLogs(result.stripeLogs)
      }
    } catch (error) {
      console.error('Error fetching system health:', error)
    } finally {
      setLoading(false)
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'healthy': return 'text-green-400'
      case 'degraded': return 'text-yellow-400'
      case 'down': return 'text-red-400'
      default: return 'text-slate-400'
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'healthy': return <FaCheckCircle />
      case 'degraded': return <FaExclamationTriangle />
      case 'down': return <FaTimesCircle />
      default: return <FaHeartbeat />
    }
  }

  function getLogIcon(type: string) {
    switch (type) {
      case 'payment_success': return <FaCheckCircle className="text-green-400" />
      case 'payment_failed': return <FaTimesCircle className="text-red-400" />
      case 'cart_abandoned': return <FaExclamationTriangle className="text-yellow-400" />
      default: return <FaCreditCard className="text-slate-400" />
    }
  }

  if (loading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border-2 border-teal-500/50">
        <div className="flex items-center justify-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
          <p className="text-slate-300">Verificando estado del sistema...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border-2 border-teal-500/50">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <FaHeartbeat className="text-teal-400" />
          Salud del Sistema
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Monitoreo en tiempo real de servicios críticos
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* OpenAI Status */}
        <div className="bg-slate-700/50 rounded-xl p-5 border border-slate-600/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-500/20 p-3 rounded-lg">
                <FaRobot className="text-2xl text-purple-400" />
              </div>
              <div>
                <h3 className="text-white font-bold">OpenAI API</h3>
                <p className="text-slate-400 text-sm">Auditorías de CV</p>
              </div>
            </div>
            <div className={`flex items-center gap-2 ${getStatusColor(openaiStatus?.status || 'healthy')}`}>
              {getStatusIcon(openaiStatus?.status || 'healthy')}
              <span className="font-semibold capitalize">
                {openaiStatus?.status || 'Unknown'}
              </span>
            </div>
          </div>

          {openaiStatus && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Tiempo de respuesta</span>
                <span className={`font-bold ${
                  openaiStatus.avgResponseTime < 2000
                    ? 'text-green-400'
                    : openaiStatus.avgResponseTime < 5000
                    ? 'text-yellow-400'
                    : 'text-red-400'
                }`}>
                  {(openaiStatus.avgResponseTime / 1000).toFixed(2)}s
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Tasa de éxito</span>
                <span className={`font-bold ${
                  openaiStatus.successRate >= 95
                    ? 'text-green-400'
                    : openaiStatus.successRate >= 90
                    ? 'text-yellow-400'
                    : 'text-red-400'
                }`}>
                  {openaiStatus.successRate.toFixed(1)}%
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Requests (24h)</span>
                <span className="text-white font-bold">
                  {openaiStatus.totalRequests}
                </span>
              </div>

              {openaiStatus.failedRequests > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">Fallos</span>
                  <span className="text-red-400 font-bold">
                    {openaiStatus.failedRequests}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Stripe Health Summary */}
        <div className="bg-slate-700/50 rounded-xl p-5 border border-slate-600/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <FaCreditCard className="text-2xl text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-bold">Stripe Payments</h3>
                <p className="text-slate-400 text-sm">Últimas 24 horas</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Pagos exitosos</span>
              <span className="text-green-400 font-bold">
                {stripeLogs.filter(l => l.type === 'payment_success').length}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Pagos fallidos</span>
              <span className="text-red-400 font-bold">
                {stripeLogs.filter(l => l.type === 'payment_failed').length}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Carritos abandonados</span>
              <span className="text-yellow-400 font-bold">
                {stripeLogs.filter(l => l.type === 'cart_abandoned').length}
              </span>
            </div>

            <div className="pt-3 border-t border-slate-600">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Tasa de conversión</span>
                <span className="text-blue-400 font-bold">
                  {(() => {
                    const success = stripeLogs.filter(l => l.type === 'payment_success').length
                    const total = stripeLogs.filter(l => l.type !== 'cart_abandoned').length
                    return total > 0 ? ((success / total) * 100).toFixed(1) : 0
                  })()}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Stripe Logs */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <FaCreditCard className="text-blue-400" />
          Logs Recientes de Stripe
        </h3>
        <div className="bg-slate-700/30 rounded-xl p-4 max-h-64 overflow-y-auto">
          {stripeLogs.length === 0 ? (
            <p className="text-center text-slate-400 py-8">No hay logs recientes</p>
          ) : (
            <div className="space-y-2">
              {stripeLogs.slice(0, 10).map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg text-sm"
                >
                  <div className="flex items-center gap-3">
                    {getLogIcon(log.type)}
                    <div>
                      <p className="text-white font-semibold">{log.message}</p>
                      <p className="text-slate-400 text-xs">{log.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">
                      ${log.amount.toFixed(2)}
                    </p>
                    <p className="text-slate-500 text-xs">
                      {new Date(log.timestamp).toLocaleTimeString('es-ES')}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
