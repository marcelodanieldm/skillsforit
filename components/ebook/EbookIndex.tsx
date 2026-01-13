'use client'

import { motion } from 'framer-motion'
import {
  FaBrain,
  FaComments,
  FaUserTie,
  FaLightbulb,
  FaHandshake,
  FaRocket,
  FaChartLine,
  FaCrown
} from 'react-icons/fa'

const chapters = [
  {
    number: 1,
    title: "Intro a las soft skills en el entorno laboral de IT",
    icon: FaBrain,
    description: "Por qué las habilidades blandas son más importantes que el código en 2024"
  },
  {
    number: 2,
    title: "Comunicación asertiva",
    icon: FaComments,
    description: "Cómo expresar tus ideas sin generar conflicto ni parecer sumiso"
  },
  {
    number: 3,
    title: "Storytelling para pruebas técnicas",
    icon: FaUserTie,
    description: "Transforma tus proyectos en historias que cautiven a los recruiters"
  },
  {
    number: 4,
    title: "Negociación salarial inteligente",
    icon: FaHandshake,
    description: "Las 7 técnicas que usan los seniors para ganar +20% en su salario"
  },
  {
    number: 5,
    title: "Gestión del tiempo y productividad",
    icon: FaRocket,
    description: "Métodos probados para entregar más valor sin quemarte"
  },
  {
    number: 6,
    title: "Trabajo en equipo distribuido",
    icon: FaLightbulb,
    description: "Cómo colaborar efectivamente en equipos remotos multiculturales"
  },
  {
    number: 7,
    title: "Liderazgo técnico emergente",
    icon: FaChartLine,
    description: "De developer a líder: la transición que todos debemos hacer"
  },
  {
    number: 8,
    title: "El arte de la influencia",
    icon: FaCrown,
    description: "BONUS: Cómo convencer sin autoridad formal"
  }
]

export default function EbookIndex() {
  return (
    <section id="ebook-index" className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Contenido de la{' '}
            <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
              Guía Completa
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            8 capítulos prácticos con ejercicios reales, ejemplos del mundo IT y estrategias
            que han funcionado para más de 1,200 desarrolladores.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {chapters.map((chapter, index) => {
            const IconComponent = chapter.icon
            return (
              <motion.div
                key={chapter.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-orange-200"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                      <IconComponent className="text-white text-xl" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-semibold text-orange-600 bg-orange-100 px-2 py-1 rounded">
                        Capítulo {chapter.number}
                      </span>
                      {chapter.number === 8 && (
                        <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded">
                          BONUS
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {chapter.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {chapter.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              ¿Listo para dominar las soft skills que realmente importan?
            </h3>
            <p className="text-orange-100 mb-6 text-lg">
              Únete a los 1,200+ desarrolladores que ya transformaron su carrera
            </p>
            <button
              onClick={() => window.location.href = '/ebook/checkout'}
              className="bg-white text-orange-600 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors duration-300"
            >
              Obtener Mi Guía - USD 7
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}