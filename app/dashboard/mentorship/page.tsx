'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaCalendar, FaClock, FaUser, FaStar, FaCheck, FaArrowLeft } from 'react-icons/fa'
import Link from 'next/link'

interface Mentor {
  id: string
  name: string
  specialty: string
  experience: string
  rating: number
  sessionsCompleted: number
  avatar: string
  bio: string
}

interface TimeSlot {
  id: string
  date: string
  time: string
  available: boolean
}

export default function MentorshipBooking() {
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [bookingStep, setBookingStep] = useState<'mentor' | 'schedule' | 'confirm'>('mentor')
  const [sessionsRemaining, setSessionsRemaining] = useState(4)

  // Mock mentors data
  const mentors: Mentor[] = [
    {
      id: '1',
      name: 'Ana García',
      specialty: 'Desarrollo Full-Stack',
      experience: '8 años',
      rating: 4.9,
      sessionsCompleted: 127,
      avatar: '👩‍💻',
      bio: 'Especialista en React, Node.js y arquitectura de aplicaciones escalables. He ayudado a más de 50 developers a conseguir su primer trabajo en tech.'
    },
    {
      id: '2',
      name: 'Carlos Rodríguez',
      specialty: 'Data Science & ML',
      experience: '6 años',
      rating: 4.8,
      sessionsCompleted: 89,
      avatar: '👨‍🔬',
      bio: 'Experto en Python, machine learning y análisis de datos. Ayudo a profesionales a hacer la transición a roles de data science.'
    },
    {
      id: '3',
      name: 'María López',
      specialty: 'DevOps & Cloud',
      experience: '7 años',
      rating: 4.9,
      sessionsCompleted: 156,
      avatar: '👩‍🚀',
      bio: 'Especialista en AWS, Docker y CI/CD. Te ayudo a dominar las tecnologías cloud y procesos de desarrollo modernos.'
    }
  ]

  // Mock available time slots
  const timeSlots: TimeSlot[] = [
    { id: '1', date: '2024-01-15', time: '10:00', available: true },
    { id: '2', date: '2024-01-15', time: '14:00', available: true },
    { id: '3', date: '2024-01-16', time: '11:00', available: true },
    { id: '4', date: '2024-01-16', time: '16:00', available: true },
    { id: '5', date: '2024-01-17', time: '09:00', available: true },
    { id: '6', date: '2024-01-17', time: '15:00', available: true }
  ]

  const handleMentorSelect = (mentor: Mentor) => {
    setSelectedMentor(mentor)
    setBookingStep('schedule')
  }

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot)
    setBookingStep('confirm')
  }

  const handleBookingConfirm = async () => {
    // Here we would integrate with the booking system
    alert('Sesión agendada exitosamente. Recibirás un email de confirmación.')
    setSessionsRemaining(prev => prev - 1)
    // Reset to mentor selection
    setSelectedMentor(null)
    setSelectedSlot(null)
    setBookingStep('mentor')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/ebook"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <FaArrowLeft />
              Volver al Dashboard
            </Link>
          </div>
          <div className="mt-4">
            <h1 className="text-2xl font-bold text-gray-900">Agendar Sesión de Mentoría</h1>
            <p className="text-gray-600">Sesiones restantes: <span className="font-semibold text-purple-600">{sessionsRemaining}</span></p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                bookingStep === 'mentor' ? 'bg-purple-500 text-white' :
                ['schedule', 'confirm'].includes(bookingStep) ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                <FaUser className="text-sm" />
              </div>
              <div className={`w-16 h-1 ${
                ['schedule', 'confirm'].includes(bookingStep) ? 'bg-green-500' : 'bg-gray-300'
              }`}></div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                bookingStep === 'schedule' ? 'bg-purple-500 text-white' :
                bookingStep === 'confirm' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                <FaCalendar className="text-sm" />
              </div>
              <div className={`w-16 h-1 ${
                bookingStep === 'confirm' ? 'bg-green-500' : 'bg-gray-300'
              }`}></div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                bookingStep === 'confirm' ? 'bg-purple-500 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                <FaCheck className="text-sm" />
              </div>
            </div>
          </div>
          <div className="flex justify-center mt-4 text-sm text-gray-600">
            <span className={bookingStep === 'mentor' ? 'font-semibold text-purple-600' : ''}>Seleccionar Mentor</span>
            <span className="mx-4">→</span>
            <span className={bookingStep === 'schedule' ? 'font-semibold text-purple-600' : ''}>Elegir Horario</span>
            <span className="mx-4">→</span>
            <span className={bookingStep === 'confirm' ? 'font-semibold text-purple-600' : ''}>Confirmar</span>
          </div>
        </div>

        {/* Step Content */}
        <motion.div
          key={bookingStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {bookingStep === 'mentor' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Selecciona tu Mentor</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mentors.map((mentor) => (
                  <motion.div
                    key={mentor.id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
                    onClick={() => handleMentorSelect(mentor)}
                  >
                    <div className="text-center mb-4">
                      <div className="text-4xl mb-2">{mentor.avatar}</div>
                      <h3 className="font-bold text-gray-900">{mentor.name}</h3>
                      <p className="text-sm text-purple-600 font-medium">{mentor.specialty}</p>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Experiencia:</span>
                        <span className="font-medium">{mentor.experience}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Rating:</span>
                        <div className="flex items-center gap-1">
                          <FaStar className="text-yellow-500" />
                          <span className="font-medium">{mentor.rating}</span>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Sesiones:</span>
                        <span className="font-medium">{mentor.sessionsCompleted}</span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 text-center">{mentor.bio}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {bookingStep === 'schedule' && selectedMentor && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Elegir Horario con {selectedMentor.name}</h2>
                <p className="text-gray-600">Selecciona un horario disponible para tu sesión de 10 minutos</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {timeSlots.filter(slot => slot.available).map((slot) => (
                  <motion.div
                    key={slot.id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-purple-300"
                    onClick={() => handleSlotSelect(slot)}
                  >
                    <div className="flex items-center gap-3">
                      <FaClock className="text-purple-500" />
                      <div>
                        <p className="font-medium text-gray-900">{formatDate(slot.date)}</p>
                        <p className="text-sm text-gray-600">{slot.time} hs</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setBookingStep('mentor')}
                  className="text-purple-600 hover:text-purple-800 font-medium"
                >
                  ← Cambiar de mentor
                </button>
              </div>
            </div>
          )}

          {bookingStep === 'confirm' && selectedMentor && selectedSlot && (
            <div className="max-w-md mx-auto">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Confirmar Sesión</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mentor:</span>
                    <span className="font-medium">{selectedMentor.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Especialidad:</span>
                    <span className="font-medium">{selectedMentor.specialty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fecha:</span>
                    <span className="font-medium">{formatDate(selectedSlot.date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hora:</span>
                    <span className="font-medium">{selectedSlot.time} hs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duración:</span>
                    <span className="font-medium">10 minutos</span>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800">
                    <strong>Recuerda:</strong> Prepara tus preguntas específicas antes de la sesión.
                    El mentor te enviará recordatorios por email y confirmación por WhatsApp.
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleBookingConfirm}
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <FaCheck />
                    Confirmar Sesión
                  </button>

                  <button
                    onClick={() => setBookingStep('schedule')}
                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Cambiar horario
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}