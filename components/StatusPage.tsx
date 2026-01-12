'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaClock,
  FaRobot, FaDatabase, FaServer, FaSync, FaChartLine
} from 'react-icons/fa'

/**
 * Status Page Component
 * 
 * Muestra el estado de salud de todos los servicios:
 * - LLM Providers (OpenAI, Anthropic, Google)
 * - Database (Supabase)
 * - Sistema general
 * 
 * Sprint 21: UX de Resiliencia
 */

interface ServiceStatus {
  name: string
  isHealthy: boolean
  lastCheck: string
  latencyMs?: number
}

interface HealthData {
  status: 'healthy' | 'degraded' | 'error'
  timestamp: string
  latencyMs: number
  services: {
    llm: {
      status: 'healthy' | 'degraded'
      providers: ServiceStatus[]
    }
    database: {
      status: 'healthy' | 'degraded'
      latencyMs: number
    }
  }
  version: string
  environment: string
}

export default function StatusPage() {
  const [healthData, setHealthData] = useState<HealthData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  useEffect(() => {
    fetchHealthData()
    
    // Auto-refresh every 30 seconds
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchHealthData()
      }, 30000)
      
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const fetchHealthData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/health')
      const data = await response.json()
      
      setHealthData(data)
      setLastRefresh(new Date())
    } catch (err: any) {
      setError(err.message || 'Failed to fetch health data')
    } finally {
      setLoading(false)
    }
  }

  const handleManualRefresh = async () => {
    setAutoRefresh(false)
    await fetchHealthData()
    setTimeout(() => setAutoRefresh(true), 5000) // Resume auto-refresh after 5s
  }

  if (loading && !healthData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Checking system status...</p>
        </div>
      </div>
    )
  }

  if (error && !healthData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <FaTimesCircle className="text-6xl text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Unable to Load Status
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchHealthData}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!healthData) return null

  const overallStatus = healthData.status

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-12">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className={`rounded-2xl p-8 mb-8 text-white ${
          overallStatus === 'healthy' 
            ? 'bg-gradient-to-r from-green-600 to-emerald-600'
            : overallStatus === 'degraded'
            ? 'bg-gradient-to-r from-yellow-600 to-orange-600'
            : 'bg-gradient-to-r from-red-600 to-rose-600'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              {overallStatus === 'healthy' && <FaCheckCircle className="text-5xl" />}
              {overallStatus === 'degraded' && <FaExclamationTriangle className="text-5xl" />}
              {overallStatus === 'error' && <FaTimesCircle className="text-5xl" />}
              <div>
                <h1 className="text-4xl font-bold">System Status</h1>
                <p className="text-lg opacity-90">
                  {overallStatus === 'healthy' && 'All systems operational'}
                  {overallStatus === 'degraded' && 'Some services experiencing issues'}
                  {overallStatus === 'error' && 'System is currently unavailable'}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleManualRefresh}
              disabled={loading}
              className={`px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <FaSync className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
          
          <div className="flex items-center gap-6 text-sm opacity-90">
            <div className="flex items-center gap-2">
              <FaClock />
              Last check: {lastRefresh.toLocaleTimeString()}
            </div>
            <div className="flex items-center gap-2">
              <FaChartLine />
              Response time: {healthData.latencyMs}ms
            </div>
            <div>
              v{healthData.version} ({healthData.environment})
            </div>
          </div>
        </div>

        {/* LLM Providers Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <FaRobot className="text-2xl text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                AI Services
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Language model providers with automatic fallback
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {healthData.services.llm.providers.map((provider) => (
              <ServiceStatusCard
                key={provider.name}
                name={provider.name === 'openai' ? 'OpenAI GPT-4' : 
                      provider.name === 'anthropic' ? 'Anthropic Claude' : 
                      provider.name === 'google' ? 'Google Gemini' : provider.name}
                isHealthy={provider.isHealthy}
                lastCheck={new Date(provider.lastCheck)}
                icon={<FaRobot />}
              />
            ))}
          </div>

          {healthData.services.llm.status === 'degraded' && (
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-600 rounded-lg">
              <div className="flex items-start gap-3">
                <FaExclamationTriangle className="text-yellow-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Fallback Mode Active
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Some AI providers are unavailable, but we're automatically routing your requests 
                    to healthy providers. You may experience slightly longer response times.
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Database Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FaDatabase className="text-2xl text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Database
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Supabase data storage
              </p>
            </div>
          </div>

          <ServiceStatusCard
            name="Supabase PostgreSQL"
            isHealthy={healthData.services.database.status === 'healthy'}
            lastCheck={new Date(healthData.timestamp)}
            latencyMs={healthData.services.database.latencyMs}
            icon={<FaDatabase />}
          />
        </motion.div>

        {/* System Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <FaServer className="text-2xl text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                System Information
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoCard label="Environment" value={healthData.environment} />
            <InfoCard label="Version" value={healthData.version} />
            <InfoCard label="Auto-refresh" value={autoRefresh ? 'Enabled (30s)' : 'Disabled'} />
            <InfoCard label="Overall Latency" value={`${healthData.latencyMs}ms`} />
          </div>
        </motion.div>

        {/* Auto-refresh Toggle */}
        <div className="mt-6 text-center">
          <label className="inline-flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
            />
            <span className="text-gray-700 dark:text-gray-300">
              Auto-refresh every 30 seconds
            </span>
          </label>
        </div>
      </div>
    </div>
  )
}

// === COMPONENTES AUXILIARES ===

interface ServiceStatusCardProps {
  name: string
  isHealthy: boolean
  lastCheck: Date
  latencyMs?: number
  icon: React.ReactNode
}

function ServiceStatusCard({ name, isHealthy, lastCheck, latencyMs, icon }: ServiceStatusCardProps) {
  return (
    <div className={`p-4 rounded-lg border-2 ${
      isHealthy 
        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`text-2xl ${
            isHealthy ? 'text-green-600' : 'text-red-600'
          }`}>
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Last checked: {lastCheck.toLocaleTimeString()}
              {latencyMs !== undefined && ` (${latencyMs}ms)`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isHealthy ? (
            <>
              <FaCheckCircle className="text-2xl text-green-600" />
              <span className="font-bold text-green-700 dark:text-green-400">Operational</span>
            </>
          ) : (
            <>
              <FaTimesCircle className="text-2xl text-red-600" />
              <span className="font-bold text-red-700 dark:text-red-400">Unavailable</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

interface InfoCardProps {
  label: string
  value: string
}

function InfoCard({ label, value }: InfoCardProps) {
  return (
    <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
        {label}
      </div>
      <div className="text-lg font-bold text-gray-900 dark:text-white">
        {value}
      </div>
    </div>
  )
}
