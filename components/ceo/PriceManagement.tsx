'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  DollarSign, 
  Edit3, 
  Check, 
  X, 
  Clock,
  TrendingUp,
  TrendingDown,
  History,
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import { PriceConfirmationModal } from './PriceConfirmationModal'

interface Service {
  id: string
  name: string
  slug: string
  description: string
  base_price: number
  currency: string
  type: 'ebook' | 'order_bump' | 'upsell'
  stripe_product_id: string | null
  stripe_price_id: string | null
  is_active: boolean
  display_order: number
  metadata: Record<string, any>
  priceChanges: number
  lastPriceChange: string | null
  lowestPrice: number
  highestPrice: number
}

interface PriceChangeImpact {
  priceChangePercentage: number
  estimatedConversionRate: number
  estimatedRevenueChange: number
  severity: 'minor' | 'moderate' | 'major'
  recommendation: string
}

export function PriceManagement() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingPrice, setEditingPrice] = useState<number>(0)
  
  // Modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [pendingChange, setPendingChange] = useState<{
    service: Service
    newPrice: number
    impact: PriceChangeImpact
  } | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  // User (CEO) email - En producción vendría del contexto de auth
  const ceoEmail = 'ceo@skillsforit.com'

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/ceo/services')
      const data = await response.json()

      if (data.success) {
        setServices(data.data.services)
      } else {
        setError('Error al cargar servicios')
      }
    } catch (err) {
      setError('Error de conexión')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (service: Service) => {
    setEditingId(service.id)
    setEditingPrice(service.base_price)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingPrice(0)
  }

  const prepareUpdate = async (service: Service) => {
    if (editingPrice === service.base_price) {
      cancelEdit()
      return
    }

    // Validar rango de precio
    if (editingPrice < 1 || editingPrice > 1000) {
      alert('El precio debe estar entre $1 y $1000')
      return
    }

    try {
      setIsUpdating(true)

      // Calcular impacto localmente (preview rápido)
      const priceChangePercentage = ((editingPrice - service.base_price) / service.base_price) * 100
      const elasticity = priceChangePercentage > 0 ? -0.3 : 0.2
      const estimatedConversionRate = priceChangePercentage * elasticity
      const estimatedRevenueChange = (
        (1 + estimatedConversionRate / 100) * editingPrice / service.base_price - 1
      ) * 100

      const impact: PriceChangeImpact = {
        priceChangePercentage: Math.round(priceChangePercentage * 100) / 100,
        estimatedConversionRate: Math.round(estimatedConversionRate * 100) / 100,
        estimatedRevenueChange: Math.round(estimatedRevenueChange * 100) / 100,
        severity: 
          Math.abs(priceChangePercentage) < 10 ? 'minor' :
          Math.abs(priceChangePercentage) < 20 ? 'moderate' : 'major',
        recommendation: priceChangePercentage > 0 
          ? 'Monitor conversion rate closely for 2 weeks'
          : 'Track volume increase to ensure profitability'
      }

      setPendingChange({
        service,
        newPrice: editingPrice,
        impact
      })
      setShowConfirmModal(true)
      
    } catch (err) {
      console.error('Error preparando actualización:', err)
      alert('Error al calcular impacto')
    } finally {
      setIsUpdating(false)
    }
  }

  const confirmUpdate = async (reason: string) => {
    if (!pendingChange) return

    try {
      setIsUpdating(true)

      // Llamar al nuevo endpoint /api/admin/update-price
      const response = await fetch('/api/admin/update-price', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ceoEmail}` // En producción, usar token JWT real
        },
        body: JSON.stringify({
          serviceId: pendingChange.service.id,
          newPrice: pendingChange.newPrice,
          reason
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Éxito: actualizar UI
        setServices(prevServices => 
          prevServices.map(s => 
            s.id === pendingChange.service.id
              ? { ...s, base_price: pendingChange.newPrice }
              : s
          )
        )
        
        // Toast success
        alert('✅ Precio actualizado y sincronizado con Stripe')
        
        // Recargar servicios para obtener stats actualizados
        fetchServices()
      } else {
        alert('❌ Error: ' + (data.error || 'No se pudo actualizar el precio'))
      }

    } catch (err) {
      console.error('Error actualizando precio:', err)
      alert('❌ Error de conexión al actualizar precio')
    } finally {
      setIsUpdating(false)
      setShowConfirmModal(false)
      setPendingChange(null)
      cancelEdit()
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value)
  }

  const getTypeLabel = (type: string) => {
    const labels = {
      ebook: 'Producto Base',
      order_bump: 'Order Bump',
      upsell: 'Upsell'
    }
    return labels[type as keyof typeof labels] || type
  }

  const getTypeColor = (type: string) => {
    const colors = {
      ebook: 'from-purple-500 to-indigo-600',
      order_bump: 'from-blue-500 to-cyan-600',
      upsell: 'from-emerald-500 to-teal-600'
    }
    return colors[type as keyof typeof colors] || 'from-gray-500 to-gray-600'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Cargando servicios...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <div>
            <h3 className="font-bold text-red-900">Error</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Gestión de Precios
          </h2>
          <p className="text-gray-600 mt-1">
            Actualiza los precios y sincroniza automáticamente con Stripe
          </p>
        </div>
        <button
          onClick={fetchServices}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </button>
      </div>

      {/* Services Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Servicio
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Precio Actual
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Historial
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Rango
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {services.map((service, index) => {
                const isEditing = editingId === service.id

                return (
                  <motion.tr
                    key={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Servicio */}
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {service.name}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {service.description.substring(0, 60)}...
                        </p>
                      </div>
                    </td>

                    {/* Tipo */}
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-3 py-1 bg-gradient-to-r ${getTypeColor(service.type)} text-white text-xs font-medium rounded-full`}>
                        {getTypeLabel(service.type)}
                      </span>
                    </td>

                    {/* Precio */}
                    <td className="px-6 py-4 text-center">
                      {isEditing ? (
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-gray-500">$</span>
                          <input
                            type="number"
                            value={editingPrice}
                            onChange={(e) => setEditingPrice(parseFloat(e.target.value) || 0)}
                            className="w-24 px-2 py-1 border-2 border-indigo-500 rounded-lg text-center font-semibold focus:ring-2 focus:ring-indigo-200"
                            min="0"
                            step="0.01"
                            autoFocus
                          />
                        </div>
                      ) : (
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(service.base_price)}
                        </p>
                      )}
                    </td>

                    {/* Historial */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <History className="w-4 h-4" />
                          <span>{service.priceChanges} cambios</span>
                        </div>
                        {service.lastPriceChange && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>
                              {new Date(service.lastPriceChange).toLocaleDateString('es-ES', {
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Rango */}
                    <td className="px-6 py-4 text-center">
                      <div className="text-xs text-gray-600">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <TrendingUp className="w-3 h-3 text-emerald-600" />
                          <span>{formatCurrency(service.highestPrice)}</span>
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          <TrendingDown className="w-3 h-3 text-red-600" />
                          <span>{formatCurrency(service.lowestPrice)}</span>
                        </div>
                      </div>
                    </td>

                    {/* Acciones */}
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => prepareUpdate(service)}
                            className="p-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg transition-colors"
                            title="Guardar"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                            title="Cancelar"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-center">
                          <button
                            onClick={() => startEdit(service)}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg font-medium transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                            Editar
                          </button>
                        </div>
                      )}
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <DollarSign className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-blue-900 mb-2">
              Single Source of Truth
            </h3>
            <p className="text-sm text-blue-800 mb-3">
              Al actualizar un precio aquí, se sincroniza automáticamente con:
            </p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>✓ Base de datos (tabla services)</li>
              <li>✓ Stripe (nuevo price_id generado)</li>
              <li>✓ Landing page (se muestra el nuevo precio)</li>
              <li>✓ Checkout (cobro actualizado)</li>
              <li>✓ Historial de cambios (auditoría completa)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modal de confirmación */}
      {pendingChange && (
        <PriceConfirmationModal
          isOpen={showConfirmModal}
          onClose={() => {
            setShowConfirmModal(false)
            setPendingChange(null)
          }}
          onConfirm={confirmUpdate}
          service={pendingChange.service}
          impact={pendingChange.impact}
          isLoading={isUpdating}
        />
      )}
    </div>
  )
}
