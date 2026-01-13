'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, 
  User, 
  Video, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  Star
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Mentor {
  name: string
  email: string
  specialty: string
  bio: string
  availability: any
}

interface MentorshipCardProps {
  id: string
  mentorId: string | null
  mentor: Mentor | null
  sessionsTotal: number
  sessionsLeft: number
  status: 'active' | 'scheduled' | 'completed' | 'cancelled'
  nextSessionAt: string | null
  expiresAt: string
  purchasedAt: string
}

export function MentorshipCard({
  mentor,
  sessionsTotal,
  sessionsLeft,
  status,
  nextSessionAt,
  expiresAt,
  purchasedAt
}: MentorshipCardProps) {
  const router = useRouter()
  const [showBooking, setShowBooking] = useState(false)

  const sessionsUsed = sessionsTotal - sessionsLeft
  const progressPercentage = (sessionsUsed / sessionsTotal) * 100

  const daysUntilExpiry = Math.ceil(
    (new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )

  const getStatusConfig = () => {
    switch (status) {
      case 'active':
        return {
          color: 'green',
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-700',
          badge: 'bg-green-100 text-green-700',
          label: 'Activa'
        }
      case 'scheduled':
        return {
          color: 'blue',
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-700',
          badge: 'bg-blue-100 text-blue-700',
          label: 'Próxima sesión agendada'
        }
      case 'completed':
        return {
          color: 'gray',
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-700',
          badge: 'bg-gray-100 text-gray-700',
          label: 'Completada'
        }
      default:
        return {
          color: 'gray',
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-700',
          badge: 'bg-gray-100 text-gray-700',
          label: 'Inactiva'
        }
    }
  }

  const statusConfig = getStatusConfig()

  const handleBookSession = () => {
    router.push('/mentors/book')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow"
    >
      {/* Header con ícono */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <Video className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                Mentoría 1:1
              </h3>
              <p className="text-emerald-100 text-sm mt-1">
                {sessionsTotal} sesiones de 60 minutos
              </p>
            </div>
          </div>
          
          {/* Badge de estado */}
          <span className={`px-3 py-1 ${statusConfig.badge} backdrop-blur-sm rounded-full text-xs font-medium`}>
            {statusConfig.label}
          </span>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-6 space-y-4">
        {/* Progreso de sesiones */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Progreso de sesiones
            </span>
            <span className="text-sm font-bold text-emerald-600">
              {sessionsUsed} / {sessionsTotal}
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"
            />
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500">
              {sessionsLeft} sesiones disponibles
            </span>
            <span className="text-xs text-gray-500">
              Expira en {daysUntilExpiry} días
            </span>
          </div>
        </div>

        {/* Información del mentor */}
        {mentor && (
          <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-100">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white rounded-full">
                <User className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{mentor.name}</h4>
                <p className="text-sm text-emerald-700 font-medium">
                  {mentor.specialty}
                </p>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                  {mentor.bio}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Próxima sesión */}
        {nextSessionAt && (
          <div className={`flex items-center gap-3 p-4 ${statusConfig.bg} border ${statusConfig.border} rounded-lg`}>
            <Calendar className={`w-5 h-5 ${statusConfig.text} flex-shrink-0`} />
            <div className="flex-1">
              <p className="text-xs text-gray-600 uppercase tracking-wide">
                Próxima sesión
              </p>
              <p className={`text-sm font-semibold ${statusConfig.text}`}>
                {new Date(nextSessionAt).toLocaleDateString('es-ES', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <ChevronRight className={`w-5 h-5 ${statusConfig.text}`} />
          </div>
        )}

        {/* Beneficios */}
        <div className="space-y-2 py-4 border-t border-gray-100">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Qué obtienes:
          </h4>
          {[
            'Sesiones 1:1 por videollamada',
            'Feedback personalizado y actionable',
            'Plan de desarrollo profesional',
            'Seguimiento entre sesiones'
          ].map((benefit, index) => (
            <div key={index} className="flex items-start gap-2">
              <Star className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">{benefit}</span>
            </div>
          ))}
        </div>

        {/* Acciones */}
        {sessionsLeft > 0 ? (
          <div className="space-y-3">
            <motion.button
              onClick={handleBookSession}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all shadow-md hover:shadow-lg"
            >
              <Calendar className="w-5 h-5" />
              Agendar Próxima Sesión
            </motion.button>
            
            {!nextSessionAt && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <p className="text-xs text-amber-800">
                  Recuerda agendar tu sesión antes de que expire tu suscripción
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className={`flex items-center gap-2 p-4 ${statusConfig.bg} border ${statusConfig.border} rounded-lg`}>
              <CheckCircle2 className={`w-5 h-5 ${statusConfig.text} flex-shrink-0`} />
              <p className={`text-sm ${statusConfig.text} font-medium`}>
                Has completado todas tus sesiones
              </p>
            </div>
            <button
              onClick={() => router.push('/soft-skills-guide')}
              className="w-full px-6 py-3 bg-white border-2 border-emerald-200 text-emerald-600 rounded-lg font-medium hover:bg-emerald-50 transition-all"
            >
              Renovar Mentoría
            </button>
          </div>
        )}

        {/* Información de compra */}
        <div className="text-xs text-gray-500 text-center pt-4 border-t border-gray-100">
          Suscripción iniciada el{' '}
          {new Date(purchasedAt).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })}
        </div>
      </div>
    </motion.div>
  )
}
