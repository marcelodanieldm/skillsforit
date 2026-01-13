'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Trash2, Plus } from 'lucide-react'

interface AvailabilitySlot {
  id: string
  day_of_week: number
  start_time: string
  end_time: string
  slot_duration_minutes: number
  is_active: boolean
}

interface AvailabilityCalendarProps {
  slots: AvailabilitySlot[]
  onAddSlot: (dayOfWeek: number) => void
  onDeleteSlot: (slotId: string) => void
}

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const DAY_ABBR = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

export default function AvailabilityCalendar({
  slots,
  onAddSlot,
  onDeleteSlot
}: AvailabilityCalendarProps) {
  const [hoveredDay, setHoveredDay] = useState<number | null>(null)

  // Agrupar slots por día de la semana
  const slotsByDay = slots.reduce((acc, slot) => {
    if (!acc[slot.day_of_week]) {
      acc[slot.day_of_week] = []
    }
    acc[slot.day_of_week].push(slot)
    return acc
  }, {} as Record<number, AvailabilitySlot[]>)

  // Formatear tiempo HH:MM:SS a HH:MM
  const formatTime = (time: string) => {
    return time.slice(0, 5)
  }

  // Calcular número de slots por día
  const calculateSlotsCount = (startTime: string, endTime: string, duration: number) => {
    const start = new Date(`1970-01-01T${startTime}`)
    const end = new Date(`1970-01-01T${endTime}`)
    const diffMinutes = (end.getTime() - start.getTime()) / (1000 * 60)
    return Math.floor(diffMinutes / duration)
  }

  return (
    <div className="w-full">
      {/* Vista Desktop: Grid de 7 columnas */}
      <div className="hidden lg:grid lg:grid-cols-7 gap-4">
        {DAYS.map((day, index) => {
          const daySlots = slotsByDay[index] || []
          const hasSlots = daySlots.length > 0

          return (
            <motion.div
              key={index}
              className={`relative bg-slate-900 border rounded-lg p-4 min-h-[200px] transition-colors ${
                hasSlots ? 'border-emerald-500/30' : 'border-slate-800'
              }`}
              onMouseEnter={() => setHoveredDay(index)}
              onMouseLeave={() => setHoveredDay(null)}
              whileHover={{ scale: 1.02 }}
            >
              {/* Header del día */}
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white">{day}</h3>
                {hasSlots && (
                  <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full">
                    {daySlots.reduce(
                      (total, slot) =>
                        total + calculateSlotsCount(slot.start_time, slot.end_time, slot.slot_duration_minutes),
                      0
                    )}{' '}
                    slots
                  </span>
                )}
              </div>

              {/* Lista de slots */}
              <div className="space-y-2">
                <AnimatePresence>
                  {daySlots.map((slot) => (
                    <motion.div
                      key={slot.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="group relative bg-slate-800/50 border border-slate-700 rounded-lg p-3 hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span className="text-xs font-medium text-slate-300">
                              {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            {calculateSlotsCount(slot.start_time, slot.end_time, slot.slot_duration_minutes)} slots de{' '}
                            {slot.slot_duration_minutes} min
                          </p>
                        </div>

                        {/* Botón eliminar (visible en hover) */}
                        <button
                          onClick={() => onDeleteSlot(slot.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/20 rounded"
                          title="Eliminar disponibilidad"
                        >
                          <Trash2 className="w-3 h-3 text-red-400" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Botón agregar (visible en hover o cuando no hay slots) */}
              <AnimatePresence>
                {(hoveredDay === index || !hasSlots) && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    onClick={() => onAddSlot(index)}
                    className="absolute bottom-4 left-4 right-4 flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 py-2 rounded-lg text-sm transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar horario
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>

      {/* Vista Mobile: Lista vertical */}
      <div className="lg:hidden space-y-3">
        {DAYS.map((day, index) => {
          const daySlots = slotsByDay[index] || []
          const hasSlots = daySlots.length > 0

          return (
            <div
              key={index}
              className={`bg-slate-900 border rounded-lg p-4 ${
                hasSlots ? 'border-emerald-500/30' : 'border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-white">{day}</h3>
                <button
                  onClick={() => onAddSlot(index)}
                  className="flex items-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded text-sm"
                >
                  <Plus className="w-3 h-3" />
                  Agregar
                </button>
              </div>

              {hasSlots ? (
                <div className="space-y-2">
                  {daySlots.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex items-center justify-between bg-slate-800/50 border border-slate-700 rounded-lg p-3"
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-sm font-medium text-slate-300">
                            {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                          </p>
                          <p className="text-xs text-slate-500">
                            {calculateSlotsCount(slot.start_time, slot.end_time, slot.slot_duration_minutes)} slots
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => onDeleteSlot(slot.id)}
                        className="p-2 hover:bg-red-500/20 rounded"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">Sin horarios configurados</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
