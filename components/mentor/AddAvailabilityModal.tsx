'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Clock, Calendar } from 'lucide-react'

interface AddAvailabilityModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    dayOfWeek: number
    startTime: string
    endTime: string
    slotDurationMinutes: number
  }) => Promise<void>
  selectedDay?: number
}

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

export default function AddAvailabilityModal({
  isOpen,
  onClose,
  onSubmit,
  selectedDay = 1
}: AddAvailabilityModalProps) {
  const [dayOfWeek, setDayOfWeek] = useState(selectedDay)
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('17:00')
  const [slotDuration, setSlotDuration] = useState(10)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validaciones
    if (startTime >= endTime) {
      setError('La hora de fin debe ser posterior a la hora de inicio')
      return
    }

    const start = new Date(`1970-01-01T${startTime}:00`)
    const end = new Date(`1970-01-01T${endTime}:00`)
    const diffMinutes = (end.getTime() - start.getTime()) / (1000 * 60)

    if (diffMinutes < slotDuration) {
      setError(`El rango debe ser al menos de ${slotDuration} minutos`)
      return
    }

    setIsLoading(true)

    try {
      await onSubmit({
        dayOfWeek,
        startTime: `${startTime}:00`,
        endTime: `${endTime}:00`,
        slotDurationMinutes: slotDuration
      })
      onClose()
      // Reset form
      setStartTime('09:00')
      setEndTime('17:00')
      setSlotDuration(10)
    } catch (err: any) {
      setError(err.message || 'Error al crear disponibilidad')
    } finally {
      setIsLoading(false)
    }
  }

  const calculateSlots = () => {
    if (!startTime || !endTime || startTime >= endTime) return 0
    const start = new Date(`1970-01-01T${startTime}:00`)
    const end = new Date(`1970-01-01T${endTime}:00`)
    const diffMinutes = (end.getTime() - start.getTime()) / (1000 * 60)
    return Math.floor(diffMinutes / slotDuration)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl w-full max-w-md">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 p-6">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-500/20 p-2 rounded-lg">
                    <Calendar className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Agregar Disponibilidad</h2>
                </div>
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Día de la semana */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Día de la semana
                  </label>
                  <select
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(parseInt(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {DAYS.map((day, index) => (
                      <option key={index} value={index}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Horario */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Hora inicio
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Hora fin
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Duración de slots */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Duración de cada sesión (minutos)
                  </label>
                  <select
                    value={slotDuration}
                    onChange={(e) => setSlotDuration(parseInt(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value={10}>10 minutos</option>
                    <option value={15}>15 minutos</option>
                    <option value={20}>20 minutos</option>
                    <option value={30}>30 minutos</option>
                    <option value={60}>60 minutos</option>
                  </select>
                </div>

                {/* Preview de slots */}
                {calculateSlots() > 0 && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                    <p className="text-sm text-emerald-400">
                      <strong>{calculateSlots()}</strong> slots disponibles de {slotDuration} minutos cada uno
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Los alumnos podrán reservar en cualquiera de estos slots
                    </p>
                  </div>
                )}

                {/* Error message */}
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2.5 rounded-lg transition-colors"
                    disabled={isLoading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || calculateSlots() === 0}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 disabled:text-slate-500 text-white py-2.5 rounded-lg transition-colors font-medium"
                  >
                    {isLoading ? 'Guardando...' : 'Agregar Disponibilidad'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
