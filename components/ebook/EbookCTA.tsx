'use client'

import { motion } from 'framer-motion'
import { FaBookOpen, FaArrowRight, FaShieldAlt, FaClock } from 'react-icons/fa'

export default function EbookCTA() {
  const goToCheckout = () => {
    window.location.href = '/ebook/checkout'
  }

  return (
    <section className="py-20 bg-gradient-to-r from-orange-600 to-red-600">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            ¿Cuánto tiempo más vas a esperar?
          </h2>

          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Cada día que pasa sin estas habilidades, estás dejando dinero sobre la mesa.
            Los recruiters están contratando a otros mientras tú dudas.
          </p>

          {/* Pricing Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-8 mb-8 max-w-md mx-auto shadow-2xl"
          >
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-900 mb-2">
                USD 7
              </div>
              <div className="text-gray-600 mb-6">
                Una sola vez, acceso perpetuo
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-left">
                  <FaBookOpen className="text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">8 capítulos completos con ejercicios</span>
                </div>
                <div className="flex items-center gap-3 text-left">
                  <FaBookOpen className="text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Formatos PDF y EPUB</span>
                </div>
                <div className="flex items-center gap-3 text-left">
                  <FaShieldAlt className="text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Garantía de devolución 30 días</span>
                </div>
                <div className="flex items-center gap-3 text-left">
                  <FaClock className="text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Acceso inmediato tras el pago</span>
                </div>
              </div>

              <button
                onClick={goToCheckout}
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <span className="flex items-center justify-center gap-3">
                  <FaBookOpen />
                  Obtener Mi Guía Ahora
                  <FaArrowRight />
                </span>
              </button>
            </div>
          </motion.div>

          {/* Urgency Elements */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <div className="flex flex-wrap justify-center gap-6 text-orange-200">
              <div className="flex items-center gap-2">
                <FaClock className="text-orange-300" />
                <span>Acceso en menos de 2 minutos</span>
              </div>
              <div className="flex items-center gap-2">
                <FaShieldAlt className="text-orange-300" />
                <span>Pago 100% seguro</span>
              </div>
            </div>

            <p className="text-orange-200 text-sm max-w-2xl mx-auto">
              🔥 <strong>Bonus especial:</strong> Si compras hoy, recibirás gratis el Capítulo 9
              "Negociación avanzada" cuando lo lancemos en 30 días.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}