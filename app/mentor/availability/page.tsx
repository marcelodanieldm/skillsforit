'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, Info, RefreshCw } from 'lucide-react'
import AvailabilityCalendar from '@/components/mentor/AvailabilityCalendar'
import AddAvailabilityModal from '@/components/mentor/AddAvailabilityModal'

interface AvailabilitySlot {
  id: string
  mentor_id: string
  day_of_week: number
  start_time: string
  end_time: string
  slot_duration_minutes: number
  is_active: boolean
}

export default function MentorAvailabilityPage() {
    // Estado para menú lateral
    const [menuOpen, setMenuOpen] = useState(true);

    // Logout handler
    const handleLogout = () => {
      localStorage.removeItem('mentor_token');
      localStorage.removeItem('mentor_user');
      window.location.href = '/mentor/login';
    };
  const [slots, setSlots] = useState<AvailabilitySlot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDay, setSelectedDay] = useState<number>(1)
  const [error, setError] = useState('')

  // TODO: Obtener mentorId del usuario autenticado
  const mentorId = 'YOUR_MENTOR_ID' // Reemplazar con usuario real

  const fetchAvailability = async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/mentor/availability?mentorId=${mentorId}`)
      const data = await res.json()

      if (data.success) {
        setSlots(data.data)
      } else {
        setError(data.error)
      }
    } catch (err: any) {
      setError('Error al cargar disponibilidad')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAvailability()
  }, [])

  const handleAddSlot = (dayOfWeek: number) => {
    setSelectedDay(dayOfWeek)
    setIsModalOpen(true)
  }

  const handleSubmitSlot = async (data: {
    dayOfWeek: number
    startTime: string
    endTime: string
    slotDurationMinutes: number
  }) => {
    try {
      const res = await fetch('/api/mentor/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mentorId,
          ...data
        })
      })

      const result = await res.json()

      if (!result.success) {
        throw new Error(result.error)
      }

      // Refrescar lista
      await fetchAvailability()
    } catch (err: any) {
      throw new Error(err.message || 'Error al crear disponibilidad')
    }
  }

  // Calcular totalSlots como la cantidad de slots activos
  const totalSlots = slots.filter(slot => slot.is_active).length;

  // ...existing code...

  // Calcular días únicos con disponibilidad activa (justo antes del return)
  const daysWithAvailability = Array.from(new Set(
    slots.filter(slot => slot.is_active).map(slot => slot.day_of_week)
  )).length;

  // Eliminar slot por id
  const handleDeleteSlot = async (slotId: string) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/mentor/availability/${slotId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        await fetchAvailability();
      } else {
        setError(data.error || 'Error al eliminar slot');
      }
    } catch (err: any) {
      setError('Error al eliminar slot');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      {/* Menú lateral */}
      <div className={`bg-slate-800 border-r border-purple-700 p-4 flex flex-col transition-all duration-300 ${menuOpen ? 'w-64' : 'w-16'} min-h-full`}>
        <button
          className="mb-6 text-purple-400 hover:text-white focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? '⏴' : '⏵'}
        </button>
        <nav className="flex flex-col gap-4">
          <a href="/mentor/dashboard" className="text-white hover:text-purple-400 font-semibold flex items-center gap-2">
            <Calendar /> {menuOpen && 'Dashboard'}
          </a>
          <a href="/mentor/availability" className="text-white hover:text-purple-400 font-semibold flex items-center gap-2">
            <Clock /> {menuOpen && 'Disponibilidad'}
          </a>
        </nav>
        <button
          className="mt-auto py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all"
          onClick={handleLogout}
        >
          {menuOpen ? 'Cerrar sesión' : '⎋'}
        </button>
      </div>
      {/* Contenido principal */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-emerald-500/20 p-3 rounded-lg">
                    <Calendar className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h1 className="text-3xl font-bold">Gestión de Disponibilidad</h1>
                </div>
                <p className="text-slate-400">
                  Configura tus horarios disponibles para que los alumnos puedan reservar sesiones
                </p>
              </div>

              <button
                onClick={fetchAvailability}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2 rounded-lg transition-colors"
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Actualizar
              </button>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-900 border border-emerald-500/30 rounded-lg p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Slots Disponibles</p>
                  <p className="text-3xl font-bold text-emerald-400">{totalSlots}</p>
                </div>
                <Clock className="w-8 h-8 text-emerald-400/50" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-900 border border-blue-500/30 rounded-lg p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Días Configurados</p>
                  <p className="text-3xl font-bold text-blue-400">{daysWithAvailability}/7</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-400/50" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-900 border border-purple-500/30 rounded-lg p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Horarios Activos</p>
                  <p className="text-3xl font-bold text-purple-400">{slots.length}</p>
                </div>
                <Info className="w-8 h-8 text-purple-400/50" />
              </div>
            </motion.div>
          </div>

          {/* Info Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-8"
          >
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-blue-300 font-medium mb-1">
                  ¿Cómo funciona la disponibilidad?
                </p>
                <p className="text-xs text-slate-400">
                  Los alumnos verán tus horarios disponibles y podrán reservar sesiones en cualquier slot libre.
                  Cada slot representa una sesión de 10 minutos (o la duración que configures). Puedes tener
                  múltiples rangos horarios por día.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Calendar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <RefreshCw className="w-8 h-8 text-slate-400 animate-spin" />
              </div>
            ) : error ? (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
                <p className="text-red-400">{error}</p>
                <button
                  onClick={fetchAvailability}
                  className="mt-4 bg-red-500/20 hover:bg-red-500/30 px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  Reintentar
                </button>
              </div>
            ) : (
              <AvailabilityCalendar
                slots={slots}
                onAddSlot={handleAddSlot}
                onDeleteSlot={handleDeleteSlot}
              />
            )}
          </motion.div>

          {/* Modal */}
          <AddAvailabilityModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleSubmitSlot}
            selectedDay={selectedDay}
          />
        </div>
      </div>
    </div>
  )
}
