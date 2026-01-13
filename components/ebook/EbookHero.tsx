'use client'

import { motion } from 'framer-motion'
import { FaBookOpen, FaArrowRight, FaUsers, FaStar } from 'react-icons/fa'

export default function EbookHero() {
  const scrollToIndex = () => {
    document.getElementById('ebook-index')?.scrollIntoView({ behavior: 'smooth' })
  }

  const goToCheckout = () => {
    window.location.href = '/ebook/checkout'
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-red-900 via-orange-900 to-red-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          {/* ATTENTION - Headline agresivo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-400/30 rounded-full text-red-300 text-sm font-medium mb-6">
              <FaUsers className="text-red-400" />
              <span>¡ALERTA! El 70% de las entrevistas IT se pierden por Soft Skills</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight"
          >
            No por código, sino por la{' '}
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              psicología del reclutador
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed"
          >
            Domina las soft skills que realmente importan en el mundo IT.
            Aprende a comunicarte, contar historias y convencer a los recruiters
            de que eres el candidato perfecto.
          </motion.p>

          {/* Social Proof Numbers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex justify-center gap-8 mb-10"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-white">1,200+</div>
              <div className="text-gray-400 text-sm">Desarrolladores</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">85%</div>
              <div className="text-gray-400 text-sm">Más entrevistas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">4.9/5</div>
              <div className="text-gray-400 text-sm flex items-center justify-center gap-1">
                <FaStar className="text-yellow-400" />
                Rating
              </div>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <button
              onClick={goToCheckout}
              className="group bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <span className="flex items-center gap-3">
                <FaBookOpen />
                Obtener Guía Completa - USD 7
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </span>
            </button>

            <button
              onClick={scrollToIndex}
              className="text-gray-300 hover:text-white font-medium py-4 px-8 rounded-lg border border-gray-600 hover:border-gray-400 transition-all duration-300"
            >
              Ver Contenido de la Guía
            </button>
          </motion.div>

          {/* Urgency Element */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-center"
          >
            <p className="text-gray-400 text-sm">
              ⏰ Oferta limitada: Incluye actualización gratuita cuando lancemos el Capítulo 8
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}