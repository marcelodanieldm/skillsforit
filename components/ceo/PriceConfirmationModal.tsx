'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Target,
  Info
} from 'lucide-react'

interface PriceChangeImpact {
  priceChangePercentage: number
  estimatedConversionRate: number
  estimatedRevenueChange: number
  severity: 'minor' | 'moderate' | 'major'
  recommendation: string
}

interface Service {
  id: string
  name: string
  slug: string
  currentPrice: number
  proposedPrice: number
  type: string
}

interface PriceConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
  service: Service
  impact: PriceChangeImpact
  isLoading?: boolean
}

export function PriceConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  service,
  impact,
  isLoading = false
}: PriceConfirmationModalProps) {
  const [reason, setReason] = useState('')

  const handleConfirm = () => {
    onConfirm(reason)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value)
  }

  const formatPercent = (value: number) => {
    const sign = value > 0 ? '+' : ''
    return `${sign}${value.toFixed(1)}%`
  }

  const getSeverityConfig = () => {
    switch (impact.severity) {
      case 'major':
        return {
          color: 'red',
          bg: 'bg-red-50',
          border: 'border-red-200',
          textColor: 'text-red-700',
          icon: AlertTriangle
        }
      case 'moderate':
        return {
          color: 'amber',
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          textColor: 'text-amber-700',
          icon: Info
        }
      default:
        return {
          color: 'blue',
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          textColor: 'text-blue-700',
          icon: Info
        }
    }
  }

  const severityConfig = getSeverityConfig()
  const SeverityIcon = severityConfig.icon

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Confirmar Cambio de Precio
                </h2>
                <p className="text-indigo-100 text-sm mt-1">
                  {service.name}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Cambio de precio */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                  Precio Actual
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(service.currentPrice)}
                </p>
              </div>

              <div className="flex items-center justify-center">
                <div className="p-3 bg-gray-100 rounded-full">
                  {impact.priceChangePercentage > 0 ? (
                    <TrendingUp className="w-6 h-6 text-emerald-600" />
                  ) : (
                    <TrendingDown className="w-6 h-6 text-red-600" />
                  )}
                </div>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                  Nuevo Precio
                </p>
                <p className="text-3xl font-bold text-indigo-600">
                  {formatCurrency(service.proposedPrice)}
                </p>
              </div>
            </div>

            {/* Badge de cambio */}
            <div className="text-center">
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                impact.priceChangePercentage > 0
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {formatPercent(impact.priceChangePercentage)} de cambio
              </span>
            </div>

            {/* Impacto Estimado */}
            <div className={`${severityConfig.bg} border-2 ${severityConfig.border} rounded-xl p-4`}>
              <div className="flex items-start gap-3 mb-4">
                <div className={`p-2 bg-white rounded-lg`}>
                  <SeverityIcon className={`w-5 h-5 ${severityConfig.textColor}`} />
                </div>
                <div className="flex-1">
                  <h3 className={`font-bold ${severityConfig.textColor} mb-1`}>
                    Impacto Estimado
                  </h3>
                  <p className="text-sm text-gray-700">
                    {impact.recommendation}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-gray-500" />
                    <p className="text-xs text-gray-600 uppercase tracking-wide">
                      Conversión Estimada
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {impact.estimatedConversionRate.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {impact.estimatedConversionRate > 30 ? '↑' : '↓'} vs 30% actual
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <p className="text-xs text-gray-600 uppercase tracking-wide">
                      Revenue Change
                    </p>
                  </div>
                  <p className={`text-2xl font-bold ${
                    impact.estimatedRevenueChange > 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {formatPercent(impact.estimatedRevenueChange)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Estimación vs actual
                  </p>
                </div>
              </div>
            </div>

            {/* Advertencia de impacto */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-900 mb-1">
                    Este cambio afectará:
                  </p>
                  <ul className="text-sm text-amber-800 space-y-1">
                    <li>✓ Todos los nuevos clientes desde este momento</li>
                    <li>✓ La pasarela de pagos (Stripe) se actualizará automáticamente</li>
                    <li>✓ El landing page mostrará el nuevo precio inmediatamente</li>
                    <li>✓ Los clientes actuales NO se verán afectados</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Razón del cambio */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Razón del cambio (opcional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ej: Ajuste por competencia, test de precio óptimo, promoción especial..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all resize-none"
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-1">
                Esta información se guardará en el historial de cambios para análisis futuro
              </p>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Actualizando...
                  </span>
                ) : (
                  'Confirmar Cambio'
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
