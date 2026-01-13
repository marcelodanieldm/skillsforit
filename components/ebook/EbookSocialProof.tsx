'use client'

import { motion } from 'framer-motion'
import { FaQuoteLeft, FaStar, FaCheckCircle } from 'react-icons/fa'

const testimonials = [
  {
    name: "Carlos M.",
    role: "Senior Frontend Dev",
    company: "TechCorp",
    content: "Esta guía cambió mi forma de enfrentar las entrevistas. Pasé de ser rechazado constantemente a tener ofertas de 3 empresas diferentes.",
    rating: 5,
    improvement: "+40% salario"
  },
  {
    name: "Ana G.",
    role: "Full Stack Developer",
    company: "StartupXYZ",
    content: "Las técnicas de storytelling me ayudaron a destacar mis proyectos. Los recruiters ahora me contactan primero a mí.",
    rating: 5,
    improvement: "3 ofertas simultáneas"
  },
  {
    name: "Miguel R.",
    role: "DevOps Engineer",
    company: "CloudTech",
    content: "Nunca pensé que las soft skills fueran tan importantes. Esta guía me abrió los ojos y mejoró mi carrera significativamente.",
    rating: 5,
    improvement: "Ascenso a Senior"
  }
]

const stats = [
  { number: "1,200+", label: "Desarrolladores capacitados" },
  { number: "85%", label: "Más entrevistas obtenidas" },
  { number: "4.9/5", label: "Calificación promedio" },
  { number: "67%", label: "Aumento salarial promedio" }
]

export default function EbookSocialProof() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Más de{' '}
            <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
              1,200 desarrolladores
            </span>{' '}
            ya tienen esta guía
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Únete a la comunidad de profesionales que transformaron su carrera
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-orange-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Lo que dicen nuestros lectores
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400 text-sm" />
                  ))}
                </div>

                <FaQuoteLeft className="text-orange-300 text-2xl mb-4" />

                <p className="text-gray-700 mb-4 leading-relaxed">
                  "{testimonial.content}"
                </p>

                <div className="border-t border-gray-200 pt-4">
                  <div className="font-semibold text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {testimonial.role} en {testimonial.company}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <FaCheckCircle className="text-green-500 text-sm" />
                    <span className="text-sm font-medium text-green-600">
                      {testimonial.improvement}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Trust Signals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8 border border-gray-200">
            <div className="flex flex-wrap justify-center items-center gap-8 mb-6">
              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-green-500" />
                <span className="text-gray-700 font-medium">Acceso inmediato</span>
              </div>
              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-green-500" />
                <span className="text-gray-700 font-medium">PDF + EPUB incluidos</span>
              </div>
              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-green-500" />
                <span className="text-gray-700 font-medium">Actualizaciones gratuitas</span>
              </div>
              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-green-500" />
                <span className="text-gray-700 font-medium">Garantía de 30 días</span>
              </div>
            </div>

            <p className="text-gray-600 text-lg">
              Miles de desarrolladores ya están aplicando estas estrategias.
              ¿Estás listo para ser el siguiente?
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}