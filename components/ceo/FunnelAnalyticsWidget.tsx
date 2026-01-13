'use client'

import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart,
  Users,
  Target,
  AlertCircle
} from 'lucide-react'

interface AOVBreakdown {
  name: string
  price: number
  conversion_rate: number
  aov_contribution: number
}

interface AOVData {
  current: number
  projected: number
  breakdown: {
    base_product: AOVBreakdown
    order_bump: AOVBreakdown
    upsell: AOVBreakdown
  }
}

interface RevenueMetrics {
  total_orders: number
  total_revenue: number
  average_order_value: number
  projected_aov: number
  base_product_revenue: number
  order_bump_revenue: number
  upsell_revenue: number
  revenue_lift_percentage: number
}

interface FunnelAnalyticsWidgetProps {
  aov: AOVData
  revenue: RevenueMetrics
  orderBump: {
    total_views: number
    accepted: number
    acceptance_rate: number
  }
  upsell: {
    total_views: number
    accepted: number
    acceptance_rate: number
  }
}

export function FunnelAnalyticsWidget({
  aov,
  revenue,
  orderBump,
  upsell
}: FunnelAnalyticsWidgetProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Funnel de Conversión - AOV
          </h2>
          <p className="text-gray-600 mt-1">
            Análisis de Average Order Value y optimizaciones
          </p>
        </div>
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* AOV Actual */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 opacity-80" />
            <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">
              AOV Actual
            </span>
          </div>
          <p className="text-3xl font-bold mb-1">
            {formatCurrency(aov.current || 0)}
          </p>
          <p className="text-blue-100 text-sm">
            Promedio por orden completada
          </p>
        </motion.div>

        {/* AOV Proyectado */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <Target className="w-8 h-8 opacity-80" />
            <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">
              AOV Proyectado
            </span>
          </div>
          <p className="text-3xl font-bold mb-1">
            {formatCurrency(aov.projected)}
          </p>
          <p className="text-emerald-100 text-sm">
            Con optimizaciones actuales
          </p>
        </motion.div>

        {/* Revenue Lift */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 opacity-80" />
            <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">
              Revenue Lift
            </span>
          </div>
          <p className="text-3xl font-bold mb-1">
            +{formatPercent(revenue.revenue_lift_percentage)}
          </p>
          <p className="text-purple-100 text-sm">
            vs. solo producto base
          </p>
        </motion.div>

        {/* Total Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <ShoppingCart className="w-8 h-8 opacity-80" />
            <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">
              Órdenes
            </span>
          </div>
          <p className="text-3xl font-bold mb-1">
            {revenue.total_orders}
          </p>
          <p className="text-orange-100 text-sm">
            {formatCurrency(revenue.total_revenue)} total
          </p>
        </motion.div>
      </div>

      {/* Tabla de AOV Breakdown */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">
            Desglose de AOV por Producto
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Contribución de cada producto al valor promedio de orden
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Tasa Conversión
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Contribución AOV
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {/* Base Product */}
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {aov.breakdown.base_product.name}
                    </p>
                    <p className="text-xs text-gray-500">Producto base</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(aov.breakdown.base_product.price)}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="font-semibold text-emerald-600">
                    {formatPercent(aov.breakdown.base_product.conversion_rate)}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="font-bold text-blue-600">
                    {formatCurrency(aov.breakdown.base_product.aov_contribution)}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Activo
                  </span>
                </td>
              </tr>

              {/* Order Bump */}
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {aov.breakdown.order_bump.name}
                    </p>
                    <p className="text-xs text-gray-500">Order Bump (pre-pago)</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="font-semibold text-gray-900">
                    +{formatCurrency(aov.breakdown.order_bump.price)}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-semibold text-gray-900">
                      {formatPercent(aov.breakdown.order_bump.conversion_rate)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {orderBump.accepted}/{orderBump.total_views} aceptados
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="font-bold text-blue-600">
                    +{formatCurrency(aov.breakdown.order_bump.aov_contribution)}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  {aov.breakdown.order_bump.conversion_rate >= 40 ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ✓ Meta alcanzada
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                      ⚠ Meta: 40%
                    </span>
                  )}
                </td>
              </tr>

              {/* Upsell */}
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {aov.breakdown.upsell.name}
                    </p>
                    <p className="text-xs text-gray-500">Upsell (post-pago)</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="font-semibold text-gray-900">
                    +{formatCurrency(aov.breakdown.upsell.price)}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-semibold text-gray-900">
                      {formatPercent(aov.breakdown.upsell.conversion_rate)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {upsell.accepted}/{upsell.total_views} aceptados
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="font-bold text-blue-600">
                    +{formatCurrency(aov.breakdown.upsell.aov_contribution)}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  {aov.breakdown.upsell.conversion_rate >= 25 ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ✓ Meta alcanzada
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                      ⚠ Meta: 25%
                    </span>
                  )}
                </td>
              </tr>

              {/* Total Row */}
              <tr className="bg-gradient-to-r from-blue-50 to-purple-50 font-bold">
                <td className="px-6 py-4 text-gray-900">
                  AOV TOTAL
                </td>
                <td className="px-6 py-4 text-center text-gray-900">
                  {formatCurrency(
                    aov.breakdown.base_product.price +
                    aov.breakdown.order_bump.price +
                    aov.breakdown.upsell.price
                  )}
                </td>
                <td className="px-6 py-4 text-center text-gray-500">
                  —
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-2xl font-bold text-blue-600">
                    {formatCurrency(aov.projected)}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-sm text-emerald-600 font-semibold">
                    +{formatPercent(revenue.revenue_lift_percentage)} lift
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights y Recomendaciones */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-amber-100 rounded-lg">
            <AlertCircle className="w-6 h-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-gray-900 mb-2">
              💡 Insights de Optimización
            </h4>
            <ul className="space-y-2 text-sm text-gray-700">
              {orderBump.acceptance_rate < 40 && (
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold mt-0.5">•</span>
                  <span>
                    <strong>Order Bump:</strong> Actualmente en {formatPercent(orderBump.acceptance_rate)}. 
                    Meta: 40%. Considera ajustar el copy o el precio para aumentar conversión.
                  </span>
                </li>
              )}
              {upsell.acceptance_rate < 25 && (
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold mt-0.5">•</span>
                  <span>
                    <strong>Upsell:</strong> Actualmente en {formatPercent(upsell.acceptance_rate)}. 
                    Meta: 25%. Prueba con un timer más corto o beneficios más claros.
                  </span>
                </li>
              )}
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                <span>
                  <strong>Impacto Total:</strong> Cada venta de ${aov.breakdown.base_product.price} 
                  ahora genera en promedio {formatCurrency(aov.projected)} gracias a las optimizaciones.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
