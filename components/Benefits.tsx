'use client'

import { motion } from 'framer-motion'
import { FaRocket, FaChartLine, FaShieldAlt, FaBolt } from 'react-icons/fa'

export default function Benefits() {
  const benefits = [
    {
      icon: <FaBolt className="text-4xl text-yellow-400" />,
      title: "Análisis en 2 minutos",
      description: "Sube tu CV y recibe un análisis completo con recomendaciones específicas en tiempo real.",
      stat: "120 segundos"
    },
    {
      icon: <FaChartLine className="text-4xl text-green-400" />,
      title: "95% ATS Score",
      description: "Optimizamos tu CV para pasar los filtros automatizados de reclutamiento que usan el 90% de empresas tech.",
      stat: "+180% más entrevistas"
    },
    {
      icon: <FaRocket className="text-4xl text-blue-400" />,
      title: "Skills destacadas",
      description: "Identificamos tus fortalezas técnicas y las presentamos con métricas que impactan a recruiters.",
      stat: "15+ mejoras"
    },
    {
      icon: <FaShieldAlt className="text-4xl text-purple-400" />,
      title: "Garantía satisfacción",
      description: "Si no ves mejoras claras en tu CV, te devolvemos el 100% de tu inversión. Sin preguntas.",
      stat: "100% garantía"
    }
  ]

  return (
    <section className="py-20 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            ¿Por qué <span className="text-blue-400">SkillsForIT</span>?
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            La herramienta más rápida y efectiva para optimizar tu CV tech
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 hover:border-blue-500/50 rounded-2xl p-8 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20"
            >
              <div className="mb-4">{benefit.icon}</div>
              <h3 className="text-2xl font-bold text-white mb-3">{benefit.title}</h3>
              <p className="text-gray-400 mb-4 leading-relaxed">{benefit.description}</p>
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {benefit.stat}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
