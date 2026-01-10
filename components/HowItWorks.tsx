'use client'

import { motion } from 'framer-motion'
import { FaUpload, FaMagic, FaDownload, FaCheckCircle } from 'react-icons/fa'

export default function HowItWorks() {
  const steps = [
    {
      icon: <FaUpload className="text-5xl text-blue-400" />,
      number: "01",
      title: "Sube tu CV",
      description: "Arrastra tu CV actual o pega el contenido. Aceptamos PDF, Word o texto."
    },
    {
      icon: <FaMagic className="text-5xl text-purple-400" />,
      number: "02",
      title: "Análisis con IA",
      description: "Nuestra IA analiza skills, formato, keywords ATS y compara con CVs exitosos del sector IT."
    },
    {
      icon: <FaCheckCircle className="text-5xl text-green-400" />,
      number: "03",
      title: "Recomendaciones",
      description: "Recibes un reporte detallado con mejoras específicas y ejemplos reales para cada sección."
    },
    {
      icon: <FaDownload className="text-5xl text-yellow-400" />,
      number: "04",
      title: "Aplica y destaca",
      description: "Implementa las mejoras y observa cómo aumentan tus respuestas a aplicaciones."
    }
  ]

  return (
    <section className="py-20 bg-gradient-to-b from-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Cómo funciona
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Solo 4 pasos para transformar tu CV en una herramienta que genera entrevistas
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connection lines */}
          <div className="hidden lg:block absolute top-1/4 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-yellow-500 opacity-20"></div>

          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="relative"
            >
              {/* Step number badge */}
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg z-10">
                {step.number}
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 pt-12 h-full hover:border-blue-500/50 transition-all duration-300 hover:transform hover:scale-105">
                <div className="mb-6 flex justify-center">{step.icon}</div>
                <h3 className="text-2xl font-bold text-white mb-4 text-center">{step.title}</h3>
                <p className="text-gray-400 text-center leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-400 text-lg mb-4">
            ⏱️ Todo el proceso toma menos de <span className="text-white font-bold">5 minutos</span>
          </p>
        </motion.div>
      </div>
    </section>
  )
}
