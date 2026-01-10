'use client'

import { motion } from 'framer-motion'
import { FaCheckCircle, FaCalendar, FaClock, FaVideo } from 'react-icons/fa'
import { useRouter } from 'next/navigation'

export default function MentorshipSuccessPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-800 rounded-2xl p-8 md:p-12 border-2 border-green-500/50 text-center"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <FaCheckCircle className="text-6xl text-white" />
          </motion.div>

          {/* Success Message */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            ¡Sesión Reservada!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-300 mb-8"
          >
            Tu sesión de mentoría ha sido confirmada
          </motion.p>

          {/* What's Next */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-slate-700 rounded-xl p-6 mb-8 text-left"
          >
            <h2 className="text-xl font-bold text-white mb-4">¿Qué sigue ahora?</h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-purple-500 rounded-lg p-3">
                  <FaCalendar className="text-2xl text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Confirmación por Email</h3>
                  <p className="text-gray-300 text-sm">
                    Recibirás un email con todos los detalles de tu sesión
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-blue-500 rounded-lg p-3">
                  <FaVideo className="text-2xl text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Link de la Reunión</h3>
                  <p className="text-gray-300 text-sm">
                    El link de Google Meet llegará 15 minutos antes de la sesión
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-green-500 rounded-lg p-3">
                  <FaClock className="text-2xl text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Prepárate</h3>
                  <p className="text-gray-300 text-sm">
                    Prepara tus preguntas y objetivos para aprovechar al máximo los 10 minutos
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <button
              onClick={() => router.push('/mentors')}
              className="flex-1 px-6 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-all"
            >
              Reservar Otra Sesión
            </button>
            <button
              onClick={() => router.push('/')}
              className="flex-1 px-6 py-4 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-all"
            >
              Volver al Inicio
            </button>
          </motion.div>

          {/* Additional Info */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-gray-400 text-sm mt-8"
          >
            Si tienes alguna pregunta, contáctanos a support@skillsforit.com
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}
