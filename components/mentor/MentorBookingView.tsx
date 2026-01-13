'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, User, Star, ChevronLeft, ChevronRight, Check } from 'lucide-react'

interface TimeSlot {
  startTime: string
  endTime: string
  isAvailable: boolean
}

interface SlotsData {
  date: string
  dayOfWeek: number
  totalSlots: number
  availableSlots: number
  slots: TimeSlot[]
}

interface MentorBookingViewProps {
  mentorId: string
  mentorName: string
  mentorRate: number
  mentorRating?: number
  onBookSlot: (startTime: string, endTime: string) => Promise<void>
}

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

export default function MentorBookingView({
  mentorId,
  mentorName,
  mentorRate,
  mentorRating = 4.8,
  onBookSlot
}: MentorBookingViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [slotsData, setSlotsData] = useState<SlotsData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [isBooking, setIsBooking] = useState(false)

  useEffect(() => {
    fetchAvailableSlots(selectedDate)
  }, [selectedDate, mentorId])

  const fetchAvailableSlots = async (date: Date) => {
    setIsLoading(true)
    try {
      const dateStr = date.toISOString().split('T')[0] // YYYY-MM-DD
      const res = await fetch(`/api/mentor/available-slots?mentorId=${mentorId}&date=${dateStr}`)
      const data = await res.json()

      if (data.success) {
        setSlotsData(data.data)
      }
    } catch (error) {
      console.error('Error fetching slots:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDateChange = (days: number) => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + days)
    setSelectedDate(newDate)
    setSelectedSlot(null)
  }

  const handleBooking = async () => {
    if (!selectedSlot) return

    setIsBooking(true)
    try {
      await onBookSlot(selectedSlot.startTime, selectedSlot.endTime)
      // Refrescar slots después de reservar
      await fetchAvailableSlots(selectedDate)
      setSelectedSlot(null)
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    } finally {
      setIsBooking(false)
    }
  }

  const formatTime = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', hour12: false })
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isPastDate = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  // Agrupar slots por hora (grupos de 6 slots = 1 hora si son de 10 min)
  const groupedSlots: { hour: string; slots: TimeSlot[] }[] = []
  
  if (slotsData && slotsData.slots.length > 0) {
    let currentHour = ''
    let currentGroup: TimeSlot[] = []

    slotsData.slots.forEach((slot) => {
      const hour = formatTime(slot.startTime).split(':')[0] + ':00'
      
      if (hour !== currentHour) {
        if (currentGroup.length > 0) {
          groupedSlots.push({ hour: currentHour, slots: currentGroup })
        }
        currentHour = hour
        currentGroup = [slot]
      } else {
        currentGroup.push(slot)
      }
    })

    if (currentGroup.length > 0) {
      groupedSlots.push({ hour: currentHour, slots: currentGroup })
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header del Mentor */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-purple-500/20 p-3 rounded-full">
                <User className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{mentorName}</h1>
                <div className="flex items-center gap-4 mt-1">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm text-slate-400">{mentorRating.toFixed(1)}</span>
                  </div>
                  <span className="text-slate-500">•</span>
                  <span className="text-sm text-slate-400">${mentorRate} / sesión</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Selector de Fecha */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-1"
          >
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-400" />
                  Fecha
                </h2>
              </div>

              {/* Navegación de fecha */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => handleDateChange(-1)}
                  disabled={isPastDate(new Date(selectedDate.getTime() - 86400000))}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <div className="text-center">
                  <div className="text-sm text-slate-400">
                    {DAYS[selectedDate.getDay()]}
                  </div>
                  <div className="text-2xl font-bold">
                    {selectedDate.getDate()} {MONTHS[selectedDate.getMonth()]}
                  </div>
                  {isToday(selectedDate) && (
                    <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">
                      Hoy
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleDateChange(1)}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Quick stats */}
              {slotsData && (
                <div className="space-y-2 pt-4 border-t border-slate-800">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Total slots:</span>
                    <span className="font-medium">{slotsData.totalSlots}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Disponibles:</span>
                    <span className="font-medium text-green-400">{slotsData.availableSlots}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Reservados:</span>
                    <span className="font-medium text-red-400">
                      {slotsData.totalSlots - slotsData.availableSlots}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Lista de Slots */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-2"
          >
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-emerald-400" />
                Horarios Disponibles
              </h2>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
                </div>
              ) : !slotsData || slotsData.slots.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">No hay horarios disponibles para este día</p>
                  <p className="text-sm text-slate-500 mt-1">Prueba con otra fecha</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {groupedSlots.map((group, groupIdx) => (
                    <div key={groupIdx}>
                      <div className="text-xs text-slate-500 font-medium mb-2 sticky top-0 bg-slate-900 py-1">
                        {group.hour}
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {group.slots.map((slot, slotIdx) => {
                          const isSelected =
                            selectedSlot?.startTime === slot.startTime &&
                            selectedSlot?.endTime === slot.endTime

                          return (
                            <button
                              key={slotIdx}
                              onClick={() => slot.isAvailable && setSelectedSlot(slot)}
                              disabled={!slot.isAvailable}
                              className={`relative p-3 rounded-lg text-sm font-medium transition-all ${
                                isSelected
                                  ? 'bg-purple-500 text-white ring-2 ring-purple-400'
                                  : slot.isAvailable
                                  ? 'bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-emerald-500/50 text-slate-300'
                                  : 'bg-slate-800/30 border border-slate-800 text-slate-600 cursor-not-allowed'
                              }`}
                            >
                              {formatTime(slot.startTime)}
                              {isSelected && (
                                <Check className="absolute top-1 right-1 w-3 h-3" />
                              )}
                              {!slot.isAvailable && (
                                <div className="absolute inset-0 bg-slate-900/50 rounded-lg flex items-center justify-center">
                                  <span className="text-xs">Ocupado</span>
                                </div>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Botón de reserva */}
              <AnimatePresence>
                {selectedSlot && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="mt-6 pt-6 border-t border-slate-800"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-slate-400">Horario seleccionado:</p>
                        <p className="text-lg font-bold">
                          {formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-400">Precio:</p>
                        <p className="text-2xl font-bold text-green-400">${mentorRate}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleBooking}
                      disabled={isBooking}
                      className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:from-slate-700 disabled:to-slate-700 text-white py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                    >
                      {isBooking ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                          Reservando...
                        </>
                      ) : (
                        <>
                          <Check className="w-5 h-5" />
                          Reservar Sesión
                        </>
                      )}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
