'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaTicketAlt, FaPlus, FaTrash, FaEdit, FaCopy, FaCheck } from 'react-icons/fa'

interface Coupon {
  id: string
  code: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  expiresAt: string | null
  maxRedemptions: number | null
  timesUsed: number
  active: boolean
  createdAt: string
}

export function CouponManager() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: 15,
    expiresAt: '',
    maxRedemptions: null as number | null
  })

  useEffect(() => {
    fetchCoupons()
  }, [])

  async function fetchCoupons() {
    setLoading(true)
    try {
      const response = await fetch('/api/ceo/coupons')
      const result = await response.json()
      
      if (result.success) {
        setCoupons(result.coupons)
      }
    } catch (error) {
      console.error('Error fetching coupons:', error)
    } finally {
      setLoading(false)
    }
  }

  async function createCoupon(e: React.FormEvent) {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/ceo/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (result.success) {
        setCoupons([result.coupon, ...coupons])
        setShowCreateModal(false)
        // Reset form
        setFormData({
          code: '',
          discountType: 'percentage',
          discountValue: 15,
          expiresAt: '',
          maxRedemptions: null
        })
      } else {
        alert(result.error || 'Error al crear cupón')
      }
    } catch (error) {
      console.error('Error creating coupon:', error)
      alert('Error al crear cupón')
    }
  }

  async function toggleCouponStatus(couponId: string, currentStatus: boolean) {
    try {
      const response = await fetch(`/api/ceo/coupons/${couponId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !currentStatus })
      })

      const result = await response.json()

      if (result.success) {
        setCoupons(coupons.map(c => 
          c.id === couponId ? { ...c, active: !currentStatus } : c
        ))
      }
    } catch (error) {
      console.error('Error toggling coupon status:', error)
    }
  }

  async function deleteCoupon(couponId: string) {
    if (!confirm('¿Eliminar este cupón? Esta acción no se puede deshacer.')) return

    try {
      const response = await fetch(`/api/ceo/coupons/${couponId}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        setCoupons(coupons.filter(c => c.id !== couponId))
      }
    } catch (error) {
      console.error('Error deleting coupon:', error)
    }
  }

  function copyToClipboard(code: string) {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  function generateRandomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const length = 8
    let code = ''
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData({ ...formData, code })
  }

  if (loading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border-2 border-indigo-500/50">
        <div className="flex items-center justify-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          <p className="text-slate-300">Cargando cupones...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border-2 border-indigo-500/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <FaTicketAlt className="text-indigo-400" />
            Gestor de Cupones
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            {coupons.length} cupones totales • {coupons.filter(c => c.active).length} activos
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition"
        >
          <FaPlus />
          Crear Cupón
        </button>
      </div>

      {/* Coupons List */}
      <div className="space-y-3">
        {coupons.length === 0 ? (
          <div className="text-center py-12">
            <FaTicketAlt className="text-6xl text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No hay cupones creados aún</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 text-indigo-400 hover:text-indigo-300"
            >
              Crear el primero →
            </button>
          </div>
        ) : (
          coupons.map((coupon, index) => {
            const isExpired = coupon.expiresAt && new Date(coupon.expiresAt) < new Date()
            const isMaxedOut = coupon.maxRedemptions && coupon.timesUsed >= coupon.maxRedemptions

            return (
              <motion.div
                key={coupon.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-slate-700/50 rounded-xl p-4 border-2 ${
                  !coupon.active || isExpired || isMaxedOut
                    ? 'border-slate-600/30 opacity-60'
                    : 'border-indigo-500/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <code className="text-xl font-bold text-white bg-slate-800/70 px-3 py-1 rounded-lg">
                        {coupon.code}
                      </code>
                      <button
                        onClick={() => copyToClipboard(coupon.code)}
                        className="text-slate-400 hover:text-white transition"
                        title="Copiar código"
                      >
                        {copiedCode === coupon.code ? (
                          <FaCheck className="text-green-400" />
                        ) : (
                          <FaCopy />
                        )}
                      </button>

                      {/* Status badges */}
                      {!coupon.active && (
                        <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full">
                          Inactivo
                        </span>
                      )}
                      {isExpired && (
                        <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full">
                          Expirado
                        </span>
                      )}
                      {isMaxedOut && (
                        <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">
                          Límite alcanzado
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-6 text-sm text-slate-300">
                      <div>
                        <span className="text-slate-400">Descuento:</span>
                        {' '}
                        <span className="text-indigo-400 font-semibold">
                          {coupon.discountType === 'percentage'
                            ? `${coupon.discountValue}%`
                            : `$${coupon.discountValue}`}
                        </span>
                      </div>

                      {coupon.expiresAt && (
                        <div>
                          <span className="text-slate-400">Expira:</span>
                          {' '}
                          {new Date(coupon.expiresAt).toLocaleDateString('es-ES')}
                        </div>
                      )}

                      <div>
                        <span className="text-slate-400">Usos:</span>
                        {' '}
                        {coupon.timesUsed}
                        {coupon.maxRedemptions && ` / ${coupon.maxRedemptions}`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleCouponStatus(coupon.id, coupon.active)}
                      className={`px-4 py-2 rounded-lg font-semibold transition ${
                        coupon.active
                          ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                          : 'bg-slate-600/50 text-slate-400 hover:bg-slate-600/70'
                      }`}
                    >
                      {coupon.active ? 'Activo' : 'Inactivo'}
                    </button>

                    <button
                      onClick={() => deleteCoupon(coupon.id)}
                      className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition"
                      title="Eliminar cupón"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })
        )}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800 rounded-2xl p-6 max-w-md w-full border-2 border-indigo-500/50"
            >
              <h3 className="text-2xl font-bold text-white mb-6">Crear Nuevo Cupón</h3>

              <form onSubmit={createCoupon} className="space-y-4">
                {/* Code */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Código del Cupón
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="VERANO2024"
                      className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                      required
                    />
                    <button
                      type="button"
                      onClick={generateRandomCode}
                      className="bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg transition"
                      title="Generar código aleatorio"
                    >
                      <FaEdit />
                    </button>
                  </div>
                </div>

                {/* Discount Type */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Tipo de Descuento
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value as 'percentage' | 'fixed' })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  >
                    <option value="percentage">Porcentaje (%)</option>
                    <option value="fixed">Monto Fijo ($)</option>
                  </select>
                </div>

                {/* Discount Value */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Valor del Descuento
                  </label>
                  <input
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                    min="1"
                    max={formData.discountType === 'percentage' ? '100' : undefined}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                    required
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    {formData.discountType === 'percentage'
                      ? 'Ej: 15 para 15% de descuento'
                      : 'Ej: 10 para $10 de descuento'}
                  </p>
                </div>

                {/* Expiration Date */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Fecha de Expiración (Opcional)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>

                {/* Max Redemptions */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Máximo de Usos (Opcional)
                  </label>
                  <input
                    type="number"
                    value={formData.maxRedemptions || ''}
                    onChange={(e) => setFormData({ ...formData, maxRedemptions: e.target.value ? Number(e.target.value) : null })}
                    placeholder="Ilimitado"
                    min="1"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-semibold transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                  >
                    Crear Cupón
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
