'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import { 
  FaCalendar, 
  FaCheckCircle, 
  FaClock, 
  FaStar, 
  FaUser, 
  FaDollarSign,
  FaNotesMedical,
  FaHistory,
  FaEdit
} from 'react-icons/fa'
import QuickFeedbackEditor from '@/components/QuickFeedbackEditor'

interface SessionNote {
  id: string
  sessionId: string
  mentorId: string
  content: string
  topics: string[]
  actionItems: string[]
  nextSteps: string[]
  createdAt: Date
}

interface MentorshipSession {
  id: string
  mentorId: string
  menteeEmail: string
  menteeName?: string
  scheduledAt: Date
  duration: number
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show'
  meetingLink: string
  notes?: SessionNote[]
  previousNote?: SessionNote | null
}

interface MentorData {
  id: string
  name: string
  email: string
  expertise: string[]
  hourlyRate: number
  rating: number
  totalSessions: number
  reviewCount: number
}

function DashboardContent() {
  const searchParams = useSearchParams()
  const mentorId = searchParams.get('id')
  
  const [mentor, setMentor] = useState<MentorData | null>(null)
  const [sessions, setSessions] = useState<MentorshipSession[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSession, setSelectedSession] = useState<MentorshipSession | null>(null)
  const [showQuickFeedback, setShowQuickFeedback] = useState(false)

  useEffect(() => {
    if (mentorId) {
      fetchDashboardData()
    }
  }, [mentorId])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`/api/mentors/dashboard?mentorId=${mentorId}`)
      const data = await response.json()
      
      if (data.success) {
        setMentor(data.mentor)
        setSessions(data.sessions)
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const openQuickFeedback = (session: MentorshipSession) => {
    setSelectedSession(session)
    setShowQuickFeedback(true)
  }

  const saveQuickFeedback = async (data: {
    topics: string[]
    actionItems: string[]
    nextSteps: string[]
    content: string
  }) => {
    if (!selectedSession) return

    const response = await fetch('/api/mentors/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: selectedSession.id,
        mentorId,
        ...data
      })
    })

    if (response.ok) {
      setShowQuickFeedback(false)
      setSelectedSession(null)
      fetchDashboardData()
    } else {
      throw new Error('Failed to save notes')
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('es', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
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

  const upcomingSessions = sessions.filter(s => s.status === 'scheduled')
  const completedSessions = sessions.filter(s => s.status === 'completed')
  const todaySessions = upcomingSessions.filter(s => {
    const sessionDate = new Date(s.scheduledAt)
    const today = new Date()
    return sessionDate.toDateString() === today.toDateString()
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800 rounded-2xl p-8 border-2 border-purple-500/50 mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Panel de Mentor
              </h1>
              <p className="text-xl text-gray-300">Bienvenido, {mentor.name}</p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <FaStar className="text-yellow-400" />
                <span className="text-white font-bold">{mentor.rating.toFixed(1)}</span>
                <span className="text-gray-400">({mentor.reviewCount} reviews)</span>
              </div>
              <div className="flex items-center gap-2">
                <FaDollarSign className="text-green-400" />
                <span className="text-white font-bold">${mentor.hourlyRate}/sesión</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-slate-800 border border-blue-500/50 rounded-xl p-6">
            <FaCalendar className="text-3xl text-blue-400 mb-3" />
            <div className="text-3xl font-bold text-white">{todaySessions.length}</div>
            <div className="text-gray-400">Hoy</div>
          </div>
          <div className="bg-slate-800 border border-purple-500/50 rounded-xl p-6">
            <FaClock className="text-3xl text-purple-400 mb-3" />
            <div className="text-3xl font-bold text-white">{upcomingSessions.length}</div>
            <div className="text-gray-400">Próximas</div>
          </div>
          <div className="bg-slate-800 border border-green-500/50 rounded-xl p-6">
            <FaCheckCircle className="text-3xl text-green-400 mb-3" />
            <div className="text-3xl font-bold text-white">{completedSessions.length}</div>
            <div className="text-gray-400">Completadas</div>
          </div>
          <div className="bg-slate-800 border border-yellow-500/50 rounded-xl p-6">
            <FaUser className="text-3xl text-yellow-400 mb-3" />
            <div className="text-3xl font-bold text-white">{mentor.totalSessions}</div>
            <div className="text-gray-400">Total</div>
          </div>
        </motion.div>

        {/* Upcoming Sessions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <FaCalendar className="text-purple-400" />
            Próximas Sesiones
          </h2>
          
          {upcomingSessions.length === 0 ? (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center">
              <p className="text-gray-400">No tienes sesiones programadas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingSessions.map((session) => (
                <div
                  key={session.id}
                  className="bg-slate-800 border-2 border-slate-700 hover:border-purple-500/50 rounded-xl p-6 transition-all"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FaUser className="text-blue-400" />
                        <h3 className="text-xl font-bold text-white">
                          {session.menteeName || session.menteeEmail}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <FaClock className="text-purple-400" />
                        <span>{formatDate(session.scheduledAt)}</span>
                        <span className="text-gray-500">•</span>
                        <span>{session.duration} min</span>
                      </div>
                      
                      {/* Previous Session Notes Preview */}
                      {session.previousNote && (
                        <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                          <div className="flex items-start gap-2">
                            <FaHistory className="text-yellow-400 mt-1" />
                            <div className="flex-1">
                              <p className="text-yellow-300 font-semibold mb-2">
                                📋 Notas de la sesión anterior:
                              </p>
                              <p className="text-gray-300 text-sm mb-2">
                                {session.previousNote.content.substring(0, 150)}...
                              </p>
                              {session.previousNote.topics.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {session.previousNote.topics.map((topic, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded"
                                    >
                                      {topic}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <a
                        href={session.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all text-center"
                      >
                        Unirse a la Reunión
                      </a>
                      <button
                        onClick={() => openQuickFeedback(session)}
                        className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
                      >
                        <FaNotesMedical />
                        ⚡ Quick Feedback
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Completed Sessions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <FaHistory className="text-green-400" />
            Historial de Sesiones
          </h2>
          
          {completedSessions.length === 0 ? (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center">
              <p className="text-gray-400">No hay sesiones completadas aún</p>
            </div>
          ) : (
            <div className="space-y-4">
              {completedSessions.slice(0, 5).map((session) => (
                <div
                  key={session.id}
                  className="bg-slate-800 border border-green-500/30 rounded-xl p-6"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <FaCheckCircle className="text-green-400" />
                        <h3 className="text-lg font-bold text-white">
                          {session.menteeName || session.menteeEmail}
                        </h3>
                      </div>
                      <div className="text-gray-400 text-sm">
                        {formatDate(session.scheduledAt)}
                      </div>
                      {session.notes && session.notes.length > 0 && (
                        <div className="mt-3">
                          <p className="text-gray-300 text-sm">
                            {session.notes[0].content.substring(0, 100)}...
                          </p>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => openQuickFeedback(session)}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all flex items-center gap-2"
                    >
                      <FaEdit />
                      Ver/Editar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick Feedback Editor Modal */}
      {showQuickFeedback && selectedSession && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-7xl my-8"
          >
            <div className="mb-4 flex justify-end">
              <button
                onClick={() => {
                  setShowQuickFeedback(false)
                  setSelectedSession(null)
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all"
              >
                ✕ Cerrar
              </button>
            </div>
            <QuickFeedbackEditor
              sessionId={selectedSession.id}
              mentorId={mentorId!}
              onSave={saveQuickFeedback}
              initialTopics={selectedSession.notes?.[0]?.topics || []}
              initialActionItems={selectedSession.notes?.[0]?.actionItems || []}
              initialNextSteps={selectedSession.notes?.[0]?.nextSteps || []}
              initialContent={selectedSession.notes?.[0]?.content || ''}
            />
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default function MentorDashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500"></div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}
