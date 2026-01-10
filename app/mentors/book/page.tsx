'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  FaCalendar, 
  FaClock, 
  FaDollarSign, 
  FaStar, 
  FaArrowLeft,
  FaCheckCircle 
} from 'react-icons/fa'

interface Mentor {
  id: string
  name: string
  bio: string
  expertise: string[]
  hourlyRate: number
  rating: number
  totalSessions: number
  reviewCount: number
  availability: {
    dayOfWeek: number
    startTime: string
    endTime: string
    timezone: string
  }[]
}

interface TimeSlot {
  date: Date
  time: string
  available: boolean
}

function BookingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mentorId = searchParams.get('mentorId')

  const [mentor, setMentor] = useState<Mentor | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [bookingStep, setBookingStep] = useState<'calendar' | 'form' | 'payment'>('calendar')
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  })

  useEffect(() => {
    if (mentorId) {
      fetchMentor()
    }
  }, [mentorId])

  useEffect(() => {
    if (selectedDate && mentor) {
      generateTimeSlots()
    }
  }, [selectedDate, mentor])

  const fetchMentor = async () => {
    try {
      const response = await fetch(`/api/mentors/get?mentorId=${mentorId}`)
      const data = await response.json()
      
      if (data.success) {
        setMentor(data.mentor)
      }
    } catch (error) {
      console.error('Error fetching mentor:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateTimeSlots = () => {
    if (!selectedDate || !mentor) return

    const dayOfWeek = selectedDate.getDay()
    const mentorAvailability = mentor.availability.find(a => a.dayOfWeek === dayOfWeek)

    if (!mentorAvailability) {
      setAvailableSlots([])
      return
    }

    const slots: TimeSlot[] = []
    const [startHour, startMin] = mentorAvailability.startTime.split(':').map(Number)
    const [endHour, endMin] = mentorAvailability.endTime.split(':').map(Number)

    let currentHour = startHour
    let currentMin = startMin

    while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
      const timeString = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`
      
      slots.push({
        date: selectedDate,
        time: timeString,
        available: true // In production, check against booked sessions
      })

      // Increment by 10 minutes
      currentMin += 10
      if (currentMin >= 60) {
        currentMin = 0
        currentHour += 1
      }
    }

    setAvailableSlots(slots)
  }

  const getNext7Days = () => {
    const days: Date[] = []
    const today = new Date()
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      days.push(date)
    }
    
    return days
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.toDateString() === date2.toDateString()
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
    setBookingStep('form')
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setBookingStep('payment')
  }

  const handlePayment = async () => {
    if (!selectedDate || !selectedTime || !mentor) return

    try {
      const scheduledAt = new Date(selectedDate)
      const [hours, minutes] = selectedTime.split(':')
      scheduledAt.setHours(parseInt(hours), parseInt(minutes))

      const response = await fetch('/api/mentors/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mentorId: mentor.id,
          menteeEmail: formData.email,
          menteeName: formData.name,
          scheduledAt: scheduledAt.toISOString(),
          duration: 10,
          amount: mentor.hourlyRate
        })
      })

      const data = await response.json()

      if (data.success && data.checkoutUrl) {
        // Redirect to Stripe checkout
        window.location.href = data.checkoutUrl
      }
    } catch (error) {
      console.error('Error booking session:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500"></div>
      </div>
    )
  }

  if (!mentor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Mentor no encontrado</div>
      </div>
    )
  }

  const next7Days = getNext7Days()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/mentors')}
          className="flex items-center gap-2 text-gray-300 hover:text-white mb-8 transition-colors"
        >
          <FaArrowLeft />
          Volver a mentores
        </button>

        {/* Mentor Info */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800 rounded-2xl p-8 border-2 border-purple-500/50 mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{mentor.name}</h1>
              <div className="flex items-center gap-2 mb-3">
                <FaStar className="text-yellow-400" />
                <span className="text-white font-bold">{mentor.rating.toFixed(1)}</span>
                <span className="text-gray-400">({mentor.reviewCount} reviews)</span>
              </div>
              <p className="text-gray-300 mb-4">{mentor.bio}</p>
              <div className="flex flex-wrap gap-2">
                {mentor.expertise.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-purple-500/20 text-purple-300 text-sm font-semibold rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end mb-2">
                <FaDollarSign className="text-green-400 text-2xl" />
                <span className="text-4xl font-bold text-green-400">${mentor.hourlyRate}</span>
              </div>
              <div className="text-gray-400">por 10 minutos</div>
            </div>
          </div>
        </motion.div>

        {/* Booking Steps */}
        {bookingStep === 'calendar' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800 rounded-2xl p-8 border-2 border-slate-700"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <FaCalendar className="text-purple-400" />
              Selecciona Fecha y Hora
            </h2>

            {/* Date Selection */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">Elige un día</h3>
              <div className="grid grid-cols-7 gap-2">
                {next7Days.map((day, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedDate(day)}
                    className={`p-4 rounded-lg font-semibold transition-all ${
                      selectedDate && isSameDay(selectedDate, day)
                        ? 'bg-purple-500 text-white border-2 border-purple-400'
                        : 'bg-slate-700 text-gray-300 hover:bg-slate-600 border-2 border-slate-600'
                    }`}
                  >
                    <div className="text-xs mb-1">{formatDate(day).split(',')[0]}</div>
                    <div className="text-lg">{day.getDate()}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slots */}
            {selectedDate && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <FaClock className="text-blue-400" />
                  Horarios disponibles
                </h3>
                
                {availableSlots.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    No hay horarios disponibles para este día
                  </div>
                ) : (
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                    {availableSlots.map((slot, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleTimeSelect(slot.time)}
                        disabled={!slot.available}
                        className={`p-3 rounded-lg font-semibold transition-all ${
                          slot.available
                            ? 'bg-slate-700 text-white hover:bg-purple-600 border-2 border-slate-600 hover:border-purple-500'
                            : 'bg-slate-900 text-gray-600 cursor-not-allowed border-2 border-slate-800'
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {bookingStep === 'form' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800 rounded-2xl p-8 border-2 border-slate-700"
          >
            <h2 className="text-2xl font-bold text-white mb-6">
              Confirma tus Datos
            </h2>

            {/* Summary */}
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-white mb-2">
                <FaCheckCircle className="text-green-400" />
                <span className="font-semibold">Sesión seleccionada:</span>
              </div>
              <div className="text-gray-300">
                {selectedDate && formatDate(selectedDate)} a las {selectedTime} ({10} min)
              </div>
              <div className="text-2xl font-bold text-green-400 mt-2">
                ${mentor.hourlyRate} USD
              </div>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-white font-semibold mb-2">Nombre completo *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  placeholder="Tu nombre"
                />
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  placeholder="tu@email.com"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setBookingStep('calendar')}
                  className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-all"
                >
                  Atrás
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-bold rounded-lg transition-all"
                >
                  Continuar al Pago
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {bookingStep === 'payment' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800 rounded-2xl p-8 border-2 border-slate-700"
          >
            <h2 className="text-2xl font-bold text-white mb-6">
              Confirmar Reserva
            </h2>

            <div className="bg-slate-700 rounded-lg p-6 mb-6 space-y-3">
              <div className="flex justify-between text-white">
                <span>Mentor:</span>
                <span className="font-bold">{mentor.name}</span>
              </div>
              <div className="flex justify-between text-white">
                <span>Fecha:</span>
                <span className="font-bold">{selectedDate && formatDate(selectedDate)}</span>
              </div>
              <div className="flex justify-between text-white">
                <span>Hora:</span>
                <span className="font-bold">{selectedTime}</span>
              </div>
              <div className="flex justify-between text-white">
                <span>Duración:</span>
                <span className="font-bold">10 minutos</span>
              </div>
              <div className="border-t border-slate-600 pt-3 flex justify-between">
                <span className="text-xl font-bold text-white">Total:</span>
                <span className="text-2xl font-bold text-green-400">${mentor.hourlyRate} USD</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setBookingStep('form')}
                className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-all"
              >
                Atrás
              </button>
              <button
                onClick={handlePayment}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-bold text-lg rounded-lg transition-all transform hover:scale-105"
              >
                Pagar con Stripe
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default function BookMentorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500"></div>
      </div>
    }>
      <BookingContent />
    </Suspense>
  )
}
