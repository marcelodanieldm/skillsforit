'use client'

import { motion } from 'framer-motion'
import { FaStar, FaQuoteLeft } from 'react-icons/fa'

export default function Testimonials() {
  const testimonials = [
    {
      name: "Carlos Mendoza",
      role: "Full Stack Developer",
      company: "Contratado en TechCorp",
      image: "👨‍💻",
      rating: 5,
      text: "Después de usar SkillsForIT, pasé de 0 respuestas a 7 entrevistas en 2 semanas. Las mejoras en mi CV fueron específicas y fáciles de aplicar. Totalmente vale la pena.",
      highlight: "7 entrevistas en 2 semanas"
    },
    {
      name: "María González",
      role: "Frontend Developer",
      company: "Ahora en Startup FinTech",
      image: "👩‍💻",
      rating: 5,
      text: "El análisis mostró errores que nunca había notado. Mis skills estaban mal presentadas y no pasaban los filtros ATS. Ahora tengo el trabajo que quería con 30% más de salario.",
      highlight: "+30% salario"
    },
    {
      name: "Diego Ramírez",
      role: "Backend Developer",
      company: "Senior en CloudServices",
      image: "🧑‍💻",
      rating: 5,
      text: "USD 7 fue la mejor inversión de mi carrera. El reporte me ayudó a destacar mis logros con métricas reales. Los recruiters ahora me contactan directamente en LinkedIn.",
      highlight: "Recruiters me contactan"
    }
  ]

  return (
    <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Historias de éxito
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Profesionales IT como tú ya están consiguiendo más entrevistas y mejores ofertas
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="bg-slate-800 border border-slate-700 rounded-2xl p-8 hover:border-blue-500/50 transition-all duration-300 hover:transform hover:scale-105"
            >
              {/* Quote icon */}
              <FaQuoteLeft className="text-3xl text-blue-400/30 mb-4" />

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <FaStar key={i} className="text-yellow-400" />
                ))}
              </div>

              {/* Testimonial text */}
              <p className="text-gray-300 leading-relaxed mb-6">
                "{testimonial.text}"
              </p>

              {/* Highlight badge */}
              <div className="inline-block px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 font-semibold text-sm mb-6">
                🎯 {testimonial.highlight}
              </div>

              {/* Author */}
              <div className="flex items-center gap-4 pt-6 border-t border-slate-700">
                <div className="text-4xl">{testimonial.image}</div>
                <div>
                  <h4 className="text-white font-semibold">{testimonial.name}</h4>
                  <p className="text-gray-400 text-sm">{testimonial.role}</p>
                  <p className="text-blue-400 text-sm">{testimonial.company}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-8 px-8 py-4 bg-slate-800/50 border border-slate-700 rounded-full">
            <div>
              <p className="text-3xl font-bold text-white">500+</p>
              <p className="text-gray-400 text-sm">CVs optimizados</p>
            </div>
            <div className="w-px h-12 bg-slate-700"></div>
            <div>
              <p className="text-3xl font-bold text-white">4.9/5</p>
              <p className="text-gray-400 text-sm">Calificación</p>
            </div>
            <div className="w-px h-12 bg-slate-700"></div>
            <div>
              <p className="text-3xl font-bold text-white">98%</p>
              <p className="text-gray-400 text-sm">Satisfacción</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
