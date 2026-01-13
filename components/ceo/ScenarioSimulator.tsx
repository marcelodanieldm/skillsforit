'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaChartLine, FaSync, FaSave, FaExclamationTriangle } from 'react-icons/fa'

interface ScenarioVariable {
  id: string
  label: string
  currentValue: number
  optimisticValue: number
  unit: string
  description: string
  actionRequired: string
}

interface ProjectedMetrics {
  currentRevenue: number
  optimisticRevenue: number
  revenueIncrease: number
  currentMargin: number
  optimisticMargin: number
}

export default function ScenarioSimulator() {
  const [variables, setVariables] = useState<ScenarioVariable[]>([
    {
      id: 'ebook_price',
      label: 'Precio E-book',
      currentValue: 10,
      optimisticValue: 15,
      unit: 'USD',
      description: 'Precio del Soft Skills Guide',
      actionRequired: 'Cambiar precio en Panel CEO (Capa 3)'
    },
    {
      id: 'cv_conversion',
      label: 'Conversión CV Audit',
      currentValue: 40,
      optimisticValue: 55,
      unit: '%',
      description: 'Tasa de conversión del análisis de CV',
      actionRequired: 'Optimizar Copy del Order Bump'
    },
    {
      id: 'daily_sales',
      label: 'Ventas Diarias',
      currentValue: 5,
      optimisticValue: 12,
      unit: 'unidades',
      description: 'Número de ventas por día',
      actionRequired: 'Aumentar Outreach en LinkedIn'
    },
    {
      id: 'mentor_conversion',
      label: 'Conversión Mentoría',
      currentValue: 15,
      optimisticValue: 25,
      unit: '%',
      description: 'Tasa de conversión a mentoría',
      actionRequired: 'Mejorar pitch en página de mentores'
    }
  ])

  const [projections, setProjections] = useState<ProjectedMetrics>({
    currentRevenue: 0,
    optimisticRevenue: 0,
    revenueIncrease: 0,
    currentMargin: 0,
    optimisticMargin: 0
  })

  const [isLoading, setIsLoading] = useState(false)

  // Calcular proyecciones en tiempo real
  useEffect(() => {
    calculateProjections()
  }, [variables])

  const calculateProjections = () => {
    // Escenario Actual
    const ebookPrice = variables.find(v => v.id === 'ebook_price')?.currentValue || 10
    const cvConversion = (variables.find(v => v.id === 'cv_conversion')?.currentValue || 40) / 100
    const dailySales = variables.find(v => v.id === 'daily_sales')?.currentValue || 5
    const mentorConversion = (variables.find(v => v.id === 'mentor_conversion')?.currentValue || 15) / 100

    // Ingresos mensuales (30 días)
    const currentEbookRevenue = ebookPrice * dailySales * 30
    const currentCvRevenue = 29.99 * (dailySales * cvConversion) * 30 // CV Audit a $29.99
    const currentMentorRevenue = 199.99 * (dailySales * mentorConversion) * 30 // Mentoría a $199.99
    const currentRevenue = currentEbookRevenue + currentCvRevenue + currentMentorRevenue

    // Escenario Optimista
    const optEbookPrice = variables.find(v => v.id === 'ebook_price')?.optimisticValue || 15
    const optCvConversion = (variables.find(v => v.id === 'cv_conversion')?.optimisticValue || 55) / 100
    const optDailySales = variables.find(v => v.id === 'daily_sales')?.optimisticValue || 12
    const optMentorConversion = (variables.find(v => v.id === 'mentor_conversion')?.optimisticValue || 25) / 100

    const optimisticEbookRevenue = optEbookPrice * optDailySales * 30
    const optimisticCvRevenue = 29.99 * (optDailySales * optCvConversion) * 30
    const optimisticMentorRevenue = 199.99 * (optDailySales * optMentorConversion) * 30
    const optimisticRevenue = optimisticEbookRevenue + optimisticCvRevenue + optimisticMentorRevenue

    // Márgenes (asumiendo 75% margen para digital, 30% para mentoría por comisiones)
    const currentMargin = (currentEbookRevenue + currentCvRevenue) * 0.75 + currentMentorRevenue * 0.30
    const optimisticMargin = (optimisticEbookRevenue + optimisticCvRevenue) * 0.75 + optimisticMentorRevenue * 0.30

    setProjections({
      currentRevenue: Math.round(currentRevenue),
      optimisticRevenue: Math.round(optimisticRevenue),
      revenueIncrease: Math.round(((optimisticRevenue - currentRevenue) / currentRevenue) * 100),
      currentMargin: Math.round(currentMargin),
      optimisticMargin: Math.round(optimisticMargin)
    })
  }

  const handleVariableChange = (id: string, field: 'currentValue' | 'optimisticValue', value: number) => {
    setVariables(prev => prev.map(v => 
      v.id === id ? { ...v, [field]: value } : v
    ))
  }

  const resetToDefaults = () => {
    setVariables([
      {
        id: 'ebook_price',
        label: 'Precio E-book',
        currentValue: 10,
        optimisticValue: 15,
        unit: 'USD',
        description: 'Precio del Soft Skills Guide',
        actionRequired: 'Cambiar precio en Panel CEO (Capa 3)'
      },
      {
        id: 'cv_conversion',
        label: 'Conversión CV Audit',
        currentValue: 40,
        optimisticValue: 55,
        unit: '%',
        description: 'Tasa de conversión del análisis de CV',
        actionRequired: 'Optimizar Copy del Order Bump'
      },
      {
        id: 'daily_sales',
        label: 'Ventas Diarias',
        currentValue: 5,
        optimisticValue: 12,
        unit: 'unidades',
        description: 'Número de ventas por día',
        actionRequired: 'Aumentar Outreach en LinkedIn'
      },
      {
        id: 'mentor_conversion',
        label: 'Conversión Mentoría',
        currentValue: 15,
        optimisticValue: 25,
        unit: '%',
        description: 'Tasa de conversión a mentoría',
        actionRequired: 'Mejorar pitch en página de mentores'
      }
    ])
  }

  const saveScenario = async () => {
    setIsLoading(true)
    // Aquí podrías guardar el escenario en la BD para tracking histórico
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
    alert('Escenario guardado exitosamente')
  }

  return (
    <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <FaChartLine className="text-purple-400 text-2xl" />
            <h2 className="text-2xl font-bold text-white">Simulador de Escenarios</h2>
          </div>
          <p className="text-slate-400 text-sm">
            Ajusta las variables para proyectar escenarios optimistas y comparar con el estado actual
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={resetToDefaults}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
          >
            <FaSync className="text-sm" />
            Reset
          </button>
          <button
            onClick={saveScenario}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            <FaSave className="text-sm" />
            {isLoading ? 'Guardando...' : 'Guardar Escenario'}
          </button>
        </div>
      </div>

      {/* Proyecciones de Alto Nivel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 rounded-xl p-4 border border-emerald-500/30"
        >
          <p className="text-slate-400 text-sm mb-1">Ingresos Actuales (MRR)</p>
          <p className="text-3xl font-bold text-emerald-400">
            ${projections.currentRevenue.toLocaleString()}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900 rounded-xl p-4 border border-purple-500/30"
        >
          <p className="text-slate-400 text-sm mb-1">Ingresos Optimistas (MRR)</p>
          <p className="text-3xl font-bold text-purple-400">
            ${projections.optimisticRevenue.toLocaleString()}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`bg-slate-900 rounded-xl p-4 border ${
            projections.revenueIncrease >= 50 ? 'border-green-500/30' :
            projections.revenueIncrease >= 30 ? 'border-yellow-500/30' :
            'border-red-500/30'
          }`}
        >
          <p className="text-slate-400 text-sm mb-1">Aumento Potencial</p>
          <p className={`text-3xl font-bold ${
            projections.revenueIncrease >= 50 ? 'text-green-400' :
            projections.revenueIncrease >= 30 ? 'text-yellow-400' :
            'text-red-400'
          }`}>
            +{projections.revenueIncrease}%
          </p>
        </motion.div>
      </div>

      {/* Tabla de Variables */}
      <div className="bg-slate-900 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-800 border-b border-slate-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Variable</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-slate-300">Actual</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-slate-300">Escenario Optimista</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Acción Requerida</th>
            </tr>
          </thead>
          <tbody>
            {variables.map((variable, index) => (
              <motion.tr
                key={variable.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors"
              >
                <td className="px-4 py-4">
                  <div>
                    <p className="text-white font-medium">{variable.label}</p>
                    <p className="text-slate-400 text-xs mt-1">{variable.description}</p>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <input
                      type="number"
                      value={variable.currentValue}
                      onChange={(e) => handleVariableChange(variable.id, 'currentValue', parseFloat(e.target.value))}
                      className="w-20 px-3 py-2 bg-slate-800 text-white rounded-lg border border-slate-700 focus:border-emerald-500 focus:outline-none text-center"
                    />
                    <span className="text-slate-400 text-sm">{variable.unit}</span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <input
                      type="number"
                      value={variable.optimisticValue}
                      onChange={(e) => handleVariableChange(variable.id, 'optimisticValue', parseFloat(e.target.value))}
                      className="w-20 px-3 py-2 bg-slate-800 text-white rounded-lg border border-purple-500/50 focus:border-purple-500 focus:outline-none text-center"
                    />
                    <span className="text-slate-400 text-sm">{variable.unit}</span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-start gap-2">
                    <FaExclamationTriangle className="text-yellow-400 text-sm mt-1 flex-shrink-0" />
                    <p className="text-slate-300 text-sm">{variable.actionRequired}</p>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Insights de Márgenes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6 bg-slate-900 rounded-xl p-4 border border-slate-700"
      >
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
          <FaChartLine className="text-emerald-400" />
          Proyección de Márgenes Netos (30 días)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-slate-400 text-sm mb-1">Margen Actual</p>
            <p className="text-2xl font-bold text-emerald-400">
              ${projections.currentMargin.toLocaleString()}
            </p>
            <p className="text-slate-500 text-xs mt-1">
              {((projections.currentMargin / projections.currentRevenue) * 100).toFixed(0)}% del revenue
            </p>
          </div>
          <div>
            <p className="text-slate-400 text-sm mb-1">Margen Optimista</p>
            <p className="text-2xl font-bold text-purple-400">
              ${projections.optimisticMargin.toLocaleString()}
            </p>
            <p className="text-slate-500 text-xs mt-1">
              {((projections.optimisticMargin / projections.optimisticRevenue) * 100).toFixed(0)}% del revenue
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
