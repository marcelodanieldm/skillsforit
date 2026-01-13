'use client'

import { motion } from 'framer-motion'
import { 
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  ArrowRight
} from 'lucide-react'

interface ConversionRates {
  landing_to_diagnostic: number
  diagnostic_to_checkout: number
  checkout_to_payment: number
  payment_to_success: number
  overall_conversion: number
}

interface DropOffRates {
  landing: number
  diagnostic: number
  checkout: number
  payment: number
}

interface EventCounts {
  landing_view: number
  diagnostic_start: number
  diagnostic_complete: number
  checkout_start: number
  order_bump_view: number
  payment_start: number
  payment_success: number
  upsell_view: number
}

interface FunnelVisualizerProps {
  events: EventCounts
  conversionRates: ConversionRates
  dropOffRates: DropOffRates
}

export function FunnelVisualizer({
  events,
  conversionRates,
  dropOffRates
}: FunnelVisualizerProps) {
  const formatPercent = (value: number) => `${value.toFixed(1)}%`

  const funnelSteps = [
    {
      name: 'Landing Page',
      count: events.landing_view,
      conversionRate: 100,
      dropOffRate: dropOffRates.landing,
      color: 'from-blue-500 to-blue-600',
      nextStep: 'Diagnóstico'
    },
    {
      name: 'Diagnóstico',
      count: events.diagnostic_start,
      conversionRate: conversionRates.landing_to_diagnostic,
      dropOffRate: dropOffRates.diagnostic,
      color: 'from-purple-500 to-purple-600',
      nextStep: 'Checkout'
    },
    {
      name: 'Checkout',
      count: events.checkout_start,
      conversionRate: conversionRates.diagnostic_to_checkout,
      dropOffRate: dropOffRates.checkout,
      color: 'from-emerald-500 to-emerald-600',
      nextStep: 'Pago'
    },
    {
      name: 'Pago',
      count: events.payment_start,
      conversionRate: conversionRates.checkout_to_payment,
      dropOffRate: dropOffRates.payment,
      color: 'from-orange-500 to-orange-600',
      nextStep: 'Success'
    },
    {
      name: 'Completado',
      count: events.payment_success,
      conversionRate: conversionRates.payment_to_success,
      dropOffRate: 0,
      color: 'from-green-500 to-green-600',
      nextStep: null
    }
  ]

  const getDropOffSeverity = (rate: number) => {
    if (rate < 20) return { color: 'text-green-600', bg: 'bg-green-100', label: 'Óptimo' }
    if (rate < 40) return { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Aceptable' }
    if (rate < 60) return { color: 'text-orange-600', bg: 'bg-orange-100', label: 'Mejorable' }
    return { color: 'text-red-600', bg: 'bg-red-100', label: 'Crítico' }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Conversión por Paso del Funnel
          </h2>
          <p className="text-gray-600 mt-1">
            Drop-off rate en cada etapa del proceso de compra
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Conversión General</p>
          <p className="text-3xl font-bold text-blue-600">
            {formatPercent(conversionRates.overall_conversion)}
          </p>
        </div>
      </div>

      {/* Visualización del Funnel */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <div className="space-y-6">
          {funnelSteps.map((step, index) => {
            const maxWidth = 100
            const widthPercentage = events.landing_view > 0 
              ? (step.count / events.landing_view) * 100 
              : 0
            const actualWidth = Math.max(widthPercentage, 10) // Mínimo 10% para visibilidad
            
            const severity = getDropOffSeverity(step.dropOffRate)

            return (
              <div key={index}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-2"
                >
                  {/* Nombre y métricas del paso */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-gray-400">
                        {index + 1}
                      </span>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">
                          {step.name}
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-sm text-gray-600">
                            {step.count.toLocaleString()} usuarios
                          </span>
                          {index > 0 && (
                            <span className="text-sm font-semibold text-blue-600">
                              {formatPercent(step.conversionRate)} conversión
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Drop-off badge */}
                    {step.dropOffRate > 0 && (
                      <div className={`flex items-center gap-2 px-3 py-1.5 ${severity.bg} rounded-lg`}>
                        <TrendingDown className={`w-4 h-4 ${severity.color}`} />
                        <div className="text-right">
                          <p className={`text-xs font-medium ${severity.color}`}>
                            {severity.label}
                          </p>
                          <p className={`text-lg font-bold ${severity.color}`}>
                            {formatPercent(step.dropOffRate)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Barra de progreso */}
                  <div className="relative">
                    <div className="h-16 bg-gray-100 rounded-lg overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${actualWidth}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        className={`h-full bg-gradient-to-r ${step.color} flex items-center justify-between px-4 text-white font-bold`}
                      >
                        <span className="text-sm">
                          {formatPercent(widthPercentage)}
                        </span>
                        <span>{step.count}</span>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>

                {/* Arrow to next step */}
                {step.nextStep && (
                  <div className="flex items-center justify-center py-2">
                    <div className="flex items-center gap-2 text-gray-400">
                      <ArrowRight className="w-5 h-5" />
                      <span className="text-xs font-medium">
                        Continúan a {step.nextStep}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Análisis de Drop-off */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Peor drop-off */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 mb-2">
                Mayor Abandono
              </h4>
              {(() => {
                const maxDropOff = Math.max(
                  dropOffRates.landing,
                  dropOffRates.diagnostic,
                  dropOffRates.checkout,
                  dropOffRates.payment
                )
                const criticalStep = 
                  maxDropOff === dropOffRates.landing ? 'Landing → Diagnóstico' :
                  maxDropOff === dropOffRates.diagnostic ? 'Diagnóstico → Checkout' :
                  maxDropOff === dropOffRates.checkout ? 'Checkout → Pago' :
                  'Pago → Success'

                return (
                  <div>
                    <p className="text-3xl font-bold text-red-600 mb-2">
                      {formatPercent(maxDropOff)}
                    </p>
                    <p className="text-sm text-gray-600">
                      En: <strong>{criticalStep}</strong>
                    </p>
                    <div className="mt-4 p-3 bg-red-50 rounded-lg">
                      <p className="text-xs text-gray-700">
                        <strong>Recomendación:</strong> Prioriza optimizar esta etapa 
                        mediante A/B testing del copy, diseño o incentivos.
                      </p>
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>
        </div>

        {/* Mejor conversión */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 mb-2">
                Mejor Paso
              </h4>
              {(() => {
                const minDropOff = Math.min(
                  dropOffRates.landing,
                  dropOffRates.diagnostic,
                  dropOffRates.checkout,
                  dropOffRates.payment
                )
                const bestStep = 
                  minDropOff === dropOffRates.landing ? 'Landing → Diagnóstico' :
                  minDropOff === dropOffRates.diagnostic ? 'Diagnóstico → Checkout' :
                  minDropOff === dropOffRates.checkout ? 'Checkout → Pago' :
                  'Pago → Success'

                return (
                  <div>
                    <p className="text-3xl font-bold text-green-600 mb-2">
                      {formatPercent(minDropOff)}
                    </p>
                    <p className="text-sm text-gray-600">
                      En: <strong>{bestStep}</strong>
                    </p>
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <p className="text-xs text-gray-700">
                        <strong>Insight:</strong> Este paso funciona bien. Analiza qué 
                        elementos lo hacen exitoso y replícalos en otros pasos.
                      </p>
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
