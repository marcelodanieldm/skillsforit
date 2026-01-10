'use client'

import { motion } from 'framer-motion'
import { FaCheckCircle, FaArrowRight, FaCrown } from 'react-icons/fa'

export default function Pricing() {
  const features = [
    "Análisis completo con IA en 2 minutos",
    "Reporte detallado de 15+ mejoras",
    "Keywords optimizadas para ATS",
    "Ejemplos reales de cada mejora",
    "Comparación antes/después",
    "Recomendaciones de formato",
    "Análisis de skills técnicas",
    "Sugerencias de logros cuantificables",
    "Garantía 100% satisfacción"
  ]

  return (
    <section id="pricing" className="py-20 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Inversión que se paga sola
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Por el precio de un café, consigue hasta <span className="text-green-400 font-bold">3x más entrevistas</span>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl mx-auto"
        >
          {/* Pricing Card */}
          <div className="relative">
            {/* Popular badge */}
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-20">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 font-bold px-6 py-2 rounded-full shadow-xl flex items-center gap-2">
                <FaCrown />
                <span>OFERTA DE LANZAMIENTO</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800 via-blue-900/20 to-slate-800 border-2 border-blue-500 rounded-3xl p-10 shadow-2xl">
              {/* Price */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-4 mb-2">
                  <span className="text-3xl text-gray-400 line-through">USD 25</span>
                  <span className="text-6xl font-bold text-white">USD 7</span>
                </div>
                <p className="text-blue-400 font-semibold text-lg">Pago único • Sin suscripciones</p>
                <p className="text-gray-400 text-sm mt-2">⏰ Precio normal USD 25 • Ahorra 72%</p>
              </div>

              {/* Features */}
              <div className="space-y-4 mb-8">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.05 }}
                    className="flex items-start gap-3"
                  >
                    <FaCheckCircle className="text-green-400 text-xl flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-lg">{feature}</span>
                  </motion.div>
                ))}
              </div>

              {/* CTA Button */}
              <button
                onClick={() => window.location.href = '/upload'}
                className="w-full group px-8 py-6 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold text-2xl rounded-full transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center justify-center gap-3"
              >
                Optimizar mi CV ahora
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Trust indicators */}
              <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Pago seguro</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Entrega instantánea</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Garantía 30 días</span>
                </div>
              </div>
            </div>
          </div>

          {/* Value proposition */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-12 text-center"
          >
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-4">
                ¿Vale la pena invertir USD 7?
              </h3>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <p className="text-4xl font-bold text-green-400 mb-2">+180%</p>
                  <p className="text-gray-300">Más respuestas</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-blue-400 mb-2">2 min</p>
                  <p className="text-gray-300">Tiempo de análisis</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-purple-400 mb-2">15+</p>
                  <p className="text-gray-300">Mejoras concretas</p>
                </div>
              </div>
              <p className="text-gray-400 mt-6">
                💼 Un solo trabajo nuevo pagará esta inversión <span className="text-white font-bold">1,000+ veces</span>
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
