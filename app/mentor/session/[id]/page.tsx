'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaClock, 
  FaVideo,
  FaFileAlt,
  FaStickyNote,
  FaCheckSquare,
  FaSave,
  FaPaperPlane,
  FaTimes
} from 'react-icons/fa'
import SessionTimer from '@/components/mentor/SessionTimer'
import CVViewer from '@/components/mentor/CVViewer'
import ActionItemsPanel from '@/components/mentor/ActionItemsPanel'

interface SessionData {
  id: string
  student: {
    full_name: string
    email: string
    avatar_url?: string
  }
  student_role: string
  scheduled_at: string
  duration_minutes: number
  status: string
  started_at?: string
  cv_report: {
    id: string
    analysis_result: any
    overall_score: number
  }
  mentor_notes?: string
  action_items?: string[]
}

export default function WarRoomSession() {
  const router = useRouter()
  const params = useParams()
  const sessionId = params.id as string

  const [session, setSession] = useState<SessionData | null>(null)
  const [notes, setNotes] = useState('')
  const [actionItems, setActionItems] = useState<string[]>([])
  const [isSessionActive, setIsSessionActive] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved')
  const [renewalSent, setRenewalSent] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (sessionId) {
      fetchSessionData()
    }
  }, [sessionId])

  useEffect(() => {
    // Autoguardado con debounce (cada 3 segundos después del último cambio)
    const debounceTimer = setTimeout(() => {
      if (notes || actionItems.length > 0) {
        autoSaveNotes()
      }
    }, 3000)

    return () => clearTimeout(debounceTimer)
  }, [notes, actionItems])

  useEffect(() => {
    // Enviar renovación automática en minuto 9
    if (elapsedTime >= 540 && !renewalSent) { // 540 segundos = 9 minutos
      sendRenewalLink()
    }
  }, [elapsedTime])

  const fetchSessionData = async () => {
    try {
      const res = await fetch(`/api/mentor/sessions/${sessionId}`)
      const data = await res.json()

      if (data.success) {
        setSession(data.data)
        setNotes(data.data.mentor_notes || '')
        setActionItems(data.data.action_items || [])
        
        if (data.data.status === 'in_progress') {
          setIsSessionActive(true)
          calculateElapsedTime(data.data.started_at)
        }
      }
    } catch (error) {
      console.error('Error fetching session:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateElapsedTime = (startedAt: string) => {
    const start = new Date(startedAt).getTime()
    const now = new Date().getTime()
    const diff = Math.floor((now - start) / 1000)
    setElapsedTime(diff)

    // Actualizar cada segundo
    const interval = setInterval(() => {
      const currentDiff = Math.floor((new Date().getTime() - start) / 1000)
      setElapsedTime(currentDiff)

      // Auto-completar al llegar a 10 minutos
      if (currentDiff >= 600) {
        completeSession()
        clearInterval(interval)
      }
    }, 1000)
  }

  const startSession = async () => {
    try {
      const res = await fetch(`/api/mentor/sessions/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' })
      })

      const data = await res.json()

      if (data.success) {
        setIsSessionActive(true)
        calculateElapsedTime(data.data.started_at)
      }
    } catch (error) {
      console.error('Error starting session:', error)
    }
  }

  const completeSession = async () => {
    try {
      const res = await fetch(`/api/mentor/sessions/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'complete',
          notes,
          action_items: actionItems
        })
      })

      const data = await res.json()

      if (data.success) {
        setIsSessionActive(false)
        alert('Sesión completada exitosamente')
        router.push('/mentor/dashboard')
      }
    } catch (error) {
      console.error('Error completing session:', error)
    }
  }

  const autoSaveNotes = async () => {
    setAutoSaveStatus('saving')

    try {
      await fetch(`/api/mentor/sessions/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_notes',
          notes,
          action_items: actionItems
        })
      })

      setAutoSaveStatus('saved')
    } catch (error) {
      console.error('Error auto-saving notes:', error)
      setAutoSaveStatus('unsaved')
    }
  }

  const sendRenewalLink = async () => {
    try {
      await fetch(`/api/mentor/sessions/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send_renewal' })
      })

      setRenewalSent(true)
      alert('Link de renovación enviado al alumno')
    } catch (error) {
      console.error('Error sending renewal link:', error)
    }
  }

  const handleActionItemToggle = (item: string, checked: boolean) => {
    if (checked && !actionItems.includes(item)) {
      setActionItems([...actionItems, item])
    } else if (!checked) {
      setActionItems(actionItems.filter(i => i !== item))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando sesión...</div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Sesión no encontrada</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header con Timer */}
      <div className="bg-slate-900 border-b border-slate-800 p-4">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-white">Sala de Guerra</h1>
            <div className="flex items-center gap-2 text-slate-400">
              <FaUser />
              <span>{session.student.full_name}</span>
              <span className="text-slate-600">|</span>
              <span>{session.student_role}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Timer Principal */}
            <SessionTimer 
              elapsedSeconds={elapsedTime}
              maxSeconds={session.duration_minutes * 60}
              isActive={isSessionActive}
            />

            {!isSessionActive ? (
              <button
                onClick={startSession}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors"
              >
                <FaVideo />
                Iniciar Sesión
              </button>
            ) : (
              <button
                onClick={completeSession}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors"
              >
                <FaTimes />
                Finalizar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Layout de 3 Paneles */}
      <div className="max-w-[1920px] mx-auto grid grid-cols-12 gap-4 p-4 h-[calc(100vh-100px)]">
        {/* Panel Izquierdo: CV + Reporte IA */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="col-span-3 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden flex flex-col"
        >
          <div className="bg-slate-800 p-4 border-b border-slate-700">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FaFileAlt className="text-blue-400" />
              Contexto del Alumno
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {session.cv_report ? (
              <CVViewer cvReport={session.cv_report} />
            ) : (
              <div className="text-center py-8">
                <FaFileAlt className="text-6xl text-slate-700 mx-auto mb-4" />
                <p className="text-slate-400">No hay CV disponible</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Panel Central: Video + Integración Zoom */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="col-span-6 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden flex flex-col"
        >
          <div className="bg-slate-800 p-4 border-b border-slate-700">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FaVideo className="text-red-400" />
              Video en Vivo
            </h2>
          </div>

          <div className="flex-1 bg-slate-950 flex items-center justify-center relative">
            {/* Placeholder para integración de Zoom/Video */}
            <div className="text-center">
              <FaVideo className="text-9xl text-slate-800 mx-auto mb-4" />
              <p className="text-slate-500 text-lg">
                Video de la sesión
              </p>
              <p className="text-slate-600 text-sm mt-2">
                Integración con Zoom/Meet próximamente
              </p>
            </div>

            {/* Cronómetro Flotante */}
            <div className="absolute top-4 right-4">
              <SessionTimer 
                elapsedSeconds={elapsedTime}
                maxSeconds={session.duration_minutes * 60}
                isActive={isSessionActive}
                variant="floating"
              />
            </div>
          </div>
        </motion.div>

        {/* Panel Derecho: Notas + Action Items */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="col-span-3 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden flex flex-col"
        >
          <div className="bg-slate-800 p-4 border-b border-slate-700 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FaStickyNote className="text-yellow-400" />
              Notas & Acciones
            </h2>
            <span className={`text-xs px-2 py-1 rounded ${
              autoSaveStatus === 'saved' ? 'bg-green-500/20 text-green-400' :
              autoSaveStatus === 'saving' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {autoSaveStatus === 'saved' ? 'Guardado' :
               autoSaveStatus === 'saving' ? 'Guardando...' :
               'Sin guardar'}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Notas Privadas */}
            <div>
              <label className="text-sm font-semibold text-slate-300 mb-2 block">
                Notas Privadas
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Escribe tus observaciones aquí..."
                className="w-full h-40 bg-slate-800 text-white rounded-lg p-3 border border-slate-700 focus:border-indigo-500 focus:outline-none resize-none"
              />
            </div>

            {/* Action Items */}
            <ActionItemsPanel
              selectedItems={actionItems}
              onToggle={handleActionItemToggle}
            />

            {/* Botón de Renovación */}
            {isSessionActive && elapsedTime >= 540 && (
              <motion.button
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={sendRenewalLink}
                disabled={renewalSent}
                className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors ${
                  renewalSent
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                <FaPaperPlane />
                {renewalSent ? 'Renovación Enviada' : 'Enviar Link de Renovación'}
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
