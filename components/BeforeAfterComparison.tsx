'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaCheckCircle, FaTimesCircle, FaStar, FaArrowRight } from 'react-icons/fa'

export default function BeforeAfterComparison() {
  const [activeView, setActiveView] = useState<'before' | 'after'>('before')

  const beforeCV = {
    title: "CV Genérico y sin optimizar",
    problems: [
      "Skills técnicas listadas sin contexto",
      "Falta de keywords para ATS",
      "Proyectos sin métricas de impacto",
      "Formato poco profesional",
      "Sin sección de logros destacados"
    ],
    content: {
      header: "Juan Pérez",
      contact: "juan@email.com | Tel: 555-1234",
      summary: "Desarrollador con experiencia en programación.",
      skills: [
        "JavaScript",
        "Python",
        "HTML",
        "CSS",
        "Git"
      ],
      experience: [
        {
          title: "Desarrollador",
          company: "Tech Corp",
          period: "2021 - 2024",
          description: "Trabajé en varios proyectos de desarrollo web. Usé JavaScript y React para crear aplicaciones."
        }
      ]
    }
  }

  const afterCV = {
    title: "CV Optimizado con IA",
    improvements: [
      "Skills técnicas con nivel de expertise",
      "Keywords optimizadas para ATS (95% score)",
      "Proyectos con KPIs y resultados medibles",
      "Formato ATS-friendly profesional",
      "Sección de logros cuantificados"
    ],
    content: {
      header: "Juan Pérez - Full Stack Developer",
      contact: "juan@email.com | LinkedIn: linkedin.com/in/juanperez | GitHub: github.com/juanperez",
      summary: "Full Stack Developer con 3+ años optimizando aplicaciones web de alto tráfico. Especializado en React, Node.js y arquitecturas cloud. Reducción del 40% en tiempos de carga y mejora del 30% en conversión mediante implementación de best practices y performance optimization.",
      skills: [
        "JavaScript (ES6+) - Expert",
        "React.js & Next.js - Advanced",
        "Node.js & Express - Advanced",
        "Python & Django - Intermediate",
        "Git/GitHub - Advanced",
        "Docker & Kubernetes - Intermediate",
        "AWS (EC2, S3, Lambda) - Intermediate",
        "MongoDB & PostgreSQL - Advanced"
      ],
      experience: [
        {
          title: "Full Stack Developer",
          company: "Tech Corp",
          period: "2021 - 2024",
          description: "• Desarrollé 15+ aplicaciones web usando React y Node.js, alcanzando 50K+ usuarios activos mensuales\n• Optimicé rendimiento del backend reduciendo tiempo de respuesta en 40% (de 800ms a 480ms)\n• Implementé CI/CD pipeline con GitHub Actions, reduciendo deployment time en 60%\n• Lideré migración de arquitectura monolítica a microservicios, mejorando escalabilidad 3x"
        }
      ],
      achievements: [
        "🏆 Incrementé conversión de landing pages en 30% mediante A/B testing y optimización SEO",
        "🚀 Reduje costos de infraestructura cloud en USD 2,400/año optimizando recursos AWS"
      ]
    }
  }

  return (
    <section id="comparison" className="py-20 bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Esto es lo que lograrás con <span className="text-blue-400">nuestro análisis</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Mira cómo transformamos un CV promedio en uno que <span className="font-semibold text-white">multiplica las probabilidades de conseguir entrevistas</span>
          </p>
        </motion.div>

        {/* Toggle Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-full p-1">
            <button
              onClick={() => setActiveView('before')}
              className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeView === 'before'
                  ? 'bg-red-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <FaTimesCircle />
              ANTES - CV sin optimizar
            </button>
            <button
              onClick={() => setActiveView('after')}
              className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeView === 'after'
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <FaCheckCircle />
              DESPUÉS - Con IA
            </button>
          </div>
        </motion.div>

        {/* Comparison Container */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Problems/Improvements List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="order-2 md:order-1"
          >
            <AnimatePresence mode="wait">
              {activeView === 'before' ? (
                <motion.div
                  key="before-list"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-red-500/10 border-2 border-red-500/30 rounded-2xl p-8"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <FaTimesCircle className="text-3xl text-red-500" />
                    <h3 className="text-2xl font-bold text-white">Problemas identificados</h3>
                  </div>
                  <ul className="space-y-4">
                    {beforeCV.problems.map((problem, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-3 text-gray-300"
                      >
                        <FaTimesCircle className="text-red-500 mt-1 flex-shrink-0" />
                        <span>{problem}</span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              ) : (
                <motion.div
                  key="after-list"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-green-500/10 border-2 border-green-500/30 rounded-2xl p-8"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <FaCheckCircle className="text-3xl text-green-500" />
                    <h3 className="text-2xl font-bold text-white">Mejoras aplicadas</h3>
                  </div>
                  <ul className="space-y-4">
                    {afterCV.improvements.map((improvement, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-3 text-gray-300"
                      >
                        <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                        <span>{improvement}</span>
                      </motion.li>
                    ))}
                  </ul>
                  <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-400 font-semibold mb-2">
                      <FaStar /> Resultado
                    </div>
                    <p className="text-white font-bold text-lg">
                      +180% más probabilidad de pasar filtros ATS
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* CV Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="order-1 md:order-2"
          >
            <AnimatePresence mode="wait">
              {activeView === 'before' ? (
                <motion.div
                  key="before-cv"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-slate-800 border-2 border-red-500/30 rounded-2xl p-8 shadow-2xl"
                >
                  <div className="mb-4">
                    <h4 className="text-2xl font-bold text-white">{beforeCV.content.header}</h4>
                    <p className="text-sm text-gray-400">{beforeCV.content.contact}</p>
                  </div>
                  
                  <div className="mb-4">
                    <h5 className="text-lg font-semibold text-white mb-2">Resumen</h5>
                    <p className="text-gray-400 text-sm">{beforeCV.content.summary}</p>
                  </div>

                  <div className="mb-4">
                    <h5 className="text-lg font-semibold text-white mb-2">Skills</h5>
                    <div className="flex flex-wrap gap-2">
                      {beforeCV.content.skills.map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-slate-700 text-gray-300 text-sm rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="text-lg font-semibold text-white mb-2">Experiencia</h5>
                    {beforeCV.content.experience.map((exp, index) => (
                      <div key={index} className="mb-3">
                        <h6 className="text-white font-semibold">{exp.title}</h6>
                        <p className="text-sm text-gray-400">{exp.company} | {exp.period}</p>
                        <p className="text-sm text-gray-400 mt-1">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="after-cv"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-slate-800 border-2 border-green-500/30 rounded-2xl p-8 shadow-2xl"
                >
                  <div className="mb-4">
                    <h4 className="text-2xl font-bold text-white">{afterCV.content.header}</h4>
                    <p className="text-sm text-gray-400">{afterCV.content.contact}</p>
                  </div>
                  
                  <div className="mb-4">
                    <h5 className="text-lg font-semibold text-green-400 mb-2">Resumen Profesional</h5>
                    <p className="text-gray-300 text-sm leading-relaxed">{afterCV.content.summary}</p>
                  </div>

                  <div className="mb-4">
                    <h5 className="text-lg font-semibold text-green-400 mb-2">Skills Técnicas</h5>
                    <div className="grid grid-cols-2 gap-2">
                      {afterCV.content.skills.map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-green-500/10 text-green-300 text-sm rounded border border-green-500/30">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <h5 className="text-lg font-semibold text-green-400 mb-2">Experiencia</h5>
                    {afterCV.content.experience.map((exp, index) => (
                      <div key={index} className="mb-3">
                        <h6 className="text-white font-semibold">{exp.title}</h6>
                        <p className="text-sm text-gray-400">{exp.company} | {exp.period}</p>
                        <p className="text-sm text-gray-300 mt-1 whitespace-pre-line leading-relaxed">{exp.description}</p>
                      </div>
                    ))}
                  </div>

                  <div>
                    <h5 className="text-lg font-semibold text-green-400 mb-2">Logros Destacados</h5>
                    <ul className="space-y-1">
                      {afterCV.content.achievements.map((achievement, index) => (
                        <li key={index} className="text-sm text-gray-300">
                          {achievement}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <button
            onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
            className="group px-10 py-5 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold text-xl rounded-full transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl inline-flex items-center gap-3"
          >
            Quiero mi CV optimizado ahora
            <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="mt-4 text-gray-400">
            ⚡ Análisis instantáneo | 💰 Solo USD 7 | ✅ Garantía de satisfacción
          </p>
        </motion.div>
      </div>
    </section>
  )
}
