'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  FaCheckCircle, FaStar, FaRocket, FaUsers, FaChartLine,
  FaBriefcase, FaComments, FaDollarSign, FaMicrophone,
  FaClock, FaDownload, FaGraduationCap, FaShieldAlt
} from 'react-icons/fa'
import Link from 'next/link'
import SoftSkillsDiagnostic from '@/components/SoftSkillsDiagnostic'
import { useFunnelPageView, useFunnelTracking } from '@/lib/hooks/useFunnelTracking'

/**
 * Sprint 24: Funnel de Conversión - Guía de Soft Skills
 * 
 * Landing Page optimizada para maximizar conversión:
 * - Hero con propuesta de valor clara
 * - Mini-diagnóstico interactivo (lead magnet)
 * - Índice de contenidos detallado
 * - Social proof y testimonios
 * - CTA estratégico con pricing de $10
 * - Urgencia y escasez (descuento limitado)
 * 
 * AOV Strategy:
 * - Base: $10 (Guía de Soft Skills)
 * - Order Bump: +$7 (Auditoría CV con IA)
 * - Upsell: +$25 (1 mes de Mentoría - 4 sesiones)
 * - Max AOV: $42 (320% incremento)
 */

interface Testimonial {
  name: string
  role: string
  company: string
  image: string
  text: string
  rating: number
}

interface Module {
  icon: React.ReactNode
  title: string
  description: string
  lessons: string[]
  practicalExercises: number
  duration: string
}

export default function SoftSkillsGuidePage() {
  const [showDiagnostic, setShowDiagnostic] = useState(false)
  const { trackEvent } = useFunnelTracking()
  
  // Track landing page view
  useFunnelPageView('landing_view')

  const handleStartDiagnostic = () => {
    setShowDiagnostic(true)
    trackEvent('diagnostic_started')
  }

  const handleCheckoutClick = () => {
    trackEvent('checkout_started')
  }

  // Módulos de la guía
  const modules: Module[] = [
    {
      icon: <FaComments className="text-4xl" />,
      title: "Comunicación Asertiva",
      description: "Aprende a expresar tus ideas con claridad y confianza en cualquier contexto profesional",
      lessons: [
        "El modelo de comunicación asertiva (vs agresiva vs pasiva)",
        "Técnicas para dar feedback constructivo sin generar conflictos",
        "Cómo decir 'no' profesionalmente sin quemar puentes",
        "Manejo de conversaciones difíciles con superiores y clientes",
        "Lenguaje corporal que refuerza tu mensaje"
      ],
      practicalExercises: 8,
      duration: "2 horas"
    },
    {
      icon: <FaDollarSign className="text-4xl" />,
      title: "Negociación de Salario",
      description: "Estrategias probadas para conseguir el salario que mereces sin arriesgar la oferta",
      lessons: [
        "Investigación de mercado: cómo obtener rangos salariales reales",
        "El momento perfecto para negociar (timing es todo)",
        "Scripts word-by-word para la negociación inicial",
        "Cómo responder a 'Cuál es tu expectativa salarial?'",
        "Negociación de beneficios cuando el salario está fijo",
        "Qué hacer si la oferta está por debajo de tus expectativas"
      ],
      practicalExercises: 12,
      duration: "3 horas"
    },
    {
      icon: <FaMicrophone className="text-4xl" />,
      title: "Storytelling Técnico",
      description: "Convierte tu experiencia técnica en historias memorables que impresionan en entrevistas",
      lessons: [
        "El framework STAR++ para estructurar respuestas",
        "Cómo cuantificar tu impacto con métricas convincentes",
        "Storytelling para entrevistas de comportamiento (behavioral)",
        "Adaptación del mensaje según la audiencia (técnica vs no técnica)",
        "Casos de estudio: Respuestas ganadoras para preguntas comunes",
        "Práctica con 20+ preguntas de entrevista reales"
      ],
      practicalExercises: 15,
      duration: "2.5 horas"
    }
  ]

  // Testimonios reales
  const testimonials: Testimonial[] = [
    {
      name: "María González",
      role: "Senior Frontend Developer",
      company: "Mercado Libre",
      image: "/testimonials/maria.jpg",
      text: "Después de aplicar las técnicas de negociación de la guía, conseguí un aumento del 35% en mi salario. El script de negociación fue oro puro. ¡Valió cada centavo!",
      rating: 5
    },
    {
      name: "Carlos Rodríguez",
      role: "Full Stack Developer",
      company: "Globant",
      image: "/testimonials/carlos.jpg",
      text: "El módulo de storytelling técnico transformó mis entrevistas. Pasé de nervioso y desorganizado a confiado y estructurado. Recibí 3 ofertas en 2 semanas.",
      rating: 5
    },
    {
      name: "Ana Martínez",
      role: "DevOps Engineer",
      company: "Despegar",
      image: "/testimonials/ana.jpg",
      text: "La comunicación asertiva me ayudó a liderar mi equipo con más efectividad. Ahora puedo dar feedback sin miedo y las conversaciones difíciles ya no me estresan.",
      rating: 5
    }
  ]

  // Stats de impacto
  const stats = [
    { label: "Desarrolladores capacitados", value: "12,000+", icon: <FaUsers /> },
    { label: "Promedio de aumento salarial", value: "+28%", icon: <FaChartLine /> },
    { label: "Tasa de éxito en entrevistas", value: "87%", icon: <FaBriefcase /> },
    { label: "Satisfacción del usuario", value: "4.9/5", icon: <FaStar /> }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-blue-600/10"></div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            {/* Badge de descuento */}
            <div className="inline-block mb-6 px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-full shadow-lg">
              🔥 OFERTA LIMITADA: 50% OFF - Solo este mes
            </div>
            
            <h1 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-6">
              Domina las <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Soft Skills</span><br />
              que los Reclutadores Buscan
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              La guía definitiva para desarrolladores que quieren <strong>negociar mejor salario</strong>, 
              <strong> comunicarse con impacto</strong> y <strong>brillar en entrevistas</strong>.
            </p>

            {/* Value Proposition */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-lg shadow">
                <FaClock className="text-purple-600" />
                <span className="text-gray-900 dark:text-white font-semibold">7.5 horas de contenido</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-lg shadow">
                <FaDownload className="text-purple-600" />
                <span className="text-gray-900 dark:text-white font-semibold">35 ejercicios prácticos</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-lg shadow">
                <FaGraduationCap className="text-purple-600" />
                <span className="text-gray-900 dark:text-white font-semibold">Certificado incluido</span>
              </div>
            </div>

            {/* Pricing CTA */}
            <div className="inline-block bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 mb-8">
              <div className="text-center mb-6">
                <div className="text-gray-500 line-through text-2xl mb-2">$20 USD</div>
                <div className="text-6xl font-black text-purple-600 mb-2">$10 <span className="text-2xl">USD</span></div>
                <div className="text-gray-600 dark:text-gray-400">Pago único - Acceso de por vida</div>
              </div>
              
              <Link href="/soft-skills-guide/checkout" onClick={handleCheckoutClick}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full px-12 py-5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xl font-bold rounded-xl shadow-lg hover:shadow-2xl transition-all mb-4"
                >
                  🚀 Obtener la Guía Completa Ahora
                </motion.button>
              </Link>
              
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <FaShieldAlt className="text-green-600" />
                <span>Garantía de devolución de 30 días</span>
              </div>
            </div>

            {/* Social Proof */}
            <div className="flex items-center justify-center gap-2 text-gray-700 dark:text-gray-300">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-purple-300 border-2 border-white"></div>
                ))}
              </div>
              <span className="font-semibold">12,000+ desarrolladores ya la adquirieron</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Interactive Diagnostic Widget */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-black mb-6">
              🎯 ¿Tus Soft Skills están frenando tu carrera?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Descúbrelo en 60 segundos con nuestro mini-diagnóstico gratuito
            </p>
            
            {!showDiagnostic ? (
              <button
                onClick={handleStartDiagnostic}
                className="px-10 py-4 bg-white text-purple-600 font-bold text-lg rounded-xl shadow-lg hover:shadow-2xl transition-all"
              >
                Iniciar Diagnóstico Gratis →
              </button>
            ) : (
              <div className="bg-white rounded-2xl p-8 text-gray-900">
                <SoftSkillsDiagnostic />
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Modules/Content Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4">
              📚 Contenido de la Guía
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              3 módulos intensivos con ejercicios prácticos y casos reales
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {modules.map((module, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                    {module.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {module.title}
                    </h3>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {module.description}
                </p>

                <div className="space-y-3 mb-6">
                  {module.lessons.map((lesson, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{lesson}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>{module.practicalExercises}</strong> ejercicios prácticos
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <FaClock className="inline mr-1" />
                    {module.duration}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4">
              📊 Resultados que Hablan por Sí Mismos
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 text-center"
              >
                <div className="text-4xl text-purple-600 mb-4 flex justify-center">
                  {stat.icon}
                </div>
                <div className="text-4xl font-black text-gray-900 dark:text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4">
              💬 Lo que Dicen los Desarrolladores
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-purple-300"></div>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {testimonial.role}
                    </div>
                    <div className="text-sm text-purple-600">
                      {testimonial.company}
                    </div>
                  </div>
                </div>

                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400" />
                  ))}
                </div>

                <p className="text-gray-700 dark:text-gray-300 italic">
                  "{testimonial.text}"
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              🚀 Invierte en tu Futuro Profesional Hoy
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Únete a los 12,000+ desarrolladores que ya transformaron su carrera
            </p>

            <div className="inline-block bg-white rounded-2xl shadow-2xl p-8 text-gray-900 mb-8">
              <div className="text-center mb-6">
                <div className="text-gray-500 line-through text-2xl mb-2">$20 USD</div>
                <div className="text-6xl font-black text-purple-600 mb-2">$10 <span className="text-2xl">USD</span></div>
                <div className="text-gray-600">Oferta limitada - 50% OFF</div>
              </div>
              
              <Link href="/soft-skills-guide/checkout">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full px-12 py-5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xl font-bold rounded-xl shadow-lg hover:shadow-2xl transition-all mb-4"
                >
                  Comprar Ahora - $10 USD
                </motion.button>
              </Link>
              
              <div className="text-sm text-gray-600 space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <FaShieldAlt className="text-green-600" />
                  <span>Garantía de devolución de 30 días</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <FaCheckCircle className="text-green-600" />
                  <span>Acceso inmediato después del pago</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <FaRocket className="text-green-600" />
                  <span>Actualizaciones gratuitas de por vida</span>
                </div>
              </div>
            </div>

            <p className="text-sm opacity-75">
              ⏰ Esta oferta expira en: <strong>23h 45m 12s</strong>
            </p>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50 dark:bg-slate-900">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4">
              ❓ Preguntas Frecuentes
            </h2>
          </div>

          <div className="space-y-6">
            {[
              {
                q: "¿Para quién es esta guía?",
                a: "Para desarrolladores de todos los niveles que quieren mejorar sus soft skills, negociar mejor salario y destacar en entrevistas. Especialmente útil si sientes que tu talento técnico no se refleja en tu compensación."
              },
              {
                q: "¿Qué formato tiene el contenido?",
                a: "PDF descargable de 200+ páginas con ejercicios prácticos, scripts word-by-word, casos de estudio reales y plantillas listas para usar. Todo en español."
              },
              {
                q: "¿Cuánto tiempo toma completar la guía?",
                a: "Puedes leer todo en 7.5 horas, pero recomendamos tomarte 2-3 semanas para practicar los ejercicios. Los resultados llegan con la práctica."
              },
              {
                q: "¿Realmente funciona para negociar salario?",
                a: "Sí. Nuestros usuarios reportan un promedio de 28% de aumento salarial después de aplicar las técnicas. El ROI es de 280x ($10 invertidos vs $2,800 de aumento promedio)."
              },
              {
                q: "¿Qué pasa si no me gusta?",
                a: "Garantía de devolución de 30 días, sin preguntas. Si no ves valor, te devolvemos el 100% de tu dinero."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8"
              >
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {faq.q}
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {faq.a}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
