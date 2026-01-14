'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FaEnvelope, FaBriefcase, FaGlobeAmericas, FaCalendarAlt, FaCheckCircle, FaSpinner } from 'react-icons/fa'

/**
 * Lead Capture Form - Post Audio Simulation
 * 
 * Sprint 39: Recolección de datos tras análisis de audio
 * 
 * Captura:
 * - Email (validación en tiempo real)
 * - Rol actual (Dev, Data, Ops, etc.)
 * - País (para métricas de mercado)
 * - Años de experiencia (segmentación Junior/Mid/Senior)
 */

interface LeadCaptureFormProps {
  sessionId: string
  analysisResults: {
    toneScore: number
    fillerWordsCount: number
    starCompliance: number
    transcriptions: string[]
  }
  onSuccess: () => void
}

const ROLES = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'DevOps Engineer',
  'Data Scientist',
  'Data Engineer',
  'Machine Learning Engineer',
  'Mobile Developer',
  'QA Engineer',
  'Engineering Manager',
  'Tech Lead',
  'Product Manager',
  'Otro'
]

const COUNTRIES = [
  'Argentina',
  'Bolivia',
  'Chile',
  'Colombia',
  'Costa Rica',
  'Ecuador',
  'El Salvador',
  'España',
  'Guatemala',
  'Honduras',
  'México',
  'Nicaragua',
  'Panamá',
  'Paraguay',
  'Perú',
  'Puerto Rico',
  'República Dominicana',
  'Uruguay',
  'Venezuela',
  'Estados Unidos',
  'Otro'
]

export default function LeadCaptureForm({ sessionId, analysisResults, onSuccess }: LeadCaptureFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    role: '',
    country: '',
    experienceYears: ''
  })
  
  const [errors, setErrors] = useState({
    email: '',
    role: '',
    country: '',
    experienceYears: ''
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailValid, setEmailValid] = useState(false)

  // Validación en tiempo real del email
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value
    setFormData({ ...formData, email })
    
    if (email.length > 0) {
      if (validateEmail(email)) {
        setEmailValid(true)
        setErrors({ ...errors, email: '' })
      } else {
        setEmailValid(false)
        setErrors({ ...errors, email: 'Email inválido' })
      }
    } else {
      setEmailValid(false)
      setErrors({ ...errors, email: '' })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validaciones
    const newErrors = {
      email: '',
      role: '',
      country: '',
      experienceYears: ''
    }
    
    if (!validateEmail(formData.email)) {
      newErrors.email = 'Email inválido'
    }
    
    if (!formData.role) {
      newErrors.role = 'Selecciona tu rol'
    }
    
    if (!formData.country) {
      newErrors.country = 'Selecciona tu país'
    }
    
    if (!formData.experienceYears || parseInt(formData.experienceYears) < 0 || parseInt(formData.experienceYears) > 50) {
      newErrors.experienceYears = 'Ingresa años de experiencia válidos (0-50)'
    }
    
    if (Object.values(newErrors).some(err => err)) {
      setErrors(newErrors)
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Guardar lead y generar reporte
      const response = await fetch('/api/audio-feedback/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          email: formData.email,
          role: formData.role,
          country: formData.country,
          experienceYears: parseInt(formData.experienceYears),
          analysisResults
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to generate report')
      }
      
      const result = await response.json()
      
      // Redirigir a página de éxito con query params
      const successUrl = `/audio-feedback/success?email=${encodeURIComponent(formData.email)}&level=${result.experienceLevel || 'Mid'}&toneScore=${Math.round(analysisResults.toneScore)}&fillerCount=${Math.round(analysisResults.fillerWordsCount)}`
      window.location.href = successUrl
      
    } catch (error) {
      console.error('Lead capture error:', error)
      alert('Hubo un error al generar tu reporte. Por favor, intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Determinar nivel basado en años de experiencia
  const getExperienceLevel = () => {
    const years = parseInt(formData.experienceYears)
    if (years < 2) return 'Junior'
    if (years < 5) return 'Mid-Level'
    if (years < 10) return 'Senior'
    return 'Staff/Principal'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-slate-900 dark:to-slate-800 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Preview borroso del reporte */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-2xl mb-8 relative overflow-hidden"
        >
          {/* Overlay blur */}
          <div className="absolute inset-0 backdrop-blur-md bg-white/30 dark:bg-slate-800/30 z-10 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🔒</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Tu Reporte de Audio está listo
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Completa el formulario para recibirlo en tu email
              </p>
            </div>
          </div>
          
          {/* Preview del contenido (borroso) */}
          <div className="blur-sm select-none pointer-events-none">
            <h2 className="text-3xl font-bold mb-6">📊 Análisis de Tu Audio</h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <h3 className="font-bold mb-2">🎯 Análisis de Tono</h3>
                <p>Tu tono fue {analysisResults.toneScore}% seguro, pero detectamos titubeos en la sección de "Resultados"...</p>
              </div>
              
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <h3 className="font-bold mb-2">⚠️ Detección de Muletillas</h3>
                <p>Repetiste "ehhh" o "básicamente" {analysisResults.fillerWordsCount} veces. Esto reduce tu autoridad técnica...</p>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h3 className="font-bold mb-2">💡 Consejo de Oro</h3>
                <p>En la pregunta sobre conflictos, intenta usar frases de "Escucha Activa" en lugar de "Yo hice"...</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Formulario de captura */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-2xl"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center">
            Recibe tu Reporte de Feedback Gratis
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 text-center">
            Completa estos datos para desbloquear tu análisis completo por email
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <FaEnvelope className="text-purple-600" />
                Email *
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.email}
                  onChange={handleEmailChange}
                  placeholder="tu@email.com"
                  required
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white ${
                    errors.email 
                      ? 'border-red-500' 
                      : emailValid 
                      ? 'border-green-500' 
                      : 'border-gray-300 dark:border-slate-600 focus:border-purple-500'
                  }`}
                />
                {emailValid && (
                  <FaCheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 text-xl" />
                )}
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Rol */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <FaBriefcase className="text-purple-600" />
                Rol Actual *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                required
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white ${
                  errors.role 
                    ? 'border-red-500' 
                    : 'border-gray-300 dark:border-slate-600 focus:border-purple-500'
                }`}
              >
                <option value="">Selecciona tu rol...</option>
                {ROLES.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              {errors.role && (
                <p className="text-red-500 text-sm mt-1">{errors.role}</p>
              )}
            </div>

            {/* País */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <FaGlobeAmericas className="text-purple-600" />
                País *
              </label>
              <select
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                required
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white ${
                  errors.country 
                    ? 'border-red-500' 
                    : 'border-gray-300 dark:border-slate-600 focus:border-purple-500'
                }`}
              >
                <option value="">Selecciona tu país...</option>
                {COUNTRIES.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
              {errors.country && (
                <p className="text-red-500 text-sm mt-1">{errors.country}</p>
              )}
            </div>

            {/* Años de experiencia */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <FaCalendarAlt className="text-purple-600" />
                Años de Experiencia *
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={formData.experienceYears}
                onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                placeholder="Ej: 3"
                required
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white ${
                  errors.experienceYears 
                    ? 'border-red-500' 
                    : 'border-gray-300 dark:border-slate-600 focus:border-purple-500'
                }`}
              />
              {errors.experienceYears && (
                <p className="text-red-500 text-sm mt-1">{errors.experienceYears}</p>
              )}
              {formData.experienceYears && !errors.experienceYears && (
                <p className="text-purple-600 dark:text-purple-400 text-sm mt-1">
                  Nivel detectado: <span className="font-bold">{getExperienceLevel()}</span>
                </p>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting || !emailValid || !formData.role || !formData.country || !formData.experienceYears}
              className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-xl text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Generando tu reporte...
                </>
              ) : (
                <>
                  <FaEnvelope />
                  Enviar Reporte a mi Email
                </>
              )}
            </button>
          </form>

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
            🔒 No spam. Solo tu reporte de feedback y consejos valiosos para tu carrera.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
