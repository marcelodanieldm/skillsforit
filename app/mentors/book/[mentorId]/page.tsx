'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import MentorBookingView from '@/components/mentor/MentorBookingView'

export default function BookMentorPage() {
  const searchParams = useSearchParams()
  const mentorId = searchParams.get('mentorId') || 'default-mentor-id'
  const mentorName = searchParams.get('mentorName') || 'Mentor'
  const mentorRate = parseFloat(searchParams.get('rate') || '199.99')
  const mentorRating = parseFloat(searchParams.get('rating') || '4.8')

  const [bookingSuccess, setBookingSuccess] = useState(false)

  const handleBookSlot = async (startTime: string, endTime: string) => {
    try {
      // Calcular duración en minutos
      const start = new Date(startTime)
      const end = new Date(endTime)
      const durationMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60))

      const res = await fetch('/api/mentor/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mentor_id: mentorId,
          scheduled_at: startTime,
          duration_minutes: durationMinutes,
          amount: mentorRate,
          status: 'scheduled'
          // user_id se obtendrá del usuario autenticado en el backend
        })
      })

      const data = await res.json()

      if (!data.success) {
        throw new Error(data.error || 'Error al reservar sesión')
      }

      setBookingSuccess(true)
      
      // Redirigir al checkout después de 2 segundos
      setTimeout(() => {
        window.location.href = `/checkout?sessionId=${data.data.id}`
      }, 2000)
    } catch (error: any) {
      throw new Error(error.message || 'Error al procesar la reserva')
    }
  }

  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block bg-green-500/20 p-4 rounded-full mb-4">
            <svg
              className="w-16 h-16 text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">¡Sesión Reservada!</h2>
          <p className="text-slate-400 mb-4">Redirigiendo al pago...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto" />
        </div>
      </div>
    )
  }

  return (
    <MentorBookingView
      mentorId={mentorId}
      mentorName={mentorName}
      mentorRate={mentorRate}
      mentorRating={mentorRating}
      onBookSlot={handleBookSlot}
    />
  )
}
